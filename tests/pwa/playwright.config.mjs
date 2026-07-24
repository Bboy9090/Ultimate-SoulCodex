import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: /offline-shell\.spec\.mjs/,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [
    ["line"],
    ["html", { outputFolder: "../../playwright-report", open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium-desktop", use: { browserName: "chromium" } },
    { name: "webkit-iphone", use: { browserName: "webkit" } },
  ],
  webServer: {
    command: "node tests/pwa/static-server.mjs",
    url: "http://127.0.0.1:4173/manifest.webmanifest",
    reuseExistingServer: false,
    timeout: 30_000,
  },
  outputDir: "../../test-results/pwa",
});
