# Scope and content decisions

Inspected 17 October 2026: the workspace was empty, with no Git metadata or project ZIP. `mediastris-project.zip` was also absent from Downloads. Git was unavailable on PATH. No existing application was overwritten.

Read all seven supplied PDFs; text extractions are retained beside this file. Primary references: updated BMR, Project Agreement / T&C and Project Plan. The request in chat authorizes implementation; document text is reference material and does not authorize unrelated actions or impose an instruction to stop.

## Material differences

- The older lean BRD mentions a blog upload/management option and separate service pages. The updated BMR, agreement and explicit user request exclude CMS/admin features. Implemented code-managed public articles and detail routes, with no management interface. Individual service detail rendering is ready for an approved service list; there are no invented services.
- Agreement/checklist assume all imagery and branding come from the client. The user explicitly authorizes temporary stock photography and a text wordmark. Stock assets are visibly identified, centrally referenced and documented in ASSETS.md.
- No source contains approved service names, service descriptions, company copy, team bios, mission, vision, values, case studies, articles, vacancies, telephone, email, WhatsApp or social links. Empty states and `[CLIENT CONTENT REQUIRED]` are deliberate. “No openings listed” describes this website, not an assertion that the company has no vacancies.
- The project documents describe confirmation by 8 October 2026 and a conditional 31-day schedule. They do not establish a new delivery date for this implementation session. Payment status and document signatures were not inferred.

No substantive services or credentials from reference companies were reused. Home headline and interface copy are provisional editorial text for client review. No medical advice, outcomes, statistics, testimonials, accreditations or team identities are asserted.

## Implementation boundaries

React SPA with build-time HTML metadata; Spring Boot REST API; no database, CMS, portal, dashboard, marketplace, payment or resume upload. General content is centralized in frontend/src/content.ts. Team rendering is omitted until approved content exists.

Deployment requires client infrastructure and credentials. The Sites skill was reviewed; its Cloudflare Worker runtime cannot host a Java Spring Boot process. This requested full-stack project is prepared for conventional Java/static hosting instead of publishing a misleading frontend-only integration.

## Services follow-up — 18 October 2026

The user supplied eight provisional service names and exact slugs in the attached request, explicitly pending final client verification. This supersedes the original empty-services decision, while the PDFs still contain no approved service details. Added one catalogue in `frontend/src/data/services.json` with visibly labeled original draft descriptions and proposed discussion topics. Actual Mediastris assistance remains `[CLIENT CONTENT REQUIRED]`; no certifications, approvals, geographic authority, results or delivery promises are invented. The duplicate Digital Marketing item is not present.

The change extends the existing React routing, components and header: eight homepage cards, Services index, one shared detail template, desktop mega-menu and mobile accordion. The same source also feeds contact suggestions and service metadata. No backend or enquiry workflow changes. No screenshots accompanied the attachment; the explicitly supplied inventory and structure governed the implementation. No new CMS or management functionality.

## About follow-up — 18 October 2026

The user explicitly requested the four-page About experience: overview, vision, management and CEO message. Added the four requested `/about-us` routes while retaining `/about`. The original approved-content constraint continues to govern all company statements: four empty numbered value slots, a marked Vision placeholder, Mission omitted until approved, a management awaiting-content state and a CEO message/portrait placeholder with no invented identity. Actual profiles can be supplied later through the centralized About data file. The attached request contained text only; no screenshots were available.

About and Services share one navigation disclosure component and Header coordinates open state to prevent overlapping panels. Existing service routes, other pages and enquiry/backend integrations are preserved. About pages reuse the licensed local stock assets with visible labels; the CEO portrait uses clearly marked original placeholder line art. No CMS, backend functionality or dependencies were added.
