import Image from 'next/image';
import { IconDoc, IconImage, IconMic, IconGrid, IconCaptions } from './icons';

/** Barras do waveform com cores gradientes (ElevenLabs) */
const waveformBars = [
  { h: 40, c: '#ff3366' },
  { h: 70, c: '#ff3366' },
  { h: 100, c: '#e0448a' },
  { h: 85, c: '#b84dcc' },
  { h: 60, c: '#8b5cf6' },
  { h: 90, c: '#8b5cf6' },
  { h: 50, c: '#628cfb' },
  { h: 75, c: '#00e5ff' },
  { h: 100, c: '#00e5ff' },
  { h: 55, c: '#00e5ff' },
  { h: 80, c: '#6ee7b7' },
  { h: 45, c: '#6ee7b7' },
  { h: 65, c: '#ffa57a' },
  { h: 90, c: '#ffa57a' },
  { h: 50, c: '#ff8aa8' },
];

export function FeaturesBento() {
  return (
    <section
      id="features"
      style={{
        padding: '100px 0',
        background:
          'linear-gradient(180deg, transparent 0%, rgba(255,51,102,0.025) 50%, transparent 100%)',
      }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-eyebrow">Recursos</span>
          <h2 className="section-title" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Tudo que você precisa <br />
            pra um reel que para o feed
          </h2>
        </div>

        <div className="bento">
          {/* Big 1: Roteiro bilíngue */}
          <div className="bento-cell big">
            <div>
              <div
                className="bento-icon"
                style={{
                  background: 'rgba(255,51,102,0.1)',
                  borderColor: 'rgba(255,51,102,0.25)',
                  color: '#ff3366',
                }}
              >
                <IconDoc size={22} />
              </div>
              <h3 className="bento-title" style={{ marginTop: 16 }}>Roteiro bilíngue PT + EN</h3>
              <p className="bento-desc">
                Mesma estrutura viral, duas línguas. Publique no Brasil e escale pro mercado internacional sem reescrever nada.
              </p>
            </div>
            {/* Mini script preview */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <div
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid var(--border)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: 'var(--muted)',
                  lineHeight: 1.55,
                }}
              >
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(255,51,102,0.15)', color: '#ff8aa8', fontSize: 10, fontWeight: 600 }}>
                    PT-BR ●
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: 'var(--muted-2)', fontSize: 10, fontWeight: 500 }}>
                    EN
                  </span>
                </div>
                <span style={{ color: 'var(--accent-2)' }}>[HOOK]</span> Olha o que<br />
                aconteceu com o tomate...<br />
                <span style={{ color: 'var(--accent-2)' }}>[DESENV.]</span> Ele achou que<br />
                era o rei da salada...
              </div>
              <div
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid var(--border)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: 'var(--muted)',
                  lineHeight: 1.55,
                }}
              >
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: 'var(--muted-2)', fontSize: 10, fontWeight: 500 }}>
                    PT-BR
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(0,229,255,0.15)', color: '#7eebff', fontSize: 10, fontWeight: 600 }}>
                    EN ●
                  </span>
                </div>
                <span style={{ color: 'var(--accent)' }}>[HOOK]</span> Wait till you<br />
                see this tomato...<br />
                <span style={{ color: 'var(--accent)' }}>[DEV.]</span> He thought he<br />
                was king of the salad...
              </div>
            </div>
          </div>

          {/* Tall: Imagens 3D */}
          <div className="bento-cell tall">
            <div>
              <div
                className="bento-icon"
                style={{
                  background: 'rgba(139,92,246,0.1)',
                  borderColor: 'rgba(139,92,246,0.25)',
                  color: '#b98dfb',
                }}
              >
                <IconImage size={22} />
              </div>
              <h3 className="bento-title" style={{ marginTop: 16 }}>Imagens 3D estilo Pixar</h3>
              <p className="bento-desc">Geradas via FLUX Pro em 1080×1920.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { src: '/landing/char-pasta.jpg', alt: 'Pasta' },
                { src: '/landing/char-detergente-hulk.jpg', alt: 'Detergente' },
                { src: '/landing/char-doce-leite-furioso.jpg', alt: 'Doce de leite' },
                { src: '/landing/char-brain.jpg', alt: 'Cérebro' },
              ].map((img) => (
                <div key={img.src} className="img-tile" style={{ aspectRatio: 1 }}>
                  <Image src={img.src} alt={img.alt} fill sizes="140px" loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          {/* Small 1: Voz */}
          <div className="bento-cell">
            <div>
              <div
                className="bento-icon"
                style={{
                  background: 'rgba(0,229,255,0.1)',
                  borderColor: 'rgba(0,229,255,0.25)',
                  color: '#7eebff',
                }}
              >
                <IconMic size={22} />
              </div>
              <h3 className="bento-title" style={{ marginTop: 16 }}>Voz com emoção</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28, marginTop: 8 }}>
              {waveformBars.map((bar, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: 3,
                    height: `${bar.h}%`,
                    background: bar.c,
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
            <p className="bento-desc" style={{ marginTop: 8, fontSize: 12 }}>
              ElevenLabs · 32 vozes PT-BR
            </p>
          </div>

          {/* Small 2: Nichos */}
          <div className="bento-cell">
            <div>
              <div
                className="bento-icon"
                style={{
                  background: 'rgba(251,146,60,0.1)',
                  borderColor: 'rgba(251,146,60,0.25)',
                  color: '#fbb878',
                }}
              >
                <IconGrid size={22} />
              </div>
              <h3 className="bento-title" style={{ marginTop: 16 }}>12 nichos, 100+ objetos</h3>
            </div>
            <p className="bento-desc" style={{ marginTop: 8 }}>
              Catálogo curado e continuamente expandido pela equipe.
            </p>
          </div>

          {/* Small 3: Legendas */}
          <div className="bento-cell">
            <div>
              <div
                className="bento-icon"
                style={{
                  background: 'rgba(52,211,153,0.1)',
                  borderColor: 'rgba(52,211,153,0.25)',
                  color: '#6ee7b7',
                }}
              >
                <IconCaptions size={22} />
              </div>
              <h3 className="bento-title" style={{ marginTop: 16 }}>Legendas timestamped</h3>
            </div>
            <p className="bento-desc" style={{ marginTop: 8 }}>
              Sincronizadas palavra-a-palavra com a narração.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
