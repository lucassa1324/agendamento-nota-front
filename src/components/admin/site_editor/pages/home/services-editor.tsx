"use client";

import { CreditCard, ImageIcon, Type } from "lucide-react";
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
import type { ServicesSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { BackgroundEditor } from "../../components/BackgroundEditor";
import { EDITOR_FONTS } from "../../components/editor-constants";
import { SectionSubtitleEditor } from "../../components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../../components/SectionTitleEditor";

interface ServicesEditorProps {
  settings: ServicesSettings;
  onUpdate: (updates: Partial<ServicesSettings>) => void;
  onSave?: () => void;
  hasChanges?: boolean;
}

export function ServicesEditor({
  settings,
  onUpdate,
  onSave: externalOnSave,
  hasChanges,
}: ServicesEditorProps) {
  const handleSave = () => {
    if (externalOnSave) externalOnSave();
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <Accordion
        type="single"
        collapsible
        defaultValue="content"
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

        {/* Cards */}
        <AccordionItem
          value="cards"
          className="border rounded-lg px-4 bg-card/50"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-serif italic text-sm">
              <CreditCard className="w-4 h-4" /> ESTILO DOS CARDS
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pb-4">
            <div className="space-y-6">
              {/* Cores Base do Card */}
              <div className="grid grid-cols-2 gap-4">
                <fieldset 
                  className="space-y-1.5 border-none p-0 m-0" 
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                    Fundo do Card
                  </legend>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.cardBgColor || "#ffffff"}
                      className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                      onChange={(e) =>
                        onUpdate({ cardBgColor: e.target.value })
                      }
                    />
                    <Input
                      value={settings.cardBgColor || ""}
                      placeholder="#HEX"
                      className="h-8 text-[10px] flex-1 uppercase"
                      onChange={(e) =>
                        onUpdate({ cardBgColor: e.target.value })
                      }
                    />
                  </div>
                </fieldset>
                <fieldset 
                  className="space-y-1.5 border-none p-0 m-0"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                    Cor dos Ícones
                  </legend>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.cardIconColor || "#000000"}
                      className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                      onChange={(e) =>
                        onUpdate({ cardIconColor: e.target.value })
                      }
                    />
                    <Input
                      value={settings.cardIconColor || ""}
                      placeholder="#HEX"
                      className="h-8 text-[10px] flex-1 uppercase"
                      onChange={(e) =>
                        onUpdate({ cardIconColor: e.target.value })
                      }
                    />
                  </div>
                </fieldset>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label className="text-[11px] font-bold uppercase text-primary tracking-wider">
                  Título do Card
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <fieldset 
                    className="space-y-1.5 border-none p-0 m-0" 
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Fonte
                    </legend>
                    <Select
                      value={settings.cardTitleFont}
                      onValueChange={(v) => onUpdate({ cardTitleFont: v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Fonte" />
                      </SelectTrigger>
                      <SelectContent>
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
                  <fieldset 
                    className="space-y-1.5 border-none p-0 m-0" 
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Cor
                    </legend>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cardTitleColor || "#000000"}
                        className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                        onChange={(e) =>
                          onUpdate({ cardTitleColor: e.target.value })
                        }
                      />
                      <Input
                        value={settings.cardTitleColor || ""}
                        placeholder="#HEX"
                        className="h-8 text-[10px] flex-1 uppercase"
                        onChange={(e) =>
                          onUpdate({ cardTitleColor: e.target.value })
                        }
                      />
                    </div>
                  </fieldset>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label className="text-[11px] font-bold uppercase text-primary tracking-wider">
                  Descrição do Card
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <fieldset 
                    className="space-y-1.5 border-none p-0 m-0" 
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Fonte
                    </legend>
                    <Select
                      value={settings.cardDescriptionFont}
                      onValueChange={(v) =>
                        onUpdate({ cardDescriptionFont: v })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Fonte" />
                      </SelectTrigger>
                      <SelectContent>
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
                  <fieldset 
                    className="space-y-1.5 border-none p-0 m-0" 
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Cor
                    </legend>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cardDescriptionColor || "#666666"}
                        className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                        onChange={(e) =>
                          onUpdate({ cardDescriptionColor: e.target.value })
                        }
                      />
                      <Input
                        value={settings.cardDescriptionColor || ""}
                        placeholder="#HEX"
                        className="h-8 text-[10px] flex-1 uppercase"
                        onChange={(e) =>
                          onUpdate({ cardDescriptionColor: e.target.value })
                        }
                      />
                    </div>
                  </fieldset>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label className="text-[11px] font-bold uppercase text-primary tracking-wider">
                  Preço/Valor
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <fieldset 
                    className="space-y-1.5 border-none p-0 m-0" 
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Fonte
                    </legend>
                    <Select
                      value={settings.cardPriceFont}
                      onValueChange={(v) => onUpdate({ cardPriceFont: v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Fonte" />
                      </SelectTrigger>
                      <SelectContent>
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
                  <fieldset
                    className="space-y-1.5 border-none p-0 m-0"
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Cor
                    </legend>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cardPriceColor || "#000000"}
                        className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                        onChange={(e) =>
                          onUpdate({ cardPriceColor: e.target.value })
                        }
                      />
                      <Input
                        value={settings.cardPriceColor || ""}
                        placeholder="#HEX"
                        className="h-8 text-[10px] flex-1 uppercase"
                        onChange={(e) =>
                          onUpdate({ cardPriceColor: e.target.value })
                        }
                      />
                    </div>
                  </fieldset>
                </div>
              </div>
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
              sectionId="services"
            />
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
          {hasChanges ? "Aplicar Alterações" : "Nenhuma alteração"}
        </Button>
      </div>
    </div>
  );
}
