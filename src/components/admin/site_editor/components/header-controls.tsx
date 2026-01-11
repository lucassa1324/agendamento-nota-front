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
}: HeaderControlsProps) {
  return (
    <div className="flex items-center bg-muted/50 rounded-full p-1 gap-1 ml-2 shrink-0">
      <div className="flex items-center gap-0.5 mr-1 lg:mr-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full w-7 h-7 lg:w-8 lg:h-8"
          onClick={() => {
            const currentScale =
              previewMode === "mobile" ? mobileScale : desktopScale;
            setManualScale(Math.max(0.1, currentScale - 0.1));
            setIsAutoZoom(false);
          }}
          title="Diminuir Zoom"
        >
          <ZoomOut className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </Button>
        <span className="text-[10px] lg:text-xs font-bold min-w-10 text-center">
          {Math.round(
            (previewMode === "mobile" ? mobileScale : desktopScale) * 100,
          )}
          %
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full w-7 h-7 lg:w-8 lg:h-8"
          onClick={() => {
            const currentScale =
              previewMode === "mobile" ? mobileScale : desktopScale;
            setManualScale(Math.min(2, currentScale + 0.1));
            setIsAutoZoom(false);
          }}
          title="Aumentar Zoom"
        >
          <ZoomIn className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </Button>
        <Button
          type="button"
          variant={isAutoZoom ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "rounded-full w-7 h-7 lg:w-8 lg:h-8",
            isAutoZoom && "bg-background shadow-sm",
          )}
          onClick={() => setIsAutoZoom(true)}
          title="Ajustar à Tela (Auto)"
        >
          <Maximize className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </Button>
      </div>

      <div className="w-px h-4 bg-border mx-1" />

      <div className="flex items-center gap-1 px-1">
        <Button
          type="button"
          variant={previewMode === "desktop" ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "rounded-full w-7 h-7 lg:w-8 lg:h-8",
            previewMode === "desktop" && "bg-background shadow-sm",
          )}
          onClick={() => {
            setPreviewMode("desktop");
            setManualWidth(null);
          }}
          title="Visualização Desktop"
        >
          <Monitor className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </Button>
        <Button
          type="button"
          variant={previewMode === "mobile" ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "rounded-full w-7 h-7 lg:w-8 lg:h-8",
            previewMode === "mobile" && "bg-background shadow-sm",
          )}
          onClick={() => {
            setPreviewMode("mobile");
            setManualWidth(null);
          }}
          title="Visualização Mobile"
        >
          <Smartphone className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </Button>
      </div>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full w-7 h-7 lg:w-8 lg:h-8"
        onClick={reloadPreview}
        title="Recarregar Preview"
      >
        <RotateCcw className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
      </Button>
    </div>
  );
}
