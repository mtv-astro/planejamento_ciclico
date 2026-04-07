import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, Compass, Expand, LayoutGrid, MessageCircle, MoonStar, Sparkles } from "lucide-react";
import PrivateTopbar from "@/components/PrivateTopbar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { callFunction } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";

type CurrentUser = {
  email?: string | null;
  username?: string | null;
  display_name?: string | null;
};

type CircuitSection = "praca" | "pessoal" | "gavetas" | "mural";

type HouseNote = {
  title: string;
  intention: string;
  notes: string;
  tasks: string;
};

type HouseNotes = Record<number, HouseNote>;

type MandalaSticker = {
  id: string;
  label: string;
  kind: "sign" | "planet";
  x: number;
  y: number;
};

type MandalaApiSticker = {
  id?: string;
  label?: string;
  kind?: "sign" | "planet" | "custom";
  x?: number;
  y?: number;
};

type CommunityPost = {
  id: string;
  title: string;
  body?: string | null;
  kind?: string | null;
  pinned?: boolean | null;
};

const THEME_KEY = "pc-gallery-theme";
const HOUSE_NOTES_KEY = "pc-house-notes-v1";
const MANDALA_STICKERS_KEY = "pc-mandala-stickers-v1";
const MANDALA_SAVE_DEBOUNCE_MS = 900;

const sections: Array<{ id: CircuitSection; label: string; short: string }> = [
  { id: "praca", label: "Praca central", short: "Coletivo" },
  { id: "pessoal", label: "Area pessoal", short: "Planner" },
  { id: "gavetas", label: "Gavetas", short: "Ferramentas" },
  { id: "mural", label: "Mural publico", short: "Comunidade" },
];

const LOOPED_SECTIONS = [...sections, ...sections, ...sections];
const LOOP_START_INDEX = sections.length;

const houseCopy = [
  { id: 1, title: "Casa 1", theme: "Identidade e comecos", prompt: "Como voce quer iniciar este ciclo?" },
  { id: 2, title: "Casa 2", theme: "Recursos e valores", prompt: "O que precisa ser nutrido e valorizado?" },
  { id: 3, title: "Casa 3", theme: "Comunicacao e estudos", prompt: "Que ideias precisam circular melhor?" },
  { id: 4, title: "Casa 4", theme: "Lar e raizes", prompt: "O que pede recolhimento e base?" },
  { id: 5, title: "Casa 5", theme: "Criatividade e prazer", prompt: "O que quer ganhar expressao?" },
  { id: 6, title: "Casa 6", theme: "Rotina e metodo", prompt: "Que habito sustenta seu proximo passo?" },
  { id: 7, title: "Casa 7", theme: "Parcerias e espelhos", prompt: "Que acordo precisa de mais clareza?" },
  { id: 8, title: "Casa 8", theme: "Transformacao", prompt: "O que precisa ser encerrado ou integrado?" },
  { id: 9, title: "Casa 9", theme: "Expansao e visao", prompt: "Que horizonte esta te chamando?" },
  { id: 10, title: "Casa 10", theme: "Direcao e carreira", prompt: "Que marco publico precisa de foco?" },
  { id: 11, title: "Casa 11", theme: "Comunidade e futuro", prompt: "Que rede sustenta esse ciclo?" },
  { id: 12, title: "Casa 12", theme: "Fechamento e inconsciente", prompt: "O que precisa ser liberado antes de recomecar?" },
] as const;

const stickerPalette: Array<Omit<MandalaSticker, "id" | "x" | "y">> = [
  { label: "Aries", kind: "sign" },
  { label: "Touro", kind: "sign" },
  { label: "Gemeos", kind: "sign" },
  { label: "Cancer", kind: "sign" },
  { label: "Leao", kind: "sign" },
  { label: "Virgem", kind: "sign" },
  { label: "Libra", kind: "sign" },
  { label: "Escorpiao", kind: "sign" },
  { label: "Sagitario", kind: "sign" },
  { label: "Capricornio", kind: "sign" },
  { label: "Aquario", kind: "sign" },
  { label: "Peixes", kind: "sign" },
  { label: "Sol", kind: "planet" },
  { label: "Lua", kind: "planet" },
  { label: "Mercurio", kind: "planet" },
  { label: "Venus", kind: "planet" },
  { label: "Marte", kind: "planet" },
  { label: "Jupiter", kind: "planet" },
  { label: "Saturno", kind: "planet" },
  { label: "Urano", kind: "planet" },
  { label: "Netuno", kind: "planet" },
  { label: "Plutao", kind: "planet" },
];

function getUserName(user: CurrentUser | null) {
  return user?.display_name || user?.username || user?.email?.split("@")[0] || "deusa";
}

function getMandalaStatusLabel(status: "loading" | "synced" | "local" | "saving" | "error") {
  if (status === "loading") return "Carregando mandala...";
  if (status === "saving") return "Salvando mandala...";
  if (status === "synced") return "Mandala salva no Supabase.";
  if (status === "local") return "Modo local: aguardando conexao com o Supabase.";
  return "Nao foi possivel salvar agora. As alteracoes seguem neste navegador.";
}

export default function AppHomePage() {
  const navigate = useNavigate();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Record<number, HTMLElement | null>>({});
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeSection, setActiveSection] = useState<CircuitSection>("praca");
  const [absoluteIndex, setAbsoluteIndex] = useState(LOOP_START_INDEX);
  const [activeHouse, setActiveHouse] = useState<number | null>(null);
  const [houseNotes, setHouseNotes] = useState<HouseNotes>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem(HOUSE_NOTES_KEY) || "{}") as HouseNotes;
    } catch {
      return {};
    }
  });
  const [isMandalaExpanded, setIsMandalaExpanded] = useState(false);
  const [stickers, setStickers] = useState<MandalaSticker[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(MANDALA_STICKERS_KEY) || "[]") as MandalaSticker[];
    } catch {
      return [];
    }
  });
  const [mandalaLoaded, setMandalaLoaded] = useState(false);
  const [mandalaStatus, setMandalaStatus] = useState<"loading" | "synced" | "local" | "saving" | "error">("loading");
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(THEME_KEY) === "dark";
  });

  const userName = useMemo(() => getUserName(currentUser), [currentUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    }
  }, [isDark]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HOUSE_NOTES_KEY, JSON.stringify(houseNotes));
    }
  }, [houseNotes]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MANDALA_STICKERS_KEY, JSON.stringify(stickers));
    }
  }, [stickers]);

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

  useEffect(() => {
    async function loadCommunityPosts() {
      try {
        const data = await callFunction("list-community-posts");
        setCommunityPosts((data.items || []) as CommunityPost[]);
      } catch {
        setCommunityPosts([]);
      }
    }

    loadCommunityPosts();
  }, []);

  useEffect(() => {
    async function loadMandala() {
      try {
        const data = await callFunction("get-current-user-mandala");
        const nextHouseNotes = (data.house_notes || {}) as HouseNotes;
        const nextStickers = Array.isArray(data.stickers)
          ? data.stickers
              .filter((sticker: MandalaApiSticker) => sticker.kind === "sign" || sticker.kind === "planet")
              .map((sticker: MandalaApiSticker) => ({
                id: sticker.id || `${sticker.kind}-${sticker.label}-${Date.now()}`,
                label: sticker.label || "",
                kind: sticker.kind as "sign" | "planet",
                x: Number(sticker.x) || 200,
                y: Number(sticker.y) || 200,
              }))
              .filter((sticker: MandalaSticker) => sticker.label)
          : [];

        setHouseNotes(nextHouseNotes);
        setStickers(nextStickers);
        setMandalaStatus("synced");
      } catch {
        setMandalaStatus("local");
      } finally {
        setMandalaLoaded(true);
      }
    }

    loadMandala();
  }, []);

  useEffect(() => {
    if (!mandalaLoaded) return;

    const timeoutId = window.setTimeout(async () => {
      try {
        setMandalaStatus("saving");
        await callFunction("save-current-user-mandala", {
          house_notes: houseNotes,
          stickers,
        });
        setMandalaStatus("synced");
      } catch {
        setMandalaStatus("error");
      }
    }, MANDALA_SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [houseNotes, mandalaLoaded, stickers]);

  useEffect(() => {
    const initialPanel = panelRefs.current[LOOP_START_INDEX];
    initialPanel?.scrollIntoView({ behavior: "auto", inline: "start", block: "nearest" });
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

  const scrollToAbsoluteIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    panelRefs.current[index]?.scrollIntoView({ behavior, inline: "start", block: "nearest" });
  }, []);

  function scrollToSection(id: CircuitSection) {
    const middleIndex = LOOP_START_INDEX + sections.findIndex((section) => section.id === id);
    scrollToAbsoluteIndex(middleIndex);
    setAbsoluteIndex(middleIndex);
    setActiveSection(id);
  }

  function step(direction: "prev" | "next") {
    const delta = direction === "next" ? 1 : -1;
    let baseIndex = absoluteIndex;

    if (baseIndex >= sections.length * 2) baseIndex -= sections.length;
    if (baseIndex < sections.length) baseIndex += sections.length;

    const targetIndex = baseIndex + delta;
    const targetSection = LOOPED_SECTIONS[targetIndex]?.id;
    if (!targetSection) return;

    setAbsoluteIndex(targetIndex);
    setActiveSection(targetSection);
    scrollToAbsoluteIndex(targetIndex);

    window.setTimeout(() => {
      if (targetIndex >= sections.length * 2) {
        const normalized = targetIndex - sections.length;
        setAbsoluteIndex(normalized);
        scrollToAbsoluteIndex(normalized, "auto");
      }

      if (targetIndex < sections.length) {
        const normalized = targetIndex + sections.length;
        setAbsoluteIndex(normalized);
        scrollToAbsoluteIndex(normalized, "auto");
      }
    }, 650);
  }

  const pageClass = isDark ? "bg-slate-950 text-slate-100" : "bg-offwhite-leve text-gray-900";
  const panelClass = isDark ? "border-white/10 bg-slate-900/90 text-slate-100" : "border-black/10 bg-white/90 text-gray-900";
  const softPanelClass = isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white/70";
  const subtleClass = isDark ? "text-slate-400" : "text-muted-foreground";

  function updateHouseNote(house: number, patch: Partial<HouseNote>) {
    setHouseNotes((prev) => ({
      ...prev,
      [house]: {
        title: "",
        intention: "",
        notes: "",
        tasks: "",
        ...(prev[house] || {}),
        ...patch,
      },
    }));
  }

  return (
    <main className={`min-h-screen overflow-hidden px-4 py-6 md:px-6 ${pageClass}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PrivateTopbar
          user={currentUser}
          isDark={isDark}
          onToggleTheme={() => setIsDark((value) => !value)}
          onSignOut={handleSignOut}
          kicker="Escritorio de Planejamento Ciclico"
          title={`Bem-vinda ao seu espaco, ${userName}`}
        />

        <section className={`relative overflow-hidden rounded-[2rem] border p-5 shadow-sm ${panelClass}`}>
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute left-[-10%] top-[-25%] h-72 w-72 rounded-full bg-lilas-mistico/20 blur-3xl" />
            <div className="absolute bottom-[-35%] right-[-10%] h-96 w-96 rounded-full bg-terracota/20 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.22em] text-lilas-mistico">Circuito principal</p>
                <h2 className="mt-3 text-3xl font-atteron md:text-5xl">Um escritorio digital para circular pelo seu ciclo.</h2>
                <p className={`mt-4 max-w-2xl text-sm md:text-base ${subtleClass}`}>
                  Deslize na horizontal para atravessar a praca, sua area pessoal, as gavetas de ferramentas e o mural publico. O circuito e continuo: depois do mural, ele volta para a praca.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => step("prev")}
                  className={`rounded-full border p-3 transition ${softPanelClass}`}
                  aria-label="Voltar no circuito"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => step("next")}
                  className={`rounded-full border p-3 transition ${softPanelClass}`}
                  aria-label="Avancar no circuito"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`min-w-fit rounded-full border px-4 py-2 text-sm transition ${
                    activeSection === section.id
                      ? "border-lilas-mistico bg-lilas-mistico text-white"
                      : softPanelClass
                  }`}
                >
                  <span className="font-medium">{section.label}</span>
                  <span className="ml-2 opacity-70">{section.short}</span>
                </button>
              ))}
            </div>

            <div className={`rounded-2xl border px-4 py-3 text-sm ${softPanelClass}`}>
              Circuito ativo: Praca central, Area pessoal, Gavetas, Mural publico, Praca central.
            </div>

            <div
              ref={scrollerRef}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3"
              onScroll={(event) => {
                const panels = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-circuit-index]"));
                const containerLeft = event.currentTarget.getBoundingClientRect().left;
                const closest = panels.reduce<{ id: CircuitSection; index: number; distance: number } | null>((best, panel) => {
                  const rawId = panel.dataset.circuitSection as CircuitSection | undefined;
                  const rawIndex = Number(panel.dataset.circuitIndex);
                  if (!rawId || Number.isNaN(rawIndex)) return best;
                  const distance = Math.abs(panel.getBoundingClientRect().left - containerLeft);
                  if (!best || distance < best.distance) return { id: rawId, index: rawIndex, distance };
                  return best;
                }, null);
                if (closest?.id) {
                  setActiveSection(closest.id);
                  setAbsoluteIndex(closest.index);
                }
              }}
            >
              {LOOPED_SECTIONS.map((section, index) => (
                <CircuitPanel
                  key={`${section.id}-${index}`}
                  id={`${section.id}-${index}`}
                  section={section.id}
                  index={index}
                  className={panelClass}
                  panelRef={(node) => {
                    panelRefs.current[index] = node;
                  }}
                >
                  <CircuitSectionContent
                    section={section.id}
                    softPanelClass={softPanelClass}
                    subtleClass={subtleClass}
                    houseNotes={houseNotes}
                    stickers={stickers}
                    mandalaStatus={mandalaStatus}
                    communityPosts={communityPosts}
                    onOpenHouse={setActiveHouse}
                    onExpandMandala={() => setIsMandalaExpanded(true)}
                  />
                </CircuitPanel>
              ))}
            </div>
          </div>
        </section>
      </div>

      <HouseNotesDialog
        house={activeHouse}
        note={activeHouse ? houseNotes[activeHouse] : undefined}
        isDark={isDark}
        onClose={() => setActiveHouse(null)}
        onChange={(patch) => {
          if (activeHouse) updateHouseNote(activeHouse, patch);
        }}
      />

      <ExpandedMandalaDialog
        open={isMandalaExpanded}
        stickers={stickers}
        houseNotes={houseNotes}
        isDark={isDark}
        onClose={() => setIsMandalaExpanded(false)}
        onOpenHouse={setActiveHouse}
        onStickersChange={setStickers}
      />
    </main>
  );
}

function CircuitPanel({
  id,
  section,
  index,
  className,
  children,
  panelRef,
}: {
  id: string;
  section: CircuitSection;
  index: number;
  className: string;
  children: ReactNode;
  panelRef: (node: HTMLElement | null) => void;
}) {
  return (
    <section
      id={`circuit-${id}`}
      ref={panelRef}
      data-circuit-section={section}
      data-circuit-index={index}
      className={`min-w-full snap-center rounded-[1.75rem] border p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

function CircuitSectionContent({
  section,
  softPanelClass,
  subtleClass,
  houseNotes,
  stickers,
  mandalaStatus,
  communityPosts,
  onOpenHouse,
  onExpandMandala,
}: {
  section: CircuitSection;
  softPanelClass: string;
  subtleClass: string;
  houseNotes: HouseNotes;
  stickers: MandalaSticker[];
  mandalaStatus: "loading" | "synced" | "local" | "saving" | "error";
  communityPosts: CommunityPost[];
  onOpenHouse: (house: number) => void;
  onExpandMandala: () => void;
}) {
  if (section === "praca") {
    return (
      <>
        <PanelHeader
          icon={<Compass className="h-5 w-5" />}
          kicker="Praca central"
          title="O ponto de encontro do ciclo"
          text="Aqui entram os recados da equipe, avisos importantes e o calendario vivo da comunidade."
        />
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <FeatureCard title="Jornal da equipe" eyebrow="Mural" className={softPanelClass}>
            {communityPosts.length > 0 ? (
              <div className="space-y-3">
                {communityPosts.slice(0, 3).map((post) => (
                  <article key={post.id} className="rounded-2xl border border-lilas-mistico/20 p-3">
                    <p className="text-sm font-semibold">{post.pinned ? "Fixado - " : ""}{post.title}</p>
                    {post.body ? <p className="mt-1 text-sm opacity-75">{post.body}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <>
                <p>Abertura de semana, atualizacoes da comunidade e direcoes importantes aparecem aqui.</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>Encontro ao vivo da semana</li>
                  <li>Recado da mentoria</li>
                  <li>Destaque do ciclo atual</li>
                </ul>
              </>
            )}
          </FeatureCard>
          <FeatureCard title="Calendario da comunidade" eyebrow="Agenda coletiva" className={softPanelClass}>
            <div className="space-y-3 text-sm">
              <CalendarLine day="Seg" title="Planejamento semanal" />
              <CalendarLine day="Qui" title="Aula ou encontro guiado" />
              <CalendarLine day="Lua" title="Abertura de lunacao" />
            </div>
          </FeatureCard>
        </div>
      </>
    );
  }

  if (section === "pessoal") {
    return (
      <>
        <PanelHeader
          icon={<MoonStar className="h-5 w-5" />}
          kicker="Area pessoal"
          title="Seu planner ciclico aberto"
          text="A mandala pessoal organiza as 12 casas, suas anotacoes e os movimentos do seu ciclo."
        />
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={`rounded-3xl border p-5 ${softPanelClass}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Mandala pessoal</p>
                <h4 className="text-xl font-atteron">12 casas</h4>
              </div>
              <button
                type="button"
                onClick={onExpandMandala}
                className="inline-flex items-center gap-2 rounded-full bg-lilas-mistico px-4 py-2 text-sm font-medium text-white transition hover:bg-terracota"
              >
                <Expand className="h-4 w-4" />
                Expandir
              </button>
            </div>
            <MandalaWheel houseNotes={houseNotes} stickers={stickers} onOpenHouse={onOpenHouse} />
            <p className={`mt-4 text-center text-sm ${subtleClass}`}>Clique em uma casa para abrir notas, intencoes e tarefas daquela area.</p>
            <p className={`mt-2 text-center text-xs ${subtleClass}`}>{getMandalaStatusLabel(mandalaStatus)}</p>
          </div>
          <FeatureCard title="Mural pessoal" eyebrow="Planejamento individual" className={softPanelClass}>
            <div className="space-y-3">
              <Note title="Intencao do ciclo" text="Dar forma ao que esta disperso e sustentar ritmo sem excesso." />
              <Note title="Foco da semana" text="Organizar a base antes de abrir novas frentes." />
              <Note title="Calendario pessoal" text="Datas, ciclos e acontecimentos individuais entram nesta camada." />
            </div>
          </FeatureCard>
        </div>
      </>
    );
  }

  if (section === "gavetas") {
    return (
      <>
        <PanelHeader
          icon={<LayoutGrid className="h-5 w-5" />}
          kicker="Gavetas de ferramentas"
          title="Recursos praticos para agir"
          text="Aqui ficam os acessos rapidos: planejamento, galeria, biblioteca e utilidades complementares."
        />
        <div className={`mb-5 rounded-3xl border p-5 ${softPanelClass}`}>
          <p className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Modulo ativo</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h4 className="text-2xl font-atteron">Galeria de Mapas</h4>
              <p className={`mt-2 max-w-2xl text-sm ${subtleClass}`}>
                A galeria continua viva como modulo astral do Escritorio: mapas salvos, imagens, download e mapa principal.
              </p>
            </div>
            <Link to="/galeria" className="w-fit rounded-full bg-lilas-mistico px-5 py-3 text-sm font-medium text-white transition hover:bg-terracota">
              Abrir Galeria
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ToolLink to="/planejar" title="Planejar" text="Semana, prioridades e habitos." icon={<CalendarDays className="h-5 w-5" />} className={softPanelClass} />
          <ToolLink to="/galeria" title="Galeria de Mapas" text="Mapas, imagens e downloads." icon={<MoonStar className="h-5 w-5" />} className={softPanelClass} />
          <ToolLink to="/biblioteca" title="Biblioteca" text="Aulas, trilhas e materiais." icon={<BookOpen className="h-5 w-5" />} className={softPanelClass} />
          <ToolLink to="/conta" title="Conta" text="Perfil, senha e configuracoes." icon={<Sparkles className="h-5 w-5" />} className={softPanelClass} />
        </div>
      </>
    );
  }

  return (
    <>
      <PanelHeader
        icon={<MessageCircle className="h-5 w-5" />}
        kicker="Mural publico"
        title="Rede interna da comunidade"
        text="Espaco reservado para publicacoes, trocas e presenca coletiva. Nesta fase, entra como estrutura preparada."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <CommunityPost title="Compartilhar intencao" text="A usuaria podera publicar uma versao publica da intencao do ciclo." className={softPanelClass} />
        <CommunityPost title="Trocas guiadas" text="Posts por ciclo, desafios e comentarios estruturados." className={softPanelClass} />
        <CommunityPost title="Retorno a praca" text="Ao continuar deslizando, o circuito volta para a Praca central." className={softPanelClass} />
      </div>
    </>
  );
}

function PanelHeader({ icon, kicker, title, text }: { icon: ReactNode; kicker: string; title: string; text: string }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-lilas-mistico/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-lilas-mistico">
          {icon}
          {kicker}
        </div>
        <h3 className="text-2xl font-atteron md:text-4xl">{title}</h3>
        <p className="mt-3 max-w-2xl text-sm opacity-75 md:text-base">{text}</p>
      </div>
    </div>
  );
}

function FeatureCard({ eyebrow, title, className, children }: { eyebrow: string; title: string; className: string; children: ReactNode }) {
  return (
    <article className={`rounded-3xl border p-5 ${className}`}>
      <p className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">{eyebrow}</p>
      <h4 className="mt-2 text-xl font-atteron">{title}</h4>
      <div className="mt-4 text-sm opacity-80">{children}</div>
    </article>
  );
}

function CalendarLine({ day, title }: { day: string; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-lilas-mistico/20 p-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-lilas-mistico text-xs font-semibold text-white">{day}</span>
      <span>{title}</span>
    </div>
  );
}

function Note({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-lilas-mistico/20 p-4">
      <strong className="block">{title}</strong>
      <span className="mt-1 block text-sm opacity-75">{text}</span>
    </div>
  );
}

function ToolLink({ to, icon, title, text, className }: { to: string; icon: ReactNode; title: string; text: string; className: string }) {
  return (
    <Link to={to} className={`group rounded-3xl border p-5 transition hover:-translate-y-1 ${className}`}>
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-lilas-mistico text-white transition group-hover:bg-terracota">
        {icon}
      </div>
      <h4 className="text-xl font-atteron">{title}</h4>
      <p className="mt-2 text-sm opacity-75">{text}</p>
    </Link>
  );
}

function CommunityPost({ title, text, className }: { title: string; text: string; className: string }) {
  return (
    <article className={`rounded-3xl border p-5 ${className}`}>
      <p className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Em preparacao</p>
      <h4 className="mt-2 text-xl font-atteron">{title}</h4>
      <p className="mt-3 text-sm opacity-75">{text}</p>
    </article>
  );
}

function MandalaWheel({
  houseNotes,
  stickers,
  onOpenHouse,
}: {
  houseNotes: HouseNotes;
  stickers: MandalaSticker[];
  onOpenHouse: (house: number) => void;
}) {
  const cx = 200;
  const cy = 200;
  const innerRadius = 52;
  const outerRadius = 185;
  const labelRadius = 125;

  return (
    <div className="mx-auto max-w-[380px]">
      <svg viewBox="0 0 400 400" className="h-auto w-full drop-shadow-xl" role="img" aria-label="Mandala pessoal com 12 casas">
        <defs>
          <radialGradient id="mandalaGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity="0.18" />
            <stop offset="65%" stopColor="rgb(139 92 246)" stopOpacity="0.06" />
            <stop offset="100%" stopColor="rgb(180 83 9)" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={outerRadius} fill="url(#mandalaGlow)" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={innerRadius} fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" />

        {houseCopy.map((house, index) => {
          const startAngle = 180 - index * 30;
          const endAngle = startAngle - 30;
          const midAngle = startAngle - 15;
          const path = describeArcSlice(cx, cy, innerRadius, outerRadius, startAngle, endAngle);
          const label = polarToCartesian(cx, cy, labelRadius, midAngle);
          const hasNote = Boolean(houseNotes[house.id]?.notes || houseNotes[house.id]?.intention || houseNotes[house.id]?.tasks);

          return (
            <g key={house.id}>
              <path
                d={path}
                className="cursor-pointer transition duration-200 hover:fill-lilas-mistico/20"
                fill={hasNote ? "rgb(139 92 246)" : "currentColor"}
                fillOpacity={hasNote ? "0.18" : "0.035"}
                stroke="currentColor"
                strokeOpacity="0.16"
                strokeWidth="1.4"
                onClick={() => onOpenHouse(house.id)}
              />
              <button type="button" aria-label={`Abrir notas da ${house.title}`} onClick={() => onOpenHouse(house.id)}>
                <text
                  x={label.x}
                  y={label.y - 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none fill-current text-lg font-semibold"
                >
                  {house.id}
                </text>
                <text
                  x={label.x}
                  y={label.y + 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none fill-current text-[9px] uppercase tracking-wide opacity-60"
                >
                  {hasNote ? "nota" : "casa"}
                </text>
              </button>
            </g>
          );
        })}

        <circle cx={cx} cy={cy} r="34" fill="rgb(139 92 246)" fillOpacity="0.18" stroke="currentColor" strokeOpacity="0.16" />
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-current text-[12px] font-semibold uppercase tracking-[0.2em]">
          Mandala
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-current text-[10px] opacity-60">
          pessoal
        </text>

        {stickers.map((sticker) => (
          <StickerMark key={sticker.id} sticker={sticker} readonly />
        ))}
      </svg>
    </div>
  );
}

function HouseNotesDialog({
  house,
  note,
  isDark,
  onClose,
  onChange,
}: {
  house: number | null;
  note?: HouseNote;
  isDark: boolean;
  onClose: () => void;
  onChange: (patch: Partial<HouseNote>) => void;
}) {
  const houseInfo = house ? houseCopy.find((item) => item.id === house) : null;
  const inputClass = isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-black/10 bg-white text-gray-900";

  return (
    <Dialog open={Boolean(house)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className={isDark ? "border-white/10 bg-slate-950 text-slate-100 sm:max-w-3xl" : "sm:max-w-3xl"}>
        <DialogHeader>
          <DialogTitle className="font-atteron text-3xl">{houseInfo?.title || "Casa"}</DialogTitle>
          <DialogDescription className={isDark ? "text-slate-400" : undefined}>
            {houseInfo?.theme}. {houseInfo?.prompt}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="notas" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notas">Notas</TabsTrigger>
            <TabsTrigger value="intencao">Intencao</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          </TabsList>

          <TabsContent value="notas" className="mt-4 space-y-3">
            <Input
              value={note?.title || ""}
              onChange={(event) => onChange({ title: event.target.value })}
              placeholder="Titulo desta anotacao"
              className={inputClass}
            />
            <Textarea
              value={note?.notes || ""}
              onChange={(event) => onChange({ notes: event.target.value })}
              placeholder="Registre percepcoes, aprendizados e movimentos desta casa."
              className={`min-h-[220px] ${inputClass}`}
            />
          </TabsContent>

          <TabsContent value="intencao" className="mt-4">
            <Textarea
              value={note?.intention || ""}
              onChange={(event) => onChange({ intention: event.target.value })}
              placeholder="Qual intencao esta casa sustenta neste ciclo?"
              className={`min-h-[260px] ${inputClass}`}
            />
          </TabsContent>

          <TabsContent value="tarefas" className="mt-4">
            <Textarea
              value={note?.tasks || ""}
              onChange={(event) => onChange({ tasks: event.target.value })}
              placeholder="Liste tarefas, proximos passos ou compromissos desta casa."
              className={`min-h-[260px] ${inputClass}`}
            />
          </TabsContent>
        </Tabs>

        <p className="text-xs opacity-60">As notas sao salvas na sua mandala quando a conexao com o Supabase estiver ativa.</p>
      </DialogContent>
    </Dialog>
  );
}

function ExpandedMandalaDialog({
  open,
  stickers,
  houseNotes,
  isDark,
  onClose,
  onOpenHouse,
  onStickersChange,
}: {
  open: boolean;
  stickers: MandalaSticker[];
  houseNotes: HouseNotes;
  isDark: boolean;
  onClose: () => void;
  onOpenHouse: (house: number) => void;
  onStickersChange: (stickers: MandalaSticker[]) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [paletteDrag, setPaletteDrag] = useState<Omit<MandalaSticker, "id" | "x" | "y"> | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const panelClass = isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-black/10 bg-white text-gray-900";
  const stickerClass = isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-black/10 bg-gray-50 hover:bg-gray-100";

  function getSvgPoint(event: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM()?.inverse());
  }

  function clampPoint(point: DOMPoint) {
    return {
      x: Math.min(Math.max(point.x, 24), 376),
      y: Math.min(Math.max(point.y, 24), 376),
    };
  }

  function placePaletteSticker(point: DOMPoint) {
    if (!paletteDrag) return;
    const next = clampPoint(point);
    onStickersChange([
      ...stickers,
      {
        id: `${paletteDrag.kind}-${paletteDrag.label}-${Date.now()}`,
        label: paletteDrag.label,
        kind: paletteDrag.kind,
        x: next.x,
        y: next.y,
      },
    ]);
    setPaletteDrag(null);
  }

  function moveSticker(id: string, point: DOMPoint) {
    const next = clampPoint(point);
    onStickersChange(stickers.map((sticker) => sticker.id === id ? { ...sticker, x: next.x, y: next.y } : sticker));
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className={`h-[92vh] max-w-[96vw] overflow-hidden p-0 ${panelClass}`}>
        <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="flex min-h-0 flex-col p-5">
            <DialogHeader>
              <DialogTitle className="font-atteron text-3xl">Mandala pessoal expandida</DialogTitle>
              <DialogDescription className={isDark ? "text-slate-400" : undefined}>
                Arraste signos e planetas da lateral para a mandala. Essas posicoes tambem aparecem na mandala menor.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 grid min-h-0 flex-1 place-items-center overflow-auto rounded-[2rem] border border-lilas-mistico/20 bg-lilas-mistico/5 p-4">
              <svg
                ref={svgRef}
                viewBox="0 0 400 400"
                className="h-full max-h-[72vh] w-full max-w-[820px] touch-none drop-shadow-2xl"
                onPointerMove={(event) => {
                  const point = getSvgPoint(event);
                  if (!point) return;
                  if (draggedId) moveSticker(draggedId, point);
                }}
                onPointerUp={(event) => {
                  const point = getSvgPoint(event);
                  if (point && paletteDrag) placePaletteSticker(point);
                  setDraggedId(null);
                }}
                onPointerLeave={() => setDraggedId(null)}
              >
                <MandalaSvgBase houseNotes={houseNotes} onOpenHouse={onOpenHouse} />
                {stickers.map((sticker) => (
                  <StickerMark
                    key={sticker.id}
                    sticker={sticker}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      setDraggedId(sticker.id);
                    }}
                    onRemove={() => onStickersChange(stickers.filter((item) => item.id !== sticker.id))}
                  />
                ))}
              </svg>
            </div>
          </section>

          <aside className={`min-h-0 overflow-y-auto border-l p-5 ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-gray-50"}`}>
            <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Stickers</p>
            <h3 className="mt-2 text-2xl font-atteron">Signos e planetas</h3>
            <p className="mt-2 text-sm opacity-70">Clique em um sticker e depois clique/solte na mandala, ou arraste dentro da mandala para reposicionar.</p>

            <div className="mt-5 space-y-5">
              <StickerGroup
                title="Signos"
                items={stickerPalette.filter((item) => item.kind === "sign")}
                active={paletteDrag}
                className={stickerClass}
                onPick={setPaletteDrag}
              />
              <StickerGroup
                title="Planetas"
                items={stickerPalette.filter((item) => item.kind === "planet")}
                active={paletteDrag}
                className={stickerClass}
                onPick={setPaletteDrag}
              />
            </div>

            <button
              type="button"
              onClick={() => onStickersChange([])}
              className={`mt-6 w-full rounded-full border px-4 py-3 text-sm transition ${stickerClass}`}
            >
              Limpar stickers
            </button>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StickerGroup({
  title,
  items,
  active,
  className,
  onPick,
}: {
  title: string;
  items: Array<Omit<MandalaSticker, "id" | "x" | "y">>;
  active: Omit<MandalaSticker, "id" | "x" | "y"> | null;
  className: string;
  onPick: (item: Omit<MandalaSticker, "id" | "x" | "y">) => void;
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const selected = active?.label === item.label && active?.kind === item.kind;
          return (
            <button
              key={`${item.kind}-${item.label}`}
              type="button"
              onClick={() => onPick(item)}
              className={`rounded-2xl border px-3 py-2 text-sm transition ${className} ${selected ? "ring-2 ring-lilas-mistico" : ""}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MandalaSvgBase({ houseNotes, onOpenHouse }: { houseNotes: HouseNotes; onOpenHouse: (house: number) => void }) {
  const cx = 200;
  const cy = 200;
  const innerRadius = 52;
  const outerRadius = 185;
  const labelRadius = 125;

  return (
    <>
      <defs>
        <radialGradient id="mandalaGlowExpanded" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity="0.18" />
          <stop offset="65%" stopColor="rgb(139 92 246)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="rgb(180 83 9)" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={outerRadius} fill="url(#mandalaGlowExpanded)" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={innerRadius} fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" />

      {houseCopy.map((house, index) => {
        const startAngle = 180 - index * 30;
        const endAngle = startAngle - 30;
        const midAngle = startAngle - 15;
        const path = describeArcSlice(cx, cy, innerRadius, outerRadius, startAngle, endAngle);
        const label = polarToCartesian(cx, cy, labelRadius, midAngle);
        const hasNote = Boolean(houseNotes[house.id]?.notes || houseNotes[house.id]?.intention || houseNotes[house.id]?.tasks);

        return (
          <g key={house.id}>
            <path
              d={path}
              className="cursor-pointer transition duration-200 hover:fill-lilas-mistico/20"
              fill={hasNote ? "rgb(139 92 246)" : "currentColor"}
              fillOpacity={hasNote ? "0.18" : "0.035"}
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="1.4"
              onClick={() => onOpenHouse(house.id)}
            />
            <text x={label.x} y={label.y - 5} textAnchor="middle" dominantBaseline="middle" className="pointer-events-none select-none fill-current text-lg font-semibold">
              {house.id}
            </text>
            <text x={label.x} y={label.y + 15} textAnchor="middle" dominantBaseline="middle" className="pointer-events-none select-none fill-current text-[9px] uppercase tracking-wide opacity-60">
              {hasNote ? "nota" : "casa"}
            </text>
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r="34" fill="rgb(139 92 246)" fillOpacity="0.18" stroke="currentColor" strokeOpacity="0.16" />
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-current text-[12px] font-semibold uppercase tracking-[0.2em]">Mandala</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-current text-[10px] opacity-60">pessoal</text>
    </>
  );
}

function StickerMark({
  sticker,
  readonly = false,
  onPointerDown,
  onRemove,
}: {
  sticker: MandalaSticker;
  readonly?: boolean;
  onPointerDown?: (event: React.PointerEvent<SVGGElement>) => void;
  onRemove?: () => void;
}) {
  const width = Math.max(38, sticker.label.length * 6.5 + 18);
  const fill = sticker.kind === "planet" ? "rgb(139 92 246)" : "rgb(180 83 9)";

  return (
    <g
      transform={`translate(${sticker.x} ${sticker.y})`}
      className={readonly ? "" : "cursor-grab active:cursor-grabbing"}
      onPointerDown={onPointerDown}
      onDoubleClick={onRemove}
    >
      <rect x={-width / 2} y={-15} width={width} height={30} rx={15} fill={fill} fillOpacity="0.92" stroke="white" strokeOpacity="0.55" />
      <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" className="pointer-events-none select-none fill-white text-[11px] font-semibold">
        {sticker.label}
      </text>
    </g>
  );
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArcSlice(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 0 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 0 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}
