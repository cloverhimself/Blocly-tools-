import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";

export function WordCounterTool() {
  const [text, setText] = useState("");

  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s+/g, "").length;
  const paragraphs = text.trim() === "" ? 0 : text.split(/\n+/).filter(p => p.trim() !== "").length;
  const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(s => s.trim() !== "").length;
  
  // Average reading speed is ~200-250 words per minute.
  const readingTimeMins = words / 200;
  const readingMinutes = Math.floor(readingTimeMins);
  const readingSeconds = Math.round((readingTimeMins - readingMinutes) * 60);

  return (
    <ToolLayout
      title="Word Counter"
      description="Count words, characters, sentences, and paragraphs in your text."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Words" value={words} />
          <StatCard title="Characters" value={characters} />
          <StatCard title="No Spaces" value={charactersNoSpaces} />
          <StatCard title="Sentences" value={sentences} />
          <StatCard title="Paragraphs" value={paragraphs} />
          <StatCard 
            title="Reading Time" 
            value={`${readingMinutes}m ${readingSeconds}s`} 
            valueClass="text-lg md:text-xl"
          />
        </div>

        <div>
          <label htmlFor="text" className="block text-sm font-bold text-[#111111]/70 mb-2 uppercase tracking-tight">
            Input Text
          </label>
          <textarea
            id="text"
            className="w-full h-64 p-4 border border-[#111111]/10 bg-white rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400] transition-shadow resize-y"
            placeholder="Type or paste your text here to get started..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setText("")}
            className="px-4 py-2 text-sm font-semibold text-[#111111] bg-[#111111]/5 hover:bg-[#111111]/10 rounded-sm transition-colors"
          >
            Clear Text
          </button>
        </div>
      </div>
    </ToolLayout>
  );
}

function StatCard({ title, value, valueClass = "text-3xl md:text-4xl" }: { title: string; value: number | string; valueClass?: string }) {
  return (
    <div className="bg-white border border-[#111111]/10 rounded-sm p-4 text-center flex flex-col justify-center">
      <span className="block text-[11px] font-bold text-[#111111]/50 uppercase tracking-wider mb-2">
        {title}
      </span>
      <span className={`block font-extrabold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}
