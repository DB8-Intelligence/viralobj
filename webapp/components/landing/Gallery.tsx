import Image from 'next/image';
import Link from 'next/link';
import { landingCharacters } from '../../data/characters';
import { IconArrowRight } from './icons';

export function Gallery() {
  return (
    <section id="gallery" style={{ padding: '120px 0' }}>
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 40,
            marginBottom: 40,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span className="section-eyebrow">Catálogo</span>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Personagens prontos para viralizar
            </h2>
            <p className="section-sub">
              {landingCharacters.length}+ modelos curados em 12 nichos. Cada um com visual testado em contas de 100K+ seguidores.
            </p>
          </div>
          <Link
            href="/catalog"
            style={{
              fontSize: 14,
              color: 'var(--text)',
              padding: '10px 18px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
            }}
          >
            Explorar catálogo completo
            <IconArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </div>

      {/* Overflow scrollable row, breaks out of container */}
      <div style={{ paddingLeft: 'calc((100vw - 1280px) / 2 + 32px)', paddingRight: 32 }}>
        <div className="gallery-scroll">
          {landingCharacters.map((ch, i) => (
            <div key={ch.name} className="char-card img-tile">
              <Image src={ch.img} alt={ch.name} fill sizes="200px" loading="lazy" />
              <div className="img-overlay" />
              <span className={`niche-pill ${ch.nicheCls} char-badge`}>{ch.niche}</span>
              <div className="char-info">
                <span className="char-name">{ch.name}</span>
                <span className="char-niche mono">
                  character-{String(i + 1).padStart(2, '0')} · 1080×1920
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
