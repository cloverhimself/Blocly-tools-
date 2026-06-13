import React, { useCallback, useRef } from "react";
import { UploadCloud, FileVideo } from "lucide-react";

export type DropzoneState = 'empty' | 'file' | 'done' | 'error';

export function Dropzone({
  state,
  fileName,
  fileMeta,
  onFileSelect,
  onReset
}: {
  state: DropzoneState;
  fileName?: string;
  fileMeta?: string;
  onFileSelect: (file: File) => void;
  onReset?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (state !== 'empty') return;
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect, state]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback(() => {
    if (state === 'empty') inputRef.current?.click();
  }, [state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const isEmpty = state === 'empty';

  const map = {
    file: { dot: '#FFD400', text: 'Ready to convert - nothing has been uploaded.', rm: true },
    done: { dot: '#FFD400', text: 'Converted on your device - ready to download.', rm: false },
    error: { dot: '#111111', text: 'Couldn\'t read this file. Try a different format.', rm: true }
  };
  
  const m = map[state] || map.file;

  return (
    <div className="w-full">
      <input 
        type="file" 
        className="hidden" 
        ref={inputRef} 
        onChange={handleChange} 
        accept="video/*"
      />
      {isEmpty ? (
        <button 
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full min-h-[230px] flex flex-col items-center justify-center gap-3.5 bg-[#FAFAFA] border-2 border-dashed border-[#111111] rounded-sm cursor-pointer p-8 font-sans box-border transition-colors hover:bg-[#FFFBE0]"
        >
          <UploadCloud className="w-[42px] h-[42px] text-[#111111]" strokeWidth={1.5} />
          <div className="text-[17px] font-semibold text-[#111111] text-center">
            Drop a video here, or <span className="border-b-[3px] border-[#FFD400] pb-[1px]">browse files</span>
          </div>
          <div className="font-mono text-[11.5px] text-[#111111]/55 text-center mt-1">
            MP4 - MOV - MKV - WEBM - AVI - up to 2 GB
          </div>
        </button>
      ) : (
        <div className="w-full min-h-[230px] box-border border border-[#111111] rounded-sm p-6 flex flex-col justify-center gap-5 bg-[#FAFAFA]">
          <div className="flex items-center gap-4">
            <span className="w-[54px] h-[54px] flex-none border border-[#111111] rounded-sm bg-[#FFD400] flex items-center justify-center">
              <FileVideo className="w-[26px] h-[26px] text-[#111111]" strokeWidth={1.6} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-mono font-semibold text-[15px] text-[#111111] overflow-hidden text-ellipsis whitespace-nowrap">
                {fileName}
              </div>
              <div className="font-mono text-[12px] text-[#111111]/55 mt-1">
                {fileMeta}
              </div>
            </div>
            {m.rm && onReset && (
              <button 
                onClick={onReset}
                className="flex-none border border-[#111111] bg-[#FAFAFA] rounded-sm px-3 py-1.5 font-mono text-[11px] cursor-pointer text-[#111111] hover:bg-[#FFD400] transition-colors"
              >
                Replace
              </button>
            )}
          </div>
          <div className="border-t border-[#111111]/15 pt-4 flex items-center gap-2.5">
            <span 
              className="w-[9px] h-[9px] flex-none rounded-full border border-[#111111]"
              style={{ backgroundColor: m.dot }}
            ></span>
            <span className="text-[13px] text-[#111111]">{m.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
