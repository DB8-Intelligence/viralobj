import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative card p-12 md:p-20 text-center overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-viral-accent/15 via-purple-500/10 to-viral-accent2/15 pointer-events-none" />

          {/* Ambient orbs */}
          <div className="glow-orb bg-viral-accent/30 w-96 h-96 -top-40 left-1/4" />
          <div className="glow-orb bg-viral-accent2/25 w-80 h-80 -bottom-40 right-1/4" />

          <div className="relative">
            <div className="eyebrow mb-4">PRONTO?</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="text-gradient">Comece a viralizar hoje.</span>
            </h2>
            <p className="text-lg md:text-xl text-viral-muted max-w-xl mx-auto mb-10">
              14 dias grátis. Sem cartão. 5 pacotes prontos pra testar o
              potencial viral do seu nicho.
            </p>
            <Link href="/signup" className="btn-primary-lg">
              Criar minha conta grátis →
            </Link>
            <p className="mt-6 text-sm text-viral-muted">
              ✓ Grátis por 14 dias · ✓ Sem cartão · ✓ Cancele quando quiser
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
