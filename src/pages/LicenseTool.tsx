import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Copy, Check } from "lucide-react";

const LICENSES = {
  mit: {
    name: "MIT License",
    generate: (year: string, author: string) => `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`
  },
  apache: {
    name: "Apache 2.0",
    generate: (year: string, author: string) => `Copyright ${year} ${author}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License runs on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`
  }
};

export function LicenseTool() {
  const [selected, setSelected] = useState<keyof typeof LICENSES>('mit');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [author, setAuthor] = useState("John Doe");
  const [copied, setCopied] = useState(false);

  const licenseContent = LICENSES[selected].generate(year || new Date().getFullYear().toString(), author || "Author");

  const handleCopy = () => {
    navigator.clipboard.writeText(licenseContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
          <div className="font-mono text-[12px] text-[#111111]/60 mb-6">
            <a href="/" className="text-[#111111] underline decoration-[#FFD400] decoration-2 underline-offset-2">Tools</a>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">Developer</span>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">License Generator</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            License Generator
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Quickly generate standard open-source licenses for your projects.
          </p>

          <div className="flex flex-col md:flex-row gap-8 max-w-5xl items-stretch">
            
            <div className="flex-1 flex flex-col gap-6 border border-[#111111] bg-white p-6 rounded-sm">
                
                <div className="flex flex-col gap-2">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-[#111111]/60">License Type</label>
                    <div className="flex flex-col sm:flex-row border border-[#111111] rounded-sm overflow-hidden">
                        {(Object.keys(LICENSES) as (keyof typeof LICENSES)[]).map((key, i) => (
                             <button
                                key={key}
                                onClick={() => setSelected(key)}
                                className={`flex-1 py-3 px-4 font-mono text-[13px] border-none cursor-pointer transition-colors ${selected === key ? 'bg-[#FFD400] font-bold text-[#111111]' : 'bg-[#FAFAFA] hover:bg-[#FFFBE0] text-[#111111]/80'} ${i === 0 ? 'border-b sm:border-b-0 sm:border-r border-[#111111]' : ''}`}
                             >
                                 {LICENSES[key].name}
                             </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-[#111111]/60">Author Name</label>
                    <input 
                        type="text" 
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full p-4 border border-[#111111] bg-[#FAFAFA] text-[#111111] font-mono font-medium text-[14px] outline-none focus:ring-2 focus:ring-[#FFD400]"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-[#111111]/60">Year</label>
                    <input 
                        type="text" 
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full p-4 border border-[#111111] bg-[#FAFAFA] text-[#111111] font-mono font-medium text-[14px] outline-none focus:ring-2 focus:ring-[#FFD400]"
                    />
                </div>

            </div>

            <div className="flex-[1.5] border border-[#111111] bg-white rounded-sm overflow-hidden flex flex-col">
                <div className="flex justify-between items-center px-4 py-3 border-b border-[#111111] bg-[#FAFAFA]">
                    <span className="font-mono font-bold text-[12px] uppercase">LICENSE file</span>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#FFD400]" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                </div>
                <div className="p-6 font-mono text-[13px] leading-[1.8] text-[#111111]/80 overflow-auto whitespace-pre-wrap flex-1 bg-[#111111]/[0.02]">
                    {licenseContent}
                </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
