import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

export type AuthenticatedUser = {
  id: string;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
};

type UseAuthOptions = { autoFetch?: boolean };

function mapUser(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; last_sign_in_at?: string | null }): AuthenticatedUser {
  const displayName = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null;
  return { id: user.id, openId: user.id, name: displayName, email: user.email ?? null, loginMethod: "supabase", lastSignedIn: new Date(user.last_sign_in_at ?? Date.now()) };
}

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const { data, error: sessionError } = await supabase.auth.getUser();
      if (sessionError && sessionError.name !== "AuthSessionMissingError") throw sessionError;
      setUser(data.user ? mapUser(data.user) : null);
    } catch (cause) {
      setUser(null); setError(cause instanceof Error ? cause : new Error("Session Supabase indisponible."));
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
    setUser(null); setError(null);
  }, []);

  useEffect(() => {
    if (!autoFetch) { setLoading(false); return; }
    void refresh();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, [autoFetch, refresh]);

  return { user, loading, error, isAuthenticated: useMemo(() => Boolean(user), [user]), refresh, logout };
}
