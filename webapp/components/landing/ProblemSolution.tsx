import { SectionHeader } from "./SectionHeader";
import { PROBLEM_ITEMS, SOLUTION_ITEMS } from "@/lib/landing-data";

export function ProblemSolution() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          eyebrow="POR QUE VIRALOBJ"
          title="Produzir reel dá trabalho demais"
          sub="Antes do ViralObj, você gastava horas no que devia levar minutos."
        />

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-4 items-center">
          {/* ANTES */}
          <div className="card p-8 border-red-500/30">
            <div className="eyebrow text-red-400 mb-4">Antes</div>
            <h3 className="text-2xl font-bold mb-6">Do jeito antigo</h3>
            <ul className="space-y-3">
              {PROBLEM_ITEMS.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-viral-muted"
                >
                  <span className="text-red-400 mt-0.5">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <div className="text-6xl text-gradient font-bold">→</div>
          </div>

          {/* AGORA */}
          <div className="card p-8 border-viral-accent/60 shadow-[0_0_60px_-20px_rgba(255,51,102,0.4)]">
            <div className="eyebrow text-viral-accent mb-4">Agora</div>
            <h3 className="text-2xl font-bold mb-6">Com ViralObj</h3>
            <ul className="space-y-3">
              {SOLUTION_ITEMS.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-viral-accent mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
