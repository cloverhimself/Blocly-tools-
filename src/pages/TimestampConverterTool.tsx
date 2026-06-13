import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Copy, Clock, CalendarDays } from "lucide-react";

export function TimestampConverterTool() {
  const [unixInput, setUnixInput] = useState("");
  const [humanInput, setHumanInput] = useState("");
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [unixError, setUnixError] = useState("");
  const [humanError, setHumanError] = useState("");
  
  useEffect(() => {
     const timer = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
     return () => clearInterval(timer);
  }, []);

  const handleUnixChange = (v: string) => {
    setUnixInput(v);
    setUnixError("");
    if (!v) {
       setHumanInput("");
       return;
    }
    const nm = parseInt(v);
    if (isNaN(nm)) {
       setUnixError("Invalid Unix timestamp");
       return;
    }
    // Assume seconds if length is <= 10, else ms
    const ms = String(nm).length > 10 ? nm : nm * 1000;
    const d = new Date(ms);
    if (d.toString() === "Invalid Date") {
       setUnixError("Invalid timestamp range");
    } else {
       setHumanInput(d.toISOString().slice(0, 19).replace('T', ' '));
    }
  };

  const handleHumanChange = (v: string) => {
    setHumanInput(v);
    setHumanError("");
    if (!v) {
       setUnixInput("");
       return;
    }
    const d = new Date(v + " GMT"); // parse as GMT
    if (d.toString() === "Invalid Date") {
       setHumanError("Invalid date format (try YYYY-MM-DD HH:mm:ss)");
    } else {
       setUnixInput(Math.floor(d.getTime() / 1000).toString());
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-10 md:py-14">
        <div className="max-w-2xl">
          <h1 className="m-0 font-extrabold text-3xl md:text-4xl tracking-[-0.03em]">Timestamp Converter</h1>
          <p className="mt-3 text-[16px] text-[#111111]/60 leading-relaxed">
            Convert unix timestamps to human-readable dates and back.
          </p>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between bg-white border border-[#111111] p-6 rounded-sm gap-4 mb-8">
           <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#111111]" />
              <div>
                 <div className="font-mono text-[12px] font-bold text-[#111111]/50 uppercase">Current Epoch</div>
                 <div className="font-mono text-xl font-bold">{currentTime}</div>
              </div>
           </div>
           <button 
             onClick={() => navigator.clipboard.writeText(currentTime.toString())}
             className="px-4 py-2 border border-[#111111] bg-[#FAFAFA] hover:bg-[#FFD400] text-sm font-semibold rounded-sm transition-colors"
           >
              Copy
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="flex flex-col gap-2">
              <label className="font-bold text-[14px] flex items-center gap-2">
                 <Hash className="w-4 h-4" /> Unix Timestamp
              </label>
              <div className="relative">
                 <input 
                    type="text" 
                    value={unixInput}
                    onChange={e => handleUnixChange(e.target.value)}
                    placeholder="e.g. 1718302000"
                    className={`w-full p-4 font-mono text-[15px] border ${unixError ? 'border-red-500' : 'border-[#111111]'} rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]`}
                 />
                 <button 
                    onClick={() => navigator.clipboard.writeText(unixInput)}
                    className="absolute right-2 top-2 bottom-2 px-3 hover:bg-[#FAFAFA] border border-transparent hover:border-[#111111] rounded-sm transition-colors"
                 >
                    <Copy className="w-4 h-4" />
                 </button>
              </div>
              {unixError && <div className="text-red-500 text-[13px]">{unixError}</div>}
           </div>

           <div className="flex flex-col gap-2">
              <label className="font-bold text-[14px] flex items-center gap-2">
                 <CalendarDays className="w-4 h-4" /> Human Readable (UTC)
              </label>
              <div className="relative">
                 <input 
                    type="text" 
                    value={humanInput}
                    onChange={e => handleHumanChange(e.target.value)}
                    placeholder="e.g. 2026-06-13 18:06:40"
                    className={`w-full p-4 font-mono text-[15px] border ${humanError ? 'border-red-500' : 'border-[#111111]'} rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]`}
                 />
                 <button 
                    onClick={() => navigator.clipboard.writeText(humanInput)}
                    className="absolute right-2 top-2 bottom-2 px-3 hover:bg-[#FAFAFA] border border-transparent hover:border-[#111111] rounded-sm transition-colors"
                 >
                    <Copy className="w-4 h-4" />
                 </button>
              </div>
              {humanError && <div className="text-red-500 text-[13px]">{humanError}</div>}
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Add temporary mock Hash icon just in case it doesn't import
function Hash(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
}
