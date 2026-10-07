import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Server, Send, AlertTriangle } from "lucide-react";

export function HttpHeaderTool() {
  const [url, setUrl] = useState("https://api.github.com");
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<number | null>(null);

  const fetchHeaders = async () => {
    if (!url) return;
    
    let target = url;
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = "https://" + target;
    }

    setLoading(true);
    setError("");
    setHeaders(null);
    setStatus(null);

    try {
      const proxyOpts = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target, method: "HEAD" })
      };
      
      const proxyRes = await fetch("/api/v1/proxy", proxyOpts);
      const data: any = await proxyRes.json();
      
      if (!proxyRes.ok || data.error) {
        throw new Error(data.error || proxyRes.statusText);
      }
      
      setStatus(data.status);
      setHeaders(data.headers || {});
    } catch (err: any) {
      try {
        const proxyOpts = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: target, method: "GET" })
        };
        const proxyRes = await fetch("/api/v1/proxy", proxyOpts);
        const data: any = await proxyRes.json();
        
        if (!proxyRes.ok || data.error) {
          throw new Error(data.error || proxyRes.statusText);
        }
        
        setStatus(data.status);
        setHeaders(data.headers || {});
      } catch (err2: any) {
         setError(err2.message || "Failed to fetch. This may be due to CORS restrictions or an invalid URL.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-10 flex flex-col">
        <div className="mb-8 w-full text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
              <Server className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">HTTP Header Viewer</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">View HTTP response headers for any URL</p>
        </div>

        <div className="bg-white border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111] mb-8 relative">
           <div className="flex flex-col md:flex-row gap-4">
             <input 
               type="text" 
               className="flex-1 bg-slate-50 border-2 border-[#111111] px-4 py-3 font-mono text-sm focus:outline-none focus:bg-white transition-colors"
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               placeholder="https://example.com"
               onKeyDown={(e) => e.key === 'Enter' && fetchHeaders()}
             />
             <button 
               onClick={fetchHeaders}
               disabled={!url || loading}
               className="flex items-center justify-center gap-2 px-6 py-3 bg-[#111111] text-white font-mono text-sm uppercase font-bold hover:bg-[#111111]/90 active:scale-[0.99] transition-all disabled:opacity-50 flex-none"
             >
               {loading ? "Fetching..." : <><Send className="w-4 h-4"/> Get Headers</>}
             </button>
           </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-500 p-4 mb-8 flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 text-red-500 flex-none mt-0.5" />
             <div className="font-mono text-sm text-red-700">
               <strong className="block mb-1">Error fetching headers</strong>
               {error}
               <p className="mt-2 text-xs opacity-70">
                 Note: Browser security (CORS) prevents reading headers from many external sites directly. 
               </p>
             </div>
          </div>
        )}

        {headers && (
          <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
            <div className="border-b-2 border-[#111111] p-4 bg-slate-50 flex items-center justify-between">
              <h2 className="m-0 font-mono text-sm uppercase tracking-wider font-bold">Response Headers</h2>
              <span className={`font-mono text-xs px-2 py-1 font-bold ${status && status >= 200 && status < 300 ? 'bg-green-100 text-green-800' : status && status >= 400 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                Status: {status}
              </span>
            </div>
            <div className="p-0">
               {Object.keys(headers).length === 0 ? (
                 <div className="p-6 text-center text-[#111111]/40 font-mono text-sm italic">
                   No headers returned.
                 </div>
               ) : (
                 <table className="w-full text-left font-mono text-sm">
                   <tbody>
                     {Object.entries(headers).map(([key, val], i) => (
                       <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                         <td className="py-3 px-4 border-b border-[#111111]/10 font-bold text-[#111111]/70 w-1/3 break-all">{key}</td>
                         <td className="py-3 px-4 border-b border-[#111111]/10 text-[#111111] break-all">{val}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
