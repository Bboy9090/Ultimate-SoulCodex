import { mkdir } from "node:fs/promises";
import { chromium, devices, expect, test, webkit } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:4173";
const ACTIVE_PROFILE_KEY = "soulcodex.activeProfile.v1";
const LEGACY_PROFILE_KEYS = ["soulProfile", "soulCodexReading", "soulConfidence", "soulGuestProfile", "soulGuestConfidence"];
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

async function seedConsumerState(page) {
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(({ activeKey, legacyKeys }) => {
    const profile = {
      id: "local-delete-contract",
      birthDate: "1990-09-17",
      schemaVersion: 1,
      sunSign: "Virgo",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(activeKey, JSON.stringify(profile));
    for (const key of legacyKeys) localStorage.setItem(key, JSON.stringify(profile));
    localStorage.setItem("unrelated-soulcodex-cache", "delete-me-too");
    sessionStorage.setItem("session-delete-contract", "present");
  }, { activeKey: ACTIVE_PROFILE_KEY, legacyKeys: LEGACY_PROFILE_KEYS });
}

async function assertDeviceStorageEmpty(page) {
  const state = await page.evaluate(({ activeKey, legacyKeys }) => ({
    activeProfile: localStorage.getItem(activeKey),
    legacyValues: legacyKeys.map((key) => localStorage.getItem(key)),
    localCount: localStorage.length,
    sessionCount: sessionStorage.length,
  }), { activeKey: ACTIVE_PROFILE_KEY, legacyKeys: LEGACY_PROFILE_KEYS });

  expect(state.activeProfile).toBeNull();
  expect(state.legacyValues.every((value) => value === null)).toBe(true);
  expect(state.localCount).toBe(0);
  expect(state.sessionCount).toBe(0);
}

test("Settings exposes account deletion and deleted profile cannot resurrect after restart", async ({ browserName }, testInfo) => {
  const browserType = BROWSER_TYPES[browserName];
  if (!browserType) throw new Error(`Unsupported browser project: ${browserName}`);

  const userDataDir = testInfo.outputPath(`account-deletion-${browserName}`);
  await mkdir(userDataDir, { recursive: true });
  const options = persistentContextOptions(browserName);

  let context = await browserType.launchPersistentContext(userDataDir, options);
  let page = context.pages()[0] ?? (await context.newPage());

  try {
    await seedConsumerState(page);

    await page.route("**/api/auth/account", async (route) => {
      if (route.request().method() !== "DELETE") return route.fallback();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto(`${BASE_URL}/settings`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await page.getByRole("button", { name: /Delete Account & Data/i }).click();

    await expect(page).toHaveURL(/\/delete-account$/);
    await expect(page.getByRole("heading", { name: /Delete Account & Data/i })).toBeVisible();

    await page.locator("#delete-confirmation").fill("DELETE");
    await Promise.all([
      page.waitForURL(/\/\?accountDeleted=1$/),
      page.getByRole("button", { name: /Permanently Delete My Data/i }).click(),
    ]);

    await assertDeviceStorageEmpty(page);
  } finally {
    await context.close();
  }

  context = await browserType.launchPersistentContext(userDataDir, options);
  page = context.pages()[0] ?? (await context.newPage());

  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await assertDeviceStorageEmpty(page);
    await expect(page.locator("body")).not.toContainText("local-delete-contract");
  } catch (error) {
    const screenshotPath = testInfo.outputPath(`account-deletion-restart-failure-${browserName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
    await testInfo.attach("account-deletion-restart-failure", {
      path: screenshotPath,
      contentType: "image/png",
    }).catch(() => undefined);
    throw error;
  } finally {
    await context.close();
  }
});
