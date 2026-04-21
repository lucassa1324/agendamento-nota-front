"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageModal } from "@/components/image-modal";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/context/studio-context";
import {
  defaultGallerySettings,
  type GallerySettings,
  normalizePayload,
  SECTION_IDS,
  sanitizeColor,
} from "@/lib/booking-data";
import { type GalleryItem, galleryService } from "@/lib/gallery-service";

interface Service {
  name: string;
}

interface GalleryGridProps {
  settings?: GallerySettings;
}

export function GalleryGrid({ settings: propsSettings }: GalleryGridProps) {
  const { studio } = useStudio();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(
    [],
  );
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  const [settings, setSettings] = useState<GallerySettings>(
    propsSettings || defaultGallerySettings,
  );
  const [isInsideIframe, setIsInsideIframe] = useState(false);
  const hasLivePreviewUpdateRef = useRef(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Detectar se está dentro de um iframe
  useEffect(() => {
    setIsInsideIframe(window.self !== window.top);
  }, []);

  const loadData = useCallback(async () => {
    if (loadingRef.current) return; // Evita chamadas paralelas

    loadingRef.current = true;
    setIsLoading(true);
    try {
      // Se tivermos dados do studio via context (multi-tenant), usamos eles
      if (studio?.id) {
        const allImages = await galleryService.getPublicGallery(studio.id);
        const allServices = studio.services || [];

        setImages(allImages);

        const servicesWithImages = allServices.filter((service) =>
          allImages.some((img) => img.category === service.name),
        );

        const dynamicCategories = [
          { id: "todos", label: "Todos" },
          ...servicesWithImages.map((s) => ({ id: s.name, label: s.name })),
        ];
        setCategories(dynamicCategories);

        // Atualizar settings do studio se não foram passadas via props
        if (!propsSettings && studio.config) {
          const normalized = normalizePayload(
            studio.config as Record<string, unknown>,
          );
          const pageGallery = (normalized.sections?.[SECTION_IDS.pageGallery] ||
            normalized.sections?.[SECTION_IDS.homeGallery]) as Record<
            string,
            unknown
          >;
          if (pageGallery) {
            const safePageGallery =
              typeof pageGallery === "object" &&
              pageGallery !== null &&
              !Array.isArray(pageGallery)
                ? (pageGallery as Record<string, unknown>)
                : {};

            const appearance =
              (safePageGallery.appearance as Record<string, unknown>) || {};
            const resolvedBgColor =
              sanitizeColor(
                (safePageGallery.bgColor as string) ||
                  (safePageGallery.backgroundColor as string) ||
                  (safePageGallery.bg_color as string) ||
                  (safePageGallery.background_color as string) ||
                  (appearance.backgroundColor as string) ||
                  (appearance.bgColor as string),
              ) || "";

            const resolvedCardBgColor =
              sanitizeColor(
                (safePageGallery.cardBgColor as string) ||
                  (safePageGallery.cardBackgroundColor as string) ||
                  (safePageGallery.card_background_color as string) ||
                  (safePageGallery.card_bg_color as string) ||
                  (appearance.cardBgColor as string) ||
                  (appearance.cardBackgroundColor as string),
              ) || "";

            setSettings({
              ...defaultGallerySettings,
              ...(safePageGallery as unknown as GallerySettings),
              bgColor: resolvedBgColor,
              cardBgColor: resolvedCardBgColor,
              buttonColor:
                sanitizeColor(
                  (safePageGallery.buttonColor as string) ||
                    (appearance.buttonColor as string),
                ) || "",
              buttonTextColor:
                sanitizeColor(
                  (safePageGallery.buttonTextColor as string) ||
                    (appearance.buttonTextColor as string),
                ) || "",
            });
          }
        }
        return;
      }

      // Fallback para cache se studio ainda não carregou
      const cachedStudioStr = localStorage.getItem("studio_data");
      if (cachedStudioStr) {
        const parsed = JSON.parse(cachedStudioStr);
        if (parsed.id) {
          const allImages = await galleryService.getPublicGallery(parsed.id);
          setImages(allImages);

          const allServices = (parsed.services || []) as Service[];
          const dynamicCategories = [
            { id: "todos", label: "Todos" },
            ...allServices.map((s) => ({ id: s.name, label: s.name })),
          ];
          setCategories(dynamicCategories);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar galeria:", error);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [studio?.id, studio?.services, studio?.config, propsSettings]);

  // Listener para mensagens do editor (Live Preview)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type) {
        console.log(
          ">>> [RECEIVE_POST_MESSAGE]",
          event.data.type,
          event.data.settings || event.data.payload,
        );
      }

      const applyGallerySettings = (sectionData: Record<string, unknown>) => {
        hasLivePreviewUpdateRef.current = true;
        const safeSectionData =
          typeof sectionData === "object" &&
          sectionData !== null &&
          !Array.isArray(sectionData)
            ? sectionData
            : {};

        const appearance =
          (safeSectionData.appearance as Record<string, unknown>) || {};

        const resolvedBgColor =
          sanitizeColor(
            (safeSectionData.bgColor as string) ||
              (safeSectionData.backgroundColor as string) ||
              (safeSectionData.bg_color as string) ||
              (safeSectionData.background_color as string) ||
              (appearance.backgroundColor as string) ||
              (appearance.bgColor as string),
          ) || "";

        const resolvedCardBgColor =
          sanitizeColor(
            (safeSectionData.cardBgColor as string) ||
              (safeSectionData.cardBackgroundColor as string) ||
              (safeSectionData.card_background_color as string) ||
              (safeSectionData.card_bg_color as string) ||
              (appearance.cardBgColor as string) ||
              (appearance.cardBackgroundColor as string),
          ) || "";

        setSettings({
          ...defaultGallerySettings,
          ...(safeSectionData as unknown as GallerySettings),
          bgColor: resolvedBgColor,
          cardBgColor: resolvedCardBgColor,
          buttonColor:
            sanitizeColor(
              (safeSectionData.buttonColor as string) ||
                (appearance.buttonColor as string),
            ) || "",
          buttonTextColor:
            sanitizeColor(
              (safeSectionData.buttonTextColor as string) ||
                (appearance.buttonTextColor as string),
            ) || "",
        });
      };

      if (
        event.data.type === "UPDATE_GALLERY_PAGE" ||
        event.data.type === "UPDATE_GALLERY_PAGE_SETTINGS" ||
        event.data.type === "UPDATE_GALLERY_SETTINGS" ||
        event.data.type === "UPDATE_GALLERY_PREVIEW"
      ) {
        const directSettings = event.data.settings as
          | Record<string, unknown>
          | undefined;
        if (directSettings) {
          applyGallerySettings(directSettings);
        }
        return;
      }

      if (
        event.data.type === "UPDATE_SITE_DATA" ||
        event.data.type === "UPDATE_SITE_CONFIG"
      ) {
        const config = event.data.config || event.data.data;
        if (config) {
          const normalized = normalizePayload(config);
          const sectionData = (normalized.sections?.[SECTION_IDS.pageGallery] ||
            normalized.sections?.[SECTION_IDS.homeGallery]) as
            | Record<string, unknown>
            | undefined;

          if (sectionData) {
            applyGallerySettings(sectionData);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener("galleryUpdated", loadData);
    window.addEventListener("studioSettingsUpdated", loadData);
    window.addEventListener("servicesUpdated", loadData);

    return () => {
      window.removeEventListener("galleryUpdated", loadData);
      window.removeEventListener("studioSettingsUpdated", loadData);
      window.removeEventListener("servicesUpdated", loadData);
    };
  }, [loadData, isInsideIframe]);

  const filteredImages =
    selectedCategory === "todos"
      ? images
      : images.filter((img) => img.category === selectedCategory);

  const background =
    sanitizeColor(
      settings.bgColor ||
        (settings as unknown as Record<string, unknown>).backgroundColor ||
        (settings as unknown as Record<string, unknown>).bg_color ||
        (settings as unknown as Record<string, unknown>).background_color ||
        (
          (settings as unknown as Record<string, unknown>).appearance as
            | Record<string, unknown>
            | undefined
        )?.backgroundColor ||
        (
          (settings as unknown as Record<string, unknown>).appearance as
            | Record<string, unknown>
            | undefined
        )?.bgColor,
    ) || "transparent";

  return (
    <div
      id="gallery-grid"
      style={{
        backgroundColor: background,
      }}
    >
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            style={{
              backgroundColor:
                selectedCategory === category.id
                  ? settings.buttonColor || "var(--primary)"
                  : "transparent",
              color:
                selectedCategory === category.id
                  ? settings.buttonTextColor || "white"
                  : "var(--foreground)",
              borderColor:
                selectedCategory === category.id
                  ? settings.buttonColor || "var(--primary)"
                  : "var(--border)",
              fontFamily: "var(--font-body)",
            }}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {/* Gallery Grid */}
      {!isLoading && filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <button
              key={image.id}
              type="button"
              className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform text-left w-full border-none p-0"
              onClick={() => setSelectedImage(image)}
            >
              <div className="w-full h-full relative bg-secondary/20 flex items-center justify-center">
                {imageErrors[image.id] ? (
                  <div className="flex flex-col items-center p-4 text-center">
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Imagem indisponível
                    </p>
                  </div>
                ) : (
                  <Image
                    src={image.imageUrl}
                    alt={image.title || ""}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(image.id)}
                    unoptimized
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white font-medium">
                  {image.title || "Sem título"}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-20 bg-secondary/10 rounded-xl border border-dashed">
            <p className="text-muted-foreground">
              {selectedCategory === "todos"
                ? "Nenhuma imagem na galeria ainda."
                : `Nenhuma imagem encontrada para a categoria "${selectedCategory}".`}
            </p>
          </div>
        )
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={{
            ...selectedImage,
            url: selectedImage.imageUrl,
            title: selectedImage.title || "Sem título",
            category: selectedImage.category || "Geral",
          }}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
