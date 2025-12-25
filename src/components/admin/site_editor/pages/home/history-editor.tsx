"use client";

import { ImageIcon, Palette, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getStorySettings,
  type StorySettings,
  saveStorySettings,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";

interface HistoryEditorProps {
  onSave?: () => void;
  hasChanges?: boolean;
}

export function HistoryEditor({
  onSave: externalOnSave,
  hasChanges: externalHasChanges,
}: HistoryEditorProps) {
  const [settings, setSettings] = useState<StorySettings | null>(null);
  const [internalHasChanges, setInternalHasChanges] = useState(false);
  const hasChanges = externalHasChanges ?? internalHasChanges;

  useEffect(() => {
    setSettings(getStorySettings());
  }, []);

  const onUpdate = (updates: Partial<StorySettings>) => {
    if (!settings) return;
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setInternalHasChanges(true);

    // Notificar iframe para preview em tempo real
    const iframe = document.querySelector("iframe");
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "UPDATE_STORY_CONTENT",
          settings: newSettings,
        },
        "*",
      );
    }
  };

  const handleSave = () => {
    if (settings) {
      saveStorySettings(settings);
      setInternalHasChanges(false);
      if (externalOnSave) externalOnSave();
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Título e Cor */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
              <Type className="w-2.5 h-2.5" /> Título da Seção
            </Label>
            <Input
              value={settings.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="h-8 text-xs"
              placeholder="Ex: Nossa História"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
              <Palette className="w-2.5 h-2.5" /> Cor do Título
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.titleColor || "#000000"}
                className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50"
                onChange={(e) => onUpdate({ titleColor: e.target.value })}
              />
              <Input
                value={settings.titleColor || ""}
                placeholder="#HEX"
                className="h-8 text-[10px] flex-1 uppercase"
                onChange={(e) => onUpdate({ titleColor: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Conteúdo e Cor */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
              <Type className="w-2.5 h-2.5" /> Descrição da História
            </Label>
            <div className="flex items-center gap-2">
              <Label className="text-[10px] uppercase text-muted-foreground">
                Cor
              </Label>
              <Input
                type="color"
                value={settings.contentColor || "#666666"}
                className="w-6 h-6 p-0.5 rounded-full bg-transparent border-border/50"
                onChange={(e) => onUpdate({ contentColor: e.target.value })}
              />
            </div>
          </div>
          <Textarea
            value={settings.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="min-h-37.5 text-xs resize-none"
            placeholder="Conte a trajetória do seu studio..."
          />
        </div>

        {/* Imagem */}
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
            <ImageIcon className="w-2.5 h-2.5" /> URL da Imagem
          </Label>
          <div className="flex gap-2">
            <Input
              value={settings.image}
              onChange={(e) => onUpdate({ image: e.target.value })}
              className="h-8 text-xs flex-1"
              placeholder="https://..."
            />
            <Button variant="outline" size="sm" className="h-8 text-[10px]">
              Upload
            </Button>
          </div>
          <p className="text-[9px] text-muted-foreground italic">
            Recomendado: 600x400px ou proporção 3:2
          </p>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          disabled={!hasChanges}
          onClick={handleSave}
          className={cn(
            "w-full h-11 text-sm font-bold transition-all duration-300",
            hasChanges
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
          )}
        >
          {hasChanges ? "Aplicar Alterações" : "Nenhuma alteração"}
        </Button>
      </div>
    </div>
  );
}
