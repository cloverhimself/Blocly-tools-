import { useState, useRef, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Dropzone, DropzoneState } from "../components/Dropzone";
import { ProgressBar } from "../components/ProgressBar";
import { DownloadButton } from "../components/DownloadButton";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

type Format = 'MP3' | 'WAV' | 'AAC' | 'OGG';
type Quality = '128' | '192' | '256' | '320';

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function VideoToAudio() {
  const [file, setFile] = useState<File | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outSize, setOutSize] = useState<number>(0);
  const [format, setFormat] = useState<Format>('MP3');
  const [quality, setQuality] = useState<Quality>('192');
  
  const [mode, setMode] = useState<'empty'|'selected'|'loading'|'processing'|'success'|'error'>('empty');
  const [progress, setProgress] = useState(0);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  
  const ffmpegRef = useRef(new FFmpeg());
  
  useEffect(() => {
    let timer: any;
    if (mode === 'loading') {
      // Simulate WASM download progress over 4 seconds
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) return prev + Math.floor(Math.random() * 5) + 2;
          return prev;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [mode]);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.size > 2 * 1024 * 1024 * 1024) {
      alert("File is too large (max 2GB supported by browser memory).");
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
    setProgress(0);
  };

  const handleConvert = async () => {
    if (!file) return;
    setMode('loading');
    setProgress(0);
    
    try {
      const ffmpeg = ffmpegRef.current;
      
      if (!ffmpeg.loaded) {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
      }
      
      setMode('processing');
      
      ffmpeg.on("progress", ({ progress }) => {
        setProgress(progress * 100);
      });
      
      const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
      const outputName = 'output.' + format.toLowerCase();
      
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      let acodec = 'libmp3lame';
      if (format === 'WAV') acodec = 'pcm_s16le';
      if (format === 'AAC') acodec = 'aac';
      if (format === 'OGG') acodec = 'libvorbis';
      
      const args = ["-i", inputName, "-vn", "-acodec", acodec];
      if (format !== 'WAV') {
        args.push("-b:a", `${quality}k`);
      }
      args.push(outputName);
      
      await ffmpeg.exec(args);
      
      const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
      
      // Mime type
      const mimeTypes: Record<Format, string> = { MP3: 'audio/mpeg', WAV: 'audio/wav', AAC: 'audio/aac', OGG: 'audio/ogg' };
      const blob = new Blob([data.buffer], { type: mimeTypes[format] });
      const url = URL.createObjectURL(blob);
      
      setOutSize(blob.size);
      setOutUrl(url);
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
    let baseName = file?.name.substring(0, file.name.lastIndexOf('.')) || 'audio';
    a.download = `${baseName}.${format.toLowerCase()}`;
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
            <a href="/" className="text-[#111111] underline decoration-[#FFD400] decoration-2 underline-offset-2">Video & Audio</a>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">Convert Video to Audio</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            Convert Video to Audio
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Pull a clean audio track out of any video and save it as MP3, WAV, AAC or OGG. The file is decoded right here in your browser - it never gets uploaded.
          </p>

          <div className="flex flex-col gap-6 w-full mt-6">
            <Dropzone 
              state={dzState} 
              fileName={file?.name} 
              fileMeta={file ? `${formatBytes(file.size)} - ${fileExt}` : undefined} 
              onFileSelect={handleFile}
              onReset={handleReset}
              accept="video/*"
              label="Drop a video here, or"
              acceptedTypesLabel="MP4, MOV, WEBM, AVI"
            />

            <div className="flex flex-wrap gap-5 items-stretch">
              <div className={`flex-1 min-w-[280px] border border-[#111111] rounded-sm p-5 box-border ${(mode !== 'empty' && mode !== 'selected') ? 'opacity-50 pointer-events-none' : 'opacity-100'} transition-opacity`}>
                <div className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#111111]/60 mb-2.5">Output format</div>
                <div className="flex border border-[#111111] rounded-sm overflow-hidden mb-5">
                  {(['MP3', 'WAV', 'AAC', 'OGG'] as Format[]).map((f, i) => (
                    <button 
                      key={f} 
                      onClick={() => setFormat(f)}
                      className={`flex-1 py-[11px] px-1 border-none font-mono text-[12.5px] cursor-pointer ${format === f ? 'bg-[#FFD400]' : 'bg-[#FAFAFA] hover:bg-[#FFD400]/20'} ${i < 3 ? 'border-r border-[#111111]' : ''}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className={`font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#111111]/60 mb-2.5 ${format === 'WAV' ? 'opacity-50' : ''}`}>Quality - bitrate</div>
                <div className={`flex border border-[#111111] rounded-sm overflow-hidden ${format === 'WAV' ? 'opacity-50 pointer-events-none' : ''}`}>
                  {(['128', '192', '256', '320'] as Quality[]).map((q, i) => (
                    <button 
                      key={q} 
                      onClick={() => setQuality(q)}
                      className={`flex-1 py-[11px] px-1 border-none font-mono text-[11px] cursor-pointer ${quality === q ? 'bg-[#FFD400]' : 'bg-[#FAFAFA] hover:bg-[#FFD400]/20'} ${i < 3 ? 'border-r border-[#111111]' : ''}`}
                    >
                      {q} kbps
                    </button>
                  ))}
                </div>
                <div className="font-mono text-[11px] text-[#111111]/50 mt-3">
                  {format === 'WAV' ? 'Lossless quality.' : 'Higher bitrate → larger file, better audio.'}
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
                      className="w-full py-[15px] bg-[#FFD400] text-[#111111] border border-[#111111] rounded-sm font-bold text-[16px] cursor-pointer hover:bg-[#111111] hover:text-[#FFD400] transition-colors"
                    >
                      Convert to {format}
                    </button>
                    <div className="font-mono text-[11.5px] text-[#111111]/50 text-center">Runs in this tab - no upload</div>
                  </>
                )}

                {mode === 'loading' && (
                  <>
                    <ProgressBar value={progress} label="Loading converter engine…" valueLabel="ffmpeg.wasm" />
                    <div className="font-mono text-[11.5px] text-[#111111]/55 mt-1">
                      Fetching the WebAssembly decoder (~30 MB, cached after first run).
                    </div>
                  </>
                )}

                {mode === 'processing' && (
                  <>
                    <ProgressBar value={progress} label="Converting…" />
                    <div className="font-mono text-[11.5px] text-[#111111]/55 mt-1">
                      Decoding audio track to {format} - {format !== 'WAV' ? `${quality} kbps` : 'Lossless'}
                    </div>
                  </>
                )}

                {mode === 'success' && (
                  <>
                    <DownloadButton 
                      label={`Download ${(file?.name.substring(0, file.name.lastIndexOf('.')) || 'audio')}.${format.toLowerCase()}`}
                      onDownload={handleDownload}
                    />
                    <div className="flex justify-between items-center gap-2 font-mono text-[11.5px] text-[#111111]/60">
                      <span>{formatBytes(outSize)} - {format} {format !== 'WAV' ? `- ${quality} kbps` : ''}</span>
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
                    <div className="flex gap-2.5 items-start border border-[#111111] rounded-sm p-3 bg-[#FAFAFA]">
                      <AlertCircle className="w-[18px] h-[18px] text-[#111111] flex-none mt-[1px]" strokeWidth={2} />
                      <div className="text-[13px] leading-[1.45] text-[#111111]">
                        Conversion failed - the track couldn't be decoded. Your file never left the device.
                      </div>
                    </div>
                    <button 
                      onClick={handleConvert}
                      className="w-full py-[14px] bg-[#111111] text-[#FFD400] border border-[#111111] rounded-sm font-bold text-[15px] cursor-pointer hover:bg-[#FFD400] hover:text-[#111111] transition-colors"
                    >
                      Try again
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="border border-[#111111] rounded-sm box-border mb-8">
              <button 
                onClick={() => setPrivacyOpen(!privacyOpen)}
                className="w-full flex justify-between items-center px-4 py-[13px] bg-[#FAFAFA] border-none cursor-pointer font-semibold text-[13.5px] text-[#111111]"
              >
                <span className="flex gap-2.5 items-center">
                  <div className="border-[1.8px] border-[#111111] rounded-sm px-1.5 py-0.5 text-[#111111] font-mono font-bold text-[10px]">?</div>
                  Is this private?
                </span>
                <span className="font-mono text-[16px] leading-[1]">
                  {privacyOpen ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                </span>
              </button>
              {privacyOpen && (
                <div className="px-4 pb-[15px] pt-0.5 border-t border-[#111111] bg-[#FAFAFA]">
                  <p className="m-0 mt-3 text-[13px] leading-[1.6] text-[#111111]/75">
                    Yes. The file is decoded and re-encoded by WebAssembly running inside this browser tab. It is never uploaded, never stored, and never seen by us - there is no server in the loop. Turn off your Wi-Fi and it still works.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
