import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  ["/about-us", "About Us", "About us"],
  ["/about-us/vision", "Vision", "Our Vision"],
  ["/about-us/management", "Management Team", "Our Leadership"],
  ["/about-us/ceo-message", "CEO Speaks", "Message from Our Leadership"],
] as const;

test("four About pages load directly and on refresh, while legacy About remains available", async ({
  page,
}) => {
  for (const [url, , heading] of pages) {
    await page.goto(url);
    await page.reload();
    await expect(
      page.getByRole("heading", { level: 1, name: heading, exact: true }),
    ).toBeVisible();
    await expect(page).toHaveTitle(/Mediastris Healthcare LLP/);
  }
  await page.goto("/about");
  await expect(
    page.getByRole("heading", { level: 1, name: "About us", exact: true }),
  ).toBeVisible();
});

test("About dropdown supports all links, active page, keyboard, Escape and mutual exclusion with Services", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Explore about us",
    exact: true,
  });
  const panel = page.getByRole("region", {
    name: "About us navigation",
    exact: true,
  });
  await trigger.hover();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(panel.getByRole("link")).toHaveCount(4);
  for (const [url, label] of pages) {
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(panel.getByRole("link").first()).toBeFocused();
    await panel.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(url);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(
      panel.getByRole("link", { name: label, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  }
  await page.keyboard.press("ArrowDown");
  await page
    .getByRole("button", { name: "Explore services", exact: true })
    .hover();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("button", { name: "Explore services", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await trigger.hover();
  await expect(panel).toHaveCSS("opacity", "1");
  await expect(
    page.getByRole("button", { name: "Explore services", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  const bounds = await panel.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1440);
  await page.mouse.click(15, 650);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("mobile About accordion keeps Escape local, closes on navigation and resets when hamburger closes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  const trigger = page.getByRole("button", {
    name: "Explore about us",
    exact: true,
  });
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("button", { name: "Close" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await trigger.click();
  await page
    .getByRole("region", { name: "About us navigation", exact: true })
    .getByRole("link", { name: "Vision", exact: true })
    .click();
  await expect(page).toHaveURL("/about-us/vision");
  await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await page.getByRole("button", { name: "Menu" }).click();
  await trigger.click();
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("draft About copy is substantive and leadership facts remain unassigned", async ({
  page,
}) => {
  await page.goto("/about-us");
  await expect(page.locator(".about-value-block")).toHaveCount(4);
  for (const title of ["Integrity", "Collaboration", "Accountability", "Continuous Improvement"]) {
    await expect(page.locator(".about-values").getByRole("heading", { name: title, exact: true })).toBeVisible();
  }
  await expect(page.locator(".about-values")).toContainText("Sample values for website preview. Final wording is subject to client approval.");
  await expect(page.locator(".about-introduction .about-paragraphs p")).toHaveCount(2);
  await expect(page.locator(".about-story .about-paragraphs p")).toHaveCount(2);
  await expect(page.locator(".about-draft-note")).toHaveCount(0);
  await expect(page.locator(".about-introduction")).toContainText("healthcare organizations in India");
  await expect(page.locator(".about-introduction")).toContainText("organ transplant approval assistance");
  await page.goto("/about-us/vision");
  await expect(page.locator(".vision-content .about-paragraphs")).toContainText("healthcare landscape in India");
  await expect(page.locator(".about-draft-note")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Our Mission", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".about-mission .about-paragraphs p")).toHaveCount(2);
  await page.goto("/about-us/management");
  await expect(
    page.getByRole("heading", {
      name: "Leadership profiles are being prepared.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".leadership-member")).toHaveCount(0);
  await expect(page.locator("main img")).toHaveCount(0);
  await expect(page.locator(".leadership-section-heading .about-paragraphs")).toContainText("Individual experience and responsibilities");
  await expect(page.locator(".leadership-awaiting").getByRole("link", { name: "Contact us", exact: true })).toHaveAttribute("href", "/contact");
  await page.goto("/about-us/ceo-message");
  await expect(page.locator(".leadership-portrait, .portrait-pending, .leadership-signature")).toHaveCount(0);
  await expect(page.locator(".leadership-message img")).toHaveCount(0);
  await expect(page.locator(".leadership-message-content .about-paragraphs p")).toHaveCount(3);
  await expect(page.locator(".leadership-message-note")).toContainText("not a quotation or an attributed statement from a CEO");
  for (const [url] of pages) {
    await page.goto(url);
    await expect(page.locator("main")).not.toContainText("[CLIENT CONTENT REQUIRED]");
    await expect(page.locator(".about-draft-note")).toHaveCount(0);
  }
});

test("About layouts fit five target widths and images load locally", async ({
  page,
}) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const [url, , heading] of pages) {
      await page.goto(url);
      await expect(
        page.getByRole("heading", { level: 1, name: heading, exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${url} at ${width}`,
      ).toBe(true);
    }
  }
  for (const url of ["/about-us", "/about-us/vision"]) {
    await page.goto(url);
    const images = page.locator("main img");
    await expect(images).toHaveCount(url==='/about-us'?2:1);
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
      expect(await img.getAttribute("src")).toMatch(/^\/images\//);
    }
  }
});

test("all About pages and expanded navigation pass automated accessibility checks with reduced motion", async ({
  page,
}) => {
  test.slow();
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [url] of pages) {
    await page.goto(url);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations, url).toEqual([]);
  }
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    if (width === 375) await page.getByRole("button", { name: "Menu" }).click();
    await page
      .getByRole("button", { name: "Explore about us", exact: true })
      .focus();
    await page.keyboard.press("ArrowDown");
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations, `About menu ${width}`).toEqual([]);
  }
});

test("capture About review images", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [url] of pages) {
    await page.goto(url);
    await expect(page.locator("h1")).toBeVisible();
    for(const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({
      path: `test-results/${url.replaceAll("/", "-").slice(1)}-desktop.png`,
      fullPage: true,
    });
  }
  await page
    .getByRole("button", { name: "Explore about us", exact: true })
    .hover();
  await expect(
    page.getByRole("region", { name: "About us navigation", exact: true }),
  ).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "test-results/about-navigation-desktop.png" });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/about-us/ceo-message");
  await expect(page.locator("h1")).toBeVisible();
  await page.screenshot({
    path: "test-results/about-ceo-mobile.png",
    fullPage: true,
  });
});
