import React from 'react';
import { Copy, Check, Clock, CalendarDays, Hash } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { useClipboard } from '../../hooks/useClipboard';
import { TimestampConverterInput, TimestampConverterOutput } from './types';

interface TimestampConverterUIProps {
  runTool: (input: TimestampConverterInput) => void;
  isLoading: boolean;
  data?: TimestampConverterOutput;
  error?: string;
}

export function TimestampConverterUI({ runTool, isLoading, data = { unix: '', human: '' }, error }: TimestampConverterUIProps) {
  const [unixInput, setUnixInput] = React.useState('');
  const [humanInput, setHumanInput] = React.useState('');
  const [lastAction, setLastAction] = React.useState<'unix-to-human'|'human-to-unix'>('unix-to-human');
  
  const [currentTime, setCurrentTime] = React.useState(Math.floor(Date.now() / 1000));
  const { hasCopied: copiedCurrent, copyToClipboard: copyCurrent } = useClipboard();
  const { hasCopied: copiedUnix, copyToClipboard: copyUnix } = useClipboard();
  const { hasCopied: copiedHuman, copyToClipboard: copyHuman } = useClipboard();

  React.useEffect(() => {
     const timer = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
     return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (lastAction === 'unix-to-human') {
      runTool({ action: 'unix-to-human', unix: unixInput });
    } else {
      runTool({ action: 'human-to-unix', human: humanInput });
    }
  }, [unixInput, humanInput, lastAction, runTool]);

  // Sync data back when conversion completes successfully
  React.useEffect(() => {
    if (data && !error) {
       if (lastAction === 'unix-to-human' && data.human !== humanInput) {
         setHumanInput(data.human);
       } else if (lastAction === 'human-to-unix' && data.unix !== unixInput) {
         setUnixInput(data.unix);
       }
    }
  }, [data, error, lastAction]);

  return (
    <ToolLayout
      title="Timestamp Converter"
      description="Convert unix timestamps to human-readable dates and back."
      category="Developer"
    >
      <div className="max-w-4xl">
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between bg-white border border-[#111111] p-6 rounded-sm gap-4 mb-8">
           <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#111111]" />
              <div>
                 <div className="font-mono text-[12px] font-bold text-[#111111]/50 uppercase">Current Epoch</div>
                 <div className="font-mono text-xl font-bold">{currentTime}</div>
              </div>
           </div>
           <button 
             onClick={() => copyCurrent(currentTime.toString())}
             className="flex items-center gap-2 px-4 py-2 border border-[#111111] bg-[#FAFAFA] hover:bg-[#FFD400] text-sm font-semibold rounded-sm transition-colors"
           >
              {copiedCurrent ? <Check className="w-4 h-4 text-[#111111]" /> : <Copy className="w-4 h-4" />}
              {copiedCurrent ? "Copied" : "Copy"}
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="flex flex-col gap-2">
              <label className="font-bold text-[14px] flex items-center gap-2">
                 <Hash className="w-4 h-4" /> Unix Timestamp
              </label>
              <div className="relative">
                 <input 
                    type="text" 
                    value={unixInput}
                    onChange={e => {
                      setLastAction('unix-to-human');
                      setUnixInput(e.target.value);
                    }}
                    placeholder="e.g. 1718302000"
                    className={`w-full p-4 pr-12 font-mono text-[15px] border ${error && lastAction === 'unix-to-human' ? 'border-red-500 bg-[#FFF5F5]' : 'border-[#111111] bg-[#FAFAFA]'} rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]`}
                 />
                 <button 
                    onClick={() => copyUnix(unixInput)}
                    className="absolute right-2 top-2 bottom-2 px-3 hover:bg-[#111111]/5 border border-transparent hover:border-[#111111] rounded-sm transition-colors"
                 >
                    {copiedUnix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 </button>
              </div>
              {error && lastAction === 'unix-to-human' && <div className="text-red-500 text-[13px]">{error}</div>}
           </div>

           <div className="flex flex-col gap-2">
              <label className="font-bold text-[14px] flex items-center gap-2">
                 <CalendarDays className="w-4 h-4" /> Human Readable (UTC)
              </label>
              <div className="relative">
                 <input 
                    type="text" 
                    value={humanInput}
                    onChange={e => {
                      setLastAction('human-to-unix');
                      setHumanInput(e.target.value);
                    }}
                    placeholder="e.g. 2026-06-13 18:06:40"
                    className={`w-full p-4 pr-12 font-mono text-[15px] border ${error && lastAction === 'human-to-unix' ? 'border-red-500 bg-[#FFF5F5]' : 'border-[#111111] bg-[#FAFAFA]'} rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]`}
                 />
                 <button 
                    onClick={() => copyHuman(humanInput)}
                    className="absolute right-2 top-2 bottom-2 px-3 hover:bg-[#111111]/5 border border-transparent hover:border-[#111111] rounded-sm transition-colors"
                 >
                    {copiedHuman ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 </button>
              </div>
              {error && lastAction === 'human-to-unix' && <div className="text-red-500 text-[13px]">{error}</div>}
           </div>
        </div>
      </div>
    </ToolLayout>
  );
}
