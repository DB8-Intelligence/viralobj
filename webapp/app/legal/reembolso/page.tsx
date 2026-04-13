import { LegalLayout } from "@/components/legal/LegalLayout";
import { COMPANY } from "@/lib/legal-data";

export const metadata = {
  title: "Política de Reembolso — ViralObj",
  description: "Política de reembolso e cancelamento do ViralObj.",
};

export default function ReembolsoPage() {
  return (
    <LegalLayout
      title="Política de Reembolso"
      lastUpdated={COMPANY.last_updated}
    >
      <p>
        Esta política descreve como funcionam cancelamentos e reembolsos no{" "}
        <strong>{COMPANY.product.name}</strong>.
      </p>

      <h2>1. Garantia de 7 Dias</h2>
      <p>
        Oferecemos <strong>garantia incondicional de 7 dias</strong> a partir
        da data da primeira contratação de qualquer plano pago:
      </p>
      <ul>
        <li>
          Se você não estiver satisfeito por qualquer motivo, pode solicitar
          reembolso integral dentro de 7 dias corridos
        </li>
        <li>
          Reembolso é feito pelo mesmo método de pagamento original em até 7
          dias úteis após a solicitação
        </li>
        <li>
          Durante o período de garantia, o acesso ao serviço permanece ativo
        </li>
      </ul>

      <h2>2. Direito de Arrependimento (CDC)</h2>
      <p>
        Conforme o art. 49 do Código de Defesa do Consumidor (Lei 8.078/90),
        você tem direito a se arrepender da contratação em até{" "}
        <strong>7 dias corridos</strong> após o pagamento, sem necessidade de
        justificativa. Este prazo se soma à nossa garantia comercial.
      </p>

      <h2>3. Após o Período de Garantia</h2>
      <p>
        Após 7 dias da contratação, <strong>não oferecemos reembolso
        proporcional</strong> pelos dias não utilizados do período já pago.
        Isso se deve à natureza digital do serviço e aos custos de
        processamento incorridos (provedores de IA, infraestrutura).
      </p>

      <h2>4. Como Cancelar</h2>
      <p>
        Para cancelar sua assinatura:
      </p>
      <ol>
        <li>Acesse seu painel em /app/billing</li>
        <li>Clique em &quot;Cancelar assinatura&quot;</li>
        <li>Confirme a operação</li>
      </ol>
      <p>
        O cancelamento é efetivado imediatamente, mas o acesso permanece ativo
        até o fim do período já pago. Não há cobrança de multas ou taxas de
        cancelamento.
      </p>

      <h2>5. Como Solicitar Reembolso</h2>
      <p>
        Envie e-mail para{" "}
        <a href={`mailto:${COMPANY.email.support}`}>{COMPANY.email.support}</a>{" "}
        com:
      </p>
      <ul>
        <li>Assunto: &quot;Solicitação de Reembolso&quot;</li>
        <li>E-mail da conta ViralObj</li>
        <li>Número do pedido / comprovante de pagamento</li>
        <li>(Opcional) Motivo do cancelamento — nos ajuda a melhorar</li>
      </ul>
      <p>
        Respondemos em até 48 horas úteis. O reembolso é processado em até 7
        dias úteis após aprovação.
      </p>

      <h2>6. Situações Sem Direito a Reembolso</h2>
      <ul>
        <li>Contratação há mais de 7 dias</li>
        <li>
          Conta suspensa por violação dos{" "}
          <a href="/legal/termos">Termos de Uso</a>
        </li>
        <li>Solicitação fora dos canais oficiais</li>
        <li>Uso fraudulento do serviço</li>
      </ul>

      <h2>7. Chargeback e Disputas</h2>
      <p>
        Antes de abrir disputa junto ao cartão ou banco, entre em contato
        conosco. Estamos comprometidos em resolver qualquer problema de forma
        amigável. Chargebacks indevidos podem resultar em suspensão permanente
        da conta.
      </p>

      <h2>8. Contato</h2>
      <ul>
        <li>
          Suporte:{" "}
          <a href={`mailto:${COMPANY.email.support}`}>{COMPANY.email.support}</a>
        </li>
        <li>
          Legal:{" "}
          <a href={`mailto:${COMPANY.email.legal}`}>{COMPANY.email.legal}</a>
        </li>
      </ul>
    </LegalLayout>
  );
}
