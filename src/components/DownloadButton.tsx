import { Download } from "lucide-react";

export function DownloadButton({
  label,
  onDownload
}: {
  label: string;
  onDownload: () => void;
}) {
  return (
    <button 
      onClick={onDownload}
      className="flex items-center justify-center gap-2.5 w-full p-4 bg-[#FFD400] text-[#111111] border border-[#111111] rounded-sm font-sans font-bold text-[15.5px] cursor-pointer transition-colors duration-100 hover:bg-[#111111] hover:text-[#FFD400]"
    >
      <Download className="w-[18px] h-[18px]" strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
}
