import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Dropzone, type DropzoneState } from "../components/Dropzone";
import { LayoutGrid, Download, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getPdfjs, renderPageToCanvas, downloadBlob } from "../lib/pdf";
import { PrivacyNote } from "./ImageToPdfTool";

type Pg = { orig: number; thumb: string };

export function OrganizePdfTool() {
  const [state, setState] = useState<DropzoneState>("empty");
  const [fileName, setFileName] = useState<string>();
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<Pg[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setFileName(file.name);
    setLoading(true);
    setState("file");
    try {
      const buf = await file.arrayBuffer();
      setBuffer(buf);
      const pdfjs = await getPdfjs();
      const doc = await pdfjs.getDocument({ data: buf.slice(0) }).promise;
      const thumbs: Pg[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const canvas = await renderPageToCanvas(doc, i, 0.4);
        thumbs.push({ orig: i - 1, thumb: canvas.toDataURL("image/jpeg", 0.7) });
      }
      setPages(thumbs);
    } catch {
      setError("Could not read this PDF. It may be encrypted.");
      setState("error");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setState("empty");
    setBuffer(null);
    setPages([]);
    setFileName(undefined);
    setError(null);
  };

  const move = (i: number, dir: -1 | 1) =>
    setPages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const del = (i: number) => setPages((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!buffer || pages.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(buffer);
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, pages.map((p) => p.orig));
      copied.forEach((p) => out.addPage(p));
      downloadBlob(new Blob([await out.save()], { type: "application/pdf" }), (fileName || "document").replace(/\.pdf$/i, "") + "-organized.pdf");
    } catch (e: any) {
      setError(e?.message || "Could not save the PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout
      title="Organize PDF"
      description="Reorder or delete pages visually, then export a clean new PDF, all in your browser."
      category="PDF Tools"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <PrivacyNote />
        {state === "empty" && (
          <Dropzone
            state={state}
            onFileSelect={onFile}
            onReset={reset}
            accept=".pdf,application/pdf"
            label="Drop a PDF here, or"
            acceptedTypesLabel="PDF"
            icon={LayoutGrid}
          />
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 text-[#111111]/60 p-12">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading pages...
          </div>
        )}

        {pages.length > 0 && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-[#111111]/60">{pages.length} pages. Reorder with the arrows, remove with the x.</p>
              <button onClick={reset} className="text-sm underline text-[#111111]/55 hover:text-[#111111]">Use a different file</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pages.map((p, i) => (
                <div key={p.orig} className="border border-[#111111]/15 rounded-sm bg-white overflow-hidden group">
                  <div className="relative bg-[#111111]/5">
                    <img src={p.thumb} alt={`Page ${i + 1}`} className="w-full h-auto block" />
                    <button onClick={() => del(i)} className="absolute top-1.5 right-1.5 bg-white/90 border border-[#111111]/20 rounded-sm p-1 hover:bg-red-500 hover:text-white transition" title="Delete page">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 disabled:opacity-20 hover:text-[#FFD400]"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="font-mono text-[11px] text-[#111111]/50">{i + 1}</span>
                    <button onClick={() => move(i, 1)} disabled={i === pages.length - 1} className="p-1 disabled:opacity-20 hover:text-[#FFD400]"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={save} disabled={busy} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FFD400] text-[#111111] font-bold rounded-sm hover:brightness-95 transition disabled:opacity-50">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} Export PDF ({pages.length} pages)
            </button>
          </>
        )}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-100 text-sm">{error}</div>}
      </div>
    </ToolLayout>
  );
}
