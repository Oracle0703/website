import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";
import { PUBLIC_WEBSITE_LOCALE_ROUTES } from "../apps/website/lib/public-routes";

const detailRoutes = [
  { path: "/blog/ci-agent-guardrails", name: "zh-blog-detail" },
  { path: "/projects/ai-page-analysis", name: "zh-project-detail" },
  { path: "/en/blog/ci-agent-guardrails", name: "en-blog-detail" },
  { path: "/en/projects/ai-page-analysis", name: "en-project-detail" }
];

const primaryRoutes = [
  {
    path: "/",
    name: "home",
    heading: /把复杂想法，做成清晰、可用的产品/,
    content: /AI 页面分析|Next\.js/,
    evidence: (page: Page) =>
      page.locator("main a[href^='/projects/'], main a[href^='/ai-page-analysis']").first()
  },
  {
    path: "/projects",
    name: "projects",
    heading: /^作品$/,
    content: /AI 页面分析|Tracker|Dashboard/,
    evidence: (page: Page) => page.locator("main article a[href^='/projects/']").first()
  },
  {
    path: "/blog",
    name: "blog",
    heading: /^博客$/,
    content: /CI Agent|Next\.js|打卡/,
    evidence: (page: Page) => page.locator("main article a[href^='/blog/']").first()
  },
  {
    path: "/about",
    name: "about",
    heading: /^关于我$/,
    content: /工作原则|Next\.js|全栈开发/,
    evidence: (page: Page) => page.getByRole("heading", { name: "工作原则" })
  },
  {
    path: "/contact",
    name: "contact",
    heading: /^联系我$/,
    content: /提交合作需求|GitHub 主页/,
    evidence: (page: Page) => page.locator("main form")
  }
];

function getRouteName(path: string) {
  return path === "/" ? "home" : path.slice(1).replaceAll("/", "-");
}

const routes = [
  ...PUBLIC_WEBSITE_LOCALE_ROUTES.map((route) => ({
    path: route.path,
    name: `${route.locale}-${getRouteName(route.path)}`,
    expectedLang: route.locale === "en" ? "en" : "zh-CN"
  })),
  ...detailRoutes.map((route) => ({
    ...route,
    expectedLang: route.path.startsWith("/en/") ? "en" : "zh-CN"
  }))
];

const ignoredConsoleFragments = ["Download the React DevTools"];
const hydrationErrorPattern =
  /hydration|hydrating|server rendered html|did not match|content does not match/i;
const browserErrorsByPage = new WeakMap<Page, string[]>();

const englishContentChecks = [
  {
    path: "/en",
    heading: /Full-Stack Developer/,
    text: /AI tools/
  },
  {
    path: "/en/projects",
    heading: /Projects/,
    text: /Project cases/
  },
  {
    path: "/en/projects/ai-page-analysis",
    heading: /AI Page Analysis and Redesign Assistant/,
    text: /Evidence|Asset status|Product mock|Roadmap/
  },
  {
    path: "/en/ai-page-analysis",
    heading: /AI Page Analysis and Redesign Assistant/,
    text: /V1 roadmap|Mock Pipeline limitation/
  },
  {
    path: "/en/contact",
    heading: /Contact/,
    text: /Send a project inquiry|Project goal|Privacy/
  },
  {
    path: "/en/blog/ci-agent-guardrails",
    heading: /Guardrails/,
    text: /CI Agent/
  }
];

async function installPreferenceState(page: Page) {
  await page.addInitScript(() => {
    if (localStorage.getItem("locale") === null) {
      localStorage.setItem("locale", "en");
    }
    if (localStorage.getItem("theme") === null) {
      localStorage.setItem("theme", "dark");
    }
  });
}

async function expectNoCjk(page: Page, selector = "main") {
  const text = await page.locator(selector).innerText();
  expect(text).not.toMatch(/[\u3400-\u9fff\uF900-\uFAFF]/);
}

async function expectNoBrowserErrors(page: Page) {
  await page.waitForLoadState("networkidle");
  expect(browserErrorsByPage.get(page) ?? [], "unexpected console, hydration, or page errors").toEqual(
    []
  );
}

async function firstVisible(locator: Locator) {
  const count = await locator.count();

  for (let index = 0; index < count; index += 1) {
    const candidate = locator.nth(index);
    if (await candidate.isVisible()) return candidate;
  }

  return null;
}

async function openMobileMenu(page: Page) {
  const openButton = await firstVisible(
    page.getByRole("button", { name: /打开菜单|Open menu/ })
  );

  if (openButton) await openButton.click();
}

async function closeMobileMenu(page: Page) {
  const closeButton = await firstVisible(
    page.getByRole("button", { name: /关闭菜单|Close menu/ })
  );

  if (closeButton) await closeButton.click();
}

async function clickLanguageToggle(page: Page, name: RegExp) {
  let button = await firstVisible(page.getByRole("button", { name }));

  if (!button) {
    await openMobileMenu(page);
    button = await firstVisible(page.getByRole("button", { name }));
  }

  expect(button, `language toggle ${name} should be visible`).not.toBeNull();
  await button?.click();
}

async function clickThemeToggle(page: Page, name: RegExp) {
  let button = await firstVisible(page.getByRole("button", { name }));

  if (!button) {
    await openMobileMenu(page);
    button = await firstVisible(page.getByRole("button", { name }));
  }

  expect(button, `theme toggle ${name} should be visible`).not.toBeNull();
  await button?.click();
}

async function expectPrimaryNavigation(page: Page, isMobile: boolean) {
  if (isMobile) await openMobileMenu(page);

  const nav = page.locator("header nav:visible").first();
  await expect(nav).toBeVisible();

  for (const item of [
    { label: "作品", href: "/projects" },
    { label: "文章", href: "/blog" },
    { label: "关于", href: "/about" },
    { label: "联系", href: "/contact" }
  ]) {
    await expect(nav.getByRole("link", { name: item.label, exact: true })).toHaveAttribute(
      "href",
      item.href
    );
  }
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return {
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      overflow: root.scrollWidth - root.clientWidth
    };
  });

  expect(
    overflow.overflow,
    `document width ${overflow.scrollWidth}px exceeds viewport ${overflow.clientWidth}px`
  ).toBeLessThanOrEqual(1);
}

async function getThemePalette(page: Page) {
  return page.evaluate(() => {
    const bodyStyles = getComputedStyle(document.body);
    const rootStyles = getComputedStyle(document.documentElement);

    return {
      background: bodyStyles.backgroundColor,
      foreground: bodyStyles.color,
      accent: rootStyles.getPropertyValue("--ui-accent-rgb").trim()
    };
  });
}

async function attachViewportScreenshot(page: Page, testInfo: TestInfo, label: string) {
  await testInfo.attach(`${testInfo.project.name}-${label}`, {
    body: await page.screenshot({ animations: "disabled", fullPage: false }),
    contentType: "image/png"
  });
}

test.beforeEach(async ({ page }) => {
  const browserErrors: string[] = [];
  browserErrorsByPage.set(page, browserErrors);

  page.on("console", (message) => {
    const messageText = message.text();
    const isBrowserError = message.type() === "error";
    const isHydrationError = hydrationErrorPattern.test(messageText);

    if (!isBrowserError && !isHydrationError) return;
    if (ignoredConsoleFragments.some((fragment) => messageText.includes(fragment))) return;
    browserErrors.push(`[console.${message.type()}] ${messageText}`);
  });

  page.on("pageerror", (error) => {
    browserErrors.push(`[pageerror] ${error.message}`);
  });

  await installPreferenceState(page);
});

test.describe("primary route visual and behavior acceptance", () => {
  for (const route of primaryRoutes) {
    test(`${route.name} supports both themes without layout or runtime regressions`, async ({
      page
    }, testInfo) => {
      const isMobile = testInfo.project.name.includes("mobile");

      await page.goto(route.path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

      const main = page.locator("main");
      await expect(main).toBeVisible();
      await expect(page.getByRole("heading", { level: 1, name: route.heading }).first()).toBeVisible();
      await expect(main).toContainText(route.content);
      await expect(route.evidence(page)).toBeVisible();
      await expect(main).not.toContainText(/Lorem ipsum|hello@example\.com|mailto:hello|example\.com/);

      await expectPrimaryNavigation(page, isMobile);
      if (isMobile) await closeMobileMenu(page);
      await expectNoHorizontalOverflow(page);

      const darkPalette = await getThemePalette(page);
      if (route.name === "home") {
        await attachViewportScreenshot(page, testInfo, "home-dark");
      }

      await clickThemeToggle(page, /切换到亮色|切换到浅色模式|Switch to light mode/i);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      await expect
        .poll(() => page.evaluate(() => localStorage.getItem("theme")))
        .toBe("light");

      if (isMobile) await closeMobileMenu(page);
      const lightPalette = await getThemePalette(page);
      expect(lightPalette).not.toEqual(darkPalette);
      await expectNoHorizontalOverflow(page);

      if (route.name === "home") {
        await attachViewportScreenshot(page, testInfo, "home-light");
      }

      await expectNoBrowserErrors(page);
    });
  }
});

for (const route of routes) {
  test(`${route.name} restores route locale and dark preference without browser errors`, async ({
    page
  }) => {
    await page.goto(route.path);

    await expect.poll(async () => page.evaluate(() => document.documentElement.lang)).toBe(route.expectedLang);
    await expect
      .poll(async () => page.evaluate(() => document.documentElement.dataset.theme))
      .toBe("dark");
    await expect(page.locator("#main-content")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectNoBrowserErrors(page);
  });
}

test("language toggle moves between Chinese and English canonical URLs", async ({ page }) => {
  await page.goto("/blog");
  await clickLanguageToggle(page, /切换到英文|Switch to English/);
  await expect(page).toHaveURL(/\/en\/blog$/);

  await clickLanguageToggle(page, /切换到中文|Switch to Chinese/);
  await expect(page).toHaveURL(/\/blog$/);
});

test("keyboard skip link reveals and focuses the main content target", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "跳到主要内容" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("#main-content")).toBeFocused();
});

test.describe("English content quality", () => {
  for (const check of englishContentChecks) {
    test(`${check.path} exposes English primary content`, async ({ page }) => {
      await page.goto(check.path);

      await expect(page.getByRole("heading", { name: check.heading }).first()).toBeVisible();
      await expect(page.locator("main")).toContainText(check.text);
      await expectNoCjk(page);
      await expectNoBrowserErrors(page);
    });
  }
});

test("contact page exposes the live form and GitHub fallback without rollout jargon", async ({
  page
}) => {
  await page.goto("/contact");

  await expect(page.locator("main")).not.toContainText(/hello@example\.com|mailto:hello|example\.com/);
  await expect(page.locator("main")).toContainText(/提交合作需求/);
  await expect(page.getByRole("link", { name: /GitHub 主页/ })).toHaveAttribute(
    "href",
    "https://github.com/Oracle0703"
  );
  await expect(page.locator("main")).not.toContainText(/D6|D7|联系闭环决策|表单规格/);
});

test("contact form keeps input after validation failure", async ({ page }) => {
  await page.goto("/en/contact");

  await page.getByLabel("Name").fill("Ada");
  await page.getByLabel("Reply channel").fill("ada@lovelace.dev");
  await page.getByLabel("Project goal").fill("Need help");
  await page.getByRole("button", { name: /Send request/ }).click();

  await expect(page.locator("main")).toContainText(/Add more context|Project goal/i);
  await expect(page.getByLabel("Project goal")).toHaveValue("Need help");
  await expect(page.locator("main")).not.toContainText(/hello@example\.com|mailto:hello|example\.com/);
});

test("project detail evidence sections are visible", async ({ page }) => {
  await page.goto("/en/projects/ai-page-analysis");

  await expect(page.getByRole("heading", { name: /Evidence/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Asset status/ })).toBeVisible();
  await expect(page.locator("main")).toContainText(/Product mock|Asset unavailable|Screenshot/);
  await expect(page.getByRole("heading", { name: /Trade-offs/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Roadmap/ })).toBeVisible();
});

// Pixel matching via toHaveScreenshot is intentionally not the default gate. The two home
// theme states above are attached to the Playwright report for review without committing a
// large, brittle snapshot matrix for every route and viewport.
