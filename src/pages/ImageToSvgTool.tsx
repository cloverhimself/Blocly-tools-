import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Dropzone, DropzoneState } from "../components/Dropzone";
import { DownloadButton } from "../components/DownloadButton";
import { Image as ImageIcon } from "lucide-react";
// @ts-expect-error - imagetracerjs ships no type declarations
import ImageTracer from "imagetracerjs";

type Preset = "default" | "detailed" | "posterized2" | "posterized1";

const PRESETS: { id: Preset; label: string; hint: string }[] = [
  { id: "default", label: "Balanced", hint: "Good all-round default." },
  { id: "detailed", label: "Photo", hint: "More colors, more detail." },
  { id: "posterized2", label: "Logo / Flat Colors", hint: "Clean shapes, fewer colors." },
  { id: "posterized1", label: "Black & White", hint: "2 colors, line-art style." },
];

// Tracing is done on the main thread and gets slow on large images, so we cap
// the longest side before handing pixels to the tracer.
const MAX_DIMENSION = 1000;

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function ImageToSvgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<Preset>("default");
  const [svgString, setSvgString] = useState<string | null>(null);
  const [mode, setMode] = useState<'empty' | 'selected' | 'processing' | 'success' | 'error'>('empty');

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/') || selectedFile.type === 'image/svg+xml') {
      alert("Please upload a PNG or JPG image.");
      return;
    }
    setFile(selectedFile);
    setMode('selected');
    setSvgString(null);
  };

  const handleReset = () => {
    setFile(null);
    setSvgString(null);
    setMode('empty');
  };

  const handleConvert = () => {
    if (!file) return;
    setMode('processing');

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        // Let the "processing" state paint before the (synchronous, potentially
        // slow) tracing work blocks the main thread.
        requestAnimationFrame(() => {
          try {
            const svg = ImageTracer.imagedataToSVG(imageData, preset);
            setSvgString(svg);
            setMode('success');
          } catch (err) {
            console.error(err);
            setMode('error');
          } finally {
            URL.revokeObjectURL(url);
          }
        });
      } catch (err) {
        console.error(err);
        setMode('error');
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = () => {
      setMode('error');
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const handleDownload = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = file?.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    a.download = `${baseName}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dzState: DropzoneState =
    mode === 'empty' ? 'empty' :
    (mode === 'success' ? 'done' :
    (mode === 'error' ? 'error' : 'file'));

  const fileExt = file?.name.substring(file.name.lastIndexOf('.') + 1).toUpperCase() || '';
  const svgSize = svgString ? new Blob([svgString]).size : 0;
  const svgPreviewUrl = svgString ? `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}` : null;

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
            <span className="text-[#111111]">Image to SVG</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            Image to SVG
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Trace a PNG or JPG into a scalable SVG made of real vector paths, entirely in your browser. Works best on logos, icons, and flat-color art; photos will look painterly rather than photorealistic.
          </p>

          <div className="flex flex-col gap-6 w-full mt-6">
            <div className="relative">
              <Dropzone
                state={dzState}
                fileName={file?.name}
                fileMeta={file ? `${formatBytes(file.size)} - ${fileExt}` : undefined}
                onFileSelect={handleFile}
                onReset={handleReset}
                accept="image/png,image/jpeg"
                acceptedTypesLabel="PNG or JPG"
                icon={ImageIcon}
              />
            </div>

            {svgPreviewUrl && (
              <div className="w-full flex items-center justify-center bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-6 min-h-[200px]"
                   style={{ backgroundImage: "repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%)", backgroundSize: "20px 20px" }}>
                <img src={svgPreviewUrl} alt="Traced SVG preview" className="max-w-full max-h-[320px]" />
              </div>
            )}

            <div className="flex flex-wrap gap-5 items-stretch">
              <div className={`flex-1 min-w-[280px] border border-[#111111] rounded-sm p-5 box-border ${(mode !== 'empty' && mode !== 'selected') ? 'opacity-50 pointer-events-none' : 'opacity-100'} transition-opacity`}>
                <div className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#111111]/60 mb-2.5">Tracing style</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPreset(p.id)}
                      className={`py-[10px] px-2 border border-[#111111] rounded-sm font-mono text-[12px] cursor-pointer ${preset === p.id ? 'bg-[#FFD400]' : 'bg-[#FAFAFA] hover:bg-[#FFD400]/20'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="font-mono text-[11px] text-[#111111]/50 mt-3">
                  {PRESETS.find((p) => p.id === preset)?.hint}
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
                      <ImageIcon className="w-[18px] h-[18px]" strokeWidth={2} /> Trace to SVG
                    </button>
                    <div className="font-mono text-[11.5px] text-[#111111]/50 text-center">Runs instantly in browser</div>
                  </>
                )}

                {mode === 'processing' && (
                  <div className="font-mono text-[12px] text-[#111111] text-center animate-pulse">Tracing image...</div>
                )}

                {mode === 'success' && (
                  <>
                    <DownloadButton
                      label={`Download ${(file?.name.substring(0, file.name.lastIndexOf('.')) || 'image')}.svg`}
                      onDownload={handleDownload}
                    />
                    <div className="flex justify-between items-center gap-2 font-mono text-[11.5px] text-[#111111]/60">
                      <span>{formatBytes(svgSize)} - SVG</span>
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
                      Failed to trace this image.
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
