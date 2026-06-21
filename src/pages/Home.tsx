import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { SearchBar } from "../components/SearchBar";
import { ToolCard } from "../components/ToolCard";
import fuzzysort from "fuzzysort";
import { toolId } from "../lib/toolId";
import { useI18n } from "../lib/i18n";
import {
  AudioWaveform,
  FileAudio,
  Image as ImageIcon,
  FileMinus,
  FileImage,
  QrCode,
  FileText,
  Table,
  Braces,
  FileCode2,
  FileJson,
  Key,
  Fingerprint,
  SearchCode,
  Terminal,
  Type,
  Replace,
  Hash,
  ShieldAlert,
  Scale,
  Lock,
  Box,
  ListTree,
  Code,
  MonitorSmartphone,
  Database,
  DatabaseZap,
  DatabaseBackup,
  Palette,
  Pipette,
  PaintBucket,
  Paintbrush,
  Network,
  Server,
  ImagePlus,
  AppWindow,
  Settings,
  Clock,
  CalendarDays,
  Link2,
  LayoutTemplate,
  Map as MapIcon,
  Type as TypeIcon,
  Ruler,
  AlignLeft,
  Youtube,
  Instagram,
  Facebook,
  Music2
} from "lucide-react";

export function Home() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [usageStats, setUsageStats] = useState<Record<string, number>>(() => {
    try {
      const data = localStorage.getItem("tools_usage_stats");
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  });

  // Admin-disabled tools (greyed out for everyone). Empty when Supabase is
  // not configured, so all tools stay visible.
  const [disabledTools, setDisabledTools] = useState<Set<string>>(new Set());
  useEffect(() => {
    // Loaded async (separate chunk) so the Supabase client never blocks first paint.
    import("../lib/analytics")
      .then((m) => m.fetchDisabledTools())
      .then(setDisabledTools)
      .catch(() => {});
  }, []);

  const trackUsage = (name: string) => {
    // Local stat immediately (for popularity); Supabase event fire-and-forget.
    setUsageStats((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
    import("../lib/analytics").then((m) => m.trackToolOpen(name)).catch(() => {});
  };

  const rawCategories = [
    {
      name: "Social Media Downloader",
      tools: [
        {
          name: "YouTube Downloader",
          desc: "Download YouTube videos, Shorts & audio",
          icon: <Youtube />,
          to: "/tools/social-downloader?platform=youtube",
          keywords: ["youtube", "yt", "download", "video", "shorts", "mp4", "mp3", "music", "social"],
        },
        {
          name: "Instagram Downloader",
          desc: "Save Reels, posts & video clips",
          icon: <Instagram />,
          to: "/tools/social-downloader?platform=instagram",
          keywords: ["instagram", "ig", "reel", "reels", "post", "download", "video", "social"],
        },
        {
          name: "TikTok Downloader",
          desc: "Download TikTok videos without watermark",
          icon: <Music2 />,
          to: "/tools/social-downloader?platform=tiktok",
          keywords: ["tiktok", "tik tok", "download", "video", "watermark", "social", "clip"],
        },
        {
          name: "Facebook Downloader",
          desc: "Save Facebook videos, Reels & watch clips",
          icon: <Facebook />,
          to: "/tools/social-downloader?platform=facebook",
          keywords: ["facebook", "fb", "reel", "watch", "download", "video", "social"],
        },
        {
          name: "X (Twitter) Downloader",
          desc: "Download videos from X posts",
          icon: <MonitorSmartphone />,
          to: "/tools/social-downloader?platform=x",
          keywords: ["x", "twitter", "download", "video", "post", "tweet", "social"],
        },
      ],
    },
    {
      name: "Everyday Tools",
      tools: [
        {
          name: "Word Counter",
          desc: "Count words, characters, and sentences",
          icon: <AlignLeft />,
          to: "/tools/word-counter",
          keywords: ["word", "character", "count", "counter", "text", "sentences", "paragraphs"],
        },
        {
          name: "Case Converter",
          desc: "Convert to UPPERCASE, lowercase, CamelCase, etc",
          icon: <TypeIcon />,
          to: "/tools/case-converter",
          keywords: ["case", "convert", "uppercase", "lowercase", "text", "camelcase", "snake", "title"],
        },
        {
          name: "Unit Converter",
          desc: "Convert length, weight, and temperature",
          icon: <Ruler />,
          to: "/tools/unit-converter",
          keywords: ["unit", "convert", "length", "weight", "temperature", "meters", "kilograms", "farenheit"],
        },
        {
          name: "Timezone Converter",
          desc: "Convert times between any time zones",
          icon: <Clock />,
          to: "/tools/timezone",
          keywords: ["timezone", "time zone", "convert", "utc", "gmt", "world clock", "meeting", "time"],
        },
        {
          name: "Password Strength",
          desc: "Check how secure your password is",
          icon: <ShieldAlert />,
          to: "/tools/password",
          keywords: ["password", "strength", "secure", "check", "entropy", "safety", "security"],
        },
        {
          name: "Fancy Font Generator",
          desc: "Copyable unicode text styles for bios & posts",
          icon: <Type />,
          to: "/tools/fancy-font",
          keywords: ["font", "fancy", "text", "style", "unicode", "copy", "paste", "bio", "instagram"],
        },
        {
          name: "QR Code Generator",
          desc: "High-res, lossless QR codes",
          icon: <QrCode />,
          to: "/tools/qrcode",
          keywords: ["qr", "qrcode", "barcode", "generate", "code"],
        },
      ],
    },
    {
      name: "Video & Audio",
      tools: [
        {
          name: "Convert Video to Audio",
          desc: "Extract MP3 or WAV from any clip",
          icon: <AudioWaveform />,
          to: "/tools/video-to-audio",
          keywords: ["mp4", "mp3", "wav", "extract", "audio", "video"],
        },
        {
          name: "Convert Audio",
          desc: "Between MP3, WAV, AAC and OGG",
          icon: <FileAudio />,
          to: "/tools/audio-convert",
          keywords: ["mp3", "wav", "aac", "ogg", "flac", "audio", "convert"],
        },
        {
          name: "Compress Audio",
          desc: "Reduce file sizes instantly",
          icon: <FileMinus />,
          to: "/tools/compress-audio",
          keywords: ["audio", "compress", "size", "bitrate", "mp3", "shrink", "reduce"],
        },
      ],
    },
    {
      name: "Images",
      tools: [
        {
          name: "OpenGraph Image Generator",
          desc: "Preview and generate OG cards",
          icon: <MonitorSmartphone />,
          to: "/tools/og-image",
          keywords: ["og", "opengraph", "social", "twitter", "facebook", "card", "meta", "generate"],
        },
        {
          name: "Convert Image",
          desc: "PNG, JPG, WebP and AVIF",
          icon: <ImageIcon />,
          to: "/tools/image-convert",
          keywords: ["png", "jpg", "jpeg", "webp", "avif", "image", "convert"],
        },
        {
          name: "Compress Image",
          desc: "Smaller files, sharp detail",
          icon: <FileMinus />,
          to: "/tools/image-compress",
          keywords: ["compress", "shrink", "reduce", "optimize", "image", "size"],
        },
        {
          name: "Resize Image",
          desc: "Set exact pixel dimensions",
          icon: <FileImage />,
          to: "/tools/image-resize",
          keywords: ["resize", "scale", "crop", "dimensions", "width", "height", "image"],
        },
        {
          name: "Favicon Generator",
          desc: "Generate multi-size favicons",
          icon: <AppWindow />,
          to: "/tools/favicon",
          keywords: ["favicon", "icon", "website", "generate", "ico"],
        },
        {
          name: "SVG Viewer & Converter",
          desc: "Preview and convert SVGs",
          icon: <ImagePlus />,
          to: "/tools/svg",
          keywords: ["svg", "vector", "convert", "viewer", "png", "jpg", "image"],
        },
      ],
    },
    {
      name: "File Conversion",
      tools: [
        {
          name: "Spreadsheet Converter",
          desc: "Convert between XLSX, XLS, CSV, ODS, JSON",
          icon: <Table />,
          to: "/tools/spreadsheet",
          keywords: ["excel", "csv", "xls", "xlsx", "ods", "json", "sheet", "spreadsheet", "convert"],
        },
        {
          name: "Document Converter",
          desc: "Word, text, HTML and PDF interchange",
          icon: <FileText />,
          to: "/tools/document",
          keywords: ["word", "docx", "doc", "pdf", "txt", "html", "markdown", "document", "convert"],
        },
        {
          name: "PowerPoint to PDF",
          desc: "Convert .pptx slides to PDF in your browser",
          icon: <FileText />,
          to: "/tools/ppt-pdf",
          keywords: ["powerpoint", "ppt", "pptx", "pdf", "slides", "presentation", "convert"],
        },
        {
          name: "PDF to Word",
          desc: "Extract PDF text into an editable doc",
          icon: <FileText />,
          to: "/tools/pdf-word",
          keywords: ["pdf", "word", "docx", "convert", "document"],
        },
      ],
    },
    {
      name: "PDF Tools",
      tools: [
        {
          name: "Merge PDF",
          desc: "Combine multiple PDFs into one",
          icon: <FileText />,
          to: "/tools/merge-pdf",
          keywords: ["pdf", "merge", "combine", "join", "concatenate"],
        },
        {
          name: "Split PDF",
          desc: "Extract pages or split into files",
          icon: <FileText />,
          to: "/tools/split-pdf",
          keywords: ["pdf", "split", "extract", "pages", "separate"],
        },
        {
          name: "Compress PDF",
          desc: "Reduce PDF file size",
          icon: <FileMinus />,
          to: "/tools/compress-pdf",
          keywords: ["pdf", "compress", "shrink", "reduce", "size", "optimize"],
        },
        {
          name: "Organize PDF",
          desc: "Reorder and delete pages visually",
          icon: <AppWindow />,
          to: "/tools/organize-pdf",
          keywords: ["pdf", "organize", "reorder", "delete", "pages", "rearrange", "rotate"],
        },
        {
          name: "Image to PDF",
          desc: "Combine JPG and PNG into a PDF",
          icon: <ImageIcon />,
          to: "/tools/image-to-pdf",
          keywords: ["image", "jpg", "png", "pdf", "convert", "combine", "photo"],
        },
        {
          name: "PDF to Image",
          desc: "Export PDF pages as PNG or JPG",
          icon: <FileImage />,
          to: "/tools/pdf-to-image",
          keywords: ["pdf", "image", "png", "jpg", "convert", "export", "pages"],
        },
      ],
    },
    {
      name: "Developer",
      tools: [
        {
          name: "Test Data Generator",
          desc: "Generate fake JSON/CSV data",
          icon: <Settings />,
          to: "/tools/test-data",
          keywords: ["fake", "mock", "test", "data", "json", "csv", "generator", "faker"],
        },
        {
          name: "JSON Formatter",
          desc: "Prettify, minify and validate",
          icon: <Braces />,
          to: "/tools/json",
          keywords: ["json", "format", "prettify", "minify", "validate", "lint", "beautify"],
        },
        {
          name: "JSON to TypeScript",
          desc: "Convert JSON to TS interfaces",
          icon: <FileCode2 />,
          to: "/tools/json-to-ts",
          keywords: ["json", "ts", "typescript", "interface", "type", "convert", "generator"],
        },
        {
          name: "JSON to Zod",
          desc: "Convert JSON to Zod schema",
          icon: <FileJson />,
          to: "/tools/json-to-zod",
          keywords: ["json", "zod", "schema", "validation", "typescript", "convert"],
        },
        {
          name: "JWT Decoder",
          desc: "Decode JSON Web Tokens",
          icon: <Key />,
          to: "/tools/jwt",
          keywords: ["jwt", "token", "decode", "parse", "json web token"],
        },
        {
          name: "JWT Generator",
          desc: "Generate JSON Web Tokens",
          icon: <Key />,
          to: "/tools/jwt-generator",
          keywords: ["jwt", "token", "generate", "create", "sign", "json web token"],
        },
        {
          name: "UUID Generator",
          desc: "Generate universally unique identifiers",
          icon: <Fingerprint />,
          to: "/tools/uuid",
          keywords: ["uuid", "guid", "generate", "v4", "v1", "identifier"],
        },
        {
          name: "URL Encoder / Decoder",
          desc: "Encode or decode URLs",
          icon: <Link2 />,
          to: "/tools/url-encoder",
          keywords: ["url", "encode", "decode", "uri", "percent", "escape"],
        },
        {
          name: "Cron Expression Generator",
          desc: "Decode and generate cron jobs",
          icon: <CalendarDays />,
          to: "/tools/cron",
          keywords: ["cron", "schedule", "job", "time", "generate", "parse", "expression"],
        },
        {
          name: "Timestamp Converter",
          desc: "Convert Unix time to human date",
          icon: <Clock />,
          to: "/tools/timestamp",
          keywords: ["timestamp", "unix", "epoch", "time", "date", "convert", "human readable"],
        },
        {
          name: "Markdown Previewer",
          desc: "Live Markdown formatting preview",
          icon: <LayoutTemplate />,
          to: "/tools/markdown",
          keywords: ["md", "markdown", "preview", "editor", "format", "live"],
        },
        {
          name: "Lorem Ipsum Generator",
          desc: "Generate random placeholder text",
          icon: <FileText />,
          to: "/tools/lorem",
          keywords: ["lorem", "ipsum", "placeholder", "text", "dummy", "generator"],
        },
        {
          name: "Regex Tester",
          desc: "Test and debug regular expressions",
          icon: <SearchCode />,
          to: "/tools/regex",
          keywords: ["regex", "regular expression", "test", "match", "replace", "pattern"],
        },
        {
          name: ".gitignore Generator",
          desc: "Create gitignores for any stack",
          icon: <FileText />,
          to: "/tools/gitignore",
          keywords: ["git", "gitignore", "ignore", "repo", "repository", "generate"],
        },
        {
          name: "Curl to Fetch",
          desc: "Convert curl commands to fetch API",
          icon: <Terminal />,
          to: "/tools/curl-to-fetch",
          keywords: ["curl", "fetch", "http", "request", "convert", "api"],
        },
        {
          name: "Base64 Encode / Decode",
          desc: "Text and small files",
          icon: <Replace />,
          to: "/tools/base64",
          keywords: ["base64", "encode", "decode", "text", "format", "convert"],
        },
        {
          name: "Hash Generator",
          desc: "SHA-256, SHA-1 and MD5",
          icon: <Hash />,
          to: "/tools/hash",
          keywords: ["hash", "md5", "sha1", "sha256", "sha512", "crypto", "generate"],
        },
        {
          name: "License Generator",
          desc: "Generate MIT, Apache, GPL licenses",
          icon: <Scale />,
          to: "/tools/license",
          keywords: ["license", "mit", "apache", "gpl", "open source", "generate"],
        },
        {
          name: "bcrypt Generator",
          desc: "Generate bcrypt password hashes",
          icon: <Lock />,
          to: "/tools/bcrypt",
          keywords: ["bcrypt", "hash", "password", "crypto", "generate", "compare"],
        },
      ],
    },
    {
      name: "DevOps & SEO",
      tools: [
        {
          name: "Sitemap Generator",
          desc: "Generate XML sitemaps",
          icon: <MapIcon />,
          to: "/tools/sitemap",
          keywords: ["sitemap", "xml", "seo", "generate", "url", "bot"],
        },
        {
          name: "Dockerfile Generator",
          desc: "Generate Dockerfiles for Node, Python, Go",
          icon: <Box />,
          to: "/tools/dockerfile",
          keywords: ["docker", "dockerfile", "container", "generate", "image", "devops"],
        },
        {
          name: "Changelog Generator",
          desc: "Create standard changelogs",
          icon: <ListTree />,
          to: "/tools/changelog",
          keywords: ["changelog", "release", "notes", "version", "history", "generate"],
        },
        {
          name: "Metadata Generator",
          desc: "Generate OpenGraph meta tags",
          icon: <Code />,
          to: "/tools/metadata",
          keywords: ["meta", "tags", "seo", "html", "head", "generate", "opengraph"],
        },
      ],
    },
    {
      name: "Database Tools",
      tools: [
        {
          name: "SQL Query Formatter",
          desc: "Beautify SQL statements",
          icon: <Database />,
          to: "/tools/sql-formatter",
          keywords: ["sql", "format", "beautify", "query", "database", "postgres", "mysql"],
        },
        {
          name: "MongoDB Query Formatter",
          desc: "Format MongoDB queries",
          icon: <DatabaseZap />,
          to: "/tools/mongo-formatter",
          keywords: ["mongo", "mongodb", "format", "query", "nosql", "database", "beautify"],
        },
        {
          name: "JSON to SQL Insert",
          desc: "Convert JSON array to SQL inserts",
          icon: <DatabaseBackup />,
          to: "/tools/json-to-sql",
          keywords: ["json", "sql", "insert", "convert", "database", "query", "table"],
        },
      ],
    },
    {
      name: "Color Tools",
      tools: [
        {
          name: "HEX to RGB",
          desc: "Convert HEX colors to RGB",
          icon: <Palette />,
          to: "/tools/hex-rgb",
          keywords: ["hex", "rgb", "color", "convert", "css"],
        },
        {
          name: "RGB to HSL",
          desc: "Convert RGB colors to HSL",
          icon: <Pipette />,
          to: "/tools/rgb-hsl",
          keywords: ["rgb", "hsl", "color", "convert", "css"],
        },
        {
          name: "Gradient Generator",
          desc: "Create CSS gradients",
          icon: <PaintBucket />,
          to: "/tools/gradient",
          keywords: ["gradient", "css", "color", "generator", "background", "linear", "radial"],
        },
        {
          name: "Color Palette",
          desc: "Generate color schemes",
          icon: <Paintbrush />,
          to: "/tools/palette",
          keywords: ["color", "palette", "scheme", "generator", "theme", "combinations", "analogous", "complementary"],
        },
      ],
    },
    {
      name: "API Tools",
      tools: [
        {
          name: "REST API Tester",
          desc: "Test HTTP requests",
          icon: <Network />,
          to: "/tools/rest-api",
          keywords: ["api", "rest", "http", "fetch", "tester", "postman", "client", "request"],
        },
        {
          name: "HTTP Header Viewer",
          desc: "View HTTP request and response headers",
          icon: <Server />,
          to: "/tools/http-headers",
          keywords: ["http", "headers", "request", "response", "viewer", "sniff", "api"],
        },
      ],
    },
    {
      name: "Business",
      tools: [
        {
          name: "Invoice Generator",
          desc: "Create and print beautiful invoices",
          icon: <FileText />,
          to: "/tools/invoice",
          keywords: ["invoice", "bill", "receipt", "generate", "pdf", "print", "business"],
        },
      ],
    },
  ];

  const q = query.trim();
  let searchResultsDropdown: { category: string; items: any[] }[] = [];

  let totalTools = 0;
  let shownTools = 0;

  const allToolsFlat = rawCategories.flatMap((c) => c.tools);

  // Build recommended tools based on usage and some default featured things
  const popularTools = [...allToolsFlat]
    .filter((a) => (usageStats[a.name] || 0) > 0)
    .sort((a, b) => {
      const countA = usageStats[a.name] || 0;
      const countB = usageStats[b.name] || 0;
      return countB - countA;
    })
    .slice(0, 4);

  const popularToolNames = new Set(popularTools.map((t) => t.name));

  let categories = rawCategories.map((cat) => {
    totalTools += cat.tools.length;
    let filteredTools = cat.tools;

    if (q) {
      // Search logic handled below for dropdown.
      // In grid, we just hide sections if needed (currently we don't hide grid on search, we have dropdown)
    }
    return {
      ...cat,
      count:
        filteredTools.length === 1
          ? "1 tool"
          : `${filteredTools.length} tools`,
      tools: filteredTools.map(t => ({
        ...t,
        featured: popularToolNames.has(t.name)
      })),
    };
  });

  if (popularTools.length > 0) {
    categories.unshift({
      name: t("recommended"),
      count: "Top picks",
      tools: popularTools.map(t => ({ ...t, featured: true })),
    });
  }

  if (q) {
    const allTools = rawCategories.flatMap((c) =>
      c.tools.map((t) => ({ ...t, category: c.name, keywordsStr: t.keywords?.join(" ") || "" }))
    );

    const results = fuzzysort.go(q, allTools, {
      keys: ["name", "desc", "category", "keywordsStr"],
      threshold: -10000,
      // Give heavy weight to name matches
      scoreFn: (a) =>
        Math.max(
          a[0] ? a[0].score : -1000,
          a[1] ? a[1].score - 100 : -1000,
          a[2] ? a[2].score - 200 : -1000,
          a[3] ? a[3].score - 50 : -1000
        ),
    });

    const matchedTools = results.map((r) => r.obj);
    shownTools = matchedTools.length;

    // Group for dropdown
    const groups = new Map<string, any[]>();
    matchedTools.forEach((t) => {
      if (!groups.has(t.category)) groups.set(t.category, []);
      groups
        .get(t.category)!
        .push({ name: t.name, desc: t.desc, to: t.to, category: t.category });
    });
    searchResultsDropdown = Array.from(groups.entries()).map(
      ([category, items]) => ({ category, items })
    );
  } else {
    shownTools = totalTools;
  }

  const isSearching = q.length > 0;

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-5 py-10 md:py-14">
          <h1 className="m-0 font-extrabold text-4xl md:text-6xl leading-[1.02] tracking-[-0.035em] max-w-[20ch]">
            {t("heroA")}{" "}
            <span className="border-b-[0.16em] border-[#FFD400] pb-[0.02em]">
              {t("heroB")}
            </span>
          </h1>
          <p className="mt-6 text-[16px] md:text-[17px] leading-relaxed text-[#111111]/60 max-w-[54ch]">
            {t("heroSub")}
          </p>

          <div className="mt-8 max-w-[560px]">
            <SearchBar
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search", { n: totalTools })}
              countLabel={isSearching ? t("found", { n: shownTools }) : t("toolsCount", { n: totalTools })}
              results={searchResultsDropdown}
              onSelect={trackUsage}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
          {categories.map((cat, i) => {
            // Let the page show all categories by default on the grid
            return (
              <div key={i} className="mb-10 last:mb-0">
                <div className="flex items-center gap-3.5 mb-5">
                  <h2 className="m-0 text-[17px] font-extrabold tracking-[-0.01em]">
                    {cat.name}
                  </h2>
                  <span className="font-mono text-[11.5px] text-[#111111]/45">
                    {cat.count}
                  </span>
                  <span className="flex-1 h-px bg-[#111111]"></span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cat.tools.map((t, j) => (
                    <ToolCard
                      key={j}
                      label={t.name}
                      desc={t.desc}
                      iconEl={t.icon}
                      featured={(t as any).featured}
                      to={t.to}
                      disabled={(t as any).disabled || disabledTools.has(toolId(t.name))}
                      cloud={(t as any).cloud}
                      onClick={() => trackUsage(t.name)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
