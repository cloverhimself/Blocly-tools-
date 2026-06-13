import { useState, useRef } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Dropzone, DropzoneState } from "../components/Dropzone";
import { DownloadButton } from "../components/DownloadButton";
import { Image as ImageIcon } from "lucide-react";

type ImgFormat = 'PNG' | 'JPEG' | 'WEBP';

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function ImageConvertTool() {
  const [file, setFile] = useState<File | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outSize, setOutSize] = useState<number>(0);
  const [format, setFormat] = useState<ImgFormat>('PNG');
  const [mode, setMode] = useState<'empty'|'selected'|'processing'|'success'|'error'>('empty');
  
  const handleFile = (selectedFile: File) => {
    // Check if it is an image
    if (!selectedFile.type.startsWith('image/')) {
        alert("Please upload a valid image file.");
        return;
    }
    setFile(selectedFile);
    setMode('selected');
    setOutUrl(null);
  };
  
  const handleReset = () => {
    setFile(null);
    setOutUrl(null);
    setMode('empty');
  };

  const handleConvert = async () => {
    if (!file) return;
    setMode('processing');
    
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");
        
        ctx.drawImage(img, 0, 0);
        
        const mime = format === 'JPEG' ? 'image/jpeg' : format === 'WEBP' ? 'image/webp' : 'image/png';
        const quality = 0.92;
        
        canvas.toBlob((blob) => {
            if (!blob) {
                setMode('error');
                return;
            }
            const newUrl = URL.createObjectURL(blob);
            setOutSize(blob.size);
            setOutUrl(newUrl);
            setMode('success');
            URL.revokeObjectURL(url);
        }, mime, quality);
      };
      
      img.onerror = () => {
        setMode('error');
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (err) {
      console.error(err);
      setMode('error');
    }
  };
  
  const handleDownload = () => {
    if (!outUrl) return;
    const a = document.createElement('a');
    a.href = outUrl;
    let baseName = file?.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    a.download = `${baseName}.${format.toLowerCase().replace('jpeg', 'jpg')}`;
    a.click();
  };

  const dzState: DropzoneState = 
    mode === 'empty' ? 'empty' : 
    (mode === 'success' ? 'done' : 
    (mode === 'error' ? 'error' : 'file'));
    
  const fileExt = file?.name.substring(file.name.lastIndexOf('.') + 1).toUpperCase() || '';

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
          <div className="font-mono text-[12px] text-[#111111]/60 mb-6">
            <a href="/" className="text-[#111111] underline decoration-[#FFD400] decoration-2 underline-offset-2">Tools</a>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">Images</span>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">Convert Image</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            Convert Image
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Change image formats locally using the Canvas API. No quality loss on PNGs, transparent background support, entirely offline.
          </p>

          <div className="flex flex-col gap-6 w-full mt-6">
            <div className="relative">
                 {/* Override dropzone component to allow images */}
                <input 
                    type="file" 
                    id="img-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) handleFile(file);
                       e.target.value = '';
                    }} 
                    accept="image/*"
                />
               <Dropzone 
                 state={dzState} 
                 fileName={file?.name} 
                 fileMeta={file ? `${formatBytes(file.size)} - ${fileExt}` : undefined} 
                 onFileSelect={handleFile}
                 onReset={handleReset}
               />
               {(mode !== 'empty') && (
                 <div className="absolute inset-0 z-20 pointer-events-none"></div>
               )}
            </div>

            <div className="flex flex-wrap gap-5 items-stretch">
              <div className={`flex-1 min-w-[280px] border border-[#111111] rounded-sm p-5 box-border ${(mode !== 'empty' && mode !== 'selected') ? 'opacity-50 pointer-events-none' : 'opacity-100'} transition-opacity`}>
                <div className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#111111]/60 mb-2.5">Output format</div>
                <div className="flex border border-[#111111] rounded-sm overflow-hidden mb-2">
                  {(['PNG', 'JPEG', 'WEBP'] as ImgFormat[]).map((f, i) => (
                    <button 
                      key={f} 
                      onClick={() => setFormat(f)}
                      className={`flex-1 py-[11px] px-1 border-none font-mono text-[12.5px] cursor-pointer ${format === f ? 'bg-[#FFD400]' : 'bg-[#FAFAFA] hover:bg-[#FFD400]/20'} ${i < 2 ? 'border-r border-[#111111]' : ''}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="font-mono text-[11px] text-[#111111]/50 mt-3">
                  {format === 'PNG' ? 'Preserves transparency (lossless).' : format === 'JPEG' ? 'Standard compressed photo data.' : 'Modern compressed web format.'}
                </div>
              </div>

              <div className="flex-1 min-w-[280px] border border-[#111111] rounded-sm p-5 box-border flex flex-col justify-center gap-3.5 min-h-[182px]">
                {mode === 'empty' && (
                  <>
                    <button disabled className="w-full py-[15px] bg-[#FAFAFA] text-[#111111]/40 border border-[#111111]/30 rounded-sm font-bold text-[15px] cursor-not-allowed">
                      Convert
                    </button>
                    <div className="font-mono text-[11.5px] text-[#111111]/50 text-center">Add a file to begin.</div>
                  </>
                )}

                {mode === 'selected' && (
                  <>
                    <button 
                      onClick={handleConvert}
                      className="w-full py-[15px] bg-[#FFD400] text-[#111111] border border-[#111111] rounded-sm font-bold text-[16px] cursor-pointer hover:bg-[#111111] hover:text-[#FFD400] transition-colors flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="w-[18px] h-[18px]" strokeWidth={2}/> Convert to {format}
                    </button>
                    <div className="font-mono text-[11.5px] text-[#111111]/50 text-center">Runs instantly in browser</div>
                  </>
                )}

                {mode === 'processing' && (
                  <>
                    <div className="font-mono text-[12px] text-[#111111] text-center animate-pulse">Processing canvas...</div>
                  </>
                )}

                {mode === 'success' && (
                  <>
                    <DownloadButton 
                      label={`Download ${(file?.name.substring(0, file.name.lastIndexOf('.')) || 'image')}.${format.toLowerCase().replace('jpeg', 'jpg')}`}
                      onDownload={handleDownload}
                    />
                    <div className="flex justify-between items-center gap-2 font-mono text-[11.5px] text-[#111111]/60">
                      <span>{formatBytes(outSize)} - {format}</span>
                      <button 
                        onClick={handleReset}
                        className="border-none bg-transparent text-[#111111] font-mono text-[11.5px] underline decoration-[#FFD400] decoration-2 cursor-pointer p-0 whitespace-nowrap"
                      >
                        Convert another
                      </button>
                    </div>
                  </>
                )}

                {mode === 'error' && (
                  <>
                    <div className="text-[13px] leading-[1.45] text-[#D32F2F] text-center font-bold">
                       Failed to load or convert image data.
                    </div>
                    <button 
                      onClick={handleConvert}
                      className="w-full py-[14px] bg-[#111111] text-[#FFD400] border border-[#111111] rounded-sm font-bold text-[15px] cursor-pointer"
                    >
                      Try again
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
