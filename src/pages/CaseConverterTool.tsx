import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Copy, RefreshCw } from "lucide-react";

export function CaseConverterTool() {
  const [text, setText] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const toSentenceCase = () => {
    const next = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    setText(next);
  };

  const toLowerCase = () => setText(text.toLowerCase());
  const toUpperCase = () => setText(text.toUpperCase());
  
  const toTitleCase = () => {
    const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
    const next = text.toLowerCase().split(' ').map((word, index, arr) => {
      if (index > 0 && index < arr.length - 1 && smallWords.test(word)) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.substr(1);
    }).join(' ');
    setText(next);
  };

  const toAlternatingCase = () => {
    const next = text.split("").map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())).join("");
    setText(next);
  };

  const toCamelCase = () => {
    const next = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
    setText(next);
  };

  const toSnakeCase = () => {
    const next = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || '';
    setText(next);
  };

  const toKebabCase = () => {
    const next = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || '';
    setText(next);
  };

  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text between UPPERCASE, lowercase, title case, camelCase, and more."
    >
      <div className="space-y-6">
        <div>
          <label htmlFor="text" className="block text-sm font-bold text-[#111111]/70 mb-2 uppercase tracking-tight">
            Input Text
          </label>
          <textarea
            id="text"
            className="w-full h-64 p-4 border border-[#111111]/10 bg-white rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400] transition-shadow resize-y font-mono"
            placeholder="Type or paste your text here to convert..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-semibold rounded-sm hover:bg-[#111111]/90 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Result
          </button>
          <button
            onClick={() => setText("")}
            className="flex items-center gap-2 px-6 py-3 bg-[#111111]/5 text-[#111111] font-semibold rounded-sm hover:bg-[#111111]/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
        </div>

        <div>
          <span className="block text-sm font-bold text-[#111111]/70 mb-3 uppercase tracking-tight">
            Conversion Options
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <ConvertButton label="Sentence case" onClick={toSentenceCase} />
            <ConvertButton label="lower case" onClick={toLowerCase} />
            <ConvertButton label="UPPER CASE" onClick={toUpperCase} />
            <ConvertButton label="Title Case" onClick={toTitleCase} />
            <ConvertButton label="aLtErNaTiNg cAsE" onClick={toAlternatingCase} />
            <ConvertButton label="camelCase" onClick={toCamelCase} />
            <ConvertButton label="snake_case" onClick={toSnakeCase} />
            <ConvertButton label="kebab-case" onClick={toKebabCase} />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

function ConvertButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-3 bg-white border border-[#111111]/10 text-[#111111] font-semibold rounded-sm hover:border-[#FFD400] hover:bg-[#FFD400]/5 transition-all text-sm truncate"
    >
      {label}
    </button>
  );
}
