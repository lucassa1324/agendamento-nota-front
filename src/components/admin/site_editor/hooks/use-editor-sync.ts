import { type RefObject, useCallback, useEffect, useMemo } from "react";
import type { SectionConfig, SectionsMap } from "@/lib/booking-data";
import {
  defaultAboutHeroSettings,
  defaultBookingConfirmationSettings,
  defaultBookingDateSettings,
  defaultBookingFormSettings,
  defaultBookingServiceSettings,
  defaultBookingTimeSettings,
  defaultColorSettings,
  defaultCTASettings,
  defaultFontSettings,
  defaultFooterSettings,
  defaultGallerySettings,
  defaultHeaderSettings,
  defaultHeroSettings,
  defaultServicesSettings,
  defaultStorySettings,
  defaultTeamSettings,
  defaultTestimonialsSettings,
  defaultValuesSettings,
  normalizeStepSettings,
  SECTION_IDS,
  sanitizeColor,
  sanitizeSection,
} from "@/lib/booking-data";
import { normalizeSectionBackgroundData } from "../components/SectionBackground";
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
  const sanitizeSectionData = useCallback(
    (current: unknown, fallback: unknown): Record<string, unknown> =>
      sanitizeSection(current, fallback),
    [],
  );
  const buildPreviewSection = useCallback(
    (current: unknown, fallback: unknown): Record<string, unknown> => {
      const merged = sanitizeSectionData(current, fallback);
      const currentRecord =
        current && typeof current === "object" && !Array.isArray(current)
          ? (current as Record<string, unknown>)
          : {};

      if (
        Object.keys(currentRecord).length > 0 &&
        currentRecord.title === "Nossos Serviços"
      ) {
        const currentAppearance =
          (currentRecord.appearance as Record<string, unknown> | undefined) ||
          {};
        console.log(">>> [BUILD_PREVIEW] Iniciando para Serviços:", {
          currentBgColor: currentRecord.bgColor,
          currentAppearanceBg: currentAppearance.backgroundColor,
        });
      }

      const fallbackRecord =
        fallback && typeof fallback === "object" && !Array.isArray(fallback)
          ? (fallback as Record<string, unknown>)
          : {};
      const mergedAppearance =
        (merged.appearance as Record<string, unknown> | undefined) || {};
      const currentAppearance =
        (currentRecord.appearance as Record<string, unknown> | undefined) || {};
      const fallbackAppearance =
        (fallbackRecord.appearance as Record<string, unknown> | undefined) ||
        {};
      const draftBgColor =
        sanitizeColor(
          (currentRecord.bgColor as string | undefined) ||
          (currentRecord.backgroundColor as string | undefined) ||
          (currentAppearance.backgroundColor as string | undefined),
        ) || "";
      const mergedBgColor =
        sanitizeColor(
          (merged.bgColor as string | undefined) ||
          (mergedAppearance.backgroundColor as string | undefined) ||
          (fallbackRecord.bgColor as string | undefined) ||
          (fallbackRecord.backgroundColor as string | undefined) ||
          (fallbackAppearance.backgroundColor as string | undefined),
        ) || "";
      const resolvedBgColor = draftBgColor || mergedBgColor;
      if (resolvedBgColor) {
        merged.bgColor = resolvedBgColor;
        merged.backgroundColor = resolvedBgColor;
      }
      const nextAppearance = {
        ...mergedAppearance,
        ...(resolvedBgColor ? { backgroundColor: resolvedBgColor } : {}),
      };
      if (Object.keys(nextAppearance).length > 0) {
        merged.appearance = nextAppearance;
      }
      if (currentRecord.bgType === "color") {
        merged.bgType = "color";
        merged.bgImage = "";
        merged.appearance = {
          ...(merged.appearance as Record<string, unknown>),
          backgroundImageUrl: "",
        };
      }

      const normalizedBackground = normalizeSectionBackgroundData(merged);

      if (normalizedBackground.title === "Nossos Serviços") {
        const normalizedAppearance =
          (normalizedBackground.appearance as
            | Record<string, unknown>
            | undefined) || {};
        console.log(">>> [BUILD_PREVIEW] Finalizado para Serviços:", {
          mergedBgColor: normalizedBackground.bgColor,
          mergedAppearanceBg: normalizedAppearance.backgroundColor,
        });
      }

      return normalizedBackground;
    },
    [sanitizeSectionData],
  );

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
    const merged = buildPreviewSection(
      heroSettings,
      lastSavedHero,
    ) as typeof heroSettings & Record<string, unknown>;
    return merged;
  }, [lastSavedHero, heroSettings, buildPreviewSection]);

  const previewAboutHeroSettings = useMemo(() => {
    const merged = buildPreviewSection(
      aboutHeroSettings,
      lastSavedAboutHero,
    ) as typeof aboutHeroSettings & Record<string, unknown>;
    return merged;
  }, [lastSavedAboutHero, aboutHeroSettings, buildPreviewSection]);

  const previewStorySettings = useMemo(() => {
    const merged = buildPreviewSection(
      storySettings,
      lastSavedStory,
    ) as typeof storySettings & Record<string, unknown>;
    return merged;
  }, [lastSavedStory, storySettings, buildPreviewSection]);

  const previewTeamSettings = useMemo(() => {
    const merged = buildPreviewSection(
      teamSettings,
      lastSavedTeam,
    ) as typeof teamSettings & Record<string, unknown>;
    return merged;
  }, [lastSavedTeam, teamSettings, buildPreviewSection]);

  const previewTestimonialsSettings = useMemo(() => {
    const merged = buildPreviewSection(
      testimonialsSettings,
      lastSavedTestimonials,
    ) as typeof testimonialsSettings & Record<string, unknown>;
    return merged;
  }, [lastSavedTestimonials, testimonialsSettings, buildPreviewSection]);

  const previewServicesSettings = useMemo(() => {
    const merged = buildPreviewSection(
      servicesSettings,
      lastSavedServices,
    ) as typeof servicesSettings & Record<string, unknown>;
    const previewAppearance =
      (merged.appearance as Record<string, unknown> | undefined) || {};
    const unifiedBgColor =
      sanitizeColor(
        (merged.bgColor as string | undefined) ||
        (merged.backgroundColor as string | undefined) ||
        (previewAppearance.backgroundColor as string | undefined),
      ) || "";
    if (unifiedBgColor) {
      merged.bgColor = unifiedBgColor;
      merged.backgroundColor = unifiedBgColor;
    }
    merged.titleColor = sanitizeColor(merged.titleColor) || "";
    merged.subtitleColor = sanitizeColor(merged.subtitleColor) || "";
    merged.cardBgColor =
      sanitizeColor(merged.cardBgColor || merged.appearance?.cardBgColor) || "";
    merged.cardTitleColor = sanitizeColor(merged.cardTitleColor) || "";
    merged.cardDescriptionColor =
      sanitizeColor(merged.cardDescriptionColor) || "";
    merged.cardPriceColor = sanitizeColor(merged.cardPriceColor) || "";
    merged.cardIconColor = sanitizeColor(merged.cardIconColor) || "";

    merged.appearance = {
      ...previewAppearance,
      ...(unifiedBgColor
        ? { backgroundColor: unifiedBgColor, bgColor: unifiedBgColor }
        : {}),
      cardBgColor: merged.cardBgColor,
    };

    return merged;
  }, [lastSavedServices, servicesSettings, buildPreviewSection]);

  const previewHomeValuesSettings = useMemo(() => {
    const merged = buildPreviewSection(
      homeValuesSettings,
      lastSavedHomeValues,
    ) as typeof homeValuesSettings & Record<string, unknown>;

    const mergedRecord = merged as Record<string, unknown>;
    const mergedCardConfig = mergedRecord.cardConfig as
      | Record<string, unknown>
      | undefined;
    const mergedContent = mergedRecord.content as
      | Record<string, unknown>
      | undefined;
    const mergedItemsStyle = mergedRecord.itemsStyle as
      | Record<string, unknown>
      | undefined;
    const mergedAppearance = mergedRecord.appearance as
      | Record<string, unknown>
      | undefined;

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

    const unifiedBgColor =
      sanitizeColor(
        (merged.bgColor as string | undefined) ||
        (merged.backgroundColor as string | undefined) ||
        (mergedAppearance?.backgroundColor as string | undefined) ||
        (merged.values_bg as string | undefined) ||
        (merged.about_values_bg as string | undefined),
      ) || "";

    if (resolvedCardBgColor) {
      merged.cardBgColor = resolvedCardBgColor;
      mergedRecord.cardBackgroundColor = resolvedCardBgColor;
    }

    if (unifiedBgColor) {
      merged.bgColor = unifiedBgColor;
      merged.backgroundColor = unifiedBgColor;
      merged.values_bg = unifiedBgColor;
      merged.about_values_bg = unifiedBgColor;
      merged.bgType = "color";
      merged.bgImage = "";
      if (mergedAppearance) {
        mergedAppearance.backgroundColor = unifiedBgColor;
        mergedAppearance.bgType = "color";
        mergedAppearance.backgroundImageUrl = "";
      }
    }

    return merged;
  }, [lastSavedHomeValues, homeValuesSettings, buildPreviewSection]);

  const previewAboutUsValuesSettings = useMemo(() => {
    const merged = buildPreviewSection(
      aboutUsValuesSettings,
      lastSavedAboutUsValues,
    ) as typeof aboutUsValuesSettings & Record<string, unknown>;

    const mergedRecord = merged as Record<string, unknown>;
    const mergedCardConfig = mergedRecord.cardConfig as
      | Record<string, unknown>
      | undefined;
    const mergedContent = mergedRecord.content as
      | Record<string, unknown>
      | undefined;
    const mergedItemsStyle = mergedRecord.itemsStyle as
      | Record<string, unknown>
      | undefined;
    const mergedAppearance = mergedRecord.appearance as
      | Record<string, unknown>
      | undefined;

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

    const unifiedBgColor =
      sanitizeColor(
        (merged.bgColor as string | undefined) ||
        (merged.backgroundColor as string | undefined) ||
        (mergedAppearance?.backgroundColor as string | undefined) ||
        (merged.values_bg as string | undefined) ||
        (merged.about_values_bg as string | undefined),
      ) || "";

    if (resolvedCardBgColor) {
      merged.cardBgColor = resolvedCardBgColor;
      mergedRecord.cardBackgroundColor = resolvedCardBgColor;
    }

    if (unifiedBgColor) {
      merged.bgColor = unifiedBgColor;
      merged.backgroundColor = unifiedBgColor;
      merged.values_bg = unifiedBgColor;
      merged.about_values_bg = unifiedBgColor;
      merged.bgType = "color";
      merged.bgImage = "";
      if (mergedAppearance) {
        mergedAppearance.backgroundColor = unifiedBgColor;
        mergedAppearance.bgType = "color";
        mergedAppearance.backgroundImageUrl = "";
      }
    }

    return merged;
  }, [lastSavedAboutUsValues, aboutUsValuesSettings, buildPreviewSection]);

  const previewCTASettings = useMemo(() => {
    const merged = buildPreviewSection(
      ctaSettings,
      lastSavedCTA,
    ) as typeof ctaSettings & Record<string, unknown>;
    return merged;
  }, [lastSavedCTA, ctaSettings, buildPreviewSection]);

  const previewBookingServiceSettings = useMemo(() => {
    const merged = buildPreviewSection(
      bookingServiceSettings,
      lastSavedBookingService,
    ) as typeof bookingServiceSettings & Record<string, unknown>;
    return normalizeStepSettings(merged);
  }, [lastSavedBookingService, bookingServiceSettings, buildPreviewSection]);

  const previewBookingDateSettings = useMemo(() => {
    const merged = buildPreviewSection(
      bookingDateSettings,
      lastSavedBookingDate,
    ) as typeof bookingDateSettings & Record<string, unknown>;
    return normalizeStepSettings(merged);
  }, [lastSavedBookingDate, bookingDateSettings, buildPreviewSection]);

  const previewBookingTimeSettings = useMemo(() => {
    const merged = buildPreviewSection(
      bookingTimeSettings,
      lastSavedBookingTime,
    ) as typeof bookingTimeSettings & Record<string, unknown>;
    return normalizeStepSettings(merged);
  }, [lastSavedBookingTime, bookingTimeSettings, buildPreviewSection]);

  const previewBookingFormSettings = useMemo(() => {
    const merged = buildPreviewSection(
      bookingFormSettings,
      lastSavedBookingForm,
    ) as typeof bookingFormSettings & Record<string, unknown>;
    return normalizeStepSettings(merged);
  }, [lastSavedBookingForm, bookingFormSettings, buildPreviewSection]);

  const previewBookingConfirmationSettings = useMemo(() => {
    const merged = buildPreviewSection(
      bookingConfirmationSettings,
      lastSavedBookingConfirmation,
    ) as typeof bookingConfirmationSettings & Record<string, unknown>;
    return normalizeStepSettings(merged);
  }, [
    lastSavedBookingConfirmation,
    bookingConfirmationSettings,
    buildPreviewSection,
  ]);

  const previewFontSettings = useMemo(
    () => sanitizeSectionData(fontSettings, lastSavedFont),
    [lastSavedFont, fontSettings, sanitizeSectionData],
  );
  const previewColorSettings = useMemo(
    () => sanitizeSectionData(colorSettings, lastSavedColor),
    [lastSavedColor, colorSettings, sanitizeSectionData],
  );
  const previewGallerySettings = useMemo(() => {
    const merged = buildPreviewSection(
      gallerySettings,
      lastSavedGallery,
    ) as typeof gallerySettings & Record<string, unknown>;
    const mergedRecord = merged as Record<string, unknown>;
    const resolvedBgColor =
      sanitizeColor(
        (merged.appearance?.backgroundColor as string | undefined) ||
        (merged.bgColor as string | undefined) ||
        (mergedRecord.backgroundColor as string | undefined),
      ) || "";
    merged.bgColor = resolvedBgColor;
    merged.titleColor = sanitizeColor(merged.titleColor) || "";
    merged.subtitleColor = sanitizeColor(merged.subtitleColor) || "";
    merged.buttonColor = sanitizeColor(merged.buttonColor) || "";
    merged.buttonTextColor = sanitizeColor(merged.buttonTextColor) || "";
    merged.cardBgColor =
      sanitizeColor(merged.cardBgColor || merged.appearance?.cardBgColor) || "";

    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
        cardBgColor: merged.cardBgColor,
      };
    }

    return merged;
  }, [lastSavedGallery, gallerySettings, buildPreviewSection]);
  const previewGalleryPageSettings = useMemo(() => {
    const merged = buildPreviewSection(
      galleryPageSettings,
      lastSavedGalleryPage,
    ) as typeof galleryPageSettings & Record<string, unknown>;
    const mergedRecord = merged as Record<string, unknown>;
    const resolvedBgColor =
      sanitizeColor(
        (merged.appearance?.backgroundColor as string | undefined) ||
        (merged.bgColor as string | undefined) ||
        (mergedRecord.backgroundColor as string | undefined),
      ) || "";
    merged.bgColor = resolvedBgColor;
    merged.titleColor = sanitizeColor(merged.titleColor) || "";
    merged.subtitleColor = sanitizeColor(merged.subtitleColor) || "";
    merged.buttonColor = sanitizeColor(merged.buttonColor) || "";
    merged.buttonTextColor = sanitizeColor(merged.buttonTextColor) || "";
    merged.cardBgColor =
      sanitizeColor(merged.cardBgColor || merged.appearance?.cardBgColor) || "";

    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
        cardBgColor: merged.cardBgColor,
      };
    }

    return merged;
  }, [lastSavedGalleryPage, galleryPageSettings, buildPreviewSection]);
  const previewHeaderSettings = useMemo(() => {
    const merged = buildPreviewSection(
      headerSettings,
      lastSavedHeader,
    ) as typeof headerSettings & Record<string, unknown>;
    const appearance =
      (merged.appearance as Record<string, unknown> | undefined) || {};
    const resolvedBgColor =
      sanitizeColor(
        (merged.bgColor as string | undefined) ||
        (appearance.backgroundColor as string | undefined),
      ) || "";
    merged.bgColor = resolvedBgColor;
    if (Object.keys(appearance).length > 0) {
      merged.appearance = {
        ...appearance,
        backgroundColor: resolvedBgColor,
      };
    }
    return merged;
  }, [lastSavedHeader, headerSettings, buildPreviewSection]);
  const previewFooterSettings = useMemo(() => {
    const merged = buildPreviewSection(
      footerSettings,
      lastSavedFooter,
    ) as typeof footerSettings & Record<string, unknown>;
    const appearance =
      (merged.appearance as Record<string, unknown> | undefined) || {};
    const resolvedBgColor =
      sanitizeColor(
        (merged.bgColor as string | undefined) ||
        (appearance.backgroundColor as string | undefined),
      ) || "";
    merged.bgColor = resolvedBgColor;
    if (Object.keys(appearance).length > 0) {
      merged.appearance = {
        ...appearance,
        backgroundColor: resolvedBgColor,
      };
    }
    return merged;
  }, [lastSavedFooter, footerSettings, buildPreviewSection]);

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

  const previewSections = useMemo(
    (): SectionsMap => ({
      [SECTION_IDS.homeHero]: previewHeroSettings as SectionConfig,
      [SECTION_IDS.aboutHero]: previewAboutHeroSettings as SectionConfig,
      [SECTION_IDS.homeStory]: previewStorySettings as SectionConfig,
      [SECTION_IDS.homeTeam]: previewTeamSettings as SectionConfig,
      [SECTION_IDS.homeTestimonials]:
        previewTestimonialsSettings as SectionConfig,
      [SECTION_IDS.homeServices]: previewServicesSettings as SectionConfig,
      [SECTION_IDS.homeValues]: previewHomeValuesSettings as SectionConfig,
      [SECTION_IDS.aboutValues]: previewAboutUsValuesSettings as SectionConfig,
      [SECTION_IDS.homeGallery]: previewGallerySettings as SectionConfig,
      [SECTION_IDS.pageGallery]: previewGalleryPageSettings as SectionConfig,
      [SECTION_IDS.homeCta]: previewCTASettings as SectionConfig,
      [SECTION_IDS.layoutHeader]: previewHeaderSettings as SectionConfig,
      [SECTION_IDS.layoutFooter]: previewFooterSettings as SectionConfig,
      [SECTION_IDS.bookingService]:
        previewBookingServiceSettings as SectionConfig,
      [SECTION_IDS.bookingDate]: previewBookingDateSettings as SectionConfig,
      [SECTION_IDS.bookingTime]: previewBookingTimeSettings as SectionConfig,
      [SECTION_IDS.bookingForm]: previewBookingFormSettings as SectionConfig,
      [SECTION_IDS.bookingConfirmation]:
        previewBookingConfirmationSettings as SectionConfig,
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
      previewBookingServiceSettings,
      previewBookingDateSettings,
      previewBookingTimeSettings,
      previewBookingFormSettings,
      previewBookingConfirmationSettings,
    ],
  );

  const siteCustomization = useMemo(
    () => ({
      home: {
        heroBanner: previewHeroSettings,
        galleryPreview: previewGallerySettings,
        valuesSection: previewHomeValuesSettings,
      },
      gallery: previewGalleryPageSettings,
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
      sections: previewSections,
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
        sections: previewSections,
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
      previewSections,
    ],
  );

  // Função de sanitização para garantir que as configurações sejam objetos válidos
  const sanitizeSettings = useCallback(
    (
      settings: Record<string, unknown> | null | undefined,
      defaultSettings: Record<string, unknown>,
    ) => sanitizeSection(settings, defaultSettings),
    [],
  );

  // Mapa de configurações padrão por tipo de mensagem
  const defaultSettingsMap: Record<string, Record<string, unknown>> = useMemo(
    () => ({
      UPDATE_HERO_SETTINGS: defaultHeroSettings,
      UPDATE_ABOUT_HERO_SETTINGS: defaultAboutHeroSettings,
      UPDATE_STORY_SETTINGS: defaultStorySettings,
      UPDATE_TEAM_SETTINGS: defaultTeamSettings,
      UPDATE_TESTIMONIALS_SETTINGS: defaultTestimonialsSettings,
      UPDATE_SERVICES_SETTINGS: defaultServicesSettings,
      UPDATE_HOME_VALUES_SETTINGS: defaultValuesSettings,
      UPDATE_ABOUT_US_VALUES_SETTINGS: defaultValuesSettings,
      UPDATE_GALLERY_SETTINGS: defaultGallerySettings,
      UPDATE_GALLERY_PAGE_SETTINGS: defaultGallerySettings,
      UPDATE_GALLERY_PREVIEW: defaultGallerySettings,
      UPDATE_GALLERY_PAGE: defaultGallerySettings,
      UPDATE_CTA_SETTINGS: defaultCTASettings,
      UPDATE_HEADER_SETTINGS: defaultHeaderSettings,
      UPDATE_FOOTER_SETTINGS: defaultFooterSettings,
      UPDATE_BOOKING_SERVICE_SETTINGS: defaultBookingServiceSettings,
      UPDATE_BOOKING_DATE_SETTINGS: defaultBookingDateSettings,
      UPDATE_BOOKING_TIME_SETTINGS: defaultBookingTimeSettings,
      UPDATE_BOOKING_FORM_SETTINGS: defaultBookingFormSettings,
      UPDATE_BOOKING_CONFIRMATION_SETTINGS: defaultBookingConfirmationSettings,
      UPDATE_FONT_SETTINGS: defaultFontSettings,
      UPDATE_COLOR_SETTINGS: defaultColorSettings,
    }),
    [],
  );

  const syncToIframe = useCallback(
    (type: string, settings: Record<string, unknown> | null | undefined) => {
      const sanitizedSettings = sanitizeSettings(
        settings,
        defaultSettingsMap[type] || {},
      );
      let payloadSettings: Record<string, unknown> = { ...sanitizedSettings };

      if (
        type === "UPDATE_SERVICES_SETTINGS" ||
        type === "UPDATE_HOME_VALUES_SETTINGS" ||
        type === "UPDATE_ABOUT_US_VALUES_SETTINGS"
      ) {
        const isValuesType =
          type === "UPDATE_HOME_VALUES_SETTINGS" ||
          type === "UPDATE_ABOUT_US_VALUES_SETTINGS";
        const appearance =
          (sanitizedSettings.appearance as
            | Record<string, unknown>
            | undefined) || {};
        const syncColor =
          sanitizeColor(
            (sanitizedSettings.about_values_bg as string | undefined) ||
            (sanitizedSettings.values_bg as string | undefined) ||
            (sanitizedSettings.bgColor as string | undefined) ||
            (sanitizedSettings.backgroundColor as string | undefined) ||
            (appearance.backgroundColor as string | undefined),
          ) || "";
        const syncCardBgColor =
          sanitizeColor(
            (sanitizedSettings.cardBgColor as string | undefined) ||
            (sanitizedSettings.cardBackgroundColor as string | undefined) ||
            (appearance.cardBgColor as string | undefined) ||
            (appearance.cardBackgroundColor as string | undefined),
          ) || "";

        payloadSettings = {
          ...sanitizedSettings,
          ...(syncColor
            ? {
              ...(isValuesType ? { bgType: "color" } : {}),
              bgColor: syncColor,
              backgroundColor: syncColor,
              values_bg: syncColor,
              about_values_bg: syncColor,
            }
            : {}),
          ...(syncCardBgColor
            ? {
              cardBgColor: syncCardBgColor,
              cardBackgroundColor: syncCardBgColor,
            }
            : {}),
          appearance: {
            ...appearance,
            ...(syncColor
              ? {
                backgroundColor: syncColor,
                bgColor: syncColor,
                ...(isValuesType
                  ? { bgType: "color", backgroundImageUrl: "" }
                  : {}),
              }
              : {}),
            ...(syncCardBgColor
              ? {
                cardBgColor: syncCardBgColor,
                cardBackgroundColor: syncCardBgColor,
              }
              : {}),
          },
        };

        if (payloadSettings.bgType === "color") {
          payloadSettings = {
            ...payloadSettings,
            bgImage: "",
            appearance: {
              ...((payloadSettings.appearance as Record<string, unknown>) ||
                {}),
              backgroundImageUrl: "",
            },
          };
        }

        const payloadAppearance =
          (payloadSettings.appearance as Record<string, unknown> | undefined) ||
          {};
        console.log(`>>> [EDITOR_SYNC] Enviando ${type}:`, {
          bgColor: payloadSettings.bgColor,
          appearanceBg: payloadAppearance.backgroundColor,
        });
      }

      iframeRef.current?.contentWindow?.postMessage(
        { type, settings: payloadSettings },
        "*",
      );
    },
    [iframeRef, sanitizeSettings, defaultSettingsMap],
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
    console.log(
      ">>> [EDITOR_SYNC] Syncing Home values settings to iframe:",
      previewHomeValuesSettings,
    );
    syncToIframe("UPDATE_HOME_VALUES_SETTINGS", previewHomeValuesSettings);
  }, [previewHomeValuesSettings, syncToIframe]);

  useEffect(() => {
    console.log(
      ">>> [EDITOR_SYNC] Syncing About Us values settings to iframe:",
      previewAboutUsValuesSettings,
    );
    syncToIframe(
      "UPDATE_ABOUT_US_VALUES_SETTINGS",
      previewAboutUsValuesSettings,
    );
  }, [previewAboutUsValuesSettings, syncToIframe]);

  useEffect(() => {
    console.log(
      ">>> [EDITOR_SYNC] Syncing booking service settings to iframe:",
      previewBookingServiceSettings,
    );
    syncToIframe(
      "UPDATE_BOOKING_SERVICE_SETTINGS",
      previewBookingServiceSettings,
    );
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
    console.log(
      ">>> [EDITOR_SYNC] Syncing gallery settings to iframe:",
      previewGallerySettings,
    );
    syncToIframe("UPDATE_GALLERY_PREVIEW", previewGallerySettings);
  }, [previewGallerySettings, syncToIframe]);
  useEffect(() => {
    console.log(
      ">>> [EDITOR_SYNC] Syncing gallery page settings to iframe:",
      previewGalleryPageSettings,
    );
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
    // Notificar passos de agendamento sobre mudanças de estilo
    if (iframeRef.current?.contentWindow) {
      const step1Styles = {
        bgColor: previewBookingServiceSettings.bgColor,
        bg_color: previewBookingServiceSettings.bgColor,
        backgroundColor: previewBookingServiceSettings.bgColor,
        cardBgColor: previewBookingServiceSettings.cardBgColor,
        card_bg_color: previewBookingServiceSettings.cardBgColor,
        cardBackgroundColor: previewBookingServiceSettings.cardBgColor,
        accentColor: previewBookingServiceSettings.accentColor,
        accent_color: previewBookingServiceSettings.accentColor,
        titleColor: previewBookingServiceSettings.titleColor,
        subtitleColor: previewBookingServiceSettings.subtitleColor,
      };

      console.log(
        "[EDITOR_SYNC] Enviando UPDATE_BOOKING_STYLE para step1Services:",
        step1Styles,
      );

      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_BOOKING_STYLE",
          payload: {
            section: "step1Services",
            styles: step1Styles,
          },
        },
        "*",
      );
    }
  }, [iframeRef, previewBookingServiceSettings]);

  // Função para sanitizar o objeto siteCustomization completo
  const sanitizeSiteCustomization = useCallback(
    (customization: Record<string, unknown>) => {
      const sanitized = { ...customization };
      const resolveSectionBg = (
        sectionState: Record<string, unknown> | null | undefined,
      ) => {
        if (!sectionState) return "";
        const appearance =
          (sectionState.appearance as Record<string, unknown> | undefined) ||
          {};
        return (
          (sectionState.bgColor as string) ||
          (appearance.backgroundColor as string) ||
          ""
        );
      };

      const sectionSpecificMappings: Record<
        string,
        {
          backgroundKey: string;
          state: Record<string, unknown> | null | undefined;
        }
      > = {
        values: { backgroundKey: "values_bg", state: state.homeValuesSettings },
        "about-values": {
          backgroundKey: "about_values_bg",
          state: state.aboutUsValuesSettings,
        },
        hero: { backgroundKey: "hero_bg", state: state.heroSettings },
      };

      Object.entries(sectionSpecificMappings).forEach(
        ([_section, { backgroundKey, state: sectionState }]) => {
          sanitized[backgroundKey] = resolveSectionBg(sectionState);
        },
      );

      // Verifica e sanitiza cada seção
      const sectionsToCheck = [
        "hero",
        "aboutHero",
        "story",
        "team",
        "testimonials",
        "services",
        "homeValuesSettings",
        "aboutUsValuesSettings",
        "galleryPreviewSettings",
        "galleryPageSettings",
        "cta",
        "header",
        "footer",
        "bookingSteps",
        "theme",
        "colors",
      ];

      sectionsToCheck.forEach((section) => {
        if (sanitized[section]) {
          const sectionData = sanitized[section] as Record<string, unknown>;
          const keys = Object.keys(sectionData);

          // Se a seção foi corrompida (transformada em string indexada)
          if (keys.length > 0 && keys.every((key) => /^\d+$/.test(key))) {
            console.error(
              `>>> [EDITOR_SYNC] Seção ${section} corrompida detectada no siteCustomization, usando padrão`,
            );

            // Encontra o padrão correspondente
            const defaultMap: Record<string, Record<string, unknown>> = {
              hero: defaultHeroSettings,
              aboutHero: defaultAboutHeroSettings,
              story: defaultStorySettings,
              team: defaultTeamSettings,
              testimonials: defaultTestimonialsSettings,
              services: defaultServicesSettings,
              homeValuesSettings: defaultValuesSettings,
              aboutUsValuesSettings: defaultValuesSettings,
              galleryPreviewSettings: defaultGallerySettings,
              galleryPageSettings: defaultGallerySettings,
              cta: defaultCTASettings,
              header: defaultHeaderSettings,
              footer: defaultFooterSettings,
              bookingSteps: defaultBookingServiceSettings,
              theme: defaultFontSettings,
              colors: defaultColorSettings,
            };

            sanitized[section] = defaultMap[section] || {};
          }
        }
      });

      return sanitized;
    },
    [state.heroSettings, state.homeValuesSettings, state.aboutUsValuesSettings],
  );

  const sanitizedSiteCustomization = useMemo(
    () => sanitizeSiteCustomization(siteCustomization),
    [siteCustomization, sanitizeSiteCustomization],
  );

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_SITE_DATA", data: sanitizedSiteCustomization },
      "*",
    );
  }, [sanitizedSiteCustomization, iframeRef]);

  useEffect(() => {
    syncToIframe("UPDATE_PAGE_VISIBILITY", pageVisibility);
  }, [pageVisibility, syncToIframe]);

  useEffect(() => {
    syncToIframe("UPDATE_VISIBLE_SECTIONS", visibleSections);
  }, [visibleSections, syncToIframe]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "BOOKING_FLOW_READY" ||
        event.data?.type === "IFRAME_READY"
      ) {
        console.log(
          `>>> [EDITOR] ${event.data.type} recebido, enviando todas as configurações...`,
        );
        if (iframeRef.current?.contentWindow) {
          const win = iframeRef.current.contentWindow;

          // Enviar configurações globais de tema
          win.postMessage(
            { type: "UPDATE_COLORS", settings: previewColorSettings },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_TYPOGRAPHY", settings: previewFontSettings },
            "*",
          );

          // Enviar visibilidade
          win.postMessage(
            { type: "UPDATE_PAGE_VISIBILITY", settings: pageVisibility },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_VISIBLE_SECTIONS", settings: visibleSections },
            "*",
          );

          // Enviar configurações de cada seção
          win.postMessage(
            { type: "UPDATE_HERO_SETTINGS", settings: previewHeroSettings },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_ABOUT_HERO_SETTINGS",
              settings: previewAboutHeroSettings,
            },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_STORY_SETTINGS", settings: previewStorySettings },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_TEAM_SETTINGS", settings: previewTeamSettings },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_TESTIMONIALS_SETTINGS",
              settings: previewTestimonialsSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_SERVICES_SETTINGS",
              settings: previewServicesSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_HOME_VALUES_SETTINGS",
              settings: previewHomeValuesSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_ABOUT_US_VALUES_SETTINGS",
              settings: previewAboutUsValuesSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_GALLERY_PREVIEW",
              settings: previewGallerySettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_GALLERY_PAGE",
              settings: previewGalleryPageSettings,
            },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_CTA_SETTINGS", settings: previewCTASettings },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_HEADER_SETTINGS", settings: previewHeaderSettings },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_FOOTER_SETTINGS", settings: previewFooterSettings },
            "*",
          );

          // Enviar configurações de agendamento
          win.postMessage(
            {
              type: "UPDATE_BOOKING_SERVICE_SETTINGS",
              settings: previewBookingServiceSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_BOOKING_STYLE",
              payload: {
                section: "step1Services",
                styles: previewBookingServiceSettings,
              },
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_BOOKING_DATE_SETTINGS",
              settings: previewBookingDateSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_BOOKING_TIME_SETTINGS",
              settings: previewBookingTimeSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_BOOKING_FORM_SETTINGS",
              settings: previewBookingFormSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_BOOKING_CONFIRMATION_SETTINGS",
              settings: previewBookingConfirmationSettings,
            },
            "*",
          );

          // Dados do site completo (fallback)
          win.postMessage(
            { type: "UPDATE_SITE_DATA", data: sanitizedSiteCustomization },
            "*",
          );
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
    sanitizedSiteCustomization,
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
