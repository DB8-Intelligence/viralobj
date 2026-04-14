import Link from "next/link";
import { getSessionContext } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import type { Generation } from "@/lib/supabase/types";
import { formatLimit } from "@/lib/supabase/types";

export default async function AppDashboard() {
  const ctx = await getSessionContext();
  if (!ctx) return null;

  const supabase = createClient();
  const { data: recent } = await supabase
    .from("generations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const generations = (recent ?? []) as Generation[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-1">
          Olá, {ctx.profile.full_name.split(" ")[0]}
        </h1>
        <p className="text-viral-muted">
          {ctx.limits.packages.remaining > 0
            ? `Você tem ${ctx.limits.packages.remaining} pacote(s) disponíveis este mês.`
            : "Você atingiu o limite mensal do seu plano."}
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          label="Pacotes gerados"
          value={ctx.usage.packages_count}
          sub={`de ${formatLimit(ctx.limits.packages.max)} este mês`}
        />
        <StatCard
          label="Vídeos"
          value={ctx.usage.videos_count}
          sub={`de ${formatLimit(ctx.limits.videos.max)}`}
        />
        <StatCard
          label="Posts"
          value={ctx.usage.posts_count}
          sub={`de ${formatLimit(ctx.limits.posts.max)}`}
        />
      </div>

      <div className="flex items-center gap-3">
        <Link href="/app/generate" className="btn-primary">
          Nova geração →
        </Link>
        {ctx.limits.packages.remaining === 0 && (
          <Link href="/app/billing" className="btn-secondary">
            Fazer upgrade
          </Link>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-viral-muted">
            Últimas gerações
          </h2>
          <Link href="/app/history" className="text-xs text-viral-accent hover:underline">
            Ver tudo →
          </Link>
        </div>
        {generations.length === 0 ? (
          <div className="text-sm text-viral-muted text-center py-8">
            Nenhuma geração ainda. <Link href="/app/generate" className="text-viral-accent hover:underline">Crie a primeira →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {generations.map((g) => (
              <Link
                key={g.id}
                href={`/app/history/${g.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-viral-border/30 transition"
              >
                <div>
                  <div className="font-medium text-sm">{g.topic}</div>
                  <div className="text-xs text-viral-muted">
                    {g.niche} · {g.objects.length} objetos · {g.tone}
                  </div>
                </div>
                <div className="text-xs text-viral-muted">
                  {new Date(g.created_at).toLocaleDateString("pt-BR")}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-viral-muted mb-1">
        {label}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs text-viral-muted mt-1">{sub}</div>
    </div>
  );
}
