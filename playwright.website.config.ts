import { defineConfig, devices } from "@playwright/test";

const verifyPort = Number(process.env.WEBSITE_BROWSER_VERIFY_PORT ?? 4323);
const verifyBaseUrl = `http://127.0.0.1:${verifyPort}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: /website-browser-static\.spec\.ts/,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.03
    }
  },
  fullyParallel: false,
  reporter: [["list"]],
  outputDir: "test-results/website-browser",
  snapshotPathTemplate: "tests/__screenshots__/{testFilePath}/{projectName}/{arg}{ext}",
  use: {
    baseURL: verifyBaseUrl,
    actionTimeout: 10_000,
    reducedMotion: "reduce",
    timezoneId: "UTC",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: `npm run build:website && cd apps/website && npx next start -H 127.0.0.1 -p ${verifyPort}`,
    url: verifyBaseUrl,
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    {
      name: "website-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 }
      }
    },
    {
      name: "website-mobile",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 393, height: 852 }
      }
    }
  ]
});
