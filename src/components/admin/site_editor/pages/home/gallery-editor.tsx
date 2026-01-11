"use client";

import {
  ImageIcon,
  LayoutGrid,
  MousePointer2,
  RotateCcw,
  SlidersHorizontal,
  Type,
} from "lucide-react";
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
import type { GallerySettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { BackgroundEditor } from "../../components/BackgroundEditor";
import { EDITOR_FONTS } from "../../components/editor-constants";
import { SectionSubtitleEditor } from "../../components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../../components/SectionTitleEditor";

interface GalleryEditorProps {
  settings: GallerySettings;
  onUpdate: (updates: Partial<GallerySettings>) => void;
  onSave?: () => void;
  hasChanges?: boolean;
}

export function GalleryEditor({
  settings,
  onUpdate,
  onSave,
  hasChanges,
}: GalleryEditorProps) {
  if (!settings) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <Accordion
        type="single"
        collapsible
        defaultValue="title"
        className="w-full space-y-4 border-none"
      >
        {/* Título */}
        <AccordionItem
          value="title"
          className="border rounded-lg px-4 bg-card/50"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-serif italic text-sm">
              <Type className="w-4 h-4" /> TÍTULO DA SEÇÃO
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <SectionTitleEditor
              title={settings.title}
              font={settings.titleFont}
              color={settings.titleColor}
              onUpdate={(updates) =>
                onUpdate({
                  ...(updates.title !== undefined && { title: updates.title }),
                  ...(updates.font !== undefined && {
                    titleFont: updates.font,
                  }),
                  ...(updates.color !== undefined && {
                    titleColor: updates.color,
                  }),
                })
              }
            />
          </AccordionContent>
        </AccordionItem>

        {/* Subtítulo */}
        <AccordionItem
          value="subtitle"
          className="border rounded-lg px-4 bg-card/50"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-serif italic text-sm">
              <Type className="w-4 h-4" /> SUBTÍTULO DA SEÇÃO
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <SectionSubtitleEditor
              subtitle={settings.subtitle}
              font={settings.subtitleFont}
              color={settings.subtitleColor}
              onUpdate={(updates) =>
                onUpdate({
                  ...(updates.subtitle !== undefined && {
                    subtitle: updates.subtitle,
                  }),
                  ...(updates.font !== undefined && {
                    subtitleFont: updates.font,
                  }),
                  ...(updates.color !== undefined && {
                    subtitleColor: updates.color,
                  }),
                })
              }
            />
          </AccordionContent>
        </AccordionItem>

        {/* Botão */}
        <AccordionItem
          value="button"
          className="border rounded-lg px-4 bg-card/50"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-serif italic text-sm">
              <MousePointer2 className="w-4 h-4" /> BOTÃO DE AÇÃO
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <fieldset
              className="space-y-1.5 border-none p-0 m-0"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                Texto do Botão
              </legend>
              <Input
                value={settings.buttonText}
                onChange={(e) => onUpdate({ buttonText: e.target.value })}
                className="h-8 text-xs"
              />
            </fieldset>

            <div className="grid grid-cols-2 gap-4">
              <fieldset
                className="space-y-1.5 border-none p-0 m-0"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                  Fonte do Botão
                </legend>
                <Select
                  value={settings.buttonFont || "default"}
                  onValueChange={(v) =>
                    onUpdate({ buttonFont: v === "default" ? "" : v })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Padrão do Site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" className="text-xs font-medium">
                      Padrão do Site
                    </SelectItem>
                    {EDITOR_FONTS.map((f) => (
                      <SelectItem
                        key={f.name}
                        value={f.name}
                        className="text-xs"
                      >
                        <span style={{ fontFamily: f.name }}>{f.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </fieldset>

              <div className="space-y-4">
                <fieldset
                  className="space-y-1.5 border-none p-0 m-0"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
                    Cor do Botão
                    {settings.buttonColor && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:text-primary"
                        onClick={() => onUpdate({ buttonColor: "" })}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
                  </legend>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.buttonColor || "#000000"}
                      className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                      onChange={(e) =>
                        onUpdate({ buttonColor: e.target.value })
                      }
                    />
                    <Input
                      value={settings.buttonColor || ""}
                      placeholder="Padrão"
                      className="h-8 text-[10px] flex-1 uppercase"
                      onChange={(e) =>
                        onUpdate({ buttonColor: e.target.value })
                      }
                    />
                  </div>
                </fieldset>

                <fieldset
                  className="space-y-1.5 border-none p-0 m-0"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
                    Cor do Texto
                    {settings.buttonTextColor && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:text-primary"
                        onClick={() => onUpdate({ buttonTextColor: "" })}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
                  </legend>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.buttonTextColor || "#FFFFFF"}
                      className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                      onChange={(e) =>
                        onUpdate({ buttonTextColor: e.target.value })
                      }
                    />
                    <Input
                      value={settings.buttonTextColor || ""}
                      placeholder="Padrão"
                      className="h-8 text-[10px] flex-1 uppercase"
                      onChange={(e) =>
                        onUpdate({ buttonTextColor: e.target.value })
                      }
                    />
                  </div>
                </fieldset>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Estilo de Exibição */}
        <AccordionItem
          value="layout"
          className="border rounded-lg px-4 bg-card/50"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-serif italic text-sm">
              <LayoutGrid className="w-4 h-4" /> ESTILO DE EXIBIÇÃO
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onUpdate({ layout: "grid" })}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
                  settings.layout === "grid"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30 hover:bg-muted/50",
                )}
              >
                <div className="w-full aspect-video rounded-lg bg-muted border border-dashed border-border flex items-center justify-center">
                  <LayoutGrid className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <span className="text-xs font-bold">Grade (Padrão)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdate({ layout: "carousel" })}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
                  settings.layout === "carousel"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30 hover:bg-muted/50",
                )}
              >
                <div className="w-full aspect-video rounded-lg bg-muted border border-dashed border-border flex items-center justify-center">
                  <SlidersHorizontal className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <span className="text-xs font-bold">Slide (Carrossel)</span>
              </button>
            </div>
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
              settings={settings}
              onUpdate={(updates) => onUpdate(updates)}
              sectionId="gallery"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-2">
        <Button
          type="button"
          disabled={!hasChanges}
          onClick={onSave}
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
