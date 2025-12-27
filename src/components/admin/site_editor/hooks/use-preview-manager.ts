/**
 * Hook responsável por gerenciar a lógica de visualização do preview.
 * Controla o modo (Desktop/Mobile), escala de zoom, largura manual
 * e detecção de redimensionamento do container.
 */
import { type RefObject, useCallback, useEffect, useState } from "react";

export function usePreviewManager(containerRef: RefObject<HTMLDivElement | null>) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [manualScale, setManualScale] = useState(1);
  const [isAutoZoom, setIsAutoZoom] = useState(true);
  const [manualWidth, setManualWidth] = useState<number | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Load from localStorage
  useEffect(() => {
    const savedPreviewMode = localStorage.getItem("sc_preview_mode");
    if (savedPreviewMode === "desktop" || savedPreviewMode === "mobile") setPreviewMode(savedPreviewMode);

    const savedManualScale = localStorage.getItem("sc_manual_scale");
    if (savedManualScale) setManualScale(parseFloat(savedManualScale));

    const savedIsAutoZoom = localStorage.getItem("sc_is_auto_zoom");
    if (savedIsAutoZoom !== null) setIsAutoZoom(savedIsAutoZoom === "true");

    const savedManualWidth = localStorage.getItem("sc_manual_width");
    if (savedManualWidth) setManualWidth(parseInt(savedManualWidth, 10));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("sc_preview_mode", previewMode);
    localStorage.setItem("sc_manual_scale", manualScale.toString());
    localStorage.setItem("sc_is_auto_zoom", isAutoZoom.toString());
    if (manualWidth !== null) localStorage.setItem("sc_manual_width", manualWidth.toString());
    else localStorage.removeItem("sc_manual_width");
  }, [previewMode, manualScale, isAutoZoom, manualWidth]);

  // Observer for container width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  const desktopWidth = manualWidth || 1280;
  const mobileWidth = manualWidth || 375;
  const currentWidth = previewMode === "mobile" ? mobileWidth : desktopWidth;

  const desktopScale = isAutoZoom ? Math.min(1, (containerWidth - 48) / desktopWidth) : manualScale;
  const mobileScale = isAutoZoom ? Math.min(1, (containerWidth - 48) / mobileWidth) : manualScale;

  const reloadPreview = useCallback(() => setPreviewKey((prev) => prev + 1), []);

  return {
    previewMode,
    setPreviewMode,
    manualScale,
    setManualScale,
    isAutoZoom,
    setIsAutoZoom,
    manualWidth,
    setManualWidth,
    previewKey,
    reloadPreview,
    currentWidth,
    desktopScale,
    mobileScale,
  };
}
