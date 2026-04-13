import { Hero } from "@/components/landing/Hero";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { Stats } from "@/components/landing/Stats";
import { Pricing } from "@/components/landing/Pricing";
import { NichesShowcase } from "@/components/landing/NichesShowcase";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <FeaturesGrid />
      <Stats />
      <Pricing />
      <NichesShowcase />
      <FAQ />
      <FinalCTA />
    </>
  );
}
