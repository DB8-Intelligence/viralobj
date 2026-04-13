import { LegalLayout } from "@/components/legal/LegalLayout";
import { COMPANY } from "@/lib/legal-data";

export const metadata = {
  title: "Política de Privacidade — ViralObj",
  description:
    "Como o ViralObj coleta, usa e protege seus dados pessoais (LGPD).",
};

export default function PrivacidadePage() {
  return (
    <LegalLayout
      title="Política de Privacidade"
      lastUpdated={COMPANY.last_updated}
    >
      <p>
        A <strong>{COMPANY.legal_name}</strong> (CNPJ {COMPANY.cnpj}),
        controladora dos dados coletados pelo ViralObj, está comprometida com
        a proteção da sua privacidade conforme a{" "}
        <strong>Lei Geral de Proteção de Dados (Lei 13.709/18 — LGPD)</strong>.
      </p>
      <p>
        Esta política explica quais dados coletamos, como usamos, com quem
        compartilhamos e quais são seus direitos.
      </p>

      <h2>1. Dados Coletados</h2>

      <h3>1.1 Dados fornecidos por você</h3>
      <ul>
        <li>
          <strong>Cadastro</strong>: nome completo, e-mail, senha (criptografada)
        </li>
        <li>
          <strong>Pagamento</strong> (quando contratar plano pago): dados
          processados pelo provedor de pagamento (Kiwify, Stripe ou similar) —
          não armazenamos números de cartão
        </li>
        <li>
          <strong>Conteúdo gerado</strong>: nichos, tópicos, objetos e outros
          inputs que você fornece à nossa IA
        </li>
        <li>
          <strong>Comunicação</strong>: mensagens enviadas pelo suporte ou
          WhatsApp
        </li>
      </ul>

      <h3>1.2 Dados coletados automaticamente</h3>
      <ul>
        <li>
          <strong>Dados de uso</strong>: páginas visitadas, tempo de sessão,
          cliques, gerações por mês (para rate limiting)
        </li>
        <li>
          <strong>Dados técnicos</strong>: IP, navegador, sistema operacional,
          dispositivo
        </li>
        <li>
          <strong>Cookies</strong>: session cookies essenciais e cookies
          analíticos (veja <a href="/legal/cookies">Política de Cookies</a>)
        </li>
      </ul>

      <h2>2. Base Legal para Tratamento (LGPD art. 7º)</h2>
      <ul>
        <li>
          <strong>Execução de contrato</strong>: cadastro, geração de
          conteúdo, faturamento
        </li>
        <li>
          <strong>Consentimento</strong>: cookies analíticos, marketing
          (opt-in)
        </li>
        <li>
          <strong>Obrigação legal</strong>: emissão de notas fiscais, retenção
          fiscal
        </li>
        <li>
          <strong>Legítimo interesse</strong>: segurança, prevenção de fraude,
          melhoria do serviço
        </li>
      </ul>

      <h2>3. Como Usamos Seus Dados</h2>
      <ul>
        <li>Criar e manter sua conta</li>
        <li>Gerar o conteúdo que você solicita</li>
        <li>Processar pagamentos e enviar recibos</li>
        <li>
          Enviar comunicações essenciais (bem-vindo, confirmação, avisos de
          limite)
        </li>
        <li>Fornecer suporte técnico</li>
        <li>
          Melhorar o produto (análise agregada e anonimizada, nunca dados
          individuais identificáveis)
        </li>
        <li>Cumprir obrigações legais e fiscais</li>
      </ul>

      <h2>4. Compartilhamento com Terceiros</h2>
      <p>Seus dados são compartilhados apenas com:</p>
      <ul>
        <li>
          <strong>Provedores de IA</strong> (Anthropic Claude, OpenAI GPT,
          Google Gemini, Fal.ai): recebem apenas o prompt de geração, sem
          dados pessoais identificáveis
        </li>
        <li>
          <strong>Infraestrutura</strong>: Supabase (banco de dados), Vercel
          (hosting), ambos com cláusulas contratuais adequadas à LGPD
        </li>
        <li>
          <strong>Pagamentos</strong>: Kiwify, Stripe ou outro processador
          (recebem apenas dados necessários à transação)
        </li>
        <li>
          <strong>Autoridades</strong>: quando exigido por lei ou ordem
          judicial
        </li>
      </ul>
      <p>
        <strong>Nunca vendemos seus dados.</strong>
      </p>

      <h2>5. Transferência Internacional</h2>
      <p>
        Alguns provedores (Vercel, Supabase, Anthropic, OpenAI, Google)
        possuem infraestrutura fora do Brasil, principalmente nos Estados
        Unidos. Todas as transferências ocorrem sob cláusulas contratuais que
        garantem nível de proteção adequado conforme o art. 33 da LGPD.
      </p>

      <h2>6. Retenção de Dados</h2>
      <ul>
        <li>
          <strong>Conta ativa</strong>: dados mantidos enquanto você usar o
          serviço
        </li>
        <li>
          <strong>Após cancelamento</strong>: dados de cadastro retidos por
          até 5 anos para fins fiscais (conforme exigência legal brasileira);
          conteúdo gerado é excluído em 90 dias
        </li>
        <li>
          <strong>Logs de acesso</strong>: retidos por 6 meses para segurança
          (Marco Civil da Internet)
        </li>
      </ul>

      <h2>7. Seus Direitos (LGPD art. 18)</h2>
      <p>Você tem direito a:</p>
      <ul>
        <li>
          <strong>Confirmação e acesso</strong>: saber se tratamos seus dados
          e ter acesso a eles
        </li>
        <li>
          <strong>Correção</strong>: corrigir dados incompletos ou incorretos
        </li>
        <li>
          <strong>Anonimização, bloqueio ou eliminação</strong>: de dados
          desnecessários ou tratados em desconformidade
        </li>
        <li>
          <strong>Portabilidade</strong>: receber seus dados em formato
          estruturado
        </li>
        <li>
          <strong>Eliminação</strong>: apagar dados tratados com seu
          consentimento
        </li>
        <li>
          <strong>Revogação do consentimento</strong>: a qualquer momento
        </li>
        <li>
          <strong>Oposição</strong>: ao tratamento baseado em legítimo
          interesse
        </li>
      </ul>
      <p>
        Para exercer seus direitos, envie solicitação para{" "}
        <a href={`mailto:${COMPANY.email.dpo}`}>{COMPANY.email.dpo}</a>.
        Responderemos em até 15 dias corridos.
      </p>

      <h2>8. Segurança</h2>
      <p>Adotamos medidas técnicas e organizacionais para proteger seus dados:</p>
      <ul>
        <li>Criptografia HTTPS em todas as comunicações</li>
        <li>Senhas armazenadas com hash (bcrypt)</li>
        <li>Row-Level Security (RLS) no banco de dados</li>
        <li>Isolamento multi-tenant</li>
        <li>Backups regulares e planos de recuperação</li>
        <li>Acesso restrito a pessoal autorizado</li>
      </ul>
      <p>
        Em caso de incidente de segurança com risco aos seus dados,
        notificaremos você e a ANPD conforme exigido pelo art. 48 da LGPD.
      </p>

      <h2>9. Menores de Idade</h2>
      <p>
        O ViralObj não é destinado a menores de 18 anos. Não coletamos
        intencionalmente dados de crianças e adolescentes. Se soubermos disso,
        excluiremos imediatamente.
      </p>

      <h2>10. Alterações nesta Política</h2>
      <p>
        Esta política pode ser atualizada. Mudanças relevantes serão
        comunicadas por e-mail e na página de login com pelo menos 30 dias de
        antecedência.
      </p>

      <h2>11. Encarregado de Dados (DPO)</h2>
      <p>
        Contato do Encarregado pelo Tratamento de Dados Pessoais:
      </p>
      <ul>
        <li>
          E-mail:{" "}
          <a href={`mailto:${COMPANY.email.dpo}`}>{COMPANY.email.dpo}</a>
        </li>
        <li>Endereço: {COMPANY.address}</li>
      </ul>
    </LegalLayout>
  );
}
