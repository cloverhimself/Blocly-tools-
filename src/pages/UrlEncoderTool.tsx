import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Copy, ArrowRightLeft } from "lucide-react";

export function UrlEncoderTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleProcess = () => {
     setError("");
     try {
        if (mode === 'encode') {
           setOutput(encodeURIComponent(input));
        } else {
           setOutput(decodeURIComponent(input));
        }
     } catch (e: any) {
        setError(e.message);
        setOutput("");
     }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-10 md:py-14">
        <div className="max-w-2xl">
          <h1 className="m-0 font-extrabold text-3xl md:text-4xl tracking-[-0.03em]">URL Encoder / Decoder</h1>
          <p className="mt-3 text-[16px] text-[#111111]/60 leading-relaxed">
            Safely encode URLs to escape special characters, or decode them back to readable strings.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-6">
           <div className="flex gap-4 mb-2">
              <button 
                 onClick={() => setMode('encode')}
                 className={`px-4 py-2 font-bold text-[14px] border ${mode === 'encode' ? 'bg-[#111111] text-white border-[#111111]' : 'border-[#111111] bg-white hover:bg-[#FAFAFA]'} rounded-sm transition-colors`}
              >
                 Encode URL
              </button>
              <button 
                 onClick={() => setMode('decode')}
                 className={`px-4 py-2 font-bold text-[14px] border ${mode === 'decode' ? 'bg-[#111111] text-white border-[#111111]' : 'border-[#111111] bg-white hover:bg-[#FAFAFA]'} rounded-sm transition-colors`}
              >
                 Decode URL
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                 <label className="font-bold text-[14px]">Input</label>
                 <textarea 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={mode === 'encode' ? "https://example.com/?q=hello world" : "https%3A%2F%2Fexample.com%2F%3Fq%3Dhello%20world"}
                    className="w-full h-[250px] p-4 bg-white border border-[#111111] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400] font-mono text-[14px] resize-none"
                 />
                 <button 
                    onClick={handleProcess}
                    className="mt-2 w-full py-3 bg-[#FFD400] text-[#111111] border border-[#111111] font-bold rounded-sm hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#111111] transition-all flex items-center justify-center gap-2"
                 >
                    <ArrowRightLeft className="w-4 h-4" /> {mode === 'encode' ? 'Encode' : 'Decode'}
                 </button>
              </div>
              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-end">
                    <label className="font-bold text-[14px]">Output</label>
                    <button 
                       onClick={() => navigator.clipboard.writeText(output)}
                       disabled={!output}
                       className="px-3 py-1 bg-white border border-[#111111] rounded-sm text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#FAFAFA] disabled:opacity-50"
                    >
                       <Copy className="w-3 h-3" /> Copy
                    </button>
                 </div>
                 {error && <div className="text-red-500 text-[13px] font-bold border border-red-500 p-2 bg-red-50">Error: {error}</div>}
                 <textarea 
                    value={output}
                    readOnly
                    placeholder="Result will appear here..."
                    className="w-full h-[250px] p-4 bg-[#FAFAFA] border border-[#111111] rounded-sm focus:outline-none font-mono text-[14px] resize-none"
                 />
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
