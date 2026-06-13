import { useState, useRef, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Download, MonitorSmartphone, Image as ImageIcon } from "lucide-react";

export function OpenGraphImageGeneratorTool() {
  const [title, setTitle] = useState("Your Awesome Blog Post Title Here");
  const [description, setDescription] = useState("A brief description of what this article is about, keeping it punchy and engaging for social media feeds.");
  const [bgStyle, setBgStyle] = useState<'solid' | 'gradient'>('gradient');
  const [bgColor, setBgColor] = useState("#111111");
  const [gradientStart, setGradientStart] = useState("#FFD400");
  const [gradientEnd, setGradientEnd] = useState("#FF7A00");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [iconImg, setIconImg] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
        const url = URL.createObjectURL(e.target.files[0]);
        const img = new Image();
        img.onload = () => {
           setIconImg(img);
        }
        img.src = url;
     }
  }

  useEffect(() => {
     drawCanvas();
  }, [title, description, bgStyle, bgColor, gradientStart, gradientEnd, textColor, iconImg]);

  const drawCanvas = () => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext('2d');
     if (!ctx) return;

     // Standard OG size
     const width = 1200;
     const height = 630;
     canvas.width = width;
     canvas.height = height;

     // draw background
     if (bgStyle === 'gradient') {
        const grd = ctx.createLinearGradient(0, 0, width, height);
        grd.addColorStop(0, gradientStart);
        grd.addColorStop(1, gradientEnd);
        ctx.fillStyle = grd;
     } else {
        ctx.fillStyle = bgColor;
     }
     ctx.fillRect(0, 0, width, height);

     // add subtle pattern/noise or border maybe? just a clean border
     ctx.strokeStyle = "rgba(0,0,0,0.1)";
     ctx.lineWidth = 10;
     ctx.strokeRect(10, 10, width-20, height-20);

     // Draw Icon
     let textYStart = 200;
     if (iconImg) {
        ctx.drawImage(iconImg, 100, 100, 100, 100);
        textYStart = 260; // push text down
     } else {
        textYStart = 220;
     }

     ctx.fillStyle = textColor;
     
     // Title
     ctx.font = "bold 72px Inter, sans-serif";
     wrapText(ctx, title, 100, textYStart, 1000, 85);

     // Description
     ctx.font = "40px Inter, sans-serif";
     // dim description a bit
     ctx.globalAlpha = 0.8;
     wrapText(ctx, description, 100, textYStart + 160 + (title.length > 50 ? 50 : 0), 1000, 55);
     ctx.globalAlpha = 1.0;
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
     const words = text.split(' ');
     let line = '';
     for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
           ctx.fillText(line, x, y);
           line = words[n] + ' ';
           y += lineHeight;
        } else {
           line = testLine;
        }
     }
     ctx.fillText(line, x, y);
  };

  const dlCanvas = () => {
     if (!canvasRef.current) return;
     const url = canvasRef.current.toDataURL("image/png");
     const a = document.createElement("a");
     a.href = url;
     a.download = "og-image.png";
     a.click();
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-10 md:py-14 grid grid-cols-1 md:grid-cols-[1fr_500px] gap-8">
        <div>
          <h1 className="m-0 font-extrabold text-3xl md:text-4xl tracking-[-0.03em]">Open Graph Image Generator</h1>
          <p className="mt-3 mb-8 text-[16px] text-[#111111]/60 leading-relaxed">
            Generate clean, professional meta images (1200x630) for social media previews.
          </p>

          <div className="border border-[#111111] bg-white rounded-sm overflow-hidden mb-6">
             <div className="bg-[#FAFAFA] border-b border-[#111111] p-3 flex items-center justify-between">
                <div className="font-bold text-[13px] uppercase flex items-center gap-2"><MonitorSmartphone className="w-4 h-4"/> Preview Frame</div>
             </div>
             <div className="p-6 bg-checkerboard flex items-center justify-center">
                <canvas 
                   ref={canvasRef} 
                   className="w-full h-auto max-w-full border border-[#111111] shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                   style={{ aspectRatio: "1200 / 630" }}
                />
             </div>
          </div>
        </div>

        <div className="bg-white border border-[#111111] rounded-sm p-6 flex flex-col gap-5 sticky top-6 h-fit">
           <h2 className="font-extrabold text-[15px] border-b border-[#111111]/10 pb-4">Configuration</h2>
           
           <div className="flex flex-col gap-2">
              <label className="font-bold text-[13px]">Title</label>
              <textarea 
                 value={title} 
                 onChange={e=>setTitle(e.target.value)} 
                 className="w-full p-2 border border-[#111111] font-mono text-[13px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]" 
                 rows={3} 
              />
           </div>

           <div className="flex flex-col gap-2">
              <label className="font-bold text-[13px]">Description</label>
              <textarea 
                 value={description} 
                 onChange={e=>setDescription(e.target.value)} 
                 className="w-full p-2 border border-[#111111] font-mono text-[13px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]" 
                 rows={4} 
              />
           </div>

           <div className="flex flex-col gap-2">
              <label className="font-bold text-[13px]">Background Type</label>
              <select 
                 value={bgStyle} 
                 onChange={e=>setBgStyle(e.target.value as any)} 
                 className="w-full p-2 border border-[#111111] bg-[#FAFAFA] font-mono text-[13px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]" 
              >
                 <option value="solid">Solid Color</option>
                 <option value="gradient">Linear Gradient</option>
              </select>
           </div>

           {bgStyle === 'solid' ? (
              <div className="flex flex-col gap-2">
                 <label className="font-bold text-[13px]">Background Color</label>
                 <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="w-16 h-10 p-1 border border-[#111111] rounded-sm cursor-pointer" />
              </div>
           ) : (
              <div className="flex gap-4">
                 <div className="flex flex-col gap-2">
                    <label className="font-bold text-[13px]">Start Color</label>
                    <input type="color" value={gradientStart} onChange={e=>setGradientStart(e.target.value)} className="w-16 h-10 p-1 border border-[#111111] rounded-sm cursor-pointer" />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="font-bold text-[13px]">End Color</label>
                    <input type="color" value={gradientEnd} onChange={e=>setGradientEnd(e.target.value)} className="w-16 h-10 p-1 border border-[#111111] rounded-sm cursor-pointer" />
                 </div>
              </div>
           )}

           <div className="flex flex-col gap-2">
              <label className="font-bold text-[13px]">Text Color</label>
              <input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} className="w-16 h-10 p-1 border border-[#111111] rounded-sm cursor-pointer" />
           </div>

           <div className="flex flex-col gap-2">
              <label className="font-bold text-[13px]">Logo / Icon (Optional)</label>
              <input 
                 type="file" 
                 accept="image/*"
                 onChange={handleIconUpload}
                 className="w-full p-2 border border-[#111111] bg-[#FAFAFA] font-mono text-[13px] rounded-sm file:mr-4 file:py-1 file:px-3 file:border file:border-[#111111] file:bg-white file:font-semibold hover:file:bg-[#FFD400] transition-colors"
              />
           </div>

           <button 
              onClick={dlCanvas}
              className="mt-4 w-full bg-[#FFD400] text-[#111111] font-bold py-3.5 border border-[#111111] rounded-sm shadow-[2px_2px_0px_#111111] hover:bg-[#FFE040] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#111111] transition-all flex items-center justify-center gap-2"
           >
              <Download className="w-5 h-5"/> Download PNG (1200x630)
           </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
