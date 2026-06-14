import React from 'react';
import { Copy, Check } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { useClipboard } from '../../hooks/useClipboard';
import { SqlFormatterInput, SqlFormatterOutput } from './types';

interface SqlFormatterUIProps {
  runTool: (input: SqlFormatterInput) => void;
  isLoading: boolean;
  data?: SqlFormatterOutput;
  error?: string;
}

export function SqlFormatterUI({ runTool, isLoading, data = '', error }: SqlFormatterUIProps) {
  const [input, setInput] = React.useState("SELECT id, name, created_at FROM users WHERE status = 'active' ORDER BY created_at DESC LIMIT 10");
  const [dialect, setDialect] = React.useState("postgresql");
  const { hasCopied, copyToClipboard } = useClipboard();

  React.useEffect(() => {
    runTool({ sql: input, dialect });
  }, [input, dialect, runTool]);

  return (
    <ToolLayout
      title="SQL Query Formatter"
      description="Beautify and format complex SQL statements"
      category="Developer"
    >
      <div className="flex flex-col lg:flex-row gap-5 h-auto lg:h-[500px] max-w-6xl">
        {/* Left side */}
        <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
           <div className="flex justify-between items-center mb-2">
              <label className="font-mono text-[11.5px] uppercase tracking-wider text-[#111111] font-bold select-none">
                Input SQL
              </label>
              <select 
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                className="bg-[#FAFAFA] border border-[#111111] font-mono text-[11.5px] font-bold px-2 py-1 outline-none focus:ring-2 focus:ring-[#FFD400]"
              >
                 <option value="sql">Standard SQL</option>
                 <option value="postgresql">PostgreSQL</option>
                 <option value="mysql">MySQL</option>
                 <option value="mariadb">MariaDB</option>
                 <option value="sqlite">SQLite</option>
              </select>
           </div>
          <textarea
            className="flex-1 w-full bg-[#FAFAFA] border border-[#111111] p-4 font-mono text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SELECT * FROM table..."
            spellCheck={false}
          />
        </div>
        
        {/* Right side */}
        <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <label className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-[#111111]/60 mt-1 flex items-center gap-2">
              Formatted Output
              {error && <span className="text-[#D32F2F] bg-[#D32F2F]/10 px-2 py-0.5 rounded-sm lowercase italic tracking-normal">Invalid SQL</span>}
            </label>
            <button
              onClick={() => copyToClipboard(data)}
              disabled={!data || !!error}
              className="flex items-center gap-1.5 text-[#111111] bg-transparent border-none cursor-pointer font-mono text-[11px] uppercase tracking-[0.05em] hover:text-[#FFD400] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-[#FFD400]" /> : <Copy className="w-3.5 h-3.5" />}
              {hasCopied ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea
            className={`flex-1 w-full border border-[#111111] rounded-sm p-4 font-mono text-[13px] leading-relaxed resize-none focus:outline-none focus:border-transparent ${error ? 'bg-[#111111]/5 text-[#D32F2F]' : data ? 'bg-white text-[#111111]' : 'bg-[#FAFAFA]'}`}
            value={error ? error : data}
            readOnly
            placeholder="Formatted SQL will appear here"
            spellCheck={false}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
