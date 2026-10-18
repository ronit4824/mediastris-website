# GitHub Pages preparation

User requirements: preserve React/Spring Boot sources and draft-content safeguards;
publish only the frontend under `/mediastris-website/`; prepare and verify now.
Repository visibility confirmed public. Owner and authenticated access are pending.

1. Add a production artifact check that fails for incorrect base paths, missing
   static route documents or missing 404 fallback. Include an optional browser
   check using a strict static server to exercise direct visits and refreshes.
2. Configure production Vite base, BrowserRouter basename and public asset URLs.
   Preserve root-based local development and allow other hosting with a base override.
   Retain static metadata routes; copy the app shell to `404.html` for unmatched
   SPA paths. A fallback document cannot change GitHub Pages' HTTP 404 status.
3. Add optional public backend URL configuration and clear unavailable-form states
   for Pages builds without a backend. Preserve local `/api` proxy behavior.
4. Add the build/check/deploy workflow, ignore credentials and generated artifacts,
   scan staged source for secrets without printing secret values, and document
   publication commands, backend dependencies and verification limits.
5. Run production build, artifact/browser checks and relevant regression checks;
   review changes, then commit locally. Confirm owner/repository/visibility before
   any push. Deploy and verify only when authenticated access is available.

Verification focus: nested-route refresh; root-relative images/fonts/logo;
unknown-route 404; sample jobs/reviews/project claims hidden in production;
disabled submissions without a backend; local development preserved.
