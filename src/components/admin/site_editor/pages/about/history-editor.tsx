"use client";

import { ImageIcon, Palette, RotateCcw, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { BackgroundEditor } from "@/components/admin/site_editor/components/BackgroundEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getStorySettings,
  type StorySettings,
  saveStorySettings,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { EDITOR_FONTS } from "../../components/editor-constants";

interface HistoryEditorProps {
  settings?: StorySettings;
  onUpdate?: (updates: Partial<StorySettings>) => void;
  onSave?: () => void;
  hasChanges?: boolean;
}

export function HistoryEditor({
  settings: propsSettings,
  onUpdate: propsOnUpdate,
  onSave: externalOnSave,
  hasChanges: externalHasChanges,
}: HistoryEditorProps) {
  const [localSettings, setLocalSettings] = useState<StorySettings | null>(null);
  const [internalHasChanges, setInternalHasChanges] = useState(false);
  const hasChanges = externalHasChanges ?? internalHasChanges;

  useEffect(() => {
    if (!propsSettings) {
      setLocalSettings(getStorySettings());
    }
  }, [propsSettings]);

  const settings = propsSettings || localSettings;

  const onUpdate = (updates: Partial<StorySettings>) => {
    if (!settings) return;
    
    if (propsOnUpdate) {
      propsOnUpdate(updates);
    } else {
      const newSettings = { ...settings, ...updates };
      setLocalSettings(newSettings);
      setInternalHasChanges(true);

      // Notificar iframe para preview em tempo real (apenas se for o local)
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
    }
  };

  const handleSave = () => {
    if (settings) {
      if (!propsSettings) {
        saveStorySettings(settings);
        setInternalHasChanges(false);
      }
      if (externalOnSave) externalOnSave();
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Título e Cor */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <fieldset 
            className="space-y-1.5 border-none p-0 m-0" 
            onPointerDown={(e: React.PointerEvent) => e.stopPropagation()} 
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()} 
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
          >
            <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
              <Type className="w-2.5 h-2.5" /> Título da Seção
            </legend>
            <Input
              value={settings.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ title: e.target.value })}
              className="h-8 text-xs"
              placeholder="Ex: Nossa História"
            />
          </fieldset>
          <fieldset 
            className="space-y-1.5 border-none p-0 m-0" 
            onPointerDown={(e: React.PointerEvent) => e.stopPropagation()} 
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()} 
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
          >
            <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Palette className="w-2.5 h-2.5" /> Cor do Título
              </div>
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
                className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ titleColor: e.target.value })}
              />
              <Input
                value={settings.titleColor || ""}
                placeholder="Padrão"
                className="h-8 text-[10px] flex-1 uppercase"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ titleColor: e.target.value })}
              />
            </div>
          </fieldset>
        </div>

        {/* Fonte do Título */}
        <fieldset className="space-y-1.5 border-none p-0 m-0">
          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
            <Type className="w-2.5 h-2.5" /> Fonte do Título
          </legend>
          <Select
            value={settings.titleFont || "default"}
            onValueChange={(v) => onUpdate({ titleFont: v === "default" ? "" : v })}
          >
            <SelectTrigger className="h-8 text-[10px]">
              <SelectValue placeholder="Padrão do Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default" className="text-[10px]">Padrão do Site</SelectItem>
              {EDITOR_FONTS.map((f) => (
                <SelectItem key={f.name} value={f.name} className="text-[10px]">
                  <span style={{ fontFamily: f.name }}>{f.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>

        {/* Conteúdo e Cor */}
        <fieldset 
          className="space-y-1.5 border-none p-0 m-0" 
          onPointerDown={(e: React.PointerEvent) => e.stopPropagation()} 
          onMouseDown={(e: React.MouseEvent) => e.stopPropagation()} 
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-1.5">
            <legend className="text-[10px] uppercase text-muted-foreground font-medium flex items-center gap-1">
              <Type className="w-2.5 h-2.5" /> Descrição da História
            </legend>
            <div className="flex items-center gap-2">
              <Label className="text-[10px] uppercase text-muted-foreground">
                Cor
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  type="color"
                  value={settings.contentColor || "#666666"}
                  className="w-6 h-6 p-0.5 rounded-full bg-transparent border-border/50 cursor-pointer"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ contentColor: e.target.value })}
                />
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
              </div>
            </div>
          </div>
          <Textarea
            value={settings.content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate({ content: e.target.value })}
            className="min-h-37.5 text-xs resize-none mb-3"
            placeholder="Conte a trajetória do seu studio..."
          />

          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
            <Type className="w-2.5 h-2.5" /> Fonte do Conteúdo
          </legend>
          <Select
            value={settings.contentFont || "default"}
            onValueChange={(v) => onUpdate({ contentFont: v === "default" ? "" : v })}
          >
            <SelectTrigger className="h-8 text-[10px]">
              <SelectValue placeholder="Padrão do Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default" className="text-[10px]">Padrão do Site</SelectItem>
              {EDITOR_FONTS.map((f) => (
                <SelectItem key={f.name} value={f.name} className="text-[10px]">
                  <span style={{ fontFamily: f.name }}>{f.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>

        {/* Imagem */}
        <fieldset 
          className="space-y-1.5 border-none p-0 m-0" 
          onPointerDown={(e: React.PointerEvent) => e.stopPropagation()} 
          onMouseDown={(e: React.MouseEvent) => e.stopPropagation()} 
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
        >
          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
            <ImageIcon className="w-2.5 h-2.5" /> URL da Imagem
          </legend>
          <div className="flex gap-2">
            <Input
              value={settings.image}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ image: e.target.value })}
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

      <BackgroundEditor
        settings={settings}
        onUpdate={onUpdate}
        sectionId="story"
      />

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
