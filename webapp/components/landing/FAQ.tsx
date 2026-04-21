import { IconPlus, IconMinus } from './icons';

const faqItems: Array<{ q: string; a: string }> = [
  {
    q: 'Preciso saber de 3D, design ou edição de vídeo?',
    a: 'Não. A plataforma foi construída pra quem nunca abriu um software 3D. Você escolhe o nicho e o objeto, e a IA entrega o pacote completo (imagens, áudio, legenda e hashtags) em menos de 2 minutos.',
  },
  {
    q: 'Como funciona o trial de 5 gerações grátis?',
    a: 'Ao criar sua conta, você recebe 5 créditos pra gerar pacotes completos sem colocar cartão. Se gostar, você assina; se não, seus conteúdos gerados continuam seus, sem custo.',
  },
  {
    q: 'As imagens têm resolução pra Instagram Reels?',
    a: 'Sim. Todas as imagens são geradas em 1080×1920 (aspect ratio 9:16), prontas pra Reels, Stories e TikTok sem precisar recortar.',
  },
  {
    q: 'Posso usar os conteúdos comercialmente?',
    a: 'Sim. Em qualquer plano pago, o conteúdo gerado pode ser usado comercialmente — incluindo posts patrocinados, anúncios, e campanhas para clientes (no plano Pro+).',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, sem burocracia. O cancelamento é feito em 2 cliques dentro do app e você mantém acesso até o fim do ciclo pago.',
  },
  {
    q: 'Que nichos estão disponíveis?',
    a: 'Atualmente 12 nichos: Casa, Plantas, Culinária, Financeiro, Fitness, Saúde, Pets, Maternidade, Natureza, Saúde Mental, Saúde & Receitas, e Gastronomia. Novos nichos são adicionados todo mês pela equipe de curadoria.',
  },
  {
    q: 'A voz soa artificial?',
    a: 'Usamos ElevenLabs, que é referência global em síntese de voz. As 32 vozes PT-BR passam por testes A/B com público real e transmitem emoção (raiva, ironia, empolgação) — imperceptível nos comentários dos reels.',
  },
  {
    q: 'Vocês fazem reembolso?',
    a: 'Sim. Garantia de 7 dias: se não curtir, você pede o reembolso por e-mail e devolvemos 100% do valor, sem perguntar o motivo.',
  },
];

export function FAQ() {
  return (
    <section id="faq" style={{ padding: '100px 0' }}>
      <div className="container" style={{ maxWidth: 840 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="section-eyebrow">FAQ</span>
          <h2 className="section-title" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Perguntas frequentes
          </h2>
        </div>

        <div>
          {faqItems.map((item, i) => (
            <details key={i} className="faq-item">
              <summary>
                {item.q}
                <span style={{ flexShrink: 0 }}>
                  <IconPlus size={20} />
                  <IconMinus size={20} />
                </span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
