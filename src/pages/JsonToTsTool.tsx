import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import JsonToTS from "json-to-ts";
import { FileCode2, Copy, Check } from "lucide-react";

export function JsonToTsTool() {
  const [input, setInput] = useState("{\n  \"name\": \"John Doe\",\n  \"age\": 30\n}");
  const [copied, setCopied] = useState(false);

  let output = "";
  let error = "";

  try {
    if (input.trim() === "") {
      output = "";
    } else {
      const obj = JSON.parse(input);
      const interfaces = JsonToTS(obj);
      output = interfaces.join("\n\n");
    }
  } catch (e: any) {
    error = e.message || "Invalid JSON";
  }

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
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
              <FileCode2 className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">JSON to TypeScript</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">Convert JSON objects to TypeScript interfaces</p>
        </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[500px]">
          <div className="flex flex-col min-h-[300px]">
            <label className="font-mono text-xs uppercase tracking-wider text-[#111111] mb-2 font-bold select-none">
              Input JSON
            </label>
            <textarea
              className="flex-1 w-full bg-white border-2 border-[#111111] p-4 font-mono text-sm resize-none focus:outline-none shadow-[4px_4px_0px_#111111] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_#111111] transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JSON here..."
              spellCheck={false}
            />
            {error && (
              <div className="mt-2 text-red-500 font-mono text-xs break-words">{error}</div>
            )}
          </div>
          <div className="flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-xs uppercase tracking-wider text-[#111111] font-bold select-none">
                TypeScript Interfaces
              </label>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="flex items-center justify-center gap-2 px-3 py-1 bg-white border-2 border-[#111111] text-[#111111] font-mono text-xs uppercase font-bold hover:bg-[#FFD400] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0px_#111111] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              className="flex-1 w-full bg-slate-50 border-2 border-[#111111] p-4 font-mono text-sm resize-none focus:outline-none"
              value={output}
              readOnly
              placeholder="TypeScript interfaces will appear here"
              spellCheck={false}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
