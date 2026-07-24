import { mkdir } from "node:fs/promises";
import { chromium, devices, expect, test, webkit } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:4173";
const BROWSER_TYPES = { chromium, webkit };

function persistentContextOptions(browserName) {
  const descriptor = browserName === "webkit" ? devices["iPhone 15"] : devices["Desktop Chrome"];
  const { defaultBrowserType: _defaultBrowserType, ...deviceOptions } = descriptor;
  return {
    ...deviceOptions,
    headless: true,
    locale: "en-US",
    serviceWorkers: "allow",
  };
}

async function waitForServiceWorkerControl(page) {
  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) throw new Error("Service workers are not supported by this browser engine");
    await navigator.serviceWorker.ready;
  });

  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), {
      message: "The production page never became controlled by the SoulCodex service worker",
      timeout: 20_000,
    })
    .toBe(true);
}

async function createLocalCodex(page) {
  await page.goto(`${BASE_URL}/create`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Create Your Soul Codex/i })).toBeVisible();

  await page.getByTestId("input-name").fill("Offline Browser Test");
  await page.getByTestId("input-birth-date").fill("1990-09-17");
  await page.getByTestId("input-birth-time").fill("11:11");
  await page.getByTestId("input-birth-location").fill("Bronx, New York");
  await page.getByTestId("button-location-lookup").click();

  await expect(page.locator('input[placeholder="40.7128"]')).toHaveValue("40.8448");
  await expect(page.locator('input[placeholder="-74.0060"]')).toHaveValue("-73.8648");
  await expect(page.locator('input[placeholder="America/New_York"]')).toHaveValue("America/New_York");

  await Promise.all([
    page.waitForURL(/\/profile\/local-/),
    page.getByTestId("button-create-profile").click(),
  ]);

  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible();
  await expect(page.getByText("Works offline", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Offline Browser Test's Soul Codex/i })).toBeVisible();
  return page.url();
}

async function assertOfflineProfile(page, profileUrl) {
  await page.goto(profileUrl, { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Works offline", { exact: true })).toBeVisible();
  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Offline Browser Test's Soul Codex/i })).toBeVisible();
  await expect(page.getByText("Core numbers", { exact: true })).toBeVisible();

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText("Works offline", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Offline Browser Test's Soul Codex/i })).toBeVisible();
}

test("reopens a saved local Codex after a full offline browser restart", async ({ browserName }, testInfo) => {
  const browserType = BROWSER_TYPES[browserName];
  if (!browserType) throw new Error(`Unsupported browser project: ${browserName}`);

  const userDataDir = testInfo.outputPath(`persistent-${browserName}`);
  await mkdir(userDataDir, { recursive: true });
  const options = persistentContextOptions(browserName);

  let context = await browserType.launchPersistentContext(userDataDir, options);
  let page = context.pages()[0] ?? (await context.newPage());
  let profileUrl;

  try {
    profileUrl = await createLocalCodex(page);
    await waitForServiceWorkerControl(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Works offline", { exact: true })).toBeVisible();
  } finally {
    await context.close();
  }

  context = await browserType.launchPersistentContext(userDataDir, options);
  await context.setOffline(true);
  page = context.pages()[0] ?? (await context.newPage());

  try {
    await assertOfflineProfile(page, profileUrl);
    const registrationState = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return {
        controlled: Boolean(navigator.serviceWorker.controller),
        registered: Boolean(registration),
      };
    });
    expect(registrationState).toEqual({ controlled: true, registered: true });
  } catch (error) {
    const screenshotPath = testInfo.outputPath(`offline-failure-${browserName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
    await testInfo.attach("offline-browser-failure", { path: screenshotPath, contentType: "image/png" }).catch(() => undefined);
    throw error;
  } finally {
    await context.setOffline(false).catch(() => undefined);
    await context.close();
  }
});
