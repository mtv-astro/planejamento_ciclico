import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rwrukwznfpgreqiogcju.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_XogjtSgMX49nhCixpPGKtg_V1ZVZsY1";

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseAnonKey) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}

export function getSupabaseConfigError() {
  if (!supabaseAnonKey) {
    return "Missing VITE_SUPABASE_ANON_KEY";
  }

  return null;
}
