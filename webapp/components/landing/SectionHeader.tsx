export function SectionHeader({
  eyebrow,
  title,
  sub,
  centered = true,
  gradient = false,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  centered?: boolean;
  gradient?: boolean;
}) {
  return (
    <div className={`mb-12 ${centered ? "text-center" : ""}`}>
      {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
      <h2
        className={`text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] ${
          gradient ? "text-gradient" : ""
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-lg text-viral-muted max-w-2xl mx-auto">{sub}</p>
      )}
    </div>
  );
}
