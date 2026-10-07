# Blocly Tools Next.js + IA Plan

## 1. Production QA Findings

- `https://btools.blocly.click/` returns `200` from Vercel.
- Removed social downloader routes are no longer present in the homepage bundle.
- `@clover_himself` is live in the X/Twitter metadata.
- Direct app routes such as `/dashboard` and `/tools/json` returned Vercel `404`
  before adding the SPA rewrite in `vercel.json`.
- Current Vercel deployment serves the Vite frontend as static assets. Express
  endpoints such as `/api/v1/uuid` are not available on Vercel yet.

## 2. Next.js Migration Scope

Move to Next.js App Router before the larger UI revamp. This gives Blocly:

- Vercel-native API routes for backend-assisted tools.
- Per-tool metadata for SEO and sharing.
- Cleaner route ownership under `app/tools/[slug]`.
- A better foundation for landing pages, docs, changelogs, and admin surfaces.

Target structure:

```text
app/
  page.tsx
  layout.tsx
  dashboard/page.tsx
  tools/[slug]/page.tsx
  api/v1/...
src/
  components/
  lib/
  registry/
  tools/
```

Migration approach:

- Keep most existing tool components as client components first.
- Replace React Router with Next route files and `next/link`.
- Move Express API handlers into `app/api/v1/*/route.ts` incrementally.
- Keep browser-only heavy tools lazy-loaded with dynamic imports.
- Remove the Vite/Express server once all routes are migrated.

## 3. Information Architecture Direction

Use Toolbaze as structural inspiration, but keep Blocly's own identity.

Homepage priorities:

- Search-first hero with clear tool count.
- Featured tools row for the most useful/common tasks.
- Category navigation that helps users scan quickly.
- Compact category sections with consistent card density.
- Clear separation between client-only tools and cloud/API-assisted tools.

Proposed top-level category order:

```text
Featured
PDF & Documents
Images
Developer
Formatters & Converters
API & Network
SEO & Web
Color
Business
Fun
```

Tool page priorities:

- Consistent header with category, status, and privacy/server note.
- Main work area first, without marketing copy getting in the way.
- Related tools at the bottom.
- Better empty, loading, and error states.
