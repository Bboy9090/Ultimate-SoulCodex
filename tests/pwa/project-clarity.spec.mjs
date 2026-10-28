import { expect, test } from "@playwright/test";

async function createProfile(page, birthTime = "11:11") {
  await page.goto("/create", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("input-name")).toBeVisible();
  await expect(page.getByTestId("button-onboarding-next")).toBeVisible();

  await page.getByTestId("input-name").fill("Clarity Browser Test");
  await page.getByTestId("input-birth-date").fill("1990-09-17");
  await page.getByTestId("input-birth-time").fill(birthTime);
  await page.getByTestId("button-onboarding-next").click();
  await page.getByTestId("input-birth-location").fill("Bronx, New York");
  await page.getByTestId("button-location-lookup").click();
  await page.getByTestId("button-onboarding-next").click();
  await expect(page.getByTestId("checkbox-online-verification")).not.toBeChecked();
  await expect(page.getByTestId("button-create-profile")).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/profile\/local-/),
    page.getByTestId("button-create-profile").click(),
  ]);

  return new URL(page.url()).pathname;
}

test("Project Clarity reuses one saved profile across home, identity, timeline, and compatibility", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/create$/);
  await expect(page.getByTestId("input-name")).toBeVisible();

  await page.goto("/compatibility", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Compatibility starts with one saved identity\./i })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Create profile" })).toHaveAttribute("href", "/create");

  const profilePath = await createProfile(page);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Clarity Browser Test/i })).toBeVisible();

  const savedIdentityLinks = page.locator(`a[href="${profilePath}"]`);
  await expect(savedIdentityLinks.first()).toHaveAttribute("href", profilePath);

  await page.goto(profilePath, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`${profilePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));

  await page.goto("/timeline", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/timeline$/);

  await page.goto("/compatibility", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Clarity Browser Test Compatibility/i })).toBeVisible();
  const explorer = page.getByRole("link", { name: /Open Compatibility map/i });
  await expect(explorer).toHaveAttribute("href", "/compatibility/explorer");

  await explorer.click();
  await expect(page).toHaveURL(/\/compatibility\/explorer$/);
  await expect(page.getByRole("heading", { name: /Clarity Browser Test Compatibility map/i })).toBeVisible();

  await page.goto("/compatibility", { waitUntil: "domcontentloaded" });
  const comparePerson = page.getByTestId("compatibility-compare-person");
  await expect(comparePerson).toHaveAttribute("href", "/compatibility/compare");
  await comparePerson.click();
  await expect(page).toHaveURL(/\/compatibility\/compare$/);
  await expect(page.getByText(/Clarity Browser Test stays loaded/i)).toBeVisible();

  await page.getByTestId("compatibility-person-name").fill("Comparison Person");
  await page.getByTestId("compatibility-person-sun").selectOption("Pisces");
  await page.getByTestId("compatibility-person-submit").click();

  // This PWA harness intentionally returns 503 for cloud APIs. The browser
  // contract here is graceful degradation, not a fabricated offline match.
  await expect(page.getByRole("heading", { name: "Compatibility is unavailable" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/overall score|soulmate percentage/i);
});

test("a partial verified chart keeps its wheel, personal planet meanings and Free reading available", async ({ page }) => {
  test.skip(process.env.SOUL_CODEX_TEST_PARTIAL_CHART !== "1", "Requires the explicit test-only verification backend fixture.");
  // The fixture is served by the harness over HTTP, including through the PWA service worker.
  await createProfile(page, "10:10");
  await page.getByRole("button", { name: "Verify complete profile systems", exact: true }).click();
  await expect(page.getByTestId("verified-natal-chart")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Unavailable locally without verified placements.", exact: true })).toHaveCount(0);
  const system = page.getByTestId("interactive-planetary-system");
  await system.getByRole("button", { name: "☿ Mercury Virgo · verified", exact: true }).click();
  const selected = system.getByTestId("planetary-system-selection");
  await expect(selected).toContainText("Mercury in Virgo");
  await expect(selected).toContainText("House 11");
  await expect(selected).toContainText("perception, language, learning");
  await expect(selected).toContainText("Try this in your life");
  await page.getByRole("link", { name: "Open the full Free reading", exact: true }).click();
  const readings = page.getByRole("region", { name: "Your planetary placement readings", exact: true });
  await expect(readings).toContainText("Sun in Virgo · House 11");
  await expect(readings).toContainText("Moon in Virgo · House 11");
  await expect(readings).toContainText("Mercury in Virgo · House 11");
  await expect(readings).toContainText("friendships, groups, collective projects");
});
