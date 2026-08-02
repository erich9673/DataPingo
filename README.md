# DataPingo Website

Marketing site for [datapingo.com](https://datapingo.com) — DataPingo builds productivity
apps for Atlassian Jira and Confluence.

Static HTML/CSS. No build step, no framework. Deployed from `main` via GitHub Pages.

## Products

| App | Platform | Marketplace |
|---|---|---|
| Bulk Page Cloner | Confluence | [apps/2754913942](https://marketplace.atlassian.com/apps/2754913942) |
| Bulk Comments | Jira | [apps/2184917707](https://marketplace.atlassian.com/apps/2184917707) |

## Local development

```bash
npm run dev
```

Serves on `http://localhost:8000` using `serve.json`, which rewrites the extensionless
"clean" URLs (`/products/bulk-comments`) that GitHub Pages resolves natively in production.
Use this rather than a plain static file server — otherwise clean URLs 404 locally.

## Structure

```
index.html              homepage
products/               product pages
company/  partners/     about, careers, contact, partner programs
resources/              blog, use cases, documentation
privacy · terms · security · sla · support · 404
css/aurora.css          the entire shared stylesheet (dark "aurora" theme)
assets/                 images; brand marks live in "assets/Company Logo/"
```

Page-scoped CSS and JS are inlined per page; only shared styles live in `css/aurora.css`.

## Deployment

Pushing to `main` publishes automatically. `CNAME` pins the custom domain and `.nojekyll`
stops GitHub from running Jekyll over the files.

### Load-bearing — don't delete

- **`assets/Company Logo/DataPingo logo_LOGO A3.png`** — the nav/footer logo, referenced by
  every page. An unused file with the *same name* once sat under `assets/img/`; don't confuse them.
- **Legacy redirect stubs** (`products/bulk-page-cloner/index.html` and four others) keep
  previously-indexed trailing-slash URLs alive. Deleting one 404s a real URL.
- **`site.webmanifest`** references `assets/img/favicon-192.png` and `favicon-512.png`, so
  those are in use even though no HTML links them.

### Conventions

- Canonical URLs use the apex host — no `www`, no `.html`.
- Images carry intrinsic `width`/`height` so the browser reserves space (avoids layout shift);
  CSS still controls the rendered size.
- Screenshots are JPEG q=82; brand/product icons are PNG sized to ~2× their display box.
- Referenced image paths are URL-encoded (`%20` for spaces) — grep for both forms when
  checking whether an asset is used.
