"use client";

import { Layout, Palette, RotateCcw, Type } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FooterSettings } from "@/lib/booking-data";
import { EDITOR_FONTS } from "../components/editor-constants";

interface FooterEditorProps {
  settings: FooterSettings;
  onUpdate: (updates: Partial<FooterSettings>) => void;
  hasChanges?: boolean;
  onSave?: () => void;
}

export function FooterEditor({
  settings,
  onUpdate,
  hasChanges,
  onSave,
}: FooterEditorProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <Accordion type="multiple" className="w-full space-y-2 border-none">
        {/* Background */}
        <AccordionItem
          value="item-background"
          className="border rounded-lg bg-card/50 px-3 overflow-hidden border-border/50"
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
                <Label className="text-[10px] uppercase text-muted-foreground font-medium flex justify-between items-center">
                  Cor de Fundo
                  {settings.bgColor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:text-primary"
                      onClick={() => onUpdate({ bgColor: "" })}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  )}
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
                    value={settings.bgColor || ""}
                    placeholder="Padrão"
                    onChange={(e) => onUpdate({ bgColor: e.target.value })}
                    className="h-8 text-[10px] flex-1"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Colors */}
        <AccordionItem
          value="item-colors"
          className="border rounded-lg bg-card/50 px-3 overflow-hidden border-border/50"
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
                <Label className="text-[10px] uppercase text-muted-foreground font-medium flex justify-between items-center">
                  Cor dos Títulos
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
                    value={settings.titleColor || ""}
                    placeholder="Padrão"
                    onChange={(e) => onUpdate({ titleColor: e.target.value })}
                    className="h-8 text-[10px] flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-medium flex justify-between items-center">
                  Cor dos Textos/Links
                  {settings.textColor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:text-primary"
                      onClick={() => onUpdate({ textColor: "" })}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  )}
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
                    value={settings.textColor || ""}
                    placeholder="Padrão"
                    onChange={(e) => onUpdate({ textColor: e.target.value })}
                    className="h-8 text-[10px] flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-medium flex justify-between items-center">
                  Cor dos Ícones
                  {settings.iconColor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:text-primary"
                      onClick={() => onUpdate({ iconColor: "" })}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  )}
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
                    value={settings.iconColor || ""}
                    placeholder="Padrão"
                    onChange={(e) => onUpdate({ iconColor: e.target.value })}
                    className="h-8 text-[10px] flex-1"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Typography */}
        <AccordionItem
          value="item-typography"
          className="border rounded-lg bg-card/50 px-3 overflow-hidden border-border/50"
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
                  value={settings.titleFont || "default"}
                  onValueChange={(val) =>
                    onUpdate({ titleFont: val === "default" ? "" : val })
                  }
                >
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue placeholder="Padrão do Site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" className="text-[10px]">
                      Padrão do Site
                    </SelectItem>
                    {EDITOR_FONTS.map((font) => (
                      <SelectItem
                        key={font.name}
                        value={font.name}
                        className="text-[10px]"
                      >
                        <span style={{ fontFamily: font.name }}>
                          {font.name}
                        </span>
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
                  value={settings.bodyFont || "default"}
                  onValueChange={(val) =>
                    onUpdate({ bodyFont: val === "default" ? "" : val })
                  }
                >
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue placeholder="Padrão do Site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" className="text-[10px]">
                      Padrão do Site
                    </SelectItem>
                    {EDITOR_FONTS.map((font) => (
                      <SelectItem
                        key={font.name}
                        value={font.name}
                        className="text-[10px]"
                      >
                        <span style={{ fontFamily: font.name }}>
                          {font.name}
                        </span>
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
