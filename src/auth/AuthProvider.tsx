import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type Role = "student" | "parent" | "teacher" | "school_admin" | "platform_admin";
export type Profile = { id: string; role: Role; full_name: string; lang: "en" | "bn"; plan: string; onboarded: boolean };

type Err = Promise<string | null>; // resolves to an error message, or null on success
type AuthCtx = {
  cloud: boolean; loading: boolean; session: Session | null; user: User | null; profile: Profile | null;
  signInEmail: (email: string, password: string) => Err;
  signUpEmail: (email: string, password: string, fullName: string, role: string) => Promise<{ error: string | null; needsConfirm: boolean }>;
  signInGoogle: () => Err;
  sendOtp: (phone: string) => Err;
  verifyOtp: (phone: string, token: string) => Err;
  resetPassword: (email: string) => Err;
  updatePassword: (password: string) => Err;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};
const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);
const NO = "Cloud accounts are not configured.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s)); // keep this callback synchronous
    return () => data.subscription.unsubscribe();
  }, []);

  const uid = session?.user.id;
  const refreshProfile = useCallback(async () => {
    if (!supabase || !uid) { setProfile(null); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, [uid]);
  useEffect(() => { refreshProfile(); }, [refreshProfile]);

  const value = useMemo<AuthCtx>(() => ({
    cloud: !!supabase, loading, session, user: session?.user ?? null, profile, refreshProfile,
    signInEmail: async (email, password) => !supabase ? NO : (await supabase.auth.signInWithPassword({ email, password })).error?.message ?? null,
    signUpEmail: async (email, password, fullName, role) => {
      if (!supabase) return { error: NO, needsConfirm: false };
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName, role }, emailRedirectTo: window.location.origin },
      });
      return { error: error?.message ?? null, needsConfirm: !error && !data.session };
    },
    signInGoogle: async () => !supabase ? NO : (await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })).error?.message ?? null,
    sendOtp: async (phone) => !supabase ? NO : (await supabase.auth.signInWithOtp({ phone })).error?.message ?? null,
    verifyOtp: async (phone, token) => !supabase ? NO : (await supabase.auth.verifyOtp({ phone, token, type: "sms" })).error?.message ?? null,
    resetPassword: async (email) => !supabase ? NO : (await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset" })).error?.message ?? null,
    updatePassword: async (password) => !supabase ? NO : (await supabase.auth.updateUser({ password })).error?.message ?? null,
    signOut: async () => { await supabase?.auth.signOut(); },
  }), [loading, session, profile, refreshProfile]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
