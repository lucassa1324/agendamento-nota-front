"use client";

import { CreditCard, ImageIcon, Plus, RotateCcw, Trash2, Type, UserPlus } from "lucide-react";
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
import type { TeamMember, TeamSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { BackgroundEditor } from "../../components/BackgroundEditor";
import { SectionSubtitleEditor } from "../../components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../../components/SectionTitleEditor";
import { EDITOR_FONTS } from "../../components/editor-constants";

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
              sectionId="team"
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onUpdate({ cardBgColor: e.target.value })
                    }
                  />
                  <Input
                    value={settings.cardBgColor || ""}
                    placeholder="Transparente"
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
                
                <div className="space-y-4">
                  {/* Nome */}
                  <div className="grid grid-cols-2 gap-4">
                    <fieldset className="space-y-1.5 border-none p-0 m-0">
                      <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                        Fonte do Nome
                      </legend>
                      <Select
                        value={settings.cardTitleFont || "default"}
                        onValueChange={(v) => onUpdate({ cardTitleFont: v === "default" ? "" : v })}
                      >
                        <SelectTrigger className="h-8 text-[10px]">
                          <SelectValue placeholder="Padrão do Site" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default" className="text-[10px]">Padrão do Site</SelectItem>
                          {EDITOR_FONTS.map((f) => (
                            <SelectItem key={f.name} value={f.name} className="text-[10px]">
                              <span style={{ fontFamily: f.name }}>{f.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </fieldset>

                    <fieldset className="space-y-1.5 border-none p-0 m-0">
                      <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
                        Cor do Nome
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
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onUpdate({ cardTitleColor: e.target.value })
                          }
                        />
                        <Input
                          value={settings.cardTitleColor || ""}
                          placeholder="Padrão"
                          className="h-8 text-[10px] flex-1 uppercase"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onUpdate({ cardTitleColor: e.target.value })
                          }
                        />
                      </div>
                    </fieldset>
                  </div>

                  {/* Cargo */}
                  <div className="grid grid-cols-2 gap-4">
                    <fieldset className="space-y-1.5 border-none p-0 m-0">
                      <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                        Fonte do Cargo
                      </legend>
                      <Select
                        value={settings.cardRoleFont || "default"}
                        onValueChange={(v) => onUpdate({ cardRoleFont: v === "default" ? "" : v })}
                      >
                        <SelectTrigger className="h-8 text-[10px]">
                          <SelectValue placeholder="Padrão do Site" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default" className="text-[10px]">Padrão do Site</SelectItem>
                          {EDITOR_FONTS.map((f) => (
                            <SelectItem key={f.name} value={f.name} className="text-[10px]">
                              <span style={{ fontFamily: f.name }}>{f.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </fieldset>

                    <fieldset className="space-y-1.5 border-none p-0 m-0">
                      <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
                        Cor do Cargo
                        {settings.cardRoleColor && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-4 w-4 hover:text-primary"
                            onClick={() => onUpdate({ cardRoleColor: "" })}
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        )}
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
                          placeholder="Padrão"
                          className="h-8 text-[10px] flex-1 uppercase"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onUpdate({ cardRoleColor: e.target.value })
                          }
                        />
                      </div>
                    </fieldset>
                  </div>

                  {/* Descrição */}
                  <div className="grid grid-cols-2 gap-4">
                    <fieldset className="space-y-1.5 border-none p-0 m-0">
                      <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                        Fonte da Descrição
                      </legend>
                      <Select
                        value={settings.cardDescriptionFont || "default"}
                        onValueChange={(v) => onUpdate({ cardDescriptionFont: v === "default" ? "" : v })}
                      >
                        <SelectTrigger className="h-8 text-[10px]">
                          <SelectValue placeholder="Padrão do Site" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default" className="text-[10px]">Padrão do Site</SelectItem>
                          {EDITOR_FONTS.map((f) => (
                            <SelectItem key={f.name} value={f.name} className="text-[10px]">
                              <span style={{ fontFamily: f.name }}>{f.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </fieldset>

                    <fieldset className="space-y-1.5 border-none p-0 m-0">
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
                          value={settings.cardDescriptionColor || "#666666"}
                          className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onUpdate({ cardDescriptionColor: e.target.value })
                          }
                        />
                        <Input
                          value={settings.cardDescriptionColor || ""}
                          placeholder="Padrão"
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
