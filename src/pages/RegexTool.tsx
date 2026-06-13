import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { SearchCode } from "lucide-react";

export function RegexTool() {
  const [regexStr, setRegexStr] = useState("[A-Z][a-z]+");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("Hello World\nRegex is Awesome");

  let regex: RegExp | null = null;
  let matches: RegExpMatchArray[] = [];
  let error = "";

  try {
    if (regexStr) {
      regex = new RegExp(regexStr, flags);
      
      // we need to avoid infinite loop by making sure regex is not an empty match loop without flags
      if (regex.test(testString) || testString.match(regex)) {
        if (flags.includes('g')) {
            const arr = [...testString.matchAll(regex)];
            matches = arr;
        } else {
            const match = testString.match(regex);
            if (match) matches = [match as RegExpMatchArray];
        }
      }
    }
  } catch (err: any) {
    error = err.message || "Invalid regular expression";
  }

  // Basic implementation to highlight matches
  const highlightMatches = () => {
    if (error || !regexStr || !regex) return testString;
    
    // Instead of doing actual HTML replacement, we'll just show the match results array
    // A full highlight component is complex, so we list matches
    return null;
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-10 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
              <SearchCode className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">Regex Tester</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">Test and debug regular expressions in JavaScript</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#111111] mb-2 font-bold select-none">
                Regular Expression
              </label>
              <div className="flex bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-[2px_2px_0px_#111111] transition-all">
                <div className="bg-slate-100 px-3 py-3 border-r-2 border-[#111111] font-mono text-sm font-bold text-[#111111]/60">
                  /
                </div>
                <input
                  type="text"
                  className="flex-1 w-full px-3 py-3 font-mono text-sm focus:outline-none"
                  value={regexStr}
                  onChange={(e) => setRegexStr(e.target.value)}
                  placeholder="pattern"
                  spellCheck={false}
                />
                <div className="bg-slate-100 px-3 py-3 border-l-2 border-[#111111] border-r-2 font-mono text-sm font-bold text-[#111111]/60">
                  /
                </div>
                <input
                  type="text"
                  className="w-16 px-3 py-3 font-mono text-sm focus:outline-none"
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
              <label className="font-mono text-xs uppercase tracking-wider text-[#111111] mb-2 font-bold select-none">
                Test String
              </label>
              <textarea
                className="flex-1 w-full bg-white border-2 border-[#111111] p-4 font-mono text-sm resize-none focus:outline-none shadow-[4px_4px_0px_#111111] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_#111111] transition-all"
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="String to match against..."
                spellCheck={false}
              />
            </div>
          </div>

          <div className="flex flex-col border-2 border-[#111111] shadow-[4px_4px_0px_#111111] bg-white h-full min-h-[400px]">
            <div className="border-b-2 border-[#111111] p-4 bg-slate-50 flex items-center justify-between">
              <h2 className="m-0 font-mono text-xs uppercase tracking-wider font-bold">Matches</h2>
              <span className="font-mono bg-[#111111] text-white px-2 py-0.5 text-xs font-bold rounded-sm">
                {matches.length} found
              </span>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-sm flex-1">
              {matches.length === 0 ? (
                <div className="text-[#111111]/40 italic">No matches found.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {matches.map((m, i) => (
                    <div key={i} className="border border-[#111111]/20 rounded-sm p-3 bg-slate-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-1.5 py-0.5 bg-[#FFD400] text-[#111111] text-[10px] font-bold rounded-sm border border-[#111111]">
                          Match {i + 1}
                        </span>
                        <span className="text-xs text-[#111111]/50">Position: {m.index}</span>
                      </div>
                      <div className="font-bold text-[#111111] whitespace-pre-wrap break-all bg-white p-2 border border-[#111111]/10 rounded-sm">
                        {m[0]}
                      </div>
                      
                      {m.length > 1 && (
                        <div className="mt-3 pt-3 border-t border-[#111111]/10">
                          <div className="text-[10px] uppercase font-bold text-[#111111]/50 mb-2">Capture Groups</div>
                          {Array.from(m).slice(1).map((group, gi) => (
                            <div key={gi} className="flex gap-2 text-xs mt-1 bg-white p-1.5 border border-[#111111]/10 rounded-sm">
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
      </main>
      <Footer />
    </div>
  );
}
