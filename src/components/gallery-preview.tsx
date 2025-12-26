"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getPageVisibility, getGalleryImages, getGallerySettings, type GalleryImage as GalleryImageType, type GallerySettings } from "@/lib/booking-data";

export function GalleryPreview() {
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

  useEffect(() => {
    setIsMounted(true);
    setPageVisibility(getPageVisibility());
    setSettings(getGallerySettings());

    const loadImages = () => {
      const allImages = getGalleryImages();
      setImages(allImages.filter((img) => img.showOnHome).slice(0, 6));
    };

    const loadSettings = () => {
      setSettings(getGallerySettings());
    };

    loadImages();

    const handleVisibilityUpdate = () => {
      setPageVisibility(getPageVisibility());
    };

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
    window.addEventListener("pageVisibilityUpdated", handleVisibilityUpdate);
    window.addEventListener("galleryUpdated", loadImages);
    window.addEventListener("gallerySettingsUpdated", loadSettings);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(
        "pageVisibilityUpdated",
        handleVisibilityUpdate,
      );
      window.removeEventListener("galleryUpdated", loadImages);
      window.removeEventListener("gallerySettingsUpdated", loadSettings);
    };
  }, []);

  if (!isMounted || !settings) return null;
  if (pageVisibility.galeria === false) return null;

  return (
    <section
      id="gallery-preview"
      className={cn(
        "py-20 md:py-32 relative overflow-hidden transition-all duration-500",
        highlightedElement === "gallery-preview" &&
          "ring-4 ring-primary ring-inset z-50",
      )}
    >
      {/* Background Color Layer */}
      <div
        className="absolute inset-0 z-0 transition-colors duration-500"
        style={{
          backgroundColor:
            settings.bgType === "color"
              ? settings.bgColor || "transparent"
              : "transparent",
        }}
      />

      {/* Background Image Layer */}
      {settings.bgType === "image" && settings.bgImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={settings.bgImage}
            alt="Background"
            fill
            className="object-cover"
            style={{
              opacity: settings.imageOpacity,
              transform: `scale(${settings.imageScale || 1})`,
              objectPosition: `${settings.imageX || 50}% ${settings.imageY || 50}%`,
            }}
          />
        </div>
      )}

      {/* Overlay/Gradient Layer */}
      <div
        className="absolute inset-0 z-0 bg-linear-to-b from-black/20 via-black/50 to-black transition-opacity duration-500 pointer-events-none"
        style={{
          opacity: settings.overlayOpacity,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-balance"
            style={{
              fontFamily: settings.titleFont,
              color: settings.titleColor || "inherit",
            }}
          >
            {settings.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto text-pretty leading-relaxed"
            style={{
              fontFamily: settings.subtitleFont,
              color: settings.subtitleColor || "var(--muted-foreground)",
            }}
          >
            {settings.subtitle}
          </p>
        </div>

        {images.length > 0 ? (
          settings.layout === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform relative"
                >
                  <Image
                    src={image.url}
                    alt={image.title}
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
                  {images.map((image) => (
                    <CarouselItem
                      key={image.id}
                      className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden relative group">
                        <Image
                          src={image.url}
                          alt={image.title}
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
          <Button asChild size="lg" variant="outline">
            <Link href="/galeria">Ver Galeria Completa</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
