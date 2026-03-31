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
    const merged = sanitizeSectionData(
      heroSettings,
      lastSavedHero,
    ) as typeof heroSettings & Record<string, unknown>;

    // Log para conferir se, após o F5, o valor lastSavedHero contém a cor correta
    console.log("[useEditorSync] Post-F5 lastSavedHero:", {
      bgColor: lastSavedHero?.bgColor,
      appearanceBg: lastSavedHero?.appearance?.backgroundColor,
      mergedBg: merged.bgColor || merged.appearance?.backgroundColor,
    });

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (heroSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }

    // Sanitização de Cores e Sincronização de Appearance
    const resolvedBgColor =
      sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.bgColor = resolvedBgColor;
    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
      };
    }

    return merged;
  }, [lastSavedHero, heroSettings, sanitizeSectionData]);

  const previewAboutHeroSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      aboutHeroSettings,
      lastSavedAboutHero,
    ) as typeof aboutHeroSettings & Record<string, unknown>;

    // Log para conferir se, após o F5, o valor lastSavedAboutHero contém a cor correta
    console.log("[useEditorSync] Post-F5 lastSavedAboutHero:", {
      bgColor: lastSavedAboutHero?.bgColor,
      appearanceBg: lastSavedAboutHero?.appearance?.backgroundColor,
      mergedBg: merged.bgColor || merged.appearance?.backgroundColor,
    });

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (aboutHeroSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }

    // Sanitização de Cores e Sincronização de Appearance
    const resolvedBgColor =
      sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.bgColor = resolvedBgColor;
    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
      };
    }

    return merged;
  }, [lastSavedAboutHero, aboutHeroSettings, sanitizeSectionData]);

  const previewStorySettings = useMemo(() => {
    const merged = sanitizeSectionData(
      storySettings,
      lastSavedStory,
    ) as typeof storySettings & Record<string, unknown>;

    // Log para conferir se, após o F5, o valor lastSavedStory contém a cor correta
    console.log("[useEditorSync] Post-F5 lastSavedStory:", {
      bgColor: lastSavedStory?.bgColor,
      appearanceBg: lastSavedStory?.appearance?.backgroundColor,
      mergedBg: merged.bgColor || merged.appearance?.backgroundColor,
    });

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (storySettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }

    // Sanitização de Cores e Sincronização de Appearance
    const resolvedBgColor =
      sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.bgColor = resolvedBgColor;
    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
      };
    }

    return merged;
  }, [lastSavedStory, storySettings, sanitizeSectionData]);

  const previewTeamSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      teamSettings,
      lastSavedTeam,
    ) as typeof teamSettings & Record<string, unknown>;

    // Log para conferir se, após o F5, o valor lastSavedTeam contém a cor correta
    console.log("[useEditorSync] Post-F5 lastSavedTeam:", {
      bgColor: lastSavedTeam?.bgColor,
      appearanceBg: lastSavedTeam?.appearance?.backgroundColor,
      mergedBg: merged.bgColor || merged.appearance?.backgroundColor,
    });

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (teamSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }

    // Sanitização de Cores e Sincronização de Appearance
    const resolvedBgColor =
      sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.bgColor = resolvedBgColor;
    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
      };
    }

    return merged;
  }, [lastSavedTeam, teamSettings, sanitizeSectionData]);

  const previewTestimonialsSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      testimonialsSettings,
      lastSavedTestimonials,
    ) as typeof testimonialsSettings & Record<string, unknown>;

    // Log para conferir se, após o F5, o valor lastSavedTestimonials contém a cor correta
    console.log("[useEditorSync] Post-F5 lastSavedTestimonials:", {
      bgColor: lastSavedTestimonials?.bgColor,
      appearanceBg: lastSavedTestimonials?.appearance?.backgroundColor,
      mergedBg: merged.bgColor || merged.appearance?.backgroundColor,
    });

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (testimonialsSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }

    // Sanitização de Cores e Sincronização de Appearance
    const resolvedBgColor =
      sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.bgColor = resolvedBgColor;
    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
      };
    }

    return merged;
  }, [lastSavedTestimonials, testimonialsSettings, sanitizeSectionData]);

  const previewServicesSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      servicesSettings,
      lastSavedServices,
    ) as typeof servicesSettings & Record<string, unknown>;

    // Log para conferir se, após o F5, o valor lastSavedServices contém a cor correta
    console.log("[useEditorSync] Post-F5 lastSavedServices:", {
      bgColor: lastSavedServices?.bgColor,
      appearanceBg: lastSavedServices?.appearance?.backgroundColor,
      mergedBg: merged.bgColor || merged.appearance?.backgroundColor,
    });

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (servicesSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }

    // Sanitização de Cores e Sincronização de Appearance
    const resolvedBgColor =
      sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.bgColor = resolvedBgColor;
    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
      };
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

    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: merged.bgColor,
        cardBgColor: merged.cardBgColor,
      };
    }

    return merged;
  }, [lastSavedServices, servicesSettings, sanitizeSectionData]);

  const previewHomeValuesSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      homeValuesSettings,
      lastSavedHomeValues,
    ) as
      | (typeof homeValuesSettings & Record<string, unknown>)
      | (typeof lastSavedHomeValues & Record<string, unknown>);
    if (homeValuesSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
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
    if (!merged.cardBgColor && resolvedCardBgColor) {
      merged.cardBgColor = resolvedCardBgColor;
    }
    if (!mergedRecord.cardBackgroundColor && resolvedCardBgColor) {
      mergedRecord.cardBackgroundColor = resolvedCardBgColor;
    }
    const resolvedValuesBg =
      sanitizeColor(
        (merged.bgColor as string | undefined) ||
          (mergedAppearance?.backgroundColor as string | undefined),
      ) || "";
    merged.bgColor = resolvedValuesBg;
    mergedRecord.backgroundColor = resolvedValuesBg;
    mergedRecord.values_bg = resolvedValuesBg;
    if (merged.appearance) {
      merged.appearance = {
        ...(merged.appearance as Record<string, unknown>),
        backgroundColor: resolvedValuesBg,
      };
    }
    return merged;
  }, [lastSavedHomeValues, homeValuesSettings, sanitizeSectionData]);

  const previewAboutUsValuesSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      aboutUsValuesSettings,
      lastSavedAboutUsValues,
    ) as
      | (typeof aboutUsValuesSettings & Record<string, unknown>)
      | (typeof lastSavedAboutUsValues & Record<string, unknown>);
    if (aboutUsValuesSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    const mergedRecord = merged as Record<string, unknown>;
    const lastSavedRecord = lastSavedAboutUsValues as
      | Record<string, unknown>
      | undefined;
    const resolvedItems = Array.isArray(merged.items)
      ? merged.items
      : Array.isArray(mergedRecord.values)
        ? mergedRecord.values
        : Array.isArray(lastSavedRecord?.items)
          ? (lastSavedRecord?.items as unknown[])
          : Array.isArray(defaultValuesSettings.items)
            ? defaultValuesSettings.items
            : [];
    if (!Array.isArray(merged.items) && resolvedItems.length > 0) {
      merged.items = resolvedItems as typeof merged.items;
    }
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

    // Forçar a atualização das chaves de preview se houver uma cor resolvida
    if (resolvedCardBgColor) {
      merged.cardBgColor = resolvedCardBgColor;
      mergedRecord.cardBackgroundColor = resolvedCardBgColor;
    }

    const resolvedValuesBg =
      sanitizeColor(
        (merged.bgColor as string | undefined) ||
          (mergedAppearance?.backgroundColor as string | undefined),
      ) || "";

    if (resolvedValuesBg) {
      merged.bgColor = resolvedValuesBg;
      mergedRecord.backgroundColor = resolvedValuesBg;
      mergedRecord.about_values_bg = resolvedValuesBg;
      if (merged.appearance) {
        merged.appearance = {
          ...(merged.appearance as Record<string, unknown>),
          backgroundColor: resolvedValuesBg,
        };
      }
    }
    return merged;
  }, [lastSavedAboutUsValues, aboutUsValuesSettings, sanitizeSectionData]);

  const previewCTASettings = useMemo(() => {
    const merged = sanitizeSectionData(
      ctaSettings,
      lastSavedCTA,
    ) as typeof ctaSettings & Record<string, unknown>;

    // Log para conferir se, após o F5, o valor lastSavedCTA contém a cor correta
    console.log("[useEditorSync] Post-F5 lastSavedCTA:", {
      bgColor: lastSavedCTA?.bgColor,
      appearanceBg: lastSavedCTA?.appearance?.backgroundColor,
      mergedBg: merged.bgColor || merged.appearance?.backgroundColor,
    });

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (ctaSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }

    // Sanitização de Cores e Sincronização de Appearance
    const resolvedBgColor =
      sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.bgColor = resolvedBgColor;
    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
      };
    }

    return merged;
  }, [lastSavedCTA, ctaSettings, sanitizeSectionData]);

  const previewBookingServiceSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      bookingServiceSettings,
      lastSavedBookingService,
    ) as typeof bookingServiceSettings & Record<string, unknown>;

    // Sanitização de Cores e Sincronização de Appearance
    const resolvedBgColor =
      sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.bgColor = resolvedBgColor;
    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
      };
    }

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingServiceSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return normalizeStepSettings(merged);
  }, [lastSavedBookingService, bookingServiceSettings, sanitizeSectionData]);

  const previewBookingDateSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      bookingDateSettings,
      lastSavedBookingDate,
    ) as typeof bookingDateSettings & Record<string, unknown>;

    // Sanitização de Cores e Sincronização de Appearance
    const resolvedBgColor =
      sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.bgColor = resolvedBgColor;
    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
      };
    }

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingDateSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return normalizeStepSettings(merged);
  }, [lastSavedBookingDate, bookingDateSettings, sanitizeSectionData]);

  const previewBookingTimeSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      bookingTimeSettings,
      lastSavedBookingTime,
    ) as typeof bookingTimeSettings & Record<string, unknown>;

    // Sanitização de Cores e Sincronização de Appearance
    const resolvedBgColor =
      sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.bgColor = resolvedBgColor;
    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
      };
    }

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingTimeSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return normalizeStepSettings(merged);
  }, [lastSavedBookingTime, bookingTimeSettings, sanitizeSectionData]);

  const previewBookingFormSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      bookingFormSettings,
      lastSavedBookingForm,
    ) as typeof bookingFormSettings & Record<string, unknown>;

    // Sanitização de Cores e Sincronização de Appearance
    const resolvedBgColor =
      sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.bgColor = resolvedBgColor;
    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
      };
    }

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingFormSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return normalizeStepSettings(merged);
  }, [lastSavedBookingForm, bookingFormSettings, sanitizeSectionData]);

  const previewBookingConfirmationSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      bookingConfirmationSettings,
      lastSavedBookingConfirmation,
    ) as typeof bookingConfirmationSettings & Record<string, unknown>;

    // Sanitização de Cores e Sincronização de Appearance
    const resolvedBgColor =
      sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.bgColor = resolvedBgColor;
    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: resolvedBgColor,
      };
    }

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingConfirmationSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return normalizeStepSettings(merged);
  }, [
    lastSavedBookingConfirmation,
    bookingConfirmationSettings,
    sanitizeSectionData,
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
    const merged = sanitizeSectionData(
      gallerySettings,
      lastSavedGallery,
    ) as typeof gallerySettings & Record<string, unknown>;

    // Log para conferir se, após o F5, o valor lastSavedGallery contém a cor correta
    console.log("[useEditorSync] Post-F5 lastSavedGallery:", {
      bgColor: lastSavedGallery?.bgColor,
      appearanceBg: lastSavedGallery?.appearance?.backgroundColor,
      mergedBg: merged.bgColor || merged.appearance?.backgroundColor,
    });

    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (gallerySettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }

    // Sanitização de Cores
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
  }, [lastSavedGallery, gallerySettings, sanitizeSectionData]);
  const previewGalleryPageSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      galleryPageSettings,
      lastSavedGalleryPage,
    ) as typeof galleryPageSettings & Record<string, unknown>;

    // Log para conferir se, após o F5, o valor lastSavedGalleryPage contém a cor correta
    console.log("[useEditorSync] Post-F5 lastSavedGalleryPage:", {
      bgColor: lastSavedGalleryPage?.bgColor,
      appearanceBg: lastSavedGalleryPage?.appearance?.backgroundColor,
      mergedBg: merged.bgColor || merged.appearance?.backgroundColor,
    });

    if (galleryPageSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
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
  }, [lastSavedGalleryPage, galleryPageSettings, sanitizeSectionData]);
  const previewHeaderSettings = useMemo(() => {
    const merged = sanitizeSectionData(
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
  }, [lastSavedHeader, headerSettings, sanitizeSectionData]);
  const previewFooterSettings = useMemo(() => {
    const merged = sanitizeSectionData(
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
  }, [lastSavedFooter, footerSettings, sanitizeSectionData]);

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
      iframeRef.current?.contentWindow?.postMessage(
        { type, settings: sanitizedSettings },
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
