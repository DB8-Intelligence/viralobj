import { LegalLayout } from "@/components/legal/LegalLayout";
import { COMPANY } from "@/lib/legal-data";

export const metadata = {
  title: "Termos de Uso — ViralObj",
  description: "Termos de uso do ViralObj, produto da DB8 Intelligence.",
};

export default function TermosPage() {
  return (
    <LegalLayout title="Termos de Uso" lastUpdated={COMPANY.last_updated}>
      <p>
        Bem-vindo ao <strong>{COMPANY.product.name}</strong>, um produto da{" "}
        <strong>{COMPANY.legal_name}</strong>, inscrita no CNPJ sob nº{" "}
        {COMPANY.cnpj}, com sede em {COMPANY.address} (&quot;Empresa&quot;).
      </p>
      <p>
        Ao criar uma conta ou usar o ViralObj, você concorda integralmente com
        estes Termos de Uso. Leia com atenção antes de prosseguir.
      </p>

      <h2>1. Sobre o Serviço</h2>
      <p>
        O ViralObj é uma plataforma SaaS que oferece geração automatizada de
        pacotes de conteúdo para reels curtos, utilizando inteligência
        artificial. O serviço inclui:
      </p>
      <ul>
        <li>Geração de roteiros bilíngues (português e inglês)</li>
        <li>Sugestão de prompts visuais para criação de imagens</li>
        <li>Legendas otimizadas, hashtags e copy para publicações</li>
        <li>Pipeline opcional de geração de vídeos MP4</li>
        <li>Agendamento opcional de publicações no Instagram</li>
      </ul>

      <h2>2. Cadastro e Conta</h2>
      <p>
        Para utilizar o ViralObj, você deve criar uma conta fornecendo nome
        completo, e-mail válido e senha. Você é responsável por manter a
        confidencialidade das suas credenciais e por todas as atividades
        realizadas em sua conta.
      </p>
      <p>
        Ao se cadastrar, você declara ter <strong>pelo menos 18 anos</strong> e
        capacidade legal para celebrar contratos.
      </p>

      <h2>3. Planos e Limites</h2>
      <p>
        O ViralObj oferece os seguintes planos:
      </p>
      <ul>
        <li>
          <strong>Trial</strong> (grátis, 14 dias): 5 pacotes gerados, sem
          geração de vídeo ou auto-post
        </li>
        <li>
          <strong>Starter</strong>: 30 pacotes/mês + 10 vídeos + 10 posts
          agendados
        </li>
        <li>
          <strong>Pro</strong>: 100 pacotes + 50 vídeos + 50 posts
        </li>
        <li>
          <strong>Pro+</strong>: 300 pacotes + 150 vídeos + 150 posts
        </li>
        <li>
          <strong>Enterprise</strong>: limites ilimitados sob negociação
        </li>
      </ul>
      <p>
        Os limites são renovados mensalmente. Limites não utilizados não são
        acumulados. A Empresa reserva o direito de ajustar preços e limites a
        qualquer momento, com aviso prévio de 30 dias aos assinantes ativos.
      </p>

      <h2>4. Uso Aceitável</h2>
      <p>Você concorda em NÃO usar o ViralObj para:</p>
      <ul>
        <li>
          Gerar conteúdo que infrinja direitos autorais, marcas registradas ou
          propriedade intelectual de terceiros
        </li>
        <li>
          Criar material difamatório, calunioso, obsceno, discriminatório ou
          que incite violência
        </li>
        <li>
          Disseminar informações falsas, fraudulentas ou enganosas (fake news)
        </li>
        <li>Promover atividades ilegais ou antiéticas</li>
        <li>
          Tentar contornar limites técnicos, fazer engenharia reversa ou
          acessar dados de outros usuários
        </li>
        <li>Revender, sublicenciar ou redistribuir o serviço sem autorização</li>
      </ul>
      <p>
        A violação desta cláusula resulta em suspensão imediata da conta sem
        direito a reembolso.
      </p>

      <h2>5. Propriedade Intelectual</h2>
      <p>
        O conteúdo gerado pelo ViralObj (roteiros, prompts, legendas, vídeos)
        pertence ao usuário que o gerou, com as seguintes ressalvas:
      </p>
      <ul>
        <li>
          A Empresa mantém a propriedade da plataforma, do código, do dataset
          proprietário e dos modelos de IA customizados
        </li>
        <li>
          Você concede à Empresa licença não-exclusiva para usar seus inputs
          (nicho, tópico, objetos) para melhorar o serviço, de forma anônima e
          agregada
        </li>
        <li>
          Você é o único responsável pelo conteúdo que publicar, inclusive por
          verificar direitos sobre qualquer referência, marca ou pessoa
          mencionada
        </li>
      </ul>

      <h2>6. Pagamentos e Renovação</h2>
      <p>
        Os planos pagos são cobrados mensal ou anualmente via processadores de
        pagamento terceirizados. A assinatura é renovada automaticamente ao
        final de cada período, a menos que cancelada pelo usuário com no
        mínimo 24 horas de antecedência.
      </p>
      <p>
        A cobrança inicial é feita no momento da contratação. As renovações
        seguem o valor vigente na data de renovação.
      </p>

      <h2>7. Cancelamento e Reembolso</h2>
      <p>
        Você pode cancelar sua assinatura a qualquer momento pelo painel do
        usuário. O acesso permanece ativo até o fim do período já pago.
      </p>
      <p>
        Oferecemos <strong>garantia incondicional de 7 dias</strong>: se você
        não gostar do serviço, solicite reembolso integral dentro desse prazo.
        Após 7 dias, não há reembolso proporcional. Veja detalhes na{" "}
        <a href="/legal/reembolso">Política de Reembolso</a>.
      </p>

      <h2>8. Limitação de Responsabilidade</h2>
      <p>
        O ViralObj é fornecido &quot;como está&quot;. A Empresa não garante que:
      </p>
      <ul>
        <li>O conteúdo gerado viralize ou atinja qualquer métrica específica</li>
        <li>O serviço esteja disponível 100% do tempo (SLA alvo: 99%)</li>
        <li>
          Os provedores de IA terceirizados (Claude, GPT, Gemini, Fal.ai)
          mantenham disponibilidade constante
        </li>
      </ul>
      <p>
        A responsabilidade total da Empresa em qualquer caso é limitada ao
        valor pago pelo usuário nos últimos 12 meses.
      </p>

      <h2>9. Modificações dos Termos</h2>
      <p>
        Estes Termos podem ser atualizados. Mudanças significativas serão
        comunicadas por e-mail com 30 dias de antecedência. O uso continuado do
        serviço após as modificações implica aceitação dos novos termos.
      </p>

      <h2>10. Lei Aplicável e Foro</h2>
      <p>
        Estes Termos são regidos pela legislação brasileira, em especial o
        Código de Defesa do Consumidor (Lei 8.078/90) e a Lei Geral de
        Proteção de Dados Pessoais (Lei 13.709/18). Fica eleito o foro da{" "}
        {COMPANY.jurisdiction} para dirimir quaisquer controvérsias.
      </p>

      <h2>11. Contato</h2>
      <p>
        Dúvidas sobre estes Termos? Entre em contato:
      </p>
      <ul>
        <li>
          E-mail legal:{" "}
          <a href={`mailto:${COMPANY.email.legal}`}>{COMPANY.email.legal}</a>
        </li>
        <li>
          Suporte:{" "}
          <a href={`mailto:${COMPANY.email.support}`}>{COMPANY.email.support}</a>
        </li>
      </ul>
    </LegalLayout>
  );
}
