import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#111111] bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-5 pt-11 pb-6">
        <div className="flex flex-wrap gap-9 justify-between">
          <div className="max-w-[290px]">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-[18px] h-[18px] bg-[#FFD400] border border-[#111111] block"></span>
              <span className="font-extrabold text-[17px] tracking-tight">Blocly</span>
            </div>
            <p className="m-0 text-[13px] leading-relaxed text-[#111111]/60">
              Tools that never touch a server. Convert and clean up files entirely on your own device.
            </p>
          </div>
          
          <div className="flex flex-col gap-2.5">
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#111111]/45 mb-1">Tools</div>
            <Link to="/" className="text-[#111111] text-[13px] hover:underline decoration-[#FFD400] decoration-2 underline-offset-2">Video & Audio</Link>
            <Link to="/" className="text-[#111111] text-[13px] hover:underline decoration-[#FFD400] decoration-2 underline-offset-2">Images</Link>
            <Link to="/" className="text-[#111111] text-[13px] hover:underline decoration-[#FFD400] decoration-2 underline-offset-2">PDF</Link>
          </div>
          
          <div className="flex flex-col gap-2.5">
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#111111]/45 mb-1">Project</div>
            <a href="#" className="text-[#111111] text-[13px] hover:underline decoration-[#FFD400] decoration-2 underline-offset-2">Privacy</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#111111] text-[13px] hover:underline decoration-[#FFD400] decoration-2 underline-offset-2">GitHub</a>
            <a href="#" className="text-[#111111] text-[13px] hover:underline decoration-[#FFD400] decoration-2 underline-offset-2">License (MIT)</a>
          </div>
        </div>
        
        <div className="mt-9 pt-4 border-t border-[#111111] flex flex-wrap gap-x-5 gap-y-2 justify-between font-mono text-[11.5px] text-[#111111]/55">
          <span>© 2026 Blocly - MIT License</span>
          <span>No cookies - No tracking - No servers</span>
        </div>
      </div>
    </footer>
  );
}
