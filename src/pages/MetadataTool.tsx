import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Code, Image as ImageIcon } from "lucide-react";

export function MetadataTool() {
  const [title, setTitle] = useState("My Awesome Website");
  const [description, setDescription] = useState("A really cool website about awesome things.");
  const [url, setUrl] = useState("https://example.com");
  const [imageUrl, setImageUrl] = useState("https://example.com/og-image.jpg");
  const [themeColor, setThemeColor] = useState("#FFD400");
  const [twitterHandle, setTwitterHandle] = useState("@myhandle");

  const generateMeta = () => {
    return `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}" />
<meta name="description" content="${description}" />
<meta name="theme-color" content="${themeColor}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${imageUrl}" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${url}" />
<meta property="twitter:title" content="${title}" />
<meta property="twitter:description" content="${description}" />
<meta property="twitter:image" content="${imageUrl}" />
${twitterHandle ? `<meta name="twitter:creator" content="${twitterHandle}" />` : ''}
    `.trim();
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-10 flex flex-col">
        <div className="mb-8 w-full text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
              <Code className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">Metadata Generator</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">Generate OpenGraph and Twitter meta tags for your website</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111] flex flex-col gap-4">
             <h2 className="m-0 font-mono text-sm uppercase tracking-wider font-bold mb-2">Details</h2>
             
             <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#111111]/60 uppercase">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 border-2 border-[#111111] px-3 py-2 font-mono text-sm focus:outline-none focus:bg-white" />
             </div>
             <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#111111]/60 uppercase">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-50 border-2 border-[#111111] px-3 py-2 font-mono text-sm focus:outline-none focus:bg-white h-20 resize-none" />
             </div>
             <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#111111]/60 uppercase">Site URL</label>
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-slate-50 border-2 border-[#111111] px-3 py-2 font-mono text-sm focus:outline-none focus:bg-white" />
             </div>
             <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#111111]/60 uppercase">Image URL (OG / Twitter)</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full bg-slate-50 border-2 border-[#111111] px-3 py-2 font-mono text-sm focus:outline-none focus:bg-white" />
             </div>
             <div className="flex gap-4">
               <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-bold text-[#111111]/60 uppercase">Theme Color</label>
                  <div className="flex">
                    <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-10 h-10 border-2 border-[#111111] border-r-0 cursor-pointer p-0" />
                    <input type="text" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="flex-1 w-full bg-slate-50 border-2 border-[#111111] px-3 py-2 font-mono text-sm focus:outline-none focus:bg-white" />
                  </div>
               </div>
               <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-bold text-[#111111]/60 uppercase">Twitter Handle</label>
                  <input type="text" value={twitterHandle} onChange={e => setTwitterHandle(e.target.value)} className="w-full bg-slate-50 border-2 border-[#111111] px-3 py-2 font-mono text-sm focus:outline-none focus:bg-white" />
               </div>
             </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-[#111111] text-white border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111] flex flex-col h-[380px]">
               <h2 className="m-0 font-mono text-sm uppercase tracking-wider font-bold mb-4">HTML Meta Tags</h2>
               <textarea 
                  value={generateMeta()} 
                  readOnly 
                  className="w-full flex-1 bg-transparent text-[#FFD400] font-mono text-xs whitespace-pre resize-none focus:outline-none" 
                  spellCheck={false}
               />
               <button onClick={() => navigator.clipboard.writeText(generateMeta())} className="mt-4 py-2 bg-white text-[#111111] font-mono font-bold text-sm uppercase hover:bg-[#FFD400] transition-colors border-2 border-white hover:border-[#111111]">
                  Copy to Clipboard
               </button>
            </div>

            {/* Micro Preview Card */}
            <div className="bg-white border-2 border-[#111111] p-0 shadow-[4px_4px_0px_#111111] overflow-hidden flex flex-col">
              <div className="h-[200px] bg-slate-100 flex items-center justify-center border-b border-[#111111]/10 relative overflow-hidden">
                 {imageUrl ? (
                   <img src={imageUrl} alt="OG Preview" className="absolute inset-0 w-full h-full object-cover" onError={(e) => {
                     (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect x="0" y="0" width="100" height="100" fill="%23f1f5f9"/></svg>';
                   }} />
                 ) : (
                   <div className="text-[#111111]/30 flex flex-col items-center gap-2"><ImageIcon className="w-8 h-8"/> No Image</div>
                 )}
              </div>
              <div className="p-4 bg-slate-50">
                <div className="text-[#111111]/50 text-xs font-mono mb-1 truncate">{url.replace(/^https?:\/\//, '')}</div>
                <div className="font-bold text-[#111111] mb-1 truncate">{title || "Title"}</div>
                <div className="text-sm text-[#111111]/70 line-clamp-2 leading-snug">{description || "Description"}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
