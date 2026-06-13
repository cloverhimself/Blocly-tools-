import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Copy, Check, Terminal } from "lucide-react";

const TEMPLATES: Record<string, {name: string, content: string}> = {
    node: {
        name: "Node.js App",
        content: `FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose port and start
EXPOSE 3000
CMD ["npm", "start"]`
    },
    python: {
        name: "Python (FastAPI/Flask)",
        content: `FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port and start
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`
    },
    go: {
        name: "Go (Multi-stage)",
        content: `FROM golang:1.21-alpine AS builder

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Production ready image
FROM gcr.io/distroless/static-debian11

COPY --from=builder /app/main /

EXPOSE 8080
CMD ["/main"]`
    }
};

export function DockerfileTool() {
  const [selected, setSelected] = useState<string>("node");
  const [copied, setCopied] = useState(false);

  const activeTemplate = TEMPLATES[selected];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTemplate.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
          <div className="font-mono text-[12px] text-[#111111]/60 mb-6">
            <a href="/" className="text-[#111111] underline decoration-[#FFD400] decoration-2 underline-offset-2">Tools</a>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">DevOps Tools</span>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">Dockerfile Generator</span>
          </div>

          <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">
            Dockerfile Generator
          </h1>
          <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
            Generate standard, production-ready Dockerfiles for your favorite tech stacks. No more searching stack overflow.
          </p>

          <div className="flex flex-col md:flex-row gap-6 max-w-5xl items-stretch">
            <div className="flex-1 flex flex-col gap-3">
                 {Object.entries(TEMPLATES).map(([key, tpl]) => (
                    <button
                        key={key}
                        onClick={() => setSelected(key)}
                        className={`flex items-center justify-between p-4 border border-[#111111] rounded-sm cursor-pointer transition-colors ${selected === key ? 'bg-[#FFD400] font-bold' : 'bg-white hover:bg-[#FAFAFA]'}`}
                    >
                        <span className="font-mono text-[14px] text-[#111111]">{tpl.name}</span>
                        {selected === key && <Check className="w-4 h-4 text-[#111111]" />}
                    </button>
                 ))}
                 
                 <div className="mt-4 p-4 bg-[#FAFAFA] border border-[#111111]/20 font-mono text-[11.5px] leading-relaxed text-[#111111]/60">
                    These are standard templates optimized for caching and minimal image size. Modify them according to your specific project needs.
                 </div>
            </div>

            <div className="flex-[2] flex flex-col gap-0 border border-[#111111] rounded-sm bg-[#111111] overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 border-b border-[#333333] bg-[#1a1a1a]">
                    <div className="flex items-center gap-2 text-white">
                        <Terminal className="w-4 h-4 text-[#A6E22E]" />
                        <span className="font-mono text-[12px]">Dockerfile</span>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-white/70 bg-transparent border-none cursor-pointer font-mono text-[11.5px] uppercase hover:text-white transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#A6E22E]" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy Code"}
                    </button>
                </div>
                <div className="p-5 font-mono text-[13px] leading-[1.6] text-white overflow-auto max-h-[500px] whitespace-pre-wrap">
                    {activeTemplate.content}
                </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
