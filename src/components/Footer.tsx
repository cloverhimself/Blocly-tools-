import { useI18n } from "../lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="w-full border-t border-[#111111] bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-5 pt-11 pb-6">
        <div className="flex flex-wrap gap-9 justify-between">
          <div className="max-w-[320px]">
             <div className="flex items-center gap-2.5 mb-3">
              <img src="/logo.svg" alt="Blocly" className="w-[19px] h-[19px] block" />
              <span className="font-extrabold text-[17px] tracking-tight">Blocly Tools</span>
            </div>
            <p className="m-0 text-[13px] leading-relaxed text-[#111111]/60">
              {t("footerDesc")}
            </p>
          </div>
        </div>

        <div className="mt-9 pt-4 border-t border-[#111111] flex flex-col md:flex-row flex-wrap gap-x-5 gap-y-2 justify-between font-mono text-[11.5px] text-[#111111]/55">
          <span>© {new Date().getFullYear()} Blocly - MIT License</span>
          <span>{t("footerToolkit")}</span>
        </div>
      </div>
    </footer>
  );
}
