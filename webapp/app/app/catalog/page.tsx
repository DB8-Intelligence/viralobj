import { NICHES, FORMATS, TONE_COLORS } from "@/lib/niches-data";

export default function CatalogPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Catálogo de Nichos</h1>
        <p className="text-viral-muted">
          {NICHES.length} nichos + {FORMATS.length} formatos disponíveis para geração.
        </p>
      </header>

      {/* Niches grid */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-viral-muted mb-4">
          Nichos ({NICHES.length})
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {NICHES.map((n) => (
            <div key={n.id} className="card p-5 hover:border-viral-accent/60 transition">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-viral-text">{n.label}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TONE_COLORS[n.tone] ?? "text-viral-muted bg-viral-border/30"}`}>
                  {n.tone}
                </span>
              </div>
              <p className="text-xs text-viral-muted leading-relaxed mb-3">{n.description}</p>
              <div className="flex items-center justify-between text-[11px] text-viral-muted">
                <span>Formato: <strong className="text-viral-accent2">{n.default_format}</strong></span>
                <span>{n.objects_count} objetos</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formats table */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-viral-muted mb-4">
          Formatos ({FORMATS.length})
        </h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-viral-border/60 text-xs text-viral-muted uppercase tracking-wider">
                <th className="text-left px-5 py-3">ID</th>
                <th className="text-left px-5 py-3">Nome</th>
                <th className="text-left px-5 py-3">Tom</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Melhor para</th>
              </tr>
            </thead>
            <tbody>
              {FORMATS.map((f) => (
                <tr key={f.id} className="border-b border-viral-border/30 hover:bg-viral-border/20">
                  <td className="px-5 py-3 font-mono font-bold text-viral-accent">{f.id}</td>
                  <td className="px-5 py-3">{f.name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TONE_COLORS[f.tone] ?? "text-viral-muted bg-viral-border/30"}`}>
                      {f.tone}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-viral-muted hidden md:table-cell">
                    {f.best_for.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
