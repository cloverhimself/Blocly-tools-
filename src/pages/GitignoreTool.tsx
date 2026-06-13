import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Search, Copy, Check, FileDown, Plus } from "lucide-react";

export function GitignoreTool() {
  const [templates, setTemplates] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initial fetch of template list
  useEffect(() => {
    fetch("https://api.github.com/gitignore/templates")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .catch(() => {
        setTemplates(["Node", "React", "Python", "Go", "Java", "C++", "macOS", "Windows", "Linux"]);
      });
  }, []);

  // Compute file when selection changes
  useEffect(() => {
    if (selected.length === 0) {
      setContent("");
      return;
    }

    setLoading(true);
    const fetchPromises = selected.map(name => 
      fetch(`https://api.github.com/gitignore/templates/${name}`)
        .then(res => res.json())
        .then(data => `### ${name} ###\n${data.source}\n`)
        .catch(() => `### ${name} ###\n# Failed to fetch template\n`)
    );

    Promise.all(fetchPromises).then(results => {
      setContent(results.join('\n'));
      setLoading(false);
    });
  }, [selected]);

  const toggleSelect = (name: string) => {
    setSelected(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".gitignore";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = templates.filter(t => t.toLowerCase().includes(search.toLowerCase()));

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
            <span className="text-[#111111]">.gitignore Generator</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            .gitignore Generator
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Combine multiple useful .gitignore templates across different operating systems, IDEs, and programming languages.
          </p>

          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center w-full border-[1.5px] border-[#111111] rounded-sm bg-white">
                <div className="flex py-3 px-3 text-[#111111]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Mac, Node, Python..."
                  className="flex-1 min-w-0 border-none outline-none bg-transparent font-mono text-[13.5px] py-3 pr-3 text-[#111111] placeholder:text-[#111111]/40"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {selected.length > 0 && selected.map(sel => (
                  <button 
                    key={sel}
                    onClick={() => toggleSelect(sel)}
                    className="flex items-center gap-1.5 border border-[#111111] bg-[#FFD400] rounded-sm px-2.5 py-1 font-mono text-[11px] font-bold cursor-pointer"
                  >
                    {sel} <span className="opacity-60 text-[14px]">×</span>
                  </button>
                ))}
              </div>

              <div className="border border-[#111111] bg-white rounded-sm overflow-auto h-[400px]">
                {filtered.slice(0, 100).map(t => (
                  <div 
                    key={t}
                    onClick={() => toggleSelect(t)}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b border-[#111111]/10 last:border-0 hover:bg-[#FFFBE0] transition-colors ${selected.includes(t) ? 'bg-[#111111]/5' : ''}`}
                  >
                    <span className="font-mono text-[13px]">{t}</span>
                    <button className="bg-transparent border-none p-0 text-[#111111]/40 cursor-pointer">
                      {selected.includes(t) ? <Check className="w-4 h-4 text-[#FFD400]" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
                {filtered.length > 100 && (
                  <div className="px-4 py-3 font-mono text-[11px] text-center text-[#111111]/50 border-t border-[#111111]/10">
                    Type to see more...
                  </div>
                )}
                {filtered.length === 0 && (
                  <div className="px-4 py-10 font-mono text-[12px] text-center text-[#111111]/50">
                    No matching templates.
                  </div>
                )}
              </div>
            </div>

            <div className="flex-[1.5] flex flex-col gap-4">
              <div className="flex justify-between items-end mb-[-4px]">
                <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">Generated File</div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCopy}
                    disabled={!content}
                    className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] disabled:opacity-30 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button 
                    onClick={handleDownload}
                    disabled={!content}
                    className="flex items-center gap-1.5 bg-[#FFD400] text-[#111111] border border-[#111111] rounded-sm px-3 py-1.5 cursor-pointer font-bold font-sans text-[12.5px] hover:bg-[#111111] hover:text-[#FFD400] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
              <div className="w-full h-[456px] bg-[#111111] border border-[#111111] rounded-sm overflow-hidden relative">
                {loading && (
                  <div className="absolute inset-0 bg-[#111111]/50 flex items-center justify-center z-10">
                    <div className="font-mono text-[12px] text-[#FFD400] animate-pulse">Fetching templates...</div>
                  </div>
                )}
                <textarea
                  readOnly
                  value={content}
                  placeholder={selected.length === 0 ? "Select templates on the left to generate..." : ""}
                  className="w-full h-full p-5 bg-transparent border-none text-[13px] text-[#A6E22E] font-mono leading-loose focus:outline-none resize-none placeholder:text-[#FFFFFF]/30"
                />
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
