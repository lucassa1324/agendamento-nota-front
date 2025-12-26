"use client";

import { ImageIcon, Type } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { GallerySettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { SectionTitleEditor } from "../../components/SectionTitleEditor";
import { SectionSubtitleEditor } from "../../components/SectionSubtitleEditor";
import { BackgroundEditor } from "../../components/BackgroundEditor";

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
                  ...(updates.font !== undefined && { titleFont: updates.font }),
                  ...(updates.color !== undefined && { titleColor: updates.color }),
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
                  ...(updates.subtitle !== undefined && { subtitle: updates.subtitle }),
                  ...(updates.font !== undefined && { subtitleFont: updates.font }),
                  ...(updates.color !== undefined && { subtitleColor: updates.color }),
                })
              }
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
