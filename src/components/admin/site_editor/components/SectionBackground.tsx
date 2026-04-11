"use client";

import Image from "next/image";
import { useState } from "react";
import { sanitizeColor } from "@/lib/booking-data";
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

const getRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const resolveBgType = (value: unknown, bgImage: string): "color" | "image" =>
  value === "color" || value === "image" ? value : bgImage ? "image" : "color";

export function normalizeSectionBackgroundData<
  T extends Record<string, unknown>,
>(section: T): T & SectionBackgroundSettings {
  const appearance = getRecord(section.appearance);
  const overlay = getRecord(appearance.overlay);
  const bgImage =
    (section.bgImage as string) ||
    (appearance.backgroundImageUrl as string) ||
    "";
  const bgColor =
    sanitizeColor(
      (section.bgColor as string) ||
        (section.bg_color as string) ||
        (section.backgroundColor as string) ||
        (section.background_color as string) ||
        (appearance.backgroundColor as string) ||
        (appearance.bgColor as string) ||
        "",
    ) || "";
  const bgType = resolveBgType(section.bgType ?? appearance.bgType, bgImage);
  const imageOpacity =
    typeof section.imageOpacity === "number"
      ? section.imageOpacity
      : typeof appearance.imageOpacity === "number"
        ? appearance.imageOpacity
        : 1;
  const overlayOpacity =
    typeof section.overlayOpacity === "number"
      ? section.overlayOpacity
      : typeof overlay.opacity === "number"
        ? overlay.opacity
        : 0;
  const imageScale =
    typeof section.imageScale === "number"
      ? section.imageScale
      : typeof appearance.imageScale === "number"
        ? (appearance.imageScale as number)
        : 1;
  const imageX =
    typeof section.imageX === "number"
      ? section.imageX
      : typeof appearance.imageX === "number"
        ? (appearance.imageX as number)
        : 50;
  const imageY =
    typeof section.imageY === "number"
      ? section.imageY
      : typeof appearance.imageY === "number"
        ? (appearance.imageY as number)
        : 50;

  return {
    ...section,
    bgImage,
    bgColor,
    backgroundColor: bgColor,
    bg_color: bgColor,
    background_color: bgColor,
    bgType,
    imageOpacity,
    overlayOpacity,
    imageScale,
    imageX,
    imageY,
    appearance: {
      ...appearance,
      backgroundColor: bgColor,
      bgColor: bgColor,
      bg_color: bgColor,
      background_color: bgColor,
      backgroundImageUrl: bgImage,
      bgType,
      imageOpacity,
      imageScale,
      imageX,
      imageY,
      overlay: {
        ...overlay,
        color:
          (section.overlayColor as string) || (overlay.color as string) || "",
        opacity: overlayOpacity,
      },
    },
  } as T & SectionBackgroundSettings;
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
  const normalizedSettings = normalizeSectionBackgroundData(
    settings as unknown as Record<string, unknown>,
  );

  let bgImage =
    normalizedSettings.appearance?.backgroundImageUrl ||
    normalizedSettings.bgImage ||
    defaultImage;

  if (bgImage?.startsWith("#")) {
    console.warn(`[IMAGE_BUG_FIX] Ignorando hex ${bgImage} como URL de imagem`);
    bgImage = undefined;
  }

  const hasValidImage = !!bgImage;

  const effectiveBgType =
    normalizedSettings.bgType || (hasValidImage ? "image" : "color");

  const effectiveImageOpacity =
    normalizedSettings.imageOpacity ??
    normalizedSettings.appearance?.imageOpacity ??
    1;

  const effectiveOverlayOpacity =
    normalizedSettings.overlayOpacity ??
    normalizedSettings.appearance?.overlay?.opacity ??
    0;

  const effectiveOverlayColor =
    normalizedSettings.appearance?.overlay?.color || "";

  const effectiveBackgroundColor =
    normalizedSettings.appearance?.backgroundColor ||
    normalizedSettings.bgColor ||
    "var(--background, white)";

  const effectiveImageScale = normalizedSettings.imageScale ?? 1;
  const effectiveImageX = normalizedSettings.imageX ?? 50;
  const effectiveImageY = normalizedSettings.imageY ?? 50;

  const shouldShowImage =
    effectiveBgType === "image" && hasValidImage && !imageError;

  if (effectiveBgType === "color" && !hasValidImage) {
    return (
      <div
        className={cn(
          "absolute inset-0 overflow-hidden pointer-events-none min-h-100 -z-10",
          hideColorLayer ? "bg-transparent" : "bg-background",
          className,
        )}
        style={{
          backgroundColor: !hideColorLayer
            ? color || effectiveBackgroundColor
            : undefined,
          backgroundImage: "none",
        }}
      >
        {!hideColorLayer && (
          <div
            className="absolute inset-0 z-0 transition-colors duration-500"
            style={{
              backgroundColor: effectiveBackgroundColor,
              backgroundImage: "none",
            }}
          />
        )}
        <div
          className={cn(
            "absolute inset-0 z-1 transition-opacity duration-500",
            !effectiveOverlayColor && !gradientClassName && "bg-black/20",
            !effectiveOverlayColor && gradientClassName,
          )}
          style={{
            opacity: effectiveOverlayOpacity,
            backgroundColor: effectiveOverlayColor,
          }}
        />
      </div>
    );
  }

  return (
    <div
      key={`${effectiveBgType}-${bgImage}`}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none min-h-100 -z-10",
        hideColorLayer ? "bg-transparent" : "bg-background",
        className,
      )}
      style={{
        backgroundColor: !hideColorLayer
          ? color || effectiveBackgroundColor
          : undefined,
      }}
    >
      {!hideColorLayer && (
        <div
          className="absolute inset-0 z-0 transition-colors duration-500"
          style={{
            backgroundColor: effectiveBackgroundColor,
            backgroundImage: effectiveBgType === "color" ? "none" : undefined,
            display:
              effectiveBgType === "color" || !shouldShowImage
                ? "block"
                : "none",
          }}
        />
      )}

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

      <div
        className={cn(
          "absolute inset-0 z-1 transition-opacity duration-500",
          !effectiveOverlayColor && !gradientClassName && "bg-black/20",
          !effectiveOverlayColor && gradientClassName,
        )}
        style={{
          opacity: effectiveOverlayOpacity,
          backgroundColor: effectiveOverlayColor,
        }}
      />
    </div>
  );
}
