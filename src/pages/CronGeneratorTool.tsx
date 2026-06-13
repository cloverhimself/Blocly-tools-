import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import cronstrue from "cronstrue";
import { Copy, Clock, Play } from "lucide-react";

export function CronGeneratorTool() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const cronExp = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  useEffect(() => {
     try {
        const desc = cronstrue.toString(cronExp, { throwExceptionOnParseError: true });
        setDescription(desc);
        setError("");
     } catch (e: any) {
        setDescription("");
        setError(e.toString());
     }
  }, [cronExp]);

  const preset = (m: string, h: string, dom: string, mon: string, dow: string) => {
     setMinute(m); setHour(h); setDayOfMonth(dom); setMonth(mon); setDayOfWeek(dow);
  }

  const InputBox = ({ label, val, setVal }: { label: string, val: string, setVal: (s:string)=>void }) => (
     <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[12px] font-bold text-[#111111]/70">{label}</label>
        <input 
           type="text" 
           value={val}
           onChange={e => setVal(e.target.value)}
           className="w-full text-center p-3 font-mono text-[16px] border border-[#111111] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
        />
     </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-10 md:py-14">
        <div className="max-w-2xl">
          <h1 className="m-0 font-extrabold text-3xl md:text-4xl tracking-[-0.03em]">Cron Generator</h1>
          <p className="mt-3 text-[16px] text-[#111111]/60 leading-relaxed">
            Create, visualize, and decode cron expressions in real-time.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-5 gap-3 md:gap-6 bg-white border border-[#111111] p-6 rounded-sm shadow-[4px_4px_0px_#111111] mb-8">
           <InputBox label="Minute" val={minute} setVal={setMinute} />
           <InputBox label="Hour" val={hour} setVal={setHour} />
           <InputBox label="Day / Month" val={dayOfMonth} setVal={setDayOfMonth} />
           <InputBox label="Month" val={month} setVal={setMonth} />
           <InputBox label="Day / Week" val={dayOfWeek} setVal={setDayOfWeek} />
        </div>

        <div className="bg-[#111111] text-white p-6 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex-1">
              <div className="font-mono text-3xl font-extrabold mb-2 tracking-wide text-[#FFD400]">
                 {cronExp}
              </div>
              <div className="font-sans text-[16px] font-semibold flex items-center gap-2">
                 <Play className="w-4 h-4" /> 
                 {error ? <span className="text-red-400">{error}</span> : description}
              </div>
           </div>
           <button 
             onClick={() => navigator.clipboard.writeText(cronExp)}
             className="px-6 py-3 border-2 border-white hover:bg-white hover:text-[#111111] text-sm font-bold rounded-sm transition-colors flex items-center gap-2"
           >
              <Copy className="w-4 h-4" /> Copy
           </button>
        </div>

        <h3 className="font-extrabold text-xl mt-12 mb-4">Common Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <PresetBtn label="Every minute" cron="* * * * *" onClick={() => preset('*','*','*','*','*')} />
           <PresetBtn label="Every hour" cron="0 * * * *" onClick={() => preset('0','*','*','*','*')} />
           <PresetBtn label="Every day at midnight" cron="0 0 * * *" onClick={() => preset('0','0','*','*','*')} />
           <PresetBtn label="Every Sunday" cron="0 0 * * 0" onClick={() => preset('0','0','*','*','0')} />
           <PresetBtn label="Every month" cron="0 0 1 * *" onClick={() => preset('0','0','1','*','*')} />
           <PresetBtn label="Every weekday (Mon-Fri)" cron="0 0 * * 1-5" onClick={() => preset('0','0','*','*','1-5')} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PresetBtn({ label, cron, onClick }: { label: string, cron: string, onClick: () => void }) {
   return (
      <button onClick={onClick} className="flex flex-col items-start gap-1 p-4 bg-white border border-[#111111] rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_#111111] transition-all text-left">
         <span className="font-bold text-[14px]">{label}</span>
         <span className="font-mono text-[12px] text-[#111111]/60 bg-[#FAFAFA] px-1.5 py-0.5 rounded-sm">{cron}</span>
      </button>
   )
}
