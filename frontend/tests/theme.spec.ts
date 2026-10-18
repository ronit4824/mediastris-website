import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("theme switcher toggles between dark and light, updates localStorage and persists on reload", async ({
  page,
}) => {
  await page.goto("/");

  // 1. Initial default state: dark theme
  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-theme", "dark");

  const toggle = page.getByRole("button", { name: "Switch to light theme" });
  await expect(toggle).toBeVisible();

  // 2. Switch to light theme
  await toggle.click();
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(
    page.getByRole("button", { name: "Switch to dark theme" }),
  ).toBeVisible();

  const savedTheme = await page.evaluate(() =>
    localStorage.getItem("mediastris-theme"),
  );
  expect(savedTheme).toBe("light");

  // 3. Persistence on reload
  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(
    page.getByRole("button", { name: "Switch to dark theme" }),
  ).toBeVisible();

  // 4. Switch back to dark theme
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("button", { name: "Switch to light theme" }),
  ).toBeVisible();

  const updatedTheme = await page.evaluate(() =>
    localStorage.getItem("mediastris-theme"),
  );
  expect(updatedTheme).toBe("dark");
});

test("light theme passes automated WCAG accessibility checks and has no horizontal overflow", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  // Check automated accessibility in light mode
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(scan.violations, "Home light theme").toEqual([]);

  // Check no horizontal overflow at target widths
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    );
    expect(noOverflow, `Light theme overflow at ${width}`).toBe(true);
  }
});

test("capture light mode desktop and mobile screenshots", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/home-light-desktop.png",
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/home-light-mobile.png",
    fullPage: true,
  });
});

