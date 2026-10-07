import { useState, useRef } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Dropzone, DropzoneState } from "../components/Dropzone";
import { DownloadButton } from "../components/DownloadButton";
import { AppWindow, Download, Package } from "lucide-react";
import JSZip from "jszip";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function FaviconTool() {
  const [file, setFile] = useState<File | null>(null);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState<number>(0);
  const [mode, setMode] = useState<'empty'|'selected'|'processing'|'success'|'error'>('empty');
  
  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
        alert("Please upload a valid image file.");
        return;
    }
    setFile(selectedFile);
    setMode('selected');
    setZipUrl(null);
  };
  
  const handleReset = () => {
    setFile(null);
    setZipUrl(null);
    setMode('empty');
  };

  const drawToCanvas = (img: HTMLImageElement, size: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No context");
      
      // Clear with transparency structure
      ctx.clearRect(0, 0, size, size);
      
      // Draw image scaled
      ctx.drawImage(img, 0, 0, size, size);
      
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject("Blob generation failed");
      }, 'image/png');
    });
  };

  const makeIco = async (img: HTMLImageElement): Promise<Blob> => {
    const pngBlob = await drawToCanvas(img, 32);
    const pngData = await pngBlob.arrayBuffer();
    
    const icoSize = 22 + pngData.byteLength;
    const buffer = new ArrayBuffer(icoSize);
    const view = new DataView(buffer);
    
    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, 1, true);
    view.setUint8(6, 32);
    view.setUint8(7, 32);
    view.setUint8(8, 0);
    view.setUint8(9, 0);
    view.setUint16(10, 1, true);
    view.setUint16(12, 32, true);
    view.setUint32(14, pngData.byteLength, true);
    view.setUint32(18, 22, true);
    
    new Uint8Array(buffer, 22).set(new Uint8Array(pngData));
    return new Blob([buffer], { type: "image/x-icon" });
  };

  const generateFavicons = async () => {
    if (!file) return;
    setMode('processing');
    
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      
      const zip = new JSZip();
      
      // 1. favicon.ico (32x32)
      const icoBlob = await makeIco(img);
      zip.file('favicon.ico', icoBlob);
      
      // 2. PNGs
      const sizes = [16, 32, 180, 192, 512];
      const names = {
        16: 'favicon-16x16.png',
        32: 'favicon-32x32.png',
        180: 'apple-touch-icon.png',
        192: 'android-chrome-192x192.png',
        512: 'android-chrome-512x512.png',
      };
      
      for (const s of sizes) {
        const b = await drawToCanvas(img, s);
        zip.file(names[s as keyof typeof names], b);
      }
      
      // 3. site.webmanifest
      const manifest = {
        "name": "My App",
        "short_name": "App",
        "icons": [
            {
                "src": "/android-chrome-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/android-chrome-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ],
        "theme_color": "#ffffff",
        "background_color": "#ffffff",
        "display": "standalone"
      };
      zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

      // 4. tags.html
      const tags = `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">`;
      zip.file('tags.html', tags);
      
      const content = await zip.generateAsync({ type: "blob" });
      setZipSize(content.size);
      
      const zipDownloadUrl = URL.createObjectURL(content);
      setZipUrl(zipDownloadUrl);
      setMode('success');
      
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setMode('error');
    }
  };
  
  const handleDownload = () => {
    if (!zipUrl) return;
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = `favicons.zip`;
    a.click();
  };

  const dzState: DropzoneState = 
    mode === 'empty' ? 'empty' : 
    (mode === 'success' ? 'done' : 
    (mode === 'error' ? 'error' : 'file'));
    
  const fileExt = file?.name.substring(file.name.lastIndexOf('.') + 1).toUpperCase() || '';

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
            <span className="text-[#111111]">Favicon Generator</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            Favicon Generator
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Generate standard favicon shapes, sizes, and HTML tags from a single image. Output is compressed into a `.zip` file entirely in your browser.
          </p>

          <div className="flex flex-col gap-6 w-full mt-6">
            <div className="relative">
               <Dropzone 
                 state={dzState} 
                 fileName={file?.name} 
                 fileMeta={file ? `${formatBytes(file.size)} - ${fileExt}` : undefined} 
                 onFileSelect={handleFile}
                 onReset={handleReset}
                 accept="image/*"
                 icon={AppWindow}
               />
               {(mode !== 'empty') && (
                 <div className="absolute inset-0 z-20 pointer-events-none"></div>
               )}
            </div>

            <div className="flex flex-wrap gap-5 items-stretch">
              <div className={`flex-1 min-w-[280px] border-2 border-[#111111] bg-white shadow-[4px_4px_0px_#111111] rounded-sm p-6 box-border ${(mode !== 'empty' && mode !== 'selected') ? 'opacity-50 pointer-events-none' : 'opacity-100'} transition-opacity`}>
                <div className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#111111]/60 mb-4 font-bold">Bundle Contents</div>
                
                <ul className="text-sm font-mono space-y-2 mb-4 text-[#111111]/80">
                  <li>• <strong className="text-[#111111]">favicon.ico</strong> <span className="text-[#111111]/40">(32x32)</span></li>
                  <li>• <strong className="text-[#111111]">favicon-16x16.png</strong></li>
                  <li>• <strong className="text-[#111111]">favicon-32x32.png</strong></li>
                  <li>• <strong className="text-[#111111]">apple-touch-icon.png</strong> <span className="text-[#111111]/40">(180x180)</span></li>
                  <li>• <strong className="text-[#111111]">android-chrome-*.png</strong> <span className="text-[#111111]/40">(192x & 512x)</span></li>
                  <li>• <strong className="text-[#111111]">site.webmanifest</strong></li>
                  <li>• <strong className="text-[#111111]">tags.html</strong></li>
                </ul>
              </div>

              <div className="flex-1 min-w-[280px] border-2 border-[#111111] bg-white shadow-[4px_4px_0px_#111111] rounded-sm p-6 box-border flex flex-col justify-center gap-3.5 min-h-[182px]">
                {mode === 'empty' && (
                  <>
                    <button disabled className="w-full py-[15px] bg-[#FAFAFA] text-[#111111]/40 border-2 border-[#111111]/30 rounded-sm font-bold text-[15px] cursor-not-allowed uppercase font-mono tracking-wide">
                      Generate Archive
                    </button>
                    <div className="font-mono text-[11.5px] text-[#111111]/50 text-center mt-2">Add a file to begin.</div>
                  </>
                )}

                {mode === 'selected' && (
                  <>
                    <button 
                      onClick={generateFavicons}
                      className="w-full py-[15px] bg-[#FFD400] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] rounded-sm font-bold text-[16px] cursor-pointer hover:bg-[#111111] hover:text-[#FFD400] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 uppercase font-mono tracking-wide"
                    >
                      <Package className="w-[18px] h-[18px]" strokeWidth={2}/> Build Zip
                    </button>
                    <div className="font-mono text-[11.5px] text-[#111111]/50 text-center mt-2">Runs instantly in browser</div>
                  </>
                )}

                {mode === 'processing' && (
                  <>
                    <div className="font-mono text-[12px] text-[#111111] text-center animate-pulse py-4 font-bold">Bundling graphics archive...</div>
                  </>
                )}

                {mode === 'success' && (
                  <div className="flex flex-col items-center justify-center h-full w-full py-2">
                    <button 
                      onClick={handleDownload}
                      className="w-full py-[15px] bg-[#111111] text-[#FFD400] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] rounded-sm font-bold text-[16px] flex items-center justify-center gap-2 cursor-pointer hover:bg-transparent hover:text-[#111111] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all uppercase font-mono mb-4"
                    >
                      <Download className="w-[18px] h-[18px]"/> Download bundle.zip 
                    </button>
                    <div className="flex justify-between items-center gap-2 font-mono text-[11.5px] text-[#111111]/60 w-full">
                      <span className="font-bold">{formatBytes(zipSize)} Zip</span>
                      <button 
                        onClick={handleReset}
                        className="border-none bg-transparent text-[#111111] font-mono text-[11.5px] underline decoration-[#FFD400] decoration-2 cursor-pointer p-0 whitespace-nowrap"
                      >
                        Start over
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'error' && (
                  <>
                    <div className="text-[13px] leading-[1.45] text-[#D32F2F] text-center font-bold mb-4">
                       Failed to load or convert image data.
                    </div>
                    <button 
                      onClick={handleReset}
                      className="w-full py-[14px] bg-[#111111] text-[#FFD400] border-2 border-[#111111] rounded-sm font-bold text-[15px] cursor-pointer uppercase font-mono"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
