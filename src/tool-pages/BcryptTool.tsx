import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { Lock, Copy, Check, RefreshCw } from "lucide-react";
import bcrypt from "bcryptjs";

export function BcryptTool() {
  const [input, setInput] = useState("");
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Verification state
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyText, setVerifyText] = useState("");
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  const generateHash = () => {
    if (!input) {
      setHash("");
      return;
    }
    
    setIsHashing(true);
    // Hash asynchronously to avoid blocking UI too much
    setTimeout(() => {
      try {
        const salt = bcrypt.genSaltSync(rounds);
        const result = bcrypt.hashSync(input, salt);
        setHash(result);
      } catch (err) {
        setHash("Error generating hash");
      }
      setIsHashing(false);
    }, 10);
  };

  const handleCopy = () => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (verifyHash && verifyText) {
      try {
        const match = bcrypt.compareSync(verifyText, verifyHash);
        setIsMatch(match);
      } catch (err) {
        setIsMatch(false);
      }
    } else {
      setIsMatch(null);
    }
  }, [verifyHash, verifyText]);

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-10 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
              <Lock className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">bcrypt Generator</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">Generate and verify bcrypt password hashes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Generator Section */}
          <div className="bg-white border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111] flex flex-col gap-4">
            <h2 className="m-0 font-mono text-sm uppercase tracking-wider font-bold mb-2">Generate Hash</h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#111111]/60">String to Hash</label>
              <input
                type="text"
                className="w-full bg-slate-50 border-2 border-[#111111] px-3 py-2 font-mono text-sm focus:outline-none focus:bg-white transition-colors"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="hunter2"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#111111]/60">Salt Rounds (Cost): {rounds}</label>
              <input
                type="range"
                min="4"
                max="14" // limit max to avoid freezing browser completely for very high values
                className="w-full accent-[#111111]"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value))}
              />
              <span className="text-[10px] text-[#111111]/50 border border-yellow-200 bg-yellow-50 p-1 mt-1">
                Note: Higher rounds take exponentially longer. 10 is standard.
              </span>
            </div>

            <button
              onClick={generateHash}
              disabled={!input || isHashing}
              className="flex items-center justify-center gap-2 mt-2 px-4 py-3 bg-[#FFD400] border-2 border-[#111111] text-[#111111] font-mono text-sm uppercase font-bold hover:bg-[#ffe14d] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0px_#111111] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isHashing ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Hash"}
            </button>

            {hash && (
              <div className="mt-4 pt-4 border-t-2 border-[#111111]/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#111111]/60">Result:</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#111111] bg-slate-100 hover:bg-slate-200 px-2 py-1 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="p-3 bg-slate-100 border border-[#111111]/20 font-mono text-sm break-all font-bold text-[#111111]">
                  {hash}
                </div>
              </div>
            )}
          </div>

          {/* Verifier Section */}
          <div className="bg-white border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111] flex flex-col gap-4">
            <h2 className="m-0 font-mono text-sm uppercase tracking-wider font-bold mb-2">Verify Hash</h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#111111]/60">Hash to Verify</label>
              <textarea
                className="w-full bg-slate-50 border-2 border-[#111111] p-2 font-mono text-xs focus:outline-none focus:bg-white transition-colors h-16 resize-none"
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
                placeholder="$2a$10$..."
                spellCheck={false}
              />
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-bold text-[#111111]/60">Plaintext</label>
              <input
                type="text"
                className="w-full bg-slate-50 border-2 border-[#111111] px-3 py-2 font-mono text-sm focus:outline-none focus:bg-white transition-colors"
                value={verifyText}
                onChange={(e) => setVerifyText(e.target.value)}
                placeholder="hunter2"
              />
            </div>

            <div className="mt-4 flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#111111]/20 bg-slate-50">
              {isMatch === null ? (
                <span className="text-sm font-bold text-[#111111]/40">Enter hash and plaintext to verify</span>
              ) : isMatch ? (
                <div className="flex flex-col items-center text-green-600 gap-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-lg">Match!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-red-500 gap-2">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center font-bold text-xl">
                    !
                  </div>
                  <span className="font-bold text-lg">No Match</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
