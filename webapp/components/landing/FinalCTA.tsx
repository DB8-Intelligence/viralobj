import Image from 'next/image';
import Link from 'next/link';
import { IconArrowRight } from './icons';

/** Personagens flutuantes ao redor do CTA */
const floatingChars = [
  { src: '/landing/char-pasta.jpg',             style: { top: '8%',  left:  '6%' }, cls: 'float-1' },
  { src: '/landing/char-detergente-hulk.jpg',   style: { top: '20%', right: '8%',  width: 100 }, cls: 'float-2' },
  { src: '/landing/char-chave.jpg',             style: { bottom: '12%', left:  '10%', width: 110 }, cls: 'float-3' },
  { src: '/landing/char-doce-leite-furioso.jpg',style: { bottom: '8%',  right: '10%' }, cls: 'float-2' },
];

export function FinalCTA() {
  return (
    <section id="cta" style={{ padding: '80px 0 120px' }}>
      <div className="container">
        <div className="final-cta noise">
          {/* Floating characters */}
          {floatingChars.map((ch, i) => (
            <div
              key={i}
              className={`img-tile cta-float ${ch.cls}`}
              style={ch.style}
              aria-hidden="true"
            >
              <Image src={ch.src} alt="" fill sizes="120px" loading="lazy" />
            </div>
          ))}

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 900,
                letterSpacing: '-0.035em',
                lineHeight: 1.05,
                margin: '0 0 20px',
              }}
            >
              Seus objetos estão esperando <span className="grad-text">para falar.</span>
            </h2>
            <p
              style={{
                fontSize: 18,
                color: 'var(--muted)',
                lineHeight: 1.55,
                margin: '0 0 36px',
                textWrap: 'pretty',
              }}
            >
              Crie seu primeiro vídeo viral em menos de 2 minutos. Grátis, sem cartão de crédito.
            </p>
            <Link
              href="/signup"
              className="btn-primary btn-glow"
              style={{ padding: '18px 32px', fontSize: 16 }}
            >
              Criar conta grátis
              <IconArrowRight size={18} />
            </Link>
            <div style={{ marginTop: 20, fontSize: 13, color: 'var(--muted-2)' }}>
              5 gerações grátis · Cancele quando quiser · Suporte em português
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
