import { useState, useRef, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Copy, Check, Download, Upload } from "lucide-react";

export function SvgTool() {
  const [svgInput, setSvgInput] = useState<string>(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`);

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedB64, setCopiedB64] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanSvg = (svg: string) => svg.trim();

  const getSvgUrlEncoded = (svg: string) => {
    // Encodes SVG for CSS backgrounds
    let encoded = encodeURIComponent(cleanSvg(svg))
        .replace(/'/g, "%27")
        .replace(/"/g, "%22");
    return `data:image/svg+xml,${encoded}`;
  };

  const getSvgBase64 = (svg: string) => {
    try {
        const b64 = btoa(unescape(encodeURIComponent(cleanSvg(svg))));
        return `data:image/svg+xml;base64,${b64}`;
    } catch {
        return "";
    }
  };

  const copyToClipboard = (text: string, type: 'url' | 'b64') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedB64(true);
      setTimeout(() => setCopiedB64(false), 2000);
    }
  };

  const handleDownload = (format: 'png' | 'jpeg') => {
    const b64 = getSvgBase64(svgInput);
    if (!b64) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width || 512;
      canvas.height = img.height || 512;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (format === 'jpeg') {
        // JPEG has no transparency, so flatten onto a white background first.
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mime, format === 'jpeg' ? 0.92 : undefined);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `image_${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
      a.click();
    };
    img.src = b64;
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSvgInput(String(reader.result || ''));
    reader.readAsText(file);
  };

  const previewB64 = getSvgBase64(svgInput);

  return (
    <div className="w-full min-h-[100vh] bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
          <div className="font-mono text-[12px] text-[#111111]/60 mb-6">
            <a href="/" className="text-[#111111] underline decoration-[#FFD400] decoration-2 underline-offset-2">Tools</a>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">Images</span>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">SVG Converter</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            SVG Converter & Viewer
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Paste raw SVG code or upload a .svg file to preview it, generate CSS data URIs, or export it to PNG or JPG.
          </p>

          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            <div className="flex-[1.5] flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-2">
                 <span className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60 font-bold">SVG Code Input</span>
                 <button
                  onClick={handleUploadClick}
                  className="flex items-center gap-1.5 font-mono text-[11px] uppercase font-bold text-[#111111]/60 hover:text-[#111111] transition-colors cursor-pointer"
                 >
                   <Upload className="w-3.5 h-3.5" /> Upload .svg
                 </button>
                 <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  className="hidden"
                  onChange={handleFileUpload}
                 />
              </div>
              <textarea
                className="w-full h-[400px] bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] focus:shadow-[2px_2px_0px_#111111] focus:translate-x-[2px] focus:translate-y-[2px] transition-all p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none"
                value={svgInput}
                onChange={(e) => setSvgInput(e.target.value)}
                placeholder="<svg>...</svg>"
                spellCheck={false}
              />
            </div>
            
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                 <span className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60 font-bold">Live Preview</span>
                 <div className="w-full h-[200px] flex items-center justify-center bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] relative overflow-hidden" 
                      style={{ backgroundImage: "repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%)", backgroundSize: "20px 20px" }}>
                    {previewB64 ? (
                       <img src={previewB64} alt="SVG Preview" className="max-w-full max-h-full" />
                    ) : (
                       <span className="text-[#111111]/40 font-mono text-xs">Invalid SVG</span>
                    )}
                 </div>
              </div>
              
              <div className="flex flex-col gap-4">
                 <button 
                  disabled={!previewB64}
                  onClick={() => copyToClipboard(getSvgUrlEncoded(svgInput), 'url')}
                  className="w-full py-3 bg-[#FAFAFA] border-2 border-[#111111] rounded-sm font-mono text-xs uppercase font-bold tracking-wide hover:bg-[#FFD400] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                 >
                   {copiedUrl ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>} 
                   Copy CSS URL encoded
                 </button>
                 
                 <button 
                  disabled={!previewB64}
                  onClick={() => copyToClipboard(getSvgBase64(svgInput), 'b64')}
                  className="w-full py-3 bg-[#FAFAFA] border-2 border-[#111111] rounded-sm font-mono text-xs uppercase font-bold tracking-wide hover:bg-[#FFD400] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                 >
                   {copiedB64 ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>} 
                   Copy Base64 URI
                 </button>
                 
                 <div className="grid grid-cols-2 gap-3">
                   <button
                    disabled={!previewB64}
                    onClick={() => handleDownload('png')}
                    className="w-full py-4 bg-[#111111] text-[#FFD400] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-transparent hover:text-[#111111] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all rounded-sm font-mono text-xs uppercase font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                   >
                     <Download className="w-4 h-4"/> PNG
                   </button>
                   <button
                    disabled={!previewB64}
                    onClick={() => handleDownload('jpeg')}
                    className="w-full py-4 bg-[#111111] text-[#FFD400] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-transparent hover:text-[#111111] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all rounded-sm font-mono text-xs uppercase font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                   >
                     <Download className="w-4 h-4"/> JPG
                   </button>
                 </div>
              </div>
              
              {/* Hidden canvas used for exporting png */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
