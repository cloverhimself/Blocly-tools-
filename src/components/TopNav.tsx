import { Link } from "react-router-dom";
import { Github, Download, Share2, Info, X, Monitor, Smartphone, Apple } from "lucide-react";
import { useState, useEffect } from "react";

export function TopNav() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Blocly Tools',
      text: 'A unified digital toolkit for developers and creators.',
      url: window.location.origin,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <header className="w-full border-b border-[#111111] bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-5 h-[62px] flex items-center justify-between gap-3.5">
          <Link to="/" className="flex items-center gap-2.5 text-[#111111]">
            <img src="/logo.svg" alt="Blocly" className="w-[20px] h-[20px] block flex-none" />
            <span className="font-extrabold text-[18px] tracking-tight">Blocly</span>
            <span className="font-mono text-[11px] text-[#111111]/50">/tools</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="hidden md:block text-[#111111] text-[13.5px] font-semibold border-b-2 border-transparent pb-[1px] hover:border-[#FFD400]"
            >
              Tools
            </Link>
            <Link
              to="/dashboard"
              className="hidden md:block text-[#111111] text-[13.5px] font-semibold border-b-2 border-transparent pb-[1px] hover:border-[#FFD400]"
            >
              Dashboard
            </Link>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-[#111111] text-[13px] sm:text-[13.5px] font-semibold px-1 py-1.5 hover:text-[#FFD400] transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 className="w-[15px] h-[15px]" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={() => setShowInstallGuide(true)}
              className="flex items-center gap-1.5 text-[#111111] text-[13px] sm:text-[13.5px] font-semibold px-1 py-1.5 hover:text-[#FFD400] transition-colors cursor-pointer"
              title="Install Guide"
            >
              <Info className="w-[15px] h-[15px]" />
              <span className="hidden md:inline">Guide</span>
            </button>

            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 text-[#111111] text-[13px] sm:text-[13.5px] font-semibold border border-[#111111] bg-[#FFD400] rounded-sm px-2.5 sm:px-3 py-1.5 hover:bg-[#111111] hover:text-[#FFD400] transition-colors cursor-pointer"
            >
              <Download className="w-[14px] h-[14px]" />
              <span className="hidden sm:inline">Install App</span>
            </button>

            <a
              href="https://github.com/saviourpopoola/blocly-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex flex items-center gap-2 text-[#111111] text-[13px] sm:text-[13.5px] font-semibold border border-[#111111] rounded-sm px-2.5 sm:px-3 py-1.5 hover:bg-[#FFD400] transition-colors"
            >
              <Github className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]" />
              <span>GitHub</span>
            </a>
          </nav>
        </div>
      </header>

      {showInstallGuide && (
        <div className="fixed inset-0 bg-[#111111]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAFAFA] border border-[#111111] max-w-xl w-full rounded-sm shadow-xl flex flex-col max-h-[90vh]">
             <div className="flex items-center justify-between p-4 border-b border-[#111111]">
                <h2 className="font-bold text-lg text-[#111111]">Install Guide</h2>
                <button onClick={() => setShowInstallGuide(false)} className="p-1.5 hover:bg-[#FFD400] border border-transparent hover:border-[#111111] rounded-sm transition-colors text-[#111111]">
                   <X className="w-5 h-5"/>
                </button>
             </div>
             <div className="p-6 overflow-y-auto space-y-6">
                <p className="text-[14px] text-[#111111]/80 leading-relaxed font-medium">
                   Blocly Tools is a Progressive Web App (PWA). You can install it on your device for a native app experience, an app drawer icon, and offline access without needing an App Store.
                </p>

                <div className="space-y-3 bg-white p-4 border border-[#111111]/10 rounded-sm">
                   <h3 className="font-bold flex items-center gap-2 text-[#111111]">
                     <Monitor className="w-[18px] h-[18px]"/> Desktop (Chrome / Edge)
                   </h3>
                   <ul className="text-[13px] space-y-2 list-disc pl-5 text-[#111111]/70 leading-relaxed">
                      <li>Click the <strong>"Install App"</strong> button in the top navigation above.</li>
                      <li>Alternatively, look for the install icon (a monitor with a downward arrow &#10515;) in the right side of your browser's address bar.</li>
                      <li>Click it and select "Install". The app will open in its own window and appear in your operating system's application menu.</li>
                   </ul>
                </div>

                <div className="space-y-3 bg-white p-4 border border-[#111111]/10 rounded-sm">
                   <h3 className="font-bold flex items-center gap-2 text-[#111111]">
                     <Smartphone className="w-[18px] h-[18px]"/> Android (Chrome)
                   </h3>
                   <ul className="text-[13px] space-y-2 list-disc pl-5 text-[#111111]/70 leading-relaxed">
                      <li>Tap the three dots menu (<strong>&vellip;</strong>) in the top right corner.</li>
                      <li>Scroll down and tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Confirm the prompt. Blocly will be installed straight to your device app drawer and home screen like a normal mobile app.</li>
                   </ul>
                </div>

                <div className="space-y-3 bg-white p-4 border border-[#111111]/10 rounded-sm">
                   <h3 className="font-bold flex items-center gap-2 text-[#111111]">
                     <Apple className="w-[18px] h-[18px]"/> iOS (Safari)
                   </h3>
                   <ul className="text-[13px] space-y-2 list-disc pl-5 text-[#111111]/70 leading-relaxed">
                      <li>Open this site in Safari (Apple does not support installation from Chrome/Firefox on iOS).</li>
                      <li>Tap the <strong>Share</strong> button (square with an up arrow) at the bottom of the screen.</li>
                      <li>Scroll down and tap <strong>"Add to Home Screen" <span className="text-xl inline-block align-middle leading-none">+</span></strong>.</li>
                      <li>Tap <strong>Add</strong> in the top right. The app will behave like a standalone native app.</li>
                   </ul>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
