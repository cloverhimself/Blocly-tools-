import React from 'react';
import { TopNav } from './TopNav';
import { Footer } from './Footer';

interface ToolLayoutProps {
  title: string;
  description: string;
  category?: string;
  children: React.ReactNode;
}

export function ToolLayout({ title, description, category = 'Developer', children }: ToolLayoutProps) {
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
          <div className="font-mono text-[12px] text-[#111111]/60 mb-6">
            <a href="/" className="text-[#111111] underline decoration-[#FFD400] decoration-2 underline-offset-2">Tools</a>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">{category}</span>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">{title}</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            {title}
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            {description}
          </p>

          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
