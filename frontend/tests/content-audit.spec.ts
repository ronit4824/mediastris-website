import { test, expect } from '@playwright/test';
test('home and contact show complete useful copy without unfinished client markers', async ({ page }) => {
  for (const route of ['/', '/contact']) {
    await page.goto(route);
    await expect(page.locator('main')).not.toContainText('[CLIENT CONTENT REQUIRED]');
    await expect(page.locator('main')).not.toContainText('Lorem ipsum');
  }
});
test('preview project stories have no invented outcomes and articles have no invented staff attribution', async ({ page }) => {
  await page.goto('/case-studies/nabh-accreditation-readiness');
  await expect(page.locator('main')).toContainText('Illustrative scenario');
  await expect(page.locator('main')).not.toContainText('68%');
  await expect(page.locator('main')).not.toContainText('Achieved');
  await page.goto('/insights/navigating-nabh-digital-standards-2026');
  await expect(page.locator('main')).toContainText('Draft article');
  await expect(page.locator('main')).not.toContainText('Mediastris Advisory Team');
  await expect(page.locator('main')).not.toContainText('latest digital standards');
});
