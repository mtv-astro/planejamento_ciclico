import { getSupabase, getSupabaseConfigError } from "./supabase";

async function getHeaders() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error(getSupabaseConfigError() || "Supabase nao configurado.");
  }

  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error("No active session");
  }

  return {
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function callFunction(path: string, body: Record<string, unknown> = {}) {
  const headers = await getHeaders();
  const response = await fetch(`/api/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Function ${path} failed`);
  }

  return data;
}
