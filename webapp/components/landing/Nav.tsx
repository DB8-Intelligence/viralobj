import Link from 'next/link';
import { IconArrowRight } from './icons';

export function Nav() {
  return (
    <nav className="topnav">
      <div className="container nav-inner">
        <Link href="/" className="logo" aria-label="ViralObj — Home">
          <span className="logo-dot" aria-hidden="true" />
          ViralObj
        </Link>

        <div className="nav-links">
          <a href="#features">Recursos</a>
          <a href="#gallery">Personagens</a>
          <a href="#pricing">Preços</a>
          <a href="#faq">FAQ</a>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: 14, color: 'var(--muted)', padding: '8px 12px' }}>
            Entrar
          </Link>
          <Link href="/signup" className="btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
            Começar grátis
            <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
