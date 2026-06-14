import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">
          {label}
        </label>
      )}
      <input
        className="w-full p-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[#111111] font-mono text-[14px] leading-none outline-none focus:ring-2 focus:ring-[#FFD400]"
        {...props}
      />
      {error && <span className="text-red-500 text-xs font-mono mt-1">{error}</span>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = '', ...props }: TextAreaProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60">
          {label}
        </label>
      )}
      <textarea
        className="w-full p-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[#111111] font-mono text-[14px] outline-none focus:ring-2 focus:ring-[#FFD400] resize-y"
        {...props}
      />
      {error && <span className="text-red-500 text-xs font-mono mt-1">{error}</span>}
    </div>
  );
}
