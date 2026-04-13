"use client";

import { CreditCard, ImageIcon, Loader2, RotateCcw, Type } from "lucide-react";
import { useState } from "react";
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
import { defaultServicesSettings, type ServicesSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { BackgroundEditor, type BackgroundSettings } from "../../components/BackgroundEditor";
import { EDITOR_FONTS } from "../../components/editor-constants";
import { ResetSectionVisuals } from "../../components/ResetSectionVisuals";
import { SectionSubtitleEditor } from "../../components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../../components/SectionTitleEditor";

const isVisualKey = (key: string) => {
  const k = key.toLowerCase();
  return (
    k.includes("color") ||
    k.includes("font") ||
    k.includes("bg") ||
    k.includes("opacity") ||
    k.includes("scale") ||
    k.includes("image") ||
    k.includes("icon") ||
    k.includes("shadow") ||
    k.includes("radius") ||
    k === "appearance"
  );
};

interface ServicesEditorProps {
  settings: ServicesSettings;
  onUpdate: (updates: Partial<ServicesSettings>) => void;
  onUpdateBackground?: (updates: Partial<BackgroundSettings>, sectionId?: string) => void;
  onReset?: () => void;
  onSave?: () => void;
  hasChanges?: boolean;
  isSaving?: boolean;
}

export function ServicesEditor({
  settings,
  onUpdate,
  onUpdateBackground,
  onReset,
  onSave: externalOnSave,
  hasChanges,
  isSaving,
}: ServicesEditorProps) {
  const [localIsSaving, setLocalIsSaving] = useState(false);
  const isLoading = isSaving || localIsSaving;

  if (!settings) return null;

  const handleSave = async () => {
    if (!externalOnSave || isLoading) return;
    setLocalIsSaving(true);
    try {
      await externalOnSave();
    } finally {
      setLocalIsSaving(false);
    }
  };

  const handleResetVisuals = () => {
    const updates: Partial<ServicesSettings> = {};
    for (const [key, value] of Object.entries(defaultServicesSettings)) {
      if (isVisualKey(key)) {
        (updates as Record<string, unknown>)[key] = value;
      }
    }
    onUpdate(updates);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      {onReset && (
        <ResetSectionVisuals
          label="Resetar Estilo dos Serviços"
          description="Restaura cores, fontes, fundo e estilo dos cards sem alterar os textos."
          onReset={handleResetVisuals}
        />
      )}
      <Accordion
        type="multiple"
        defaultValue={["title"]}
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
                  <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
                    Fundo do Card
                    {settings.cardBgColor && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:text-primary"
                        onClick={() => onUpdate({ cardBgColor: "" })}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
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
                      placeholder="Padrão"
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
                  <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
                    Cor dos Ícones
                    {settings.cardIconColor && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:text-primary"
                        onClick={() => onUpdate({ cardIconColor: "" })}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
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
                      placeholder="Padrão"
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
                      value={settings.cardTitleFont || "default"}
                      onValueChange={(v) =>
                        onUpdate({ cardTitleFont: v === "default" ? "" : v })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Padrão do Site" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="default"
                          className="text-xs font-medium"
                        >
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
                  <fieldset
                    className="space-y-1.5 border-none p-0 m-0"
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
                      Cor do Título
                      {settings.cardTitleColor && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 hover:text-primary"
                          onClick={() => onUpdate({ cardTitleColor: "" })}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
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
                        placeholder="Padrão"
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
                      value={settings.cardDescriptionFont || "default"}
                      onValueChange={(v) =>
                        onUpdate({
                          cardDescriptionFont: v === "default" ? "" : v,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Padrão do Site" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="default"
                          className="text-xs font-medium"
                        >
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
                  <fieldset
                    className="space-y-1.5 border-none p-0 m-0"
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
                      Cor da Descrição
                      {settings.cardDescriptionColor && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 hover:text-primary"
                          onClick={() => onUpdate({ cardDescriptionColor: "" })}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
                    </legend>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cardDescriptionColor || "#000000"}
                        className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                        onChange={(e) =>
                          onUpdate({ cardDescriptionColor: e.target.value })
                        }
                      />
                      <Input
                        value={settings.cardDescriptionColor || ""}
                        placeholder="Padrão"
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
                      value={settings.cardPriceFont || "default"}
                      onValueChange={(v) =>
                        onUpdate({ cardPriceFont: v === "default" ? "" : v })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Padrão do Site" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="default"
                          className="text-xs font-medium"
                        >
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
                  <fieldset
                    className="space-y-1.5 border-none p-0 m-0"
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
                      Cor
                      {settings.cardPriceColor && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 hover:text-primary"
                          onClick={() => onUpdate({ cardPriceColor: "" })}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
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
                        placeholder="Padrão"
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
              settings={{
                bgType: settings.bgType,
                bgColor: settings.bgColor,
                bgImage: settings.bgImage,
                imageOpacity: settings.imageOpacity,
                overlayOpacity: settings.overlayOpacity,
                imageScale: settings.imageScale,
                imageX: settings.imageX,
                imageY: settings.imageY,
                appearance: settings.appearance,
              }}
              onUpdate={(updates) => {
                if (onUpdateBackground) {
                  onUpdateBackground(updates, "services");
                } else {
                  onUpdate(updates as Partial<ServicesSettings>);
                }
              }}
              section="services"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-2">
        <Button
          type="button"
          disabled={!hasChanges || isLoading}
          onClick={handleSave}
          className={cn(
            "w-full h-11 text-sm font-bold transition-all duration-300 relative",
            hasChanges && !isLoading
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
          )}
        >
          <div className="flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : hasChanges ? (
              "Salvar Alterações"
            ) : (
              <span className="opacity-50">Nenhuma alteração</span>
            )}
          </div>
        </Button>
      </div>
    </div>
  );
}
