/**
 * Componente de visualização do site (Preview).
 * Renderiza o iframe do site com controles de redimensionamento,
 * molduras de dispositivo (Monitor/Smartphone) e zoom responsivo.
 */
import { 
  ChevronLeft, 
  ChevronRight,
} from "lucide-react";
import type { RefObject } from "react";
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
  setManualWidth: (width: number | null | ((prev: number | null) => number | null)) => void;
  previewUrl: string;
  previewKey: number;
  activePageData: PageItem | undefined;
  containerRef: RefObject<HTMLDivElement | null>;
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
}: PreviewFrameProps) {
  return (
    <div className="flex-1 w-full h-full flex flex-col min-w-0 transition-all duration-300 relative z-0">
      <div className="flex-1 flex flex-col h-full min-w-0 bg-muted/5 overflow-hidden">
        <div
          ref={containerRef}
          className="flex-1 bg-muted/10 relative flex items-center justify-center overflow-hidden p-2 lg:p-4 group min-w-0"
        >
          {/* Setas de Ajuste Manual */}
          <div className="absolute inset-y-0 left-2 lg:left-4 flex items-center pointer-events-none z-20">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full shadow-lg pointer-events-auto bg-[#FFD6D6] hover:bg-[#FFC1C1] text-black border-none transition-all hover:scale-110 active:scale-95"
              onClick={() =>
                setManualWidth(
                  (prev) => (prev || (previewMode === "mobile" ? 375 : 1280)) - 50,
                )
              }
              title="Diminuir Largura"
            >
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
          </div>

          <div className="absolute inset-y-0 right-2 lg:right-4 flex items-center pointer-events-none z-20">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full shadow-lg pointer-events-auto bg-[#FFD6D6] hover:bg-[#FFC1C1] text-black border-none transition-all hover:scale-110 active:scale-95"
              onClick={() =>
                setManualWidth(
                  (prev) => (prev || (previewMode === "mobile" ? 375 : 1280)) + 50,
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
                  : currentWidth * (previewMode === "mobile" ? mobileScale : desktopScale),
              height:
                previewMode === "desktop" && isAutoZoom
                  ? "100%"
                  : (previewMode === "mobile" ? 750 : 850) * (previewMode === "mobile" ? mobileScale : desktopScale),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              className={cn(
                "transition-all duration-500 ease-in-out shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden bg-white flex flex-col shrink-0 will-change-transform",
                previewMode === "desktop"
                  ? "rounded-xl border border-border"
                  : "rounded-[3rem] border-12 border-black",
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
                    : `scale(${previewMode === "mobile" ? mobileScale : desktopScale})`,
                transformOrigin: "center center",
              }}
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
                      {typeof window !== "undefined" ? window.location.origin : ""}{activePageData?.path}
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

              {/* Mobile Home Indicator */}
              {previewMode === "mobile" && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
