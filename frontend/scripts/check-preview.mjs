import assert from "node:assert/strict";
import fs from "node:fs";
import { preview } from "vite";
import { chromium } from "@playwright/test";

const services = JSON.parse(fs.readFileSync("src/data/services.json", "utf8"));
const about = JSON.parse(fs.readFileSync("src/data/about.json", "utf8"));
const careers = JSON.parse(fs.readFileSync("src/data/careers.json", "utf8"));
const pages = [
  ...services.map((service) => ({
    path: `/services/${service.slug}`,
    title: service.title,
  })),
  ...about.pages.map((page) => ({ path: page.path, title: page.title })),
  { path: "/about", title: "About us" },
  ...careers.pages.map((page) => ({ path: page.path, title: page.title })),
  { path: "/careers/apply", title: "Your Application" },
];
const server = await preview({
  preview: { host: "127.0.0.1", port: Number(process.env.PREVIEW_PORT || 4173), strictPort: true },
});
const previewUrl = (route) => `http://127.0.0.1:${server.config.preview.port}${server.config.base}${route.replace(/^\//, "")}`;
try {
  for (const page of pages) {
    const response = await fetch(previewUrl(page.path));
    assert.equal(response.status, 200, page.path);
    const html = await response.text();
    assert.ok(
      html.includes(
        `<title>${page.title.replaceAll("&", "&amp;")} | Mediastris Healthcare LLP</title>`,
      ),
      `Static metadata for ${page.path}`,
    );
  }
  console.log(
    "PASS: Service, About and Careers URLs return HTTP 200 with matching static metadata.",
  );
  if (!careers.jobs.some((job) => job.approved)) {
    const browser = await chromium.launch({
      channel: "msedge",
      headless: true,
    });
    try {
      const page = await browser.newPage();
      await page.goto(previewUrl("/careers/openings"));
      await page
        .getByText(
          "We currently don't have any open positions. Please check back for future opportunities.",
          { exact: true },
        )
        .waitFor();
      assert.equal(await page.locator(".job-selector button").count(), 0);
      assert.equal(
        await page
          .getByText("Preview roles · Not confirmed vacancies", { exact: true })
          .count(),
        0,
      );
      console.log("PASS: production hides all development sample roles.");
      await page.goto(previewUrl("/"));
      await page.locator("h1").waitFor();
      assert.equal(await page.locator("#reviews").count(), 0);
      console.log("PASS: default production build hides demonstration reviews.");
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise((resolve) => server.httpServer.close(resolve));
}
