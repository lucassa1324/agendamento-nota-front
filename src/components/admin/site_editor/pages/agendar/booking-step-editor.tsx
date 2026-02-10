"use client";

import { Palette, RotateCcw, Type } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BookingStepSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { BackgroundEditor } from "../../components/BackgroundEditor";
import { SectionSubtitleEditor } from "../../components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../../components/SectionTitleEditor";

interface BookingStepEditorProps {
  settings: BookingStepSettings;
  onUpdate: (updates: Partial<BookingStepSettings>) => void;
  onHighlight?: (sectionId: string) => void;
  hasChanges?: boolean;
  onSave?: () => void;
  title: string;
}

export function BookingStepEditor({
  settings,
  onUpdate,
  onHighlight,
  hasChanges,
  onSave,
  title,
}: BookingStepEditorProps) {
  const handleSave = () => {
    if (onSave) onSave();
  };

  const handleAccordionChange = (values: string | string[]) => {
    if (onHighlight) {
      // O sectionId para os passos de agendamento deve corresponder aos IDs das seções no BookingFlow
      // booking-service, booking-date, booking-time, booking-form, booking-confirmation
      const activeValues = Array.isArray(values) ? values : [values];
      const lastValue = activeValues[activeValues.length - 1];

      if (lastValue) {
        // Notificamos o editor sobre a seção ativa para isolamento no preview
        onHighlight(activeSection || "booking-service");
      }
    }
  };

  const activeSection = title.includes("Serviços")
    ? "booking-service"
    : title.includes("Data")
      ? "booking-date"
      : title.includes("Horário")
        ? "booking-time"
        : title.includes("Dados")
          ? "booking-form"
          : title.includes("Confirmação")
            ? "booking-confirmation"
            : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>

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
            {/* Título */}
            <AccordionItem
              value="item-title"
              className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Type className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Título do Passo
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4 space-y-4">
                <div className="space-y-1.5">
                  <Input
                    value={settings.title}
                    className="h-8 text-sm"
                    placeholder="Ex: Escolha o Serviço"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      onUpdate({ title: e.target.value })
                    }
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Subtítulo */}
            <AccordionItem
              value="item-subtitle"
              className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Type className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Subtítulo / Instrução
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4 space-y-4">
                <div className="space-y-1.5">
                  <Input
                    value={settings.subtitle}
                    className="h-8 text-sm"
                    placeholder="Ex: Selecione o procedimento desejado"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      onUpdate({ subtitle: e.target.value })
                    }
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="style" className="space-y-4 mt-0">
          <Accordion
            type="multiple"
            className="w-full space-y-2 border-none"
            onValueChange={handleAccordionChange}
          >
            {/* Estilo do Título */}
            <AccordionItem
              value="item-title-style"
              className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Estilo do Título
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4 space-y-4 border-t border-border/50 mt-2">
                <SectionTitleEditor
                  title={settings.title}
                  color={settings.titleColor}
                  font={settings.titleFont}
                  onUpdate={(updates) =>
                    onUpdate({
                      ...(updates.title !== undefined && {
                        title: updates.title,
                      }),
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

            {/* Estilo do Subtítulo */}
            <AccordionItem
              value="item-subtitle-style"
              className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Estilo do Subtítulo
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4 space-y-4 border-t border-border/50 mt-2">
                <SectionSubtitleEditor
                  subtitle={settings.subtitle}
                  color={settings.subtitleColor}
                  font={settings.subtitleFont}
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

            {/* Background */}
            <AccordionItem
              value="item-background"
              className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Fundo do Passo
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4 space-y-4 border-t border-border/50 mt-2">
                <BackgroundEditor settings={settings} onUpdate={onUpdate} />
              </AccordionContent>
            </AccordionItem>

            {/* Cores Específicas */}
            <AccordionItem
              value="item-step-colors"
              className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Cores do Conteúdo
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4 space-y-4 border-t border-border/50 mt-2">
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="accentColor"
                      className="text-[10px] uppercase text-muted-foreground font-medium flex justify-between items-center"
                    >
                      Cor de Destaque
                      {settings.accentColor && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 hover:text-primary"
                          onClick={() => onUpdate({ accentColor: "" })}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={settings.accentColor || "#000000"}
                        className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                        onChange={(e) =>
                          onUpdate({ accentColor: e.target.value })
                        }
                      />
                      <Input
                        value={settings.accentColor || ""}
                        placeholder="Padrão"
                        className="h-8 text-[10px] flex-1 uppercase"
                        onChange={(e) =>
                          onUpdate({ accentColor: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cardBgColor"
                      className="text-[10px] uppercase text-muted-foreground font-medium flex justify-between items-center"
                    >
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
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="cardBgColor"
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
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>

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
          {hasChanges ? "Salvar Alterações" : "Tudo Atualizado"}
        </Button>
      </div>
    </div>
  );
}
