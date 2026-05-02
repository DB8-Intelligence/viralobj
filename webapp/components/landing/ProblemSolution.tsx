import Image from 'next/image';
import { IconCheck, IconClose } from './icons';

const badPoints = [
  <>Horas no Canva sem resultado que viraliza</>,
  <>Designer 3D freelancer = <strong style={{ color: 'var(--text)' }}>R$500</strong> por vídeo</>,
  <>Roteiros genéricos que morrem na terceira linha</>,
  <>Legendas sem hook — público dá scroll em 2s</>,
  <>Hashtags aleatórias que não entregam para o nicho certo</>,
];

const goodPoints = [
  <>Personagem 3D pronto em <strong style={{ color: 'var(--text)' }}>60 segundos</strong></>,
  <>Roteiro viral em PT-BR + Inglês — com hook, desenvolvimento e CTA</>,
  <>Voz narrada com emoção real (ElevenLabs)</>,
  <>Caption + 30 hashtags otimizadas para o nicho</>,
  <>Custo por reel: <strong style={{ color: 'var(--text)' }}>menos de R$20</strong></>,
];

export function ProblemSolution() {
  return (
    <section style={{ padding: '120px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span className="section-eyebrow">O contraste</span>
          <h2 className="section-title" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            O que muda com ViralObj
          </h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            A diferença entre passar a noite editando no Canva e publicar um reel profissional em 2 minutos.
          </p>
        </div>

        <div
          className="two-col"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
            alignItems: 'stretch',
            position: 'relative',
          }}
        >
          {/* BAD */}
          <div className="ps-card ps-bad">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(248,113,113,0.12)',
                  border: '1px solid rgba(248,113,113,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f87171',
                }}
              >
                <IconClose size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Sem ViralObj</h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 15, margin: '0 0 4px' }}>
              A rotina que está drenando o seu tempo:
            </p>
            <ul className="ps-list">
              {badPoints.map((point, i) => (
                <li key={i}>
                  <IconClose size={18} stroke="#f87171" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* GOOD */}
          <div className="ps-card ps-good">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(255,51,102,0.2), rgba(0,229,255,0.2))',
                  border: '1px solid rgba(255,51,102,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                }}
              >
                <IconCheck size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Com ViralObj</h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 15, margin: '0 0 4px' }}>
              Um fluxo feito para criadores que querem escalar:
            </p>
            <ul className="ps-list">
              {goodPoints.map((point, i) => (
                <li key={i}>
                  <IconCheck size={18} stroke="#34d399" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Floating avocado between columns */}
          <div
            className="img-tile float-2"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 170,
              aspectRatio: '9/16',
              borderRadius: 20,
              borderWidth: 2,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 6px var(--bg)',
            }}
          >
            <Image src="/landing/char-avocado.jpg" alt="Abacate smoothie" fill sizes="170px" />
            <div className="img-overlay" />
          </div>
        </div>
      </div>
    </section>
  );
}
