import { test, expect } from "@playwright/test";
test("six development preview roles can be filtered, selected and previewed without sending an application", async ({
  page,
}) => {
  await page.goto("/careers/openings");
  await expect(
    page.getByText("Preview roles · Not confirmed vacancies", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".job-selector button")).toHaveCount(6);
  for (const title of [
    "Accountant",
    "PR Executive",
    "HR Executive",
    "Operations Coordinator",
    "Business Development Executive",
    "Digital Marketing Executive",
  ])
    await expect(
      page.getByRole("button", { name: title, exact: false }),
    ).toBeVisible();
  await page
    .getByRole("button", { name: "PR Executive", exact: false })
    .click();
  await expect(
    page.getByRole("heading", { name: "PR Executive", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Find a job title", { exact: true }).fill("HR");
  await expect(page.locator(".job-selector button")).toHaveCount(1);
  await page.getByLabel("Find a job title", { exact: true }).fill("");
  await page.getByRole("button", { name: "Accountant", exact: false }).click();
  await page
    .getByRole("link", { name: "Preview application", exact: true })
    .click();
  await expect(
    page.getByLabel("Position Applied For", { exact: false }),
  ).toHaveValue("preview-accountant");
  await expect(
    page.getByText(
      "Sample role — this preview does not send or store applications.",
      { exact: true },
    ),
  ).toBeVisible();
  let submissions = 0;
  await page.route("**/api/careers/apply", async (route) => {
    submissions++;
    await route.abort();
  });
  for (const [label, value] of [
    ["Full Name", "Sample Applicant"],
    ["Email Address", "sample@example.test"],
    ["Phone Number", "9876543210"],
    ["Current Location", "Sample location"],
    ["Total Experience", "2 years"],
    ["Notice Period", "30 days"],
  ])
    await page.getByLabel(label, { exact: false }).fill(value);
  await page.getByLabel("Resume Upload", { exact: false }).setInputFiles({
    name: "sample.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-sample"),
  });
  await page
    .getByRole("button", { name: "Preview application", exact: false })
    .click();
  await expect(
    page.getByText("Preview only — no application was sent or stored.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(submissions).toBe(0);
});
