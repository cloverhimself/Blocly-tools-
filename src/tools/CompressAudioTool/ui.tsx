import React, { useState, useEffect } from 'react';
import { DownloadButton } from '../../components/DownloadButton';
import { ProgressBar } from '../../components/ProgressBar';
import { Dropzone, DropzoneState } from '../../components/Dropzone';
import { ToolLayout } from '../../components/ToolLayout';
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { CompressAudioInput, CompressAudioOutput } from './types';

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

interface CompressAudioUIProps {
  runTool: (input: CompressAudioInput) => void;
  isLoading: boolean;
  data?: CompressAudioOutput;
  error?: string;
  reset: () => void;
}

export function CompressAudioUI({ runTool, isLoading, data, error, reset }: CompressAudioUIProps) {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<64 | 96 | 128 | 192>(64);
  const [progress, setProgress] = useState(0);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // When error or data changes, reset progress
  useEffect(() => {
    if (data || error) {
      setProgress(100);
    }
  }, [data, error]);

  const handleFile = (selectedFile: File) => {
    reset();
    setFile(selectedFile);
    setProgress(0);
  };

  const handleCompress = () => {
    if (!file) return;
    runTool({
      file,
      quality,
      onProgress: (p) => setProgress(p),
    });
  };

  const handleReset = () => {
    setFile(null);
    setProgress(0);
    reset();
  };

  const handleDownload = () => {
    if (!data) return;
    const a = document.createElement('a');
    a.href = data.fileUrl;
    a.download = data.fileName;
    a.click();
  };

  let mode: 'empty' | 'selected' | 'loading' | 'success' | 'error' = 'empty';
  if (error) mode = 'error';
  else if (data) mode = 'success';
  else if (isLoading) mode = 'loading';
  else if (file) mode = 'selected';

  const dzState: DropzoneState = 
    mode === 'empty' ? 'empty' : 
    (mode === 'success' ? 'done' : 
    (mode === 'error' ? 'error' : 'file'));

  const fileExt = file?.name.substring(file.name.lastIndexOf('.') + 1).toUpperCase() || '';

  return (
    <ToolLayout
      title="Compress Audio"
      description="Reduce audio file sizes instantly by lowering bitrate. Everything stays strictly local."
      category="Media"
    >
      <div className="flex flex-col gap-6 w-full max-w-5xl mt-6">
        <div className="relative">
          <Dropzone 
            state={dzState} 
            fileName={file?.name} 
            fileMeta={file ? `${formatBytes(file.size)} - ${fileExt}` : undefined} 
            onFileSelect={handleFile}
            onReset={handleReset}
            accept="audio/*"
            label="Drop an audio file here, or"
            acceptedTypesLabel="MP3, WAV, AAC, FLAC, OGG"
          />
          {(mode !== 'empty') && (
            <div className="absolute inset-0 z-20 pointer-events-none"></div>
          )}
        </div>

        <div className="flex flex-wrap gap-5 items-stretch">
          <div className={`flex-1 min-w-[280px] border border-[#111111] rounded-sm p-5 box-border ${(mode !== 'empty' && mode !== 'selected') ? 'opacity-50 pointer-events-none' : 'opacity-100'} transition-opacity`}>
            <div className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#111111]/60 mb-2.5">Target Quality</div>
            <div className={`flex flex-col gap-2`}>
              {(['192', '128', '96', '64'] as Array<string>).map((qStr) => {
                const qValue = parseInt(qStr) as 64 | 96 | 128 | 192;
                let desc = "Standard quality";
                if (qValue === 192) desc = "High quality (less compression)";
                if (qValue === 128) desc = "Standard music quality";
                if (qValue === 96) desc = "Good for voice/podcasts";
                if (qValue === 64) desc = "Max compression (low quality)";

                return (
                  <button 
                    key={qValue} 
                    onClick={() => setQuality(qValue)}
                    className={`flex items-center justify-between py-3 px-4 border rounded-sm font-mono text-[12.5px] cursor-pointer transition-colors ${quality === qValue ? 'border-[#111111] bg-[#FFD400]' : 'border-[#111111]/20 bg-[#FAFAFA] hover:border-[#111111]'}`}
                  >
                    <span className="font-bold">{qValue} kbps</span>
                    <span className="text-[11px] opacity-70 font-sans tracking-wide">{desc}</span>
                  </button>
                );
              })}
            </div>
            <div className="font-mono text-[11px] text-[#111111]/50 mt-4">
              Lowering bitrate reduces file size but sacrifices audio clarity. Output format is MP3.
            </div>
          </div>

          <div className="flex-1 min-w-[280px] border border-[#111111] rounded-sm p-5 box-border flex flex-col justify-center gap-3.5 min-h-[182px]">
            {mode === 'empty' && (
              <>
                <button disabled className="w-full py-[15px] bg-[#FAFAFA] text-[#111111]/40 border border-[#111111]/30 rounded-sm font-bold text-[15px] cursor-not-allowed">
                  Compress Audio
                </button>
                <div className="font-mono text-[11.5px] text-[#111111]/50 text-center">Add a file to begin.</div>
              </>
            )}

            {mode === 'selected' && (
              <>
                <button 
                  onClick={handleCompress}
                  className="w-full py-[15px] bg-[#FFD400] text-[#111111] border border-[#111111] rounded-sm font-bold text-[16px] cursor-pointer hover:bg-[#111111] hover:text-[#FFD400] transition-colors"
                >
                  Compress to {quality} kbps
                </button>
                <div className="font-mono text-[11.5px] text-[#111111]/50 text-center">Runs in this tab - no upload</div>
              </>
            )}

            {mode === 'loading' && (
              <>
                <ProgressBar value={progress} label={progress === 0 ? "Loading engine..." : "Compressing..."} />
                <div className="font-mono text-[11.5px] text-[#111111]/55 mt-1">
                  Encoding audio track to MP3 ({quality} kbps).
                </div>
              </>
            )}

            {mode === 'success' && data && (
              <>
                <DownloadButton 
                  label={`Download ${data.fileName}`}
                  onDownload={handleDownload}
                />
                
                <div className="flex flex-col gap-2 mt-2 font-mono text-[11.5px] text-[#111111]/80">
                  <div className="flex justify-between items-center bg-[#FAFAFA] p-2 border border-[#111111]/10 rounded-sm">
                     <span>Original</span>
                     <span className="font-bold">{formatBytes(data.originalSize)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#FAFAFA] p-2 border border-[#111111]/10 rounded-sm text-green-700">
                     <span>Compressed</span>
                     <span className="font-bold">{formatBytes(data.compressedSize)} (-{Math.round((data.originalSize - data.compressedSize) / data.originalSize * 100)}%)</span>
                  </div>
                  <div className="flex justify-center mt-2">
                    <button 
                      onClick={handleReset}
                      className="border-none bg-transparent text-[#111111] underline decoration-[#FFD400] decoration-2 cursor-pointer transition-colors hover:text-[#FFD400]"
                    >
                      Compress another
                    </button>
                  </div>
                </div>
              </>
            )}

            {mode === 'error' && (
              <>
                <div className="flex gap-2.5 items-start border border-[#111111] rounded-sm p-3 bg-[#FAFAFA]">
                  <AlertCircle className="w-[18px] h-[18px] text-[#111111] flex-none mt-[1px]" strokeWidth={2} />
                  <div className="text-[13px] leading-[1.45] text-[#111111]">
                    {error || "Compression failed. File format might not be supported."}
                  </div>
                </div>
                <button 
                  onClick={handleCompress}
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
                Yes. The file is compressed directly inside your browser using WebAssembly. It is never uploaded, never stored, and never seen by us.
              </p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
