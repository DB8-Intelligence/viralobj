"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="card p-8 text-center space-y-4">
      <div className="text-4xl">⚠️</div>
      <div>
        <h2 className="text-lg font-semibold text-viral-text mb-2">
          Algo deu errado
        </h2>
        <p className="text-sm text-viral-muted mb-1">
          {error.message || "Ocorreu um erro inesperado."}
        </p>
        {error.digest && (
          <p className="text-[10px] text-viral-muted/60 font-mono">
            ref: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-2 justify-center">
        <button onClick={() => reset()} className="btn-primary text-sm">
          Tentar novamente
        </button>
        <Link href="/app" className="btn-secondary text-sm">
          Voltar ao dashboard
        </Link>
      </div>
      <p className="text-[10px] text-viral-muted/60 mt-4">
        💡 Use o botão 🐛 no canto inferior para reportar este erro.
      </p>
    </div>
  );
}
