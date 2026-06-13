import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { SignJWT } from "jose";
import { Copy, Key } from "lucide-react";

export function JwtGeneratorTool() {
  const [header, setHeader] = useState("{\n  \"alg\": \"HS256\",\n  \"typ\": \"JWT\"\n}");
  const [payload, setPayload] = useState("{\n  \"sub\": \"1234567890\",\n  \"name\": \"John Doe\",\n  \"iat\": 1516239022\n}");
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
     generateJwt();
  }, [header, payload, secret]);

  const generateJwt = async () => {
     setError("");
     try {
        const headerObj = JSON.parse(header);
        const payloadObj = JSON.parse(payload);
        const secretKey = new TextEncoder().encode(secret);

        const alg = headerObj.alg || "HS256";
        
        // This tool will currently only fully support symmetric HS256/384/512 signing in the browser
        // for simplicity, using jose.
        if (!alg.startsWith('HS')) {
           setError("Only HS256, HS384, and HS512 algorithms are supported in this browser version.");
           setOutput("");
           return;
        }

        const jwt = await new SignJWT(payloadObj)
          .setProtectedHeader(headerObj)
          .sign(secretKey);
          
        setOutput(jwt);

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
          <h1 className="m-0 font-extrabold text-3xl md:text-4xl tracking-[-0.03em]">JWT Generator</h1>
          <p className="mt-3 text-[16px] text-[#111111]/60 leading-relaxed">
             Generate robust JSON Web Tokens in your browser. All signing happens securely on your device.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_400px] gap-6 items-start">
           <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                 <label className="font-bold text-[14px]">Header Configuration (JSON)</label>
                 <textarea 
                    value={header}
                    onChange={e => setHeader(e.target.value)}
                    className="w-full h-[120px] p-4 bg-white border border-[#111111] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400] font-mono text-[14px] resize-none"
                    spellCheck={false}
                 />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="font-bold text-[14px]">Payload Data (JSON)</label>
                 <textarea 
                    value={payload}
                    onChange={e => setPayload(e.target.value)}
                    className="w-full h-[220px] p-4 bg-white border border-[#111111] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400] font-mono text-[14px] resize-none"
                    spellCheck={false}
                 />
              </div>
           </div>

           <div className="flex flex-col gap-6">
              <div className="bg-[#111111] text-white p-6 rounded-sm flex flex-col gap-4">
                 <h2 className="font-bold text-[15px] flex items-center gap-2">
                    <Key className="w-4 h-4" /> Secret Key
                 </h2>
                 <input 
                    type="text" 
                    value={secret}
                    onChange={e => setSecret(e.target.value)}
                    placeholder="Enter a secure secret..."
                    className="w-full p-3 bg-white text-[#111111] border-none rounded-sm font-mono text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                 />
              </div>

              <div className="border border-[#111111] bg-white rounded-sm h-[320px] flex flex-col">
                 <div className="h-[46px] border-b border-[#111111] flex items-center justify-between px-3 bg-[#FAFAFA]">
                    <div className="font-bold text-[14px]">Generated JWT</div>
                    <button 
                       onClick={() => navigator.clipboard.writeText(output)}
                       disabled={!output}
                       className="px-3 py-1 bg-white border border-[#111111] rounded-sm text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#FFD400] disabled:opacity-50 transition-colors"
                    >
                       <Copy className="w-3 h-3" /> Copy
                    </button>
                 </div>
                 {error && <div className="p-3 bg-red-50 text-red-600 font-mono text-[12px] border-b border-[#111111]">{error}</div>}
                 <textarea 
                    value={output}
                    readOnly
                    placeholder="Generated token will appear here..."
                    className="flex-1 w-full p-4 bg-transparent border-none font-mono text-[14px] leading-relaxed resize-none outline-none break-all text-[#111111]"
                 />
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
