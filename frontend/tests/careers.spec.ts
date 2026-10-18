import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const pages = [
  ["/careers", "Build Your Future With Mediastris"],
  ["/careers/why-mediastris", "Your Work. Your Growth. Your Impact."],
  ["/careers/learning-growth", "Learning & Growth"],
  ["/careers/openings", "Job Openings"],
  ["/careers/apply", "Your Application"],
] as const;
const empty =
  "We currently don't have any open positions. Please check back for future opportunities.";

test("Careers pages load directly and on refresh and approved openings remain empty", async ({
  page,
}) => {
  await emptyFixture(page);
  for (const [url, title] of pages) {
    await page.goto(url);
    await page.reload();
    await expect(
      page.getByRole("heading", { level: 1, name: title, exact: true }),
    ).toBeVisible();
  }
  await page.goto("/careers/openings");
  await expect(page.getByText(empty, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Apply Now", exact: true }),
  ).toHaveCount(0);
  await page.goto("/careers/apply");
  await expect(
    page.getByRole("heading", {
      name: "Applications are not open yet.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("input[type=file]")).toHaveCount(0);
});

test("unavailable application links lead to current openings without collecting details", async ({ page }) => {
  await fixture(page);
  await page.goto("/careers/apply?position=removed-role");
  await expect(page.getByRole("heading", { name: "This position is not accepting applications.", exact: true })).toBeVisible();
  await expect(page.locator(".careers-application-form")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "A clear application starts here.", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "View job openings", exact: false }).click();
  await expect(page).toHaveURL("/careers/openings");
});

test("all five Careers routes retain useful visible content in light and dark themes", async ({ page }) => {
  await emptyFixture(page);
  for (const theme of ["light", "dark"]) {
    await page.addInitScript((value) => localStorage.setItem("mediastris-theme", value), theme);
    for (const [url] of pages) {
      await page.goto(url);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      for (const section of await page.locator("main > section").all()) {
        await expect(section).toBeVisible();
        expect((await section.innerText()).trim().length, `${theme} ${url}`).toBeGreaterThan(80);
      }
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(result.violations, `${theme} ${url}`).toEqual([]);
    }
  }
});
test("Careers menu links, keyboard, mobile accordion and other dropdowns work", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Explore careers",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  const panel = page.getByRole("region", {
    name: "Careers navigation",
    exact: true,
  });
  await expect(panel.getByRole("link")).toHaveCount(3);
  await expect(panel.getByRole("link").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.hover();
  await page
    .getByRole("button", { name: "Explore services", exact: true })
    .hover();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  for (const [url, label] of [
    ["/careers/why-mediastris", "Why Mediastris"],
    ["/careers/learning-growth", "Learning & Growth"],
    ["/careers/openings", "Job Openings"],
  ]) {
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await panel.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(url);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await trigger.click();
  await panel.getByRole("link", { name: "Job Openings", exact: true }).click();
  await expect(page).toHaveURL("/careers/openings");
  await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
test("Careers pages fit requested widths and pass automated accessibility checks", async ({
  page,
}) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const [url, title] of pages) {
      await page.goto(url);
      await expect(
        page.getByRole("heading", { level: 1, name: title, exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        url + " " + width,
      ).toBe(true);
    }
  }
  for (const [url] of pages) {
    await page.goto(url);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations, url).toEqual([]);
  }
});
async function fixture(page: import("@playwright/test").Page) {
  await page.route("**/src/data/careers.json*", async (route) => {
    const fs = await import("node:fs");
    const data = JSON.parse(fs.readFileSync("src/data/careers.json", "utf8"));
    data.jobs = [
      {
        id: "synthetic-role",
        title: "Synthetic Test Role",
        approved: true,
        location: "Test Location",
        employmentType: "Test Type",
        experience: "Test experience",
        responsibilities: ["Synthetic responsibility"],
        qualifications: ["Synthetic qualification"],
      },
    ];
    await route.fulfill({
      contentType: "application/javascript",
      body: `export default ${JSON.stringify(data)};`,
    });
  });
}
async function emptyFixture(page: import("@playwright/test").Page) {
  await page.route("**/src/data/careers.json*", async (route) => {
    const fs = await import("node:fs");
    const data = JSON.parse(fs.readFileSync("src/data/careers.json", "utf8"));
    data.previewJobs = [];
    await route.fulfill({
      contentType: "application/javascript",
      body: "export default " + JSON.stringify(data) + ";",
    });
  });
}
async function fill(page: import("@playwright/test").Page) {
  for (const [label, value] of [
    ["Full Name", "Synthetic Applicant"],
    ["Email Address", "applicant@example.test"],
    ["Phone Number", "+91 98765 43210"],
    ["Current Location", "Test Location"],
    ["Total Experience", "2 years"],
    ["Notice Period", "30 days"],
  ])
    await page.getByLabel(label, { exact: false }).fill(value);
  await page.getByLabel("Resume Upload", { exact: false }).setInputFiles({
    name: "resume.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.7\nsynthetic-browser-fixture\n%%EOF"),
  });
}
test("synthetic approved job selects details, preselects application, validates and prevents duplicates", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/careers/openings");
  await page
    .getByRole("button", { name: "Synthetic Test Role", exact: false })
    .click();
  await expect(
    page.getByRole("heading", { name: "Synthetic Test Role", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Apply Now", exact: true }).click();
  await expect(
    page.getByLabel("Position Applied For", { exact: false }),
  ).toHaveValue("synthetic-role");
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(
    page.getByText("Enter your full name.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Full Name", { exact: false })).toBeFocused();
  await fill(page);
  let requests = 0;
  await page.route("**/api/careers/apply", async (route) => {
    requests++;
    expect(route.request().headers()["content-type"]).toContain(
      "multipart/form-data",
    );
    expect(route.request().postDataBuffer()?.toString()).toContain(
      "synthetic-role",
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({
      json: { email: "accepted", reference: "synthetic" },
    });
  });
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(
    page.getByRole("button", { name: "Submitting application" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Your application email was accepted", { exact: false }),
  ).toBeVisible();
  expect(requests).toBe(1);
});
test("application upload and API failures are safe and retries reuse reference", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/careers/apply?position=synthetic-role");
  await fill(page);
  await page.getByLabel("Resume Upload", { exact: false }).setInputFiles({
    name: "bad.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("MZunsafe"),
  });
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(
    page.getByText("Upload a PDF, DOC or DOCX file up to 5 MB.", {
      exact: true,
    }),
  ).toBeVisible();
  await fill(page);
  const keys: string[] = [];
  await page.route("**/api/careers/apply", async (route) => {
    keys.push(route.request().headers()["idempotency-key"]);
    await route.fulfill({
      status: 503,
      json: { message: "DO NOT EXPOSE secret" },
    });
  });
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(
      page.getByText("We could not confirm your application email.", {
        exact: false,
      }),
    ).toBeVisible();
  }
  expect(keys[0]).toBe(keys[1]);
  await expect(page.getByText("DO NOT EXPOSE")).toHaveCount(0);
});
test("capture Careers review layouts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [url] of pages) {
    await page.goto(url);
    await expect(page.locator("h1")).toBeVisible();
    for (const image of await page.locator("main img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate((el) => (el as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `test-results/${url.replaceAll("/", "-").slice(1)}-desktop.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await fixture(page);
  await page.goto("/careers/apply?position=synthetic-role");
  await expect(page.getByLabel("Full Name", { exact: false })).toBeVisible();
  await page.screenshot({
    path: "test-results/careers-application-mobile.png",
    fullPage: true,
  });
});
