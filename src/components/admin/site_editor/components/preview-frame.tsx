/**
 * Componente de visualização do site (Preview).
 * Renderiza o iframe do site com controles de redimensionamento,
 * molduras de dispositivo (Monitor/Smartphone) e zoom responsivo.
 */
import { ChevronLeft, ChevronRight, Move } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PageItem } from "./editor-constants";

interface PreviewFrameProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  previewMode: "desktop" | "mobile";
  currentWidth: number;
  mobileScale: number;
  desktopScale: number;
  isAutoZoom: boolean;
  setManualWidth: (
    width: number | null | ((prev: number | null) => number | null),
  ) => void;
  previewUrl: string;
  previewKey: number;
  activePageData: PageItem | undefined;
  containerRef: RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
}

export function PreviewFrame({
  iframeRef,
  previewMode,
  currentWidth,
  mobileScale,
  desktopScale,
  isAutoZoom,
  setManualWidth,
  previewUrl,
  previewKey,
  activePageData,
  containerRef,
  isMobile = false,
}: PreviewFrameProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

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

  const handleDragStart = (e: React.MouseEvent) => {
    if (previewMode !== "mobile") return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col min-w-0 transition-all duration-300 relative z-0">
      <div className="flex-1 flex flex-col h-full min-w-0 bg-muted/5 overflow-hidden">
        <div
          ref={containerRef}
          className="flex-1 bg-muted/10 relative flex justify-center overflow-y-auto overflow-x-hidden p-1 sm:p-2 lg:p-4 group min-w-0"
        >
          {/* Setas de Ajuste Manual */}
          <div className="absolute inset-y-0 left-2 lg:left-4 hidden sm:flex items-center pointer-events-none z-20">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full shadow-lg pointer-events-auto bg-[#FFD6D6] hover:bg-[#FFC1C1] text-black border-none transition-all hover:scale-110 active:scale-95"
              onClick={() =>
                setManualWidth(
                  (prev) =>
                    (prev || (previewMode === "mobile" ? 375 : 1280)) - 50,
                )
              }
              title="Diminuir Largura"
            >
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
          </div>

          <div className="absolute inset-y-0 right-2 lg:right-4 hidden sm:flex items-center pointer-events-none z-20">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full shadow-lg pointer-events-auto bg-[#FFD6D6] hover:bg-[#FFC1C1] text-black border-none transition-all hover:scale-110 active:scale-95"
              onClick={() =>
                setManualWidth(
                  (prev) =>
                    (prev || (previewMode === "mobile" ? 375 : 1280)) + 50,
                )
              }
              title="Aumentar Largura"
            >
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
          </div>

          {/* Monitor / Browser Wrapper */}
          <div
            style={{
              width:
                previewMode === "desktop" && isAutoZoom
                  ? "100%"
                  : currentWidth *
                    (previewMode === "mobile" ? mobileScale : desktopScale),
              height:
                previewMode === "desktop" && isAutoZoom
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
                previewMode === "desktop"
                  ? "rounded-xl border border-border bg-background"
                  : "rounded-[3rem] border-14 border-black bg-black",
              )}
              style={{
                width: `${currentWidth}px`,
                height:
                  previewMode === "desktop" && isAutoZoom
                    ? "100%"
                    : previewMode === "mobile"
                      ? "750px"
                      : "850px",
                transform:
                  previewMode === "desktop" && isAutoZoom
                    ? "none"
                    : `translate(${previewMode === "mobile" ? position.x : 0}px, ${previewMode === "mobile" ? position.y : 0}px) scale(${previewMode === "mobile" ? mobileScale : desktopScale})`,
                transformOrigin: "top center",
                maxWidth: "100%",
                maxHeight: "100%",
                cursor: isDragging ? "grabbing" : "default",
              }}
            >
              {/* Drag Handle (Mobile Only) */}
              {previewMode === "mobile" && (
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
              <div className={cn(
                "flex-1 w-full h-full overflow-hidden bg-white relative flex flex-col",
                previewMode === "mobile" ? "rounded-[2.2rem]" : "rounded-lg"
              )}>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
