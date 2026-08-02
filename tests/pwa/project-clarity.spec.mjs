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

  return page.url();
}

test("Project Clarity reuses one saved profile across home, identity, timeline, and compatibility", async ({ page, browserName }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Understand yourself without drowning in labels." })).toBeVisible();

  await page.goto("/compatibility", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Compatibility begins with one saved identity." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create your Soul Profile" })).toHaveAttribute("href", "/create");

  const profileUrl = await createProfile(page);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Good to see you, Clarity Browser Test." })).toBeVisible();
  await expect(page.getByTestId("link-identity").or(page.getByTestId("link-identity-mobile"))).toHaveCount(browserName === "webkit" ? 1 : 1);

  const identityLink = browserName === "webkit"
    ? page.getByTestId("link-identity-mobile")
    : page.getByTestId("link-identity");

  if (browserName === "webkit") {
    await page.getByTestId("button-menu").click();
    await expect(identityLink).toBeVisible();
  }

  await expect(identityLink).toHaveAttribute("href", new URL(profileUrl).pathname);

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
