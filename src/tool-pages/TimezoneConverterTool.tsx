import { useMemo, useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Clock, ArrowRight } from "lucide-react";

// Offset (minutes) of a time zone at a given instant.
function zoneOffset(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p: any = {};
  for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return (asUTC - date.getTime()) / 60000;
}

// Interpret a wall-clock datetime string as being in `zone`, return the instant.
function zonedToInstant(local: string, zone: string): Date {
  const [datePart, timePart] = local.split("T");
  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);
  let ts = Date.UTC(y, mo - 1, d, h, mi);
  const offset = zoneOffset(zone, new Date(ts));
  return new Date(ts - offset * 60000);
}

function fmt(date: Date, zone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: zone,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function offsetLabel(zone: string, date: Date): string {
  const m = zoneOffset(zone, date);
  const sign = m >= 0 ? "+" : "-";
  const a = Math.abs(m);
  return `UTC${sign}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`;
}

const FALLBACK_ZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Los_Angeles", "America/Sao_Paulo",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow", "Africa/Lagos",
  "Africa/Johannesburg", "Africa/Cairo", "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai",
  "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney", "Pacific/Auckland",
];

function nowLocalInput(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TimezoneConverterTool() {
  const allZones = useMemo<string[]>(() => {
    try {
      // @ts-ignore - supportedValuesOf is widely available in modern browsers
      const z = Intl.supportedValuesOf?.("timeZone");
      return z && z.length ? z : FALLBACK_ZONES;
    } catch {
      return FALLBACK_ZONES;
    }
  }, []);

  const localZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);
  const [when, setWhen] = useState(nowLocalInput());
  const [from, setFrom] = useState(localZone);
  const [to, setTo] = useState("UTC");

  const instant = useMemo(() => {
    try {
      return zonedToInstant(when, from);
    } catch {
      return null;
    }
  }, [when, from]);

  const worldZones = ["UTC", "America/New_York", "Europe/London", "Asia/Dubai", "Asia/Kolkata", "Asia/Tokyo"];

  return (
    <ToolLayout
      title="Timezone Converter"
      description="Convert a date and time between any two time zones, and see it across major cities at a glance."
      category="Everyday Tools"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white border border-[#111111]/10 rounded-sm p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/55 mb-1.5">Date and time</label>
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="w-full px-4 py-3 border border-[#111111]/15 rounded-sm focus:outline-none focus:border-[#FFD400]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <ZoneSelect label="From" value={from} onChange={setFrom} zones={allZones} />
            <div className="hidden sm:flex justify-center pb-3 text-[#111111]/40">
              <ArrowRight className="w-5 h-5" />
            </div>
            <ZoneSelect label="To" value={to} onChange={setTo} zones={allZones} />
          </div>
        </div>

        {instant && (
          <div className="bg-[#FFD400]/10 border border-[#FFD400]/50 rounded-sm p-6 text-center">
            <p className="text-sm text-[#111111]/55 mb-1">{to} ({offsetLabel(to, instant)})</p>
            <p className="text-2xl font-extrabold">{fmt(instant, to)}</p>
          </div>
        )}

        {instant && (
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111]/55 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Around the world
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {worldZones.map((z) => (
                <div key={z} className="flex items-center justify-between p-3 border border-[#111111]/10 rounded-sm bg-white">
                  <span className="text-sm font-medium truncate">{z.replace(/_/g, " ")}</span>
                  <span className="text-sm text-[#111111]/70 font-mono">{fmt(instant, z)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

function ZoneSelect({ label, value, onChange, zones }: { label: string; value: string; onChange: (v: string) => void; zones: string[] }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-[#111111]/55 mb-1.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-[#111111]/15 rounded-sm bg-white focus:outline-none focus:border-[#FFD400]"
      >
        {zones.map((z) => (
          <option key={z} value={z}>
            {z.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
