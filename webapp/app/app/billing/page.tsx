import Link from "next/link";
import { getSessionContext } from "@/lib/auth-helpers";
import { PLAN_LABELS } from "@/lib/supabase/types";
import { PRICING_PLANS } from "@/lib/landing-data";

export const metadata = {
  title: "Assinatura — ViralObj",
};

export default async function BillingPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;

  const currentPlan = ctx.tenant.plan;
  const isTrial = currentPlan === "trial";
  const trialEndsAt = ctx.tenant.trial_ends_at
    ? new Date(ctx.tenant.trial_ends_at)
    : null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(
        0,
        Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000)
      )
    : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-1">Assinatura</h1>
        <p className="text-viral-muted">
          Gerencie seu plano, veja uso e faça upgrade.
        </p>
      </header>

      {/* Current plan card */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="eyebrow mb-2">Plano atual</div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              {PLAN_LABELS[currentPlan]}
              {isTrial && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-viral-accent2/10 text-viral-accent2 font-semibold uppercase">
                  Trial
                </span>
              )}
            </h2>
          </div>
          {isTrial && trialEndsAt && (
            <div className="text-right">
              <div className="text-xs text-viral-muted mb-1">Trial termina em</div>
              <div
                className={`text-2xl font-bold ${
                  trialDaysLeft <= 3 ? "text-red-400" : "text-viral-text"
                }`}
              >
                {trialDaysLeft} dia{trialDaysLeft === 1 ? "" : "s"}
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <UsageMiniCard
            label="Pacotes"
            used={ctx.limits.packages.used}
            max={ctx.limits.packages.max}
          />
          <UsageMiniCard
            label="Vídeos"
            used={ctx.limits.videos.used}
            max={ctx.limits.videos.max}
          />
          <UsageMiniCard
            label="Posts agendados"
            used={ctx.limits.posts.used}
            max={ctx.limits.posts.max}
          />
        </div>

        <div className="text-xs text-viral-muted">
          Uso resetado no primeiro dia de cada mês.
        </div>
      </div>

      {/* Upgrade CTA section */}
      <div className="card p-6 bg-gradient-to-br from-viral-accent/10 via-transparent to-viral-accent2/5 border-viral-accent/40">
        <div className="eyebrow text-viral-accent mb-2">Próximo passo</div>
        <h2 className="text-2xl font-bold mb-3">
          {isTrial
            ? "Escolha um plano para continuar após o trial"
            : "Quer mais? Faça upgrade"}
        </h2>
        <p className="text-sm text-viral-muted mb-6 max-w-xl">
          {isTrial
            ? `Você ainda tem ${trialDaysLeft} dia${trialDaysLeft === 1 ? "" : "s"} de trial. Escolha um plano agora para não perder acesso quando terminar.`
            : "Escale sua produção de conteúdo com planos superiores. Mais pacotes, mais vídeos e mais automação."}
        </p>
        <Link href="/pricing" className="btn-primary">
          Ver todos os planos →
        </Link>
        <p className="text-xs text-viral-muted mt-4">
          🛡️ Garantia de 7 dias · 💳 Checkout em breve
        </p>
      </div>

      {/* Quick comparison */}
      <div className="card p-6">
        <h3 className="eyebrow mb-4">Comparação rápida</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {PRICING_PLANS.filter((p) => p.id !== "trial").map((plan) => {
            const isCurrent = plan.id === currentPlan;
            return (
              <div
                key={plan.id}
                className={`rounded-lg border p-4 ${
                  isCurrent
                    ? "border-viral-accent bg-viral-accent/5"
                    : "border-viral-border"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold">{plan.name}</div>
                  <div className="text-sm font-bold">{plan.priceMonthly}</div>
                </div>
                {isCurrent ? (
                  <div className="text-xs text-viral-accent font-semibold">
                    ✓ Seu plano atual
                  </div>
                ) : (
                  <Link
                    href={`/pricing#${plan.id}`}
                    className="text-xs text-viral-accent hover:underline"
                  >
                    Ver detalhes →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact for enterprise */}
      <div className="card p-5 text-center">
        <p className="text-sm text-viral-muted">
          Precisa de mais volume ou recursos customizados?{" "}
          <a
            href="mailto:enterprise@viralobj.com"
            className="text-viral-accent hover:underline"
          >
            Fale com o time Enterprise →
          </a>
        </p>
      </div>
    </div>
  );
}

function UsageMiniCard({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number;
}) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((used / max) * 100));
  const displayMax = max >= 999999 ? "∞" : max;

  return (
    <div className="rounded-lg border border-viral-border p-4">
      <div className="text-xs uppercase tracking-wider text-viral-muted mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold">{used}</span>
        <span className="text-sm text-viral-muted">/ {displayMax}</span>
      </div>
      <div className="h-1.5 rounded-full bg-viral-border/40 overflow-hidden">
        <div
          className={`h-full transition-all ${
            pct >= 90
              ? "bg-red-500"
              : pct >= 70
                ? "bg-yellow-500"
                : "bg-viral-accent"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
