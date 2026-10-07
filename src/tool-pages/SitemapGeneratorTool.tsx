import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Copy, Download, ListPlus, Trash2 } from "lucide-react";

type SitemapEntry = {
   loc: string;
   lastmod: string;
   changefreq: string;
   priority: string;
};

export function SitemapGeneratorTool() {
  const [entries, setEntries] = useState<SitemapEntry[]>([
     { loc: "https://example.com/", lastmod: new Date().toISOString().split('T')[0], changefreq: "daily", priority: "1.0" }
  ]);
  const [xmlContent, setXmlContent] = useState("");

  const handleAdd = () => {
     setEntries([...entries, { loc: "https://example.com/page", lastmod: new Date().toISOString().split('T')[0], changefreq: "weekly", priority: "0.8" }]);
  };

  const handleRemove = (index: number) => {
     setEntries(entries.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, key: keyof SitemapEntry, value: string) => {
     const newEntries = [...entries];
     newEntries[index][key] = value;
     setEntries(newEntries);
  };

  const generateSitemap = () => {
     let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
     
     entries.forEach(entry => {
        xml += `  <url>\n`;
        xml += `    <loc>${entry.loc}</loc>\n`;
        if (entry.lastmod) xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
        xml += `    <priority>${entry.priority}</priority>\n`;
        xml += `  </url>\n`;
     });

     xml += `</urlset>`;
     setXmlContent(xml);
  };

  const downloadSitemap = () => {
     const blob = new Blob([xmlContent], { type: "application/xml" });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = "sitemap.xml";
     a.click();
     URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-10 md:py-14 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h1 className="m-0 font-extrabold text-3xl md:text-4xl tracking-[-0.03em]">Sitemap Generator</h1>
          <p className="mt-3 mb-8 text-[16px] text-[#111111]/60 leading-relaxed">
            Visually construct SEO-compliant XML sitemaps for Google and other search engines.
          </p>

          <div className="flex flex-col gap-3">
             {entries.map((entry, idx) => (
                <div key={idx} className="bg-white border border-[#111111] p-4 rounded-sm flex flex-col xl:flex-row gap-4 items-center">
                   <div className="flex-1 w-full relative">
                      <label className="text-[11px] font-bold uppercase mb-1 block">URL</label>
                      <input 
                         type="text" 
                         value={entry.loc}
                         onChange={e => handleChange(idx, 'loc', e.target.value)}
                         className="w-full px-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[14px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                      />
                   </div>
                   <div className="w-full xl:w-32 relative">
                      <label className="text-[11px] font-bold uppercase mb-1 block">Last Mod</label>
                      <input 
                         type="date" 
                         value={entry.lastmod}
                         onChange={e => handleChange(idx, 'lastmod', e.target.value)}
                         className="w-full px-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[14px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                      />
                   </div>
                   <div className="w-full xl:w-32 relative">
                      <label className="text-[11px] font-bold uppercase mb-1 block">Frequency</label>
                      <select 
                         value={entry.changefreq}
                         onChange={e => handleChange(idx, 'changefreq', e.target.value)}
                         className="w-full px-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[14px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                      >
                         <option value="always">always</option>
                         <option value="hourly">hourly</option>
                         <option value="daily">daily</option>
                         <option value="weekly">weekly</option>
                         <option value="monthly">monthly</option>
                         <option value="yearly">yearly</option>
                         <option value="never">never</option>
                      </select>
                   </div>
                   <div className="w-full xl:w-24 relative">
                      <label className="text-[11px] font-bold uppercase mb-1 block">Priority</label>
                      <input 
                         type="number" 
                         step="0.1"
                         min="0"
                         max="1"
                         value={entry.priority}
                         onChange={e => handleChange(idx, 'priority', e.target.value)}
                         className="w-full px-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[14px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                      />
                   </div>
                   <div className="flex items-end self-end xl:self-auto h-full mt-4 xl:mt-0">
                      <button 
                         onClick={() => handleRemove(idx)}
                         disabled={entries.length === 1}
                         className="w-10 h-10 flex items-center justify-center border border-[#111111] bg-[#FAFAFA] hover:bg-red-50 hover:text-red-600 rounded-sm disabled:opacity-50"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             ))}
          </div>

          <div className="mt-4 flex items-center gap-4">
             <button 
                onClick={handleAdd}
                className="flex items-center gap-2 font-bold px-4 py-2.5 border border-[#111111] hover:bg-[#FAFAFA] rounded-sm transition-colors"
             >
                <ListPlus className="w-4 h-4" /> Add Page
             </button>
             <button 
                onClick={generateSitemap}
                className="flex items-center gap-2 font-bold px-6 py-2.5 bg-[#FFD400] border border-[#111111] hover:bg-[#FFE040] rounded-sm transition-colors shadow-[2px_2px_0px_#111111]"
             >
                Generate Sitemap
             </button>
          </div>
        </div>

        <div className="w-full md:w-[400px] border border-[#111111] bg-white rounded-sm flex flex-col min-h-[500px]">
           <div className="h-[46px] border-b border-[#111111] flex items-center justify-between px-3 bg-[#FAFAFA]">
              <div className="font-bold text-[14px]">XML Output</div>
              <div className="flex gap-2">
                 <button onClick={() => navigator.clipboard.writeText(xmlContent)} disabled={!xmlContent} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold border border-[#111111] rounded-sm hover:bg-[#FFD400] transition-colors disabled:opacity-50">
                   <Copy className="w-3.5 h-3.5" />
                 </button>
                 <button onClick={downloadSitemap} disabled={!xmlContent} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold border border-[#111111] rounded-sm hover:bg-[#FFD400] transition-colors disabled:opacity-50">
                   <Download className="w-3.5 h-3.5" />
                 </button>
              </div>
           </div>
           <textarea 
              value={xmlContent}
              readOnly
              placeholder="Click Generate to construct XML..."
              className="flex-1 p-4 font-mono text-[13px] text-[#111111] bg-transparent resize-none outline-none whitespace-pre"
              spellCheck={false}
           />
        </div>
      </main>
      <Footer />
    </div>
  );
}
