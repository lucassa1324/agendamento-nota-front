"use client";

import { LayoutDashboard, PanelLeftClose, Save, Settings2, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ThemeInjectorClient } from "@/components/theme-injector-client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useSidebar } from "@/context/sidebar-context";
import { useStudio } from "@/context/studio-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL, signOut, useSession } from "@/lib/auth-client";
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
  const [isNavOpen, setIsNavOpen] = useState(!isMobile);
  
  // Sincronizar isNavOpen com isMobile apenas no carregamento inicial
  useEffect(() => {
    setIsNavOpen(!isMobile);
  }, [isMobile]);
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: session } = useSession();
  const adminUser = session?.user
    ? { name: session.user.name, username: session.user.email }
    : null;

  const handleLogout = async () => {
    await signOut();
    router.push("/admin");
  };

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isTourRunning, setIsTourRunning] = useState(false);

  const { businessId: studioId } = useStudio();
  const {
    heroSettings,
    aboutHeroSettings,
    storySettings,
    teamSettings,
    testimonialsSettings,
    fontSettings,
    colorSettings,
    servicesSettings,
    homeValuesSettings,
    aboutUsValuesSettings,
    gallerySettings,
    galleryPageSettings,
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
    handleUpdateHomeValues,
    handleUpdateAboutUsValues,
    handleUpdateGallery,
    handleUpdateGalleryPage,
    handleUpdateCTA,
    handleUpdateHeader,
    handleUpdateFooter,
    handleUpdateBookingService,
    handleUpdateBookingDate,
    handleUpdateBookingTime,
    handleUpdateBookingForm,
    handleUpdateBookingConfirmation,
    handleUpdateBackground,
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
    handleApplyHomeValues,
    handleApplyAboutUsValues,
    handleApplyGallery,
    handleApplyCTA,
    handleApplyHeader,
    handleApplyFooter,
    handleApplyBookingService,
    handleApplyBookingDate,
    handleApplyBookingTime,
    handleApplyBookingForm,
    handleApplyBookingConfirmation,
    handleSaveLocal,
    handleSaveGlobal,
    handlePublish,
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
    hasHomeValuesChanges,
    hasAboutUsValuesChanges,
    hasGalleryChanges,
    hasGalleryPageChanges,
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
    fetchCustomization,
    isFetching: isConfigFetching,
    isSaving,
    isPublishing,
    setActiveSectionId,
  } = useSiteEditor(iframeRef);

  useEffect(() => {
    const hasSeenCustomizerTour = localStorage.getItem("tour_customizer_v1");
    if (hasSeenCustomizerTour === "true") return;
    const timer = window.setTimeout(() => {
      setIsTourRunning(true);
    }, 600);
    return () => window.clearTimeout(timer);
  }, []);

  const handleTourCallback = (data: CallBackProps) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      localStorage.setItem("tour_customizer_v1", "true");
      setIsTourRunning(false);
    }
  };

  // Use a ref to store the latest fetchCustomization function to break the dependency loop
  const fetchCustomizationRef = useRef(fetchCustomization);
  useEffect(() => {
    fetchCustomizationRef.current = fetchCustomization;
  }, [fetchCustomization]);

  const handleSaveGlobalRef = useRef(handleSaveGlobal);
  useEffect(() => {
    handleSaveGlobalRef.current = handleSaveGlobal;
  }, [handleSaveGlobal]);

  const waitForNextStateCycle = () =>
    new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 0);
    });

  const applyAndSave = (applyFn: () => void) => async () => {
    applyFn();
    await waitForNextStateCycle();
    await handleSaveGlobalRef.current();
  };

  const handlePageVisibilityChangeWithAutosave = (
    pageId: string,
    isVisible: boolean,
  ) => {
    handlePageVisibilityChange(pageId, isVisible);
    void (async () => {
      await waitForNextStateCycle();
      await handleSaveGlobalRef.current(false);
    })();
  };

  const handleSectionVisibilityToggleWithAutosave = (sectionId: string) => {
    handleSectionVisibilityToggle(sectionId);
    void (async () => {
      await waitForNextStateCycle();
      await handleSaveGlobalRef.current(false);
    })();
  };

  const handleToggleStatus = async (checked: boolean) => {
    const business = businesses[0];
    if (!business || !business.id) return;
    const newStatus = checked;
    if (business.active && !newStatus) {
      const confirmed = window.confirm(
        "Isso vai bloquear o acesso ao estúdio para o usuário comum. Deseja desativar mesmo assim?",
      );
      if (!confirmed) return;
    }
    setIsUpdatingStatus(true);

    try {
      // Usa o endpoint de status da empresa (que controla o acesso do estúdio)
      const response = await customFetch(
        `${API_BASE_URL}/api/business/${business.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: newStatus }),
          credentials: "include",
        },
      );

      if (response.ok) {
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === business.id ? { ...b, active: newStatus } : b,
          ),
        );

        toast({
          title: "Status Atualizado",
          description: `O acesso ao estúdio foi ${newStatus ? "ativado" : "desativado"} com sucesso.`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao atualizar status");
      }
    } catch (err) {
      console.error(">>> [CUSTOMIZER_ERROR] Falha ao alternar status:", err);
      toast({
        title: "Erro ao atualizar",
        description:
          "Não foi possível alterar o status de acesso. Verifique sua conexão.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const fetchBusinessData = useCallback(async () => {
    if (!slug && !studioId) return;
    if (typeof window !== "undefined") {
      const skipBank = sessionStorage.getItem("personalizacao_skip_bank");
      const cachedBusiness = sessionStorage.getItem("personalizacao_business");
      if (skipBank && cachedBusiness) {
        try {
          const businessData = JSON.parse(cachedBusiness) as Business;
          setBusinesses([businessData]);
        } catch (err) {
          console.warn(">>> [CUSTOMIZER_CACHE] Cache inválido:", err);
        }
        sessionStorage.removeItem("personalizacao_skip_bank");
        setIsLoading(false);
        return;
      }
      if (skipBank) {
        sessionStorage.removeItem("personalizacao_skip_bank");
      }
    }
    setIsLoading(true);
    setError(null);
    try {
      // Ajustado para priorizar busca por ID (/api/business/:id) conforme solicitado
      let fetchUrl = `${API_BASE_URL}/api/business/slug/${slug}`;
      if (studioId) {
        fetchUrl = `${API_BASE_URL}/api/business/${studioId}`;
        console.log(
          `>>> [CUSTOMIZER_FETCH] Buscando estúdio via ID: ${studioId}`,
        );
      } else {
        console.log(
          `>>> [CUSTOMIZER_FETCH] Buscando estúdio via SLUG: ${slug}`,
        );
      }

      const response = await customFetch(fetchUrl, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const businessData = Array.isArray(data) ? data[0] : data;

        if (businessData) {
          setBusinesses([businessData]);
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "personalizacao_business",
              JSON.stringify(businessData),
            );
          }

          if (businessData.id) {
            await fetchCustomizationRef.current(businessData.id);
          }
        } else {
          setError("Dados do estúdio não encontrados.");
        }
      } else {
        const errorText = await response.text();
        console.warn(
          `>>> [ADMIN_WARN] Erro ao buscar estúdio (${response.status}):`,
          errorText,
        );
        setError(`Erro ao carregar dados (${response.status})`);
      }
    } catch (err) {
      console.warn(">>> [ADMIN_WARN] Erro de rede:", err);
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [slug, studioId]);

  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

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

  // Forçar modo mobile quando estiver em dispositivo móvel
  useEffect(() => {
    if (isMobile) {
      setPreviewMode("mobile");
      setIsAutoZoom(true);
    }
  }, [isMobile, setPreviewMode, setIsAutoZoom]);

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
  } = useNavigationManager(iframeRef, slug);

  // Sincroniza a seção ativa do useNavigationManager com o useEditorState
  useEffect(() => {
    if (activeSection) {
      setActiveSectionId(activeSection);
    } else {
      setActiveSectionId("hero"); // Default para Hero se nada selecionado
    }
  }, [activeSection, setActiveSectionId]);

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
    homeValuesSettings,
    aboutUsValuesSettings,
    gallerySettings,
    galleryPageSettings,
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
    onUpdateHomeValues: handleUpdateHomeValues,
    onUpdateAboutUsValues: handleUpdateAboutUsValues,
    onUpdateGallery: handleUpdateGallery,
    onUpdateGalleryPage: handleUpdateGalleryPage,
    onUpdateCTA: handleUpdateCTA,
    onUpdateHeader: handleUpdateHeader,
    onUpdateFooter: handleUpdateFooter,
    onUpdateBookingService: handleUpdateBookingService,
    onUpdateBookingDate: handleUpdateBookingDate,
    onUpdateBookingTime: handleUpdateBookingTime,
    onUpdateBookingForm: handleUpdateBookingForm,
    onUpdateBookingConfirmation: handleUpdateBookingConfirmation,
    onUpdateBackground: handleUpdateBackground,
    onSaveFont: applyAndSave(handleApplyTypography),
    onSaveColors: applyAndSave(handleApplyColors),
    onSaveHero: applyAndSave(handleApplyHero),
    onSaveAboutHero: applyAndSave(handleApplyAboutHero),
    onSaveStory: applyAndSave(handleApplyStory),
    onSaveTeam: applyAndSave(handleApplyTeam),
    onSaveTestimonials: applyAndSave(handleApplyTestimonials),
    onSaveServices: applyAndSave(handleApplyServices),
    onSaveHomeValues: applyAndSave(handleApplyHomeValues),
    onSaveAboutUsValues: applyAndSave(handleApplyAboutUsValues),
    onSaveGallery: applyAndSave(handleApplyGallery),
    onSaveCTA: applyAndSave(handleApplyCTA),
    onSaveHeader: applyAndSave(handleApplyHeader),
    onSaveFooter: applyAndSave(handleApplyFooter),
    onSaveBookingService: applyAndSave(handleApplyBookingService),
    onSaveBookingDate: applyAndSave(handleApplyBookingDate),
    onSaveBookingTime: applyAndSave(handleApplyBookingTime),
    onSaveBookingForm: applyAndSave(handleApplyBookingForm),
    onSaveBookingConfirmation: applyAndSave(handleApplyBookingConfirmation),
    hasFontChanges,
    hasColorChanges,
    hasHeroChanges,
    hasAboutHeroChanges,
    hasStoryChanges,
    hasTeamChanges,
    hasTestimonialsChanges,
    hasServicesChanges,
    hasHomeValuesChanges,
    hasAboutUsValuesChanges,
    hasGalleryChanges,
    hasGalleryPageChanges,
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
    onSectionVisibilityToggle: handleSectionVisibilityToggleWithAutosave,
    onSectionReset: handleSectionReset,
    pageVisibility,
    onPageVisibilityChange: handlePageVisibilityChangeWithAutosave,
    onSaveLocal: handleSaveLocal,
    onSaveGlobal: handleSaveGlobal,
    onPublish: handlePublish,
    isSaving,
    isPublishing,
    hasUnsavedGlobalChanges,
    pages,
    sections,
  };

  if (isLoading || isConfigFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-background gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Carregando configurações do estúdio...
        </p>
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
    <div className="flex flex-col h-screen w-full overflow-hidden overflow-x-hidden bg-background">
      <Joyride
        run={isTourRunning}
        continuous
        showProgress
        showSkipButton
        disableOverlayClose
        callback={handleTourCallback}
        locale={{
          back: "Voltar",
          close: "Fechar",
          last: "Concluir",
          next: "Próximo",
          skip: "Pular",
        }}
        steps={
          [
            {
              target: '[data-tour="customizer-tools-button"]',
              content:
                "Comece por aqui para abrir as ferramentas de edição do seu site.",
              placement: "bottom",
            },
            {
              target: '[data-tour="customizer-tools-sidebar"]',
              content:
                "Nesta lateral você escolhe a seção da página e altera textos, cores e visibilidade.",
            },
            {
              target: '[data-tour="customizer-preview-controls"]',
              content:
                "Use estes controles para alternar o preview entre desktop e mobile.",
            },
            {
              target: '[data-tour="customizer-preview-area"]',
              content:
                "Aqui você acompanha as alterações em tempo real antes de publicar.",
            },
          ] satisfies Step[]
        }
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-2 sm:px-4 shrink-0 z-30 shadow-sm gap-2 overflow-hidden">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <Button
            variant="default"
            size="default"
            className={cn(
              "h-9 px-2 sm:px-4 rounded-lg shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-2 border border-slate-700",
              isNavOpen
                ? "bg-slate-200 text-slate-900 hover:bg-slate-300"
                : "bg-slate-800 text-white hover:bg-slate-900 ring-2 ring-slate-500/20",
            )}
            title={
              isNavOpen ? "Fechar Menu de Navegação" : "Abrir Menu de Navegação"
            }
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            {isNavOpen ? (
              <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">
              {isNavOpen ? "FECHAR MENU" : "MENU"}
            </span>
          </Button>

          <Button
            variant="default"
            size="default"
            onClick={() => {
              onToggleSidebar(!isSidebarOpen);
              if (!isSidebarOpen) {
                setActiveSectionId("hero");
              }
            }}
            className={cn(
              "h-9 px-2 sm:px-4 rounded-lg shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-2 border border-slate-700",
              isSidebarOpen
                ? "bg-slate-100 text-slate-900 hover:bg-slate-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700 ring-2 ring-indigo-500/20",
            )}
            data-tour="customizer-tools-button"
            title={
              isSidebarOpen
                ? "Fechar ferramentas de edição"
                : "Abrir ferramentas de edição"
            }
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
            )}
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">
              {isSidebarOpen ? "Fechar" : "Ferramentas"}
            </span>
          </Button>

          {/* Botão de Status movido para perto dos botões principais */}
          <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-lg border border-border/50 shrink-0">
            <span className="hidden sm:inline text-[10px] font-bold uppercase text-muted-foreground/70 ml-1">
              Acesso ao site
            </span>
            <Badge
              variant={businesses[0]?.active ? "default" : "destructive"}
              className="h-4 px-1 text-[8px] uppercase font-bold"
            >
              {businesses[0]?.active ? "Ativo" : "Off"}
            </Badge>
            <Switch
              id="access-switch"
              checked={businesses[0]?.active ?? true}
              onCheckedChange={handleToggleStatus}
              disabled={isUpdatingStatus || !businesses[0]}
              className="scale-75 data-[state=checked]:bg-indigo-600"
            />
          </div>
        </div>

        {/* Centralizado os controles de preview */}
        <div
          className="flex-1 flex justify-center min-w-0"
          data-tour="customizer-preview-controls"
        >
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
            isMobile={isMobile}
          />
        </div>

        {/* Lado direito agora mais limpo, apenas com info do estúdio se houver espaço */}
        <div className="hidden xl:flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-lg border overflow-hidden shrink-0">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Estúdio:
          </span>
          <span className="text-sm font-semibold text-primary truncate max-w-37.5">
            {businesses[0]?.name || slug}
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Dashboard Navigation Sidebar (Mobile Drawer) */}
        <Sheet open={isMobile && isNavOpen} onOpenChange={setIsNavOpen}>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu de Navegação</SheetTitle>
            </SheetHeader>
            <AdminSidebar 
              adminUser={adminUser} 
              handleLogout={handleLogout} 
              onClose={() => setIsNavOpen(false)} 
            />
          </SheetContent>
        </Sheet>

        {/* Dashboard Navigation Sidebar (Desktop) */}
        <div className={cn(
          "shrink-0 border-r border-border bg-card shadow-lg transition-all duration-300",
          isNavOpen ? "flex" : "hidden"
        )}>
          <AdminSidebar 
            adminUser={adminUser} 
            handleLogout={handleLogout} 
            onClose={() => setIsNavOpen(false)}
          />
        </div>

        {/* Mobile Sidebar (Editor Tools) */}
        <Sheet open={isMobile && isSidebarOpen} onOpenChange={onToggleSidebar}>
          <SheetContent side="left" className="p-0 w-[85%] sm:w-80 lg:hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Personalização</SheetTitle>
            </SheetHeader>
            <SidebarContent {...sidebarProps} />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <div
          className={cn(
            "hidden lg:flex flex-col h-full border-r border-border bg-card transition-all duration-300 ease-in-out overflow-hidden shrink-0 z-20",
            isSidebarOpen ? "w-64 xl:w-80 2xl:w-96" : "w-0 border-r-0",
          )}
          data-tour="customizer-tools-sidebar"
        >
          <SidebarContent {...sidebarProps} />
        </div>

        {/* Preview Area */}
        <div
          className="flex-1 flex flex-col relative overflow-hidden h-full min-w-0"
          data-tour="customizer-preview-area"
        >
          <ThemeInjectorClient iframeRef={iframeRef} />
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
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
}
