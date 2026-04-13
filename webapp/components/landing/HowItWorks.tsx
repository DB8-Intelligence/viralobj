import { SectionHeader } from "./SectionHeader";
import { STEPS } from "@/lib/landing-data";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          eyebrow="COMO FUNCIONA"
          title="3 passos. Sem fricção."
          sub="Do input ao reel pronto pra postar."
        />

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Dashed connector line (desktop) */}
          <div
            className="hidden md:block absolute top-16 left-0 right-0 h-px border-t-2 border-dashed border-viral-border z-0"
            style={{ left: "16.66%", right: "16.66%" }}
          />

          {STEPS.map((step) => (
            <div
              key={step.number}
              className="card card-hover p-8 relative z-10"
            >
              <div className="text-5xl font-bold text-gradient mb-4">
                {step.number}
              </div>
              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-viral-muted leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
