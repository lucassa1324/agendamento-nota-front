import { AboutHero } from "@/components/about-hero";
import { StorySection } from "@/components/story-section";
import { TeamSection } from "@/components/team-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { ValuesSection } from "@/components/values-section";

export const metadata = {
  title: "Sobre Nós | Brow Studio",
  description:
    "Conheça nossa história, valores e a equipe especializada em design de sobrancelhas",
};

export default function SobrePage() {
  return (
    <main>
      <AboutHero />
      <StorySection />
      <ValuesSection />
      <TeamSection />
      <TestimonialsSection />
    </main>
  );
}
