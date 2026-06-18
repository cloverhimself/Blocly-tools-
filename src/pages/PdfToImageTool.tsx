import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Dropzone, type DropzoneState } from "../components/Dropzone";
import { Image as ImageIcon, Download, Loader2 } from "lucide-react";
import { getPdfjs, renderPageToCanvas, canvasToBlob, downloadBlob } from "../lib/pdf";
import { PrivacyNote } from "./ImageToPdfTool";

export function PdfToImageTool() {
  const [state, setState] = useState<DropzoneState>("empty");
  const [fileName, setFileName] = useState<string>();
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setBuffer(await file.arrayBuffer());
    setFileName(file.name);
    setState("file");
  };

  const reset = () => {
    setState("empty");
    setBuffer(null);
    setFileName(undefined);
    setError(null);
    setProgress("");
  };

  const run = async () => {
    if (!buffer) return;
    setBusy(true);
    setError(null);
    try {
      const pdfjs = await getPdfjs();
      const doc = await pdfjs.getDocument({ data: buffer.slice(0) }).promise;
      const base = (fileName || "document").replace(/\.pdf$/i, "");
      const ext = format === "png" ? "png" : "jpg";
      const mime = format === "png" ? "image/png" : "image/jpeg";

      if (doc.numPages === 1) {
        setProgress("Rendering page 1...");
        const canvas = await renderPageToCanvas(doc, 1, scale);
        downloadBlob(await canvasToBlob(canvas, mime, 0.92), `${base}.${ext}`);
      } else {
        const { default: JSZip } = await import("jszip");
        const zip = new JSZip();
        for (let i = 1; i <= doc.numPages; i++) {
          setProgress(`Rendering page ${i} of ${doc.numPages}...`);
          const canvas = await renderPageToCanvas(doc, i, scale);
          const blob = await canvasToBlob(canvas, mime, 0.92);
          zip.file(`${base}-page-${String(i).padStart(2, "0")}.${ext}`, blob);
        }
        setProgress("Packaging zip...");
        downloadBlob(await zip.generateAsync({ type: "blob" }), `${base}-images.zip`);
      }
      setProgress("");
    } catch (e: any) {
      setError(e?.message || "Could not render this PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to Image"
      description="Turn each page of a PDF into a high quality PNG or JPG image, entirely in your browser."
      category="PDF Tools"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <PrivacyNote />
        <Dropzone
          state={state}
          fileName={fileName}
          fileMeta={state === "file" ? "Ready" : undefined}
          onFileSelect={onFile}
          onReset={reset}
          accept=".pdf,application/pdf"
          label="Drop a PDF here, or"
          acceptedTypesLabel="PDF"
          icon={ImageIcon}
        />

        {state === "file" && (
          <div className="space-y-4 bg-white border border-[#111111]/10 rounded-sm p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label>
                <span className="block text-xs font-bold uppercase tracking-wider text-[#111111]/55 mb-1.5">Format</span>
                <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="w-full px-4 py-3 border border-[#111111]/15 rounded-sm bg-white focus:outline-none focus:border-[#FFD400]">
                  <option value="png">PNG (lossless)</option>
                  <option value="jpeg">JPG (smaller)</option>
                </select>
              </label>
              <label>
                <span className="block text-xs font-bold uppercase tracking-wider text-[#111111]/55 mb-1.5">Quality</span>
                <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full px-4 py-3 border border-[#111111]/15 rounded-sm bg-white focus:outline-none focus:border-[#FFD400]">
                  <option value={1}>Standard (72 dpi)</option>
                  <option value={2}>High (150 dpi)</option>
                  <option value={3}>Very high (220 dpi)</option>
                </select>
              </label>
            </div>
            <button onClick={run} disabled={busy} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FFD400] text-[#111111] font-bold rounded-sm hover:brightness-95 transition disabled:opacity-50">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {busy ? progress || "Working..." : "Convert to images"}
            </button>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-100 text-sm">{error}</div>}
      </div>
    </ToolLayout>
  );
}
