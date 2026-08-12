import { mkdir } from "node:fs/promises";
import { chromium, devices, expect, test, webkit } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:4173";
const ACTIVE_PROFILE_KEY = "soulcodex.activeProfile.v1";
const OFFLINE_PROFILE_ID = "local-delete-contract";
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
  await page.evaluate(async ({ activeKey, legacyKeys, profileId }) => {
    const profile = {
      id: profileId,
      birthDate: "1990-09-17",
      schemaVersion: 1,
      sunSign: "Virgo",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(activeKey, JSON.stringify(profile));
    for (const key of legacyKeys) localStorage.setItem(key, JSON.stringify(profile));
    localStorage.setItem(`soulcodex.offlineProfile.v1.${profileId}`, JSON.stringify(profile));
    localStorage.setItem("unrelated-soulcodex-cache", "delete-me-too");
    sessionStorage.setItem("session-delete-contract", "present");

    await new Promise((resolve, reject) => {
      const openRequest = indexedDB.open("soulcodex-offline", 1);
      openRequest.onupgradeneeded = () => {
        const database = openRequest.result;
        if (!database.objectStoreNames.contains("profiles")) {
          database.createObjectStore("profiles", { keyPath: "id" });
        }
      };
      openRequest.onerror = () => reject(openRequest.error ?? new Error("Unable to seed offline IndexedDB"));
      openRequest.onsuccess = () => {
        const database = openRequest.result;
        const transaction = database.transaction("profiles", "readwrite");
        transaction.objectStore("profiles").put(profile);
        transaction.oncomplete = () => {
          database.close();
          resolve();
        };
        transaction.onerror = () => {
          database.close();
          reject(transaction.error ?? new Error("Unable to seed offline profile"));
        };
      };
    });
  }, { activeKey: ACTIVE_PROFILE_KEY, legacyKeys: LEGACY_PROFILE_KEYS, profileId: OFFLINE_PROFILE_ID });
}

async function readOfflineIndexedDbProfile(page) {
  return page.evaluate(async (profileId) => {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open("soulcodex-offline", 1);
      openRequest.onupgradeneeded = () => {
        const database = openRequest.result;
        if (!database.objectStoreNames.contains("profiles")) {
          database.createObjectStore("profiles", { keyPath: "id" });
        }
      };
      openRequest.onerror = () => reject(openRequest.error ?? new Error("Unable to open offline IndexedDB"));
      openRequest.onsuccess = () => {
        const database = openRequest.result;
        const transaction = database.transaction("profiles", "readonly");
        const request = transaction.objectStore("profiles").get(profileId);
        request.onsuccess = () => {
          const result = request.result ?? null;
          database.close();
          resolve(result);
        };
        request.onerror = () => {
          database.close();
          reject(request.error ?? new Error("Unable to read offline profile"));
        };
      };
    });
  }, OFFLINE_PROFILE_ID);
}

async function assertDeviceStorageEmpty(page) {
  const state = await page.evaluate(({ activeKey, legacyKeys, profileId }) => ({
    activeProfile: localStorage.getItem(activeKey),
    legacyValues: legacyKeys.map((key) => localStorage.getItem(key)),
    fallbackProfile: localStorage.getItem(`soulcodex.offlineProfile.v1.${profileId}`),
    localCount: localStorage.length,
    sessionCount: sessionStorage.length,
  }), { activeKey: ACTIVE_PROFILE_KEY, legacyKeys: LEGACY_PROFILE_KEYS, profileId: OFFLINE_PROFILE_ID });

  expect(state.activeProfile).toBeNull();
  expect(state.legacyValues.every((value) => value === null)).toBe(true);
  expect(state.fallbackProfile).toBeNull();
  expect(state.localCount).toBe(0);
  expect(state.sessionCount).toBe(0);
  expect(await readOfflineIndexedDbProfile(page)).toBeNull();
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
    expect(await readOfflineIndexedDbProfile(page)).toMatchObject({ id: OFFLINE_PROFILE_ID });

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
    await expect(page.locator("body")).not.toContainText(OFFLINE_PROFILE_ID);
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
