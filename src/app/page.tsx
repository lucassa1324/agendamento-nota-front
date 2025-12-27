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
  const params = use(searchParams);
  const initialOnly = params?.only;
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [isolatedSection, setIsolatedSection] = useState<string | null>(initialOnly || null);

  useEffect(() => {
    // Se o parâmetro 'only' mudar na URL, atualizamos o estado de isolamento
    if (initialOnly) {
      setIsolatedSection(initialOnly);
    }
  }, [initialOnly]);

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
      } else if (event.data?.type === "UPDATE_HEADER_SETTINGS") {
        // Notifica o sistema de eventos global para o Header no LayoutClientWrapper
        window.dispatchEvent(new CustomEvent("headerSettingsUpdated", { detail: event.data.settings }));
      } else if (event.data?.type === "UPDATE_FOOTER_SETTINGS") {
        // Notifica o sistema de eventos global para o Footer no LayoutClientWrapper
        window.dispatchEvent(new CustomEvent("footerSettingsUpdated", { detail: event.data.settings }));
      } else if (event.data?.type === "SET_ISOLATED_SECTION") {
        setIsolatedSection(event.data.sectionId);
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
    // Se houver uma seção isolada, apenas ela deve aparecer
    if (isolatedSection) return isolatedSection === id;
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
