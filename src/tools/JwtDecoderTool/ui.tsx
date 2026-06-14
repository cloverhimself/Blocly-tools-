import React from 'react';
import { Copy, Check, FileCode2 } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { useClipboard } from '../../hooks/useClipboard';
import { JwtDecoderInput, JwtDecoderOutput } from './types';

interface JwtDecoderUIProps {
  runTool: (input: JwtDecoderInput) => void;
  isLoading: boolean;
  data?: JwtDecoderOutput;
  error?: string;
}

export function JwtDecoderUI({ runTool, isLoading, data = { header: '', payload: '' }, error }: JwtDecoderUIProps) {
  const [token, setToken] = React.useState('');
  const { hasCopied: hasCopiedHeader, copyToClipboard: copyHeader } = useClipboard();
  const { hasCopied: hasCopiedPayload, copyToClipboard: copyPayload } = useClipboard();

  React.useEffect(() => {
    runTool({ token });
  }, [token, runTool]);

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode JSON Web Tokens instantly to securely inspect headers and payloads without sending your tokens to external servers."
      category="Developer"
    >
      <div className="flex flex-col lg:flex-row gap-5 mb-10 h-auto lg:h-[500px]">
        {/* LEFT TIER - Input */}
        <div className="flex-1 flex flex-col gap-2 min-h-[250px] lg:min-h-0">
          <div className="flex justify-between items-end">
            <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">Encoded Token (Paste)</div>
            {error && (
              <div className="font-mono text-[10.5px] text-[#D32F2F] bg-[#D32F2F]/10 px-2 py-0.5 rounded-sm">
                {error}
              </div>
            )}
          </div>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
            className="w-full h-full p-4 bg-[#FAFAFA] border border-[#111111] rounded-sm font-mono text-[13px] leading-[1.8] break-all resize-none focus:outline-none focus:ring-2 focus:ring-[#FFD400] focus:border-transparent placeholder:text-[#111111]/30 transition-shadow"
          />
        </div>

        {/* RIGHT TIER - Output */}
        <div className="flex-1 flex flex-col gap-5 min-h-[500px] lg:min-h-0">
          
          {/* Header Box */}
          <div className="flex-[0.6] flex flex-col gap-2 relative">
            <div className="flex justify-between items-end">
              <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#D32F2F] font-bold">Header <span className="opacity-60 font-normal italic lowercase tracking-normal">(Algorithm & Type)</span></div>
              <button 
                onClick={() => copyHeader(data.header)}
                disabled={!data.header}
                className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {hasCopiedHeader ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {hasCopiedHeader ? "Copied" : "Copy"}
              </button>
            </div>
            <div className={`w-full h-full p-4 border border-[#111111] rounded-sm font-mono text-[13px] leading-relaxed overflow-auto ${data.header ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
              {data.header ? (
                <pre className="m-0 text-[#D32F2F] break-words whitespace-pre-wrap">{data.header}</pre>
              ) : (
                <div className="text-[#111111]/20 flex h-full items-center justify-center">
                  <FileCode2 className="w-8 h-8 opacity-50" />
                </div>
              )}
            </div>
          </div>

            {/* Payload Box */}
            <div className="flex-[1.4] flex flex-col gap-2 relative">
            <div className="flex justify-between items-end">
              <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#1976D2] font-bold">Payload <span className="opacity-60 font-normal italic lowercase tracking-normal">(Data)</span></div>
              <button 
                onClick={() => copyPayload(data.payload)}
                disabled={!data.payload}
                className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {hasCopiedPayload ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {hasCopiedPayload ? "Copied" : "Copy"}
              </button>
            </div>
            <div className={`w-full h-full p-4 border border-[#111111] rounded-sm font-mono text-[13px] leading-relaxed overflow-auto ${data.payload ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
              {data.payload ? (
                <pre className="m-0 text-[#1976D2] break-words whitespace-pre-wrap">{data.payload}</pre>
              ) : (
                <div className="text-[#111111]/20 flex h-full items-center justify-center">
                  <FileCode2 className="w-8 h-8 opacity-50" />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </ToolLayout>
  );
}
