import { expect, test } from "@playwright/test";

const ACTIVE_PROFILE_KEY = "soulcodex.activeProfile.v1";

const routeCases = [
  { path: "/", pattern: /Soul Codex/i },
  { path: "/timeline", pattern: /Timeline|Current Phase|Personal Year/i },
  { path: "/compatibility", pattern: /Compatibility|Relationship|Match/i },
  { path: "/pricing", pattern: /Pricing|Premium|Free/i },
  { path: "/privacy", pattern: /Privacy/i },
  { path: "/terms", pattern: /Terms/i },
  { path: "/support", pattern: /Support/i },
  { path: "/settings", pattern: /Settings/i },
];

const chromiumViewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1194 },
  { name: "desktop", width: 1440, height: 900 },
];

async function createLocalProfile(page) {
  await page.goto("/create", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: /Create Your\s*Soul Codex/i }),
  ).toBeVisible();

  await page.getByTestId("input-name").fill("Responsive Journey Test");
  await page.getByTestId("input-birth-date").fill("1990-09-17");
  await page.getByTestId("input-birth-time").fill("11:11");
  await page.getByTestId("input-birth-location").fill("Bronx, New York");
  await page.getByTestId("button-location-lookup").click();

  await Promise.all([
    page.waitForURL(/\/profile\/local-/),
    page.getByTestId("button-create-profile").click(),
  ]);

  const profile = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, ACTIVE_PROFILE_KEY);

  expect(profile?.id).toMatch(/^local-/);
  return `/profile/${profile.id}`;
}

async function assertNoHorizontalOverflow(page, label) {
  const geometry = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    bodyWidth: document.body.scrollWidth,
  }));

  expect(
    geometry.documentWidth,
    `${label}: document creates horizontal scrolling`,
  ).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(
    geometry.bodyWidth,
    `${label}: body creates horizontal scrolling`,
  ).toBeLessThanOrEqual(geometry.viewportWidth + 1);
}

async function assertPrimaryNavigation(page, viewportWidth, routeLabel) {
  await expect(
    page.getByTestId("link-home"),
    `${routeLabel}: shared Home navigation is missing`,
  ).toBeVisible();

  if (viewportWidth < 768) {
    const menu = page.getByTestId("button-menu");
    await expect(menu, `${routeLabel}: mobile menu button is missing`).toBeVisible();
    const box = await menu.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
  } else {
    await expect(page.getByTestId("link-identity")).toBeVisible();
    await expect(page.getByTestId("link-timeline")).toBeVisible();
    await expect(page.getByTestId("link-compatibility")).toBeVisible();
    await expect(page.getByTestId("button-new-reading")).toBeVisible();
    await expect(page.getByTestId("button-menu")).toBeHidden();
  }
}

async function assertRoute(page, path, pattern, viewport) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`${path === "/" ? "/$" : path}$`));
  await expect(page.locator("body")).toContainText(pattern);
  await expect(page.locator("body")).not.toContainText(/404 Page Not Found/i);
  await assertPrimaryNavigation(page, viewport.width, `${viewport.name} ${path}`);
  await assertNoHorizontalOverflow(page, `${viewport.name} ${path}`);
}

async function assertMobileMenuJourney(page, profilePath) {
  await page.goto(profilePath, { waitUntil: "domcontentloaded" });
  await page.getByTestId("button-menu").click();
  await expect(page.getByTestId("link-identity-mobile")).toBeVisible();
  await expect(page.getByTestId("link-timeline-mobile")).toBeVisible();
  await expect(page.getByTestId("link-compatibility-mobile")).toBeVisible();
  await expect(page.getByTestId("button-new-profile-mobile")).toBeVisible();

  await page.getByTestId("link-timeline-mobile").click();
  await expect(page).toHaveURL(/\/timeline$/);
  await expect(page.locator("body")).toContainText(
    /Timeline|Current Phase|Personal Year/i,
  );
}

test("Foundation consumer journey is readable and navigable at common web widths", async (
  { page, browserName },
  testInfo,
) => {
  const criticalConsoleErrors = [];
  const pageErrors = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (
      /Uncaught|ReferenceError|Cannot read properties|is not a function|Maximum update depth/i.test(
        text,
      )
    ) {
      criticalConsoleErrors.push(text);
    }
  });

  const viewports =
    browserName === "chromium"
      ? chromiumViewports
      : [{ name: "webkit-iphone", width: 390, height: 844 }];

  await page.setViewportSize(viewports[0]);
  const profilePath = await createLocalProfile(page);

  for (const viewport of viewports) {
    await test.step(`${viewport.name} responsive journey`, async () => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await test.step(`${viewport.name} ${profilePath}`, async () => {
        await assertRoute(
          page,
          profilePath,
          /Saved on this device|Works offline|Soul Codex/i,
          viewport,
        );
      });

      for (const route of routeCases) {
        await test.step(`${viewport.name} ${route.path}`, async () => {
          await assertRoute(page, route.path, route.pattern, viewport);
        });
      }

      if (viewport.width < 768) {
        await test.step(`${viewport.name} mobile menu journey`, async () => {
          await assertMobileMenuJourney(page, profilePath);
          await assertNoHorizontalOverflow(page, `${viewport.name} mobile menu`);
        });
      }
    });
  }

  await testInfo.attach("responsive-qa-summary", {
    body: JSON.stringify(
      {
        browserName,
        viewports: viewports.map(({ name, width, height }) => ({
          name,
          width,
          height,
        })),
        routes: [profilePath, ...routeCases.map(({ path }) => path)],
        pageErrors,
        criticalConsoleErrors,
      },
      null,
      2,
    ),
    contentType: "application/json",
  });

  expect(pageErrors, "uncaught page errors detected").toEqual([]);
  expect(
    criticalConsoleErrors,
    "critical browser console errors detected",
  ).toEqual([]);
});
