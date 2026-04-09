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
  community_profile_is_public?: boolean | null;
};

const THEME_KEY = "pc-gallery-theme";

export default function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [communityProfileIsPublic, setCommunityProfileIsPublic] = useState(false);
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
        setCommunityProfileIsPublic(Boolean(nextUser?.community_profile_is_public));
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
        community_profile_is_public: communityProfileIsPublic,
      });
      setUser((current) => ({
        ...(current || {}),
        ...(data.user || {}),
      } as CurrentUser));
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
                <p className={`mb-4 text-sm ${subtleClass}`}>Atualize username, nome exibido e a visibilidade do seu perfil na comunidade.</p>

                <div className={`mb-5 grid grid-cols-2 items-center rounded-2xl border p-4 text-center ${panelClass}`}>
                  <div className="flex justify-end">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Foto de perfil" className="h-32 w-32 shrink-0 rounded-full object-cover sm:h-36 sm:w-36" />
                    ) : (
                      <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-lilas-mistico text-3xl font-semibold text-white sm:h-36 sm:w-36">
                        {(displayName || username || user?.email || "PC").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 justify-start">
                    <div className="text-left">
                      <p className="text-sm font-medium">Foto de perfil</p>
                      <p className={`mt-1 text-[0.68rem] leading-4 ${subtleClass}`}>JPG, PNG ou WEBP<br />Max 2MB</p>
                      <label className="mt-3 inline-flex cursor-pointer rounded-full border border-lilas-mistico/30 px-3 py-1.5 text-xs font-medium text-lilas-mistico transition hover:bg-lilas-mistico/10">
                        {savingAvatar ? "Enviando..." : "Trocar"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleAvatarChange}
                          disabled={savingAvatar}
                          className="sr-only"
                        />
                      </label>
                    </div>
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
                  <div className={`rounded-2xl border p-4 ${panelClass}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Visibilidade em Mulheres da Comunidade</p>
                        <p className={`mt-1 text-xs ${subtleClass}`}>
                          Controle aqui se seu perfil aparece so para voce ou tambem entra na galeria publica.
                        </p>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${communityProfileIsPublic ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
                        {communityProfileIsPublic ? "Publico" : "Privado"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setCommunityProfileIsPublic(false)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${communityProfileIsPublic ? inputClass : "border-amber-500/40 bg-amber-500/10 text-current"}`}
                      >
                        <span className="block text-sm font-semibold">Perfil privado</span>
                        <span className={`mt-1 block text-xs ${subtleClass}`}>Seu card fica visivel apenas para voce.</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommunityProfileIsPublic(true)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${communityProfileIsPublic ? "border-emerald-500/40 bg-emerald-500/10 text-current" : inputClass}`}
                      >
                        <span className="block text-sm font-semibold">Tornar publico</span>
                        <span className={`mt-1 block text-xs ${subtleClass}`}>Seu nome entra na galeria publica da comunidade.</span>
                      </button>
                    </div>
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