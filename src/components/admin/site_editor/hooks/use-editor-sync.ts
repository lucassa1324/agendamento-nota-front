import { type RefObject, useCallback, useEffect, useMemo } from "react";
import { normalizeStepSettings, sanitizeColor } from "@/lib/booking-data";
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
    lastSavedHero,
    lastSavedAboutHero,
    lastSavedStory,
    lastSavedTeam,
    lastSavedTestimonials,
    lastSavedFont,
    lastSavedColor,
    lastSavedServices,
    lastSavedHomeValues,
    lastSavedAboutUsValues,
    lastSavedGallery,
    lastSavedGalleryPage,
    lastSavedCTA,
    lastSavedHeader,
    lastSavedFooter,
    lastSavedBookingService,
    lastSavedBookingDate,
    lastSavedBookingTime,
    lastSavedBookingForm,
    lastSavedBookingConfirmation,
  } = state;

  const previewHeroSettings = useMemo(() => {
    const merged = { ...lastSavedHero, ...heroSettings };
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (heroSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedHero, heroSettings]);

  const previewAboutHeroSettings = useMemo(() => {
    const merged = { ...lastSavedAboutHero, ...aboutHeroSettings };
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (aboutHeroSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedAboutHero, aboutHeroSettings]);

  const previewStorySettings = useMemo(() => {
    const merged = { ...lastSavedStory, ...storySettings };
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (storySettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedStory, storySettings]);

  const previewTeamSettings = useMemo(() => {
    const merged = { ...lastSavedTeam, ...teamSettings };
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (teamSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedTeam, teamSettings]);

  const previewTestimonialsSettings = useMemo(() => {
    const merged = { ...lastSavedTestimonials, ...testimonialsSettings };
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (testimonialsSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedTestimonials, testimonialsSettings]);

  const previewServicesSettings = useMemo(() => {
    const merged = { ...lastSavedServices, ...servicesSettings } as typeof servicesSettings & Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (servicesSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    
    // Sanitização de Cores
    merged.bgColor = sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.titleColor = sanitizeColor(merged.titleColor) || "";
    merged.subtitleColor = sanitizeColor(merged.subtitleColor) || "";
    merged.cardBgColor = sanitizeColor(merged.cardBgColor || merged.appearance?.cardBgColor) || "";
    merged.cardTitleColor = sanitizeColor(merged.cardTitleColor) || "";
    merged.cardDescriptionColor = sanitizeColor(merged.cardDescriptionColor) || "";
    merged.cardPriceColor = sanitizeColor(merged.cardPriceColor) || "";
    merged.cardIconColor = sanitizeColor(merged.cardIconColor) || "";

    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: merged.bgColor,
        cardBgColor: merged.cardBgColor,
      };
    }
    
    return merged;
  }, [lastSavedServices, servicesSettings]);

  const previewHomeValuesSettings = useMemo(() => {
    const merged = { ...lastSavedHomeValues, ...homeValuesSettings } as
      | (typeof homeValuesSettings & Record<string, unknown>)
      | (typeof lastSavedHomeValues & Record<string, unknown>);
    if (homeValuesSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    const mergedRecord = merged as Record<string, unknown>;
    const mergedCardConfig =
      mergedRecord.cardConfig as Record<string, unknown> | undefined;
    const mergedContent =
      mergedRecord.content as Record<string, unknown> | undefined;
    const mergedItemsStyle =
      mergedRecord.itemsStyle as Record<string, unknown> | undefined;
    const mergedAppearance =
      mergedRecord.appearance as Record<string, unknown> | undefined;
    const resolvedCardBgColor =
      sanitizeColor(
        (merged.cardBgColor as string | undefined) ||
          (mergedRecord.cardBackgroundColor as string | undefined) ||
          (mergedRecord.card_background_color as string | undefined) ||
          (mergedCardConfig?.cardBackgroundColor as string | undefined) ||
          (mergedCardConfig?.backgroundColor as string | undefined) ||
          (mergedContent?.cardBgColor as string | undefined) ||
          (mergedItemsStyle?.itemBackgroundColor as string | undefined) ||
          (mergedAppearance?.cardBgColor as string | undefined) ||
          (mergedAppearance?.cardBackgroundColor as string | undefined),
      ) || "";
    if (!merged.cardBgColor && resolvedCardBgColor) {
      merged.cardBgColor = resolvedCardBgColor;
    }
    if (!mergedRecord.cardBackgroundColor && resolvedCardBgColor) {
      mergedRecord.cardBackgroundColor = resolvedCardBgColor;
    }
    return merged;
  }, [lastSavedHomeValues, homeValuesSettings]);

  const previewAboutUsValuesSettings = useMemo(() => {
    const merged = { ...lastSavedAboutUsValues, ...aboutUsValuesSettings } as
      | (typeof aboutUsValuesSettings & Record<string, unknown>)
      | (typeof lastSavedAboutUsValues & Record<string, unknown>);
    if (aboutUsValuesSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    const mergedRecord = merged as Record<string, unknown>;
    const mergedCardConfig =
      mergedRecord.cardConfig as Record<string, unknown> | undefined;
    const mergedContent =
      mergedRecord.content as Record<string, unknown> | undefined;
    const mergedItemsStyle =
      mergedRecord.itemsStyle as Record<string, unknown> | undefined;
    const mergedAppearance =
      mergedRecord.appearance as Record<string, unknown> | undefined;
    const resolvedCardBgColor =
      sanitizeColor(
        (merged.cardBgColor as string | undefined) ||
          (mergedRecord.cardBackgroundColor as string | undefined) ||
          (mergedRecord.card_background_color as string | undefined) ||
          (mergedCardConfig?.cardBackgroundColor as string | undefined) ||
          (mergedCardConfig?.backgroundColor as string | undefined) ||
          (mergedContent?.cardBgColor as string | undefined) ||
          (mergedItemsStyle?.itemBackgroundColor as string | undefined) ||
          (mergedAppearance?.cardBgColor as string | undefined) ||
          (mergedAppearance?.cardBackgroundColor as string | undefined),
      ) || "";
    if (!merged.cardBgColor && resolvedCardBgColor) {
      merged.cardBgColor = resolvedCardBgColor;
    }
    if (!mergedRecord.cardBackgroundColor && resolvedCardBgColor) {
      mergedRecord.cardBackgroundColor = resolvedCardBgColor;
    }
    return merged;
  }, [lastSavedAboutUsValues, aboutUsValuesSettings]);

  const previewCTASettings = useMemo(() => {
    const merged = { ...lastSavedCTA, ...ctaSettings };
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (ctaSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedCTA, ctaSettings]);

  const previewBookingServiceSettings = useMemo(() => {
    const merged = normalizeStepSettings({
      ...lastSavedBookingService,
      ...bookingServiceSettings,
    });
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingServiceSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedBookingService, bookingServiceSettings]);

  const previewBookingDateSettings = useMemo(() => {
    const merged = normalizeStepSettings({
      ...lastSavedBookingDate,
      ...bookingDateSettings,
    });
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingDateSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedBookingDate, bookingDateSettings]);

  const previewBookingTimeSettings = useMemo(() => {
    const merged = normalizeStepSettings({
      ...lastSavedBookingTime,
      ...bookingTimeSettings,
    });
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingTimeSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedBookingTime, bookingTimeSettings]);

  const previewBookingFormSettings = useMemo(() => {
    const merged = normalizeStepSettings({
      ...lastSavedBookingForm,
      ...bookingFormSettings,
    });
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingFormSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedBookingForm, bookingFormSettings]);

  const previewBookingConfirmationSettings = useMemo(() => {
    const merged = normalizeStepSettings({
      ...lastSavedBookingConfirmation,
      ...bookingConfirmationSettings,
    });
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingConfirmationSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedBookingConfirmation, bookingConfirmationSettings]);

  const previewFontSettings = useMemo(
    () => ({ ...lastSavedFont, ...fontSettings }),
    [lastSavedFont, fontSettings],
  );
  const previewColorSettings = useMemo(
    () => ({ ...lastSavedColor, ...colorSettings }),
    [lastSavedColor, colorSettings],
  );
  const previewGallerySettings = useMemo(() => {
    const merged = { ...lastSavedGallery, ...gallerySettings } as typeof gallerySettings & Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (gallerySettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    
    // Sanitização de Cores
    merged.bgColor = sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.titleColor = sanitizeColor(merged.titleColor) || "";
    merged.subtitleColor = sanitizeColor(merged.subtitleColor) || "";
    merged.buttonColor = sanitizeColor(merged.buttonColor) || "";
    merged.buttonTextColor = sanitizeColor(merged.buttonTextColor) || "";
    merged.cardBgColor = sanitizeColor(merged.cardBgColor || merged.appearance?.cardBgColor) || "";

    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: merged.bgColor,
        cardBgColor: merged.cardBgColor,
      };
    }
    
    return merged;
  }, [lastSavedGallery, gallerySettings]);
  const previewGalleryPageSettings = useMemo(() => {
    const merged = { ...lastSavedGalleryPage, ...galleryPageSettings } as typeof galleryPageSettings & Record<string, unknown>;
    if (galleryPageSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    merged.bgColor = sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.titleColor = sanitizeColor(merged.titleColor) || "";
    merged.subtitleColor = sanitizeColor(merged.subtitleColor) || "";
    merged.buttonColor = sanitizeColor(merged.buttonColor) || "";
    merged.buttonTextColor = sanitizeColor(merged.buttonTextColor) || "";
    merged.cardBgColor = sanitizeColor(merged.cardBgColor || merged.appearance?.cardBgColor) || "";

    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: merged.bgColor,
        cardBgColor: merged.cardBgColor,
      };
    }

    return merged;
  }, [lastSavedGalleryPage, galleryPageSettings]);
  const previewHeaderSettings = useMemo(
    () => ({ ...lastSavedHeader, ...headerSettings }),
    [lastSavedHeader, headerSettings],
  );
  const previewFooterSettings = useMemo(
    () => ({ ...lastSavedFooter, ...footerSettings }),
    [lastSavedFooter, footerSettings],
  );

  const previewBookingSteps = useMemo(
    () => ({
      service: previewBookingServiceSettings,
      date: previewBookingDateSettings,
      time: previewBookingTimeSettings,
      form: previewBookingFormSettings,
      confirmation: previewBookingConfirmationSettings,
    }),
    [
      previewBookingServiceSettings,
      previewBookingDateSettings,
      previewBookingTimeSettings,
      previewBookingFormSettings,
      previewBookingConfirmationSettings,
    ],
  );

  const siteCustomization = useMemo(
    () => ({
      hero: previewHeroSettings,
      aboutHero: previewAboutHeroSettings,
      story: previewStorySettings,
      team: previewTeamSettings,
      testimonials: previewTestimonialsSettings,
      services: previewServicesSettings,
      homeValuesSettings: previewHomeValuesSettings,
      aboutUsValuesSettings: previewAboutUsValuesSettings,
      galleryPreviewSettings: previewGallerySettings,
      galleryPageSettings: previewGalleryPageSettings,
      cta: previewCTASettings,
      header: previewHeaderSettings,
      footer: previewFooterSettings,
      bookingSteps: previewBookingSteps,
      theme: previewFontSettings,
      colors: previewColorSettings,
      visibleSections,
      pageVisibility,
      layoutGlobal: {
        hero: previewHeroSettings,
        aboutHero: previewAboutHeroSettings,
        story: previewStorySettings,
        team: previewTeamSettings,
        testimonials: previewTestimonialsSettings,
        services: previewServicesSettings,
        homeValuesSettings: previewHomeValuesSettings,
        aboutUsValuesSettings: previewAboutUsValuesSettings,
        galleryPreviewSettings: previewGallerySettings,
        galleryPageSettings: previewGalleryPageSettings,
        cta: previewCTASettings,
        header: previewHeaderSettings,
        footer: previewFooterSettings,
        bookingSteps: previewBookingSteps,
        siteColors: previewColorSettings,
        typography: previewFontSettings,
        visibleSections,
        pageVisibility,
      },
    }),
    [
      previewHeroSettings,
      previewAboutHeroSettings,
      previewStorySettings,
      previewTeamSettings,
      previewTestimonialsSettings,
      previewServicesSettings,
      previewHomeValuesSettings,
      previewAboutUsValuesSettings,
      previewGallerySettings,
      previewGalleryPageSettings,
      previewCTASettings,
      previewHeaderSettings,
      previewFooterSettings,
      previewBookingSteps,
      previewFontSettings,
      previewColorSettings,
      visibleSections,
      pageVisibility,
    ],
  );

  const syncToIframe = useCallback(
    (type: string, settings: Record<string, unknown> | null | undefined) => {
      iframeRef.current?.contentWindow?.postMessage({ type, settings }, "*");
    },
    [iframeRef],
  );

  useEffect(
    () => syncToIframe("UPDATE_HERO_SETTINGS", previewHeroSettings),
    [previewHeroSettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_ABOUT_HERO_SETTINGS", previewAboutHeroSettings),
    [previewAboutHeroSettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_STORY_SETTINGS", previewStorySettings),
    [previewStorySettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_TEAM_SETTINGS", previewTeamSettings),
    [previewTeamSettings, syncToIframe],
  );
  useEffect(
    () =>
      syncToIframe("UPDATE_TESTIMONIALS_SETTINGS", previewTestimonialsSettings),
    [previewTestimonialsSettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_SERVICES_SETTINGS", previewServicesSettings),
    [previewServicesSettings, syncToIframe],
  );
  useEffect(() => {
    console.log(">>> [EDITOR_SYNC] Syncing Home values settings to iframe:", previewHomeValuesSettings);
    syncToIframe("UPDATE_HOME_VALUES_SETTINGS", previewHomeValuesSettings);
  }, [previewHomeValuesSettings, syncToIframe]);

  useEffect(() => {
    console.log(">>> [EDITOR_SYNC] Syncing About Us values settings to iframe:", previewAboutUsValuesSettings);
    syncToIframe("UPDATE_ABOUT_US_VALUES_SETTINGS", previewAboutUsValuesSettings);
  }, [previewAboutUsValuesSettings, syncToIframe]);

  useEffect(() => {
    console.log(">>> [EDITOR_SYNC] Syncing booking service settings to iframe:", previewBookingServiceSettings);
    syncToIframe("UPDATE_BOOKING_SERVICE_SETTINGS", previewBookingServiceSettings);
  }, [previewBookingServiceSettings, syncToIframe]);
  useEffect(
    () => syncToIframe("UPDATE_TYPOGRAPHY", previewFontSettings),
    [previewFontSettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_COLORS", previewColorSettings),
    [previewColorSettings, syncToIframe],
  );
  useEffect(() => {
    console.log(">>> [EDITOR_SYNC] Syncing gallery settings to iframe:", previewGallerySettings);
    syncToIframe("UPDATE_GALLERY_PREVIEW", previewGallerySettings);
  }, [previewGallerySettings, syncToIframe]);
  useEffect(() => {
    console.log(">>> [EDITOR_SYNC] Syncing gallery page settings to iframe:", previewGalleryPageSettings);
    syncToIframe("UPDATE_GALLERY_PAGE", previewGalleryPageSettings);
  }, [previewGalleryPageSettings, syncToIframe]);
  useEffect(
    () => syncToIframe("UPDATE_CTA_SETTINGS", previewCTASettings),
    [previewCTASettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_HEADER_SETTINGS", previewHeaderSettings),
    [previewHeaderSettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_FOOTER_SETTINGS", previewFooterSettings),
    [previewFooterSettings, syncToIframe],
  );
  useEffect(
    () =>
      syncToIframe("UPDATE_BOOKING_DATE_SETTINGS", previewBookingDateSettings),
    [previewBookingDateSettings, syncToIframe],
  );
  useEffect(
    () =>
      syncToIframe("UPDATE_BOOKING_TIME_SETTINGS", previewBookingTimeSettings),
    [previewBookingTimeSettings, syncToIframe],
  );
  useEffect(
    () =>
      syncToIframe("UPDATE_BOOKING_FORM_SETTINGS", previewBookingFormSettings),
    [previewBookingFormSettings, syncToIframe],
  );
  useEffect(
    () =>
      syncToIframe(
        "UPDATE_BOOKING_CONFIRMATION_SETTINGS",
        previewBookingConfirmationSettings,
      ),
    [previewBookingConfirmationSettings, syncToIframe],
  );
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_SITE_DATA", data: siteCustomization },
      "*",
    );
  }, [siteCustomization, iframeRef]);

  useEffect(() => {
    syncToIframe("UPDATE_PAGE_VISIBILITY", pageVisibility);
  }, [pageVisibility, syncToIframe]);

  useEffect(() => {
    syncToIframe("UPDATE_VISIBLE_SECTIONS", visibleSections);
  }, [visibleSections, syncToIframe]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "BOOKING_FLOW_READY" || event.data?.type === "IFRAME_READY") {
        console.log(`>>> [EDITOR] ${event.data.type} recebido, enviando todas as configurações...`);
        if (iframeRef.current?.contentWindow) {
          const win = iframeRef.current.contentWindow;
          
          // Enviar configurações globais de tema
          win.postMessage({ type: "UPDATE_COLORS", settings: previewColorSettings }, "*");
          win.postMessage({ type: "UPDATE_TYPOGRAPHY", settings: previewFontSettings }, "*");
          
          // Enviar visibilidade
          win.postMessage({ type: "UPDATE_PAGE_VISIBILITY", settings: pageVisibility }, "*");
          win.postMessage({ type: "UPDATE_VISIBLE_SECTIONS", settings: visibleSections }, "*");

          // Enviar configurações de cada seção
          win.postMessage({ type: "UPDATE_HERO_SETTINGS", settings: previewHeroSettings }, "*");
          win.postMessage({ type: "UPDATE_ABOUT_HERO_SETTINGS", settings: previewAboutHeroSettings }, "*");
          win.postMessage({ type: "UPDATE_STORY_SETTINGS", settings: previewStorySettings }, "*");
          win.postMessage({ type: "UPDATE_TEAM_SETTINGS", settings: previewTeamSettings }, "*");
          win.postMessage({ type: "UPDATE_TESTIMONIALS_SETTINGS", settings: previewTestimonialsSettings }, "*");
          win.postMessage({ type: "UPDATE_SERVICES_SETTINGS", settings: previewServicesSettings }, "*");
          win.postMessage({ type: "UPDATE_HOME_VALUES_SETTINGS", settings: previewHomeValuesSettings }, "*");
          win.postMessage({ type: "UPDATE_ABOUT_US_VALUES_SETTINGS", settings: previewAboutUsValuesSettings }, "*");
          win.postMessage({ type: "UPDATE_GALLERY_PREVIEW", settings: previewGallerySettings }, "*");
          win.postMessage({ type: "UPDATE_GALLERY_PAGE", settings: previewGalleryPageSettings }, "*");
          win.postMessage({ type: "UPDATE_CTA_SETTINGS", settings: previewCTASettings }, "*");
          win.postMessage({ type: "UPDATE_HEADER_SETTINGS", settings: previewHeaderSettings }, "*");
          win.postMessage({ type: "UPDATE_FOOTER_SETTINGS", settings: previewFooterSettings }, "*");

          // Enviar configurações de agendamento
          win.postMessage({ type: "UPDATE_BOOKING_SERVICE_SETTINGS", settings: previewBookingServiceSettings }, "*");
          win.postMessage({ type: "UPDATE_BOOKING_DATE_SETTINGS", settings: previewBookingDateSettings }, "*");
          win.postMessage({ type: "UPDATE_BOOKING_TIME_SETTINGS", settings: previewBookingTimeSettings }, "*");
          win.postMessage({ type: "UPDATE_BOOKING_FORM_SETTINGS", settings: previewBookingFormSettings }, "*");
          win.postMessage({ type: "UPDATE_BOOKING_CONFIRMATION_SETTINGS", settings: previewBookingConfirmationSettings }, "*");
          
          // Dados do site completo (fallback)
          win.postMessage({ type: "UPDATE_SITE_DATA", data: siteCustomization }, "*");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    previewHeroSettings,
    previewAboutHeroSettings,
    previewStorySettings,
    previewTeamSettings,
    previewTestimonialsSettings,
    previewServicesSettings,
    previewHomeValuesSettings,
    previewAboutUsValuesSettings,
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
    previewColorSettings,
    previewFontSettings,
    pageVisibility,
    visibleSections,
    siteCustomization,
    iframeRef,
  ]);

  return {
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
  };
}
