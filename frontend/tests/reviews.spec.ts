import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("homepage has four clearly marked sample reviews immediately before the footer", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.getByRole("region", { name: "What People Are Saying" });
  await expect(section).toBeVisible();
  await expect(section.locator("article")).toHaveCount(4);
  await expect(
    section.getByText("Sample Review — Preview", { exact: true }),
  ).toHaveCount(4);
  await expect(section.getByRole("link")).toHaveCount(0);
  await expect(section.locator("time")).toHaveCount(4);
  expect(
    await section.evaluate(
      (el) => el === document.querySelector("main")?.lastElementChild,
    ),
  ).toBe(true);
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const columns = await section
      .locator(".reviews-grid")
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      );
    expect(columns).toBe(width < 650 ? 1 : 2);
  }
  expect(
    (await new AxeBuilder({ page }).include("#reviews").analyze()).violations,
  ).toEqual([]);
  await section.screenshot({ path: "test-results/reviews-desktop.png" });
  await page.setViewportSize({ width: 375, height: 812 });
  await section.screenshot({
    path: "test-results/reviews-mobile.png",
    style: "header { visibility: hidden !important; }",
  });
  await page.goto("/about-us");
  await expect(page.locator("#reviews")).toHaveCount(0);
});

async function googleMode(page: import("@playwright/test").Page) {
  await page.route("**/src/reviews.ts*", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: (await response.text()).replaceAll(
        "import.meta.env.VITE_REVIEWS_MODE",
        '"GOOGLE"',
      ),
    });
  });
}
test("Google mode preserves author attribution and shows no demonstration reviews", async ({
  page,
}) => {
  await googleMode(page);
  await page.route("**/api/reviews", (route) =>
    route.fulfill({
      json: {
        mode: "GOOGLE",
        status: "ready",
        reviews: [
          {
            id: "synthetic-api",
            name: "Synthetic API Author",
            rating: 4,
            text: "Synthetic upstream fixture for integration testing.",
            date: "2026-01-01T00:00:00Z",
            demo: false,
            avatarUrl: "",
            authorUrl: "https://www.google.com/maps/contrib/test",
            reviewUrl: "https://www.google.com/maps/reviews/test",
          },
        ],
        attributions: [
          { name: "Synthetic provider", url: "https://example.test" },
        ],
      },
    }),
  );
  await page.goto("/");
  const section = page.locator("#reviews");
  await expect(
    section.getByRole("heading", { name: "Synthetic API Author" }),
  ).toBeVisible();
  await expect(
    section.getByRole("link", {
      name: "Synthetic API Author (opens in a new tab)",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://www.google.com/maps/contrib/test");
  await expect(section.getByText("Google Maps", { exact: true })).toBeVisible();
  await expect(
    section.getByText("Sample Review — Preview", { exact: true }),
  ).toHaveCount(0);
  expect(
    (await new AxeBuilder({ page }).include("#reviews").analyze()).violations,
  ).toEqual([]);
});
test("Google failures, unconfigured mode and mismatched demo responses never produce fake reviews", async ({
  page,
}) => {
  await googleMode(page);
  for (const result of ["failed", "unconfigured", "wrong-mode"]) {
    await page.route("**/api/reviews", (route) =>
      route.fulfill(
        result === "failed"
          ? { status: 503, json: { message: "secret-upstream-error" } }
          : {
              json: {
                mode: result === "wrong-mode" ? "DEMO" : "GOOGLE",
                status: "unconfigured",
                reviews: [],
              },
            },
      ),
    );
    await page.goto("/");
    await expect(page.locator(".reviews-status")).toContainText(
      result === "unconfigured"
        ? "once the Google Business Profile is connected"
        : "temporarily unavailable",
    );
    await expect(page.locator(".review-card")).toHaveCount(0);
    await expect(page.getByText("secret-upstream-error")).toHaveCount(0);
    await page.unroute("**/api/reviews");
  }
});
test("successful unconfigured state stays accurate after the loading deadline", async ({
  page,
}) => {
  await page.clock.install();
  await googleMode(page);
  await page.route("**/api/reviews", (route) =>
    route.fulfill({
      json: { mode: "GOOGLE", status: "unconfigured", reviews: [] },
    }),
  );
  await page.goto("/");
  await expect(page.locator(".reviews-status")).toContainText(
    "once the Google Business Profile is connected",
  );
  await page.clock.fastForward(13000);
  await expect(page.locator(".reviews-status")).toContainText(
    "once the Google Business Profile is connected",
  );
});
