import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PrivateTopbar from "@/components/PrivateTopbar";
import { callFunction } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";

type CurrentUser = {
  email?: string | null;
  username?: string | null;
  display_name?: string | null;
};

type ModulePlaceholderProps = {
  title: string;
  kicker: string;
  description: string;
  items: string[];
};

const THEME_KEY = "pc-gallery-theme";

export default function ModulePlaceholderPage({ title, kicker, description, items }: ModulePlaceholderProps) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(THEME_KEY) === "dark";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    }
  }, [isDark]);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const data = await callFunction("get-current-user");
        setCurrentUser(data.user || null);
      } catch {
        setCurrentUser(null);
      }
    }

    loadCurrentUser();
  }, []);

  async function handleSignOut() {
    const supabase = getSupabase();
    if (!supabase) {
      navigate("/login", { replace: true });
      return;
    }

    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  const pageClass = isDark ? "bg-slate-950 text-slate-100" : "bg-offwhite-leve text-gray-900";
  const panelClass = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-black/10 bg-white text-gray-900";
  const subtleClass = isDark ? "text-slate-400" : "text-muted-foreground";

  return (
    <main className={`min-h-screen px-4 py-6 md:px-6 ${pageClass}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <PrivateTopbar
          user={currentUser}
          isDark={isDark}
          onToggleTheme={() => setIsDark((value) => !value)}
          onSignOut={handleSignOut}
          kicker="Escritorio de Planejamento Ciclico"
          title={title}
        />

        <section className={`rounded-[2rem] border p-6 shadow-sm md:p-10 ${panelClass}`}>
          <p className="text-xs uppercase tracking-[0.22em] text-lilas-mistico">{kicker}</p>
          <h1 className="mt-3 text-4xl font-atteron md:text-6xl">{title}</h1>
          <p className={`mt-4 max-w-3xl text-base md:text-lg ${subtleClass}`}>{description}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {items.map((item) => (
              <article key={item} className={`rounded-3xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-gray-50"}`}>
                <span className="text-sm">{item}</span>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/app" className="rounded-full bg-lilas-mistico px-5 py-3 text-sm font-medium text-white">
              Voltar ao Escritorio
            </Link>
            <Link to="/galeria" className={`rounded-full border px-5 py-3 text-sm font-medium ${isDark ? "border-white/10" : "border-black/10"}`}>
              Abrir Galeria de Mapas
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
