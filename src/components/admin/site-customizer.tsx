"use client";

import {
  Activity,
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  const { toast } = useToast();
  const params = useParams();
  const slug = params?.slug as string;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
    handleSaveLocal,
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
    fetchCustomization,
    isFetching: isConfigFetching,
    isSaving,
    setActiveSectionId,
  } = useSiteEditor(iframeRef);

  // Use a ref to store the latest fetchCustomization function to break the dependency loop
  const fetchCustomizationRef = useRef(fetchCustomization);
  useEffect(() => {
    fetchCustomizationRef.current = fetchCustomization;
  }, [fetchCustomization]);

  const handleToggleStatus = async () => {
    const business = businesses[0];
    if (!business || !business.id) return;

    const newStatus = !business.active;
    setIsUpdatingStatus(true);

    try {
      // Usa o endpoint de status do usuário (que controla o acesso do estúdio)
      // Buscamos o ID do usuário através do business ou usamos o business.id se for o mesmo
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/users/${business.id}/status`,
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
        console.log(`>>> [CUSTOMIZER_FETCH] Buscando estúdio via ID: ${studioId}`);
      } else {
        console.log(`>>> [CUSTOMIZER_FETCH] Buscando estúdio via SLUG: ${slug}`);
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
    onUpdateBackground: handleUpdateBackground,
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
    activePageData: activePageData || null,
    expandedPages,
    visibleSections,
    onPageToggle: togglePageExpansion,
    onSectionSelect: scrollToSection,
    onSectionVisibilityToggle: handleSectionVisibilityToggle,
    onSectionReset: handleSectionReset,
    pageVisibility,
    onPageVisibilityChange: handlePageVisibilityChange,
    onSaveLocal: handleSaveLocal,
    onSaveGlobal: handleSaveGlobal,
    isSaving,
    hasUnsavedGlobalChanges,
    pages,
    sections,
  };

  const shouldSaveLocal =
    hasUnsavedGlobalChanges ||
    hasHeroChanges ||
    hasAboutHeroChanges ||
    hasStoryChanges ||
    hasTeamChanges ||
    hasTestimonialsChanges ||
    hasFontChanges ||
    hasColorChanges ||
    hasServicesChanges ||
    hasValuesChanges ||
    hasGalleryChanges ||
    hasCTAChanges ||
    hasHeaderChanges ||
    hasFooterChanges ||
    hasBookingServiceChanges ||
    hasBookingDateChanges ||
    hasBookingTimeChanges ||
    hasBookingFormChanges ||
    hasBookingConfirmationChanges;

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
      {/* Top Header */}
      <header className="h-12 sm:h-14 border-b border-border bg-card flex items-center justify-between flex-wrap sm:flex-nowrap px-2 sm:px-4 shrink-0 z-30 shadow-sm gap-2 gap-y-1">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Link href={`/admin/${slug}/dashboard/overview`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("personalizacao_skip_bank", "1");
                  if (businesses[0]) {
                    sessionStorage.setItem(
                      "personalizacao_business",
                      JSON.stringify(businesses[0]),
                    );
                  }
                }
                if (shouldSaveLocal) {
                  handleSaveLocal();
                }
              }}
              className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground shrink-0"
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleSidebar(!isSidebarOpen)}
            className="h-8 w-8 sm:h-10 sm:w-10 bg-[#1e293b] text-white hover:bg-[#334155] hover:text-white rounded-lg shadow-md transition-all active:scale-95 shrink-0"
            title="Alternar barra lateral"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <PanelLeftOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>

          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 bg-muted/50 px-2 sm:px-3 py-1.5 rounded-lg border max-w-30 sm:max-w-none overflow-hidden">
              <span className="hidden sm:inline text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
                Estúdio:
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-primary truncate">
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
              isMobile={isMobile}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 sm:gap-3 bg-muted/30 px-2 sm:px-3 py-1.5 rounded-lg border border-border/50">
            <div className="flex flex-col items-end mr-1">
              <Label
                htmlFor="access-switch"
                className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-1"
              >
                Acesso ao Site
              </Label>
              <div className="flex items-center gap-1.5">
                {isUpdatingStatus ? (
                  <Activity className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <Badge
                    variant={businesses[0]?.active ? "default" : "destructive"}
                    className="h-4 px-1.5 text-[9px] uppercase font-bold"
                  >
                    {businesses[0]?.active ? "Ativo" : "Off"}
                  </Badge>
                )}
              </div>
            </div>
            <Switch
              id="access-switch"
              checked={businesses[0]?.active ?? true}
              onCheckedChange={handleToggleStatus}
              disabled={isUpdatingStatus || !businesses[0]}
              className="scale-75 sm:scale-100 data-[state=checked]:bg-primary data-[state=unchecked]:bg-destructive origin-right"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar */}
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
        >
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
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
