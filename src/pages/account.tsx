import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PrivateTopbar from "@/components/PrivateTopbar";
import { callFunction, fetchFunctionBlob, uploadFunctionForm } from "@/lib/api";
import { getSupabase, getSupabaseConfigError } from "@/lib/supabase";

type CurrentUser = {
  id: string;
  email?: string | null;
  username?: string | null;
  display_name?: string | null;
  has_avatar?: boolean | null;
  avatar_updated_at?: string | null;
};

const THEME_KEY = "pc-gallery-theme";

export default function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(THEME_KEY) === "dark";
  });
  const configError = getSupabaseConfigError();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    }
  }, [isDark]);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError("");
        const data = await callFunction("get-current-user");
        const nextUser = data.user || null;
        setUser(nextUser);
        setUsername(nextUser?.username || "");
        setDisplayName(nextUser?.display_name || "");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro carregando conta.");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function loadAvatar() {
      if (!user?.has_avatar) {
        setAvatarUrl(null);
        return;
      }

      try {
        const result = await fetchFunctionBlob("get-current-user-avatar-file");
        objectUrl = URL.createObjectURL(result.blob);
        if (!cancelled) setAvatarUrl(objectUrl);
      } catch {
        if (!cancelled) setAvatarUrl(null);
      }
    }

    loadAvatar();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [user?.has_avatar, user?.avatar_updated_at]);

  async function handleSignOut() {
    const supabase = getSupabase();
    if (!supabase) {
      navigate("/login", { replace: true });
      return;
    }

    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    setError("");
    setSuccess("");

    try {
      const data = await callFunction("update-current-user-profile", {
        username,
        display_name: displayName,
      });
      setUser(data.user || null);
      setSuccess("Dados da conta atualizados com sucesso.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro atualizando conta.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSavingAvatar(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const data = await uploadFunctionForm("upload-current-user-avatar", formData);
      setUser((current) => ({
        ...(current || data.user),
        ...data.user,
        has_avatar: true,
      }));
      setSuccess("Foto de perfil atualizada com sucesso.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro atualizando foto de perfil.");
    } finally {
      setSavingAvatar(false);
      event.target.value = "";
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setSavingPassword(true);
    setError("");
    setSuccess("");

    const supabase = getSupabase();
    if (!supabase) {
      setSavingPassword(false);
      setError(getSupabaseConfigError() || "Supabase nao configurado.");
      return;
    }

    const { error: passwordError } = await supabase.auth.updateUser({ password });
    setSavingPassword(false);

    if (passwordError) {
      setError(passwordError.message);
      return;
    }

    setPassword("");
    setSuccess("Senha atualizada com sucesso.");
  }

  const pageClass = isDark ? "bg-slate-950 text-slate-100" : "bg-offwhite-leve text-gray-900";
  const panelClass = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-black/10 bg-white text-gray-900";
  const inputClass = isDark ? "border-white/10 bg-slate-950 text-slate-100 focus:ring-lilas-mistico" : "border-black/10 bg-white text-gray-900 focus:ring-lilas-mistico";
  const subtleClass = isDark ? "text-slate-400" : "text-muted-foreground";

  return (
    <main className={`min-h-screen px-4 py-6 md:px-6 ${pageClass}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <PrivateTopbar user={user} isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)} onSignOut={handleSignOut} />

        <section className={`rounded-2xl border p-5 shadow-sm ${panelClass}`}>
          <button type="button" onClick={() => navigate("/explorer")} className={`mb-5 inline-flex items-center gap-2 text-sm ${subtleClass}`}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para a galeria
          </button>

          {configError ? <div className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{configError}</div> : null}
          {error ? <div className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
          {success ? <div className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div> : null}

          {loading ? <div className={`text-sm ${subtleClass}`}>Carregando dados da conta...</div> : null}

          {!loading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <form onSubmit={handleProfileSubmit} className={`rounded-2xl border p-4 ${panelClass}`}>
                <h2 className="mb-1 text-xl font-semibold">Dados da conta</h2>
                <p className={`mb-4 text-sm ${subtleClass}`}>Atualize username e nome exibido na Galeria de Planejamento Ciclico.</p>

                <div className={`mb-5 flex items-center gap-4 rounded-2xl border p-4 ${panelClass}`}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Foto de perfil" className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lilas-mistico text-lg font-semibold text-white">
                      {(displayName || username || user?.email || "PC").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <label className="block text-sm font-medium">Foto de perfil</label>
                    <p className={`mt-1 text-xs ${subtleClass}`}>JPG, PNG ou WEBP. Limite de 2MB. A imagem fica em storage privado.</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      disabled={savingAvatar}
                      className="mt-3 block w-full text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm">Email</label>
                    <input value={user?.email || ""} readOnly className={`w-full rounded-lg border px-3 py-2 opacity-70 ${inputClass}`} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Username</label>
                    <input value={username} onChange={(event) => setUsername(event.target.value)} className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${inputClass}`} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Nome exibido</label>
                    <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${inputClass}`} />
                  </div>
                </div>

                <button type="submit" disabled={savingProfile} className="mt-4 rounded-lg bg-lilas-mistico px-4 py-2.5 text-white disabled:opacity-60">
                  {savingProfile ? "Salvando..." : "Salvar dados"}
                </button>
              </form>

              <form onSubmit={handlePasswordSubmit} className={`rounded-2xl border p-4 ${panelClass}`}>
                <h2 className="mb-1 text-xl font-semibold">Seguranca</h2>
                <p className={`mb-4 text-sm ${subtleClass}`}>Troque sua senha de acesso quando precisar.</p>

                <div>
                  <label className="mb-1 block text-sm">Nova senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    required
                    className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${inputClass}`}
                  />
                </div>

                <button type="submit" disabled={savingPassword || !password} className="mt-4 rounded-lg bg-lilas-mistico px-4 py-2.5 text-white disabled:opacity-60">
                  {savingPassword ? "Atualizando..." : "Atualizar senha"}
                </button>
              </form>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
