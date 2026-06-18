import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Dropzone, type DropzoneState } from "../components/Dropzone";
import { Table, Download, Loader2, AlertCircle } from "lucide-react";

type OutFmt = "xlsx" | "xls" | "csv" | "ods" | "html" | "json";

const OUTPUTS: { id: OutFmt; label: string; ext: string; bookType?: string; mime: string }[] = [
  { id: "xlsx", label: "Excel (.xlsx)", ext: "xlsx", bookType: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  { id: "xls", label: "Excel 97–2003 (.xls)", ext: "xls", bookType: "biff8", mime: "application/vnd.ms-excel" },
  { id: "csv", label: "CSV (.csv)", ext: "csv", bookType: "csv", mime: "text/csv" },
  { id: "ods", label: "OpenDocument (.ods)", ext: "ods", bookType: "ods", mime: "application/vnd.oasis.opendocument.spreadsheet" },
  { id: "html", label: "HTML table (.html)", ext: "html", bookType: "html", mime: "text/html" },
  { id: "json", label: "JSON (.json)", ext: "json", mime: "application/json" },
];

export function SpreadsheetConverterTool() {
  const [state, setState] = useState<DropzoneState>("empty");
  const [fileName, setFileName] = useState<string>();
  const [baseName, setBaseName] = useState("converted");
  const [error, setError] = useState<string | null>(null);
  const [outFmt, setOutFmt] = useState<OutFmt>("xlsx");
  const [busy, setBusy] = useState(false);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const onFile = (file: File) => {
    setError(null);
    setFileName(file.name);
    setBaseName(file.name.replace(/\.[^.]+$/, "") || "converted");
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
    setError(null);
  };

  const convert = async () => {
    if (!buffer) return;
    setBusy(true);
    setError(null);
    try {
      const XLSX: any = await import("xlsx");
      const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
      const cfg = OUTPUTS.find((o) => o.id === outFmt)!;

      let blob: Blob;
      if (outFmt === "json") {
        const out: Record<string, any[]> = {};
        wb.SheetNames.forEach((name: string) => {
          out[name] = XLSX.utils.sheet_to_json(wb.Sheets[name]);
        });
        const data = wb.SheetNames.length === 1 ? out[wb.SheetNames[0]] : out;
        blob = new Blob([JSON.stringify(data, null, 2)], { type: cfg.mime });
      } else {
        const wbout = XLSX.write(wb, { bookType: cfg.bookType, type: "array" });
        blob = new Blob([wbout], { type: cfg.mime });
      }

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setState("done");
    } catch (e: any) {
      setError(e?.message || "Couldn't convert this file. Make sure it's a valid spreadsheet.");
      setState("error");
    } finally {
      setBusy(false);
    }
  };

  const cfg = OUTPUTS.find((o) => o.id === outFmt)!;
  const csvNote = outFmt === "csv" && state !== "empty";

  return (
    <ToolLayout
      title="Spreadsheet Converter"
      description="Convert between Excel (.xlsx, .xls), CSV, OpenDocument (.ods), HTML and JSON — all in your browser."
      category="File Conversion"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-[#FFF9E6] border border-[#FFD400]/50 p-4 rounded-sm flex gap-3 text-[#111111]/80 text-sm">
          <AlertCircle className="w-5 h-5 text-[#FFD400] flex-shrink-0" />
          <p>Runs entirely on your device — your spreadsheets are never uploaded.</p>
        </div>

        <Dropzone
          state={state}
          fileName={fileName}
          fileMeta={state === "done" ? "Converted" : state === "file" ? "Ready to convert" : undefined}
          onFileSelect={onFile}
          onReset={reset}
          accept=".xlsx,.xls,.csv,.ods,.tsv,.txt"
          label="Drop a spreadsheet here, or"
          acceptedTypesLabel="XLSX · XLS · CSV · ODS · TSV"
          icon={Table}
        />

        {state !== "empty" && state !== "done" && (
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
                {OUTPUTS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
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

        {csvNote && (
          <p className="text-xs text-[#111111]/45">
            CSV holds a single sheet — only the first sheet is exported. Use XLSX/ODS to keep every sheet.
          </p>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-100 text-sm">{error}</div>
        )}

        {state === "done" && resultUrl && (
          <div className="space-y-3">
            <a
              href={resultUrl}
              download={`${baseName}.${cfg.ext}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FFD400] text-[#111111] font-bold rounded-sm hover:brightness-95 transition"
            >
              <Download className="w-5 h-5" /> Download {cfg.label}
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
