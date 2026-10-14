import { expect, test } from "@playwright/test";

const destinations = [
  {
    label: "People",
    href: "/connections",
    ready: (page) => page.getByRole("heading", { name: /Your people\. Their consent\./i }),
  },
  {
    label: "Tools",
    href: "/tools",
    ready: (page) => page.getByRole("heading", { name: /Useful prompts without fake certainty/i }),
  },
  {
    label: "Systems",
    href: "/systems",
    ready: (page) => page.getByTestId("planetary-educational-preview"),
  },
];

async function assertNoOverflow(page, label) {
  const geometry = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
    body: document.body.scrollWidth,
  }));
  expect(geometry.document, `${label}: document overflow`).toBeLessThanOrEqual(geometry.viewport + 1);
  expect(geometry.body, `${label}: body overflow`).toBeLessThanOrEqual(geometry.viewport + 1);
}

test("Navigation and planetary browser acceptance: clickable routes, alias, and keyboard controls", async ({ page }, testInfo) => {
  const runtimeErrors = [];
  const timings = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  for (const viewport of [
    { name: "desktop", width: 1365, height: 850 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const destination of destinations) {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const start = Date.now();
      if (viewport.name === "mobile") {
        await page.getByTestId("button-menu").click();
        // A real pointer click must wait for the Radix drawer to finish sliding in.
        await page.getByTestId(`link-${destination.label.toLowerCase()}-mobile`).click();
      } else {
        await page.getByTestId(`link-${destination.label.toLowerCase()}`).click();
      }

      await expect(page).toHaveURL(new RegExp(`${destination.href}$`));
      await expect(destination.ready(page)).toBeVisible();
      await expect(page.locator("body")).not.toContainText(/404 Page Not Found/i);
      await assertNoOverflow(page, `${viewport.name} ${destination.label}`);
      timings.push({ viewport: viewport.name, route: destination.href, readyMs: Date.now() - start });
    }

    // Old bookmarks must still reach the new Connections page.
    await page.goto("/people", { waitUntil: "domcontentloaded" });
    await expect(destinations[0].ready(page)).toBeVisible();
    await assertNoOverflow(page, `${viewport.name} /people`);

    await page.goto("/systems", { waitUntil: "domcontentloaded" });
    const explorer = page.getByTestId("planetary-educational-preview");
    await expect(explorer).toBeVisible();
    await expect(explorer).toContainText(/not a personal chart/i);
    await expect(page.getByTestId("planetary-preview-selection")).toContainText("Sun");

    await page.locator('g[aria-label="Explore Moon"]').click();
    await expect(page.locator('g[aria-label="Explore Moon"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("planetary-preview-selection")).toContainText("Emotional needs");

    // SVG groups are focusable with tabIndex, but not HTMLElements; focus through the DOM.
    await page.evaluate(() => document.querySelector('g[aria-label="Explore Mars"]').focus());
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("planetary-preview-selection")).toContainText("Action");
    await expect(page.locator('g[aria-label="Explore Mars"]')).toHaveAttribute("aria-pressed", "true");

    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    await explorer.locator("button").filter({ hasText: /Saturn/i }).click();
    await expect(page.getByTestId("planetary-preview-selection")).toContainText("Structure");
    await page.emulateMedia({ reducedMotion: "no-preference" });
  }

  expect(runtimeErrors, "Uncaught browser exceptions in the navigation/planetary journey").toEqual([]);
  await testInfo.attach("navigation-timings.json", {
    body: Buffer.from(JSON.stringify({ timings, runtimeErrors }, null, 2)),
    contentType: "application/json",
  });
});
