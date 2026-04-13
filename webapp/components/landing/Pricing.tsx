"use client";

import Link from "next/link";
import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { PRICING_PLANS } from "@/lib/landing-data";

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          eyebrow="PREÇOS"
          title="Planos que crescem com você"
          sub="Comece grátis. Upgrade quando estiver escalando."
        />

        {/* Toggle mensal/anual */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex items-center gap-1 rounded-full border border-viral-border bg-viral-card p-1">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition ${
                !yearly
                  ? "bg-viral-accent text-white"
                  : "text-viral-muted hover:text-viral-text"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition inline-flex items-center gap-2 ${
                yearly
                  ? "bg-viral-accent text-white"
                  : "text-viral-muted hover:text-viral-text"
              }`}
            >
              Anual
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-viral-accent2/20 text-viral-accent2">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRICING_PLANS.map((plan) => {
            const isPopular = plan.popular;
            const price = yearly ? plan.priceYearly : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`card p-6 relative flex flex-col ${
                  isPopular
                    ? "border-viral-accent shadow-[0_0_60px_-20px_rgba(255,51,102,0.6)]"
                    : ""
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-popular">MAIS POPULAR</span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{price}</span>
                  </div>
                  <p className="text-xs text-viral-muted mt-1">{plan.sub}</p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-sm ${
                        f.included ? "text-viral-text" : "text-viral-muted/50 line-through"
                      }`}
                    >
                      <span className={f.included ? "text-viral-accent" : ""}>
                        {f.included ? "✓" : "✕"}
                      </span>
                      <span>{f.label}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={
                    isPopular ? "btn-primary w-full" : "btn-secondary w-full"
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Legenda de garantia */}
        <div className="mt-10 text-center">
          <p className="text-sm text-viral-muted">
            🛡️ Garantia de 7 dias — reembolso 100% se não gostar
          </p>
          <p className="text-xs text-viral-muted mt-2">
            Precisa de mais?{" "}
            <Link
              href="mailto:enterprise@viralobj.com"
              className="text-viral-accent hover:underline"
            >
              Ver plano Enterprise →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
