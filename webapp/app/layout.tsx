import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ViralObj — Talking Object Reel Generator",
  description:
    "Gerador de reels virais com objetos 3D animados estilo Pixar. 23 formatos, 17 nichos, pipeline completo FLUX.2 + Veo.",
  metadataBase: new URL("https://viralobj.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
                <Link href="/niches" className="text-viral-muted hover:text-viral-text">
                  Nichos
                </Link>
                <Link href="/generate" className="btn-primary text-xs py-2 px-4">
                  Gerar Reel
                </Link>
              </div>
            </nav>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-viral-border/60 py-8 mt-16">
            <div className="max-w-6xl mx-auto px-6 text-xs text-viral-muted flex items-center justify-between">
              <span>
                ViralObj · <a href="https://viralobj.com" className="hover:text-viral-text">viralobj.com</a> · DB8 Intelligence
              </span>
              <span>23 formatos · 17 nichos · 47 vídeos analisados</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
