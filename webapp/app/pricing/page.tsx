import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";

export const metadata = {
  title: "Preços — ViralObj",
  description:
    "Planos do ViralObj: Trial grátis, Starter R$47, Pro R$147, Pro+ R$297. Comece grátis por 14 dias.",
};

export default function PricingPage() {
  return (
    <>
      {/* Same Pricing section from landing, now as a standalone page */}
      <div className="pt-16">
        <Pricing />
      </div>
      <FAQ />
      <FinalCTA />
    </>
  );
}
