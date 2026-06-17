import { supabase, isSupabaseConfigured, toolId } from "./supabase";

// ---------------------------------------------------------------------------
// Usage tracking
// ---------------------------------------------------------------------------

// Local fallback so "Recommended & Popular" works offline / without Supabase.
function bumpLocal(name: string) {
  try {
    const raw = localStorage.getItem("tools_usage_stats");
    const stats = raw ? JSON.parse(raw) : {};
    stats[name] = (stats[name] || 0) + 1;
    localStorage.setItem("tools_usage_stats", JSON.stringify(stats));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

// Record that a tool was opened. Fire-and-forget; never blocks navigation.
export function trackToolOpen(name: string) {
  bumpLocal(name);
  if (!isSupabaseConfigured || !supabase) return;
  // Don't await — analytics must not slow the UI.
  supabase
    .from("tool_events")
    .insert({ tool_id: toolId(name), tool_name: name })
    .then(() => {}, () => {});
}

// ---------------------------------------------------------------------------
// Tool enable/disable (admin-controlled, read by everyone)
// ---------------------------------------------------------------------------

let disabledCache: Set<string> | null = null;

// Returns the set of disabled tool ids. Cached for the session; falls back to
// "nothing disabled" if Supabase isn't configured or the request fails.
export async function fetchDisabledTools(force = false): Promise<Set<string>> {
  if (disabledCache && !force) return disabledCache;
  if (!isSupabaseConfigured || !supabase) {
    disabledCache = new Set();
    return disabledCache;
  }
  try {
    const { data, error } = await supabase
      .from("tool_settings")
      .select("tool_id, enabled")
      .eq("enabled", false);
    if (error) throw error;
    disabledCache = new Set((data || []).map((r: any) => r.tool_id));
  } catch {
    disabledCache = new Set();
  }
  return disabledCache;
}

export type ToolSetting = { tool_id: string; enabled: boolean };

export async function fetchAllToolSettings(): Promise<Map<string, boolean>> {
  const map = new Map<string, boolean>();
  if (!isSupabaseConfigured || !supabase) return map;
  const { data } = await supabase.from("tool_settings").select("tool_id, enabled");
  (data || []).forEach((r: any) => map.set(r.tool_id, r.enabled));
  return map;
}

// Admin only (enforced by RLS). Upserts the enabled flag for a tool.
export async function setToolEnabled(id: string, enabled: boolean): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase
    .from("tool_settings")
    .upsert({ tool_id: id, enabled, updated_at: new Date().toISOString() }, { onConflict: "tool_id" });
  if (error) throw error;
  disabledCache = null; // invalidate so the change is reflected immediately
}

// ---------------------------------------------------------------------------
// Analytics aggregation (admin dashboard)
// ---------------------------------------------------------------------------

export type ToolStat = { tool_id: string; name: string; count: number };

// Aggregate tool_events into per-tool counts, newest activity first.
export async function fetchAnalytics(): Promise<{ stats: ToolStat[]; total: number } | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  // Pull recent events and aggregate client-side. For very high volume you'd
  // swap this for a Postgres view / RPC, but this is plenty for a tools site.
  const { data, error } = await supabase
    .from("tool_events")
    .select("tool_id, tool_name")
    .order("created_at", { ascending: false })
    .limit(50000);
  if (error) throw error;

  const counts = new Map<string, ToolStat>();
  (data || []).forEach((r: any) => {
    const key = r.tool_id;
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { tool_id: key, name: r.tool_name || key, count: 1 });
  });

  const stats = Array.from(counts.values()).sort((a, b) => b.count - a.count);
  const total = stats.reduce((acc, s) => acc + s.count, 0);
  return { stats, total };
}
