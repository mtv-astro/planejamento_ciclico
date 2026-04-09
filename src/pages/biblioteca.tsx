import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle2, CirclePlay, Clock, Library, PlayCircle, Sparkles, Users, WandSparkles } from "lucide-react";
import PrivateTopbar from "@/components/PrivateTopbar";
import { callFunction } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";

type CurrentUser = {
  email?: string | null;
  username?: string | null;
  display_name?: string | null;
};

type Lesson = {
  id: string;
  title: string;
  description?: string | null;
  video_embed_url?: string | null;
  duration_seconds?: number | null;
  progress?: {
    is_completed?: boolean;
    last_position_seconds?: number;
  } | null;
};

type LibraryModule = {
  id: string;
  title: string;
  description?: string | null;
  lessons: Lesson[];
};

type TrackId = "planejamento" | "comunidade" | "mentoria" | "workshops" | "acervo";

type LibraryTrack = {
  id: TrackId;
  title: string;
  eyebrow: string;
  description: string;
  spotlight: string;
  emptyTitle: string;
  emptyText: string;
  gradientClass: string;
  icon: typeof Sparkles;
  placeholderModules: string[];
};

type CatalogCard = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  moduleId?: string;
  isPlaceholder?: boolean;
};

const THEME_KEY = "pc-gallery-theme";
const CATALOG_CARD_COUNT = 10;

const LIBRARY_TRACKS: LibraryTrack[] = [
  {
    id: "planejamento",
    title: "Planejamento Ciclico",
    eyebrow: "Trilha 01",
    description: "A jornada central do metodo: ritmo, ciclo, revisao, organizacao e pratica guiada.",
    spotlight: "A camada principal do Escritorio. Cada poster abre um modulo com aulas e materiais.",
    emptyTitle: "A trilha de Planejamento Ciclico ainda esta sendo montada.",
    emptyText: "Quando novos modulos forem publicados, eles entram aqui como filmes no catalogo principal.",
    gradientClass: "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_30%),linear-gradient(135deg,rgba(35,38,75,0.96),rgba(112,66,193,0.82),rgba(203,98,81,0.8))]",
    icon: Sparkles,
    placeholderModules: ["Ciclo base", "Rotina lunar", "Planejar a semana", "Mapa de prioridades", "Casa 1", "Casa 2", "Casa 3", "Casa 4", "Casa 5", "Casa 6"],
  },
  {
    id: "comunidade",
    title: "Comunidade",
    eyebrow: "Trilha 02",
    description: "Trocas, encontros, rodas, repertorio coletivo e vida comunitaria.",
    spotlight: "Uma prateleira viva para acolher materiais e encontros da comunidade.",
    emptyTitle: "A trilha de Comunidade esta pronta para receber modulos.",
    emptyText: "Os posters desta trilha ja mostram a linguagem do catalogo e aguardam os modulos reais.",
    gradientClass: "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_32%),linear-gradient(135deg,rgba(18,72,92,0.96),rgba(14,116,144,0.84),rgba(16,185,129,0.72))]",
    icon: Users,
    placeholderModules: ["Boas-vindas", "Rodas ao vivo", "Combinados", "Mural coletivo", "Partilhas", "Perfis", "Presencas", "Rede de apoio", "Ciclos em grupo", "Arquivo de encontros"],
  },
  {
    id: "mentoria",
    title: "Mentoria",
    eyebrow: "Trilha 03",
    description: "Orientacao, acompanhamento e aprofundamento do processo de mentoria.",
    spotlight: "Aqui entram percursos mais proximos: direcao, checkpoints e gravacoes da mentoria.",
    emptyTitle: "A trilha de Mentoria ainda nao recebeu modulos publicados.",
    emptyText: "Ela ja pode funcionar como catalogo para gravacoes, encontros e materiais de acompanhamento.",
    gradientClass: "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_28%),linear-gradient(135deg,rgba(73,33,85,0.94),rgba(126,34,206,0.82),rgba(236,72,153,0.76))]",
    icon: PlayCircle,
    placeholderModules: ["Direcao inicial", "Leitura de fase", "Check-in 1", "Check-in 2", "Virada de ciclo", "Mapa de foco", "Ajustes", "Perguntas-chave", "Sessao gravada", "Encerramento"],
  },
  {
    id: "workshops",
    title: "Workshops e aulas extras",
    eyebrow: "Trilha 04",
    description: "Intensivos, aulas avulsas, laboratorios e conteudos especiais.",
    spotlight: "Uma fileira de posters para tudo o que expande a jornada principal sem depender da trilha central.",
    emptyTitle: "A trilha de Workshops e aulas extras ainda esta vazia.",
    emptyText: "Ela ja esta pronta para receber lancamentos especiais em formato de poster.",
    gradientClass: "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.24),_transparent_28%),linear-gradient(135deg,rgba(97,50,15,0.95),rgba(194,91,20,0.82),rgba(245,158,11,0.76))]",
    icon: WandSparkles,
    placeholderModules: ["Workshop 01", "Workshop 02", "Workshop 03", "Aula extra 01", "Aula extra 02", "Intensivo lunar", "Laboratorio", "Especial ao vivo", "Replay", "Bonus"],
  },
  {
    id: "acervo",
    title: "Acervo complementar",
    eyebrow: "Trilha 05",
    description: "Uma camada final para referencias, mapas de estudo e materiais de apoio.",
    spotlight: "Serve como quinta fileira do catalogo, guardando referencias complementares do Escritorio.",
    emptyTitle: "A trilha de Acervo complementar ainda nao tem modulos ativos.",
    emptyText: "Ela pode receber futuramente PDFs, referencias de estudo e materiais de apoio em formato de modulo.",
    gradientClass: "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_28%),linear-gradient(135deg,rgba(45,58,82,0.95),rgba(71,85,105,0.82),rgba(100,116,139,0.76))]",
    icon: Library,
    placeholderModules: ["Guia base", "Glossario", "Mapa de estudo", "Leituras", "Exercicios", "Resumo 01", "Resumo 02", "Referencias", "Arquivo vivo", "Anexos"],
  },
];

function buildCatalogCards(track: LibraryTrack, modules: LibraryModule[]): CatalogCard[] {
  if (track.id === "planejamento") {
    const realCards = modules.slice(0, CATALOG_CARD_COUNT).map((module, index) => ({
      id: `${track.id}-${module.id}`,
      title: module.title,
      subtitle: module.description || "Modulo publicado na biblioteca.",
      meta: `${index + 1}`.padStart(2, "0") + ` . ${module.lessons.length} aulas`,
      moduleId: module.id,
    }));

    const placeholdersNeeded = Math.max(0, CATALOG_CARD_COUNT - realCards.length);
    const placeholderCards = track.placeholderModules.slice(0, placeholdersNeeded).map((title, index) => ({
      id: `${track.id}-placeholder-${index}`,
      title,
      subtitle: "Espaco reservado para modulo futuro desta trilha.",
      meta: `${realCards.length + index + 1}`.padStart(2, "0") + " . em breve",
      isPlaceholder: true,
    }));

    return [...realCards, ...placeholderCards];
  }

  return track.placeholderModules.slice(0, CATALOG_CARD_COUNT).map((title, index) => ({
    id: `${track.id}-placeholder-${index}`,
    title,
    subtitle: "Poster de preview para esta trilha.",
    meta: `${index + 1}`.padStart(2, "0") + " . em breve",
    isPlaceholder: true,
  }));
}

export default function BibliotecaPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [modules, setModules] = useState<LibraryModule[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(THEME_KEY) === "dark";
  });

  const selectedTrackId = searchParams.get("trilha") as TrackId | null;
  const selectedModuleId = searchParams.get("modulo");
  const selectedTrack = LIBRARY_TRACKS.find((track) => track.id === selectedTrackId) || null;

  const totalLessons = useMemo(() => modules.reduce((total, module) => total + module.lessons.length, 0), [modules]);
  const completedLessons = useMemo(
    () => modules.reduce((total, module) => total + module.lessons.filter((lesson) => lesson.progress?.is_completed).length, 0),
    [modules],
  );

  const trackModules = useMemo(() => {
    if (!selectedTrack) return [];
    return selectedTrack.id === "planejamento" ? modules : [];
  }, [modules, selectedTrack]);

  const activeModule = useMemo(() => {
    if (!trackModules.length) return null;
    return trackModules.find((module) => module.id === selectedModuleId) || trackModules[0] || null;
  }, [trackModules, selectedModuleId]);

  const catalogRows = useMemo(
    () => LIBRARY_TRACKS.map((track) => ({ track, cards: buildCatalogCards(track, modules) })),
    [modules],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    }
  }, [isDark]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [userData, libraryData] = await Promise.all([
          callFunction("get-current-user"),
          callFunction("list-library-content"),
        ]);
        setCurrentUser(userData.user || null);
        setModules((libraryData.modules || []) as LibraryModule[]);
      } catch (loadError) {
        setError((loadError as Error).message || "Nao foi possivel carregar a Biblioteca.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    setActiveLesson(activeModule?.lessons?.[0] || null);
  }, [activeModule]);

  async function handleSignOut() {
    const supabase = getSupabase();
    if (!supabase) {
      navigate("/login", { replace: true });
      return;
    }

    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  async function markCompleted(lesson: Lesson) {
    try {
      const data = await callFunction("set-lesson-progress", {
        lesson_id: lesson.id,
        is_completed: true,
        last_position_seconds: lesson.progress?.last_position_seconds || 0,
      });
      const progress = data.progress;
      setModules((prev) => prev.map((module) => ({
        ...module,
        lessons: module.lessons.map((item) => item.id === lesson.id ? { ...item, progress } : item),
      })));
      setActiveLesson((prev) => prev?.id === lesson.id ? { ...prev, progress } : prev);
    } catch (progressError) {
      setError((progressError as Error).message || "Nao foi possivel salvar o progresso.");
    }
  }

  function openCatalogCard(trackId: TrackId, moduleId?: string) {
    const nextParams = new URLSearchParams();
    nextParams.set("trilha", trackId);
    if (moduleId) nextParams.set("modulo", moduleId);
    setSearchParams(nextParams);
  }

  function closeTrack() {
    setSearchParams({});
  }

  const pageClass = isDark ? "bg-slate-950 text-slate-100" : "bg-offwhite-leve text-gray-900";
  const panelClass = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-black/10 bg-white text-gray-900";
  const softPanelClass = isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-gray-50";
  const subtleClass = isDark ? "text-slate-400" : "text-muted-foreground";

  return (
    <main className={`min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-6 ${pageClass}`}>
      <div className="mx-auto max-w-[1600px] space-y-6">
        <PrivateTopbar
          user={currentUser}
          isDark={isDark}
          onToggleTheme={() => setIsDark((value) => !value)}
          onSignOut={handleSignOut}
          kicker="Escritorio de Planejamento Ciclico"
          title="Biblioteca"
        />

        {!selectedTrack ? (
          <section className="space-y-8">
            <article className={`overflow-hidden rounded-[2rem] border p-5 shadow-sm sm:p-6 lg:p-8 ${panelClass}`}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Catalogo de trilhas</p>
                  <h1 className="mt-3 max-w-4xl text-4xl font-atteron leading-tight sm:text-5xl">
                    Cinco fileiras horizontais, cada uma com 10 posters de modulo.
                  </h1>
                  <p className={`mt-4 max-w-3xl text-sm leading-7 sm:text-base ${subtleClass}`}>
                    A biblioteca agora funciona como plataforma de catalogo: as trilhas ficam uma abaixo da outra, em scroll horizontal,
                    e cada poster abre o modulo na camada interna que antes era a biblioteca inteira.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className={`rounded-3xl border p-4 ${softPanelClass}`}>
                    <span className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Trilhas</span>
                    <strong className="mt-2 block text-3xl font-atteron">{LIBRARY_TRACKS.length}</strong>
                  </div>
                  <div className={`rounded-3xl border p-4 ${softPanelClass}`}>
                    <span className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Posters por trilha</span>
                    <strong className="mt-2 block text-3xl font-atteron">{CATALOG_CARD_COUNT}</strong>
                  </div>
                  <div className={`rounded-3xl border p-4 ${softPanelClass}`}>
                    <span className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Aulas publicadas</span>
                    <strong className="mt-2 block text-3xl font-atteron">{totalLessons}</strong>
                  </div>
                </div>
              </div>
            </article>

            {loading ? <p className={`text-sm ${subtleClass}`}>Carregando catalogo...</p> : null}
            {error ? <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">{error}</p> : null}

            {catalogRows.map(({ track, cards }) => {
              const Icon = track.icon;

              return (
                <section key={track.id} className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className={`grid h-10 w-10 place-items-center rounded-2xl text-white ${track.gradientClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-lilas-mistico">{track.eyebrow}</p>
                          <h2 className="mt-1 text-3xl font-atteron leading-tight">{track.title}</h2>
                        </div>
                      </div>
                      <p className={`mt-3 max-w-3xl text-sm leading-6 ${subtleClass}`}>{track.description}</p>
                    </div>
                    <p className={`max-w-md text-sm ${subtleClass}`}>{track.spotlight}</p>
                  </div>

                  <div className="-mx-3 overflow-x-auto px-3 pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}> 
                    <div className="flex w-max gap-4">
                      {cards.map((card, index) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => openCatalogCard(track.id, card.moduleId)}
                          className={`group flex w-[240px] shrink-0 flex-col overflow-hidden rounded-[1.75rem] border text-left transition hover:-translate-y-1 ${panelClass}`}
                        >
                          <div className={`relative h-[320px] p-5 text-white ${track.gradientClass}`}>
                            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,10,20,0.9),transparent_65%)]" />
                            <div className="relative flex h-full flex-col justify-between">
                              <div className="flex items-start justify-between gap-3">
                                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em] backdrop-blur">
                                  Modulo {(index + 1).toString().padStart(2, "0")}
                                </span>
                                {card.isPlaceholder ? <span className="text-[0.68rem] uppercase tracking-[0.16em] text-white/65">preview</span> : null}
                              </div>

                              <div>
                                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/65">{card.meta}</p>
                                <h3 className="mt-3 text-3xl font-atteron leading-tight">{card.title}</h3>
                                <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/80">{card.subtitle}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 p-4">
                            <span className="text-sm font-medium">Abrir modulo</span>
                            <span className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">{track.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </section>
        ) : (
          <section className={`overflow-hidden rounded-3xl border shadow-sm sm:rounded-[2rem] ${panelClass}`}>
            <div className="grid min-h-[680px] lg:grid-cols-[360px_minmax(0,1fr)]">
              <aside className={`border-b p-5 lg:border-b-0 lg:border-r ${isDark ? "border-white/10" : "border-black/10"}`}>
                <button type="button" onClick={closeTrack} className={`inline-flex items-center gap-2 text-sm ${subtleClass}`}>
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para catalogo
                </button>

                <div className="mt-5 flex items-start gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-lilas-mistico text-white">
                    <Library className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">{selectedTrack.eyebrow}</p>
                    <h1 className="text-2xl font-atteron leading-tight sm:text-3xl">{selectedTrack.title}</h1>
                  </div>
                </div>

                <div className={`mt-6 rounded-3xl border p-4 text-sm ${softPanelClass}`}>
                  <strong className="block">{trackModules.length} modulos reais nesta trilha</strong>
                  <span className={`mt-1 block ${subtleClass}`}>{selectedTrack.description}</span>
                </div>

                {loading ? (
                  <p className={`mt-6 text-sm ${subtleClass}`}>Carregando aulas...</p>
                ) : error ? (
                  <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">{error}</p>
                ) : trackModules.length === 0 ? (
                  <div className={`mt-6 rounded-3xl border p-4 ${softPanelClass}`}>
                    <p className="text-sm font-semibold">{selectedTrack.emptyTitle}</p>
                    <p className={`mt-2 text-sm leading-6 ${subtleClass}`}>{selectedTrack.emptyText}</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-5">
                    {trackModules.map((module) => (
                      <div key={module.id}>
                        <button
                          type="button"
                          onClick={() => openCatalogCard(selectedTrack.id, module.id)}
                          className={`w-full rounded-2xl border p-3 text-left transition ${
                            activeModule?.id === module.id ? "border-lilas-mistico bg-lilas-mistico/10" : softPanelClass
                          }`}
                        >
                          <span className="block text-sm font-medium">{module.title}</span>
                          <span className={`mt-1 block text-xs ${subtleClass}`}>
                            {module.lessons.length} aulas {module.description ? ` . ${module.description}` : ""}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </aside>

              <section className="p-4 sm:p-5 md:p-8">
                <div className={`relative overflow-hidden rounded-[2rem] p-6 text-white ${selectedTrack.gradientClass}`}>
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,15,28,0.84),transparent_65%)]" />
                  <div className="relative">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/70">{selectedTrack.eyebrow}</p>
                    <h2 className="mt-2 text-3xl font-atteron leading-tight md:text-5xl">{activeModule?.title || selectedTrack.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">{activeModule?.description || selectedTrack.spotlight}</p>
                  </div>
                </div>

                {activeLesson ? (
                  <div className="mt-6 space-y-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Aula selecionada</p>
                      <h2 className="mt-2 text-3xl font-atteron leading-tight md:text-5xl">{activeLesson.title}</h2>
                      {activeLesson.description ? <p className={`mt-3 max-w-3xl ${subtleClass}`}>{activeLesson.description}</p> : null}
                    </div>

                    <div className={`aspect-video overflow-hidden rounded-[2rem] border ${softPanelClass}`}>
                      {activeLesson.video_embed_url ? (
                        <iframe
                          className="h-full w-full"
                          src={activeLesson.video_embed_url}
                          title={activeLesson.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <div className="grid h-full place-items-center p-8 text-center">
                          <div>
                            <BookOpen className="mx-auto h-10 w-10 text-lilas-mistico" />
                            <p className={`mt-3 text-sm ${subtleClass}`}>Esta aula ainda nao tem video publicado.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {activeModule ? (
                      <div className="grid gap-3 md:grid-cols-3">
                        {activeModule.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => setActiveLesson(lesson)}
                            className={`rounded-2xl border p-4 text-left transition ${
                              activeLesson.id === lesson.id ? "border-lilas-mistico bg-lilas-mistico/10" : softPanelClass
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {lesson.progress?.is_completed ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-lilas-mistico" /> : <CirclePlay className="mt-0.5 h-4 w-4" />}
                              <div>
                                <span className="block text-sm font-medium">{lesson.title}</span>
                                {lesson.duration_seconds ? (
                                  <span className={`mt-1 flex items-center gap-1 text-xs ${subtleClass}`}>
                                    <Clock className="h-3 w-3" />
                                    {Math.ceil(lesson.duration_seconds / 60)} min
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => markCompleted(activeLesson)}
                        className="rounded-full bg-lilas-mistico px-5 py-3 text-sm font-medium text-white transition hover:bg-terracota"
                      >
                        Marcar como concluida
                      </button>
                      <button type="button" onClick={closeTrack} className={`rounded-full border px-5 py-3 text-sm font-medium ${softPanelClass}`}>
                        Voltar para catalogo
                      </button>
                      <Link to="/app" className={`rounded-full border px-5 py-3 text-sm font-medium ${softPanelClass}`}>
                        Voltar ao Escritorio
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid min-h-[420px] place-items-center text-center">
                    <div>
                      <BookOpen className="mx-auto h-12 w-12 text-lilas-mistico" />
                      <h2 className="mt-4 text-3xl font-atteron">{selectedTrack.emptyTitle}</h2>
                      <p className={`mt-2 max-w-md text-sm ${subtleClass}`}>{selectedTrack.emptyText}</p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}