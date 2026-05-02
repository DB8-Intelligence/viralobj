import { marqueeNiches } from '../../data/characters';

export function Marquee() {
  // Duplicamos o set para loop seamless
  const items = [...marqueeNiches, ...marqueeNiches];

  return (
    <section
      style={{
        padding: '18px 0',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.015)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '0 32px' }}>
        <span
          style={{
            fontSize: 12,
            color: 'var(--muted-2)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            whiteSpace: 'nowrap',
            fontWeight: 500,
          }}
        >
          Conteúdo gerado para
        </span>
        <div className="marquee" style={{ flex: 1 }}>
          <div className="marquee-track">
            {items.map((niche, i) => (
              <span key={`${niche}-${i}`} style={{ display: 'flex', gap: 56, alignItems: 'center' }}>
                <span
                  style={{
                    color: 'var(--muted)',
                    fontSize: 16,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {niche}
                </span>
                <span style={{ color: 'var(--muted-2)', fontSize: 12 }}>●</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
