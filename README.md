# Mediastris Healthcare LLP

GitHub publication: see [GitHub Pages setup, commands, verification and backend limitations](docs/GITHUB_PAGES.md).
Production frontend builds default to `/mediastris-website/`; local development
continues at `/`. GitHub Pages hosts the frontend only; Spring Boot requires
separate hosting. Draft content restrictions remain enabled.

Homepage reviews: see [setup, demo controls and Google integration](docs/REVIEWS.md). Sample reviews are visible locally at `http://localhost:5173/#reviews` and hidden in default production builds. The new `GET /api/reviews` supports DEMO and configurable GOOGLE modes; client credentials remain deferred.

React 19 + TypeScript + Vite frontend, React Router, Spring Boot 3.5 + Java 21 backend. No database. Corporate pages, eight provisional service detail pages and a four-page About experience, reusable UI, centralized content, SMTP notifications and replaceable optional SMS integration.

## Run

Prerequisites: Node 22.12+ (tested 22.23.3), Java 21 and Maven 3.9+. Development tooling downloaded for this session is ignored in `.tools/`; install normal supported runtimes on your own machine or use `scripts/dev.ps1` in this workspace.

Frontend, terminal 1:

```powershell
cd frontend
npm ci
npm run dev
```

Backend, terminal 2:

```powershell
cd backend
mvn spring-boot:run
```

Open http://localhost:5173. Vite proxies `/api` to localhost:8080. Without SMTP configuration, submission correctly returns 503; it does not pretend to store or deliver enquiries.

## Build and test

```powershell
cd frontend
npm ci
npm run build
npm test
npm run test:preview
# Tests use installed Microsoft Edge. To use Playwright Chromium instead,
# remove channel: 'msedge' from playwright.config.ts, then npx playwright install chromium.
```

```powershell
cd backend
mvn verify
java -jar target/mediastris-api-1.0.0.jar
```

Browser tests cover 49 original route/viewport combinations, 40 service-detail combinations and 20 About combinations, automated axe checks across original/Services/About pages and expanded navigation, service card links, direct/refresh routes, navigation, mobile accordion/Escape, keyboard entry, field errors, pending state, API/network failures, retries, images, maps configuration and fallbacks. `test:preview` additionally checks eight production service URLs, four About URLs and the legacy About URL for HTTP status and static metadata on port 4173; keep that port free while running it. Backend tests use test doubles, never real recipients. See `docs/TESTING.md` for executed results and limits.

## Configuration

Copy the relevant frontend entries from `.env.example` into `frontend/.env.local`. Only approved **public** contact values belong in Vite variables. Export backend variables to the Java process using your hosting provider's secret manager or shell environment. Spring Boot does **not** load the root `.env` automatically.

| Variables | Purpose |
| --- | --- |
| `PORT` | Backend port; default 8080 |
| `CORS_ORIGINS` | Comma-separated exact frontend origins; default http://localhost:5173; wildcards excluded |
| `SMTP_HOST`, `SMTP_PORT` | SMTP host and port (587 default) |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | Server-only SMTP credentials |
| `SMTP_AUTH`, `SMTP_STARTTLS`, `SMTP_SSL` | Defaults true, true, false; port 465 usually requires SSL=true and STARTTLS=false |
| `CONTACT_FROM`, `CONTACT_TO` | Authorized sender and destination company mailbox; required for notification |
| `SMS_ENABLED` | false by default |
| `SMS_ACCOUNT_SID`, `SMS_AUTH_TOKEN` | Twilio credentials |
| `SMS_FROM`, `SMS_TO` | Approved provider sender/number and internal notification recipient (E.164 for phone numbers) |
| `VITE_CONTACT_PHONE`, `VITE_CONTACT_EMAIL` | Approved public click-to-call/mail links; hidden until configured |
| `VITE_WHATSAPP_NUMBER` | Approved full international digits, no `+`; activates wa.me link |
| `VITE_SITE_URL` | Real HTTPS public origin for client-side canonical and Open Graph URL |

Never place SMTP/SMS secrets in any `VITE_` variable. Changes to frontend variables require rebuild. Social links are intentionally absent because no approved profiles were supplied.

## Contact API

`POST /api/contact`, `Content-Type: application/json`, `Idempotency-Key: <UUID>`.

```json
{
  "name": "Test Person",
  "email": "person@example.test",
  "phone": "+91 98765 43210",
  "company": "Test Organization",
  "service": "General enquiry",
  "message": "A synthetic example enquiry."
}
```

All fields required, matching the updated BMR. `service` is free text until an approved service catalogue exists; approved services populate input suggestions. Validation has length/format limits. Email sends plain text with all fields, a reference and UTC timestamp. The sender is configured; the visitor email is Reply-To, never From.

200: `{ "reference": "...", "email": "accepted", "sms": "disabled|unconfigured|accepted|failed" }`. “Accepted” means SMTP/provider acceptance, **not confirmed inbox/handset delivery**. No delivery callbacks or database are present. SMTP failure/unconfigured returns 503, never success. Optional SMS failure preserves accepted email and returns its actual status. Errors contain safe code/message/fields; 400 validation/JSON/reference, 409 duplicate in progress or mismatched key, 413 body limit, 415 media type, 429 rate limit, 500 unexpected failure.

Retry the identical enquiry with the same key. Completed responses are replayed for one hour in memory (maximum 5,000 references); simultaneous duplicates return 409. SMTP failures remove the reservation to allow retry. SMTP can accept a message and then lose the acknowledgment: without persistent queues/provider idempotency, a retry can still produce a duplicate. Memory resets on restart and does not coordinate multiple instances.

Basic abuse protection: 8 attempts per remote address per 10 minutes, 300 global attempts per 10 minutes, bounded maps, 24 KB body limit including chunked requests, restricted CORS, no raw provider errors or enquiry body in application logs. Behind a reverse proxy the app sees the proxy IP; apply per-client limiting at the trusted edge. Do not blindly trust visitor X-Forwarded-For. Run a single API instance for current in-memory replay semantics.

## SMS setup

`SmsService` is the provider boundary. The supplied `TwilioSmsService` uses a fixed HTTPS endpoint, Basic auth, bounded connect/request timeouts, disabled/unconfigured modes, response checks and no automatic retries. Only a reference is included in the internal notification; visitor details stay in the email. Replace this bean with the client's approved provider implementation when selected.

Before enabling India domestic SMS, obtain the provider account, approved sender ID, principal entity registration, approved content template and variable mapping required for the selected DLT route. Confirm sender registration and notification template with the provider; the current generic Twilio adapter does not submit DLT entity/template identifiers. Adapt to the chosen gateway if it requires these fields and match the approved template exactly. Do not enable a domestic route until onboarding is complete. Twilio distinguishes domestic and international routes; see [India SMS guidelines](https://www.twilio.com/en-us/guidelines/in/sms) and [Messages API](https://www.twilio.com/docs/messaging/api/message-resource). No SMS has been sent or real delivery verified in this session.

## Content and images

`frontend/src/content.ts` is the content/config entry. The eight provisional services supplied in the follow-up request live in **`frontend/src/data/services.json`**, typed by `services.ts` and re-exported through `content.services`. Each entry contains ID, slug, title, icon, image/position, short description, overview, detail, proposed coverage, discussion prompt, assistance placeholder and draft status. Cards, menu links, detail pages, contact suggestions and build-time service metadata all consume this inventory. There are no duplicate services.

Populate case studies (challenge/solution/outcome), articles (author/date/paragraphs) and vacancies in `content.ts` with approved content. No invented articles, statistics, testimonials, personnel or medical claims. The Services names are provisional; original draft descriptions are visibly labeled for client review. The Mediastris assistance sections remain `[CLIENT CONTENT REQUIRED]` until actual capabilities and service boundaries are supplied. Mission, vision, values and company copy also remain placeholders; the team section is omitted pending content.

Service routes: `/services/statutory-regulatory-compliance`, `/services/insurance-tpa-onboarding`, `/services/hospital-infrastructure`, `/services/healthcare-branding`, `/services/insurance-recovery`, `/services/nabh-accreditation`, `/services/organ-transplant-approval`, `/services/digital-marketing`. The responsive catalogue shows all eight on Home and Services. The desktop Services disclosure opens on mouse hover or button activation, supports ArrowDown and Escape, and uses normal navigation link/Tab semantics. On mobile it becomes an accordion inside the existing hamburger navigation.

### About content and leadership

About routes: `/about-us`, `/about-us/vision`, `/about-us/management`, `/about-us/ceo-message`. The existing `/about` route still renders the About overview. Canonical menu/footer links use `/about-us`.

**`frontend/src/data/about.json`** owns page labels/metadata, company introduction/story, image references, values, vision, optional mission, leadership introduction/member collection and CEO message/name/designation/portrait. It is typed in `about.ts`; the legacy `content.ts` company fields read from the same source. Populate only approved client content. Text paragraphs render as plain text, not injected HTML.

The overview currently displays four numbered value placeholders. Vision has a marked placeholder; Mission is omitted until its paragraphs exist. Management uses an awaiting-content state until real members are supplied. Member records support approved name/designation/biography/photo and an optional featured layout. The CEO area uses an original SVG portrait placeholder; no person's photo or identity is fabricated. Replace `ceo.portrait` with an approved `{src,alt,position}` object and supply approved message paragraphs before publishing a personal message.

`NavigationDisclosure.tsx` shares the desktop hover/click, keyboard, Escape, outside-click and breakpoint behavior between About and Services. Header allows only one dropdown open, closes both on navigation and resets accordions when the mobile menu closes. No extra navigation library.

Temporary text branding, licensed local stock images and a self-hosted font are documented in `docs/ASSETS.md`. Images visibly say they are illustrative, not Mediastris people or premises. Draft editorial headings require client review. See `docs/SCOPE.md` for document differences.

The map uses the exact supplied address as a Google Maps search plus an address-based directions URL. No invented coordinates or API key. The exact building pin is not independently verified. External map availability depends on Google/network restrictions.

## Deployment

1. Obtain approved content/branding/contact details, domain, Java/static hosting, SMTP credentials and optional SMS account onboarding. Replace placeholders and review map pin, privacy wording and editorial copy with the client.
2. Export backend secrets on the server. Build with `mvn verify`, run the executable JAR behind TLS and a reverse proxy. Restrict direct access to port 8080. Configure exact CORS origins if the frontend is hosted separately.
3. Build frontend with `npm ci && npm run build`. Serve `frontend/dist` and proxy `/api/` to Spring Boot on the same origin; `deploy/nginx.conf` is an include snippet. Configure the real domain and TLS in its enclosing server block. Test this configuration on the chosen host (not executed here).
4. The metadata build produces HTML title/description/Open Graph tags for the main routes, all eight service detail routes and four About routes from the shared data sources, including the legacy `/about` alias. Content is rendered by React; case-study/article detail metadata remains client-side only. Keep SPA fallback for direct detail links. Unknown SPA URLs show the 404 view but can have HTTP 200; configure host-side 404 routing if required.
5. This draft deliberately uses noindex metadata and robots Disallow. After approval, change the robots meta, allow crawling, add the real domain's sitemap/canonical URLs and Open Graph image, then rebuild. Do not index client-content placeholders.
6. Verify live SMTP acceptance **and actual inbox receipt**, SMS status/handset receipt if enabled, Maps pin, TLS, edge rate limits, form behavior, mobile devices and social previews before launch. Configure SPF/DKIM/DMARC with the mailbox provider. No deployment was attempted without hosting details.

No database, durable queue, dashboard, CMS or automated retry workers. Careers accepts validated resume attachments for email only; files are not stored publicly. Post-restart duplicate prevention, multi-instance shared limiting and real delivery tracking are not included. Review additional needs before scaling.

Careers routes include `/careers`, `/careers/why-mediastris`, `/careers/learning-growth`, `/careers/openings` and `/careers/apply`. `frontend/src/data/careers.json` now owns vacancies. Six labelled sample roles appear in local development only; preview applications never send or store data. Move client-approved roles into `jobs` with `approved: true`, then rebuild both applications: the backend packages the same catalogue and rejects sample IDs. General applications remain disabled. `POST /api/careers/apply` accepts validated multipart details and PDF/DOC/DOCX resumes up to 5 MiB (6 MiB total request); configure `CAREERS_RECEIVER_EMAIL` with the existing SMTP settings to send. SMTP failure returns 503, never success. Container/content checks are not a full malware scanner. Limits: 5 attempts/client/hour, 60 global/hour, 4 concurrent requests and one-hour in-memory duplicate replay. No careers SMS is sent.

The API binds to loopback by default (`BIND_ADDRESS=127.0.0.1`) and trusts forwarded addresses only from loopback proxies. The nginx snippet overwrites visitor-supplied `X-Forwarded-For` and disables disk request buffering for careers uploads. Keep port 8080 private and review these settings for a different proxy topology. This supersedes the earlier generic proxy-IP note.
