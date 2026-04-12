"use client";

import { useState } from "react";
import Link from "next/link";
import { signupAction } from "../login/actions";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
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
        Grátis. 5 gerações no trial de 14 dias.
      </p>

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
          {loading ? "Criando…" : "Criar conta →"}
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
