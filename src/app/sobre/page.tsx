"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { AboutHero } from "@/components/about-hero";
import type { SiteConfigData } from "@/components/admin/site_editor/hooks/use-site-editor";
import { StorySection } from "@/components/story-section";
import { TeamSection } from "@/components/team-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { ValuesSection } from "@/components/values-section";
import { useStudio } from "@/context/studio-context";
import { getPageVisibility, getVisibleSections } from "@/lib/booking-data";

export default function SobrePage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ only?: string; preview?: string }>;
}) {
  const router = useRouter();
  const { studio } = useStudio();
  const searchParams = use(searchParamsPromise);
  const only = searchParams.only;
  const isPreview = searchParams.preview === "true";
  const [isVisible, setIsVisible] = useState<boolean | null>(null);
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});
  const [isolatedSection, setIsolatedSection] = useState<string | null>(
    only || null,
  );

  // Sincronização com os dados vindos do StudioContext (Banco de Dados)
  useEffect(() => {
    if (studio?.config) {
      const config = studio.config as unknown as SiteConfigData;
      
      if (!isPreview) {
        if (config.visibleSections) {
          setVisibleSections(config.visibleSections);
        }
        
        if (config.pageVisibility) {
          // Reaproveita a lógica de checkVisibility do useEffect principal
          if (config.pageVisibility.sobre === false) {
            setIsVisible(false);
            router.push("/");
          } else {
            setIsVisible(true);
          }
        }
      }
    }
  }, [studio, isPreview, router]);

  useEffect(() => {
    setIsolatedSection(only || null);
  }, [only]);

  useEffect(() => {
    const checkVisibility = (visibility: Record<string, boolean>) => {
      // Se estiver em modo preview, não redirecionamos mesmo que a página esteja desativada
      if (visibility.sobre === false && !isPreview) {
        setIsVisible(false);
        router.push("/");
      } else {
        setIsVisible(true);
      }
    };

    const initialVisibility = getPageVisibility();
    checkVisibility(initialVisibility);
    setVisibleSections(getVisibleSections());

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_PAGE_VISIBILITY") {
        checkVisibility(event.data.visibility);
      }
      if (event.data?.type === "UPDATE_VISIBLE_SECTIONS") {
        setVisibleSections(event.data.sections);
      }
      if (event.data?.type === "SET_ISOLATED_SECTION") {
        setIsolatedSection(event.data.sectionId);
      }
    };

    const handleSectionsUpdate = () => {
      setVisibleSections(getVisibleSections());
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("visibleSectionsUpdated", handleSectionsUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(
        "visibleSectionsUpdated",
        handleSectionsUpdate,
      );
    };
  }, [router, isPreview]);

  const isSectionVisible = (sectionId: string) => {
    // Exceção: 'typography' e 'colors' mostram a página inteira
    if (
      isolatedSection &&
      isolatedSection !== "typography" &&
      isolatedSection !== "colors"
    ) {
      return isolatedSection === sectionId;
    }
    return visibleSections[sectionId] !== false;
  };

  if (isVisible === null) return null;
  if (!isVisible) return null;

  return (
    <main>
      {isSectionVisible("about-hero") && <AboutHero />}
      {isSectionVisible("story") && <StorySection />}
      {isSectionVisible("values") && <ValuesSection />}
      {isSectionVisible("team") && <TeamSection />}
      {isSectionVisible("testimonials") && <TestimonialsSection />}
    </main>
  );
}
