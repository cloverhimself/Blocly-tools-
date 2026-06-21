import { Router, Request, Response } from "express";
import { UtilsController } from "../../controllers/utils.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import { z } from "zod";
import youtubedl from "youtube-dl-exec";
import ffmpegPath from "ffmpeg-static";
import dns from "dns/promises";
import os from "os";
import fs from "fs";
import path from "path";
import net from "net";
import { randomUUID } from "crypto";
import { execFile } from "child_process";

const router = Router();
const PROXY_TIMEOUT_MS = 15_000;
const PROXY_MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const ALLOWED_PROXY_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
const BLOCKED_REQUEST_HEADERS = new Set([
  "connection",
  "content-length",
  "cookie",
  "host",
  "proxy-authorization",
  "proxy-connection",
  "sec-fetch-dest",
  "sec-fetch-mode",
  "sec-fetch-site",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);
const BLOCKED_RESPONSE_HEADERS = new Set(["set-cookie", "set-cookie2"]);

function parseIPv4(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return nums;
}

function isBlockedIPv4(ip: string): boolean {
  const p = parseIPv4(ip);
  if (!p) return true;
  const [a, b] = p;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a === 169 && b === 254 ||
    a === 172 && b >= 16 && b <= 31 ||
    a === 192 && b === 168 ||
    a === 100 && b >= 64 && b <= 127 ||
    a === 192 && b === 0 ||
    a === 198 && (b === 18 || b === 19) ||
    a >= 224
  );
}

function isBlockedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedIPv4(mapped[1]);
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith("2001:db8:")
  );
}

function isBlockedIp(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isBlockedIPv4(ip);
  if (version === 6) return isBlockedIPv6(ip);
  return true;
}

function getUrlHostname(targetUrl: URL): string {
  return targetUrl.hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

async function assertPublicHttpUrl(rawUrl: string): Promise<URL> {
  const targetUrl = new URL(rawUrl);
  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    throw new Error("Only http(s) links are supported.");
  }

  const hostname = getUrlHostname(targetUrl);
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Internal network access is forbidden.");
  }

  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) throw new Error("Internal network access is forbidden.");
    return targetUrl;
  }

  const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((addr) => isBlockedIp(addr.address))) {
    throw new Error("Internal network access is forbidden.");
  }

  return targetUrl;
}

function filterProxyRequestHeaders(headers?: Record<string, string>): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers || {})) {
    const normalized = key.trim().toLowerCase();
    if (!normalized || BLOCKED_REQUEST_HEADERS.has(normalized) || normalized.startsWith("proxy-")) continue;
    clean[key.trim()] = value;
  }
  return clean;
}

async function readTextWithLimit(response: globalThis.Response, maxBytes: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      reader.cancel().catch(() => {});
      throw new Error("Response is too large to display.");
    }
    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();
  return body;
}

// ---------------------------------------------------------------------------
// Social media downloader helpers (YouTube, Facebook, Instagram, TikTok, ...)
// yt-dlp natively supports all of these, so a single code path serves them all.
// ---------------------------------------------------------------------------

function validHttpUrl(u: string): boolean {
  try {
    const p = new URL(u).protocol;
    return p === "http:" || p === "https:";
  } catch {
    return false;
  }
}

function detectPlatformLabel(u: string): string {
  try {
    const host = new URL(u).hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("youtu")) return "YouTube";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("facebook") || host.includes("fb.watch") || host.includes("fb.com")) return "Facebook";
    if (host.includes("twitter") || host === "x.com") return "X / Twitter";
    return host;
  } catch {
    return "";
  }
}

function isYouTube(u: string): boolean {
  try {
    const host = new URL(u).hostname.replace(/^www\./, "");
    return host.endsWith("youtube.com") || host === "youtu.be" || host.endsWith("youtube-nocookie.com");
  } catch {
    return false;
  }
}

// Resolve the YouTube cookies file from the YTDLP_COOKIES env var (once).
// The value may be the raw Netscape cookies.txt content OR base64 of it
// (base64 is easier to paste into a host's single-line env field). Returns the
// path to a temp cookies file, or null when not configured.
let _cookiesPath: string | null | undefined;
function getCookiesFile(): string | null {
  if (_cookiesPath !== undefined) return _cookiesPath;
  const raw = (process.env.YTDLP_COOKIES || "").trim();
  if (!raw) {
    _cookiesPath = null;
    return null;
  }
  try {
    let content = raw;
    // If it has no newlines and looks like base64, decode it.
    if (!/\s/.test(raw) && /^[A-Za-z0-9+/=]+$/.test(raw)) {
      const decoded = Buffer.from(raw, "base64").toString("utf8");
      if (decoded.includes("\t") || /youtube|\.com/i.test(decoded)) content = decoded;
    }
    const p = path.join(os.tmpdir(), "blocly-yt-cookies.txt");
    fs.writeFileSync(p, content, "utf8");
    _cookiesPath = p;
  } catch {
    _cookiesPath = null;
  }
  return _cookiesPath;
}

// Base yt-dlp flags. Only apply YouTube-specific client args to YouTube URLs;
// forcing a youtube referer/client onto FB/IG/TikTok breaks extraction.
// Typed as `any` because youtube-dl-exec's Flags type omits `extractorArgs`.
function baseYtdlFlags(url: string): any {
  const flags: any = {
    noCheckCertificates: true,
    noWarnings: true,
    addHeader: [
      "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ],
  };
  // Download DASH fragments in parallel — big speed-up for HD YouTube videos.
  flags.concurrentFragments = 5;
  // Fail reasonably fast instead of hanging on dead/blocked connections.
  flags.socketTimeout = 20;
  flags.retries = 3;
  flags.fragmentRetries = 3;
  // yt-dlp increasingly needs a JavaScript runtime for YouTube signature
  // extraction. The server is already running Node, so make it explicit.
  flags.jsRuntimes = `node:${process.execPath}`;
  // Only ever touch the single linked video. Without this, a normal watch URL
  // that carries a `&list=...` param (autoplay, mixes, "Watch Later") makes
  // yt-dlp try to process the entire playlist, which breaks info/downloads.
  flags.noPlaylist = true;
  // If a *pure* playlist/channel URL is pasted, don't resolve every entry
  // (that can take a minute+). List them flat so we can reject it instantly.
  flags.flatPlaylist = true;
  // Bundled static ffmpeg so yt-dlp can merge separate video+audio streams
  // (required for any YouTube quality above 360p) and extract MP3 audio.
  if (ffmpegPath) flags.ffmpegLocation = ffmpegPath;
  // Optional YouTube cookies (set YTDLP_COOKIES) — lets a datacenter-hosted
  // server pass YouTube's "confirm you're not a bot" check. No-op if unset.
  const cookies = getCookiesFile();
  if (cookies) flags.cookies = cookies;
  // NB: we intentionally do NOT pin a YouTube player_client — forcing one
  // collapses the format list down to a single 360p stream. yt-dlp's default
  // client selection exposes the full DASH quality ladder (up to 4K).
  return flags;
}

function ytdlExecOptions(): any {
  const preferred =
    process.env.YTDLP_TEMP_DIR ||
    (process.platform === "win32"
      ? path.join(process.cwd(), ".tmp", "yt-dlp")
      : path.join(os.tmpdir(), "blocly-yt-dlp"));

  try {
    fs.mkdirSync(preferred, { recursive: true });
    return {
      env: {
        ...process.env,
        TEMP: preferred,
        TMP: preferred,
        TMPDIR: preferred,
      },
    };
  } catch {
    return {};
  }
}

// Build a yt-dlp format selector + output metadata from a simple
// type/quality request coming from the UI.
function buildDownloadPlan(url: string, type: string, quality: string) {
  const yt = isYouTube(url);

  if (type === "audio") {
    if (quality === "mp3") {
      // Download best audio then transcode to MP3 (needs ffmpeg + temp file).
      return { format: "bestaudio/best", ext: "mp3", needsMerge: false, extractAudio: true };
    }
    // Native M4A audio — no re-encode, can stream straight to the client.
    return { format: "bestaudio[ext=m4a]/bestaudio", ext: "m4a", needsMerge: false, extractAudio: false };
  }

  // Video. "best" is capped at 1080p H.264 for a fast, universally-playable
  // default; the explicit 1440p/2160p buttons fetch the heavier VP9/AV1 streams.
  const maxH = quality === "best" ? 1080 : parseInt(quality, 10) || 1080;

  if (yt) {
    // YouTube splits hi-res into video-only + audio-only → must merge.
    const selector =
      maxH <= 1080
        ? // Prefer H.264 video + AAC audio (best compatibility), then any codec.
          `bestvideo[height<=${maxH}][vcodec^=avc1]+bestaudio[ext=m4a]/bestvideo[height<=${maxH}]+bestaudio/best[height<=${maxH}]/best`
        : // 1440p/4K: H.264 isn't offered, so take the best stream at that height.
          `bestvideo[height<=${maxH}]+bestaudio/best[height<=${maxH}]/best`;
    return { format: selector, ext: "mp4", needsMerge: true, extractAudio: false };
  }

  // IG / TikTok / Facebook serve a single combined file → stream directly.
  return { format: `best[height<=${maxH}]/best`, ext: "mp4", needsMerge: false, extractAudio: false };
}

// Kill a yt-dlp child *and its descendants*. On Windows a plain SIGKILL to the
// wrapper leaves yt-dlp's own subprocesses (and ffmpeg) running, so use taskkill
// with /T to terminate the whole tree.
function killTree(sub: any) {
  if (!sub || sub.killed || sub.pid == null) return;
  try {
    if (process.platform === "win32") {
      execFile("taskkill", ["/pid", String(sub.pid), "/T", "/F"], () => {});
    } else {
      sub.kill("SIGKILL");
    }
  } catch {
    /* already exited */
  }
}

function sanitizeFilename(name: string): string {
  return (
    (name || "download")
      .replace(/[\\/:*?"<>|]/g, "") // strip filesystem-illegal characters
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "download"
  );
}

// Extract a single readable line from a yt-dlp failure (stderr or Error) and
// translate the common ones into plain-language messages for end users.
function cleanYtError(err: any): string {
  const raw =
    typeof err === "string" ? err : err?.stderr || err?.message || "Unknown error";
  const text = String(raw).replace(/\x1b\[[0-9;]*m/g, ""); // strip ANSI colours
  const lower = text.toLowerCase();

  // Map well-known failure modes to friendly guidance.
  if (lower.includes("sign in to confirm") || lower.includes("not a bot"))
    return "YouTube is rate-limiting this server. Please try again in a little while.";
  if (
    lower.includes("private video") ||
    lower.includes("login required") ||
    lower.includes("requested content is not available") ||
    lower.includes("logged-in") ||
    lower.includes("empty media response") ||
    lower.includes("use --cookies") ||
    lower.includes("cookies-from-browser")
  )
    return "This post is private or only visible when signed in, so it can't be downloaded. Public posts work without login.";
  if (lower.includes("video unavailable") || lower.includes("removed") || lower.includes("does not exist") || lower.includes("not found"))
    return "This video is unavailable, removed, or the link is incorrect.";
  if (lower.includes("age") && lower.includes("confirm"))
    return "This video is age-restricted and can't be downloaded without sign-in.";
  if (lower.includes("geo") || lower.includes("not available in your country") || lower.includes("region"))
    return "This content is region-locked and not available from this server's location.";
  if (lower.includes("is live") || lower.includes("livestream") || lower.includes("live event will begin"))
    return "Live streams can't be downloaded. Try again once the stream has ended and is published.";
  if (
    lower.includes("unsupported url") ||
    lower.includes("no video formats") ||
    lower.includes("unable to extract") ||
    lower.includes("no video could be found")
  )
    return "No video was found at this link. Make sure the post actually contains a video.";
  if (lower.includes("nsfw") || lower.includes("age-restricted") || lower.includes("tweet is unavailable") || lower.includes("requires authentication"))
    return "This post is age-restricted or only visible when signed in, so it can't be downloaded.";
  if (lower.includes("http error 429") || lower.includes("too many requests"))
    return "Too many requests right now. Please wait a moment and try again.";

  const lines = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const errLine = [...lines].reverse().find((l) => /error/i.test(l)) || lines[0] || "Download failed";
  return errLine.replace(/^ERROR:\s*/i, "").slice(0, 300);
}

// ... existing routes ...

router.post("/proxy", validateRequest(z.object({
  body: z.object({
    url: z.string().url(),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.any().optional()
  })
})), async (req: Request, res: Response) => {
  try {
    const { url, method, headers, body } = req.body;
    const targetUrl = await assertPublicHttpUrl(url);
    const normalizedMethod = String(method).toUpperCase();
    if (!ALLOWED_PROXY_METHODS.has(normalizedMethod)) {
      return res.status(400).json({ error: "Unsupported HTTP method" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    const fetchOpts: RequestInit = {
      method: normalizedMethod,
      headers: filterProxyRequestHeaders(headers),
      redirect: "manual",
      signal: controller.signal,
    };
    if (body != null && normalizedMethod !== "GET" && normalizedMethod !== "HEAD") {
      fetchOpts.body = typeof body === "object" ? JSON.stringify(body) : String(body);
    }

    let response: globalThis.Response;
    try {
      response = await fetch(targetUrl, fetchOpts);
    } finally {
      clearTimeout(timeout);
    }
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((v, k) => {
      if (BLOCKED_RESPONSE_HEADERS.has(k.toLowerCase())) return;
      responseHeaders[k] = v;
    });

    const responseText = normalizedMethod === "HEAD" ? "" : await readTextWithLimit(response, PROXY_MAX_RESPONSE_BYTES);

    return res.json({
      status: response.status,
      headers: responseHeaders,
      body: responseText
    });
  } catch (error: any) {
    const message = error?.name === "AbortError" ? "Request timed out." : error.message;
    const status = /internal network|only http/i.test(message) ? 403 : 500;
    return res.status(status).json({ error: message });
  }
});

router.post("/uuid", validateRequest(z.object({
  body: z.object({
    version: z.enum(['v1', 'v4']).optional(),
    count: z.number().min(1).max(1000).optional()
  })
})), UtilsController.generateUuid);

router.post("/json/format", validateRequest(z.object({
  body: z.object({
    json: z.string(),
    spaces: z.number().min(0).max(8).optional()
  })
})), UtilsController.formatJson);

router.post("/jwt/generate", validateRequest(z.object({
  body: z.object({
    payload: z.record(z.string(), z.any()),
    secret: z.string(),
    expiresIn: z.string().optional()
  })
})), UtilsController.generateJwt);

router.post("/jwt/decode", validateRequest(z.object({
  body: z.object({
    token: z.string()
  })
})), UtilsController.decodeJwt);

router.post("/sql/format", validateRequest(z.object({
  body: z.object({
    sql: z.string(),
    dialect: z.string().optional()
  })
})), UtilsController.formatSql);

router.post("/test-data/generate", validateRequest(z.object({
  body: z.object({
    dataType: z.string().optional(),
    count: z.number().min(1).max(5000).optional()
  })
})), UtilsController.generateTestData);

router.get("/ytdl/info", async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url || !validHttpUrl(url)) {
      return res.status(400).json({ error: "Please provide a valid http(s) link." });
    }
    await assertPublicHttpUrl(url);

    const info: any = await youtubedl(url, {
      dumpSingleJson: true,
      preferFreeFormats: true,
      ...baseYtdlFlags(url),
    } as any, ytdlExecOptions());

    // A playlist/channel URL slips through as an `entries` list with no media.
    if (info && Array.isArray(info.entries) && info.formats == null) {
      return res.status(400).json({
        error: "That looks like a playlist or channel. Please paste a link to a single video.",
      });
    }

    if (info?.is_live) {
      return res.status(400).json({
        error: "This is a live stream. Live content can't be downloaded until it has ended.",
      });
    }

    const rawFormats: any[] = Array.isArray(info.formats) ? info.formats : [];
    const formats = rawFormats
      // Drop storyboard / thumbnail "formats" that can't actually be played.
      .filter((f) => f.format_id && f.protocol !== "mhtml")
      .map((f) => ({
        itag: f.format_id,
        qualityLabel:
          f.format_note ||
          f.resolution ||
          (f.height ? `${f.height}p` : (f.acodec && f.acodec !== "none" ? "Audio" : "Standard")),
        container: f.ext,
        hasVideo: !!f.vcodec && f.vcodec !== "none",
        hasAudio: !!f.acodec && f.acodec !== "none",
        contentLength: f.filesize
          ? String(f.filesize)
          : f.filesize_approx
          ? String(f.filesize_approx)
          : "0",
      }));

    // Some extractors (Instagram / Facebook / TikTok) return a single direct
    // URL with no `formats` array. Surface it as one combined option.
    if (formats.length === 0 && info.url) {
      formats.push({
        itag: info.format_id || "best",
        qualityLabel: info.resolution || (info.height ? `${info.height}p` : "Standard"),
        container: info.ext || "mp4",
        hasVideo: true,
        hasAudio: true,
        contentLength: info.filesize
          ? String(info.filesize)
          : info.filesize_approx
          ? String(info.filesize_approx)
          : "0",
      });
    }

    // Distinct video heights (e.g. 1080, 720, 480) for the quality buttons.
    // Only real video streams — exclude storyboards (mhtml) and audio.
    const videoHeights = Array.from(
      new Set(
        rawFormats
          .filter((f) => f.height && f.vcodec && f.vcodec !== "none" && f.protocol !== "mhtml")
          .map((f) => Number(f.height))
      )
    )
      .filter((h) => h > 0)
      .sort((a, b) => b - a);

    if (formats.length === 0) {
      return res.status(422).json({
        error: "No downloadable video or audio was found at this link.",
      });
    }

    // ----- Download sizes. We prefer yt-dlp's exact `filesize`; a size is only
    // "approximate" when we fall back to `filesize_approx`. A merged download =
    // (video-only stream) + (best audio), which is what we actually fetch, so it
    // is exact only when BOTH parts report an exact filesize.
    // Returns { size, exact }.
    const sized = (f: any): { size: number; exact: boolean } => {
      if (f && Number(f.filesize)) return { size: Number(f.filesize), exact: true };
      if (f && Number(f.filesize_approx)) return { size: Number(f.filesize_approx), exact: false };
      return { size: 0, exact: false };
    };

    const audioOnly = rawFormats.filter(
      (f) => (!f.vcodec || f.vcodec === "none") && f.acodec && f.acodec !== "none"
    );
    const bestM4a =
      audioOnly.filter((f) => f.ext === "m4a").sort((a, b) => sized(b).size - sized(a).size)[0] ||
      audioOnly.slice().sort((a, b) => sized(b).size - sized(a).size)[0];
    const audio = sized(bestM4a);
    const audioSize = audio.size;
    const audioSizeExact = audio.exact;

    const videoOnly = rawFormats.filter(
      (f) =>
        f.height &&
        f.vcodec &&
        f.vcodec !== "none" &&
        (!f.acodec || f.acodec === "none") &&
        f.protocol !== "mhtml"
    );
    const videoSizeAt = (h: number): { size: number; exact: boolean } => {
      const at = videoOnly.filter((f) => Number(f.height) === h);
      if (!at.length) return { size: 0, exact: false };
      const pick =
        h <= 1080
          ? at.find((f) => String(f.vcodec).startsWith("avc1") && f.ext === "mp4") ||
            at.find((f) => f.ext === "mp4") ||
            at[0]
          : at.slice().sort((a, b) => sized(b).size - sized(a).size)[0];
      return sized(pick);
    };

    // height -> merged size; exact only when both video and audio are exact.
    const qualities = videoHeights.map((h) => {
      const v = videoSizeAt(h);
      const size = v.size ? v.size + audioSize : 0;
      return { height: h, size, exact: size > 0 && v.exact && audioSizeExact };
    });

    let bestSize = 0;
    let bestSizeExact = false;
    if (isYouTube(url)) {
      const hForBest = videoHeights.filter((h) => h <= 1080).sort((a, b) => b - a)[0] || videoHeights[0];
      const v = hForBest ? videoSizeAt(hForBest) : { size: 0, exact: false };
      bestSize = v.size ? v.size + audioSize : 0;
      bestSizeExact = bestSize > 0 && v.exact && audioSizeExact;
    } else {
      const combined = rawFormats
        .filter((f) => f.vcodec && f.vcodec !== "none" && f.acodec && f.acodec !== "none")
        .map(sized)
        .sort((a, b) => b.size - a.size)[0] || { size: 0, exact: false };
      bestSize = combined.size;
      bestSizeExact = combined.exact;
    }

    const hasAudio = rawFormats.some((f) => f.acodec && f.acodec !== "none") || formats.length > 0;

    res.json({
      title: info.title || info.id || "Untitled",
      uploader: info.uploader || info.channel || info.uploader_id || "",
      platform: detectPlatformLabel(url),
      thumbnails: info.thumbnail
        ? [{ url: info.thumbnail }]
        : Array.isArray(info.thumbnails)
        ? info.thumbnails
        : [],
      lengthSeconds: info.duration != null ? String(info.duration) : "0",
      videoHeights,
      qualities,
      audioSize,
      audioSizeExact,
      bestSize,
      bestSizeExact,
      hasAudio,
      formats,
    });
  } catch (error: any) {
    const message = cleanYtError(error);
    res.status(/internal network|only http/i.test(message) ? 403 : 500).json({ error: message });
  }
});

router.get("/ytdl/download", async (req: Request, res: Response) => {
  const type = ((req.query.type as string) || "video").toLowerCase(); // "video" | "audio"
  const quality = ((req.query.quality as string) || "best").toLowerCase(); // "best" | "1080" | "mp3" ...
  const url = req.query.url as string;

  if (!url || !validHttpUrl(url)) {
    return res.status(400).json({ error: "Please provide a valid http(s) link." });
  }

  try {
    await assertPublicHttpUrl(url);
    const plan = buildDownloadPlan(url, type, quality);

    // Resolve metadata first so we can name the file and fail cleanly on bad URLs.
    const info: any = await youtubedl(url, {
      dumpSingleJson: true,
      ...baseYtdlFlags(url),
    } as any, ytdlExecOptions());

    if (info?.is_live) {
      return res.status(400).json({ error: "Live streams can't be downloaded." });
    }

    const filename = `${sanitizeFilename(info.title || "download")}.${plan.ext}`;
    // HTTP headers are Latin-1 only, but titles routinely contain emoji or
    // non-Latin characters (TikTok, YouTube, etc.) which would throw
    // "Invalid character in header". Use an ASCII fallback for the plain
    // filename and the percent-encoded UTF-8 form (preferred by browsers).
    const asciiName = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "") || "download";

    const setDownloadHeaders = (size?: number) => {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`
      );
      res.setHeader("Content-Type", "application/octet-stream");
      if (size != null) res.setHeader("Content-Length", String(size));
    };

    // ---- Path A: merge / transcode required → build to a temp file, then stream it.
    if (plan.needsMerge || plan.extractAudio) {
      const tmpDir = os.tmpdir();
      const base = `blocly-${randomUUID()}`;
      const tmpPath = path.join(tmpDir, `${base}.${plan.ext}`);

      // yt-dlp also writes intermediate fragments (e.g. `<base>.f137.mp4`,
      // `<base>.f251.webm.part`) while merging — sweep everything sharing the
      // prefix so an interrupted download leaves nothing behind.
      const cleanup = () => {
        try {
          for (const name of fs.readdirSync(tmpDir)) {
            if (name.startsWith(base)) {
              try {
                fs.unlinkSync(path.join(tmpDir, name));
              } catch {
                /* ignore */
              }
            }
          }
        } catch {
          /* ignore */
        }
      };

      const opts: any = { format: plan.format, output: tmpPath, ...baseYtdlFlags(url) };
      if (plan.needsMerge) opts.mergeOutputFormat = "mp4";
      if (plan.extractAudio) {
        opts.extractAudio = true;
        opts.audioFormat = "mp3";
        opts.audioQuality = 0;
      }

      const sub = youtubedl.exec(url, opts, ytdlExecOptions());
      let stderr = "";
      let aborted = false;
      sub.stderr?.on("data", (d: Buffer) => {
        stderr += d.toString();
      });

      // If the client disconnects while we're still building the file, kill
      // yt-dlp so it stops downloading and leaves no partial fragments.
      const onAbort = () => {
        aborted = true;
        killTree(sub);
      };
      res.on("close", onAbort);

      try {
        await new Promise<void>((resolve, reject) => {
          sub.on("error", reject);
          sub.on("close", (code: number) =>
            code === 0 ? resolve() : reject(new Error(cleanYtError(stderr) || "Download failed."))
          );
        });
      } catch (err: any) {
        res.off("close", onAbort);
        cleanup();
        if (!res.headersSent && !aborted) res.status(500).json({ error: cleanYtError(err) });
        return;
      }

      res.off("close", onAbort);
      if (aborted || !fs.existsSync(tmpPath)) {
        cleanup();
        return;
      }

      const stat = fs.statSync(tmpPath);
      setDownloadHeaders(stat.size);

      const stream = fs.createReadStream(tmpPath);
      stream.pipe(res);
      stream.on("close", cleanup);
      stream.on("error", () => {
        cleanup();
        res.destroy();
      });
      res.on("close", () => {
        stream.destroy();
        cleanup();
      });
      return;
    }

    // ---- Path B: single combined/audio stream → pipe straight to the client.
    setDownloadHeaders();

    const dl = youtubedl.exec(url, {
      format: plan.format,
      output: "-",
      ...baseYtdlFlags(url),
    } as any, ytdlExecOptions());

    let stderr = "";
    dl.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString();
    });

    if (!dl.stdout) {
      return res.status(500).json({ error: "Failed to start the download stream." });
    }

    dl.stdout.pipe(res, { end: false });

    dl.on("error", (err: any) => {
      if (!res.headersSent) res.status(500).json({ error: cleanYtError(err) });
      else res.destroy();
    });

    dl.on("close", (code: number) => {
      if (code && code !== 0 && !res.headersSent) {
        res.status(500).json({
          error:
            cleanYtError(stderr) ||
            "Download failed. The content may be private, region-locked, or unavailable.",
        });
      } else if (!res.writableEnded) {
        res.end();
      }
    });

    res.on("close", () => killTree(dl));
  } catch (error: any) {
    if (!res.headersSent) {
      const message = cleanYtError(error);
      res.status(/internal network|only http/i.test(message) ? 403 : 500).json({ error: message });
    }
  }
});

export default router;
