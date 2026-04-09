import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, Compass, Download, Filter, MoonStar, Orbit, Sparkles, SunMedium } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PrivateTopbar from "@/components/PrivateTopbar";
import { callFunction } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";

type CurrentUser = {
  email?: string | null;
  username?: string | null;
  display_name?: string | null;
  has_avatar?: boolean;
  avatar_updated_at?: string | null;
  is_admin?: boolean;
};

type EventCategory = "lunacao" | "eclipse" | "retrogrado" | "ingresso" | "aspecto" | "estacao";

type AstroEvent = {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  endDate?: string;
  sign?: string;
  note?: string;
  timeLabel?: string;
};

const THEME_KEY = "pc-gallery-theme";
const CATEGORY_LABELS: Record<EventCategory, string> = {
  lunacao: "Lunacoes",
  eclipse: "Eclipses",
  retrogrado: "Retrogrados",
  ingresso: "Ingressos",
  aspecto: "Aspectos",
  estacao: "Estacoes",
};

const CATEGORY_STYLES: Record<EventCategory, string> = {
  lunacao: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  eclipse: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  retrogrado: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  ingresso: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  aspecto: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  estacao: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
};

const EVENTS_2026: AstroEvent[] = [
  { id: "full-2026-01-03", title: "Lua Cheia em Cancer", category: "lunacao", date: "2026-01-03", sign: "13 Cancer 01'", timeLabel: "05:02 ET" },
  { id: "new-2026-01-18", title: "Lua Nova em Capricornio", category: "lunacao", date: "2026-01-18", sign: "28 Capricornio 43'", timeLabel: "14:51 ET" },
  { id: "full-2026-02-01", title: "Lua Cheia em Leao", category: "lunacao", date: "2026-02-01", sign: "13 Leao 03'", timeLabel: "17:09 ET" },
  { id: "solar-2026-02-17", title: "Eclipse Solar em Aquario", category: "eclipse", date: "2026-02-17", sign: "28 Aquario 49'", timeLabel: "07:01 ET" },
  { id: "full-2026-03-03", title: "Eclipse Lunar em Virgem", category: "eclipse", date: "2026-03-03", sign: "12 Virgem 53'", timeLabel: "06:37 ET" },
  { id: "new-2026-03-18", title: "Lua Nova em Peixes", category: "lunacao", date: "2026-03-18", sign: "28 Peixes 27'", timeLabel: "21:23 ET" },
  { id: "full-2026-04-01", title: "Lua Cheia em Libra", category: "lunacao", date: "2026-04-01", sign: "12 Libra 21'", timeLabel: "22:11 ET" },
  { id: "new-2026-04-17", title: "Lua Nova em Aries", category: "lunacao", date: "2026-04-17", sign: "27 Aries 28'", timeLabel: "07:51 ET" },
  { id: "full-2026-05-01", title: "Lua Cheia em Escorpiao", category: "lunacao", date: "2026-05-01", sign: "11 Escorpiao 20'", timeLabel: "13:23 ET" },
  { id: "new-2026-05-16", title: "Lua Nova em Touro", category: "lunacao", date: "2026-05-16", sign: "25 Touro 57'", timeLabel: "16:01 ET" },
  { id: "full-2026-05-31", title: "Lua Cheia em Sagitario", category: "lunacao", date: "2026-05-31", sign: "9 Sagitario 55'", timeLabel: "04:45 ET" },
  { id: "new-2026-06-14", title: "Lua Nova em Gemeos", category: "lunacao", date: "2026-06-14", sign: "24 Gemeos 03'", timeLabel: "22:54 ET" },
  { id: "full-2026-06-29", title: "Lua Cheia em Capricornio", category: "lunacao", date: "2026-06-29", sign: "8 Capricornio 14'", timeLabel: "19:56 ET" },
  { id: "new-2026-07-14", title: "Lua Nova em Cancer", category: "lunacao", date: "2026-07-14", sign: "21 Cancer 59'", timeLabel: "05:43 ET" },
  { id: "full-2026-07-29", title: "Lua Cheia em Aquario", category: "lunacao", date: "2026-07-29", sign: "6 Aquario 30'", timeLabel: "10:35 ET" },
  { id: "solar-2026-08-12", title: "Eclipse Solar em Leao", category: "eclipse", date: "2026-08-12", sign: "20 Leao 01'", timeLabel: "13:36 ET" },
  { id: "lunar-2026-08-28", title: "Eclipse Lunar em Peixes", category: "eclipse", date: "2026-08-28", sign: "4 Peixes 54'", timeLabel: "00:18 ET" },
  { id: "new-2026-09-10", title: "Lua Nova em Virgem", category: "lunacao", date: "2026-09-10", sign: "18 Virgem 25'", timeLabel: "23:26 ET" },
  { id: "full-2026-09-26", title: "Lua Cheia em Aries", category: "lunacao", date: "2026-09-26", sign: "3 Aries 37'", timeLabel: "12:48 ET" },
  { id: "new-2026-10-10", title: "Lua Nova em Libra", category: "lunacao", date: "2026-10-10", sign: "17 Libra 21'", timeLabel: "11:50 ET" },
  { id: "full-2026-10-26", title: "Lua Cheia em Touro", category: "lunacao", date: "2026-10-26", sign: "2 Touro 45'", timeLabel: "00:11 ET" },
  { id: "new-2026-11-09", title: "Lua Nova em Escorpiao", category: "lunacao", date: "2026-11-09", sign: "16 Escorpiao 53'", timeLabel: "02:02 ET" },
  { id: "full-2026-11-24", title: "Lua Cheia em Gemeos", category: "lunacao", date: "2026-11-24", sign: "2 Gemeos 20'", timeLabel: "09:53 ET" },
  { id: "new-2026-12-08", title: "Lua Nova em Sagitario", category: "lunacao", date: "2026-12-08", sign: "16 Sagitario 56'", timeLabel: "19:51 ET" },
  { id: "full-2026-12-23", title: "Lua Cheia em Cancer", category: "lunacao", date: "2026-12-23", sign: "2 Cancer 13'", timeLabel: "20:28 ET" },
  { id: "solar-holiday-imbolc", title: "Imbolc", category: "estacao", date: "2026-02-03", timeLabel: "15:02 ET", note: "Marco de abertura do ano ritual." },
  { id: "solar-holiday-equinox", title: "Equinocio de Primavera", category: "estacao", date: "2026-03-20", timeLabel: "10:45 ET", note: "Inicia Aries season e o novo impulso do ano astrologo." },
  { id: "solar-holiday-beltane", title: "Beltane", category: "estacao", date: "2026-05-05", timeLabel: "07:48 ET" },
  { id: "solar-holiday-solstice", title: "Solsticio de Verao", category: "estacao", date: "2026-06-21", timeLabel: "04:24 ET" },
  { id: "solar-holiday-lammas", title: "Lammas", category: "estacao", date: "2026-08-07", timeLabel: "07:42 ET" },
  { id: "solar-holiday-fall", title: "Equinocio de Outono", category: "estacao", date: "2026-09-22", timeLabel: "20:05 ET" },
  { id: "solar-holiday-samhain", title: "Samhain", category: "estacao", date: "2026-11-07", timeLabel: "04:52 ET" },
  { id: "solar-holiday-winter", title: "Solsticio de Inverno", category: "estacao", date: "2026-12-21", timeLabel: "15:50 ET" },
  { id: "mercurio-rx-1", title: "Mercurio retrogrado", category: "retrogrado", date: "2026-02-26", endDate: "2026-03-20", note: "Primeiro ciclo do ano." },
  { id: "mercurio-rx-2", title: "Mercurio retrogrado", category: "retrogrado", date: "2026-06-29", endDate: "2026-07-23", note: "Segundo ciclo do ano." },
  { id: "mercurio-rx-3", title: "Mercurio retrogrado", category: "retrogrado", date: "2026-10-24", endDate: "2026-11-13", note: "Terceiro ciclo do ano." },
  { id: "venus-rx", title: "Venus retrograda", category: "retrogrado", date: "2026-10-03", endDate: "2026-11-13" },
  { id: "jupiter-rx-a", title: "Jupiter retrogrado", category: "retrogrado", date: "2026-01-01", endDate: "2026-03-10", note: "Encerramento do ciclo iniciado em 2025." },
  { id: "jupiter-rx-b", title: "Jupiter retrogrado", category: "retrogrado", date: "2026-12-12", endDate: "2026-12-31", note: "Segue em 2027." },
  { id: "saturno-rx", title: "Saturno retrogrado", category: "retrogrado", date: "2026-07-26", endDate: "2026-12-10" },
  { id: "urano-rx-a", title: "Urano retrogrado", category: "retrogrado", date: "2026-01-01", endDate: "2026-02-03", note: "Encerramento do ciclo iniciado em 2025." },
  { id: "urano-rx-b", title: "Urano retrogrado", category: "retrogrado", date: "2026-09-10", endDate: "2026-12-31", note: "Segue em 2027." },
  { id: "netuno-rx", title: "Netuno retrogrado", category: "retrogrado", date: "2026-07-07", endDate: "2026-12-12" },
  { id: "plutao-rx", title: "Plutao retrogrado", category: "retrogrado", date: "2026-05-06", endDate: "2026-10-15" },
  { id: "planetas-diretos", title: "Todos os planetas diretos", category: "retrogrado", date: "2026-03-21", endDate: "2026-05-05", note: "Janela rara para avancos sem revisao retrograda." },
  { id: "saturno-sextil-urano", title: "Saturno sextil Urano", category: "aspecto", date: "2026-01-20" },
  { id: "netuno-em-aries", title: "Netuno reentra em Aries", category: "ingresso", date: "2026-01-26" },
  { id: "saturno-em-aries", title: "Saturno entra em Aries", category: "ingresso", date: "2026-02-13" },
  { id: "saturno-conj-netuno", title: "Saturno conjunto Netuno", category: "aspecto", date: "2026-02-20" },
  { id: "saturno-sextil-plutao", title: "Saturno sextil Plutao", category: "aspecto", date: "2026-03-28" },
  { id: "urano-em-gemeos", title: "Urano reentra em Gemeos", category: "ingresso", date: "2026-04-25" },
  { id: "jupiter-em-leao", title: "Jupiter entra em Leao", category: "ingresso", date: "2026-06-30" },
  { id: "urano-sextil-netuno", title: "Urano sextil Netuno", category: "aspecto", date: "2026-07-15" },
  { id: "urano-trigono-plutao", title: "Urano trigono Plutao", category: "aspecto", date: "2026-07-18" },
  { id: "jupiter-trigono-netuno", title: "Jupiter trigono Netuno", category: "aspecto", date: "2026-07-20" },
  { id: "jupiter-oposicao-plutao", title: "Jupiter oposicao Plutao", category: "aspecto", date: "2026-07-20" },
  { id: "jupiter-sextil-urano", title: "Jupiter sextil Urano", category: "aspecto", date: "2026-07-21" },
  { id: "netuno-sextil-plutao", title: "Netuno sextil Plutao", category: "aspecto", date: "2026-07-25" },
  { id: "jupiter-trigono-saturno", title: "Jupiter trigono Saturno", category: "aspecto", date: "2026-08-31" },
  { id: "venus-em-escorpiao", title: "Venus entra em Escorpiao", category: "ingresso", date: "2026-09-10" },
  { id: "netuno-rx-sextil-plutao", title: "Netuno retrogrado sextil Plutao", category: "aspecto", date: "2026-09-15" },
  { id: "venus-rx-libra", title: "Venus retrograda reentra em Libra", category: "ingresso", date: "2026-10-25" },
  { id: "urano-rx-trigono-plutao", title: "Urano retrogrado trigono Plutao", category: "aspecto", date: "2026-11-29" },
  { id: "venus-d-escorpiao", title: "Venus direta reentra em Escorpiao", category: "ingresso", date: "2026-12-04" },
];

function formatMonthLabel(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function formatShortMonth(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function formatDateLabel(date: string, endDate?: string) {
  const formatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
  const startLabel = formatter.format(new Date(`${date}T00:00:00Z`));
  if (!endDate) return startLabel;
  return `${startLabel} ate ${formatter.format(new Date(`${endDate}T00:00:00Z`))}`;
}

function formatDayNumber(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function dateToIcs(date: string) {
  return date.replaceAll("-", "");
}

function nextDay(date: string) {
  const current = new Date(`${date}T00:00:00Z`);
  current.setUTCDate(current.getUTCDate() + 1);
  return current.toISOString().slice(0, 10);
}

function addDays(date: string, amount: number) {
  const current = new Date(`${date}T00:00:00Z`);
  current.setUTCDate(current.getUTCDate() + amount);
  return current.toISOString().slice(0, 10);
}

function formatWeekdayLabel(dayIndex: number) {
  return ["D", "S", "T", "Q", "Q", "S", "S"][dayIndex];
}

function buildMonthGrid(year: number, monthIndex: number) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const startWeekday = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const totalCells = [35, 42].find((value) => value >= startWeekday + daysInMonth) || 42;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startWeekday + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

    const date = new Date(Date.UTC(year, monthIndex, dayNumber)).toISOString().slice(0, 10);
    return { dayNumber, date };
  });
}

function buildGoogleCalendarUrl(event: AstroEvent) {
  const details = [event.note, event.sign ? `Posicao: ${event.sign}` : null, "Fonte-base: Almanac 2026 (EarthSpirit), horario ET."].filter(Boolean).join("\n");
  const start = dateToIcs(event.date);
  const end = dateToIcs(nextDay(event.endDate || event.date));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details,
    dates: `${start}/${end}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcs(events: AstroEvent[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Planejamento Ciclico//Calendario Astrologico 2026//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  events.forEach((event) => {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@planejamentociclico.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
      `DTSTART;VALUE=DATE:${dateToIcs(event.date)}`,
      `DTEND;VALUE=DATE:${dateToIcs(nextDay(event.endDate || event.date))}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${[event.note, event.sign ? `Posicao: ${event.sign}` : null, "Fonte-base: Almanac 2026 (EarthSpirit), horario ET."].filter(Boolean).join("\\n")}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = events.length === 1 ? `${events[0].id}.ics` : "calendario-astrologico-2026.ics";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function CicloPage() {
  const navigate = useNavigate();
  const monthRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(THEME_KEY) === "dark";
  });
  const [activeCategory, setActiveCategory] = useState<EventCategory | "todos">("todos");
  const [openSections, setOpenSections] = useState({ upcoming: true, filters: true, monthGrid: true, monthList: true });
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

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

  const filteredEvents = useMemo(() => {
    const base = activeCategory === "todos" ? EVENTS_2026 : EVENTS_2026.filter((event) => event.category === activeCategory);
    return [...base].sort((a, b) => a.date.localeCompare(b.date));
  }, [activeCategory]);

  const groupedEvents = useMemo(() => {
    return filteredEvents.reduce<Record<string, AstroEvent[]>>((acc, event) => {
      const key = formatMonthLabel(event.date);
      acc[key] = acc[key] || [];
      acc[key].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);

  const monthKeys = useMemo(() => Object.keys(groupedEvents), [groupedEvents]);

  const monthCalendarEntries = useMemo(() => {
    const eventMap = filteredEvents.reduce<Record<string, AstroEvent[]>>((acc, event) => {
      const finalDate = event.endDate || event.date;
      let cursor = event.date;
      while (cursor <= finalDate) {
        acc[cursor] = acc[cursor] || [];
        acc[cursor].push(event);
        cursor = addDays(cursor, 1);
      }
      return acc;
    }, {});

    return Array.from({ length: 12 }, (_, monthIndex) => {
      const firstDate = new Date(Date.UTC(2026, monthIndex, 1)).toISOString().slice(0, 10);
      return {
        key: firstDate,
        label: formatMonthLabel(firstDate),
        grid: buildMonthGrid(2026, monthIndex),
      };
    }).map((month) => ({
      ...month,
      days: month.grid.map((cell) =>
        cell
          ? {
              ...cell,
              events: eventMap[cell.date] || [],
            }
          : null
      ),
    }));
  }, [filteredEvents]);

  useEffect(() => {
    setExpandedMonths((prev) => {
      const currentMonth = formatMonthLabel("2026-04-01");
      const next = Object.fromEntries(monthKeys.map((month, index) => [month, prev[month] ?? (month === currentMonth || index === 0)]));
      return next;
    });
  }, [monthKeys]);

  const upcomingWindows = useMemo(() => {
    const today = new Date("2026-04-08T00:00:00Z").toISOString().slice(0, 10);
    return filteredEvents.filter((event) => event.date >= today).slice(0, 3);
  }, [filteredEvents]);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  };

  const pageClass = isDark ? "bg-slate-950 text-slate-100" : "bg-offwhite-leve text-gray-900";
  const panelClass = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-black/10 bg-white text-gray-900";
  const softPanelClass = isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white/70";
  const subtleClass = isDark ? "text-slate-400" : "text-muted-foreground";

  return (
    <main className={`min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-6 ${pageClass}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <PrivateTopbar
          user={currentUser}
          isDark={isDark}
          onToggleTheme={() => setIsDark((value) => !value)}
          onSignOut={handleSignOut}
          kicker="Calendario astrologico"
          title="Ano de 2026"
          subtitle="Exportavel para a agenda da usuaria"
        />

        <section className={`overflow-hidden rounded-3xl border p-4 shadow-sm sm:rounded-[2rem] sm:p-6 md:p-8 ${panelClass}`}>
          <div className="relative overflow-hidden rounded-[2rem] border border-lilas-mistico/10 p-5 sm:p-6 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_32%),linear-gradient(120deg,rgba(38,52,76,0.94),rgba(95,65,141,0.84),rgba(188,102,73,0.8))]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,23,42,0.58),transparent_55%)]" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl text-white">
                <p className="text-xs uppercase tracking-[0.22em] text-white/70">Calendario ciclico do ano</p>
                <h1 className="mt-3 text-3xl font-atteron leading-tight sm:text-4xl md:text-6xl">Lunacoes, eclipses, retrogrados e marcos do ano.</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                  Uma visao anual para organizar o ritmo astrologico e levar os eventos para a agenda da usuaria sem depender ainda de conexao OAuth.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => downloadIcs(filteredEvents)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-white/90"
                >
                  <Download className="h-4 w-4" />
                  Baixar .ics do filtro atual
                </button>
                <Link
                  to="/planejar"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <CalendarDays className="h-4 w-4" />
                  Voltar ao planner
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <CalendarStatCard icon={<MoonStar className="h-5 w-5" />} label="Lunacoes e eclipses" value="25" detail="12 luas novas, 13 luas cheias e 4 eclipses." className={softPanelClass} />
            <CalendarStatCard icon={<Orbit className="h-5 w-5" />} label="Retrogrados" value="11" detail="Mercurio, Venus, Jupiter, Saturno, Urano, Netuno e Plutao." className={softPanelClass} />
            <CalendarStatCard icon={<SunMedium className="h-5 w-5" />} label="Marcos sazonais" value="8" detail="Equinocios, solsticios e festas solares do ano." className={softPanelClass} />
            <CalendarStatCard icon={<Compass className="h-5 w-5" />} label="Aspectos e ingressos" value="19" detail="Grandes movimentos para leitura macro do ano." className={softPanelClass} />
          </div>
        </section>

        <section className={`rounded-3xl border p-4 sm:p-6 ${panelClass}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Janelas proximas</p>
              <h2 className="mt-2 text-2xl font-atteron sm:text-3xl">O que vem agora no ano</h2>
            </div>
            <SectionToggleButton open={openSections.upcoming} onClick={() => toggleSection("upcoming")} />
          </div>

          {openSections.upcoming ? (
            <>
              <p className={`mt-4 max-w-2xl text-sm leading-6 ${subtleClass}`}>
                Esta faixa ajuda a usuaria a enxergar rapidamente os proximos marcos antes de descer para o calendario completo por mes.
              </p>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {upcomingWindows.map((event) => (
                  <article key={event.id} className={`rounded-3xl border p-5 ${softPanelClass}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${CATEGORY_STYLES[event.category]}`}>{CATEGORY_LABELS[event.category]}</span>
                      <span className={`text-xs uppercase tracking-[0.14em] ${subtleClass}`}>{formatDateLabel(event.date, event.endDate)}</span>
                    </div>
                    <h3 className="mt-4 text-2xl font-atteron leading-tight">{event.title}</h3>
                    <p className={`mt-3 text-sm leading-6 ${subtleClass}`}>{event.note || event.sign || "Evento anual ativo no ciclo."}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <a href={buildGoogleCalendarUrl(event)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-lilas-mistico px-4 py-2 text-sm font-medium text-white transition hover:bg-terracota">
                        <CalendarDays className="h-4 w-4" />
                        Google Calendar
                      </a>
                      <button type="button" onClick={() => downloadIcs([event])} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${isDark ? "border-white/10" : "border-black/10"}`}>
                        <Download className="h-4 w-4" />
                        .ics
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </section>

        <section className={`rounded-3xl border p-4 sm:p-6 ${panelClass}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Filtro</p>
              <h2 className="mt-2 text-2xl font-atteron sm:text-3xl">Escolha a camada do ano</h2>
            </div>
            <SectionToggleButton open={openSections.filters} onClick={() => toggleSection("filters")} />
          </div>

          {openSections.filters ? (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                <FilterChip active={activeCategory === "todos"} onClick={() => setActiveCategory("todos")} label="Tudo" />
                {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((category) => (
                  <FilterChip key={category} active={activeCategory === category} onClick={() => setActiveCategory(category)} label={CATEGORY_LABELS[category]} />
                ))}
              </div>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {monthKeys.map((month) => {
                  const firstEvent = groupedEvents[month]?.[0];
                  return (
                    <button
                      key={month}
                      type="button"
                      onClick={() => monthRefs.current[month]?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className={`min-w-fit rounded-full border px-4 py-2 text-sm transition ${isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-black/10 bg-white/70 hover:bg-white"}`}
                    >
                      {firstEvent ? formatShortMonth(firstEvent.date) : month}
                    </button>
                  );
                })}
              </div>

              <p className={`mt-4 text-sm ${subtleClass}`}>
                Baseado no Almanac 2026 da EarthSpirit. Horarios exibidos conforme a fonte original em ET. A exportacao .ics sai como evento de dia inteiro para facilitar importacao no Google Calendar da usuaria.
              </p>
            </>
          ) : null}
        </section>

        <section className={`rounded-3xl border p-4 sm:p-6 ${panelClass}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Calendario do ano</p>
              <h2 className="mt-2 text-2xl font-atteron sm:text-3xl">Visual mensal com marcacoes astrologicas</h2>
            </div>
            <SectionToggleButton open={openSections.monthGrid} onClick={() => toggleSection("monthGrid")} />
          </div>

          {openSections.monthGrid ? (
            <>
              <p className={`mt-4 max-w-2xl text-sm leading-6 ${subtleClass}`}>
                Cada dia recebe marcacoes do filtro atual. Eventos de varios dias, como retrogrados, aparecem ao longo de toda a faixa do periodo.
              </p>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {monthCalendarEntries.map((month) => (
                  <article key={month.key} className={`rounded-3xl border p-4 sm:p-5 ${softPanelClass}`}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Mes</p>
                        <h3 className="mt-2 text-xl font-atteron capitalize sm:text-2xl">{month.label}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => monthRefs.current[month.label]?.scrollIntoView({ behavior: "smooth", block: "start" })}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] ${isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-black/10 bg-white/80 hover:bg-white"}`}
                      >
                        Ver lista
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {Array.from({ length: 7 }, (_, dayIndex) => (
                        <div key={`${month.key}-weekday-${dayIndex}`} className={`pb-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] ${subtleClass}`}>
                          {formatWeekdayLabel(dayIndex)}
                        </div>
                      ))}

                      {month.days.map((cell, index) =>
                        cell ? (
                          <button
                            key={`${month.key}-${cell.date}`}
                            type="button"
                            onClick={() => monthRefs.current[month.label]?.scrollIntoView({ behavior: "smooth", block: "start" })}
                            className={`min-h-[72px] rounded-2xl border px-2 py-2 text-left transition ${
                              isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-black/10 bg-white/80 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium leading-none">{cell.dayNumber}</span>
                              {cell.events.length ? (
                                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-lilas-mistico px-1.5 text-[0.65rem] font-medium text-white">
                                  {cell.events.length}
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1">
                              {cell.events.slice(0, 3).map((event) => (
                                <span key={`${cell.date}-${event.id}`} className={`inline-flex h-1.5 w-1.5 rounded-full ${getCategoryDotClass(event.category)}`} />
                              ))}
                              {cell.events.length > 3 ? (
                                <span className={`text-[0.62rem] leading-none ${subtleClass}`}>+{cell.events.length - 3}</span>
                              ) : null}
                            </div>

                            {cell.events[0] ? (
                              <p className={`mt-2 line-clamp-2 text-[0.68rem] leading-4 ${subtleClass}`}>
                                {cell.events[0].title}
                              </p>
                            ) : null}
                          </button>
                        ) : (
                          <div key={`${month.key}-empty-${index}`} className={`min-h-[72px] rounded-2xl border border-dashed ${isDark ? "border-white/5" : "border-black/5"}`} />
                        )
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </section>

        <section className={`rounded-3xl border p-4 sm:p-6 ${panelClass}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Lista detalhada</p>
              <h2 className="mt-2 text-2xl font-atteron sm:text-3xl">Eventos mes a mes</h2>
            </div>
            <SectionToggleButton open={openSections.monthList} onClick={() => toggleSection("monthList")} />
          </div>

          {openSections.monthList ? (
            <div className="mt-6 space-y-6">
              {Object.entries(groupedEvents).map(([month, events]) => (
                <div key={month} ref={(node) => { monthRefs.current[month] = node; }} className={`rounded-3xl border p-4 sm:p-6 ${softPanelClass}`}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Mes</p>
                      <h3 className="mt-2 text-2xl font-atteron capitalize sm:text-3xl">{month}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white/80"}`}>{events.length} eventos</span>
                      <SectionToggleButton open={expandedMonths[month] ?? false} onClick={() => toggleMonth(month)} />
                    </div>
                  </div>

                  {(expandedMonths[month] ?? false) ? (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <article key={event.id} className={`rounded-3xl border p-4 sm:p-5 ${softPanelClass}`}>
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-4">
                              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.5rem] border border-lilas-mistico/20 bg-lilas-mistico/10 text-center">
                                <span className="text-[0.68rem] uppercase tracking-[0.12em] text-lilas-mistico">{formatShortMonth(event.date)}</span>
                                <span className="text-xl font-semibold leading-none">{formatDayNumber(event.date)}</span>
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${CATEGORY_STYLES[event.category]}`}>{CATEGORY_LABELS[event.category]}</span>
                                  {event.timeLabel ? <span className={`text-xs uppercase tracking-[0.14em] ${subtleClass}`}>{event.timeLabel}</span> : null}
                                </div>
                                <h4 className="mt-3 text-xl font-atteron leading-tight">{event.title}</h4>
                                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                  <DataInline label="Quando" value={formatDateLabel(event.date, event.endDate)} />
                                  <DataInline label="Posicao" value={event.sign || "Marco anual"} />
                                  <DataInline label="Camada" value={CATEGORY_LABELS[event.category]} />
                                </div>
                                {event.note ? <p className={`mt-3 text-sm leading-6 ${subtleClass}`}>{event.note}</p> : null}
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-3 lg:max-w-[280px] lg:justify-end">
                              <a href={buildGoogleCalendarUrl(event)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-lilas-mistico px-4 py-2 text-sm font-medium text-white transition hover:bg-terracota">
                                <CalendarDays className="h-4 w-4" />
                                Google Calendar
                              </a>
                              <button type="button" onClick={() => downloadIcs([event])} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${isDark ? "border-white/10" : "border-black/10"}`}>
                                <Download className="h-4 w-4" />
                                .ics
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function SectionToggleButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-current transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      aria-label={open ? "Recolher secao" : "Expandir secao"}
    >
      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${active ? "border-lilas-mistico bg-lilas-mistico text-white" : "border-black/10 bg-white/70 text-current dark:border-white/10 dark:bg-white/5"}`}
    >
      {label}
    </button>
  );
}

function CalendarStatCard({ icon, label, value, detail, className }: { icon: React.ReactNode; label: string; value: string; detail: string; className: string }) {
  return (
    <article className={`rounded-3xl border p-5 ${className}`}>
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-lilas-mistico text-white">{icon}</div>
      <p className="mt-4 text-[0.68rem] uppercase tracking-[0.16em] text-lilas-mistico">{label}</p>
      <p className="mt-2 text-3xl font-atteron leading-none">{value}</p>
      <p className="mt-3 text-sm opacity-75">{detail}</p>
    </article>
  );
}

function DataInline({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-lilas-mistico">{label}</p>
      <p className="mt-1 text-sm leading-6">{value}</p>
    </div>
  );
}

function getCategoryDotClass(category: EventCategory) {
  switch (category) {
    case "lunacao":
      return "bg-sky-500";
    case "eclipse":
      return "bg-amber-500";
    case "retrogrado":
      return "bg-rose-500";
    case "ingresso":
      return "bg-emerald-500";
    case "aspecto":
      return "bg-violet-500";
    case "estacao":
      return "bg-orange-500";
    default:
      return "bg-lilas-mistico";
  }
}






