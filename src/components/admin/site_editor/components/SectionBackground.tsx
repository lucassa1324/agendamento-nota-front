"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, getFullImageUrl } from "@/lib/utils";

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
    appearance?: {
      backgroundImageUrl?: string;
      overlay?: {
        color: string;
        opacity: number;
      };
    };
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

  const bgImage = settings.appearance?.backgroundImageUrl || settings.bgImage || defaultImage;

  // Se houver uma imagem de fundo, forçamos o tipo para "image" para garantir prioridade visual.
  // Caso contrário, usamos o tipo definido ou o padrão baseado no defaultImage.
  const hasValidImage = !!(settings.appearance?.backgroundImageUrl || settings.bgImage);
  const effectiveBgType = hasValidImage ? "image" : (settings.bgType || (defaultImage ? "image" : "color"));

  // Reset error when image or type changes
  const [prevKey, setPrevKey] = useState(`${bgImage}-${effectiveBgType}`);
  const currentKey = `${bgImage}-${effectiveBgType}`;
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setImageError(false);
  }

  const showImage =
    (effectiveBgType === "image" || (!effectiveBgType && defaultImage)) &&
    !imageError;

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none min-h-100",
        className,
      )}
      style={{
        backgroundColor:
          effectiveBgType === "color"
            ? settings.bgColor || "var(--background)"
            : "transparent",
      }}
    >
      {/* Background Color Layer */}
      <div
        className="absolute inset-0 z-0 transition-colors duration-500"
        style={{
          backgroundColor:
            effectiveBgType === "color"
              ? settings.bgColor || "var(--background)"
              : "transparent",
        }}
      />

      {/* Background Image Layer */}
      {showImage && bgImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={getFullImageUrl(bgImage)}
            alt="Background"
            fill
            className="object-cover"
            style={{
              opacity:
                settings.imageOpacity ??
                (effectiveBgType === "image" ? 1 : 0.2),
              transform: `scale(${settings.imageScale ?? 1})`,
              objectPosition: `${settings.imageX ?? 50}% ${settings.imageY ?? 50}%`,
            }}
            priority={!!defaultImage}
            onError={() => {
              console.warn(
                `[IMAGE_LOAD_ERROR] Falha ao carregar imagem: ${getFullImageUrl(bgImage)}. Revertendo para cor de fundo.`,
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
