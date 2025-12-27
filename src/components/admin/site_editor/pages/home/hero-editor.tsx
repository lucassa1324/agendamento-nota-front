"use client";

import {
  Award,
  Crown,
  Eye,
  EyeOff,
  Flower2,
  Gem,
  Heart,
  Moon,
  Palette,
  Plus,
  Smile,
  Sparkles,
  Star,
  Sun,
  Type,
} from "lucide-react";
import type { ChangeEvent } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { BackgroundEditor } from "../../components/BackgroundEditor";
import { EDITOR_FONTS } from "../../components/editor-constants";
import { SectionSubtitleEditor } from "../../components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../../components/SectionTitleEditor";

const availableIcons = [
  { name: "Sparkles", icon: Sparkles },
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
  { name: "Crown", icon: Crown },
  { name: "Flower2", icon: Flower2 },
  { name: "Moon", icon: Moon },
  { name: "Sun", icon: Sun },
  { name: "Gem", icon: Gem },
  { name: "Smile", icon: Smile },
  { name: "Award", icon: Award },
];

interface HeroEditorProps {
  settings: {
    badge: string;
    showBadge: boolean;
    badgeIcon: string;
    badgeColor: string;
    badgeTextColor: string;
    title: string;
    subtitle: string;
    primaryButton: string;
    secondaryButton: string;
    bgType: "color" | "image";
    bgColor: string;
    bgImage: string;
    imageOpacity: number;
    overlayOpacity: number;
    imageScale: number;
    imageX: number;
    imageY: number;
    // Novos campos de estilo local
    titleFont: string;
    subtitleFont: string;
    badgeFont: string;
    primaryButtonColor: string;
    secondaryButtonColor: string;
    primaryButtonTextColor: string;
    secondaryButtonTextColor: string;
    titleColor: string;
    subtitleColor: string;
    primaryButtonFont: string;
    secondaryButtonFont: string;
  };
  onUpdate: (updates: Partial<HeroEditorProps["settings"]>) => void;
  onHighlight?: (sectionId: string) => void;
  hasChanges?: boolean;
  onSave?: () => void;
}

export function HeroEditor({
  settings,
  onUpdate,
  onHighlight,
  hasChanges,
  onSave,
}: HeroEditorProps) {
  const handleAccordionChange = (values: string | string[]) => {
    if (onHighlight) {
      const highlightMap: Record<string, string> = {
        "item-badge": "hero-badge",
        "item-title": "hero-title",
        "item-subtitle": "hero-subtitle",
        "item-buttons": "hero-buttons",
        "item-background": "hero-bg",
      };

      // Se for multiple, values será um array
      const activeValues = Array.isArray(values) ? values : [values];

      // Destaca o último item aberto
      const lastValue = activeValues[activeValues.length - 1];
      if (lastValue && highlightMap[lastValue]) {
        onHighlight(highlightMap[lastValue]);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 mb-4">
          <TabsTrigger value="content" className="text-xs">
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs">
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 mt-0">
          <Accordion
            type="multiple"
            className="w-full space-y-2 border-none"
            onValueChange={handleAccordionChange}
          >
            {/* Badge Section */}
            <AccordionItem
              value="item-badge"
              className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tag de Destaque (Badge)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4 space-y-4">
                  {/* biome-ignore lint/a11y/noStaticElementInteractions: Necessário para evitar propagação em componentes de UI */}
                  <div 
                    className="flex items-center justify-between border-t border-border/50 pt-4" 
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                  <Label className="text-[10px] text-muted-foreground">
                    Mostrar Tag
                  </Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={() => onUpdate({ showBadge: !settings.showBadge })}
                  >
                    {settings.showBadge ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-destructive" />
                    )}
                  </Button>
                </div>

                {settings.showBadge && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <fieldset 
                      className="space-y-1.5 border-none p-0 m-0" 
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                        Texto da Tag
                      </legend>
                      <Input
                        id="hero-badge"
                        value={settings.badge}
                        className="h-8 text-sm"
                        placeholder="Texto da tag..."
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          onUpdate({ badge: e.target.value })
                        }
                      />
                    </fieldset>

                    <fieldset 
                      className="space-y-1.5 border-none p-0 m-0" 
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                        Selecionar Ícone
                      </legend>
                      <Select
                        value={settings.badgeIcon || "Sparkles"}
                        onValueChange={(val: string) =>
                          onUpdate({ badgeIcon: val })
                        }
                      >
                        <SelectTrigger className="h-8 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map((item) => (
                            <SelectItem
                              key={item.name}
                              value={item.name}
                              className="text-[10px]"
                            >
                              <div className="flex items-center gap-2">
                                <item.icon className="w-3 h-3" />
                                {item.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </fieldset>

                    <div className="grid grid-cols-2 gap-3">
                      <fieldset 
                        className="space-y-1.5 border-none p-0 m-0" 
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                          Cor do Ícone
                        </legend>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={settings.badgeColor || "#ec4899"}
                            className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                            onChange={(e) =>
                              onUpdate({ badgeColor: e.target.value })
                            }
                          />
                          <Input
                            value={settings.badgeColor || ""}
                            placeholder="#HEX"
                            className="h-8 text-[10px] flex-1 uppercase"
                            onChange={(e) =>
                              onUpdate({ badgeColor: e.target.value })
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
                        <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                          Cor do Texto
                        </legend>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={settings.badgeTextColor || "#ec4899"}
                            className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                            onChange={(e) =>
                              onUpdate({ badgeTextColor: e.target.value })
                            }
                          />
                          <Input
                            value={settings.badgeTextColor || ""}
                            placeholder="#HEX"
                            className="h-8 text-[10px] flex-1 uppercase"
                            onChange={(e) =>
                              onUpdate({ badgeTextColor: e.target.value })
                            }
                          />
                        </div>
                      </fieldset>
                    </div>

                    <fieldset 
                      className="space-y-1.5 border-none p-0 m-0" 
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                        <Type className="w-2 h-2" /> Fonte
                      </legend>
                      <Select
                        value={settings.badgeFont}
                        onValueChange={(val: string) =>
                          onUpdate({ badgeFont: val })
                        }
                      >
                        <SelectTrigger className="h-8 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Title Section */}
            <AccordionItem
              value="item-title"
              className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Título Principal
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 border-t border-border/50 pt-4">
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

            {/* Subtitle Section */}
            <AccordionItem
              value="item-subtitle"
              className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Subtítulo
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 border-t border-border/50 pt-4">
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

            {/* Buttons Section */}
            <AccordionItem
              value="item-buttons"
              className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Botões de Ação
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-6 border-t border-border/50 pt-4">
                <div className="space-y-4">
                  <fieldset 
                    className="space-y-3 p-3 rounded-lg bg-background/50 border border-border/50" 
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Botão Principal
                    </legend>
                    <Input
                      value={settings.primaryButton}
                      className="h-8 text-xs"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onUpdate({ primaryButton: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <fieldset className="space-y-1 border-none p-0 m-0" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                          <Palette className="w-2 h-2" /> Cor de Fundo
                        </legend>
                        <div className="flex gap-1">
                          <Input
                            type="color"
                            value={settings.primaryButtonColor || "#BE185D"}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onUpdate({ primaryButtonColor: e.target.value })
                            }
                            className="w-7 h-7 p-0.5 cursor-pointer rounded-full overflow-hidden"
                          />
                          <Input
                            value={settings.primaryButtonColor}
                            placeholder="Fundo"
                            className="h-7 text-[10px] font-mono w-16"
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onUpdate({ primaryButtonColor: e.target.value })
                            }
                          />
                        </div>
                      </fieldset>
                      <fieldset className="space-y-1 border-none p-0 m-0" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                          <Palette className="w-2 h-2" /> Cor do Texto
                        </legend>
                        <div className="flex gap-1">
                          <Input
                            type="color"
                            value={settings.primaryButtonTextColor || "#FFFFFF"}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onUpdate({
                                primaryButtonTextColor: e.target.value,
                              })
                            }
                            className="w-7 h-7 p-0.5 cursor-pointer rounded-full overflow-hidden"
                          />
                          <Input
                            value={settings.primaryButtonTextColor}
                            placeholder="Texto"
                            className="h-7 text-[10px] font-mono w-16"
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onUpdate({
                                primaryButtonTextColor: e.target.value,
                              })
                            }
                          />
                        </div>
                      </fieldset>
                    </div>
                    <fieldset className="space-y-1 border-none p-0 m-0" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                        <Type className="w-2 h-2" /> Fonte do Botão
                      </legend>
                      <Select
                        value={settings.primaryButtonFont}
                        onValueChange={(val: string) =>
                          onUpdate({ primaryButtonFont: val })
                        }
                      >
                        <SelectTrigger className="h-7 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                  </fieldset>

                  <fieldset 
                    className="space-y-3 p-3 rounded-lg bg-background/50 border border-border/50" 
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Botão Secundário
                    </legend>
                    <Input
                      value={settings.secondaryButton}
                      className="h-8 text-xs"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onUpdate({ secondaryButton: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <fieldset className="space-y-1 border-none p-0 m-0" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                          <Palette className="w-2 h-2" /> Cor de Fundo
                        </legend>
                        <div className="flex gap-1">
                          <Input
                            type="color"
                            value={settings.secondaryButtonColor || "#000000"}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onUpdate({ secondaryButtonColor: e.target.value })
                            }
                            className="w-7 h-7 p-0.5 cursor-pointer rounded-full overflow-hidden"
                          />
                          <Input
                            value={settings.secondaryButtonColor}
                            placeholder="Fundo"
                            className="h-7 text-[10px] font-mono w-16"
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onUpdate({ secondaryButtonColor: e.target.value })
                            }
                          />
                        </div>
                      </fieldset>
                      <fieldset className="space-y-1 border-none p-0 m-0" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                          <Palette className="w-2 h-2" /> Cor do Texto
                        </legend>
                        <div className="flex gap-1">
                          <Input
                            type="color"
                            value={
                              settings.secondaryButtonTextColor || "#FFFFFF"
                            }
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onUpdate({
                                secondaryButtonTextColor: e.target.value,
                              })
                            }
                            className="w-7 h-7 p-0.5 cursor-pointer rounded-full overflow-hidden"
                          />
                          <Input
                            value={settings.secondaryButtonTextColor}
                            placeholder="Texto"
                            className="h-7 text-[10px] font-mono w-16"
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onUpdate({
                                secondaryButtonTextColor: e.target.value,
                              })
                            }
                          />
                        </div>
                      </fieldset>
                    </div>
                    <fieldset className="space-y-1 border-none p-0 m-0" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                        <Type className="w-2 h-2" /> Fonte do Botão
                      </legend>
                      <Select
                        value={settings.secondaryButtonFont}
                        onValueChange={(val: string) =>
                          onUpdate({ secondaryButtonFont: val })
                        }
                      >
                        <SelectTrigger className="h-7 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                  </fieldset>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="style" className="space-y-4 mt-0">
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-2 border-none"
            onValueChange={handleAccordionChange}
          >
            <AccordionItem
              value="item-background"
              className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Fundo da Seção
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 border-t border-border/50">
                <BackgroundEditor
                  settings={settings}
                  onUpdate={(updates) => onUpdate({ ...updates })}
                  sectionId="hero"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>

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
