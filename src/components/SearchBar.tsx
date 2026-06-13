import React from "react";
import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder,
  countLabel,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  countLabel: string;
}) {
  return (
    <div className="flex items-stretch w-full border-[1.5px] border-[#111111] rounded-sm bg-[#FAFAFA]">
      <div className="flex items-center px-4 text-[#111111]">
        <Search className="w-[18px] h-[18px]" strokeWidth={2.5} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 min-w-0 border-none outline-none bg-transparent font-mono text-[14.5px] py-4 px-2 text-[#111111] placeholder:text-[#111111]/40"
      />
      <div className="flex items-center px-4 border-l border-[#111111] font-mono text-[11.5px] text-[#111111]/60 whitespace-nowrap">
        {countLabel}
      </div>
    </div>
  );
}
