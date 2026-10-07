import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { ListTree, Copy, Check, Plus, Trash2 } from "lucide-react";

type ChangeType = 'Added' | 'Changed' | 'Deprecated' | 'Removed' | 'Fixed' | 'Security';

interface ChangeItem {
  type: ChangeType;
  text: string;
}

export function ChangelogTool() {
  const [version, setVersion] = useState("1.0.0");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [changes, setChanges] = useState<ChangeItem[]>([
    { type: 'Added', text: 'New feature X' },
    { type: 'Fixed', text: 'Bug Y in component Z' }
  ]);
  const [copied, setCopied] = useState(false);

  const handleAdd = () => {
    setChanges([...changes, { type: 'Added', text: '' }]);
  };

  const handleRemove = (index: number) => {
    setChanges(changes.filter((_, i) => i !== index));
  };

  const handleChangeType = (index: number, type: ChangeType) => {
    const newChanges = [...changes];
    newChanges[index].type = type;
    setChanges(newChanges);
  };

  const handleChangeText = (index: number, text: string) => {
    const newChanges = [...changes];
    newChanges[index].text = text;
    setChanges(newChanges);
  };

  const generateMarkdown = () => {
    const grouped = changes.reduce((acc, curr) => {
      if (!curr.text.trim()) return acc;
      if (!acc[curr.type]) acc[curr.type] = [];
      acc[curr.type].push(curr.text);
      return acc;
    }, {} as Record<string, string[]>);

    let md = `## [${version}] - ${date}\n\n`;
    
    // Standard ordering
    const order: ChangeType[] = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
    
    order.forEach(type => {
      if (grouped[type] && grouped[type].length > 0) {
        md += `### ${type}\n`;
        grouped[type].forEach(text => {
          md += `- ${text}\n`;
        });
        md += `\n`;
      }
    });

    return md.trim();
  };

  const output = generateMarkdown();

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-10 flex flex-col">
        <div className="mb-8 w-full text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
              <ListTree className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">Changelog Generator</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">Generate beautiful "Keep a Changelog" formatted markdown</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111] flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-[#111111]/60">Version</label>
                <input 
                  type="text" 
                  value={version} 
                  onChange={e => setVersion(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-[#111111] px-3 py-2 font-mono text-sm focus:outline-none focus:bg-white" 
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-[#111111]/60">Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-[#111111] px-3 py-2 font-mono text-sm focus:outline-none focus:bg-white" 
                />
              </div>
            </div>

            <div className="flex border-b-2 border-[#111111] pb-2 justify-between items-end">
              <h2 className="m-0 font-mono text-sm uppercase tracking-wider font-bold">Changes</h2>
              <button onClick={handleAdd} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#FFD400] px-2 py-1 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all">
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {changes.map((c, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2">
                  <select 
                    value={c.type} 
                    onChange={e => handleChangeType(i, e.target.value as ChangeType)}
                    className="w-[110px] flex-none bg-slate-100 border-2 border-[#111111] px-2 py-2 font-mono text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option>Added</option>
                    <option>Changed</option>
                    <option>Deprecated</option>
                    <option>Removed</option>
                    <option>Fixed</option>
                    <option>Security</option>
                  </select>
                  <input 
                    placeholder="Describe change..." 
                    value={c.text} 
                    onChange={e => handleChangeText(i, e.target.value)} 
                    className="flex-1 min-w-0 border-2 border-[#111111] bg-slate-50 px-3 py-2 font-mono text-sm focus:outline-none focus:bg-white" 
                  />
                  <button onClick={() => handleRemove(i)} className="w-10 flex-none flex items-center justify-center border-2 border-transparent text-[#111111]/40 hover:text-red-500 hover:border-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {changes.length === 0 && (
                <div className="text-center font-mono text-xs text-[#111111]/40 py-4 italic">No changes added. Click "Add Item"</div>
              )}
            </div>
          </div>

          <div className="bg-[#111111] text-[#E5E5E5] border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111] flex flex-col h-full min-h-[400px]">
             <div className="flex items-center justify-between mb-4">
                <h2 className="m-0 font-mono text-sm uppercase tracking-wider font-bold">Markdown Output</h2>
                <button 
                  onClick={handleCopy} 
                  className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-[#111111] text-[#111111] font-mono text-xs uppercase font-bold hover:bg-[#FFD400] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0px_#FFD400] transition-all"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                </button>
             </div>
             <textarea 
               value={output} 
               readOnly 
               className="w-full flex-1 bg-transparent text-[#FFD400] font-mono text-sm resize-none focus:outline-none" 
               spellCheck={false}
             />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
