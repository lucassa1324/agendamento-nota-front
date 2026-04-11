import { useCallback } from "react";
import type {
  BookingStepSettings,
  ColorSettings,
  CTASettings,
  FontSettings,
  FooterSettings,
  GallerySettings,
  HeaderSettings,
  HeroSettings,
  ServicesSettings,
  StorySettings,
  TeamSettings,
  TestimonialsSettings,
  ValuesSettings,
} from "@/lib/booking-data";
import {
  getAboutHeroSettings,
  getAboutUsValuesSettings,
  getBookingConfirmationSettings,
  getBookingDateSettings,
  getBookingFormSettings,
  getBookingServiceSettings,
  getBookingTimeSettings,
  getColorSettings,
  getCTASettings,
  getDraftTimestamp,
  getFontSettings,
  getFooterSettings,
  getGalleryPageSettings,
  getGallerySettings,
  getHeaderSettings,
  getHeroSettings,
  getHomeValuesSettings,
  getPageVisibility,
  getServicesSettings,
  getStorageKey,
  getStorySettings,
  getTeamSettings,
  getTestimonialsSettings,
  getVisibleSections,
  saveAboutHeroSettings,
  saveAboutUsValuesSettings,
  saveBookingConfirmationSettings,
  saveBookingDateSettings,
  saveBookingFormSettings,
  saveBookingServiceSettings,
  saveBookingTimeSettings,
  saveColorSettings,
  saveCTASettings,
  saveFontSettings,
  saveFooterSettings,
  saveGalleryPageSettings,
  saveGallerySettings,
  saveHeaderSettings,
  saveHeroSettings,
  saveHomeValuesSettings,
  savePageVisibility,
  saveServicesSettings,
  saveStorySettings,
  saveTeamSettings,
  saveTestimonialsSettings,
  saveVisibleSections,
} from "@/lib/booking-data";

export type EditorLocalDrafts = {
  heroSettings: HeroSettings;
  aboutHeroSettings: HeroSettings;
  storySettings: StorySettings;
  teamSettings: TeamSettings;
  testimonialsSettings: TestimonialsSettings;
  fontSettings: FontSettings;
  colorSettings: ColorSettings;
  servicesSettings: ServicesSettings;
  homeValuesSettings: ValuesSettings;
  aboutUsValuesSettings: ValuesSettings;
  gallerySettings: GallerySettings;
  galleryPageSettings: GallerySettings;
  ctaSettings: CTASettings;
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  bookingServiceSettings: BookingStepSettings;
  bookingDateSettings: BookingStepSettings;
  bookingTimeSettings: BookingStepSettings;
  bookingFormSettings: BookingStepSettings;
  bookingConfirmationSettings: BookingStepSettings;
  pageVisibility: Record<string, boolean>;
  visibleSections: Record<string, boolean>;
  draftTimestamp?: number;
  [key: string]: unknown;
};

export function useEditorLocal() {
  const hasLocalDraft = useCallback((key: string) => {
    if (!key) return false;
    return false;
  }, []);

  const loadLocalDrafts = useCallback((): EditorLocalDrafts => {
    return {
      heroSettings: getHeroSettings(),
      aboutHeroSettings: getAboutHeroSettings(),
      storySettings: getStorySettings(),
      teamSettings: getTeamSettings(),
      testimonialsSettings: getTestimonialsSettings(),
      fontSettings: getFontSettings(),
      colorSettings: getColorSettings(),
      servicesSettings: getServicesSettings(),
      homeValuesSettings: getHomeValuesSettings(),
      aboutUsValuesSettings: getAboutUsValuesSettings(),
      gallerySettings: getGallerySettings(),
      galleryPageSettings: getGalleryPageSettings(),
      ctaSettings: getCTASettings(),
      headerSettings: getHeaderSettings(),
      footerSettings: getFooterSettings(),
      bookingServiceSettings: getBookingServiceSettings(),
      bookingDateSettings: getBookingDateSettings(),
      bookingTimeSettings: getBookingTimeSettings(),
      bookingFormSettings: getBookingFormSettings(),
      bookingConfirmationSettings: getBookingConfirmationSettings(),
      pageVisibility: getPageVisibility(),
      visibleSections: getVisibleSections(),
      draftTimestamp: Number(getDraftTimestamp()) || 0,
    };
  }, []);

  const saveLocalDrafts = useCallback((drafts: EditorLocalDrafts) => {
    saveHeroSettings(drafts.heroSettings);
    saveAboutHeroSettings(drafts.aboutHeroSettings);
    saveStorySettings(drafts.storySettings);
    saveTeamSettings(drafts.teamSettings);
    saveTestimonialsSettings(drafts.testimonialsSettings);
    saveFontSettings(drafts.fontSettings);
    saveColorSettings(drafts.colorSettings);
    saveServicesSettings(drafts.servicesSettings);
    saveHomeValuesSettings(drafts.homeValuesSettings);
    saveAboutUsValuesSettings(drafts.aboutUsValuesSettings);
    saveGallerySettings(drafts.gallerySettings);
    saveGalleryPageSettings(drafts.galleryPageSettings);
    saveCTASettings(drafts.ctaSettings);
    saveHeaderSettings(drafts.headerSettings);
    saveFooterSettings(drafts.footerSettings);
    savePageVisibility(drafts.pageVisibility);
    saveVisibleSections(drafts.visibleSections);
    saveBookingServiceSettings(drafts.bookingServiceSettings);
    saveBookingDateSettings(drafts.bookingDateSettings);
    saveBookingTimeSettings(drafts.bookingTimeSettings);
    saveBookingFormSettings(drafts.bookingFormSettings);
    saveBookingConfirmationSettings(drafts.bookingConfirmationSettings);
  }, []);

  const clearLocalDrafts = useCallback(() => {
    if (typeof window === "undefined") return;
    const keys = [
      "heroSettings",
      "aboutHeroSettings",
      "storySettings",
      "teamSettings",
      "testimonialsSettings",
      "fontSettings",
      "colorSettings",
      "servicesSettings",
      "homeValuesSettings",
      "aboutUsValuesSettings",
      "gallerySettings",
      "galleryPageSettings",
      "ctaSettings",
      "headerSettings",
      "footerSettings",
      "pageVisibility",
      "visibleSections",
      "bookingServiceSettings",
      "bookingDateSettings",
      "bookingTimeSettings",
      "bookingFormSettings",
      "bookingConfirmationSettings",
      "last_draft_update",
    ];

    for (const key of keys) {
      localStorage.removeItem(getStorageKey(key));
    }
    console.log(">>> [useEditorLocal] Rascunhos locais limpos.");
  }, []);

  const forceClearSectionDraft = useCallback((key: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(getStorageKey(key));
    console.log(">>> [LOCAL_STORAGE] Limpeza forçada executada para:", key);
  }, []);

  return {
    hasLocalDraft,
    loadLocalDrafts,
    saveLocalDrafts,
    clearLocalDrafts,
    forceClearSectionDraft,
    saveHeroSettings,
    saveAboutHeroSettings,
    saveStorySettings,
    saveTeamSettings,
    saveTestimonialsSettings,
    saveFontSettings,
    saveColorSettings,
    saveServicesSettings,
    saveHomeValuesSettings,
    saveAboutUsValuesSettings,
    saveGallerySettings,
    saveGalleryPageSettings,
    saveCTASettings,
    saveHeaderSettings,
    saveFooterSettings,
    savePageVisibility,
    saveVisibleSections,
    saveBookingServiceSettings,
    saveBookingDateSettings,
    saveBookingTimeSettings,
    saveBookingFormSettings,
    saveBookingConfirmationSettings,
  };
}
