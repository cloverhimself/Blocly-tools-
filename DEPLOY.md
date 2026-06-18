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
- Build command: `YOUTUBE_DL_SKIP_PYTHON_CHECK=1 npm install --include=dev && npm run build`
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

## Making YouTube reliable (free) — optional cookies

YouTube blocks **datacenter IPs** (Render/AWS/etc.) with a "confirm you're not a
bot" challenge, so YouTube downloads are flaky from any cloud host. TikTok,
Instagram and Facebook are unaffected. The free fix is to give the server a
YouTube cookie so it looks like a signed-in user.

1. Log into YouTube in a browser **with a throwaway Google account** (not your
   main one — heavy downloading can get an account flagged).
2. Export cookies with a browser extension like **"Get cookies.txt LOCALLY"**.
   Save the `youtube.com` cookies as a Netscape `cookies.txt`.
3. Base64-encode it into one line:
   - macOS/Linux: `base64 -w0 cookies.txt` (or `base64 cookies.txt | tr -d '\n'`)
   - Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("cookies.txt"))`
4. In **Render → your service → Environment**, add:
   `YTDLP_COOKIES` = *(the base64 string)*
5. Save — Render redeploys. YouTube now works.

The server accepts the raw `cookies.txt` content too, but base64 is easier to
paste. Cookies expire after a few weeks — when YouTube starts failing again,
re-export and update the variable. Leave `YTDLP_COOKIES` unset and everything
still works; only YouTube stays best-effort.
