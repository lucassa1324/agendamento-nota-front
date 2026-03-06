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
      backgroundColor?: string;
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

  // Se o tipo for 'color', a URL da imagem DEVE ser anulada, ignorando o banco.
  const bgImage =
    settings.bgType === "image"
      ? settings.appearance?.backgroundImageUrl ||
        settings.bgImage ||
        defaultImage
      : null;
  const hasValidImage = settings.bgType === "image" && !!bgImage;

  // Só mostramos imagem se o TIPO selecionado for 'image' E existir uma URL e não houver erro
  const shouldShowImage = hasValidImage && !imageError;

  return (
    <div
      key={`${settings.bgType}-${bgImage}`}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none min-h-100",
        className,
      )}
    >
      {/* CAMADA DE COR: Sempre visível se o tipo for 'color' OU se não tiver imagem para mostrar */}
      <div
        className="absolute inset-0 z-0 transition-colors duration-500"
        style={{
          backgroundColor:
            settings.appearance?.backgroundColor ||
            settings.bgColor ||
            "transparent",
          backgroundImage: settings.bgType === "color" ? "none" : undefined,
          display:
            settings.bgType === "color" || !shouldShowImage ? "block" : "none",
        }}
      />

      {/* CAMADA DE IMAGEM: Só renderiza se o tipo for 'image' */}
      {shouldShowImage && bgImage && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "none", // Força limpeza de qualquer BG herdado via CSS
          }}
        >
          <Image
            src={getFullImageUrl(bgImage)}
            alt="Background"
            fill
            className="object-cover"
            style={{
              opacity: settings.imageOpacity ?? 1,
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
