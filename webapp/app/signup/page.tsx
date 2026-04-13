"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signupAction } from "../login/actions";
import { PRICING_PLANS } from "@/lib/landing-data";

function SignupForm() {
  const params = useSearchParams();
  const planIntent = params.get("plan"); // 'starter' | 'pro' | 'pro_plus' | null

  const planInfo = planIntent
    ? PRICING_PLANS.find((p) => p.id === planIntent)
    : null;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    // Attach plan intent so the server action can save it on user metadata
    if (planIntent) formData.set("plan_intent", planIntent);
    const result = await signupAction(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">Criar conta</h1>
      <p className="text-viral-muted text-sm mb-8">
        {planInfo
          ? `Você selecionou o plano ${planInfo.name}. Começa com 14 dias de trial grátis.`
          : "Grátis. 5 gerações no trial de 14 dias."}
      </p>

      {planInfo && (
        <div className="mb-6 card p-4 border-viral-accent/40">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-viral-muted">
                Plano escolhido
              </div>
              <div className="font-semibold">{planInfo.name}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{planInfo.priceMonthly}</div>
              <div className="text-xs text-viral-muted">{planInfo.sub}</div>
            </div>
          </div>
          <p className="text-xs text-viral-muted mt-3">
            ℹ️ Você começa no trial grátis. O checkout será ativado em breve.
          </p>
        </div>
      )}

      <form action={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Nome completo</label>
          <input
            type="text"
            name="full_name"
            required
            className="input"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            required
            className="input"
            placeholder="voce@email.com"
          />
        </div>
        <div>
          <label className="label">Senha</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="input"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Criando…" : "Criar conta grátis →"}
        </button>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}
        {success && (
          <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            {success}
          </div>
        )}

        <p className="text-[10px] text-viral-muted text-center pt-2">
          Ao criar sua conta, você concorda com nossos{" "}
          <Link
            href="/legal/termos"
            className="text-viral-accent hover:underline"
          >
            Termos
          </Link>{" "}
          e{" "}
          <Link
            href="/legal/privacidade"
            className="text-viral-accent hover:underline"
          >
            Política de Privacidade
          </Link>
          .
        </p>
      </form>

      <p className="text-center text-sm text-viral-muted mt-6">
        Já tem conta?{" "}
        <Link href="/login" className="text-viral-accent hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-6 py-20 text-viral-muted">
          Carregando…
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
