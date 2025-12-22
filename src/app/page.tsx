import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { GalleryPreview } from "@/components/gallery-preview";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <GalleryPreview />
      <CTASection />
      <Footer />
    </main>
  );
}
