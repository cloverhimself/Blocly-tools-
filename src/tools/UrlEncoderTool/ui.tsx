import React from 'react';
import { Copy, ArrowRightLeft, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { TextArea } from '../../components/ui/Input';
import { ToolLayout } from '../../components/ToolLayout';
import { useClipboard } from '../../hooks/useClipboard';
import { UrlEncoderInput, UrlEncoderOutput } from './types';

interface UrlEncoderUIProps {
  runTool: (input: UrlEncoderInput) => void;
  isLoading: boolean;
  data?: UrlEncoderOutput;
  error?: string;
}

export function UrlEncoderUI({ runTool, isLoading, data = '', error }: UrlEncoderUIProps) {
  const [input, setInput] = React.useState('');
  const [mode, setMode] = React.useState<'encode' | 'decode'>('encode');
  
  const { hasCopied, copyToClipboard } = useClipboard();

  const handleProcess = () => {
    runTool({ text: input, mode });
  };

  return (
    <ToolLayout
      title="URL Encoder / Decoder"
      description="Safely encode URLs to escape special characters, or decode them back to readable strings."
      category="Text"
    >
      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="flex gap-4">
          <Button 
            variant={mode === 'encode' ? 'primary' : 'secondary'}
            onClick={() => setMode('encode')}
          >
            Encode URL
          </Button>
          <Button 
            variant={mode === 'decode' ? 'primary' : 'secondary'}
            onClick={() => setMode('decode')}
          >
            Decode URL
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-[14px]">Input</label>
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? "https://example.com/?q=hello world" : "https%3A%2F%2Fexample.com%2F%3Fq%3Dhello%20world"}
              className="h-[250px]"
            />
            <Button 
              onClick={handleProcess}
              isLoading={isLoading}
              className="mt-2 w-full"
              icon={<ArrowRightLeft className="w-4 h-4" />}
            >
              {mode === 'encode' ? 'Encode' : 'Decode'}
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <label className="font-bold text-[14px]">Output</label>
              <Button 
                variant="secondary"
                onClick={() => copyToClipboard(data)}
                disabled={!data}
                className="py-1 px-3 h-auto text-[12px]"
                icon={hasCopied ? <Check className="w-3 h-3 text-[#FFD400]" /> : <Copy className="w-3 h-3" />}
              >
                {hasCopied ? "Copied" : "Copy"}
              </Button>
            </div>
            {error && (
              <div className="p-3 border border-red-500 bg-red-50 text-red-700 font-mono text-sm rounded-sm">
                {error}
              </div>
            )}
            <TextArea
              value={data}
              readOnly
              placeholder="Result will appear here..."
              className="h-[250px] bg-[#FAFAFA]"
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
