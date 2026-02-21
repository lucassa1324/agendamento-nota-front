/**
 * Controles de cabeçalho para a área de preview.
 * Fornece botões para alternar entre Desktop/Mobile, ajustar o zoom,
 * resetar visualização e atualizar o preview.
 */
import {
  Maximize,
  Monitor,
  RotateCcw,
  Smartphone,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderControlsProps {
  previewMode: "desktop" | "mobile";
  setPreviewMode: (mode: "desktop" | "mobile") => void;
  mobileScale: number;
  desktopScale: number;
  setManualScale: (scale: number) => void;
  setIsAutoZoom: (autoZoom: boolean) => void;
  isAutoZoom: boolean;
  setManualWidth: (width: number | null) => void;
  reloadPreview: () => void;
  isMobile?: boolean;
}

export function HeaderControls({
  previewMode,
  setPreviewMode,
  mobileScale,
  desktopScale,
  setManualScale,
  setIsAutoZoom,
  isAutoZoom,
  setManualWidth,
  reloadPreview,
  isMobile = false,
}: HeaderControlsProps) {
  const currentScale = previewMode === "mobile" ? mobileScale : desktopScale;
  const [zoomInputValue, setZoomInputValue] = useState(
    Math.round(currentScale * 100).toString(),
  );

  useEffect(() => {
    setZoomInputValue(Math.round(currentScale * 100).toString());
  }, [currentScale]);

  const handleZoomCommit = () => {
    let value = parseInt(zoomInputValue.replace(/\D/g, ""), 10);
    if (Number.isNaN(value)) {
      value = Math.round(currentScale * 100);
    }
    // Limites: 10% a 300%
    value = Math.max(10, Math.min(300, value));
    setManualScale(value / 100);
    setIsAutoZoom(false);
    setZoomInputValue(value.toString());
  };

  return (
    <div className="flex items-center bg-muted/50 rounded-full p-1 gap-1 ml-2 shrink-0">
      <div
        className={cn(
          "flex items-center gap-0.5 mr-1 lg:mr-2",
          !isMobile && "hidden md:flex",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
          onClick={() => {
            setManualScale(Math.max(0.1, currentScale - 0.1));
            setIsAutoZoom(false);
          }}
          title="Diminuir Zoom"
        >
          <ZoomOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
        </Button>
        <div className="relative flex items-center justify-center min-w-12">
          <input
            type="text"
            className="w-full bg-transparent text-center text-[9px] sm:text-[10px] lg:text-xs font-bold focus:outline-none focus:ring-1 focus:ring-ring rounded px-0.5 py-0.5"
            value={zoomInputValue}
            onChange={(e) => setZoomInputValue(e.target.value)}
            onBlur={handleZoomCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
          />
          <span className="absolute right-0 text-[9px] sm:text-[10px] lg:text-xs font-bold pointer-events-none opacity-50">
            %
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
          onClick={() => {
            setManualScale(Math.min(2, currentScale + 0.1));
            setIsAutoZoom(false);
          }}
          title="Aumentar Zoom"
        >
          <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
        </Button>
        <Button
          type="button"
          variant={isAutoZoom ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8",
            isAutoZoom && "bg-background shadow-sm text-foreground",
          )}
          onClick={() => setIsAutoZoom(true)}
          title="Ajustar à Tela (Auto)"
        >
          <Maximize className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
        </Button>
      </div>

      <div className="w-px h-4 bg-border mx-1" />

      <div className="flex items-center gap-1 px-1">
        {!isMobile && (
          <Button
            type="button"
            variant={previewMode === "desktop" ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8",
              previewMode === "desktop" &&
                "bg-background shadow-sm text-foreground",
            )}
            onClick={() => {
              setPreviewMode("desktop");
              setManualWidth(null);
            }}
            title="Visualização Desktop"
          >
            <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
          </Button>
        )}
        <Button
          type="button"
          variant={previewMode === "mobile" ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8",
            previewMode === "mobile" &&
              "bg-background shadow-sm text-foreground",
          )}
          onClick={() => {
            setPreviewMode("mobile");
            setManualWidth(null);
          }}
          title="Visualização Mobile"
        >
          <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
        </Button>
      </div>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
        onClick={reloadPreview}
        title="Recarregar Preview"
      >
        <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
      </Button>
    </div>
  );
}
