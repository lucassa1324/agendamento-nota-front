"use client";

import { Layout, MousePointer2, RotateCcw, Type } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import type { HeaderSettings } from "@/lib/booking-data";
import { EDITOR_FONTS } from "../components/editor-constants";

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
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                    Cor de Fundo
                  </Label>
                  {settings.bgColor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => onUpdate({ bgColor: "" })}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.bgColor || "#ffffff"}
                    onChange={(e) => onUpdate({ bgColor: e.target.value })}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.bgColor}
                    placeholder="Padrão do Site"
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
                  Fonte do Título/Logo
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
                        <span style={{ fontFamily: font.name }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                  Fonte dos Links
                </Label>
                <Select
                  value={settings.linksFont || "default"}
                  onValueChange={(val) =>
                    onUpdate({ linksFont: val === "default" ? "" : val })
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
                        <span style={{ fontFamily: font.name }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                    Cor dos Links/Nomes
                  </Label>
                  {settings.textColor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => onUpdate({ textColor: "" })}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
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
                    placeholder="Padrão do Site"
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
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                    Cor de Fundo do Botão
                  </Label>
                  {settings.buttonBgColor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => onUpdate({ buttonBgColor: "" })}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
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
                    placeholder="Padrão do Site"
                    onChange={(e) => onUpdate({ buttonBgColor: e.target.value })}
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                    Cor do Texto do Botão
                  </Label>
                  {settings.buttonTextColor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => onUpdate({ buttonTextColor: "" })}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
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
                    placeholder="Padrão do Site"
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
