"use client";

import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import {
  SectionBackground,
  type SectionBackgroundSettings,
} from "@/components/admin/site_editor/components/SectionBackground";
import type { SiteConfigData } from "@/components/admin/site_editor/hooks/use-site-editor";
import { GalleryGrid } from "@/components/gallery-grid";
import { useStudio } from "@/context/studio-context";
import {
  defaultGallerySettings,
  type GallerySettings,
  getGalleryPageSettings,
  getPageVisibility,
  getVisibleSections,
  sanitizeColor,
  SECTION_IDS,
} from "@/lib/booking-data";

export default function GaleriaPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ only?: string; preview?: string }>;
}) {
  const router = useRouter();
  const { studio } = useStudio();
  const searchParams = use(searchParamsPromise);
  const initialOnly = searchParams.only;
  const isPreview = searchParams.preview === "true";
  const [isolatedSection, setIsolatedSection] = useState<string | null>(
    initialOnly || null,
  );
  const [isVisible, setIsVisible] = useState<boolean | null>(null);
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});
  const [gallerySettings, setGallerySettings] = useState<GallerySettings>(
    defaultGallerySettings,
  );
  const sanitizeGallerySettings = useCallback(
    (incoming: Record<string, unknown>) => {
      const incomingAppearance =
        (incoming.appearance as Record<string, unknown>) || {};
      const incomingContent =
        (incoming.content as Record<string, unknown>) || {};
      const merged = {
        ...defaultGallerySettings,
        ...(incoming as GallerySettings),
      } as GallerySettings & Record<string, unknown>;

      merged.bgColor =
        sanitizeColor(
          (merged.bgColor as string) ||
            (incomingAppearance.backgroundColor as string),
        ) || "";
      merged.titleColor =
        sanitizeColor(
          (merged.titleColor as string) ||
            (incomingAppearance.titleColor as string) ||
            (incomingContent.titleColor as string),
        ) || "";
      merged.subtitleColor =
        sanitizeColor(
          (merged.subtitleColor as string) ||
            (incomingAppearance.subtitleColor as string) ||
            (incomingContent.subtitleColor as string),
        ) || "";
      merged.buttonColor =
        sanitizeColor(
          (merged.buttonColor as string) ||
            (incomingAppearance.buttonColor as string) ||
            (incomingContent.buttonColor as string),
        ) || "";
      merged.buttonTextColor =
        sanitizeColor(
          (merged.buttonTextColor as string) ||
            (incomingAppearance.buttonTextColor as string) ||
            (incomingContent.buttonTextColor as string),
        ) || "";
      merged.cardBgColor =
        sanitizeColor(
          (merged.cardBgColor as string) ||
            (incomingAppearance.cardBgColor as string) ||
            (incomingAppearance.cardBackgroundColor as string) ||
            (incomingContent.cardBgColor as string),
        ) || "";

      if (merged.appearance) {
        merged.appearance = {
          ...merged.appearance,
          backgroundColor: merged.bgColor,
          cardBgColor: merged.cardBgColor,
        };
      }

      return merged;
    },
    [],
  );

  // Sincronização com os dados vindos do StudioContext (Banco de Dados)
  useEffect(() => {
    if (studio?.config) {
      const config = studio.config as unknown as SiteConfigData;
      if (config.visibleSections) {
        setVisibleSections(config.visibleSections);
      }

      if (config.pageVisibility) {
        if (config.pageVisibility.galeria === false && !isPreview) {
          setIsVisible(false);
          router.push("/");
        } else {
          setIsVisible(true);
        }
      }

      const pageGallery = config.galleryPageSettings as
        | Record<string, unknown>
        | undefined;
      if (pageGallery) {
        setGallerySettings(sanitizeGallerySettings(pageGallery));
      }
    }
  }, [studio, isPreview, router, sanitizeGallerySettings]);

  useEffect(() => {
    if (!studio?.config) {
      setGallerySettings(getGalleryPageSettings());
    }
  }, [studio?.config]);

  useEffect(() => {
    setIsolatedSection(initialOnly || null);
  }, [initialOnly]);

  useEffect(() => {
    // Verificar visibilidade
    const checkVisibility = (visibility: Record<string, boolean>) => {
      // Se estiver em modo preview, não redirecionamos mesmo que a página esteja desativada
      if (visibility.galeria === false && !isPreview) {
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
        checkVisibility(event.data.settings || {});
      }
      if (event.data?.type === "UPDATE_VISIBLE_SECTIONS") {
        setVisibleSections(event.data.settings || {});
      }
      if (
        (event.data?.type === "UPDATE_GALLERY_PAGE" ||
          event.data?.type === "UPDATE_GALLERY_PAGE_SETTINGS") &&
        event.data.settings
      ) {
        setGallerySettings(
          sanitizeGallerySettings(event.data.settings as Record<string, unknown>),
        );
      }
      if (event.data?.type === "UPDATE_SITE_DATA" && event.data.data) {
        const siteData = event.data.data as Record<string, unknown>;
        const configGallery = siteData.galleryPageSettings as
          | Record<string, unknown>
          | undefined;
        if (configGallery) {
          setGallerySettings(sanitizeGallerySettings(configGallery));
        }
      }
      if (event.data?.type === "SET_ISOLATED_SECTION") {
        setIsolatedSection(event.data.sectionId);
      }
    };

    const handleSectionsUpdate = () => {
      setVisibleSections(getVisibleSections());
    };
    const handleGalleryPageSettingsUpdate = () => {
      setGallerySettings(getGalleryPageSettings());
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("visibleSectionsUpdated", handleSectionsUpdate);
    window.addEventListener(
      "galleryPageSettingsUpdated",
      handleGalleryPageSettingsUpdate,
    );

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(
        "visibleSectionsUpdated",
        handleSectionsUpdate,
      );
      window.removeEventListener(
        "galleryPageSettingsUpdated",
        handleGalleryPageSettingsUpdate,
      );
    };
  }, [router, isPreview, sanitizeGallerySettings]);

  if (isVisible === false) return null;
  if (isVisible === null) return null; // Loading state

  const isSectionVisible = (id: string) => {
    if (isolatedSection) return isolatedSection === id;
    return visibleSections[id] !== false;
  };

  const background =
    gallerySettings?.appearance?.backgroundColor ||
    gallerySettings?.bgColor ||
    "transparent";

  return (
    <main>
      {isSectionVisible(SECTION_IDS.pageGallery) && (
        <section 
          className="relative py-20 md:py-32 overflow-hidden"
          style={{
            backgroundColor: background,
          }}
        >
          <SectionBackground settings={gallerySettings as SectionBackgroundSettings} />

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
                  fontFamily:
                    gallerySettings.subtitleFont || "var(--font-body)",
                  color: gallerySettings.subtitleColor || "var(--text)",
                  opacity: gallerySettings.subtitleColor ? 1 : 0.8,
                }}
              >
                {gallerySettings.subtitle}
              </p>
            </div>

            <GalleryGrid settings={gallerySettings} />
          </div>
        </section>
      )}
    </main>
  );
}
