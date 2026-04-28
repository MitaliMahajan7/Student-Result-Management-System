import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";












const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => fetchRole(s.user.id), 0);
      } else {
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchRole(s.user.id).finally(() => setLoading(false));else
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function fetchRole(uid) {
    const { data } = await supabase.
    from("user_roles").
    select("role").
    eq("user_id", uid).
    maybeSingle();
    setRole(data?.role ?? null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>);

}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}