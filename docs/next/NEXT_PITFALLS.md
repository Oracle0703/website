# Next.js Pitfalls (Project Notes)

This file is a living list of Next.js issues we hit in this repo, why they happened, and the fixes that work.

## 1) Canonical/OG URLs accidentally point to "/"

### Symptom
- `/blog` and `/blog/<slug>` render `<link rel="canonical" href="/">` (or otherwise not the page URL).
- `og:url` is `/` for every page.
- Shares and indexing treat many pages as duplicates of the homepage.

### Root Cause
- `app/layout.tsx` is the global default metadata. If you set:
  - `alternates.canonical: "/"`
  - `openGraph.url: "/"`
  then every route inherits those values unless explicitly overridden.

### Fix
- Do NOT set canonical / OG URL in the root layout.
- Set canonical and `openGraph.url` per route in each page's `generateMetadata`.

## 2) `og:image` becomes `http://localhost:3001/...` in production

### Symptom
- In production HTML:
  - `og:image` / `twitter:image` points to `http://localhost:3001/og.png`.

### Root Cause
- You provide relative URLs like `"/og.png"`.
- Next needs a base to resolve them. If `metadataBase` is missing, it may fall back to a dev default.

### Fix
- Set `metadataBase` in `app/layout.tsx`.
- Prefer using an explicit env:
  - `NEXT_PUBLIC_SITE_URL=https://www.meaningful.ink`

## 3) `robots.txt` and `sitemap.xml` are 404

### Symptom
- `GET /robots.txt` => 404
- `GET /sitemap.xml` => 404

### Root Cause
- In the App Router, these are generated endpoints. If you don't implement them, Next won't create them.

### Fix
- Add `app/robots.ts` and `app/sitemap.ts`.
- Keep sitemap URLs absolute.

## 4) JSON files with UTF-8 BOM break Next/Webpack parsing

### Symptom
- Next build / tooling fails with confusing JSON parse errors.

### Root Cause
- `package.json` (or other JSON) contains a UTF-8 BOM.

### Fix
- Remove BOM and keep JSON as plain UTF-8.
- In this repo we already had to do this once; treat BOM as a first suspect.

## 5) `<img>` warnings (LCP / optimization)

### Symptom
- `next build` warns about `@next/next/no-img-element`.

### Root Cause
- Using raw `<img>` in app routes or MDX components.

### Fix
- Prefer `next/image` for critical images.
- For content images, decide deliberately (raw `img` may be fine if you want zero extra image pipeline).

## Quick Checklist (When SEO Looks Wrong)

- View source of `/`, `/blog`, and one post route.
- Confirm:
  - canonical matches the page path (not always `/`).
  - `og:url` matches the page URL.
  - `og:image` is not localhost and is reachable from the public internet.
  - `/robots.txt` and `/sitemap.xml` return 200.
