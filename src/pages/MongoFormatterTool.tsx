import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { DatabaseZap, Copy, Check } from "lucide-react";

export function MongoFormatterTool() {
  const [input, setInput] = useState("db.users.find({ status: 'active', age: { $gte: 18 } }).sort({ createdAt: -1 }).limit(10)");
  const [copied, setCopied] = useState(false);

  let output = "";
  let error = "";

  try {
    if (input.trim() === "") {
      output = "";
    } else {
      // Very basic formatting for MongoDB scripts
      // Mostly relying on JSON-like structure within curly braces
      
      let formatted = input;
      // add spaces around colons
      formatted = formatted.replace(/:\s*/g, ': ');
      // format { } objects conceptually (extremely naive for a tool that runs in frontend without esoteric parsers)
      
      // Let's at least try parsing as JSON if it's purely a JSON query
      try {
        if (input.trim().startsWith('{') && input.trim().endsWith('}')) {
          const parsed = JSON.parse(input);
          formatted = JSON.stringify(parsed, null, 2);
        } else {
          // It's a query string like db.collection.find(...)
          // add newlines after dots for chaining
          formatted = formatted.replace(/\)\./g, ')\n  .');
          // Simple curly brace indentation
          let level = 0;
          let result = '';
          for (let i = 0; i < formatted.length; i++) {
             let char = formatted[i];
             if (char === '{' || char === '[') {
               level++;
               result += char + '\n' + '  '.repeat(level);
             } else if (char === '}' || char === ']') {
               level--;
               result += '\n' + '  '.repeat(level) + char;
             } else if (char === ',') {
               result += char + '\n' + '  '.repeat(level);
             } else {
               result += char;
             }
          }
          // Clean up empty lines or weird spaces
          formatted = result.replace(/\n\s*\n/g, '\n').replace(/{\s+}/g, '{}');
        }
      } catch (e) {
         // fallback naive formatted
      }
      
      output = formatted;
    }
  } catch (e: any) {
    error = e.message || "Parse error";
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
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
              <DatabaseZap className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">MongoDB Query Formatter</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">Beautify MongoDB JSON objects and query chains</p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
          <div className="flex flex-col">
            <label className="font-mono text-xs uppercase tracking-wider text-[#111111] mb-2 font-bold select-none">
              Input Query or JSON
            </label>
            <textarea
              className="flex-1 w-full bg-white border-2 border-[#111111] p-4 font-mono text-sm resize-none focus:outline-none shadow-[4px_4px_0px_#111111] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_#111111] transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="db.collection.find({...})"
              spellCheck={false}
            />
            {error && (
              <div className="mt-2 text-red-500 font-mono text-xs break-words">{error}</div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-xs uppercase tracking-wider text-[#111111] font-bold select-none">
                Formatted Output
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
              className="flex-1 w-full bg-[#111111] text-[#E5E5E5] border-2 border-[#111111] p-4 font-mono text-sm leading-relaxed resize-none focus:outline-none"
              value={output}
              readOnly
              placeholder="Formatted query will appear here"
              spellCheck={false}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
