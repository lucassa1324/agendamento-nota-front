"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useStudio } from "@/context/studio-context";
import {
  type GalleryImage as GalleryImageType,
  type GallerySettings,
  getGallerySettings,
  getPageVisibility,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";
import type { SiteConfigData } from "./admin/site_editor/hooks/use-site-editor";

export function GalleryPreview() {
  const { studio } = useStudio();
  const [isMounted, setIsMounted] = useState(false);
  const [images, setImages] = useState<GalleryImageType[]>([]);
  const [settings, setSettings] = useState<GallerySettings | null>(null);
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(
    {
      inicio: true,
      galeria: true,
      sobre: true,
      agendar: true,
    },
  );
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const loadData = useCallback(() => {
    // Tenta pegar do cache primeiro para ser instantâneo
    const cachedStudioStr = localStorage.getItem("studio_data");
    let currentImages: GalleryImageType[] = [];
    let currentConfig: SiteConfigData | null = null;
    
    if (studio) {
      currentImages = studio.gallery || [];
      currentConfig = studio.config as SiteConfigData;
    } else if (cachedStudioStr) {
      try {
        const parsed = JSON.parse(cachedStudioStr);
        currentImages = parsed.gallery || [];
        currentConfig = parsed.config;
      } catch (e) {
        console.warn(">>> [SITE_WARN] Erro ao parsear studio_data do cache", e);
      }
    }

    // Filtra apenas as imagens marcadas para home
    const homeImages = currentImages.filter((img) => img.showOnHome).slice(0, 6);
    
    console.log(">>> [GALLERY_SYNC] Imagens na Home:", homeImages.length);
    setImages(homeImages);

    const layoutGlobal = currentConfig?.layoutGlobal || currentConfig?.layout_global;
    const configGallery = currentConfig?.gallery || layoutGlobal?.gallery;
    setSettings((configGallery as GallerySettings) || getGallerySettings());
    
    setPageVisibility(getPageVisibility());
  }, [studio]);

  useEffect(() => {
    setIsMounted(true);
    loadData();

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_GALLERY_SETTINGS") {
        setSettings((prev) =>
          prev ? { ...prev, ...event.data.settings } : prev,
        );
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === "gallery-preview"
      ) {
        setHighlightedElement("gallery-preview");
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("pageVisibilityUpdated", () => setPageVisibility(getPageVisibility()));
    window.addEventListener("galleryUpdated", loadData);
    window.addEventListener("gallerySettingsUpdated", loadData);
    window.addEventListener("DataReady", loadData);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("pageVisibilityUpdated", () => setPageVisibility(getPageVisibility()));
      window.removeEventListener("galleryUpdated", loadData);
      window.removeEventListener("gallerySettingsUpdated", loadData);
      window.removeEventListener("DataReady", loadData);
    };
  }, [loadData]);

  if (!isMounted || !settings) return null;
  if (pageVisibility.galeria === false) return null;
  
  // Se não houver imagens marcadas para home, a seção deve sumir
  // No editor, permitimos renderizar para edição
  const isPreview = typeof window !== "undefined" && window.location.search.includes("preview=true");
  if (!isPreview && (!images || images.length === 0)) return null;

  return (
    <section
      id="gallery-preview"
      className={cn(
        "py-20 md:py-32 relative overflow-hidden transition-all duration-500",
        highlightedElement === "gallery-preview" &&
          "ring-4 ring-primary ring-inset z-50",
      )}
    >
      <SectionBackground settings={settings} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-balance transition-all duration-300"
            style={{
              fontFamily: settings?.titleFont || "var(--font-title)",
              color: settings?.titleColor || "var(--foreground)",
            }}
          >
            {settings?.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto text-pretty leading-relaxed transition-all duration-300"
            style={{
              fontFamily: settings?.subtitleFont || "var(--font-subtitle)",
              color: settings?.subtitleColor || "var(--foreground)",
            }}
          >
            {settings?.subtitle}
          </p>
        </div>

        {images?.length > 0 ? (
          settings?.layout === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {images?.map((image) => (
                <div
                  key={image?.id}
                  className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform relative"
                >
                  <Image
                    src={image?.url || ""}
                    alt={image?.title || ""}
                    fill
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 md:px-12 mb-8">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {images?.map((image) => (
                    <CarouselItem
                      key={image?.id}
                      className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden relative group">
                        <Image
                          src={image?.url || ""}
                          alt={image?.title || ""}
                          fill
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious className="-left-6 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all" />
                  <CarouselNext className="-right-6 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all" />
                </div>
              </Carousel>
            </div>
          )
        ) : (
          <div className="text-center py-10 text-muted-foreground italic">
            Nenhum trabalho em destaque no momento.
          </div>
        )}

        <div className="text-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            style={{
              borderColor: settings.buttonColor || "var(--primary)",
              backgroundColor: settings.buttonColor ? "transparent" : undefined,
              color:
                settings.buttonTextColor ||
                settings.buttonColor ||
                "var(--primary)",
              fontFamily: settings.buttonFont || "var(--font-body)",
            }}
          >
            <Link href="/galeria">
              {settings.buttonText || "Ver Galeria Completa"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
