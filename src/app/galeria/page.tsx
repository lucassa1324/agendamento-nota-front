"use client";

import { useRouter } from "next/navigation";
import {  use, useEffect, useState } from "react";
import { SectionBackground } from "@/components/admin/site_editor/components/SectionBackground";
import { GalleryGrid } from "@/components/gallery-grid";
import {
  defaultGallerySettings,
  type GallerySettings,
  getGallerySettings,
  getPageVisibility,
  getVisibleSections,
} from "@/lib/booking-data";

export default function GaleriaPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ only?: string }>;
}) {
  const router = useRouter();
  const searchParams = use(searchParamsPromise);
  const initialOnly = searchParams.only;
  const [isolatedSection, setIsolatedSection] = useState<string | null>(initialOnly || null);
  const [isVisible, setIsVisible] = useState<boolean | null>(null);
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});
  const [gallerySettings, setGallerySettings] = useState<GallerySettings>(
    defaultGallerySettings,
  );

  useEffect(() => {
    // Carregar configurações iniciais
    setGallerySettings(getGallerySettings());
  }, []);

  useEffect(() => {
    setIsolatedSection(initialOnly || null);
  }, [initialOnly]);

  useEffect(() => {
    // Verificar visibilidade
    const checkVisibility = (visibility: Record<string, boolean>) => {
      if (visibility.galeria === false) {
        setIsVisible(false);
        router.push("/");
      } else {
        setIsVisible(true);
      }
    };

    checkVisibility(getPageVisibility());
    setVisibleSections(getVisibleSections());

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_PAGE_VISIBILITY") {
        checkVisibility(event.data.visibility);
      }
      if (event.data?.type === "UPDATE_VISIBLE_SECTIONS") {
        setVisibleSections(event.data.sections);
      }
      if (event.data?.type === "UPDATE_GALLERY_SETTINGS") {
        setGallerySettings(event.data.settings);
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
  }, [router]);

  if (isVisible === false) return null;
  if (isVisible === null) return null; // Loading state

  const isSectionVisible = (id: string) => {
    if (isolatedSection) return isolatedSection === id;
    return visibleSections[id] !== false;
  };

  return (
    <main>
      {isSectionVisible("gallery-grid") && (
        <section className="relative py-20 md:py-32 overflow-hidden">
          <SectionBackground settings={gallerySettings} />

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h1
                className="text-4xl md:text-6xl font-bold mb-4 text-balance transition-all duration-300"
                style={{
                  fontFamily: gallerySettings.titleFont || "var(--font-title)",
                  color: gallerySettings.titleColor || "var(--primary)",
                }}
              >
                {gallerySettings.title}
              </h1>
              <p
                className="text-lg max-w-2xl mx-auto text-pretty leading-relaxed transition-all duration-300"
                style={{
                  fontFamily: gallerySettings.subtitleFont || "var(--font-body)",
                  color: gallerySettings.subtitleColor || "var(--text)",
                  opacity: gallerySettings.subtitleColor ? 1 : 0.8,
                }}
              >
                {gallerySettings.subtitle}
              </p>
            </div>

            <GalleryGrid />
          </div>
        </section>
      )}
    </main>
  );
}
