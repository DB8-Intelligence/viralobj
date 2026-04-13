import Link from "next/link";

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-10">
        <Link
          href="/"
          className="text-sm text-viral-muted hover:text-viral-text mb-4 inline-block"
        >
          ← Voltar para o início
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-sm text-viral-muted">
          Última atualização:{" "}
          {new Date(lastUpdated).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      <article className="legal-content">{children}</article>

      <footer className="mt-16 pt-8 border-t border-viral-border text-xs text-viral-muted">
        <p>
          Dúvidas sobre este documento? Entre em contato:{" "}
          <a
            href="mailto:legal@viralobj.com"
            className="text-viral-accent hover:underline"
          >
            legal@viralobj.com
          </a>
        </p>
      </footer>
    </div>
  );
}
