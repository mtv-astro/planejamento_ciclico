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
  };
}

export async function callFunction(path: string, body: Record<string, unknown> = {}) {
  const headers = await getHeaders();
  const response = await fetch(`/api/${path}`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
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

export async function fetchFunctionBlob(path: string, body: Record<string, unknown> = {}) {
  const headers = await getHeaders();
  const response = await fetch(`/api/${path}`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }
    throw new Error(data?.message || data?.error || `Function ${path} failed`);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition") || "";
  const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);

  return {
    blob,
    filename: filenameMatch?.[1] || "download.bin",
    mimeType: response.headers.get("Content-Type") || blob.type || "application/octet-stream",
  };
}
