"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorEditorProps {
  settings: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  onUpdate: (updates: Partial<ColorEditorProps["settings"]>) => void;
  hasChanges?: boolean;
  onSave?: () => void;
}

export function ColorEditor({
  settings,
  onUpdate,
  hasChanges,
  onSave,
}: ColorEditorProps) {
  const colorOptions = [
    { key: "primary", label: "Cor Primária", description: "Botões, destaques e ícones" },
    { key: "secondary", label: "Cor Secundária", description: "Banners, cards e fundos suaves" },
    { key: "background", label: "Cor de Fundo", description: "Fundo principal das seções" },
    { key: "text", label: "Cor do Texto", description: "Títulos e parágrafos" },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Accordion
        type="single"
        collapsible
        className="w-full space-y-2 border-none"
      >
        {colorOptions.map((option) => (
          <AccordionItem
            key={option.key}
            value={`item-${option.key}`}
            className="border rounded-lg bg-muted/20 px-3 overflow-hidden border-border/50"
          >
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full border border-border shadow-sm" 
                  style={{ backgroundColor: settings[option.key] }}
                />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {option.label}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="space-y-3 pt-1">
                <div className="flex flex-col gap-2">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium ml-1">
                    {option.description}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        value={settings[option.key]}
                        onChange={(e) => onUpdate({ [option.key]: e.target.value })}
                        className="h-9 text-xs font-mono uppercase pl-9"
                        placeholder="#000000"
                      />
                      <div 
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: settings[option.key] }}
                      />
                    </div>
                    <Input
                      type="color"
                      value={settings[option.key]}
                      onChange={(e) => onUpdate({ [option.key]: e.target.value })}
                      className="w-9 h-9 p-1 bg-background border-border cursor-pointer shrink-0"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="p-4 rounded-lg bg-background border border-border space-y-3">
        <Label className="text-[9px] text-muted-foreground uppercase">
          Prévia de Cores
        </Label>
        <div 
          className="p-4 rounded-lg border border-border space-y-4 transition-colors duration-300"
          style={{ backgroundColor: settings.background }}
        >
          <h4 
            className="text-lg font-bold transition-colors duration-300"
            style={{ color: settings.text }}
          >
            Exemplo de Conteúdo
          </h4>
          <p 
            className="text-sm opacity-80 transition-colors duration-300"
            style={{ color: settings.text }}
          >
            Este texto demonstra como as cores do site interagem entre si.
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="transition-all duration-300"
              style={{ 
                backgroundColor: settings.primary,
                color: "#ffffff" // Geralmente branco para melhor contraste em primário
              }}
            >
              Botão Primário
            </Button>
            <Button 
              variant="outline"
              size="sm" 
              className="transition-all duration-300"
              style={{ 
                borderColor: settings.secondary,
                color: settings.secondary
              }}
            >
              Botão Secundário
            </Button>
          </div>
        </div>
      </div>

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
          {hasChanges ? "Aplicar Cores" : "Nenhuma alteração"}
        </Button>
      </div>
    </div>
  );
}
