import React, { useRef, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

type SearchResultItem = {
  name: string;
  desc: string;
  to: string;
  category: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder,
  countLabel,
  results = [],
  onSelect,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  countLabel: string;
  results?: { category: string; items: SearchResultItem[] }[];
  onSelect?: (name: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Flatten results for keyboard navigation
  const flatResults = results.flatMap((g) => g.items);

  useEffect(() => {
    setSelectedIndex(0);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && value) setIsOpen(true);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + flatResults.length) % flatResults.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        if (onSelect) onSelect(flatResults[selectedIndex].name);
        navigate(flatResults[selectedIndex].to);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (value) setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-stretch w-full border-[1.5px] border-[#111111] rounded-sm bg-[#FAFAFA] focus-within:ring-2 focus-within:ring-[#FFD400]">
        <div className="flex items-center px-4 text-[#111111]">
          <Search className="w-[18px] h-[18px]" strokeWidth={2.5} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="flex-1 min-w-0 border-none outline-none bg-transparent font-mono text-[14.5px] py-4 px-2 text-[#111111] placeholder:text-[#111111]/40"
        />
        <div className="flex items-center px-4 border-l border-[#111111] font-mono text-[11.5px] text-[#111111]/60 whitespace-nowrap">
          {countLabel}
        </div>
      </div>

      {isOpen && value && flatResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] rounded-sm z-50 max-h-[400px] overflow-y-auto">
          {results.map((group, gIdx) => (
            <div
              key={gIdx}
              className="border-b border-[#111111]/10 last:border-b-0"
            >
              <div className="px-3 py-1.5 bg-[#FAFAFA] font-bold text-[11px] uppercase tracking-wider text-[#111111]/50 sticky top-0 z-10 border-b border-[#111111]/10">
                {group.category}
              </div>
              <div>
                {group.items.map((item, iIdx) => {
                  const globalIndex =
                    results
                      .slice(0, gIdx)
                      .reduce((acc, g) => acc + g.items.length, 0) + iIdx;
                  const isSelected = globalIndex === selectedIndex;
                  return (
                    <button
                      key={iIdx}
                      onClick={() => {
                        if (onSelect) onSelect(item.name);
                        navigate(item.to);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 flex flex-col gap-0.5 border-b border-[#111111]/10 last:border-b-0 transition-colors ${
                        isSelected ? "bg-[#FFD400]/20" : "hover:bg-[#FAFAFA]"
                      }`}
                    >
                      <div className="font-bold text-[14px]">{item.name}</div>
                      <div className="font-mono text-[11.5px] text-[#111111]/60">
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && value && flatResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] rounded-sm z-50 p-6 text-center font-mono text-[13px] text-[#111111]/50">
          No tools found for "{value}"
        </div>
      )}
    </div>
  );
}
