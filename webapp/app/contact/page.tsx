export const metadata = { title: "Contato — ViralObj" };

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-viral-muted">
      <h1 className="text-3xl font-bold text-viral-text mb-8">Contato</h1>
      <p>Entre em contato pelo email: <a href="mailto:contato@viralobj.com" className="text-viral-accent hover:underline">contato@viralobj.com</a></p>
    </div>
  );
}
