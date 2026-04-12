import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Generation } from "@/lib/supabase/types";

export default async function HistoryPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("generations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const generations = (data ?? []) as Generation[];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Histórico</h1>
          <p className="text-viral-muted">
            {generations.length} geração{generations.length === 1 ? "" : "ões"}
          </p>
        </div>
        <Link href="/app/generate" className="btn-primary">
          Nova geração →
        </Link>
      </header>

      {generations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-viral-muted text-sm mb-4">
            Você ainda não gerou nenhum pacote.
          </div>
          <Link href="/app/generate" className="btn-primary">
            Criar primeiro pacote →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {generations.map((g) => {
            const pkg = g.package as {
              meta?: { topic_pt?: string; topic_en?: string; format?: string };
              characters?: Array<{ emoji?: string; name_pt?: string }>;
            };
            return (
              <details key={g.id} className="card overflow-hidden">
                <summary className="cursor-pointer p-5 list-none">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {pkg.meta?.topic_pt ?? g.topic}
                      </div>
                      <div className="text-xs text-viral-muted mt-1">
                        {g.niche} · {g.tone} · {g.duration}s · {g.objects.length} obj
                        {g.provider_used && ` · via ${g.provider_used}`}
                      </div>
                    </div>
                    <div className="text-xs text-viral-muted whitespace-nowrap">
                      {new Date(g.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {pkg.characters && pkg.characters.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pkg.characters.map((c, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full bg-viral-border/30"
                        >
                          {c.emoji} {c.name_pt}
                        </span>
                      ))}
                    </div>
                  )}
                </summary>
                <div className="border-t border-viral-border/60 p-5 bg-viral-bg/40">
                  <pre className="text-[11px] text-viral-muted overflow-x-auto max-h-96">
                    {JSON.stringify(g.package, null, 2)}
                  </pre>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
