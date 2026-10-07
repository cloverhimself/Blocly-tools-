# Deploying Blocly Tools

Blocly Tools is a Vite + React app served by a lightweight Express server. It
can run on any Node host that supports the build and start commands below.

## Vercel

Use Vercel for the current app while the heavier downloader tools are disabled.

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Set these environment variables as needed:

- `APP_URL`
- `PUBLIC_APP_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL`

For the production subdomain, set both URL vars to:

```text
https://btools.blocly.click
```

## Render

Render remains an option if you want a persistent Node web service later.

**Blueprint:** Render -> New -> Blueprint -> pick this repo.

**Manual web service:**

- Environment: Node
- Build command: `npm install --include=dev && npm run build`
- Start command: `NODE_ENV=production node dist/server.cjs`

## After Deploying

Add the live URL to Supabase Authentication URL Configuration:

- Site URL: `https://btools.blocly.click`
- Redirect URL: `https://btools.blocly.click/dashboard`

The admin dashboard is available at `/dashboard`.
