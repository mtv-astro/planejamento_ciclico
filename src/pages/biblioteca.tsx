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

type TrackId = "planejamento" | "comunidade" | "mentoria" | "extras";

type LibraryTrack = {
  id: TrackId;
  title: string;
  eyebrow: string;
  description: string;
  spotlight: string;
  cta: string;
  emptyTitle: string;
  emptyText: string;
  gradientClass: string;
  icon: typeof Sparkles;
};

const THEME_KEY = "pc-gallery-theme";

const LIBRARY_TRACKS: LibraryTrack[] = [
  {
    id: "planejamento",
    title: "Planejamento Ciclico",
    eyebrow: "Trilha 01",
    description: "A trilha principal do Escritorio: ciclos, ritmo, rotina, organizacao e pratica guiada para sustentar o metodo.",
    spotlight: "Comece por aqui para atravessar o Planejamento Ciclico como uma jornada continua, com modulos, aulas e materiais centrais.",
    cta: "Entrar na trilha",
    emptyTitle: "A trilha de Planejamento Ciclico ainda esta sendo montada.",
    emptyText: "Quando novos modulos forem publicados, eles entram aqui como temporadas e capitulos da trilha principal.",
    gradientClass: "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_30%),linear-gradient(135deg,rgba(35,38,75,0.96),rgba(112,66,193,0.82),rgba(203,98,81,0.8))]",
    icon: Sparkles,
  },
  {
    id: "comunidade",
    title: "Comunidade",
    eyebrow: "Trilha 02",
    description: "Encontros, trocas, circulacao entre mulheres, repertorio coletivo e camadas vivas da comunidade.",
    spotlight: "Aqui entram os materiais que apoiam a vida coletiva: combinados, praticas, rodas, referencias e encontros.",
    cta: "Abrir comunidade",
    emptyTitle: "A trilha de Comunidade esta pronta para receber seus primeiros modulos.",
    emptyText: "Use esta camada para encontros, rodas, referencias coletivas e materiais que sustentam a vida comunitaria.",
    gradientClass: "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_32%),linear-gradient(135deg,rgba(18,72,92,0.96),rgba(14,116,144,0.84),rgba(16,185,129,0.72))]",
    icon: Users,
  },
  {
    id: "mentoria",
    title: "Mentoria",
    eyebrow: "Trilha 03",
    description: "Acompanhamento, direcionamento, aprofundamento e materiais ligados ao processo de mentoria.",
    spotlight: "Esta camada guarda percursos mais proximos: orientacoes, gravacoes, checkpoints e referencias da mentoria.",
    cta: "Abrir mentoria",
    emptyTitle: "A trilha de Mentoria ainda nao recebeu modulos publicados.",
    emptyText: "Quando houver gravacoes, orientacoes e materiais de acompanhamento, eles entram aqui.",
    gradientClass: "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_28%),linear-gradient(135deg,rgba(73,33,85,0.94),rgba(126,34,206,0.82),rgba(236,72,153,0.76))]",
    icon: PlayCircle,
  },
  {
    id: "extras",
    title: "Workshops e aulas extras",
    eyebrow: "Trilha 04",
    description: "Conteudos especiais, aulas avulsas, workshops e materiais complementares para expandir o repertorio.",
    spotlight: "Uma prateleira viva para entrar e sair: intensivos, experimentos, aprofundamentos e aulas fora da trilha principal.",
    cta: "Abrir extras",
    emptyTitle: "A trilha de Workshops e aulas extras ainda esta vazia.",
    emptyText: "Esta camada recebe aulas especiais, workshops e conteudos que orbitam a jornada principal.",
    gradientClass: "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.24),_transparent_28%),linear-gradient(135deg,rgba(97,50,15,0.95),rgba(194,91,20,0.82),rgba(245,158,11,0.76))]",
    icon: WandSparkles,
  },
];

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
  const selectedTrack = LIBRARY_TRACKS.find((track) => track.id === selectedTrackId) || null;

  const totalLessons = useMemo(() => modules.reduce((total, module) => total + module.lessons.length, 0), [modules]);
  const completedLessons = useMemo(
    () => modules.reduce((total, module) => total + module.lessons.filter((lesson) => lesson.progress?.is_completed).length, 0),
    [modules],
  );
  const totalModules = useMemo(() => modules.length, [modules]);
  const trackModules = useMemo(() => {
    if (!selectedTrack) return [];
    return selectedTrack.id === "planejamento" ? modules : [];
  }, [modules, selectedTrack]);

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
    setActiveLesson(trackModules[0]?.lessons?.[0] || null);
  }, [trackModules, selectedTrack?.id]);

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

  function openTrack(trackId: TrackId) {
    setSearchParams({ trilha: trackId });
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
      <div className="mx-auto max-w-7xl space-y-6">
        <PrivateTopbar
          user={currentUser}
          isDark={isDark}
          onToggleTheme={() => setIsDark((value) => !value)}
          onSignOut={handleSignOut}
          kicker="Escritorio de Planejamento Ciclico"
          title="Biblioteca"
        />

        {!selectedTrack ? (
          <section className="space-y-5">
            <article className={`overflow-hidden rounded-[2rem] border shadow-sm ${panelClass}`}>
              <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Entrada de trilhas</p>
                  <h1 className="mt-3 max-w-3xl text-4xl font-atteron leading-tight sm:text-5xl">
                    A biblioteca agora abre como um catalogo de jornadas.
                  </h1>
                  <p className={`mt-4 max-w-2xl text-sm leading-7 sm:text-base ${subtleClass}`}>
                    Pense nesta camada como uma vitrine estilo streaming: cada card apresenta uma trilha principal e abre
                    um modulo interno com aulas, materiais e encontros.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className={`rounded-3xl border p-4 ${softPanelClass}`}>
                      <span className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Trilhas</span>
                      <strong className="mt-2 block text-3xl font-atteron">{LIBRARY_TRACKS.length}</strong>
                    </div>
                    <div className={`rounded-3xl border p-4 ${softPanelClass}`}>
                      <span className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Aulas publicadas</span>
                      <strong className="mt-2 block text-3xl font-atteron">{totalLessons}</strong>
                    </div>
                    <div className={`rounded-3xl border p-4 ${softPanelClass}`}>
                      <span className="text-xs uppercase tracking-[0.16em] text-lilas-mistico">Concluidas</span>
                      <strong className="mt-2 block text-3xl font-atteron">{completedLessons}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openTrack("planejamento")}
                  className={`group relative overflow-hidden rounded-[2rem] p-6 text-left text-white transition hover:-translate-y-1 ${LIBRARY_TRACKS[0].gradientClass}`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,10,24,0.82),transparent_65%)]" />
                  <div className="relative flex min-h-[300px] flex-col justify-between">
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/70">{LIBRARY_TRACKS[0].eyebrow}</p>
                      <h2 className="mt-3 text-4xl font-atteron leading-tight">{LIBRARY_TRACKS[0].title}</h2>
                      <p className="mt-3 max-w-lg text-sm leading-7 text-white/80">{LIBRARY_TRACKS[0].spotlight}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                        {LIBRARY_TRACKS[0].cta}
                      </span>
                      <span className="text-xs uppercase tracking-[0.18em] text-white/60">{totalModules} modulos ativos</span>
                    </div>
                  </div>
                </button>
              </div>
            </article>

            <section>
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Catalogo</p>
                  <h2 className="mt-2 text-3xl font-atteron">Escolha sua trilha</h2>
                </div>
                <p className={`max-w-xl text-sm ${subtleClass}`}>
                  Cada trilha abre um modulo interno. A estrutura atual da biblioteca passa a ser a camada mais funda.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {LIBRARY_TRACKS.map((track) => {
                  const Icon = track.icon;
                  const isPrimaryTrack = track.id === "planejamento";

                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => openTrack(track.id)}
                      className={`group overflow-hidden rounded-[2rem] border text-left transition hover:-translate-y-1 ${panelClass}`}
                    >
                      <div className={`relative h-52 p-5 text-white sm:p-6 ${track.gradientClass}`}>
                        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,15,28,0.82),transparent_62%)]" />
                        <div className="relative flex h-full flex-col justify-between">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/70">{track.eyebrow}</p>
                              <h3 className="mt-3 text-3xl font-atteron leading-tight">{track.title}</h3>
                            </div>
                            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
                              <Icon className="h-5 w-5" />
                            </div>
                          </div>
                          <p className="max-w-xl text-sm leading-7 text-white/80">{track.spotlight}</p>
                        </div>
                      </div>

                      <div className="space-y-4 p-5 sm:p-6">
                        <p className={`text-sm leading-7 ${subtleClass}`}>{track.description}</p>
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex rounded-full bg-lilas-mistico px-4 py-2 text-sm font-medium text-white">
                            {track.cta}
                          </span>
                          <span className={`text-xs uppercase tracking-[0.16em] ${subtleClass}`}>
                            {isPrimaryTrack ? `${totalLessons} aulas ativas` : "camada pronta"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </section>
        ) : (
          <section className={`overflow-hidden rounded-3xl border shadow-sm sm:rounded-[2rem] ${panelClass}`}>
            <div className="grid min-h-[680px] lg:grid-cols-[360px_minmax(0,1fr)]">
              <aside className={`border-b p-5 lg:border-b-0 lg:border-r ${isDark ? "border-white/10" : "border-black/10"}`}>
                <button type="button" onClick={closeTrack} className={`inline-flex items-center gap-2 text-sm ${subtleClass}`}>
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para trilhas
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
                  <strong className="block">{trackModules.length} modulos visiveis nesta trilha</strong>
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
                        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-lilas-mistico">{module.title}</h2>
                        {module.description ? <p className={`mt-1 text-sm ${subtleClass}`}>{module.description}</p> : null}
                        <div className="mt-3 space-y-2">
                          {module.lessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => setActiveLesson(lesson)}
                              className={`w-full rounded-2xl border p-3 text-left transition ${
                                activeLesson?.id === lesson.id ? "border-lilas-mistico bg-lilas-mistico/10" : softPanelClass
                              }`}
                            >
                              <span className="flex items-start gap-2">
                                {lesson.progress?.is_completed ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-lilas-mistico" /> : <CirclePlay className="mt-0.5 h-4 w-4" />}
                                <span>
                                  <span className="block text-sm font-medium">{lesson.title}</span>
                                  {lesson.duration_seconds ? (
                                    <span className={`mt-1 flex items-center gap-1 text-xs ${subtleClass}`}>
                                      <Clock className="h-3 w-3" />
                                      {Math.ceil(lesson.duration_seconds / 60)} min
                                    </span>
                                  ) : null}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
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
                    <h2 className="mt-2 text-3xl font-atteron leading-tight md:text-5xl">{selectedTrack.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">{selectedTrack.spotlight}</p>
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

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => markCompleted(activeLesson)}
                        className="rounded-full bg-lilas-mistico px-5 py-3 text-sm font-medium text-white transition hover:bg-terracota"
                      >
                        Marcar como concluida
                      </button>
                      <button type="button" onClick={closeTrack} className={`rounded-full border px-5 py-3 text-sm font-medium ${softPanelClass}`}>
                        Voltar para trilhas
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