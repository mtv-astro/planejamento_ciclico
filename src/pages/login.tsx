import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSupabase, getSupabaseConfigError } from "@/lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const configError = getSupabaseConfigError();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

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

  return (
    <main className="min-h-screen bg-offwhite-leve flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.18em] text-lilas-mistico mb-3">Planejamento Ciclico</p>
        <h1 className="text-3xl font-atteron text-gray-900 mb-2">Entrar na Galeria de Mapas</h1>
        <p className="text-sm text-muted-foreground mb-6">Acesse seu banco de mapas e suas imagens salvas.</p>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-lilas-mistico text-white py-2.5 font-medium hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
