"use client";

import { ImageIcon, LayoutGrid, SlidersHorizontal, Type } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { GallerySettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { BackgroundEditor } from "../../components/BackgroundEditor";
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
