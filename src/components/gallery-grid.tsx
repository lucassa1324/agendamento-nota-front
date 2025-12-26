"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageModal } from "@/components/image-modal";
import { Button } from "@/components/ui/button";
import { getGalleryImages, getServices, type GalleryImage } from "@/lib/booking-data";

export function GalleryGrid() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("todos");

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    const loadData = () => {
      const allImages = getGalleryImages();
      const allServices = getServices();
      
      setImages(allImages);
      
      const dynamicCategories = [
        { id: "todos", label: "Todos" },
        ...allServices.map(s => ({ id: s.name, label: s.name }))
      ];
      setCategories(dynamicCategories);
    };

    loadData();
    window.addEventListener("galleryUpdated", loadData);
    window.addEventListener("studioSettingsUpdated", loadData);
    window.addEventListener("servicesUpdated", loadData);

    return () => {
      window.removeEventListener("galleryUpdated", loadData);
      window.removeEventListener("studioSettingsUpdated", loadData);
      window.removeEventListener("servicesUpdated", loadData);
    };
  }, []);

  const filteredImages =
    selectedCategory === "todos"
      ? images
      : images.filter((img) => img.category === selectedCategory);

  return (
    <div id="gallery-grid">
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className={
              selectedCategory === category.id
                ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                : ""
            }
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredImages.length > 0 ? (
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
                    src={image.url}
                    alt={image.title}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(image.id)}
                    unoptimized
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white font-medium">{image.title}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/10 rounded-xl border border-dashed">
          <p className="text-muted-foreground">
            {selectedCategory === "todos" 
              ? "Nenhuma imagem na galeria ainda." 
              : `Nenhuma imagem encontrada para a categoria "${selectedCategory}".`}
          </p>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={{
            ...selectedImage,
            // O ImageModal antigo esperava id: number, mas agora é string. 
            // Vamos converter ou adaptar se necessário. 
            // O tipo GalleryImage no booking-data usa string.
            id: selectedImage.id as any 
          }}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
