# Future — Nathaniel Sebastian

Editable source for [Future](https://future-nathaniel.pages.dev/), a personal portfolio and digital-product storefront.

The site includes three engineering case studies, a public GitHub project directory, a downloadable CV and a pre-release store.

## Run and verify

Requires Node.js 20 or later. The existing Replit Run setup also uses Python 3 to serve the generated pages.

```sh
npm run build
npm test
node scripts/check-links.mjs
python3 -m http.server 3000 --directory dist
```

Open `http://localhost:3000`. The store is at `/products/`. Rebuild after changing source or content.

## Edit

- `content/profile.json` holds the profile, CV link and public site address.
- `content/projects.json` holds the case studies.
- `src/pages.mjs` holds the portfolio page templates.
- `src/products.mjs` holds the store, release and checkout pages.
- `public/assets/storefront.css` styles the store.
- `public/assets/github-data.js` loads public repositories. Four introductory coursework repositories are excluded from the portfolio directory.
- `public/images/` and `public/files/` contain the published artwork and CV.

## Publish

Build, then upload the contents of `dist/` through a new production deployment in the existing `future-nathaniel` Cloudflare Pages project. The project uses Direct Upload. Source commits are saved separately on GitHub.

The store is marked **Yet to drop**. Product details and pricing will be announced before sales open. The source includes Stripe Payment Link support, guarded by the product status and fulfilment configuration in `content/commerce.json`.
