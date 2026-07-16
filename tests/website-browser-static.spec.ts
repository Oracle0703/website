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
    navHref: null,
    heading: /把复杂想法，做成清晰、可用的产品/,
    content: /AI 页面分析|Next\.js/,
    evidence: (page: Page) =>
      page.locator("main a[href^='/projects/'], main a[href^='/ai-page-analysis']").first()
  },
  {
    path: "/projects",
    name: "projects",
    navHref: "/projects",
    heading: /^作品$/,
    content: /AI 页面分析|Tracker|Dashboard/,
    evidence: (page: Page) => page.locator("main article a[href^='/projects/']").first()
  },
  {
    path: "/blog",
    name: "blog",
    navHref: "/blog",
    heading: /^博客$/,
    content: /CI Agent|Next\.js|打卡/,
    evidence: (page: Page) => page.locator("main article a[href^='/blog/']").first()
  },
  {
    path: "/about",
    name: "about",
    navHref: "/about",
    heading: /^关于我$/,
    content: /工作原则|Next\.js|全栈开发/,
    evidence: (page: Page) => page.getByRole("heading", { name: "工作原则" })
  },
  {
    path: "/contact",
    name: "contact",
    navHref: "/contact",
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
    heading: /Turning complex ideas into clear, useful products\./,
    text: /AI applications/
  },
  {
    path: "/en/projects",
    heading: /Projects/,
    text: /Project cases/
  },
  {
    path: "/en/projects/ai-page-analysis",
    heading: /AI Page Analysis and Redesign Assistant/,
    text: /Evidence gallery|Demo and source|Architecture|Roadmap/
  },
  {
    path: "/en/ai-page-analysis",
    heading: /AI Page Analysis and Redesign Assistant/,
    text: /V1 roadmap|Mock Pipeline limitation/
  },
  {
    path: "/en/labs/query",
    heading: /Free Query Lab/,
    text: /City name|WeatherAPI\.com/
  },
  {
    path: "/en/explore",
    heading: /One map for the tools/,
    text: /Local habit tracker|Developer toolbox/
  },
  {
    path: "/en/changelog",
    heading: /A record of what actually shipped/,
    text: /Local-first site experience suite|Free weather query lab/
  },
  {
    path: "/en/labs/tools",
    heading: /developer toolbox/,
    text: /JSON|SHA-256|Color contrast/
  },
  {
    path: "/en/tracker",
    heading: /^Tracker$/,
    text: /Your habit data stays on this device|Add a habit/
  },
  {
    path: "/en/resume",
    heading: /Turning product judgment/,
    text: /Core capabilities|Public project evidence/
  },
  {
    path: "/en/now",
    heading: /What I am working on now/,
    text: /Current directions|Recently completed/
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

async function expectPrimaryNavigation(page: Page, isMobile: boolean, currentHref: string | null) {
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

  if (currentHref) {
    await expect(nav.locator(`a[href='${currentHref}']`)).toHaveAttribute("aria-current", "page");
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

      await expectPrimaryNavigation(page, isMobile, route.navHref);
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
  await expect(page.locator("#site-mobile-menu")).toHaveCount(0);

  await clickLanguageToggle(page, /切换到中文|Switch to Chinese/);
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.locator("#site-mobile-menu")).toHaveCount(0);
});

test("detail routes mark their parent navigation section as current", async ({ page }) => {
  const isMobile = test.info().project.name.includes("mobile");

  for (const route of [
    { path: "/projects/ai-page-analysis", href: "/projects", label: "作品" },
    { path: "/en/blog/ci-agent-guardrails", href: "/en/blog", label: "Writing" }
  ]) {
    await page.goto(route.path);
    if (isMobile) await openMobileMenu(page);

    const nav = page.locator("header nav:visible").first();
    const currentLink = nav.getByRole("link", { name: route.label, exact: true });
    await expect(currentLink).toHaveAttribute("href", route.href);
    await expect(currentLink).toHaveAttribute("aria-current", "page");

    if (isMobile) await closeMobileMenu(page);
  }
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

test("site command palette restores focus and opens a selected result", async ({ page }) => {
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "打开全站搜索" });
  await expect(trigger).toBeVisible();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: /搜索 Meaningful/ });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("combobox")).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");

  await page.keyboard.press("Control+K");
  await expect(dialog).toBeVisible();
  await page.getByRole("combobox").fill("开发者工具箱");
  await expect(page.getByRole("option", { name: /^开发者工具箱/ })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/labs\/tools$/);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await expectNoBrowserErrors(page);
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

test("free query lab selects a location and refreshes results when units change", async ({
  page
}) => {
  await page.route("**/api/query/locations?**", async (route) => {
    const requestUrl = new URL(route.request().url());
    expect([...requestUrl.searchParams.keys()].sort()).toEqual(["lang", "q"]);

    await route.fulfill({
      json: {
        ok: true,
        data: {
          locations: [
            {
              id: "shanghai-cn",
              name: "上海",
              region: "上海",
              country: "中国",
              lat: 31.2304,
              lon: 121.4737
            }
          ]
        },
        meta: { stale: false }
      }
    });
  });

  await page.route("**/api/query/weather?**", async (route) => {
    const requestUrl = new URL(route.request().url());
    expect([...requestUrl.searchParams.keys()].sort()).toEqual(["lang", "q", "units"]);
    expect(requestUrl.searchParams.get("q")).toBe("31.2304,121.4737");
    const imperial = requestUrl.searchParams.get("units") === "imperial";

    await route.fulfill({
      json: {
        ok: true,
        data: {
          location: {
            name: "上海",
            region: "上海",
            country: "中国",
            localTime: "2026-07-16 18:30"
          },
          current: {
            temperature: imperial ? 77 : 25,
            feelsLike: imperial ? 78.8 : 26,
            humidity: 61,
            windSpeed: imperial ? 6.2 : 10,
            condition: "晴"
          },
          forecast: [
            {
              date: "2026-07-16",
              condition: "晴",
              maxTemperature: imperial ? 82.4 : 28,
              minTemperature: imperial ? 71.6 : 22,
              rainChance: 10
            },
            {
              date: "2026-07-17",
              condition: "多云",
              maxTemperature: imperial ? 80.6 : 27,
              minTemperature: imperial ? 69.8 : 21,
              rainChance: 30
            },
            {
              date: "2026-07-18",
              condition: "小雨",
              maxTemperature: imperial ? 78.8 : 26,
              minTemperature: imperial ? 68 : 20,
              rainChance: 60
            }
          ],
          airQuality: {
            usEpaIndex: 2,
            pm25: 12.5,
            pm10: 24.8
          },
          updatedAt: "2026-07-16 18:15"
        },
        meta: { stale: false }
      }
    });
  });

  await page.goto("/labs/query");
  await page.getByLabel("城市名称").fill("上海");
  await page.getByRole("button", { name: "搜索城市" }).click();
  await expect(page.getByRole("heading", { name: "选择地点" })).toBeVisible();
  await page.getByRole("button", { name: /查看这个地点/ }).click();

  await expect(page.getByRole("heading", { name: /上海 · 中国/ })).toBeVisible();
  await expect(page.locator("main")).toContainText("美国 EPA 类别（1–6）");
  await expect(page.locator("main")).toContainText("2 · 中等");
  await expect(page.locator("main")).toContainText("重要数据提示");

  await page.getByRole("button", { name: "英制 °F" }).click();
  await expect(page.locator("main")).toContainText(/77\.0\s*°F/);
  await expectNoBrowserErrors(page);
});

test("project detail evidence sections are visible", async ({ page }) => {
  await page.goto("/en/projects/ai-page-analysis");

  await expect(page.getByRole("heading", { name: /^Evidence$/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Evidence gallery/ })).toBeVisible();
  await expect(page.locator("main")).toContainText(/Product mock|Asset unavailable|Screenshot/);
  await expect(page.getByRole("heading", { name: /^Architecture$/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Key decisions and impact/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Roadmap/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Try the public demo/ })).toHaveAttribute(
    "href",
    "/en/ai-page-analysis"
  );
});

test("project entries keep unavailable demos honest while exposing source evidence", async ({
  page
}) => {
  await page.goto("/en/projects/knock");

  await expect(page.getByRole("heading", { name: /Knock Access Log Monitor/ })).toBeVisible();
  await expect(page.locator("main")).toContainText(/No public demo/);
  await expect(page.locator("main")).toContainText(/real access logs|IP addresses/);
  const sourceLink = page.locator("main a[href^='https://github.com/Oracle0703/website']").first();
  await expect(sourceLink).toBeVisible();
  await expect(sourceLink).toHaveAttribute("target", "_blank");
});

test("Tracker and developer tools remain usable from the bounded offline cache", async ({
  context,
  page
}) => {
  await page.goto("/tracker");
  await expect(page.getByRole("heading", { name: /^打卡平台$/ })).toBeVisible();

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(
        () => reject(new Error("Service worker did not control the page in time.")),
        10_000
      );
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => {
          window.clearTimeout(timeout);
          resolve();
        },
        { once: true }
      );
    });
  });

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /^打卡平台$/ })).toBeVisible();
    const offlineStatus = page.getByTestId("offline-navigation-status");
    await expect(offlineStatus).toContainText(/仅 Tracker 与开发者工具箱可用/);
    await expect(page.getByRole("button", { name: "打开全站搜索" })).toBeDisabled();

    await page.locator("footer").getByRole("link", { name: "作品", exact: true }).click();
    await expect(page).toHaveURL(/\/tracker$/);
    await expect(offlineStatus).toContainText("这个页面没有离线副本");

    await page.getByLabel("习惯名称").fill("离线阅读");
    await page.getByRole("button", { name: "添加习惯" }).click();
    await expect(page.locator("main")).toContainText("离线阅读");
    await page.getByRole("button", { name: "完成今日打卡" }).click();
    await expect(page.locator("main")).toContainText("今日打卡已保存");

    await clickLanguageToggle(page, /切换到英文|Switch to English/);
    await expect(page).toHaveURL(/\/en\/tracker$/);
    await expect(page.getByRole("heading", { name: /^Tracker$/ })).toBeVisible();
    await expect(page.locator("main")).toContainText("离线阅读");

    await page.getByTestId("offline-navigation-status").locator("a[data-offline-route='tools']").click();
    await expect(page).toHaveURL(/\/en\/labs\/tools$/);
    await expect(page.getByRole("heading", { name: /developer toolbox/ })).toBeVisible();
    const jsonTool = page.locator("#json-tool");
    await jsonTool.locator("textarea").first().fill('{"offline":true}');
    await jsonTool.getByRole("button", { name: "Format" }).click();
    await expect(jsonTool.locator("textarea").nth(1)).toHaveValue(/"offline": true/);

    await clickLanguageToggle(page, /切换到中文|Switch to Chinese/);
    await expect(page).toHaveURL(/\/labs\/tools$/);
    await expect(page.getByRole("heading", { name: /开发者工具/ })).toBeVisible();
    await page.getByTestId("offline-navigation-status").locator("a[data-offline-route='tracker']").click();
    await expect(page).toHaveURL(/\/tracker$/);
    await expect(page.getByRole("heading", { name: /^打卡平台$/ })).toBeVisible();

    const cachedUrls = await page.evaluate(async () => {
      const urls: string[] = [];
      for (const cacheName of await caches.keys()) {
        const cache = await caches.open(cacheName);
        urls.push(...(await cache.keys()).map((request) => request.url));
      }
      return urls;
    });
    expect(cachedUrls.some((url) => url.endsWith("/tracker"))).toBe(true);
    expect(cachedUrls.some((url) => url.endsWith("/en/labs/tools"))).toBe(true);
    for (const forbiddenPath of [
      "/api/",
      "/contact",
      "/ai-page-analysis",
      "/labs/query",
      "/search-index.json",
      "/rss.xml"
    ]) {
      expect(cachedUrls.some((url) => new URL(url).pathname.includes(forbiddenPath))).toBe(false);
    }
    expect(cachedUrls.some((url) => new URL(url).searchParams.has("_rsc"))).toBe(false);
  } finally {
    await context.setOffline(false);
  }

  await expectNoBrowserErrors(page);
});

// Pixel matching via toHaveScreenshot is intentionally not the default gate. The two home
// theme states above are attached to the Playwright report for review without committing a
// large, brittle snapshot matrix for every route and viewport.
