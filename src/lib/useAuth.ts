import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured, ADMIN_EMAIL } from "./supabase";

export type AuthState = {
  session: Session | null;
  email: string | null;
  isAdmin: boolean;
  loading: boolean;
  configured: boolean;
};

// Subscribes to the Supabase auth session and exposes whether the current user
// is the configured admin.
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const email = session?.user?.email?.toLowerCase() || null;
  const isAdmin = Boolean(email && ADMIN_EMAIL && email === ADMIN_EMAIL);

  return { session, email, isAdmin, loading, configured: isSupabaseConfigured };
}

// Sends a one-time magic link to the admin email (passwordless login).
export async function signInWithMagicLink(emailInput: string): Promise<void> {
  if (!supabase) throw new Error("Login is not configured yet.");
  const { error } = await supabase.auth.signInWithOtp({
    email: emailInput,
    options: { emailRedirectTo: `${window.location.origin}/dashboard` },
  });
  if (error) throw error;
}

// Optional password login for admins who set a password in Supabase.
export async function signInWithPassword(emailInput: string, password: string): Promise<void> {
  if (!supabase) throw new Error("Login is not configured yet.");
  const { error } = await supabase.auth.signInWithPassword({ email: emailInput, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
