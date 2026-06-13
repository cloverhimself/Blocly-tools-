import { useState, useCallback } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Copy, Check, RefreshCw } from "lucide-react";

export function UuidTool() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState<number>(5);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateUUIDs = useCallback((num: number) => {
    const newUuids = Array.from({ length: num }, () => crypto.randomUUID());
    setUuids(newUuids);
  }, []);

  // initial load
  import("react").then(React => {
    React.useEffect(() => {
      generateUUIDs(count);
    }, []);
  });

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
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
            <span className="text-[#111111]">UUID Generator</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            UUID Generator (v4)
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Generate cryptographically secure v4 UUIDs using the browser's native Crypto API. Everything is generated safely on your device.
          </p>

          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="flex items-end gap-4 border border-[#111111] bg-white p-5 rounded-sm">
                <div className="flex flex-col gap-2">
                    <label className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">How many?</label>
                    <input 
                        type="number" 
                        min={1} 
                        max={100} 
                        value={count} 
                        onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))} 
                        className="w-[100px] p-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[#111111] font-mono text-[14px] leading-none outline-none focus:ring-2 focus:ring-[#FFD400]"
                    />
                </div>
                <button 
                  onClick={() => generateUUIDs(count)}
                  className="flex items-center gap-2 bg-[#FFD400] text-[#111111] border border-[#111111] rounded-sm px-4 py-2 font-bold font-sans text-[14px] cursor-pointer hover:bg-[#111111] hover:text-[#FFD400] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Generate New
                </button>
            </div>

            <div className="flex flex-col gap-0 border border-[#111111] bg-white rounded-sm overflow-hidden">
                <div className="flex justify-between items-center px-5 py-3 border-b border-[#111111] bg-[#FAFAFA]">
                    <span className="font-mono font-bold text-[12px] uppercase">Results</span>
                    <button 
                      onClick={copyAll}
                      className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] transition-colors"
                    >
                      {copiedIndex === -1 ? <Check className="w-3.5 h-3.5 text-[#FFD400]" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedIndex === -1 ? "Copied All" : "Copy All"}
                    </button>
                </div>
                <div className="flex flex-col max-h-[400px] overflow-auto">
                    {uuids.map((uuid, i) => (
                        <div key={i} className="flex justify-between items-center px-5 py-3 border-b border-[#111111]/10 last:border-b-0 hover:bg-[#FFFBE0] transition-colors">
                            <span className="font-mono text-[14.5px] leading-none select-all">{uuid}</span>
                            <button 
                                onClick={() => handleCopy(uuid, i)}
                                className="flex items-center gap-1.5 text-[#111111]/50 bg-transparent border-none cursor-pointer hover:text-[#111111] transition-colors"
                                title="Copy"
                            >
                                {copiedIndex === i ? <Check className="w-4 h-4 text-[#FFD400]" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
