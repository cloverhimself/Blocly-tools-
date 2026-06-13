import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Dropzone } from "../components/Dropzone";
import { Cloud, Download, RefreshCw, FileText } from "lucide-react";

export function FileConversionTool({ title, type }: { title: string, type: 'pdf-word' | 'word-pdf' | 'excel-csv' }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'empty' | 'selected' | 'converting' | 'success' | 'error'>('empty');
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [targetFormat, setTargetFormat] = useState<'docx' | 'doc'>('docx');
  
  const endpointMap = {
    'pdf-word': '/api/convert/pdf-word',
    'word-pdf': '/api/convert/word-pdf',
    'excel-csv': '/api/convert/excel-csv'
  };

  const currentEndpoint = endpointMap[type];

  // Derive allowed extensions
  const acceptTypes = 
     type === 'pdf-word' ? '.pdf' : 
     type === 'word-pdf' ? '.docx,.doc' : 
     '.xlsx,.xls';

  const extOutput = 
     type === 'pdf-word' ? targetFormat : 
     type === 'word-pdf' ? 'pdf' : 
     'csv';

  useEffect(() => {
    let timer: any;
    if (status === 'converting') {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev < 95) return prev + 1;
          return prev;
        });
      }, 50); // 1% every 50ms = 5 seconds to 100%.
    }
    return () => clearInterval(timer);
  }, [status]);

  const handleFile = (f: File) => {
    setFile(f);
    setStatus('selected');
    setErrorMsg("");
    setDownloadUrl(null);
  };

  const handleConvert = () => {
    if (!file) return;
    setStatus('converting');
    setProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    if (type === 'pdf-word') {
       formData.append('targetFormat', targetFormat);
    }
    
    const xhr = new XMLHttpRequest();

    xhr.addEventListener('load', () => {
      setProgress(100);
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = xhr.response;
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
        // Small delay to let the user see 100%
        setTimeout(() => setStatus('success'), 400);
      } else {
        const reader = new FileReader();
        reader.onload = function() {
           try {
              const errData = JSON.parse(reader.result as string);
              setErrorMsg(errData?.error || xhr.statusText);
           } catch {
              setErrorMsg(xhr.statusText);
           }
           setStatus('error');
        };
        reader.readAsText(xhr.response);
      }
    });

    xhr.addEventListener('error', () => {
      console.error('XHR Error');
      setErrorMsg('Conversion failed. Make sure the file format is valid.');
      setStatus('error');
    });

    xhr.open('POST', currentEndpoint);
    xhr.responseType = 'blob'; 
    xhr.send(formData);
  };

  const handleReset = () => {
    setFile(null);
    setStatus('empty');
    if (downloadUrl) {
      window.URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  const dzState = status === 'empty' ? 'empty' : status === 'success' ? 'done' : status === 'error' ? 'error' : 'file';

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-10 md:py-14">
        <div className="font-mono text-[12px] text-[#111111]/60 mb-6">
            <a href="/" className="text-[#111111] underline decoration-[#FFD400] decoration-2 underline-offset-2">Tools</a>
            <span className="text-[#111111]/40 mx-2">/</span>
            <span className="text-[#111111]">{title}</span>
        </div>

        <h1 className="m-0 text-[32px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05] mb-4">
          {title}
        </h1>
        
        <p className="mt-4 mb-8 text-[16px] leading-[1.5] text-[#111111]/66 max-w-[62ch]">
          Convert your files instantly. Unlike other tools on this site, this tool uses a cloud backend to process the file formats securely. Files are not saved after conversion.
        </p>

        <div className="flex flex-col md:flex-row gap-6 items-stretch mt-6">
           <div className="flex-[1.5] relative min-w-0 flex flex-col">
              <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  accept={acceptTypes}
                  onChange={(e) => {
                     const f = e.target.files?.[0];
                     if (f) handleFile(f);
                     e.target.value = '';
                  }} 
              />
              <div className="flex-1 w-full flex flex-col items-stretch">
                <Dropzone 
                  state={dzState} 
                  fileName={file?.name} 
                  fileMeta={file ? `Ready to convert` : undefined} 
                  onFileSelect={handleFile}
                  onReset={handleReset}
                  label="Drop a file here, or"
                  acceptedTypesLabel={acceptTypes.toUpperCase().split(',').join(' - ')}
                />
              </div>
              {(status !== 'empty') && (
                <div className="absolute inset-0 z-20 pointer-events-none"></div>
              )}
           </div>

           <div className="flex-1 min-w-[300px] border-2 border-[#111111] bg-white shadow-[4px_4px_0px_#111111] rounded-sm p-6 box-border flex flex-col justify-center gap-4 min-h-[220px]">
              
              {type === 'pdf-word' && (
                <div className="flex flex-col gap-2 pb-4 border-b-2 border-[#111111]/10">
                  <label className="font-mono text-[11.5px] uppercase tracking-wider font-bold text-[#111111]">Format</label>
                  <select 
                    value={targetFormat} 
                    onChange={e => setTargetFormat(e.target.value as any)}
                    disabled={status === 'converting' || status === 'success'}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border-2 border-[#111111] rounded-sm font-mono text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FFD400] disabled:opacity-50"
                  >
                    <option value="docx">.docx (Modern)</option>
                    <option value="doc">.doc (Legacy)</option>
                  </select>
                </div>
              )}

              {status === 'empty' && (
                <>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Cloud className="w-5 h-5 text-[#111111]/40" />
                  </div>
                  <button disabled className="w-full py-4 bg-[#FAFAFA] text-[#111111]/40 border-2 border-[#111111]/30 rounded-sm font-bold text-[15px] cursor-not-allowed uppercase font-mono tracking-wide">
                    Convert File
                  </button>
                  <div className="font-mono text-[11.5px] text-[#111111]/50 text-center mt-2">Requires an uploaded file</div>
                </>
              )}

              {status === 'selected' && (
                 <>
                  <button 
                    onClick={handleConvert}
                    className="w-full py-4 bg-[#111111] text-[#FFD400] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] rounded-sm font-bold text-[15px] cursor-pointer hover:bg-transparent hover:text-[#111111] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all uppercase font-mono tracking-wide"
                  >
                    Start Conversion
                  </button>
                  <div className="font-mono text-[11.5px] text-blue-600 font-bold text-center mt-2 flex justify-center items-center gap-1.5 border-t-2 border-[#111111]/5 pt-3">
                     <span className="w-1.5 h-1.5 rounded-full bg-blue-600 block animate-pulse"></span>
                     Processed in Cloud
                  </div>
                 </>
              )}

              {status === 'converting' && (
                <div className="flex flex-col items-center justify-center gap-4 py-4 w-full">
                  {type === 'pdf-word' && (
                     <div className="relative w-16 h-16 flex items-center justify-center">
                       <svg className="w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="40" className="stroke-[#111111]/10 stroke-[8] fill-none" />
                         <circle cx="50" cy="50" r="40" className="stroke-[#FFD400] stroke-[8] fill-none transition-all duration-300 ease-out" style={{ strokeDasharray: 251.2, strokeDashoffset: 251.2 - (251.2 * progress) / 100 }} />
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center font-mono text-[13px] font-bold text-[#111111]">
                         {progress}%
                       </div>
                     </div>
                  )}

                  {type === 'word-pdf' && (
                    <div className="w-full max-w-[200px] flex flex-col gap-2">
                       <div className="h-4 w-full bg-[#111111]/10 rounded-sm overflow-hidden border border-[#111111]">
                          <div 
                             className="h-full bg-blue-500 transition-all duration-300 ease-out"
                             style={{ width: `${progress}%` }}
                          />
                       </div>
                       <div className="font-mono text-[11px] text-right font-bold text-[#111111]">
                         {progress}% complete
                       </div>
                    </div>
                  )}

                  {type === 'excel-csv' && (
                    <div className="flex flex-col items-center gap-3">
                       <div className="grid grid-cols-5 gap-1 w-[120px]">
                          {Array.from({ length: 20 }).map((_, i) => (
                             <div 
                                key={i} 
                                className={`h-4 rounded-[1px] transition-colors duration-200 ${(i / 20) * 100 < progress ? 'bg-[#107C41]' : 'bg-[#111111]/10'}`} 
                             />
                          ))}
                       </div>
                       <div className="font-mono text-[11px] font-bold text-[#107C41]">
                         {progress}% Processed
                       </div>
                    </div>
                  )}

                  <div className="font-mono text-[12px] text-[#111111] font-bold text-center mt-2">
                    {progress < 40 ? "Uploading to Cloud..." : "Converting Format..."}
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="flex flex-col items-center justify-center gap-4 py-2">
                  <FileText className="w-8 h-8 text-[#111111]" />
                  <a 
                    href={downloadUrl!}
                    download={`converted.${extOutput}`}
                    className="w-full py-4 bg-[#FFD400] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] rounded-sm font-bold text-[15px] cursor-pointer hover:bg-[#111111] hover:text-[#FFD400] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 uppercase font-mono tracking-wide text-center"
                  >
                    <Download className="w-[18px] h-[18px]"/> Download Output
                  </a>
                  <button 
                    onClick={handleReset}
                    className="border-none bg-transparent text-[#111111] font-mono text-[11.5px] underline decoration-[#FFD400] decoration-2 cursor-pointer p-0 mt-2"
                  >
                    Convert another file
                  </button>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col items-center justify-center gap-4 py-2">
                  <div className="text-[13px] leading-[1.45] text-[#D32F2F] text-center font-bold">
                     {errorMsg}
                  </div>
                  <button 
                    onClick={handleReset}
                    className="w-full py-[14px] bg-[#111111] text-[#FFD400] border-2 border-[#111111] rounded-sm font-bold text-[15px] cursor-pointer uppercase font-mono"
                  >
                    Try Again
                  </button>
                </div>
              )}

           </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
