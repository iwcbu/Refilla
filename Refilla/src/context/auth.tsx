import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { PROFILE_EMOJIS } from "../features/account/profileEmojis";
import { requireSupabase } from "../lib/sharedData";
import {
  getUserByAuthId,
  syncProfiles,
  type UserRow,
  upsertUserProfile,
} from "../db/userRepo";

type AuthResult =
  | { ok: true; user: UserRow }
  | { ok: false; error: string };

type AuthContextValue = {
  currentUser: UserRow | null;
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  createAccount: (input: {
    email: string;
    password: string;
    username: string;
  }) => Promise<AuthResult>;
  refreshCurrentUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  isReady: false,
  signIn: async () => ({ ok: false, error: "Auth context unavailable." }),
  signOut: async () => {},
  createAccount: async () => ({ ok: false, error: "Auth context unavailable." }),
  refreshCurrentUser: async () => {},
});

function normalizeUsername(username: string) {
  return username.trim().replace(/^@+/, "").replace(/\s+/g, "_");
}

function pickStarterEmoji(indexHint = 0) {
  return PROFILE_EMOJIS[indexHint % PROFILE_EMOJIS.length] ?? "🙂";
}

function buildFallbackUsername(email: string) {
  const localPart = email.split("@")[0]?.trim();
  return normalizeUsername(localPart || "refilla_user");
}

async function ensureCurrentProfile(authUserId: string, email?: string | null) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUserId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return upsertUserProfile({
      auth_user_id: data.id,
      username: data.username,
      avatar_emoji: data.avatar_emoji ?? "🙂",
      points: data.points ?? 0,
      created_at: data.created_at ?? null,
      updated_at: data.updated_at ?? null,
    });
  }

  const username = buildFallbackUsername(email ?? "");
  const { data: created, error: createError } = await supabase
    .from("profiles")
    .insert({
      id: authUserId,
      username,
      avatar_emoji: pickStarterEmoji(0),
      points: 0,
    })
    .select("*")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return upsertUserProfile({
    auth_user_id: created.id,
    username: created.username,
    avatar_emoji: created.avatar_emoji ?? "🙂",
    points: created.points ?? 0,
    created_at: created.created_at ?? null,
    updated_at: created.updated_at ?? null,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const supabase = requireSupabase();
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        if (mounted) {
          setCurrentUser(null);
          setIsReady(true);
        }
        return;
      }

      if (!data.session?.user) {
        if (mounted) {
          setCurrentUser(null);
          setIsReady(true);
        }
        return;
      }

      await syncProfiles();
      const user = await ensureCurrentProfile(data.session.user.id, data.session.user.email);

      if (mounted) {
        setCurrentUser(user);
        setIsReady(true);
      }
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setCurrentUser(null);
        setIsReady(true);
        return;
      }

      void syncProfiles()
        .then(() => ensureCurrentProfile(session.user.id, session.user.email))
        .then((user) => {
          if (mounted) {
            setCurrentUser(user);
            setIsReady(true);
          }
        })
        .catch((error) => {
          console.log("Could not refresh profile session", error);
          if (mounted) {
            setIsReady(true);
          }
        });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const supabase = requireSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    const user = await ensureCurrentProfile(data.user.id, data.user.email);
    setCurrentUser(user);
    return { ok: true, user };
  };

  const signOut = async () => {
    const supabase = requireSupabase();
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const createAccount = async (input: {
    email: string;
    password: string;
    username: string;
  }): Promise<AuthResult> => {
    const supabase = requireSupabase();
    const normalizedUsername = normalizeUsername(input.username);
    const normalizedEmail = input.email.trim().toLowerCase();

    if (!normalizedEmail) {
      return { ok: false, error: "Enter an email to create a profile." };
    }

    if (!input.password) {
      return { ok: false, error: "Enter a password to create a profile." };
    }

    if (!normalizedUsername) {
      return { ok: false, error: "Enter a username to create a profile." };
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: input.password,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    if (!data.user) {
      return {
        ok: false,
        error: "Profile sign-up was started, but no user session was returned.",
      };
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        username: normalizedUsername,
        avatar_emoji: pickStarterEmoji(0),
        points: 0,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (profileError) {
      return { ok: false, error: profileError.message };
    }

    const user = upsertUserProfile({
      auth_user_id: profileData.id,
      username: profileData.username,
      avatar_emoji: profileData.avatar_emoji ?? "🙂",
      points: profileData.points ?? 0,
      created_at: profileData.created_at ?? null,
      updated_at: profileData.updated_at ?? null,
    });

    setCurrentUser(user);
    return { ok: true, user };
  };

  const refreshCurrentUser = async () => {
    if (!currentUser?.auth_user_id) {
      return;
    }

    await syncProfiles();
    const nextUser = getUserByAuthId(currentUser.auth_user_id);
    setCurrentUser(nextUser);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isReady,
      signIn,
      signOut,
      createAccount,
      refreshCurrentUser,
    }),
    [currentUser, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
