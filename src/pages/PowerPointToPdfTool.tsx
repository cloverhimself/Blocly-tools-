import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Dropzone, type DropzoneState } from "../components/Dropzone";
import { Presentation, Download, Loader2, AlertCircle } from "lucide-react";

// PowerPoint stores positions in EMUs (English Metric Units). 1 point = 12700 EMU.
const EMU_PER_PT = 12700;
const emuToPt = (emu: number) => emu / EMU_PER_PT;

type SlideEl = HTMLElement;
const tag = (el: Element | Document, name: string) => Array.from(el.getElementsByTagName(name));
const attr = (el: Element | null | undefined, name: string) => (el ? el.getAttribute(name) : null);

function parseXfrm(sp: Element) {
  const xfrm = tag(sp, "a:xfrm")[0];
  if (!xfrm) return null;
  const off = tag(xfrm, "a:off")[0];
  const ext = tag(xfrm, "a:ext")[0];
  if (!off || !ext) return null;
  return {
    x: emuToPt(Number(attr(off, "x") || 0)),
    y: emuToPt(Number(attr(off, "y") || 0)),
    w: emuToPt(Number(attr(ext, "cx") || 0)),
    h: emuToPt(Number(attr(ext, "cy") || 0)),
  };
}

// Convert a .pptx ArrayBuffer into a PDF (Uint8Array). Best-effort layout:
// images and text boxes are placed at their real slide positions.
async function pptxToPdf(buffer: ArrayBuffer): Promise<Uint8Array> {
  const [{ default: JSZip }, { PDFDocument, StandardFonts, rgb }] = await Promise.all([
    import("jszip"),
    import("pdf-lib"),
  ]);

  const zip = await JSZip.loadAsync(buffer);

  // Slide page size from presentation.xml (default to 4:3 if missing).
  let pageW = 720;
  let pageH = 540;
  const presFile = zip.file("ppt/presentation.xml");
  if (presFile) {
    const presXml = new DOMParser().parseFromString(await presFile.async("text"), "application/xml");
    const sz = tag(presXml, "p:sldSz")[0];
    if (sz) {
      pageW = emuToPt(Number(attr(sz, "cx") || 0)) || pageW;
      pageH = emuToPt(Number(attr(sz, "cy") || 0)) || pageH;
    }
  }

  // Collect slide files in numeric order (slide1.xml, slide2.xml, …).
  const slidePaths = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => {
      const n = (s: string) => Number(s.match(/slide(\d+)\.xml/)![1]);
      return n(a) - n(b);
    });

  if (slidePaths.length === 0) throw new Error("No slides found - is this a valid .pptx file?");

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  for (const slidePath of slidePaths) {
    const page = pdf.addPage([pageW, pageH]);
    // White background
    page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(1, 1, 1) });

    const slideXml = new DOMParser().parseFromString(
      await zip.file(slidePath)!.async("text"),
      "application/xml"
    );

    // Slide relationships → resolve image references.
    const relsPath = slidePath.replace(/slides\/(slide\d+)\.xml$/, "slides/_rels/$1.xml.rels");
    const rels: Record<string, string> = {};
    const relsFile = zip.file(relsPath);
    if (relsFile) {
      const relsXml = new DOMParser().parseFromString(await relsFile.async("text"), "application/xml");
      for (const r of tag(relsXml, "Relationship")) {
        const id = attr(r, "Id");
        const target = attr(r, "Target");
        if (id && target) rels[id] = target.replace(/^\.\.\//, "ppt/").replace(/^ppt\/ppt\//, "ppt/");
      }
    }

    // ---- Images ----
    for (const pic of tag(slideXml, "p:pic") as SlideEl[]) {
      try {
        const box = parseXfrm(pic);
        const blip = tag(pic, "a:blip")[0];
        const embed = attr(blip, "r:embed");
        if (!box || !embed || !rels[embed]) continue;
        let mediaPath = rels[embed];
        if (!mediaPath.startsWith("ppt/")) mediaPath = "ppt/" + mediaPath.replace(/^\//, "");
        const mediaFile = zip.file(mediaPath);
        if (!mediaFile) continue;
        const bytes = await mediaFile.async("uint8array");
        const lower = mediaPath.toLowerCase();
        let img;
        if (lower.endsWith(".png")) img = await pdf.embedPng(bytes);
        else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) img = await pdf.embedJpg(bytes);
        else continue; // skip emf/wmf/gif/svg that pdf-lib can't embed
        // PPTX y is top-down; PDF y is bottom-up.
        page.drawImage(img, { x: box.x, y: pageH - box.y - box.h, width: box.w, height: box.h });
      } catch {
        /* skip unrenderable image */
      }
    }

    // ---- Text boxes ----
    for (const sp of tag(slideXml, "p:sp") as SlideEl[]) {
      try {
        const box = parseXfrm(sp);
        const paras = tag(sp, "a:p");
        if (paras.length === 0) continue;
        const startX = box ? box.x : 40;
        let cursorY = box ? pageH - box.y : pageH - 40;
        const maxW = box ? box.w : pageW - 80;

        for (const p of paras) {
          const runs = tag(p, "a:r");
          const text = runs.map((r) => tag(r, "a:t")[0]?.textContent || "").join("");
          if (!text.trim()) {
            cursorY -= 14;
            continue;
          }
          const rPr = tag(runs[0], "a:rPr")[0];
          const size = rPr && attr(rPr, "sz") ? Number(attr(rPr, "sz")) / 100 : 18;
          const bold = rPr && attr(rPr, "b") === "1";
          const f = bold ? fontBold : font;
          const colorEl = rPr ? tag(rPr, "a:srgbClr")[0] : null;
          const hex = colorEl ? attr(colorEl, "val") : null;
          const color = hex
            ? rgb(parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255)
            : rgb(0.07, 0.07, 0.07);

          // Word-wrap to the text box width.
          const words = text.split(/\s+/);
          let line = "";
          const lineHeight = size * 1.25;
          for (const word of words) {
            const test = line ? line + " " + word : word;
            if (f.widthOfTextAtSize(test, size) > maxW && line) {
              cursorY -= lineHeight;
              if (cursorY < 8) break;
              page.drawText(line, { x: startX, y: cursorY, size, font: f, color });
              line = word;
            } else {
              line = test;
            }
          }
          if (line && cursorY >= 8) {
            cursorY -= lineHeight;
            page.drawText(line, { x: startX, y: cursorY, size, font: f, color });
          }
          cursorY -= size * 0.4; // paragraph spacing
        }
      } catch {
        /* skip unrenderable text box */
      }
    }
  }

  return pdf.save();
}

export function PowerPointToPdfTool() {
  const [state, setState] = useState<DropzoneState>("empty");
  const [fileName, setFileName] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [outName, setOutName] = useState("presentation.pdf");

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".pptx")) {
      setError("Please upload a .pptx file (PowerPoint 2007+). Old .ppt files aren't supported.");
      return;
    }
    setFileName(file.name);
    setState("file");
    try {
      const buffer = await file.arrayBuffer();
      const bytes = await pptxToPdf(buffer);
      const blob = new Blob([bytes], { type: "application/pdf" });
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(blob));
      setOutName(file.name.replace(/\.pptx$/i, "") + ".pdf");
      setState("done");
    } catch (e: any) {
      setError(e?.message || "Couldn't convert this presentation.");
      setState("error");
    }
  };

  const reset = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setState("empty");
    setFileName(undefined);
    setError(null);
  };

  return (
    <ToolLayout
      title="PowerPoint to PDF"
      description="Convert .pptx presentations to PDF - entirely in your browser, so your files never leave your device."
      category="File Conversion"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-[#FFF9E6] border border-[#FFD400]/50 p-4 rounded-sm flex gap-3 text-[#111111]/80 text-sm">
          <AlertCircle className="w-5 h-5 text-[#FFD400] flex-shrink-0" />
          <p>
            This runs 100% on your device - nothing is uploaded. It reproduces each slide's text and images
            (PNG/JPG) at their positions; complex effects, fonts, charts, and animations are simplified.
          </p>
        </div>

        <Dropzone
          state={state}
          fileName={fileName}
          fileMeta={state === "done" ? "Converted to PDF" : state === "file" ? "Converting…" : undefined}
          onFileSelect={handleFile}
          onReset={reset}
          accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          label="Drop a .pptx file here, or"
          acceptedTypesLabel="PPTX (PowerPoint 2007+)"
          icon={Presentation}
        />

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-100 text-sm">{error}</div>
        )}

        {state === "file" && (
          <div className="flex items-center justify-center gap-2 text-sm text-[#111111]/70">
            <Loader2 className="w-4 h-4 animate-spin" /> Converting your presentation…
          </div>
        )}

        {state === "done" && pdfUrl && (
          <a
            href={pdfUrl}
            download={outName}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FFD400] text-[#111111] font-bold rounded-sm hover:brightness-95 transition"
          >
            <Download className="w-5 h-5" /> Download PDF
          </a>
        )}
      </div>
    </ToolLayout>
  );
}
