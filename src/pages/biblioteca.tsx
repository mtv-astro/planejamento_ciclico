import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle2, CirclePlay, Clock, Library } from "lucide-react";
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

const THEME_KEY = "pc-gallery-theme";

export default function BibliotecaPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [modules, setModules] = useState<LibraryModule[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(THEME_KEY) === "dark";
  });

  const totalLessons = useMemo(() => modules.reduce((total, module) => total + module.lessons.length, 0), [modules]);
  const completedLessons = useMemo(
    () => modules.reduce((total, module) => total + module.lessons.filter((lesson) => lesson.progress?.is_completed).length, 0),
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
        const nextModules = (libraryData.modules || []) as LibraryModule[];
        setModules(nextModules);
        setActiveLesson(nextModules[0]?.lessons?.[0] || null);
      } catch (loadError) {
        setError((loadError as Error).message || "Nao foi possivel carregar a Biblioteca.");
      } finally {
        setLoading(false);
      }
    }

    load();
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

        <section className={`overflow-hidden rounded-3xl border shadow-sm sm:rounded-[2rem] ${panelClass}`}>
          <div className="grid min-h-[680px] lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className={`border-b p-5 lg:border-b-0 lg:border-r ${isDark ? "border-white/10" : "border-black/10"}`}>
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-lilas-mistico text-white">
                  <Library className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Videoaulas</p>
                  <h1 className="text-2xl font-atteron leading-tight sm:text-3xl">Biblioteca</h1>
                </div>
              </div>

              <div className={`mt-6 rounded-3xl border p-4 text-sm ${softPanelClass}`}>
                <strong className="block">{completedLessons}/{totalLessons} aulas concluidas</strong>
                <span className={`mt-1 block ${subtleClass}`}>Acompanhe as trilhas publicadas pela equipe.</span>
              </div>

              {loading ? (
                <p className={`mt-6 text-sm ${subtleClass}`}>Carregando aulas...</p>
              ) : error ? (
                <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">{error}</p>
              ) : modules.length === 0 ? (
                <p className={`mt-6 text-sm ${subtleClass}`}>Ainda nao ha aulas publicadas.</p>
              ) : (
                <div className="mt-6 space-y-5">
                  {modules.map((module) => (
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
              {activeLesson ? (
                <div className="space-y-5">
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
                    <Link to="/app" className={`rounded-full border px-5 py-3 text-sm font-medium ${softPanelClass}`}>
                      Voltar ao Escritorio
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid min-h-[520px] place-items-center text-center">
                  <div>
                    <BookOpen className="mx-auto h-12 w-12 text-lilas-mistico" />
                    <h2 className="mt-4 text-3xl font-atteron">Nenhuma aula selecionada</h2>
                    <p className={`mt-2 max-w-md text-sm ${subtleClass}`}>Quando a equipe publicar aulas, elas aparecem aqui em trilhas organizadas.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
