"use client";

import { ImageIcon, Image as ImageIcon2, RotateCcw, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { BackgroundEditor, type BackgroundSettings } from "@/components/admin/site_editor/components/BackgroundEditor";
import { ImageUploader } from "@/components/admin/site_editor/components/ImageUploader";
import { SectionBackgroundEditor } from "@/components/admin/site_editor/components/SectionBackgroundEditor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { useStudio } from "@/context/studio-context";
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
  onUpdateBackground?: (updates: Partial<BackgroundSettings>, sectionId?: string) => void;
  onSave?: () => void;
  hasChanges?: boolean;
}

export function HistoryEditor({
  settings: propsSettings,
  onUpdate: propsOnUpdate,
  onUpdateBackground,
  onSave: externalOnSave,
  hasChanges: externalHasChanges,
}: HistoryEditorProps) {
  const { studio } = useStudio();
  const [localSettings, setLocalSettings] = useState<StorySettings | null>(
    null,
  );
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <Accordion
        type="multiple"
        defaultValue={["title", "content", "image"]}
        className="w-full space-y-4 border-none"
      >
        {/* Título e Cor */}
        <AccordionItem
          value="title"
          className="border rounded-lg px-4 bg-card/50"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-serif italic text-sm">
              <Type className="w-4 h-4" /> TÍTULO DA SEÇÃO
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <div className="grid grid-cols-1 gap-3">
              <fieldset
                className="space-y-1.5 border-none p-0 m-0"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                  Texto do Título
                </legend>
                <Input
                  value={settings.title || ""}
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
                  onValueChange={(v) =>
                    onUpdate({ titleFont: v === "default" ? "" : v })
                  }
                >
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue placeholder="Padrão do Site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" className="text-[10px]">
                      Padrão do Site
                    </SelectItem>
                    {EDITOR_FONTS.map((f) => (
                      <SelectItem
                        key={f.name}
                        value={f.name}
                        className="text-[10px]"
                      >
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
                  Cor do Título
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
          </AccordionContent>
        </AccordionItem>

        {/* Conteúdo e Cor do Texto */}
        <AccordionItem
          value="content"
          className="border rounded-lg px-4 bg-card/50"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-serif italic text-sm">
              <Type className="w-4 h-4" /> CONTEÚDO DA HISTÓRIA
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <fieldset
              className="space-y-1.5 border-none p-0 m-0"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                Texto da História
              </legend>
              <Textarea
                value={settings.content || ""}
                onChange={(e) => onUpdate({ content: e.target.value })}
                className="min-h-32 text-[11px] leading-snug resize-none"
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
                  onValueChange={(v) =>
                    onUpdate({ contentFont: v === "default" ? "" : v })
                  }
                >
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue placeholder="Padrão do Site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" className="text-[10px]">
                      Padrão do Site
                    </SelectItem>
                    {EDITOR_FONTS.map((f) => (
                      <SelectItem
                        key={f.name}
                        value={f.name}
                        className="text-[10px]"
                      >
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
          </AccordionContent>
        </AccordionItem>

        {/* Imagem de Destaque */}
        <AccordionItem
          value="image"
          className="border rounded-lg px-4 bg-card/50"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-serif italic text-sm">
              <ImageIcon2 className="w-4 h-4" /> IMAGEM DE DESTAQUE
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <ImageUploader
              onUploadSuccess={(url) => onUpdate({ image: url })}
              businessId={studio?.id || ""}
              section="story"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Fundo da Seção */}
        <AccordionItem
          value="background"
          className="border rounded-lg px-4 bg-card/50"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-serif italic text-sm">
              <ImageIcon className="w-4 h-4" /> FUNDO DA SEÇÃO
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <BackgroundEditor
              settings={{
                bgType: settings.bgType,
                bgColor: settings.bgColor,
                bgImage: settings.bgImage,
                imageOpacity: settings.imageOpacity,
                overlayOpacity: settings.overlayOpacity,
                imageScale: settings.imageScale,
                imageX: settings.imageX,
                imageY: settings.imageY,
                appearance: settings.appearance,
              }}
              onUpdate={(updates) => {
                if (onUpdateBackground) {
                  onUpdateBackground(updates, "story");
                } else {
                  onUpdate(updates);
                }
              }}
              section="story"
              businessId={studio?.id || ""}
            />

            <div className="mt-6 pt-6 border-t border-border/50">
              <SectionBackgroundEditor
                section="story"
                businessId={studio?.id || ""}
                appearance={settings.appearance}
                onChange={(appearance) => onUpdate({ appearance })}
                title="Fundo Personalizado (B2)"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
          {hasChanges ? "Salvar Alterações" : "Nenhuma alteração"}
        </Button>
      </div>
    </div>
  );
}
