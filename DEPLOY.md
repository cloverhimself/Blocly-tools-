# Deploying Blocly Tools

The downloader runs `yt-dlp` + `ffmpeg` on the server, so the app needs a host
that runs Node (not static-only hosting like Vercel). No Docker required.

## Render (recommended)

**Easiest — Blueprint (uses `render.yaml`):**
1. Render → **New → Blueprint** → pick this repo.
2. Enter the three values when prompted, then **Apply**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`

**Or set it up manually (New → Web Service):**
- Environment: **Node**
- Build command: `npm install && npm run build`
- Start command: `NODE_ENV=production node dist/server.cjs`
- Add the three `VITE_*` env vars above.

First build takes a few minutes (it downloads the yt-dlp + ffmpeg binaries).

> Free instances sleep after 15 min idle and have 512 MB RAM. If large/4K
> downloads fail, change `plan: free` → `plan: starter`.

## Railway (alternative)

New Project → Deploy from GitHub repo → add the three `VITE_*` variables.
Railway auto-detects the build/start scripts.

## After deploying — verify

Open `https://YOUR-URL/api/v1/ytdl/info?url=https://youtu.be/dQw4w9WgXcQ`.
You should get **JSON**. The admin dashboard is at `/dashboard`.

Also add your live URL to **Supabase → Authentication → URL Configuration**
(Site URL + Redirect URLs) so admin magic-link logins are accepted.
