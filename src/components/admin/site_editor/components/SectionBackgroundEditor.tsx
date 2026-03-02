"use client";

import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ImageUploader } from "./ImageUploader";

interface AppearanceSettings {
  backgroundImageUrl?: string;
  overlay?: {
    color: string;
    opacity: number;
  };
}

interface SectionBackgroundEditorProps {
  section: string;
  businessId: string;
  appearance?: AppearanceSettings;
  onChange: (appearance: AppearanceSettings) => void;
  title?: string;
}

export function SectionBackgroundEditor({
  section,
  businessId,
  appearance,
  onChange,
  title = "Imagem de Fundo & Overlay",
}: SectionBackgroundEditorProps) {
  const handleImageUpload = (imageUrl: string) => {
    console.log(">>> [SectionBackgroundEditor] Novo upload concluído:", {
      section,
      imageUrl,
    });
    onChange({
      ...appearance,
      backgroundImageUrl: imageUrl,
    });
  };

  const handleRemoveImage = () => {
    console.log(">>> [SectionBackgroundEditor] Removendo imagem da sessão:", section);
    onChange({
      ...appearance,
      backgroundImageUrl: undefined,
    });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    console.log(">>> [SectionBackgroundEditor] Alterando cor do overlay:", {
      section,
      color,
    });
    onChange({
      ...appearance,
      overlay: {
        color: color,
        opacity: appearance?.overlay?.opacity ?? 0.5,
      },
    });
  };

  const handleOpacityChange = (values: number[]) => {
    const opacity = values[0] / 100;
    console.log(">>> [SectionBackgroundEditor] Alterando opacidade do overlay:", {
      section,
      opacity,
    });
    onChange({
      ...appearance,
      overlay: {
        color: appearance?.overlay?.color ?? "#000000",
        opacity: opacity,
      },
    });
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          {title}
        </h4>
      </div>

      <div className="space-y-3">
        <Label className="text-xs">Imagem de Fundo</Label>
        {appearance?.backgroundImageUrl ? (
          <div className="relative group rounded-md overflow-hidden border bg-background aspect-video">
            <Image
              src={appearance.backgroundImageUrl}
              alt="Background preview"
              className="object-cover"
              fill
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <ImageUploader
                businessId={businessId}
                section={section}
                onUploadSuccess={handleImageUpload}
                className="w-auto"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={handleRemoveImage}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <ImageUploader
            businessId={businessId}
            section={section}
            onUploadSuccess={handleImageUpload}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
        <div className="space-y-2">
          <Label className="text-xs">Cor do Overlay</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={appearance?.overlay?.color || "#000000"}
              onChange={handleColorChange}
              className="w-12 h-8 p-0 border-none cursor-pointer"
            />
            <span className="text-[10px] text-muted-foreground uppercase font-mono">
              {appearance?.overlay?.color || "#000000"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Opacidade</Label>
            <span className="text-[10px] text-muted-foreground font-mono">
              {Math.round((appearance?.overlay?.opacity ?? 0) * 100)}%
            </span>
          </div>
          <Slider
            value={[(appearance?.overlay?.opacity ?? 0) * 100]}
            onValueChange={handleOpacityChange}
            min={0}
            max={100}
            step={1}
            className="py-2"
          />
        </div>
      </div>
    </div>
  );
}
