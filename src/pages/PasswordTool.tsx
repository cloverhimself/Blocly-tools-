import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { ShieldAlert, Eye, EyeOff, Copy, Check } from "lucide-react";

export function PasswordTool() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Criteria
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const criteria = [
    { label: "At least 8 characters", valid: hasLength },
    { label: "Uppercase letter", valid: hasUpper },
    { label: "Lowercase letter", valid: hasLower },
    { label: "Number", valid: hasNumber },
    { label: "Special character", valid: hasSpecial },
  ];

  const score = criteria.filter((c) => c.valid).length;
  let strengthLabel = "Very Weak";
  let barColor = "bg-red-500";
  let barWidth = "w-[5%]";

  if (score === 2) {
    strengthLabel = "Weak";
    barColor = "bg-orange-500";
    barWidth = "w-[25%]";
  } else if (score === 3) {
    strengthLabel = "Fair";
    barColor = "bg-yellow-400";
    barWidth = "w-[50%]";
  } else if (score === 4) {
    strengthLabel = "Good";
    barColor = "bg-green-400";
    barWidth = "w-[75%]";
  } else if (score === 5) {
    strengthLabel = "Strong";
    barColor = "bg-green-600";
    barWidth = "w-[100%]";
  }

  if (password.length === 0) {
    strengthLabel = "None";
    barColor = "bg-slate-200";
    barWidth = "w-[0%]";
  }

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let pwd = "";
    // Generate one of each to guarantee strong
    pwd += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    pwd += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    pwd += "0123456789"[Math.floor(Math.random() * 10)];
    pwd += "!@#$%^&*()"[Math.floor(Math.random() * 10)];
    
    // Fill the rest
    for (let i = 0; i < 12; i++) {
        pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle
    pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');
    setPassword(pwd);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-10 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
              <ShieldAlert className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">Password Strength Checker</h1>
          </div>
          <p className="text-[#111111]/60 text-sm">Test the security of your password or generate a strong one</p>
        </div>

        <div className="bg-white border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111]">
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-slate-50 border-2 border-[#111111] px-4 py-4 pr-24 font-mono text-lg focus:outline-none focus:bg-white transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password..."
              spellCheck={false}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 hover:bg-slate-200 rounded-sm transition-colors text-[#111111]/60 hover:text-[#111111]"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 hover:bg-slate-200 rounded-sm transition-colors text-[#111111]/60 hover:text-[#111111]"
                title="Copy password"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="font-mono text-xs uppercase font-bold text-[#111111]/60">Strength</span>
              <span className={`font-mono text-sm font-bold ${password.length === 0 ? "text-[#111111]/40" : ""}`}>{strengthLabel}</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-[#111111]/10">
              <div className={`h-full transition-all duration-300 ${barWidth} ${barColor}`}></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-mono text-xs uppercase font-bold text-[#111111]/60 mb-3">Criteria</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {criteria.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${c.valid ? 'bg-green-500 border-green-600' : 'bg-slate-100 border-slate-300'}`}>
                    {c.valid && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${c.valid ? "text-[#111111] font-medium" : "text-[#111111]/60"}`}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={generatePassword}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#111111] text-white font-mono text-sm uppercase font-bold hover:bg-[#111111]/90 active:scale-[0.99] transition-all"
          >
            Generate Strong Password
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
