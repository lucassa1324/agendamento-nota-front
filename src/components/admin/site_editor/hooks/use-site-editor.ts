import { useEffect, useRef, type RefObject } from "react";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfigData } from "@/lib/site-config-types";
import { useEditorActions } from "./use-editor-actions";
import { useEditorApi } from "./use-editor-api";
import { useEditorChanges } from "./use-editor-changes";
import { useEditorConfigLoader } from "./use-editor-config-loader";
import { useDraftRecovery } from "./use-editor-draft-recovery";
import { useEditorLocal } from "./use-editor-local";
import { useEditorState } from "./use-editor-state";
import { useEditorSync } from "./use-editor-sync";

export type { SiteConfigData };

export function useSiteEditor(iframeRef: RefObject<HTMLIFrameElement | null>) {
  const { toast } = useToast();
  const { studio, updateStudioInfo, refreshTrigger } = useStudio();
  const local = useEditorLocal();
  const state = useEditorState();
  const lastRefreshTriggerRef = useRef(refreshTrigger);

  const { checkShouldRecoverDraft } = useDraftRecovery();

  const { loadExternalConfig } = useEditorConfigLoader({
    local,
    state,
    checkShouldRecoverDraft,
    slug: studio?.slug,
  });

  // Sincroniza o estado do editor quando o studio no contexto mudar.
  // Só força atualização de `lastApplied` quando houver refresh manual.
  useEffect(() => {
    if (studio?.config) {
      const forceSyncApplied = lastRefreshTriggerRef.current !== refreshTrigger;
      console.log(
        `>>> [useSiteEditor] Studio config mudou. forceSyncApplied=${forceSyncApplied}, trigger=${refreshTrigger}`,
      );
      loadExternalConfig(
        studio.config as unknown as SiteConfigData,
        forceSyncApplied,
      );
      lastRefreshTriggerRef.current = refreshTrigger;
    }
  }, [studio?.config, refreshTrigger, loadExternalConfig]);

  const {
    previewHeroSettings,
    previewAboutHeroSettings,
    previewStorySettings,
    previewTeamSettings,
    previewTestimonialsSettings,
    previewServicesSettings,
    previewHomeValuesSettings,
    previewAboutUsValuesSettings,
    previewFontSettings,
    previewColorSettings,
    previewGallerySettings,
    previewGalleryPageSettings,
    previewCTASettings,
    previewHeaderSettings,
    previewFooterSettings,
    previewBookingServiceSettings,
    previewBookingDateSettings,
    previewBookingTimeSettings,
    previewBookingFormSettings,
    previewBookingConfirmationSettings,
  } = useEditorSync({
    iframeRef,
    state,
    pageVisibility: state.pageVisibility,
    visibleSections: state.visibleSections,
  });

  const {
    handleApplyHero,
    handleApplyAboutHero,
    handleApplyStory,
    handleApplyTeam,
    handleApplyTestimonials,
    handleApplyFont,
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
    resetSettings,
    handleSectionReset,
    handleUpdateBackground,
    handleUpdateHero,
    handleUpdateAboutHero,
    handleUpdateStory,
    handleUpdateTeam,
    handleUpdateTestimonials,
    handleUpdateServices,
    handleUpdateGallery,
    handleUpdateGalleryPage,
    handleUpdateHeader,
    handleUpdateFooter,
    handleUpdateCTA,
    handleUpdateHomeValues,
    handleUpdateAboutUsValues,
    handleUpdateFont,
    handleUpdateColors,
    handleUpdateBookingService,
    handleUpdateBookingDate,
    handleUpdateBookingTime,
    handleUpdateBookingForm,
    handleUpdateBookingConfirmation,
  } = useEditorActions({
    state,
    local,
    toast,
    businessId: studio?.id || "",
  });

  const settings = {
    heroSettings: state.heroSettings,
    aboutHeroSettings: state.aboutHeroSettings,
    storySettings: state.storySettings,
    teamSettings: state.teamSettings,
    testimonialsSettings: state.testimonialsSettings,
    fontSettings: state.fontSettings,
    colorSettings: state.colorSettings,
    servicesSettings: state.servicesSettings,
    homeValuesSettings: state.homeValuesSettings,
    aboutUsValuesSettings: state.aboutUsValuesSettings,
    gallerySettings: state.gallerySettings,
    galleryPageSettings: state.galleryPageSettings,
    ctaSettings: state.ctaSettings,
    headerSettings: state.headerSettings,
    footerSettings: state.footerSettings,
    bookingServiceSettings: state.bookingServiceSettings,
    bookingDateSettings: state.bookingDateSettings,
    bookingTimeSettings: state.bookingTimeSettings,
    bookingFormSettings: state.bookingFormSettings,
    bookingConfirmationSettings: state.bookingConfirmationSettings,
    pageVisibility: state.pageVisibility,
    visibleSections: state.visibleSections,
  };

  const lastSaved = {
    lastSavedHero: state.lastSavedHero,
    lastSavedAboutHero: state.lastSavedAboutHero,
    lastSavedStory: state.lastSavedStory,
    lastSavedTeam: state.lastSavedTeam,
    lastSavedTestimonials: state.lastSavedTestimonials,
    lastSavedFont: state.lastSavedFont,
    lastSavedColor: state.lastSavedColor,
    lastSavedServices: state.lastSavedServices,
    lastSavedHomeValues: state.lastSavedHomeValues,
    lastSavedAboutUsValues: state.lastSavedAboutUsValues,
    lastSavedGallery: state.lastSavedGallery,
    lastSavedGalleryPage: state.lastSavedGalleryPage,
    lastSavedCTA: state.lastSavedCTA,
    lastSavedHeader: state.lastSavedHeader,
    lastSavedFooter: state.lastSavedFooter,
    lastSavedBookingService: state.lastSavedBookingService,
    lastSavedBookingDate: state.lastSavedBookingDate,
    lastSavedBookingTime: state.lastSavedBookingTime,
    lastSavedBookingForm: state.lastSavedBookingForm,
    lastSavedBookingConfirmation: state.lastSavedBookingConfirmation,
    lastSavedPageVisibility: state.lastSavedPageVisibility,
    lastSavedVisibleSections: state.lastSavedVisibleSections,
  };

  const lastApplied = {
    lastAppliedHero: state.lastAppliedHero,
    lastAppliedAboutHero: state.lastAppliedAboutHero,
    lastAppliedStory: state.lastAppliedStory,
    lastAppliedTeam: state.lastAppliedTeam,
    lastAppliedTestimonials: state.lastAppliedTestimonials,
    lastAppliedFont: state.lastAppliedFont,
    lastAppliedColor: state.lastAppliedColor,
    lastAppliedServices: state.lastAppliedServices,
    lastAppliedHomeValues: state.lastAppliedHomeValues,
    lastAppliedAboutUsValues: state.lastAppliedAboutUsValues,
    lastAppliedGallery: state.lastAppliedGallery,
    lastAppliedGalleryPage: state.lastAppliedGalleryPage,
    lastAppliedCTA: state.lastAppliedCTA,
    lastAppliedHeader: state.lastAppliedHeader,
    lastAppliedFooter: state.lastAppliedFooter,
    lastAppliedBookingService: state.lastAppliedBookingService,
    lastAppliedBookingDate: state.lastAppliedBookingDate,
    lastAppliedBookingTime: state.lastAppliedBookingTime,
    lastAppliedBookingForm: state.lastAppliedBookingForm,
    lastAppliedBookingConfirmation: state.lastAppliedBookingConfirmation,
    lastAppliedPageVisibility: state.lastAppliedPageVisibility,
    lastAppliedVisibleSections: state.lastAppliedVisibleSections,
  };

  const setters = {
    setLastSavedHero: state.setLastSavedHero,
    setLastSavedAboutHero: state.setLastSavedAboutHero,
    setLastSavedStory: state.setLastSavedStory,
    setLastSavedTeam: state.setLastSavedTeam,
    setLastSavedTestimonials: state.setLastSavedTestimonials,
    setLastSavedFont: state.setLastSavedFont,
    setLastSavedColor: state.setLastSavedColor,
    setLastSavedServices: state.setLastSavedServices,
    setLastSavedHomeValues: state.setLastSavedHomeValues,
    setLastSavedAboutUsValues: state.setLastSavedAboutUsValues,
    setLastSavedGallery: state.setLastSavedGallery,
    setLastSavedGalleryPage: state.setLastSavedGalleryPage,
    setLastSavedCTA: state.setLastSavedCTA,
    setLastSavedHeader: state.setLastSavedHeader,
    setLastSavedFooter: state.setLastSavedFooter,
    setLastSavedBookingService: state.setLastSavedBookingService,
    setLastSavedBookingDate: state.setLastSavedBookingDate,
    setLastSavedBookingTime: state.setLastSavedBookingTime,
    setLastSavedBookingForm: state.setLastSavedBookingForm,
    setLastSavedBookingConfirmation: state.setLastSavedBookingConfirmation,
    setLastSavedPageVisibility: state.setLastSavedPageVisibility,
    setLastSavedVisibleSections: state.setLastSavedVisibleSections,
    setLastAppliedHero: state.setLastAppliedHero,
    setLastAppliedAboutHero: state.setLastAppliedAboutHero,
    setLastAppliedStory: state.setLastAppliedStory,
    setLastAppliedTeam: state.setLastAppliedTeam,
    setLastAppliedTestimonials: state.setLastAppliedTestimonials,
    setLastAppliedFont: state.setLastAppliedFont,
    setLastAppliedColor: state.setLastAppliedColor,
    setLastAppliedServices: state.setLastAppliedServices,
    setLastAppliedHomeValues: state.setLastAppliedHomeValues,
    setLastAppliedAboutUsValues: state.setLastAppliedAboutUsValues,
    setLastAppliedGallery: state.setLastAppliedGallery,
    setLastAppliedGalleryPage: state.setLastAppliedGalleryPage,
    setLastAppliedCTA: state.setLastAppliedCTA,
    setLastAppliedHeader: state.setLastAppliedHeader,
    setLastAppliedFooter: state.setLastAppliedFooter,
    setLastAppliedBookingService: state.setLastAppliedBookingService,
    setLastAppliedBookingDate: state.setLastAppliedBookingDate,
    setLastAppliedBookingTime: state.setLastAppliedBookingTime,
    setLastAppliedBookingForm: state.setLastAppliedBookingForm,
    setLastAppliedBookingConfirmation: state.setLastAppliedBookingConfirmation,
    setLastAppliedPageVisibility: state.setLastAppliedPageVisibility,
    setLastAppliedVisibleSections: state.setLastAppliedVisibleSections,
  };

  const changes = useEditorChanges({ settings, lastApplied });

  const {
    fetchCustomization,
    handleSaveLocal,
    handleSaveGlobal,
    handlePublish,
    hasUnsavedGlobalChanges,
    isFetching,
    isSaving,
    isPublishing,
  } = useEditorApi({
    loadExternalConfig,
    settings,
    lastSaved,
    lastApplied,
    setters,
    setIsDirty: state.setIsDirty,
    saveLocalDrafts: local.saveLocalDrafts,
    updateStudioInfo,
  });

  return {
    // State
    ...state,
    // Local storage / Drafts
    ...local,
    // Config loader
    loadExternalConfig,
    // API actions
    fetchCustomization,
    handleSaveLocal,
    handleSaveGlobal,
    handlePublish,
    hasUnsavedGlobalChanges,
    isFetching,
    isSaving,
    isPublishing,
    // Changes detection
    ...changes,
    // Sync settings (previews)
    previewHeroSettings,
    previewAboutHeroSettings,
    previewStorySettings,
    previewTeamSettings,
    previewTestimonialsSettings,
    previewServicesSettings,
    previewHomeValuesSettings,
    previewAboutUsValuesSettings,
    previewFontSettings,
    previewColorSettings,
    previewGallerySettings,
    previewGalleryPageSettings,
    previewCTASettings,
    previewHeaderSettings,
    previewFooterSettings,
    previewBookingServiceSettings,
    previewBookingDateSettings,
    previewBookingTimeSettings,
    previewBookingFormSettings,
    previewBookingConfirmationSettings,
    // Actions
    handleApplyHero,
    handleApplyAboutHero,
    handleApplyStory,
    handleApplyTeam,
    handleApplyTestimonials,
    handleApplyFont,
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
    resetSettings,
    handleSectionReset,
    handleUpdateBackground,
    handleUpdateHero,
    handleUpdateAboutHero,
    handleUpdateStory,
    handleUpdateTeam,
    handleUpdateTestimonials,
    handleUpdateServices,
    handleUpdateGallery,
    handleUpdateGalleryPage,
    handleUpdateHeader,
    handleUpdateFooter,
    handleUpdateCTA,
    handleUpdateHomeValues,
    handleUpdateAboutUsValues,
    handleUpdateFont,
    handleUpdateColors,
    handleUpdateBookingService,
    handleUpdateBookingDate,
    handleUpdateBookingTime,
    handleUpdateBookingForm,
    handleUpdateBookingConfirmation,
  };
}
