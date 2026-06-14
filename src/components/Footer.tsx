import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#111111] bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-5 pt-11 pb-6">
        <div className="flex flex-wrap gap-9 justify-between">
          <div className="max-w-[320px]">
             <div className="flex items-center gap-2.5 mb-3">
              <img src="/logo.svg" alt="Blocly" className="w-[19px] h-[19px] block" />
              <span className="font-extrabold text-[17px] tracking-tight">Blocly Tools</span>
            </div>
            <p className="m-0 text-[13px] leading-relaxed text-[#111111]/60">
              A unified productivity platform where every tool feels identical in interaction, reliability, and structure. Fast, reliable utilities for everyone.
            </p>
          </div>
          
          <div className="flex flex-col gap-2.5">
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#111111]/45 mb-1">Project Information</div>
            <a href="#" className="text-[#111111] text-[13px] hover:underline decoration-[#FFD400] decoration-2 underline-offset-2">About & Privacy</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#111111] text-[13px] hover:underline decoration-[#FFD400] decoration-2 underline-offset-2">GitHub Repository</a>
            <a href="#" className="text-[#111111] text-[13px] hover:underline decoration-[#FFD400] decoration-2 underline-offset-2">License (MIT)</a>
          </div>
        </div>
        
        <div className="mt-9 pt-4 border-t border-[#111111] flex flex-col md:flex-row flex-wrap gap-x-5 gap-y-2 justify-between font-mono text-[11.5px] text-[#111111]/55">
          <span>© {new Date().getFullYear()} Blocly - MIT License</span>
          <span>A unified digital toolkit</span>
        </div>
      </div>
    </footer>
  );
}
