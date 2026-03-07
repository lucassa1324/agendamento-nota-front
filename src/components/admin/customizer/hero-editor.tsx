"use client";

import { Award, Crown, Flower2, Gem, Heart, Moon, Smile, Sparkles, Star, Sun } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackgroundEditor, type BackgroundSettings } from "../site_editor/components/BackgroundEditor";
import { SectionSubtitleEditor } from "../site_editor/components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../site_editor/components/SectionTitleEditor";

const iconOptions = [
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

export interface HeroEditorProps {
  settings: {
    // Badge Fields
    showBadge?: boolean;
    badge?: string;
    badgeIcon?: string;
    badgeColor?: string;
    badgeTextColor?: string;

    // Title Fields
    title: string;
    titleFont: string;
    titleColor: string;

    // Subtitle Fields
    subtitle: string;
    subtitleFont: string;
    subtitleColor: string;

    // Button Fields
    primaryButton?: string;
    primaryButtonColor?: string;
    primaryButtonTextColor?: string;
    secondaryButton?: string;
    secondaryButtonColor?: string;
    secondaryButtonTextColor?: string;

    // Background Fields
    bgType: "color" | "image";
    bgColor: string;
    bgImage: string;
    imageOpacity: number;
    overlayOpacity: number;
    imageScale: number;
    imageX: number;
    imageY: number;

    appearance?: {
      backgroundImageUrl?: string;
      overlay?: {
        color: string;
        opacity: number;
      };
    };

    // Legacy/Unused
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: unknown;
  };
  onUpdate: (updates: Partial<HeroEditorProps["settings"]>) => void;
  onUpdateBackground?: (updates: Partial<BackgroundSettings>, sectionId?: string) => void;
  onHighlight?: (sectionId: string) => void;
  hasChanges?: boolean;
  onSave?: () => void;
}

export function HeroEditor({
  settings,
  onUpdate,
  onUpdateBackground,
  hasChanges,
  onSave: externalOnSave,
}: HeroEditorProps) {
  // Helper to ensure updates are propagated correctly
  const handleUpdate = (updates: Partial<HeroEditorProps["settings"]>) => {
    console.log(">>> [HeroEditor] handleUpdate chamado com:", updates);
    console.log(">>> [HeroEditor] Estado ATUAL antes da atualização:", settings);
    onUpdate({ ...settings, ...updates });
  };

  console.log(">>> [HeroEditor] RENDER: settings.bgImage =", settings.bgImage);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8 sm:h-9 mb-3 sm:mb-4">
          <TabsTrigger value="content" className="text-[11px] sm:text-xs">
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="style" className="text-[11px] sm:text-xs">
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-3 sm:space-y-4 mt-0">
          {/* Badge Editor */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Badge de Destaque</Label>
                <p className="text-[10px] text-muted-foreground">Exibe um selo acima do título</p>
              </div>
              <Switch
                checked={settings.showBadge !== false}
                onCheckedChange={(checked) => handleUpdate({ showBadge: checked })}
              />
            </div>

            {settings.showBadge !== false && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">Texto do Badge</Label>
                  <Input
                    value={settings.badge || ""}
                    onChange={(e) => handleUpdate({ badge: e.target.value })}
                    placeholder="Ex: Especialistas em Design"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">Ícone</Label>
                    <Select
                      value={settings.badgeIcon || "Sparkles"}
                      onValueChange={(v) => handleUpdate({ badgeIcon: v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((opt) => (
                          <SelectItem key={opt.name} value={opt.name} className="text-xs">
                            <div className="flex items-center gap-2">
                              <opt.icon className="w-3 h-3" />
                              <span>{opt.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">Cor do Badge</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.badgeColor || "#000000"}
                        onChange={(e) => handleUpdate({ badgeColor: e.target.value })}
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.badgeColor || ""}
                        onChange={(e) => handleUpdate({ badgeColor: e.target.value })}
                        placeholder="#000000"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">Cor do Texto do Badge</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.badgeTextColor || "#000000"}
                      onChange={(e) => handleUpdate({ badgeTextColor: e.target.value })}
                      className="h-8 w-8 p-0 border-none bg-transparent"
                    />
                    <Input
                      value={settings.badgeTextColor || ""}
                      onChange={(e) => handleUpdate({ badgeTextColor: e.target.value })}
                      placeholder="#000000"
                      className="h-8 text-[10px] uppercase"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <SectionTitleEditor
            title={settings.title}
            font={settings.titleFont}
            color={settings.titleColor}
            onUpdate={(updates) =>
              handleUpdate({
                ...(updates.title !== undefined && { title: updates.title }),
                ...(updates.font !== undefined && { titleFont: updates.font }),
                ...(updates.color !== undefined && { titleColor: updates.color }),
              })
            }
          />

          <SectionSubtitleEditor
            subtitle={settings.subtitle}
            font={settings.subtitleFont}
            color={settings.subtitleColor}
            onUpdate={(updates) =>
              handleUpdate({
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

          {/* Buttons Editor */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Botões de Ação</Label>
            
            <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-primary">Botão Principal</Label>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">Texto</Label>
                  <Input
                    value={settings.primaryButton || ""}
                    onChange={(e) => handleUpdate({ primaryButton: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.primaryButtonColor || "#000000"}
                        onChange={(e) => handleUpdate({ primaryButtonColor: e.target.value })}
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.primaryButtonColor || ""}
                        onChange={(e) => handleUpdate({ primaryButtonColor: e.target.value })}
                        placeholder="#000000"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.primaryButtonTextColor || "#ffffff"}
                        onChange={(e) => handleUpdate({ primaryButtonTextColor: e.target.value })}
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.primaryButtonTextColor || ""}
                        onChange={(e) => handleUpdate({ primaryButtonTextColor: e.target.value })}
                        placeholder="#ffffff"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-[10px] uppercase font-bold text-primary">Botão Secundário</Label>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">Texto</Label>
                  <Input
                    value={settings.secondaryButton || ""}
                    onChange={(e) => handleUpdate({ secondaryButton: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">Cor da Borda/Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.secondaryButtonColor || "#000000"}
                        onChange={(e) => handleUpdate({ secondaryButtonColor: e.target.value })}
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.secondaryButtonColor || ""}
                        onChange={(e) => handleUpdate({ secondaryButtonColor: e.target.value })}
                        placeholder="#000000"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.secondaryButtonTextColor || "#000000"}
                        onChange={(e) => handleUpdate({ secondaryButtonTextColor: e.target.value })}
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.secondaryButtonTextColor || ""}
                        onChange={(e) => handleUpdate({ secondaryButtonTextColor: e.target.value })}
                        placeholder="#000000"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-3 sm:space-y-4 mt-0">
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
              onUpdateBackground(updates, "hero");
            } else {
              handleUpdate(updates);
            }
          }}
          section="hero"
        />
         </TabsContent>
      </Tabs>

      <div className="pt-2">
        <Button
          type="button"
          disabled={!hasChanges}
          onClick={externalOnSave}
          className={`w-full h-11 text-sm font-bold transition-all duration-300 ${
            hasChanges
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          }`}
        >
          {hasChanges ? (
            "Salvar Alterações"
          ) : (
            <span className="opacity-50">Nenhuma alteração</span>
          )}
        </Button>
      </div>
    </div>
  );
}
