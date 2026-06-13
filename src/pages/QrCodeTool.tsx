import { useState, useRef } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { QRCodeCanvas } from "qrcode.react";
import { Download, SlidersHorizontal } from "lucide-react";

export function QrCodeTool() {
  const [text, setText] = useState("https://blocly.com");
  const [fgColor, setFgColor] = useState("#111111");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('Q');
  const [includeMargin, setIncludeMargin] = useState(true);
  
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode_${Date.now()}.png`;
    
    // Fallback if inside iframe
    try {
      a.click();
    } catch (e) {
      // Ignore
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
            <span className="text-[#111111]">Images</span>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">QR Code Generator</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            QR Code Generator
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Generate crisp, high-resolution QR codes that you can download as PNG files. All generation runs offline right in your browser.
          </p>

          <div className="flex flex-col md:flex-row gap-8 items-stretch mb-10">
            <div className="flex-[2] flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">URL or Text</div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-[120px] p-4 bg-[#FAFAFA] border border-[#111111] rounded-sm font-sans font-medium text-[16px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#FFD400] focus:border-transparent placeholder:text-[#111111]/30"
                />
              </div>
              
              <div className="border border-[#111111] rounded-sm p-5 bg-[#FAFAFA]">
                <div className="flex items-center gap-2 mb-5 font-bold">
                  <SlidersHorizontal className="w-[18px] h-[18px]" strokeWidth={2} />
                  <span>Customization</span>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col gap-4 flex-1">
                    <div className="flex justify-between items-center">
                      <div className="font-mono text-[11.5px] text-[#111111]/60">Foreground</div>
                      <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-[40px] h-[30px] p-0 border border-[#111111] rounded-sm cursor-pointer" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="font-mono text-[11.5px] text-[#111111]/60">Background</div>
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-[40px] h-[30px] p-0 border border-[#111111] rounded-sm cursor-pointer" />
                    </div>
                  </div>
                  
                  <div className="w-px bg-[#111111]/15 hidden md:block"></div>
                  
                  <div className="flex flex-col gap-4 flex-[1.5]">
                    <div className="flex flex-col gap-2.5">
                      <div className="font-mono text-[11.5px] text-[#111111]/60">Error Correction</div>
                      <div className="flex border border-[#111111] rounded-sm overflow-hidden">
                        {(['L', 'M', 'Q', 'H'] as const).map((l, i) => (
                          <button 
                            key={l} 
                            onClick={() => setLevel(l)}
                            className={`flex-1 py-1.5 px-1 border-none font-mono text-[11px] cursor-pointer ${level === l ? 'bg-[#FFD400]' : 'bg-[#FAFAFA] hover:bg-[#FFD400]/20'} ${i < 3 ? 'border-r border-[#111111]' : ''}`}
                            title={l === 'L' ? 'Low (7%)' : l === 'M' ? 'Medium (15%)' : l === 'Q' ? 'Quartile (25%)' : 'High (30%)'}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input 
                        type="checkbox" 
                        checked={includeMargin} 
                        onChange={(e) => setIncludeMargin(e.target.checked)}
                        className="w-4 h-4 accent-[#111111] cursor-pointer"
                      />
                      <span className="font-mono text-[11.5px] text-[#111111]/80">Include quiet zone margin</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-4 items-center justify-center border border-[#111111] rounded-sm bg-[#FAFAFA] p-6 min-h-[300px]">
              <div 
                ref={qrRef} 
                className="inline-block p-4 bg-white border border-[#111111]/10 rounded-sm shadow-sm"
                style={{ backgroundColor: bgColor }}
              >
                <QRCodeCanvas
                  value={text || " "}
                  size={200}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={level}
                  includeMargin={includeMargin}
                />
              </div>
              <button 
                onClick={handleDownload}
                disabled={!text}
                className="mt-4 flex flex-none items-center justify-center gap-2.5 w-full max-w-[200px] p-3 bg-[#FFD400] text-[#111111] border border-[#111111] rounded-sm font-sans font-bold text-[14.5px] cursor-pointer transition-colors duration-100 hover:bg-[#111111] hover:text-[#FFD400] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-[16px] h-[16px]" strokeWidth={2} />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
