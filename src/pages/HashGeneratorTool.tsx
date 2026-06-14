import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Copy, Check, Hash as HashIcon, Trash } from "lucide-react";

export function HashGeneratorTool() {
  const [input, setInput] = useState("");
  const [copiedHashes, setCopiedHashes] = useState<Record<string, boolean>>({});

  const utf8Encode = new TextEncoder();

  // Basic fallback SHA-256 for browser
  const getHash = async (algo: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', text: string) => {
    if (!text) return "";
    try {
      const data = utf8Encode.encode(text);
      const hashBuffer = await crypto.subtle.digest(algo, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch(e) {
      return "Environment does not support Web Crypto API";
    }
  };

  const [[sha1, sha256, sha512], setHashes] = useState<[string, string, string]>(["", "", ""]);

  useEffect(() => {
    let active = true;
    const compute = async () => {
      if (!input) {
        setHashes(["", "", ""]);
        return;
      }
      const h1 = await getHash("SHA-1", input);
      const h256 = await getHash("SHA-256", input);
      const h512 = await getHash("SHA-512", input);
      if (active) {
        setHashes([h1, h256, h512]);
      }
    };
    compute();
    return () => { active = false };
  }, [input]);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedHashes({ ...copiedHashes, [label]: true });
    setTimeout(() => {
      setCopiedHashes(prev => ({ ...prev, [label]: false }));
    }, 2000);
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
            <span className="text-[#111111]">Hash Generator</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            Hash Generator
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Generate secure cryptographic hashes using the Web Crypto API. Your text is hashed instantly in memory and never leaves this tab.
          </p>

          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-end">
                <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">String Content</div>
                <button 
                  onClick={() => setInput("")}
                  disabled={!input}
                  className="flex items-center gap-1.5 text-[#111111]/50 bg-transparent border-none cursor-pointer font-mono text-[10px] uppercase hover:text-[#111111] disabled:opacity-30 transition-colors"
                >
                  <Trash className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or paste content to hash..."
                className="w-full h-[180px] p-4 bg-[#FAFAFA] border border-[#111111] rounded-sm font-mono text-[13.5px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#FFD400] focus:border-transparent placeholder:text-[#111111]/30 transition-shadow"
              />
            </div>
            
            <div className="flex flex-col gap-5 border border-[#111111] bg-white rounded-sm p-6 relative">
              <div className="absolute top-4 right-4 text-[#111111]/20">
                <HashIcon className="w-16 h-16" strokeWidth={1} />
              </div>
              
              <div className="relative z-10 flex flex-col gap-1.5">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-[15px]">SHA-256</div>
                  <button onClick={() => handleCopy(sha256, 'sha256')} disabled={!sha256} className="text-[#111111]/60 hover:text-[#111111] bg-transparent border-none cursor-pointer flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-wide disabled:opacity-30">
                    {copiedHashes['sha256'] ? <Check className="w-3.5 h-3.5 text-[#FFD400]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedHashes['sha256'] ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="font-mono text-[12px] bg-[#FAFAFA] border border-[#111111]/20 rounded-sm p-3 break-all min-h-[42px] flex items-center">
                  {sha256 || <span className="text-[#111111]/40">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>}
                </div>
              </div>
              
              <div className="relative z-10 flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-[15px]">SHA-512</div>
                  <button onClick={() => handleCopy(sha512, 'sha512')} disabled={!sha512} className="text-[#111111]/60 hover:text-[#111111] bg-transparent border-none cursor-pointer flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-wide disabled:opacity-30">
                    {copiedHashes['sha512'] ? <Check className="w-3.5 h-3.5 text-[#FFD400]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedHashes['sha512'] ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="font-mono text-[12px] bg-[#FAFAFA] border border-[#111111]/20 rounded-sm p-3 break-all min-h-[42px] flex items-center">
                  {sha512 || <span className="text-[#111111]/40">cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce...</span>}
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-[15px]">SHA-1 <span className="font-normal text-[12px] text-[#111111]/50 ml-2">(Legacy)</span></div>
                  <button onClick={() => handleCopy(sha1, 'sha1')} disabled={!sha1} className="text-[#111111]/60 hover:text-[#111111] bg-transparent border-none cursor-pointer flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-wide disabled:opacity-30">
                    {copiedHashes['sha1'] ? <Check className="w-3.5 h-3.5 text-[#FFD400]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedHashes['sha1'] ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="font-mono text-[12px] bg-[#FAFAFA] border border-[#111111]/20 rounded-sm p-3 break-all min-h-[42px] flex items-center">
                  {sha1 || <span className="text-[#111111]/40">da39a3ee5e6b4b0d3255bfef95601890afd80709</span>}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
