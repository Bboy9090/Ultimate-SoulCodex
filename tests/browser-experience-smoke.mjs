import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer-core";

const base = (process.env.SOUL_CODEX_SMOKE_BASE_URL || "http://127.0.0.1:4173").replace(/\/+$/, "");
const chrome = process.env.CHROME_BIN || execFileSync("sh", ["-c", "command -v google-chrome || command -v chromium"], { encoding: "utf8" }).trim();
const report = { base, routes: [], interactions: [], pageErrors: [], failedChunks: [], elapsedMs: 0 };
const start = Date.now();
let browser;

async function visiblePage(page, pathname) {
  const response = await page.goto(base + pathname, { waitUntil: "domcontentloaded", timeout: 25000 });
  assert.ok(
    response && [200, 304].includes(response.status()),
    pathname + " returned an unexpected HTTP response: " + response?.status(),
  );
  await page.waitForFunction(
    () => {
      const heading = document.querySelector("h1");
      return Boolean(heading?.textContent?.trim()) &&
        !document.body.textContent?.includes("This section did not open cleanly.");
    },
    { timeout: 18000 },
  );
  const state = await page.evaluate(() => ({
    heading: document.querySelector("h1")?.textContent?.trim() || "",
    routeRecovery: document.body.textContent?.includes("This section did not open cleanly.") ?? false,
    opening: document.body.textContent?.includes("Opening…") ?? false,
  }));
  assert.equal(state.routeRecovery, false, pathname + " fell into route error recovery");
  assert.equal(state.opening, false, pathname + " never left the opening screen");
  report.routes.push({ pathname, heading: state.heading });
}

async function run() {
  browser = await puppeteer.launch({
    headless: true,
    executablePath: chrome,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.createBrowserContext();
  const desktop = await context.newPage();
  await desktop.setViewport({ width: 1280, height: 850 });
  desktop.on("pageerror", (error) => report.pageErrors.push(String(error.message)));
  desktop.on("requestfailed", (request) => {
    if (request.url().startsWith(base) && /\.(?:js|css)(?:[?#]|$)/.test(request.url())) {
      report.failedChunks.push({ url: request.url(), failure: request.failure()?.errorText });
    }
  });

  for (const route of [
    "/", "/connections", "/people", "/tools", "/systems",
    "/systems/atlas", "/timeline", "/compatibility", "/pricing",
    "/settings", "/diagnostics",
  ]) {
    await visiblePage(desktop, route);
  }

  await visiblePage(desktop, "/systems");
  await desktop.waitForSelector('[data-testid="planetary-educational-preview"]', { timeout: 12000 });
  const clickedVenus = await desktop.evaluate(() => {
    const root = document.querySelector('[data-testid="planetary-educational-preview"]');
    const button = [...(root?.querySelectorAll("button") || [])]
      .find((item) => item.textContent?.includes("Venus"));
    if (!button) return false;
    button.click();
    return true;
  });
  assert.ok(clickedVenus, "Venus was not selectable in the educational planetary explorer");
  await desktop.waitForFunction(
    () => document.querySelector('[data-testid="planetary-preview-selection"]')?.textContent?.includes("Values and connection"),
    { timeout: 6000 },
  );
  report.interactions.push("anonymous planetary preview: Venus selected");

  await visiblePage(desktop, "/");
  const peopleLink = await desktop.$('[data-testid="link-people"]');
  assert.ok(peopleLink, "desktop People navigation missing");
  await peopleLink.click();
  await desktop.waitForFunction(
    () => location.pathname === "/connections" &&
      document.querySelector("h1")?.textContent?.includes("Your people."),
    { timeout: 18000 },
  );
  report.interactions.push("desktop People navigation completed");

  await desktop.type("input[required]", "Smoke Tester Only");
  const selects = await desktop.$$("select");
  assert.ok(selects.length >= 2, "People form has no Sun fallback selection");
  await selects[1].select("Virgo");
  const clickedSave = await desktop.evaluate(() => {
    const button = [...document.querySelectorAll('button[type="submit"]')]
      .find((item) => item.textContent?.includes("Save"));
    if (!button) return false;
    button.click();
    return true;
  });
  assert.ok(clickedSave, "People Save button missing");
  await desktop.waitForFunction(
    () => document.body.textContent?.includes("Smoke Tester Only"),
    { timeout: 8000 },
  );
  await visiblePage(desktop, "/connections");
  await desktop.waitForFunction(
    () => document.body.textContent?.includes("Smoke Tester Only"),
    { timeout: 8000 },
  );
  report.interactions.push("People save and reopen persisted in isolated browser storage");

  const compare = await desktop.$('a[href^="/compatibility/compare?"]');
  assert.ok(compare, "saved People entry with Sun sign has no Compare navigation");
  await compare.click();
  await desktop.waitForFunction(
    () => location.pathname === "/compatibility/compare" && Boolean(document.querySelector("h1")),
    { timeout: 18000 },
  );
  report.interactions.push("People to Compare deep link completed");

  const mobile = await context.newPage();
  await mobile.setViewport({ width: 390, height: 844 });
  mobile.on("pageerror", (error) => report.pageErrors.push(String(error.message)));
  await visiblePage(mobile, "/");
  await mobile.click('[data-testid="button-menu"]');
  await mobile.waitForSelector('[data-testid="link-people-mobile"]', { visible: true, timeout: 6000 });
  // Radix Sheet can expose a visible link while its slide-in transform still
  // places the element outside the viewport. Click only once it is hittable.
  await mobile.waitForFunction(() => {
    const link = document.querySelector('[data-testid="link-people-mobile"]');
    const rect = link?.getBoundingClientRect();
    if (!rect || rect.width < 20 || rect.height < 20 ||
        rect.left < 0 || rect.right > innerWidth ||
        rect.top < 0 || rect.bottom > innerHeight) return false;
    const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return target === link || Boolean(target && link?.contains(target));
  }, { timeout: 8000 });
  await mobile.click('[data-testid="link-people-mobile"]');
  await mobile.waitForFunction(
    () => location.pathname === "/connections" &&
      document.querySelector("h1")?.textContent?.includes("Your people."),
    { timeout: 18000 },
  );
  report.interactions.push("mobile People menu navigation completed");

  assert.deepEqual(report.pageErrors, [], "Browser JavaScript exception(s) occurred");
  assert.deepEqual(report.failedChunks, [], "Same-origin JavaScript/CSS chunk(s) failed");
  await mkdir("artifacts", { recursive: true });
  await desktop.screenshot({ path: "artifacts/soulcodex-people-compare.png", fullPage: false });
  return true;
}

let success = false;
try {
  success = await run();
} catch (error) {
  report.failure = String(error?.stack || error);
  console.error(report.failure);
} finally {
  report.elapsedMs = Date.now() - start;
  await mkdir("artifacts", { recursive: true });
  await writeFile("artifacts/soulcodex-browser-experience-smoke.json", JSON.stringify(report, null, 2) + "\n");
  if (browser) await browser.close();
  console.log(JSON.stringify({ success, routes: report.routes.length, interactions: report.interactions, pageErrors: report.pageErrors, failedChunks: report.failedChunks, elapsedMs: report.elapsedMs, failure: report.failure }, null, 2));
}
if (!success) process.exitCode = 1;
