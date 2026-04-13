import { STATS } from "@/lib/landing-data";

export function Stats() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="card p-10 md:p-14 text-center relative overflow-hidden">
          {/* Ambient */}
          <div className="glow-orb bg-viral-accent/20 w-80 h-80 -top-20 -left-20" />
          <div className="glow-orb bg-viral-accent2/15 w-72 h-72 -bottom-20 -right-20" />

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-5xl md:text-6xl font-bold text-gradient mb-2">
                  {s.value}
                </div>
                <div className="eyebrow text-viral-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <p className="relative mt-10 text-sm text-viral-muted max-w-2xl mx-auto">
            Dataset proprietário construído analisando reels reais das maiores
            contas brasileiras de conteúdo com objetos animados.
          </p>
        </div>
      </div>
    </section>
  );
}
