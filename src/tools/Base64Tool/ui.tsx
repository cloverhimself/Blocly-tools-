import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { TextArea } from '../../components/ui/Input';
import { ToolLayout } from '../../components/ToolLayout';
import { useClipboard } from '../../hooks/useClipboard';
import { Base64Input, Base64Output } from './types';

interface Base64UIProps {
  runTool: (input: Base64Input) => void;
  isLoading: boolean;
  data?: Base64Output;
  error?: string;
}

export function Base64UI({ runTool, isLoading, data = '', error }: Base64UIProps) {
  const [input, setInput] = React.useState('');
  const [mode, setMode] = React.useState<'encode' | 'decode'>('encode');
  
  const { hasCopied, copyToClipboard } = useClipboard();

  React.useEffect(() => {
    runTool({ text: input, mode });
  }, [input, mode, runTool]);

  return (
    <ToolLayout
      title="Base64 Encode & Decode"
      description="Convert text to Base64 format and vice versa. Everything runs locally in your browser so your data is never sent to a server."
      category="Developer"
    >
      <div className="flex border border-[#111111] rounded-sm overflow-hidden mb-6 max-w-[400px]">
        <button 
          onClick={() => setMode('encode')}
          className={`flex-1 py-2.5 px-4 font-mono font-semibold text-[13px] border-none cursor-pointer transition-colors ${mode === 'encode' ? 'bg-[#FFD400] text-[#111111]' : 'bg-[#FAFAFA] hover:bg-[#FFD400]/20 text-[#111111]'}`}
        >
          Encode
        </button>
        <div className="w-px bg-[#111111]"></div>
        <button 
          onClick={() => setMode('decode')}
          className={`flex-1 py-2.5 px-4 font-mono font-semibold text-[13px] border-none cursor-pointer transition-colors ${mode === 'decode' ? 'bg-[#FFD400] text-[#111111]' : 'bg-[#FAFAFA] hover:bg-[#FFD400]/20 text-[#111111]'}`}
        >
          Decode
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <TextArea
          label="Input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? "Paste text to encode..." : "Paste Base64 to decode..."}
          className="h-[300px]"
        />
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">Output</div>
            <button 
              onClick={() => copyToClipboard(data)}
              disabled={!data || !!error}
              className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {hasCopied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className={`w-full h-[300px] p-4 border border-[#111111] rounded-sm font-mono text-[13.5px] leading-relaxed overflow-auto overflow-wrap-anywhere ${error ? 'bg-[#111111]/5 text-[#111111]/50' : 'bg-[#FFFBE0]/40 text-[#111111]'}`}>
            {error ? <span className="text-red-500 font-bold">{error}</span> : (data || <span className="text-[#111111]/30">Result will appear here...</span>)}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
