# Homepage reviews

The homepage ends with a dedicated navy/charcoal section immediately before the existing footer. Four cards use blue/orange accents, stars, quotation marks and numbered avatars. The existing sage/teal website and temporary wordmark are preserved; no approved blue/orange logo or Pathway screenshot was available in this turn.

## Local preview

Run `.\scripts\dev.ps1 frontend` from the project root, then open `http://localhost:5173/#reviews`. `frontend/src/data/reviews.json` owns all four sample reviews. Names, dates, ratings and text are illustrative and each card displays **Sample Review — Preview**. No Google logo, attribution, links or verification claims appear on sample cards. No images or portrait licences are needed for the generated initials avatars.

`ReviewCard.tsx` renders one card. `ReviewsSection.tsx` owns loading and empty/error feedback. `reviews.ts` is the replaceable data-source boundary. The demo works without a running backend. Production hides the entire demo section by default. To share a production demonstration build, explicitly set `VITE_SHOW_DEMO_REVIEWS=true` in `frontend/.env.local` before building; all visible demonstration labels remain.

## API and Google mode

`GET /api/reviews` returns `{mode,status,reviews,attributions}`. The backend `ReviewsSource` interface has `DemoReviewsService` and `GoogleReviewsService` implementations. Maven packages the same local JSON used by React. Default `REVIEWS_MODE=DEMO` returns explicitly marked demonstration data. Google mode never falls back to samples, including when credentials are absent, Google returns an error or no reviews exist.

When the client supplies the verified Place ID and Google Cloud credentials, configure:

```dotenv
# Backend environment only:
REVIEWS_MODE=GOOGLE
GOOGLE_PLACE_ID=<client-approved-verified-place-id>
GOOGLE_PLACES_API_KEY=<server-only-key>

# frontend/.env.local, then rebuild:
VITE_REVIEWS_MODE=GOOGLE
VITE_SHOW_DEMO_REVIEWS=false
```

The adapter calls `https://places.googleapis.com/v1/places/{placeId}` with `X-Goog-Api-Key` and `X-Goog-FieldMask: reviews,attributions`. Enable Places API (New), appropriate billing/quota and server-side API-key restrictions in the client's Google Cloud project. No browser key is required. The UI preserves author names, profile/photo/review URLs and supplied provider attributions; it shows up to four reviews in Google's returned relevance order. It does not request or invent an aggregate rating or review count. It does not scrape or offer to create reviews.

Google content stays in the current response/UI only: no database, persistent cache or prefetch worker. HTTP responses use `Cache-Control: no-store`. Fixed upstream host, URL-encoded ID, HTTPS-only display links, bounded 1 MiB response, connection/read timeouts, two concurrent requests and ten upstream attempts/minute limit abuse. These in-memory limits are per instance; configure upstream quotas and edge rate limiting before public launch. No API keys or provider error bodies are returned to visitors. Missing configuration gives `status: unconfigured` with an empty list; provider failure gives a safe 503, throttling 429.

Before enabling live data, review the current [Places API (New) documentation](https://developers.google.com/maps/documentation/places/web-service/place-details) and [attribution/content policies](https://developers.google.com/maps/documentation/places/web-service/policies). The compact attribution area uses Google Maps text attribution, linked author/review references and the Google review-policy link. Add publicly accessible approved Terms of Use and Privacy Policy incorporating Google's required references before launch. Review applicable billing-region terms. No live Google request with client credentials has been verified; tests use synthetic upstream fixtures.

## Validation

`npm run test:preview` builds the production app, checks route metadata and verifies the default production demo is hidden. `npm test` includes responsive review checks at 320/375/390/430/768/1024/1440 px, axe accessibility, homepage placement, labels, Google attribution, unconfigured/error/mismatched data and the loading-deadline regression. `mvn verify` includes demo/Google API tests, synthetic Google response/authentication mapping and safe provider-failure tests alongside existing contact and careers coverage. Screenshots: `docs/preview/reviews-desktop.png` and `reviews-mobile.png`.
