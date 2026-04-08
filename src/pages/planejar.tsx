import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Compass, ListChecks, MoonStar, SunMedium, Trees } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PrivateTopbar from "@/components/PrivateTopbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type PlannerView = "overview" | "season" | "lunation" | "week" | "day" | "habits";

type PlannerState = {
  season: string;
  seasonReview: string;
  projects: Record<string, string>;
  mandalaReview: Record<string, string>;
  lunationSign: string;
  activatedHouse: string;
  intention: string;
  priorities: string[];
  week: string;
  weeklyFocus: string;
  dailyAction: string;
  dailyCheckIn: string;
  habits: string[];
  habitChecks: Record<string, boolean[]>;
};

const THEME_KEY = "pc-gallery-theme";
const STORAGE_KEY = "pc-planner-draft-v2";

const DEFAULT_PLANNER: PlannerState = {
  season: "Outono",
  seasonReview: "",
  projects: { fogo: "", terra: "", ar: "", agua: "" },
  mandalaReview: {
    casa1: "", casa2: "", casa3: "", casa4: "", casa5: "", casa6: "",
    casa7: "", casa8: "", casa9: "", casa10: "", casa11: "", casa12: "",
  },
  lunationSign: "",
  activatedHouse: "",
  intention: "",
  priorities: ["", "", ""],
  week: "Semana 1",
  weeklyFocus: "",
  dailyAction: "",
  dailyCheckIn: "",
  habits: ["", "", "", ""],
  habitChecks: {},
};

const SEASONS = [
  { name: "Outono", cue: "Organizacao, colheita e ajustes.", summary: "Estacao de revisar as areas da vida e escolher os quatro projetos principais." },
  { name: "Inverno", cue: "Introspeccao, planejamento e fortalecimento interno.", summary: "Estacao de nutrir a base antes de expor ao mundo." },
  { name: "Primavera", cue: "Inicios, movimento, crescimento e pontes.", summary: "Estacao de ativar ideias e colocá-las em movimento." },
  { name: "Verao", cue: "Expansao, manifestacao e visibilidade.", summary: "Estacao de materializar e dar visibilidade ao que foi construído." },
];

const ELEMENT_PROJECTS = [
  { key: "fogo", label: "Fogo", description: "Vida criativa, identidade e acao.", accent: "text-orange-600" },
  { key: "terra", label: "Terra", description: "Trabalho, estrutura e estabilidade.", accent: "text-emerald-600" },
  { key: "ar", label: "Ar", description: "Estudos, comunicacao e ideias.", accent: "text-sky-600" },
  { key: "agua", label: "Agua", description: "Vida pessoal, espiritualidade e cuidado interno.", accent: "text-indigo-600" },
] as const;

const LUNAR_WEEKS = [
  { name: "Semana 1", phase: "Semear", moon: "Lua Nova", description: "Iniciar, plantar intencoes e dar os primeiros passos." },
  { name: "Semana 2", phase: "Focar", moon: "Lua Crescente", description: "Agir com constancia e desenvolver o que foi iniciado." },
  { name: "Semana 3", phase: "Manifestar", moon: "Lua Cheia", description: "Dar visibilidade, colher sinais e expandir resultados." },
  { name: "Semana 4", phase: "Analisar", moon: "Lua Minguante", description: "Revisar, ajustar, finalizar e integrar aprendizados." },
] as const;

const DAY_ENERGY = [
  { day: 0, name: "Domingo", planet: "Sol", cue: "Consciencia, identidade e direcao." },
  { day: 1, name: "Segunda", planet: "Lua", cue: "Emocao e autocuidado." },
  { day: 2, name: "Terca", planet: "Marte", cue: "Acao e decisao." },
  { day: 3, name: "Quarta", planet: "Mercurio", cue: "Comunicacao e organizacao mental." },
  { day: 4, name: "Quinta", planet: "Jupiter", cue: "Expansao e visao." },
  { day: 5, name: "Sexta", planet: "Venus", cue: "Harmonia, prazer e relacoes." },
  { day: 6, name: "Sabado", planet: "Saturno", cue: "Estrutura, responsabilidade e pausa consciente." },
] as const;

const HOUSES = [
  { key: "casa1", label: "Casa 1", prompt: "Identidade e posicionamento" },
  { key: "casa2", label: "Casa 2", prompt: "Recursos e valor" },
  { key: "casa3", label: "Casa 3", prompt: "Comunicacao e estudos" },
  { key: "casa4", label: "Casa 4", prompt: "Base e lar interior" },
  { key: "casa5", label: "Casa 5", prompt: "Criatividade e prazer" },
  { key: "casa6", label: "Casa 6", prompt: "Rotina e autocuidado" },
  { key: "casa7", label: "Casa 7", prompt: "Relacoes e trocas" },
  { key: "casa8", label: "Casa 8", prompt: "Transformacao" },
  { key: "casa9", label: "Casa 9", prompt: "Expansao e visao" },
  { key: "casa10", label: "Casa 10", prompt: "Direcao profissional" },
  { key: "casa11", label: "Casa 11", prompt: "Comunidade e futuro" },
  { key: "casa12", label: "Casa 12", prompt: "Fechamento e espiritualidade" },
] as const;

function loadInitialPlanner(): PlannerState {
  if (typeof window === "undefined") return DEFAULT_PLANNER;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PLANNER;
    const parsed = JSON.parse(stored) as Partial<PlannerState>;
    return {
      ...DEFAULT_PLANNER,
      ...parsed,
      projects: { ...DEFAULT_PLANNER.projects, ...(parsed.projects || {}) },
      mandalaReview: { ...DEFAULT_PLANNER.mandalaReview, ...(parsed.mandalaReview || {}) },
      priorities: parsed.priorities?.length ? [...parsed.priorities, "", "", ""].slice(0, 3) : DEFAULT_PLANNER.priorities,
      habits: parsed.habits?.length ? parsed.habits : DEFAULT_PLANNER.habits,
      habitChecks: parsed.habitChecks || {},
    };
  } catch {
    return DEFAULT_PLANNER;
  }
}

function PlannerSheet({
  kicker,
  title,
  description,
  children,
  isDark,
  onBack,
}: {
  kicker: string;
  title: string;
  description: string;
  children: React.ReactNode;
  isDark: boolean;
  onBack: () => void;
}) {
  return (
    <section className={`rounded-3xl border p-5 shadow-sm sm:p-6 md:p-8 ${isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-black/10 bg-white text-gray-900"}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lilas-mistico">{kicker}</p>
          <h1 className="mt-3 font-atteron text-4xl leading-[0.95] sm:text-5xl md:text-6xl">{title}</h1>
          <p className={`mt-4 max-w-3xl text-base leading-7 md:text-lg ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>{description}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className={`rounded-full border px-4 py-2 text-sm font-medium ${isDark ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-gray-50"}`}
        >
          Voltar ao resumo
        </button>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function PlanejarPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [planner, setPlanner] = useState<PlannerState>(() => loadInitialPlanner());
  const [activeView, setActiveView] = useState<PlannerView>("overview");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(THEME_KEY) === "dark";
  });

  const selectedSeason = SEASONS.find((item) => item.name === planner.season) || SEASONS[0];
  const selectedWeek = LUNAR_WEEKS.find((item) => item.name === planner.week) || LUNAR_WEEKS[0];
  const todayEnergy = useMemo(() => DAY_ENERGY[new Date().getDay()], []);
  const completedPriorities = planner.priorities.filter(Boolean).length;
  const filledProjects = Object.values(planner.projects).filter(Boolean).length;
  const activeHabits = planner.habits.filter(Boolean).length;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(planner));
    }
  }, [isDark, planner]);

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

  function setProject(key: keyof PlannerState["projects"], value: string) {
    setPlanner((current) => ({ ...current, projects: { ...current.projects, [key]: value } }));
  }

  function setPriority(index: number, value: string) {
    setPlanner((current) => ({
      ...current,
      priorities: current.priorities.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function setHabit(index: number, value: string) {
    setPlanner((current) => ({
      ...current,
      habits: current.habits.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function toggleHabit(index: number, dayIndex: number) {
    setPlanner((current) => {
      const checks = current.habitChecks[String(index)] || Array.from({ length: 7 }, () => false);
      return {
        ...current,
        habitChecks: {
          ...current.habitChecks,
          [String(index)]: checks.map((checked, itemIndex) => (itemIndex === dayIndex ? !checked : checked)),
        },
      };
    });
  }

  const pageClass = isDark ? "bg-slate-950 text-slate-100" : "bg-offwhite-leve text-gray-900";
  const panelClass = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-black/10 bg-white text-gray-900";
  const softPanelClass = isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-marfim/70";
  const inputClass = isDark ? "border-white/10 bg-slate-950 text-slate-100 focus:ring-lilas-mistico" : "border-black/10 bg-white text-gray-900 focus:ring-lilas-mistico";
  const subtleClass = isDark ? "text-slate-400" : "text-muted-foreground";

  return (
    <main className={`min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-6 ${pageClass}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <PrivateTopbar
          user={currentUser}
          isDark={isDark}
          onToggleTheme={() => setIsDark((value) => !value)}
          onSignOut={handleSignOut}
          kicker="Escritorio de Planejamento Ciclico"
          title="Planejar"
        />

        {activeView === "overview" ? (
          <>
            <section className={`rounded-3xl border p-4 shadow-sm sm:rounded-[2rem] sm:p-6 md:p-8 ${panelClass}`}>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-lilas-mistico">Planner Ciclico</p>
                  <h1 className="mt-3 font-atteron text-4xl leading-[0.95] sm:text-5xl md:text-7xl">Do macro ao dia</h1>
                  <p className={`mt-4 max-w-2xl text-base leading-7 md:text-lg ${subtleClass}`}>
                    O planner fisico traduz o metodo em uma hierarquia clara: Ano, Estacao, Lunacao, Semana e Dia. Aqui o foco e reproduzir essa jornada com mais clareza do que um dashboard comum.
                  </p>

                  <div className={`mt-6 grid grid-cols-5 overflow-hidden rounded-2xl border text-center text-[0.68rem] uppercase tracking-[0.12em] sm:text-xs ${softPanelClass}`}>
                    {["Ano", "Estacao", "Lunacao", "Semana", "Dia"].map((item, index) => (
                      <div key={item} className={`px-2 py-3 ${index > 0 ? isDark ? "border-l border-white/10" : "border-l border-black/10" : ""}`}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <aside className={`rounded-3xl border p-5 ${softPanelClass}`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Hoje</p>
                  <h2 className="mt-2 font-atteron text-3xl">{todayEnergy.name} · {todayEnergy.planet}</h2>
                  <p className={`mt-2 text-sm leading-6 ${subtleClass}`}>{todayEnergy.cue}</p>
                  <Textarea
                    value={planner.dailyAction}
                    onChange={(event) => setPlanner((current) => ({ ...current, dailyAction: event.target.value }))}
                    placeholder="Qual e a acao consciente de hoje?"
                    className={`mt-4 min-h-[120px] ${inputClass}`}
                  />
                </aside>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <button type="button" onClick={() => setActiveView("season")} className={`rounded-3xl border p-5 text-left transition ${panelClass}`}>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-lilas-mistico"><Trees className="h-4 w-4" /> Estacao</p>
                <h2 className="mt-3 font-atteron text-3xl">{planner.season}</h2>
                <p className={`mt-3 text-sm leading-6 ${subtleClass}`}>{selectedSeason.summary}</p>
                <p className="mt-4 text-sm font-medium">{filledProjects}/4 projetos definidos</p>
              </button>

              <button type="button" onClick={() => setActiveView("lunation")} className={`rounded-3xl border p-5 text-left transition ${panelClass}`}>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-lilas-mistico"><MoonStar className="h-4 w-4" /> Lunacao</p>
                <h2 className="mt-3 font-atteron text-3xl">{planner.lunationSign || "Abrir lunacao"}</h2>
                <p className={`mt-3 text-sm leading-6 ${subtleClass}`}>Signo, casa ativada, intencao principal e tres prioridades para os proximos 28 dias.</p>
                <p className="mt-4 text-sm font-medium">{completedPriorities}/3 prioridades preenchidas</p>
              </button>

              <button type="button" onClick={() => setActiveView("week")} className={`rounded-3xl border p-5 text-left transition ${panelClass}`}>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-lilas-mistico"><CalendarDays className="h-4 w-4" /> Semana</p>
                <h2 className="mt-3 font-atteron text-3xl">{selectedWeek.phase}</h2>
                <p className={`mt-3 text-sm leading-6 ${subtleClass}`}>{selectedWeek.description}</p>
                <p className="mt-4 text-sm font-medium">{selectedWeek.name}</p>
              </button>

              <button type="button" onClick={() => setActiveView("day")} className={`rounded-3xl border p-5 text-left transition ${panelClass}`}>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-lilas-mistico"><SunMedium className="h-4 w-4" /> Dia</p>
                <h2 className="mt-3 font-atteron text-3xl">{todayEnergy.planet}</h2>
                <p className={`mt-3 text-sm leading-6 ${subtleClass}`}>{todayEnergy.cue}</p>
                <p className="mt-4 text-sm font-medium">Acao do dia</p>
              </button>

              <button type="button" onClick={() => setActiveView("habits")} className={`rounded-3xl border p-5 text-left transition ${panelClass}`}>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-lilas-mistico"><ListChecks className="h-4 w-4" /> Habitos</p>
                <h2 className="mt-3 font-atteron text-3xl">Rastreador</h2>
                <p className={`mt-3 text-sm leading-6 ${subtleClass}`}>Micros acoes diarias para sustentar a intencao da lunacao.</p>
                <p className="mt-4 text-sm font-medium">{activeHabits} habitos ativos</p>
              </button>

              <button type="button" onClick={() => setActiveView("season")} className={`rounded-3xl border p-5 text-left transition ${panelClass}`}>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-lilas-mistico"><Compass className="h-4 w-4" /> Mandala</p>
                <h2 className="mt-3 font-atteron text-3xl">12 casas</h2>
                <p className={`mt-3 text-sm leading-6 ${subtleClass}`}>Revisao breve das areas da vida antes de decidir o foco da estacao.</p>
                <p className="mt-4 text-sm font-medium">Conecta com a mandala do Escritorio</p>
              </button>
            </section>
          </>
        ) : null}

        {activeView === "season" ? (
          <PlannerSheet
            kicker="Folha da estacao"
            title={planner.season}
            description="No planner fisico, a estacao comeca com revisao das areas da vida e definicao de quatro projetos estrategicos, um para cada elemento."
            isDark={isDark}
            onBack={() => setActiveView("overview")}
          >
            <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className={`rounded-3xl border p-5 ${softPanelClass}`}>
                <p className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Energia da estacao</p>
                <select
                  value={planner.season}
                  onChange={(event) => setPlanner((current) => ({ ...current, season: event.target.value }))}
                  className={`mt-3 w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                >
                  {SEASONS.map((season) => <option key={season.name} value={season.name}>{season.name}</option>)}
                </select>
                <p className={`mt-4 text-sm leading-6 ${subtleClass}`}>{selectedSeason.cue}</p>
              </div>

              <div className={`rounded-3xl border p-5 ${softPanelClass}`}>
                <p className="text-sm font-medium">Revisao das 12 areas</p>
                <p className={`mt-2 text-sm leading-6 ${subtleClass}`}>Atribua uma leitura curta para cada casa antes de decidir os projetos da estacao.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {HOUSES.map((house) => (
                    <div key={house.key} className={`rounded-2xl border p-3 ${softPanelClass}`}>
                      <p className="text-sm font-semibold">{house.label}</p>
                      <p className={`mt-1 text-xs ${subtleClass}`}>{house.prompt}</p>
                      <Input
                        value={planner.mandalaReview[house.key] || ""}
                        onChange={(event) => setPlanner((current) => ({
                          ...current,
                          mandalaReview: { ...current.mandalaReview, [house.key]: event.target.value },
                        }))}
                        placeholder="Nota, palavra-chave ou foco"
                        className={`mt-3 ${inputClass}`}
                      />
                    </div>
                  ))}
                </div>
                <Textarea
                  value={planner.seasonReview}
                  onChange={(event) => setPlanner((current) => ({ ...current, seasonReview: event.target.value }))}
                  placeholder="Que areas pedem mais cuidado, maturidade ou movimento nesta estacao?"
                  className={`mt-4 min-h-[120px] ${inputClass}`}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {ELEMENT_PROJECTS.map((item) => (
                <div key={item.key} className={`rounded-3xl border p-4 ${softPanelClass}`}>
                  <p className={`font-semibold ${item.accent}`}>{item.label}</p>
                  <p className={`mt-1 text-xs leading-5 ${subtleClass}`}>{item.description}</p>
                  <Input
                    value={planner.projects[item.key] || ""}
                    onChange={(event) => setProject(item.key, event.target.value)}
                    placeholder="Projeto da estacao"
                    className={`mt-4 ${inputClass}`}
                  />
                </div>
              ))}
            </div>
          </PlannerSheet>
        ) : null}

        {activeView === "lunation" ? (
          <PlannerSheet
            kicker="Folha da lunacao"
            title={planner.lunationSign || "Abrir lunacao"}
            description="No planner fisico, a lunacao comeca na Lua Nova: identificar o signo, localizar a casa ativada, definir a intencao e as tres prioridades praticas do ciclo."
            isDark={isDark}
            onBack={() => setActiveView("overview")}
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className={`rounded-3xl border p-5 ${softPanelClass}`}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    value={planner.lunationSign}
                    onChange={(event) => setPlanner((current) => ({ ...current, lunationSign: event.target.value }))}
                    placeholder="Signo da Lua Nova"
                    className={inputClass}
                  />
                  <Input
                    value={planner.activatedHouse}
                    onChange={(event) => setPlanner((current) => ({ ...current, activatedHouse: event.target.value }))}
                    placeholder="Casa ativada"
                    className={inputClass}
                  />
                </div>
                <Textarea
                  value={planner.intention}
                  onChange={(event) => setPlanner((current) => ({ ...current, intention: event.target.value }))}
                  placeholder="Qual e a intencao principal deste ciclo de 28 dias?"
                  className={`mt-4 min-h-[120px] ${inputClass}`}
                />
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {planner.priorities.map((priority, index) => (
                    <Input
                      key={index}
                      value={priority}
                      onChange={(event) => setPriority(index, event.target.value)}
                      placeholder={`Prioridade ${index + 1}`}
                      className={inputClass}
                    />
                  ))}
                </div>
              </div>

              <div className={`rounded-3xl border p-5 ${softPanelClass}`}>
                <p className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Resumo da lunacao</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.14em] ${subtleClass}`}>Signo</p>
                    <p className="mt-1 font-medium">{planner.lunationSign || "Ainda nao definido"}</p>
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-[0.14em] ${subtleClass}`}>Casa ativada</p>
                    <p className="mt-1 font-medium">{planner.activatedHouse || "Ainda nao definida"}</p>
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-[0.14em] ${subtleClass}`}>Foco</p>
                    <p className="mt-1 text-sm leading-6">{planner.intention || "Escreva a direcao principal desta lunacao."}</p>
                  </div>
                </div>
              </div>
            </div>
          </PlannerSheet>
        ) : null}

        {activeView === "week" ? (
          <PlannerSheet
            kicker="Folha semanal"
            title={selectedWeek.phase}
            description="Cada semana acompanha uma fase da Lua. Aqui a ideia e sustentar foco, nao lotar a agenda."
            isDark={isDark}
            onBack={() => setActiveView("overview")}
          >
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="grid gap-2">
                {LUNAR_WEEKS.map((week) => (
                  <button
                    key={week.name}
                    type="button"
                    onClick={() => setPlanner((current) => ({ ...current, week: week.name }))}
                    className={`rounded-2xl border p-4 text-left transition ${planner.week === week.name ? "border-lilas-mistico bg-lilas-mistico/10" : softPanelClass}`}
                  >
                    <span className="block text-sm font-semibold">{week.name} · {week.phase}</span>
                    <span className={`mt-1 block text-xs ${subtleClass}`}>{week.moon}</span>
                  </button>
                ))}
              </div>

              <div className={`rounded-3xl border p-5 ${softPanelClass}`}>
                <p className="text-sm font-medium">Foco da semana</p>
                <p className={`mt-2 text-sm leading-6 ${subtleClass}`}>{selectedWeek.description}</p>
                <Textarea
                  value={planner.weeklyFocus}
                  onChange={(event) => setPlanner((current) => ({ ...current, weeklyFocus: event.target.value }))}
                  placeholder="O que esta fase da Lua pede de voce nesta semana?"
                  className={`mt-4 min-h-[160px] ${inputClass}`}
                />
              </div>
            </div>
          </PlannerSheet>
        ) : null}

        {activeView === "day" ? (
          <PlannerSheet
            kicker="Folha do dia"
            title={`${todayEnergy.name} · ${todayEnergy.planet}`}
            description="O planner usa a energia dos dias como orientacao estrategica, nao como regra rigida."
            isDark={isDark}
            onBack={() => setActiveView("overview")}
          >
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className={`rounded-3xl border p-5 ${softPanelClass}`}>
                <p className="text-sm font-medium">Energia do dia</p>
                <p className={`mt-3 text-sm leading-6 ${subtleClass}`}>{todayEnergy.cue}</p>
              </div>
              <div className={`rounded-3xl border p-5 ${softPanelClass}`}>
                <p className="text-sm font-medium">Acao consciente</p>
                <Textarea
                  value={planner.dailyAction}
                  onChange={(event) => setPlanner((current) => ({ ...current, dailyAction: event.target.value }))}
                  placeholder="Que acao concreta faz sentido hoje?"
                  className={`mt-4 min-h-[140px] ${inputClass}`}
                />
                <p className="mt-4 text-sm font-medium">Check-in do dia</p>
                <Textarea
                  value={planner.dailyCheckIn}
                  onChange={(event) => setPlanner((current) => ({ ...current, dailyCheckIn: event.target.value }))}
                  placeholder="Como esta sua energia hoje?"
                  className={`mt-4 min-h-[120px] ${inputClass}`}
                />
              </div>
            </div>
          </PlannerSheet>
        ) : null}

        {activeView === "habits" ? (
          <PlannerSheet
            kicker="Rastreador"
            title="Habitos da lunacao"
            description="No planner fisico, o rastreador transforma intencao em pratica. Aqui voce acompanha micro-acoes diarias ao longo da lunacao."
            isDark={isDark}
            onBack={() => setActiveView("overview")}
          >
            <div className="space-y-3">
              {planner.habits.map((habit, index) => {
                const checks = planner.habitChecks[String(index)] || Array.from({ length: 7 }, () => false);
                return (
                  <div key={index} className={`grid gap-3 rounded-2xl border p-3 md:grid-cols-[minmax(0,1fr)_220px] ${softPanelClass}`}>
                    <Input
                      value={habit}
                      onChange={(event) => setHabit(index, event.target.value)}
                      placeholder={`Micro-habito ${index + 1}`}
                      className={inputClass}
                    />
                    <div className="grid grid-cols-7 gap-1">
                      {checks.map((checked, dayIndex) => (
                        <button
                          key={dayIndex}
                          type="button"
                          onClick={() => toggleHabit(index, dayIndex)}
                          className={`h-9 rounded-lg border text-[0.68rem] ${checked ? "border-lilas-mistico bg-lilas-mistico text-white" : isDark ? "border-white/10 bg-slate-950" : "border-black/10 bg-white"}`}
                        >
                          {dayIndex + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </PlannerSheet>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link to="/app" className="rounded-full bg-lilas-mistico px-5 py-3 text-sm font-medium text-white">
            Voltar ao Escritorio
          </Link>
          <Link to="/galeria" className={`rounded-full border px-5 py-3 text-sm font-medium ${isDark ? "border-white/10" : "border-black/10"}`}>
            Abrir Galeria
          </Link>
        </div>
      </div>
    </main>
  );
}

