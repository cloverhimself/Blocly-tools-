import { createClient, type SupabaseClient } from "@supabase/supabase-js";
export { toolId } from "./toolId";

// These are injected at build time by the frontend framework. The app works fully without them
// (all tools enabled, analytics fall back to local-only); admin features simply
// stay disabled until you configure the keys.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// The single email allowed into the admin dashboard. Set VITE_ADMIN_EMAIL.
export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || "").toLowerCase();

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
