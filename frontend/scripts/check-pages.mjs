import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const base = "/mediastris-website/";
const root = path.resolve("dist");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const services = JSON.parse(fs.readFileSync("src/data/services.json", "utf8"));
const about = JSON.parse(fs.readFileSync("src/data/about.json", "utf8"));
const careers = JSON.parse(fs.readFileSync("src/data/careers.json", "utf8"));
const editorial = JSON.parse(fs.readFileSync("src/data/editorial.json", "utf8"));
const routes = [...new Set([
  "", "about", "services", "case-studies", "insights", "blogs", "contact",
  ...editorial.articles.map((article) => `insights/${article.slug}`),
  ...editorial.caseStudies.filter((item) => item.approved).map((item) => `case-studies/${item.slug}`),
  ...services.map((s) => `services/${s.slug}`),
  ...about.pages.map((p) => p.path.slice(1)),
  ...careers.pages.map((p) => p.path.slice(1)), "careers/apply",
])];
for (const route of routes) {
  const html = read(path.join(route, "index.html"));
  const assets = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
    .map((match) => match[1]).filter((url) => url.startsWith("/"));
  assert.ok(assets.length >= 3, `Missing script, stylesheet or favicon: ${route}`);
  for (const url of assets) {
    assert.ok(url.startsWith(base), `Unprefixed asset ${url} on ${route || "/"}`);
    assert.ok(fs.existsSync(path.join(root, url.slice(base.length))), `Missing ${url}`);
  }
  assert.match(html, /noindex, nofollow/, "Retain the draft indexing restriction");
}
assert.ok(read("404.html").includes('id="root"'), "404 fallback must boot React");
console.log(`PASS: ${routes.length} static routes, repository asset paths, noindex and 404 shell.`);

const browserOption = process.argv.find((arg) => arg.startsWith("--browser="));
if (browserOption) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };
  // Emulate Pages: no Vite history fallback, directory redirects, real 404 status.
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (!url.pathname.startsWith(base)) { res.writeHead(404).end(); return; }
    const file = path.resolve(root, decodeURIComponent(url.pathname.slice(base.length)) || ".");
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    let target = file;
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      if (!url.pathname.endsWith("/")) { res.writeHead(301, { Location: url.pathname + "/" + url.search }).end(); return; }
      target = path.join(target, "index.html");
    }
    const exists = fs.existsSync(target) && fs.statSync(target).isFile();
    if (!exists) target = path.join(root, "404.html");
    res.writeHead(exists ? 200 : 404, { "Content-Type": types[path.extname(target)] || "application/octet-stream" });
    fs.createReadStream(target).pipe(res);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { chromium } = await import("playwright");
  let browser;
  try {
    const channel = browserOption.split("=")[1];
    browser = await chromium.launch({ ...(channel === "chromium" ? {} : { channel }), headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const origin = `http://127.0.0.1:${server.address().port}`;
    for (const route of routes) {
      const response = await page.goto(origin + base + route, { waitUntil: "domcontentloaded" });
      assert.equal(response.status(), 200, `Direct visit: ${route}`);
      await page.locator("main h1").waitFor();
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("main h1").waitFor();
      await page.locator("img").evaluateAll((images) => Promise.all(images.map((img) => {
        img.loading = "eager";
        return img.decode().catch(() => {});
      })));
      const broken = await page.locator("img").evaluateAll((images) => images.filter((img) => !img.naturalWidth).map((img) => img.src));
      assert.deepEqual(broken, [], `Broken images: ${route}`);
      const badLinks = await page.locator('a[href^="/"], image[href^="/"]').evaluateAll((links) => links.map((el) => el.getAttribute("href")).filter((href) => !href.startsWith("/mediastris-website/")));
      assert.deepEqual(badLinks, [], `Unprefixed navigation/logo: ${route}`);
    }
    await page.goto(origin + base);
    assert.equal(await page.locator("#reviews").count(), 0, "Hide sample testimonials");
    await page.getByRole("link", { name: "Start a conversation", exact: true }).first().click();
    await page.waitForURL("**/contact");
    assert.equal(await page.getByRole("button", { name: "Send enquiry" }).isDisabled(), true);
    await page.getByText("Enquiries are unavailable in this preview.", { exact: false }).waitFor();
    await page.goto(origin + base + "careers/openings/?source=client#openings");
    assert.equal(await page.locator(".job-selector button").count(), 0, "Hide sample jobs");
    const notFound = await page.goto(origin + base + "missing-page?source=client#details");
    assert.equal(notFound.status(), 404);
    await page.locator("main h1").waitFor();
    assert.equal(await page.title(), "Page not found | Mediastris Healthcare LLP");
    assert.deepEqual(errors, []);
    console.log(`PASS: browser direct visits and refreshes for ${routes.length} routes; images, links, navigation, draft safeguards, unavailable form and real 404.`);
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
}
