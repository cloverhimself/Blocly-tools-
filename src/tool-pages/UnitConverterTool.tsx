import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";

type UnitCategory = "Length" | "Weight" | "Temperature";

const units: Record<UnitCategory, string[]> = {
  Length: ["Meters", "Kilometers", "Centimeters", "Millimeters", "Miles", "Yards", "Feet", "Inches"],
  Weight: ["Kilograms", "Grams", "Milligrams", "Pounds", "Ounces"],
  Temperature: ["Celsius", "Fahrenheit", "Kelvin"],
};

export function UnitConverterTool() {
  const [category, setCategory] = useState<UnitCategory>("Length");
  const [fromUnit, setFromUnit] = useState(units["Length"][0]);
  const [toUnit, setToUnit] = useState(units["Length"][1]);
  const [inputValue, setInputValue] = useState("1");

  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    setFromUnit(units[cat][0]);
    setToUnit(units[cat][1]);
  };

  const convert = (value: string, from: string, to: string, cat: UnitCategory) => {
    if (!value || isNaN(Number(value))) return "";
    const val = Number(value);

    if (from === to) return val.toString();

    let standardObj: any = {}; // Value to a standard unit
    let converted: number = 0;

    if (cat === "Length") {
      // standard is Meter
      standardObj = {
        Meters: val,
        Kilometers: val * 1000,
        Centimeters: val / 100,
        Millimeters: val / 1000,
        Miles: val * 1609.34,
        Yards: val * 0.9144,
        Feet: val * 0.3048,
        Inches: val * 0.0254,
      };
      
      const inMeters = standardObj[from];
      const reverseObj: any = {
        Meters: inMeters,
        Kilometers: inMeters / 1000,
        Centimeters: inMeters * 100,
        Millimeters: inMeters * 1000,
        Miles: inMeters / 1609.34,
        Yards: inMeters / 0.9144,
        Feet: inMeters / 0.3048,
        Inches: inMeters / 0.0254,
      };
      converted = reverseObj[to];
    } else if (cat === "Weight") {
      // standard is Kilograms
      standardObj = {
        Kilograms: val,
        Grams: val / 1000,
        Milligrams: val / 1000000,
        Pounds: val * 0.453592,
        Ounces: val * 0.0283495,
      };
      const inKg = standardObj[from];
      const reverseObj: any = {
        Kilograms: inKg,
        Grams: inKg * 1000,
        Milligrams: inKg * 1000000,
        Pounds: inKg / 0.453592,
        Ounces: inKg / 0.0283495,
      };
      converted = reverseObj[to];
    } else if (cat === "Temperature") {
      let inCelsius = 0;
      if (from === "Celsius") inCelsius = val;
      if (from === "Fahrenheit") inCelsius = (val - 32) * 5/9;
      if (from === "Kelvin") inCelsius = val - 273.15;

      if (to === "Celsius") converted = inCelsius;
      if (to === "Fahrenheit") converted = (inCelsius * 9/5) + 32;
      if (to === "Kelvin") converted = inCelsius + 273.15;
    }

    // round to max 6 decimals
    return parseFloat(converted.toFixed(6)).toString();
  };

  const outputValue = convert(inputValue, fromUnit, toUnit, category);

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setInputValue(outputValue);
  };

  return (
    <ToolLayout
      title="Unit Converter"
      description="Convert between different units of length, weight, and temperature."
    >
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex gap-2 p-1 bg-[#111111]/5 rounded-sm overflow-x-auto">
          {(Object.keys(units) as UnitCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-semibold rounded-sm transition-colors ${
                category === cat
                  ? "bg-white text-[#111111] shadow-sm border border-[#111111]/10"
                  : "text-[#111111]/60 hover:text-[#111111] hover:bg-[#111111]/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="bg-white border border-[#111111]/10 rounded-sm p-6">
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full text-lg font-bold bg-transparent border-b border-[#111111]/10 pb-2 mb-4 focus:outline-none focus:border-[#FFD400]"
            >
              {units[category].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full text-4xl font-extrabold focus:outline-none"
              placeholder="0"
            />
          </div>

          <button
            onClick={swap}
            className="w-12 h-12 mx-auto md:mx-0 flex items-center justify-center rounded-full bg-[#111111] text-white hover:bg-[#111111]/80 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.828l-8.656-8.656"/><path d="M12 22v-8.3a4 4 0 0 1 1.172-2.828l8.656-8.656"/></svg>
          </button>

          <div className="bg-[#FAFAFA] border border-[#111111]/10 rounded-sm p-6">
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full text-lg font-bold bg-transparent border-b border-[#111111]/10 pb-2 mb-4 focus:outline-none focus:border-[#FFD400]"
            >
              {units[category].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <div className="w-full text-4xl font-extrabold overflow-x-auto min-h-[40px]">
              {inputValue ? outputValue : "0"}
            </div>
          </div>
        </div>

      </div>
    </ToolLayout>
  );
}
