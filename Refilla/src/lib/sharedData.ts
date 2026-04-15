import { supabase } from "./supabase";

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase shared data is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return supabase;
}
