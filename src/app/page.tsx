"use client";

import { use, useEffect, useState } from "react";
import { CTASection } from "@/components/cta-section";
import { GalleryPreview } from "@/components/gallery-preview";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { ValuesSection } from "@/components/values-section";
import { getVisibleSections } from "@/lib/booking-data";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ only?: string }>;
}) {
  const { only } = use(searchParams);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Inicializa a visibilidade
    setVisibleSections(getVisibleSections());

    // Escuta atualizações de visibilidade (para o preview do editor)
    const handleVisibilityUpdate = () => {
      setVisibleSections(getVisibleSections());
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_VISIBLE_SECTIONS") {
        setVisibleSections(event.data.sections);
      }
    };

    window.addEventListener("visibleSectionsUpdated", handleVisibilityUpdate);
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("visibleSectionsUpdated", handleVisibilityUpdate);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const isVisible = (id: string) => {
    // Se estivermos em modo "only" (preview de seção única), ignoramos o visibleSections
    if (only) return only === id;
    // Caso contrário, verificamos se a seção está marcada como visível (default é true)
    return visibleSections[id] !== false;
  };

  return (
    <main>
      {isVisible("hero") && <HeroSection />}
      {isVisible("services") && <ServicesSection />}
      {isVisible("values") && <ValuesSection />}
      {isVisible("gallery-preview") && <GalleryPreview />}
      {isVisible("cta") && <CTASection />}
    </main>
  );
}
