'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { IconArrowRight, IconCheck, IconPlay, IconShield, IconClock, IconChat } from './icons';
import { useHeroMotion } from './useHeroMotion';

export function Hero() {
  const { gridRef, registerCopy } = useHeroMotion();

  // Helper para registrar refs dos elementos de copy (reveal stagger)
  const refFor = (el: HTMLElement | null) => registerCopy(el);

  return (
    <section style={{ padding: '80px 0 100px', position: 'relative', overflow: 'hidden' }}>
      <div className="hero-glow noise" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          className="hero-split"
          style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 80, alignItems: 'center' }}
        >
          {/* Left */}
          <div>
            {/* Badge */}
            <div
              ref={refFor}
              className="hero-left-reveal d1"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 16px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                fontSize: 13,
                color: 'var(--muted)',
                marginBottom: 28,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Usado por <strong style={{ color: 'var(--text)', fontWeight: 600 }}>+500 criadores</strong> no Brasil
            </div>

            <h1
              ref={refFor}
              className="hero-left-reveal d2"
              style={{
                fontSize: 'clamp(44px, 6vw, 76px)',
                fontWeight: 900,
                letterSpacing: '-0.035em',
                lineHeight: 1,
                margin: '0 0 24px',
                textWrap: 'balance',
              }}
            >
              Crie personagens 3D que <span className="grad-text">falam, viralizam e vendem.</span>
            </h1>

            <p
              ref={refFor}
              className="hero-left-reveal d3"
              style={{
                fontSize: 19,
                lineHeight: 1.55,
                color: 'var(--muted)',
                margin: '0 0 36px',
                maxWidth: 560,
                textWrap: 'pretty',
              }}
            >
              Objetos do dia-a-dia ganham vida no estilo Pixar. Gere roteiros, vozes e imagens prontas para Instagram — tudo com IA, sem saber nada de 3D.
            </p>

            <div
              ref={refFor}
              className="hero-left-reveal d4"
              style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}
            >
              <Link href="/signup" className="btn-primary">
                Comece grátis
                <IconArrowRight />
              </Link>
              <a href="#how" className="btn-outline">
                <IconPlay />
                Ver demonstração
              </a>
            </div>

            {/* Trust row */}
            <div
              ref={refFor}
              className="hero-left-reveal d5"
              style={{ display: 'flex', gap: 32, flexWrap: 'wrap', fontSize: 13, color: 'var(--muted-2)' }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <IconShield size={14} strokeWidth={2} />
                Sem cartão
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <IconClock size={14} strokeWidth={2} />
                Pronto em 60s
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <IconChat size={14} strokeWidth={2} />
                PT-BR nativo
              </div>
            </div>
          </div>

          {/* Right: character grid */}
          <div className="hero-grid" ref={gridRef}>
            <div className="img-tile tile-big float-1">
              <Image src="/landing/char-pasta.jpg" alt="Macarrão 3D" fill priority sizes="(max-width: 1024px) 50vw, 400px" />
              <div className="img-overlay" />
              <div className="img-label">
                <span className="niche-pill niche-cozinha">Culinária</span>
              </div>
            </div>
            <div className="img-tile tile-tall float-2">
              <Image src="/landing/char-detergente-hulk.jpg" alt="Detergente hulk 3D" fill sizes="200px" />
              <div className="img-overlay" />
            </div>
            <div className="img-tile float-3">
              <Image src="/landing/char-doce-leite-furioso.jpg" alt="Doce de leite 3D" fill sizes="200px" />
              <div className="img-overlay" />
            </div>
            <div className="img-tile float-2">
              <Image src="/landing/char-chave.jpg" alt="Chave dourada 3D" fill sizes="200px" />
              <div className="img-overlay" />
            </div>
            <div className="img-tile float-1">
              <Image src="/landing/char-virus.jpg" alt="Vírus 3D" fill sizes="200px" />
              <div className="img-overlay" />
            </div>
            <div className="img-tile float-3">
              <Image src="/landing/char-brain.jpg" alt="Cérebro 3D" fill sizes="200px" />
              <div className="img-overlay" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
