import { SectionHeader } from "./SectionHeader";
import { FAQ_ITEMS } from "@/lib/landing-data";

export function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <SectionHeader
          eyebrow="PERGUNTAS FREQUENTES"
          title="Dúvidas comuns"
        />

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <details
              key={i}
              className="card group open:border-viral-accent/40 transition"
            >
              <summary className="cursor-pointer list-none p-5 flex items-start justify-between gap-4">
                <span className="font-semibold pr-4">{item.q}</span>
                <span className="text-viral-accent text-2xl leading-none transition-transform group-open:rotate-45 flex-shrink-0">
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm text-viral-muted leading-relaxed border-t border-viral-border/60 pt-4">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
