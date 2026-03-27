"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  defaultGallerySettings,
  type GallerySettings,
  getPageVisibility,
  normalizePayload,
  SECTION_IDS,
  sanitizeColor,
} from "@/lib/booking-data";
import { type GalleryItem, galleryService } from "@/lib/gallery-service";
import { cn, renderSafeText } from "@/lib/utils";
import {
  SectionBackground,
  type SectionBackgroundSettings,
} from "./admin/site_editor/components/SectionBackground";
import type { SiteConfigData } from "./admin/site_editor/hooks/use-site-editor";

const MOCK_GALLERY: GalleryItem[] = [
  {
    id: "mock-gallery-1",
    imageUrl: "/professional-eyebrow-artist-at-work.jpg",
    title: "Design de Sobrancelhas",
    category: "Sobrancelhas",
    showInHome: true,
    order: 1,
    businessId: "mock",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "mock-gallery-2",
    imageUrl: "/elegant-eyebrow-studio-interior-with-soft-lighting.jpg",
    title: "Estúdio Premium",
    category: "Ambiente",
    showInHome: true,
    order: 2,
    businessId: "mock",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "mock-gallery-3",
    imageUrl: "/beauty-salon-professional-workspace.jpg",
    title: "Resultados Naturais",
    category: "Resultados",
    showInHome: true,
    order: 3,
    businessId: "mock",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

export function GalleryPreview() {
  const { studio } = useStudio();
  const [isMounted, setIsMounted] = useState(false);
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadingRef = useRef(false);
  const lastFetchRef = useRef(0);
  const imagesRef = useRef<GalleryItem[]>([]);

  const [settings, setSettings] = useState<GallerySettings | null>(null);
  const settingsRef = useRef<GallerySettings | null>(null);

  // Sincroniza o ref sempre que o state mudar
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
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
  const settingsKey = useMemo(() => {
    if (!settings) return "gallery-preview";
    return JSON.stringify({
      title: settings.title,
      subtitle: settings.subtitle,
      bgType: settings.bgType,
      bgColor: settings.bgColor,
      bgImage: settings.bgImage,
      layout: settings.layout,
      titleColor: settings.titleColor,
      subtitleColor: settings.subtitleColor,
      buttonColor: settings.buttonColor,
      buttonTextColor: settings.buttonTextColor,
      cardBgColor: settings.cardBgColor,
    });
  }, [settings]);

  const normalizeGallerySettings = useCallback(
    (configGallery: Record<string, unknown>): GallerySettings => {
      const content = (configGallery.content as Record<string, unknown>) || {};
      const appearance =
        (configGallery.appearance as Record<string, unknown>) || {};
      return {
        ...configGallery,
        ...content,
        ...appearance,
        title: (content.title as string) ?? (configGallery.title as string),
        subtitle:
          (content.subtitle as string) ?? (configGallery.subtitle as string),
        titleColor: sanitizeColor(
          (configGallery.titleColor as string) ||
            (appearance.titleColor as string) ||
            (content.titleColor as string),
        ),
        subtitleColor: sanitizeColor(
          (configGallery.subtitleColor as string) ||
            (appearance.subtitleColor as string) ||
            (content.subtitleColor as string),
        ),
        titleFont:
          (configGallery.titleFont as string) ||
          (appearance.titleFont as string) ||
          (content.titleFont as string),
        subtitleFont:
          (configGallery.subtitleFont as string) ||
          (appearance.subtitleFont as string) ||
          (content.subtitleFont as string),
        buttonColor: sanitizeColor(
          (configGallery.buttonColor as string) ||
            (appearance.buttonColor as string) ||
            (content.buttonColor as string),
        ),
        buttonTextColor: sanitizeColor(
          (configGallery.buttonTextColor as string) ||
            (appearance.buttonTextColor as string) ||
            (content.buttonTextColor as string),
        ),
        buttonLink:
          (content.buttonLink as string) ||
          (configGallery.buttonLink as string) ||
          "",
        bgImage:
          (configGallery.bgImage as string) ||
          (appearance.backgroundImageUrl as string) ||
          "",
        bgColor: sanitizeColor(
          (appearance.backgroundColor as string) ||
            (configGallery.bgColor as string) ||
            (configGallery.backgroundColor as string) ||
            "",
        ),
        cardBgColor: sanitizeColor(
          (configGallery.cardBgColor as string) ||
            (configGallery.cardBackgroundColor as string) ||
            (configGallery.card_background_color as string) ||
            ((configGallery.cardConfig as Record<string, unknown>)
              ?.cardBackgroundColor as string) ||
            ((configGallery.cardConfig as Record<string, unknown>)
              ?.backgroundColor as string) ||
            (appearance.cardBgColor as string) ||
            (content.cardBgColor as string),
        ),
      } as GallerySettings;
    },
    [],
  );

  const getConfigGallery = useCallback(
    (config?: Record<string, unknown> | null) => {
      if (!config) return undefined;
      const normalized = normalizePayload(config as SiteConfigData);
      return normalized.sections?.[SECTION_IDS.homeGallery] as
        | Record<string, unknown>
        | undefined;
    },
    [],
  );

  const loadData = useCallback(
    async (force = false) => {
      const now = Date.now();
      // Evita chamadas simultâneas ou muito próximas (menos de 1s entre elas)
      // a menos que seja forçado (ex: clique manual ou salvamento)
      if (loadingRef.current) return;
      if (
        !force &&
        now - lastFetchRef.current < 1000 &&
        imagesRef.current.length > 0
      )
        return;

      loadingRef.current = true;
      lastFetchRef.current = now;
      // Removido setIsLoading(true) para evitar flicker no preview
      // Só mostramos loading no primeiro carregamento real (fora do preview)
      const isPreviewMode =
        typeof window !== "undefined" &&
        window.location.search.includes("preview=true");

      if (!isPreviewMode) {
        setIsLoading(true);
      }

      // PRIORIDADE: Modo Preview (estado injetado pelo editor) > Banco de Dados
      if (isPreviewMode) {
        if (!settingsRef.current) {
          const configGallery = getConfigGallery(
            studio?.config as Record<string, unknown> | null,
          );
          if (configGallery) {
            setSettings(normalizeGallerySettings(configGallery));
          } else {
            setSettings(normalizeGallerySettings(defaultGallerySettings));
          }
        }
        setPageVisibility(getPageVisibility());
        setImages(MOCK_GALLERY);
        imagesRef.current = MOCK_GALLERY;
        loadingRef.current = false;
        setIsLoading(false);
        return;
      }

      // Carrega configurações do Banco de Dados
      let currentConfig: SiteConfigData | null = null;

      try {
        if (studio?.id) {
          currentConfig = studio.config as SiteConfigData;

          // Busca imagens da nova API
          try {
            // Buscamos todas as imagens e filtramos localmente para garantir robustez,
            // já que o filtro showInHome na API pode variar entre implementações.
            const allImages = await galleryService.getPublicGallery(studio.id);
            console.log(
              ">>> [GALLERY_SYNC] Total de imagens na galeria:",
              allImages?.length || 0,
            );

            const homeImages = Array.isArray(allImages)
              ? allImages.filter((img) => {
                  const item = img as GalleryItem & {
                    show_in_home?: boolean;
                    showOnHome?: boolean;
                  };
                  return (
                    item.showInHome || item.show_in_home || item.showOnHome
                  );
                })
              : [];

            console.log(
              ">>> [GALLERY_SYNC] Imagens marcadas para Home:",
              homeImages.length,
            );
            const finalImages = homeImages.slice(0, 6);
            setImages(finalImages);
            imagesRef.current = finalImages;
          } catch (error) {
            console.warn(
              ">>> [SITE_WARN] Erro ao carregar galeria via API",
              error,
            );
            setImages([]);
            imagesRef.current = [];
          }
        } else {
          const cachedStudioStr = localStorage.getItem("studio_data");
          if (cachedStudioStr) {
            try {
              const parsed = JSON.parse(cachedStudioStr);
              currentConfig = parsed.config;

              if (parsed.id) {
                const allImages = await galleryService.getPublicGallery(
                  parsed.id,
                );
                const homeImages = Array.isArray(allImages)
                  ? allImages.filter((img) => {
                      const item = img as GalleryItem & {
                        show_in_home?: boolean;
                        showOnHome?: boolean;
                      };
                      return (
                        item.showInHome || item.show_in_home || item.showOnHome
                      );
                    })
                  : [];
                const finalImages = homeImages.slice(0, 6);
                setImages(finalImages);
                imagesRef.current = finalImages;
              }
            } catch (e) {
              console.error(
                ">>> [GALLERY_ERROR] Erro ao parsear studio_data do cache",
                e,
              );
              setImages([]);
              imagesRef.current = [];
            }
          }
        }

        const configGallery = getConfigGallery(
          currentConfig as Record<string, unknown> | null,
        );
        setSettings(
          configGallery
            ? normalizeGallerySettings(configGallery)
            : normalizeGallerySettings(defaultGallerySettings),
        );

        setPageVisibility(getPageVisibility());
      } catch (error) {
        console.error(
          ">>> [GALLERY_ERROR] Erro geral ao carregar dados:",
          error,
        );
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [getConfigGallery, normalizeGallerySettings, studio?.id, studio?.config],
  );

  useEffect(() => {
    setIsMounted(true);
    const isPreview =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=true");

    loadData();

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (
        (event.data.type === "UPDATE_GALLERY_PREVIEW" ||
          event.data.type === "UPDATE_GALLERY_SETTINGS") &&
        event.data.settings
      ) {
        const incoming = event.data.settings as
          | Record<string, unknown>
          | undefined;
        if (incoming) {
          const incomingAppearance =
            (incoming.appearance as Record<string, unknown>) || {};
          const incomingContent =
            (incoming.content as Record<string, unknown>) || {};

          const sanitized = {
            ...incoming,
            bgColor:
              sanitizeColor(
                (incoming.bgColor as string) ||
                  (incomingAppearance.backgroundColor as string),
              ) || "",
            titleColor:
              sanitizeColor(
                (incoming.titleColor as string) ||
                  (incomingAppearance.titleColor as string) ||
                  (incomingContent.titleColor as string),
              ) || "",
            subtitleColor:
              sanitizeColor(
                (incoming.subtitleColor as string) ||
                  (incomingAppearance.subtitleColor as string) ||
                  (incomingContent.subtitleColor as string),
              ) || "",
            buttonColor:
              sanitizeColor(
                (incoming.buttonColor as string) ||
                  (incomingAppearance.buttonColor as string) ||
                  (incomingContent.buttonColor as string),
              ) || "",
            buttonTextColor:
              sanitizeColor(
                (incoming.buttonTextColor as string) ||
                  (incomingAppearance.buttonTextColor as string) ||
                  (incomingContent.buttonTextColor as string),
              ) || "",
            cardBgColor:
              sanitizeColor(
                (incoming.cardBgColor as string) ||
                  (incomingAppearance.cardBgColor as string) ||
                  (incomingAppearance.cardBackgroundColor as string) ||
                  (incomingContent.cardBgColor as string),
              ) || "",
          };

          setSettings((prev) =>
            prev
              ? {
                  ...prev,
                  ...sanitized,
                }
              : {
                  ...(sanitized as GallerySettings),
                },
          );
        }
        return;
      }

      if (event.data.type === "UPDATE_SITE_DATA" && event.data.data) {
        if (isPreview && settingsRef.current) {
          return;
        }
        const siteData = normalizePayload(
          event.data.data as Record<string, unknown>,
        ) as Record<string, unknown>;
        const configGallery = getConfigGallery(siteData);
        if (configGallery) {
          setSettings(normalizeGallerySettings(configGallery));
        }
      }

      // 2. Refresh forçado apenas quando necessário
      if (
        event.data.type === "REFRESH_GALLERY" ||
        (isPreview && event.data.type === "DataReady")
      ) {
        console.log(
          ">>> [GALLERY_PREVIEW] Refresh requested via:",
          event.data.type,
        );
        if (isPreview) {
          // Se for DataReady no preview, NÃO chamamos loadData se já temos configurações,
          // pois isso causaria o reset/flicker. O HeroSection bloqueia isso.
          if (event.data.type === "DataReady" && settingsRef.current) {
            console.log(
              "[GALLERY_SYNC] Modo Preview detectado. Bloqueando sobreposição pelo banco.",
            );
            return;
          }
          loadData(true);
        }
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === "gallery-preview"
      ) {
        setHighlightedElement("gallery-preview");
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    const refreshGallery = () => loadData(true);
    const updateVisibility = () => setPageVisibility(getPageVisibility());

    window.addEventListener("message", handleMessage);
    window.addEventListener("pageVisibilityUpdated", updateVisibility);
    window.addEventListener("galleryUpdated", refreshGallery);
    window.addEventListener("gallerySettingsUpdated", refreshGallery);

    // Só ouve o DataReady se estiver em modo preview
    if (isPreview) {
      window.addEventListener("DataReady", refreshGallery);
    }

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("pageVisibilityUpdated", updateVisibility);
      window.removeEventListener("galleryUpdated", refreshGallery);
      window.removeEventListener("gallerySettingsUpdated", refreshGallery);
      if (isPreview) {
        window.removeEventListener("DataReady", refreshGallery);
      }
    };
  }, [getConfigGallery, loadData, normalizeGallerySettings]);

  if (!isMounted) return null;

  // Se não houver configurações, retornamos o esqueleto enquanto aguardamos o StudioProvider
  if (!settings) {
    return (
      <section className="py-20 md:py-32 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (pageVisibility.galeria === false) return null;

  const isPreview =
    typeof window !== "undefined" &&
    window.location.search.includes("preview=true");

  // Se estiver carregando, mostra um estado de esqueleto para evitar saltos de layout
  if (isLoading) {
    return (
      <section className="py-20 md:py-32 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded-lg" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mt-16">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Só esconde a seção se NÃO estiver no preview do editor E (não estiver carregando E não tiver imagens)
  if (!isPreview && !isLoading && (!images || images.length === 0)) {
    return null;
  }

  const background =
    settings?.appearance?.backgroundColor ||
    settings?.bgColor ||
    "transparent";

  return (
    <section
      key={settingsKey}
      id="gallery-preview"
      className={cn(
        "py-20 md:py-32 relative overflow-hidden transition-all duration-500",
        highlightedElement === "gallery-preview" &&
          "ring-4 ring-primary ring-inset z-50",
      )}
      style={{
        backgroundColor: background,
      }}
    >
      <SectionBackground settings={settings as SectionBackgroundSettings} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-balance transition-all duration-300"
            style={{
              fontFamily: settings?.titleFont || "var(--font-title)",
              color: settings?.titleColor || "var(--foreground)",
            }}
          >
            {renderSafeText(settings?.title)}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto text-pretty leading-relaxed transition-all duration-300"
            style={{
              fontFamily: settings?.subtitleFont || "var(--font-subtitle)",
              color: settings?.subtitleColor || "var(--foreground)",
            }}
          >
            {renderSafeText(settings?.subtitle)}
          </p>
        </div>

        {images?.length > 0 ? (
          settings?.layout === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {images?.map((image) => (
                <div
                  key={image?.id}
                  className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform relative"
                  style={{
                    backgroundColor: settings.cardBgColor || "transparent",
                  }}
                >
                  <Image
                    src={image?.imageUrl || ""}
                    alt={renderSafeText(image?.title) || ""}
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
                      <div
                        className="aspect-square rounded-lg overflow-hidden relative group"
                        style={{
                          backgroundColor:
                            settings.cardBgColor || "transparent",
                        }}
                      >
                        <Image
                          src={image?.imageUrl || ""}
                          alt={renderSafeText(image?.title) || ""}
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

        <div className="mt-12 text-center">
          <Button
            asChild
            size="lg"
            className="px-8 h-12 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            style={{
              fontFamily: settings.buttonFont || "var(--font-body)",
              backgroundColor: settings.buttonColor || "var(--primary)",
              color: settings.buttonTextColor || "#ffffff",
            }}
          >
            <Link href={settings.buttonLink || "/galeria"}>
              {renderSafeText(settings.buttonText) || "Ver Galeria Completa"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
