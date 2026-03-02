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
  getBookingConfirmationSettings,
  getBookingDateSettings,
  getBookingFormSettings,
  getBookingServiceSettings,
  getBookingTimeSettings,
  getColorSettings,
  getCTASettings,
  getFontSettings,
  getFooterSettings,
  getGallerySettings,
  getHeaderSettings,
  getHeroSettings,
  getPageVisibility,
  getServicesSettings,
  getStorageKey,
  getStorySettings,
  getTeamSettings,
  getTestimonialsSettings,
  getValuesSettings,
  getVisibleSections,
  saveAboutHeroSettings,
  saveBookingConfirmationSettings,
  saveBookingDateSettings,
  saveBookingFormSettings,
  saveBookingServiceSettings,
  saveBookingTimeSettings,
  saveColorSettings,
  saveCTASettings,
  saveFontSettings,
  saveFooterSettings,
  saveGallerySettings,
  saveHeaderSettings,
  saveHeroSettings,
  savePageVisibility,
  saveServicesSettings,
  saveStorySettings,
  saveTeamSettings,
  saveTestimonialsSettings,
  saveValuesSettings,
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
  valuesSettings: ValuesSettings;
  gallerySettings: GallerySettings;
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
};

export function useEditorLocal() {
  const hasLocalDraft = useCallback((key: string) => {
    return (
      typeof window !== "undefined" &&
      localStorage.getItem(getStorageKey(key)) !== null
    );
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
      valuesSettings: getValuesSettings(),
      gallerySettings: getGallerySettings(),
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
    saveValuesSettings(drafts.valuesSettings);
    saveGallerySettings(drafts.gallerySettings);
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
    const keys = [
      "heroSettings",
      "aboutHeroSettings",
      "storySettings",
      "teamSettings",
      "testimonialsSettings",
      "fontSettings",
      "colorSettings",
      "servicesSettings",
      "valuesSettings",
      "gallerySettings",
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

  return {
    hasLocalDraft,
    loadLocalDrafts,
    saveLocalDrafts,
    clearLocalDrafts,
    saveHeroSettings,
    saveAboutHeroSettings,
    saveStorySettings,
    saveTeamSettings,
    saveTestimonialsSettings,
    saveFontSettings,
    saveColorSettings,
    saveServicesSettings,
    saveValuesSettings,
    saveGallerySettings,
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
