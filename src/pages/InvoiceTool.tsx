import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { FileText, Printer, Plus, Trash2 } from "lucide-react";

interface LineItem {
  desc: string;
  qty: number;
  price: number;
}

export function InvoiceTool() {
  const [invoiceNum, setInvoiceNum] = useState("INV-001");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [from, setFrom] = useState("My Company\n123 Business Rd\nCity, State 12345");
  const [to, setTo] = useState("Client Name\n456 Client St\nCity, State 67890");
  const [currency, setCurrency] = useState("$");
  const [taxRate, setTaxRate] = useState(0);

  const [items, setItems] = useState<LineItem[]>([
    { desc: "Web Development Services", qty: 1, price: 1500 },
    { desc: "Hosting (1 Year)", qty: 1, price: 120 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { desc: "", qty: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, val: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = val;
    setItems(newItems);
  };

  const subtotal = items.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
  const tax = taxRate >= 0 ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col print:bg-white print:text-black">
      <div className="print:hidden">
        <TopNav />
      </div>
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-10 flex flex-col print:p-0 print:max-w-none">
        
        {/* Editor Controls (Hidden on print) */}
        <div className="mb-10 w-full text-left print:hidden flex flex-col md:flex-row gap-6 justify-between md:items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FFD400] flex items-center justify-center shadow-[4px_4px_0px_#111111] border-2 border-[#111111]">
                <FileText className="w-5 h-5 text-[#111111]" />
              </div>
              <h1 className="m-0 font-extrabold text-2xl tracking-[-0.01em]">Invoice Generator</h1>
            </div>
            <p className="text-[#111111]/60 text-sm">Create and print clean invoices instantly in your browser</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold text-[#111111]/60">Currency</span>
                <select 
                  className="bg-white border-2 border-[#111111] font-mono text-sm px-2 py-1 focus:outline-none"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="¥">JPY (¥)</option>
                  <option value="₹">INR (₹)</option>
                  <option value="A$">AUD (A$)</option>
                  <option value="C$">CAD (C$)</option>
                  <option value="₦">NGN (₦)</option>
                  <option value="R">ZAR (R)</option>
                  <option value="">None</option>
                </select>
             </div>
             
             <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={taxRate >= 0}
                  onChange={(e) => setTaxRate(e.target.checked ? 10 : -1)}
                  className="w-4 h-4 accent-[#111111] cursor-pointer cursor-pointer"
                />
                <span className="font-mono text-[10px] uppercase font-bold text-[#111111] cursor-pointer">Include Tax</span>
             </label>

            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-mono text-sm uppercase font-bold hover:bg-[#111111]/90 active:scale-[0.99] transition-all ml-2"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Invoice Paper (What gets printed) */}
        <div className="bg-white border-2 border-[#111111] p-10 md:p-16 shadow-[8px_8px_0px_#111111] print:shadow-none print:border-none print:p-0 flex flex-col gap-10">
           
           <div className="flex flex-col md:flex-row justify-between items-start gap-10">
             <div className="w-full md:w-1/2">
                <h2 className="font-extrabold text-4xl uppercase tracking-tighter mb-6">Invoice</h2>
                <textarea 
                  className="w-full whitespace-pre-wrap focus:outline-none focus:bg-slate-50 border border-transparent hover:border-slate-200 resize-none font-medium leading-relaxed print:hover:border-transparent" 
                  value={from} 
                  onChange={e => setFrom(e.target.value)}
                  rows={4}
                  spellCheck={false}
                />
             </div>
             <div className="w-full md:w-1/3 flex flex-col gap-4 text-left md:text-right">
                <div className="flex flex-col">
                  <span className="font-mono text-xs uppercase font-bold text-[#111111]/60">Invoice No.</span>
                  <input 
                    type="text" 
                    value={invoiceNum} 
                    onChange={e => setInvoiceNum(e.target.value)}
                    className="text-left md:text-right focus:outline-none font-bold text-lg focus:bg-slate-50 hover:bg-slate-50 border border-transparent hover:border-slate-200 print:hover:border-transparent"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs uppercase font-bold text-[#111111]/60">Date</span>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="text-left md:text-right focus:outline-none font-bold focus:bg-slate-50 hover:bg-slate-50 border border-transparent hover:border-slate-200 print:hover:border-transparent print:appearance-none"
                  />
                </div>
             </div>
           </div>

           <div className="w-full md:w-1/2">
             <span className="font-mono text-xs uppercase font-bold text-[#111111]/60 block mb-2">Bill To</span>
             <textarea 
                className="w-full whitespace-pre-wrap focus:outline-none focus:bg-slate-50 border border-transparent hover:border-slate-200 resize-none font-medium leading-relaxed print:hover:border-transparent" 
                value={to} 
                onChange={e => setTo(e.target.value)}
                rows={4}
                spellCheck={false}
             />
           </div>

           {/* Table */}
           <div className="overflow-x-auto w-full">
             <table className="w-full text-left border-y-2 border-[#111111] min-w-[500px]">
               <thead>
                 <tr className="border-b-2 border-[#111111] bg-slate-50 print:bg-transparent">
                   <th className="py-3 px-4 font-mono text-xs uppercase font-bold w-full">Description</th>
                   <th className="py-3 px-4 font-mono text-xs uppercase font-bold text-right">Qty</th>
                   <th className="py-3 px-4 font-mono text-xs uppercase font-bold text-right">Price</th>
                   <th className="py-3 px-4 font-mono text-xs uppercase font-bold text-right">Total</th>
                   <th className="py-3 px-2 print:hidden w-10"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#111111]/10">
                 {items.map((item, i) => (
                   <tr key={i} className="group">
                     <td className="py-2 px-4">
                       <input 
                         type="text" 
                         value={item.desc}
                         onChange={e => updateItem(i, 'desc', e.target.value)}
                         className="w-full focus:outline-none focus:bg-slate-50 p-1 border border-transparent hover:border-slate-200 font-medium print:hover:border-transparent"
                         placeholder="Item description..."
                       />
                     </td>
                     <td className="py-2 px-4 text-right">
                       <input 
                         type="number" 
                         value={item.qty}
                         onChange={e => updateItem(i, 'qty', parseFloat(e.target.value) || 0)}
                         className="w-16 text-right focus:outline-none flex-none focus:bg-slate-50 p-1 border border-transparent hover:border-slate-200 font-mono text-sm print:hover:border-transparent"
                       />
                     </td>
                     <td className="py-2 px-4 flex justify-end items-center gap-1">
                       <span className="font-mono text-sm text-[#111111]/50">{currency}</span>
                       <input 
                         type="number" 
                         value={item.price}
                         onChange={e => updateItem(i, 'price', parseFloat(e.target.value) || 0)}
                         className="w-20 text-right focus:outline-none flex-none focus:bg-slate-50 p-1 border border-transparent hover:border-slate-200 font-mono text-sm print:hover:border-transparent"
                       />
                     </td>
                     <td className="py-2 px-4 text-right font-mono font-bold">
                       {currency}{(item.qty * item.price).toFixed(2)}
                     </td>
                     <td className="py-2 px-2 print:hidden align-middle">
                       <button onClick={() => handleRemoveItem(i)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 w-full hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             <div className="mt-4 print:hidden">
                <button onClick={handleAddItem} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 px-3 py-2 transition-all border border-[#111111]/10">
                  <Plus className="w-3 h-3" /> Add Item
                </button>
             </div>
           </div>

            {/* Totals */}
           <div className="flex justify-end mt-4">
             <div className="w-full sm:w-1/2 md:w-1/3 flex flex-col gap-2">
                <div className="flex justify-between items-center py-2 border-b border-[#111111]/10">
                   <span className="font-mono text-xs uppercase font-bold text-[#111111]/60">Subtotal</span>
                   <span className="font-mono font-bold">{currency}{subtotal.toFixed(2)}</span>
                </div>
                {taxRate >= 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-[#111111]/10 group">
                     <span className="font-mono text-xs uppercase font-bold text-[#111111]/60 flex items-center gap-2">
                       Tax/VAT %
                       <input 
                         type="number" 
                         value={taxRate}
                         onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                         className="w-12 text-center bg-slate-100 border border-transparent group-hover:border-slate-300 focus:outline-none focus:bg-white print:hidden px-1"
                       />
                     </span>
                     <span className="font-mono font-bold">{currency}{tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-4">
                   <span className="font-extrabold text-xl uppercase tracking-tighter">Total Due</span>
                   <span className="font-extrabold text-2xl tracking-tight">{currency}{total.toFixed(2)}</span>
                </div>
             </div>
           </div>
        </div>

      </main>
      
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
