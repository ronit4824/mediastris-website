# Temporary assets and reference sources

All photographs are illustrative placeholders and are labeled in the UI. They do not depict Mediastris personnel, facilities or clients. Replace files and the centralized `images` definitions in `frontend/src/content.ts` or service image references in `frontend/src/data/services.json` with client-approved assets.

| Local file | Source | Use |
| --- | --- | --- |
| frontend/public/images/healthcare.webp | https://images.unsplash.com/photo-1612349317150-e413f6a5b16d | Hero; cropped WebP 1400 × 1400, approximately 188 KB |
| frontend/public/images/collaboration.webp | https://images.unsplash.com/photo-1497366754035-f200968a6e72 | Office illustration; cropped WebP 1000 × 750, approximately 82 KB |
| frontend/public/images/services/hospital.webp | https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d | Hospital corridor illustration; WebP 1600 × 960, approximately 166 KB |
| frontend/public/images/services/planning.webp | https://images.unsplash.com/photo-1454165804606-c3d57bc86b40 | Document/planning illustration; WebP 1600 × 960, approximately 198 KB |
| frontend/public/images/services/strategy.webp | https://images.unsplash.com/photo-1460925895917-afdab827c52f | Digital strategy illustration; WebP 1600 × 960, approximately 114 KB |

Downloaded on 17 October 2026 from Unsplash's image CDN. Standard Unsplash license: https://unsplash.com/license (commercial use and downloaded adaptations allowed; do not imply endorsement). These are generic stock photographs, not client representations. The source URLs above identify the exact temporary assets for replacement and provenance.

The three Services images were added on 18 October 2026 under the same license. Eight service pages share these three assets; images are fetched locally and no third-party image request is needed at runtime. The hospital image is a generic foreign-language stock environment, not a claimed Mumbai facility. Original inline SVG interface icons in `ServiceIcon.tsx` have no dependency on another company's branding or icon assets.

Manrope variable Latin font: `@fontsource-variable/manrope` 5.3.0, self-hosted at `frontend/public/fonts/manrope.woff2`. SIL Open Font License retained as `Manrope-LICENSE.txt` beside the font. No remote font dependency. System Arial and Georgia fallbacks.

Temporary text wordmark and plain “m” favicon are typeset placeholders, not an official company logo. Teal/sage palette is provisional.

The About upgrade (18 October 2026) reuses `hospital.webp` for the company introduction, `collaboration.webp` for the supporting story and `strategy.webp` for Vision. Image references and crop positions live in `frontend/src/data/about.json`; visible captions distinguish stock from company premises. Management contains no stock team/employee photography. The CEO portrait area uses original SVG placeholder line art with the visible label “Approved portrait pending.” No new photography, generated executive image or third-party image requests were added.

## Design research

Reviews use original inline SVG stars/quotation marks and CSS initials avatars. Four review objects in `frontend/src/data/reviews.json` are labelled demonstrations, not real customer content. No Google branding is used in demo mode. Live Google mode can use author photographs only from the API response, with attribution and profile links; no stock portrait is passed off as a reviewer.

- https://www.nucsoft.com/ — corporate navigation, typography, section hierarchy and spacing inspiration.
- https://www.hosval.com/ — healthcare information architecture; initially returned 429, subsequently accessible.
- https://pathwayhealthcare.in/ — healthcare context and contact presentation.

Original implementation and copy. No reference site source, logos, business claims, staff, testimonials or exact layouts reused.
