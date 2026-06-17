import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";

export function TipCalculatorTool() {
  const [bill, setBill] = useState("100");
  const [tipPercent, setTipPercent] = useState(15);
  const [split, setSplit] = useState("1");

  const billAmount = parseFloat(bill) || 0;
  const splitCount = parseInt(split) || 1;

  const tipAmount = billAmount * (tipPercent / 100);
  const totalAmount = billAmount + tipAmount;
  const perPerson = totalAmount / splitCount;

  return (
    <ToolLayout
      title="Tip & Split Calculator"
      description="Quickly calculate tips and split bills among friends."
    >
      <div className="max-w-2xl mx-auto bg-white border border-[#111111]/10 rounded-sm overflow-hidden flex flex-col md:flex-row">
        
        <div className="p-8 flex-1 border-b md:border-b-0 md:border-r border-[#111111]/10">
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#111111]/70 mb-2 uppercase tracking-tight">
              Bill Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#111111]/50">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={bill}
                onChange={(e) => setBill(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-2xl font-bold bg-[#FAFAFA] border border-[#111111]/10 rounded-sm focus:outline-none focus:border-[#FFD400] transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2 pb-1">
              <label className="block text-sm font-bold text-[#111111]/70 uppercase tracking-tight">
                Tip %
              </label>
              <span className="font-bold">{tipPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={tipPercent}
              onChange={(e) => setTipPercent(parseInt(e.target.value))}
              className="w-full accent-[#111111]"
            />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[10, 15, 18, 20].map((p) => (
                <button
                  key={p}
                  onClick={() => setTipPercent(p)}
                  className={`py-2 text-sm font-bold rounded-sm border ${
                    tipPercent === p
                      ? "bg-[#111111] text-white border-[#111111]"
                      : "bg-[#FAFAFA] text-[#111111] border-[#111111]/10 hover:bg-[#111111]/5"
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#111111]/70 mb-2 uppercase tracking-tight">
              Split Table
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={split}
              onChange={(e) => setSplit(e.target.value)}
              className="w-full px-4 py-3 text-xl font-bold bg-[#FAFAFA] border border-[#111111]/10 rounded-sm focus:outline-none focus:border-[#FFD400] transition-colors"
            />
          </div>
        </div>

        <div className="p-8 w-full md:w-2/5 bg-[#111111] text-white flex flex-col justify-center">
          <div className="mb-8">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-1">Tip Amount</p>
            <p className="text-3xl font-extrabold flex items-baseline">
              <span className="text-xl mr-1 text-white/50">$</span>
              {tipAmount.toFixed(2)}
            </p>
          </div>
          
          <div className="mb-8">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-1">Total Bill</p>
            <p className="text-4xl font-extrabold flex items-baseline text-[#FFD400]">
              <span className="text-2xl mr-1 text-[#FFD400]/50">$</span>
              {totalAmount.toFixed(2)}
            </p>
            <p className="text-xs text-white/40 mt-1">Includes tip</p>
          </div>

          {splitCount > 1 && (
            <div className="pt-8 border-t border-white/10">
              <p className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-1">Per Person</p>
              <p className="text-4xl font-extrabold flex items-baseline">
                <span className="text-2xl mr-1 text-white/50">$</span>
                {perPerson.toFixed(2)}
              </p>
              <p className="text-xs text-white/40 mt-1">Divided by {splitCount}</p>
            </div>
          )}
        </div>

      </div>
    </ToolLayout>
  );
}
