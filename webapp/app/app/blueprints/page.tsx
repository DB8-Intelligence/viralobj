"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { NICHES } from "@/lib/niches-data";
import {
  VIRALOBJ_BLUEPRINTS,
  listBlueprintNiches,
  type Blueprint,
} from "@/lib/viralobj-blueprints";

/**
 * Galeria de Blueprints (Sprint 40).
 *
 * Cards de objetos falantes prontos pra remix. Clicar "Remixar" leva a
 * /app/generate?blueprint=<id> com niche/objects/topic/tone/duration
 * preenchidos. A página em si é estática — toda a lógica vive em
 * `lib/viralobj-blueprints.ts` e no useEffect de remix do generate page.
 */
export default function BlueprintsPage() {
  const [query, setQuery] = useState("");
  const [activeNiche, setActiveNiche] = useState<string>("all");

  const niches = useMemo(() => {
    const used = new Set(listBlueprintNiches());
    return NICHES.filter((n) => used.has(n.id));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VIRALOBJ_BLUEPRINTS.filter((b) => {
      if (activeNiche !== "all" && b.niche !== activeNiche) return false;
      if (!q) return true;
      const haystack = `${b.title} ${b.topic} ${b.description} ${b.tags.join(" ")} ${b.objects.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, activeNiche]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Blueprints de Objetos Falantes</h1>
        <p className="text-viral-muted mt-1">
          Escolha um modelo viral e remixe em segundos. Cada blueprint preenche
          o wizard com nicho, objetos, tema e tom — você só ajusta o que quiser.
        </p>
      </header>

      <div className="card p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por tema, objeto ou tag..."
          className="input flex-1"
          aria-label="Buscar blueprint"
        />
        <div className="flex gap-2 flex-wrap">
          <FilterChip
            label="Todos"
            active={activeNiche === "all"}
            onClick={() => setActiveNiche("all")}
          />
          {niches.map((n) => (
            <FilterChip
              key={n.id}
              label={n.label}
              active={activeNiche === n.id}
              onClick={() => setActiveNiche(n.id)}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-viral-muted">
          Nenhum blueprint bate com esse filtro. Tenta limpar a busca ou trocar o nicho.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <BlueprintCard key={b.id} blueprint={b} />
          ))}
        </div>
      )}

      <div className="card p-4 text-xs text-viral-muted">
        💡 <strong className="text-viral-text">Em breve:</strong> seus reels que
        performarem bem poderão virar blueprints públicos pra outros usuários
        remixarem (opcional, configurável por geração).
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
        active
          ? "bg-viral-accent text-white"
          : "border border-viral-border text-viral-muted hover:border-viral-accent/60 hover:text-viral-text"
      }`}
    >
      {label}
    </button>
  );
}

function BlueprintCard({ blueprint: b }: { blueprint: Blueprint }) {
  const nicheLabel = NICHES.find((n) => n.id === b.niche)?.label ?? b.niche;
  return (
    <article className="character-card rounded-xl p-5 flex flex-col gap-3">
      <div className="aspect-video rounded-lg flex items-center justify-center text-6xl bg-gradient-to-br from-viral-accent/15 via-viral-accent2/10 to-viral-bg">
        {b.emoji}
      </div>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{b.title}</h3>
        <span className="text-[10px] uppercase tracking-wider text-viral-accent font-bold whitespace-nowrap">
          {b.metric}
        </span>
      </div>
      <p className="text-sm text-viral-muted leading-relaxed">{b.description}</p>
      <div className="flex flex-wrap gap-1.5 text-[10px]">
        <span className="px-2 py-0.5 rounded-full bg-viral-border/30 text-viral-muted">
          {nicheLabel}
        </span>
        {b.objects.slice(0, 3).map((o) => (
          <span key={o} className="px-2 py-0.5 rounded-full bg-viral-border/30 text-viral-muted">
            {o}
          </span>
        ))}
        {b.tags.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full text-viral-accent/80 border border-viral-accent/30">
            #{t}
          </span>
        ))}
      </div>
      <Link
        href={`/app/generate?blueprint=${encodeURIComponent(b.id)}`}
        className="btn-primary !py-2 !text-sm mt-auto"
      >
        🎬 Remixar
      </Link>
    </article>
  );
}
