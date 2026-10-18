import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/",
  "/about",
  "/services",
  "/case-studies",
  "/insights",
  "/careers",
  "/contact",
];
test("all routes at all required widths are accessible and have no overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page).toHaveTitle(/Mediastris Healthcare LLP/);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}`,
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
test("all pages pass automated WCAG checks", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(scan.violations, route).toEqual([]);
  }
});
test("menu navigation, Escape, current page and skip link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("button", { name: "Close" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
  await page.getByRole("button", { name: "Menu" }).click();
  await page
    .getByRole("button", { name: "Explore about us", exact: true })
    .click();
  await page
    .getByRole("region", { name: "About us navigation", exact: true })
    .getByRole("link", { name: "About Us", exact: true })
    .click();
  await expect(page).toHaveURL(/\/about-us$/);
  await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
});
async function fill(page: import("@playwright/test").Page) {
  await page.getByLabel("Name", { exact: false }).fill("Test Person");
  await page.getByLabel("Email", { exact: false }).fill("person@example.test");
  await page.getByLabel("Phone", { exact: false }).fill("+91 98765 43210");
  await page
    .getByLabel("Company / Organization", { exact: false })
    .fill("Test Organization");
  await page
    .getByLabel("Service of interest", { exact: false })
    .fill("General enquiry");
  await page
    .getByLabel("Message", { exact: false })
    .fill("A synthetic website test enquiry.");
}
test("form validates locally and prevents duplicates while pending", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(
    page.getByText("Enter your name (2–100 characters)."),
  ).toBeVisible();
  await expect(page.getByLabel("Name", { exact: false })).toBeFocused();
  await fill(page);
  let requests = 0;
  await page.route("**/api/contact", async (route) => {
    requests++;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({
      json: { reference: "simulated", email: "accepted", sms: "disabled" },
    });
  });
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(
    page.getByRole("button", { name: "Sending enquiry" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Your enquiry notification was accepted", { exact: false }),
  ).toBeVisible();
  expect(requests).toBe(1);
});
test("API errors are safe and retries reuse the same reference", async ({
  page,
}) => {
  await page.goto("/contact");
  await fill(page);
  const keys: string[] = [];
  await page.route("**/api/contact", async (route) => {
    keys.push(route.request().headers()["idempotency-key"]);
    await route.fulfill({
      status: 503,
      json: { message: "SMTP secret MUST NOT appear" },
    });
  });
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(
      page.getByText("We could not confirm your enquiry notification.", {
        exact: false,
      }),
    ).toBeVisible();
  }
  expect(keys.length).toBe(2);
  expect(keys[0]).toBe(keys[1]);
  await expect(page.getByText("SMTP secret")).toHaveCount(0);
});
test("rate limits, malformed success and network errors do not claim delivery", async ({
  page,
}) => {
  await page.goto("/contact");
  await fill(page);
  await page.route("**/api/contact", (route) =>
    route.fulfill({ status: 429, json: {} }),
  );
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(
    page.getByText("Too many enquiries.", { exact: false }),
  ).toBeVisible();
  await page.unroute("**/api/contact");
  await page.route("**/api/contact", (route) => route.fulfill({ json: {} }));
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(
    page.getByText("We could not confirm your enquiry notification.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.unroute("**/api/contact");
  await page.route("**/api/contact", (route) => route.abort());
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(
    page.getByText("We could not confirm receipt.", { exact: false }),
  ).toBeVisible();
});
test("local images load, map contains approved address, no invented contact links", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("img")).toHaveCount(2);
  await page.locator("img").last().scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await page.goto("/contact");
  const directions = page.getByRole("link", { name: "Get directions" });
  expect(
    decodeURIComponent((await directions.getAttribute("href")) || ""),
  ).toContain("404, The Orion Business Park");
  await expect(page.locator("iframe")).toHaveAttribute("src", /output=embed/);
  await expect(
    page.locator('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]'),
  ).toHaveCount(0);
});
test("missing detail and unknown routes have honest fallback", async ({
  page,
}) => {
  for (const route of [
    "/insights/missing",
    "/case-studies/missing",
    "/services/missing",
    "/unknown",
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { name: "A different direction." }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL("/");
  }
});
test("capture desktop and mobile review images", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact");
  await page.screenshot({
    path: "test-results/contact-mobile.png",
    fullPage: true,
  });
});
