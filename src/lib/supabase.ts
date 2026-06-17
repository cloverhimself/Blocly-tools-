import { createClient, type SupabaseClient } from "@supabase/supabase-js";
export { toolId } from "./toolId";

// These are injected at build time by Vite. The app works fully without them
// (all tools enabled, analytics fall back to local-only); admin features simply
// stay disabled until you configure the keys.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// The single email allowed into the admin dashboard. Set VITE_ADMIN_EMAIL.
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.toLowerCase() || "";

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

