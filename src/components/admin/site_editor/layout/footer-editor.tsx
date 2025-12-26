"use client";

import { Palette, Type, Layout } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FooterSettings } from "@/lib/booking-data";

interface FooterEditorProps {
  settings: FooterSettings;
  onUpdate: (updates: Partial<FooterSettings>) => void;
  hasChanges?: boolean;
  onSave?: () => void;
}

const FONTS = [
  "Inter",
  "Playfair Display",
  "Montserrat",
  "Roboto",
  "Open Sans",
  "Lato",
  "Poppins",
];

export function FooterEditor({
  settings,
  onUpdate,
  hasChanges,
  onSave,
}: FooterEditorProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Accordion type="multiple" className="w-full space-y-2 border-none">
        {/* Background */}
        <AccordionItem
          value="item-background"
          className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Layout className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Fundo do Rodapé
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                  Cor de Fundo
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.bgColor || "#f8f9fa"}
                    onChange={(e) => onUpdate({ bgColor: e.target.value })}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.bgColor}
                    placeholder="Padrão (secondary/30)"
                    onChange={(e) => onUpdate({ bgColor: e.target.value })}
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Colors */}
        <AccordionItem
          value="item-colors"
          className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Palette className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Cores dos Elementos
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                  Cor dos Títulos
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.titleColor || "#000000"}
                    onChange={(e) => onUpdate({ titleColor: e.target.value })}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.titleColor}
                    placeholder="Padrão (primary)"
                    onChange={(e) => onUpdate({ titleColor: e.target.value })}
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                  Cor dos Textos/Links
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.textColor || "#666666"}
                    onChange={(e) => onUpdate({ textColor: e.target.value })}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.textColor}
                    placeholder="Padrão (muted-foreground)"
                    onChange={(e) => onUpdate({ textColor: e.target.value })}
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                  Cor dos Ícones
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.iconColor || "#000000"}
                    onChange={(e) => onUpdate({ iconColor: e.target.value })}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.iconColor}
                    placeholder="Padrão (accent)"
                    onChange={(e) => onUpdate({ iconColor: e.target.value })}
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Typography */}
        <AccordionItem
          value="item-typography"
          className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Type className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Tipografia
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                  Fonte dos Títulos
                </Label>
                <Select
                  value={settings.titleFont}
                  onValueChange={(val) => onUpdate({ titleFont: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione a fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((font) => (
                      <SelectItem key={font} value={font} className="text-xs">
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                  Fonte do Corpo
                </Label>
                <Select
                  value={settings.bodyFont}
                  onValueChange={(val) => onUpdate({ bodyFont: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione a fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((font) => (
                      <SelectItem key={font} value={font} className="text-xs">
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
          {hasChanges ? "Aplicar Rodapé" : "Nenhuma alteração"}
        </Button>
      </div>
    </div>
  );
}
