import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { faker } from "@faker-js/faker";
import { Copy, RefreshCw } from "lucide-react";

export function LoremIpsumTool() {
  const [paragraphs, setParagraphs] = useState<number>(3);
  const [output, setOutput] = useState("");

  const generateLorem = () => {
     faker.seed(Date.now());
     const text = faker.lorem.paragraphs(paragraphs, '\n\n');
     setOutput(text);
  };

  // Generate on mount
  useState(() => {
     generateLorem();
  });

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-10 md:py-14">
        <div className="max-w-2xl">
          <h1 className="m-0 font-extrabold text-3xl md:text-4xl tracking-[-0.03em]">Lorem Ipsum Generator</h1>
          <p className="mt-3 text-[16px] text-[#111111]/60 leading-relaxed">
            Generate clean, random placeholder text for your mockups and designs.
          </p>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-6 items-start">
           <div className="w-full md:w-64 border border-[#111111] bg-white p-4 rounded-sm flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                 <label className="font-bold text-[13px]">Paragraphs</label>
                 <input 
                    type="number" 
                    min={1} 
                    max={100} 
                    value={paragraphs}
                    onChange={e => setParagraphs(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-[#111111] font-mono text-[14px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                 />
              </div>
              <button 
                 onClick={generateLorem}
                 className="w-full py-2.5 bg-[#FFD400] text-[#111111] font-bold border border-[#111111] rounded-sm hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#111111] transition-all flex items-center justify-center gap-2"
              >
                 <RefreshCw className="w-4 h-4"/> Generate
              </button>
           </div>
           
           <div className="flex-1 w-full border border-[#111111] bg-white rounded-sm min-h-[400px] flex flex-col">
              <div className="h-[46px] border-b border-[#111111] flex items-center justify-between px-3 bg-[#FAFAFA]">
                 <div className="font-bold text-[14px] uppercase">Generated Text</div>
                 <button 
                    onClick={() => navigator.clipboard.writeText(output)}
                    className="px-3 py-1.5 bg-white border border-[#111111] rounded-sm text-[12px] font-bold flex items-center gap-1.5 hover:bg-[#FFD400] transition-colors"
                 >
                    <Copy className="w-3.5 h-3.5" /> Copy
                 </button>
              </div>
              <textarea 
                 value={output}
                 readOnly
                 className="flex-1 w-full p-6 text-[15px] leading-relaxed resize-none outline-none font-sans"
              />
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
