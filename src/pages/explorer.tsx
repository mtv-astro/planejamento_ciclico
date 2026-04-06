import { useEffect, useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PrivateTopbar from "@/components/PrivateTopbar";
import { getSupabase, getSupabaseConfigError } from "@/lib/supabase";
import { callFunction } from "@/lib/api";

type ChartItem = {
  chart_id: string;
  title?: string | null;
  created_at: string;
  birth_date: string;
  birth_time: string;
  timezone: string;
  house_system?: string | null;
  is_primary: boolean;
  preview_image_url?: string | null;
};

type ImageItem = {
  id: string;
  kind: string;
  mime_type: string;
  created_at: string;
  template_slug?: string | null;
  template_title?: string | null;
  signed_url?: string | null;
};

type CurrentUser = {
  email?: string | null;
  username?: string | null;
  display_name?: string | null;
};

const THEME_KEY = "pc-gallery-theme";

function formatBirthDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export default function ExplorerPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [charts, setCharts] = useState<ChartItem[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(THEME_KEY) === "dark";
  });
  const configError = getSupabaseConfigError();
  const currentChartParam = searchParams.get("chart") || params.chartId || "";

  const selectedChartId = currentChartParam;
  const selectedChart = useMemo(
    () => charts.find((chart) => chart.chart_id === selectedChartId) || null,
    [charts, selectedChartId]
  );

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

  useEffect(() => {
    async function loadCharts() {
      try {
        setLoading(true);
        setError("");
        const data = await callFunction("list-user-charts");
        const items = data.items || [];
        setCharts(items);

        const nextChart = currentChartParam || items[0]?.chart_id;
        if (!nextChart) {
          return;
        }

        if (currentChartParam !== nextChart) {
          setSearchParams({ chart: nextChart }, { replace: true });
        }

        if (params.chartId !== nextChart) {
          navigate(`/mapas/${nextChart}`, { replace: true });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro carregando mapas.");
      } finally {
        setLoading(false);
      }
    }

    loadCharts();
  }, [currentChartParam, navigate, params.chartId, setSearchParams]);

  useEffect(() => {
    if (!selectedChartId) {
      setImages([]);
      setRenameValue("");
      return;
    }

    async function loadImages() {
      try {
        setError("");
        const data = await callFunction("list-chart-images", { chart_id: selectedChartId });
        setImages(data.items || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro carregando imagens do mapa.");
      }
    }

    loadImages();
    setRenameValue(selectedChart?.title || "");
  }, [selectedChartId, selectedChart?.title]);

  async function handleRename() {
    if (!selectedChartId || !renameValue.trim()) return;
    setBusy(true);
    try {
      await callFunction("set-chart-title-current-user", {
        chart_id: selectedChartId,
        title: renameValue.trim(),
      });
      const refreshed = await callFunction("list-user-charts");
      setCharts(refreshed.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro salvando nome do mapa.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSetPrimary() {
    if (!selectedChartId) return;
    setBusy(true);
    try {
      await callFunction("set-current-user-map", { chart_id: selectedChartId });
      const refreshed = await callFunction("list-user-charts");
      setCharts(refreshed.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro definindo mapa principal.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteChart() {
    if (!selectedChartId) return;
    const confirmed = window.confirm("Deseja excluir este mapa e as imagens relacionadas? Essa acao nao pode ser desfeita.");
    if (!confirmed) return;

    setBusy(true);
    try {
      await callFunction("delete-current-user-chart", { chart_id: selectedChartId });
      const refreshed = await callFunction("list-user-charts");
      const items = refreshed.items || [];
      setCharts(items);
      setImages([]);
      setRenameValue("");

      const nextChart = items[0]?.chart_id || "";
      if (nextChart) {
        setSearchParams({ chart: nextChart }, { replace: true });
        navigate(`/mapas/${nextChart}`, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
        navigate("/explorer", { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro excluindo mapa.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    const supabase = getSupabase();
    if (!supabase) {
      navigate("/login", { replace: true });
      return;
    }

    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  const activeImage = images[0] || (selectedChart?.preview_image_url ? { signed_url: selectedChart.preview_image_url } : null);
  const pageClass = isDark ? "bg-slate-950 text-slate-100" : "bg-offwhite-leve text-gray-900";
  const panelClass = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-black/10 bg-white text-gray-900";
  const selectedCardClass = isDark ? "border-lilas-mistico bg-lilas-mistico/10" : "border-lilas-mistico bg-lilas-mistico/5";
  const hoverCardClass = isDark ? "hover:bg-white/5" : "hover:bg-gray-50";
  const subtleClass = isDark ? "text-slate-400" : "text-muted-foreground";
  const imageStageClass = isDark ? "border-white/10 bg-slate-950" : "border-black/10 bg-gray-50";
  const inputClass = isDark ? "border-white/10 bg-slate-950 text-slate-100 focus:ring-lilas-mistico" : "border-black/10 bg-white text-gray-900 focus:ring-lilas-mistico";

  return (
    <main className={`min-h-screen px-4 py-6 md:px-6 ${pageClass}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <PrivateTopbar user={currentUser} isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)} onSignOut={handleSignOut} />

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className={`rounded-2xl border p-5 shadow-sm ${panelClass}`}>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Galeria de Planejamento Ciclico</p>
              <h2 className="mt-2 text-2xl font-atteron">Seus mapas salvos</h2>
              <p className={`mt-2 text-sm ${subtleClass}`}>Seu banco de mapas e imagens fica protegido por login.</p>
            </div>

            {loading ? <div className={`text-sm ${subtleClass}`}>Carregando mapas...</div> : null}
            {!loading && !charts.length ? (
              <div className={`rounded-xl border border-dashed p-4 text-sm ${subtleClass}`}>
                Nenhum mapa salvo ainda.
              </div>
            ) : null}

            <div className="space-y-3">
              {charts.map((chart) => (
                <button
                  key={chart.chart_id}
                  onClick={() => {
                    setSearchParams({ chart: chart.chart_id });
                    navigate(`/mapas/${chart.chart_id}`, { replace: true });
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition ${selectedChartId === chart.chart_id ? selectedCardClass : hoverCardClass}`}
                >
                  <div className="font-medium">{chart.title || "Mapa sem nome"}</div>
                  <div className={`mt-1 text-sm ${subtleClass}`}>{formatBirthDate(chart.birth_date)} {chart.birth_time}</div>
                  <div className={`mt-1 text-xs ${subtleClass}`}>{chart.house_system || "A"}{chart.is_primary ? " · principal" : ""}</div>
                </button>
              ))}
            </div>
          </aside>

          <section className={`min-h-[70vh] rounded-2xl border p-5 shadow-sm ${panelClass}`}>
            {configError ? <div className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{configError}</div> : null}
            {error ? <div className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

            {!selectedChart ? (
              <div className={`flex h-full items-center justify-center ${subtleClass}`}>Selecione um mapa na coluna lateral.</div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div>
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Mapa selecionado</p>
                      <h2 className="mt-2 text-3xl font-atteron">{selectedChart.title || "Mapa sem nome"}</h2>
                      <p className={`mt-2 text-sm ${subtleClass}`}>{formatBirthDate(selectedChart.birth_date)} {selectedChart.birth_time} · {selectedChart.timezone}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleSetPrimary}
                        disabled={busy}
                        className={`rounded-lg border px-4 py-2 text-sm disabled:opacity-60 ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                      >
                        {selectedChart.is_primary ? "Mapa principal" : "Definir como principal"}
                      </button>
                      <button
                        onClick={handleDeleteChart}
                        disabled={busy}
                        className={`inline-flex items-center justify-center rounded-lg border p-2 text-sm transition disabled:opacity-60 ${
                          isDark
                            ? "border-white/10 text-slate-400 hover:bg-white/5 hover:text-red-300"
                            : "border-black/10 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        }`}
                        aria-label="Excluir mapa"
                        title="Excluir mapa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className={`flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border ${imageStageClass}`}>
                    {activeImage?.signed_url ? (
                      <img src={activeImage.signed_url} alt="Mapa astral" className="h-auto w-full object-contain" />
                    ) : (
                      <div className={`px-6 text-center text-sm ${subtleClass}`}>
                        Nenhuma imagem gerada ainda para este mapa.
                      </div>
                    )}
                  </div>

                  {activeImage?.signed_url ? (
                    <div className="mt-4 flex justify-end">
                      <a
                        href={activeImage.signed_url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex items-center gap-2 rounded-lg bg-lilas-mistico px-4 py-2.5 text-sm text-white"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-5">
                  <div className={`rounded-2xl border p-4 ${panelClass}`}>
                    <h3 className="mb-3 font-semibold">Registrar nome</h3>
                    <input
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                      placeholder="Ex.: Mapa natal principal"
                      className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${inputClass}`}
                    />
                    <button
                      onClick={handleRename}
                      disabled={busy || !renameValue.trim()}
                      className="mt-3 w-full rounded-lg bg-lilas-mistico py-2.5 text-white disabled:opacity-60"
                    >
                      {busy ? "Salvando..." : "Salvar nome do mapa"}
                    </button>
                  </div>

                  <div className={`rounded-2xl border p-4 ${panelClass}`}>
                    <h3 className="mb-3 font-semibold">Detalhes</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4"><dt className={subtleClass}>Data</dt><dd>{formatBirthDate(selectedChart.birth_date)}</dd></div>
                      <div className="flex justify-between gap-4"><dt className={subtleClass}>Hora</dt><dd>{selectedChart.birth_time}</dd></div>
                      <div className="flex justify-between gap-4"><dt className={subtleClass}>Timezone</dt><dd>{selectedChart.timezone}</dd></div>
                      <div className="flex justify-between gap-4"><dt className={subtleClass}>Casa</dt><dd>{selectedChart.house_system || "A"}</dd></div>
                      <div className="flex justify-between gap-4"><dt className={subtleClass}>Principal</dt><dd>{selectedChart.is_primary ? "Sim" : "Nao"}</dd></div>
                    </dl>
                  </div>

                  <div className={`rounded-2xl border p-4 ${panelClass}`}>
                    <h3 className="mb-3 font-semibold">Imagens salvas</h3>
                    <div className="space-y-3">
                      {images.length ? images.map((image) => (
                        <div key={image.id} className={`rounded-xl border px-3 py-3 ${isDark ? "border-white/10" : "border-black/10"}`}>
                          <div className="text-sm font-medium">{image.template_title || image.template_slug || image.kind}</div>
                          <div className={`mt-1 text-xs ${subtleClass}`}>{image.mime_type}</div>
                          <div className="mt-3 flex gap-2">
                            <a
                              href={image.signed_url || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className={`rounded-lg border px-3 py-2 text-xs ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                            >
                              Abrir
                            </a>
                            <a
                              href={image.signed_url || "#"}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="inline-flex items-center gap-2 rounded-lg bg-lilas-mistico px-3 py-2 text-xs text-white"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </a>
                          </div>
                        </div>
                      )) : <div className={`text-sm ${subtleClass}`}>Nenhuma imagem salva.</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
