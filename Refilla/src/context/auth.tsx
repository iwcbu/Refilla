import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createUser,
  getUser,
  getUserByUsername,
  listUsers,
  type UserRow,
} from "../db/userRepo";
import { PROFILE_EMOJIS } from "../features/account/profileEmojis";

const CURRENT_USER_STORAGE_KEY = "currentUserId";
const SIGNED_OUT_STORAGE_VALUE = "signed_out";

type CreateAccountResult =
  | { ok: true; user: UserRow }
  | { ok: false; error: string };

type AuthContextValue = {
  currentUser: UserRow | null;
  isReady: boolean;
  signIn: (userId: number) => Promise<void>;
  signOut: () => Promise<void>;
  createAccount: (username: string) => Promise<CreateAccountResult>;
  refreshCurrentUser: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  isReady: false,
  signIn: async () => {},
  signOut: async () => {},
  createAccount: async () => ({ ok: false, error: "Auth context unavailable." }),
  refreshCurrentUser: () => {},
});

function normalizeUsername(username: string) {
  return username.trim().replace(/^@+/, "").replace(/\s+/g, "_");
}

function buildStarterUsername(existingUsers: UserRow[]) {
  const taken = new Set(existingUsers.map((user) => user.username.toLowerCase()));
  const base = "refilla_user";

  if (!taken.has(base)) {
    return base;
  }

  let suffix = 2;
  while (taken.has(`${base}_${suffix}`)) {
    suffix += 1;
  }

  return `${base}_${suffix}`;
}

function pickStarterEmoji(existingUsers: UserRow[]) {
  return PROFILE_EMOJIS[existingUsers.length % PROFILE_EMOJIS.length] ?? "🙂";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const storedValue = await AsyncStorage.getItem(CURRENT_USER_STORAGE_KEY);
      const existingUsers = listUsers();

      if (!mounted) {
        return;
      }

      if (storedValue === SIGNED_OUT_STORAGE_VALUE) {
        setCurrentUserId(null);
        setIsReady(true);
        return;
      }

      if (storedValue != null) {
        const parsedUserId = Number(storedValue);
        const storedUser = Number.isFinite(parsedUserId) ? getUser(parsedUserId) : null;

        if (storedUser) {
          setCurrentUserId(storedUser.id);
          setIsReady(true);
          return;
        }
      }

      const fallbackUserId =
        existingUsers[0]?.id ??
        createUser(buildStarterUsername(existingUsers), pickStarterEmoji(existingUsers));

      await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, String(fallbackUserId));

      if (!mounted) {
        return;
      }

      setCurrentUserId(fallbackUserId);
      setIsReady(true);
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  const currentUser = useMemo(() => {
    if (currentUserId == null) {
      return null;
    }

    return getUser(currentUserId);
  }, [currentUserId, revision]);

  const signIn = async (userId: number) => {
    await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, String(userId));
    setCurrentUserId(userId);
    setRevision((value) => value + 1);
  };

  const signOut = async () => {
    await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, SIGNED_OUT_STORAGE_VALUE);
    setCurrentUserId(null);
    setRevision((value) => value + 1);
  };

  const createAccount = async (username: string): Promise<CreateAccountResult> => {
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername) {
      return { ok: false, error: "Enter a username to create a profile." };
    }

    const existingUsers = listUsers();

    if (existingUsers.length >= 2) {
      return {
        ok: false,
        error: "This device can only have up to 2 local profiles.",
      };
    }

    if (getUserByUsername(normalizedUsername)) {
      return { ok: false, error: "That username is already taken." };
    }

    const userId = createUser(normalizedUsername, pickStarterEmoji(existingUsers));
    const user = getUser(userId);

    if (!user) {
      return { ok: false, error: "Could not create that profile." };
    }

    await signIn(user.id);
    return { ok: true, user };
  };

  const refreshCurrentUser = () => {
    setRevision((value) => value + 1);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isReady,
        signIn,
        signOut,
        createAccount,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
