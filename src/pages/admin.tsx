import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, KeyRound, Menu, Newspaper, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import PrivateTopbar from "@/components/PrivateTopbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { callFunction } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";

type CurrentUser = {
  email?: string | null;
  username?: string | null;
  display_name?: string | null;
};

type AdminLesson = {
  id: string;
  module_id: string;
  title: string;
  video_url?: string | null;
  video_embed_url?: string | null;
  is_published: boolean;
};

type AdminModule = {
  id: string;
  title: string;
  description?: string | null;
  is_published: boolean;
  lessons: AdminLesson[];
};

type AdminUser = {
  user_id: string;
  email?: string | null;
  username?: string | null;
  display_name?: string | null;
  status?: string | null;
  app_permissions?: AppPermissions | null;
  effective_app_permissions?: AppPermissions | null;
  is_admin?: boolean;
  admin_role?: string | null;
  created_at?: string | null;
  stats?: {
    charts_count?: number;
    chart_images_count?: number;
    gpt_sessions_count?: number;
    active_gpt_sessions_count?: number;

    lessons_touched_count?: number;
    lessons_completed_count?: number;
  };
  auth_metrics?: {
    gpt_last_login_at?: string | null;
    gpt_last_activity_at?: string | null;
    gpt_last_session_expires_at?: string | null;

  };
  astrology_api_quota?: {
    status?: string | null;
    monthly_limit?: number | null;
    used_in_period?: number | null;
    period_key?: string | null;
    expires_at?: string | null;
  } | null;
  lesson_progress?: Array<{
    lesson_id: string;
    is_completed?: boolean;
    last_position_seconds?: number;
    completed_at?: string | null;
    updated_at?: string | null;
    lesson_title?: string | null;
    module_title?: string | null;
  }>;
};

type AppPermissions = {
  app?: boolean;
  ciclo?: boolean;
  planejar?: boolean;
  biblioteca?: boolean;
};

const THEME_KEY = "pc-gallery-theme";
const DEFAULT_APP_PERMISSIONS: Required<AppPermissions> = {
  app: false,
  ciclo: false,
  planejar: false,
  biblioteca: false,
};
const ACCESS_OPTIONS: Array<{ key: keyof Required<AppPermissions>; label: string; description: string }> = [
  { key: "app", label: "Escritorio", description: "Circuito principal /app" },
  { key: "ciclo", label: "Ciclo", description: "Area macro do ciclo" },
  { key: "planejar", label: "Planejar", description: "Planejamento e habitos" },
  { key: "biblioteca", label: "Biblioteca", description: "Aulas e materiais" },
];
const ADMIN_LAYERS = [
  { id: "admin-contas", label: "Contas" },
  { id: "admin-modulos", label: "Modulos" },
  { id: "admin-aulas", label: "Aulas" },
  { id: "admin-jornal", label: "Jornal" },
  { id: "admin-conteudo", label: "Conteudo atual" },
];

function formatDateTime(value?: string | null) {
  if (!value) return "sem registro";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPermissions, setNewUserPermissions] = useState<Required<AppPermissions>>(DEFAULT_APP_PERMISSIONS);
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserUsername, setEditUserUsername] = useState("");
  const [editUserDisplayName, setEditUserDisplayName] = useState("");
  const [editUserStatus, setEditUserStatus] = useState("active");
  const [editUserIsAdmin, setEditUserIsAdmin] = useState(false);
  const [editUserPermissions, setEditUserPermissions] = useState<Required<AppPermissions>>(DEFAULT_APP_PERMISSIONS);
  const [resetPassword, setResetPassword] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [modulePublished, setModulePublished] = useState(true);
  const [lessonModuleId, setLessonModuleId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonPublished, setLessonPublished] = useState(true);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postPublished, setPostPublished] = useState(true);
  const [postPinned, setPostPinned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(THEME_KEY) === "dark";
  });

  const selectedModule = useMemo(() => modules.find((module) => module.id === lessonModuleId), [lessonModuleId, modules]);
  const selectedUser = useMemo(() => users.find((user) => user.user_id === selectedUserId) || null, [selectedUserId, users]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    }
  }, [isDark]);

  useEffect(() => {
    loadAdmin();
  }, []);

  async function loadAdmin() {
    try {
      setLoading(true);
      setError("");
      const [userData, libraryData] = await Promise.all([
        callFunction("get-current-user"),
        callFunction("admin-list-library"),
      ]);
      setCurrentUser(userData.user || null);
      const nextModules = (libraryData.modules || []) as AdminModule[];
      setModules(nextModules);
      setLessonModuleId((current) => current || nextModules[0]?.id || "");
      await loadUsers();
    } catch (loadError) {
      setError((loadError as Error).message || "Nao foi possivel carregar o admin.");
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    const data = await callFunction("admin-list-users");
    const nextUsers = (data.items || []) as AdminUser[];
    setUsers(nextUsers);
    setSelectedUserId((current) => current || nextUsers[0]?.user_id || "");
  }

  useEffect(() => {
    if (!selectedUser) return;
    setEditUserEmail(selectedUser.email || "");
    setEditUserUsername(selectedUser.username || "");
    setEditUserDisplayName(selectedUser.display_name || "");
    setEditUserStatus(selectedUser.status || "active");
    setEditUserIsAdmin(Boolean(selectedUser.is_admin));
    setEditUserPermissions({
      ...DEFAULT_APP_PERMISSIONS,
      ...((selectedUser.is_admin ? selectedUser.effective_app_permissions : selectedUser.app_permissions) || {}),
    });
    setResetPassword("");
  }, [selectedUser]);

  async function handleSignOut() {
    const supabase = getSupabase();
    if (!supabase) {
      navigate("/login", { replace: true });
      return;
    }

    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  function goToAdminLayer(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setAdminMenuOpen(false);
  }

  async function saveModule(event: FormEvent) {
    event.preventDefault();
    try {
      setSaving("module");
      setError("");
      setNotice("");
      await callFunction("admin-save-library-module", {
        title: moduleTitle,
        description: moduleDescription,
        is_published: modulePublished,
      });
      setModuleTitle("");
      setModuleDescription("");
      setNotice("Modulo salvo.");
      await loadAdmin();
    } catch (saveError) {
      setError((saveError as Error).message || "Nao foi possivel salvar o modulo.");
    } finally {
      setSaving("");
    }
  }

  async function createAccount(event: FormEvent) {
    event.preventDefault();
    try {
      setSaving("account-create");
      setError("");
      setNotice("");
      await callFunction("admin-create-user", {
        email: newUserEmail,
        username: newUserUsername,
        display_name: newUserName,
        password: newUserPassword,
        app_permissions: newUserPermissions,
      });
      setNewUserName("");
      setNewUserEmail("");
      setNewUserUsername("");
      setNewUserPassword("");
      setNewUserPermissions(DEFAULT_APP_PERMISSIONS);
      setNotice("Conta criada.");
      await loadUsers();
    } catch (saveError) {
      setError((saveError as Error).message || "Nao foi possivel criar a conta.");
    } finally {
      setSaving("");
    }
  }

  async function updateAccount(event: FormEvent) {
    event.preventDefault();
    if (!selectedUser) return;
    try {
      setSaving("account-update");
      setError("");
      setNotice("");
      await callFunction("admin-update-user", {
        user_id: selectedUser.user_id,
        email: editUserEmail,
        username: editUserUsername,
        display_name: editUserDisplayName,
        status: editUserStatus,
        is_admin: editUserIsAdmin,
        app_permissions: editUserPermissions,
      });
      setNotice("Conta atualizada.");
      await loadUsers();
    } catch (saveError) {
      setError((saveError as Error).message || "Nao foi possivel atualizar a conta.");
    } finally {
      setSaving("");
    }
  }

  async function resetAccountPassword(event: FormEvent) {
    event.preventDefault();
    if (!selectedUser) return;
    try {
      setSaving("account-password");
      setError("");
      setNotice("");
      await callFunction("admin-reset-user-password", {
        user_id: selectedUser.user_id,
        new_password: resetPassword,
      });
      setResetPassword("");
      setNotice("Senha redefinida.");
    } catch (saveError) {
      setError((saveError as Error).message || "Nao foi possivel redefinir a senha.");
    } finally {
      setSaving("");
    }
  }

  async function saveLesson(event: FormEvent) {
    event.preventDefault();
    try {
      setSaving("lesson");
      setError("");
      setNotice("");
      await callFunction("admin-save-library-lesson", {
        module_id: lessonModuleId,
        title: lessonTitle,
        description: lessonDescription,
        video_url: lessonVideoUrl,
        is_published: lessonPublished,
      });
      setLessonTitle("");
      setLessonDescription("");
      setLessonVideoUrl("");
      setNotice("Aula salva.");
      await loadAdmin();
    } catch (saveError) {
      setError((saveError as Error).message || "Nao foi possivel salvar a aula.");
    } finally {
      setSaving("");
    }
  }

  async function savePost(event: FormEvent) {
    event.preventDefault();
    try {
      setSaving("post");
      setError("");
      setNotice("");
      await callFunction("admin-save-community-post", {
        title: postTitle,
        body: postBody,
        is_published: postPublished,
        pinned: postPinned,
      });
      setPostTitle("");
      setPostBody("");
      setNotice("Publicacao salva no jornal.");
    } catch (saveError) {
      setError((saveError as Error).message || "Nao foi possivel salvar a publicacao.");
    } finally {
      setSaving("");
    }
  }

  const pageClass = isDark ? "bg-slate-950 text-slate-100" : "bg-offwhite-leve text-gray-900";
  const panelClass = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-black/10 bg-white text-gray-900";
  const softPanelClass = isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-gray-50";
  const inputClass = isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-black/10 bg-white text-gray-900";
  const subtleClass = isDark ? "text-slate-400" : "text-muted-foreground";

  return (
    <main className={`min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-6 ${pageClass}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <PrivateTopbar
          user={currentUser}
          isDark={isDark}
          onToggleTheme={() => setIsDark((value) => !value)}
          onSignOut={handleSignOut}
          kicker="Area administrativa"
          title="Admin do Escritorio"
        />

        <section className={`rounded-3xl border p-4 shadow-sm sm:rounded-[2rem] sm:p-6 md:p-8 ${panelClass}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-lilas-mistico">
                <ShieldCheck className="h-4 w-4" />
                Acesso restrito
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <h1 className="text-3xl font-atteron leading-tight sm:text-4xl md:text-6xl">Painel admin</h1>
                <button
                  type="button"
                  onClick={() => setAdminMenuOpen((value) => !value)}
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-lilas-mistico ${softPanelClass}`}
                  aria-expanded={adminMenuOpen}
                  aria-controls="admin-layer-menu"
                  aria-label="Abrir menu do painel admin"
                >
                  {adminMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
              </div>
              <p className={`mt-3 max-w-2xl ${subtleClass}`}>Cadastre aulas por YouTube, publique modulos da Biblioteca e alimente o jornal da Praca central.</p>
            </div>
          </div>

          {loading ? <p className={`mt-6 text-sm ${subtleClass}`}>Carregando admin...</p> : null}
          {error ? <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">{error}</p> : null}
          {notice ? <p className="mt-6 rounded-2xl border border-lilas-mistico/30 bg-lilas-mistico/10 p-4 text-sm text-lilas-mistico">{notice}</p> : null}

          {adminMenuOpen ? (
            <div id="admin-layer-menu" className={`mt-5 grid gap-2 rounded-2xl border p-3 sm:grid-cols-5 ${softPanelClass}`}>
                {ADMIN_LAYERS.map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => goToAdminLayer(layer.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition hover:border-lilas-mistico hover:text-lilas-mistico ${softPanelClass}`}
                  >
                    {layer.label}
                  </button>
                ))}
              </div>
            ) : null}

          <div id="admin-contas" className={`scroll-mt-28 mt-8 rounded-3xl border p-5 ${softPanelClass}`}>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-lilas-mistico">
                  <Users className="h-4 w-4" />
                  Contas
                </p>
                <h2 className="mt-2 text-2xl font-atteron leading-tight sm:text-3xl">Usuarios e progresso</h2>
                <p className={`mt-2 text-sm ${subtleClass}`}>Crie contas, edite dados principais, redefina senha e veja consumo de mapas, aulas e logins no GPT.</p>
              </div>
              <button type="button" onClick={loadUsers} className={`rounded-full border px-5 py-3 text-sm font-medium ${softPanelClass}`}>
                Atualizar usuarios
              </button>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <form onSubmit={createAccount} className={`rounded-3xl border p-5 ${softPanelClass}`}>
                <div className="mb-5 flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-lilas-mistico" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Nova conta</p>
                    <h3 className="text-2xl font-atteron">Criar acesso</h3>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input required value={newUserName} onChange={(event) => setNewUserName(event.target.value)} placeholder="Nome exibido" className={inputClass} />
                  <Input required type="email" value={newUserEmail} onChange={(event) => setNewUserEmail(event.target.value)} placeholder="Email" className={inputClass} />
                  <Input required value={newUserUsername} onChange={(event) => setNewUserUsername(event.target.value)} placeholder="Username" className={inputClass} />
                  <Input required value={newUserPassword} onChange={(event) => setNewUserPassword(event.target.value)} placeholder="Senha inicial" className={inputClass} />
                </div>
                <div className={`mt-4 rounded-2xl border p-4 ${softPanelClass}`}>
                  <p className="text-sm font-semibold">Acessos iniciais</p>
                  <p className={`mt-1 text-xs ${subtleClass}`}>Por padrao, a conta nova acessa apenas login, conta e Galeria. Marque extras se necessario.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {ACCESS_OPTIONS.map((option) => (
                      <label key={option.key} className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${softPanelClass}`}>
                        <input
                          type="checkbox"
                          checked={Boolean(newUserPermissions[option.key])}
                          onChange={(event) => setNewUserPermissions((current) => ({
                            ...current,
                            [option.key]: event.target.checked,
                          }))}
                          className="mt-1"
                        />
                        <span>
                          <span className="block font-medium">{option.label}</span>
                          <span className={`block text-xs ${subtleClass}`}>{option.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={saving === "account-create"} className="mt-4 rounded-full bg-lilas-mistico px-5 py-3 text-sm font-medium text-white transition hover:bg-terracota disabled:opacity-60">
                  {saving === "account-create" ? "Criando..." : "Criar conta"}
                </button>
              </form>

              <div className={`rounded-3xl border p-5 ${softPanelClass}`}>
                <div className="mb-5 flex items-center gap-3">
                  <KeyRound className="h-5 w-5 text-lilas-mistico" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Edicao</p>
                    <h3 className="text-2xl font-atteron">Conta selecionada</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm ${inputClass}`}>
                    <option value="">Selecione uma conta</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.display_name || user.username || user.email} - {user.email}{user.is_admin ? " - admin" : ""}
                      </option>
                    ))}
                  </select>

                  {selectedUser ? (
                    <>
                      <form onSubmit={updateAccount} className="grid gap-3 md:grid-cols-2">
                        <Input required type="email" value={editUserEmail} onChange={(event) => setEditUserEmail(event.target.value)} placeholder="Email" className={inputClass} />
                        <Input required value={editUserUsername} onChange={(event) => setEditUserUsername(event.target.value)} placeholder="Username" className={inputClass} />
                        <Input value={editUserDisplayName} onChange={(event) => setEditUserDisplayName(event.target.value)} placeholder="Nome exibido" className={inputClass} />
                        <select value={editUserStatus} onChange={(event) => setEditUserStatus(event.target.value)} className={`rounded-md border px-3 py-2 text-sm ${inputClass}`}>
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                          <option value="blocked">blocked</option>
                        </select>
                        <label className={`flex items-start gap-3 rounded-2xl border p-4 text-sm md:col-span-2 ${softPanelClass}`}>
                          <input
                            type="checkbox"
                            checked={editUserIsAdmin}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setEditUserIsAdmin(checked);
                              if (checked) {
                                setEditUserPermissions({
                                  app: true,
                                  ciclo: true,
                                  planejar: true,
                                  biblioteca: true,
                                });
                              }
                            }}
                            className="mt-1"
                          />
                          <span>
                            <span className="block font-semibold">Conceder cargo admin</span>
                            <span className={`mt-1 block text-xs ${subtleClass}`}>Admins acessam todos os modulos e podem usar as funcoes administrativas.</span>
                          </span>
                        </label>
                        <div className={`rounded-2xl border p-4 md:col-span-2 ${softPanelClass}`}>
                          <p className="text-sm font-semibold">Acessos liberados</p>
                          <p className={`mt-1 text-xs ${subtleClass}`}>Login, conta e Galeria de Mapas ficam liberados por padrao. Marque apenas os modulos extras que esta usuaria pode acessar.</p>
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {ACCESS_OPTIONS.map((option) => (
                              <label key={option.key} className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${softPanelClass}`}>
                                <input
                                  type="checkbox"
                                  checked={editUserIsAdmin || Boolean(editUserPermissions[option.key])}
                                  disabled={editUserIsAdmin}
                                  onChange={(event) => setEditUserPermissions((current) => ({
                                    ...current,
                                    [option.key]: event.target.checked,
                                  }))}
                                  className="mt-1"
                                />
                                <span>
                                  <span className="block font-medium">{option.label}</span>
                                  <span className={`block text-xs ${subtleClass}`}>{option.description}</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <button type="submit" disabled={saving === "account-update"} className="rounded-full bg-lilas-mistico px-5 py-3 text-sm font-medium text-white transition hover:bg-terracota disabled:opacity-60 md:col-span-2">
                          {saving === "account-update" ? "Salvando..." : "Salvar dados da conta"}
                        </button>
                      </form>

                      <form onSubmit={resetAccountPassword} className="flex flex-col gap-3 md:flex-row">
                        <Input required value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} placeholder="Nova senha" className={inputClass} />
                        <button type="submit" disabled={saving === "account-password"} className="rounded-full border border-lilas-mistico px-5 py-3 text-sm font-medium text-lilas-mistico transition hover:bg-lilas-mistico hover:text-white disabled:opacity-60">
                          {saving === "account-password" ? "Redefinindo..." : "Redefinir senha"}
                        </button>
                      </form>                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <Metric label="Mapas" value={selectedUser.stats?.charts_count ?? 0} className={softPanelClass} />
                        <Metric label="Imagens" value={selectedUser.stats?.chart_images_count ?? 0} className={softPanelClass} />
                        <Metric label="Sessoes GPT" value={selectedUser.stats?.gpt_sessions_count ?? 0} className={softPanelClass} />
                        <Metric label="GPT ativas" value={selectedUser.stats?.active_gpt_sessions_count ?? 0} className={softPanelClass} />
                        <Metric label="Aulas vistas" value={selectedUser.stats?.lessons_touched_count ?? 0} className={softPanelClass} />
                        <Metric label="Concluidas" value={selectedUser.stats?.lessons_completed_count ?? 0} className={softPanelClass} />
                        <Metric label="Metrica futura" value="--" className={softPanelClass} />
                        <Metric label="Metrica futura" value="--" className={softPanelClass} />
                      </div>

                      <div className="grid gap-3 xl:grid-cols-2">
                        <div className={`rounded-2xl border p-4 text-sm ${softPanelClass}`}>
                          <p className="font-semibold">Cota Astrology API</p>
                          <p className={`mt-1 ${subtleClass}`}>
                            {selectedUser.astrology_api_quota
                              ? `${selectedUser.astrology_api_quota.used_in_period ?? 0}/${selectedUser.astrology_api_quota.monthly_limit ?? 0} usos no periodo ${selectedUser.astrology_api_quota.period_key ?? "atual"}`
                              : "Sem cota registrada."}
                          </p>
                        </div>

                        <div className={`rounded-2xl border p-4 text-sm ${softPanelClass}`}>
                          <p className="font-semibold">Atividade no GPT</p>
                          <div className={`mt-2 space-y-1 ${subtleClass}`}>
                            <p>Ultimo login: {formatDateTime(selectedUser.auth_metrics?.gpt_last_login_at)}</p>
                            <p>Ultima atividade: {formatDateTime(selectedUser.auth_metrics?.gpt_last_activity_at)}</p>
                            <p>Expiracao da ultima sessao: {formatDateTime(selectedUser.auth_metrics?.gpt_last_session_expires_at)}</p>

                          </div>
                        </div>
                      </div>

                      <div className={`rounded-2xl border p-4 ${softPanelClass}`}>
                        <p className="text-sm font-semibold">Historico recente de aulas</p>
                        {selectedUser.lesson_progress && selectedUser.lesson_progress.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            {selectedUser.lesson_progress.slice(0, 8).map((item) => (
                              <div key={`${selectedUser.user_id}-${item.lesson_id}`} className={`rounded-xl border p-3 text-sm ${softPanelClass}`}>
                                <p className="font-medium">{item.lesson_title || "Aula sem titulo"}</p>
                                <p className={`mt-1 text-xs ${subtleClass}`}>
                                  {item.module_title || "Modulo"} - {item.is_completed ? "concluida" : "visualizada"} - {formatDateTime(item.updated_at)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={`mt-2 text-sm ${subtleClass}`}>Nenhuma aula registrada ainda.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className={`text-sm ${subtleClass}`}>Selecione uma conta para editar.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <form id="admin-modulos" onSubmit={saveModule} className={`scroll-mt-28 rounded-3xl border p-5 ${softPanelClass}`}>
              <div className="mb-5 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-lilas-mistico" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Biblioteca</p>
                  <h2 className="text-2xl font-atteron">Novo modulo</h2>
                </div>
              </div>
              <div className="space-y-3">
                <Input required value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} placeholder="Titulo do modulo" className={inputClass} />
                <Textarea value={moduleDescription} onChange={(event) => setModuleDescription(event.target.value)} placeholder="Descricao curta" className={inputClass} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={modulePublished} onChange={(event) => setModulePublished(event.target.checked)} />
                  Publicar modulo
                </label>
                <button type="submit" disabled={saving === "module"} className="w-full rounded-full bg-lilas-mistico px-5 py-3 text-sm font-medium text-white transition hover:bg-terracota disabled:opacity-60">
                  {saving === "module" ? "Salvando..." : "Salvar modulo"}
                </button>
              </div>
            </form>

            <form id="admin-aulas" onSubmit={saveLesson} className={`scroll-mt-28 rounded-3xl border p-5 ${softPanelClass}`}>
              <div className="mb-5 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-lilas-mistico" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">YouTube</p>
                  <h2 className="text-2xl font-atteron">Nova aula</h2>
                </div>
              </div>
              <div className="space-y-3">
                <select required value={lessonModuleId} onChange={(event) => setLessonModuleId(event.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm ${inputClass}`}>
                  <option value="">Selecione um modulo</option>
                  {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
                </select>
                <Input required value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} placeholder="Titulo da aula" className={inputClass} />
                <Textarea value={lessonDescription} onChange={(event) => setLessonDescription(event.target.value)} placeholder="Descricao da aula" className={inputClass} />
                <Input value={lessonVideoUrl} onChange={(event) => setLessonVideoUrl(event.target.value)} placeholder="URL do YouTube" className={inputClass} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={lessonPublished} onChange={(event) => setLessonPublished(event.target.checked)} />
                  Publicar aula
                </label>
                <button type="submit" disabled={saving === "lesson" || !selectedModule} className="w-full rounded-full bg-lilas-mistico px-5 py-3 text-sm font-medium text-white transition hover:bg-terracota disabled:opacity-60">
                  {saving === "lesson" ? "Salvando..." : "Salvar aula"}
                </button>
              </div>
            </form>

            <form id="admin-jornal" onSubmit={savePost} className={`scroll-mt-28 rounded-3xl border p-5 ${softPanelClass}`}>
              <div className="mb-5 flex items-center gap-3">
                <Newspaper className="h-5 w-5 text-lilas-mistico" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Praca central</p>
                  <h2 className="text-2xl font-atteron">Jornal</h2>
                </div>
              </div>
              <div className="space-y-3">
                <Input required value={postTitle} onChange={(event) => setPostTitle(event.target.value)} placeholder="Titulo do aviso" className={inputClass} />
                <Textarea value={postBody} onChange={(event) => setPostBody(event.target.value)} placeholder="Texto do aviso" className={`min-h-[130px] ${inputClass}`} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={postPublished} onChange={(event) => setPostPublished(event.target.checked)} />
                  Publicar no jornal
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={postPinned} onChange={(event) => setPostPinned(event.target.checked)} />
                  Fixar no topo
                </label>
                <button type="submit" disabled={saving === "post"} className="w-full rounded-full bg-lilas-mistico px-5 py-3 text-sm font-medium text-white transition hover:bg-terracota disabled:opacity-60">
                  {saving === "post" ? "Salvando..." : "Publicar aviso"}
                </button>
              </div>
            </form>
          </div>

          <div id="admin-conteudo" className={`scroll-mt-28 mt-8 rounded-3xl border p-5 ${softPanelClass}`}>
            <h2 className="text-2xl font-atteron">Conteudo atual</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {modules.length === 0 ? <p className={`text-sm ${subtleClass}`}>Nenhum modulo cadastrado ainda.</p> : null}
              {modules.map((module) => (
                <article key={module.id} className={`rounded-2xl border p-4 ${softPanelClass}`}>
                  <p className="text-sm font-semibold">{module.title}</p>
                  <p className={`mt-1 text-xs ${subtleClass}`}>{module.is_published ? "Publicado" : "Rascunho"} - {module.lessons.length} aulas</p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id} className={subtleClass}>
                        {lesson.is_published ? "Publicado" : "Rascunho"} - {lesson.title}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, className }: { label: string; value: number | string; className: string }) {
  return (
    <div className={`min-h-[118px] rounded-2xl border p-4 ${className}`}>
      <span className="block text-xs uppercase tracking-[0.14em] text-lilas-mistico">{label}</span>
      <strong className="mt-1 block text-2xl font-atteron">{value}</strong>
    </div>
  );
}
