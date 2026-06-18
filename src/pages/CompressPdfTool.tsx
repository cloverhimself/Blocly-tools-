import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Dropzone, type DropzoneState } from "../components/Dropzone";
import { FileDown, Download, Loader2 } from "lucide-react";
import { getPdfjs, renderPageToCanvas, canvasToBlob, downloadBlob } from "../lib/pdf";
import { PrivacyNote } from "./ImageToPdfTool";

const LEVELS = {
  low: { label: "Light (best quality)", scale: 2, quality: 0.8 },
  medium: { label: "Recommended", scale: 1.5, quality: 0.65 },
  high: { label: "Strong (smallest file)", scale: 1.2, quality: 0.5 },
};
type Level = keyof typeof LEVELS;

function fmtSize(b: number) {
  return b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(2)} MB` : `${Math.round(b / 1024)} KB`;
}

export function CompressPdfTool() {
  const [state, setState] = useState<DropzoneState>("empty");
  const [fileName, setFileName] = useState<string>();
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [origSize, setOrigSize] = useState(0);
  const [level, setLevel] = useState<Level>("medium");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);

  const onFile = async (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setBuffer(await file.arrayBuffer());
    setOrigSize(file.size);
    setFileName(file.name);
    setResult(null);
    setState("file");
  };

  const reset = () => {
    setState("empty");
    setBuffer(null);
    setFileName(undefined);
    setError(null);
    setResult(null);
    setProgress("");
  };

  const run = async () => {
    if (!buffer) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const pdfjs = await getPdfjs();
      const { PDFDocument } = await import("pdf-lib");
      const { scale, quality } = LEVELS[level];
      const doc = await pdfjs.getDocument({ data: buffer.slice(0) }).promise;
      const out = await PDFDocument.create();

      for (let i = 1; i <= doc.numPages; i++) {
        setProgress(`Compressing page ${i} of ${doc.numPages}...`);
        const canvas = await renderPageToCanvas(doc, i, scale);
        const jpg = await canvasToBlob(canvas, "image/jpeg", quality);
        const img = await out.embedJpg(await jpg.arrayBuffer());
        // Keep original page proportions at 72 dpi.
        const pw = canvas.width / scale;
        const ph = canvas.height / scale;
        const p = out.addPage([pw, ph]);
        p.drawImage(img, { x: 0, y: 0, width: pw, height: ph });
      }
      setProgress("Finalizing...");
      const bytes = await out.save();
      setResult({ blob: new Blob([bytes], { type: "application/pdf" }), size: bytes.byteLength });
      setProgress("");
    } catch (e: any) {
      setError(e?.message || "Could not compress this PDF.");
    } finally {
      setBusy(false);
    }
  };

  const saved = result && origSize ? Math.max(0, Math.round((1 - result.size / origSize) * 100)) : 0;

  return (
    <ToolLayout
      title="Compress PDF"
      description="Shrink large PDFs by re-encoding their pages, with a quality you control, privately in your browser."
      category="PDF Tools"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <PrivacyNote />
        <Dropzone
          state={state}
          fileName={fileName}
          fileMeta={state !== "empty" ? fmtSize(origSize) : undefined}
          onFileSelect={onFile}
          onReset={reset}
          accept=".pdf,application/pdf"
          label="Drop a PDF here, or"
          acceptedTypesLabel="PDF"
          icon={FileDown}
        />

        {state === "file" && (
          <div className="space-y-4 bg-white border border-[#111111]/10 rounded-sm p-5">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-[#111111]/55 mb-1.5">Compression</span>
              <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className="w-full px-4 py-3 border border-[#111111]/15 rounded-sm bg-white focus:outline-none focus:border-[#FFD400]">
                {Object.entries(LEVELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </label>
            <p className="text-xs text-[#111111]/45">
              Pages are re-rendered as images, so text is no longer selectable. Best for scans and image heavy PDFs.
            </p>
            <button onClick={run} disabled={busy} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#111111] text-white font-bold rounded-sm hover:bg-[#111111]/90 transition disabled:opacity-50">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
              {busy ? progress || "Working..." : "Compress PDF"}
            </button>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-100 text-sm">{error}</div>}

        {result && (
          <div className="bg-white border border-[#111111]/10 rounded-sm p-5 space-y-3">
            <p className="text-sm">
              Original {fmtSize(origSize)} to <strong>{fmtSize(result.size)}</strong>{" "}
              {saved > 0 ? <span className="text-green-600 font-semibold">({saved}% smaller)</span> : <span className="text-[#111111]/50">(already optimized)</span>}
            </p>
            <button
              onClick={() => downloadBlob(result.blob, (fileName || "document").replace(/\.pdf$/i, "") + "-compressed.pdf")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FFD400] text-[#111111] font-bold rounded-sm hover:brightness-95 transition"
            >
              <Download className="w-5 h-5" /> Download compressed PDF
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
