"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";

export default function LoginPage() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.append("next", next);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">Entrar</h1>
      <p className="text-viral-muted text-sm mb-8">
        Acesse sua conta ViralObj.
      </p>

      <form action={handleSubmit} className="card p-6 space-y-4">
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
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Entrando…" : "Entrar →"}
        </button>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}
      </form>

      <p className="text-center text-sm text-viral-muted mt-6">
        Não tem conta?{" "}
        <Link href="/signup" className="text-viral-accent hover:underline">
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}
