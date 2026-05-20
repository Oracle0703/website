import { expect, test, type Page } from "@playwright/test";
import { PUBLIC_WEBSITE_LOCALE_ROUTES } from "../apps/website/lib/public-routes";

const detailRoutes = [
  { path: "/blog/ci-agent-guardrails", name: "zh-blog-detail" },
  { path: "/projects/ai-page-analysis", name: "zh-project-detail" },
  { path: "/en/blog/ci-agent-guardrails", name: "en-blog-detail" },
  { path: "/en/projects/ai-page-analysis", name: "en-project-detail" }
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

const ignoredConsoleFragments = [
  "Download the React DevTools"
];

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
    text: /structured scoring/i
  },
  {
    path: "/en/ai-page-analysis",
    heading: /AI Page Analysis and Redesign Assistant/,
    text: /Generate redesign demo/
  },
  {
    path: "/en/blog/ci-agent-guardrails",
    heading: /Guardrails/,
    text: /CI Agent/
  }
];

async function installPreferenceState(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("locale", "en");
    localStorage.setItem("theme", "dark");
  });
}

async function expectNoCjk(page: Page, selector = "main") {
  const text = await page.locator(selector).innerText();
  expect(text).not.toMatch(/[\u3400-\u9fff\uF900-\uFAFF]/);
}

async function expectNoBrowserErrors(page: Page, browserErrors: string[]) {
  await page.waitForLoadState("networkidle");

  expect(browserErrors.filter(Boolean)).toEqual([]);
}

async function openMobileMenu(page: Page) {
  await page.locator("button[aria-expanded='false']").click();
}

async function clickLanguageToggle(page: Page, name: RegExp, openMenuWhenHidden: boolean) {
  const button = page.getByRole("button", { name }).first();

  if (openMenuWhenHidden && !(await button.isVisible())) {
    await openMobileMenu(page);
  }

  await page.getByRole("button", { name }).first().click();
}

test.beforeEach(async ({ page }) => {
  const browserErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (ignoredConsoleFragments.some((fragment) => text.includes(fragment))) return;
    browserErrors.push(text);
  });

  page.on("pageerror", (error) => {
    browserErrors.push(error.message);
  });

  await installPreferenceState(page);
  await page.exposeFunction("__collectBrowserErrors", () => browserErrors);
});

for (const route of routes) {
  test(`${route.name} restores preferences without console errors`, async ({ page }, testInfo) => {
    await page.goto(route.path);

    await expect.poll(async () => page.evaluate(() => document.documentElement.lang)).toBe(route.expectedLang);
    await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");

    const browserErrors = await page.evaluate(async () => {
      const collectBrowserErrors = window.__collectBrowserErrors as () => Promise<string[]>;
      return collectBrowserErrors();
    });
    await expectNoBrowserErrors(page, browserErrors);

    await expect(page).toHaveScreenshot(`${testInfo.project.name}-${route.name}.png`, {
      fullPage: false
    });
  });
}

test("language toggle moves between Chinese and English canonical URLs", async ({ page }) => {
  const isMobile = test.info().project.name.includes("mobile");

  await page.goto("/blog");
  await clickLanguageToggle(page, /切换到英文|Switch to English/, isMobile);
  await expect(page).toHaveURL(/\/en\/blog$/);

  await clickLanguageToggle(page, /切换到中文|Switch to Chinese/, isMobile);
  await expect(page).toHaveURL(/\/blog$/);
});

test.describe("English content quality", () => {
  for (const check of englishContentChecks) {
    test(`${check.path} exposes English primary content`, async ({ page }) => {
      await page.goto(check.path);

      await expect(page.getByRole("heading", { name: check.heading }).first()).toBeVisible();
      await expect(page.locator("main")).toContainText(check.text);
      await expectNoCjk(page);
    });
  }
});

declare global {
  interface Window {
    __collectBrowserErrors: () => Promise<string[]>;
  }
}
