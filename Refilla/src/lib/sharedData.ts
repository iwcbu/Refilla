import { supabase } from "./supabase";

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase shared data is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return supabase;
}

export function isMissingSupabaseTableMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("could not find the table") ||
    normalized.includes("schema cache") ||
    (normalized.includes("relation") && normalized.includes("does not exist"))
  );
}

export function buildMissingTableError(tableName: string) {
  return new Error(
    `Supabase table "${tableName}" is not set up yet. Run supabase/shared_schema.sql in your Supabase project first.`
  );
}
