"use client";

import {
  Award,
  CheckCircle2,
  Crown,
  Flower2,
  Gem,
  Heart,
  Loader2,
  type LucideIcon,
  Moon,
  Smile,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  homeHeroTemplates,
  type HeroTemplatePreset,
  type HeroTemplateTitleSize,
} from "@/components/admin/site_editor/editor";
import { cn, renderSafeText } from "@/lib/utils";
import {
  BackgroundEditor,
  type BackgroundSettings,
} from "../site_editor/components/BackgroundEditor";
import { SectionSubtitleEditor } from "../site_editor/components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../site_editor/components/SectionTitleEditor";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";

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

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Star,
  Heart,
  Crown,
  Flower2,
  Moon,
  Sun,
  Gem,
  Smile,
  Award,
};

const fontFamilyMap: Record<NonNullable<HeroTemplatePreset["fontFamily"]>, string> = {
  sans: "Inter",
  serif: "Playfair Display",
  montserrat: "Montserrat",
  lora: "Lora",
  syne: "Syne",
  bebas: "Bebas Neue",
  space: "Space Grotesk",
  poppins: "Poppins",
  cinzel: "Cinzel",
};

const titleSizeClassMap: Record<HeroTemplateTitleSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

type HeroTemplateCardProps = {
  template: HeroTemplatePreset;
  selected: boolean;
  onClick: () => void;
  onUseTemplate?: () => void;
  compact?: boolean;
};

function HeroTemplateCard({
  template,
  selected,
  onClick,
  onUseTemplate,
  compact = true,
}: HeroTemplateCardProps) {
  const [imageError, setImageError] = useState(false);
  const BadgeIcon = template.badgeIcon ? iconMap[template.badgeIcon] : null;

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        "text-left rounded-xl border overflow-hidden transition-all bg-background group/card cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "border-primary shadow-md ring-1 ring-primary/40"
          : "border-border hover:border-primary/40 hover:shadow-sm",
      )}
    >
      <div className={cn("relative", compact ? "aspect-video" : "aspect-16/10")}>
        {template.bgType === "image" && !imageError ? (
          <>
            <img
              src={template.bgImage}
              alt={template.variationName || template.niche}
              className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/55" />
          </>
        ) : (
          <div
            className="absolute inset-0 transition-colors duration-500 group-hover/card:bg-opacity-80"
            style={{ backgroundColor: template.bgColor || "#111827" }}
          />
        )}

        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between",
            compact ? "p-3" : "p-6 sm:p-10 text-center items-center",
          )}
        >
          <div className={cn(!compact && "flex flex-col items-center")}>
            {!compact && selected && (
              <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-1 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Selecionado
              </div>
            )}
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide",
                compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[11px]",
              )}
              style={{
                backgroundColor: template.badgeColor || "rgba(255,255,255,0.14)",
                color: template.badgeTextColor || "#ffffff",
              }}
            >
              {BadgeIcon && (
                <BadgeIcon className={cn(compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5")} />
              )}
              <span>{template.badge}</span>
            </div>
            <h4
              className={cn(
                "font-bold leading-tight line-clamp-2",
                compact ? "mt-2" : "mt-4 max-w-2xl",
                compact
                  ? titleSizeClassMap[template.titleSize || "md"]
                  : "text-2xl sm:text-3xl md:text-4xl",
              )}
              style={{ color: template.titleColor || "#ffffff" }}
            >
              {template.title}
            </h4>
            {!compact && (
              <p
                className="mt-3 text-sm sm:text-base line-clamp-3 max-w-xl opacity-90"
                style={{ color: template.subtitleColor || "#f3f4f6" }}
              >
                {template.subtitle}
              </p>
            )}
          </div>

          <div className={cn("flex items-center", compact ? "gap-2" : "gap-4 justify-center")}>
            <div
              className={cn(
                "rounded-full font-bold transition-transform hover:scale-105",
                compact ? "px-2 py-1 text-[9px]" : "px-5 py-2.5 text-sm",
              )}
              style={{
                backgroundColor: template.primaryButtonTransparent
                  ? "transparent"
                  : template.primaryButtonColor || "#ffffff",
                border: `1px solid ${template.primaryButtonColor || "#ffffff"}`,
                color: template.primaryButtonTransparent
                  ? template.primaryButtonColor || "#ffffff"
                  : template.primaryButtonTextColor || "#111827",
              }}
            >
              {template.primaryButton}
            </div>
            <div
              className={cn(
                "rounded-full font-bold bg-transparent transition-transform hover:scale-105",
                compact ? "px-2 py-1 text-[9px]" : "px-5 py-2.5 text-sm",
              )}
              style={{
                border: `1px solid ${template.secondaryButtonColor || "#ffffff"}`,
                color: template.secondaryButtonTextColor || "#ffffff",
              }}
            >
              {template.secondaryButton}
            </div>
          </div>
        </div>
      </div>
      <div className={cn("border-t border-border/60 bg-background", compact ? "p-2" : "p-4 flex flex-col items-center text-center")}>
        <p className={cn("font-bold leading-tight", compact ? "text-[11px]" : "text-base text-foreground")}>
          {template.variationName || "Variacao"}
        </p>
        <p className={cn("text-muted-foreground", compact ? "text-[10px]" : "text-sm mt-0.5")}>
          {template.niche}
        </p>
        {!compact && onUseTemplate && (
          <Button
            type="button"
            className="mt-4 h-10 w-full max-w-60 font-bold"
            variant={selected ? "default" : "outline"}
            onClick={(event) => {
              event.stopPropagation();
              onUseTemplate();
            }}
          >
            {selected ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Template Aplicado
              </span>
            ) : (
              "Usar este template"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

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
    titleSize?: HeroTemplateTitleSize;

    // Subtitle Fields
    subtitle: string;
    subtitleFont: string;
    subtitleColor: string;

    // Button Fields
    primaryButton?: string;
    primaryButtonColor?: string;
    primaryButtonTextColor?: string;
    primaryButtonTransparent?: boolean;
    secondaryButton?: string;
    secondaryButtonColor?: string;
    secondaryButtonTextColor?: string;
    secondaryButtonTransparent?: boolean;

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
  onUpdateBackground?: (
    updates: Partial<BackgroundSettings>,
    sectionId?: string,
  ) => void;
  onHighlight?: (sectionId: string) => void;
  onReset?: () => void;
  hasChanges?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  showTemplateSelector?: boolean;
}

export function HeroEditor({
  settings,
  onUpdate,
  onUpdateBackground,
  onReset: _onReset,
  hasChanges,
  onSave: externalOnSave,
  isSaving,
  showTemplateSelector = false,
}: HeroEditorProps) {
  const [localIsSaving, setLocalIsSaving] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    homeHeroTemplates[0]?.id ?? "",
  );
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [dbTemplates, setDbTemplates] = useState<HeroTemplatePreset[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const isLoading = isSaving || localIsSaving;

  // Busca templates do banco quando o modal abre
  useEffect(() => {
    const loadDbTemplates = async () => {
      if (!isTemplateModalOpen) return;
      
      setIsLoadingTemplates(true);
      try {
        const response = await customFetch(`${API_BASE_URL}/api/admin/master/templates`);
        if (response.ok) {
          const data = await response.json();
          // Pega apenas a seção de banner (hero)
          if (data && data.banner) {
            setDbTemplates(data.banner);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar templates do banco:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    loadDbTemplates();
  }, [isTemplateModalOpen]);

  // Combina templates estáticos com os do banco (priorizando banco se houver conflito de ID)
  const allTemplates = useMemo(() => {
    if (dbTemplates.length === 0) return homeHeroTemplates;
    
    const dbIds = new Set(dbTemplates.map(t => t.id));
    const uniqueStatic = homeHeroTemplates.filter(t => !dbIds.has(t.id));
    
    return [...dbTemplates, ...uniqueStatic];
  }, [dbTemplates]);

  const handleSave = async () => {
    if (!externalOnSave || isLoading) return;
    setLocalIsSaving(true);
    try {
      externalOnSave();
    } finally {
      setLocalIsSaving(false);
    }
  };

  // Helper to ensure updates are propagated correctly
  const handleUpdate = (updates: Partial<HeroEditorProps["settings"]>) => {
    console.log(">>> [HeroEditor] handleUpdate chamado com:", updates);
    console.log(
      ">>> [HeroEditor] Estado ATUAL antes da atualização:",
      settings,
    );
    onUpdate({ ...settings, ...updates });
  };

  const handleApplyTemplate = (templateId = selectedTemplateId) => {
    const selectedTemplate = allTemplates.find((template) => template.id === templateId);
    if (!selectedTemplate) return;

    const mappedFont = selectedTemplate.fontFamily
      ? fontFamilyMap[selectedTemplate.fontFamily]
      : settings.titleFont;

    handleUpdate({
      showBadge: true,
      badge: selectedTemplate.badge,
      badgeIcon: selectedTemplate.badgeIcon,
      title: selectedTemplate.title,
      subtitle: selectedTemplate.subtitle,
      primaryButton: selectedTemplate.primaryButton,
      secondaryButton: selectedTemplate.secondaryButton,
      titleSize: selectedTemplate.titleSize ?? settings.titleSize ?? "md",
      primaryButtonTransparent:
        selectedTemplate.primaryButtonTransparent ??
        settings.primaryButtonTransparent ??
        false,
      secondaryButtonTransparent:
        selectedTemplate.secondaryButtonTransparent ??
        settings.secondaryButtonTransparent ??
        true,
      bgType: selectedTemplate.bgType,
      bgImage: selectedTemplate.bgImage,
      ...(selectedTemplate.bgColor !== undefined && {
        bgColor: selectedTemplate.bgColor,
      }),
      titleFont: mappedFont,
      subtitleFont: mappedFont,
      badgeFont: mappedFont,
      titleColor: selectedTemplate.titleColor ?? settings.titleColor,
      subtitleColor: selectedTemplate.subtitleColor ?? settings.subtitleColor,
      badgeColor: selectedTemplate.badgeColor ?? settings.badgeColor,
      badgeTextColor: selectedTemplate.badgeTextColor ?? settings.badgeTextColor,
      primaryButtonColor:
        selectedTemplate.primaryButtonColor ?? settings.primaryButtonColor,
      primaryButtonTextColor:
        selectedTemplate.primaryButtonTextColor ??
        settings.primaryButtonTextColor,
      secondaryButtonColor:
        selectedTemplate.secondaryButtonColor ?? settings.secondaryButtonColor,
      secondaryButtonTextColor:
        selectedTemplate.secondaryButtonTextColor ??
        settings.secondaryButtonTextColor,
      ...(selectedTemplate.bgType === "image"
        ? {
            imageOpacity: settings.imageOpacity || 1,
            overlayOpacity: settings.overlayOpacity || 0.45,
          }
        : {}),
    });
  };

  console.log(">>> [HeroEditor] RENDER: settings.bgImage =", settings.bgImage);

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8 sm:h-9 mb-3 sm:mb-4">
          <TabsTrigger value="content" className="text-[11px] sm:text-xs">
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="style" className="text-[11px] sm:text-xs">
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="content"
          className="space-y-3 sm:space-y-4 mt-0 relative z-10"
        >
          {showTemplateSelector && (
            <Button
              type="button"
              className="w-full h-10 shadow-sm font-bold flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95 mb-4"
              onClick={() => setIsTemplateModalOpen(true)}
            >
              <Sparkles className="w-4 h-4 fill-current" />
              Trocar Template
            </Button>
          )}

          <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
            <DialogContent className="w-[98vw] max-w-[98vw] sm:max-w-[95vw] xl:max-w-350 h-[92vh] p-0 overflow-hidden flex flex-col border-none shadow-2xl">
              <div className="flex-none px-6 py-5 border-b bg-background/50 backdrop-blur-sm relative z-20">
                <DialogHeader className="gap-1">
                  <DialogTitle className="text-xl font-bold">Galeria de Templates do Banner</DialogTitle>
                  <DialogDescription className="text-sm">
                    Escolha visualmente um template, clique em aplicar e continue editando normalmente.
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 bg-muted/20 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40">
                {isLoadingTemplates ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">Carregando templates do banco...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                    {allTemplates.map((template) => (
                      <HeroTemplateCard
                        key={template.id}
                        template={template}
                        selected={template.id === selectedTemplateId}
                        onClick={() => setSelectedTemplateId(template.id)}
                        onUseTemplate={() => {
                          setSelectedTemplateId(template.id);
                          handleApplyTemplate(template.id);
                          setIsTemplateModalOpen(false);
                        }}
                        compact={false}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex-none px-6 py-4 border-t bg-background flex justify-end gap-3 items-center relative z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <p className="mr-auto text-xs text-muted-foreground hidden sm:block">
                  {allTemplates.length} templates disponíveis
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="h-10 px-6"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="h-10 px-8 font-bold shadow-md"
                  onClick={() => {
                    handleApplyTemplate();
                    setIsTemplateModalOpen(false);
                  }}
                >
                  Aplicar Selecionado
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Badge Editor */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Badge de Destaque
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Exibe um selo acima do título
                </p>
              </div>
              <Switch
                checked={settings.showBadge !== false}
                onCheckedChange={(checked) =>
                  handleUpdate({ showBadge: checked })
                }
              />
            </div>

            {settings.showBadge !== false && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                    Texto do Badge
                  </Label>
                  <Input
                    value={renderSafeText(settings.badge)}
                    onChange={(e) => handleUpdate({ badge: e.target.value })}
                    placeholder="Ex: Especialistas em Design"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                      Ícone
                    </Label>
                    <Select
                      value={settings.badgeIcon || "Sparkles"}
                      onValueChange={(v) => handleUpdate({ badgeIcon: v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((opt) => (
                          <SelectItem
                            key={opt.name}
                            value={opt.name}
                            className="text-xs"
                          >
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
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                      Cor do Badge
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.badgeColor || "#000000"}
                        onChange={(e) =>
                          handleUpdate({ badgeColor: e.target.value })
                        }
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.badgeColor || ""}
                        onChange={(e) =>
                          handleUpdate({ badgeColor: e.target.value })
                        }
                        placeholder="#000000"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                    Cor do Texto do Badge
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.badgeTextColor || "#000000"}
                      onChange={(e) =>
                        handleUpdate({ badgeTextColor: e.target.value })
                      }
                      className="h-8 w-8 p-0 border-none bg-transparent"
                    />
                    <Input
                      value={settings.badgeTextColor || ""}
                      onChange={(e) =>
                        handleUpdate({ badgeTextColor: e.target.value })
                      }
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
                ...(updates.color !== undefined && {
                  titleColor: updates.color,
                }),
              })
            }
          />

          <div className="space-y-1.5 p-4 border rounded-lg bg-muted/30">
            <Label className="text-[10px] uppercase text-muted-foreground font-medium">
              Tamanho do Título
            </Label>
            <Select
              value={settings.titleSize || "md"}
              onValueChange={(value) =>
                handleUpdate({ titleSize: value as HeroTemplateTitleSize })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm" className="text-xs">
                  Pequeno
                </SelectItem>
                <SelectItem value="md" className="text-xs">
                  Médio
                </SelectItem>
                <SelectItem value="lg" className="text-xs">
                  Grande
                </SelectItem>
                <SelectItem value="xl" className="text-xs">
                  Extra Grande
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Botões de Ação
            </Label>

            <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-primary">
                  Botão Principal
                </Label>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                    Texto
                  </Label>
                  <Input
                    value={renderSafeText(settings.primaryButton)}
                    onChange={(e) =>
                      handleUpdate({ primaryButton: e.target.value })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                    Botão Transparente
                  </Label>
                  <Switch
                    checked={settings.primaryButtonTransparent === true}
                    onCheckedChange={(checked) =>
                      handleUpdate({ primaryButtonTransparent: checked })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                      Cor de Fundo
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.primaryButtonColor || "#000000"}
                        onChange={(e) =>
                          handleUpdate({ primaryButtonColor: e.target.value })
                        }
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.primaryButtonColor || ""}
                        onChange={(e) =>
                          handleUpdate({ primaryButtonColor: e.target.value })
                        }
                        placeholder="#000000"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                      Cor do Texto
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.primaryButtonTextColor || "#ffffff"}
                        onChange={(e) =>
                          handleUpdate({
                            primaryButtonTextColor: e.target.value,
                          })
                        }
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.primaryButtonTextColor || ""}
                        onChange={(e) =>
                          handleUpdate({
                            primaryButtonTextColor: e.target.value,
                          })
                        }
                        placeholder="#ffffff"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-[10px] uppercase font-bold text-primary">
                  Botão Secundário
                </Label>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                    Texto
                  </Label>
                  <Input
                    value={renderSafeText(settings.secondaryButton)}
                    onChange={(e) =>
                      handleUpdate({ secondaryButton: e.target.value })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                    Botão Transparente
                  </Label>
                  <Switch
                    checked={settings.secondaryButtonTransparent !== false}
                    onCheckedChange={(checked) =>
                      handleUpdate({ secondaryButtonTransparent: checked })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                      Cor da Borda/Texto
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.secondaryButtonColor || "#000000"}
                        onChange={(e) =>
                          handleUpdate({ secondaryButtonColor: e.target.value })
                        }
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.secondaryButtonColor || ""}
                        onChange={(e) =>
                          handleUpdate({ secondaryButtonColor: e.target.value })
                        }
                        placeholder="#000000"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">
                      Cor do Texto
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.secondaryButtonTextColor || "#000000"}
                        onChange={(e) =>
                          handleUpdate({
                            secondaryButtonTextColor: e.target.value,
                          })
                        }
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.secondaryButtonTextColor || ""}
                        onChange={(e) =>
                          handleUpdate({
                            secondaryButtonTextColor: e.target.value,
                          })
                        }
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

        <TabsContent
          value="style"
          className="space-y-3 sm:space-y-4 mt-0 relative z-10"
        >
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
          disabled={!hasChanges || isLoading}
          onClick={handleSave}
          className={`w-full h-11 text-sm font-bold transition-all duration-300 relative ${
            hasChanges && !isLoading
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          }`}
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
