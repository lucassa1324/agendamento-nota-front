/**
 * Componente de visualização do site (Preview).
 * Renderiza o iframe do site com controles de redimensionamento,
 * molduras de dispositivo (Monitor/Smartphone) e zoom responsivo.
 */
import { Move } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PageItem } from "./editor-constants";

interface PreviewFrameProps {
  iframeRef: RefObject<HTMLIFrameElement>;
  previewMode: "desktop" | "mobile";
  currentWidth: number;
  mobileScale: number;
  desktopScale: number;
  isAutoZoom: boolean;
  setIsAutoZoom: (value: boolean) => void;
  setManualWidth: (
    width: number | null | ((prev: number | null) => number | null),
  ) => void;
  previewUrl: string;
  previewKey: number;
  activePageData: PageItem | undefined;
  containerRef: RefObject<HTMLDivElement>;
  isMobile?: boolean;
}

export function PreviewFrame({
  iframeRef,
  previewMode,
  currentWidth,
  mobileScale,
  desktopScale,
  isAutoZoom,
  setIsAutoZoom,
  setManualWidth,
  previewUrl,
  previewKey,
  activePageData,
  containerRef,
  isMobile = false,
}: PreviewFrameProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [mobileEditorFitScale, setMobileEditorFitScale] = useState(0.84);
  const [isResizingMobilePreview, setIsResizingMobilePreview] = useState(false);
  const [desktopResizeDirection, setDesktopResizeDirection] = useState<
    "left" | "right" | null
  >(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, scale: 0.84 });
  const desktopResizeStartRef = useRef({
    x: 0,
    width: 1280,
    direction: "right" as "left" | "right",
  });
  const desktopResizeRafRef = useRef<number | null>(null);
  const mobileResizeRafRef = useRef<number | null>(null);
  const pendingDesktopWidthRef = useRef<number | null>(null);
  const pendingMobileScaleRef = useRef<number | null>(null);
  const useNativeMobilePreview = isMobile && previewMode === "mobile";

  useEffect(() => {
    if (!useNativeMobilePreview) {
      setIsResizingMobilePreview(false);
    }
  }, [useNativeMobilePreview]);

  useEffect(() => {
    if (previewMode === "desktop") {
      setPosition({ x: 0, y: 0 });
    }
  }, [previewMode]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    return () => {
      if (desktopResizeRafRef.current !== null) {
        cancelAnimationFrame(desktopResizeRafRef.current);
      }
      if (mobileResizeRafRef.current !== null) {
        cancelAnimationFrame(mobileResizeRafRef.current);
      }
    };
  }, []);

  const handleDragStart = (e: React.MouseEvent) => {
    if (previewMode !== "mobile") return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const scheduleDesktopWidth = (nextWidth: number) => {
    pendingDesktopWidthRef.current = nextWidth;
    if (desktopResizeRafRef.current !== null) return;
    desktopResizeRafRef.current = requestAnimationFrame(() => {
      desktopResizeRafRef.current = null;
      if (pendingDesktopWidthRef.current === null) return;
      setManualWidth(pendingDesktopWidthRef.current);
      pendingDesktopWidthRef.current = null;
    });
  };

  const scheduleMobileScale = (nextScale: number) => {
    pendingMobileScaleRef.current = nextScale;
    if (mobileResizeRafRef.current !== null) return;
    mobileResizeRafRef.current = requestAnimationFrame(() => {
      mobileResizeRafRef.current = null;
      if (pendingMobileScaleRef.current === null) return;
      setMobileEditorFitScale(pendingMobileScaleRef.current);
      pendingMobileScaleRef.current = null;
    });
  };

  const handleMobileResizePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    if (!useNativeMobilePreview) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeStartRef.current = {
      x: event.clientX,
      scale: mobileEditorFitScale,
    };
    setIsResizingMobilePreview(true);
  };

  const handleMobileResizePointerMove = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    if (
      !isResizingMobilePreview ||
      !event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      return;
    }
    const deltaX = event.clientX - resizeStartRef.current.x;
    const nextScale = resizeStartRef.current.scale + deltaX / 320;
    scheduleMobileScale(Math.max(0.65, Math.min(1.05, nextScale)));
  };

  const stopMobileResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsResizingMobilePreview(false);
  };

  const startDesktopResize = (
    direction: "left" | "right",
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (previewMode !== "desktop" || isMobile) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsAutoZoom(false);
    desktopResizeStartRef.current = {
      x: event.clientX,
      width: currentWidth,
      direction,
    };
    setDesktopResizeDirection(direction);
  };

  const handleDesktopResizeMove = (
    direction: "left" | "right",
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (
      desktopResizeDirection !== direction ||
      !event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      return;
    }
    const { x, width, direction: resizeDirection } = desktopResizeStartRef.current;
    const deltaX = event.clientX - x;
    const widthDelta = resizeDirection === "right" ? deltaX : -deltaX;
    const nextWidth = Math.round(Math.max(640, Math.min(1920, width + widthDelta)));
    scheduleDesktopWidth(nextWidth);
  };

  const stopDesktopResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDesktopResizeDirection(null);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col min-w-0 transition-all duration-300 relative z-0">
      <div className="flex-1 flex flex-col h-full min-w-0 bg-muted/5 overflow-hidden">
        <div
          ref={containerRef}
          className={cn(
            "flex-1 bg-muted/10 relative flex justify-center overflow-y-auto overflow-x-hidden group min-w-0",
            useNativeMobilePreview ? "p-0" : "p-1 sm:p-2 lg:p-4",
          )}
        >
          {/* Monitor / Browser Wrapper */}
          <div
            style={{
              width: useNativeMobilePreview
                ? "100%"
                : previewMode === "desktop" && isAutoZoom
                  ? "100%"
                  : currentWidth *
                    (previewMode === "mobile" ? mobileScale : desktopScale),
              height: useNativeMobilePreview
                ? "100%"
                : previewMode === "desktop" && isAutoZoom
                  ? "100%"
                  : (previewMode === "mobile" ? 750 : 850) *
                    (previewMode === "mobile" ? mobileScale : desktopScale),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              margin: "auto",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          >
            <div
              className={cn(
                "transition-transform duration-300 ease shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col shrink-0 will-change-transform relative",
                previewMode === "desktop" || useNativeMobilePreview
                  ? "rounded-xl border border-border bg-background"
                  : "rounded-[3rem] border-14 border-black bg-black",
                (previewMode === "desktop" && !isMobile) || useNativeMobilePreview
                  ? "ring-2 ring-primary/25"
                  : "",
              )}
              style={{
                width: useNativeMobilePreview ? "100%" : `${currentWidth}px`,
                height: useNativeMobilePreview
                  ? "100%"
                  : previewMode === "desktop" && isAutoZoom
                    ? "100%"
                    : previewMode === "mobile"
                      ? "750px"
                      : "850px",
                transform:
                  useNativeMobilePreview
                    ? `scale(${mobileEditorFitScale})`
                    : previewMode === "desktop" && isAutoZoom
                      ? "none"
                    : `translate(${previewMode === "mobile" ? position.x : 0}px, ${previewMode === "mobile" ? position.y : 0}px) scale(${previewMode === "mobile" ? mobileScale : desktopScale})`,
                transformOrigin: "top center",
                maxWidth: "100%",
                maxHeight: "100%",
                cursor: desktopResizeDirection
                  ? "ew-resize"
                  : isDragging
                    ? "grabbing"
                    : "default",
              }}
            >
              {/* Drag Handle (Mobile Only) */}
              {previewMode === "mobile" && !isMobile && (
                <div className="absolute -top-6 -left-6 z-50">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="w-12 h-12 rounded-full bg-white text-black shadow-lg cursor-grab active:cursor-grabbing hover:bg-gray-100 border-2 border-gray-200 flex items-center justify-center"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleDragStart(e);
                    }}
                    title="Arrastar visualização"
                  >
                    <Move className="w-6 h-6" />
                  </Button>
                </div>
              )}

              {/* Inner Content Wrapper for Clipping */}
              <div
                className={cn(
                  "flex-1 w-full h-full overflow-hidden bg-white relative flex flex-col",
                  previewMode === "mobile" && !useNativeMobilePreview
                    ? "rounded-[2.2rem]"
                    : "rounded-lg",
                )}
              >
                {/* Browser Header (Desktop Only) */}
                {previewMode === "desktop" && (
                  <div className="h-10 bg-[#F1F3F4] border-b border-border flex items-center px-4 gap-4 shrink-0">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                    </div>
                    <div className="flex-1 max-w-md bg-white h-6 rounded-md border border-border flex items-center px-3 gap-2 overflow-hidden">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/20 shrink-0" />
                      <span className="text-[10px] text-muted-foreground truncate">
                        {typeof window !== "undefined"
                          ? window.location.origin
                          : ""}
                        {activePageData?.path}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex-1 w-full overflow-hidden bg-white relative">
                  <iframe
                    ref={iframeRef}
                    key={previewKey}
                    src={previewUrl || undefined}
                    className="absolute inset-0 w-full h-full border-none overflow-hidden"
                    title="Preview"
                  />
                </div>
              </div>

              {/* Mobile Home Indicator */}
              {previewMode === "mobile" && !isMobile && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full pointer-events-none z-10" />
              )}

              {previewMode === "desktop" && !isMobile && (
                <>
                  <div
                    className="absolute -left-1 top-0 bottom-0 w-3 cursor-ew-resize z-30 touch-none select-none bg-primary/15 hover:bg-primary/30 transition-colors rounded-l-md"
                    title="Redimensionar largura"
                    onPointerDown={(event) => startDesktopResize("left", event)}
                    onPointerMove={(event) => handleDesktopResizeMove("left", event)}
                    onPointerUp={stopDesktopResize}
                    onPointerCancel={stopDesktopResize}
                    onLostPointerCapture={stopDesktopResize}
                  />
                  <div
                    className="absolute -right-1 top-0 bottom-0 w-3 cursor-ew-resize z-30 touch-none select-none bg-primary/15 hover:bg-primary/30 transition-colors rounded-r-md"
                    title="Redimensionar largura"
                    onPointerDown={(event) => startDesktopResize("right", event)}
                    onPointerMove={(event) => handleDesktopResizeMove("right", event)}
                    onPointerUp={stopDesktopResize}
                    onPointerCancel={stopDesktopResize}
                    onLostPointerCapture={stopDesktopResize}
                  />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded bg-background/90 border border-border text-muted-foreground pointer-events-none">
                    Arraste as bordas para redimensionar
                  </div>
                </>
              )}
            </div>

            {useNativeMobilePreview && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className={cn(
                  "absolute bottom-3 right-3 z-40 h-10 w-10 rounded-full shadow-lg bg-background/95 backdrop-blur border border-primary/40 touch-none select-none",
                  isResizingMobilePreview && "ring-2 ring-primary/40",
                )}
                title="Redimensionar preview"
                onPointerDown={handleMobileResizePointerDown}
                onPointerMove={handleMobileResizePointerMove}
                onPointerUp={stopMobileResize}
                onPointerCancel={stopMobileResize}
                onLostPointerCapture={stopMobileResize}
              >
                <Move className="w-4 h-4" />
              </Button>
            )}

            {useNativeMobilePreview && (
              <div className="absolute bottom-3 right-16 text-[10px] px-2 py-0.5 rounded bg-background/90 border border-border text-muted-foreground pointer-events-none">
                Arraste para redimensionar
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
