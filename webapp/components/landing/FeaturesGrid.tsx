import { SectionHeader } from "./SectionHeader";
import { FEATURES } from "@/lib/landing-data";

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          eyebrow="RECURSOS"
          title="Tudo que você precisa pra escalar"
          sub="Pipeline de ponta a ponta construído em cima de 47 vídeos virais reais."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover p-6 relative">
              {f.badge && (
                <span className="badge-soon absolute top-6 right-6">
                  {f.badge}
                </span>
              )}
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2 pr-20">{f.title}</h3>
              <p className="text-sm text-viral-muted leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
