"use client";

import { useEffect, useRef, useState } from "react";
import { NICHES } from "@/lib/niches-data";
import { NICHE_CONFIGS, TONE_OPTIONS } from "@/lib/niche-objects-data";

// Topic suggestion chips per niche — operator can extend per nicho.
const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  casa: [
    "vinagre branco multiuso",
    "esponja é nojenta depois de 7 dias",
    "5 erros que estragam panela antiaderente",
  ],
  plantas: [
    "regar suculenta direito",
    "luz indireta vs direta",
    "por que sua orquídea morreu",
  ],
  financeiro: [
    "como o IR consome 30% do seu salário",
    "dívida no rotativo cobra 400% ao ano",
    "fundos de renda fixa que pagam 13%",
  ],
  culinaria: [
    "chocolate ganache em 1 minuto",
    "pão sem sova de 5 ingredientes",
    "ovo perfeito sem tempo de cozinhar",
  ],
  saude: [
    "alimentos que reduzem inflamação",
    "água com limão de manhã: mito ou verdade",
    "3 sinais de pré-diabetes que você ignora",
  ],
  pets: [
    "comida humana que mata cachorro",
    "como saber se gato está estressado",
    "vermífugo: a cada quanto tempo",
  ],
  fitness: [
    "carboidrato antes ou depois do treino",
    "3 exercícios que custam zero",
    "creatina: precisa fazer ciclo",
  ],
  // Fallback for niches without curated suggestions
  _default: [
    "tema 1",
    "tema 2",
    "tema 3",
  ],
};

function getTopicSuggestions(niche: string): string[] {
  return TOPIC_SUGGESTIONS[niche] ?? TOPIC_SUGGESTIONS._default;
}

function getDefaultObjectsFor(niche: string): string {
  const cfg = NICHE_CONFIGS[niche];
  if (!cfg?.objects?.length) return "";
  return cfg.objects.slice(0, 2).map((o) => o.id).join(", ");
}

// Sprint 29 — demo preview shown inside PackagePreview to communicate
// "this is what your reel will look like" before the user pays for a real
// Veo render. Reuses the real Sprint 19 Veo output (8s, ~$4 already paid)
// so we get authentic product fidelity with zero new GCP cost.
// Swap to your own asset by uploading to gs://viralobj-assets/<path> and
// replacing this URL.
const MOCK_PREVIEW_VIDEO_URL =
  "https://storage.googleapis.com/viralobj-assets/videos/system%3Agemini-agent/ygoBeN3ueEW9RpuIBfbB/scene-0/15456740302001063961/sample_0.mp4";

// ─── Types ────────────────────────────────────────────────────────────

// Sprint 30 — flat state. The render flow no longer transitions to
// separate "rendering" / "completed" screens; it stays on the package
// step and shows render progress + final video inline. Keeps the user's
// context (post copy, characters, captions) visible throughout.
type Step = "input" | "package" | "failed";

type Character = {
  id?: number;
  name_pt?: string;
  emoji?: string;
  timestamp_start?: string;
  timestamp_end?: string;
  voice_script_pt?: string;
  voice_script_en?: string;
};

type PostCopy = {
  hook_pt?: string;
  body_pt?: string;
  cta_pt?: string;
  hashtags_pt?: string[];
  hashtags_en?: string[];
};

type Variation = { id?: number; angle_pt?: string; title_pt?: string };

type Caption = {
  time?: string;
  text_pt?: string;
  text_en?: string;
  character?: string;
  style?: string;
  color?: string;
};

type Package = {
  meta?: {
    niche?: string;
    topic_pt?: string;
    tone?: string;
    duration?: number;
    objects_count?: number;
  };
  characters?: Character[];
  post_copy?: PostCopy;
  variations?: Variation[];
  captions_full_script?: Caption[];
};

type Scene = {
  index: number;
  status: string;
  public_url?: string | null;
  gcs_uri?: string | null;
  error?: string | null;
};

type StatusResp = {
  ok: boolean;
  status: string;
  scene_count?: number;
  completed_scenes?: number;
  failed_scenes?: number;
  scenes?: Scene[];
  mock?: boolean;
};

type HistoryEntry = {
  id: string;
  ts: number;
  niche: string;
  topic: string;
  objects: string;
  tone: string;
  duration: number;
  hook?: string;
  videoUrl?: string;
};

type ErrorMap = {
  401: { title: string; hint: string };
  402: { title: string; hint: string };
  403: { title: string; hint: string };
  429: { title: string; hint: string };
  500: { title: string; hint: string };
};

const ERRORS: ErrorMap = {
  401: { title: "Sessão expirada", hint: "Faça login novamente para continuar." },
  402: { title: "Sem créditos", hint: "Compre 1 cena na aba Assinatura para renderizar." },
  403: { title: "Veo desabilitado", hint: "ENABLE_VEO_GENERATION=false (modo seguro). Reativa quando estiver pronto pra cobrar render real." },
  429: { title: "Limite diário atingido", hint: "Tente novamente após meia-noite UTC, ou aumente os caps." },
  500: { title: "Erro inesperado", hint: "Tente novamente em alguns segundos." },
};

function pickError(status: number): { title: string; hint: string } {
  const k = (status >= 500 ? 500 : status) as keyof ErrorMap;
  return ERRORS[k] ?? ERRORS[500];
}

// Loading hints — rotate every 1.4s during async work to give a sense of progress.
const HINTS_PACKAGE = [
  "📚 Lendo o nicho…",
  "🎭 Escolhendo personalidades…",
  "✍️ Escrevendo roteiro bilíngue…",
  "🏷️ Gerando hashtags virais…",
  "🎬 Empacotando timeline…",
];
const HINTS_RENDER = [
  "🤖 Submetendo job ao Veo…",
  "🎨 Renderizando frames 9:16…",
  "🎙️ Sincronizando lip-sync…",
  "🎵 Mixando áudio…",
  "📦 Subindo MP4 para Cloud Storage…",
];

const HISTORY_KEY = "viralobj.generate.history.v1";

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistoryEntry(entry: HistoryEntry) {
  if (typeof window === "undefined") return;
  try {
    const cur = loadHistory();
    const next = [entry, ...cur.filter((e) => e.id !== entry.id)].slice(0, 5);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* quota or disabled — degrade silently */
  }
}

// ─── Component ────────────────────────────────────────────────────────

export default function AppGeneratePage() {
  const [step, setStep] = useState<Step>("input");
  const [niche, setNiche] = useState("casa");
  const [objects, setObjects] = useState("esponja, celular");
  const [topic, setTopic] = useState("vinagre branco multiuso");
  const [tone, setTone] = useState("dramatic");
  const [duration, setDuration] = useState(15);

  const [pkg, setPkg] = useState<Package | null>(null);
  const [providerUsed, setProviderUsed] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [statusResp, setStatusResp] = useState<StatusResp | null>(null);
  const [error, setError] = useState<{ title: string; hint: string; raw?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  // Sprint 30 — flat render state, lives alongside the package
  const [isRendering, setIsRendering] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [credits] = useState<number>(999);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hintIdx, setHintIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearPoll() {
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = null;
  }
  function clearHints() {
    if (hintTimer.current) clearInterval(hintTimer.current);
    hintTimer.current = null;
  }
  useEffect(() => () => { clearPoll(); clearHints(); }, []);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Sprint 28b — auto-fill objects when niche changes (only if user hasn't
  // typed something distinct from the previous niche's defaults). Avoids
  // wiping a curated list the user is mid-editing.
  const lastNicheRef = useRef<string>(niche);
  useEffect(() => {
    const prev = lastNicheRef.current;
    if (prev === niche) return;
    const prevDefault = getDefaultObjectsFor(prev);
    const curObjs = objects.trim();
    if (!curObjs || curObjs === prevDefault) {
      const next = getDefaultObjectsFor(niche);
      if (next) setObjects(next);
    }
    lastNicheRef.current = niche;
  }, [niche, objects]);

  // Drive rotating hints when busy.
  useEffect(() => {
    if (!busy) {
      clearHints();
      setHintIdx(0);
      return;
    }
    setHintIdx(0);
    hintTimer.current = setInterval(() => {
      setHintIdx((i) => i + 1);
    }, 1400);
    return clearHints;
  }, [busy]);

  function copy(label: string, text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(label);
    setTimeout(() => setCopied(null), 1600);
  }

  // ─── Step 1: Generate package (dry_run) ──────────────────────────────
  async function handleGeneratePackage() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/app/generate-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche,
          objects: objects.split(",").map((s) => s.trim()).filter(Boolean),
          topic,
          tone,
          duration,
          lang: "both",
          dry_run: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const e = pickError(res.status);
        setError({ ...e, raw: (data as { error?: string }).error });
        setBusy(false);
        return;
      }
      setPkg((data as { package?: Package }).package ?? null);
      setProviderUsed((data as { provider_used?: string }).provider_used ?? null);
      setStep("package");
    } catch (e) {
      setError({ title: "Erro de rede", hint: "Não consegui contactar o servidor.", raw: String(e) });
    } finally {
      setBusy(false);
    }
  }

  // ─── Sprint 30: in-place render — never leaves the package screen ────
  async function handleRenderReel() {
    setError(null);
    setIsRendering(true);
    setStatusResp(null);
    setVideoUrl(null);
    try {
      const res = await fetch("/api/app/render-reel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche,
          objects: objects.split(",").map((s) => s.trim()).filter(Boolean),
          topic,
          tone,
          duration,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const e = pickError(res.status);
        setError({ ...e, raw: (data as { error?: string }).error });
        setIsRendering(false);
        return;
      }
      const id = (data as { job_id?: string }).job_id;
      if (!id) {
        setError({ ...pickError(500), raw: "bridge não retornou job_id" });
        setIsRendering(false);
        return;
      }
      setJobId(id);
      startPolling(id);
    } catch (e) {
      setError({ title: "Erro de rede", hint: "Não consegui contactar o servidor.", raw: String(e) });
      setIsRendering(false);
    }
  }

  function startPolling(id: string) {
    clearPoll();
    let attempts = 0;
    const tick = async () => {
      attempts++;
      try {
        const res = await fetch(
          `/api/app/render-status?job_id=${encodeURIComponent(id)}`,
        );
        const data = (await res.json().catch(() => ({}))) as StatusResp;
        setStatusResp(data);
        if (data.status === "completed") {
          clearPoll();
          const url = data.scenes?.find((s) => s.status === "completed")?.public_url ?? null;
          setVideoUrl(url);
          setIsRendering(false);
          // Persist to history once we have a public URL.
          const entry: HistoryEntry = {
            id: id,
            ts: Date.now(),
            niche,
            topic,
            objects,
            tone,
            duration,
            hook: pkg?.post_copy?.hook_pt,
            videoUrl: url ?? undefined,
          };
          saveHistoryEntry(entry);
          setHistory(loadHistory());
        } else if (data.status === "failed") {
          clearPoll();
          setIsRendering(false);
          setStep("failed");
        } else if (attempts > 60) {
          clearPoll();
          setIsRendering(false);
          setError({ title: "Timeout", hint: "O render demorou demais.", raw: `attempts=${attempts}` });
        }
      } catch {
        /* keep polling */
      }
    };
    tick();
    pollTimer.current = setInterval(tick, 1500);
  }

  function reset(opts: { keep?: "all" | "niche" | "tone" } = {}) {
    clearPoll();
    setStep("input");
    setPkg(null);
    setJobId(null);
    setStatusResp(null);
    setVideoUrl(null);
    setIsRendering(false);
    setError(null);
    setBusy(false);
    if (opts.keep !== "all") {
      if (opts.keep !== "niche") setObjects("esponja, celular");
      if (opts.keep !== "tone") setTone("dramatic");
      setTopic("");
    }
  }

  function loadFromHistory(entry: HistoryEntry) {
    setNiche(entry.niche);
    setTopic(entry.topic);
    setObjects(entry.objects);
    setTone(entry.tone);
    setDuration(entry.duration);
    reset({ keep: "all" });
  }

  const nicheLabel = NICHES.find((n) => n.id === niche)?.label ?? niche;

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Gerar reel</h1>
            <p className="text-viral-muted text-sm">
              Pacote (Gemini) → render (Veo) → vídeo final.
            </p>
          </div>
          <div className="card px-4 py-2 text-right">
            <div className="text-[10px] uppercase tracking-wider text-viral-muted">Créditos</div>
            <div className="text-xl font-bold">{credits}</div>
          </div>
        </header>

        <Stepper step={step} hasVideo={!!videoUrl} isRendering={isRendering} />

        {error && (
          <div className="card p-4 border-red-500/40 bg-red-500/10">
            <div className="font-semibold text-red-300 mb-1">⚠️ {error.title}</div>
            <p className="text-sm text-viral-muted">{error.hint}</p>
            {error.raw && (
              <pre className="text-[10px] text-viral-muted/60 mt-2 font-mono overflow-x-auto">{error.raw}</pre>
            )}
          </div>
        )}

        {step === "input" && (
          <InputForm
            niche={niche} setNiche={setNiche}
            objects={objects} setObjects={setObjects}
            topic={topic} setTopic={setTopic}
            tone={tone} setTone={setTone}
            duration={duration} setDuration={setDuration}
            busy={busy}
            hint={busy ? HINTS_PACKAGE[hintIdx % HINTS_PACKAGE.length] : null}
            topicSuggestions={getTopicSuggestions(niche)}
            onSubmit={handleGeneratePackage}
          />
        )}

        {step === "package" && pkg && (
          <PackagePreview
            pkg={pkg}
            providerUsed={providerUsed}
            nicheLabel={nicheLabel}
            tone={tone}
            duration={duration}
            busy={busy}
            isRendering={isRendering}
            videoUrl={videoUrl}
            jobId={jobId}
            statusResp={statusResp}
            onBack={() => reset({ keep: "all" })}
            onRender={handleRenderReel}
            onCopy={copy}
            copied={copied}
            onDuplicate={() => reset({ keep: "all" })}
            onChangeTone={() => reset({ keep: "niche" })}
            onNew={() => reset({})}
          />
        )}

        {step === "failed" && (
          <div className="card p-6 border-red-500/40 bg-red-500/10 text-center space-y-3">
            <div className="text-3xl">❌</div>
            <div className="font-semibold">Render falhou</div>
            <button type="button" onClick={() => reset({ keep: "all" })} className="btn-primary">
              Tentar novamente
            </button>
          </div>
        )}
      </div>

      {/* Sidebar — history */}
      <aside className="space-y-3">
        <div className="card p-4">
          <div className="eyebrow mb-3">Histórico recente</div>
          {history.length === 0 ? (
            <p className="text-xs text-viral-muted">Suas últimas 5 gerações ficam aqui.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => loadFromHistory(h)}
                    className="w-full text-left p-2 rounded-md border border-viral-border hover:bg-viral-border/30 transition"
                  >
                    <div className="text-xs font-semibold truncate">{h.topic || "(sem tema)"}</div>
                    <div className="text-[10px] text-viral-muted truncate">
                      {h.niche} · {h.tone} · {h.duration}s
                    </div>
                    {h.hook && (
                      <div className="text-[10px] text-viral-muted/80 italic line-clamp-2 mt-1">
                        &quot;{h.hook}&quot;
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4 text-xs text-viral-muted">
          <div className="font-semibold text-viral-text mb-1">💡 Dica</div>
          <p>
            Use <strong>Duplicar ideia</strong> ao final pra gerar o mesmo nicho com tema diferente, ou <strong>Variar tom</strong> para experimentar dramatic / funny / educational.
          </p>
        </div>
      </aside>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────

function Stepper({
  step,
  hasVideo,
  isRendering,
}: {
  step: Step;
  hasVideo: boolean;
  isRendering: boolean;
}) {
  // Sprint 30 — 3 phases. The "Vídeo" pill lights up only after a real
  // render completes, not after the package generation.
  const phases = [
    { id: "input" as const, label: "1. Tema",   active: step === "input" },
    { id: "package" as const, label: "2. Pacote", active: step === "package" && !isRendering && !hasVideo },
    { id: "video" as const,   label: "3. Vídeo",  active: isRendering || hasVideo },
  ];
  return (
    <div className="flex items-center gap-2 text-xs">
      {phases.map((p, i) => {
        const past = (p.id === "input" && (step === "package" || step === "failed"))
                  || (p.id === "package" && hasVideo);
        const dim = !p.active && !past;
        return (
          <span
            key={p.id}
            className={`px-3 py-1 rounded-full border transition ${
              p.active
                ? "bg-viral-accent text-white border-viral-accent"
                : past
                  ? "bg-viral-accent/20 text-viral-text border-viral-accent/40"
                  : "border-viral-border text-viral-muted"
            } ${isRendering && p.id === "video" ? "animate-pulse" : ""}`}
          >
            {p.label}
            {p.id === "video" && hasVideo && " ✓"}
          </span>
        );
      })}
    </div>
  );
}

function InputForm(props: {
  niche: string; setNiche: (v: string) => void;
  objects: string; setObjects: (v: string) => void;
  topic: string; setTopic: (v: string) => void;
  tone: string; setTone: (v: string) => void;
  duration: number; setDuration: (v: number) => void;
  busy: boolean;
  hint: string | null;
  topicSuggestions: string[];
  onSubmit: () => void;
}) {
  const { niche, setNiche, objects, setObjects, topic, setTopic, tone, setTone, duration, setDuration, busy, hint, topicSuggestions, onSubmit } = props;
  const toneInfo = TONE_OPTIONS.find((t) => t.id === tone);
  return (
    <div className="card p-6 space-y-4">
      <div>
        <label htmlFor="niche-select" className="block text-xs uppercase tracking-wider text-viral-muted mb-1">Nicho</label>
        <select
          id="niche-select"
          aria-label="Nicho do reel"
          className="input w-full"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
        >
          {NICHES.map((n) => (
            <option key={n.id} value={n.id}>{n.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="objects-input" className="block text-xs uppercase tracking-wider text-viral-muted mb-1">
          Objetos (separados por vírgula)
        </label>
        <input
          id="objects-input"
          className="input w-full"
          value={objects}
          onChange={(e) => setObjects(e.target.value)}
          placeholder="esponja, água sanitária"
        />
      </div>

      <div>
        <label htmlFor="topic-input" className="block text-xs uppercase tracking-wider text-viral-muted mb-1">Tema</label>
        <input
          id="topic-input"
          className="input w-full"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: como limpar casa mais rápido | por que seu gato te ignora"
        />
        {topicSuggestions.length > 0 && (
          <div className="mt-2">
            <div className="text-[10px] uppercase tracking-wider text-viral-muted/70 mb-1">
              Exemplos para esse nicho
            </div>
            <div className="flex flex-wrap gap-2">
              {topicSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  className="text-[11px] px-2 py-1 rounded-full border border-viral-border hover:bg-viral-accent/10 hover:border-viral-accent/40 transition text-viral-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tone-select" className="block text-xs uppercase tracking-wider text-viral-muted mb-1">Tom</label>
          <select
            id="tone-select"
            aria-label="Tom do reel"
            className="input w-full"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            {TONE_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
            ))}
          </select>
          {toneInfo?.description && (
            <p className="text-[10px] text-viral-muted/70 mt-1 italic">
              {toneInfo.description}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="duration-input" className="block text-xs uppercase tracking-wider text-viral-muted mb-1">Duração (s)</label>
          <input
            id="duration-input"
            aria-label="Duração total do reel em segundos"
            type="number"
            min={10}
            max={90}
            className="input w-full"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={busy || !topic.trim() || !objects.trim()}
        className="btn-primary w-full"
      >
        {busy ? (hint ?? "Gerando…") : "Gerar pacote"}
      </button>
      {busy && (
        <div className="text-center">
          <ProgressDots />
        </div>
      )}
    </div>
  );
}

function PackagePreview(props: {
  pkg: Package;
  providerUsed: string | null;
  nicheLabel: string;
  tone: string;
  duration: number;
  busy: boolean;
  isRendering: boolean;
  videoUrl: string | null;
  jobId: string | null;
  statusResp: StatusResp | null;
  onBack: () => void;
  onRender: () => void;
  onCopy: (label: string, text: string) => void;
  copied: string | null;
  onDuplicate: () => void;
  onChangeTone: () => void;
  onNew: () => void;
}) {
  const { pkg, providerUsed, nicheLabel, tone, duration, busy, isRendering, videoUrl, jobId, statusResp, onBack, onRender, onCopy, copied, onDuplicate, onChangeTone, onNew } = props;
  const post = pkg.post_copy ?? {};
  const hashtags = (post.hashtags_pt ?? []).join(" ");
  return (
    <div className="space-y-4">
      {/* Hero — reshapes its message based on render state */}
      <div className="card p-6 bg-gradient-to-br from-viral-accent/10 via-transparent to-viral-accent2/10 border-viral-accent/30">
        {videoUrl ? (
          <>
            <h2 className="text-2xl font-bold mb-3">✅ Seu vídeo viral está pronto</h2>
            <p className="text-sm text-viral-muted">
              Render completo. Confira o player abaixo, baixe o MP4 e copie o post pra Instagram.
            </p>
          </>
        ) : isRendering ? (
          <>
            <h2 className="text-2xl font-bold mb-3">🎬 Renderizando seu reel…</h2>
            <p className="text-sm text-viral-muted">
              A IA está animando os personagens e sincronizando o áudio. Não feche esta tela.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-3">🚀 Seu vídeo viral está pronto</h2>
            <ul className="space-y-1 text-sm text-viral-muted">
              <li className="flex items-center gap-2"><span className="text-viral-accent">✔</span> Roteiro bilíngue com marcações de cena</li>
              <li className="flex items-center gap-2"><span className="text-viral-accent">✔</span> Personagens com voz e personalidade</li>
              <li className="flex items-center gap-2"><span className="text-viral-accent">✔</span> Post pronto pra Instagram (hook · body · hashtags)</li>
              <li className="flex items-center gap-2"><span className="text-viral-accent">✔</span> Timeline de captions com timestamps</li>
            </ul>
          </>
        )}
      </div>

      {/* Video frame — three states share the same slot for visual continuity */}
      {videoUrl ? (
        <FinalVideoBlock
          videoUrl={videoUrl}
          jobId={jobId}
          mock={!!statusResp?.mock}
          post={post}
          hashtags={hashtags}
          onCopy={onCopy}
          copied={copied}
        />
      ) : isRendering ? (
        <RenderingInline jobId={jobId} statusResp={statusResp} />
      ) : (
        <div className="card p-2 overflow-hidden">
          <div className="text-[10px] uppercase tracking-wider text-viral-muted font-semibold px-3 pt-2 pb-1 flex items-center justify-between">
            <span>Preview do estilo de vídeo</span>
            <span className="text-viral-muted/60 normal-case font-normal">amostra Veo · 8s · 9:16</span>
          </div>
          <video
            controls
            preload="metadata"
            className="w-full max-w-[280px] mx-auto rounded-lg shadow-lg"
            src={MOCK_PREVIEW_VIDEO_URL}
          >
            Seu navegador não suporta vídeo.
          </video>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="eyebrow text-viral-accent mb-1">📦 Pacote gerado</div>
            <h2 className="text-2xl font-bold mb-1">{pkg.meta?.topic_pt ?? "(sem tema)"}</h2>
            <p className="text-xs text-viral-muted">
              {nicheLabel} · {tone} · {duration}s · {pkg.meta?.objects_count ?? "?"} objeto(s)
            </p>
          </div>
          {providerUsed && (
            <code className="text-[10px] font-mono text-viral-muted bg-viral-bg/40 px-2 py-1 rounded whitespace-nowrap">
              {providerUsed}
            </code>
          )}
        </div>

        {/* Post copy */}
        {post.hook_pt && (
          <div className="mb-4 p-4 rounded-lg bg-viral-accent/5 border border-viral-accent/30">
            <div className="text-[10px] uppercase tracking-wider text-viral-accent font-semibold mb-1">Hook</div>
            <div className="font-bold text-base mb-3">{post.hook_pt}</div>
            {post.body_pt && (
              <>
                <div className="text-[10px] uppercase tracking-wider text-viral-muted font-semibold mb-1">Body</div>
                <p className="text-sm whitespace-pre-line text-viral-text mb-3">{post.body_pt}</p>
              </>
            )}
            {post.cta_pt && (
              <p className="text-sm font-semibold text-viral-accent2 mb-3">→ {post.cta_pt}</p>
            )}
            {hashtags && (
              <p className="text-xs text-viral-muted break-all mb-3">{hashtags}</p>
            )}
            <button
              type="button"
              onClick={() => onCopy("post", `${post.hook_pt}\n\n${post.body_pt ?? ""}\n\n${post.cta_pt ?? ""}\n\n${hashtags}`)}
              className="text-xs text-viral-accent hover:underline"
            >
              {copied === "post" ? "✓ Copiado" : "📋 Copiar post inteiro"}
            </button>
          </div>
        )}

        {/* Characters */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-viral-muted font-semibold mb-2">Personagens</div>
          {(pkg.characters ?? []).map((c, i) => (
            <div key={c.id ?? i} className="character-card rounded-lg p-3 flex gap-3 items-start">
              <div className="text-2xl flex-shrink-0">{c.emoji ?? "🧩"}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  {c.name_pt}
                  {c.timestamp_start && c.timestamp_end && (
                    <span className="text-[10px] text-viral-muted font-normal">{c.timestamp_start}–{c.timestamp_end}</span>
                  )}
                </div>
                {c.voice_script_pt && (
                  <p className="text-sm text-viral-muted italic">&quot;{c.voice_script_pt}&quot;</p>
                )}
              </div>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                {c.voice_script_pt && <SpeakButton text={c.voice_script_pt} />}
                <button
                  type="button"
                  onClick={() => onCopy(`script-${c.id}`, c.voice_script_pt ?? "")}
                  className="text-[10px] text-viral-accent hover:underline"
                >
                  {copied === `script-${c.id}` ? "✓" : "📋"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Captions timeline */}
        {pkg.captions_full_script && pkg.captions_full_script.length > 0 && (
          <div className="mt-4 pt-4 border-t border-viral-border/50">
            <div className="text-[10px] uppercase tracking-wider text-viral-muted font-semibold mb-2">Timeline de captions</div>
            <ol className="space-y-1.5">
              {pkg.captions_full_script.map((cap, i) => (
                <li key={i} className="flex gap-3 items-start text-xs">
                  <span className="font-mono text-viral-muted/70 w-12 text-right flex-shrink-0">{cap.time ?? "·"}</span>
                  <span
                    className={`flex-1 ${
                      cap.style === "bold" ? "font-semibold" : ""
                    } ${
                      cap.color === "red"
                        ? "text-red-400"
                        : cap.color === "green"
                          ? "text-green-400"
                          : "text-viral-text"
                    }`}
                  >
                    {cap.text_pt ?? cap.text_en ?? ""}
                  </span>
                  {cap.character && (
                    <span className="text-viral-muted/60 text-[10px]">{cap.character}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Variations */}
        {pkg.variations && pkg.variations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-viral-border/50">
            <div className="text-[10px] uppercase tracking-wider text-viral-muted font-semibold mb-2">Variações para A/B testar</div>
            <ul className="space-y-1">
              {pkg.variations.map((v, i) => (
                <li key={v.id ?? i} className="text-sm text-viral-muted">
                  <span className="text-viral-accent2 font-semibold">·</span> {v.title_pt} <span className="text-viral-muted/60 text-xs">({v.angle_pt})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {videoUrl ? (
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={onDuplicate} className="btn-secondary text-xs">↻ Duplicar ideia</button>
          <button type="button" onClick={onChangeTone} className="btn-secondary text-xs">🎭 Variar tom</button>
          <button type="button" onClick={onNew} className="btn-primary text-xs">＋ Novo reel</button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isRendering}
            className="btn-secondary flex-1"
          >
            ✏️ Editar roteiro
          </button>
          <button
            type="button"
            onClick={onRender}
            disabled={busy || isRendering}
            className="btn-primary flex-1"
          >
            {isRendering ? "Renderizando…" : "🎬 Gerar vídeo"}
          </button>
        </div>
      )}
    </div>
  );
}

function RenderingInline(props: {
  jobId: string | null;
  statusResp: StatusResp | null;
}) {
  const { jobId, statusResp } = props;
  const completed = statusResp?.completed_scenes ?? 0;
  const total = statusResp?.scene_count ?? 1;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="card p-6 bg-gradient-to-br from-viral-accent/5 to-viral-accent2/5 border-viral-accent/30">
      <div className="text-center space-y-3 mb-4">
        <div className="text-4xl inline-block animate-spin-slow">⚙️</div>
        <div className="space-y-2 text-sm">
          <p className="render-stage-line render-stage-1">🎬 Gerando vídeo…</p>
          <p className="render-stage-line render-stage-2">🎭 Animando personagens…</p>
          <p className="render-stage-line render-stage-3">🧠 Sincronizando roteiro…</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-viral-muted">
          <span>cenas</span>
          <span>{completed}/{total}</span>
        </div>
        <div className="h-1.5 bg-viral-border/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-viral-accent transition-all duration-500"
            ref={(el) => {
              if (el) el.style.width = `${pct}%`;
            }}
          />
        </div>
      </div>

      {jobId && (
        <div className="text-center text-[10px] text-viral-muted/60 mt-3">
          job <code className="font-mono">{jobId}</code>
        </div>
      )}
    </div>
  );
}

function FinalVideoBlock(props: {
  videoUrl: string;
  jobId: string | null;
  mock: boolean;
  post: PostCopy;
  hashtags: string;
  onCopy: (label: string, text: string) => void;
  copied: string | null;
}) {
  const { videoUrl, jobId, mock, post, hashtags, onCopy, copied } = props;
  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-4">
      <div className="card p-2 mx-auto md:mx-0 w-full max-w-[280px]">
        <video
          controls
          autoPlay
          src={videoUrl}
          className="w-full rounded-lg shadow-lg"
          style={{ aspectRatio: "9/16" }}
        >
          Seu navegador não suporta vídeo.
        </video>
        <div className="mt-2 flex gap-2">
          <a
            href={videoUrl}
            download={`viralobj-${jobId ?? "reel"}.mp4`}
            className="btn-primary text-xs flex-1 text-center"
          >
            ⬇️ Download
          </a>
          <button
            type="button"
            onClick={() => onCopy("video-url", videoUrl)}
            className="btn-secondary text-xs flex-1"
          >
            {copied === "video-url" ? "✓ Copiado" : "📋 URL"}
          </button>
        </div>
        {mock && (
          <p className="text-[10px] text-center text-viral-accent2 mt-2 uppercase tracking-wider">
            mock render
          </p>
        )}
      </div>

      <div className="card p-4 space-y-3 text-sm">
        <div className="eyebrow">Post pronto pro Instagram</div>
        {post.hook_pt && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-viral-muted">Hook</div>
            <p className="font-bold">{post.hook_pt}</p>
          </div>
        )}
        {post.body_pt && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-viral-muted">Body</div>
            <p className="whitespace-pre-line text-viral-muted">{post.body_pt}</p>
          </div>
        )}
        {hashtags && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-viral-muted">Hashtags</div>
            <p className="text-xs text-viral-muted break-all">{hashtags}</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => onCopy("post-final", `${post.hook_pt ?? ""}\n\n${post.body_pt ?? ""}\n\n${post.cta_pt ?? ""}\n\n${hashtags}`)}
          className="btn-secondary text-xs w-full"
        >
          {copied === "post-final" ? "✓ Post copiado" : "📋 Copiar post completo"}
        </button>
      </div>
    </div>
  );
}

function SpeakButton({ text, lang = "pt-BR" }: { text: string; lang?: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  function toggle() {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    // Strip stage markers ([pausa], [ÊNFASE], etc.) so the synth doesn't
    // read "abre colchetes pausa fecha colchetes" out loud.
    const clean = text.replace(/\[[^\]]+\]/g, "").replace(/\s+/g, " ").trim();
    if (!clean) return;
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = lang;
    utter.rate = 1.05;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utter);
  }

  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      title={speaking ? "Parar" : "Ouvir voz (browser TTS)"}
      className="text-[10px] text-viral-accent hover:underline flex-shrink-0"
    >
      {speaking ? "⏹️" : "🔊"}
    </button>
  );
}

function ProgressDots() {
  return (
    <div className="inline-flex gap-1 text-viral-muted">
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot-1" />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot-2" />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot-3" />
    </div>
  );
}
