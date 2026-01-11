"use client";

import { RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface BackgroundSettings {
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
}

interface BackgroundEditorProps {
  settings: BackgroundSettings;
  onUpdate: (updates: Partial<BackgroundSettings>) => void;
  sectionId?: string;
}

export function BackgroundEditor({
  settings,
  onUpdate,
  sectionId = "section",
}: BackgroundEditorProps) {
  return (
    <fieldset
      className="space-y-6 pt-2 border-none p-0 m-0"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div>
        <RadioGroup
          value={settings.bgType}
          onValueChange={(v) => onUpdate({ bgType: v as "color" | "image" })}
          className="grid grid-cols-2 gap-2 bg-muted/50 p-1 rounded-md"
        >
          <div className="flex items-center justify-center">
            <RadioGroupItem
              value="color"
              id={`${sectionId}-bg-color`}
              className="sr-only"
            />
            <Label
              htmlFor={`${sectionId}-bg-color`}
              className={cn(
                "flex-1 text-center py-1.5 rounded-sm text-[10px] font-bold uppercase cursor-pointer transition-all",
                settings.bgType === "color"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Cor Sólida
            </Label>
          </div>
          <div className="flex items-center justify-center">
            <RadioGroupItem
              value="image"
              id={`${sectionId}-bg-image`}
              className="sr-only"
            />
            <Label
              htmlFor={`${sectionId}-bg-image`}
              className={cn(
                "flex-1 text-center py-1.5 rounded-sm text-[10px] font-bold uppercase cursor-pointer transition-all",
                settings.bgType === "image"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Imagem
            </Label>
          </div>
        </RadioGroup>
      </div>

      {settings.bgType === "color" ? (
        <fieldset className="space-y-1.5 border-none p-0 m-0">
          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
            Cor de Fundo
            {settings.bgColor && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:text-primary"
                onClick={() => onUpdate({ bgColor: "" })}
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            )}
          </legend>
          <div className="flex gap-2">
            <Input
              type="color"
              value={settings.bgColor || "#ffffff"}
              className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
              onChange={(e) => onUpdate({ bgColor: e.target.value })}
            />
            <Input
              value={settings.bgColor || ""}
              placeholder="Padrão do Site"
              className="h-8 text-[10px] flex-1 uppercase"
              onChange={(e) => onUpdate({ bgColor: e.target.value })}
            />
          </div>
        </fieldset>
      ) : (
        <div className="space-y-6">
          <fieldset className="space-y-1.5 border-none p-0 m-0">
            <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
              URL da Imagem
            </legend>
            <div className="flex gap-2">
              <Input
                value={settings.bgImage}
                onChange={(e) => onUpdate({ bgImage: e.target.value })}
                className="h-8 text-xs flex-1"
                placeholder="https://..."
              />
            </div>
            <Button
              variant="outline"
              className="w-full h-10 border-dashed text-xs gap-2"
            >
              <Upload className="w-3.5 h-3.5" /> Fazer Upload
            </Button>
          </fieldset>

          <fieldset className="space-y-1.5 border-none p-0 m-0">
            <div className="flex justify-between items-center">
              <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                Opacidade da Imagem
              </legend>
              <span className="text-[10px] font-mono">
                {Math.round((settings.imageOpacity || 0) * 100)}%
              </span>
            </div>
            <Slider
              value={[(settings.imageOpacity || 0) * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={([v]) => onUpdate({ imageOpacity: v / 100 })}
              className="py-2"
            />
          </fieldset>

          <fieldset className="space-y-1.5 border-none p-0 m-0 pt-4 border-t border-border/30">
            <legend className="text-[10px] uppercase text-primary/70 font-bold mb-1.5">
              Ajuste Manual da Imagem
            </legend>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] text-muted-foreground">
                  Zoom (Escala)
                </Label>
                <span className="text-[10px] font-mono">
                  {(settings.imageScale || 1).toFixed(2)}x
                </span>
              </div>
              <Slider
                value={[settings.imageScale || 1]}
                min={1}
                max={3}
                step={0.01}
                onValueChange={([v]) => onUpdate({ imageScale: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] text-muted-foreground">
                    Posição X
                  </Label>
                  <span className="text-[10px] font-mono">
                    {settings.imageX || 50}%
                  </span>
                </div>
                <Slider
                  value={[settings.imageX || 50]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => onUpdate({ imageX: v })}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] text-muted-foreground">
                    Posição Y
                  </Label>
                  <span className="text-[10px] font-mono">
                    {settings.imageY || 50}%
                  </span>
                </div>
                <Slider
                  value={[settings.imageY || 50]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => onUpdate({ imageY: v })}
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[10px] uppercase h-8 text-muted-foreground hover:text-primary gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({
                  imageScale: 1,
                  imageX: 50,
                  imageY: 50,
                });
              }}
            >
              <RotateCcw className="w-3 h-3" /> Resetar Ajustes
            </Button>
          </fieldset>
        </div>
      )}

      <fieldset className="space-y-1.5 border-none p-0 m-0 pt-4 border-t border-border/30">
        <div className="flex justify-between items-center">
          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
            {settings.bgType === "image"
              ? "Intensidade do Gradiente"
              : "Sobreposição de Cor"}
          </legend>
          <span className="text-[10px] font-mono">
            {Math.round((settings.overlayOpacity || 0) * 100)}%
          </span>
        </div>
        <Slider
          value={[(settings.overlayOpacity || 0) * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([v]) => onUpdate({ overlayOpacity: v / 100 })}
        />
        <p className="text-[9px] text-muted-foreground mt-1">
          {settings.bgType === "image"
            ? "Cria um degradê suave para melhorar a leitura do texto sobre a imagem."
            : "Aplica uma camada de cor extra sobre o fundo escolhido."}
        </p>
      </fieldset>
    </fieldset>
  );
}
