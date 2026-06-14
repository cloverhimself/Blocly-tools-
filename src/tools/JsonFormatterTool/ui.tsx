import React from 'react';
import { Copy, Check, FileText } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { useClipboard } from '../../hooks/useClipboard';
import { JsonFormatterInput, JsonFormatterOutput } from './types';

interface JsonFormatterUIProps {
  runTool: (input: JsonFormatterInput) => void;
  isLoading: boolean;
  data?: JsonFormatterOutput;
  error?: string;
}

export function JsonFormatterUI({ runTool, isLoading, data = '', error }: JsonFormatterUIProps) {
  const [input, setInput] = React.useState('');
  const [spaces, setSpaces] = React.useState(2);
  const { hasCopied, copyToClipboard } = useClipboard();

  React.useEffect(() => {
    runTool({ input, spaces });
  }, [input, spaces, runTool]);

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Quietly format, minify, and validate JSON payloads locally in your browser."
      category="Developer"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 max-w-6xl">
        <div className="flex border border-[#111111] rounded-sm overflow-hidden bg-[#FAFAFA] ml-auto">
          {(['2 Spaces', '4 Spaces', 'Minify']).map((label, idx) => {
            const sVal = idx === 0 ? 2 : idx === 1 ? 4 : 0;
            return (
              <button 
                key={label} 
                onClick={() => setSpaces(sVal)}
                className={`py-2.5 px-4 border-none font-mono text-[11.5px] uppercase tracking-wide cursor-pointer flex-1 transition-colors ${spaces === sVal ? 'bg-[#FFD400] text-[#111111] font-bold' : 'bg-transparent hover:bg-[#111111]/5 text-[#111111]/80'} ${idx < 2 ? 'border-r border-[#111111]' : ''}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 h-auto lg:h-[500px] max-w-6xl">
        <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
          <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">Raw Data</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'{"paste": "your JSON here"}'}
            className="w-full h-full p-4 bg-[#FAFAFA] border border-[#111111] rounded-sm font-mono text-[13px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#FFD400] focus:border-transparent placeholder:text-[#111111]/30"
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">Formatted</div>
              {error && (
                <div className="font-mono text-[10.5px] text-[#D32F2F] bg-[#D32F2F]/10 px-2 py-0.5 rounded-sm">
                  Invalid JSON
                </div>
              )}
            </div>
            <button 
              onClick={() => copyToClipboard(data)}
              disabled={!data || !!error}
              className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {hasCopied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className={`w-full h-full p-4 border border-[#111111] rounded-sm font-mono text-[13px] leading-relaxed overflow-auto ${error ? 'bg-[#111111]/5' : input ? 'bg-[#FFFBE0]/40' : 'bg-[#FAFAFA]'}`}>
            {error ? (
              <div className="text-[#D32F2F] font-mono break-words">{error}</div>
            ) : data ? (
              <pre className="m-0 break-words whitespace-pre-wrap">{data}</pre>
            ) : (
              <div className="text-[#111111]/30 flex h-full items-center justify-center">
                <FileText className="w-8 h-8 opacity-20" />
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
