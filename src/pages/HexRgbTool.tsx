import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Copy, Check } from "lucide-react";

export function HexRgbTool() {
  const [hex, setHex] = useState("#FFD400");
  const [r, setR] = useState(255);
  const [g, setG] = useState(212);
  const [b, setB] = useState(0);

  const [copiedHex, setCopiedHex] = useState(false);
  const [copiedRgb, setCopiedRgb] = useState(false);

  const hexToRgb = (hexValue: string) => {
    const valid = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
    if (valid) {
      setR(parseInt(valid[1], 16));
      setG(parseInt(valid[2], 16));
      setB(parseInt(valid[3], 16));
    }
  };

  const rgbToHex = (rVal: number, gVal: number, bVal: number) => {
    const toHex = (c: number) => {
      const h = Math.max(0, Math.min(255, c)).toString(16);
      return h.length === 1 ? "0" + h : h;
    };
    const newHex = "#" + toHex(rVal) + toHex(gVal) + toHex(bVal);
    setHex(newHex.toUpperCase());
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHex(val);
    hexToRgb(val);
  };

  const handleRgbChange = (color: 'r' | 'g' | 'b', val: string) => {
    const num = parseInt(val) || 0;
    if (color === 'r') { setR(num); rgbToHex(num, g, b); }
    if (color === 'g') { setG(num); rgbToHex(r, num, b); }
    if (color === 'b') { setB(num); rgbToHex(r, g, num); }
  };

  const copy = (text: string, type: 'hex' | 'rgb') => {
    navigator.clipboard.writeText(text);
    if (type === 'hex') {
      setCopiedHex(true);
      setTimeout(() => setCopiedHex(false), 2000);
    } else {
      setCopiedRgb(true);
      setTimeout(() => setCopiedRgb(false), 2000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
          <div className="font-mono text-[12px] text-[#111111]/60 mb-6">
            <a href="/" className="text-[#111111] underline decoration-[#FFD400] decoration-2 underline-offset-2">Tools</a>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">Color Tools</span>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">HEX to RGB Converter</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            HEX to RGB Converter
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Instantly translate color formats between Hexadecimal and RGB values.
          </p>

          <div className="flex flex-col md:flex-row gap-8 max-w-4xl border border-[#111111] bg-white p-6 md:p-10 rounded-sm">
            <div className="flex-1 flex flex-col gap-6">
                 
                 <div className="flex flex-col gap-2">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-[#111111]/60">HEX Value</label>
                    <div className="flex border border-[#111111] rounded-sm overflow-hidden">
                        <input 
                            type="text" 
                            value={hex}
                            onChange={handleHexChange}
                            className="w-full p-4 font-mono font-bold text-[18px] outline-none text-[#111111]"
                        />
                        <button 
                            onClick={() => copy(hex, 'hex')}
                            className="px-4 bg-[#FAFAFA] border-l border-[#111111] hover:bg-[#FFD400] transition-colors cursor-pointer flex items-center justify-center font-mono text-[11px] uppercase"
                        >
                            {copiedHex ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                        </button>
                    </div>
                 </div>

                 <div className="flex flex-col gap-2">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-[#111111]/60">RGB Values</label>
                    <div className="flex gap-2">
                        <input type="number" min="0" max="255" value={r} onChange={(e) => handleRgbChange('r', e.target.value)} className="w-1/3 p-4 border border-[#111111] rounded-sm font-mono font-bold text-[16px] outline-none text-[#111111] focus:ring-2 focus:ring-[#FFD400]" />
                        <input type="number" min="0" max="255" value={g} onChange={(e) => handleRgbChange('g', e.target.value)} className="w-1/3 p-4 border border-[#111111] rounded-sm font-mono font-bold text-[16px] outline-none text-[#111111] focus:ring-2 focus:ring-[#FFD400]" />
                        <input type="number" min="0" max="255" value={b} onChange={(e) => handleRgbChange('b', e.target.value)} className="w-1/3 p-4 border border-[#111111] rounded-sm font-mono font-bold text-[16px] outline-none text-[#111111] focus:ring-2 focus:ring-[#FFD400]" />
                    </div>
                    <div className="flex border border-[#111111] rounded-sm overflow-hidden mt-2 bg-[#FAFAFA]">
                        <div className="w-full p-3 pl-4 font-mono text-[14px] text-[#111111]/70 bg-transparent flex items-center">
                            rgb({r}, {g}, {b})
                        </div>
                        <button 
                            onClick={() => copy(`rgb(${r}, ${g}, ${b})`, 'rgb')}
                            className="px-4 border-l border-[#111111] hover:bg-[#FFD400] transition-colors cursor-pointer flex items-center justify-center font-mono text-[11px]"
                        >
                            {copiedRgb ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                        </button>
                    </div>
                 </div>

            </div>

            <div className="flex-1 flex flex-col gap-2 relative">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#111111]/60">Preview</label>
                <div 
                    className="w-full h-full min-h-[200px] border border-[#111111] rounded-sm transition-colors duration-200"
                    style={{ backgroundColor: hex }}
                >
                </div>
                <input 
                    type="color" 
                    value={hex.substring(0, 7)} 
                    onChange={handleHexChange}
                    className="absolute bottom-2 right-2 w-10 h-10 border border-[#111111] p-0 rounded-sm cursor-pointer opacity-0"
                />
                <button 
                    className="absolute bottom-3 right-3 bg-white border border-[#111111] px-2 py-1 font-mono text-[10px] rounded-sm shadow-sm pointer-events-none"
                >Picker</button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
