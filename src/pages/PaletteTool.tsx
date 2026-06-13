import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Paintbrush, RefreshCw, Copy, Check } from "lucide-react";

export function PaletteTool() {
  const [colors, setColors] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generatePalette = () => {
    // Generate a nice random palette using HSL to keep them somewhat cohesive
    const baseHue = Math.floor(Math.random() * 360);
    const newColors = Array.from({ length: 5 }, (_, i) => {
       const hue = (baseHue + i * 36) % 360; // analogous split
       const l = 30 + Math.random() * 40; // lightness between 30 and 70
       const s = 50 + Math.random() * 50; // saturation 50-100
       return hslToHex(hue, s, l);
    });
    setColors(newColors);
  };

  useEffect(() => {
    generatePalette();
  }, []);

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  const copyColor = (color: string, index: number) => {
    navigator.clipboard.writeText(color);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-10 flex flex-col">
        <div className="mb-8 w-full flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
                <Paintbrush className="w-5 h-5 text-[#111111]" />
              </div>
              <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">Color Palette Generator</h1>
            </div>
            <p className="text-[#111111]/60 text-sm">Generate cohesive color schemes for your projects</p>
          </div>
          <button 
            onClick={generatePalette}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFD400] border-2 border-[#111111] text-[#111111] font-mono text-sm uppercase font-bold hover:bg-[#ffe14d] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[4px_4px_0px_#111111] transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Generate New
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row border-4 border-[#111111] shadow-[8px_8px_0px_#111111] overflow-hidden min-h-[400px]">
          {colors.map((color, i) => (
            <div 
               key={i} 
               className="flex-1 flex flex-col justify-end p-6 transition-all relative group shadow-[inset_0px_0px_0px_1px_rgba(0,0,0,0.1)]"
               style={{ backgroundColor: color }}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center bg-black/10">
                 <button 
                   onClick={() => copyColor(color, i)}
                   className="bg-white px-4 py-2 border-2 border-[#111111] font-mono font-bold text-sm uppercase shadow-[2px_2px_0px_#111111] flex items-center gap-2 hover:bg-[#FFD400] transition-colors"
                 >
                   {copiedIndex === i ? <><Check className="w-4 h-4"/> Copied</> : <><Copy className="w-4 h-4"/> Copy</>}
                 </button>
              </div>
              <div className="bg-white/90 border-2 border-[#111111] self-center md:self-stretch text-center p-3 font-mono text-lg font-bold shadow-[2px_2px_0px_#111111]">
                {color}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
