import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{ padding: '48px 0 60px', borderTop: '1px solid var(--border)' }}>
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div className="logo">
          <span className="logo-dot" aria-hidden="true" />
          ViralObj
        </div>

        <div style={{ display: 'flex', gap: 28, fontSize: 13, color: 'var(--muted)' }}>
          <Link href="/terms">Termos</Link>
          <Link href="/privacy">Privacidade</Link>
          <Link href="/contact">Contato</Link>
          <a href="https://instagram.com/viralobj" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted-2)' }}>© 2026 ViralObj · Feito no Brasil</div>
      </div>
    </footer>
  );
}
