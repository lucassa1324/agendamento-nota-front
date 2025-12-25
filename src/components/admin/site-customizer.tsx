"use client";

import {
  ArrowLeft,
  Calendar,
  ImageIcon,
  Info,
  Layout,
  type LucideIcon,
  Monitor,
  RotateCcw,
  Settings2,
  Smartphone,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./site_editor/sidebar-nav";

import { useSidebar } from "@/context/sidebar-context";

interface PageItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  hidden?: boolean;
}

import {
  defaultFontSettings,
  defaultHeroSettings,
  defaultServicesSettings,
  defaultValuesSettings,
  type FontSettings,
  getFontSettings,
  getHeroSettings,
  getPageVisibility,
  getServicesSettings,
  getValuesSettings,
  type HeroSettings,
  type ServicesSettings,
  saveFontSettings,
  saveHeroSettings,
  savePageVisibility,
  saveServicesSettings,
  saveValuesSettings,
  type ValuesSettings,
} from "@/lib/booking-data";
// Importações Modulares (Nova Arquitetura)
import { TypographyEditor } from "./site_editor/layout/typography-editor";
import { HeroEditor } from "./site_editor/pages/home/hero-editor";
import { HistoryEditor } from "./site_editor/pages/home/history-editor";
import { ServicesEditor } from "./site_editor/pages/home/services-editor";
import { ValuesEditor } from "./site_editor/pages/home/values-editor";

const pages: PageItem[] = [
  { id: "layout", label: "Layout Global", icon: Settings2, path: "/" },
  { id: "inicio", label: "Início", icon: Layout, path: "/" },
  {
    id: "galeria",
    label: "Galeria",
    icon: ImageIcon,
    path: "/galeria",
    hidden: true,
  },
  { id: "sobre", label: "Sobre Nós", icon: Info, path: "/sobre", hidden: true },
  {
    id: "agendar",
    label: "Agendar",
    icon: Calendar,
    path: "/agendamento",
    hidden: true,
  },
];

const sections = {
  layout: [
    {
      id: "header",
      name: "Cabeçalho",
      description: "Logo e menu de navegação",
    },
    {
      id: "typography",
      name: "Tipografia",
      description: "Fontes e estilos de texto",
    },
    {
      id: "footer",
      name: "Rodapé",
      description: "Informações de contato e links",
    },
  ],
  inicio: [
    {
      id: "hero",
      name: "Banner Principal",
      description: "Primeira dobra com logo e botão de agendar",
    },
    {
      id: "services",
      name: "Nossos Serviços",
      description: "Lista de serviços em destaque",
    },
    {
      id: "values",
      name: "Nossos Valores",
      description: "Diferenciais e pilares do atendimento",
    },
    {
      id: "gallery-preview",
      name: "Prévia da Galeria",
      description: "Alguns trabalhos recentes",
    },
    {
      id: "cta",
      name: "Chamada para Ação",
      description: "Botão final para incentivar o agendamento",
    },
  ],
  galeria: [
    {
      id: "gallery-grid",
      name: "Grid de Fotos",
      description: "Todas as fotos do portfólio",
    },
  ],
  sobre: [
    {
      id: "about-hero",
      name: "Banner Sobre Nós",
      description: "Título e introdução da página",
    },
    {
      id: "story",
      name: "Nossa História",
      description: "Trajetória detalhada",
    },
    { id: "values", name: "Nossos Valores", description: "Pilares do studio" },
  ],
  agendar: [
    {
      id: "booking",
      name: "Fluxo de Agendamento",
      description: "Calendário e seleção de serviços",
    },
  ],
};

export function SiteCustomizer() {
  const { isSidebarOpen, setIsSidebarOpen: onToggleSidebar } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [activePage, setActivePage] = useState("layout");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedPages, setExpandedPages] = useState<string[]>([
    "layout",
    "inicio",
  ]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [previewKey, setPreviewKey] = useState(0);
  const { toast } = useToast();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Estado para controlar a visibilidade das páginas
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({
    inicio: true,
    galeria: true,
    sobre: true,
    agendar: true,
  });

  useEffect(() => {
    setPageVisibility(getPageVisibility());
  }, []);

  const handlePageVisibilityChange = (pageId: string, isVisible: boolean) => {
    setPageVisibility((prev) => ({
      ...prev,
      [pageId]: isVisible,
    }));
  };

  // Efeito para salvar a visibilidade das páginas no localStorage
  useEffect(() => {
    savePageVisibility(pageVisibility);
  }, [pageVisibility]);

  // Estados de customização (inicializados do storage)
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(defaultHeroSettings);
  const [fontSettings, setFontSettings] = useState<FontSettings>(defaultFontSettings);
  const [servicesSettings, setServicesSettings] = useState<ServicesSettings>(defaultServicesSettings);
  const [valuesSettings, setValuesSettings] = useState<ValuesSettings>(defaultValuesSettings);

  // Estados para controle de botões (Aplicar vs Salvar)
  const [lastAppliedHero, setLastAppliedHero] = useState<HeroSettings>(defaultHeroSettings);
  const [lastAppliedFont, setLastAppliedFont] = useState<FontSettings>(defaultFontSettings);
  const [lastAppliedServices, setLastAppliedServices] = useState<ServicesSettings>(defaultServicesSettings);
  const [lastAppliedValues, setLastAppliedValues] = useState<ValuesSettings>(defaultValuesSettings);
  const [lastSavedHero, setLastSavedHero] = useState<HeroSettings>(defaultHeroSettings);
  const [lastSavedFont, setLastSavedFont] = useState<FontSettings>(defaultFontSettings);
  const [lastSavedServices, setLastSavedServices] = useState<ServicesSettings>(defaultServicesSettings);
  const [lastSavedValues, setLastSavedValues] = useState<ValuesSettings>(defaultValuesSettings);

  useEffect(() => {
    const loadedHero = getHeroSettings();
    const loadedFont = getFontSettings();
    const loadedServices = getServicesSettings();
    const loadedValues = getValuesSettings();

    setHeroSettings(loadedHero);
    setFontSettings(loadedFont);
    setServicesSettings(loadedServices);
    setValuesSettings(loadedValues);

    setLastAppliedHero(loadedHero);
    setLastAppliedFont(loadedFont);
    setLastAppliedServices(loadedServices);
    setLastAppliedValues(loadedValues);

    setLastSavedHero(loadedHero);
    setLastSavedFont(loadedFont);
    setLastSavedServices(loadedServices);
    setLastSavedValues(loadedValues);
  }, []);

  // Booleans para habilitar/desabilitar botões
  const hasHeroChanges =
    JSON.stringify(heroSettings) !== JSON.stringify(lastAppliedHero);
  const hasFontChanges =
    JSON.stringify(fontSettings) !== JSON.stringify(lastAppliedFont);
  const hasServicesChanges =
    JSON.stringify(servicesSettings) !== JSON.stringify(lastAppliedServices);
  const hasValuesChanges =
    JSON.stringify(valuesSettings) !== JSON.stringify(lastAppliedValues);

  const hasUnsavedGlobalChanges =
    JSON.stringify(lastAppliedHero) !== JSON.stringify(lastSavedHero) ||
    JSON.stringify(lastAppliedFont) !== JSON.stringify(lastSavedFont) ||
    JSON.stringify(lastAppliedServices) !== JSON.stringify(lastSavedServices) ||
    JSON.stringify(lastAppliedValues) !== JSON.stringify(lastSavedValues);

  const resetSettings = () => {
    if (
      confirm(
        "Tem certeza que deseja resetar todas as configurações para o padrão original?",
      )
    ) {
      setHeroSettings(defaultHeroSettings);
      setFontSettings(defaultFontSettings);
      setServicesSettings(defaultServicesSettings);
      setValuesSettings(defaultValuesSettings);
    }
  };

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Envia atualizações para o iframe quando as configurações do Hero mudarem
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_HERO_BG", // Mantendo o tipo para compatibilidade inicial
          ...heroSettings,
        },
        "*",
      );

      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_HERO_CONTENT",
          ...heroSettings,
        },
        "*",
      );
    }
  }, [heroSettings]);

  // Envia atualizações para o iframe quando as configurações de Serviços mudarem
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_SERVICES_CONTENT",
          settings: servicesSettings,
        },
        "*",
      );
    }
  }, [servicesSettings]);

  // Envia atualizações para o iframe quando as configurações de Valores mudarem
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_VALUES_CONTENT",
          settings: valuesSettings,
        },
        "*",
      );
    }
  }, [valuesSettings]);

  // Envia atualizações de fonte para o iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_FONTS",
          ...fontSettings,
        },
        "*",
      );
    }
  }, [fontSettings]);

  const activePageData = pages.find((p) => p.id === activePage);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const widthScale =
    containerSize.width > 0
      ? Math.max(0.1, (containerSize.width - 32) / 1280)
      : 1;
  const heightScale =
    containerSize.height > 0
      ? Math.max(0.1, (containerSize.height - 32) / 850)
      : 1;
  const desktopScale = Math.min(1, widthScale, heightScale);

  const mobileWidthScale =
    containerSize.width > 0
      ? Math.max(0.1, (containerSize.width - 32) / 375)
      : 1;
  const mobileHeightScale =
    containerSize.height > 0
      ? Math.max(0.1, (containerSize.height - 32) / 750)
      : 1;
  const mobileScale = Math.min(1, mobileWidthScale, mobileHeightScale);

  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({
    header: true,
    footer: true,
    hero: true,
    story: true,
    services: true,
    values: true,
    "gallery-preview": true,
    cta: true,
    "gallery-grid": true,
    "about-hero": true,
    booking: true,
  });

  const togglePageExpansion = (id: string) => {
    setExpandedPages((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
    setActivePage(id);
  };

  const toggleSection = (id: string) => {
    setVisibleSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    // Notificamos o iframe para destacar a seção
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "HIGHLIGHT_SECTION",
          sectionId: sectionId,
        },
        "*",
      );
    }
  };

  const handleHighlight = (elementId: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "HIGHLIGHT_SECTION",
          sectionId: elementId,
        },
        "*",
      );
    }
  };

  const reloadPreview = () => setPreviewKey((prev) => prev + 1);

  const activeSectionData = activeSection
    ? Object.values(sections)
        .flat()
        .find((s) => s.id === activeSection)
    : null;

  // Calculamos a URL do iframe com o parâmetro de isolamento se houver seção ativa
  const previewUrl = activePageData?.path
    ? `${activePageData.path}${activeSection ? `?only=${activeSection}` : ""}`
    : "";

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-[clamp(0.75rem,1vw,0.875rem)]">
      <div className="p-3 xl:p-6 pb-3 border-b border-border/50 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-primary font-bold">
            <Settings2 className="w-4 h-4 xl:w-5 xl:h-5" />
            <span className="text-[10px] xl:text-sm tracking-wide uppercase">Editor</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetSettings}
            className="h-7 xl:h-8 px-2 xl:px-3 gap-1 xl:gap-1.5 text-[9px] xl:text-xs text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
          >
            <RotateCcw className="w-2.5 h-2.5 xl:w-3 xl:h-3" />
            <span>Resetar</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 xl:p-6 custom-scrollbar min-w-0">
        {activeSection ? (
          /* Editor de Seção (Placeholder) */
          <div className="space-y-4 xl:space-y-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center gap-2 mb-3 xl:mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection(null)}
                className="h-7 w-7 xl:h-8 xl:w-8 rounded-full p-0"
              >
                <ArrowLeft className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </Button>
              <div>
                <h3 className="text-xs xl:text-sm font-bold text-primary truncate max-w-[150px] xl:max-w-none">
                  {activeSectionData?.name}
                </h3>
                <p className="text-[9px] xl:text-[10px] text-muted-foreground">
                  Editando seção
                </p>
              </div>
            </div>

            <div className="space-y-3 xl:space-y-4 p-3 xl:p-4 rounded-xl bg-muted/30 border border-border">
              {/* --- LAYOUT GLOBAL --- */}
              {activeSection === "typography" && (
                <TypographyEditor
                  settings={fontSettings}
                  onUpdate={(updates) =>
                    setFontSettings((prev) => ({ ...prev, ...updates }))
                  }
                  onHighlight={handleHighlight}
                  hasChanges={hasFontChanges}
                  onSave={handleApplyTypography}
                />
              )}

              {/* --- PÁGINA: INÍCIO (HOME) --- */}
              {activeSection === "hero" && (
                <HeroEditor
                  settings={heroSettings}
                  onUpdate={(updates) =>
                    setHeroSettings((prev) => ({ ...prev, ...updates }))
                  }
                  onHighlight={handleHighlight}
                  hasChanges={hasHeroChanges}
                  onSave={handleApplyHero}
                />
              )}
              {activeSection === "story" && (
                <HistoryEditor hasChanges={false} onSave={() => {}} />
              )}
              {activeSection === "services" && (
                <ServicesEditor
                  settings={servicesSettings}
                  onUpdate={(updates) =>
                    setServicesSettings((prev) => ({ ...prev, ...updates }))
                  }
                  hasChanges={hasServicesChanges}
                  onSave={handleApplyServices}
                />
              )}
              {activeSection === "values" && (
                <ValuesEditor
                  settings={valuesSettings}
                  onUpdate={(updates) =>
                    setValuesSettings((prev) => ({ ...prev, ...updates }))
                  }
                  hasChanges={hasValuesChanges}
                  onSave={handleApplyValues}
                />
              )}

              {/* --- FALLBACK PARA SEÇÕES EM DESENVOLVIMENTO --- */}
              {!["typography", "hero", "story", "services", "values"].includes(
                activeSection,
              ) && (
                <div className="py-12 text-center">
                  <Settings2 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    O editor para esta seção será implementado em breve.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <SidebarNav
            pages={pages}
            sections={sections}
            activePage={activePage}
            activeSection={activeSection}
            expandedPages={expandedPages}
            visibleSections={visibleSections}
            onPageToggle={togglePageExpansion}
            onSectionSelect={scrollToSection}
            onSectionVisibilityToggle={toggleSection}
            pageVisibility={pageVisibility}
            onPageVisibilityChange={handlePageVisibilityChange}
          />
        )}
      </div>

      <div className="p-6 pt-4 border-t border-border bg-background">
        <Button
          type="button"
          disabled={
            !hasUnsavedGlobalChanges &&
            !hasHeroChanges &&
            !hasFontChanges &&
            !hasServicesChanges &&
            !hasValuesChanges
          }
          onClick={handleSaveGlobal}
          className={cn(
            "w-full font-bold py-6 rounded-xl transition-all duration-300",
            hasUnsavedGlobalChanges ||
              hasHeroChanges ||
              hasFontChanges ||
              hasServicesChanges ||
              hasValuesChanges
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {hasUnsavedGlobalChanges ||
          hasHeroChanges ||
          hasFontChanges ||
          hasServicesChanges ||
          hasValuesChanges
            ? "Publicar Alterações"
            : "Tudo Atualizado"}
        </Button>
      </div>
    </div>
  );

  const handleApplyHero = () => {
    setLastAppliedHero(heroSettings);
    // Forçar atualização do preview
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_HERO_BG", ...heroSettings },
        "*"
      );
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_HERO_CONTENT", ...heroSettings },
        "*"
      );
    }
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do Hero foram aplicadas ao rascunho.",
    });
  };

  const handleApplyTypography = () => {
    setLastAppliedFont(fontSettings);
    // Forçar atualização do preview
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_FONTS", ...fontSettings },
        "*"
      );
    }
    toast({
      title: "Preview atualizado!",
      description: "As mudanças de tipografia foram aplicadas ao rascunho.",
    });
  };

  const handleApplyServices = () => {
    setLastAppliedServices(servicesSettings);
    // Forçar atualização do preview
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_SERVICES_CONTENT", settings: servicesSettings },
        "*"
      );
    }
    toast({
      title: "Preview atualizado!",
      description: "As mudanças dos serviços foram aplicadas ao rascunho.",
    });
  };

  const handleApplyValues = () => {
    setLastAppliedValues(valuesSettings);
    // Forçar atualização do preview
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_VALUES_CONTENT", settings: valuesSettings },
        "*"
      );
    }
    toast({
      title: "Preview atualizado!",
      description: "As mudanças dos valores foram aplicadas ao rascunho.",
    });
  };

  const handleSaveGlobal = () => {
    // 1. Salva no localStorage (Produção)
    saveHeroSettings(lastAppliedHero);
    saveFontSettings(lastAppliedFont);
    saveServicesSettings(lastAppliedServices);
    saveValuesSettings(lastAppliedValues);

    // 2. Atualiza estados de controle
    setLastSavedHero(lastAppliedHero);
    setLastSavedFont(lastAppliedFont);
    setLastSavedServices(lastAppliedServices);
    setLastSavedValues(lastAppliedValues);
    setLastAppliedHero(lastAppliedHero);
    setLastAppliedFont(lastAppliedFont);
    setLastAppliedServices(lastAppliedServices);
    setLastAppliedValues(lastAppliedValues);

    toast({
      title: "Site Publicado!",
      description: "Todas as alterações foram salvas e estão ao vivo.",
      variant: "default",
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full items-stretch overflow-hidden">
      {/* Mobile: Header com Botão Sanduíche - Removido pois agora está no layout global */}

      {/* Mobile: Sheet (Hambúrguer) - Agora controlado pelo estado externo e detecção de mobile */}
      <Sheet open={isMobile && isSidebarOpen} onOpenChange={onToggleSidebar}>
        <SheetContent side="left" className="p-0 w-[85%] sm:w-80 lg:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Personalização</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop: Sidebar Colapsável */}
      <div
        className={cn(
          "hidden lg:flex flex-col h-full border-r border-border bg-card/50 transition-all duration-300 ease-in-out overflow-hidden shrink-0",
          isSidebarOpen 
            ? "w-64 xl:w-80 2xl:w-96 opacity-100" 
            : "w-0 opacity-0 border-r-0"
        )}
      >
        <div 
          className={cn(
            "flex flex-col h-full w-64 xl:w-80 2xl:w-96 transition-opacity duration-300",
            isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <SidebarContent />
        </div>
      </div>

      {/* Coluna da Direita: Preview em Tempo Real */}
      <div className="flex-1 w-full h-full flex flex-col p-2 lg:p-6 min-w-0 transition-all duration-300">
        <div className="flex items-center justify-between mb-2 lg:hidden">
          <h2 className="font-serif text-base font-bold text-primary">
            Preview do Site
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreviewMode(previewMode === "desktop" ? "mobile" : "desktop")}
              className="h-8 w-8"
            >
              {previewMode === "desktop" ? (
                <Smartphone className="w-4 h-4" />
              ) : (
                <Monitor className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <Card className="border-border shadow-2xl overflow-hidden bg-muted/20 rounded-xl lg:rounded-[1.5rem] border flex-1 flex flex-col h-full min-w-0">
          <CardHeader className="bg-card border-b border-border px-3 lg:px-6 py-2 lg:py-3 flex flex-row items-center justify-between space-y-0 shrink-0 h-12 lg:h-16">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="h-6 lg:h-8 px-2 lg:px-4 rounded-full bg-muted/50 flex items-center gap-1.5 lg:gap-2 text-[8px] lg:text-[10px] font-bold tracking-widest text-muted-foreground min-w-[100px] lg:min-w-40 uppercase">
                <Layout className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                <span className="truncate">{activePageData?.path}</span>
              </div>
            </div>

            <div className="flex items-center bg-muted/50 rounded-full p-0.5 lg:p-1 gap-0.5 lg:gap-1">
              <Button
                type="button"
                variant={previewMode === "desktop" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-full w-6 h-6 lg:w-8 lg:h-8"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="w-3 h-3 lg:w-4 lg:h-4" />
              </Button>
              <Button
                type="button"
                variant={previewMode === "mobile" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-full w-6 h-6 lg:w-8 lg:h-8"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="w-3 h-3 lg:w-4 lg:h-4" />
              </Button>
              <div className="w-px h-3 lg:h-4 bg-border mx-0.5 lg:mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full w-6 h-6 lg:w-8 lg:h-8"
                onClick={reloadPreview}
              >
                <RotateCcw className="w-3 h-3 lg:w-4 lg:h-4" />
              </Button>
            </div>
          </CardHeader>

          <div
            ref={containerRef}
            className="flex-1 bg-muted/10 relative flex items-center justify-center overflow-hidden p-2 lg:p-6"
          >
            {/* Monitor / Browser Wrapper */}
            <div
              className={cn(
                "transition-all duration-500 ease-in-out shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden bg-white flex flex-col shrink-0",
                previewMode === "desktop"
                  ? "rounded-xl border border-border"
                  : "rounded-[3rem] border-12 border-black",
              )}
              style={{
                width: previewMode === "mobile" ? "375px" : "1280px",
                height: previewMode === "mobile" ? "750px" : "850px",
                transform: `scale(${previewMode === "mobile" ? mobileScale : desktopScale})`,
                transformOrigin: "center",
              }}
            >
              {/* Browser Header (Desktop Only) */}
              {previewMode === "desktop" && (
                <div className="h-10 bg-[#F1F3F4] border-b border-border flex items-center px-4 gap-4 shrink-0">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="flex-1 max-w-md bg-white h-6 rounded-md border border-border flex items-center px-3 gap-2 overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/20 shrink-0" />
                    <span className="text-[10px] text-muted-foreground truncate">
                      {window.location.origin}
                      {activePageData?.path}
                    </span>
                  </div>
                </div>
              )}

              {/* Iframe Content Area */}
              <div className="flex-1 w-full overflow-hidden bg-white">
                <iframe
                  ref={iframeRef}
                  key={`${activePage}-${previewKey}-${activeSection}`}
                  src={previewUrl}
                  className="w-full h-full border-none"
                  title="Preview"
                  onLoad={() => {
                    // Re-enviar o estado atual quando o iframe carregar
                    if (iframeRef.current?.contentWindow) {
                      const win = iframeRef.current.contentWindow;
                      // Hero
                      win.postMessage(
                        { type: "UPDATE_HERO_BG", ...heroSettings },
                        "*"
                      );
                      win.postMessage(
                        { type: "UPDATE_HERO_CONTENT", ...heroSettings },
                        "*"
                      );
                      // Serviços
                      win.postMessage(
                        {
                          type: "UPDATE_SERVICES_CONTENT",
                          settings: servicesSettings,
                        },
                        "*"
                      );
                      // Valores
                      win.postMessage(
                        {
                          type: "UPDATE_VALUES_CONTENT",
                          settings: valuesSettings,
                        },
                        "*"
                      );
                      // Fontes
                      win.postMessage(
                        { type: "UPDATE_FONTS", ...fontSettings },
                        "*"
                      );
                    }
                  }}
                />
              </div>

              {/* Mobile Home Indicator */}
              {previewMode === "mobile" && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full" />
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
