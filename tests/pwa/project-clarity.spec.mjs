import { expect, test } from "@playwright/test";

async function createProfile(page) {
  await page.goto("/create", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Create Your\s*Soul Codex/i })).toBeVisible();

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
  await expect(page.getByRole("heading", { name: "Understand yourself without drowning in labels." })).toBeVisible();

  await page.goto("/compatibility", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Compatibility begins with one saved identity." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create your Soul Profile" })).toHaveAttribute("href", "/create");

  const profilePath = await createProfile(page);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Good to see you, Clarity Browser Test." })).toBeVisible();

  const savedIdentityLinks = page.locator(`a[href="${profilePath}"]`);
  await expect(savedIdentityLinks.first()).toHaveAttribute("href", profilePath);

  await page.goto(profilePath, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`${profilePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));

  await page.goto("/timeline", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/timeline$/);

  await page.goto("/compatibility", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Clarity Browser Test relationship blueprint/i })).toBeVisible();
  const explorer = page.getByRole("link", { name: /Universal Match Explorer/i });
  await expect(explorer).toHaveAttribute("href", "/compatibility/explorer");

  await explorer.click();
  await expect(page).toHaveURL(/\/compatibility\/explorer$/);
  await expect(page.getByRole("heading", { name: "Compatibility" })).toBeVisible();
});
