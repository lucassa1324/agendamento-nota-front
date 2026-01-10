"use client";

import { PanelLeftClose, PanelLeftOpen, Save } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSidebar } from "@/context/sidebar-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/auth-client";
import type { Business } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { pages, sections } from "./site_editor/components/editor-constants";
import { HeaderControls } from "./site_editor/components/header-controls";
import { PreviewFrame } from "./site_editor/components/preview-frame";
import { SidebarContent } from "./site_editor/components/sidebar-content";
import { useNavigationManager } from "./site_editor/hooks/use-navigation-manager";
import { usePreviewManager } from "./site_editor/hooks/use-preview-manager";
import { useSiteEditor } from "./site_editor/hooks/use-site-editor";

export function SiteCustomizer() {
  const { isSidebarOpen, setIsSidebarOpen: onToggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const params = useParams();
  const slug = params?.slug as string;
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    heroSettings,
    aboutHeroSettings,
    storySettings,
    teamSettings,
    testimonialsSettings,
    fontSettings,
    colorSettings,
    servicesSettings,
    valuesSettings,
    gallerySettings,
    ctaSettings,
    headerSettings,
    footerSettings,
    bookingServiceSettings,
    bookingDateSettings,
    bookingTimeSettings,
    bookingFormSettings,
    bookingConfirmationSettings,
    pageVisibility,
    visibleSections,
    handleUpdateHero,
    handleUpdateAboutHero,
    handleUpdateStory,
    handleUpdateTeam,
    handleUpdateTestimonials,
    handleUpdateFont,
    handleUpdateColors,
    handleUpdateServices,
    handleUpdateValues,
    handleUpdateGallery,
    handleUpdateCTA,
    handleUpdateHeader,
    handleUpdateFooter,
    handleUpdateBookingService,
    handleUpdateBookingDate,
    handleUpdateBookingTime,
    handleUpdateBookingForm,
    handleUpdateBookingConfirmation,
    handlePageVisibilityChange,
    handleSectionVisibilityToggle,
    handleApplyHero,
    handleApplyAboutHero,
    handleApplyStory,
    handleApplyTeam,
    handleApplyTestimonials,
    handleApplyTypography,
    handleApplyColors,
    handleApplyServices,
    handleApplyValues,
    handleApplyGallery,
    handleApplyCTA,
    handleApplyHeader,
    handleApplyFooter,
    handleApplyBookingService,
    handleApplyBookingDate,
    handleApplyBookingTime,
    handleApplyBookingForm,
    handleApplyBookingConfirmation,
    handleSaveGlobal,
    resetSettings,
    handleSectionReset,
    hasHeroChanges,
    hasAboutHeroChanges,
    hasStoryChanges,
    hasTeamChanges,
    hasTestimonialsChanges,
    hasFontChanges,
    hasColorChanges,
    hasServicesChanges,
    hasValuesChanges,
    hasGalleryChanges,
    hasCTAChanges,
    hasHeaderChanges,
    hasFooterChanges,
    hasBookingServiceChanges,
    hasBookingDateChanges,
    hasBookingTimeChanges,
    hasBookingFormChanges,
    hasBookingConfirmationChanges,
    hasUnsavedGlobalChanges,
    // Novos helpers para sincronização com o banco
    loadExternalConfig,
  } = useSiteEditor(iframeRef);

  const fetchBusinessData = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log(`>>> [CUSTOMIZER] Buscando dados para o slug: ${slug}`);
      // Ajustado de /api/studios para /api/business conforme confirmado pelo back-end
      const response = await fetch(`${API_BASE_URL}/api/business/slug/${slug}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const businessData = Array.isArray(data) ? data[0] : data;
        
        if (businessData) {
          setBusinesses([businessData]);
          setSelectedBusinessId(businessData.id);
          
          if (businessData.config) {
            console.log(">>> [CUSTOMIZER] Configuração encontrada, carregando no editor...");
            loadExternalConfig(businessData.config);
          }
        } else {
          setError("Dados do estúdio não encontrados.");
        }
      } else {
        const errorText = await response.text();
        console.error(`>>> [CUSTOMIZER] Erro ao buscar estúdio (${response.status}):`, errorText);
        setError(`Erro ao carregar dados (${response.status})`);
      }
    } catch (err) {
      console.error(">>> [CUSTOMIZER] Erro de rede:", err);
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [slug, loadExternalConfig]);

  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  const handleSaveToDB = async () => {
    if (!selectedBusinessId) return;

    try {
      const currentConfig = {
        hero: heroSettings,
        aboutHero: aboutHeroSettings,
        story: storySettings,
        team: teamSettings,
        testimonials: testimonialsSettings,
        theme: fontSettings,
        colors: colorSettings,
        services: servicesSettings,
        values: valuesSettings,
        gallery: gallerySettings,
        cta: ctaSettings,
        header: headerSettings,
        footer: footerSettings,
        bookingSteps: {
          service: bookingServiceSettings,
          date: bookingDateSettings,
          time: bookingTimeSettings,
          form: bookingFormSettings,
          confirmation: bookingConfirmationSettings,
        },
        pageVisibility: pageVisibility,
        visibleSections: visibleSections,
      };

      console.log(`>>> [CUSTOMIZER] Salvando configurações para o estúdio: ${selectedBusinessId}`);
      const response = await fetch(`${API_BASE_URL}/api/studios/${selectedBusinessId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config: currentConfig }),
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Salvo com sucesso!",
          description: "As configurações foram salvas no banco de dados.",
        });
        // Também salva localmente (localStorage fallback)
        handleSaveGlobal();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(">>> [CUSTOMIZER] Erro ao salvar no banco:", errorData);
        throw new Error("Erro ao salvar no banco");
      }
    } catch (err) {
      console.error(">>> [CUSTOMIZER] Erro crítico ao salvar:", err);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível persistir as alterações.",
        variant: "destructive",
      });
    }
  };

  const {
    previewMode,
    setPreviewMode,
    setManualScale,
    setIsAutoZoom,
    isAutoZoom,
    setManualWidth,
    previewKey,
    reloadPreview,
    currentWidth,
    desktopScale,
    mobileScale,
  } = usePreviewManager(containerRef);

  const {
    activePage,
    activeSection,
    setActiveSection,
    expandedPages,
    togglePageExpansion,
    scrollToSection,
    handleHighlight,
    activePageData,
    activeSectionData,
    previewUrl,
  } = useNavigationManager(iframeRef);

  const sidebarProps = {
    activeSection,
    activeSectionData: activeSectionData || null,
    setActiveSection,
    resetSettings,
    fontSettings,
    colorSettings,
    heroSettings,
    aboutHeroSettings,
    storySettings,
    teamSettings,
    testimonialsSettings,
    servicesSettings,
    valuesSettings,
    gallerySettings,
    ctaSettings,
    headerSettings,
    footerSettings,
    bookingServiceSettings,
    bookingDateSettings,
    bookingTimeSettings,
    bookingFormSettings,
    bookingConfirmationSettings,
    onUpdateFont: handleUpdateFont,
    onUpdateColors: handleUpdateColors,
    onUpdateHero: handleUpdateHero,
    onUpdateAboutHero: handleUpdateAboutHero,
    onUpdateStory: handleUpdateStory,
    onUpdateTeam: handleUpdateTeam,
    onUpdateTestimonials: handleUpdateTestimonials,
    onUpdateServices: handleUpdateServices,
    onUpdateValues: handleUpdateValues,
    onUpdateGallery: handleUpdateGallery,
    onUpdateCTA: handleUpdateCTA,
    onUpdateHeader: handleUpdateHeader,
    onUpdateFooter: handleUpdateFooter,
    onUpdateBookingService: handleUpdateBookingService,
    onUpdateBookingDate: handleUpdateBookingDate,
    onUpdateBookingTime: handleUpdateBookingTime,
    onUpdateBookingForm: handleUpdateBookingForm,
    onUpdateBookingConfirmation: handleUpdateBookingConfirmation,
    onSaveFont: handleApplyTypography,
    onSaveColors: handleApplyColors,
    onSaveHero: handleApplyHero,
    onSaveAboutHero: handleApplyAboutHero,
    onSaveStory: handleApplyStory,
    onSaveTeam: handleApplyTeam,
    onSaveTestimonials: handleApplyTestimonials,
    onSaveServices: handleApplyServices,
    onSaveValues: handleApplyValues,
    onSaveGallery: handleApplyGallery,
    onSaveCTA: handleApplyCTA,
    onSaveHeader: handleApplyHeader,
    onSaveFooter: handleApplyFooter,
    onSaveBookingService: handleApplyBookingService,
    onSaveBookingDate: handleApplyBookingDate,
    onSaveBookingTime: handleApplyBookingTime,
    onSaveBookingForm: handleApplyBookingForm,
    onSaveBookingConfirmation: handleApplyBookingConfirmation,
    hasFontChanges,
    hasColorChanges,
    hasHeroChanges,
    hasAboutHeroChanges,
    hasStoryChanges,
    hasTeamChanges,
    hasTestimonialsChanges,
    hasServicesChanges,
    hasValuesChanges,
    hasGalleryChanges,
    hasCTAChanges,
    hasHeaderChanges,
    hasFooterChanges,
    hasBookingServiceChanges,
    hasBookingDateChanges,
    hasBookingTimeChanges,
    hasBookingFormChanges,
    hasBookingConfirmationChanges,
    onHighlight: handleHighlight,
    activePage,
    expandedPages,
    visibleSections,
    onPageToggle: togglePageExpansion,
    onSectionSelect: scrollToSection,
    onSectionVisibilityToggle: handleSectionVisibilityToggle,
    onSectionReset: handleSectionReset,
    pageVisibility,
    onPageVisibilityChange: handlePageVisibilityChange,
    onSaveGlobal: handleSaveGlobal,
    hasUnsavedGlobalChanges,
    pages,
    sections,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-background gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Carregando configurações do estúdio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-background gap-6 p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Save className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Ops! Algo deu errado</h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </div>
        <Button onClick={() => fetchBusinessData()} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleSidebar(!isSidebarOpen)}
            className="h-10 w-10 bg-[#1e293b] text-white hover:bg-[#334155] hover:text-white rounded-lg shadow-md transition-all active:scale-95"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </Button>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-lg border">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estúdio:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary truncate max-w-50">
                  {businesses[0]?.name || slug}
                </span>
              </div>
            </div>

            <HeaderControls
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              setManualScale={setManualScale}
              setIsAutoZoom={setIsAutoZoom}
              isAutoZoom={isAutoZoom}
              setManualWidth={setManualWidth}
              reloadPreview={reloadPreview}
              desktopScale={desktopScale}
              mobileScale={mobileScale}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveToDB}
            disabled={!selectedBusinessId}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-95 px-6 font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Tudo
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar */}
        <Sheet open={isMobile && isSidebarOpen} onOpenChange={onToggleSidebar}>
          <SheetContent side="left" className="p-0 w-[85%] sm:w-80 lg:hidden">
            <SheetHeader className="sr-only"><SheetTitle>Personalização</SheetTitle></SheetHeader>
            <SidebarContent {...sidebarProps} />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <div className={cn(
          "hidden lg:flex flex-col h-full border-r border-border bg-card transition-all duration-300 ease-in-out overflow-hidden shrink-0 z-20",
          isSidebarOpen ? "w-64 xl:w-80 2xl:w-96" : "w-0 border-r-0"
        )}>
          <SidebarContent {...sidebarProps} />
        </div>

        {/* Preview Area */}
        <PreviewFrame
          iframeRef={iframeRef}
          previewMode={previewMode}
          currentWidth={currentWidth}
          mobileScale={mobileScale}
          desktopScale={desktopScale}
          isAutoZoom={isAutoZoom}
          setManualWidth={setManualWidth}
          previewUrl={previewUrl}
          previewKey={previewKey}
          activePageData={activePageData}
          containerRef={containerRef}
        />
      </div>
    </div>
  );
}
