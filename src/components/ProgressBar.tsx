import React from "react";

export function ProgressBar({ 
  value, 
  indeterminate, 
  label, 
  valueLabel 
}: { 
  value?: number; 
  indeterminate?: boolean; 
  label?: string; 
  valueLabel?: string; 
}) {
  const displayValue = Math.max(0, Math.min(100, Math.round(value || 0)));

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-baseline font-mono text-[12px] text-[#111111]">
        <span>{label || 'Progress'}</span>
        <span>{indeterminate ? valueLabel : `${displayValue}%`}</span>
      </div>
      <div className="relative w-full h-4 border border-[#111111] rounded-sm bg-[#FAFAFA] overflow-hidden">
        {!indeterminate && (
          <div 
            className="h-full bg-[#FFD400] transition-all duration-150 ease-linear" 
            style={{ width: `${displayValue}%` }}
          />
        )}
        {indeterminate && (
          <div className="absolute top-0 left-0 h-full w-[38%] bg-[#FFD400] animate-[blocly-indet_1.05s_ease-in-out_infinite]" />
        )}
      </div>
    </div>
  );
}
