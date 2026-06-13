import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { CopyX } from "lucide-react";

export function FileConversionPlaceholderTool({ title }: { title: string }) {
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111] mb-8">
          <CopyX className="w-10 h-10 text-[#111111]/40" />
        </div>
        
        <h1 className="m-0 font-extrabold text-3xl tracking-[-0.01em] mb-4">
          Browser Native {title} Unavailable
        </h1>
        
        <div className="max-w-xl text-[#111111]/70 leading-relaxed space-y-4">
           <p>
             Because this application is strictly designed to operate <strong>100% in your browser without any server connection</strong>, complex proprietary document conversions (like PDF to Word, Word to PDF, and Excel to CSV) cannot be cleanly implemented here.
           </p>
           <p>
             These conversions usually require running heavy C++ binaries or using an external API service, which goes against the privacy-first, serverless design principles of this toolkit.
           </p>
           <p>
              We recommend using dedicated open-source tools locally (like LibreOffice or Pandoc) for these specific tasks, or standard desktop applications.
           </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
