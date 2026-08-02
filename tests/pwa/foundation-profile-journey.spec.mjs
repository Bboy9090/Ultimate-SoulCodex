import { mkdir } from "node:fs/promises";
import { chromium, devices, expect, test, webkit } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:4173";
const ACTIVE_PROFILE_KEY = "soulcodex.activeProfile.v1";
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
    if (!("serviceWorker" in navigator)) throw new Error("Service workers unavailable");
    await navigator.serviceWorker.ready;
  });
  await expect.poll(
    () => page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    { timeout: 20_000, message: "Soul Codex service worker never controlled the page" },
  ).toBe(true);
}

async function createFoundationProfile(page) {
  await page.goto(`${BASE_URL}/create`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Create Your\s*Soul Codex/i })).toBeVisible();

  await page.getByTestId("input-name").fill("Foundation Journey Test");
  await page.getByTestId("input-birth-date").fill("1990-09-17");
  await page.getByTestId("input-birth-time").fill("11:11");
  await page.getByTestId("input-birth-location").fill("Bronx, New York");
  await page.getByTestId("button-location-lookup").click();

  await Promise.all([
    page.waitForURL(/\/profile\/local-/),
    page.getByTestId("button-create-profile").click(),
  ]);

  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible();

  const profile = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, ACTIVE_PROFILE_KEY);

  expect(profile).toBeTruthy();
  expect(profile.birthDate).toBe("1990-09-17");
  expect(profile.schemaVersion).toBe(1);
  expect(profile.id).toBeTruthy();
  return profile;
}

async function assertIdentityStable(page, expectedId) {
  const state = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    const profile = raw ? JSON.parse(raw) : null;
    return {
      id: profile?.id ?? null,
      birthDate: profile?.birthDate ?? null,
      profileCount: Object.keys(localStorage).filter((keyName) => keyName === key).length,
    };
  }, ACTIVE_PROFILE_KEY);

  expect(state.id).toBe(expectedId);
  expect(state.birthDate).toBe("1990-09-17");
  expect(state.profileCount).toBe(1);
}

async function assertCoreRoute(page, path, visiblePattern, expectedId) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`${path.replaceAll("/", "\\/")}$`));
  await expect(page.locator("body")).toContainText(visiblePattern);
  await expect(page.locator("body")).not.toContainText(/Create Your Soul Codex/i);
  await assertIdentityStable(page, expectedId);
}

async function runCoreJourney(page, expectedId) {
  await assertCoreRoute(page, "/codex-reading", /Clarity|Core Pattern|Soul Codex/i, expectedId);
  await assertCoreRoute(page, "/timeline", /Timeline|Your Season|Completion|Personal Year/i, expectedId);
  await assertCoreRoute(page, "/compatibility", /Compatibility|Relationship|Match/i, expectedId);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toContainText(/Compatibility|Relationship|Match/i);
  await assertIdentityStable(page, expectedId);
}

test("one saved Soul Profile survives Reading, Timeline, Compatibility, restart, and supported offline mode", async ({ browserName }, testInfo) => {
  const browserType = BROWSER_TYPES[browserName];
  if (!browserType) throw new Error(`Unsupported browser project: ${browserName}`);

  const userDataDir = testInfo.outputPath(`foundation-profile-${browserName}`);
  await mkdir(userDataDir, { recursive: true });
  const options = persistentContextOptions(browserName);

  let context = await browserType.launchPersistentContext(userDataDir, options);
  let page = context.pages()[0] ?? (await context.newPage());
  let profile;

  try {
    profile = await createFoundationProfile(page);
    await waitForServiceWorkerControl(page);
    await runCoreJourney(page, profile.id);
  } finally {
    await context.close();
  }

  context = await browserType.launchPersistentContext(userDataDir, options);
  page = context.pages()[0] ?? (await context.newPage());

  try {
    if (browserName === "chromium") await context.setOffline(true);

    await page.goto(`${BASE_URL}/timeline`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/Timeline|Your Season|Completion|Personal Year/i);
    await assertIdentityStable(page, profile.id);

    await page.goto(`${BASE_URL}/compatibility`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/Compatibility|Relationship|Match/i);
    await assertIdentityStable(page, profile.id);

    const serviceWorkerState = await page.evaluate(async () => ({
      controlled: Boolean(navigator.serviceWorker.controller),
      registered: Boolean(await navigator.serviceWorker.getRegistration()),
    }));
    expect(serviceWorkerState).toEqual({ controlled: true, registered: true });
  } catch (error) {
    const screenshotPath = testInfo.outputPath(`foundation-journey-failure-${browserName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
    await testInfo.attach("foundation-profile-journey-failure", {
      path: screenshotPath,
      contentType: "image/png",
    }).catch(() => undefined);
    throw error;
  } finally {
    await context.setOffline(false).catch(() => undefined);
    await context.close();
  }
});
