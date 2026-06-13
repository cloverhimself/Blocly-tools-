import { Link } from "react-router-dom";
import { Github } from "lucide-react";

export function TopNav() {
  return (
    <header className="w-full border-b border-[#111111] bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-5 h-[62px] flex items-center justify-between gap-3.5">
        <Link to="/" className="flex items-center gap-2.5 text-[#111111]">
          <img src="/logo.svg" alt="Blocly" className="w-[20px] h-[20px] block flex-none" />
          <span className="font-extrabold text-[18px] tracking-tight">Blocly</span>
          <span className="font-mono text-[11px] text-[#111111]/50">/tools</span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/"
            className="hidden sm:block text-[#111111] text-[13.5px] font-semibold border-b-2 border-transparent pb-[1px] hover:border-[#FFD400]"
          >
            Tools
          </Link>
          <a
            href="#"
            className="hidden sm:block text-[#111111] text-[13.5px] font-semibold border-b-2 border-transparent pb-[1px] hover:border-[#FFD400]"
          >
            Privacy
          </a>
          <a
            href="https://github.com/saviourpopoola/blocly-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#111111] text-[13px] sm:text-[13.5px] font-semibold border border-[#111111] rounded-sm px-2.5 sm:px-3 py-1.5 hover:bg-[#FFD400] transition-colors"
          >
            <Github className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
