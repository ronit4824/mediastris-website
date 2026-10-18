import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const inventory = [
  ["statutory-regulatory-compliance", "Statutory & Regulatory Compliance"],
  ["insurance-tpa-onboarding", "Insurance & TPA Onboarding"],
  ["hospital-infrastructure", "Hospital Infrastructure Solutions"],
  ["healthcare-branding", "Healthcare Branding Strategies"],
  ["insurance-recovery", "Insurance Recovery Management"],
  ["nabh-accreditation", "NABH Accreditation Guidance"],
  ["organ-transplant-approval", "Organ Transplant Approval Assistance"],
  ["digital-marketing", "Digital Marketing & Branding Solutions"],
] as const;

test("homepage exposes eight unique fully clickable service cards", async ({
  page,
}) => {
  await page.goto("/");
  const cards = page.locator(".services-section .service-card");
  await expect(cards).toHaveCount(8);
  for (const [slug, title] of inventory) {
    const card = page.getByRole("link", {
      name: `Explore ${title}`,
      exact: true,
    });
    await expect(card).toHaveAttribute("href", `/services/${slug}`);
    await card.click();
    await expect(
      page.getByRole("heading", { level: 1, name: title, exact: true }),
    ).toBeVisible();
    await page.goto("/");
  }
});

test("every service route loads directly, refreshes, and shows draft content and imagery", async ({
  page,
}) => {
  for (const [slug, title] of inventory) {
    await page.goto(`/services/${slug}`);
    await page.reload();
    await expect(
      page.getByRole("heading", { level: 1, name: title, exact: true }),
    ).toBeVisible();
    await expect(page).toHaveTitle(`${title} | Mediastris Healthcare LLP`);
    await expect(
      page
        .getByText("Draft content for client review", { exact: true })
        .first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Service overview", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "What this service could cover",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "How Mediastris can assist",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator(".service-hero img")).toBeVisible();
    await expect(page.locator(".service-overview .service-lead")).not.toBeEmpty();
    await expect(page.locator(".service-coverage-list li")).toHaveCount(4);
    for (const area of await page.locator(".service-coverage-list li").all()) {
      await expect(area.locator("h3")).not.toBeEmpty();
      await expect(area.locator("p")).not.toBeEmpty();
    }
    await expect(page.locator(".service-assistance-copy")).not.toContainText(
      "[CLIENT CONTENT REQUIRED]",
    );
    await expect(page.locator(".service-enquiry-note .button")).toHaveAttribute(
      "href",
      "/contact",
    );
    await expect
      .poll(() =>
        page
          .locator(".service-hero img")
          .evaluate((img) => (img as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    await expect(
      page
        .locator(".service-hero")
        .getByRole("link", { name: "Contact us", exact: true }),
    ).toHaveAttribute("href", "/contact");
    expect(
      await page
        .locator(".service-hero h1")
        .evaluate((el) => getComputedStyle(el).color),
    ).toBe("rgb(255, 255, 255)");
  }
});

test("desktop mega-menu supports hover, keyboard, Escape, outside clicks and every service link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Explore services",
    exact: true,
  });
  const panel = page.getByRole("region", {
    name: "Services navigation",
    exact: true,
  });
  await trigger.hover();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(panel.getByRole("link")).toHaveCount(9);
  for (const [slug, title] of inventory) {
    await trigger.click(); // A hover-open disclosure remains operable by click.
    if ((await trigger.getAttribute("aria-expanded")) !== "true")
      await trigger.click();
    await panel.getByRole("link", { name: title, exact: true }).click();
    await expect(page).toHaveURL(`/services/${slug}`);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(
      panel.getByRole("link", { name: title, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  }
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(panel.getByRole("link").first()).toBeFocused();
  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(1440);
  const over = await panel.evaluate((el) => {
    const b = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(b.x + 30, b.y + 30));
  });
  expect(over).toBe(true);
  // The open menu correctly overlays the hero heading; click the exposed page gutter.
  await page.mouse.click(15, 650);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("mobile Services accordion opens, navigates, closes and restores focus on Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  const trigger = page.getByRole("button", {
    name: "Explore services",
    exact: true,
  });
  await trigger.click();
  const panel = page.getByRole("region", {
    name: "Services navigation",
    exact: true,
  });
  await expect(panel.getByRole("link")).toHaveCount(9);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("button", { name: "Close" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await trigger.click();
  await panel.getByRole("link", { name: inventory[7][1], exact: true }).click();
  await expect(page).toHaveURL("/services/digital-marketing");
  await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("services layouts fit target widths and use 1, 2 and 4 card columns", async ({
  page,
}) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/services");
    const grid = page.locator(".services-catalogue");
    await expect(grid.locator(".service-card")).toHaveCount(8);
    expect(
      await grid.evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      ),
    ).toBe(width < 600 ? 1 : width < 1200 ? 2 : 4);
    for (const [slug] of inventory) {
      await page.goto(`/services/${slug}`);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${slug} at ${width}`,
      ).toBe(true);
    }
  }
});

test("service pages and expanded desktop and mobile navigation pass automated accessibility checks", async ({
  page,
}) => {
  for (const [slug] of inventory) {
    await page.goto(`/services/${slug}`);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations, slug).toEqual([]);
  }
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    if (width === 375) await page.getByRole("button", { name: "Menu" }).click();
    await page
      .getByRole("button", { name: "Explore services", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Services navigation", exact: true }),
    ).toHaveCSS("opacity", "1");
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations, `menu at ${width}`).toEqual([]);
  }
});

test("service suggestions use the same inventory without restricting free-text enquiries", async ({
  page,
}) => {
  await page.goto("/contact");
  await expect(page.locator("#service-options option")).toHaveCount(8);
  await page
    .getByLabel("Service of interest", { exact: false })
    .fill("Another requirement");
  await expect(
    page.getByLabel("Service of interest", { exact: false }),
  ).toHaveValue("Another requirement");
});

test("capture Services review layouts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page
    .locator(".services-section")
    .screenshot({ path: "test-results/services-cards-desktop.png" });
  await page.goto("/services/hospital-infrastructure");
  await expect(page.locator(".service-hero img")).toBeVisible();
  await page.screenshot({
    path: "test-results/service-detail-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Explore services", exact: true })
    .hover();
  await expect(
    page.getByRole("region", { name: "Services navigation", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Services navigation", exact: true }),
  ).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "test-results/services-mega-menu.png" });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/services/organ-transplant-approval");
  await page.screenshot({
    path: "test-results/service-detail-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Menu" }).click();
  await page
    .getByRole("button", { name: "Explore services", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Services navigation", exact: true }),
  ).toHaveCSS("opacity", "1");
  await page.screenshot({
    path: "test-results/services-mobile-navigation.png",
  });
});
