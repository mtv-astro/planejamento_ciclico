import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Menu, Moon, Settings, Sun } from "lucide-react";

type PrivateUser = {
  email?: string | null;
  username?: string | null;
  display_name?: string | null;
};

type PrivateTopbarProps = {
  user: PrivateUser | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onSignOut: () => void;
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

export default function PrivateTopbar({ user, isDark, onToggleTheme, onSignOut }: PrivateTopbarProps) {
  const [open, setOpen] = useState(false);
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

  const panelClass = isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-black/10 bg-white text-gray-900";
  const subtleClass = isDark ? "text-slate-400" : "text-muted-foreground";
  const menuClass = isDark ? "border-white/10 bg-slate-900 text-slate-100 shadow-2xl" : "border-black/10 bg-white text-gray-900 shadow-xl";
  const buttonClass = isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-black/10 bg-white hover:bg-gray-50";

  return (
    <header className={`rounded-2xl border px-4 py-3 shadow-sm ${panelClass}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Galeria de Planejamento Ciclico</p>
          <h1 className="text-xl font-atteron">Sua colecao privada de mapas</h1>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${buttonClass}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lilas-mistico text-sm font-semibold text-white">
              {getUserInitials(user)}
            </div>
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight">{getUserLabel(user)}</div>
              <div className={`text-xs ${subtleClass}`}>{user?.email || "Conta autenticada"}</div>
            </div>
            <Menu className="h-4 w-4" />
          </button>

          {open ? (
            <div className={`absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-[240px] rounded-2xl border p-2 ${menuClass}`}>
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
