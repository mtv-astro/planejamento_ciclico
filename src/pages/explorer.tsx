import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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

export default function ExplorerPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [charts, setCharts] = useState<ChartItem[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const currentChartParam = searchParams.get("chart") || params.chartId || "";

  const selectedChartId = currentChartParam;
  const selectedChart = useMemo(
    () => charts.find((chart) => chart.chart_id === selectedChartId) || null,
    [charts, selectedChartId]
  );

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

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  const activeImage = images[0] || (selectedChart?.preview_image_url ? { signed_url: selectedChart.preview_image_url } : null);

  return (
    <main className="min-h-screen bg-offwhite-leve text-gray-900 px-4 py-6 md:px-6">
      <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">My Maps</p>
            <h1 className="text-2xl font-atteron mt-2">Explorer privado</h1>
            <p className="text-sm text-muted-foreground mt-2">Seu banco de mapas e imagens fica protegido por login.</p>
          </div>

          <div className="flex gap-2 mb-4">
            <Link to="/" className="text-sm underline">Landing</Link>
            <button onClick={handleSignOut} className="text-sm underline">Sair</button>
          </div>

          {loading ? <div className="text-sm text-muted-foreground">Carregando mapas...</div> : null}
          {!loading && !charts.length ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
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
                className={`w-full text-left rounded-xl border p-3 transition ${selectedChartId === chart.chart_id ? "border-lilas-mistico bg-lilas-mistico/5" : "hover:bg-gray-50"}`}
              >
                <div className="font-medium">{chart.title || "Mapa sem nome"}</div>
                <div className="text-sm text-muted-foreground mt-1">{chart.birth_date} {chart.birth_time}</div>
                <div className="text-xs text-muted-foreground mt-1">{chart.house_system || "A"}{chart.is_primary ? " · principal" : ""}</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border bg-white p-5 shadow-sm min-h-[70vh]">
          {error ? <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div> : null}

          {!selectedChart ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">Selecione um mapa na coluna lateral.</div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Mapa selecionado</p>
                    <h2 className="text-3xl font-atteron mt-2">{selectedChart.title || "Mapa sem nome"}</h2>
                    <p className="text-sm text-muted-foreground mt-2">{selectedChart.birth_date} {selectedChart.birth_time} · {selectedChart.timezone}</p>
                  </div>
                  <button
                    onClick={handleSetPrimary}
                    disabled={busy}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                  >
                    {selectedChart.is_primary ? "Mapa principal" : "Definir como principal"}
                  </button>
                </div>

                <div className="rounded-2xl border bg-gray-50 min-h-[420px] flex items-center justify-center overflow-hidden">
                  {activeImage?.signed_url ? (
                    <img src={activeImage.signed_url} alt="Mapa astral" className="w-full h-auto object-contain" />
                  ) : (
                    <div className="text-sm text-muted-foreground px-6 text-center">
                      Nenhuma imagem gerada ainda para este mapa.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border p-4">
                  <h3 className="font-semibold mb-3">Registrar nome</h3>
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    placeholder="Ex.: Mapa natal principal"
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-lilas-mistico"
                  />
                  <button
                    onClick={handleRename}
                    disabled={busy || !renameValue.trim()}
                    className="mt-3 w-full rounded-lg bg-lilas-mistico text-white py-2.5 disabled:opacity-60"
                  >
                    {busy ? "Salvando..." : "Salvar nome do mapa"}
                  </button>
                </div>

                <div className="rounded-2xl border p-4">
                  <h3 className="font-semibold mb-3">Detalhes</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Data</dt><dd>{selectedChart.birth_date}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Hora</dt><dd>{selectedChart.birth_time}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Timezone</dt><dd>{selectedChart.timezone}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Casa</dt><dd>{selectedChart.house_system || "A"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Principal</dt><dd>{selectedChart.is_primary ? "Sim" : "Nao"}</dd></div>
                  </dl>
                </div>

                <div className="rounded-2xl border p-4">
                  <h3 className="font-semibold mb-3">Imagens salvas</h3>
                  <div className="space-y-3">
                    {images.length ? images.map((image) => (
                      <a
                        key={image.id}
                        href={image.signed_url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl border px-3 py-2 hover:bg-gray-50"
                      >
                        <div className="font-medium text-sm">{image.template_title || image.template_slug || image.kind}</div>
                        <div className="text-xs text-muted-foreground mt-1">{image.mime_type}</div>
                      </a>
                    )) : <div className="text-sm text-muted-foreground">Nenhuma imagem salva.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
