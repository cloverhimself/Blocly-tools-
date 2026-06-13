import { Link } from "react-router-dom";
import React, { ReactNode } from "react";

export interface ToolCardProps {
  key?: React.Key;
  label: string;
  desc: string;
  iconEl: ReactNode;
  featured?: boolean;
  to: string;
  disabled?: boolean;
  cloud?: boolean;
}

export function ToolCard({ label, desc, iconEl, featured, to, disabled, cloud }: ToolCardProps) {
  if (disabled) {
    return (
      <div className="flex flex-col gap-3 p-[18px] pb-5 bg-white border border-[#111111]/20 rounded-sm text-[#111111] h-full min-h-[132px] opacity-40 blur-[1px] pointer-events-none select-none relative">
        <div className="flex items-center justify-between">
          <span className="block w-[26px] h-[26px] text-[#111111]">{iconEl}</span>
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <div className="font-bold text-[15.5px] leading-tight tracking-tight mt-1">{label}</div>
          <div className="text-[12.5px] leading-[1.45] text-[#111111]/60 -mt-1">{desc}</div>
        </div>
      </div>
    );
  }

  return (
    <Link 
      to={to} 
      className="group flex flex-col gap-3 p-[18px] pb-5 bg-[#FAFAFA] border-2 border-[#111111] rounded-sm text-[#111111] cursor-pointer h-full min-h-[132px] hover:-translate-y-[2px] transition-all duration-100 hover:shadow-[4px_4px_0px_#111111] active:translate-y-[0px] active:shadow-[1px_1px_0px_#111111]"
    >
      <div className="flex items-center justify-between">
        <span className="block w-[26px] h-[26px] text-[#111111] transition-transform group-hover:scale-110 group-hover:text-[#FFD400] drop-shadow-sm">{iconEl}</span>
        {featured && (
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase border border-[#111111] px-1.5 py-[3px] bg-[#FFD400] rounded-sm whitespace-nowrap shadow-[2px_2px_0px_#111111]">
            Popular
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-end mt-1">
        <div className="font-bold text-[15.5px] leading-tight tracking-tight">{label}</div>
        <div className="text-[12.5px] leading-[1.45] text-[#111111]/60">{desc}</div>
      </div>
      {cloud && (
        <div className="text-[9px] uppercase font-mono font-bold tracking-wider text-blue-600 border-t-2 border-[#111111]/5 pt-3 mt-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 block animate-pulse"></span>
          Processed in Cloud
        </div>
      )}
    </Link>
  );
}
