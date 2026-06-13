import { Link } from "react-router-dom";
import React, { ReactNode } from "react";

export interface ToolCardProps {
  key?: React.Key;
  label: string;
  desc: string;
  iconEl: ReactNode;
  featured?: boolean;
  to: string;
}

export function ToolCard({ label, desc, iconEl, featured, to }: ToolCardProps) {
  return (
    <Link 
      to={to} 
      className="flex flex-col gap-3 p-[18px] pb-5 bg-[#FAFAFA] border border-[#111111] rounded-sm text-[#111111] cursor-pointer h-full min-h-[132px] hover:bg-[#FFD400] transition-colors duration-100"
    >
      <div className="flex items-center justify-between">
        <span className="block w-[26px] h-[26px] text-[#111111]">{iconEl}</span>
        {featured && (
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase border border-[#111111] px-1.5 py-[3px] rounded-sm whitespace-nowrap bg-white/50">
            Popular
          </span>
        )}
      </div>
      <div className="font-bold text-[15.5px] leading-tight tracking-tight mt-1">{label}</div>
      <div className="text-[12.5px] leading-[1.45] text-[#111111]/60 -mt-1">{desc}</div>
    </Link>
  );
}
