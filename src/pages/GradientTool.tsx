import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { PaintBucket, Copy, Check } from "lucide-react";

export function GradientTool() {
  const [color1, setColor1] = useState("#FFD400");
  const [color2, setColor2] = useState("#FF0055");
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);

  const gradientString = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
  const cssCode = `background: ${color1};\nbackground: ${gradientString};`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reverseColors = () => {
    setColor1(color2);
    setColor2(color1);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-10 flex flex-col">
        <div className="mb-8 w-full text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
              <PaintBucket className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">Gradient Generator</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">Create beautiful linear CSS gradients</p>
        </div>

        <div className="w-full border-4 border-[#111111] h-64 mb-8 shadow-[8px_8px_0px_#111111]" style={{ background: gradientString }} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111]">
             <h2 className="m-0 font-mono text-sm uppercase tracking-wider font-bold mb-6">Controls</h2>
             
             <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <div className="w-full sm:flex-1 flex flex-col gap-2">
                  <label className="font-mono text-xs font-bold uppercase text-[#111111]/60">Color 1</label>
                  <div className="flex">
                    <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="w-12 h-10 border-2 border-[#111111] border-r-0 cursor-pointer p-0 shrink-0" />
                    <input type="text" value={color1.toUpperCase()} onChange={e => setColor1(e.target.value)} className="flex-1 w-full bg-slate-50 border-2 border-[#111111] px-2 font-mono text-sm focus:outline-none uppercase min-w-0" />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-0 sm:pt-6">
                  <button onClick={reverseColors} className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-[#FFD400] border-2 border-[#111111] transition-colors rotate-90 sm:rotate-0" title="Swap Colors">
                    ⇄
                  </button>
                </div>

                <div className="w-full sm:flex-1 flex flex-col gap-2">
                  <label className="font-mono text-xs font-bold uppercase text-[#111111]/60">Color 2</label>
                  <div className="flex">
                    <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="w-12 h-10 border-2 border-[#111111] border-r-0 cursor-pointer p-0 shrink-0" />
                    <input type="text" value={color2.toUpperCase()} onChange={e => setColor2(e.target.value)} className="flex-1 w-full bg-slate-50 border-2 border-[#111111] px-2 font-mono text-sm focus:outline-none uppercase min-w-0" />
                  </div>
                </div>
             </div>

             <div className="flex flex-col gap-2 mb-2">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-xs font-bold uppercase text-[#111111]/60">Angle</label>
                  <span className="font-mono text-sm font-bold">{angle}°</span>
                </div>
                <input type="range" min="0" max="360" value={angle} onChange={e => setAngle(parseInt(e.target.value))} className="w-full accent-[#111111]" />
             </div>
          </div>

          <div className="bg-[#111111] text-white border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111] flex flex-col">
             <div className="flex items-center justify-between mb-4">
                <h2 className="m-0 font-mono text-sm uppercase tracking-wider font-bold">CSS Code</h2>
                <button onClick={copyToClipboard} className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-[#111111] text-[#111111] font-mono text-xs uppercase font-bold hover:bg-[#FFD400] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0px_#FFD400] transition-all">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                </button>
             </div>
             <textarea 
               value={cssCode} 
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
