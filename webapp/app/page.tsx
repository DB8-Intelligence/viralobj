import type { Metadata } from 'next';
import {
  Nav,
  Hero,
  Marquee,
  ProblemSolution,
  HowItWorks,
  Gallery,
  FeaturesBento,
  Metrics,
  Pricing,
  FAQ,
  FinalCTA,
  Footer,
} from '@/components/landing';
import './landing.css';

export const metadata: Metadata = {
  title: 'ViralObj — Personagens 3D que falam, viralizam e vendem',
  description:
    'Crie reels virais com personagens 3D no estilo Pixar. Roteiros bilíngues, vozes com emoção (ElevenLabs), imagens em 1080×1920. Comece grátis, sem cartão.',
  openGraph: {
    title: 'ViralObj — Personagens 3D que falam, viralizam e vendem',
    description:
      'Objetos do dia-a-dia ganham vida no estilo Pixar. Gere roteiros, vozes e imagens prontas para Instagram em menos de 2 minutos.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'ViralObj',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ViralObj — Personagens 3D que falam, viralizam e vendem',
    description: 'Reels virais com personagens 3D no estilo Pixar. Grátis para testar.',
  },
};

export default function HomePage() {
  return (
    <div className="landing">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <ProblemSolution />
        <HowItWorks />
        <Gallery />
        <FeaturesBento />
        <Metrics />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
