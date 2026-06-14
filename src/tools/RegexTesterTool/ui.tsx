import React from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { Input, TextArea } from '../../components/ui/Input';
import { RegexTesterInput, RegexTesterOutput } from './types';

interface RegexTesterUIProps {
  runTool: (input: RegexTesterInput) => void;
  isLoading: boolean;
  data?: RegexTesterOutput;
  error?: string;
}

export function RegexTesterUI({ runTool, isLoading, data = [], error }: RegexTesterUIProps) {
  const [regexStr, setRegexStr] = React.useState('[A-Z][a-z]+');
  const [flags, setFlags] = React.useState('g');
  const [testString, setTestString] = React.useState('Hello World\\nRegex is Awesome');

  React.useEffect(() => {
    runTool({ regexStr, flags, testString });
  }, [regexStr, flags, testString, runTool]);

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test and debug regular expressions in a safe visual environment."
      category="Developer"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-6xl">
        <div className="flex flex-col gap-4">
          <div>
            <label className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60 mb-2 block">
              Regular Expression
            </label>
            <div className="flex bg-[#FAFAFA] border border-[#111111] rounded-sm focus-within:ring-2 focus-within:ring-[#FFD400] transition-all">
              <div className="px-3 py-3 border-r border-[#111111] font-mono text-sm font-bold text-[#111111]/60">
                /
              </div>
              <input
                type="text"
                className="flex-1 w-full px-3 py-3 font-mono text-sm focus:outline-none bg-transparent"
                value={regexStr}
                onChange={(e) => setRegexStr(e.target.value)}
                placeholder="pattern"
                spellCheck={false}
              />
              <div className="px-3 py-3 border-l border-[#111111] border-r font-mono text-sm font-bold text-[#111111]/60">
                /
              </div>
              <input
                type="text"
                className="w-16 px-3 py-3 font-mono text-sm focus:outline-none bg-transparent"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="gmi"
                spellCheck={false}
              />
            </div>
            {error && (
              <div className="mt-2 text-red-500 font-mono text-xs">{error}</div>
            )}
          </div>

          <div className="flex flex-col h-[300px]">
             <TextArea
               label="Test String"
               className="h-full"
               value={testString}
               onChange={(e) => setTestString(e.target.value)}
               placeholder="String to match against..."
               spellCheck={false}
             />
          </div>
        </div>

        <div className="flex flex-col border border-[#111111] rounded-sm bg-[#FAFAFA] h-[400px] md:h-full min-h-[400px]">
          <div className="border-b border-[#111111] p-4 flex items-center justify-between">
            <h2 className="m-0 font-mono text-[11.5px] uppercase tracking-[0.1em] font-bold">Matches</h2>
            <span className="font-mono bg-[#111111] text-white px-2 py-0.5 text-xs font-bold rounded-sm">
              {data.length} found
            </span>
          </div>
          <div className="p-4 overflow-y-auto font-mono text-sm flex-1">
            {data.length === 0 ? (
              <div className="text-[#111111]/40 italic">No matches found.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {data.map((m, i) => (
                  <div key={i} className="border border-[#111111]/20 rounded-sm p-3 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-1.5 py-0.5 bg-[#FFD400] text-[#111111] text-[10px] uppercase font-bold rounded-sm border border-[#111111]">
                         Match {i + 1}
                       </span>
                       <span className="text-xs text-[#111111]/50">Position: {m.index}</span>
                    </div>
                    <div className="font-bold text-[#111111] whitespace-pre-wrap break-all bg-[#FAFAFA] p-2 border border-[#111111]/10 rounded-sm">
                      {m.match}
                    </div>
                    
                    {m.groups.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#111111]/10">
                        <div className="text-[10px] uppercase font-bold text-[#111111]/50 mb-2">Capture Groups</div>
                        {m.groups.map((group, gi) => (
                          <div key={gi} className="flex gap-2 text-xs mt-1 bg-[#FAFAFA] p-1.5 border border-[#111111]/10 rounded-sm">
                             <span className="text-[#111111]/50 font-bold select-none">${gi + 1}:</span>
                             <span className="break-all">{group === undefined ? <span className="text-[#111111]/30 italic">undefined</span> : group}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
