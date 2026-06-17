# Full-stack image for Blocly Tools: builds the React frontend and runs the
# Express API (which serves the static frontend) on one host. yt-dlp and ffmpeg
# are provided by the youtube-dl-exec / ffmpeg-static npm packages, which fetch
# self-contained Linux binaries during `npm ci` — no system Python/ffmpeg needed.
FROM node:22-slim

# ca-certificates so the postinstall binary downloads succeed over HTTPS.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Vite bakes VITE_* values at BUILD time, so they must be present as build args.
# (Pass them with --build-arg, or via render.yaml / Railway build variables.)
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""
ARG VITE_ADMIN_EMAIL=""
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_ADMIN_EMAIL=$VITE_ADMIN_EMAIL

# Install dependencies first for better layer caching. This also downloads the
# yt-dlp and ffmpeg binaries via the packages' postinstall scripts.
COPY package.json package-lock.json ./
RUN npm ci

# Build the client bundle + the server bundle (dist/server.cjs).
COPY . .
RUN npm run build

ENV NODE_ENV=production
# The server reads $PORT; hosts inject it. 3000 is just the local default.
EXPOSE 3000
CMD ["npm", "run", "start"]
