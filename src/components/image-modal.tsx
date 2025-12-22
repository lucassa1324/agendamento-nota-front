"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type GalleryImage = {
  id: number;
  query: string;
  title: string;
  category: string;
};

type ImageModalProps = {
  image: GalleryImage;
  onClose: () => void;
};

export function ImageModal({ image, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/90 w-full h-full border-none cursor-default"
        onClick={onClose}
        aria-label="Fechar modal"
      />

      <div
        className="relative max-w-5xl w-full z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="relative aspect-video w-full">
          <Image
            src={`https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=800&h=800&query=${image.query}`}
            alt={image.title}
            fill
            className="object-contain rounded-lg"
          />
        </div>
        <div className="mt-4 text-center">
          <h3 id="modal-title" className="text-white text-xl font-semibold">
            {image.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
