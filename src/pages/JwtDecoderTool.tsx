import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Copy, Check, FileCode2 } from "lucide-react";

export function JwtDecoderTool() {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedHash, setCopiedHash] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!token.trim()) {
      setHeader("");
      setPayload("");
      setErrorMsg("");
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error("Invalid JWT: Must contain exactly 3 parts separated by dots.");
      }

      // Base64URL decode
      const decodeB64Url = (str: string) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding
        const pad = base64.length % 4;
        const padded = pad ? base64 + new Array(5 - pad).join('=') : base64;
        return decodeURIComponent(escape(atob(padded)));
      };

      const decodedHeader = JSON.parse(decodeB64Url(parts[0]));
      const decodedPayload = JSON.parse(decodeB64Url(parts[1]));

      setHeader(JSON.stringify(decodedHeader, null, 2));
      setPayload(JSON.stringify(decodedPayload, null, 2));
      setErrorMsg("");

    } catch (e: any) {
      setHeader("");
      setPayload("");
      setErrorMsg(e.message || "Failed to decode JWT.");
    }

  }, [token]);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedHash(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setCopiedHash(prev => ({ ...prev, [id]: false })), 2000);
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
            <span className="text-[#111111]">JWT Decoder</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            JWT Decoder
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Decode JSON Web Tokens instantly to securely inspect headers and payloads without sending your tokens to external servers.
          </p>

          <div className="flex flex-col lg:flex-row gap-5 mb-10 h-auto lg:h-[500px]">
             
             {/* LEFT TIER - Input */}
            <div className="flex-1 flex flex-col gap-2 min-h-[250px] lg:min-h-0">
              <div className="flex justify-between items-end">
                <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">Encoded Token (Paste)</div>
                {errorMsg && (
                  <div className="font-mono text-[10.5px] text-[#D32F2F] bg-[#D32F2F]/10 px-2 py-0.5 rounded-sm">
                    {errorMsg}
                  </div>
                )}
              </div>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
                className="w-full h-full p-4 bg-[#FAFAFA] border border-[#111111] rounded-sm font-mono text-[13px] leading-[1.8] break-all resize-none focus:outline-none focus:ring-2 focus:ring-[#FFD400] focus:border-transparent placeholder:text-[#111111]/30 transition-shadow"
              />
            </div>

            {/* RIGHT TIER - Output */}
            <div className="flex-1 flex flex-col gap-5 min-h-[500px] lg:min-h-0">
              
              {/* Header Box */}
              <div className="flex-[0.6] flex flex-col gap-2 relative">
                <div className="flex justify-between items-end">
                  <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#D32F2F] font-bold">Header <span className="opacity-60 font-normal italic lowercase tracking-normal">(Algorithm & Type)</span></div>
                  <button 
                    onClick={() => handleCopy(header, 'header')}
                    disabled={!header}
                    className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    {copiedHash['header'] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedHash['header'] ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className={`w-full h-full p-4 border border-[#111111] rounded-sm font-mono text-[13px] leading-relaxed overflow-auto ${header ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                  {header ? (
                    <pre className="m-0 text-[#D32F2F] break-words whitespace-pre-wrap">{header}</pre>
                  ) : (
                    <div className="text-[#111111]/20 flex h-full items-center justify-center">
                      <FileCode2 className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                </div>
              </div>

               {/* Payload Box */}
               <div className="flex-[1.4] flex flex-col gap-2 relative">
                <div className="flex justify-between items-end">
                  <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#1976D2] font-bold">Payload <span className="opacity-60 font-normal italic lowercase tracking-normal">(Data)</span></div>
                  <button 
                    onClick={() => handleCopy(payload, 'payload')}
                    disabled={!payload}
                    className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    {copiedHash['payload'] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedHash['payload'] ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className={`w-full h-full p-4 border border-[#111111] rounded-sm font-mono text-[13px] leading-relaxed overflow-auto ${payload ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                  {payload ? (
                    <pre className="m-0 text-[#1976D2] break-words whitespace-pre-wrap">{payload}</pre>
                  ) : (
                    <div className="text-[#111111]/20 flex h-full items-center justify-center">
                      <FileCode2 className="w-8 h-8 opacity-50" />
                    </div>
                  )}
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
