"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageModal } from "@/components/image-modal";
import { Button } from "@/components/ui/button";

type GalleryImage = {
  id: number;
  query: string;
  title: string;
  category: string;
};

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    query: "professional+eyebrow+design+before+after",
    title: "Design de Sobrancelhas",
    category: "design",
  },
  {
    id: 2,
    query: "beautiful+shaped+eyebrows+close+up",
    title: "Modelagem Perfeita",
    category: "design",
  },
  {
    id: 3,
    query: "eyebrow+microblading+result",
    title: "Micropigmentação",
    category: "micropigmentacao",
  },
  {
    id: 4,
    query: "henna+eyebrow+tinting+result",
    title: "Coloração com Henna",
    category: "coloracao",
  },
  {
    id: 5,
    query: "eyebrow+lamination+before+after",
    title: "Laminação",
    category: "laminacao",
  },
  {
    id: 6,
    query: "perfect+eyebrow+shape+design",
    title: "Design Personalizado",
    category: "design",
  },
  {
    id: 7,
    query: "eyebrow+threading+result",
    title: "Depilação com Linha",
    category: "design",
  },
  {
    id: 8,
    query: "ombre+eyebrow+powder+brows",
    title: "Ombré Powder Brows",
    category: "micropigmentacao",
  },
  {
    id: 9,
    query: "eyebrow+tinting+dark+color",
    title: "Coloração Escura",
    category: "coloracao",
  },
  {
    id: 10,
    query: "natural+eyebrow+enhancement",
    title: "Realce Natural",
    category: "design",
  },
  {
    id: 11,
    query: "eyebrow+lift+lamination",
    title: "Laminação com Lift",
    category: "laminacao",
  },
  {
    id: 12,
    query: "microblading+hair+strokes",
    title: "Fio a Fio",
    category: "micropigmentacao",
  },
];

const categories = [
  { id: "todos", label: "Todos" },
  { id: "design", label: "Design" },
  { id: "micropigmentacao", label: "Micropigmentação" },
  { id: "coloracao", label: "Coloração" },
  { id: "laminacao", label: "Laminação" },
];

export function GalleryGrid() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("todos");

  const filteredImages =
    selectedCategory === "todos"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  return (
    <>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredImages.map((image) => (
          <button
            key={image.id}
            type="button"
            className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform text-left w-full border-none p-0"
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={`https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=500&h=500&query=${image.query}`}
              alt={image.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <p className="text-white font-medium">{image.title}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}
