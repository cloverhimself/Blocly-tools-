// Canonical list of every tool, grouped by section. This is the source of
// truth the admin dashboard uses to toggle tools on/off. The display names here
// MUST match the names used in Home.tsx, because the stable tool id is derived
// from the name (see `toolId` in supabase.ts).
export type CatalogTool = { name: string };
export type CatalogSection = { category: string; tools: CatalogTool[] };

export const TOOL_CATALOG: CatalogSection[] = [
  {
    category: "Social Media Downloader",
    tools: [
      { name: "YouTube Downloader" },
      { name: "Instagram Downloader" },
      { name: "TikTok Downloader" },
      { name: "Facebook Downloader" },
    ],
  },
  {
    category: "Everyday Tools",
    tools: [
      { name: "Word Counter" },
      { name: "Case Converter" },
      { name: "Unit Converter" },
      { name: "Password Strength" },
      { name: "Fancy Font Generator" },
      { name: "QR Code Generator" },
    ],
  },
  {
    category: "Video & Audio",
    tools: [
      { name: "Convert Video to Audio" },
      { name: "Convert Audio" },
      { name: "Compress Audio" },
    ],
  },
  {
    category: "Images",
    tools: [
      { name: "OpenGraph Image Generator" },
      { name: "Convert Image" },
      { name: "Compress Image" },
      { name: "Resize Image" },
      { name: "Favicon Generator" },
      { name: "SVG Viewer & Converter" },
    ],
  },
  {
    category: "File Conversion",
    tools: [
      { name: "Spreadsheet Converter" },
      { name: "Document Converter" },
      { name: "PowerPoint to PDF" },
      { name: "PDF to Word" },
    ],
  },
  {
    category: "Developer",
    tools: [
      { name: "Test Data Generator" },
      { name: "JSON Formatter" },
      { name: "JSON to TypeScript" },
      { name: "JSON to Zod" },
      { name: "JWT Decoder" },
      { name: "JWT Generator" },
      { name: "UUID Generator" },
      { name: "URL Encoder / Decoder" },
      { name: "Cron Expression Generator" },
      { name: "Timestamp Converter" },
      { name: "Markdown Previewer" },
      { name: "Lorem Ipsum Generator" },
      { name: "Regex Tester" },
      { name: ".gitignore Generator" },
      { name: "Curl to Fetch" },
      { name: "Base64 Encode / Decode" },
      { name: "Hash Generator" },
      { name: "License Generator" },
      { name: "bcrypt Generator" },
    ],
  },
  {
    category: "DevOps & SEO",
    tools: [
      { name: "Sitemap Generator" },
      { name: "Dockerfile Generator" },
      { name: "Changelog Generator" },
      { name: "Metadata Generator" },
    ],
  },
  {
    category: "Database Tools",
    tools: [
      { name: "SQL Query Formatter" },
      { name: "MongoDB Query Formatter" },
      { name: "JSON to SQL Insert" },
    ],
  },
  {
    category: "Color Tools",
    tools: [
      { name: "HEX to RGB" },
      { name: "RGB to HSL" },
      { name: "Gradient Generator" },
      { name: "Color Palette" },
    ],
  },
  {
    category: "API Tools",
    tools: [{ name: "REST API Tester" }, { name: "HTTP Header Viewer" }],
  },
  {
    category: "Business",
    tools: [{ name: "Invoice Generator" }],
  },
];
