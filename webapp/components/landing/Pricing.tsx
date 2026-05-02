import Link from 'next/link';
import { IconCheck, IconArrowRight } from './icons';

interface Plan {
  name: string;
  description: string;
  price: string;
  period: string;
  features: Array<{ text: string; bold?: boolean }>;
  cta: { label: string; href: string };
  featured?: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    name: 'Starter',
    description: 'Pra testar o fluxo e começar a postar',
    price: 'R$97',
    period: '/mês',
    features: [
      { text: '05 gerações/mês' },
      { text: 'Roteiro PT-BR' },
      { text: '1 voz por geração' },
      { text: 'Caption + hashtags' },
    ],
    cta: { label: 'Começar agora', href: '/signup?plan=starter' },
  },
  {
    name: 'Pro',
    description: 'Pra quem já posta com consistência',
    price: 'R$197',
    period: '/mês',
    featured: true,
    badge: 'Mais popular',
    features: [
      { text: '15 gerações/mês', bold: true },
      { text: 'Roteiro PT + EN' },
      { text: '32 vozes ElevenLabs' },
      { text: 'Legendas timestamped' },
      { text: 'Variações (3 por geração)' },
      { text: 'Suporte prioritário' },
    ],
    cta: { label: 'Começar agora', href: '/signup?plan=pro' },
  },
  {
    name: 'Pro+',
    description: 'Pra agências e times de social media',
    price: 'R$497',
    period: '/mês',
    features: [
      { text: '40 gerações/mês' },
      { text: 'Tudo do Pro' },
      { text: '5 marcas / sub-contas' },
      { text: 'API access' },
      { text: 'Gerente de conta dedicado' },
    ],
    cta: { label: 'Falar com vendas', href: '/contact?plan=pro-plus' },
  },
];

export function Pricing() {
  return (
    <section id="pricing" style={{ padding: '100px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-eyebrow">Planos</span>
          <h2 className="section-title" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Preço que cabe <br />
            no seu primeiro reel viral
          </h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            5 gerações grátis pra testar. Depois você escolhe.
          </p>
        </div>

        <div
          className="pricing-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            alignItems: 'stretch',
          }}
        >
          {plans.map((plan) => (
            <div key={plan.name} className={`price-card${plan.featured ? ' featured' : ''}`}>
              {plan.badge && <div className="price-badge">{plan.badge}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3
                    className={plan.featured ? 'grad-text' : undefined}
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      margin: '0 0 4px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: plan.featured ? undefined : 'var(--muted)',
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>{plan.description}</p>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <span className="price">
                  {plan.price}
                  <span>{plan.period}</span>
                </span>
              </div>

              <ul>
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <IconCheck size={16} />
                    {feature.bold ? (
                      <strong style={{ color: 'var(--text)' }}>{feature.text}</strong>
                    ) : (
                      feature.text
                    )}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.cta.href}
                className={plan.featured ? 'btn-primary' : 'btn-outline'}
                style={{ justifyContent: 'center' }}
              >
                {plan.cta.label}
                {plan.featured && <IconArrowRight size={14} />}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
