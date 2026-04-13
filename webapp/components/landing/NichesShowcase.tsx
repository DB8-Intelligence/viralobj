import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { NICHES_SHOWCASE, TONE_BADGE } from "@/lib/landing-data";

export function NichesShowcase() {
  return (
    <section id="niches" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          eyebrow="17 NICHOS PRONTOS"
          title="Criamos conteúdo para o seu público"
          sub="Cada nicho com objetos validados, formato padrão e tom recomendado."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {NICHES_SHOWCASE.map((n) => (
            <div key={n.name} className="card card-hover p-5">
              <div className="text-4xl mb-3">{n.emoji}</div>
              <div className="font-semibold mb-2">{n.name}</div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    TONE_BADGE[n.tone] ?? "bg-viral-border/30 text-viral-muted"
                  }`}
                >
                  {n.tone}
                </span>
                <span className="text-xs text-viral-muted">
                  {n.objects} objetos
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/niches" className="btn-secondary">
            Ver catálogo completo →
          </Link>
        </div>
      </div>
    </section>
  );
}
