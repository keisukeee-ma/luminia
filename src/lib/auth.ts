"use client";

import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email?: string;
}

export async function sendMagicLink(email: string): Promise<{ error: string | null }> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/mypage` },
  });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ? { id: session.user.id, email: session.user.email } : null;
}

/** auth状態の変化を監視する。返り値はunsubscribe関数。 */
export function onAuthChange(cb: (user: AuthUser | null) => void): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ? { id: session.user.id, email: session.user.email } : null);
  });
  return () => subscription.unsubscribe();
}
