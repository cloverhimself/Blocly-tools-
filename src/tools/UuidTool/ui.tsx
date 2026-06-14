import React from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ToolLayout } from '../../components/ToolLayout';
import { useClipboard } from '../../hooks/useClipboard';
import { useToolRunner } from '../../hooks/useToolRunner';
import { UuidInput, UuidOutput } from './types';

interface UuidToolUIProps {
  runTool: (input: UuidInput) => Promise<any>;
  isLoading: boolean;
  data?: UuidOutput;
  error?: string;
}

export function UuidToolUI({ runTool, isLoading, data = [], error }: UuidToolUIProps) {
  const [count, setCount] = React.useState<number>(5);
  const [version, setVersion] = React.useState<'v1' | 'v4'>('v4');
  
  const { hasCopied: hasCopiedAll, copyToClipboard: copyAll } = useClipboard();
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    runTool({ count, version });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopySingle = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    copyAll(data.join('\n'));
  };

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate cryptographically secure UUIDs. Everything is generated safely."
      category="Developer"
    >
      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 border border-[#111111] bg-white p-5 rounded-sm">
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
            label="How many?"
            className="w-[100px]"
          />
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">Version</label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value as 'v1' | 'v4')}
              className="w-[120px] p-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[#111111] font-mono text-[14px] outline-none focus:ring-2 focus:ring-[#FFD400] h-[36px]"
            >
              <option value="v4">v4 (Random)</option>
              <option value="v1">v1 (Time-based)</option>
            </select>
          </div>
          <Button onClick={() => runTool({ count, version })} isLoading={isLoading} className="sm:ml-auto h-[36px]">
            <RefreshCw className="w-4 h-4" /> Generate New
          </Button>
        </div>

        {error && (
          <div className="p-4 border border-red-500 bg-red-50 text-red-700 font-mono text-sm rounded-sm">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] transition-colors disabled:opacity-50"
              disabled={data.length === 0}
            >
              {hasCopiedAll ? <Check className="w-3.5 h-3.5 text-[#FFD400]" /> : <Copy className="w-3.5 h-3.5" />}
              {hasCopiedAll ? "Copied All" : "Copy All"}
            </button>
          </CardHeader>
          <div className="flex flex-col max-h-[400px] overflow-auto">
            {data.length === 0 && !isLoading && (
               <div className="p-8 text-center text-[#111111]/50 font-mono text-sm">No UUIDs generated</div>
            )}
            {data.map((uuid, i) => (
              <div key={i} className="flex justify-between items-center px-5 py-3 border-b border-[#111111]/10 last:border-b-0 hover:bg-[#FFFBE0] transition-colors">
                 <span className="font-mono text-[14.5px] leading-none select-all break-all pr-4">{uuid}</span>
                 <button
                   onClick={() => handleCopySingle(uuid, i)}
                   className="flex items-center gap-1.5 text-[#111111]/50 bg-transparent border-none cursor-pointer hover:text-[#111111] transition-colors flex-shrink-0"
                   title="Copy"
                 >
                   {copiedIndex === i ? <Check className="w-4 h-4 text-[#FFD400]" /> : <Copy className="w-4 h-4" />}
                 </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
}
