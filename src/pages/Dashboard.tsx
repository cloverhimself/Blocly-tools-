import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Activity, BarChart2, PieChart as PieChartIcon, Lock, LogOut, Power, Loader2, ShieldCheck } from "lucide-react";
import { useAuth, signInWithMagicLink, signInWithPassword, signOut } from "../lib/useAuth";
import { isSupabaseConfigured, ADMIN_EMAIL, toolId } from "../lib/supabase";
import { fetchAnalytics, fetchAllToolSettings, setToolEnabled, type ToolStat } from "../lib/analytics";
import { TOOL_CATALOG } from "../lib/toolsCatalog";

const COLORS = ["#FFD400", "#111111", "#444444", "#777777", "#AAAAAA", "#CCCCCC"];

// ---- Login screen -----------------------------------------------------------
function AdminLogin() {
  const [email, setEmail] = useState(ADMIN_EMAIL || "");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      if (mode === "magic") {
        await signInWithMagicLink(email);
        setStatus("Check your inbox for a secure login link.");
      } else {
        await signInWithPassword(email, password);
      }
    } catch (e: any) {
      setError(e?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white border border-[#111111]/10 rounded-sm p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#111111] flex items-center justify-center rounded-sm">
          <Lock className="w-5 h-5 text-[#FFD400]" />
        </div>
        <div>
          <h1 className="font-extrabold text-xl">Admin Access</h1>
          <p className="text-sm text-[#111111]/55">Sign in to view analytics and manage tools.</p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-[#111111]/15 rounded-sm focus:outline-none focus:border-[#FFD400]"
        />
        {mode === "password" && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full px-4 py-2.5 border border-[#111111]/15 rounded-sm focus:outline-none focus:border-[#FFD400]"
          />
        )}

        <button
          onClick={submit}
          disabled={busy || !email}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFD400] text-[#111111] font-bold rounded-sm hover:brightness-95 transition disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {mode === "magic" ? "Send magic link" : "Sign in"}
        </button>

        <button
          onClick={() => {
            setMode(mode === "magic" ? "password" : "magic");
            setError(null);
            setStatus(null);
          }}
          className="w-full text-center text-xs text-[#111111]/50 hover:text-[#111111] underline"
        >
          {mode === "magic" ? "Use a password instead" : "Use a magic link instead"}
        </button>
      </div>

      {status && <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-100 p-3 rounded-sm">{status}</p>}
      {error && <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-sm">{error}</p>}
    </div>
  );
}

// ---- Tool management --------------------------------------------------------
function ToolManager() {
  const [settings, setSettings] = useState<Map<string, boolean>>(new Map());
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllToolSettings().then(setSettings).catch(() => {});
  }, []);

  const isEnabled = (id: string) => settings.get(id) !== false; // default enabled
  const toggle = async (name: string) => {
    const id = toolId(name);
    const next = !isEnabled(id);
    setSaving(id);
    setError(null);
    try {
      await setToolEnabled(id, next);
      setSettings((prev) => new Map(prev).set(id, next));
    } catch (e: any) {
      setError(e?.message || "Could not update tool.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="bg-white border border-[#111111]/10 rounded-sm">
      <div className="p-6 border-b border-[#111111]/10 flex items-center gap-2">
        <Power className="w-5 h-5 text-[#FFD400]" />
        <h2 className="text-lg font-bold">Manage Tools</h2>
        <span className="text-sm text-[#111111]/50">— disable a tool to hide/grey it out for everyone</span>
      </div>
      {error && <div className="px-6 pt-4 text-sm text-red-600">{error}</div>}
      <div className="p-6 space-y-6">
        {TOOL_CATALOG.map((section) => (
          <div key={section.category}>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111]/50 mb-3">{section.category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {section.tools.map((t) => {
                const id = toolId(t.name);
                const enabled = isEnabled(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggle(t.name)}
                    disabled={saving === id}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 border rounded-sm text-sm text-left transition ${
                      enabled
                        ? "border-[#111111]/15 bg-white hover:border-[#FFD400]"
                        : "border-red-200 bg-red-50 text-[#111111]/50"
                    }`}
                  >
                    <span className="truncate">{t.name}</span>
                    {saving === id ? (
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    ) : (
                      <span
                        className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                          enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {enabled ? "On" : "Off"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Analytics --------------------------------------------------------------
function Analytics() {
  const [stats, setStats] = useState<ToolStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "local">("supabase");

  useEffect(() => {
    (async () => {
      try {
        const remote = await fetchAnalytics();
        if (remote) {
          setStats(remote.stats);
          setTotal(remote.total);
        } else {
          // Local fallback (this device only)
          setSource("local");
          const raw = localStorage.getItem("tools_usage_stats");
          const parsed = raw ? JSON.parse(raw) : {};
          const local: ToolStat[] = Object.keys(parsed)
            .map((name) => ({ tool_id: toolId(name), name, count: parsed[name] as number }))
            .sort((a, b) => b.count - a.count);
          setStats(local);
          setTotal(local.reduce((a, s) => a + s.count, 0));
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const top5 = stats.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#111111]/50 p-12 justify-center">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading analytics…
      </div>
    );
  }

  return (
    <>
      {source === "local" && (
        <div className="mb-6 text-sm bg-[#FFF9E6] border border-[#FFD400]/40 p-3 rounded-sm text-[#111111]/70">
          Showing <strong>local</strong> stats from this device only. Configure Supabase to see real cross-user analytics.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-[#111111]/10 rounded-sm p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 text-[#111111]/60">
            <Activity className="w-5 h-5" />
            <h2 className="m-0 text-[14px] font-semibold uppercase tracking-wider">Total Tool Opens</h2>
          </div>
          <p className="text-4xl md:text-5xl font-bold">{total}</p>
        </div>
        <div className="bg-white border border-[#111111]/10 rounded-sm p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 text-[#111111]/60">
            <BarChart2 className="w-5 h-5" />
            <h2 className="m-0 text-[14px] font-semibold uppercase tracking-wider">Unique Tools Used</h2>
          </div>
          <p className="text-4xl md:text-5xl font-bold">{stats.length}</p>
        </div>
      </div>

      {stats.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white border border-[#111111]/10 rounded-sm p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#FFD400]" /> Top 5 Most Used Tools
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top5} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#666" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "#F5F5F5" }} contentStyle={{ borderRadius: "2px", border: "1px solid #E5E5E5" }} />
                  <Bar dataKey="count" fill="#111111" radius={[2, 2, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white border border-[#111111]/10 rounded-sm p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#FFD400]" /> Usage Distribution
            </h2>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={top5} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="count" stroke="none">
                    {top5.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "2px", border: "1px solid #E5E5E5" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#111111]/10 rounded-sm p-12 text-center text-[#111111]/60 mb-10">
          No usage data yet. As people open tools, stats will appear here.
        </div>
      )}

      {stats.length > 0 && (
        <div className="bg-white border border-[#111111]/10 rounded-sm overflow-hidden mb-10">
          <div className="p-6 border-b border-[#111111]/10">
            <h2 className="text-lg font-bold">Detailed Usage Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap text-[#111111]">
              <thead className="bg-[#FAFAFA] border-b border-[#111111]/10">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[#111111]/70">Tool Name</th>
                  <th className="px-6 py-4 font-semibold text-[#111111]/70">Opens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/5">
                {stats.map((stat, i) => (
                  <tr key={stat.tool_id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-[#FFD400]/10 rounded-sm text-xs font-bold font-mono">
                        {i + 1}
                      </span>
                      {stat.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono">{stat.count}</span>
                      <span className="text-[#111111]/50 ml-2">opens</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export function Dashboard() {
  const { isAdmin, email, loading, configured } = useAuth();

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-10 md:py-14">
        {/* If Supabase isn't configured yet, the dashboard still works in
            local-only mode so it's never broken — but it's clearly unsecured. */}
        {configured && loading ? (
          <div className="flex items-center gap-2 text-[#111111]/50 p-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Checking access…
          </div>
        ) : configured && !isAdmin ? (
          email ? (
            <div className="max-w-md mx-auto mt-16 bg-white border border-red-200 rounded-sm p-8 text-center">
              <Lock className="w-8 h-8 mx-auto text-red-500 mb-3" />
              <h1 className="font-bold text-lg mb-1">Not authorized</h1>
              <p className="text-sm text-[#111111]/60 mb-4">
                {email} doesn’t have admin access to this dashboard.
              </p>
              <button onClick={signOut} className="text-sm font-semibold underline">
                Sign out
              </button>
            </div>
          ) : (
            <AdminLogin />
          )
        ) : (
          <>
            <div className="mb-10 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="m-0 font-extrabold text-3xl md:text-4xl tracking-tight flex items-center gap-2">
                  Admin Dashboard
                </h1>
                <p className="mt-3 text-[#111111]/60 text-[15px] md:text-[16px]">
                  {configured ? (
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-green-600" /> Signed in as {email}
                    </span>
                  ) : (
                    "Local mode — configure Supabase to secure this and enable cross-user analytics."
                  )}
                </p>
              </div>
              {configured && (
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 text-sm font-semibold border border-[#111111]/15 px-3 py-2 rounded-sm hover:bg-[#111111]/5"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              )}
            </div>

            <Analytics />
            {configured && <ToolManager />}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
