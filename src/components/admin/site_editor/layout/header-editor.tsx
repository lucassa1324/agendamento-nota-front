"use client";

import { Type, MousePointer2, Layout } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { HeaderSettings } from "@/lib/booking-data";

interface HeaderEditorProps {
  settings: HeaderSettings;
  onUpdate: (updates: Partial<HeaderSettings>) => void;
  hasChanges?: boolean;
  onSave?: () => void;
}

export function HeaderEditor({
  settings,
  onUpdate,
  hasChanges,
  onSave,
}: HeaderEditorProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Accordion
        type="multiple"
        className="w-full space-y-2 border-none"
      >
        {/* Background & Glassmorphism */}
        <AccordionItem
          value="item-background"
          className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Layout className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Fundo & Efeito Glass
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
                    value={settings.bgColor}
                    onChange={(e) => onUpdate({ bgColor: e.target.value })}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.bgColor}
                    onChange={(e) => onUpdate({ bgColor: e.target.value })}
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                    Opacidade ({Math.round(settings.opacity * 100)}%)
                  </Label>
                </div>
                <Slider
                  value={[settings.opacity * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([val]) => onUpdate({ opacity: val / 100 })}
                  className="py-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                    Desfoque (Blur: {settings.blurAmount}px)
                  </Label>
                </div>
                <Slider
                  value={[settings.blurAmount]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={([val]) => onUpdate({ blurAmount: val })}
                  className="py-2"
                />
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
                Cores dos Textos
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                  Cor dos Links/Nomes
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.textColor || "#000000"}
                    onChange={(e) => onUpdate({ textColor: e.target.value })}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.textColor}
                    placeholder="Padrão do sistema"
                    onChange={(e) => onUpdate({ textColor: e.target.value })}
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Buttons */}
        <AccordionItem
          value="item-buttons"
          className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <MousePointer2 className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Botões de Ação
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                  Cor de Fundo do Botão
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.buttonBgColor || "#000000"}
                    onChange={(e) => onUpdate({ buttonBgColor: e.target.value })}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.buttonBgColor}
                    placeholder="Padrão do sistema"
                    onChange={(e) => onUpdate({ buttonBgColor: e.target.value })}
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                  Cor do Texto do Botão
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.buttonTextColor || "#ffffff"}
                    onChange={(e) => onUpdate({ buttonTextColor: e.target.value })}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.buttonTextColor}
                    placeholder="Padrão do sistema"
                    onChange={(e) => onUpdate({ buttonTextColor: e.target.value })}
                    className="h-8 text-xs flex-1"
                  />
                </div>
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
          {hasChanges ? "Aplicar Cabeçalho" : "Nenhuma alteração"}
        </Button>
      </div>
    </div>
  );
}
