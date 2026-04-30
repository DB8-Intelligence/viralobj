"use client";

import { useState } from "react";

/**
 * Sprint 21 — calls /api/app/billing/checkout, then redirects to the
 * returned Stripe-hosted URL. Handles the three known failure modes
 * (bridge missing config, Stripe missing key, Stripe API error) with a
 * friendly message instead of a blank screen.
 */
export function BuyCreditButton({
  product = "prod_1_scene",
  label = "Comprar 1 cena (US$ 9)",
}: {
  product?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/app/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = (data as { code?: string }).code;
        if (code === "STRIPE_NOT_CONFIGURED" || code === "STRIPE_PRICE_NOT_CONFIGURED") {
          setError(
            "Pagamento ainda não está habilitado. O time está finalizando a integração — fala com a gente.",
          );
        } else {
          setError(
            (data as { error?: string }).error ?? "Não foi possível iniciar o checkout.",
          );
        }
        setLoading(false);
        return;
      }
      const url = (data as { checkout_url?: string }).checkout_url;
      if (url) {
        window.location.href = url;
      } else {
        setError("Bridge não retornou checkout_url.");
        setLoading(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn-primary w-full md:w-auto"
      >
        {loading ? "Redirecionando…" : label}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <p className="text-xs text-viral-muted">
        Pagamento seguro via Stripe. Cobrança única — não é assinatura.
      </p>
    </div>
  );
}
