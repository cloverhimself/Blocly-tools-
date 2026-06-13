import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Copy, Check, FileText } from "lucide-react";

export function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [spaces, setSpaces] = useState(2);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setErrorMsg("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      let formatted;
      if (spaces === 0) {
        formatted = JSON.stringify(parsed);
      } else {
        formatted = JSON.stringify(parsed, null, spaces);
      }
      setOutput(formatted);
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid JSON syntax");
      setOutput("");
    }
  }, [input, spaces]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
          <div className="font-mono text-[12px] text-[#111111]/60 mb-6">
            <a href="/" className="text-[#111111] underline decoration-[#FFD400] decoration-2 underline-offset-2">Tools</a>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">Developer</span>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">JSON Formatter</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
                JSON Formatter
              </h1>
              <p className="mt-4 m-0 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[50ch]">
                Quietly format, minify, and validate JSON payloads.
              </p>
            </div>
            
            <div className="flex border border-[#111111] rounded-sm overflow-hidden bg-[#FAFAFA]">
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

          <div className="flex flex-col lg:flex-row gap-5 h-auto lg:h-[500px]">
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
                  {errorMsg && (
                    <div className="font-mono text-[10.5px] text-[#D32F2F] bg-[#D32F2F]/10 px-2 py-0.5 rounded-sm">
                      Invalid JSON
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleCopy}
                  disabled={!output}
                  className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className={`w-full h-full p-4 border border-[#111111] rounded-sm font-mono text-[13px] leading-relaxed overflow-auto ${errorMsg ? 'bg-[#111111]/5' : input ? 'bg-[#FFFBE0]/40' : 'bg-white'}`}>
                {errorMsg ? (
                  <div className="text-[#D32F2F] font-mono break-words">{errorMsg}</div>
                ) : output ? (
                  <pre className="m-0 break-words whitespace-pre-wrap">{output}</pre>
                ) : (
                  <div className="text-[#111111]/30 flex h-full items-center justify-center">
                    <FileText className="w-8 h-8 opacity-20" />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
