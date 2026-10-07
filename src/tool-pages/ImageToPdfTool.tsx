import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { ImagePlus, Download, Loader2, AlertCircle, X, ArrowUp, ArrowDown } from "lucide-react";
import { downloadBlob } from "../lib/pdf";

export function ImageToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...imgs]);
    setError(null);
  };

  const move = (i: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const convert = async () => {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const A4 = { w: 595.28, h: 841.89 };

      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        let img;
        if (file.type.includes("png")) img = await pdf.embedPng(bytes);
        else if (file.type.includes("jpeg") || file.type.includes("jpg")) img = await pdf.embedJpg(bytes);
        else {
          // Convert webp/other to PNG via canvas first.
          const dataUrl = await fileToPngDataUrl(file);
          img = await pdf.embedPng(dataUrl);
        }
        const page = pdf.addPage([A4.w, A4.h]);
        const scale = Math.min((A4.w - 40) / img.width, (A4.h - 40) / img.height, 1);
        const w = img.width * scale;
        const h = img.height * scale;
        page.drawImage(img, { x: (A4.w - w) / 2, y: (A4.h - h) / 2, width: w, height: h });
      }

      downloadBlob(new Blob([await pdf.save()], { type: "application/pdf" }), "images.pdf");
    } catch (e: any) {
      setError(e?.message || "Could not build the PDF. Try different images.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout
      title="Image to PDF"
      description="Combine JPG, PNG and WebP images into a single PDF, in the order you choose, right in your browser."
      category="PDF Tools"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <PrivacyNote />

        <label className="block w-full min-h-[180px] flex flex-col items-center justify-center gap-3 bg-[#FAFAFA] border-2 border-dashed border-[#111111] rounded-sm cursor-pointer p-8 hover:bg-[#111111]/5 transition-colors">
          <ImagePlus className="w-10 h-10" strokeWidth={1.5} />
          <span className="font-semibold">
            Click to add images <span className="text-[#111111]/50">(you can add more later)</span>
          </span>
          <span className="font-mono text-[11.5px] text-[#111111]/55">JPG, PNG, WebP</span>
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
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
            onClick={convert}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FFD400] text-[#111111] font-bold rounded-sm hover:brightness-95 transition disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            Create PDF ({files.length} {files.length === 1 ? "image" : "images"})
          </button>
        )}
      </div>
    </ToolLayout>
  );
}

function fileToPngDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")!.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = URL.createObjectURL(file);
  });
}

export function PrivacyNote() {
  return (
    <div className="bg-[#FFF9E6] border border-[#FFD400]/50 p-4 rounded-sm flex gap-3 text-[#111111]/80 text-sm">
      <AlertCircle className="w-5 h-5 text-[#FFD400] flex-shrink-0" />
      <p>Everything runs on your device. Your files are never uploaded to a server.</p>
    </div>
  );
}
