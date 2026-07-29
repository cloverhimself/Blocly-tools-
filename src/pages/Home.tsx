import { useState, useEffect, type ReactNode } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { SearchBar } from "../components/SearchBar";
import { ToolCard } from "../components/ToolCard";
import fuzzysort from "fuzzysort";
import { toolId } from "../lib/toolId";
import { useI18n } from "../lib/i18n";
import { resolveIcon } from "../lib/icons";
import { toolRegistry, CATEGORY_ORDER } from "../registry/tools";

export function Home() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [usageStats, setUsageStats] = useState<Record<string, number>>(() => {
    try {
      const data = localStorage.getItem("tools_usage_stats");
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  });

  // Admin-disabled tools (greyed out for everyone). Empty when Supabase is
  // not configured, so all tools stay visible.
  const [disabledTools, setDisabledTools] = useState<Set<string>>(new Set());
  useEffect(() => {
    // Loaded async (separate chunk) so the Supabase client never blocks first paint.
    import("../lib/analytics")
      .then((m) => m.fetchDisabledTools())
      .then(setDisabledTools)
      .catch(() => {});
  }, []);

  const trackUsage = (name: string) => {
    // Local stat immediately (for popularity); Supabase event fire-and-forget.
    setUsageStats((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
    import("../lib/analytics").then((m) => m.trackToolOpen(name)).catch(() => {});
  };

  const rawCategories = (() => {
    const byCategory = new Map<
      string,
      { name: string; desc: string; icon: ReactNode; to: string; keywords: string[] }[]
    >();
    for (const tool of Object.values(toolRegistry)) {
      if (!byCategory.has(tool.category)) byCategory.set(tool.category, []);
      byCategory.get(tool.category)!.push({
        name: tool.name,
        desc: tool.description,
        icon: resolveIcon(tool.iconName),
        to: tool.route,
        keywords: tool.keywords,
      });
    }

    const orderedCategories = [
      ...CATEGORY_ORDER.filter((c) => byCategory.has(c)),
      ...[...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
    ];

    return orderedCategories.map((category) => ({
      name: category,
      tools: byCategory.get(category)!,
    }));
  })();

  const q = query.trim();
  let searchResultsDropdown: { category: string; items: any[] }[] = [];

  let totalTools = 0;
  let shownTools = 0;

  const allToolsFlat = rawCategories.flatMap((c) => c.tools);

  // Build recommended tools based on usage and some default featured things
  const popularTools = [...allToolsFlat]
    .filter((a) => (usageStats[a.name] || 0) > 0)
    .sort((a, b) => {
      const countA = usageStats[a.name] || 0;
      const countB = usageStats[b.name] || 0;
      return countB - countA;
    })
    .slice(0, 4);

  const popularToolNames = new Set(popularTools.map((t) => t.name));

  let categories = rawCategories.map((cat) => {
    totalTools += cat.tools.length;
    let filteredTools = cat.tools;

    if (q) {
      // Search logic handled below for dropdown.
      // In grid, we just hide sections if needed (currently we don't hide grid on search, we have dropdown)
    }
    return {
      ...cat,
      count:
        filteredTools.length === 1
          ? "1 tool"
          : `${filteredTools.length} tools`,
      tools: filteredTools.map(t => ({
        ...t,
        featured: popularToolNames.has(t.name)
      })),
    };
  });

  if (popularTools.length > 0) {
    categories.unshift({
      name: t("recommended"),
      count: "Top picks",
      tools: popularTools.map(t => ({ ...t, featured: true })),
    });
  }

  if (q) {
    const allTools = rawCategories.flatMap((c) =>
      c.tools.map((t) => ({ ...t, category: c.name, keywordsStr: t.keywords?.join(" ") || "" }))
    );

    const results = fuzzysort.go(q, allTools, {
      keys: ["name", "desc", "category", "keywordsStr"],
      threshold: -10000,
      // Give heavy weight to name matches
      scoreFn: (a) =>
        Math.max(
          a[0] ? a[0].score : -1000,
          a[1] ? a[1].score - 100 : -1000,
          a[2] ? a[2].score - 200 : -1000,
          a[3] ? a[3].score - 50 : -1000
        ),
    });

    const matchedTools = results.map((r) => r.obj);
    shownTools = matchedTools.length;

    // Group for dropdown
    const groups = new Map<string, any[]>();
    matchedTools.forEach((t) => {
      if (!groups.has(t.category)) groups.set(t.category, []);
      groups
        .get(t.category)!
        .push({ name: t.name, desc: t.desc, to: t.to, category: t.category });
    });
    searchResultsDropdown = Array.from(groups.entries()).map(
      ([category, items]) => ({ category, items })
    );
  } else {
    shownTools = totalTools;
  }

  const isSearching = q.length > 0;

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-5 py-10 md:py-14">
          <h1 className="m-0 font-extrabold text-4xl md:text-6xl leading-[1.02] tracking-[-0.035em] max-w-[20ch]">
            {t("heroA")}{" "}
            <span className="border-b-[0.16em] border-[#FFD400] pb-[0.02em]">
              {t("heroB")}
            </span>
          </h1>
          <p className="mt-6 text-[16px] md:text-[17px] leading-relaxed text-[#111111]/60 max-w-[54ch]">
            {t("heroSub")}
          </p>

          <div className="mt-8 max-w-[560px]">
            <SearchBar
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search", { n: totalTools })}
              countLabel={isSearching ? t("found", { n: shownTools }) : t("toolsCount", { n: totalTools })}
              results={searchResultsDropdown}
              onSelect={trackUsage}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
          {categories.map((cat, i) => {
            // Let the page show all categories by default on the grid
            return (
              <div key={i} className="mb-10 last:mb-0">
                <div className="flex items-center gap-3.5 mb-5">
                  <h2 className="m-0 text-[17px] font-extrabold tracking-[-0.01em]">
                    {cat.name}
                  </h2>
                  <span className="font-mono text-[11.5px] text-[#111111]/45">
                    {cat.count}
                  </span>
                  <span className="flex-1 h-px bg-[#111111]"></span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cat.tools.map((t, j) => (
                    <ToolCard
                      key={j}
                      label={t.name}
                      desc={t.desc}
                      iconEl={t.icon}
                      featured={(t as any).featured}
                      to={t.to}
                      disabled={(t as any).disabled || disabledTools.has(toolId(t.name))}
                      cloud={(t as any).cloud}
                      onClick={() => trackUsage(t.name)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
