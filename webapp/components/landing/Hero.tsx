import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-28">
      {/* Ambient glow orbs */}
      <div className="glow-orb bg-viral-accent/30 w-[500px] h-[500px] -top-20 -left-20" />
      <div className="glow-orb bg-viral-accent2/20 w-[400px] h-[400px] top-40 right-0" />
      <div className="glow-orb bg-purple-500/20 w-[350px] h-[350px] bottom-0 left-1/3" />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-8 items-center">
          {/* Texto */}
          <div className="animate-fade-up">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-viral-border bg-viral-card/60 backdrop-blur-sm px-4 py-1.5 mb-6">
              <span className="size-1.5 rounded-full bg-viral-accent animate-pulse-dot" />
              <span className="eyebrow">
                ✨ 47 vídeos virais analisados · 23 formatos
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Objetos que
              <br />
              <span className="text-gradient">viralizam sozinhos</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg md:text-xl text-viral-muted max-w-xl leading-relaxed">
              Crie reels curtos com objetos animados que falam em primeira
              pessoa. Pacote completo em{" "}
              <strong className="text-viral-text">30 segundos</strong>:
              roteiro, prompts visuais, legendas e hashtags. Sem editar, sem
              gravar, sem contratar designer.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/signup" className="btn-primary-lg">
                Criar conta grátis →
              </Link>
              <Link href="#how-it-works" className="btn-secondary-lg">
                Ver como funciona
              </Link>
            </div>

            {/* Trust line */}
            <p className="mt-6 text-sm text-viral-muted">
              ✓ Grátis por 14 dias · ✓ Sem cartão · ✓ Cancele quando quiser
            </p>
          </div>

          {/* Visual (mockup) */}
          <div className="relative animate-fade-up [animation-delay:200ms] hidden lg:block">
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto max-w-sm">
      {/* Phone frame rotated */}
      <div className="relative rounded-[3rem] border-[14px] border-viral-elevated bg-black shadow-2xl rotate-[-5deg] aspect-[9/19.5] overflow-hidden">
        {/* Screen content — reel frame */}
        <div className="absolute inset-0 bg-gradient-to-br from-viral-accent/20 via-viral-bg to-viral-accent2/20 flex items-end justify-center p-6">
          {/* Character placeholder — abstract trash can shape */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-52">
            <div className="absolute inset-x-4 top-0 h-6 rounded-t-xl bg-gray-600 border-b-2 border-gray-700" />
            <div className="absolute inset-x-0 top-6 bottom-6 rounded-xl bg-gradient-to-b from-gray-500 to-gray-700 border border-gray-800">
              {/* Face */}
              <div className="absolute top-1/3 left-0 right-0 flex justify-center gap-4">
                <div className="w-3 h-3 rounded-full bg-white" />
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-8 h-3 rounded-b-full bg-black" />
            </div>
            {/* Wheels */}
            <div className="absolute -bottom-1 left-3 w-4 h-4 rounded-full bg-black" />
            <div className="absolute -bottom-1 right-3 w-4 h-4 rounded-full bg-black" />
          </div>

          {/* Caption */}
          <div className="relative z-10 w-full text-center font-black text-white text-2xl tracking-tight drop-shadow-[2px_2px_0_#000] uppercase">
            EU Sou a lixeira!
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className="absolute -top-4 -left-8 animate-float">
        <FloatingCard icon="👁" label="2.3M views" />
      </div>
      <div className="absolute top-1/3 -right-12 animate-float [animation-delay:1s]">
        <FloatingCard icon="📈" label="+127% engajamento" />
      </div>
      <div className="absolute -bottom-4 left-8 animate-float [animation-delay:2s]">
        <FloatingCard icon="⚡" label="Gerado em 28s" />
      </div>
    </div>
  );
}

function FloatingCard({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="card px-3 py-2 flex items-center gap-2 shadow-xl">
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
    </div>
  );
}
