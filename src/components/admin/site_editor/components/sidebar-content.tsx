/**
 * Componente que renderiza o conteúdo da barra lateral do editor.
 * Alterna entre a navegação principal (SidebarNav) e os editores específicos
 * de cada seção (Hero, Fontes, Serviços, etc).
 */

import { 
  ArrowLeft, 
  RotateCcw, 
  Settings2 } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { 
  CTASettings, 
  FontSettings, 
  FooterSettings, 
  GallerySettings, 
  HeaderSettings, 
  HeroSettings, 
  ServicesSettings, 
  StorySettings, 
  ValuesSettings 
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { FooterEditor } from "../layout/footer-editor";
import { HeaderEditor } from "../layout/header-editor";
import { TypographyEditor } from "../layout/typography-editor";
import { CTAEditor } from "../pages/home/cta-editor";
import { GalleryEditor } from "../pages/home/gallery-editor";
import { HeroEditor } from "../pages/home/hero-editor";
import { HistoryEditor } from "../pages/about/history-editor";
import { ServicesEditor } from "../pages/home/services-editor";
import { ValuesEditor } from "../pages/home/values-editor";
import { SidebarNav } from "../sidebar-nav";
import type { PageItem, SectionItem } from "./editor-constants";

interface SidebarContentProps {
  activeSection: string | null;
  activeSectionData: SectionItem | null;
  setActiveSection: (id: string | null) => void;
  resetSettings: () => void;
  fontSettings: FontSettings;
  heroSettings: HeroSettings;
  aboutHeroSettings: HeroSettings;
  storySettings: StorySettings;
  servicesSettings: ServicesSettings;
  valuesSettings: ValuesSettings;
  gallerySettings: GallerySettings;
  ctaSettings: CTASettings;
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  onUpdateFont: (updates: Partial<FontSettings>) => void;
  onUpdateHero: (updates: Partial<HeroSettings>) => void;
  onUpdateAboutHero: (updates: Partial<HeroSettings>) => void;
  onUpdateStory: (updates: Partial<StorySettings>) => void;
  onUpdateServices: (updates: Partial<ServicesSettings>) => void;
  onUpdateValues: (updates: Partial<ValuesSettings>) => void;
  onUpdateGallery: (updates: Partial<GallerySettings>) => void;
  onUpdateCTA: (updates: Partial<CTASettings>) => void;
  onUpdateHeader: (updates: Partial<HeaderSettings>) => void;
  onUpdateFooter: (updates: Partial<FooterSettings>) => void;
  onSaveFont: () => void;
  onSaveHero: () => void;
  onSaveAboutHero: () => void;
  onSaveStory: () => void;
  onSaveServices: () => void;
  onSaveValues: () => void;
  onSaveGallery: () => void;
  onSaveCTA: () => void;
  onSaveHeader: () => void;
  onSaveFooter: () => void;
  hasFontChanges: boolean;
  hasHeroChanges: boolean;
  hasAboutHeroChanges: boolean;
  hasStoryChanges: boolean;
  hasServicesChanges: boolean;
  hasValuesChanges: boolean;
  hasGalleryChanges: boolean;
  hasCTAChanges: boolean;
  hasHeaderChanges: boolean;
  hasFooterChanges: boolean;
  onHighlight: (id: string) => void;
  activePage: string;
  expandedPages: string[];
  visibleSections: Record<string, boolean>;
  onPageToggle: (id: string) => void;
  onSectionSelect: (sectionId: string, pageId: string) => void;
  onSectionVisibilityToggle: (id: string) => void;
  onSectionReset: (id: string) => void;
  pageVisibility: Record<string, boolean>;
  onPageVisibilityChange: (id: string, isVisible: boolean) => void;
  onSaveGlobal: () => void;
  hasUnsavedGlobalChanges: boolean;
  pages: PageItem[];
  sections: Record<string, SectionItem[]>;
}

export const SidebarContent = memo(
  ({
    activeSection,
    activeSectionData,
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
    onUpdateFont,
    onUpdateHero,
    onUpdateAboutHero,
    onUpdateStory,
    onUpdateServices,
    onUpdateValues,
    onUpdateGallery,
    onUpdateCTA,
    onUpdateHeader,
    onUpdateFooter,
    onSaveFont,
    onSaveHero,
    onSaveAboutHero,
    onSaveStory,
    onSaveServices,
    onSaveValues,
    onSaveGallery,
    onSaveCTA,
    onSaveHeader,
    onSaveFooter,
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
    onHighlight,
    activePage,
    expandedPages,
    visibleSections,
    onPageToggle,
    onSectionSelect,
    onSectionVisibilityToggle,
    onSectionReset,
    pageVisibility,
    onPageVisibilityChange,
    onSaveGlobal,
    hasUnsavedGlobalChanges,
    pages,
    sections,
  }: SidebarContentProps) => {
    return (
      <div className="flex flex-col h-full text-[clamp(0.75rem,1vw,0.875rem)]">
        <div className="p-3 xl:p-6 pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <Settings2 className="w-4 h-4 xl:w-5 xl:h-5" />
              <span className="text-[10px] xl:text-sm tracking-wide uppercase">
                Editor
              </span>
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
            <div className="space-y-4 xl:space-y-6">
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
                  <h3 className="text-xs xl:text-sm font-bold text-primary truncate max-w-37.5 xl:max-w-none">
                    {activeSectionData?.name}
                  </h3>
                  <p className="text-[9px] xl:text-[10px] text-muted-foreground">
                    Editando seção
                  </p>
                </div>
              </div>

              <div className="space-y-3 xl:space-y-4 p-3 xl:p-4 rounded-xl bg-muted/30 border border-border">
                {activeSection === "header" && (
                  <HeaderEditor
                    settings={headerSettings}
                    onUpdate={onUpdateHeader}
                    hasChanges={hasHeaderChanges}
                    onSave={onSaveHeader}
                  />
                )}
                {activeSection === "footer" && (
                  <FooterEditor
                    settings={footerSettings}
                    onUpdate={onUpdateFooter}
                    hasChanges={hasFooterChanges}
                    onSave={onSaveFooter}
                  />
                )}
                {activeSection === "typography" && (
                  <TypographyEditor
                    settings={fontSettings}
                    onUpdate={onUpdateFont}
                    onHighlight={onHighlight}
                    hasChanges={hasFontChanges}
                    onSave={onSaveFont}
                  />
                )}

                {activeSection === "hero" && (
                  <HeroEditor
                    settings={heroSettings}
                    onUpdate={onUpdateHero}
                    onHighlight={onHighlight}
                    hasChanges={hasHeroChanges}
                    onSave={onSaveHero}
                  />
                )}
                {activeSection === "about-hero" && (
                  <HeroEditor
                    settings={aboutHeroSettings}
                    onUpdate={onUpdateAboutHero}
                    onHighlight={onHighlight}
                    hasChanges={hasAboutHeroChanges}
                    onSave={onSaveAboutHero}
                  />
                )}
                {activeSection === "story" && (
                  <HistoryEditor 
                    settings={storySettings}
                    onUpdate={onUpdateStory}
                    hasChanges={hasStoryChanges} 
                    onSave={onSaveStory} 
                  />
                )}
                {activeSection === "services" && (
                  <ServicesEditor
                    settings={servicesSettings}
                    onUpdate={onUpdateServices}
                    hasChanges={hasServicesChanges}
                    onSave={onSaveServices}
                  />
                )}
                {activeSection === "values" && (
                  <ValuesEditor
                    settings={valuesSettings}
                    onUpdate={onUpdateValues}
                    onSave={onSaveValues}
                    hasChanges={hasValuesChanges}
                  />
                )}

                {(activeSection === "gallery-preview" || activeSection === "gallery-grid") && (
                  <GalleryEditor
                    settings={gallerySettings}
                    onUpdate={onUpdateGallery}
                    onSave={onSaveGallery}
                    hasChanges={hasGalleryChanges}
                  />
                )}

                {activeSection === "cta" && (
                  <CTAEditor
                    settings={ctaSettings}
                    onUpdate={onUpdateCTA}
                    onSave={onSaveCTA}
                    hasChanges={hasCTAChanges}
                  />
                )}

                {![
                  "header",
                  "footer",
                  "typography",
                  "hero",
                  "about-hero",
                  "story",
                  "services",
                  "values",
                  "gallery-preview",
                  "gallery-grid",
                  "cta",
                ].includes(activeSection) && (
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
              onPageToggle={onPageToggle}
              onSectionSelect={onSectionSelect}
              onSectionVisibilityToggle={onSectionVisibilityToggle}
              onSectionReset={onSectionReset}
              pageVisibility={pageVisibility}
              onPageVisibilityChange={onPageVisibilityChange}
            />
          )}
        </div>

        <div className="p-6 pt-4 border-t border-border bg-background">
          <Button
            type="button"
            disabled={
              !hasUnsavedGlobalChanges &&
              !hasHeroChanges &&
              !hasAboutHeroChanges &&
              !hasStoryChanges &&
              !hasFontChanges &&
              !hasServicesChanges &&
              !hasValuesChanges &&
              !hasGalleryChanges &&
              !hasCTAChanges &&
              !hasHeaderChanges &&
              !hasFooterChanges
            }
            onClick={onSaveGlobal}
            className={cn(
              "w-full font-bold py-6 rounded-xl transition-all duration-300",
              hasUnsavedGlobalChanges ||
                hasHeroChanges ||
                hasAboutHeroChanges ||
                hasStoryChanges ||
                hasFontChanges ||
                hasServicesChanges ||
                hasValuesChanges ||
                hasGalleryChanges ||
                hasCTAChanges ||
                hasHeaderChanges ||
                hasFooterChanges
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {hasUnsavedGlobalChanges ||
            hasHeroChanges ||
            hasAboutHeroChanges ||
            hasStoryChanges ||
            hasFontChanges ||
            hasServicesChanges ||
            hasValuesChanges ||
            hasGalleryChanges ||
            hasCTAChanges ||
            hasHeaderChanges ||
            hasFooterChanges
              ? "Publicar Site"
              : "Tudo Atualizado"}
          </Button>
        </div>
      </div>
    );
  }
);

SidebarContent.displayName = "SidebarContent";
