/**
 * Componente principal do Customizador de Site.
 * Atua como o orquestrador entre a barra lateral de edição (SidebarContent)
 * e a visualização em tempo real (PreviewFrame).
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    fontSettings,
    servicesSettings,
    valuesSettings,
    gallerySettings,
    ctaSettings,
    headerSettings,
    footerSettings,
    pageVisibility,
    visibleSections,
    handleUpdateHero,
    handleUpdateAboutHero,
    handleUpdateStory,
    handleUpdateFont,
    handleUpdateServices,
    handleUpdateValues,
    handleUpdateGallery,
    handleUpdateCTA,
    handleUpdateHeader,
    handleUpdateFooter,
    handlePageVisibilityChange,
    handleSectionVisibilityToggle,
    handleApplyHero,
    handleApplyAboutHero,
    handleApplyStory,
    handleApplyTypography,
    handleApplyServices,
    handleApplyValues,
    handleApplyGallery,
    handleApplyCTA,
    handleApplyHeader,
    handleApplyFooter,
    handleSaveGlobal,
    resetSettings,
    handleSectionReset,
    hasHeroChanges,
    hasAboutHeroChanges,
    hasStoryChanges,
    hasFontChanges,
    hasServicesChanges,
    hasValuesChanges,
    hasGalleryChanges,
    hasCTAChanges,
    hasHeaderChanges,
    hasFooterChanges,
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

  const [headerPortalTarget, setHeaderPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const target = document.getElementById("header-actions");
    if (target) setHeaderPortalTarget(target);
    else {
      const timeout = setTimeout(() => setHeaderPortalTarget(document.getElementById("header-actions")), 500);
      return () => clearTimeout(timeout);
    }
  }, []);

  const sidebarProps = {
    activeSection,
    activeSectionData: activeSectionData || null,
    setActiveSection,
    resetSettings,
    fontSettings,
    heroSettings,
    aboutHeroSettings,
    storySettings,
    servicesSettings,
    valuesSettings,
    gallerySettings,
    ctaSettings,
    headerSettings,
    footerSettings,
    onUpdateFont: handleUpdateFont,
    onUpdateHero: handleUpdateHero,
    onUpdateAboutHero: handleUpdateAboutHero,
    onUpdateStory: handleUpdateStory,
    onUpdateServices: handleUpdateServices,
    onUpdateValues: handleUpdateValues,
    onUpdateGallery: handleUpdateGallery,
    onUpdateCTA: handleUpdateCTA,
    onUpdateHeader: handleUpdateHeader,
    onUpdateFooter: handleUpdateFooter,
    onSaveFont: handleApplyTypography,
    onSaveHero: handleApplyHero,
    onSaveAboutHero: handleApplyAboutHero,
    onSaveStory: handleApplyStory,
    onSaveServices: handleApplyServices,
    onSaveValues: handleApplyValues,
    onSaveGallery: handleApplyGallery,
    onSaveCTA: handleApplyCTA,
    onSaveHeader: handleApplyHeader,
    onSaveFooter: handleApplyFooter,
    hasFontChanges,
    hasHeroChanges,
    hasAboutHeroChanges,
    hasStoryChanges,
    hasServicesChanges,
    hasValuesChanges,
    hasGalleryChanges,
    hasCTAChanges,
    hasHeaderChanges,
    hasFooterChanges,
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
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      {headerPortalTarget && createPortal(
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
        />,
        headerPortalTarget
      )}

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
        setPreviewMode={setPreviewMode}
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
  );
}
