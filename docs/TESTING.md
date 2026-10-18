# Verification results

## Careers and reviews — 18 October 2026

- `mvn verify`: PASS, 52 tests, zero failures/errors, executable JAR packaged. Includes 45 contact/careers tests plus seven review API/provider tests. SMTP and Google provider tests use doubles; no real delivery or live Google credentials verified.
- Careers regression: 31 browser groups passed before reviews. Six local sample jobs support filtering and local form previews; production hides unapproved roles. Native HTTP tests verify upload limits, trusted proxy addressing and decoded/matrix-path abuse protection.
- Reviews browser checks cover four labelled samples, direct placement before the homepage footer, seven required widths without overflow, accessibility, Google author/provider attribution and safe empty/error states. The loading timeout clears after successful results; a virtual-clock regression checks the state after 13 seconds.
- Credentials remain deferred to the client. Production demonstration visibility and complete frontend regression are checked by the current build/test commands; live nginx and client integrations require host-side verification.
- Final frontend regression: **35 browser groups passed**, zero failures (1.3 minutes). Production build/metadata checks passed and explicitly verified that both development sample vacancies and demonstration reviews are hidden. The packaged backend and Vite proxy both returned four explicitly marked DEMO reviews in a local HTTP smoke check.

## About upgrade — 18 October 2026

- `npm run test:preview`: PASS. Production build and HTTP/static title checks for all eight service URLs, four About URLs and legacy `/about`.
- `npm test`: PASS, **24 test groups**, zero failures; complete run 56.6 seconds using headless Microsoft Edge. Existing Services/contact checks remain included.
- All four new routes tested directly and after refresh; legacy `/about` remains available. Dropdown links, current-page styling, hover, keyboard ArrowDown, focus restoration, Escape, outside clicks and mutually exclusive About/Services panels pass.
- Mobile About accordion opens/closes, Escape stays local to the submenu, navigation closes the hamburger menu and closing/reopening the hamburger resets submenu state.
- All four About pages checked at 320, 375, 768, 1024 and 1440 px: no horizontal overflow (20 combinations). Local About and Vision images load. Existing 49 base-page and 40 service-page combinations still pass.
- Automated axe WCAG checks pass on all About pages and open desktop/mobile About navigation with reduced motion; existing base and service accessibility checks also pass.
- Content checks confirm four marked value placeholders, missing Vision placeholder, no unapproved Mission section, no fabricated team cards/photos and an explicit CEO portrait/message placeholder.
- Desktop About, Vision, Management, CEO and dropdown captures plus mobile CEO reviewed visually; images retained under `docs/preview/about-*.png`.
- No backend/contact workflow changes. Historical backend results below were not rerun for this frontend upgrade. Browser enquiry tests simulate external responses; real credentials are still deferred to the client.

Implementation reused existing licensed images and added no runtime dependency. Current production bundle approximately 317 KB JS (97 KB gzip) and 36 KB CSS (8.1 KB gzip). A transient Vite cached empty module during file replacement was diagnosed from browser console and served-module inspection; it was invalidated, then the complete suite rerun successfully.

## Services upgrade — 18 October 2026

Fresh verification after the Services upgrade:

- `npm run build`: PASS. TypeScript, Vite production bundle, seven main metadata documents and eight service detail metadata documents. Current JavaScript is approximately 305 KB (95 KB gzip), CSS 26 KB (6.3 KB gzip); no new runtime dependency added.
- `npm test`: PASS, **17 test groups**, zero failures, final complete run 43.1 seconds using headless Edge.
- All eight homepage cards navigate to the correct detail page. All eight detail pages load directly and after refresh; local background images load and titles, overview, proposed scope, assistance placeholder and enquiry CTA render.
- Desktop mega-menu: all eight links, active page, hover opening, button activation, ArrowDown focus entry, Escape/focus restoration, outside-click closure and panel placement above the hero pass.
- Mobile hamburger/Services accordion: expand, collapse with Escape, preserve parent navigation while collapsing the submenu, select a service and close navigation pass.
- Services card columns verified: one at 320/375, two at 768/1024, four at 1440. All eight detail pages checked for overflow at those five widths (40 combinations); the original seven-page checks still cover all seven requested widths (49 combinations).
- Automated axe WCAG checks pass for all seven original pages, all eight service pages, and the open desktop/mobile Services navigation. Checks wait for the finite menu transition to settle before evaluating contrast.
- Existing contact validation, pending state, duplicate protection, safe API error/retry behavior, missing-route handling, map configuration and local images remain covered by passing regression tests. Notification responses in browser tests are explicitly simulated.
- Built output check: eight unique service slugs, all eight static metadata documents and all referenced local image files verified on disk.
- `npm run test:preview`: PASS. Builds production output, starts a temporary Vite preview, checks HTTP 200 and matching static title metadata for all eight clean service URLs, then closes the temporary server. Metadata output includes both directory indexes and `.html` documents for static-host/Vite clean URL resolution.
- Focused independent code review found no important functional or accessibility issues in the Services changes.
- Desktop cards/menu/detail and mobile detail/navigation reviewed visually. Saved captures are in `docs/preview/services-*.png` and `docs/preview/service-detail-*.png`.

The Spring Boot source and contact API workflow were not modified in this upgrade. Historical backend test results below belong to the original full-stack implementation; they were not rerun for this frontend-only change. Real email/SMS still await client credentials and are not required for visual review.

The new catalogue is provisional, with draft copy visibly marked. Exact client service boundaries, verified capabilities, assistance descriptions and final imagery remain pending. No screenshots were present in the request attachment; the written names and routes were used.

## Original full-stack verification

Completed across 17–18 October 2026 (Asia/Kolkata).

| Check | Result |
| --- | --- |
| `frontend: npm run build` | PASS. TypeScript compilation, Vite production bundle and static route metadata documents. |
| `frontend: npm test` | PASS, 9 Playwright test groups using installed headless Microsoft Edge; final run 16.2 seconds. |
| Responsive routes | PASS. All 7 pages at 320, 375, 390, 430, 768, 1024 and 1440 px; 49 combinations, no horizontal overflow. |
| Automated accessibility | PASS. axe WCAG 2 A/AA + 2.1 AA tags on all 7 pages. Detected contrast issues were fixed and checks rerun. |
| Navigation | PASS. Mobile menu, Escape/focus restoration, current route state, keyboard skip-link entry, missing content detail routes and unknown path fallback. |
| Form | PASS. Field errors/focus, pending/disabled state, one submission while pending, same-key retry, safe server/network/rate-limit feedback, malformed success cannot claim acceptance. |
| Assets and links | PASS. Both local images load; exact supplied address is encoded in directions link, map embed configuration present, no phone/email/WhatsApp links fabricated. |
| `backend: mvn -B verify` | PASS. Executable Spring Boot JAR built; 23 tests, zero failures/errors/skips. |
| API security tests | PASS. Validation, header injection, short phone, malformed JSON, missing idempotency header, allowed/rejected CORS origins, payload limit, rate limiting. |
| Notification tests | PASS with test doubles. SMTP message contains all fields/timestamp; SMTP failure is safe/non-success; SMS disabled/unconfigured/accepted/rejected/malformed/network-failure paths; concurrent/replayed requests avoid duplicate processing. |
| Packaged API smoke test | PASS. Java JAR starts on 8080. Request through real Vite proxy returns 503 `EMAIL_UNAVAILABLE` when SMTP is absent; invalid payload directly returns structured 400. |
| Metadata | PASS. Build emits 7 distinct title/description/OG route documents. Preview is deliberately noindex. |

Production bundle: approximately 285 KB JavaScript (89 KB gzip), 14 KB CSS (4 KB gzip), 25 KB self-hosted Latin font, 270 KB combined stock images. No external font request.

Review captures: `docs/preview/home-desktop.png`, `docs/preview/contact-mobile.png`. Visual desktop and mobile review performed. Full-page screenshots can show the lazy-loaded map before the iframe has loaded.

## Limits

- No real email or SMS was sent. Tests use synthetic `.test` addresses and test doubles. Client will supply credentials later; this is intentionally not a blocker to design review.
- Exact Google Maps building pin and directions arrival have not been independently confirmed. Maps availability depends on the external service; only the address/URL integration is asserted.
- Browser execution used Edge on this Windows host. Safari, Firefox, physical-device behavior and manual screen-reader testing have not been verified. Automated accessibility checks are not a complete accessibility audit.
- Initial `npm audit --omit=dev` could not complete: registry quick-audit endpoint returned 400 and a retirement notice. No clean dependency-security audit is claimed.
- Nginx/TLS/hosting deployment has not been executed. No approved domain or hosting access was supplied. Preview servers are local only.
- One intermediate backend packaging run encountered Windows locking the running JAR. Stopped that process, rebuilt successfully, then restarted the resulting JAR; final verification passed.
- Git was not installed and the starting workspace was not a repository, so no Git diff/commit is claimed. Source files and lockfile are on disk.

## Review and restart

Current frontend preview: http://127.0.0.1:5173/. Current API: http://localhost:8080/api/contact (POST only).

When servers have stopped, run these from the repository root in separate PowerShell terminals using the portable tools retained for this session:

```powershell
.\scripts\dev.ps1 frontend
.\scripts\dev.ps1 backend
```

The scripts also work with normal installed tools when the optional local portable runtimes are absent. Set your session execution policy as appropriate to your own machine if PowerShell blocks scripts; normal npm/Maven commands are listed in README.md.
