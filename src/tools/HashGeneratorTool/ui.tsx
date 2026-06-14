import React from 'react';
import { Copy, Check, Hash as HashIcon, Trash } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { useClipboard } from '../../hooks/useClipboard';
import { HashGeneratorInput, HashGeneratorOutput } from './types';

interface HashGeneratorUIProps {
  runTool: (input: HashGeneratorInput) => void;
  isLoading: boolean;
  data?: HashGeneratorOutput;
  error?: string;
}

export function HashGeneratorUI({ runTool, isLoading, data = { sha1: '', sha256: '', sha512: '' }, error }: HashGeneratorUIProps) {
  const [input, setInput] = React.useState('');
  
  const { hasCopied: copiedSha1, copyToClipboard: copySha1 } = useClipboard();
  const { hasCopied: copiedSha256, copyToClipboard: copySha256 } = useClipboard();
  const { hasCopied: copiedSha512, copyToClipboard: copySha512 } = useClipboard();

  React.useEffect(() => {
    runTool({ input });
  }, [input, runTool]);

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate secure cryptographic hashes using the Web Crypto API. Your text is hashed instantly in memory and never leaves this tab."
      category="Developer"
    >
      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-end">
            <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">String Content</div>
            <button 
              onClick={() => setInput('')}
              disabled={!input}
              className="flex items-center gap-1.5 text-[#111111]/50 bg-transparent border-none cursor-pointer font-mono text-[10px] uppercase hover:text-[#111111] disabled:opacity-30 transition-colors"
            >
              <Trash className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste content to hash..."
            className="w-full h-[180px] p-4 bg-[#FAFAFA] border border-[#111111] rounded-sm font-mono text-[13.5px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#FFD400] focus:border-transparent placeholder:text-[#111111]/30 transition-shadow"
          />
        </div>
        
        {error && (
          <div className="p-3 border border-red-500 bg-red-50 text-red-700 font-mono text-sm rounded-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5 border border-[#111111] bg-white rounded-sm p-6 relative">
          <div className="absolute top-4 right-4 text-[#111111]/20">
            <HashIcon className="w-16 h-16" strokeWidth={1} />
          </div>
          
          <div className="relative z-10 flex flex-col gap-1.5">
            <div className="flex justify-between items-center mb-1">
              <div className="font-bold text-[15px]">SHA-256</div>
              <button onClick={() => copySha256(data.sha256)} disabled={!data.sha256} className="text-[#111111]/60 hover:text-[#111111] bg-transparent border-none cursor-pointer flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-wide disabled:opacity-30">
                {copiedSha256 ? <Check className="w-3.5 h-3.5 text-[#FFD400]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSha256 ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="font-mono text-[12px] bg-[#FAFAFA] border border-[#111111]/20 rounded-sm p-3 break-all min-h-[42px] flex items-center">
              {data.sha256 || <span className="text-[#111111]/40">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>}
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col gap-1.5 mt-2">
            <div className="flex justify-between items-center mb-1">
              <div className="font-bold text-[15px]">SHA-512</div>
              <button onClick={() => copySha512(data.sha512)} disabled={!data.sha512} className="text-[#111111]/60 hover:text-[#111111] bg-transparent border-none cursor-pointer flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-wide disabled:opacity-30">
                {copiedSha512 ? <Check className="w-3.5 h-3.5 text-[#FFD400]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSha512 ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="font-mono text-[12px] bg-[#FAFAFA] border border-[#111111]/20 rounded-sm p-3 break-all min-h-[42px] flex items-center">
              {data.sha512 || <span className="text-[#111111]/40">cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce...</span>}
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-1.5 mt-2">
            <div className="flex justify-between items-center mb-1">
              <div className="font-bold text-[15px]">SHA-1 <span className="font-normal text-[12px] text-[#111111]/50 ml-2">(Legacy)</span></div>
              <button onClick={() => copySha1(data.sha1)} disabled={!data.sha1} className="text-[#111111]/60 hover:text-[#111111] bg-transparent border-none cursor-pointer flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-wide disabled:opacity-30">
                {copiedSha1 ? <Check className="w-3.5 h-3.5 text-[#FFD400]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSha1 ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="font-mono text-[12px] bg-[#FAFAFA] border border-[#111111]/20 rounded-sm p-3 break-all min-h-[42px] flex items-center">
              {data.sha1 || <span className="text-[#111111]/40">da39a3ee5e6b4b0d3255bfef95601890afd80709</span>}
            </div>
          </div>
        </div>
        
      </div>
    </ToolLayout>
  );
}
