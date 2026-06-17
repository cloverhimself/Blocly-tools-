import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import {
  Download,
  AlertCircle,
  Loader2,
  PlaySquare,
  Music,
  Video,
  Youtube,
  Instagram,
  Facebook,
  Music2,
} from "lucide-react";

type VideoInfo = {
  title: string;
  uploader?: string;
  platform?: string;
  thumbnails: { url: string; width?: number; height?: number }[];
  lengthSeconds: string;
  videoHeights: number[];
  qualities?: { height: number; size: number }[];
  audioSize?: number;
  bestSize?: number;
  hasAudio: boolean;
};

type PlatformId = "youtube" | "instagram" | "tiktok" | "facebook";

type PlatformConfig = {
  id: PlatformId;
  label: string;
  Icon: typeof Youtube;
  accent: string;
  placeholder: string;
  example: string;
  hosts: string[];
  // YouTube exposes a full quality ladder + audio extraction; the others
  // generally serve a single combined file, so we only offer best + audio.
  qualityLadder: boolean;
};

const PLATFORMS: PlatformConfig[] = [
  {
    id: "youtube",
    label: "YouTube",
    Icon: Youtube,
    accent: "#FF0000",
    placeholder: "Paste a YouTube video or Shorts link…",
    example: "https://www.youtube.com/watch?v=…",
    hosts: ["youtube.com", "youtu.be"],
    qualityLadder: true,
  },
  {
    id: "instagram",
    label: "Instagram",
    Icon: Instagram,
    accent: "#E1306C",
    placeholder: "Paste an Instagram Reel or post link…",
    example: "https://www.instagram.com/reel/…",
    hosts: ["instagram.com"],
    qualityLadder: false,
  },
  {
    id: "tiktok",
    label: "TikTok",
    Icon: Music2,
    accent: "#111111",
    placeholder: "Paste a TikTok video link…",
    example: "https://www.tiktok.com/@user/video/…",
    hosts: ["tiktok.com"],
    qualityLadder: false,
  },
  {
    id: "facebook",
    label: "Facebook",
    Icon: Facebook,
    accent: "#1877F2",
    placeholder: "Paste a Facebook video or Reel link…",
    example: "https://www.facebook.com/watch?v=…",
    hosts: ["facebook.com", "fb.watch", "fb.com"],
    qualityLadder: false,
  },
];

// Cap the quality buttons to the resolutions a user actually cares about.
const COMMON_QUALITIES = [2160, 1440, 1080, 720, 480, 360];

function formatDuration(seconds: string): string {
  const s = parseInt(seconds, 10);
  if (!s || isNaN(s)) return "";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}

function qualityLabel(h: number): string {
  if (h >= 2160) return "4K (2160p)";
  if (h >= 1440) return "2K (1440p)";
  return `${h}p`;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes >= 1024 * 1024 * 1024) return `~${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  return `~${Math.round(bytes / 1024 / 1024)} MB`;
}

function DownloaderPanel({ platform }: { platform: PlatformConfig }) {
  const [url, setUrl] = useState("");
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null); // label of active download

  const hostMatches = (() => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
      return platform.hosts.some((h) => host.includes(h.replace("www.", "")));
    } catch {
      return true; // don't nag on empty / partial input
    }
  })();

  const fetchInfo = async () => {
    if (!url) return;
    setLoadingInfo(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/v1/ytdl/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch info. Ensure the link is valid and public.");
      setInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingInfo(false);
    }
  };

  const download = async (type: "video" | "audio", quality: string, label: string) => {
    if (!permissionChecked) {
      alert("Please confirm you have permission to download this content by ticking the box.");
      return;
    }
    if (downloading) return; // one at a time
    setError(null);
    setDownloading(label);

    const href = `/api/v1/ytdl/download?url=${encodeURIComponent(url)}&type=${type}&quality=${quality}`;
    try {
      const res = await fetch(href);

      // The server reports failures as JSON; a real download comes back as a
      // binary attachment. Detect errors here so we never navigate the SPA away
      // to a raw JSON page (the old window.location approach did exactly that).
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || contentType.includes("application/json")) {
        let msg = "Download failed. Please try again.";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          /* non-JSON body */
        }
        throw new Error(msg);
      }

      // Derive the filename from the response headers, fall back to a sane name.
      const disposition = res.headers.get("content-disposition") || "";
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
      const filename = decodeURIComponent(match?.[1] || match?.[2] || `download.${type === "audio" ? quality : "mp4"}`);

      const blob = await res.blob();
      if (blob.size === 0) throw new Error("The download was empty. The content may be unavailable.");

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Give the browser a tick to start the save before revoking.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch (err: any) {
      setError(err?.message || "Download failed. Please check your connection and try again.");
    } finally {
      setDownloading(null);
    }
  };

  const sizeByHeight = new Map((info?.qualities || []).map((q) => [q.height, q.size]));
  const availableQualities = info
    ? COMMON_QUALITIES.filter((q) => info.videoHeights.some((h) => h >= q || (q === 360 && h <= 360))).map(
        (q) => ({ height: q, size: sizeByHeight.get(q) || 0 })
      )
    : [];
  const qualitiesToShow =
    platform.qualityLadder && availableQualities.length > 0 ? availableQualities : [];

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          placeholder={platform.placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchInfo()}
          className="flex-1 px-4 py-3 border border-[#111111]/10 rounded-sm focus:outline-none focus:border-[#FFD400] transition-colors"
        />
        <button
          onClick={fetchInfo}
          disabled={loadingInfo || !url}
          className="px-6 py-3 bg-[#111111] text-white font-semibold rounded-sm hover:bg-[#111111]/90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
        >
          {loadingInfo ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get Info"}
        </button>
      </div>

      {!hostMatches && url && (
        <p className="text-xs text-[#111111]/50">
          That doesn’t look like a {platform.label} link — it may still work, or switch to the matching tab.
        </p>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-100 text-sm">{error}</div>
      )}

      {info && (
        <div className="bg-white border border-[#111111]/10 rounded-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-6">
            {info.thumbnails?.length > 0 && (
              <div className="w-full sm:w-1/3 shrink-0">
                <img
                  src={info.thumbnails[info.thumbnails.length - 1].url}
                  alt={info.title}
                  className="w-full rounded-sm object-cover aspect-video bg-[#111111]/5"
                />
              </div>
            )}
            <div>
              <span
                className="inline-block mb-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white rounded-sm"
                style={{ backgroundColor: platform.accent }}
              >
                {info.platform || platform.label}
              </span>
              <h3 className="font-bold text-xl leading-tight mb-1 text-[#111111]">{info.title || "Untitled"}</h3>
              {info.uploader && <p className="text-sm text-[#111111]/60 mb-2">{info.uploader}</p>}
              {info.lengthSeconds && info.lengthSeconds !== "0" && (
                <p className="text-sm font-medium text-[#111111]/60 flex items-center gap-2">
                  <PlaySquare className="w-4 h-4" />
                  {formatDuration(info.lengthSeconds)}
                </p>
              )}
            </div>
          </div>

          {/* Permission */}
          <div className="pt-4 border-t border-[#111111]/10">
            <label className="flex items-start gap-3 p-3 bg-[#FAFAFA] rounded-sm border border-[#111111]/5 cursor-pointer hover:bg-[#111111]/5 transition-colors">
              <input
                type="checkbox"
                checked={permissionChecked}
                onChange={(e) => setPermissionChecked(e.target.checked)}
                className="mt-1 accent-[#111111] w-4 h-4 shrink-0"
              />
              <span className="text-sm text-[#111111]/80 select-none">
                I confirm that I own this content or have explicit permission from the creator to download it for
                personal use.
              </span>
            </label>
          </div>

          {downloading && (
            <div className="flex items-center gap-2 text-sm text-[#111111]/80 bg-[#FFF9E6] border border-[#FFD400]/40 rounded-sm p-3">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              Preparing <strong>{downloading}</strong> — high-quality videos are merged on the server, so this can
              take a little while. Please keep this tab open.
            </div>
          )}

          {/* Video options */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-[#111111]/60 flex items-center gap-2">
              <Video className="w-4 h-4" /> Video
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => download("video", "best", "Best Quality video")}
                disabled={!permissionChecked || !!downloading}
                className="flex flex-col items-center justify-center gap-0.5 px-4 py-2.5 bg-[#FFD400] text-[#111111] font-bold rounded-sm hover:brightness-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  {downloading === "Best Quality video" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Best Quality
                </span>
                {formatBytes(info.bestSize) && (
                  <span className="text-[10px] font-medium text-[#111111]/60">{formatBytes(info.bestSize)}</span>
                )}
              </button>
              {qualitiesToShow.map((q) => {
                const lbl = `${qualityLabel(q.height)} video`;
                const size = formatBytes(q.size);
                return (
                  <button
                    key={q.height}
                    onClick={() => download("video", String(q.height), lbl)}
                    disabled={!permissionChecked || !!downloading}
                    className="flex flex-col items-center justify-center gap-0.5 px-4 py-2.5 border border-[#111111]/15 rounded-sm font-semibold hover:border-[#FFD400] hover:bg-[#FFD400]/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2">
                      {downloading === lbl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-[#111111]/50" />} {qualityLabel(q.height)}
                    </span>
                    {size && <span className="text-[10px] font-medium text-[#111111]/45">{size}</span>}
                  </button>
                );
              })}
            </div>
            {platform.qualityLadder && (
              <p className="text-xs text-[#111111]/45">
                Higher resolutions are merged with the best audio track automatically.
              </p>
            )}
          </div>

          {/* Audio options */}
          {info.hasAudio && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm uppercase tracking-wider text-[#111111]/60 flex items-center gap-2">
                <Music className="w-4 h-4" /> Audio only
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => download("audio", "mp3", "MP3 audio")}
                  disabled={!permissionChecked || !!downloading}
                  className="flex flex-col items-center justify-center gap-0.5 px-4 py-2.5 border border-[#111111]/15 rounded-sm font-semibold hover:border-[#FFD400] hover:bg-[#FFD400]/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    {downloading === "MP3 audio" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4 text-[#111111]/50" />} MP3
                  </span>
                  {formatBytes(info.audioSize) && (
                    <span className="text-[10px] font-medium text-[#111111]/45">{formatBytes(info.audioSize)}</span>
                  )}
                </button>
                <button
                  onClick={() => download("audio", "m4a", "M4A audio")}
                  disabled={!permissionChecked || !!downloading}
                  className="flex flex-col items-center justify-center gap-0.5 px-4 py-2.5 border border-[#111111]/15 rounded-sm font-semibold hover:border-[#FFD400] hover:bg-[#FFD400]/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    {downloading === "M4A audio" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4 text-[#111111]/50" />} M4A
                  </span>
                  {formatBytes(info.audioSize) && (
                    <span className="text-[10px] font-medium text-[#111111]/45">{formatBytes(info.audioSize)}</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!info && !error && (
        <p className="text-sm text-[#111111]/40">
          Example: <span className="font-mono">{platform.example}</span>
        </p>
      )}
    </div>
  );
}

export function SocialDownloaderTool() {
  const [active, setActive] = useState<PlatformId>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("platform");
      if (p && PLATFORMS.some((pl) => pl.id === p)) return p as PlatformId;
    }
    return "youtube";
  });

  const activePlatform = PLATFORMS.find((p) => p.id === active)!;

  return (
    <ToolLayout
      title="Social Media Downloader"
      description="Download videos and audio from YouTube, Instagram, TikTok, and Facebook — each with its own dedicated downloader."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-[#FFF9E6] border border-[#FFD400]/50 p-4 rounded-sm flex gap-3 text-[#111111]/80 text-sm">
          <AlertCircle className="w-5 h-5 text-[#FFD400] flex-shrink-0" />
          <p>
            <strong>Disclaimer:</strong> For educational and personal use only. Downloading copyrighted material
            without permission violates the platform’s Terms of Service. Please respect content creators.
          </p>
        </div>

        {/* Platform tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-[#111111]/5 rounded-sm">
          {PLATFORMS.map((p) => {
            const isActive = p.id === active;
            return (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm text-sm font-semibold transition-colors ${
                  isActive ? "bg-white shadow-sm text-[#111111]" : "text-[#111111]/55 hover:text-[#111111]"
                }`}
                style={isActive ? { color: p.accent } : undefined}
              >
                <p.Icon className="w-4 h-4" />
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Active panel — keyed so state resets when switching platforms */}
        <DownloaderPanel key={activePlatform.id} platform={activePlatform} />
      </div>
    </ToolLayout>
  );
}
