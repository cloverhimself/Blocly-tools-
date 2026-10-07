# Deploying Blocly Tools

Blocly Tools is a Next.js app deployed on Vercel.

## Vercel

Use Vercel for the primary deployment.

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install`

Set these environment variables as needed:

- `APP_URL`
- `PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADMIN_EMAIL`

For the production subdomain, set both URL vars to:

```text
https://btools.blocly.click
```

## After Deploying

Add the live URL to Supabase Authentication URL Configuration:

- Site URL: `https://btools.blocly.click`
- Redirect URL: `https://btools.blocly.click/dashboard`

The admin dashboard is available at `/dashboard`.
