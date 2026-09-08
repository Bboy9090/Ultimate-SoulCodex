import { expect, test } from "@playwright/test";

function relevantUpload(pathname, method) {
  return method === "POST" && (pathname === "/api/profiles" || pathname === "/api/verification/profile");
}

test("local profile creation and reopen stay on-device until verification is explicitly requested", async ({ page }) => {
  const uploads = [];
  const requestListener = (request) => {
    const url = new URL(request.url());
    if (relevantUpload(url.pathname, request.method())) {
      uploads.push({ pathname: url.pathname, method: request.method() });
    }
  };
  page.on("request", requestListener);

  try {
    await page.goto("/create", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("checkbox-online-verification")).not.toBeChecked();

    await page.getByTestId("input-name").fill("Consent Boundary Test");
    await page.getByTestId("input-birth-date").fill("1990-09-17");
    // Leave time blank deliberately to exercise the unknown-time contract.
    await page.getByTestId("input-birth-location").fill("Bronx, New York");
    await page.getByTestId("button-location-lookup").click();

    await Promise.all([
      page.waitForURL(/\/profile\/local-/),
      page.getByTestId("button-create-profile").click(),
    ]);

    await expect(page.getByRole("heading", { name: "Consent Boundary Test" })).toBeVisible();
    expect(uploads, "creating a local profile sent server-backed profile or verification data without consent").toEqual([]);

    const profilePath = new URL(page.url()).pathname;
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.goto(profilePath, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Consent Boundary Test" })).toBeVisible();
    await expect(page.getByTestId("button-verify-online-profile")).toBeVisible();

    expect(uploads, "opening a local profile triggered a server-backed upload without pressing Verify online").toEqual([]);
  } finally {
    page.off("request", requestListener);
  }
});
