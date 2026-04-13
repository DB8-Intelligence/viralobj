import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";

export const metadata: Metadata = {
  title: "ViralObj — Talking Object Reel Generator",
  description:
    "Gerador de reels virais com objetos 3D animados estilo Pixar. 23 formatos, 17 nichos, pipeline completo FLUX.2 + Veo.",
  metadataBase: new URL("https://viralobj.com"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-viral-border/60 backdrop-blur sticky top-0 z-20 bg-viral-bg/80">
            <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                <span className="text-viral-accent">●</span>
                <span>ViralObj</span>
              </Link>
              <div className="flex items-center gap-6 text-sm">
                <Link href="/#how-it-works" className="hidden md:inline text-viral-muted hover:text-viral-text">
                  Como funciona
                </Link>
                <Link href="/#pricing" className="hidden md:inline text-viral-muted hover:text-viral-text">
                  Preços
                </Link>
                <Link href="/#niches" className="hidden md:inline text-viral-muted hover:text-viral-text">
                  Nichos
                </Link>
                <Link href="/#faq" className="hidden md:inline text-viral-muted hover:text-viral-text">
                  FAQ
                </Link>
                {user ? (
                  <Link href="/app" className="btn-primary text-xs py-2 px-4">
                    Meu painel
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="text-viral-muted hover:text-viral-text">
                      Entrar
                    </Link>
                    <Link href="/signup" className="btn-primary text-xs py-2 px-4">
                      Criar conta grátis
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </header>

          <main className="flex-1">{children}</main>

          <Footer />
        </div>
        <CookieConsent />
      </body>
    </html>
  );
}
