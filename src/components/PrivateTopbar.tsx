import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CalendarDays, Home, LayoutGrid, LogOut, Menu, Moon, Settings, ShieldCheck, Sun } from "lucide-react";
import { fetchFunctionBlob } from "@/lib/api";

type PrivateUser = {
  email?: string | null;
  username?: string | null;
  display_name?: string | null;
  has_avatar?: boolean | null;
  avatar_updated_at?: string | null;
  is_admin?: boolean | null;
};

type PrivateTopbarProps = {
  user: PrivateUser | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onSignOut: () => void;
  kicker?: string;
  title?: string;
  subtitle?: string;
};

function getUserLabel(user: PrivateUser | null) {
  return user?.display_name || user?.username || user?.email || "Minha conta";
}

function getUserInitials(user: PrivateUser | null) {
  const label = getUserLabel(user).trim();
  if (!label) return "PC";
  const parts = label.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "PC";
}

export default function PrivateTopbar({
  user,
  isDark,
  onToggleTheme,
  onSignOut,
  kicker = "Galeria de Planejamento Ciclico",
  title = "Sua colecao privada de mapas",
  subtitle,
}: PrivateTopbarProps) {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
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

  const panelClass = isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-black/10 bg-white text-gray-900";
  const subtleClass = isDark ? "text-slate-400" : "text-muted-foreground";
  const menuClass = isDark ? "border-white/10 bg-slate-900 text-slate-100 shadow-2xl" : "border-black/10 bg-white text-gray-900 shadow-xl";
  const buttonClass = isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-black/10 bg-white hover:bg-gray-50";

  return (
    <header className={`rounded-2xl border px-3 py-3 shadow-sm sm:px-4 ${panelClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-lilas-mistico sm:text-xs sm:tracking-[0.18em]">{kicker}</p>
          <h1 className="truncate text-base font-atteron leading-tight sm:text-xl">{title}</h1>
          {subtitle ? <p className={`mt-0.5 truncate text-[0.65rem] uppercase tracking-[0.16em] sm:text-xs ${subtleClass}`}>{subtitle}</p> : null}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`flex items-center gap-2 rounded-2xl border px-2 py-2 text-left transition sm:gap-3 sm:px-3 ${buttonClass}`}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Foto de perfil" className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-10 sm:w-10" />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lilas-mistico text-xs font-semibold text-white sm:h-10 sm:w-10 sm:text-sm">
                {getUserInitials(user)}
              </div>
            )}
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight">{getUserLabel(user)}</div>
              <div className={`text-xs ${subtleClass}`}>{user?.email || "Conta autenticada"}</div>
            </div>
            <Menu className="h-4 w-4" />
          </button>

          {open ? (
            <div className={`absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-[240px] rounded-2xl border p-2 ${menuClass}`}>
              <Link
                to="/app"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Home className="h-4 w-4" />
                Voltar ao inicio
              </Link>

              <Link
                to="/galeria"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Moon className="h-4 w-4" />
                Galeria de Mapas
              </Link>

              <Link
                to="/biblioteca"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <BookOpen className="h-4 w-4" />
                Biblioteca
              </Link>

              <Link
                to="/ciclo"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <LayoutGrid className="h-4 w-4" />
                Calendario do ano
              </Link>

              <Link
                to="/planejar"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <CalendarDays className="h-4 w-4" />
                Planejar
              </Link>

              {user?.is_admin ? (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Painel admin
                </Link>
              ) : null}

              <Link
                to="/conta"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Settings className="h-4 w-4" />
                Dados da conta
              </Link>

              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? "Modo claro" : "Modo noturno"}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-500 transition hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Sair da conta
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

