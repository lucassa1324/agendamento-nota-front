"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SectionBackgroundProps {
  settings: {
    bgType: "color" | "image";
    bgColor?: string;
    bgImage?: string;
    imageOpacity?: number;
    overlayOpacity?: number;
    imageScale?: number;
    imageX?: number;
    imageY?: number;
  };
  className?: string;
  gradientClassName?: string;
  defaultImage?: string;
}

export function SectionBackground({
  settings,
  className,
  gradientClassName,
  defaultImage,
}: SectionBackgroundProps) {
  const [imageError, setImageError] = useState(false);
  const bgImage = settings.bgImage || defaultImage;
  const showImage =
    (settings.bgType === "image" || (!settings.bgType && defaultImage)) &&
    !imageError;

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none min-h-100",
        className,
      )}
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      {/* Background Color Layer */}
      <div
        className="absolute inset-0 z-0 transition-colors duration-500"
        style={{
          backgroundColor:
            settings.bgType === "color"
              ? settings.bgColor || "var(--background)"
              : "transparent",
        }}
      />

      {/* Background Image Layer */}
      {showImage && bgImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={bgImage}
            alt="Background"
            fill
            className="object-cover"
            style={{
              opacity:
                settings.imageOpacity ??
                (settings.bgType === "image" ? 1 : 0.2),
              transform: `scale(${settings.imageScale ?? 1})`,
              objectPosition: `${settings.imageX ?? 50}% ${settings.imageY ?? 50}%`,
            }}
            priority={!!defaultImage}
            onError={() => {
              console.warn(
                `[IMAGE_LOAD_ERROR] Falha ao carregar imagem: ${bgImage}. Revertendo para cor de fundo.`,
              );
              setImageError(true);
            }}
          />
        </div>
      )}

      {/* Overlay/Gradient Layer */}
      <div
        className={cn(
          "absolute inset-0 z-1 transition-opacity duration-500",
          gradientClassName ||
            "bg-linear-to-b from-black/20 via-black/50 to-black",
        )}
        style={{
          opacity: settings.overlayOpacity ?? 0,
        }}
      />
    </div>
  );
}
