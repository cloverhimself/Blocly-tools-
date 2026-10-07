"use client";

import { lazy, Suspense, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { type ToolComponentSlug } from "./toolSlugs";

function page(loader: () => Promise<any>, key: string): ComponentType<any> {
  return lazy(() => loader().then((m) => ({ default: m[key] })));
}

function browserOnlyPage(loader: () => Promise<any>, key: string): ComponentType<any> {
  return dynamic(() => loader().then((m) => m[key]), {
    ssr: false,
    loading: PageFallback,
  });
}

const toolComponents = {
  "word-counter": page(() => import("../tool-pages/WordCounterTool"), "WordCounterTool"),
  "case-converter": page(() => import("../tool-pages/CaseConverterTool"), "CaseConverterTool"),
  "unit-converter": page(() => import("../tool-pages/UnitConverterTool"), "UnitConverterTool"),
  "video-to-audio": browserOnlyPage(() => import("../tool-pages/VideoToAudio"), "VideoToAudio"),
  "audio-convert": browserOnlyPage(() => import("../tool-pages/AudioConvertTool"), "AudioConvertTool"),
  base64: page(() => import("../tool-pages/Base64Tool"), "Base64Tool"),
  "fancy-font": page(() => import("../tool-pages/FancyFontTool"), "FancyFontTool"),
  qrcode: page(() => import("../tool-pages/QrCodeTool"), "QrCodeTool"),
  hash: page(() => import("../tool-pages/HashGeneratorTool"), "HashGeneratorTool"),
  json: page(() => import("../tool-pages/JsonFormatterTool"), "JsonFormatterTool"),
  gitignore: page(() => import("../tool-pages/GitignoreTool"), "GitignoreTool"),
  jwt: page(() => import("../tool-pages/JwtDecoderTool"), "JwtDecoderTool"),
  "jwt-generator": page(() => import("../tool-pages/JwtGeneratorTool"), "JwtGeneratorTool"),
  "image-convert": page(() => import("../tool-pages/ImageConvertTool"), "ImageConvertTool"),
  "image-compress": page(() => import("../tool-pages/ImageCompressTool"), "ImageCompressTool"),
  "image-resize": page(() => import("../tool-pages/ImageResizeTool"), "ImageResizeTool"),
  "compress-audio": browserOnlyPage(() => import("../tool-pages/CompressAudioTool"), "CompressAudioTool"),
  uuid: page(() => import("../tool-pages/UuidTool"), "UuidTool"),
  dockerfile: page(() => import("../tool-pages/DockerfileTool"), "DockerfileTool"),
  "hex-rgb": page(() => import("../tool-pages/HexRgbTool"), "HexRgbTool"),
  license: page(() => import("../tool-pages/LicenseTool"), "LicenseTool"),
  "json-to-ts": page(() => import("../tool-pages/JsonToTsTool"), "JsonToTsTool"),
  "json-to-zod": page(() => import("../tool-pages/JsonToZodTool"), "JsonToZodTool"),
  regex: page(() => import("../tool-pages/RegexTool"), "RegexTool"),
  password: page(() => import("../tool-pages/PasswordTool"), "PasswordTool"),
  bcrypt: page(() => import("../tool-pages/BcryptTool"), "BcryptTool"),
  "curl-to-fetch": page(() => import("../tool-pages/CurlToFetchTool"), "CurlToFetchTool"),
  "rgb-hsl": page(() => import("../tool-pages/RgbHslTool"), "RgbHslTool"),
  gradient: page(() => import("../tool-pages/GradientTool"), "GradientTool"),
  palette: page(() => import("../tool-pages/PaletteTool"), "PaletteTool"),
  "http-headers": page(() => import("../tool-pages/HttpHeaderTool"), "HttpHeaderTool"),
  metadata: page(() => import("../tool-pages/MetadataTool"), "MetadataTool"),
  "rest-api": page(() => import("../tool-pages/RestApiTool"), "RestApiTool"),
  "sql-formatter": page(() => import("../tool-pages/SqlFormatterTool"), "SqlFormatterTool"),
  "mongo-formatter": page(() => import("../tool-pages/MongoFormatterTool"), "MongoFormatterTool"),
  "json-to-sql": page(() => import("../tool-pages/JsonToSqlTool"), "JsonToSqlTool"),
  changelog: page(() => import("../tool-pages/ChangelogTool"), "ChangelogTool"),
  invoice: page(() => import("../tool-pages/InvoiceTool"), "InvoiceTool"),
  favicon: page(() => import("../tool-pages/FaviconTool"), "FaviconTool"),
  svg: page(() => import("../tool-pages/SvgTool"), "SvgTool"),
  "image-to-svg": page(() => import("../tool-pages/ImageToSvgTool"), "ImageToSvgTool"),
  "ppt-pdf": page(() => import("../tool-pages/PowerPointToPdfTool"), "PowerPointToPdfTool"),
  spreadsheet: page(() => import("../tool-pages/SpreadsheetConverterTool"), "SpreadsheetConverterTool"),
  document: page(() => import("../tool-pages/DocumentConverterTool"), "DocumentConverterTool"),
  "image-to-pdf": page(() => import("../tool-pages/ImageToPdfTool"), "ImageToPdfTool"),
  "pdf-to-image": page(() => import("../tool-pages/PdfToImageTool"), "PdfToImageTool"),
  "merge-pdf": page(() => import("../tool-pages/MergePdfTool"), "MergePdfTool"),
  "split-pdf": page(() => import("../tool-pages/SplitPdfTool"), "SplitPdfTool"),
  "compress-pdf": page(() => import("../tool-pages/CompressPdfTool"), "CompressPdfTool"),
  "organize-pdf": page(() => import("../tool-pages/OrganizePdfTool"), "OrganizePdfTool"),
  timezone: page(() => import("../tool-pages/TimezoneConverterTool"), "TimezoneConverterTool"),
  "test-data": page(() => import("../tool-pages/TestDataGeneratorTool"), "TestDataGeneratorTool"),
  "mock-api": page(() => import("../tool-pages/MockApiGeneratorTool"), "MockApiGeneratorTool"),
  timestamp: page(() => import("../tool-pages/TimestampConverterTool"), "TimestampConverterTool"),
  cron: page(() => import("../tool-pages/CronGeneratorTool"), "CronGeneratorTool"),
  "url-encoder": page(() => import("../tool-pages/UrlEncoderTool"), "UrlEncoderTool"),
  markdown: page(() => import("../tool-pages/MarkdownPreviewerTool"), "MarkdownPreviewerTool"),
  sitemap: page(() => import("../tool-pages/SitemapGeneratorTool"), "SitemapGeneratorTool"),
  "og-image": page(() => import("../tool-pages/OpenGraphImageGeneratorTool"), "OpenGraphImageGeneratorTool"),
  lorem: page(() => import("../tool-pages/LoremIpsumTool"), "LoremIpsumTool"),
  "typing-test": page(() => import("../tool-pages/TypingSpeedTestTool"), "TypingSpeedTestTool"),
  "pdf-word": lazy(() =>
    import("../tool-pages/FileConversionTool").then((m) => ({
      default: () => <m.FileConversionTool title="PDF to Word" type="pdf-word" />,
    }))
  ),
  "word-pdf": lazy(() =>
    import("../tool-pages/FileConversionTool").then((m) => ({
      default: () => <m.FileConversionTool title="Word to PDF" type="word-pdf" />,
    }))
  ),
  "excel-csv": lazy(() =>
    import("../tool-pages/FileConversionTool").then((m) => ({
      default: () => <m.FileConversionTool title="Excel to CSV" type="excel-csv" />,
    }))
  ),
} satisfies Record<ToolComponentSlug, ComponentType>;

function PageFallback() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-6 h-6 border-2 border-[#111111]/20 border-t-[#FFD400] rounded-full animate-spin" />
    </div>
  );
}

function MissingTool() {
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-10 md:py-14">
        <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
          Tool not found
        </h1>
        <p className="mt-4 text-[16px] leading-[1.5] text-[#111111]/66">
          This tool is not available yet.
        </p>
      </main>
      <Footer />
    </div>
  );
}

export function ToolPageClient({ slug }: { slug: string }) {
  const Tool = toolComponents[slug as keyof typeof toolComponents];
  if (!Tool) return <MissingTool />;
  return (
    <Suspense fallback={<PageFallback />}>
      <Tool />
    </Suspense>
  );
}
