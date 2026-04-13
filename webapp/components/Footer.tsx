import Link from "next/link";
import { COMPANY } from "@/lib/legal-data";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-viral-border/60 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg mb-2"
            >
              <span className="text-viral-accent">●</span>
              <span>ViralObj</span>
            </Link>
            <p className="text-xs text-viral-muted leading-relaxed">
              {COMPANY.product.tagline}
            </p>
          </div>

          {/* Produto */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-viral-text mb-3">
              Produto
            </h4>
            <ul className="space-y-2 text-xs">
              <FooterLink href="/#how-it-works" label="Como funciona" />
              <FooterLink href="/#pricing" label="Preços" />
              <FooterLink href="/#niches" label="Nichos" />
              <FooterLink href="/#faq" label="FAQ" />
              <FooterLink href="/niches" label="Catálogo completo" />
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-viral-text mb-3">
              Recursos
            </h4>
            <ul className="space-y-2 text-xs">
              <FooterLink href="/login" label="Entrar" />
              <FooterLink href="/signup" label="Criar conta grátis" />
              <li>
                <a
                  href={`mailto:${COMPANY.email.support}`}
                  className="text-viral-muted hover:text-viral-text"
                >
                  Suporte
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-viral-text mb-3">
              Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <FooterLink href="/legal/termos" label="Termos de Uso" />
              <FooterLink
                href="/legal/privacidade"
                label="Política de Privacidade"
              />
              <FooterLink
                href="/legal/reembolso"
                label="Política de Reembolso"
              />
              <FooterLink href="/legal/cookies" label="Cookies" />
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-viral-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-viral-muted">
          <div>
            © {year} {COMPANY.legal_name} · CNPJ {COMPANY.cnpj}
          </div>
          <div>Feito com ❤️ no Brasil</div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="text-viral-muted hover:text-viral-text">
        {label}
      </Link>
    </li>
  );
}
