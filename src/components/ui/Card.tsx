import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`border border-[#111111] bg-white rounded-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`flex justify-between items-center px-5 py-3 border-b border-[#111111] bg-[#FAFAFA] ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono font-bold text-[12px] uppercase">
      {children}
    </span>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
}
