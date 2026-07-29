// Canonical list of every tool, grouped by section. This is the source of
// truth the admin dashboard uses to toggle tools on/off. The display names here
// MUST match the names used in Home.tsx, because the stable tool id is derived
// from the name (see `toolId` in supabase.ts).
//
// Derived from src/registry/tools.ts so this list can't drift from the
// homepage's data again — do not hand-edit entries here, edit the registry.
import { toolRegistry, CATEGORY_ORDER } from "../registry/tools";

export type CatalogTool = { name: string };
export type CatalogSection = { category: string; tools: CatalogTool[] };

function buildToolCatalog(): CatalogSection[] {
  const byCategory = new Map<string, CatalogTool[]>();
  for (const tool of Object.values(toolRegistry)) {
    if (!byCategory.has(tool.category)) byCategory.set(tool.category, []);
    byCategory.get(tool.category)!.push({ name: tool.name });
  }

  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => byCategory.has(c)),
    ...[...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
  ];

  return orderedCategories.map((category) => ({
    category,
    tools: byCategory.get(category)!,
  }));
}

export const TOOL_CATALOG: CatalogSection[] = buildToolCatalog();
