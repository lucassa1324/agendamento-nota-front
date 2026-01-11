"use client";

import {
  Award,
  Briefcase,
  Brush,
  Camera,
  Car,
  Code,
  Coffee,
  CreditCard,
  Crown,
  Dumbbell,
  Flower2,
  Gem,
  Heart,
  ImageIcon,
  Laptop,
  Medal,
  Moon,
  Music,
  Palette,
  Plane,
  Plus,
  Scissors,
  ShoppingBag,
  Smartphone,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Trash2,
  Type,
  Users,
  Utensils,
  Wind,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { ValueItem, ValuesSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { BackgroundEditor } from "../../components/BackgroundEditor";
import { EDITOR_FONTS } from "../../components/editor-constants";
import { SectionSubtitleEditor } from "../../components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../../components/SectionTitleEditor";

const icons = [
  { name: "Heart", icon: Heart },
  { name: "Award", icon: Award },
  { name: "Users", icon: Users },
  { name: "Sparkles", icon: Sparkles },
  { name: "Palette", icon: Palette },
  { name: "Scissors", icon: Scissors },
  { name: "Star", icon: Star },
  { name: "Crown", icon: Crown },
  { name: "Flower2", icon: Flower2 },
  { name: "Gem", icon: Gem },
  { name: "Moon", icon: Moon },
  { name: "Smile", icon: Smile },
  { name: "Sun", icon: Sun },
  { name: "Medal", icon: Medal },
  { name: "Briefcase", icon: Briefcase },
  { name: "Coffee", icon: Coffee },
  { name: "Utensils", icon: Utensils },
  { name: "Laptop", icon: Laptop },
  { name: "Smartphone", icon: Smartphone },
  { name: "Camera", icon: Camera },
  { name: "Music", icon: Music },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Plane", icon: Plane },
  { name: "Car", icon: Car },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Stethoscope", icon: Stethoscope },
  { name: "Code", icon: Code },
  { name: "Brush", icon: Brush },
  { name: "Wind", icon: Wind },
];

interface ValuesEditorProps {
  settings: ValuesSettings;
  onUpdate: (updates: Partial<ValuesSettings>) => void;
  onSave?: () => void;
  hasChanges?: boolean;
}

export function ValuesEditor({
  settings,
  onUpdate,
  onSave: externalOnSave,
  hasChanges,
}: ValuesEditorProps) {
  const handleSave = () => {
    if (externalOnSave) externalOnSave();
  };

  const addItem = () => {
    const newItem: ValueItem = {
      id: Math.random().toString(36).slice(2, 11),
      icon: "Star",
      title: "Novo Valor",
      description: "Descrição do novo valor aqui...",
    };
    onUpdate({ items: [...settings.items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<ValueItem>) => {
    onUpdate({
      items: settings.items.map((item: ValueItem) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    });
  };

  const removeItem = (id: string) => {
    onUpdate({
      items: settings.items.filter((item: ValueItem) => item.id !== id),
    });
  };

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
              onUpdate={(updates: {
                title?: string;
                font?: string;
                color?: string;
              }) =>
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
              onUpdate={(updates: {
                subtitle?: string;
                font?: string;
                color?: string;
              }) =>
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
                  onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
                  onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                >
                  <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                    Fundo do Card
                  </legend>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.cardBgColor || "#ffffff"}
                      className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdate({ cardBgColor: e.target.value })
                      }
                    />
                    <Input
                      value={settings.cardBgColor || ""}
                      placeholder="#HEX"
                      className="h-8 text-[10px] flex-1 uppercase"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdate({ cardBgColor: e.target.value })
                      }
                    />
                  </div>
                </fieldset>
                <fieldset
                  className="space-y-1.5 border-none p-0 m-0"
                  onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
                  onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                >
                  <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                    Cor dos Ícones
                  </legend>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.cardIconColor || "#000000"}
                      className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdate({ cardIconColor: e.target.value })
                      }
                    />
                    <Input
                      value={settings.cardIconColor || ""}
                      placeholder="#HEX"
                      className="h-8 text-[10px] flex-1 uppercase"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                    onPointerDown={(e: React.PointerEvent) =>
                      e.stopPropagation()
                    }
                    onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Fonte
                    </legend>
                    <Select
                      value={settings.cardTitleFont}
                      onValueChange={(v: string) =>
                        onUpdate({ cardTitleFont: v })
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
                    onPointerDown={(e: React.PointerEvent) =>
                      e.stopPropagation()
                    }
                    onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Cor
                    </legend>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cardTitleColor || "#000000"}
                        className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onUpdate({ cardTitleColor: e.target.value })
                        }
                      />
                      <Input
                        value={settings.cardTitleColor || ""}
                        placeholder="#HEX"
                        className="h-8 text-[10px] flex-1 uppercase"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                    onPointerDown={(e: React.PointerEvent) =>
                      e.stopPropagation()
                    }
                    onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Fonte
                    </legend>
                    <Select
                      value={settings.cardDescriptionFont}
                      onValueChange={(v: string) =>
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
                    onPointerDown={(e: React.PointerEvent) =>
                      e.stopPropagation()
                    }
                    onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Cor
                    </legend>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cardDescriptionColor || "#666666"}
                        className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onUpdate({ cardDescriptionColor: e.target.value })
                        }
                      />
                      <Input
                        value={settings.cardDescriptionColor || ""}
                        placeholder="#HEX"
                        className="h-8 text-[10px] flex-1 uppercase"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onUpdate({ cardDescriptionColor: e.target.value })
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
              onUpdate={(updates) => onUpdate({ ...updates })}
              sectionId="values"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Gerenciar Itens */}
        <AccordionItem
          value="items"
          className="border rounded-lg px-4 bg-card/50"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-serif italic text-sm">
              <Plus className="w-4 h-4" /> GERENCIAR VALORES
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <fieldset
              className="space-y-4 border-none p-0 m-0"
              onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
              onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
            >
              <legend className="sr-only">Gerenciar Valores</legend>
              {settings.items.map((item: ValueItem) => (
                <div
                  key={item.id}
                  className="p-3 border rounded-md bg-background/50 space-y-3 relative group"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>

                  <div className="grid grid-cols-[auto_1fr] gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        Ícone
                      </Label>
                      <Select
                        value={item.icon}
                        onValueChange={(v: string) =>
                          updateItem(item.id, { icon: v })
                        }
                      >
                        <SelectTrigger className="h-8 w-12 px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="grid grid-cols-5 gap-1 p-2">
                            {icons.map((iconObj) => (
                              <SelectItem
                                key={iconObj.name}
                                value={iconObj.name}
                                className="flex items-center justify-center p-2"
                              >
                                <iconObj.icon className="h-4 w-4" />
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        Título
                      </Label>
                      <Input
                        value={item.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateItem(item.id, { title: e.target.value })
                        }
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Descrição
                    </Label>
                    <Textarea
                      value={item.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        updateItem(item.id, { description: e.target.value })
                      }
                      className="min-h-16 text-[11px] resize-none"
                    />
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-[10px] border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-primary"
                onClick={addItem}
              >
                <Plus className="h-3 w-3 mr-1" /> ADICIONAR VALOR
              </Button>
            </fieldset>
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
