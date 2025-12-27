"use client";

import { CreditCard, Plus, Trash2, Type, UserPlus } from "lucide-react";
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
import type { TeamMember, TeamSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { SectionSubtitleEditor } from "../../components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../../components/SectionTitleEditor";

interface TeamEditorProps {
  settings: TeamSettings;
  onUpdate: (updates: Partial<TeamSettings>) => void;
  onSave?: () => void;
  hasChanges?: boolean;
}

export function TeamEditor({
  settings,
  onUpdate,
  onSave: externalOnSave,
  hasChanges,
}: TeamEditorProps) {
  const handleSave = () => {
    if (externalOnSave) externalOnSave();
  };

  const addItem = () => {
    const newItem: TeamMember = {
      id: Math.random().toString(36).slice(2, 11),
      name: "Novo Membro",
      role: "Cargo/Função",
      image: "/professional-eyebrow-artist-at-work.jpg",
      description: "Descrição do membro da equipe...",
    };
    onUpdate({ members: [...settings.members, newItem] });
  };

  const updateItem = (id: string, updates: Partial<TeamMember>) => {
    onUpdate({
      members: settings.members.map((item: TeamMember) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    });
  };

  const removeItem = (id: string) => {
    onUpdate({
      members: settings.members.filter((item: TeamMember) => item.id !== id),
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

                  <fieldset 
                    className="space-y-1.5 border-none p-0 m-0"
                    onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
                    onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                  >
                    <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                      Cor do Cargo
                    </legend>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cardRoleColor || "#666666"}
                        className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onUpdate({ cardRoleColor: e.target.value })
                        }
                      />
                      <Input
                        value={settings.cardRoleColor || ""}
                        placeholder="#HEX"
                        className="h-8 text-[10px] flex-1 uppercase"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onUpdate({ cardRoleColor: e.target.value })
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
                      Cor da Descrição
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

        {/* Gerenciar Equipe */}
        <AccordionItem
          value="members"
          className="border rounded-lg px-4 bg-card/50"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-serif italic text-sm">
              <UserPlus className="w-4 h-4" /> GERENCIAR EQUIPE
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
              <legend className="sr-only">Gerenciar Equipe</legend>
              {settings.members.map((member: TeamMember) => (
                <div
                  key={member.id}
                  className="p-3 border rounded-md bg-background/50 space-y-3 relative group"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => removeItem(member.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Nome
                    </Label>
                    <Input
                      value={member.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateItem(member.id, { name: e.target.value })
                      }
                      className="h-8 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Cargo / Função
                    </Label>
                    <Input
                      value={member.role}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateItem(member.id, { role: e.target.value })
                      }
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      URL da Imagem
                    </Label>
                    <Input
                      value={member.image}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateItem(member.id, { image: e.target.value })
                      }
                      className="h-8 text-[10px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Descrição
                    </Label>
                    <Textarea
                      value={member.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        updateItem(member.id, { description: e.target.value })
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
                <Plus className="w-3 h-3 mr-2" /> Adicionar Membro
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
