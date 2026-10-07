import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Basic default markdown
const DEFAULT_MD = `# Hello World
Welcome to the live Markdown Previewer.

## Supported Features

- **Bold** and *Italic* text
- [Interactive Links](https://blocly.com)
- \`inline code\` and code blocks
- Tables via GitHub Flavored Markdown

### Code Example

\`\`\`javascript
function greet() {
  console.log("Hello from Blocly Tools!");
}
\`\`\`

### Table Example

| Tool | Category | Status |
|------|----------|--------|
| Markdown Preview | Dev | Live |
| Regex Tester | Dev | Live |
`;

export function MarkdownPreviewerTool() {
  const [markdown, setMarkdown] = useState(DEFAULT_MD);

  return (
    <div className="w-full h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col overflow-hidden">
      <TopNav />
      <div className="flex-none px-5 py-6">
         <h1 className="m-0 font-extrabold text-2xl tracking-tight">Markdown Previewer</h1>
         <p className="mt-1 text-[14px] text-[#111111]/60">Split pane markdown editor with live, fully-styled HTML preview.</p>
      </div>

      <main className="flex-1 w-full mx-auto px-5 pb-5 overflow-hidden flex flex-col md:flex-row gap-4 mb-4">
         <div className="flex-1 border border-[#111111] bg-white rounded-sm flex flex-col overflow-hidden">
            <div className="h-10 bg-[#FAFAFA] border-b border-[#111111] px-4 flex items-center font-bold text-[13px] uppercase">
               Editor
            </div>
            <textarea 
               value={markdown}
               onChange={e => setMarkdown(e.target.value)}
               className="flex-1 w-full p-4 font-mono text-[14px] resize-none outline-none focus:ring-2 focus:ring-inset focus:ring-[#FFD400]"
               spellCheck={false}
            />
         </div>
         <div className="flex-1 border border-[#111111] bg-white rounded-sm flex flex-col overflow-hidden">
            <div className="h-10 bg-[#FAFAFA] border-b border-[#111111] px-4 flex items-center font-bold text-[13px] uppercase">
               Preview
            </div>
            <div className="flex-1 w-full p-6 overflow-y-auto markdown-body">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                 {markdown}
               </ReactMarkdown>
            </div>
         </div>
      </main>
    </div>
  );
}
