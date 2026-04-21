import { landingMetrics } from '../../data/characters';

export function Metrics() {
  return (
    <section style={{ padding: '100px 0', position: 'relative' }} className="noise">
      <div className="container">
        <div
          className="metrics-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 48,
            textAlign: 'center',
          }}
        >
          <div>
            <div className="metric-num grad-text">{landingMetrics.creators}</div>
            <div className="metric-label">Criadores ativos</div>
          </div>
          <div>
            <div className="metric-num grad-text">{landingMetrics.niches}</div>
            <div className="metric-label">Nichos catalogados</div>
          </div>
          <div>
            <div className="metric-num grad-text">{landingMetrics.characters}</div>
            <div className="metric-label">Personagens 3D</div>
          </div>
          <div>
            <div className="metric-num grad-text">{landingMetrics.timePerReel}</div>
            <div className="metric-label">Por reel gerado</div>
          </div>
        </div>
      </div>
    </section>
  );
}
