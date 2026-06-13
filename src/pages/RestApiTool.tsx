import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Network, Send, Plus, Trash2, Code } from "lucide-react";

export function RestApiTool() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [headers, setHeaders] = useState<{k: string, v: string}[]>([{k: "", v: ""}]);
  const [body, setBody] = useState("");
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body">("headers");

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [resTab, setResTab] = useState<"body" | "headers">("body");

  const handleSend = async () => {
    if (!url) return;
    setLoading(true);
    const start = performance.now();
    setResponse(null);
    setResponseStatus(null);
    setResponseHeaders({});
    
    let target = url;
    if (!target.startsWith("http")) target = "https://" + target;

    const reqHeaders: Record<string, string> = {};
    headers.forEach(h => {
       if (h.k.trim()) reqHeaders[h.k.trim()] = h.v.trim();
    });

    try {
      const opts: RequestInit = {
        method,
        headers: reqHeaders,
      };
      if (method !== "GET" && method !== "HEAD" && body) {
        opts.body = body;
      }
      
      const res = await fetch(target, opts);
      setResponseStatus(res.status);
      
      const hdrs: Record<string, string> = {};
      res.headers.forEach((v, k) => hdrs[k] = v);
      setResponseHeaders(hdrs);

      const text = await res.text();
      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch (e) {
        setResponse(text);
      }
    } catch (err: any) {
      setResponse(`Error: ${err.message}\nThis might be due to CORS restrictions.`);
    } finally {
      const end = performance.now();
      setResponseTime(Math.round(end - start));
      setLoading(false);
      setResTab("body"); // Auto switch to body on response
    }
  };

  const addHeader = () => setHeaders([...headers, {k: "", v: ""}]);
  const updateHeader = (index: number, key: "k" | "v", val: string) => {
    const newH = [...headers];
    newH[index][key] = val;
    setHeaders(newH);
  };
  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
    if (headers.length === 1) setHeaders([{k: "", v: ""}]);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-10 flex flex-col">
         <div className="mb-6 w-full text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
              <Network className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">REST API Tester</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">Lightweight browser-based HTTP client</p>
        </div>

        <div className="flex flex-col gap-6">
           <div className="flex bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-1">
              <select 
                className="bg-slate-100 border-none px-4 py-3 font-mono font-bold text-sm focus:outline-none cursor-pointer"
                value={method}
                onChange={e => setMethod(e.target.value)}
              >
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <div className="w-0.5 bg-[#111111] my-1" />
              <input 
                 className="flex-1 px-4 py-3 font-mono text-sm focus:outline-none"
                 value={url}
                 onChange={e => setUrl(e.target.value)}
                 placeholder="https://api.example.com/v1/users"
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                 onClick={handleSend}
                 disabled={loading}
                 className="bg-[#111111] text-[#FFD400] px-6 py-3 font-mono font-bold uppercase text-sm flex items-center gap-2 hover:bg-[#111111]/90 transition-colors disabled:opacity-50"
              >
                 {loading ? "Sending" : "Send"} <Send className="w-4 h-4" />
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-[500px]">
             {/* Request Configuration */}
             <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex flex-col h-full overflow-hidden">
                <div className="flex border-b-2 border-[#111111] bg-slate-50">
                  {['headers', 'body'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 py-3 px-4 font-mono text-xs uppercase font-bold text-center border-r-2 last:border-r-0 border-[#111111] transition-colors ${activeTab === tab ? 'bg-white block border-b-0 -mb-[2px] relative z-10' : 'text-[#111111]/50 hover:bg-slate-100'}`}
                    >
                      {tab} {tab === 'headers' && headers.filter(h => h.k).length > 0 && `(${headers.filter(h => h.k).length})`}
                    </button>
                  ))}
                </div>
                
                <div className="flex-1 p-0 overflow-y-auto bg-white relative">
                  {activeTab === 'headers' && (
                    <div className="p-4 flex flex-col gap-2">
                      {headers.map((h, i) => (
                        <div key={i} className="flex gap-2">
                           <input placeholder="Key" value={h.k} onChange={e => updateHeader(i, 'k', e.target.value)} className="flex-1 border-2 border-[#111111] bg-slate-50 px-3 py-2 font-mono text-xs focus:outline-none focus:bg-white" />
                           <input placeholder="Value" value={h.v} onChange={e => updateHeader(i, 'v', e.target.value)} className="flex-[2] border-2 border-[#111111] bg-slate-50 px-3 py-2 font-mono text-xs focus:outline-none focus:bg-white" />
                           <button onClick={() => removeHeader(i)} className="w-10 flex items-center justify-center border-2 border-transparent text-[#111111]/40 hover:text-red-500 hover:border-red-500 transition-colors">
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      ))}
                      <button onClick={addHeader} className="text-left mt-2 px-3 py-2 text-xs font-mono font-bold uppercase text-[#111111]/60 hover:text-[#111111] flex items-center gap-1 w-max">
                        <Plus className="w-3 h-3" /> Add Header
                      </button>
                    </div>
                  )}

                  {activeTab === 'body' && (
                    <div className="absolute inset-0 flex flex-col">
                      <div className="p-2 border-b-2 border-[#111111] bg-slate-50 text-xs font-mono text-[#111111]/60 flex justify-between items-center px-4">
                         <span>Raw content (JSON, text, etc)</span>
                         <button onClick={() => setHeaders([...headers, {k: "Content-Type", v: "application/json"}])} className="text-[#111111] hover:underline font-bold">set JSON header</button>
                      </div>
                      <textarea 
                        className="flex-1 w-full bg-white p-4 font-mono text-sm resize-none focus:outline-none"
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder={`{\n  "key": "value"\n}`}
                        spellCheck={false}
                        disabled={method === 'GET' || method === 'HEAD'} 
                      />
                    </div>
                  )}
                </div>
             </div>

             {/* Response Viewer */}
             <div className="bg-[#111111] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex flex-col h-full overflow-hidden text-[#E5E5E5]">
                {responseStatus ? (
                  <div className="flex border-b-2 border-white/20 bg-black/40">
                    <button 
                        onClick={() => setResTab('body')}
                        className={`flex-1 py-3 px-4 font-mono text-xs uppercase font-bold text-center border-r-2 last:border-r-0 border-white/20 transition-colors ${resTab === 'body' ? 'bg-[#111111] text-[#FFD400]' : 'text-white/50 hover:bg-white/5'}`}
                      >
                        Body
                      </button>
                      <button 
                        onClick={() => setResTab('headers')}
                        className={`flex-1 py-3 px-4 font-mono text-xs uppercase font-bold text-center border-r-2 last:border-r-0 border-white/20 transition-colors ${resTab === 'headers' ? 'bg-[#111111] text-[#FFD400]' : 'text-white/50 hover:bg-white/5'}`}
                      >
                        Headers
                      </button>
                     <div className="px-4 py-3 font-mono text-[10px] flex items-center gap-3">
                        <span className={`font-bold px-2 py-0.5 ${responseStatus >= 200 && responseStatus < 300 ? 'bg-green-500/20 text-green-400' : responseStatus >= 400 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                           {responseStatus}
                        </span>
                        <span>{responseTime}ms</span>
                     </div>
                  </div>
                ) : (
                  <div className="border-b-2 border-white/20 bg-black/40 p-3 font-mono text-xs uppercase font-bold text-white/40 text-center">
                    Response
                  </div>
                )}
                
                <div className="flex-1 overflow-auto relative">
                   {resTab === 'body' && (
                     response ? (
                       <pre className="p-4 font-mono text-sm text-[#FFD400] whitespace-pre-wrap break-all absolute inset-0 overflow-auto">{response}</pre>
                     ) : (
                       <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-white/20 font-mono text-xs uppercase">
                          <Code className="w-12 h-12" />
                          Hit Send to get a response
                       </div>
                     )
                   )}
                   {resTab === 'headers' && (
                     <div className="p-4 absolute inset-0 overflow-auto font-mono text-sm leading-tight">
                       {Object.keys(responseHeaders).length === 0 ? (
                         <div className="text-white/40">No headers</div>
                       ) : (
                         Object.entries(responseHeaders).map(([k, v]) => (
                           <div key={k} className="mb-2">
                              <span className="font-bold text-white/60">{k}:</span> <span className="break-all">{v}</span>
                           </div>
                         ))
                       )}
                     </div>
                   )}
                </div>
             </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
