import { LegalLayout } from "@/components/legal/LegalLayout";
import { COMPANY } from "@/lib/legal-data";

export const metadata = {
  title: "Política de Cookies — ViralObj",
  description: "Como o ViralObj usa cookies e tecnologias similares.",
};

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Política de Cookies"
      lastUpdated={COMPANY.last_updated}
    >
      <p>
        Esta política explica como o <strong>{COMPANY.product.name}</strong>{" "}
        usa cookies e tecnologias similares no site{" "}
        <a href={COMPANY.product.url}>{COMPANY.product.url}</a>.
      </p>

      <h2>1. O Que São Cookies</h2>
      <p>
        Cookies são pequenos arquivos de texto armazenados no seu dispositivo
        quando você visita um site. Eles permitem que o site lembre suas
        preferências e mantenha sua sessão ativa.
      </p>

      <h2>2. Cookies Que Utilizamos</h2>

      <h3>2.1 Cookies Essenciais (não requerem consentimento)</h3>
      <p>
        Necessários para o funcionamento básico do site. Não podem ser
        desativados.
      </p>
      <ul>
        <li>
          <strong>sb-access-token</strong> e{" "}
          <strong>sb-refresh-token</strong>: mantêm sua sessão autenticada
          (Supabase Auth)
        </li>
        <li>
          <strong>viralobj-consent</strong>: armazena suas preferências de
          consentimento de cookies
        </li>
      </ul>

      <h3>2.2 Cookies Analíticos (requerem consentimento)</h3>
      <p>
        Nos ajudam a entender como o site é usado para melhorarmos a
        experiência.
      </p>
      <ul>
        <li>
          <strong>(a ser configurado)</strong>: Plausible, PostHog ou similar
          — analytics agregado sem identificação pessoal
        </li>
      </ul>

      <h3>2.3 Cookies de Marketing</h3>
      <p>
        Atualmente o ViralObj <strong>não utiliza cookies de marketing</strong>{" "}
        nem rastreadores de terceiros. Caso isso mude no futuro, você será
        notificado e poderá optar por não aceitar.
      </p>

      <h2>3. Como Gerenciar Cookies</h2>

      <h3>3.1 Pelo nosso banner de consentimento</h3>
      <p>
        Ao acessar o site pela primeira vez, exibimos um banner pedindo
        consentimento para cookies não-essenciais. Você pode aceitar ou
        recusar a qualquer momento.
      </p>

      <h3>3.2 Pelo navegador</h3>
      <p>
        Você também pode controlar cookies diretamente nas configurações do
        seu navegador:
      </p>
      <ul>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener"
          >
            Google Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/pt-BR/kb/ative-e-desative-os-cookies-que-os-sites-usam"
            target="_blank"
            rel="noopener"
          >
            Firefox
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/pt-br/guide/safari/sfri11471"
            target="_blank"
            rel="noopener"
          >
            Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/pt-br/windows/gerenciar-cookies-no-microsoft-edge"
            target="_blank"
            rel="noopener"
          >
            Microsoft Edge
          </a>
        </li>
      </ul>
      <p>
        <strong>Atenção:</strong> Desabilitar cookies essenciais impede o
        funcionamento do login e da plataforma.
      </p>

      <h2>4. Cookies de Terceiros</h2>
      <p>
        Alguns serviços integrados podem definir cookies próprios:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong>: autenticação (essencial)
        </li>
        <li>
          <strong>Google Cloud</strong>: infraestrutura (Cloud Run) e
          observabilidade essencial à operação
        </li>
      </ul>
      <p>
        Cada um desses provedores tem sua própria política de privacidade.
      </p>

      <h2>5. Alterações</h2>
      <p>
        Esta política pode ser atualizada. Sempre que houver mudanças
        relevantes, o banner de consentimento será exibido novamente para que
        você possa revisar suas preferências.
      </p>

      <h2>6. Dúvidas</h2>
      <p>
        Contato para questões sobre cookies:{" "}
        <a href={`mailto:${COMPANY.email.dpo}`}>{COMPANY.email.dpo}</a>
      </p>
    </LegalLayout>
  );
}
