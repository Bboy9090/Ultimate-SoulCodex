import { expect, test } from "@playwright/test";

async function createProfile(page) {
  await page.goto("/create", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("input-name")).toBeVisible();
  await expect(page.getByTestId("button-create-profile")).toBeVisible();

  await page.getByTestId("input-name").fill("Clarity Browser Test");
  await page.getByTestId("input-birth-date").fill("1990-09-17");
  await page.getByTestId("input-birth-time").fill("11:11");
  await page.getByTestId("input-birth-location").fill("Bronx, New York");
  await page.getByTestId("button-location-lookup").click();

  await Promise.all([
    page.waitForURL(/\/profile\/local-/),
    page.getByTestId("button-create-profile").click(),
  ]);

  return new URL(page.url()).pathname;
}

test("Project Clarity reuses one saved profile across home, identity, timeline, and compatibility", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("link-home")).toBeVisible();
  await expect(page.locator("main")).toContainText(/Soul Codex|identity|reading/i);

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