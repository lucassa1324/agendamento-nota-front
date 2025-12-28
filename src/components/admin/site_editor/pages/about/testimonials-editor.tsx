"use client";

import { CreditCard, ImageIcon, MessageSquare, Plus, Star, Trash2, Type } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Testimonial, TestimonialsSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { BackgroundEditor } from "../../components/BackgroundEditor";
import { SectionSubtitleEditor } from "../../components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../../components/SectionTitleEditor";

interface TestimonialsEditorProps {
  settings: TestimonialsSettings;
  onUpdate: (updates: Partial<TestimonialsSettings>) => void;
  onSave?: () => void;
  hasChanges?: boolean;
}

export function TestimonialsEditor({
  settings,
  onUpdate,
  onSave: externalOnSave,
  hasChanges,
}: TestimonialsEditorProps) {
  const handleSave = () => {
    if (externalOnSave) externalOnSave();
  };

  const addItem = () => {
    const newItem: Testimonial = {
      id: Math.random().toString(36).slice(2, 11),
      name: "Nome da Cliente",
      text: "Depoimento da cliente aqui...",
      rating: 5,
    };
    onUpdate({ testimonials: [...settings.testimonials, newItem] });
  };

  const updateItem = (id: string, updates: Partial<Testimonial>) => {
    onUpdate({
      testimonials: settings.testimonials.map((item: Testimonial) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    });
  };

  const removeItem = (id: string) => {
    onUpdate({
      testimonials: settings.testimonials.filter((item: Testimonial) => item.id !== id),
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
              onUpdate={(updates: { title?: string; font?: string; color?: string }) =>
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
              onUpdate={(updates: { subtitle?: string; font?: string; color?: string }) =>
                onUpdate({
                  ...(updates.subtitle !== undefined && { subtitle: updates.subtitle }),
                  ...(updates.font !== undefined && { subtitleFont: updates.font }),
                  ...(updates.color !== undefined && { subtitleColor: updates.color }),
                })
              }
            />
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
              sectionId="testimonials"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Estilo dos Cards */}
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
                    Cor das Estrelas
                  </legend>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.starColor || "#FFD700"}
                      className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdate({ starColor: e.target.value })
                      }
                    />
                    <Input
                      value={settings.starColor || ""}
                      placeholder="#HEX"
                      className="h-8 text-[10px] flex-1 uppercase"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdate({ starColor: e.target.value })
                      }
                    />
                  </div>
                </fieldset>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label className="text-[11px] font-bold uppercase text-primary tracking-wider">
                  Textos do Card
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <fieldset 
                    className="space-y-1.5 border-none p-0 m-0"
                    onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
                    onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Cor do Nome
                    </legend>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cardNameColor || "#000000"}
                        className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onUpdate({ cardNameColor: e.target.value })
                        }
                      />
                      <Input
                        value={settings.cardNameColor || ""}
                        placeholder="#HEX"
                        className="h-8 text-[10px] flex-1 uppercase"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onUpdate({ cardNameColor: e.target.value })
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
                      Cor do Texto
                    </legend>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cardTextColor || "#666666"}
                        className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onUpdate({ cardTextColor: e.target.value })
                        }
                      />
                      <Input
                        value={settings.cardTextColor || ""}
                        placeholder="#HEX"
                        className="h-8 text-[10px] flex-1 uppercase"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onUpdate({ cardTextColor: e.target.value })
                        }
                      />
                    </div>
                  </fieldset>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Gerenciar Depoimentos */}
        <AccordionItem
          value="testimonials"
          className="border rounded-lg px-4 bg-card/50"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-serif italic text-sm">
              <MessageSquare className="w-4 h-4" /> GERENCIAR DEPOIMENTOS
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
              <legend className="sr-only">Gerenciar Depoimentos</legend>
              {settings.testimonials.map((testimonial: Testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-3 border rounded-md bg-background/50 space-y-3 relative group"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => removeItem(testimonial.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>

                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        Nome da Cliente
                      </Label>
                      <Input
                        value={testimonial.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateItem(testimonial.id, { name: e.target.value })
                        }
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        Avaliação
                      </Label>
                      <div className="flex items-center gap-1 h-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updateItem(testimonial.id, { rating: star })}
                            className={cn(
                              "focus:outline-none transition-colors",
                              star <= testimonial.rating
                                ? "text-yellow-400"
                                : "text-muted-foreground/20"
                            )}
                          >
                            <Star className="w-3 h-3 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Depoimento
                    </Label>
                    <Textarea
                      value={testimonial.text}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        updateItem(testimonial.id, { text: e.target.value })
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
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  addItem();
                }}
              >
                <Plus className="w-3 h-3 mr-2" /> Adicionar Depoimento
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
