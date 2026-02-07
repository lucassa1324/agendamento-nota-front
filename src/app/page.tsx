"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { CTASection } from "@/components/cta-section";
import { GalleryPreview } from "@/components/gallery-preview";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { ValuesSection } from "@/components/values-section";
import { useStudio } from "@/context/studio-context";
import { LANDING_PAGE_URL } from "@/lib/auth-client";
import { getPageVisibility, getVisibleSections } from "@/lib/booking-data";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ only?: string; preview?: string }>;
}) {
  const router = useRouter();
  const { studio, slug, isLoading: studioLoading } = useStudio();
  const params = use(searchParams);
  const initialOnly = params?.only;
  const isPreview = params?.preview === "true";
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(
    {},
  );
  const [isolatedSection, setIsolatedSection] = useState<string | null>(
    initialOnly || null,
  );

  // Sincronização com os dados vindos do StudioContext (Banco de Dados)
  useEffect(() => {
    if (studio?.config) {
      const config = studio.config as unknown as SiteConfigData;
      
      // Priorizamos os dados do banco, mas permitimos que o preview (message) sobrescreva
      if (!isPreview) {
        if (config.visibleSections) {
          setVisibleSections(config.visibleSections);
        }
        if (config.pageVisibility) {
          setPageVisibility(config.pageVisibility);
        }
      }
    }
  }, [studio, isPreview]);

  useEffect(() => {
    // Se não houver slug e não estiver carregando, redireciona para a landing page externa
    // EXCETO se estivermos no modo preview do editor
    if (!studioLoading && !slug && LANDING_PAGE_URL && !isPreview) {
      if (typeof window !== "undefined") {
        console.log("Redirecting to landing page:", LANDING_PAGE_URL);
        window.location.replace(LANDING_PAGE_URL);
      }
    }
  }, [slug, studioLoading, isPreview]);

  useEffect(() => {
    // Se a página inicial estiver desativada, redireciona para agendamento
    // EXCETO se estivermos no modo preview do editor
    if (pageVisibility.inicio === false && !isPreview) {
      router.replace("/agendamento");
    }
  }, [pageVisibility.inicio, isPreview, router]);

  useEffect(() => {
    // Se o parâmetro 'only' mudar na URL, atualizamos o estado de isolamento
    setIsolatedSection(initialOnly || null);
  }, [initialOnly]);

  useEffect(() => {
    // Inicializa a visibilidade
    setVisibleSections(getVisibleSections());
    setPageVisibility(getPageVisibility());

    // Escuta atualizações de visibilidade (para o preview do editor)
    const handleVisibilityUpdate = () => {
      setVisibleSections(getVisibleSections());
    };

    const handlePageVisibilityUpdate = () => {
      setPageVisibility(getPageVisibility());
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_VISIBLE_SECTIONS") {
        setVisibleSections(event.data.sections);
      } else if (event.data?.type === "UPDATE_PAGE_VISIBILITY") {
        setPageVisibility(event.data.visibility);
      } else if (event.data?.type === "UPDATE_HEADER_SETTINGS") {
        // Notifica o sistema de eventos global para o Header no LayoutClientWrapper
        window.dispatchEvent(
          new CustomEvent("headerSettingsUpdated", {
            detail: event.data.settings,
          }),
        );
      } else if (event.data?.type === "UPDATE_FOOTER_SETTINGS") {
        // Notifica o sistema de eventos global para o Footer no LayoutClientWrapper
        window.dispatchEvent(
          new CustomEvent("footerSettingsUpdated", {
            detail: event.data.settings,
          }),
        );
      } else if (event.data?.type === "SET_ISOLATED_SECTION") {
        setIsolatedSection(event.data.sectionId);
      }
    };

    window.addEventListener("visibleSectionsUpdated", handleVisibilityUpdate);
    window.addEventListener(
      "pageVisibilityUpdated",
      handlePageVisibilityUpdate,
    );
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener(
        "visibleSectionsUpdated",
        handleVisibilityUpdate,
      );
      window.removeEventListener(
        "pageVisibilityUpdated",
        handlePageVisibilityUpdate,
      );
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const isVisible = (id: string) => {
    // Se houver uma seção isolada, apenas ela deve aparecer
    // Exceção: 'typography' e 'colors' mostram a página inteira
    if (
      isolatedSection &&
      isolatedSection !== "typography" &&
      isolatedSection !== "colors"
    ) {
      return isolatedSection === id;
    }
    // Caso contrário, verificamos se a seção está marcada como visível (default é true)
    return visibleSections[id] !== false;
  };

  // Se estiver carregando o studio ou redirecionando, mostramos um estado neutro
  // No modo preview, permitimos renderizar mesmo sem slug para evitar o loading infinito no editor
  if ((studioLoading || !slug) && !isPreview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Se a página inicial estiver desativada e não for modo preview, não renderizamos nada
  // O useEffect acima se encarregará de redirecionar para /agendamento
  if (pageVisibility.inicio === false && !isPreview) {
    return null;
  }

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
