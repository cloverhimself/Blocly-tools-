# Deploying Blocly Tools (full app: downloader + tools + admin)

The Social Media Downloader needs a **real Node server** (it runs `yt-dlp` +
`ffmpeg`), so the whole app must be hosted somewhere that runs a persistent
process — **not** Vercel/Netlify static hosting. The included `Dockerfile`
builds and runs everything (the Express API also serves the frontend).

## Option A1 — Render (recommended, uses `render.yaml`)

1. Push this repo to GitHub (already done).
2. In Render → **New → Blueprint** → pick this repo. Render reads `render.yaml`.
3. When prompted, enter the three values (used at build **and** runtime):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`
4. Click **Apply**. First build takes a few minutes (it downloads the yt-dlp +
   ffmpeg binaries). Your app is live at `https://blocly-tools.onrender.com`.

> Free instances sleep after 15 min idle and have 512 MB RAM. If large/4K
> downloads fail, bump `plan: free` → `plan: starter` in `render.yaml`.

## Option A2 — Railway

1. Railway → **New Project → Deploy from GitHub repo** → pick this repo.
   Railway auto-detects the `Dockerfile`.
2. In the service **Variables**, add `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_EMAIL` (Railway passes them as build
   args automatically), and `NODE_ENV=production`.
3. Deploy. Railway assigns a public URL.

## Any other Docker host (Fly.io, a VPS, etc.)

```bash
docker build \
  --build-arg VITE_SUPABASE_URL="https://YOUR.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY" \
  --build-arg VITE_ADMIN_EMAIL="you@example.com" \
  -t blocly-tools .

docker run -p 3000:3000 -e NODE_ENV=production blocly-tools
```

## After deploying — verify

Open `https://YOUR-URL/api/v1/ytdl/info?url=https://youtu.be/dQw4w9WgXcQ`.
You should get **JSON** (title, formats, …). If so, the downloader works.
The admin dashboard is at `/dashboard` and requires the `VITE_ADMIN_EMAIL` login.
