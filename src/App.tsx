import { BrowserRouter as Router, Routes as SwitchRoutes, Route as SwitchRoute } from "react-router-dom";
import { Home } from "./pages/Home";
import { VideoToAudio } from "./pages/VideoToAudio";
import { Base64Tool } from "./pages/Base64Tool";
import { FancyFontTool } from "./pages/FancyFontTool";
import { QrCodeTool } from "./pages/QrCodeTool";
import { HashGeneratorTool } from "./pages/HashGeneratorTool";
import { JsonFormatterTool } from "./pages/JsonFormatterTool";
import { GitignoreTool } from "./pages/GitignoreTool";
import { JwtDecoderTool } from "./pages/JwtDecoderTool";
import { ImageConvertTool } from "./pages/ImageConvertTool";
import { ImageCompressTool } from "./pages/ImageCompressTool";
import { ImageResizeTool } from "./pages/ImageResizeTool";
import { AudioConvertTool } from "./pages/AudioConvertTool";
import { CompressAudioTool } from "./pages/CompressAudioTool";
import { UuidTool } from "./pages/UuidTool";
import { DockerfileTool } from "./pages/DockerfileTool";
import { HexRgbTool } from "./pages/HexRgbTool";
import { LicenseTool } from "./pages/LicenseTool";
import { JsonToTsTool } from "./pages/JsonToTsTool";
import { JsonToZodTool } from "./pages/JsonToZodTool";
import { RegexTool } from "./pages/RegexTool";
import { PasswordTool } from "./pages/PasswordTool";
import { BcryptTool } from "./pages/BcryptTool";
import { CurlToFetchTool } from "./pages/CurlToFetchTool";
import { RgbHslTool } from "./pages/RgbHslTool";
import { GradientTool } from "./pages/GradientTool";
import { PaletteTool } from "./pages/PaletteTool";
import { HttpHeaderTool } from "./pages/HttpHeaderTool";
import { MetadataTool } from "./pages/MetadataTool";
import { RestApiTool } from "./pages/RestApiTool";
import { Dashboard } from "./pages/Dashboard";
import { WordCounterTool } from "./pages/WordCounterTool";
import { CaseConverterTool } from "./pages/CaseConverterTool";
import { PomodoroTool } from "./pages/PomodoroTool";
import { UnitConverterTool } from "./pages/UnitConverterTool";
import { TipCalculatorTool } from "./pages/TipCalculatorTool";
import { SocialDownloaderTool } from "./pages/SocialDownloaderTool";

import { SqlFormatterTool } from "./pages/SqlFormatterTool";
import { MongoFormatterTool } from "./pages/MongoFormatterTool";
import { JsonToSqlTool } from "./pages/JsonToSqlTool";
import { ChangelogTool } from "./pages/ChangelogTool";
import { InvoiceTool } from "./pages/InvoiceTool";
import { FileConversionTool } from "./pages/FileConversionTool";
import { FaviconTool } from "./pages/FaviconTool";
import { SvgTool } from "./pages/SvgTool";

import { TestDataGeneratorTool } from "./pages/TestDataGeneratorTool";
import { TimestampConverterTool } from "./pages/TimestampConverterTool";
import { CronGeneratorTool } from "./pages/CronGeneratorTool";
import { JwtGeneratorTool } from "./pages/JwtGeneratorTool";
import { UrlEncoderTool } from "./pages/UrlEncoderTool";
import { MarkdownPreviewerTool } from "./pages/MarkdownPreviewerTool";
import { SitemapGeneratorTool } from "./pages/SitemapGeneratorTool";
import { OpenGraphImageGeneratorTool } from "./pages/OpenGraphImageGeneratorTool";
import { LoremIpsumTool } from "./pages/LoremIpsumTool";

export default function App() {
  return (
    <Router>
      <SwitchRoutes>
        <SwitchRoute path="/" element={<Home />} />
        <SwitchRoute path="/dashboard" element={<Dashboard />} />
        <SwitchRoute path="/tools/word-counter" element={<WordCounterTool />} />
        <SwitchRoute path="/tools/case-converter" element={<CaseConverterTool />} />
        <SwitchRoute path="/tools/pomodoro" element={<PomodoroTool />} />
        <SwitchRoute path="/tools/unit-converter" element={<UnitConverterTool />} />
        <SwitchRoute path="/tools/tip-calculator" element={<TipCalculatorTool />} />
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

        <SwitchRoute path="/tools/test-data" element={<TestDataGeneratorTool />} />
        <SwitchRoute path="/tools/timestamp" element={<TimestampConverterTool />} />
        <SwitchRoute path="/tools/cron" element={<CronGeneratorTool />} />
        <SwitchRoute path="/tools/url-encoder" element={<UrlEncoderTool />} />
        <SwitchRoute path="/tools/markdown" element={<MarkdownPreviewerTool />} />
        <SwitchRoute path="/tools/sitemap" element={<SitemapGeneratorTool />} />
        <SwitchRoute path="/tools/og-image" element={<OpenGraphImageGeneratorTool />} />
        <SwitchRoute path="/tools/lorem" element={<LoremIpsumTool />} />
      </SwitchRoutes>
    </Router>
  );
}
