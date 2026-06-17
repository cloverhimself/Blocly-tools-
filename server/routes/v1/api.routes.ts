import { Router, Request, Response } from "express";
import { UtilsController } from "../../controllers/utils.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import { z } from "zod";
import youtubedl from "youtube-dl-exec";
import ffmpegPath from "ffmpeg-static";
import os from "os";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { execFile } from "child_process";

const router = Router();

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
  // Bundled static ffmpeg so yt-dlp can merge separate video+audio streams
  // (required for any YouTube quality above 360p) and extract MP3 audio.
  if (ffmpegPath) flags.ffmpegLocation = ffmpegPath;
  // NB: we intentionally do NOT pin a YouTube player_client — forcing one
  // collapses the format list down to a single 360p stream. yt-dlp's default
  // client selection exposes the full DASH quality ladder (up to 4K).
  return flags;
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

// Extract a single readable line from a yt-dlp failure (stderr or Error).
function cleanYtError(err: any): string {
  const raw =
    typeof err === "string" ? err : err?.stderr || err?.message || "Unknown error";
  const lines = String(raw)
    // strip ANSI colour codes
    .replace(/\x1b\[[0-9;]*m/g, "")
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
    method: z.string(),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.any().optional()
  })
})), async (req: Request, res: Response) => {
  try {
    const { url, method, headers, body } = req.body;
    
    // Security check: only allow http/https, deny localhost, metadata IP, internal network
    const targetUrl = new URL(url);
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return res.status(400).json({ error: "Invalid protocol" });
    }
    const hostname = targetUrl.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '169.254.169.254' || hostname === '::1' || hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
      return res.status(403).json({ error: "Internal network access forbidden" });
    }

    const fetchOpts: RequestInit = {
      method,
      headers: headers as HeadersInit,
    };
    if (body) {
      fetchOpts.body = typeof body === 'object' ? JSON.stringify(body) : body;
    }

    const response = await fetch(url, fetchOpts);
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((v, k) => {
      responseHeaders[k] = v;
    });

    const responseText = await response.text();

    return res.json({
      status: response.status,
      headers: responseHeaders,
      body: responseText
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
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

    const info: any = await youtubedl(url, {
      dumpSingleJson: true,
      preferFreeFormats: true,
      ...baseYtdlFlags(url),
    } as any);

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
      hasAudio,
      formats,
    });
  } catch (error: any) {
    res.status(500).json({ error: cleanYtError(error) });
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
    const plan = buildDownloadPlan(url, type, quality);

    // Resolve metadata first so we can name the file and fail cleanly on bad URLs.
    const info: any = await youtubedl(url, {
      dumpSingleJson: true,
      ...baseYtdlFlags(url),
    } as any);
    const filename = `${sanitizeFilename(info.title || "download")}.${plan.ext}`;

    const setDownloadHeaders = (size?: number) => {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
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

      const sub = youtubedl.exec(url, opts);
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
    } as any);

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
    if (!res.headersSent) res.status(500).json({ error: cleanYtError(error) });
  }
});

export default router;
