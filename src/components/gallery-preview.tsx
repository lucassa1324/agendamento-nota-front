"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getPageVisibility, getGalleryImages, type GalleryImage as GalleryImageType } from "@/lib/booking-data";

export function GalleryPreview() {
  const [isMounted, setIsMounted] = useState(false);
  const [images, setImages] = useState<GalleryImageType[]>([]);
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(
    {
      inicio: true,
      galeria: true,
      sobre: true,
      agendar: true,
    },
  );

  useEffect(() => {
    setIsMounted(true);
    setPageVisibility(getPageVisibility());
    
    const loadImages = () => {
      const allImages = getGalleryImages();
      setImages(allImages.filter(img => img.showOnHome).slice(0, 6));
    };
    
    loadImages();

    const handleVisibilityUpdate = () => {
      setPageVisibility(getPageVisibility());
    };

    window.addEventListener("pageVisibilityUpdated", handleVisibilityUpdate);
    window.addEventListener("galleryUpdated", loadImages);

    return () => {
      window.removeEventListener(
        "pageVisibilityUpdated",
        handleVisibilityUpdate,
      );
      window.removeEventListener("galleryUpdated", loadImages);
    };
  }, []);

  if (!isMounted) return null;
  if (pageVisibility.galeria === false) return null;

  return (
    <section id="gallery-preview" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-balance">
            Nossos Trabalhos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Veja alguns dos resultados incríveis que alcançamos com nossas
            clientes
          </p>
        </div>

        {images.length > 0 ? (
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
