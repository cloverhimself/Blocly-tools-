import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Dropzone } from "../components/Dropzone";
import { Cloud, Download, RefreshCw, FileText } from "lucide-react";

export function FileConversionTool({ title, type }: { title: string, type: 'pdf-word' | 'word-pdf' | 'excel-csv' }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'empty' | 'selected' | 'converting' | 'success' | 'error'>('empty');
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  
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
     type === 'pdf-word' ? 'doc' : 
     type === 'word-pdf' ? 'pdf' : 
     'csv';

  const handleFile = (f: File) => {
    setFile(f);
    setStatus('selected');
    setErrorMsg("");
    setDownloadUrl(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setStatus('converting');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(currentEndpoint, {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || res.statusText);
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus('success');
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Conversion failed. Make sure the file format is valid.');
      setStatus('error');
    }
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
           <div className="flex-[1.5] relative">
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
              <Dropzone 
                state={dzState} 
                fileName={file?.name} 
                fileMeta={file ? `Ready to convert` : undefined} 
                onFileSelect={handleFile}
                onReset={handleReset}
              />
              {(status !== 'empty') && (
                <div className="absolute inset-0 z-20 pointer-events-none"></div>
              )}
           </div>

           <div className="flex-1 min-w-[300px] border-2 border-[#111111] bg-white shadow-[4px_4px_0px_#111111] rounded-sm p-6 box-border flex flex-col justify-center gap-4 min-h-[220px]">
              
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
                <div className="flex flex-col items-center justify-center gap-4 py-6">
                  <RefreshCw className="w-8 h-8 text-[#111111] animate-spin" />
                  <div className="font-mono text-[12px] text-[#111111] font-bold">Uploading & Converting...</div>
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
