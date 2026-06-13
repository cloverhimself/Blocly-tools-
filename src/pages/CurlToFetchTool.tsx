import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Terminal, ArrowRight, Copy, Check } from "lucide-react";

export function CurlToFetchTool() {
  const [curl, setCurl] = useState("curl -X POST https://api.example.com/data \\\n  -H \"Content-Type: application/json\" \\\n  -H \"Authorization: Bearer TOKEN\" \\\n  -d '{\"key\":\"value\"}'");
  const [fetchCode, setFetchCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const processCurl = (input: string) => {
    try {
      if (!input.trim()) {
        setFetchCode("");
        setError("");
        return;
      }

      setError("");
      
      // Basic extremely simplified curl to fetch parsing
      // This doesn't cover all cases of curl, but works for standard json apis
      
      let method = 'GET';
      let url = '';
      const headers: Record<string, string> = {};
      let body = '';

      // clean line continuations and newlines
      let cleaned = input.replace(/\\\n/g, ' ').replace(/\s+/g, ' ');

      // Extract URL (usually the first thing that looks like a URL, or un-flagged argument)
      const urlMatch = cleaned.match(/https?:\/\/[^\s'"]+/);
      if (urlMatch) {
        url = urlMatch[0];
      }

      // Method
      const methodMatch = cleaned.match(/-X\s+([A-Z]+)/);
      if (methodMatch) {
         method = methodMatch[1];
      } else if (cleaned.includes('--data') || cleaned.includes('-d ')) {
         method = 'POST';
      }

      // Headers
      const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
      let hc;
      while ((hc = headerRegex.exec(cleaned)) !== null) {
        const parts = hc[1].split(':');
        if (parts.length >= 2) {
          const key = parts.shift()?.trim() || "";
          const val = parts.join(':').trim();
          headers[key] = val;
        }
      }

      // Body (basic support for -d and --data with quotes)
      const dataRegex = /(?:-d|--data(?:-raw)?)\s+(?:'([^']+)'|"([^"]+)")/i;
      const dataMatch = cleaned.match(dataRegex);
      if (dataMatch) {
        body = dataMatch[1] || dataMatch[2] || "";
      }

      // generate JS
      let js = `fetch('${url || "https://example.com"}', {\n`;
      js += `  method: '${method}'`;
      
      if (Object.keys(headers).length > 0) {
        js += `,\n  headers: {\n`;
        const hLines = Object.entries(headers).map(([k, v]) => `    '${k}': '${v}'`);
        js += hLines.join(',\n') + `\n  }`;
      }

      if (body) {
         js += `,\n  body: JSON.stringify(${body})\n`; // we assume it's json for this simple generator, or keep it raw
         // actually better to just output it as raw string if we don't know
         // to simplify let's just make it a raw string
         js = js.replace(`JSON.stringify(${body})`, `\`${body}\``);
      } else {
        js += '\n';
      }

      js += `})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error(error));`;

      setFetchCode(js);

    } catch (e: any) {
      setError("Failed to parse curl command. Note: This tool supports basic curl syntax.");
    }
  };

  // Process on init and input change
  useState(() => {
    processCurl(curl);
  });

  const handleChange = (val: string) => {
    setCurl(val);
    processCurl(val);
  };

  const handleCopy = () => {
    if (!fetchCode) return;
    navigator.clipboard.writeText(fetchCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-10 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
              <Terminal className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">Curl to Fetch</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">Convert curl commands to JavaScript fetch() API code</p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px] relative">
          <div className="flex flex-col min-h-[300px]">
            <label className="font-mono text-xs uppercase tracking-wider text-[#111111] mb-2 font-bold select-none">
              Curl Command
            </label>
            <textarea
              className="flex-1 w-full bg-[#111111] text-[#E5E5E5] border-2 border-[#111111] p-4 font-mono text-sm resize-none focus:outline-none shadow-[4px_4px_0px_#111111] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_#111111] transition-all"
              value={curl}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="curl -X GET ..."
              spellCheck={false}
            />
            {error && (
              <div className="mt-2 text-red-500 font-mono text-xs break-words">{error}</div>
            )}
          </div>
          
          <ArrowRight className="hidden md:block w-8 h-8 text-[#111111]/20 absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-2 z-10 bg-[#FAFAFA]" />

          <div className="flex flex-col relative z-0 min-h-[300px]">
             <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-xs uppercase tracking-wider text-[#111111] font-bold select-none">
                fetch() Snippet
              </label>
              <button
                onClick={handleCopy}
                disabled={!fetchCode}
                className="flex items-center justify-center gap-2 px-3 py-1 bg-white border-2 border-[#111111] text-[#111111] font-mono text-xs uppercase font-bold hover:bg-[#FFD400] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0px_#111111] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              className="flex-1 w-full bg-[#111111] text-[#FFD400] border-2 border-[#111111] p-4 font-mono text-sm resize-none focus:outline-none shadow-[4px_4px_0px_#111111]"
              value={fetchCode}
              readOnly
              placeholder="const response = await fetch(...)"
              spellCheck={false}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
