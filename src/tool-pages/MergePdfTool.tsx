import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { FilePlus2, Download, Loader2, X, ArrowUp, ArrowDown } from "lucide-react";
import { downloadBlob } from "../lib/pdf";
import { PrivacyNote } from "./ImageToPdfTool";

export function MergePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list).filter((f) => f.name.toLowerCase().endsWith(".pdf"))]);
    setError(null);
  };
  const move = (i: number, dir: -1 | 1) =>
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const merge = async () => {
    if (files.length < 2) {
      setError("Add at least two PDF files to merge.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      for (const file of files) {
        const src = await PDFDocument.load(await file.arrayBuffer());
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      downloadBlob(new Blob([await out.save()], { type: "application/pdf" }), "merged.pdf");
    } catch (e: any) {
      setError(e?.message || "Could not merge these PDFs. One may be encrypted or corrupted.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into one, in any order you like, privately in your browser."
      category="PDF Tools"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <PrivacyNote />

        <label className="block w-full min-h-[180px] flex flex-col items-center justify-center gap-3 bg-[#FAFAFA] border-2 border-dashed border-[#111111] rounded-sm cursor-pointer p-8 hover:bg-[#111111]/5 transition-colors">
          <FilePlus2 className="w-10 h-10" strokeWidth={1.5} />
          <span className="font-semibold">Click to add PDF files</span>
          <span className="font-mono text-[11.5px] text-[#111111]/55">Add two or more PDFs</span>
          <input type="file" multiple accept=".pdf,application/pdf" className="hidden" onChange={(e) => add(e.target.files)} />
        </label>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 border border-[#111111]/10 rounded-sm bg-white">
                <span className="font-mono text-xs text-[#111111]/40 w-6 text-center">{i + 1}</span>
                <span className="flex-1 truncate text-sm">{f.name}</span>
                <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 disabled:opacity-20 hover:text-[#FFD400]"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => move(i, 1)} disabled={i === files.length - 1} className="p-1 disabled:opacity-20 hover:text-[#FFD400]"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => remove(i)} className="p-1 text-[#111111]/50 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-100 text-sm">{error}</div>}

        {files.length > 0 && (
          <button
            onClick={merge}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FFD400] text-[#111111] font-bold rounded-sm hover:brightness-95 transition disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            Merge {files.length} PDFs
          </button>
        )}
      </div>
    </ToolLayout>
  );
}
