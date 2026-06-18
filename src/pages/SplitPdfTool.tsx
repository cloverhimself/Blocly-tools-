import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Dropzone, type DropzoneState } from "../components/Dropzone";
import { Scissors, Download, Loader2 } from "lucide-react";
import { downloadBlob, parseRanges } from "../lib/pdf";
import { PrivacyNote } from "./ImageToPdfTool";

export function SplitPdfTool() {
  const [state, setState] = useState<DropzoneState>("empty");
  const [fileName, setFileName] = useState<string>();
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"each" | "range">("range");
  const [ranges, setRanges] = useState("1-1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    try {
      const buf = await file.arrayBuffer();
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(buf);
      setPageCount(doc.getPageCount());
      setRanges(`1-${doc.getPageCount()}`);
      setBuffer(buf);
      setFileName(file.name);
      setState("file");
    } catch {
      setError("Could not read this PDF. It may be encrypted.");
    }
  };

  const reset = () => {
    setState("empty");
    setBuffer(null);
    setFileName(undefined);
    setError(null);
  };

  const run = async () => {
    if (!buffer) return;
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(buffer);
      const base = (fileName || "document").replace(/\.pdf$/i, "");

      const makePdf = async (indices: number[]) => {
        const out = await PDFDocument.create();
        const pages = await out.copyPages(src, indices);
        pages.forEach((p) => out.addPage(p));
        return out.save();
      };

      if (mode === "each") {
        const { default: JSZip } = await import("jszip");
        const zip = new JSZip();
        for (let i = 0; i < pageCount; i++) {
          zip.file(`${base}-page-${i + 1}.pdf`, await makePdf([i]));
        }
        const blob = await zip.generateAsync({ type: "blob" });
        downloadBlob(blob, `${base}-pages.zip`);
      } else {
        const pages = parseRanges(ranges, pageCount);
        if (pages.length === 0) {
          setError("That range is empty. Use something like 1-3, 5, 8.");
          setBusy(false);
          return;
        }
        const bytes = await makePdf(pages.map((p) => p - 1));
        downloadBlob(new Blob([bytes], { type: "application/pdf" }), `${base}-extract.pdf`);
      }
    } catch (e: any) {
      setError(e?.message || "Could not split this PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract a page range into a new PDF, or split every page into separate files, all in your browser."
      category="PDF Tools"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <PrivacyNote />
        <Dropzone
          state={state}
          fileName={fileName}
          fileMeta={state === "file" ? `${pageCount} pages` : undefined}
          onFileSelect={onFile}
          onReset={reset}
          accept=".pdf,application/pdf"
          label="Drop a PDF here, or"
          acceptedTypesLabel="PDF"
          icon={Scissors}
        />

        {state === "file" && (
          <div className="space-y-4 bg-white border border-[#111111]/10 rounded-sm p-5">
            <div className="flex gap-2">
              <button
                onClick={() => setMode("range")}
                className={`flex-1 py-2.5 rounded-sm text-sm font-semibold border ${mode === "range" ? "bg-[#FFD400] border-[#111111]" : "border-[#111111]/15"}`}
              >
                Extract pages
              </button>
              <button
                onClick={() => setMode("each")}
                className={`flex-1 py-2.5 rounded-sm text-sm font-semibold border ${mode === "each" ? "bg-[#FFD400] border-[#111111]" : "border-[#111111]/15"}`}
              >
                Every page separately
              </button>
            </div>

            {mode === "range" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/55 mb-1.5">
                  Pages to keep (of {pageCount})
                </label>
                <input
                  value={ranges}
                  onChange={(e) => setRanges(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="w-full px-4 py-3 border border-[#111111]/15 rounded-sm focus:outline-none focus:border-[#FFD400] font-mono"
                />
              </div>
            )}

            <button
              onClick={run}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#111111] text-white font-bold rounded-sm hover:bg-[#111111]/90 transition disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {mode === "each" ? "Split into separate PDFs (.zip)" : "Extract to new PDF"}
            </button>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-100 text-sm">{error}</div>}
      </div>
    </ToolLayout>
  );
}
