import Image from 'next/image';
import { IconGrid, IconSparkles, IconDownload } from './icons';

export function HowItWorks() {
  return (
    <section
      id="how"
      style={{
        padding: '100px 0',
        background:
          'linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.03) 50%, transparent 100%)',
      }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span className="section-eyebrow">Como funciona</span>
          <h2 className="section-title" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Três passos. Zero fricção.
          </h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            Escolha, gere e publique. A IA cuida de tudo no meio.
          </p>
        </div>

        <div
          className="steps-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            position: 'relative',
          }}
        >
          {/* Connector line */}
          <div
            className="steps-connector"
            style={{
              position: 'absolute',
              top: 80,
              left: '12%',
              right: '12%',
              height: 1,
              background:
                'linear-gradient(90deg, transparent 0%, #ff3366 20%, #8b5cf6 50%, #00e5ff 80%, transparent 100%)',
              opacity: 0.4,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'repeating-linear-gradient(90deg, currentColor 0 6px, transparent 6px 14px)',
                color: 'transparent',
              }}
            />
          </div>

          {/* Step 1 */}
          <div className="step-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <span className="step-num grad-text">01</span>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(255,51,102,0.1)',
                  border: '1px solid rgba(255,51,102,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ff3366',
                }}
              >
                <IconGrid size={20} />
              </div>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>Escolha nicho e personagem</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.55, margin: '0 0 20px' }}>
              Selecione entre 12 nichos e 100+ objetos catalogados. Pré-visualize tons e estilo antes de gerar.
            </p>
            <div className="ph ph-tint-pink" style={{ aspectRatio: '16/10', padding: 12 }}>
              <span className="ph-label">ui / character-picker-grid</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="step-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <span className="step-num grad-text">02</span>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b98dfb',
                }}
              >
                <IconSparkles size={20} />
              </div>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>A IA gera tudo automaticamente</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.55, margin: '0 0 20px' }}>
              LLM escreve, FLUX Pro cria imagens 3D, ElevenLabs narra. Tudo conectado num pipeline só.
            </p>
            <div className="ph ph-tint-purple" style={{ aspectRatio: '16/10', padding: 12 }}>
              <span className="ph-label">ui / generating-loading-state</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <span className="step-num grad-text">03</span>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(0,229,255,0.1)',
                  border: '1px solid rgba(0,229,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7eebff',
                }}
              >
                <IconDownload size={20} />
              </div>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>Baixe e publique</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.55, margin: '0 0 20px' }}>
              Imagens, áudio, legendas e caption num pacote só. Arraste para o Reels e pronto.
            </p>
            <div className="img-tile" style={{ aspectRatio: '16/10' }}>
              <Image
                src="/landing/char-chave.jpg"
                alt="Chave dourada"
                fill
                sizes="400px"
                style={{ objectPosition: 'center 20%' }}
              />
              <div className="img-overlay" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
