import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth-helpers";
import { PLAN_LABELS, formatLimit, formatUsagePct } from "@/lib/supabase/types";
import { logoutAction } from "../login/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card p-5">
            <div className="text-xs uppercase tracking-wider text-viral-muted mb-1">
              Workspace
            </div>
            <div className="font-semibold truncate">{ctx.tenant.name}</div>
            <div className="mt-3 inline-flex items-center gap-2 text-[10px] px-2 py-0.5 rounded-full bg-viral-accent/10 text-viral-accent font-semibold uppercase">
              {PLAN_LABELS[ctx.tenant.plan]}
            </div>
          </div>

          <nav className="card p-2 text-sm">
            <SidebarLink href="/app" label="Dashboard" />
            <SidebarLink href="/app/generate" label="Nova geração" />
            <SidebarLink href="/app/history" label="Histórico" />
            <SidebarLink href="/app/billing" label="Assinatura" />
            <SidebarLink href="/niches" label="Catálogo" external />
          </nav>

          <div className="card p-5">
            <div className="text-xs uppercase tracking-wider text-viral-muted mb-3">
              Uso do mês
            </div>
            <UsageBar label="Pacotes" used={ctx.limits.packages.used} max={ctx.limits.packages.max} />
            <UsageBar label="Vídeos" used={ctx.limits.videos.used} max={ctx.limits.videos.max} />
            <UsageBar label="Posts" used={ctx.limits.posts.used} max={ctx.limits.posts.max} />
          </div>

          <div className="card p-5 text-xs text-viral-muted">
            <div className="font-semibold text-viral-text mb-1">{ctx.profile.full_name}</div>
            <div className="truncate mb-3">{ctx.email}</div>
            <form action={logoutAction}>
              <button type="submit" className="text-viral-accent hover:underline">
                Sair →
              </button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <section>{children}</section>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md hover:bg-viral-border/30 transition"
      target={external ? "_blank" : undefined}
    >
      {label}
      {external && <span className="text-viral-muted ml-1">↗</span>}
    </Link>
  );
}

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = formatUsagePct(used, max);
  const displayMax = formatLimit(max);
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between text-xs text-viral-muted mb-1">
        <span>{label}</span>
        <span>
          {used}/{displayMax}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-viral-border/40 overflow-hidden">
        <div
          className={`h-full transition-all ${
            pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-viral-accent"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
