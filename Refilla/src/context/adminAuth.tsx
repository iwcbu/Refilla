import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { hasSupabaseConfig, supabase } from "../lib/supabase";

type AdminSignInResult =
  | { ok: true }
  | { ok: false; error: string };

type AdminAuthContextValue = {
  adminUser: User | null;
  adminSession: Session | null;
  isReady: boolean;
  isConfigured: boolean;
  isAdminSignedIn: boolean;
  signInWithPassword: (email: string, password: string) => Promise<AdminSignInResult>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue>({
  adminUser: null,
  adminSession: null,
  isReady: false,
  isConfigured: hasSupabaseConfig,
  isAdminSignedIn: false,
  signInWithPassword: async () => ({
    ok: false,
    error: "Admin auth is unavailable.",
  }),
  signOut: async () => {},
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAllowedAdminEmails() {
  return (process.env.EXPO_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email: string) => normalizeEmail(email))
    .filter(Boolean);
}

function isAllowedAdmin(user: User | null) {
  if (!user?.email) {
    return false;
  }

  const allowedEmails = getAllowedAdminEmails();
  if (allowedEmails.length === 0) {
    return true;
  }

  return allowedEmails.includes(normalizeEmail(user.email));
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminSession, setAdminSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(!hasSupabaseConfig);

  useEffect(() => {
    if (!supabase) {
      setIsReady(true);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setAdminSession(isAllowedAdmin(data.session?.user ?? null) ? data.session : null);
      setIsReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminSession(isAllowedAdmin(session?.user ?? null) ? session : null);
      setIsReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (
    email: string,
    password: string
  ): Promise<AdminSignInResult> => {
    if (!supabase) {
      return {
        ok: false,
        error: "Supabase admin auth is not configured yet.",
      };
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      return {
        ok: false,
        error: "Enter your admin email and password.",
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    if (!isAllowedAdmin(data.user)) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error: "That user is not allowed to access admin tools.",
      };
    }

    return { ok: true };
  };

  const signOut = async () => {
    if (!supabase) {
      setAdminSession(null);
      return;
    }

    await supabase.auth.signOut();
    setAdminSession(null);
  };

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      adminUser: adminSession?.user ?? null,
      adminSession,
      isReady,
      isConfigured: hasSupabaseConfig,
      isAdminSignedIn: !!adminSession?.user,
      signInWithPassword,
      signOut,
    }),
    [adminSession, isReady]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
