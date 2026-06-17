// Stable id for a tool, derived from its display name. Kept in its own module
// (no Supabase import) so pages can use it without pulling the auth client into
// their initial bundle.
export function toolId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
