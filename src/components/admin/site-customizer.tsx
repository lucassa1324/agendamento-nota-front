/**
 * Componente principal do Customizador de Site.
 * Atua como o orquestrador entre a barra lateral de edição (SidebarContent)
 * e a visualização em tempo real (PreviewFrame).
 */
"use client";

import { Layout, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSidebar } from "@/context/sidebar-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
  } = useSiteEditor(iframeRef);

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
            <h1 className="text-lg font-bold text-foreground whitespace-nowrap">
              Personalização do Site
            </h1>
            
            <div className="h-6 w-px bg-border hidden md:block" />
            
            <HeaderControls
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              mobileScale={mobileScale}
              desktopScale={desktopScale}
              setManualScale={setManualScale}
              setIsAutoZoom={setIsAutoZoom}
              isAutoZoom={isAutoZoom}
              setManualWidth={setManualWidth}
              reloadPreview={reloadPreview}
            />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
            <Layout className="w-4 h-4 text-primary/60" />
            <span>{activePageData?.path || "/"}</span>
          </div>
          <span className="capitalize">
            {new Intl.DateTimeFormat('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            }).format(new Date())}
          </span>
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
