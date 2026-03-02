"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppearanceSettings {
  backgroundImageUrl?: string;
  overlay?: {
    color: string;
    opacity: number;
  };
}

interface SessionWrapperProps {
  appearance?: AppearanceSettings;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function SessionWrapper({
  appearance,
  children,
  className,
  id,
}: SessionWrapperProps) {
  // Se não houver configurações de aparência (background ou overlay), 
  // renderizamos os filhos diretamente sem o wrapper extra.
  const hasBackground = !!appearance?.backgroundImageUrl;
  const hasOverlay = !!(appearance?.overlay && appearance.overlay.opacity > 0);

  if (!hasBackground && !hasOverlay) {
    return <>{children}</>;
  }

  const sectionStyle: CSSProperties = {
    backgroundImage: hasBackground
      ? `url(${appearance.backgroundImageUrl})`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
  };

  const overlayStyle: CSSProperties = {
    backgroundColor: appearance?.overlay?.color || "transparent",
    opacity: appearance?.overlay?.opacity ?? 0,
    position: "absolute",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
  };

  return (
    <div
      id={id}
      className={cn("relative overflow-hidden", className)}
      style={sectionStyle}
    >
      {/* Overlay Layer */}
      <div style={overlayStyle} aria-hidden="true" />

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
