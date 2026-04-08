import { type ReactNode, type TouchEvent, type WheelEvent, useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PrivateTopbar from "@/components/PrivateTopbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSupabase, getSupabaseConfigError } from "@/lib/supabase";
import { callFunction, fetchFunctionBlob } from "@/lib/api";

type ChartItem = {
  chart_id: string;
  title?: string | null;
  created_at: string;
  birth_date: string;
  birth_time: string;
  timezone: string;
  house_system?: string | null;
  is_primary: boolean;
  preview_image_id?: string | null;
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

type DocumentItem = {
  id: string;
  source: string;
  kind: "markdown" | "json";
  title?: string | null;
  mime_type: string;
  bytes?: number | null;
  created_at: string;
  updated_at?: string | null;
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

function formatHouseSystem(value?: string | null) {
  if (!value) return "Casas Iguais";

  const normalized = value.trim().toUpperCase();
  if (normalized === "A") return "Casas Iguais";
  return value;
}

function sortChartsByPrimary(items: ChartItem[]) {
  return [...items].sort((left, right) => {
    if (left.is_primary !== right.is_primary) return left.is_primary ? -1 : 1;
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function markdownToPrintHtml(markdown: string) {
  return escapeHtml(markdown)
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("### ")) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith("## ")) return `<h2>${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith("# ")) return `<h1>${trimmed.slice(2)}</h1>`;
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");
}

function buildPdfHtml({
  title,
  chartTitle,
  chartInfo,
  imageUrl,
  markdown,
}: {
  title: string;
  chartTitle: string;
  chartInfo: string;
  imageUrl: string;
  markdown: string;
}) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { margin: 18mm; }
      body { color: #1f2933; font-family: Georgia, 'Times New Roman', serif; line-height: 1.55; }
      header { border-bottom: 1px solid #ddd0c4; margin-bottom: 24px; padding-bottom: 16px; }
      h1, h2, h3 { color: #4b2e45; line-height: 1.15; }
      h1 { font-size: 30px; margin: 0 0 8px; }
      h2 { font-size: 22px; margin-top: 28px; }
      h3 { font-size: 18px; margin-top: 22px; }
      p { font-size: 13px; margin: 0 0 12px; }
      .meta { color: #6b7280; font-size: 12px; }
      .map { border: 1px solid #ddd0c4; border-radius: 18px; margin: 24px 0; padding: 16px; text-align: center; }
      .map img { max-height: 520px; max-width: 100%; object-fit: contain; }
      .text { break-inside: auto; }
    </style>
  </head>
  <body>
    <header>
      <div class="meta">Escritorio de Planejamento Ciclico</div>
      <h1>${escapeHtml(chartTitle)}</h1>
      <div class="meta">${escapeHtml(chartInfo)}</div>
    </header>
    <section class="map"><img src="${imageUrl}" alt="Mapa astral" /></section>
    <section class="text">${markdownToPrintHtml(markdown)}</section>
  </body>
</html>`;
}

function splitReadingIntoCards(markdown: string) {
  const normalized = markdown.trim();
  if (!normalized) return [];

  const headingMatches = Array.from(normalized.matchAll(/^#{1,3}\s+.+$/gm));
  if (!headingMatches.length) {
    return normalized
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return headingMatches.map((match, index) => {
    const start = match.index || 0;
    const end = headingMatches[index + 1]?.index ?? normalized.length;
    return normalized.slice(start, end).trim();
  }).filter(Boolean);
}

function cleanMarkdownText(value: string) {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function normalizeText(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isReadingGridSection(section = "") {
  const normalized = normalizeText(section);
  return /pontos?\s+principais?/.test(normalized) || /\bcasas?\b/.test(normalized) || /aspectos?.*marcantes?/.test(normalized);
}

function splitGridLine(line: string) {
  return cleanMarkdownText(line)
    .split(/\s*[;•]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

type ReadingBlock = {
  type: "heading" | "paragraph" | "list";
  text?: string;
  items?: string[];
  section?: string;
};

function parseReadingBlocks(markdown: string) {
  const blocks: ReadingBlock[] = [];
  const lines = markdown.trim().split("\n");
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let currentSection = "";

  function flushParagraph() {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: cleanMarkdownText(paragraph.join(" ")), section: currentSection });
    paragraph = [];
  }

  function flushList() {
    if (!listItems.length) return;
    blocks.push({ type: "list", items: listItems, section: currentSection });
    listItems = [];
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      currentSection = cleanMarkdownText(headingMatch[1]);
      blocks.push({ type: "heading", text: currentSection, section: currentSection });
      return;
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      listItems.push(...splitGridLine(bulletMatch[1]));
      return;
    }

    if (isReadingGridSection(currentSection)) {
      flushParagraph();
      listItems.push(...splitGridLine(line));
      return;
    }

    flushList();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();

  return blocks;
}

function getInlineAstroClass(text = "") {
  const normalized = normalizeText(text);

  if (/^retrogrado$/.test(normalized)) return "text-current text-[0.9em]";

  if (/^casa\s*(1|5|9)$/.test(normalized) || /^(aries|leao|sagitario|fogo)$/.test(normalized)) return "text-orange-600";
  if (/^casa\s*(2|6|10)$/.test(normalized) || /^(touro|virgem|capricornio|terra)$/.test(normalized)) return "text-emerald-600";
  if (/^casa\s*(3|7|11)$/.test(normalized) || /^(gemeos|libra|aquario|ar)$/.test(normalized)) return "text-sky-600";
  if (/^casa\s*(4|8|12)$/.test(normalized) || /^(cancer|escorpiao|peixes|agua)$/.test(normalized)) return "text-indigo-600";
  if (/^(sol|marte)$/.test(normalized)) return "text-red-600";
  if (/^(lua|venus)$/.test(normalized)) return "text-amber-600";
  if (/^(mercurio|urano)$/.test(normalized)) return "text-cyan-600";
  if (/^(jupiter|netuno)$/.test(normalized)) return "text-violet-600";
  if (/^(saturno|plutao|ascendente|nodos?)$/.test(normalized)) return "text-stone-600";
  return "";
}

function renderInlineAstroText(text = ""): ReactNode[] {
  const pattern = /\b(Casa\s*(?:1|2|3|4|5|6|7|8|9|10|11|12)|Sol|Lua|Ascendente|Merc[uú]rio|V[eê]nus|Marte|J[uú]piter|Saturno|Urano|Netuno|Plut[aã]o|Nodo(?:s)?|[ÁA]ries|Touro|G[eê]meos|C[aâ]ncer|Le[aã]o|Virgem|Libra|Escorpi[aã]o|Sagit[aá]rio|Capric[oó]rnio|Aqu[aá]rio|Peixes|Fogo|Terra|Ar|[ÁA]gua|retr[oó]grado)\b/gi;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const value = match[0];
    const className = getInlineAstroClass(value);
    nodes.push(
      <span key={`${value}-${match.index}`} className={`font-semibold ${className}`}>
        {value}
      </span>
    );
    lastIndex = match.index + value.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function parsePlanetListRow(item: string) {
  const match = item.match(/^([^:]+):\s*([^,]+)(?:,\s*(casa\s*\d+))?(?:,\s*(.+))?$/i);
  if (!match) return null;

  const name = cleanMarkdownText(match[1]);
  const normalizedName = normalizeText(name);
  if (!/\b(sol|lua|ascendente|marte|venus|mercurio|jupiter|saturno|urano|netuno|plutao|nodo|quiron|lilith)\b/.test(normalizedName)) {
    return null;
  }

  const house = [match[3], match[4]].filter(Boolean).join(", ");
  return [name, cleanMarkdownText(match[2]), cleanMarkdownText(house || "-")];
}

function parseHouseListRow(item: string) {
  const match = item.match(/^(casa\s*\d+)\s+(?:em|:)\s+(.+)$/i);
  if (!match) return null;
  return [cleanMarkdownText(match[1]), cleanMarkdownText(match[2])];
}

function parseAspectListRow(item: string) {
  const normalized = cleanMarkdownText(item);
  const colonMatch = normalized.match(/^([^:]+):\s*([^,]+)(?:,\s*(.+))?$/);
  if (colonMatch) {
    return [colonMatch[1], colonMatch[2], colonMatch[3] || "-"].map(cleanMarkdownText);
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    return [words[0], words.slice(1, -1).join(" "), words[words.length - 1]].map(cleanMarkdownText);
  }

  return null;
}

function getStructuredReadingRows(block: ReadingBlock) {
  const items = block.items || [];
  if (!items.length) return null;

  const houseRows = items.map(parseHouseListRow);
  if (houseRows.every(Boolean)) {
    return { columns: 2, rows: houseRows as string[][] };
  }

  const planetRows = items.map(parsePlanetListRow);
  if (planetRows.every(Boolean)) {
    return { columns: 3, rows: planetRows as string[][] };
  }

  if (/aspectos?.*marcantes?/.test(normalizeText(block.section))) {
    const aspectRows = items.map(parseAspectListRow);
    if (aspectRows.every(Boolean)) {
      return { columns: 3, rows: aspectRows as string[][] };
    }
  }

  return null;
}

function renderReadingList(block: ReadingBlock, isPreview: boolean, isDark: boolean) {
  const structured = getStructuredReadingRows(block);
  if (!structured) {
    return (
      <ul className={`${isPreview ? "space-y-2 pl-4 text-[0.92rem] leading-6" : "space-y-2 pl-5 text-[1rem] leading-7"}`}>
        {block.items?.map((item) => (
          <li key={item} className="list-disc marker:text-lilas-mistico">{renderInlineAstroText(item)}</li>
        ))}
      </ul>
    );
  }

  const gridStyle = structured.columns === 2
    ? { gridTemplateColumns: "0.7rem minmax(0,1fr) minmax(0,1fr)" }
    : { gridTemplateColumns: "0.7rem minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)" };
  const textClass = isPreview ? "text-[0.72rem] leading-4 sm:text-[0.86rem] sm:leading-5" : "text-[0.72rem] leading-4 sm:text-[0.95rem] sm:leading-6";

  return (
    <div className="space-y-1.5">
      {structured.rows.map((row, rowIndex) => (
        <div key={`${rowIndex}-${row.join("-")}`} className="grid items-baseline gap-2" style={gridStyle}>
          <span className="mt-[0.45em] h-1 w-1 rounded-full bg-lilas-mistico/70" aria-hidden="true" />
          {row.map((cell, cellIndex) => (
            <div key={`${cellIndex}-${cell}`} className={`min-w-0 ${textClass}`}>
              {renderInlineAstroText(cell)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ExplorerPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [charts, setCharts] = useState<ChartItem[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [readingParts, setReadingParts] = useState<string[]>([]);
  const [readingIndex, setReadingIndex] = useState(0);
  const readingTouchStartX = useRef<number | null>(null);
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
  const currentReadingBlocks = useMemo(
    () => readingParts[readingIndex] ? parseReadingBlocks(readingParts[readingIndex]) : [],
    [readingIndex, readingParts]
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
        const items = sortChartsByPrimary(data.items || []);
        setCharts(items);

        const primaryChart = items.find((chart) => chart.is_primary);
        const nextChart = currentChartParam || primaryChart?.chart_id || items[0]?.chart_id;
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
      setDocuments([]);
      setRenameValue("");
      return;
    }

    async function loadAssets() {
      try {
        setError("");
        const [imageData, documentData] = await Promise.all([
          callFunction("list-chart-images", { chart_id: selectedChartId }),
          callFunction("list-chart-documents", { chart_id: selectedChartId }),
        ]);
        setImages(imageData.items || []);
        setDocuments(documentData.items || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro carregando arquivos do mapa.");
      }
    }

    loadAssets();
    setRenameValue(selectedChart?.title || "");
  }, [selectedChartId, selectedChart?.title]);

  useEffect(() => {
    let revokedUrl: string | null = null;

    async function loadActiveImage() {
      const targetImageId = images[0]?.id || selectedChart?.preview_image_id || null;
      if (!targetImageId) {
        setActiveImageUrl(null);
        return;
      }

      try {
        const result = await fetchFunctionBlob("get-current-user-chart-image-file", { image_id: targetImageId });
        const objectUrl = URL.createObjectURL(result.blob);
        revokedUrl = objectUrl;
        setActiveImageUrl(objectUrl);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro carregando imagem do mapa.");
        setActiveImageUrl(null);
      }
    }

    loadActiveImage();

    return () => {
      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl);
      }
    };
  }, [images, selectedChart?.preview_image_id]);

  useEffect(() => {
    let cancelled = false;
    const markdownDoc = documents.find((doc) => doc.kind === "markdown");
    setReadingIndex(0);

    if (!markdownDoc) {
      setReadingParts([]);
      return;
    }

    async function loadReading() {
      try {
        const result = await fetchFunctionBlob("get-current-user-chart-document-file", { document_id: markdownDoc.id });
        const markdown = await result.blob.text();
        if (!cancelled) {
          setReadingParts(splitReadingIntoCards(markdown));
        }
      } catch {
        if (!cancelled) setReadingParts([]);
      }
    }

    loadReading();

    return () => {
      cancelled = true;
    };
  }, [documents]);

  async function handleRename() {
    if (!selectedChartId || !renameValue.trim()) return;
    setBusy(true);
    try {
      await callFunction("set-chart-title-current-user", {
        chart_id: selectedChartId,
        title: renameValue.trim(),
      });
      const refreshed = await callFunction("list-user-charts");
      setCharts(sortChartsByPrimary(refreshed.items || []));
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
      setCharts(sortChartsByPrimary(refreshed.items || []));
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
      const items = sortChartsByPrimary(refreshed.items || []);
      setCharts(items);
      setImages([]);
      setDocuments([]);
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

  function goToPreviousReading() {
    setReadingIndex((value) => Math.max(0, value - 1));
  }

  function goToNextReading() {
    setReadingIndex((value) => Math.min(readingParts.length - 1, value + 1));
  }

  function handleReadingWheel(event: WheelEvent<HTMLDivElement>) {
    if (Math.abs(event.deltaX) < Math.abs(event.deltaY) || Math.abs(event.deltaX) < 24) return;
    event.preventDefault();
    if (event.deltaX > 0) {
      goToNextReading();
    } else {
      goToPreviousReading();
    }
  }

  function handleReadingTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startX = readingTouchStartX.current;
    readingTouchStartX.current = null;
    if (startX === null) return;

    const deltaX = startX - event.changedTouches[0].clientX;
    if (Math.abs(deltaX) < 45) return;

    if (deltaX > 0) {
      goToNextReading();
    } else {
      goToPreviousReading();
    }
  }

  async function handleDownloadImage(imageId: string) {
    setBusy(true);
    try {
      await downloadBlob("get-current-user-chart-image-file", { image_id: imageId }, "mapa.svg");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro baixando imagem.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadBlob(path: string, body: Record<string, unknown>, fallbackFilename: string) {
    const result = await fetchFunctionBlob(path, body);
    const objectUrl = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = result.filename || fallbackFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    return result;
  }

  async function handleDownloadDocument(documentId: string) {
    setBusy(true);
    try {
      await downloadBlob("get-current-user-chart-document-file", { document_id: documentId }, "interpretacao.md");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro baixando documento.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDownloadRawJson() {
    if (!selectedChartId) return;

    setBusy(true);
    try {
      await downloadBlob("get-current-user-chart-raw-json-file", { chart_id: selectedChartId }, "mapa-raw-chart.json");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro baixando JSON bruto do mapa.");
    } finally {
      setBusy(false);
    }
  }

  async function handleExportPdf() {
    const markdownDoc = documents.find((doc) => doc.kind === "markdown");
    if (!markdownDoc || !activeImageUrl || !selectedChart) return;

    setBusy(true);
    try {
      const result = await fetchFunctionBlob("get-current-user-chart-document-file", { document_id: markdownDoc.id });
      const markdown = await result.blob.text();
      const printWindow = window.open("", "_blank", "noopener,noreferrer");
      if (!printWindow) throw new Error("Nao foi possivel abrir a janela de exportacao.");

      printWindow.document.write(buildPdfHtml({
        title: markdownDoc.title || selectedChart.title || "Interpretacao do mapa",
        chartTitle: selectedChart.title || "Mapa sem nome",
        chartInfo: `${formatBirthDate(selectedChart.birth_date)} ${selectedChart.birth_time} - ${selectedChart.timezone}`,
        imageUrl: activeImageUrl,
        markdown,
      }));
      printWindow.document.close();
      printWindow.focus();
      window.setTimeout(() => printWindow.print(), 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro exportando PDF.");
    } finally {
      setBusy(false);
    }
  }
  const pageClass = isDark ? "bg-slate-950 text-slate-100" : "bg-offwhite-leve text-gray-900";
  const panelClass = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-black/10 bg-white text-gray-900";
  const selectedCardClass = isDark ? "border-lilas-mistico bg-lilas-mistico/10" : "border-lilas-mistico bg-lilas-mistico/5";
  const hoverCardClass = isDark ? "hover:bg-white/5" : "hover:bg-gray-50";
  const subtleClass = isDark ? "text-slate-400" : "text-muted-foreground";
  const imageStageClass = isDark ? "border-white/10 bg-slate-950" : "border-black/10 bg-gray-50";
  const inputClass = isDark ? "border-white/10 bg-slate-950 text-slate-100 focus:ring-lilas-mistico" : "border-black/10 bg-white text-gray-900 focus:ring-lilas-mistico";

  return (
    <main className={`min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-6 ${pageClass}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <PrivateTopbar user={currentUser} isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)} onSignOut={handleSignOut} />

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className={`rounded-2xl border p-5 shadow-sm ${panelClass}`}>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Galeria de Planejamento Ciclico</p>
              <h2 className="mt-2 text-xl font-atteron leading-tight sm:text-2xl">Seus mapas salvos</h2>
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
                  <div className={`mt-1 text-xs ${subtleClass}`}>{formatHouseSystem(chart.house_system)}{chart.is_primary ? " · principal" : ""}</div>
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
                      <h2 className="mt-2 text-2xl font-atteron leading-tight sm:text-3xl">{selectedChart.title || "Mapa sem nome"}</h2>
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
                    {activeImageUrl ? (
                      <button
                        type="button"
                        onClick={() => setIsImageModalOpen(true)}
                        className="flex h-full w-full items-center justify-center"
                        aria-label="Expandir mapa"
                        title="Clique para ampliar"
                      >
                        <img src={activeImageUrl} alt="Mapa astral" className="h-auto w-full object-contain" />
                      </button>
                    ) : (
                      <div className={`px-6 text-center text-sm ${subtleClass}`}>
                        Nenhuma imagem gerada ainda para este mapa.
                      </div>
                    )}
                  </div>

                  <div className={`mt-5 rounded-2xl border p-5 ${panelClass}`}>
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-lilas-mistico">Sobre o mapa</p>
                      </div>
                      {readingParts.length ? (
                        <span className={`rounded-full border px-3 py-1 text-xs ${isDark ? "border-white/10 text-slate-300" : "border-black/10 text-muted-foreground"}`}>
                          {readingIndex + 1} de {readingParts.length}
                        </span>
                      ) : null}
                    </div>

                    {readingParts.length ? (
                      <div className="space-y-4">
                        <button
                          type="button"
                          onClick={() => setIsReadingModalOpen(true)}
                          className={`block w-full overflow-hidden rounded-xl border text-left transition ${isDark ? "border-white/10 bg-slate-950/60 text-slate-200 hover:bg-white/5" : "border-black/10 bg-marfim/70 text-gray-800 hover:bg-white"}`}
                        >
                          <div className="max-h-[220px] space-y-3 overflow-hidden px-5 py-5 leading-7">
                            {currentReadingBlocks.slice(0, 3).map((block, index) => {
                              if (block.type === "heading") {
                                return <h4 key={`${index}-${block.text}`} className="max-w-[34rem] font-atteron text-[1.55rem] leading-[1.05] text-lilas-mistico sm:text-2xl">{renderInlineAstroText(block.text)}</h4>;
                              }

                              if (block.type === "list") {
                                return <div key={`${index}-${block.items?.[0] || "list"}`}>{renderReadingList(block, true, isDark)}</div>;
                              }

                              return <p key={`${index}-${block.text?.slice(0, 24)}`} className={`max-w-[42rem] text-[0.95rem] leading-7 ${isDark ? "text-slate-300" : "text-gray-700"}`}>{renderInlineAstroText(block.text)}</p>;
                            })}
                          </div>
                          <div className={`border-t px-5 py-3 text-sm font-medium text-lilas-mistico ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white/70"}`}>
                            Abrir leitura completa
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className={`rounded-xl border border-dashed p-4 text-sm ${subtleClass}`}>
                        Quando o GPT salvar uma interpretação em Markdown, ela aparece aqui em cards de leitura.
                      </div>
                    )}
                  </div>

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
                    <p className="mb-3 text-xs uppercase tracking-[0.16em] text-lilas-mistico">Dados do mapa</p>
                    <dl className="grid grid-cols-2 gap-2.5 text-sm">
                      {[
                        ["Data", formatBirthDate(selectedChart.birth_date)],
                        ["Hora", selectedChart.birth_time],
                        ["Casas", formatHouseSystem(selectedChart.house_system)],
                        ["Principal", selectedChart.is_primary ? "Sim" : "Nao"],
                        ["Timezone", selectedChart.timezone],
                      ].map(([label, value]) => (
                        <div key={label} className={`min-h-[74px] rounded-2xl border px-3 py-3 ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-marfim/70"}`}>
                          <dt className={`text-[0.68rem] uppercase tracking-[0.14em] ${subtleClass}`}>{label}</dt>
                          <dd className="mt-1 break-words font-medium leading-snug">{value}</dd>
                        </div>
                      ))}
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
                              href="#"
                              onClick={(event) => {
                                event.preventDefault();
                                handleDownloadImage(image.id);
                              }}
                              className={`rounded-lg border px-3 py-2 text-xs ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      )) : <div className={`text-sm ${subtleClass}`}>Nenhuma imagem salva.</div>}
                    </div>
                  </div>

                  <div className={`rounded-2xl border p-4 ${panelClass}`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-semibold">Textos e dados</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadRawJson}
                          disabled={busy || !selectedChartId}
                          className={`rounded-lg border px-3 py-2 text-xs disabled:opacity-50 ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                        >
                          JSON bruto
                        </button>
                        <button
                          type="button"
                          onClick={handleExportPdf}
                          disabled={busy || !activeImageUrl || !documents.some((doc) => doc.kind === "markdown")}
                          className={`rounded-lg border px-3 py-2 text-xs disabled:opacity-50 ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                        >
                          Exportar PDF
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {documents.length ? documents.map((doc) => (
                        <div key={doc.id} className={`rounded-xl border px-3 py-3 ${isDark ? "border-white/10" : "border-black/10"}`}>
                          <div className="text-sm font-medium">{doc.title || (doc.kind === "markdown" ? "Interpretacao" : "Dados estruturados")}</div>
                          <div className={`mt-1 text-xs ${subtleClass}`}>{doc.kind === "markdown" ? "Markdown" : "JSON"} · {doc.mime_type}</div>
                          <div className="mt-3 flex gap-2">
                            <a
                              href="#"
                              onClick={(event) => {
                                event.preventDefault();
                                handleDownloadDocument(doc.id);
                              }}
                              className={`rounded-lg border px-3 py-2 text-xs ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                            >
                              Baixar {doc.kind === "markdown" ? ".md" : ".json"}
                            </a>
                          </div>
                        </div>
                      )) : <div className={`text-sm ${subtleClass}`}>Nenhum texto salvo ainda. Quando o GPT salvar uma interpretacao, ela aparece aqui.</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className={`max-h-[94vh] max-w-[96vw] overflow-hidden ${isDark ? "border-white/10 bg-slate-950 text-slate-100" : "bg-white"}`}>
          <DialogHeader>
            <DialogTitle className="font-atteron text-2xl leading-tight sm:text-3xl">{selectedChart?.title || "Mapa astral"}</DialogTitle>
          </DialogHeader>
          <div className={`flex max-h-[78vh] items-center justify-center overflow-auto rounded-2xl border p-4 ${imageStageClass}`}>
            {activeImageUrl ? (
              <img src={activeImageUrl} alt="Mapa astral ampliado" className="h-auto max-h-[72vh] w-auto max-w-full object-contain" />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReadingModalOpen} onOpenChange={setIsReadingModalOpen}>
        <DialogContent className={`max-h-[92vh] max-w-[860px] overflow-hidden ${isDark ? "border-white/10 bg-slate-950 text-slate-100" : "bg-white"}`}>
          <DialogHeader>
            <DialogTitle className="font-atteron text-2xl leading-tight sm:text-3xl">Sobre o mapa</DialogTitle>
          </DialogHeader>

          {readingParts.length ? (
            <div className="space-y-4">
              <div
                className={`max-h-[62vh] touch-pan-y overflow-y-auto rounded-2xl border px-5 py-5 leading-7 ${isDark ? "border-white/10 bg-slate-900 text-slate-200" : "border-black/10 bg-marfim/70 text-gray-800"}`}
                onWheel={handleReadingWheel}
                onTouchStart={(event) => {
                  readingTouchStartX.current = event.touches[0].clientX;
                }}
                onTouchEnd={handleReadingTouchEnd}
              >
                <div className="space-y-4">
                  {currentReadingBlocks.map((block, index) => {
                    if (block.type === "heading") {
                      return <h4 key={`${index}-${block.text}`} className="max-w-[42rem] font-atteron text-2xl leading-[1.08] text-lilas-mistico sm:text-3xl">{renderInlineAstroText(block.text)}</h4>;
                    }

                    if (block.type === "list") {
                      return <div key={`${index}-${block.items?.[0] || "list"}`}>{renderReadingList(block, false, isDark)}</div>;
                    }

                    return <p key={`${index}-${block.text?.slice(0, 24)}`} className={`max-w-[46rem] text-[1rem] leading-8 ${isDark ? "text-slate-300" : "text-gray-700"}`}>{renderInlineAstroText(block.text)}</p>;
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goToPreviousReading}
                  disabled={readingIndex === 0}
                  className={`rounded-lg border px-4 py-2 text-sm disabled:opacity-40 ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                >
                  Voltar
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${subtleClass}`}>{readingIndex + 1} de {readingParts.length}</span>
                  <div className="flex gap-1">
                    {readingParts.map((part, index) => (
                      <button
                        key={`${index}-${part.slice(0, 12)}`}
                        type="button"
                        onClick={() => setReadingIndex(index)}
                        className={`h-2 rounded-full transition-all ${index === readingIndex ? "w-6 bg-lilas-mistico" : isDark ? "w-2 bg-white/20" : "w-2 bg-black/20"}`}
                        aria-label={`Ir para leitura ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={goToNextReading}
                  disabled={readingIndex >= readingParts.length - 1}
                  className="rounded-lg bg-lilas-mistico px-4 py-2 text-sm text-white disabled:opacity-40"
                >
                  Avançar leitura
                </button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}


