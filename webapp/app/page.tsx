import Link from "next/link";

const FEATURES = [
  {
    title: "23 Formatos Catalogados",
    body: "De MULTI-STUB a PLANT-HUMANOID — cada formato com corpo, câmera, tom e pipeline validados em vídeos virais reais.",
  },
  {
    title: "17 Nichos + 100+ Objetos",
    body: "Casa, plantas, saúde, culinária, espiritualidade, skincare, saúde feminina — bibliotecas prontas de objetos com personalidade e prompts AI.",
  },
  {
    title: "Pipeline Multi-Provider",
    body: "Anthropic Claude 4.6, OpenAI GPT-4.1 e Google Gemini com fallback automático. Veo 2 para movimento orgânico, FLUX Pro para estilo Pixar.",
  },
  {
    title: "10 Estilos de Legenda",
    body: "alpha, beta, gamma, karaoke, highlight-keyword-color, headline-topo-bold — cada um mapeado ao formato que melhor converte.",
  },
];

const PIPELINE = [
  { step: "1. Analyze", text: "Extrai frames e detecta personagens via Claude Vision" },
  { step: "2. Generate", text: "Pacote bilíngue PT+EN com roteiro, prompts AI e hashtags" },
  { step: "3. Video", text: "FLUX Pro → MiniMax TTS → VEED Fabric → ffmpeg concat" },
  { step: "4. Post", text: "Publicação automática via Instagram Graph API v21.0" },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="py-20 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-viral-border bg-viral-card/60 px-4 py-1.5 text-xs text-viral-muted mb-6">
          <span className="size-1.5 rounded-full bg-viral-accent animate-pulse" />
          ViralObj v2.0 · 47 vídeos analisados
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          Objetos que
          <br />
          <span className="bg-gradient-to-r from-viral-accent via-pink-400 to-viral-accent2 bg-clip-text text-transparent">
            viralizam sozinhos
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-viral-muted max-w-2xl mx-auto">
          Gerador de reels virais com objetos 3D animados estilo Pixar/Disney. Pipeline
          completo de <strong className="text-viral-text">análise → geração → vídeo → publicação</strong>.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/signup" className="btn-primary">
            Começar grátis →
          </Link>
          <Link href="/niches" className="btn-secondary">
            Explorar nichos
          </Link>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16">
        <div className="grid md:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <h3 className="font-semibold text-viral-text mb-2">{f.title}</h3>
              <p className="text-sm text-viral-muted leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="py-16">
        <h2 className="text-3xl font-bold mb-2">Pipeline completo</h2>
        <p className="text-viral-muted mb-8">
          Da URL do reel de inspiração até a publicação no Instagram.
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          {PIPELINE.map((p) => (
            <div key={p.step} className="card p-5">
              <div className="text-viral-accent text-sm font-semibold mb-2">
                {p.step}
              </div>
              <div className="text-sm text-viral-text/90 leading-relaxed">
                {p.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="card p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para viralizar?
          </h2>
          <p className="text-viral-muted mb-8 max-w-xl mx-auto">
            Escolha um nicho, lista de objetos e o tópico. A IA cuida do resto —
            roteiro, prompts visuais, legendas e hashtags.
          </p>
          <Link href="/signup" className="btn-primary">
            Criar conta grátis →
          </Link>
        </div>
      </section>
    </div>
  );
}
