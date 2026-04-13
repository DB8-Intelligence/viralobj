"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "viralobj-consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show banner only if user hasn't made a choice yet
    const choice = localStorage.getItem(CONSENT_KEY);
    if (!choice) {
      // Small delay to not flash on first paint
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleChoice(value: "accepted" | "rejected") {
    localStorage.setItem(CONSENT_KEY, value);
    localStorage.setItem(CONSENT_KEY + "-ts", new Date().toISOString());
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-6 md:bottom-6 md:max-w-md z-50">
      <div className="card p-5 shadow-2xl animate-fade-up">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">🍪</span>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1">Privacidade</p>
            <p className="text-xs text-viral-muted leading-relaxed">
              Usamos cookies essenciais para o funcionamento do site e,
              com seu consentimento, cookies analíticos para melhorar a
              experiência. Veja nossa{" "}
              <Link
                href="/legal/cookies"
                className="text-viral-accent hover:underline"
              >
                Política de Cookies
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleChoice("accepted")}
            className="btn-primary flex-1 text-xs py-2"
          >
            Aceitar todos
          </button>
          <button
            onClick={() => handleChoice("rejected")}
            className="btn-secondary flex-1 text-xs py-2"
          >
            Apenas essenciais
          </button>
        </div>
      </div>
    </div>
  );
}
