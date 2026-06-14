import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Dropzone, DropzoneState } from "../components/Dropzone";
import { DownloadButton } from "../components/DownloadButton";
import { FileMinus } from "lucide-react";
import imageCompression from 'browser-image-compression';

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function ImageCompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [outFile, setOutFile] = useState<File | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'empty'|'selected'|'processing'|'success'|'error'>('empty');
  
  const handleFile = (selectedFile: File) => {
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
    setOutFile(null);
    setOutUrl(null);
    setMode('empty');
  };

  const handleConvert = async () => {
    if (!file) return;
    setMode('processing');
    
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const newUrl = URL.createObjectURL(compressedFile);
      setOutFile(compressedFile);
      setOutUrl(newUrl);
      setMode('success');
    } catch (err) {
      console.error(err);
      setMode('error');
    }
  };
  
  const handleDownload = () => {
    if (!outUrl) return;
    const a = document.createElement('a');
    a.href = outUrl;
    a.download = `compressed_${file?.name || 'image.jpg'}`;
    a.click();
  };

  const dzState: DropzoneState = 
    mode === 'empty' ? 'empty' : 
    (mode === 'success' ? 'done' : 
    (mode === 'error' ? 'error' : 'file'));
    
  const fileExt = file?.name.substring(file.name.lastIndexOf('.') + 1).toUpperCase() || '';
  const saved = file && outFile ? file.size - outFile.size : 0;
  const savedPct = file && outFile ? (saved / file.size * 100).toFixed(1) : 0;

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
            <span className="text-[#111111]">Compress Image</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            Compress Image
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Dramatically shrink JPG and PNG file sizes directly using a foreground WebWorker without compromising detail.
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
                 icon={FileMinus}
               />
               {(mode !== 'empty') && (
                 <div className="absolute inset-0 z-20 pointer-events-none"></div>
               )}
            </div>

            <div className="flex flex-wrap gap-5 items-stretch lg:max-w-[400px]">
              
              <div className="flex-1 min-w-[280px] border border-[#111111] rounded-sm p-5 box-border flex flex-col justify-center gap-3.5 min-h-[182px]">
                {mode === 'empty' && (
                  <>
                    <button disabled className="w-full py-[15px] bg-[#FAFAFA] text-[#111111]/40 border border-[#111111]/30 rounded-sm font-bold text-[15px] cursor-not-allowed">
                      Compress
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
                      <FileMinus className="w-[18px] h-[18px]" strokeWidth={2}/> Shrink Image Size
                    </button>
                    <div className="font-mono text-[11.5px] text-[#111111]/50 text-center">Runs locally using WebWorkers</div>
                  </>
                )}

                {mode === 'processing' && (
                  <>
                    <div className="font-mono text-[12px] text-[#111111] text-center animate-pulse">Running compression algorithm...</div>
                  </>
                )}

                {mode === 'success' && (
                  <>
                    <DownloadButton 
                      label={`Download squeezed frame`}
                      onDownload={handleDownload}
                    />
                    <div className="flex justify-between items-center gap-2 font-mono text-[11.5px]">
                      <span className="text-[#008000] font-bold">-{savedPct}% saved! ({formatBytes(outFile?.size || 0)})</span>
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
                       Failed to compress image data.
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
