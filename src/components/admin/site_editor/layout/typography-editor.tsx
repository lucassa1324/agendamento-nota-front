"use client";

import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TypographyEditorProps {
  settings: {
    headingFont: string;
    subtitleFont: string;
    bodyFont: string;
  };
  onUpdate: (updates: Partial<TypographyEditorProps["settings"]>) => void;
  onHighlight?: (id: string) => void;
  hasChanges?: boolean;
  onSave?: () => void;
}

export function TypographyEditor({
  settings,
  onUpdate,
  onHighlight,
  hasChanges,
  onSave,
}: TypographyEditorProps) {
  const handleAccordionChange = (values: string | string[]) => {
    if (onHighlight) {
      const highlightMap: Record<string, string> = {
        "item-headings": "hero-title",
        "item-subtitles": "hero-subtitle",
        "item-body": "services-description",
      };
      
      const activeValues = Array.isArray(values) ? values : [values];
      const lastValue = activeValues[activeValues.length - 1];
      
      if (lastValue && highlightMap[lastValue]) {
        onHighlight(highlightMap[lastValue]);
      }
    }
  };

  const fontOptions = [
    { value: "Playfair Display", label: "Playfair Display" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Inter", label: "Inter" },
    { value: "Lora", label: "Lora" },
    { value: "Poppins", label: "Poppins" },
    { value: "Merriweather", label: "Merriweather" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Cormorant Garamond", label: "Cormorant Garamond" },
    { value: "Cinzel", label: "Cinzel" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Accordion
        type="multiple"
        className="w-full space-y-2 border-none"
        onValueChange={handleAccordionChange}
      >
        <AccordionItem
          value="item-headings"
          className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Plus className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Fonte dos Títulos (Serif)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <fieldset
              className="space-y-1.5 border-none p-0 m-0 pt-1"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 ml-1">
                Selecione a fonte principal
              </legend>
              <Select
                value={settings.headingFont}
                onValueChange={(val) => onUpdate({ headingFont: val })}
              >
                <SelectTrigger className="h-9 text-sm bg-background">
                  <SelectValue placeholder="Selecione uma fonte" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </fieldset>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="item-subtitles"
          className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Plus className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Fonte dos Subtítulos
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <fieldset
              className="space-y-1.5 border-none p-0 m-0 pt-1"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 ml-1">
                Selecione a fonte para subtítulos
              </legend>
              <Select
                value={settings.subtitleFont}
                onValueChange={(val) => onUpdate({ subtitleFont: val })}
              >
                <SelectTrigger className="h-9 text-sm bg-background">
                  <SelectValue placeholder="Selecione uma fonte" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </fieldset>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="item-body"
          className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Plus className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Fonte do Corpo (Sans)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <fieldset
              className="space-y-1.5 border-none p-0 m-0 pt-1"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 ml-1">
                Selecione a fonte para textos
              </legend>
              <Select
                value={settings.bodyFont}
                onValueChange={(val) => onUpdate({ bodyFont: val })}
              >
                <SelectTrigger className="h-9 text-sm bg-background">
                  <SelectValue placeholder="Selecione uma fonte" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </fieldset>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="p-4 rounded-lg bg-background border border-border space-y-3">
        <div className="p-4 rounded-lg bg-background border border-border space-y-3">
          <Label className="text-[9px] text-muted-foreground uppercase">
            Prévia
          </Label>
          <div className="space-y-2">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: settings.headingFont }}
            >
              Título de Exemplo
            </h1>
            <h3
              className="text-lg font-medium text-muted-foreground"
              style={{ fontFamily: settings.subtitleFont }}
            >
              Subtítulo de Exemplo
            </h3>
            <p className="text-sm" style={{ fontFamily: settings.bodyFont }}>
              Este é um exemplo de como o texto do corpo ficará com a fonte
              selecionada. O design é focado em legibilidade e harmonia.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          disabled={!hasChanges}
          onClick={onSave}
          className={`w-full h-11 text-sm font-bold transition-all duration-300 ${
            hasChanges
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          }`}
        >
          {hasChanges ? "Aplicar Fontes" : "Nenhuma alteração"}
        </Button>
      </div>
    </div>
  );
}
