import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Copy, Check } from "lucide-react";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  let output = "";
  let error = false;

  try {
    if (mode === 'encode') {
      // Use btoa but handle unicode by converting to URI components first
      output = btoa(unescape(encodeURIComponent(input)));
    } else {
      output = decodeURIComponent(escape(atob(input)));
    }
  } catch (e) {
    output = "Invalid input for decoding.";
    error = true;
  }

  if (!input) {
    output = "";
    error = false;
  }

  const handleCopy = () => {
    if (!output || error) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
          <div className="font-mono text-[12px] text-[#111111]/60 mb-6">
            <a href="/" className="text-[#111111] underline decoration-[#FFD400] decoration-2 underline-offset-2">Tools</a>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">Developer</span>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">Base64 Encode/Decode</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            Base64 Encode & Decode
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Convert text to Base64 format and vice versa. Everything runs locally in your browser so your data is never sent to a server.
          </p>

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
            <div className="flex flex-col gap-2">
              <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">Input</div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? "Paste text to encode..." : "Paste Base64 to decode..."}
                className="w-full h-[300px] p-4 bg-[#FAFAFA] border border-[#111111] rounded-sm font-mono text-[13.5px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#FFD400] focus:border-transparent placeholder:text-[#111111]/30 transition-shadow"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">Output</div>
                <button 
                  onClick={handleCopy}
                  disabled={!output || error}
                  className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className={`w-full h-[300px] p-4 border border-[#111111] rounded-sm font-mono text-[13.5px] leading-relaxed overflow-auto overflow-wrap-anywhere ${error ? 'bg-[#111111]/5 text-[#111111]/50' : 'bg-[#FFFBE0]/40 text-[#111111]'}`}>
                {output || <span className="text-[#111111]/30">Result will appear here...</span>}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
