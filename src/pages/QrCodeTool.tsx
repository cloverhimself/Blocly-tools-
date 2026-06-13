import { useState, useRef } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { QRCodeCanvas } from "qrcode.react";
import Barcode from "react-barcode";
import { Download, SlidersHorizontal, QrCode, AlignJustify } from "lucide-react";

export function QrCodeTool() {
  const [activeTab, setActiveTab] = useState<"qrcode" | "barcode">("qrcode");
  const [text, setText] = useState("https://blocly.com");
  const [barcodeText, setBarcodeText] = useState("123456789012");
  const [fgColor, setFgColor] = useState("#111111");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  
  // QR Specific
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('Q');
  const [includeMargin, setIncludeMargin] = useState(true);
  
  // Barcode specific
  const [barcodeFormat, setBarcodeFormat] = useState<any>('CODE128');
  
  const qrRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const activeRef = activeTab === "qrcode" ? qrRef : barcodeRef;
    let canvas = activeRef.current?.querySelector("canvas");
    
    // Barcode might be rendering as an SVG by default in react-barcode unless we find a canvas, 
    // wait react-barcode renders an SVG. If it's SVG we need to convert to Canvas down here or handle differently.
    // Actually, react-barcode has a renderer prop: renderer="canvas" or "svg". So we can force canvas!
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}_${Date.now()}.png`;
    
    try {
      a.click();
    } catch (e) {}
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
            <span className="text-[#111111]">QR & Barcode Generator</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            QR & Barcode Generator
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Generate crisp, high-resolution QR codes and Barcodes that you can download as PNG files. All generation runs offline right in your browser.
          </p>
          
          <div className="flex border-b-2 border-[#111111] mb-8">
            <button 
              onClick={() => setActiveTab('qrcode')}
              className={`px-6 py-3 font-mono text-xs uppercase font-bold text-center border-r-2 border-t-2 border-[#111111] transition-colors flex items-center gap-2 ${activeTab === 'qrcode' ? 'bg-[#FFD400] border-l-2' : 'bg-transparent text-[#111111]/50 border-transparent hover:text-[#111111]'}`}
            >
              <QrCode className="w-4 h-4" /> QR Code
            </button>
            <button 
              onClick={() => setActiveTab('barcode')}
              className={`px-6 py-3 font-mono text-xs uppercase font-bold text-center border-t-2 border-r-2 border-[#111111] transition-colors flex items-center gap-2 ${activeTab === 'barcode' ? 'bg-[#FFD400] border-l-2 -ml-[2px]' : 'bg-transparent text-[#111111]/50 border-transparent hover:text-[#111111]'}`}
            >
              <AlignJustify className="w-4 h-4" /> Barcode
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-stretch mb-10">
            <div className="flex-[2] flex flex-col gap-6">
              
              {activeTab === 'qrcode' ? (
                <div className="flex flex-col gap-2">
                  <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">URL or Text</div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-[120px] p-4 bg-white border-2 border-[#111111] rounded-sm font-sans font-medium text-[16px] leading-relaxed resize-none focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_#111111] focus:shadow-[2px_2px_0px_#111111] transition-all placeholder:text-[#111111]/30"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">Barcode Value</div>
                  <input
                    value={barcodeText}
                    onChange={(e) => setBarcodeText(e.target.value)}
                    placeholder="123456789"
                    className="w-full p-4 bg-white border-2 border-[#111111] rounded-sm font-sans font-medium text-[16px] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_#111111] focus:shadow-[2px_2px_0px_#111111] transition-all placeholder:text-[#111111]/30"
                  />
                  <div className="text-xs text-red-500 font-mono mt-1">Note: Some barcode formats (like EAN-13, UPC) require precise lengths or content. Format: {barcodeFormat}</div>
                </div>
              )}
              
              <div className="border-2 border-[#111111] rounded-sm p-5 bg-white shadow-[4px_4px_0px_#111111]">
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
                  
                  <div className="w-px bg-[#111111] hidden md:block"></div>
                  
                  <div className="flex flex-col gap-4 flex-[1.5]">
                    {activeTab === 'qrcode' ? (
                      <>
                        <div className="flex flex-col gap-2.5">
                          <div className="font-mono text-[11.5px] text-[#111111]/60">Error Correction</div>
                          <div className="flex border-2 border-[#111111] rounded-sm overflow-hidden">
                            {(['L', 'M', 'Q', 'H'] as const).map((l, i) => (
                              <button 
                                key={l} 
                                onClick={() => setLevel(l)}
                                className={`flex-1 py-1.5 px-1 border-none font-mono text-[11px] cursor-pointer ${level === l ? 'bg-[#FFD400]' : 'bg-white hover:bg-[#FFD400]/20'} ${i < 3 ? 'border-r-2 border-[#111111]' : ''}`}
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
                      </>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        <div className="font-mono text-[11.5px] text-[#111111]/60">Barcode Format</div>
                        <select 
                          className="w-full bg-white border-2 border-[#111111] p-2 font-mono text-sm focus:outline-none focus:bg-slate-50"
                          value={barcodeFormat}
                          onChange={(e) => setBarcodeFormat(e.target.value)}
                        >
                           <option value="CODE128">CODE128 (Standard)</option>
                           <option value="CODE39">CODE39</option>
                           <option value="EAN13">EAN-13</option>
                           <option value="EAN8">EAN-8</option>
                           <option value="UPC">UPC</option>
                           <option value="ITF14">ITF-14</option>
                           <option value="pharmacode">Pharmacode</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-4 items-center justify-center border-2 border-[#111111] rounded-sm bg-white shadow-[4px_4px_0px_#111111] p-6 min-h-[300px]">
              
              {activeTab === 'qrcode' ? (
                <div 
                  ref={qrRef} 
                  className="inline-block p-4 border-2 border-[#111111] rounded-sm shadow-[4px_4px_0px_#111111]"
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
              ) : (
                <div 
                  ref={barcodeRef} 
                  className="inline-block p-4 border-2 border-[#111111] rounded-sm shadow-[4px_4px_0px_#111111] w-full max-w-[280px] overflow-hidden bg-white flex items-center justify-center"
                  style={{ backgroundColor: bgColor }}
                >
                  {/* react-barcode renders SVG by default unless renderer="canvas" is used. Wait actually it uses react-barcode which wraps jsbarcode, let's use the renderer prop if available, or just render canvas standard. */}
                  <Barcode 
                     renderer="canvas"
                     value={barcodeText || "1234"} 
                     format={barcodeFormat} 
                     lineColor={fgColor} 
                     background={bgColor} 
                     width={2}
                     height={100}
                     margin={10}
                     displayValue={true}
                  />
                </div>
              )}

              <button 
                onClick={handleDownload}
                disabled={activeTab === 'qrcode' ? !text : !barcodeText}
                className="mt-4 flex flex-none items-center justify-center gap-2.5 w-full max-w-[200px] p-3 bg-[#FFD400] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] rounded-sm font-sans font-bold text-[14.5px] cursor-pointer transition-transform duration-100 hover:bg-[#111111] hover:text-[#FFD400] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
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
