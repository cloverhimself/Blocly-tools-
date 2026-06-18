import { BrowserRouter as Router, Routes as SwitchRoutes, Route as SwitchRoute } from "react-router-dom";
import { lazy, Suspense, type ComponentType } from "react";
import { Home } from "./pages/Home"; // eager: it's the landing page

// Lazily load a named export so each tool ships as its own chunk and the
// initial bundle stays tiny (big libs like recharts/ffmpeg load only on demand).
function page(loader: () => Promise<any>, key: string): ComponentType<any> {
  return lazy(() => loader().then((m) => ({ default: m[key] })));
}

const Dashboard = page(() => import("./pages/Dashboard"), "Dashboard");
const SocialDownloaderTool = page(() => import("./pages/SocialDownloaderTool"), "SocialDownloaderTool");
const VideoToAudio = page(() => import("./pages/VideoToAudio"), "VideoToAudio");
const AudioConvertTool = page(() => import("./pages/AudioConvertTool"), "AudioConvertTool");
const CompressAudioTool = page(() => import("./pages/CompressAudioTool"), "CompressAudioTool");
const Base64Tool = page(() => import("./pages/Base64Tool"), "Base64Tool");
const FancyFontTool = page(() => import("./pages/FancyFontTool"), "FancyFontTool");
const QrCodeTool = page(() => import("./pages/QrCodeTool"), "QrCodeTool");
const HashGeneratorTool = page(() => import("./pages/HashGeneratorTool"), "HashGeneratorTool");
const JsonFormatterTool = page(() => import("./pages/JsonFormatterTool"), "JsonFormatterTool");
const GitignoreTool = page(() => import("./pages/GitignoreTool"), "GitignoreTool");
const JwtDecoderTool = page(() => import("./pages/JwtDecoderTool"), "JwtDecoderTool");
const JwtGeneratorTool = page(() => import("./pages/JwtGeneratorTool"), "JwtGeneratorTool");
const ImageConvertTool = page(() => import("./pages/ImageConvertTool"), "ImageConvertTool");
const ImageCompressTool = page(() => import("./pages/ImageCompressTool"), "ImageCompressTool");
const ImageResizeTool = page(() => import("./pages/ImageResizeTool"), "ImageResizeTool");
const UuidTool = page(() => import("./pages/UuidTool"), "UuidTool");
const DockerfileTool = page(() => import("./pages/DockerfileTool"), "DockerfileTool");
const HexRgbTool = page(() => import("./pages/HexRgbTool"), "HexRgbTool");
const LicenseTool = page(() => import("./pages/LicenseTool"), "LicenseTool");
const JsonToTsTool = page(() => import("./pages/JsonToTsTool"), "JsonToTsTool");
const JsonToZodTool = page(() => import("./pages/JsonToZodTool"), "JsonToZodTool");
const RegexTool = page(() => import("./pages/RegexTool"), "RegexTool");
const PasswordTool = page(() => import("./pages/PasswordTool"), "PasswordTool");
const BcryptTool = page(() => import("./pages/BcryptTool"), "BcryptTool");
const CurlToFetchTool = page(() => import("./pages/CurlToFetchTool"), "CurlToFetchTool");
const RgbHslTool = page(() => import("./pages/RgbHslTool"), "RgbHslTool");
const GradientTool = page(() => import("./pages/GradientTool"), "GradientTool");
const PaletteTool = page(() => import("./pages/PaletteTool"), "PaletteTool");
const HttpHeaderTool = page(() => import("./pages/HttpHeaderTool"), "HttpHeaderTool");
const MetadataTool = page(() => import("./pages/MetadataTool"), "MetadataTool");
const RestApiTool = page(() => import("./pages/RestApiTool"), "RestApiTool");
const WordCounterTool = page(() => import("./pages/WordCounterTool"), "WordCounterTool");
const CaseConverterTool = page(() => import("./pages/CaseConverterTool"), "CaseConverterTool");
const UnitConverterTool = page(() => import("./pages/UnitConverterTool"), "UnitConverterTool");
const SqlFormatterTool = page(() => import("./pages/SqlFormatterTool"), "SqlFormatterTool");
const MongoFormatterTool = page(() => import("./pages/MongoFormatterTool"), "MongoFormatterTool");
const JsonToSqlTool = page(() => import("./pages/JsonToSqlTool"), "JsonToSqlTool");
const ChangelogTool = page(() => import("./pages/ChangelogTool"), "ChangelogTool");
const InvoiceTool = page(() => import("./pages/InvoiceTool"), "InvoiceTool");
const FileConversionTool = page(() => import("./pages/FileConversionTool"), "FileConversionTool");
const PowerPointToPdfTool = page(() => import("./pages/PowerPointToPdfTool"), "PowerPointToPdfTool");
const SpreadsheetConverterTool = page(() => import("./pages/SpreadsheetConverterTool"), "SpreadsheetConverterTool");
const DocumentConverterTool = page(() => import("./pages/DocumentConverterTool"), "DocumentConverterTool");
const ImageToPdfTool = page(() => import("./pages/ImageToPdfTool"), "ImageToPdfTool");
const PdfToImageTool = page(() => import("./pages/PdfToImageTool"), "PdfToImageTool");
const MergePdfTool = page(() => import("./pages/MergePdfTool"), "MergePdfTool");
const SplitPdfTool = page(() => import("./pages/SplitPdfTool"), "SplitPdfTool");
const CompressPdfTool = page(() => import("./pages/CompressPdfTool"), "CompressPdfTool");
const OrganizePdfTool = page(() => import("./pages/OrganizePdfTool"), "OrganizePdfTool");
const TimezoneConverterTool = page(() => import("./pages/TimezoneConverterTool"), "TimezoneConverterTool");
const FaviconTool = page(() => import("./pages/FaviconTool"), "FaviconTool");
const SvgTool = page(() => import("./pages/SvgTool"), "SvgTool");
const TestDataGeneratorTool = page(() => import("./pages/TestDataGeneratorTool"), "TestDataGeneratorTool");
const TimestampConverterTool = page(() => import("./pages/TimestampConverterTool"), "TimestampConverterTool");
const CronGeneratorTool = page(() => import("./pages/CronGeneratorTool"), "CronGeneratorTool");
const UrlEncoderTool = page(() => import("./pages/UrlEncoderTool"), "UrlEncoderTool");
const MarkdownPreviewerTool = page(() => import("./pages/MarkdownPreviewerTool"), "MarkdownPreviewerTool");
const SitemapGeneratorTool = page(() => import("./pages/SitemapGeneratorTool"), "SitemapGeneratorTool");
const OpenGraphImageGeneratorTool = page(() => import("./pages/OpenGraphImageGeneratorTool"), "OpenGraphImageGeneratorTool");
const LoremIpsumTool = page(() => import("./pages/LoremIpsumTool"), "LoremIpsumTool");

function RouteFallback() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-6 h-6 border-2 border-[#111111]/20 border-t-[#FFD400] rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
        <SwitchRoutes>
          <SwitchRoute path="/" element={<Home />} />
          <SwitchRoute path="/dashboard" element={<Dashboard />} />
          <SwitchRoute path="/tools/word-counter" element={<WordCounterTool />} />
          <SwitchRoute path="/tools/case-converter" element={<CaseConverterTool />} />
          <SwitchRoute path="/tools/unit-converter" element={<UnitConverterTool />} />
          <SwitchRoute path="/tools/social-downloader" element={<SocialDownloaderTool />} />
          <SwitchRoute path="/tools/youtube-downloader" element={<SocialDownloaderTool />} />
          <SwitchRoute path="/tools/video-to-audio" element={<VideoToAudio />} />
          <SwitchRoute path="/tools/audio-convert" element={<AudioConvertTool />} />
          <SwitchRoute path="/tools/base64" element={<Base64Tool />} />
          <SwitchRoute path="/tools/fancy-font" element={<FancyFontTool />} />
          <SwitchRoute path="/tools/qrcode" element={<QrCodeTool />} />
          <SwitchRoute path="/tools/hash" element={<HashGeneratorTool />} />
          <SwitchRoute path="/tools/json" element={<JsonFormatterTool />} />
          <SwitchRoute path="/tools/gitignore" element={<GitignoreTool />} />
          <SwitchRoute path="/tools/jwt" element={<JwtDecoderTool />} />
          <SwitchRoute path="/tools/jwt-generator" element={<JwtGeneratorTool />} />
          <SwitchRoute path="/tools/image-convert" element={<ImageConvertTool />} />
          <SwitchRoute path="/tools/image-compress" element={<ImageCompressTool />} />
          <SwitchRoute path="/tools/image-resize" element={<ImageResizeTool />} />
          <SwitchRoute path="/tools/compress-audio" element={<CompressAudioTool />} />
          <SwitchRoute path="/tools/uuid" element={<UuidTool />} />
          <SwitchRoute path="/tools/dockerfile" element={<DockerfileTool />} />
          <SwitchRoute path="/tools/hex-rgb" element={<HexRgbTool />} />
          <SwitchRoute path="/tools/license" element={<LicenseTool />} />
          <SwitchRoute path="/tools/json-to-ts" element={<JsonToTsTool />} />
          <SwitchRoute path="/tools/json-to-zod" element={<JsonToZodTool />} />
          <SwitchRoute path="/tools/regex" element={<RegexTool />} />
          <SwitchRoute path="/tools/password" element={<PasswordTool />} />
          <SwitchRoute path="/tools/bcrypt" element={<BcryptTool />} />
          <SwitchRoute path="/tools/curl-to-fetch" element={<CurlToFetchTool />} />
          <SwitchRoute path="/tools/rgb-hsl" element={<RgbHslTool />} />
          <SwitchRoute path="/tools/gradient" element={<GradientTool />} />
          <SwitchRoute path="/tools/palette" element={<PaletteTool />} />
          <SwitchRoute path="/tools/http-headers" element={<HttpHeaderTool />} />
          <SwitchRoute path="/tools/metadata" element={<MetadataTool />} />
          <SwitchRoute path="/tools/rest-api" element={<RestApiTool />} />
          <SwitchRoute path="/tools/sql-formatter" element={<SqlFormatterTool />} />
          <SwitchRoute path="/tools/mongo-formatter" element={<MongoFormatterTool />} />
          <SwitchRoute path="/tools/json-to-sql" element={<JsonToSqlTool />} />
          <SwitchRoute path="/tools/changelog" element={<ChangelogTool />} />
          <SwitchRoute path="/tools/invoice" element={<InvoiceTool />} />
          <SwitchRoute path="/tools/favicon" element={<FaviconTool />} />
          <SwitchRoute path="/tools/svg" element={<SvgTool />} />
          <SwitchRoute path="/tools/pdf-word" element={<FileConversionTool title="PDF to Word" type="pdf-word" />} />
          <SwitchRoute path="/tools/word-pdf" element={<FileConversionTool title="Word to PDF" type="word-pdf" />} />
          <SwitchRoute path="/tools/excel-csv" element={<FileConversionTool title="Excel to CSV" type="excel-csv" />} />
          <SwitchRoute path="/tools/ppt-pdf" element={<PowerPointToPdfTool />} />
          <SwitchRoute path="/tools/spreadsheet" element={<SpreadsheetConverterTool />} />
          <SwitchRoute path="/tools/document" element={<DocumentConverterTool />} />
          <SwitchRoute path="/tools/image-to-pdf" element={<ImageToPdfTool />} />
          <SwitchRoute path="/tools/pdf-to-image" element={<PdfToImageTool />} />
          <SwitchRoute path="/tools/merge-pdf" element={<MergePdfTool />} />
          <SwitchRoute path="/tools/split-pdf" element={<SplitPdfTool />} />
          <SwitchRoute path="/tools/compress-pdf" element={<CompressPdfTool />} />
          <SwitchRoute path="/tools/organize-pdf" element={<OrganizePdfTool />} />
          <SwitchRoute path="/tools/timezone" element={<TimezoneConverterTool />} />
          <SwitchRoute path="/tools/test-data" element={<TestDataGeneratorTool />} />
          <SwitchRoute path="/tools/timestamp" element={<TimestampConverterTool />} />
          <SwitchRoute path="/tools/cron" element={<CronGeneratorTool />} />
          <SwitchRoute path="/tools/url-encoder" element={<UrlEncoderTool />} />
          <SwitchRoute path="/tools/markdown" element={<MarkdownPreviewerTool />} />
          <SwitchRoute path="/tools/sitemap" element={<SitemapGeneratorTool />} />
          <SwitchRoute path="/tools/og-image" element={<OpenGraphImageGeneratorTool />} />
          <SwitchRoute path="/tools/lorem" element={<LoremIpsumTool />} />
        </SwitchRoutes>
      </Suspense>
    </Router>
  );
}
