# Verification — 17 November 2026

- Production build: seven HTML pages generated from structured content, with no dependency installation required.
- Internal navigation: 104 local page, asset and anchor references checked; all resolve.
- Automated checks: six focused test groups passed, covering public-only repository validation, unsafe URLs, filters, cache reuse, forced refresh, HTTP failures, stale data, disabled storage, timeout, pagination and empty results.
- Desktop browser: home, project-overview switcher, Policy Copilot case study, profile/CV page and directory opened successfully.
- Live integration: browser confirmed successful data loading from GitHub. Keyword search returned the Policy Copilot record; a nonexistent query showed the empty state; clearing filters and selecting Python/Name A–Z showed four correctly ordered repositories.
- Responsive check: home and case study rendered in 390-pixel-wide frames; directory rendered in a 320-pixel-wide frame. Actual document content widths matched the viewport widths (375 and 305 pixels after browser scrollbars), with no horizontal page overflow. The case-study contents list scrolls within its own navigation region.
- Keyboard: activated the skip link and changed the system overview using Enter.
- Project repository links: all three public repositories were retrieved through GitHub. External LinkedIn and mail links were checked as destinations; no email was sent. The historical EventHub demo was deliberately omitted because its availability was not verified.
- CV: a web profile and email request are working. No downloadable PDF is claimed or exposed; adding a selected general CV remains a content task.
- Limits: no Lighthouse score, load-test result, paid platform certification or new run of the underlying project test suites is claimed. Responsive browser checks use constrained frames, not physical phones. The browser's native print dialog was not exercised.

Deployment is verified separately through the hosting publication result. Source is committed and synchronized before publication.

## Navy revision

- Replaced the green palette with deep navy, slate and blue accents across the site.
- Tightened positioning and project summaries; added explicit contributions, key decisions and links to reproduction/verification material.
- Retrieved the Policy Copilot figure through GitHub and checked all three newly linked evidence documents. Saved synthetic Ledger figures (130 incomplete transactions, 79 orphan vendor references and 290 duplicate candidates) match the linked findings document.
- Browser checked the overview switcher's updated EventHub case-study destination and opened the revised case study.
- At 320 and 390 pixels, the native mobile menu opens with Enter, closes with Escape and navigates to the repository directory.
- Fixed a newly observed narrow-screen overflow caused by the ledger table's grid container. The 390-pixel frame now has matching document viewport and content widths (375 pixels after browser scrollbars); the wide table scrolls inside a labelled, keyboard-focusable region.
- Internal references: 160 page, asset and anchor links passed the final audit.
- The GitHub data module and its previously passing six test groups are unchanged in this revision. No new test count or performance score is claimed.

## Future, public CV and product revision

- Brand set to Future; personal identity remains Nathaniel Sebastian.
- General CV created from the earlier screening CVs and current tailored packs. One-page PDF rendered and visually checked; text extraction confirms full name and education and excludes the private phone number and unapproved volunteer entry.
- Added `/products/`, `/products/first-release/` and `/checkout/`, linked from the shared navigation and portfolio. The CV is a real PDF asset linked from the profile page and contains a reciprocal portfolio link.
- Five commerce test groups pass: unavailable products cannot expose checkout, incomplete live configuration fails, unsafe provider URLs are rejected, a complete fixture produces the correct Stripe-hosted URL and GBP price, and the shipped configuration stays closed.
- Final output contains 10 pages and a sitemap. The static link audit passes 256 local page, asset and anchor references.
- No merchant account connection, product price, payment link or live transaction is claimed. Current product status is coming soon.
- Browser checked navigation from portfolio to product index, release detail, unavailable checkout and CV. The disabled payment action was confirmed, and the CV download's bytes matched the hosted source PDF.
- New pages checked in 320/390-pixel frames; document widths match their viewports (305/375 pixels after browser scrollbars). Fixed a cover-card minimum-width issue observed in the first mobile pass.
- Current Site sharing was confirmed public before publication; this revision preserves that audience.
