import { type RefObject, useCallback, useEffect, useMemo } from "react";
import { normalizeStepSettings } from "@/lib/booking-data";
import type { useEditorState } from "./use-editor-state";

interface UseEditorSyncProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  state: ReturnType<typeof useEditorState>;
  pageVisibility: Record<string, boolean>;
  visibleSections: Record<string, boolean>;
}

export function useEditorSync({
  iframeRef,
  state,
  pageVisibility,
  visibleSections,
}: UseEditorSyncProps) {
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
    lastSavedHero,
    lastSavedAboutHero,
    lastSavedStory,
    lastSavedTeam,
    lastSavedTestimonials,
    lastSavedFont,
    lastSavedColor,
    lastSavedServices,
    lastSavedValues,
    lastSavedGallery,
    lastSavedCTA,
    lastSavedHeader,
    lastSavedFooter,
    lastSavedBookingService,
    lastSavedBookingDate,
    lastSavedBookingTime,
    lastSavedBookingForm,
    lastSavedBookingConfirmation,
  } = state;

  const previewHeroSettings = useMemo(() => ({ ...lastSavedHero, ...heroSettings }), [lastSavedHero, heroSettings]);
  const previewAboutHeroSettings = useMemo(() => ({ ...lastSavedAboutHero, ...aboutHeroSettings }), [lastSavedAboutHero, aboutHeroSettings]);
  const previewStorySettings = useMemo(() => ({ ...lastSavedStory, ...storySettings }), [lastSavedStory, storySettings]);
  const previewTeamSettings = useMemo(() => ({ ...lastSavedTeam, ...teamSettings }), [lastSavedTeam, teamSettings]);
  const previewTestimonialsSettings = useMemo(() => ({ ...lastSavedTestimonials, ...testimonialsSettings }), [lastSavedTestimonials, testimonialsSettings]);
  const previewServicesSettings = useMemo(() => ({ ...lastSavedServices, ...servicesSettings }), [lastSavedServices, servicesSettings]);
  const previewValuesSettings = useMemo(() => ({ ...lastSavedValues, ...valuesSettings }), [lastSavedValues, valuesSettings]);
  const previewFontSettings = useMemo(() => ({ ...lastSavedFont, ...fontSettings }), [lastSavedFont, fontSettings]);
  const previewColorSettings = useMemo(() => ({ ...lastSavedColor, ...colorSettings }), [lastSavedColor, colorSettings]);
  const previewGallerySettings = useMemo(() => ({ ...lastSavedGallery, ...gallerySettings }), [lastSavedGallery, gallerySettings]);
  const previewCTASettings = useMemo(() => ({ ...lastSavedCTA, ...ctaSettings }), [lastSavedCTA, ctaSettings]);
  const previewHeaderSettings = useMemo(() => ({ ...lastSavedHeader, ...headerSettings }), [lastSavedHeader, headerSettings]);
  const previewFooterSettings = useMemo(() => ({ ...lastSavedFooter, ...footerSettings }), [lastSavedFooter, footerSettings]);

  const previewBookingServiceSettings = useMemo(() => normalizeStepSettings({ ...lastSavedBookingService, ...bookingServiceSettings }), [lastSavedBookingService, bookingServiceSettings]);
  const previewBookingDateSettings = useMemo(() => normalizeStepSettings({ ...lastSavedBookingDate, ...bookingDateSettings }), [lastSavedBookingDate, bookingDateSettings]);
  const previewBookingTimeSettings = useMemo(() => normalizeStepSettings({ ...lastSavedBookingTime, ...bookingTimeSettings }), [lastSavedBookingTime, bookingTimeSettings]);
  const previewBookingFormSettings = useMemo(() => normalizeStepSettings({ ...lastSavedBookingForm, ...bookingFormSettings }), [lastSavedBookingForm, bookingFormSettings]);
  const previewBookingConfirmationSettings = useMemo(() => normalizeStepSettings({ ...lastSavedBookingConfirmation, ...bookingConfirmationSettings }), [lastSavedBookingConfirmation, bookingConfirmationSettings]);

  const syncToIframe = useCallback((type: string, settings: Record<string, unknown> | null | undefined) => {
    iframeRef.current?.contentWindow?.postMessage({ type, settings }, "*");
  }, [iframeRef]);

  useEffect(() => syncToIframe("UPDATE_HERO_SETTINGS", previewHeroSettings), [previewHeroSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_ABOUT_HERO_SETTINGS", previewAboutHeroSettings), [previewAboutHeroSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_STORY_SETTINGS", previewStorySettings), [previewStorySettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_TEAM_SETTINGS", previewTeamSettings), [previewTeamSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_TESTIMONIALS_SETTINGS", previewTestimonialsSettings), [previewTestimonialsSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_SERVICES_SETTINGS", previewServicesSettings), [previewServicesSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_VALUES_SETTINGS", previewValuesSettings), [previewValuesSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_TYPOGRAPHY", previewFontSettings), [previewFontSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_COLORS", previewColorSettings), [previewColorSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_GALLERY_SETTINGS", previewGallerySettings), [previewGallerySettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_CTA_SETTINGS", previewCTASettings), [previewCTASettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_HEADER_SETTINGS", previewHeaderSettings), [previewHeaderSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_FOOTER_SETTINGS", previewFooterSettings), [previewFooterSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_BOOKING_SERVICE_SETTINGS", previewBookingServiceSettings), [previewBookingServiceSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_BOOKING_DATE_SETTINGS", previewBookingDateSettings), [previewBookingDateSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_BOOKING_TIME_SETTINGS", previewBookingTimeSettings), [previewBookingTimeSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_BOOKING_FORM_SETTINGS", previewBookingFormSettings), [previewBookingFormSettings, syncToIframe]);
  useEffect(() => syncToIframe("UPDATE_BOOKING_CONFIRMATION_SETTINGS", previewBookingConfirmationSettings), [previewBookingConfirmationSettings, syncToIframe]);

  useEffect(() => {
    syncToIframe("UPDATE_PAGE_VISIBILITY", pageVisibility);
  }, [pageVisibility, syncToIframe]);

  useEffect(() => {
    syncToIframe("UPDATE_VISIBLE_SECTIONS", visibleSections);
  }, [visibleSections, syncToIframe]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "BOOKING_FLOW_READY") {
        console.log(">>> [EDITOR] BookingFlow ready, resending settings...");
        if (iframeRef.current?.contentWindow) {
          const win = iframeRef.current.contentWindow;
          win.postMessage({ type: "UPDATE_BOOKING_SERVICE_SETTINGS", settings: previewBookingServiceSettings }, "*");
          win.postMessage({ type: "UPDATE_BOOKING_DATE_SETTINGS", settings: previewBookingDateSettings }, "*");
          win.postMessage({ type: "UPDATE_BOOKING_TIME_SETTINGS", settings: previewBookingTimeSettings }, "*");
          win.postMessage({ type: "UPDATE_BOOKING_FORM_SETTINGS", settings: previewBookingFormSettings }, "*");
          win.postMessage({ type: "UPDATE_BOOKING_CONFIRMATION_SETTINGS", settings: previewBookingConfirmationSettings }, "*");
          win.postMessage({ type: "UPDATE_COLORS", settings: previewColorSettings }, "*");
          win.postMessage({ type: "UPDATE_TYPOGRAPHY", settings: previewFontSettings }, "*");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    previewBookingServiceSettings,
    previewBookingDateSettings,
    previewBookingTimeSettings,
    previewBookingFormSettings,
    previewBookingConfirmationSettings,
    previewColorSettings,
    previewFontSettings,
    iframeRef,
  ]);

  return {
    previewHeroSettings,
    previewAboutHeroSettings,
    previewStorySettings,
    previewTeamSettings,
    previewTestimonialsSettings,
    previewServicesSettings,
    previewValuesSettings,
    previewFontSettings,
    previewColorSettings,
    previewGallerySettings,
    previewCTASettings,
    previewHeaderSettings,
    previewFooterSettings,
    previewBookingServiceSettings,
    previewBookingDateSettings,
    previewBookingTimeSettings,
    previewBookingFormSettings,
    previewBookingConfirmationSettings,
  };
}
