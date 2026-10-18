import fs from "node:fs";
import path from "node:path";
const services = JSON.parse(fs.readFileSync("src/data/services.json", "utf8"));
const about = JSON.parse(fs.readFileSync("src/data/about.json", "utf8"));
const careers = JSON.parse(fs.readFileSync("src/data/careers.json", "utf8"));
const editorial = JSON.parse(fs.readFileSync("src/data/editorial.json", "utf8"));
// Static route documents let crawlers read metadata without running React.
const routes = [
  [
    "",
    "Home",
    "Discover Mediastris Healthcare LLP. Company information, services, insights and enquiries.",
  ],
  ["about", about.pages[0].title, about.pages[0].description],
  [
    "services",
    "Services",
    "Explore eight provisional Mediastris Healthcare LLP service areas. Draft content pending client verification.",
  ],
  [
    "case-studies",
    "Case studies",
    "Approved project stories, challenges, solutions and outcomes.",
  ],
  [
    "insights",
    "Insights",
    "Healthcare perspectives and company updates from Mediastris Healthcare LLP.",
  ],
  [
    "careers",
    "Careers",
    "Current approved opportunities at Mediastris Healthcare LLP.",
  ],
  [
    "contact",
    "Contact us",
    "Contact Mediastris Healthcare LLP in Borivali West, Mumbai. Send an enquiry or find directions.",
  ],
];
routes.push(
  ...services.map((service) => [
    `services/${service.slug}`,
    service.title,
    service.shortDescription,
  ]),
);
routes.push(
  ...about.pages.map((page) => [
    page.path.slice(1),
    page.title,
    page.description,
  ]),
);
routes.push(
  ...careers.pages.map((page) => [
    page.path.slice(1),
    page.title,
    page.description,
  ]),
  [
    "careers/apply",
    "Your Application",
    "Apply for a verified Mediastris Healthcare LLP vacancy when applications are open.",
  ],
);
routes.push(
  ["blogs", "Insights", "Draft healthcare perspectives for client review."],
  ...editorial.articles.map((article) => [`insights/${article.slug}`, article.title, article.summary]),
  ...editorial.caseStudies.filter((item) => item.approved).map((item) => [`case-studies/${item.slug}`, item.title, item.summary]),
);
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const template = fs.readFileSync("dist/index.html", "utf8");
for (const [route, title, description] of routes) {
  const html = template
    .replace(
      /<title>.*?<\/title>/,
      `<title>${escape(title)} | Mediastris Healthcare LLP</title>`,
    )
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escape(description)}"/>`,
    )
    .replace(
      "</head>",
      `<meta property="og:title" content="${escape(title)} | Mediastris Healthcare LLP"/><meta property="og:description" content="${escape(description)}"/></head>`,
    );
  const directory = path.join("dist", route);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.html"), html);
  // Vite preview resolves clean URLs via .html files; directory indexes support
  // conventional static hosts. Both copies use the same catalogue metadata.
  if (route) fs.writeFileSync(path.join("dist", `${route}.html`), html);
}
// GitHub Pages serves this document for unmatched paths. BrowserRouter reads the
// original URL and renders the matching route or the existing not-found view.
// The host's HTTP 404 status is retained; known routes above receive HTTP 200.
fs.copyFileSync("dist/index.html", "dist/404.html");
fs.writeFileSync("dist/.nojekyll", "");
