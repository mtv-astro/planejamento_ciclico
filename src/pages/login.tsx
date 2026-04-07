import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSupabase, getSupabaseConfigError } from "@/lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const configError = getSupabaseConfigError();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      setError(getSupabaseConfigError() || "Supabase nao configurado.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    window.localStorage.setItem("pc:last-email", email);

    const from = ((location.state as { from?: string } | null)?.from) || "/explorer";
    navigate(from, { replace: true });
  }

  async function handlePasswordReset() {
    setError("");
    setNotice("");

    if (!email.trim()) {
      setError("Informe seu email para receber o link de redefinicao de senha.");
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setError(getSupabaseConfigError() || "Supabase nao configurado.");
      return;
    }

    setResetLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    setResetLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setNotice("Enviamos um link de redefinicao para o email informado.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-offwhite-leve px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-lilas-mistico sm:text-sm sm:tracking-[0.18em]">Planejamento Ciclico</p>
        <h1 className="mb-2 text-2xl font-atteron leading-tight text-gray-900 sm:text-3xl">Entrar na Galeria de Planejamento Ciclico</h1>
        <p className="mb-6 text-sm leading-6 text-muted-foreground">Acesse seu banco de mapas e suas imagens salvas.</p>

        {configError ? <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 mb-4">{configError}</div> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-lilas-mistico"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-lilas-mistico"
            />
          </div>

          {error ? <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div> : null}
          {notice ? <div className="rounded-lg bg-lilas-mistico/10 text-lilas-mistico text-sm px-3 py-2">{notice}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-lilas-mistico text-white py-2.5 font-medium hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={resetLoading}
            className="w-full rounded-lg border border-black/10 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            {resetLoading ? "Enviando..." : "Esqueci minha senha"}
          </button>
        </form>
      </div>
    </main>
  );
}
