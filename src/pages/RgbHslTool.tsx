import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Pipette, Copy, Check } from "lucide-react";

export function RgbHslTool() {
  const [r, setR] = useState<number | string>(255);
  const [g, setG] = useState<number | string>(212);
  const [b, setB] = useState<number | string>(0);
  
  const [h, setH] = useState<number | string>(50);
  const [s, setS] = useState<number | string>(100);
  const [l, setL] = useState<number | string>(50);
  
  const [copiedRgb, setCopiedRgb] = useState(false);
  const [copiedHsl, setCopiedHsl] = useState(false);

  // Helper RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  // Helper HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    let r, g, b;
    h /= 360; s /= 100; l /= 100;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  const handleRgbChange = (nr: number|string, ng: number|string, nb: number|string) => {
    setR(nr); setG(ng); setB(nb);
    const rVal = typeof nr === 'number' ? nr : parseInt(nr) || 0;
    const gVal = typeof ng === 'number' ? ng : parseInt(ng) || 0;
    const bVal = typeof nb === 'number' ? nb : parseInt(nb) || 0;
    const validR = Math.max(0, Math.min(255, rVal));
    const validG = Math.max(0, Math.min(255, gVal));
    const validB = Math.max(0, Math.min(255, bVal));
    const [nh, ns, nl] = rgbToHsl(validR, validG, validB);
    setH(nh); setS(ns); setL(nl);
  };

  const handleHslChange = (nh: number|string, ns: number|string, nl: number|string) => {
    setH(nh); setS(ns); setL(nl);
    const hVal = typeof nh === 'number' ? nh : parseInt(nh) || 0;
    const sVal = typeof ns === 'number' ? ns : parseInt(ns) || 0;
    const lVal = typeof nl === 'number' ? nl : parseInt(nl) || 0;
    const validH = Math.max(0, Math.min(360, hVal));
    const validS = Math.max(0, Math.min(100, sVal));
    const validL = Math.max(0, Math.min(100, lVal));
    const [nr, ng, nb] = hslToRgb(validH, validS, validL);
    setR(nr); setG(ng); setB(nb);
  };

  const validR = typeof r === 'number' ? r : parseInt(r) || 0;
  const validG = typeof g === 'number' ? g : parseInt(g) || 0;
  const validB = typeof b === 'number' ? b : parseInt(b) || 0;
  const rgbString = `rgb(${validR}, ${validG}, ${validB})`;
  
  const validH = typeof h === 'number' ? h : parseInt(h) || 0;
  const validS = typeof s === 'number' ? s : parseInt(s) || 0;
  const validL = typeof l === 'number' ? l : parseInt(l) || 0;
  const hslString = `hsl(${validH}, ${validS}%, ${validL}%)`;

  const copyToClipboard = (text: string, type: 'rgb' | 'hsl') => {
    navigator.clipboard.writeText(text);
    if (type === 'rgb') {
      setCopiedRgb(true);
      setTimeout(() => setCopiedRgb(false), 2000);
    } else {
      setCopiedHsl(true);
      setTimeout(() => setCopiedHsl(false), 2000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-10 flex flex-col items-center justify-center">
        <div className="mb-8 w-full text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
              <Pipette className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">RGB ↔ HSL Converter</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">Convert colors between RGB and HSL formats interactively.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* RGB Input */}
          <div className="bg-white border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111]">
            <h2 className="m-0 font-mono text-sm uppercase tracking-wider font-bold mb-6">RGB Color</h2>
            <div className="flex items-center gap-4 mb-4">
              <label className="font-mono font-bold w-4 text-red-500">R</label>
              <input type="range" min="0" max="255" value={r} onChange={(e) => handleRgbChange(e.target.value, g, b)} className="flex-1 accent-red-500" />
              <input type="number" min="0" max="255" value={r} onChange={(e) => handleRgbChange(e.target.value, g, b)} className="w-16 bg-slate-50 border-2 border-[#111111] px-2 py-1 font-mono text-sm focus:outline-none" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <label className="font-mono font-bold w-4 text-green-500">G</label>
              <input type="range" min="0" max="255" value={g} onChange={(e) => handleRgbChange(r, e.target.value, b)} className="flex-1 accent-green-500" />
              <input type="number" min="0" max="255" value={g} onChange={(e) => handleRgbChange(r, e.target.value, b)} className="w-16 bg-slate-50 border-2 border-[#111111] px-2 py-1 font-mono text-sm focus:outline-none" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <label className="font-mono font-bold w-4 text-blue-500">B</label>
              <input type="range" min="0" max="255" value={b} onChange={(e) => handleRgbChange(r, g, e.target.value)} className="flex-1 accent-blue-500" />
              <input type="number" min="0" max="255" value={b} onChange={(e) => handleRgbChange(r, g, e.target.value)} className="w-16 bg-slate-50 border-2 border-[#111111] px-2 py-1 font-mono text-sm focus:outline-none" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-100 border-2 border-[#111111]/20">
              <span className="font-mono font-bold text-lg">{rgbString}</span>
              <button onClick={() => copyToClipboard(rgbString, 'rgb')} className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-[#111111] text-[#111111] font-mono text-xs uppercase font-bold hover:bg-[#FFD400] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0px_#111111] transition-all">
                {copiedRgb ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
              </button>
            </div>
          </div>

          {/* HSL Input */}
          <div className="bg-white border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111]">
            <h2 className="m-0 font-mono text-sm uppercase tracking-wider font-bold mb-6">HSL Color</h2>
            <div className="flex items-center gap-4 mb-4">
              <label className="font-mono font-bold w-4 text-violet-500">H</label>
              <input type="range" min="0" max="360" value={h} onChange={(e) => handleHslChange(e.target.value, s, l)} className="flex-1 accent-violet-500" />
              <input type="number" min="0" max="360" value={h} onChange={(e) => handleHslChange(e.target.value, s, l)} className="w-16 bg-slate-50 border-2 border-[#111111] px-2 py-1 font-mono text-sm focus:outline-none" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <label className="font-mono font-bold w-4 text-orange-500">S</label>
              <input type="range" min="0" max="100" value={s} onChange={(e) => handleHslChange(h, e.target.value, l)} className="flex-1 accent-orange-500" />
              <input type="number" min="0" max="100" value={s} onChange={(e) => handleHslChange(h, e.target.value, l)} className="w-16 bg-slate-50 border-2 border-[#111111] px-2 py-1 font-mono text-sm focus:outline-none" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <label className="font-mono font-bold w-4 text-slate-500">L</label>
              <input type="range" min="0" max="100" value={l} onChange={(e) => handleHslChange(h, s, e.target.value)} className="flex-1 accent-slate-500" />
              <input type="number" min="0" max="100" value={l} onChange={(e) => handleHslChange(h, s, e.target.value)} className="w-16 bg-slate-50 border-2 border-[#111111] px-2 py-1 font-mono text-sm focus:outline-none" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-100 border-2 border-[#111111]/20">
              <span className="font-mono font-bold text-lg">{hslString}</span>
              <button onClick={() => copyToClipboard(hslString, 'hsl')} className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-[#111111] text-[#111111] font-mono text-xs uppercase font-bold hover:bg-[#FFD400] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0px_#111111] transition-all">
                {copiedHsl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
              </button>
            </div>
          </div>
        </div>

        {/* Color Preview */}
        <div className="mt-8 w-full border-2 border-[#111111] h-32 shadow-[4px_4px_0px_#111111]" style={{ backgroundColor: rgbString }} />
      </main>
      <Footer />
    </div>
  );
}
