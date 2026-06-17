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
import { Activity, BarChart2, PieChart as PieChartIcon } from "lucide-react";

export function Dashboard() {
  const [stats, setStats] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem("tools_usage_stats");
      if (data) {
        const parsed = JSON.parse(data);
        const formatted = Object.keys(parsed)
          .map((key) => ({
            name: key,
            count: parsed[key] as number,
          }))
          .sort((a, b) => b.count - a.count);
        setStats(formatted);
      }
    } catch {}
  }, []);

  const totalUsage = stats.reduce((acc, curr) => acc + curr.count, 0);
  const totalToolsUsed = stats.length;

  const top5 = stats.slice(0, 5);

  const COLORS = ["#FFD400", "#111111", "#444444", "#777777", "#AAAAAA", "#CCCCCC"];

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-10 md:py-14">
        <div className="mb-10">
          <h1 className="m-0 font-extrabold text-3xl md:text-4xl tracking-tight">
            Usage Dashboard
          </h1>
          <p className="mt-3 text-[#111111]/60 text-[15px] md:text-[16px]">
            Monitor your personal app usage locally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white border border-[#111111]/10 rounded-sm p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4 text-[#111111]/60">
              <Activity className="w-5 h-5" />
              <h2 className="m-0 text-[14px] font-semibold uppercase tracking-wider">Total Tool Views</h2>
            </div>
            <p className="text-4xl md:text-5xl font-bold">{totalUsage}</p>
          </div>
          <div className="bg-white border border-[#111111]/10 rounded-sm p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4 text-[#111111]/60">
              <BarChart2 className="w-5 h-5" />
              <h2 className="m-0 text-[14px] font-semibold uppercase tracking-wider">Unique Tools Used</h2>
            </div>
            <p className="text-4xl md:text-5xl font-bold">{totalToolsUsed}</p>
          </div>
        </div>

        {stats.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 bg-white border border-[#111111]/10 rounded-sm p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#FFD400]" />
                Top 5 Most Used Tools
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top5} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                    <Tooltip cursor={{ fill: "#F5F5F5" }} contentStyle={{ borderRadius: "2px", border: "1px solid #E5E5E5" }} />
                    <Bar dataKey="count" fill="#111111" radius={[2, 2, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-1 bg-white border border-[#111111]/10 rounded-sm p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[#FFD400]" />
                Usage Distribution
              </h2>
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={top5}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="count"
                      stroke="none"
                    >
                      {top5.map((entry, index) => (
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
          <div className="bg-white border border-[#111111]/10 rounded-sm p-12 text-center text-[#111111]/60">
            <p>No usage data available yet. Start using tools to see your stats here.</p>
          </div>
        )}

        {stats.length > 0 && (
          <div className="bg-white border border-[#111111]/10 rounded-sm overflow-hidden">
            <div className="p-6 border-b border-[#111111]/10">
              <h2 className="text-lg font-bold">Detailed Usage breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap text-[#111111]">
                <thead className="bg-[#FAFAFA] border-b border-[#111111]/10">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-[#111111]/70">Tool Name</th>
                    <th className="px-6 py-4 font-semibold text-[#111111]/70">Usage Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/5">
                  {stats.map((stat, i) => (
                    <tr key={stat.name} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-[#FFD400]/10 text-[#111111] rounded-sm text-xs font-bold font-mono">
                          {i + 1}
                        </span>
                        {stat.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono">{stat.count}</span>
                        <span className="text-[#111111]/50 ml-2">views</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
