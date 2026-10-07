import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Dropzone, type DropzoneState } from "../components/Dropzone";
import { FileText, Download, Loader2, AlertCircle } from "lucide-react";

type OutFmt = "pdf" | "html" | "txt" | "docx";

// Lay plain text onto PDF pages with word-wrapping. Used for DOCX/TXT → PDF.
async function textToPdf(text: string): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const size = 11;
  const margin = 56;
  const pageW = 595.28; // A4
  const pageH = 841.89;
  const maxW = pageW - margin * 2;
  const lineH = size * 1.4;

  let page = pdf.addPage([pageW, pageH]);
  let y = pageH - margin;

  const drawLine = (line: string) => {
    if (y < margin) {
      page = pdf.addPage([pageW, pageH]);
      y = pageH - margin;
    }
    page.drawText(line, { x: margin, y, size, font, color: rgb(0.07, 0.07, 0.07) });
    y -= lineH;
  };

  for (const raw of text.split(/\r?\n/)) {
    if (raw.trim() === "") {
      y -= lineH;
      continue;
    }
    let line = "";
    for (const word of raw.split(/\s+/)) {
      const test = line ? line + " " + word : word;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        drawLine(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) drawLine(line);
  }
  return new Blob([await pdf.save()], { type: "application/pdf" });
}

async function textToDocx(text: string): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");
  const doc = new Document({
    sections: [
      {
        children: text.split(/\r?\n/).map(
          (line) => new Paragraph({ children: [new TextRun(line)] })
        ),
      },
    ],
  });
  return Packer.toBlob(doc);
}

export function DocumentConverterTool() {
  const [state, setState] = useState<DropzoneState>("empty");
  const [fileName, setFileName] = useState<string>();
  const [baseName, setBaseName] = useState("document");
  const [inputExt, setInputExt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [outFmt, setOutFmt] = useState<OutFmt>("pdf");
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Which outputs make sense for the uploaded file.
  const outputsFor = (ext: string): OutFmt[] => {
    if (ext === "docx") return ["pdf", "html", "txt"];
    if (["txt", "md", "html", "htm"].includes(ext)) return ["docx", "pdf"];
    return [];
  };
  const available = outputsFor(inputExt);

  const onFile = (file: File) => {
    setError(null);
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (ext === "doc") {
      setError("Legacy .doc isn't supported in-browser. Open it in Word and 'Save As' .docx first, then convert here.");
      return;
    }
    if (!["docx", "txt", "md", "html", "htm"].includes(ext)) {
      setError("Unsupported file. Upload a .docx, .txt, .md, or .html file.");
      return;
    }
    setFileName(file.name);
    setBaseName(file.name.replace(/\.[^.]+$/, "") || "document");
    setInputExt(ext);
    setOutFmt(outputsFor(ext)[0]);
    setState("file");
    file.arrayBuffer().then((b) => setBuffer(b));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
  };

  const reset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setBuffer(null);
    setState("empty");
    setFileName(undefined);
    setInputExt("");
    setError(null);
  };

  const convert = async () => {
    if (!buffer) return;
    setBusy(true);
    setError(null);
    try {
      let blob: Blob;

      if (inputExt === "docx") {
        // @ts-ignore - browser build has no bundled types
        const mammoth: any = await import("mammoth/mammoth.browser.js");
        if (outFmt === "txt") {
          const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
          blob = new Blob([value], { type: "text/plain" });
        } else if (outFmt === "html") {
          const { value } = await mammoth.convertToHtml({ arrayBuffer: buffer });
          const html = `<!doctype html><html><head><meta charset="utf-8"><title>${baseName}</title></head><body>${value}</body></html>`;
          blob = new Blob([html], { type: "text/html" });
        } else {
          const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
          blob = await textToPdf(value);
        }
      } else {
        // text / md / html input
        let text = new TextDecoder().decode(buffer);
        if (inputExt === "html" || inputExt === "htm") {
          text = text
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<\/(p|div|h[1-6]|li|br)>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");
        }
        blob = outFmt === "docx" ? await textToDocx(text) : await textToPdf(text);
      }

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setState("done");
    } catch (e: any) {
      setError(e?.message || "Couldn't convert this document.");
      setState("error");
    } finally {
      setBusy(false);
    }
  };

  const extMime: Record<OutFmt, string> = {
    pdf: "pdf",
    html: "html",
    txt: "txt",
    docx: "docx",
  };

  return (
    <ToolLayout
      title="Document Converter"
      description="Convert Word (.docx), text, Markdown and HTML between each other and PDF - privately, in your browser."
      category="File Conversion"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-[#FFF9E6] border border-[#FFD400]/50 p-4 rounded-sm flex gap-3 text-[#111111]/80 text-sm">
          <AlertCircle className="w-5 h-5 text-[#FFD400] flex-shrink-0" />
          <p>
            Runs on your device - nothing is uploaded. DOCX text and structure are converted; heavy formatting
            (columns, embedded objects) may be simplified. Legacy <strong>.doc</strong> isn't supported - save as
            .docx first.
          </p>
        </div>

        <Dropzone
          state={state}
          fileName={fileName}
          fileMeta={state === "done" ? "Converted" : state === "file" ? "Ready to convert" : undefined}
          onFileSelect={onFile}
          onReset={reset}
          accept=".docx,.txt,.md,.html,.htm"
          label="Drop a document here, or"
          acceptedTypesLabel="DOCX · TXT · MD · HTML"
          icon={FileText}
        />

        {state !== "empty" && state !== "done" && available.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <label className="flex-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#111111]/55 mb-1.5">
                Convert to
              </span>
              <select
                value={outFmt}
                onChange={(e) => setOutFmt(e.target.value as OutFmt)}
                className="w-full px-4 py-3 border border-[#111111]/15 rounded-sm bg-white focus:outline-none focus:border-[#FFD400]"
              >
                {available.map((o) => (
                  <option key={o} value={o}>
                    {o.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={convert}
              disabled={busy || !buffer}
              className="px-6 py-3 bg-[#111111] text-white font-semibold rounded-sm hover:bg-[#111111]/90 transition disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : "Convert"}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-100 text-sm">{error}</div>
        )}

        {state === "done" && resultUrl && (
          <div className="space-y-3">
            <a
              href={resultUrl}
              download={`${baseName}.${extMime[outFmt]}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FFD400] text-[#111111] font-bold rounded-sm hover:brightness-95 transition"
            >
              <Download className="w-5 h-5" /> Download .{extMime[outFmt]}
            </a>
            <button onClick={reset} className="w-full text-sm text-[#111111]/50 hover:text-[#111111] underline">
              Convert another file
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
