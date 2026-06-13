import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { DatabaseBackup, Copy, Check } from "lucide-react";

export function JsonToSqlTool() {
  const [input, setInput] = useState("[\n  {\n    \"id\": 1,\n    \"name\": \"Alice\",\n    \"role\": \"admin\"\n  },\n  {\n    \"id\": 2,\n    \"name\": \"Bob\",\n    \"role\": \"user\"\n  }\n]");
  const [tableName, setTableName] = useState("users");
  const [copied, setCopied] = useState(false);

  let output = "";
  let error = "";

  try {
    if (input.trim() === "") {
      output = "";
    } else {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of objects");
      }
      if (parsed.length === 0) {
        throw new Error("JSON array is empty");
      }
      
      const firstRow = parsed[0];
      if (typeof firstRow !== 'object' || firstRow === null) {
        throw new Error("Array items must be objects");
      }
      
      const columns = Object.keys(firstRow);
      
      const escapeVal = (val: any) => {
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number') return val.toString();
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
        // basic escape for strings
        const str = String(val).replace(/'/g, "''");
        return `'${str}'`;
      }

      const rows = parsed.map(row => {
        const values = columns.map(col => escapeVal(row[col]));
        return `  (${values.join(', ')})`;
      });

      const colsString = columns.map(c => `"${c}"`).join(', ');
      
      output = `INSERT INTO "${tableName}" (${colsString})\nVALUES\n${rows.join(',\n')};`;
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
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
              <DatabaseBackup className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">JSON to SQL Insert</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">Convert a JSON array of objects into standard SQL INSERT statements</p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
          <div className="flex flex-col">
            <label className="font-mono text-xs uppercase tracking-wider text-[#111111] mb-2 font-bold select-none">
              Input JSON Array
            </label>
            <textarea
              className="flex-1 w-full bg-white border-2 border-[#111111] p-4 font-mono text-sm resize-none focus:outline-none shadow-[4px_4px_0px_#111111] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_#111111] transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`[\n  { "key": "val" }\n]`}
              spellCheck={false}
            />
            {error && (
              <div className="mt-2 text-red-500 font-mono text-xs break-words">{error}</div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between items-end mb-2 gap-4">
              <div className="flex flex-col flex-1">
                <label className="font-mono text-xs uppercase tracking-wider text-[#111111] font-bold select-none mb-1">
                  Table Name
                </label>
                <input 
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="bg-white border-2 border-[#111111] px-3 py-1 font-mono text-sm focus:outline-none w-full min-w-0"
                />
              </div>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="flex items-center justify-center gap-2 px-3 py-1.5 h-max bg-[#111111] text-[#FFD400] font-mono text-xs uppercase font-bold hover:bg-[#111111]/90 active:translate-y-[2px] active:translate-x-[2px] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              className="flex-1 w-full bg-slate-50 border-2 border-[#111111] p-4 font-mono text-sm leading-relaxed resize-none focus:outline-none"
              value={output}
              readOnly
              placeholder="INSERT INTO table (...)"
              spellCheck={false}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
