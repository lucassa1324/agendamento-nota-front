import { CTASection } from "@/components/cta-section";
import { GalleryPreview } from "@/components/gallery-preview";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { ValuesSection } from "@/components/values-section";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ only?: string }>;
}) {
  const { only } = await searchParams;

  return (
    <main>
      {(!only || only === "hero") && <HeroSection />}
      {(!only || only === "services") && <ServicesSection />}
      {(!only || only === "values") && <ValuesSection />}
      {(!only || only === "gallery-preview") && <GalleryPreview />}
      {(!only || only === "cta") && <CTASection />}
    </main>
  );
}
