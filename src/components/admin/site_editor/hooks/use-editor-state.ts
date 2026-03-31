import { useCallback, useEffect, useState } from "react";
import { useStudio } from "@/context/studio-context";
import {
  type BookingStepSettings,
  type ColorSettings,
  type CTASettings,
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
  type FontSettings,
  type FooterSettings,
  type GallerySettings,
  getAboutHeroSettings,
  getAboutUsValuesSettings,
  getBookingConfirmationSettings,
  getBookingDateSettings,
  getBookingFormSettings,
  getBookingServiceSettings,
  getBookingTimeSettings,
  getColorSettings,
  getCTASettings,
  getFontSettings,
  getFooterSettings,
  getGalleryPageSettings,
  getGallerySettings,
  getHeaderSettings,
  getHeroSettings,
  getHomeValuesSettings,
  getServicesSettings,
  getStorySettings,
  getTeamSettings,
  getTestimonialsSettings,
  type HeaderSettings,
  type HeroSettings,
  normalizePayload,
  normalizeStepSettings,
  SECTION_IDS,
  type SectionConfig,
  type SectionsMap,
  type ServicesSettings,
  type StorySettings,
  sanitizeColor,
  type TeamSettings,
  type TestimonialsSettings,
  type ValuesSettings,
} from "@/lib/booking-data";
import type { SiteConfigData } from "@/lib/site-config-types";
import type { BackgroundSettings } from "../components/BackgroundEditor";

const resolveBgType = (
  explicit: unknown,
  imageValue?: string,
): "color" | "image" =>
  explicit === "image" || explicit === "color"
    ? explicit
    : imageValue
      ? "image"
      : "color";

export function useEditorState() {
  const { studio } = useStudio();
  const createDefaultSections = useCallback(
    (): SectionsMap => ({
      [SECTION_IDS.homeHero]: defaultHeroSettings as SectionConfig,
      [SECTION_IDS.aboutHero]: defaultAboutHeroSettings as SectionConfig,
      [SECTION_IDS.homeStory]: defaultStorySettings as SectionConfig,
      [SECTION_IDS.homeTeam]: defaultTeamSettings as SectionConfig,
      [SECTION_IDS.homeTestimonials]:
        defaultTestimonialsSettings as SectionConfig,
      [SECTION_IDS.homeServices]: defaultServicesSettings as SectionConfig,
      [SECTION_IDS.homeValues]: defaultValuesSettings as SectionConfig,
      [SECTION_IDS.aboutValues]: defaultValuesSettings as SectionConfig,
      [SECTION_IDS.homeGallery]: defaultGallerySettings as SectionConfig,
      [SECTION_IDS.pageGallery]: defaultGallerySettings as SectionConfig,
      [SECTION_IDS.homeCta]: defaultCTASettings as SectionConfig,
      [SECTION_IDS.layoutHeader]: defaultHeaderSettings as SectionConfig,
      [SECTION_IDS.layoutFooter]: defaultFooterSettings as SectionConfig,
      [SECTION_IDS.bookingService]:
        defaultBookingServiceSettings as SectionConfig,
      [SECTION_IDS.bookingDate]: defaultBookingDateSettings as SectionConfig,
      [SECTION_IDS.bookingTime]: defaultBookingTimeSettings as SectionConfig,
      [SECTION_IDS.bookingForm]: defaultBookingFormSettings as SectionConfig,
      [SECTION_IDS.bookingConfirmation]:
        defaultBookingConfirmationSettings as SectionConfig,
    }),
    [],
  );
  // Helper para sincronizar bgImage com appearance.backgroundImageUrl
  const syncBackground = useCallback(
    <T extends object>(prev: T, updates: Partial<T>): T => {
      // Validação: aborta se updates não for um objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [SYNC_BACKGROUND] Updates inválido recebido:', updates);
        return prev;
      }

      const state = { ...prev, ...updates } as Record<string, unknown>;
      const upds = updates as Record<string, unknown>;
      const prvs = prev as Record<string, unknown>;
      const appearanceUpdate = upds.appearance as
        | Record<string, unknown>
        | undefined;
      const appearancePrev = prvs.appearance as
        | Record<string, unknown>
        | undefined;

      const nextAppearance = {
        ...(appearancePrev || {}),
        ...(appearanceUpdate || {}),
      } as Record<string, unknown>;

      // Helper para sincronizar cores com fallback seguro (Blindagem)
      const syncColor = (
        fieldName: string,
        updateVal: unknown,
        prevVal: unknown,
        appearanceKey?: string,
      ) => {
        // Tenta pegar o valor do update (topo ou appearance)
        const valFromUpdate =
          updateVal !== undefined
            ? updateVal
            : appearanceKey
              ? appearanceUpdate?.[appearanceKey]
              : undefined;

        if (valFromUpdate !== undefined) {
          const sanitized = sanitizeColor(valFromUpdate);
          // Se o valor de atualização for inválido e não for string vazia, mantemos o valor anterior
          const final =
            sanitized !== undefined
              ? sanitized
              : valFromUpdate === ""
                ? ""
                : (prevVal as string);
          state[fieldName] = final;
          if (appearanceKey) nextAppearance[appearanceKey] = final;
        } else if (prevVal !== undefined) {
          const sanitized = sanitizeColor(prevVal);
          const final =
            sanitized !== undefined
              ? sanitized
              : prevVal === ""
                ? ""
                : (prevVal as string);
          state[fieldName] = final;
          if (appearanceKey) nextAppearance[appearanceKey] = final;
        }
      };

      // Tipografia e Cores de Texto
      syncColor("titleColor", upds.titleColor, prvs.titleColor, "titleColor");
      syncColor(
        "subtitleColor",
        upds.subtitleColor,
        prvs.subtitleColor,
        "subtitleColor",
      );

      if (upds.titleFont !== undefined) {
        nextAppearance.titleFont = upds.titleFont;
      } else if (prvs.titleFont !== undefined) {
        nextAppearance.titleFont = prvs.titleFont;
      }

      if (upds.subtitleFont !== undefined) {
        nextAppearance.subtitleFont = upds.subtitleFont;
      } else if (prvs.subtitleFont !== undefined) {
        nextAppearance.subtitleFont = prvs.subtitleFont;
      }

      // Card Styles Sync
      syncColor(
        "cardBgColor",
        upds.cardBgColor,
        prvs.cardBgColor,
        "cardBgColor",
      );
      syncColor(
        "cardTitleColor",
        upds.cardTitleColor,
        prvs.cardTitleColor,
        "cardTitleColor",
      );
      syncColor(
        "cardDescriptionColor",
        upds.cardDescriptionColor,
        prvs.cardDescriptionColor,
        "cardDescriptionColor",
      );
      syncColor(
        "cardIconColor",
        upds.cardIconColor,
        prvs.cardIconColor,
        "cardIconColor",
      );

      syncColor(
        "cardPriceColor",
        upds.cardPriceColor,
        prvs.cardPriceColor,
        "cardPriceColor",
      );

      syncColor("badgeColor", upds.badgeColor, prvs.badgeColor, "badgeColor");
      syncColor(
        "badgeTextColor",
        upds.badgeTextColor,
        prvs.badgeTextColor,
        "badgeTextColor",
      );
      syncColor(
        "primaryButtonColor",
        upds.primaryButtonColor,
        prvs.primaryButtonColor,
        "primaryButtonColor",
      );
      syncColor(
        "secondaryButtonColor",
        upds.secondaryButtonColor,
        prvs.secondaryButtonColor,
        "secondaryButtonColor",
      );
      syncColor(
        "primaryButtonTextColor",
        upds.primaryButtonTextColor,
        prvs.primaryButtonTextColor,
        "primaryButtonTextColor",
      );
      syncColor(
        "secondaryButtonTextColor",
        upds.secondaryButtonTextColor,
        prvs.secondaryButtonTextColor,
        "secondaryButtonTextColor",
      );

      syncColor(
        "buttonColor",
        upds.buttonColor,
        prvs.buttonColor,
        "buttonColor",
      );

      syncColor(
        "buttonTextColor",
        upds.buttonTextColor,
        prvs.buttonTextColor,
        "buttonTextColor",
      );

      // Card Borders Sync
      if (upds.cardBorderRadius !== undefined) {
        nextAppearance.cardBorderRadius = upds.cardBorderRadius;
        state.cardBorderRadius = upds.cardBorderRadius;
      } else if (prvs.cardBorderRadius !== undefined) {
        state.cardBorderRadius = prvs.cardBorderRadius;
      }

      if (upds.cardBorderWidth !== undefined) {
        nextAppearance.cardBorderWidth = upds.cardBorderWidth;
        state.cardBorderWidth = upds.cardBorderWidth;
      } else if (prvs.cardBorderWidth !== undefined) {
        state.cardBorderWidth = prvs.cardBorderWidth;
      }

      syncColor(
        "cardBorderColor",
        upds.cardBorderColor,
        prvs.cardBorderColor,
        "cardBorderColor",
      );

      if (upds.cardTitleFont !== undefined) {
        nextAppearance.cardTitleFont = upds.cardTitleFont;
      } else if (prvs.cardTitleFont !== undefined) {
        nextAppearance.cardTitleFont = prvs.cardTitleFont;
      }

      if (upds.cardDescriptionFont !== undefined) {
        nextAppearance.cardDescriptionFont = upds.cardDescriptionFont;
      } else if (prvs.cardDescriptionFont !== undefined) {
        nextAppearance.cardDescriptionFont = prvs.cardDescriptionFont;
      }

      syncColor(
        "accentColor",
        upds.accentColor,
        prvs.accentColor,
        "accentColor",
      );

      // Background Color Sync (bgColor -> appearance.backgroundColor)
      syncColor("bgColor", upds.bgColor, prvs.bgColor, "backgroundColor");

      // Card Background Color Sync (cardBgColor -> appearance.cardBgColor)
      syncColor(
        "cardBgColor",
        upds.cardBgColor,
        prvs.cardBgColor,
        "cardBgColor",
      );

      // Background Image Sync (bgImage -> appearance.backgroundImageUrl)
      if (upds.bgImage !== undefined) {
        nextAppearance.backgroundImageUrl = upds.bgImage;
        state.bgImage = upds.bgImage;
      } else if (appearanceUpdate?.backgroundImageUrl !== undefined) {
        state.bgImage = appearanceUpdate.backgroundImageUrl;
        nextAppearance.backgroundImageUrl = appearanceUpdate.backgroundImageUrl;
      } else if (prvs.bgImage !== undefined) {
        state.bgImage = prvs.bgImage;
        nextAppearance.backgroundImageUrl = prvs.bgImage;
      }

      // Sync bgType
      if (upds.bgType !== undefined) {
        nextAppearance.bgType = upds.bgType;
        state.bgType = upds.bgType;
      } else if (appearanceUpdate?.bgType !== undefined) {
        state.bgType = appearanceUpdate.bgType;
        nextAppearance.bgType = appearanceUpdate.bgType;
      } else if (prvs.bgType !== undefined) {
        state.bgType = prvs.bgType;
        nextAppearance.bgType = prvs.bgType;
      } else {
        // Fallback robusto usando resolveBgType
        const currentImg = (state.bgImage || nextAppearance.backgroundImageUrl) as string | undefined;
        const resolvedType = resolveBgType(undefined, currentImg);
        state.bgType = resolvedType;
        nextAppearance.bgType = resolvedType;
      }

      // Overlay Sync
      if (upds.overlayOpacity !== undefined) {
        nextAppearance.overlay = {
          ...(nextAppearance.overlay || { color: "" }),
          opacity: upds.overlayOpacity,
        };
        state.overlayOpacity = upds.overlayOpacity;
      } else if (prvs.overlayOpacity !== undefined) {
        state.overlayOpacity = prvs.overlayOpacity;
        nextAppearance.overlay = {
          ...(nextAppearance.overlay || { color: "" }),
          opacity: prvs.overlayOpacity,
        };
      }

      const overlayUpdate = appearanceUpdate?.overlay as
        | Record<string, unknown>
        | undefined;
      if (overlayUpdate?.color !== undefined) {
        nextAppearance.overlay = {
          ...(nextAppearance.overlay || { opacity: state.overlayOpacity ?? 0 }),
          color: overlayUpdate.color,
        };
      } else if ((prvs.appearance as any)?.overlay?.color !== undefined) {
        nextAppearance.overlay = {
          ...(nextAppearance.overlay || { opacity: state.overlayOpacity ?? 0 }),
          color: (prvs.appearance as any).overlay.color,
        };
      }

      // Image Controls Sync
      if (upds.imageOpacity !== undefined) {
        nextAppearance.imageOpacity = upds.imageOpacity;
        state.imageOpacity = upds.imageOpacity;
      } else if (prvs.imageOpacity !== undefined) {
        state.imageOpacity = prvs.imageOpacity;
      }

      if (upds.imageScale !== undefined) {
        nextAppearance.imageScale = upds.imageScale;
        state.imageScale = upds.imageScale;
      } else if (prvs.imageScale !== undefined) {
        state.imageScale = prvs.imageScale;
      }

      if (upds.imageX !== undefined) {
        nextAppearance.imageX = upds.imageX;
        state.imageX = upds.imageX;
      } else if (prvs.imageX !== undefined) {
        state.imageX = prvs.imageX;
      }

      if (upds.imageY !== undefined) {
        nextAppearance.imageY = upds.imageY;
        state.imageY = upds.imageY;
      } else if (prvs.imageY !== undefined) {
        state.imageY = prvs.imageY;
      }

      // Sincroniza o appearance final com as mudanças processadas
      state.appearance = nextAppearance;

      return state as T;
    },
    [],
  );

  // Helpers para normalização de dados do banco (Dual-Case Blindagem)
  const normalizeHeroFromConfig = useCallback((hero: unknown): HeroSettings => {
    if (!hero || typeof hero !== "object") return defaultHeroSettings;
    const heroData = hero as Record<string, unknown>;
    const appearance = (heroData.appearance as Record<string, unknown>) || {};
    const heroImage =
      (heroData.bgImage as string) ||
      (appearance.backgroundImageUrl as string) ||
      "";
    const heroBgType = resolveBgType(
      heroData.bgType ?? appearance.bgType,
      heroImage,
    );
    return {
      ...defaultHeroSettings,
      ...(hero as Partial<HeroSettings>),
      titleColor:
        sanitizeColor(heroData.titleColor ?? appearance.titleColor) ||
        defaultHeroSettings.titleColor,
      subtitleColor:
        sanitizeColor(heroData.subtitleColor ?? appearance.subtitleColor) ||
        defaultHeroSettings.subtitleColor,
      bgColor:
        sanitizeColor(heroData.bgColor ?? appearance.backgroundColor) ||
        defaultHeroSettings.bgColor,
      bgImage: heroImage,
      bgType: heroBgType,
      appearance: {
        ...defaultHeroSettings.appearance,
        ...appearance,
        titleColor: sanitizeColor(heroData.titleColor ?? appearance.titleColor),
        subtitleColor: sanitizeColor(
          heroData.subtitleColor ?? appearance.subtitleColor,
        ),
        backgroundColor: sanitizeColor(
          heroData.bgColor ?? appearance.backgroundColor,
        ),
        backgroundImageUrl: heroImage,
        bgType: heroBgType,
      },
    };
  }, []);

  const normalizeValuesFromConfig = useCallback(
    (values: unknown): ValuesSettings => {
      if (!values || typeof values !== "object") return defaultValuesSettings;
      const valuesData = values as Record<string, unknown>;
      const appearance =
        (valuesData.appearance as Record<string, unknown>) || {};
      const content = (valuesData.content as Record<string, unknown>) || {};
      const itemsStyle =
        (valuesData.itemsStyle as Record<string, unknown>) || {};
      const cardConfig =
        (valuesData.cardConfig as Record<string, unknown>) || {};
      const valuesImage =
        (valuesData.bgImage as string) ||
        (appearance.backgroundImageUrl as string) ||
        "";
      const valuesBgType = resolveBgType(
        valuesData.bgType ?? appearance.bgType,
        valuesImage,
      );

      const cardBg = sanitizeColor(
        valuesData.cardBgColor ||
        valuesData.cardBackgroundColor ||
        valuesData.card_background_color ||
        cardConfig.backgroundColor ||
        cardConfig.cardBackgroundColor ||
        content.cardBgColor ||
        itemsStyle.itemBackgroundColor ||
        appearance.cardBgColor,
      );

      return {
        ...defaultValuesSettings,
        ...(values as Partial<ValuesSettings>),
        titleColor:
          sanitizeColor(valuesData.titleColor || appearance.titleColor) ||
          defaultValuesSettings.titleColor,
        subtitleColor:
          sanitizeColor(valuesData.subtitleColor || appearance.subtitleColor) ||
          defaultValuesSettings.subtitleColor,
        cardBgColor: cardBg || defaultValuesSettings.cardBgColor,
        cardTitleColor:
          sanitizeColor(
            valuesData.cardTitleColor ||
            appearance.cardTitleColor ||
            content.cardTitleColor,
          ) || defaultValuesSettings.cardTitleColor,
        cardDescriptionColor:
          sanitizeColor(
            valuesData.cardDescriptionColor ||
            appearance.cardDescriptionColor ||
            content.cardDescriptionColor,
          ) || defaultValuesSettings.cardDescriptionColor,
        cardIconColor:
          sanitizeColor(
            valuesData.cardIconColor ||
            appearance.cardIconColor ||
            content.cardIconColor,
          ) || defaultValuesSettings.cardIconColor,
        bgColor:
          sanitizeColor(valuesData.bgColor || appearance.backgroundColor) ||
          defaultValuesSettings.bgColor,
        bgImage: valuesImage,
        bgType: valuesBgType,
        appearance: {
          ...defaultValuesSettings.appearance,
          ...appearance,
          titleColor: sanitizeColor(
            valuesData.titleColor || appearance.titleColor,
          ),
          subtitleColor: sanitizeColor(
            valuesData.subtitleColor || appearance.subtitleColor,
          ),
          cardBgColor: cardBg,
          cardTitleColor: sanitizeColor(
            valuesData.cardTitleColor ||
            appearance.cardTitleColor ||
            content.cardTitleColor,
          ),
          cardDescriptionColor: sanitizeColor(
            valuesData.cardDescriptionColor ||
            appearance.cardDescriptionColor ||
            content.cardDescriptionColor,
          ),
          cardIconColor: sanitizeColor(
            valuesData.cardIconColor ||
            appearance.cardIconColor ||
            content.cardIconColor,
          ),
          backgroundColor: sanitizeColor(
            valuesData.bgColor || appearance.backgroundColor,
          ),
          backgroundImageUrl: valuesImage,
          bgType: valuesBgType,
        },
      };
    },
    [],
  );

  const normalizeServicesFromConfig = useCallback(
    (services: unknown): ServicesSettings => {
      if (!services || typeof services !== "object")
        return defaultServicesSettings;
      const servicesData = services as Record<string, unknown>;
      const appearance =
        (servicesData.appearance as Record<string, unknown>) || {};
      const content = (servicesData.content as Record<string, unknown>) || {};
      const itemsStyle =
        (servicesData.itemsStyle as Record<string, unknown>) || {};
      const cardConfig =
        (servicesData.cardConfig as Record<string, unknown>) || {};
      const servicesImage =
        (servicesData.bgImage as string) ||
        (appearance.backgroundImageUrl as string) ||
        "";
      const servicesBgType = resolveBgType(
        servicesData.bgType ?? appearance.bgType,
        servicesImage,
      );

      const cardBg = sanitizeColor(
        servicesData.cardBgColor ||
        servicesData.cardBackgroundColor ||
        servicesData.card_background_color ||
        cardConfig.backgroundColor ||
        cardConfig.cardBackgroundColor ||
        content.cardBgColor ||
        itemsStyle.itemBackgroundColor ||
        appearance.cardBgColor,
      );

      return {
        ...defaultServicesSettings,
        ...(services as Partial<ServicesSettings>),
        titleColor:
          sanitizeColor(servicesData.titleColor || appearance.titleColor) ||
          defaultServicesSettings.titleColor,
        subtitleColor:
          sanitizeColor(
            servicesData.subtitleColor || appearance.subtitleColor,
          ) || defaultServicesSettings.subtitleColor,
        cardBgColor: cardBg || defaultServicesSettings.cardBgColor,
        cardTitleColor:
          sanitizeColor(
            servicesData.cardTitleColor ||
            appearance.cardTitleColor ||
            content.cardTitleColor,
          ) || defaultServicesSettings.cardTitleColor,
        cardDescriptionColor:
          sanitizeColor(
            servicesData.cardDescriptionColor ||
            appearance.cardDescriptionColor ||
            content.cardDescriptionColor,
          ) || defaultServicesSettings.cardDescriptionColor,
        cardPriceColor:
          sanitizeColor(
            servicesData.cardPriceColor ||
            appearance.cardPriceColor ||
            content.cardPriceColor,
          ) || defaultServicesSettings.cardPriceColor,
        cardIconColor:
          sanitizeColor(
            servicesData.cardIconColor ||
            appearance.cardIconColor ||
            content.cardIconColor,
          ) || defaultServicesSettings.cardIconColor,
        bgColor:
          sanitizeColor(servicesData.bgColor || appearance.backgroundColor) ||
          defaultServicesSettings.bgColor,
        bgImage: servicesImage,
        bgType: servicesBgType,
        appearance: {
          ...defaultServicesSettings.appearance,
          ...appearance,
          titleColor: sanitizeColor(
            servicesData.titleColor || appearance.titleColor,
          ),
          subtitleColor: sanitizeColor(
            servicesData.subtitleColor || appearance.subtitleColor,
          ),
          cardBgColor: cardBg,
          cardTitleColor: sanitizeColor(
            servicesData.cardTitleColor ||
            appearance.cardTitleColor ||
            content.cardTitleColor,
          ),
          cardDescriptionColor: sanitizeColor(
            servicesData.cardDescriptionColor ||
            appearance.cardDescriptionColor ||
            content.cardDescriptionColor,
          ),
          cardPriceColor: sanitizeColor(
            servicesData.cardPriceColor ||
            appearance.cardPriceColor ||
            content.cardPriceColor,
          ),
          cardIconColor: sanitizeColor(
            servicesData.cardIconColor ||
            appearance.cardIconColor ||
            content.cardIconColor,
          ),
          backgroundColor: sanitizeColor(
            servicesData.bgColor || appearance.backgroundColor,
          ),
          backgroundImageUrl: servicesImage,
          bgType: servicesBgType,
        },
      };
    },
    [],
  );

  const normalizeGalleryFromConfig = useCallback(
    (gallery: unknown): GallerySettings => {
      if (!gallery || typeof gallery !== "object")
        return defaultGallerySettings;
      const galleryData = gallery as Record<string, unknown>;
      const appearance =
        (galleryData.appearance as Record<string, unknown>) || {};
      const content = (galleryData.content as Record<string, unknown>) || {};
      const itemsStyle =
        (galleryData.itemsStyle as Record<string, unknown>) || {};
      const cardConfig =
        (galleryData.cardConfig as Record<string, unknown>) || {};
      const galleryImage =
        (galleryData.bgImage as string) ||
        (appearance.backgroundImageUrl as string) ||
        "";
      const galleryBgType = resolveBgType(
        galleryData.bgType ?? appearance.bgType,
        galleryImage,
      );

      const cardBg = sanitizeColor(
        galleryData.cardBgColor ||
        galleryData.cardBackgroundColor ||
        galleryData.card_background_color ||
        cardConfig.backgroundColor ||
        cardConfig.cardBackgroundColor ||
        content.cardBgColor ||
        itemsStyle.itemBackgroundColor ||
        appearance.cardBgColor,
      );

      const resolvedBgColor =
        sanitizeColor(
          appearance.backgroundColor ||
          galleryData.bgColor ||
          galleryData.backgroundColor,
        ) || defaultGallerySettings.bgColor;

      return {
        ...defaultGallerySettings,
        ...(gallery as Partial<GallerySettings>),
        gridConfig: {
          ...defaultGallerySettings.gridConfig,
          ...(galleryData.gridConfig as Record<string, unknown> || {}),
        } as NonNullable<GallerySettings["gridConfig"]>,
        displayLogic: {
          ...defaultGallerySettings.displayLogic,
          ...(galleryData.displayLogic as Record<string, unknown> || {}),
        } as NonNullable<GallerySettings["displayLogic"]>,
        photoStyle: {
          ...defaultGallerySettings.photoStyle,
          ...(galleryData.photoStyle as Record<string, unknown> || {}),
        } as NonNullable<GallerySettings["photoStyle"]>,
        titleColor:
          sanitizeColor(galleryData.titleColor || appearance.titleColor) ||
          defaultGallerySettings.titleColor,
        subtitleColor:
          sanitizeColor(
            galleryData.subtitleColor || appearance.subtitleColor,
          ) || defaultGallerySettings.subtitleColor,
        buttonColor:
          sanitizeColor(galleryData.buttonColor || appearance.buttonColor) ||
          defaultGallerySettings.buttonColor,
        buttonTextColor:
          sanitizeColor(
            galleryData.buttonTextColor || appearance.buttonTextColor,
          ) || defaultGallerySettings.buttonTextColor,
        cardBgColor: cardBg || defaultGallerySettings.cardBgColor,
        bgColor: resolvedBgColor,
        bgImage: galleryImage,
        bgType: galleryBgType,
        appearance: {
          ...defaultGallerySettings.appearance,
          ...appearance,
          titleColor: sanitizeColor(
            galleryData.titleColor || appearance.titleColor,
          ),
          subtitleColor: sanitizeColor(
            galleryData.subtitleColor || appearance.subtitleColor,
          ),
          buttonColor: sanitizeColor(
            galleryData.buttonColor || appearance.buttonColor,
          ),
          buttonTextColor: sanitizeColor(
            galleryData.buttonTextColor || appearance.buttonTextColor,
          ),
          cardBgColor: cardBg,
          backgroundColor: resolvedBgColor,
          backgroundImageUrl: galleryImage,
          bgType: galleryBgType,
        },
      };
    },
    [],
  );

  const normalizeCTAFromConfig = useCallback((cta: unknown): CTASettings => {
    if (!cta || typeof cta !== "object") return defaultCTASettings;
    const ctaData = cta as Record<string, unknown>;
    const appearance = (ctaData.appearance as Record<string, unknown>) || {};
    const ctaImage =
      (ctaData.bgImage as string) ||
      (appearance.backgroundImageUrl as string) ||
      "";
    const ctaBgType = resolveBgType(
      ctaData.bgType ?? appearance.bgType,
      ctaImage,
    );
    return {
      ...defaultCTASettings,
      ...(cta as Partial<CTASettings>),
      titleColor:
        sanitizeColor(ctaData.titleColor || appearance.titleColor) ||
        defaultCTASettings.titleColor,
      subtitleColor:
        sanitizeColor(ctaData.subtitleColor || appearance.subtitleColor) ||
        defaultCTASettings.subtitleColor,
      buttonColor:
        sanitizeColor(ctaData.buttonColor || appearance.buttonColor) ||
        defaultCTASettings.buttonColor,
      buttonTextColor:
        sanitizeColor(ctaData.buttonTextColor || appearance.buttonTextColor) ||
        defaultCTASettings.buttonTextColor,
      bgColor:
        sanitizeColor(ctaData.bgColor || appearance.backgroundColor) ||
        defaultCTASettings.bgColor,
      bgImage: ctaImage,
      bgType: ctaBgType,
      appearance: {
        ...defaultCTASettings.appearance,
        ...appearance,
        titleColor: sanitizeColor(ctaData.titleColor || appearance.titleColor),
        subtitleColor: sanitizeColor(
          ctaData.subtitleColor || appearance.subtitleColor,
        ),
        buttonColor: sanitizeColor(
          ctaData.buttonColor || appearance.buttonColor,
        ),
        buttonTextColor: sanitizeColor(
          ctaData.buttonTextColor || appearance.buttonTextColor,
        ),
        backgroundColor: sanitizeColor(
          ctaData.bgColor || appearance.backgroundColor,
        ),
        backgroundImageUrl: ctaImage,
        bgType: ctaBgType,
      },
    };
  }, []);

  const normalizeStoryFromConfig = useCallback(
    (story: unknown): StorySettings => {
      if (!story || typeof story !== "object") return defaultStorySettings;
      const storyData = story as Record<string, unknown>;
      const appearance =
        (storyData.appearance as Record<string, unknown>) || {};
      const storyImage =
        (storyData.bgImage as string) ||
        (appearance.backgroundImageUrl as string) ||
        "";
      const storyBgType = resolveBgType(
        storyData.bgType ?? appearance.bgType,
        storyImage,
      );
      return {
        ...defaultStorySettings,
        ...(story as Partial<StorySettings>),
        titleColor:
          sanitizeColor(storyData.titleColor || appearance.titleColor) ||
          defaultStorySettings.titleColor,
        contentColor:
          sanitizeColor(storyData.contentColor) ||
          defaultStorySettings.contentColor,
        bgColor:
          sanitizeColor(storyData.bgColor || appearance.backgroundColor) ||
          defaultStorySettings.bgColor,
        bgImage: storyImage,
        bgType: storyBgType,
        appearance: {
          ...defaultStorySettings.appearance,
          ...appearance,
          titleColor: sanitizeColor(
            storyData.titleColor || appearance.titleColor,
          ),
          backgroundColor: sanitizeColor(
            storyData.bgColor || appearance.backgroundColor,
          ),
          backgroundImageUrl: storyImage,
          bgType: storyBgType,
        },
      };
    },
    [],
  );

  const normalizeTeamFromConfig = useCallback((team: unknown): TeamSettings => {
    if (!team || typeof team !== "object") return defaultTeamSettings;
    const teamData = team as Record<string, unknown>;
    const appearance = (teamData.appearance as Record<string, unknown>) || {};
    const teamImage =
      (teamData.bgImage as string) ||
      (appearance.backgroundImageUrl as string) ||
      "";
    const teamBgType = resolveBgType(
      teamData.bgType ?? appearance.bgType,
      teamImage,
    );
    return {
      ...defaultTeamSettings,
      ...(team as Partial<TeamSettings>),
      titleColor:
        sanitizeColor(teamData.titleColor || appearance.titleColor) ||
        defaultTeamSettings.titleColor,
      subtitleColor:
        sanitizeColor(teamData.subtitleColor || appearance.subtitleColor) ||
        defaultTeamSettings.subtitleColor,
      bgColor:
        sanitizeColor(teamData.bgColor || appearance.backgroundColor) ||
        defaultTeamSettings.bgColor,
      bgImage: teamImage,
      bgType: teamBgType,
      appearance: {
        ...defaultTeamSettings.appearance,
        ...appearance,
        titleColor: sanitizeColor(teamData.titleColor || appearance.titleColor),
        subtitleColor: sanitizeColor(
          teamData.subtitleColor || appearance.subtitleColor,
        ),
        backgroundColor: sanitizeColor(
          teamData.bgColor || appearance.backgroundColor,
        ),
        backgroundImageUrl: teamImage,
        bgType: teamBgType,
      },
    };
  }, []);

  const normalizeTestimonialsFromConfig = useCallback(
    (testimonials: unknown): TestimonialsSettings => {
      if (!testimonials || typeof testimonials !== "object")
        return defaultTestimonialsSettings;
      const testimonialsData = testimonials as Record<string, unknown>;
      const appearance =
        (testimonialsData.appearance as Record<string, unknown>) || {};
      const testimonialsImage =
        (testimonialsData.bgImage as string) ||
        (appearance.backgroundImageUrl as string) ||
        "";
      const testimonialsBgType = resolveBgType(
        testimonialsData.bgType ?? appearance.bgType,
        testimonialsImage,
      );
      return {
        ...defaultTestimonialsSettings,
        ...(testimonials as Partial<TestimonialsSettings>),
        titleColor:
          sanitizeColor(testimonialsData.titleColor || appearance.titleColor) ||
          defaultTestimonialsSettings.titleColor,
        subtitleColor:
          sanitizeColor(
            testimonialsData.subtitleColor || appearance.subtitleColor,
          ) || defaultTestimonialsSettings.subtitleColor,
        bgColor:
          sanitizeColor(
            testimonialsData.bgColor || appearance.backgroundColor,
          ) || defaultTestimonialsSettings.bgColor,
        bgImage: testimonialsImage,
        bgType: testimonialsBgType,
        appearance: {
          ...defaultTestimonialsSettings.appearance,
          ...appearance,
          titleColor: sanitizeColor(
            testimonialsData.titleColor || appearance.titleColor,
          ),
          subtitleColor: sanitizeColor(
            testimonialsData.subtitleColor || appearance.subtitleColor,
          ),
          backgroundColor: sanitizeColor(
            testimonialsData.bgColor || appearance.backgroundColor,
          ),
          backgroundImageUrl: testimonialsImage,
          bgType: testimonialsBgType,
        },
      };
    },
    [],
  );

  const normalizeHeaderFromConfig = useCallback(
    (header: unknown): HeaderSettings => {
      if (!header || typeof header !== "object") return defaultHeaderSettings;
      const headerData = header as Record<string, unknown>;
      return {
        ...defaultHeaderSettings,
        ...(header as Partial<HeaderSettings>),
        bgColor:
          sanitizeColor(headerData.bgColor || headerData.background_color) ||
          defaultHeaderSettings.bgColor,
        textColor:
          sanitizeColor(headerData.textColor || headerData.text_color) ||
          defaultHeaderSettings.textColor,
      };
    },
    [],
  );

  const normalizeFooterFromConfig = useCallback(
    (footer: unknown): FooterSettings => {
      if (!footer || typeof footer !== "object") return defaultFooterSettings;
      const footerData = footer as Record<string, unknown>;
      return {
        ...defaultFooterSettings,
        ...(footer as Partial<FooterSettings>),
        bgColor:
          sanitizeColor(footerData.bgColor || footerData.background_color) ||
          defaultFooterSettings.bgColor,
        textColor:
          sanitizeColor(footerData.textColor || footerData.text_color) ||
          defaultFooterSettings.textColor,
      };
    },
    [],
  );

  const [heroSettings, setHeroSettings] =
    useState<HeroSettings>(getHeroSettings());
  const [aboutHeroSettings, setAboutHeroSettings] = useState<HeroSettings>(
    getAboutHeroSettings(),
  );
  const [storySettings, setStorySettings] =
    useState<StorySettings>(getStorySettings());
  const [teamSettings, setTeamSettings] =
    useState<TeamSettings>(getTeamSettings());
  const [testimonialsSettings, setTestimonialsSettings] =
    useState<TestimonialsSettings>(getTestimonialsSettings());
  const [fontSettings, setFontSettings] =
    useState<FontSettings>(getFontSettings());
  const [colorSettings, setColorSettings] =
    useState<ColorSettings>(getColorSettings());
  const [servicesSettings, setServicesSettings] = useState<ServicesSettings>(
    getServicesSettings(),
  );
  const [homeValuesSettings, setHomeValuesSettings] = useState<ValuesSettings>(
    getHomeValuesSettings(),
  );
  const [aboutUsValuesSettings, setAboutUsValuesSettings] =
    useState<ValuesSettings>(getAboutUsValuesSettings());
  const [gallerySettings, setGallerySettings] = useState<GallerySettings>(
    getGallerySettings(),
  );
  const [galleryPageSettings, setGalleryPageSettings] =
    useState<GallerySettings>(getGalleryPageSettings());
  const [ctaSettings, setCTASettings] =
    useState<CTASettings>(getCTASettings());
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(
    getHeaderSettings(),
  );
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(
    getFooterSettings(),
  );

  const [bookingServiceSettings, setBookingServiceSettings] =
    useState<BookingStepSettings>(getBookingServiceSettings());
  const [bookingDateSettings, setBookingDateSettings] =
    useState<BookingStepSettings>(getBookingDateSettings());
  const [bookingTimeSettings, setBookingTimeSettings] =
    useState<BookingStepSettings>(getBookingTimeSettings());
  const [bookingFormSettings, setBookingFormSettings] =
    useState<BookingStepSettings>(getBookingFormSettings());
  const [bookingConfirmationSettings, setBookingConfirmationSettings] =
    useState<BookingStepSettings>(getBookingConfirmationSettings());
  const [sections, setSections] = useState<SectionsMap>(createDefaultSections);

  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(
    {},
  );
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});

  const [lastAppliedHero, setLastAppliedHero] =
    useState<HeroSettings>(defaultHeroSettings);
  const [lastAppliedAboutHero, setLastAppliedAboutHero] =
    useState<HeroSettings>(defaultAboutHeroSettings);
  const [lastAppliedStory, setLastAppliedStory] =
    useState<StorySettings>(defaultStorySettings);
  const [lastAppliedTeam, setLastAppliedTeam] =
    useState<TeamSettings>(defaultTeamSettings);
  const [lastAppliedTestimonials, setLastAppliedTestimonials] =
    useState<TestimonialsSettings>(defaultTestimonialsSettings);
  const [lastAppliedFont, setLastAppliedFont] =
    useState<FontSettings>(defaultFontSettings);
  const [lastAppliedColor, setLastAppliedColor] =
    useState<ColorSettings>(defaultColorSettings);
  const [lastAppliedServices, setLastAppliedServices] =
    useState<ServicesSettings>(defaultServicesSettings);
  const [lastAppliedHomeValues, setLastAppliedHomeValues] =
    useState<ValuesSettings>(defaultValuesSettings);
  const [lastAppliedAboutUsValues, setLastAppliedAboutUsValues] =
    useState<ValuesSettings>(defaultValuesSettings);
  const [lastAppliedGallery, setLastAppliedGallery] = useState<GallerySettings>(
    defaultGallerySettings,
  );
  const [lastAppliedGalleryPage, setLastAppliedGalleryPage] =
    useState<GallerySettings>(defaultGallerySettings);
  const [lastAppliedCTA, setLastAppliedCTA] =
    useState<CTASettings>(defaultCTASettings);
  const [lastAppliedHeader, setLastAppliedHeader] = useState<HeaderSettings>(
    defaultHeaderSettings,
  );
  const [lastAppliedFooter, setLastAppliedFooter] = useState<FooterSettings>(
    defaultFooterSettings,
  );

  const [lastAppliedBookingService, setLastAppliedBookingService] =
    useState<BookingStepSettings>(defaultBookingServiceSettings);
  const [lastAppliedBookingDate, setLastAppliedBookingDate] =
    useState<BookingStepSettings>(defaultBookingDateSettings);
  const [lastAppliedBookingTime, setLastAppliedBookingTime] =
    useState<BookingStepSettings>(defaultBookingTimeSettings);
  const [lastAppliedBookingForm, setLastAppliedBookingForm] =
    useState<BookingStepSettings>(defaultBookingFormSettings);
  const [lastAppliedBookingConfirmation, setLastAppliedBookingConfirmation] =
    useState<BookingStepSettings>(defaultBookingConfirmationSettings);

  const [lastSavedHero, setLastSavedHero] =
    useState<HeroSettings>(defaultHeroSettings);
  const [lastSavedAboutHero, setLastSavedAboutHero] = useState<HeroSettings>(
    defaultAboutHeroSettings,
  );
  const [lastSavedStory, setLastSavedStory] =
    useState<StorySettings>(defaultStorySettings);
  const [lastSavedTeam, setLastSavedTeam] =
    useState<TeamSettings>(defaultTeamSettings);
  const [lastSavedTestimonials, setLastSavedTestimonials] =
    useState<TestimonialsSettings>(defaultTestimonialsSettings);
  const [lastSavedFont, setLastSavedFont] =
    useState<FontSettings>(defaultFontSettings);
  const [lastSavedColor, setLastSavedColor] =
    useState<ColorSettings>(defaultColorSettings);
  const [lastSavedServices, setLastSavedServices] = useState<ServicesSettings>(
    defaultServicesSettings,
  );
  const [lastSavedHomeValues, setLastSavedHomeValues] =
    useState<ValuesSettings>(defaultValuesSettings);
  const [lastSavedAboutUsValues, setLastSavedAboutUsValues] =
    useState<ValuesSettings>(defaultValuesSettings);
  const [lastSavedGallery, setLastSavedGallery] = useState<GallerySettings>(
    defaultGallerySettings,
  );
  const [lastSavedGalleryPage, setLastSavedGalleryPage] =
    useState<GallerySettings>(defaultGallerySettings);
  const [lastSavedCTA, setLastSavedCTA] =
    useState<CTASettings>(defaultCTASettings);
  const [lastSavedHeader, setLastSavedHeader] = useState<HeaderSettings>(
    defaultHeaderSettings,
  );
  const [lastSavedFooter, setLastSavedFooter] = useState<FooterSettings>(
    defaultFooterSettings,
  );

  const [lastSavedBookingService, setLastSavedBookingService] =
    useState<BookingStepSettings>(defaultBookingServiceSettings);
  const [lastSavedBookingDate, setLastSavedBookingDate] =
    useState<BookingStepSettings>(defaultBookingDateSettings);
  const [lastSavedBookingTime, setLastSavedBookingTime] =
    useState<BookingStepSettings>(defaultBookingTimeSettings);
  const [lastSavedBookingForm, setLastSavedBookingForm] =
    useState<BookingStepSettings>(defaultBookingFormSettings);
  const [lastSavedBookingConfirmation, setLastSavedBookingConfirmation] =
    useState<BookingStepSettings>(defaultBookingConfirmationSettings);

  const [lastSavedPageVisibility, setLastSavedPageVisibility] = useState<
    Record<string, boolean>
  >({});
  const [lastSavedVisibleSections, setLastSavedVisibleSections] = useState<
    Record<string, boolean>
  >({});

  const [activeSectionId, setActiveSectionId] = useState<string>("hero");

  const [isInitialized, setIsInitialized] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  useEffect(() => {
    setSections((prev) => ({
      ...prev,
      [SECTION_IDS.homeHero]: heroSettings as SectionConfig,
      [SECTION_IDS.aboutHero]: aboutHeroSettings as SectionConfig,
      [SECTION_IDS.homeStory]: storySettings as SectionConfig,
      [SECTION_IDS.homeTeam]: teamSettings as SectionConfig,
      [SECTION_IDS.homeTestimonials]: testimonialsSettings as SectionConfig,
      [SECTION_IDS.homeServices]: servicesSettings as SectionConfig,
      [SECTION_IDS.homeValues]: homeValuesSettings as SectionConfig,
      [SECTION_IDS.aboutValues]: aboutUsValuesSettings as SectionConfig,
      [SECTION_IDS.homeGallery]: gallerySettings as SectionConfig,
      [SECTION_IDS.pageGallery]: galleryPageSettings as SectionConfig,
      [SECTION_IDS.homeCta]: ctaSettings as SectionConfig,
      [SECTION_IDS.layoutHeader]: headerSettings as SectionConfig,
      [SECTION_IDS.layoutFooter]: footerSettings as SectionConfig,
      [SECTION_IDS.bookingService]: bookingServiceSettings as SectionConfig,
      [SECTION_IDS.bookingDate]: bookingDateSettings as SectionConfig,
      [SECTION_IDS.bookingTime]: bookingTimeSettings as SectionConfig,
      [SECTION_IDS.bookingForm]: bookingFormSettings as SectionConfig,
      [SECTION_IDS.bookingConfirmation]:
        bookingConfirmationSettings as SectionConfig,
    }));
  }, [
    heroSettings,
    aboutHeroSettings,
    storySettings,
    teamSettings,
    testimonialsSettings,
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
  ]);

  // 1. Adicionar um efeito que observa o studio.config para sincronização inicial reativa
  useEffect(() => {
    // Só sincronizamos se os dados do banco existirem e se o utilizador ainda não fez alterações manuais (isDirty)
    if (studio?.config && !isDirty) {
      const config = normalizePayload(studio.config as SiteConfigData);
      const sections = (config.sections || {}) as SectionsMap;
      const siteCustomization =
        config.siteCustomization || config.site_customization;
      const layoutGlobal = (siteCustomization?.layoutGlobal ||
        siteCustomization?.layout_global ||
        {}) as Record<string, unknown>;
      const siteColors =
        (layoutGlobal.siteColors as Record<string, unknown> | undefined) ||
        (layoutGlobal.color as Record<string, unknown> | undefined) ||
        (layoutGlobal.site_colors as Record<string, unknown> | undefined) ||
        (layoutGlobal.cores_base as Record<string, unknown> | undefined);
      const resolvedColors: ColorSettings = {
        primary:
          (siteColors?.primary as string) ||
          config.colors?.primary ||
          defaultColorSettings.primary,
        secondary:
          (siteColors?.secondary as string) ||
          config.colors?.secondary ||
          defaultColorSettings.secondary,
        background:
          (siteColors?.background as string) ||
          config.colors?.background ||
          defaultColorSettings.background,
        text:
          (siteColors?.text as string) ||
          config.colors?.text ||
          defaultColorSettings.text,
        accent:
          (siteColors?.accent as string) ||
          config.colors?.accent ||
          defaultColorSettings.primary,
        buttonText:
          (siteColors?.buttonText as string) || config.colors?.buttonText || "",
        specialtyBadge: {
          background:
            ((siteColors?.specialtyBadge as Record<string, string>)?.background) ||
            ((siteColors?.specialty_badge as Record<string, string>)?.background) ||
            defaultColorSettings.specialtyBadge.background,
          text:
            ((siteColors?.specialtyBadge as Record<string, string>)?.text) ||
            ((siteColors?.specialty_badge as Record<string, string>)?.text) ||
            defaultColorSettings.specialtyBadge.text,
          borderRadius:
            ((siteColors?.specialtyBadge as Record<string, string>)?.borderRadius) ||
            ((siteColors?.specialty_badge as Record<string, string>)?.borderRadius) ||
            ((siteColors?.specialty_badge as Record<string, string>)?.border_radius) ||
            defaultColorSettings.specialtyBadge.borderRadius,
        },
      };
      const lastSavedSpecialtyBadge =
        lastSavedColor.specialtyBadge || defaultColorSettings.specialtyBadge;
      const hasLastSavedColors =
        lastSavedColor.primary !== defaultColorSettings.primary ||
        lastSavedColor.secondary !== defaultColorSettings.secondary ||
        lastSavedColor.background !== defaultColorSettings.background ||
        lastSavedColor.text !== defaultColorSettings.text ||
        lastSavedColor.accent !== defaultColorSettings.accent ||
        lastSavedSpecialtyBadge.borderRadius !==
        defaultColorSettings.specialtyBadge.borderRadius;
      const normalizeColor = (value?: string) => sanitizeColor(value || "") || "";
      const isConfigAlignedWithLastSaved =
        !hasLastSavedColors ||
        (normalizeColor(resolvedColors.primary) ===
          normalizeColor(lastSavedColor.primary) &&
          normalizeColor(resolvedColors.secondary) ===
          normalizeColor(lastSavedColor.secondary) &&
          normalizeColor(resolvedColors.background) ===
          normalizeColor(lastSavedColor.background) &&
          normalizeColor(resolvedColors.text) ===
          normalizeColor(lastSavedColor.text) &&
          normalizeColor(resolvedColors.accent || "") ===
          normalizeColor(lastSavedColor.accent || "") &&
          resolvedColors.specialtyBadge.borderRadius ===
          lastSavedSpecialtyBadge.borderRadius);
      if (!isConfigAlignedWithLastSaved) {
        console.log(
          ">>> [SYNC] studio.config desatualizado em relação ao lastSaved. Ignorando sync.",
        );
        return;
      }

      const heroSection =
        sections[SECTION_IDS.homeHero] || (config.hero as SectionConfig);
      const normalizedHero = normalizeHeroFromConfig(heroSection);
      const hasLastSavedHero =
        lastSavedHero.title !== defaultHeroSettings.title ||
        lastSavedHero.bgImage !== "" ||
        lastSavedHero.bgColor !== defaultHeroSettings.bgColor;
      const isHeroAlignedWithLastSaved =
        !hasLastSavedHero ||
        (normalizeColor(normalizedHero.bgColor) ===
          normalizeColor(lastSavedHero.bgColor) &&
          (normalizedHero.bgType || "") === (lastSavedHero.bgType || "") &&
          (normalizedHero.bgImage || "") === (lastSavedHero.bgImage || ""));
      if (!isHeroAlignedWithLastSaved) {
        console.log(
          ">>> [SYNC] studio.config desatualizado para HERO em relação ao lastSaved. Ignorando sync.",
        );
        return;
      }

      console.log(
        ">>> [SYNC] Sincronizando estado do editor com studio.config (isDirty=false)",
      );

      const siteFonts =
        (layoutGlobal.fontes as Record<string, unknown> | undefined) ||
        (layoutGlobal.typography as Record<string, unknown> | undefined);

      const hasValidColors = (colors?: unknown) =>
        !!colors &&
        typeof colors === "object" &&
        Object.values(colors as Record<string, unknown>).some(
          (value) =>
            typeof value === "string" &&
            value.startsWith("#") &&
            value.length >= 4,
        );

      if (hasValidColors(siteColors) || hasValidColors(config.colors)) {
        setColorSettings((prev) => ({
          ...prev,
          ...(config.colors || {}),
          ...(siteColors || {}),
        }));
      }

      if (siteFonts || config.typography || config.theme) {
        setFontSettings((prev) => ({
          ...prev,
          ...(config.theme || {}),
          ...(config.typography || {}),
          ...(siteFonts || {}),
        }));
      }

      if (heroSection) setHeroSettings(normalizeHeroFromConfig(heroSection));

      const aboutHeroSection =
        sections[SECTION_IDS.aboutHero] ||
        (config.aboutHero as SectionConfig) ||
        (config.about as SectionConfig);
      if (aboutHeroSection)
        setAboutHeroSettings(normalizeHeroFromConfig(aboutHeroSection));

      const storySection =
        sections[SECTION_IDS.homeStory] || (config.story as SectionConfig);
      if (storySection)
        setStorySettings(normalizeStoryFromConfig(storySection));

      const teamSection =
        sections[SECTION_IDS.homeTeam] || (config.team as SectionConfig);
      if (teamSection) setTeamSettings(normalizeTeamFromConfig(teamSection));

      const testimonialsSection =
        sections[SECTION_IDS.homeTestimonials] ||
        (config.testimonials as SectionConfig);
      if (testimonialsSection)
        setTestimonialsSettings(
          normalizeTestimonialsFromConfig(testimonialsSection),
        );

      const servicesSection =
        sections[SECTION_IDS.homeServices] ||
        (config.services as SectionConfig);
      if (servicesSection)
        setServicesSettings(normalizeServicesFromConfig(servicesSection));

      const homeValuesSection =
        sections[SECTION_IDS.homeValues] ||
        (config.homeValuesSettings as SectionConfig) ||
        (config.values as SectionConfig);
      if (homeValuesSection)
        setHomeValuesSettings(normalizeValuesFromConfig(homeValuesSection));

      const aboutValuesSection =
        sections[SECTION_IDS.aboutValues] ||
        (config.aboutUsValuesSettings as SectionConfig) ||
        (config.values as SectionConfig);
      if (aboutValuesSection)
        setAboutUsValuesSettings(normalizeValuesFromConfig(aboutValuesSection));

      const galleryPreviewSection =
        sections[SECTION_IDS.homeGallery] ||
        (config.galleryPreviewSettings as SectionConfig);
      if (galleryPreviewSection)
        setGallerySettings(normalizeGalleryFromConfig(galleryPreviewSection));

      const galleryPageSection =
        sections[SECTION_IDS.pageGallery] ||
        (config.galleryPageSettings as SectionConfig);
      if (galleryPageSection)
        setGalleryPageSettings(normalizeGalleryFromConfig(galleryPageSection));

      const ctaSection =
        sections[SECTION_IDS.homeCta] || (config.cta as SectionConfig);
      if (ctaSection) setCTASettings(normalizeCTAFromConfig(ctaSection));

      const headerSection =
        sections[SECTION_IDS.layoutHeader] || (config.header as SectionConfig);
      if (headerSection)
        setHeaderSettings(normalizeHeaderFromConfig(headerSection));

      const footerSection =
        sections[SECTION_IDS.layoutFooter] || (config.footer as SectionConfig);
      if (footerSection)
        setFooterSettings(normalizeFooterFromConfig(footerSection));

      // Sincronizar bookingSteps se houver
      const bookingSteps = (config.appointmentFlow || config.bookingSteps) as
        | Record<string, BookingStepSettings | undefined>
        | undefined;

      const bookingServiceSection =
        sections[SECTION_IDS.bookingService] ||
        (bookingSteps?.service as SectionConfig | undefined);
      if (bookingServiceSection) {
        setBookingServiceSettings(
          normalizeStepSettings(bookingServiceSection as BookingStepSettings),
        );
      }
      const bookingDateSection =
        sections[SECTION_IDS.bookingDate] ||
        (bookingSteps?.date as SectionConfig | undefined);
      if (bookingDateSection) {
        setBookingDateSettings(
          normalizeStepSettings(bookingDateSection as BookingStepSettings),
        );
      }
      const bookingTimeSection =
        sections[SECTION_IDS.bookingTime] ||
        (bookingSteps?.time as SectionConfig | undefined);
      if (bookingTimeSection) {
        setBookingTimeSettings(
          normalizeStepSettings(bookingTimeSection as BookingStepSettings),
        );
      }
      const bookingFormSection =
        sections[SECTION_IDS.bookingForm] ||
        (bookingSteps?.form as SectionConfig | undefined);
      if (bookingFormSection) {
        setBookingFormSettings(
          normalizeStepSettings(bookingFormSection as BookingStepSettings),
        );
      }
      const bookingConfirmationSection =
        sections[SECTION_IDS.bookingConfirmation] ||
        (bookingSteps?.confirmation as SectionConfig | undefined);
      if (bookingConfirmationSection) {
        setBookingConfirmationSettings(
          normalizeStepSettings(
            bookingConfirmationSection as BookingStepSettings,
          ),
        );
      }

      // Seções e Visibilidade
      if (config.visibleSections)
        setVisibleSections((prev) => ({ ...prev, ...config.visibleSections }));
      if (config.pageVisibility)
        setPageVisibility((prev) => ({ ...prev, ...config.pageVisibility }));

      console.log(
        ">>> [SYNC] Estado do editor sincronizado com o Banco de Dados.",
      );
    }
  }, [
    studio?.config,
    isDirty,
    normalizeHeroFromConfig,
    normalizeServicesFromConfig,
    normalizeValuesFromConfig,
    normalizeGalleryFromConfig,
    normalizeCTAFromConfig,
    normalizeStoryFromConfig,
    normalizeTeamFromConfig,
    normalizeTestimonialsFromConfig,
    normalizeHeaderFromConfig,
    normalizeFooterFromConfig,
    lastSavedColor.primary,
    lastSavedColor.secondary,
    lastSavedColor.background,
    lastSavedColor.text,
    lastSavedColor.accent,
    lastSavedHero.title,
    lastSavedHero.bgImage,
    lastSavedHero.bgColor,
    lastSavedHero.bgType,
    lastSavedColor.specialtyBadge,
  ]);

  // --- Efeito de Inicialização (TASK 1 & 4) ---
  // Monitora a chegada dos dados salvos no banco (lastSaved) para forçar a sincronização inicial
  useEffect(() => {
    if (isInitialSyncDone) return;

    // Critério: Observamos os estados 'lastSaved' que vêm do fetch inicial
    const hasSavedColors =
      lastSavedColor.primary !== defaultColorSettings.primary &&
      lastSavedColor.primary !== "";
    const hasSavedHero =
      lastSavedHero.title !== defaultHeroSettings.title ||
      lastSavedHero.bgImage !== "";

    if (hasSavedColors || hasSavedHero) {
      console.log(
        ">>> [INIT_LOAD] Dados do banco detectados em lastSaved. Sincronizando estado local 'dirty'.",
      );

      // Sincronizar seções de agendamento que costumam dar fallback rosa
      setBookingServiceSettings((prev) => syncBackground(prev, {}));
      setBookingDateSettings((prev) => syncBackground(prev, {}));
      setBookingTimeSettings((prev) => syncBackground(prev, {}));
      setBookingFormSettings((prev) => syncBackground(prev, {}));
      setBookingConfirmationSettings((prev) => syncBackground(prev, {}));

      // Sincronizar outras seções principais
      setHeroSettings((prev) => syncBackground(prev, {}));
      setServicesSettings((prev) => syncBackground(prev, {}));
      setHomeValuesSettings((prev) => syncBackground(prev, {}));
      setAboutUsValuesSettings((prev) => syncBackground(prev, {}));
      setCTASettings((prev) => syncBackground(prev, {}));

      setIsInitialSyncDone(true);
    }
  }, [
    isInitialSyncDone,
    lastSavedColor.primary,
    lastSavedHero.title,
    lastSavedHero.bgImage,
    syncBackground,
  ]);

  const handleUpdateHero = useCallback(
    (updates: Partial<HeroSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateHero recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setHeroSettings((prev: HeroSettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateAboutHero = useCallback(
    (updates: Partial<HeroSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateAboutHero recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setAboutHeroSettings((prev: HeroSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateStory = useCallback(
    (updates: Partial<StorySettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateStory recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setStorySettings((prev: StorySettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateTeam = useCallback(
    (updates: Partial<TeamSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateTeam recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setTeamSettings((prev: TeamSettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateTestimonials = useCallback(
    (updates: Partial<TestimonialsSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateTestimonials recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setTestimonialsSettings((prev: TestimonialsSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateFont = useCallback((updates: Partial<FontSettings>) => {
    // Type guard: aborta se updates não for objeto válido
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      console.error('>>> [EDITOR_STATE] handleUpdateFont recebeu updates inválido:', updates);
      return;
    }
    setIsDirty(true);
    setFontSettings((prev: FontSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateColors = useCallback((updates: Partial<ColorSettings>) => {
    // Type guard: aborta se updates não for objeto válido
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      console.error('>>> [EDITOR_STATE] handleUpdateColors recebeu updates inválido:', updates);
      return;
    }
    setIsDirty(true);
    setColorSettings((prev: ColorSettings) => {
      const newState = { ...prev };
      if (updates.primary !== undefined)
        newState.primary = sanitizeColor(updates.primary) || prev.primary;
      if (updates.secondary !== undefined)
        newState.secondary = sanitizeColor(updates.secondary) || prev.secondary;
      if (updates.accent !== undefined)
        newState.accent = sanitizeColor(updates.accent) || prev.accent;
      if (updates.background !== undefined)
        newState.background =
          sanitizeColor(updates.background) || prev.background;
      if (updates.text !== undefined)
        newState.text = sanitizeColor(updates.text) || prev.text;
      return newState;
    });
  }, []);

  const handleUpdateServices = useCallback(
    (updates: Partial<ServicesSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateServices recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setServicesSettings((prev: ServicesSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        if (updates.titleColor !== undefined)
          newState.titleColor =
            sanitizeColor(updates.titleColor) || prev.titleColor;
        if (updates.subtitleColor !== undefined)
          newState.subtitleColor =
            sanitizeColor(updates.subtitleColor) || prev.subtitleColor;
        if (updates.cardBgColor !== undefined)
          newState.cardBgColor =
            sanitizeColor(updates.cardBgColor) || prev.cardBgColor;
        if (updates.cardTitleColor !== undefined)
          newState.cardTitleColor =
            sanitizeColor(updates.cardTitleColor) || prev.cardTitleColor;
        if (updates.cardDescriptionColor !== undefined)
          newState.cardDescriptionColor =
            sanitizeColor(updates.cardDescriptionColor) ||
            prev.cardDescriptionColor;
        if (updates.cardPriceColor !== undefined)
          newState.cardPriceColor =
            sanitizeColor(updates.cardPriceColor) || prev.cardPriceColor;
        if (updates.cardIconColor !== undefined)
          newState.cardIconColor =
            sanitizeColor(updates.cardIconColor) || prev.cardIconColor;
        return newState;
      });
    },
    [syncBackground],
  );

  const handleUpdateHomeValues = useCallback(
    (updates: Partial<ValuesSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateHomeValues recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setHomeValuesSettings((prev: ValuesSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        if (updates.titleColor !== undefined)
          newState.titleColor =
            sanitizeColor(updates.titleColor) || prev.titleColor;
        if (updates.subtitleColor !== undefined)
          newState.subtitleColor =
            sanitizeColor(updates.subtitleColor) || prev.subtitleColor;
        if (updates.cardBgColor !== undefined)
          newState.cardBgColor =
            sanitizeColor(updates.cardBgColor) || prev.cardBgColor;
        if (updates.cardTitleColor !== undefined)
          newState.cardTitleColor =
            sanitizeColor(updates.cardTitleColor) || prev.cardTitleColor;
        if (updates.cardDescriptionColor !== undefined)
          newState.cardDescriptionColor =
            sanitizeColor(updates.cardDescriptionColor) ||
            prev.cardDescriptionColor;
        if (updates.cardTextColor !== undefined)
          newState.cardTextColor =
            sanitizeColor(updates.cardTextColor) || prev.cardTextColor;
        if (updates.iconColor !== undefined)
          newState.iconColor =
            sanitizeColor(updates.iconColor) || prev.iconColor;
        if (updates.borderRadius !== undefined)
          newState.borderRadius = updates.borderRadius || prev.borderRadius;
        return newState;
      });
    },
    [syncBackground],
  );

  const handleUpdateAboutUsValues = useCallback(
    (updates: Partial<ValuesSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateAboutUsValues recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setAboutUsValuesSettings((prev: ValuesSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        if (updates.titleColor !== undefined)
          newState.titleColor =
            sanitizeColor(updates.titleColor) || prev.titleColor;
        if (updates.subtitleColor !== undefined)
          newState.subtitleColor =
            sanitizeColor(updates.subtitleColor) || prev.subtitleColor;
        if (updates.cardBgColor !== undefined)
          newState.cardBgColor =
            sanitizeColor(updates.cardBgColor) || prev.cardBgColor;
        if (updates.cardTitleColor !== undefined)
          newState.cardTitleColor =
            sanitizeColor(updates.cardTitleColor) || prev.cardTitleColor;
        if (updates.cardDescriptionColor !== undefined)
          newState.cardDescriptionColor =
            sanitizeColor(updates.cardDescriptionColor) ||
            prev.cardDescriptionColor;
        if (updates.cardTextColor !== undefined)
          newState.cardTextColor =
            sanitizeColor(updates.cardTextColor) || prev.cardTextColor;
        if (updates.iconColor !== undefined)
          newState.iconColor =
            sanitizeColor(updates.iconColor) || prev.iconColor;
        if (updates.borderRadius !== undefined)
          newState.borderRadius = updates.borderRadius || prev.borderRadius;
        return newState;
      });
    },
    [syncBackground],
  );

  const handleUpdateGalleryPreview = useCallback(
    (updates: Partial<GallerySettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateGalleryPreview recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setGallerySettings((prev: GallerySettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        if (updates.titleColor !== undefined)
          newState.titleColor =
            sanitizeColor(updates.titleColor) || prev.titleColor;
        if (updates.subtitleColor !== undefined)
          newState.subtitleColor =
            sanitizeColor(updates.subtitleColor) || prev.subtitleColor;
        if (updates.buttonColor !== undefined)
          newState.buttonColor =
            sanitizeColor(updates.buttonColor) || prev.buttonColor;
        if (updates.buttonTextColor !== undefined)
          newState.buttonTextColor =
            sanitizeColor(updates.buttonTextColor) || prev.buttonTextColor;
        if (updates.cardBgColor !== undefined)
          newState.cardBgColor =
            sanitizeColor(updates.cardBgColor) || prev.cardBgColor;
        return newState;
      });
    },
    [syncBackground],
  );

  const handleUpdateGalleryPage = useCallback(
    (updates: Partial<GallerySettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateGalleryPage recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setGalleryPageSettings((prev: GallerySettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        if (updates.titleColor !== undefined)
          newState.titleColor =
            sanitizeColor(updates.titleColor) || prev.titleColor;
        if (updates.subtitleColor !== undefined)
          newState.subtitleColor =
            sanitizeColor(updates.subtitleColor) || prev.subtitleColor;
        if (updates.buttonColor !== undefined)
          newState.buttonColor =
            sanitizeColor(updates.buttonColor) || prev.buttonColor;
        if (updates.buttonTextColor !== undefined)
          newState.buttonTextColor =
            sanitizeColor(updates.buttonTextColor) || prev.buttonTextColor;
        if (updates.cardBgColor !== undefined)
          newState.cardBgColor =
            sanitizeColor(updates.cardBgColor) || prev.cardBgColor;
        return newState;
      });
    },
    [syncBackground],
  );

  const handleUpdateCTA = useCallback(
    (updates: Partial<CTASettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateCTA recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setCTASettings((prev: CTASettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateHeader = useCallback((updates: Partial<HeaderSettings>) => {
    // Type guard: aborta se updates não for objeto válido
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      console.error('>>> [EDITOR_STATE] handleUpdateHeader recebeu updates inválido:', updates);
      return;
    }
    setIsDirty(true);
    setHeaderSettings((prev: HeaderSettings) => {
      const newState = { ...prev, ...updates };
      if (updates.bgColor !== undefined)
        newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
      if (updates.textColor !== undefined)
        newState.textColor = sanitizeColor(updates.textColor) || prev.textColor;
      if (updates.buttonBgColor !== undefined)
        newState.buttonBgColor =
          sanitizeColor(updates.buttonBgColor) || prev.buttonBgColor;
      if (updates.buttonTextColor !== undefined)
        newState.buttonTextColor =
          sanitizeColor(updates.buttonTextColor) || prev.buttonTextColor;
      return newState;
    });
  }, []);

  const handleUpdateFooter = useCallback((updates: Partial<FooterSettings>) => {
    // Type guard: aborta se updates não for objeto válido
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      console.error('>>> [EDITOR_STATE] handleUpdateFooter recebeu updates inválido:', updates);
      return;
    }
    setIsDirty(true);
    setFooterSettings((prev: FooterSettings) => {
      const newState = { ...prev, ...updates };
      if (updates.bgColor !== undefined)
        newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
      if (updates.textColor !== undefined)
        newState.textColor = sanitizeColor(updates.textColor) || prev.textColor;
      if (updates.titleColor !== undefined)
        newState.titleColor =
          sanitizeColor(updates.titleColor) || prev.titleColor;
      if (updates.iconColor !== undefined)
        newState.iconColor = sanitizeColor(updates.iconColor) || prev.iconColor;
      return newState;
    });
  }, []);

  const handleUpdateBookingService = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateBookingService recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setBookingServiceSettings((prev: BookingStepSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        return normalizeStepSettings(newState);
      });
    },
    [syncBackground],
  );

  const handleUpdateBookingDate = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateBookingDate recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setBookingDateSettings((prev: BookingStepSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        return normalizeStepSettings(newState);
      });
    },
    [syncBackground],
  );

  const handleUpdateBookingTime = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateBookingTime recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setBookingTimeSettings((prev: BookingStepSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        return normalizeStepSettings(newState);
      });
    },
    [syncBackground],
  );

  const handleUpdateBookingForm = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateBookingForm recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setBookingFormSettings((prev: BookingStepSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        return normalizeStepSettings(newState);
      });
    },
    [syncBackground],
  );

  const handleUpdateBookingConfirmation = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateBookingConfirmation recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setBookingConfirmationSettings((prev: BookingStepSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        return normalizeStepSettings(newState);
      });
    },
    [syncBackground],
  );

  const handlePageVisibilityChange = useCallback(
    (pageId: string, isVisible: boolean) => {
      setPageVisibility((prev: Record<string, boolean>) => ({
        ...prev,
        [pageId]: isVisible,
      }));
    },
    [],
  );

  const handleSectionVisibilityToggle = useCallback((sectionId: string) => {
    setVisibleSections((prev: Record<string, boolean>) => {
      const isCurrentlyVisible = prev[sectionId] !== false;
      return {
        ...prev,
        [sectionId]: !isCurrentlyVisible,
      };
    });
  }, []);

  const handleUpdateBackground = useCallback(
    (updates: Partial<BackgroundSettings>, sectionId?: string) => {
      const targetSectionId = sectionId || activeSectionId;
      console.log(
        `>>> [useEditorState] handleUpdateBackground para seção: ${targetSectionId}`,
        updates,
      );

      const updateFnMap: Record<
        string,
        (u: Partial<BackgroundSettings>) => void
      > = {
        hero: handleUpdateHero as (u: Partial<BackgroundSettings>) => void,
        "about-hero": handleUpdateAboutHero as (
          u: Partial<BackgroundSettings>,
        ) => void,
        story: handleUpdateStory as (u: Partial<BackgroundSettings>) => void,
        team: handleUpdateTeam as (u: Partial<BackgroundSettings>) => void,
        testimonials: handleUpdateTestimonials as (
          u: Partial<BackgroundSettings>,
        ) => void,
        services: handleUpdateServices as (
          u: Partial<BackgroundSettings>,
        ) => void,
        values: handleUpdateHomeValues as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "home-values": handleUpdateHomeValues as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "about-values": handleUpdateAboutUsValues as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "about-us-values": handleUpdateAboutUsValues as (
          u: Partial<BackgroundSettings>,
        ) => void,
        gallery: handleUpdateGalleryPreview as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "gallery-preview": handleUpdateGalleryPreview as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "gallery-grid": handleUpdateGalleryPage as (
          u: Partial<BackgroundSettings>,
        ) => void,
        cta: handleUpdateCTA as (u: Partial<BackgroundSettings>) => void,
        "booking-service": handleUpdateBookingService as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "booking-date": handleUpdateBookingDate as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "booking-time": handleUpdateBookingTime as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "booking-form": handleUpdateBookingForm as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "booking-confirmation": handleUpdateBookingConfirmation as (
          u: Partial<BackgroundSettings>,
        ) => void,
      };

      const updateFn = updateFnMap[targetSectionId];
      if (updateFn) {
        updateFn(updates);
      } else {
        console.warn(
          `>>> [useEditorState] Nenhuma função de atualização encontrada para a seção: ${targetSectionId}`,
        );
      }
    },
    [
      activeSectionId,
      handleUpdateHero,
      handleUpdateAboutHero,
      handleUpdateStory,
      handleUpdateTeam,
      handleUpdateTestimonials,
      handleUpdateServices,
      handleUpdateHomeValues,
      handleUpdateAboutUsValues,
      handleUpdateGalleryPreview,
      handleUpdateGalleryPage,
      handleUpdateCTA,
      handleUpdateBookingService,
      handleUpdateBookingDate,
      handleUpdateBookingTime,
      handleUpdateBookingForm,
      handleUpdateBookingConfirmation,
    ],
  );

  return {
    heroSettings,
    setHeroSettings,
    aboutHeroSettings,
    setAboutHeroSettings,
    storySettings,
    setStorySettings,
    teamSettings,
    setTeamSettings,
    testimonialsSettings,
    setTestimonialsSettings,
    fontSettings,
    setFontSettings,
    colorSettings,
    setColorSettings,
    servicesSettings,
    setServicesSettings,
    homeValuesSettings,
    setHomeValuesSettings,
    aboutUsValuesSettings,
    setAboutUsValuesSettings,
    gallerySettings,
    setGallerySettings,
    galleryPageSettings,
    setGalleryPageSettings,
    ctaSettings,
    setCTASettings,
    headerSettings,
    setHeaderSettings,
    footerSettings,
    setFooterSettings,
    bookingServiceSettings,
    setBookingServiceSettings,
    bookingDateSettings,
    setBookingDateSettings,
    bookingTimeSettings,
    setBookingTimeSettings,
    bookingFormSettings,
    setBookingFormSettings,
    bookingConfirmationSettings,
    setBookingConfirmationSettings,
    sections,
    setSections,
    pageVisibility,
    setPageVisibility,
    visibleSections,
    setVisibleSections,
    isInitialized,
    setIsInitialized,
    lastAppliedHero,
    setLastAppliedHero,
    lastAppliedAboutHero,
    setLastAppliedAboutHero,
    lastAppliedStory,
    setLastAppliedStory,
    lastAppliedTeam,
    setLastAppliedTeam,
    lastAppliedTestimonials,
    setLastAppliedTestimonials,
    lastAppliedFont,
    setLastAppliedFont,
    lastAppliedColor,
    setLastAppliedColor,
    lastAppliedServices,
    setLastAppliedServices,
    lastAppliedHomeValues,
    setLastAppliedHomeValues,
    lastAppliedAboutUsValues,
    setLastAppliedAboutUsValues,
    lastAppliedGallery,
    setLastAppliedGallery,
    lastAppliedGalleryPage,
    setLastAppliedGalleryPage,
    lastAppliedCTA,
    setLastAppliedCTA,
    lastAppliedHeader,
    setLastAppliedHeader,
    lastAppliedFooter,
    setLastAppliedFooter,
    lastAppliedBookingService,
    setLastAppliedBookingService,
    lastAppliedBookingDate,
    setLastAppliedBookingDate,
    lastAppliedBookingTime,
    setLastAppliedBookingTime,
    lastAppliedBookingForm,
    setLastAppliedBookingForm,
    lastAppliedBookingConfirmation,
    setLastAppliedBookingConfirmation,
    lastSavedHero,
    setLastSavedHero,
    lastSavedAboutHero,
    setLastSavedAboutHero,
    lastSavedStory,
    setLastSavedStory,
    lastSavedTeam,
    setLastSavedTeam,
    lastSavedTestimonials,
    setLastSavedTestimonials,
    lastSavedFont,
    setLastSavedFont,
    lastSavedColor,
    setLastSavedColor,
    lastSavedServices,
    setLastSavedServices,
    lastSavedHomeValues,
    setLastSavedHomeValues,
    lastSavedAboutUsValues,
    setLastSavedAboutUsValues,
    lastSavedGallery,
    setLastSavedGallery,
    lastSavedGalleryPage,
    setLastSavedGalleryPage,
    lastSavedCTA,
    setLastSavedCTA,
    lastSavedHeader,
    setLastSavedHeader,
    lastSavedFooter,
    setLastSavedFooter,
    lastSavedBookingService,
    setLastSavedBookingService,
    lastSavedBookingDate,
    setLastSavedBookingDate,
    lastSavedBookingTime,
    setLastSavedBookingTime,
    lastSavedBookingForm,
    setLastSavedBookingForm,
    lastSavedBookingConfirmation,
    setLastSavedBookingConfirmation,
    lastSavedPageVisibility,
    setLastSavedPageVisibility,
    lastSavedVisibleSections,
    setLastSavedVisibleSections,
    handleUpdateHero,
    handleUpdateAboutHero,
    handleUpdateStory,
    handleUpdateTeam,
    handleUpdateTestimonials,
    handleUpdateFont,
    handleUpdateColors,
    handleUpdateServices,
    handleUpdateHomeValues,
    handleUpdateAboutUsValues,
    handleUpdateGalleryPreview,
    handleUpdateGalleryPage,
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
    handleUpdateBackground,
    activeSectionId,
    setActiveSectionId,
    isDirty,
    setIsDirty,
  };
}
