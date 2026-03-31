"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, getFullImageUrl } from "@/lib/utils";

export interface SectionBackgroundSettings {
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
    imageOpacity?: number;
  };
}

export interface SectionBackgroundProps {
  settings: SectionBackgroundSettings;
  className?: string;
  gradientClassName?: string;
  defaultImage?: string;
  hideColorLayer?: boolean;
  color?: string;
}

export function SectionBackground({
  settings,
  className,
  gradientClassName,
  defaultImage,
  hideColorLayer = false,
  color,
}: SectionBackgroundProps) {
  const [imageError, setImageError] = useState(false);

  // Se o tipo for 'color', a URL da imagem DEVE ser anulada, ignorando o banco.
  // TASK 2: Se a URL começar com #, tratamos como nulo (bug do banco enviando hex como imagem)
  let bgImage =
    settings.bgType === "image"
      ? settings.appearance?.backgroundImageUrl ||
        settings.bgImage ||
        defaultImage
      : null;

  if (bgImage?.startsWith("#")) {
    console.warn(`[IMAGE_BUG_FIX] Ignorando hex ${bgImage} como URL de imagem`);
    bgImage = null;
  }

  const hasValidImage = !!bgImage;

  // Calculamos valores efetivos com fallbacks robustos
  const effectiveBgType = settings.bgType || (hasValidImage ? "image" : "color");
  
  const effectiveImageOpacity = 
    settings.imageOpacity ?? 
    settings.appearance?.imageOpacity ?? 
    1;

  const effectiveOverlayOpacity = 
    settings.overlayOpacity ?? 
    settings.appearance?.overlay?.opacity ?? 
    0;

  const effectiveOverlayColor = 
    settings.appearance?.overlay?.color || 
    "";

  const effectiveBackgroundColor = 
    settings.appearance?.backgroundColor || 
    settings.bgColor || 
    "var(--background, white)";

  const effectiveImageScale = settings.imageScale ?? 1;
  const effectiveImageX = settings.imageX ?? 50;
  const effectiveImageY = settings.imageY ?? 50;

  // Só mostramos imagem se o TIPO selecionado for 'image' E existir uma URL e não houver erro
  const shouldShowImage = effectiveBgType === "image" && hasValidImage && !imageError;

  return (
    <div
      key={`${effectiveBgType}-${bgImage}`}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none min-h-100 -z-10",
        hideColorLayer ? "bg-transparent" : "bg-background",
        className,
      )}
      style={{
        backgroundColor: !hideColorLayer ? color || effectiveBackgroundColor : undefined,
      }}
    >
      {/* CAMADA DE COR: Sempre visível se o tipo for 'color' OU se não tiver imagem para mostrar */}
      {!hideColorLayer && (
        <div
          className="absolute inset-0 z-0 transition-colors duration-500"
          style={{
            backgroundColor: effectiveBackgroundColor,
            backgroundImage: effectiveBgType === "color" ? "none" : undefined,
            display:
              effectiveBgType === "color" || !shouldShowImage ? "block" : "none",
          }}
        />
      )}

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
              opacity: effectiveImageOpacity,
              transform: `scale(${effectiveImageScale})`,
              objectPosition: `${effectiveImageX}% ${effectiveImageY}%`,
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

      {/* Overlay Layer */}
      <div
        className={cn(
          "absolute inset-0 z-1 transition-opacity duration-500",
          !effectiveOverlayColor && !gradientClassName && "bg-black/20",
          !effectiveOverlayColor && gradientClassName
        )}
        style={{
          opacity: effectiveOverlayOpacity,
          backgroundColor: effectiveOverlayColor,
        }}
      />
    </div>
  );
}
