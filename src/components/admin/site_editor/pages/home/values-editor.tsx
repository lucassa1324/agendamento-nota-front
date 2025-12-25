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
  RefreshCcw,
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
  Upload,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { ValueItem, ValuesSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";

const fonts = [
  { name: "Playfair Display", type: "serif" },
  { name: "Lora", type: "serif" },
  { name: "Merriweather", type: "serif" },
  { name: "Cormorant Garamond", type: "serif" },
  { name: "Cinzel", type: "serif" },
  { name: "Inter", type: "sans" },
  { name: "Montserrat", type: "sans" },
  { name: "Poppins", type: "sans" },
  { name: "Roboto", type: "sans" },
  { name: "Open Sans", type: "sans" },
];

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
      items: settings.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    });
  };

  const removeItem = (id: string) => {
    onUpdate({
      items: settings.items.filter((item) => item.id !== id),
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
          <AccordionContent className="space-y-6 pb-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase text-muted-foreground">
                  Texto do Título
                </Label>
                <Input
                  value={settings.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">
                    Fonte
                  </Label>
                  <Select
                    value={settings.titleFont}
                    onValueChange={(v) => onUpdate({ titleFont: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((f) => (
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
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">
                    Cor
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.titleColor || "#000000"}
                      className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50"
                      onChange={(e) => onUpdate({ titleColor: e.target.value })}
                    />
                    <Input
                      value={settings.titleColor || ""}
                      placeholder="#HEX"
                      className="h-8 text-[10px] flex-1 uppercase"
                      onChange={(e) => onUpdate({ titleColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
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
          <AccordionContent className="space-y-6 pb-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase text-muted-foreground">
                  Texto do Subtítulo
                </Label>
                <Textarea
                  value={settings.subtitle}
                  onChange={(e) => onUpdate({ subtitle: e.target.value })}
                  className="min-h-20 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">
                    Fonte
                  </Label>
                  <Select
                    value={settings.subtitleFont}
                    onValueChange={(v) => onUpdate({ subtitleFont: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((f) => (
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
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">
                    Cor
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.subtitleColor || "#666666"}
                      className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50"
                      onChange={(e) =>
                        onUpdate({ subtitleColor: e.target.value })
                      }
                    />
                    <Input
                      value={settings.subtitleColor || ""}
                      placeholder="#HEX"
                      className="h-8 text-[10px] flex-1 uppercase"
                      onChange={(e) =>
                        onUpdate({ subtitleColor: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
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
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">
                    Fundo do Card
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.cardBgColor || "#ffffff"}
                      className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50"
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
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">
                    Cor dos Ícones
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.cardIconColor || "#000000"}
                      className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50"
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
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label className="text-[11px] font-bold uppercase text-primary tracking-wider">
                  Título do Card
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Fonte
                    </Label>
                    <Select
                      value={settings.cardTitleFont}
                      onValueChange={(v) => onUpdate({ cardTitleFont: v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Fonte" />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((f) => (
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
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Cor
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cardTitleColor || "#000000"}
                        className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50"
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
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label className="text-[11px] font-bold uppercase text-primary tracking-wider">
                  Descrição do Card
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Fonte
                    </Label>
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
                        {fonts.map((f) => (
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
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Cor
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cardDescriptionColor || "#666666"}
                        className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50"
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
                  </div>
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
          <AccordionContent className="space-y-6 pb-4">
            <RadioGroup
              value={settings.bgType}
              onValueChange={(v) =>
                onUpdate({ bgType: v as "color" | "image" })
              }
              className="grid grid-cols-2 gap-2 bg-muted/50 p-1 rounded-md"
            >
              <div className="flex items-center justify-center">
                <RadioGroupItem
                  value="color"
                  id="values-bg-color"
                  className="sr-only"
                />
                <Label
                  htmlFor="values-bg-color"
                  className={cn(
                    "flex-1 text-center py-1.5 rounded-sm text-[10px] font-bold uppercase cursor-pointer transition-all",
                    settings.bgType === "color"
                      ? "bg-background shadow-sm text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Cor Sólida
                </Label>
              </div>
              <div className="flex items-center justify-center">
                <RadioGroupItem
                  value="image"
                  id="values-bg-image"
                  className="sr-only"
                />
                <Label
                  htmlFor="values-bg-image"
                  className={cn(
                    "flex-1 text-center py-1.5 rounded-sm text-[10px] font-bold uppercase cursor-pointer transition-all",
                    settings.bgType === "image"
                      ? "bg-background shadow-sm text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Imagem
                </Label>
              </div>
            </RadioGroup>

            {settings.bgType === "color" ? (
              <div className="space-y-3">
                <Label className="text-[10px] uppercase text-muted-foreground">
                  Cor de Fundo
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.bgColor || "#ffffff"}
                    className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50"
                    onChange={(e) => onUpdate({ bgColor: e.target.value })}
                  />
                  <Input
                    value={settings.bgColor || ""}
                    placeholder="Ex: #ffffff ou transparent"
                    className="h-8 text-[10px] flex-1 uppercase"
                    onChange={(e) => onUpdate({ bgColor: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase text-muted-foreground">
                    URL da Imagem
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={settings.bgImage || ""}
                      onChange={(e) => onUpdate({ bgImage: e.target.value })}
                      placeholder="https://..."
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-10 border-dashed text-xs gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" /> Fazer Upload
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Opacidade da Imagem
                    </Label>
                    <span className="text-[10px] font-mono">
                      {Math.round(settings.imageOpacity * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.imageOpacity * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([v]) => onUpdate({ imageOpacity: v / 100 })}
                    className="py-2"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border/30">
                  <Label className="text-[10px] uppercase text-primary/70 font-bold">
                    Ajuste Manual da Imagem
                  </Label>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] text-muted-foreground">
                        Zoom (Escala)
                      </Label>
                      <span className="text-[10px] font-mono">
                        {settings.imageScale.toFixed(2)}x
                      </span>
                    </div>
                    <Slider
                      value={[settings.imageScale]}
                      min={1}
                      max={3}
                      step={0.01}
                      onValueChange={([v]) => onUpdate({ imageScale: v })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] text-muted-foreground">
                          Posição X
                        </Label>
                        <span className="text-[10px] font-mono">
                          {settings.imageX}%
                        </span>
                      </div>
                      <Slider
                        value={[settings.imageX]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([v]) => onUpdate({ imageX: v })}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] text-muted-foreground">
                          Posição Y
                        </Label>
                        <span className="text-[10px] font-mono">
                          {settings.imageY}%
                        </span>
                      </div>
                      <Slider
                        value={[settings.imageY]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([v]) => onUpdate({ imageY: v })}
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[10px] uppercase h-8 text-muted-foreground hover:text-primary gap-1.5"
                    onClick={() =>
                      onUpdate({
                        imageScale: 1,
                        imageX: 50,
                        imageY: 50,
                      })
                    }
                  >
                    <RefreshCcw className="w-3 h-3" /> Resetar Ajustes
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-border/30">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] uppercase text-muted-foreground">
                  Intensidade do Gradiente
                </Label>
                <span className="text-[10px] font-mono">
                  {Math.round(settings.overlayOpacity * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.overlayOpacity * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => onUpdate({ overlayOpacity: v / 100 })}
              />
            </div>
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
            <div className="space-y-4">
              {settings.items.map((item) => (
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
                        onValueChange={(v) => updateItem(item.id, { icon: v })}
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
                        onChange={(e) =>
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
                      onChange={(e) =>
                        updateItem(item.id, { description: e.target.value })
                      }
                      className="min-h-16 text-[11px] leading-snug resize-none"
                    />
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-full border-dashed h-10 text-xs"
                onClick={addItem}
              >
                <Plus className="w-3 h-3 mr-2" /> Adicionar Valor
              </Button>
            </div>
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
