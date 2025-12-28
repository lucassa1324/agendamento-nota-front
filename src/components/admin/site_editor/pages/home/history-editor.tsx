"use client";

import { ImageIcon, Image as ImageIcon2, Palette, RotateCcw, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getStorySettings,
  type StorySettings,
  saveStorySettings,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { BackgroundEditor } from "../../components/BackgroundEditor";
import { EDITOR_FONTS } from "../../components/editor-constants";

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
          type: "UPDATE_STORY_SETTINGS",
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
        <div className="grid grid-cols-1 gap-3">
          <fieldset 
            className="space-y-1.5 border-none p-0 m-0" 
            onPointerDown={(e) => e.stopPropagation()} 
            onMouseDown={(e) => e.stopPropagation()} 
            onClick={(e) => e.stopPropagation()} 
            onKeyDown={(e) => e.stopPropagation()}
          >
            <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
              <Type className="w-2.5 h-2.5" /> Título da Seção
            </legend>
            <Input
              value={settings.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="h-8 text-xs"
              placeholder="Ex: Nossa História"
            />
          </fieldset>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <fieldset 
            className="space-y-1.5 border-none p-0 m-0"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
              Fonte do Título
            </legend>
            <Select
              value={settings.titleFont || "default"}
              onValueChange={(v) => onUpdate({ titleFont: v === "default" ? "" : v })}
            >
              <SelectTrigger className="h-8 text-[10px]">
                <SelectValue placeholder="Padrão do Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default" className="text-[10px]">
                  Padrão do Site
                </SelectItem>
                {EDITOR_FONTS.map((f) => (
                  <SelectItem key={f.name} value={f.name} className="text-[10px]">
                    <span style={{ fontFamily: f.name }}>{f.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </fieldset>

          <fieldset 
            className="space-y-1.5 border-none p-0 m-0" 
            onPointerDown={(e) => e.stopPropagation()} 
            onMouseDown={(e) => e.stopPropagation()} 
            onClick={(e) => e.stopPropagation()} 
            onKeyDown={(e) => e.stopPropagation()}
          >
            <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Palette className="w-2.5 h-2.5" /> Cor do Título
              </span>
              {settings.titleColor && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 hover:text-primary"
                  onClick={() => onUpdate({ titleColor: "" })}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </legend>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.titleColor || "#000000"}
                className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50"
                onChange={(e) => onUpdate({ titleColor: e.target.value })}
              />
              <Input
                value={settings.titleColor || ""}
                placeholder="Padrão"
                className="h-8 text-[10px] flex-1 uppercase"
                onChange={(e) => onUpdate({ titleColor: e.target.value })}
              />
            </div>
          </fieldset>
        </div>
      </div>

      {/* Conteúdo e Cor do Texto */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <fieldset 
          className="space-y-1.5 border-none p-0 m-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
            Texto da História
          </legend>
          <Textarea
            value={settings.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="min-h-30 text-[11px] leading-snug resize-none"
            placeholder="Conte a história do seu negócio..."
          />
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <fieldset 
            className="space-y-1.5 border-none p-0 m-0"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
              Fonte do Texto
            </legend>
            <Select
              value={settings.contentFont || "default"}
              onValueChange={(v) => onUpdate({ contentFont: v === "default" ? "" : v })}
            >
              <SelectTrigger className="h-8 text-[10px]">
                <SelectValue placeholder="Padrão do Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default" className="text-[10px]">
                  Padrão do Site
                </SelectItem>
                {EDITOR_FONTS.map((f) => (
                  <SelectItem key={f.name} value={f.name} className="text-[10px]">
                    <span style={{ fontFamily: f.name }}>{f.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </fieldset>

          <fieldset 
            className="space-y-1.5 border-none p-0 m-0"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
              Cor do Texto
              {settings.contentColor && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 hover:text-primary"
                  onClick={() => onUpdate({ contentColor: "" })}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </legend>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.contentColor || "#333333"}
                className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50"
                onChange={(e) => onUpdate({ contentColor: e.target.value })}
              />
              <Input
                value={settings.contentColor || ""}
                placeholder="Padrão"
                className="h-8 text-[10px] flex-1 uppercase"
                onChange={(e) => onUpdate({ contentColor: e.target.value })}
              />
            </div>
          </fieldset>
        </div>

        {/* Imagem */}
        <fieldset 
          className="space-y-1.5 border-none p-0 m-0" 
          onPointerDown={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()} 
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
            <ImageIcon2 className="w-2.5 h-2.5" /> URL da Imagem
          </legend>
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
        </fieldset>
      </div>

      {/* Fundo da Seção */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <fieldset 
          className="space-y-1.5 border-none p-0 m-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
            <ImageIcon className="w-2.5 h-2.5" /> Fundo da Seção
          </legend>
          <BackgroundEditor
            settings={settings}
            onUpdate={(updates) => onUpdate(updates)}
            sectionId="story"
          />
        </fieldset>
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
