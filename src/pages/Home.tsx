import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { SearchBar } from "../components/SearchBar";
import { ToolCard } from "../components/ToolCard";
import { 
  AudioWaveform, FileAudio, Image as ImageIcon, FileMinus, FileImage, QrCode, 
  FileText, Table, Braces, FileCode2, FileJson, Key, 
  Fingerprint, SearchCode, Terminal, Type, Replace, Hash, 
  ShieldAlert, Scale, Lock, Box, ListTree, Code, 
  MonitorSmartphone, Database, DatabaseZap, DatabaseBackup, 
  Palette, Pipette, PaintBucket, Paintbrush, Network, Server, ImagePlus, AppWindow
} from "lucide-react";

export function Home() {
  const [query, setQuery] = useState("");

  const rawCategories = [
    {
      name: 'Video & Audio', tools: [
        { name: 'Convert Video to Audio', desc: 'Extract MP3 or WAV from any clip', icon: <AudioWaveform />, featured: true, to: "/tools/video-to-audio" },
        { name: 'Convert Audio', desc: 'Between MP3, WAV, AAC and OGG', icon: <FileAudio />, to: "/tools/audio-convert" }
      ]
    },
    {
      name: 'Images', tools: [
        { name: 'Convert Image', desc: 'PNG, JPG, WebP and AVIF', icon: <ImageIcon />, to: "/tools/image-convert" },
        { name: 'Compress Image', desc: 'Smaller files, sharp detail', icon: <FileMinus />, to: "/tools/image-compress" },
        { name: 'Resize Image', desc: 'Set exact pixel dimensions', icon: <FileImage />, to: "/tools/image-resize" },
        { name: 'QR Code Generator', desc: 'High-res, lossless QR codes', icon: <QrCode />, to: "/tools/qrcode" },
        { name: 'Favicon Generator', desc: 'Generate multi-size favicons', icon: <AppWindow />, to: "/tools/favicon" },
        { name: 'SVG Viewer & Converter', desc: 'Preview and convert SVGs', icon: <ImagePlus />, to: "/tools/svg" },
      ]
    },
    {
      name: 'File Conversion', tools: [
         { name: 'PDF to Word', desc: 'Convert PDF documents to Word', icon: <FileText />, to: "/tools/pdf-word", cloud: true },
         { name: 'Word to PDF', desc: 'Convert Word documents to PDF', icon: <FileText />, to: "/tools/word-pdf", cloud: true },
         { name: 'Excel to CSV', desc: 'Convert Excel spreadsheets to CSV', icon: <Table />, to: "/tools/excel-csv", cloud: true },
      ]
    },
    {
      name: 'Developer', tools: [
        { name: 'JSON Formatter', desc: 'Prettify, minify and validate', icon: <Braces />, to: "/tools/json" },
        { name: 'JSON to TypeScript', desc: 'Convert JSON to TS interfaces', icon: <FileCode2 />, to: "/tools/json-to-ts" },
        { name: 'JSON to Zod', desc: 'Convert JSON to Zod schema', icon: <FileJson />, to: "/tools/json-to-zod" },
        { name: 'JWT Decoder', desc: 'Decode JSON Web Tokens', icon: <Key />, to: "/tools/jwt" },
        { name: 'UUID Generator', desc: 'Generate universally unique identifiers', icon: <Fingerprint />, to: "/tools/uuid" },
        { name: 'Regex Tester', desc: 'Test and debug regular expressions', icon: <SearchCode />, to: "/tools/regex" },
        { name: '.gitignore Generator', desc: 'Create gitignores for any stack', icon: <FileText />, to: "/tools/gitignore" },
        { name: 'Curl to Fetch', desc: 'Convert curl commands to fetch API', icon: <Terminal />, to: "/tools/curl-to-fetch" },
        { name: 'Fancy Font Generator', desc: 'Copyable unicode text styles', icon: <Type />, to: "/tools/fancy-font" },
        { name: 'Base64 Encode / Decode', desc: 'Text and small files', icon: <Replace />, to: "/tools/base64" },
        { name: 'Hash Generator', desc: 'SHA-256, SHA-1 and MD5', icon: <Hash />, to: "/tools/hash" },
        { name: 'Password Strength', desc: 'Check password security', icon: <ShieldAlert />, to: "/tools/password" },
        { name: 'License Generator', desc: 'Generate MIT, Apache, GPL licenses', icon: <Scale />, to: "/tools/license" },
        { name: 'bcrypt Generator', desc: 'Generate bcrypt password hashes', icon: <Lock />, to: "/tools/bcrypt" },
      ]
    },
    {
      name: 'DevOps Tools', tools: [
        { name: 'Dockerfile Generator', desc: 'Generate Dockerfiles for Node, Python, Go', icon: <Box />, to: "/tools/dockerfile" },
        { name: 'Changelog Generator', desc: 'Create standard changelogs', icon: <ListTree />, to: "/tools/changelog" },
      ]
    },
    {
      name: 'Next.js / React', tools: [
        { name: 'Metadata Generator', desc: 'Generate OpenGraph meta tags', icon: <Code />, to: "/tools/metadata" },
        { name: 'OpenGraph Preview', desc: 'Preview social sharing cards', icon: <MonitorSmartphone />, to: "/tools/metadata" },
      ]
    },
    {
      name: 'Database Tools', tools: [
        { name: 'SQL Query Formatter', desc: 'Beautify SQL statements', icon: <Database />, to: "/tools/sql-formatter" },
        { name: 'MongoDB Query Formatter', desc: 'Format MongoDB queries', icon: <DatabaseZap />, to: "/tools/mongo-formatter" },
        { name: 'JSON to SQL Insert', desc: 'Convert JSON array to SQL inserts', icon: <DatabaseBackup />, to: "/tools/json-to-sql" },
      ]
    },
    {
      name: 'Color Tools', tools: [
        { name: 'HEX to RGB', desc: 'Convert HEX colors to RGB', icon: <Palette />, to: "/tools/hex-rgb" },
        { name: 'RGB to HSL', desc: 'Convert RGB colors to HSL', icon: <Pipette />, to: "/tools/rgb-hsl" },
        { name: 'Gradient Generator', desc: 'Create CSS gradients', icon: <PaintBucket />, to: "/tools/gradient" },
        { name: 'Color Palette', desc: 'Generate color schemes', icon: <Paintbrush />, to: "/tools/palette" },
      ]
    },
    {
      name: 'API Tools', tools: [
        { name: 'REST API Tester', desc: 'Test HTTP requests', icon: <Network />, to: "/tools/rest-api", cloud: true },
        { name: 'HTTP Header Viewer', desc: 'View HTTP request and response headers', icon: <Server />, to: "/tools/http-headers", cloud: true },
      ]
    },
    {
      name: 'Business', tools: [
        { name: 'Invoice Generator', desc: 'Create and print beautiful invoices', icon: <FileText />, to: "/tools/invoice" },
      ]
    }
  ];

  const q = query.trim().toLowerCase();
  
  let totalTools = 0;
  let shownTools = 0;

  const categories = rawCategories.map(cat => {
    totalTools += cat.tools.length;
    const tools = cat.tools.filter(t => !q || (t.name + ' ' + t.desc + ' ' + cat.name).toLowerCase().includes(q));
    shownTools += tools.length;
    return {
      ...cat,
      count: tools.length === 1 ? '1 tool' : `${tools.length} tools`,
      tools
    }
  }).filter(c => c.tools.length > 0);

  const isSearching = q.length > 0;

  const trust = ['100% in your browser', 'No upload, ever', 'Works offline', 'Open source (MIT)'];

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-5 py-10 md:py-14">
          <h1 className="m-0 font-extrabold text-4xl md:text-6xl leading-[1.02] tracking-[-0.035em] max-w-[15ch]">
            Tools that never touch a <span className="border-b-[0.16em] border-[#FFD400] pb-[0.02em]">server</span>
          </h1>
          <p className="mt-6 text-[16px] md:text-[17px] leading-relaxed text-[#111111]/60 max-w-[54ch]">
            Convert, compress, and clean up files entirely on your own device. No uploads, no accounts, no servers in the middle - just fast, private tools that run in your browser.
          </p>
          
          <div className="mt-8 max-w-[560px]">
            <SearchBar 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder={`Search ${totalTools} tools - try 'mp3' or 'image'`} 
              countLabel={isSearching ? `${shownTools} found` : `${totalTools} tools`} 
            />
          </div>
        </div>

        <div className="border-y border-[#111111] bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:flex-wrap md:grid md:grid-cols-4">
            {trust.map((t, i) => (
              <div key={i} className="px-5 py-3.5 border-b sm:border-b-0 sm:border-r border-[#111111]/15 last:border-b-0 last:border-r-0 flex items-center gap-2.5 flex-1 w-full sm:w-auto">
                <span className="w-[7px] h-[7px] bg-[#FFD400] border border-[#111111] flex-none"></span>
                <span className="font-mono text-[11.5px] text-[#111111]">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
          {categories.map((cat, i) => (
            <div key={i} className="mb-10 last:mb-0">
              <div className="flex items-center gap-3.5 mb-5">
                <h2 className="m-0 text-[17px] font-extrabold tracking-[-0.01em]">{cat.name}</h2>
                <span className="font-mono text-[11.5px] text-[#111111]/45">{cat.count}</span>
                <span className="flex-1 h-px bg-[#111111]"></span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cat.tools.map((t, j) => (
                  <ToolCard key={j} label={t.name} desc={t.desc} iconEl={t.icon} featured={(t as any).featured} to={t.to} disabled={(t as any).disabled} cloud={(t as any).cloud} />
                ))}
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="py-12 text-center font-mono text-[13px] text-[#111111]/55">
              No tools match "{query}". Try "mp3" or "image".
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
