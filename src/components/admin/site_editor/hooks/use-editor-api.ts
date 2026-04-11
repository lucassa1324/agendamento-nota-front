import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { useToast } from "@/hooks/use-toast";
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
  normalizePayload as normalizePayloadData,
  normalizePersistenceData,
  normalizeStepSettings,
  SECTION_IDS,
  sanitizeColor,
  sanitizeSection,
} from "@/lib/booking-data";
import type { SiteConfigData } from "@/lib/site-config-types";
import { siteCustomizerService } from "@/lib/site-customizer-service";
import type { EditorLocalDrafts } from "./use-editor-local";

type EditorSettings = {
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
};

type EditorSavedState = {
  lastSavedHero: HeroSettings;
  lastSavedAboutHero: HeroSettings;
  lastSavedStory: StorySettings;
  lastSavedTeam: TeamSettings;
  lastSavedTestimonials: TestimonialsSettings;
  lastSavedFont: FontSettings;
  lastSavedColor: ColorSettings;
  lastSavedServices: ServicesSettings;
  lastSavedHomeValues: ValuesSettings;
  lastSavedAboutUsValues: ValuesSettings;
  lastSavedGallery: GallerySettings;
  lastSavedGalleryPage: GallerySettings;
  lastSavedCTA: CTASettings;
  lastSavedHeader: HeaderSettings;
  lastSavedFooter: FooterSettings;
  lastSavedBookingService: BookingStepSettings;
  lastSavedBookingDate: BookingStepSettings;
  lastSavedBookingTime: BookingStepSettings;
  lastSavedBookingForm: BookingStepSettings;
  lastSavedBookingConfirmation: BookingStepSettings;
  lastSavedPageVisibility: Record<string, boolean>;
  lastSavedVisibleSections: Record<string, boolean>;
};

type EditorAppliedState = {
  lastAppliedHero: HeroSettings;
  lastAppliedAboutHero: HeroSettings;
  lastAppliedStory: StorySettings;
  lastAppliedTeam: TeamSettings;
  lastAppliedTestimonials: TestimonialsSettings;
  lastAppliedFont: FontSettings;
  lastAppliedColor: ColorSettings;
  lastAppliedServices: ServicesSettings;
  lastAppliedHomeValues: ValuesSettings;
  lastAppliedAboutUsValues: ValuesSettings;
  lastAppliedGallery: GallerySettings;
  lastAppliedGalleryPage: GallerySettings;
  lastAppliedCTA: CTASettings;
  lastAppliedHeader: HeaderSettings;
  lastAppliedFooter: FooterSettings;
  lastAppliedBookingService: BookingStepSettings;
  lastAppliedBookingDate: BookingStepSettings;
  lastAppliedBookingTime: BookingStepSettings;
  lastAppliedBookingForm: BookingStepSettings;
  lastAppliedBookingConfirmation: BookingStepSettings;
};

type EditorStateSetters = {
  setLastSavedHero: (value: HeroSettings) => void;
  setLastSavedAboutHero: (value: HeroSettings) => void;
  setLastSavedStory: (value: StorySettings) => void;
  setLastSavedTeam: (value: TeamSettings) => void;
  setLastSavedTestimonials: (value: TestimonialsSettings) => void;
  setLastSavedFont: (value: FontSettings) => void;
  setLastSavedColor: (value: ColorSettings) => void;
  setLastSavedServices: (value: ServicesSettings) => void;
  setLastSavedHomeValues: (value: ValuesSettings) => void;
  setLastSavedAboutUsValues: (value: ValuesSettings) => void;
  setLastSavedGallery: (value: GallerySettings) => void;
  setLastSavedGalleryPage: (value: GallerySettings) => void;
  setLastSavedCTA: (value: CTASettings) => void;
  setLastSavedHeader: (value: HeaderSettings) => void;
  setLastSavedFooter: (value: FooterSettings) => void;
  setLastSavedBookingService: (value: BookingStepSettings) => void;
  setLastSavedBookingDate: (value: BookingStepSettings) => void;
  setLastSavedBookingTime: (value: BookingStepSettings) => void;
  setLastSavedBookingForm: (value: BookingStepSettings) => void;
  setLastSavedBookingConfirmation: (value: BookingStepSettings) => void;
  setLastSavedPageVisibility: (value: Record<string, boolean>) => void;
  setLastSavedVisibleSections: (value: Record<string, boolean>) => void;
  setLastAppliedHero: (value: HeroSettings) => void;
  setLastAppliedAboutHero: (value: HeroSettings) => void;
  setLastAppliedStory: (value: StorySettings) => void;
  setLastAppliedTeam: (value: TeamSettings) => void;
  setLastAppliedTestimonials: (value: TestimonialsSettings) => void;
  setLastAppliedFont: (value: FontSettings) => void;
  setLastAppliedColor: (value: ColorSettings) => void;
  setLastAppliedServices: (value: ServicesSettings) => void;
  setLastAppliedHomeValues: (value: ValuesSettings) => void;
  setLastAppliedAboutUsValues: (value: ValuesSettings) => void;
  setLastAppliedGallery: (value: GallerySettings) => void;
  setLastAppliedGalleryPage: (value: GallerySettings) => void;
  setLastAppliedCTA: (value: CTASettings) => void;
  setLastAppliedHeader: (value: HeaderSettings) => void;
  setLastAppliedFooter: (value: FooterSettings) => void;
  setLastAppliedBookingService: (value: BookingStepSettings) => void;
  setLastAppliedBookingDate: (value: BookingStepSettings) => void;
  setLastAppliedBookingTime: (value: BookingStepSettings) => void;
  setLastAppliedBookingForm: (value: BookingStepSettings) => void;
  setLastAppliedBookingConfirmation: (value: BookingStepSettings) => void;
};

type UseEditorApiParams = {
  loadExternalConfig: (config: SiteConfigData, force?: boolean) => void;
  settings: EditorSettings;
  lastSaved: EditorSavedState;
  lastApplied: EditorAppliedState;
  setters: EditorStateSetters;
  setIsDirty: (value: boolean) => void;
  saveLocalDrafts: (data: EditorLocalDrafts) => void;
  updateStudioInfo?: (updates: Record<string, unknown>) => void;
};

const normalizePayload = (data: SiteConfigData | null | undefined) =>
  normalizePayloadData(data);

// Função de validação robusta para objetos de configuração
const validateSectionObject = (obj: unknown, sectionName: string): boolean => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    console.error(`>>> [API_GUARD] Objeto inválido para ${sectionName}:`, obj);
    return false;
  }

  const keys = Object.keys(obj as Record<string, unknown>);

  // Verifica se o objeto foi corrompido (transformado em string indexada)
  if (keys.length > 0 && keys.every((key) => /^\d+$/.test(key))) {
    console.error(
      `>>> [API_GUARD] Objeto corrompido detectado para ${sectionName} (string indexada):`,
      obj,
    );
    return false;
  }

  // Verifica se há propriedades esperadas ausentes (indica corrompimento)
  const hasValidProperties = keys.some(
    (key) => !/^\d+$/.test(key) && key.length > 1 && key !== "length",
  );

  if (!hasValidProperties && keys.length > 0) {
    console.error(
      `>>> [API_GUARD] Objeto sem propriedades válidas para ${sectionName}:`,
      obj,
    );
    return false;
  }

  return true;
};

// Função para sanitizar o payload antes de enviar para o backend
const sanitizePayload = (
  payload: Record<string, unknown>,
): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      if (validateSectionObject(value, key)) {
        sanitized[key] = value;
      } else {
        console.warn(
          `>>> [API_GUARD] Seção ${key} removida do payload por ser inválida`,
        );
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

const normalizeSectionStatePayload = (
  source: unknown,
  fallback: Record<string, unknown>,
): Record<string, unknown> => {
  const sourceRecord =
    source && typeof source === "object" && !Array.isArray(source)
      ? (source as Record<string, unknown>)
      : {};
  const fallbackRecord =
    fallback && typeof fallback === "object" && !Array.isArray(fallback)
      ? fallback
      : {};
  const sourceAppearance =
    (sourceRecord.appearance as Record<string, unknown>) || {};
  const fallbackAppearance =
    (fallbackRecord.appearance as Record<string, unknown>) || {};
  const sourceStyles = (sourceRecord.styles as Record<string, unknown>) || {};
  const fallbackStyles =
    (fallbackRecord.styles as Record<string, unknown>) || {};
  const sourceContent = (sourceRecord.content as Record<string, unknown>) || {};
  const fallbackContent =
    (fallbackRecord.content as Record<string, unknown>) || {};
  const sourceCardConfig =
    (sourceRecord.cardConfig as Record<string, unknown>) || {};
  const fallbackCardConfig =
    (fallbackRecord.cardConfig as Record<string, unknown>) || {};

  const resolvedBackgroundColor =
    sanitizeColor(
      sourceAppearance.backgroundColor ||
      sourceAppearance.background_color ||
      sourceAppearance.bgColor ||
      sourceRecord.bgColor ||
      sourceRecord.bg_color ||
      sourceRecord.backgroundColor ||
      sourceRecord.background_color ||
      sourceStyles.backgroundColor ||
      sourceStyles.background_color ||
      sourceStyles.bgColor ||
      sourceStyles.bg_color ||
      fallbackAppearance.backgroundColor ||
      fallbackAppearance.background_color ||
      fallbackAppearance.bgColor ||
      fallbackRecord.bgColor ||
      fallbackRecord.bg_color ||
      fallbackRecord.backgroundColor ||
      fallbackRecord.background_color ||
      fallbackStyles.backgroundColor ||
      fallbackStyles.background_color ||
      fallbackStyles.bgColor ||
      fallbackStyles.bg_color,
    ) || "";

  const resolvedCardBackgroundColor =
    sanitizeColor(
      sourceAppearance.cardBgColor ||
      sourceAppearance.cardBackgroundColor ||
      sourceAppearance.card_bg_color ||
      sourceAppearance.card_background_color ||
      sourceRecord.cardBgColor ||
      sourceRecord.cardBackgroundColor ||
      sourceRecord.card_bg_color ||
      sourceRecord.card_background_color ||
      sourceContent.cardBgColor ||
      sourceContent.cardBackgroundColor ||
      sourceCardConfig.backgroundColor ||
      sourceCardConfig.cardBackgroundColor ||
      sourceCardConfig.background_color ||
      sourceCardConfig.card_background_color ||
      fallbackAppearance.cardBgColor ||
      fallbackAppearance.cardBackgroundColor ||
      fallbackRecord.cardBgColor ||
      fallbackRecord.cardBackgroundColor ||
      fallbackContent.cardBgColor ||
      fallbackContent.cardBackgroundColor ||
      fallbackCardConfig.backgroundColor ||
      fallbackCardConfig.cardBackgroundColor,
    ) || "";

  const result = {
    ...fallbackRecord,
    ...sourceRecord,
    bgColor: resolvedBackgroundColor,
    backgroundColor: resolvedBackgroundColor,
    bg_color: resolvedBackgroundColor,
    background_color: resolvedBackgroundColor,
    appearance: {
      ...fallbackAppearance,
      ...sourceAppearance,
      bgColor: resolvedBackgroundColor,
      backgroundColor: resolvedBackgroundColor,
      bg_color: resolvedBackgroundColor,
      background_color: resolvedBackgroundColor,
    },
    styles: {
      ...fallbackStyles,
      ...sourceStyles,
      bgColor: resolvedBackgroundColor,
      backgroundColor: resolvedBackgroundColor,
      bg_color: resolvedBackgroundColor,
      background_color: resolvedBackgroundColor,
    },
  };

  if (resolvedCardBackgroundColor) {
    (result as any).cardBgColor = resolvedCardBackgroundColor;
    (result as any).cardBackgroundColor = resolvedCardBackgroundColor;
    (result as any).card_bg_color = resolvedCardBackgroundColor;
    (result as any).card_background_color = resolvedCardBackgroundColor;

    if (result.appearance) {
      (result.appearance as any).cardBgColor = resolvedCardBackgroundColor;
      (result.appearance as any).cardBackgroundColor =
        resolvedCardBackgroundColor;
      (result.appearance as any).card_bg_color = resolvedCardBackgroundColor;
      (result.appearance as any).card_background_color =
        resolvedCardBackgroundColor;
    }

    (result as any).cardConfig = {
      ...((result as any).cardConfig || {}),
      backgroundColor: resolvedCardBackgroundColor,
      cardBackgroundColor: resolvedCardBackgroundColor,
      background_color: resolvedCardBackgroundColor,
      card_background_color: resolvedCardBackgroundColor,
      cardBgColor: resolvedCardBackgroundColor,
      card_bg_color: resolvedCardBackgroundColor,
    };
  }

  return result;
};

export function useEditorApi({
  loadExternalConfig,
  settings,
  lastSaved,
  lastApplied,
  setters,
  setIsDirty,
  saveLocalDrafts,
  updateStudioInfo,
}: UseEditorApiParams) {
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getChangedSettings = useCallback(() => {
    const changes: Partial<SiteConfigData> = {};

    // Helper para comparação profunda simplificada para logs
    const hasChanged = (current: unknown, saved: unknown) => {
      return JSON.stringify(current) !== JSON.stringify(saved);
    };

    if (hasChanged(settings.heroSettings, lastSaved.lastSavedHero)) {
      console.log(">>> [useEditorApi] Hero mudou:", {
        currentAppearance: settings.heroSettings.appearance,
        savedAppearance: lastSaved.lastSavedHero.appearance,
      });
      changes.hero = settings.heroSettings;
    }
    if (hasChanged(settings.aboutHeroSettings, lastSaved.lastSavedAboutHero)) {
      changes.aboutHero = settings.aboutHeroSettings;
    }
    if (hasChanged(settings.storySettings, lastSaved.lastSavedStory)) {
      changes.story = settings.storySettings;
    }
    if (hasChanged(settings.teamSettings, lastSaved.lastSavedTeam)) {
      changes.team = settings.teamSettings;
    }
    if (
      hasChanged(settings.testimonialsSettings, lastSaved.lastSavedTestimonials)
    ) {
      changes.testimonials = settings.testimonialsSettings;
    }
    if (hasChanged(settings.fontSettings, lastSaved.lastSavedFont)) {
      changes.theme = settings.fontSettings;
    }
    if (hasChanged(settings.colorSettings, lastSaved.lastSavedColor)) {
      changes.colors = settings.colorSettings;
    }
    if (hasChanged(settings.servicesSettings, lastSaved.lastSavedServices)) {
      const servicesBg =
        sanitizeColor(
          settings.servicesSettings.appearance?.backgroundColor ||
          settings.servicesSettings.bgColor,
        ) || "";

      const cardBg =
        sanitizeColor(
          settings.servicesSettings.cardBgColor ||
          settings.servicesSettings.appearance?.cardBackgroundColor ||
          settings.servicesSettings.appearance?.cardBgColor,
        ) || "";

      const cardIconColor =
        sanitizeColor(
          settings.servicesSettings.cardIconColor ||
          settings.servicesSettings.appearance?.cardIconColor,
        ) || "";

      const cardTitleColor =
        sanitizeColor(
          settings.servicesSettings.cardTitleColor ||
          settings.servicesSettings.appearance?.cardTitleColor,
        ) || "";

      const cardDescriptionColor =
        sanitizeColor(
          settings.servicesSettings.cardDescriptionColor ||
          settings.servicesSettings.appearance?.cardDescriptionColor,
        ) || "";

      const cardPriceColor =
        sanitizeColor(
          settings.servicesSettings.cardPriceColor ||
          settings.servicesSettings.appearance?.cardPriceColor,
        ) || "";

      const cardConfig = {
        backgroundColor: cardBg,
        cardBackgroundColor: cardBg,
        background_color: cardBg,
        card_background_color: cardBg,
        cardBgColor: cardBg,
        card_bg_color: cardBg,
        iconColor: cardIconColor,
        cardIconColor: cardIconColor,
        titleColor: cardTitleColor,
        cardTitleColor: cardTitleColor,
        descriptionColor: cardDescriptionColor,
        cardDescriptionColor: cardDescriptionColor,
        priceColor: cardPriceColor,
        cardPriceColor: cardPriceColor,
      };
      const servicesAppearance: Record<string, unknown> = {
        ...settings.servicesSettings.appearance,
        cardConfig,
        ...(servicesBg
          ? {
            backgroundColor: servicesBg,
            bgType: "color",
            backgroundImageUrl: "",
          }
          : {}),
        ...(cardBg ? { cardBgColor: cardBg, cardBackgroundColor: cardBg } : {}),
        ...(cardIconColor ? { cardIconColor } : {}),
      };

      const servicesPayload: Record<string, unknown> = {
        ...settings.servicesSettings,
        cardConfig,
        ...(servicesBg
          ? {
            bgType: "color",
            bgColor: servicesBg,
            backgroundColor: servicesBg,
            bgImage: "",
          }
          : {}),
        appearance:
          servicesAppearance as typeof settings.servicesSettings.appearance,
      };
      changes.services = servicesPayload as SiteConfigData["services"];
    }
    if (
      hasChanged(settings.homeValuesSettings, lastSaved.lastSavedHomeValues)
    ) {
      const homeValuesLegacyBg = (
        settings.homeValuesSettings as Record<string, unknown>
      ).values_bg as string | undefined;
      const homeValuesLegacyAboutBg = (
        settings.homeValuesSettings as Record<string, unknown>
      ).about_values_bg as string | undefined;

      const homeValuesBg =
        sanitizeColor(
          settings.homeValuesSettings.appearance?.backgroundColor ||
          settings.homeValuesSettings.bgColor ||
          homeValuesLegacyBg ||
          homeValuesLegacyAboutBg,
        ) || "";

      const homeValuesCardBg =
        sanitizeColor(
          settings.homeValuesSettings.cardBgColor ||
          settings.homeValuesSettings.appearance?.cardBackgroundColor ||
          settings.homeValuesSettings.appearance?.cardBgColor,
        ) || "";

      const titleColor =
        sanitizeColor(
          settings.homeValuesSettings.titleColor ||
          settings.homeValuesSettings.appearance?.titleColor,
        ) || "";

      const subtitleColor =
        sanitizeColor(
          settings.homeValuesSettings.subtitleColor ||
          settings.homeValuesSettings.appearance?.subtitleColor,
        ) || "";

      const cardTitleColor =
        sanitizeColor(
          settings.homeValuesSettings.cardTitleColor ||
          settings.homeValuesSettings.appearance?.cardTitleColor,
        ) || "";

      const cardDescriptionColor =
        sanitizeColor(
          settings.homeValuesSettings.cardDescriptionColor ||
          settings.homeValuesSettings.appearance?.cardDescriptionColor,
        ) || "";

      const cardIconColor =
        sanitizeColor(
          settings.homeValuesSettings.cardIconColor ||
          settings.homeValuesSettings.appearance?.cardIconColor,
        ) || "";

      const cardConfig = {
        backgroundColor: homeValuesCardBg,
        cardBackgroundColor: homeValuesCardBg,
        cardBgColor: homeValuesCardBg,
        titleColor: cardTitleColor,
        cardTitleColor: cardTitleColor,
        descriptionColor: cardDescriptionColor,
        cardDescriptionColor: cardDescriptionColor,
        iconColor: cardIconColor,
        cardIconColor: cardIconColor,
      };

      changes.homeValuesSettings = {
        ...settings.homeValuesSettings,
        ...(homeValuesBg
          ? {
            bgType: "color",
            bgColor: homeValuesBg,
            backgroundColor: homeValuesBg,
            bgImage: "",
          }
          : {}),
        ...(homeValuesCardBg
          ? {
            cardBgColor: homeValuesCardBg,
            cardBackgroundColor: homeValuesCardBg,
          }
          : {}),
        titleColor,
        subtitleColor,
        cardTitleColor,
        cardDescriptionColor,
        cardIconColor,
        appearance: {
          ...settings.homeValuesSettings.appearance,
          ...(homeValuesBg
            ? {
              backgroundColor: homeValuesBg,
              bgType: "color",
              backgroundImageUrl: "",
            }
            : {}),
          ...(homeValuesCardBg
            ? {
              cardBgColor: homeValuesCardBg,
              cardBackgroundColor: homeValuesCardBg,
            }
            : {}),
          titleColor,
          subtitleColor,
          cardTitleColor,
          cardDescriptionColor,
          cardIconColor,
        },
      };
      (changes.homeValuesSettings as Record<string, unknown>).cardConfig =
        cardConfig;
      (changes.homeValuesSettings as Record<string, unknown>).values_bg =
        homeValuesBg;
      (changes.homeValuesSettings as Record<string, unknown>).about_values_bg =
        homeValuesBg;
    }
    if (
      hasChanged(
        settings.aboutUsValuesSettings,
        lastSaved.lastSavedAboutUsValues,
      )
    ) {
      const aboutValuesLegacyBg = (
        settings.aboutUsValuesSettings as Record<string, unknown>
      ).about_values_bg as string | undefined;
      const aboutValuesLegacyValuesBg = (
        settings.aboutUsValuesSettings as Record<string, unknown>
      ).values_bg as string | undefined;

      const aboutValuesBg =
        sanitizeColor(
          settings.aboutUsValuesSettings.appearance?.backgroundColor ||
          settings.aboutUsValuesSettings.bgColor ||
          aboutValuesLegacyBg ||
          aboutValuesLegacyValuesBg,
        ) || "";

      const aboutValuesCardBg =
        sanitizeColor(
          settings.aboutUsValuesSettings.cardBgColor ||
          settings.aboutUsValuesSettings.appearance?.cardBackgroundColor ||
          settings.aboutUsValuesSettings.appearance?.cardBgColor,
        ) || "";

      const titleColor =
        sanitizeColor(
          settings.aboutUsValuesSettings.titleColor ||
          settings.aboutUsValuesSettings.appearance?.titleColor,
        ) || "";

      const subtitleColor =
        sanitizeColor(
          settings.aboutUsValuesSettings.subtitleColor ||
          settings.aboutUsValuesSettings.appearance?.subtitleColor,
        ) || "";

      const cardTitleColor =
        sanitizeColor(
          settings.aboutUsValuesSettings.cardTitleColor ||
          settings.aboutUsValuesSettings.appearance?.cardTitleColor,
        ) || "";

      const cardDescriptionColor =
        sanitizeColor(
          settings.aboutUsValuesSettings.cardDescriptionColor ||
          settings.aboutUsValuesSettings.appearance?.cardDescriptionColor,
        ) || "";

      const cardIconColor =
        sanitizeColor(
          settings.aboutUsValuesSettings.cardIconColor ||
          settings.aboutUsValuesSettings.appearance?.cardIconColor,
        ) || "";

      const cardConfig = {
        backgroundColor: aboutValuesCardBg,
        cardBackgroundColor: aboutValuesCardBg,
        cardBgColor: aboutValuesCardBg,
        titleColor: cardTitleColor,
        cardTitleColor: cardTitleColor,
        descriptionColor: cardDescriptionColor,
        cardDescriptionColor: cardDescriptionColor,
        iconColor: cardIconColor,
        cardIconColor: cardIconColor,
      };

      changes.aboutUsValuesSettings = {
        ...settings.aboutUsValuesSettings,
        ...(aboutValuesBg
          ? {
            bgType: "color",
            bgColor: aboutValuesBg,
            backgroundColor: aboutValuesBg,
            bgImage: "",
          }
          : {}),
        ...(aboutValuesCardBg
          ? {
            cardBgColor: aboutValuesCardBg,
            cardBackgroundColor: aboutValuesCardBg,
          }
          : {}),
        titleColor,
        subtitleColor,
        cardTitleColor,
        cardDescriptionColor,
        cardIconColor,
        appearance: {
          ...settings.aboutUsValuesSettings.appearance,
          ...(aboutValuesBg
            ? {
              backgroundColor: aboutValuesBg,
              bgType: "color",
              backgroundImageUrl: "",
            }
            : {}),
          ...(aboutValuesCardBg
            ? {
              cardBgColor: aboutValuesCardBg,
              cardBackgroundColor: aboutValuesCardBg,
            }
            : {}),
          titleColor,
          subtitleColor,
          cardTitleColor,
          cardDescriptionColor,
          cardIconColor,
        },
      };
      (changes.aboutUsValuesSettings as Record<string, unknown>).cardConfig =
        cardConfig;
      (changes.aboutUsValuesSettings as Record<string, unknown>).values_bg =
        aboutValuesBg;
      (
        changes.aboutUsValuesSettings as Record<string, unknown>
      ).about_values_bg = aboutValuesBg;
    }
    if (hasChanged(settings.gallerySettings, lastSaved.lastSavedGallery)) {
      const galleryBg =
        sanitizeColor(
          settings.gallerySettings.appearance?.backgroundColor ||
          settings.gallerySettings.bgColor ||
          (settings.gallerySettings as any).backgroundColor ||
          (settings.gallerySettings as any).bg_color,
        ) || "";

      const cardBg =
        sanitizeColor(
          settings.gallerySettings.cardBgColor ||
          (settings.gallerySettings as any).cardBackgroundColor ||
          (settings.gallerySettings as any).card_background_color ||
          settings.gallerySettings.appearance?.cardBackgroundColor ||
          settings.gallerySettings.appearance?.cardBgColor,
        ) || "";

      const galleryAppearance = {
        ...settings.gallerySettings.appearance,
        ...(galleryBg
          ? {
            backgroundColor: galleryBg,
            bgColor: galleryBg,
            bgType: "color",
            backgroundImageUrl: "",
          }
          : {}),
        ...(cardBg
          ? {
            cardBgColor: cardBg,
            cardBackgroundColor: cardBg,
          }
          : {}),
      };

      changes.galleryPreviewSettings = {
        ...settings.gallerySettings,
        ...(galleryBg
          ? {
            bgType: "color",
            bgColor: galleryBg,
            backgroundColor: galleryBg,
            bg_color: galleryBg,
            background_color: galleryBg,
            bgImage: "",
          }
          : {}),
        ...(cardBg
          ? {
            cardBgColor: cardBg,
            cardBackgroundColor: cardBg,
            card_bg_color: cardBg,
            card_background_color: cardBg,
          }
          : {}),
        appearance:
          galleryAppearance as typeof settings.gallerySettings.appearance,
      };
    }
    if (
      hasChanged(settings.galleryPageSettings, lastSaved.lastSavedGalleryPage)
    ) {
      const galleryPageBg =
        sanitizeColor(
          settings.galleryPageSettings.appearance?.backgroundColor ||
          settings.galleryPageSettings.bgColor ||
          (settings.galleryPageSettings as any).backgroundColor ||
          (settings.galleryPageSettings as any).bg_color,
        ) || "";

      const galleryPageAppearance = {
        ...settings.galleryPageSettings.appearance,
        ...(galleryPageBg
          ? {
            backgroundColor: galleryPageBg,
            bgColor: galleryPageBg,
            bgType: "color",
            backgroundImageUrl: "",
          }
          : {}),
      };

      changes.galleryPageSettings = {
        ...settings.galleryPageSettings,
        ...(galleryPageBg
          ? {
            bgType: "color",
            bgColor: galleryPageBg,
            backgroundColor: galleryPageBg,
            bg_color: galleryPageBg,
            background_color: galleryPageBg,
            bgImage: "",
          }
          : {}),
        appearance:
          galleryPageAppearance as typeof settings.galleryPageSettings.appearance,
      };
    }
    if (hasChanged(settings.ctaSettings, lastSaved.lastSavedCTA)) {
      changes.cta = settings.ctaSettings;
    }
    if (
      JSON.stringify(settings.headerSettings) !==
      JSON.stringify(lastSaved.lastSavedHeader)
    ) {
      changes.header = settings.headerSettings;
    }
    if (
      JSON.stringify(settings.footerSettings) !==
      JSON.stringify(lastSaved.lastSavedFooter)
    ) {
      changes.footer = settings.footerSettings;
    }

    if (
      JSON.stringify(settings.pageVisibility) !==
      JSON.stringify(lastSaved.lastSavedPageVisibility)
    ) {
      changes.pageVisibility = settings.pageVisibility;
    }
    if (
      JSON.stringify(settings.visibleSections) !==
      JSON.stringify(lastSaved.lastSavedVisibleSections)
    ) {
      changes.visibleSections = settings.visibleSections;
    }

    const bookingChanges: SiteConfigData["bookingSteps"] = {};

    const processBookingStep = (
      current: BookingStepSettings,
      saved: BookingStepSettings,
    ) => {
      if (JSON.stringify(current) === JSON.stringify(saved)) return undefined;
      const currentRecord = current as Record<string, unknown>;
      const currentAppearance =
        (current.appearance as Record<string, unknown> | undefined) || {};
      const currentCardConfig =
        (currentRecord.cardConfig as Record<string, unknown> | undefined) || {};

      const bg =
        sanitizeColor(
          current.appearance?.backgroundColor ||
          current.bgColor ||
          currentRecord.backgroundColor,
        ) || "";

      const cardBg =
        sanitizeColor(
          current.cardBgColor ||
          currentRecord.card_bg_color ||
          currentRecord.cardBackgroundColor ||
          currentRecord.card_background_color ||
          current.appearance?.cardBackgroundColor ||
          current.appearance?.cardBgColor ||
          currentAppearance.card_background_color ||
          currentAppearance.card_bg_color ||
          currentCardConfig.cardBgColor ||
          currentCardConfig.cardBackgroundColor ||
          currentCardConfig.backgroundColor ||
          currentCardConfig.card_bg_color ||
          currentCardConfig.card_background_color ||
          currentCardConfig.background_color,
        ) || "";

      const cardConfig = {
        ...currentCardConfig,
        backgroundColor: cardBg,
        cardBackgroundColor: cardBg,
        background_color: cardBg,
        card_background_color: cardBg,
        cardBgColor: cardBg,
        card_bg_color: cardBg,
      };

      const processed = {
        ...current,
        cardBgColor: cardBg,
        card_bg_color: cardBg,
        cardBackgroundColor: cardBg,
        card_background_color: cardBg,
        cardConfig,
        ...(bg
          ? {
            bgType: "color",
            bgColor: bg,
            backgroundColor: bg,
            bgImage: "",
          }
          : {}),
        appearance: {
          ...current.appearance,
          cardBgColor: cardBg,
          cardBackgroundColor: cardBg,
          card_bg_color: cardBg,
          card_background_color: cardBg,
          cardConfig,
          ...(bg
            ? {
              backgroundColor: bg,
              bgType: "color",
              backgroundImageUrl: "",
            }
            : {}),
        },
        content: {
          ...((currentRecord.content as
            | Record<string, unknown>
            | undefined) || {}),
          cardBgColor: cardBg,
          cardBackgroundColor: cardBg,
          card_bg_color: cardBg,
          card_background_color: cardBg,
          cardConfig,
        },
      };

      return processed as BookingStepSettings;
    };

    const serviceProcessed = processBookingStep(
      settings.bookingServiceSettings,
      lastSaved.lastSavedBookingService,
    );
    if (serviceProcessed) bookingChanges.service = serviceProcessed;

    const dateProcessed = processBookingStep(
      settings.bookingDateSettings,
      lastSaved.lastSavedBookingDate,
    );
    if (dateProcessed) bookingChanges.date = dateProcessed;

    const timeProcessed = processBookingStep(
      settings.bookingTimeSettings,
      lastSaved.lastSavedBookingTime,
    );
    if (timeProcessed) bookingChanges.time = timeProcessed;

    const formProcessed = processBookingStep(
      settings.bookingFormSettings,
      lastSaved.lastSavedBookingForm,
    );
    if (formProcessed) bookingChanges.form = formProcessed;

    const confirmationProcessed = processBookingStep(
      settings.bookingConfirmationSettings,
      lastSaved.lastSavedBookingConfirmation,
    );
    if (confirmationProcessed)
      bookingChanges.confirmation = confirmationProcessed;

    if (Object.keys(bookingChanges).length > 0) {
      changes.bookingSteps = bookingChanges;
    }

    return changes;
  }, [lastSaved, settings]);

  const handleSaveLocal = useCallback(
    (skipEvent = false) => {
      saveLocalDrafts({
        heroSettings: settings.heroSettings,
        aboutHeroSettings: settings.aboutHeroSettings,
        storySettings: settings.storySettings,
        teamSettings: settings.teamSettings,
        testimonialsSettings: settings.testimonialsSettings,
        fontSettings: settings.fontSettings,
        colorSettings: settings.colorSettings,
        servicesSettings: settings.servicesSettings,
        homeValuesSettings: settings.homeValuesSettings,
        aboutUsValuesSettings: settings.aboutUsValuesSettings,
        gallerySettings: settings.gallerySettings,
        galleryPageSettings: settings.galleryPageSettings,
        ctaSettings: settings.ctaSettings,
        headerSettings: settings.headerSettings,
        footerSettings: settings.footerSettings,
        bookingServiceSettings: settings.bookingServiceSettings,
        bookingDateSettings: settings.bookingDateSettings,
        bookingTimeSettings: settings.bookingTimeSettings,
        bookingFormSettings: settings.bookingFormSettings,
        bookingConfirmationSettings: settings.bookingConfirmationSettings,
        pageVisibility: settings.pageVisibility,
        visibleSections: settings.visibleSections,
      });

      // Dispara um evento para notificar outros hooks que o localStorage mudou
      if (!skipEvent && typeof window !== "undefined") {
        window.dispatchEvent(new Event("local_draft_changed"));
      }
    },
    [saveLocalDrafts, settings],
  );

  const hasUnsavedGlobalChanges = useMemo(() => {
    const heroChanged =
      JSON.stringify(lastApplied.lastAppliedHero) !==
      JSON.stringify(lastSaved.lastSavedHero);
    const aboutHeroChanged =
      JSON.stringify(lastApplied.lastAppliedAboutHero) !==
      JSON.stringify(lastSaved.lastSavedAboutHero);
    const storyChanged =
      JSON.stringify(lastApplied.lastAppliedStory) !==
      JSON.stringify(lastSaved.lastSavedStory);
    const teamChanged =
      JSON.stringify(lastApplied.lastAppliedTeam) !==
      JSON.stringify(lastSaved.lastSavedTeam);
    const testimonialsChanged =
      JSON.stringify(lastApplied.lastAppliedTestimonials) !==
      JSON.stringify(lastSaved.lastSavedTestimonials);
    const fontChanged =
      JSON.stringify(lastApplied.lastAppliedFont) !==
      JSON.stringify(lastSaved.lastSavedFont);
    const colorChanged =
      JSON.stringify(lastApplied.lastAppliedColor) !==
      JSON.stringify(lastSaved.lastSavedColor);
    const servicesChanged =
      JSON.stringify(lastApplied.lastAppliedServices) !==
      JSON.stringify(lastSaved.lastSavedServices);
    const homeValuesChanged =
      JSON.stringify(lastApplied.lastAppliedHomeValues) !==
      JSON.stringify(lastSaved.lastSavedHomeValues);
    const aboutUsValuesChanged =
      JSON.stringify(lastApplied.lastAppliedAboutUsValues) !==
      JSON.stringify(lastSaved.lastSavedAboutUsValues);
    const galleryChanged =
      JSON.stringify(lastApplied.lastAppliedGallery) !==
      JSON.stringify(lastSaved.lastSavedGallery);
    const galleryPageChanged =
      JSON.stringify(lastApplied.lastAppliedGalleryPage) !==
      JSON.stringify(lastSaved.lastSavedGalleryPage);
    const ctaChanged =
      JSON.stringify(lastApplied.lastAppliedCTA) !==
      JSON.stringify(lastSaved.lastSavedCTA);
    const headerChanged =
      JSON.stringify(lastApplied.lastAppliedHeader) !==
      JSON.stringify(lastSaved.lastSavedHeader);
    const footerChanged =
      JSON.stringify(lastApplied.lastAppliedFooter) !==
      JSON.stringify(lastSaved.lastSavedFooter);

    const bookingServiceChanged =
      JSON.stringify(lastApplied.lastAppliedBookingService) !==
      JSON.stringify(lastSaved.lastSavedBookingService);
    const bookingDateChanged =
      JSON.stringify(lastApplied.lastAppliedBookingDate) !==
      JSON.stringify(lastSaved.lastSavedBookingDate);
    const bookingTimeChanged =
      JSON.stringify(lastApplied.lastAppliedBookingTime) !==
      JSON.stringify(lastSaved.lastSavedBookingTime);
    const bookingFormChanged =
      JSON.stringify(lastApplied.lastAppliedBookingForm) !==
      JSON.stringify(lastSaved.lastSavedBookingForm);
    const bookingConfirmationChanged =
      JSON.stringify(lastApplied.lastAppliedBookingConfirmation) !==
      JSON.stringify(lastSaved.lastSavedBookingConfirmation);

    const pageVisibilityChanged =
      JSON.stringify(settings.pageVisibility) !==
      JSON.stringify(lastSaved.lastSavedPageVisibility);
    const visibleSectionsChanged =
      JSON.stringify(settings.visibleSections) !==
      JSON.stringify(lastSaved.lastSavedVisibleSections);

    return [
      heroChanged,
      aboutHeroChanged,
      storyChanged,
      teamChanged,
      testimonialsChanged,
      fontChanged,
      colorChanged,
      servicesChanged,
      homeValuesChanged,
      aboutUsValuesChanged,
      galleryChanged,
      galleryPageChanged,
      ctaChanged,
      headerChanged,
      footerChanged,
      bookingServiceChanged,
      bookingDateChanged,
      bookingTimeChanged,
      bookingFormChanged,
      bookingConfirmationChanged,
      pageVisibilityChanged,
      visibleSectionsChanged,
    ].some(Boolean);
  }, [
    lastApplied,
    lastSaved,
    settings.pageVisibility,
    settings.visibleSections,
  ]);

  useEffect(() => {
    return () => {
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchCustomization = useCallback(
    async (id: string) => {
      // Cancela busca anterior se houver
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
      const controller = new AbortController();
      fetchAbortControllerRef.current = controller;

      setCompanyId(id);
      setIsFetching(true);
      setFetchError(null);
      try {
        const data = await siteCustomizerService.getDraftCustomization(
          id,
          controller.signal,
        );
        if (data) {
          const normalized = normalizePayload(data);
          loadExternalConfig(normalized);
          return normalized;
        }
        return null;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log(">>> [useEditorApi] Busca de customização cancelada.");
          return null;
        }
        console.warn(">>> [ADMIN_WARN] Falha ao buscar customização:", err);
        setFetchError("Falha ao carregar configurações do site.");
        return null;
      } finally {
        if (fetchAbortControllerRef.current === controller) {
          setIsFetching(false);
          fetchAbortControllerRef.current = null;
        }
      }
    },
    [loadExternalConfig],
  );

  const handleSaveGlobal = useCallback(
    async (shouldReload = true) => {
      if (isPublishing && shouldReload) {
        console.log(
          ">>> [useEditorApi] Ignorando save global durante publicação...",
        );
        return;
      }
      console.log(">>> [useEditorApi] Iniciando salvamento global...");

      const sanitizeSectionData = <T>(current: T, fallback: T) =>
        sanitizeSection(current, fallback) as T;

      const sanitizedHero = sanitizeSectionData(
        settings.heroSettings,
        lastSaved.lastSavedHero,
      );
      const sanitizedAboutHero = sanitizeSectionData(
        settings.aboutHeroSettings,
        lastSaved.lastSavedAboutHero,
      );
      const sanitizedStory = sanitizeSectionData(
        settings.storySettings,
        lastSaved.lastSavedStory,
      );
      const sanitizedTeam = sanitizeSectionData(
        settings.teamSettings,
        lastSaved.lastSavedTeam,
      );
      const sanitizedTestimonials = sanitizeSectionData(
        settings.testimonialsSettings,
        lastSaved.lastSavedTestimonials,
      );
      const sanitizedServicesDraft = sanitizeSectionData(
        settings.servicesSettings,
        lastSaved.lastSavedServices,
      );
      const sanitizedServicesRecord = sanitizedServicesDraft as Record<
        string,
        unknown
      >;
      const servicesAppearance =
        (sanitizedServicesRecord.appearance as
          | Record<string, unknown>
          | undefined) || {};
      const servicesContent =
        (sanitizedServicesRecord.content as
          | Record<string, unknown>
          | undefined) || {};
      const servicesCardConfig =
        (sanitizedServicesRecord.cardConfig as
          | Record<string, unknown>
          | undefined) || {};
      const resolvedServicesBgColor =
        sanitizeColor(
          (servicesAppearance.backgroundColor as string) ||
          (servicesAppearance.bgColor as string) ||
          (sanitizedServicesRecord.bgColor as string) ||
          (sanitizedServicesRecord.backgroundColor as string),
        ) || "";
      const resolvedServicesCardBg =
        sanitizeColor(
          (sanitizedServicesRecord.cardBgColor as string) ||
          (sanitizedServicesRecord.cardBackgroundColor as string) ||
          (sanitizedServicesRecord.card_background_color as string) ||
          (servicesCardConfig.backgroundColor as string) ||
          (servicesCardConfig.cardBackgroundColor as string) ||
          (servicesCardConfig.cardBgColor as string) ||
          (servicesContent.cardBgColor as string) ||
          (servicesContent.cardBackgroundColor as string) ||
          (servicesAppearance.cardBgColor as string) ||
          (servicesAppearance.cardBackgroundColor as string),
        ) || "";
      const resolvedServicesCardTitleColor =
        sanitizeColor(
          (sanitizedServicesRecord.cardTitleColor as string) ||
          (servicesCardConfig.titleColor as string) ||
          (servicesCardConfig.cardTitleColor as string) ||
          (servicesContent.titleColor as string) ||
          (servicesContent.cardTitleColor as string) ||
          (servicesAppearance.cardTitleColor as string),
        ) || "";
      const resolvedServicesCardDescriptionColor =
        sanitizeColor(
          (sanitizedServicesRecord.cardDescriptionColor as string) ||
          (servicesCardConfig.descriptionColor as string) ||
          (servicesCardConfig.cardDescriptionColor as string) ||
          (servicesContent.descriptionColor as string) ||
          (servicesContent.cardDescriptionColor as string) ||
          (servicesAppearance.cardDescriptionColor as string),
        ) || "";
      const resolvedServicesCardPriceColor =
        sanitizeColor(
          (sanitizedServicesRecord.cardPriceColor as string) ||
          (servicesCardConfig.priceColor as string) ||
          (servicesCardConfig.cardPriceColor as string) ||
          (servicesContent.priceColor as string) ||
          (servicesContent.cardPriceColor as string) ||
          (servicesAppearance.cardPriceColor as string),
        ) || "";
      const resolvedServicesCardIconColor =
        sanitizeColor(
          (sanitizedServicesRecord.cardIconColor as string) ||
          (servicesCardConfig.iconColor as string) ||
          (servicesCardConfig.cardIconColor as string) ||
          (servicesContent.iconColor as string) ||
          (servicesContent.cardIconColor as string) ||
          (servicesAppearance.cardIconColor as string),
        ) || "";
      const sanitizedServices = {
        ...sanitizedServicesDraft,
        bgColor: resolvedServicesBgColor,
        backgroundColor: resolvedServicesBgColor,
        cardBgColor: resolvedServicesCardBg,
        cardBackgroundColor: resolvedServicesCardBg,
        card_background_color: resolvedServicesCardBg,
        cardTitleColor: resolvedServicesCardTitleColor,
        cardDescriptionColor: resolvedServicesCardDescriptionColor,
        cardPriceColor: resolvedServicesCardPriceColor,
        cardIconColor: resolvedServicesCardIconColor,
        cardConfig: {
          ...servicesCardConfig,
          backgroundColor: resolvedServicesCardBg,
          cardBackgroundColor: resolvedServicesCardBg,
          background_color: resolvedServicesCardBg,
          card_background_color: resolvedServicesCardBg,
          cardBgColor: resolvedServicesCardBg,
          card_bg_color: resolvedServicesCardBg,
          titleColor: resolvedServicesCardTitleColor,
          cardTitleColor: resolvedServicesCardTitleColor,
          descriptionColor: resolvedServicesCardDescriptionColor,
          cardDescriptionColor: resolvedServicesCardDescriptionColor,
          priceColor: resolvedServicesCardPriceColor,
          cardPriceColor: resolvedServicesCardPriceColor,
          iconColor: resolvedServicesCardIconColor,
          cardIconColor: resolvedServicesCardIconColor,
        },
        content: {
          ...servicesContent,
          cardBgColor: resolvedServicesCardBg,
          cardBackgroundColor: resolvedServicesCardBg,
          card_bg_color: resolvedServicesCardBg,
          card_background_color: resolvedServicesCardBg,
          cardTitleColor: resolvedServicesCardTitleColor,
          cardDescriptionColor: resolvedServicesCardDescriptionColor,
          cardPriceColor: resolvedServicesCardPriceColor,
          cardIconColor: resolvedServicesCardIconColor,
        },
        appearance: {
          ...servicesAppearance,
          backgroundColor: resolvedServicesBgColor,
          bgColor: resolvedServicesBgColor,
          cardBgColor: resolvedServicesCardBg,
          cardBackgroundColor: resolvedServicesCardBg,
          cardTitleColor: resolvedServicesCardTitleColor,
          cardDescriptionColor: resolvedServicesCardDescriptionColor,
          cardPriceColor: resolvedServicesCardPriceColor,
          cardIconColor: resolvedServicesCardIconColor,
        },
      };
      const sanitizedHomeValues = sanitizeSectionData(
        settings.homeValuesSettings,
        lastSaved.lastSavedHomeValues,
      );
      const sanitizedAboutUsValues = sanitizeSectionData(
        settings.aboutUsValuesSettings,
        lastSaved.lastSavedAboutUsValues,
      );
      const normalizeValuesAppearance = (section: Record<string, unknown>) => {
        const appearance =
          (section.appearance as Record<string, unknown> | undefined) || {};
        const content =
          (section.content as Record<string, unknown> | undefined) || {};
        const cardConfig =
          (section.cardConfig as Record<string, unknown> | undefined) || {};
        const backgroundColor =
          sanitizeColor(
            (appearance.backgroundColor as string) ||
            (appearance.bgColor as string) ||
            (section.backgroundColor as string) ||
            (section.bgColor as string) ||
            (section.values_bg as string) ||
            (section.about_values_bg as string),
          ) || "";
        const cardBackgroundColor =
          sanitizeColor(
            (section.cardBgColor as string) ||
            (section.cardBackgroundColor as string) ||
            (appearance.cardBgColor as string) ||
            (appearance.cardBackgroundColor as string) ||
            (content.cardBgColor as string) ||
            (content.cardBackgroundColor as string) ||
            (cardConfig.backgroundColor as string) ||
            (cardConfig.cardBackgroundColor as string) ||
            (cardConfig.cardBgColor as string),
          ) || "";
        const titleColor =
          sanitizeColor(
            (section.titleColor as string) ||
            (appearance.titleColor as string) ||
            (content.titleColor as string),
          ) || "";
        const subtitleColor =
          sanitizeColor(
            (section.subtitleColor as string) ||
            (appearance.subtitleColor as string) ||
            (content.subtitleColor as string),
          ) || "";
        const cardTitleColor =
          sanitizeColor(
            (section.cardTitleColor as string) ||
            (appearance.cardTitleColor as string) ||
            (content.cardTitleColor as string) ||
            (cardConfig.titleColor as string) ||
            (cardConfig.cardTitleColor as string),
          ) || "";
        const cardDescriptionColor =
          sanitizeColor(
            (section.cardDescriptionColor as string) ||
            (appearance.cardDescriptionColor as string) ||
            (content.cardDescriptionColor as string) ||
            (cardConfig.descriptionColor as string) ||
            (cardConfig.cardDescriptionColor as string),
          ) || "";
        const cardIconColor =
          sanitizeColor(
            (section.cardIconColor as string) ||
            (appearance.cardIconColor as string) ||
            (content.cardIconColor as string) ||
            (cardConfig.iconColor as string) ||
            (cardConfig.cardIconColor as string),
          ) || "";
        return {
          ...section,
          bgColor: backgroundColor,
          backgroundColor,
          values_bg:
            (section.values_bg as string | undefined) ?? backgroundColor,
          about_values_bg:
            (section.about_values_bg as string | undefined) ?? backgroundColor,
          cardBgColor: cardBackgroundColor,
          cardBackgroundColor: cardBackgroundColor,
          titleColor,
          subtitleColor,
          cardTitleColor,
          cardDescriptionColor,
          cardIconColor,
          cardConfig: {
            ...cardConfig,
            backgroundColor: cardBackgroundColor,
            cardBackgroundColor: cardBackgroundColor,
            cardBgColor: cardBackgroundColor,
            titleColor: cardTitleColor,
            cardTitleColor: cardTitleColor,
            descriptionColor: cardDescriptionColor,
            cardDescriptionColor: cardDescriptionColor,
            iconColor: cardIconColor,
            cardIconColor: cardIconColor,
          },
          appearance: {
            ...appearance,
            backgroundColor,
            bgColor: backgroundColor,
            cardBgColor: cardBackgroundColor,
            cardBackgroundColor: cardBackgroundColor,
            titleColor,
            subtitleColor,
            cardTitleColor,
            cardDescriptionColor,
            cardIconColor,
          },
          content: {
            ...content,
            cardBgColor: cardBackgroundColor,
            cardBackgroundColor: cardBackgroundColor,
            titleColor,
            subtitleColor,
            cardTitleColor,
            cardDescriptionColor,
            cardIconColor,
          },
        };
      };
      const normalizedHomeValues =
        normalizeValuesAppearance(sanitizedHomeValues);
      const normalizedAboutUsValues = normalizeValuesAppearance(
        sanitizedAboutUsValues,
      );
      const sanitizedGalleryPreview = sanitizeSectionData(
        settings.gallerySettings,
        lastSaved.lastSavedGallery,
      );
      const sanitizedGalleryPage = sanitizeSectionData(
        settings.galleryPageSettings,
        lastSaved.lastSavedGalleryPage,
      );
      const sanitizedCta = sanitizeSectionData(
        settings.ctaSettings,
        lastSaved.lastSavedCTA,
      );
      const sanitizedHeader = sanitizeSectionData(
        settings.headerSettings,
        lastSaved.lastSavedHeader,
      );
      const sanitizedFooter = sanitizeSectionData(
        settings.footerSettings,
        lastSaved.lastSavedFooter,
      );

      const sanitizedBookingSteps = {
        service: sanitizeSectionData(
          settings.bookingServiceSettings,
          lastSaved.lastSavedBookingService,
        ),
        date: sanitizeSectionData(
          settings.bookingDateSettings,
          lastSaved.lastSavedBookingDate,
        ),
        time: sanitizeSectionData(
          settings.bookingTimeSettings,
          lastSaved.lastSavedBookingTime,
        ),
        form: sanitizeSectionData(
          settings.bookingFormSettings,
          lastSaved.lastSavedBookingForm,
        ),
        confirmation: sanitizeSectionData(
          settings.bookingConfirmationSettings,
          lastSaved.lastSavedBookingConfirmation,
        ),
      };

      const normalizedBookingSteps = {
        service: normalizeStepSettings(
          sanitizedBookingSteps.service as Record<string, unknown>,
          settings.bookingServiceSettings,
        ),
        date: normalizeStepSettings(
          sanitizedBookingSteps.date as Record<string, unknown>,
          settings.bookingDateSettings,
        ),
        time: normalizeStepSettings(
          sanitizedBookingSteps.time as Record<string, unknown>,
          settings.bookingTimeSettings,
        ),
        form: normalizeStepSettings(
          sanitizedBookingSteps.form as Record<string, unknown>,
          settings.bookingFormSettings,
        ),
        confirmation: normalizeStepSettings(
          sanitizedBookingSteps.confirmation as Record<string, unknown>,
          settings.bookingConfirmationSettings,
        ),
      };

      const cleanBookingSteps = normalizePersistenceData(
        normalizedBookingSteps,
      ) as Record<string, BookingStepSettings>;

      const galleryBackgroundColor =
        sanitizedGalleryPreview.appearance?.backgroundColor ||
        sanitizedGalleryPreview.bgColor ||
        "";
      const rawGalleryStyles = (
        sanitizedGalleryPreview as Record<string, unknown>
      ).styles as Record<string, unknown> | undefined;
      const gallerySectionPayload = {
        ...sanitizedGalleryPreview,
        bgColor: galleryBackgroundColor,
        backgroundColor: galleryBackgroundColor,
        bg_color: galleryBackgroundColor,
        background_color: galleryBackgroundColor,
        styles: {
          ...(rawGalleryStyles && typeof rawGalleryStyles === "object"
            ? rawGalleryStyles
            : {}),
          backgroundColor: galleryBackgroundColor,
          bgColor: galleryBackgroundColor,
          bg_color: galleryBackgroundColor,
          background_color: galleryBackgroundColor,
        },
      };
      const galleryPageBackgroundColor =
        sanitizeColor(
          sanitizedGalleryPage.appearance?.backgroundColor ||
          sanitizedGalleryPage.bgColor ||
          ((sanitizedGalleryPage as Record<string, unknown>)
            .backgroundColor as string | undefined) ||
          ((sanitizedGalleryPage as Record<string, unknown>).bg_color as
            | string
            | undefined) ||
          ((sanitizedGalleryPage as Record<string, unknown>)
            .background_color as string | undefined),
        ) || "";
      const rawGalleryPageStyles = (
        sanitizedGalleryPage as Record<string, unknown>
      ).styles as Record<string, unknown> | undefined;
      const galleryPagePayload = {
        ...sanitizedGalleryPage,
        bgColor: galleryPageBackgroundColor,
        backgroundColor: galleryPageBackgroundColor,
        bg_color: galleryPageBackgroundColor,
        background_color: galleryPageBackgroundColor,
        styles: {
          ...(rawGalleryPageStyles && typeof rawGalleryPageStyles === "object"
            ? rawGalleryPageStyles
            : {}),
          backgroundColor: galleryPageBackgroundColor,
          bgColor: galleryPageBackgroundColor,
          bg_color: galleryPageBackgroundColor,
          background_color: galleryPageBackgroundColor,
        },
      };

      const payload: Record<string, unknown> = {
        sections: {
          hero: sanitizedHero,
          aboutHero: sanitizedAboutHero,
          story: sanitizedStory,
          team: sanitizedTeam,
          testimonials: sanitizedTestimonials,
          services: sanitizedServices,
          homeValuesSettings: normalizedHomeValues,
          aboutUsValuesSettings: normalizedAboutUsValues,
          gallery: gallerySectionPayload,
          galleryPageSettings: galleryPagePayload,
          cta: sanitizedCta,
          header: sanitizedHeader,
          footer: sanitizedFooter,
          fontSettings: settings.fontSettings,
          colorSettings: settings.colorSettings,
          pageVisibility: settings.pageVisibility,
          visibleSections: settings.visibleSections,
          bookingSteps: cleanBookingSteps,
        },
        homeValuesSettings: normalizedHomeValues,
        aboutUsValuesSettings: normalizedAboutUsValues,
      };

      if (companyId) {
        setIsSaving(true);
        try {
          // Mapeamento explícito para compatibilidade com o backend (Snake Case e Estrutura de Pastas)
          const sectionsToGlobal = [
            "hero",
            "aboutHero",
            "story",
            "team",
            "testimonials",
            "services",
            "homeValuesSettings",
            "aboutUsValuesSettings",
            "gallery",
            "galleryPageSettings",
            "cta",
            "header",
            "footer",
          ];
          const sectionDataMap: Record<string, unknown> = {
            hero: sanitizedHero,
            aboutHero: sanitizedAboutHero,
            story: sanitizedStory,
            team: sanitizedTeam,
            testimonials: sanitizedTestimonials,
            services: sanitizedServices,
            homeValuesSettings: normalizedHomeValues,
            aboutUsValuesSettings: normalizedAboutUsValues,
            gallery: gallerySectionPayload,
            galleryPageSettings: galleryPagePayload,
            cta: sanitizedCta,
            header: sanitizedHeader,
            footer: sanitizedFooter,
          };
          const isRecord = (value: unknown): value is Record<string, unknown> =>
            !!value && typeof value === "object" && !Array.isArray(value);
          const toSafeRecord = (
            value: unknown,
          ): Record<string, unknown> | undefined =>
            isRecord(value) ? value : undefined;

          const sectionToDatabasePath: Record<string, string | string[]> = {
            hero: "home.heroBanner",
            aboutHero: "home.aboutHero",
            story: "home.storySection",
            team: "home.teamSection",
            testimonials: "home.testimonialsSection",
            services: "home.servicesSection",
            homeValuesSettings: [
              "homeValuesSettings",
              "home.homeValuesSettings",
              "home.valuesSection",
              "home.values",
              "values",
            ],
            aboutUsValuesSettings: [
              "aboutUsValuesSettings",
              "aboutUsValues",
              "aboutUs.valuesSection",
              "aboutUs.values",
              "about_us_values",
            ],
            gallery: ["home.galleryPreview", "sections.gallery"],
            galleryPageSettings: ["gallery", "galleryPageSettings"],
            cta: "home.ctaSection",
            header: "layoutGlobal.header",
            footer: "layoutGlobal.footer",
          };

          for (const section of sectionsToGlobal) {
            const rawSectionData = sectionDataMap[section];
            if (!isRecord(rawSectionData)) {
              console.warn(">>> [SAVE_GUARD] Seção inválida, ignorando:", {
                section,
                rawSectionData,
              });
              continue;
            }
            const sectionData = { ...rawSectionData };

            const dbPaths = sectionToDatabasePath[section];
            const resolvedPaths = Array.isArray(dbPaths)
              ? dbPaths
              : dbPaths
                ? [dbPaths]
                : [];
            if (resolvedPaths.length > 0) {
              for (const dbPath of resolvedPaths) {
                const pathParts = dbPath.split(".");
                let subObj: Record<string, unknown>;
                if (pathParts.length === 1) {
                  if (!payload[dbPath]) payload[dbPath] = {};
                  subObj = payload[dbPath] as Record<string, unknown>;
                } else {
                  const [root, sub] = pathParts;
                  if (!payload[root]) payload[root] = {};
                  const rootObj = payload[root] as Record<string, unknown>;

                  if (!rootObj[sub]) rootObj[sub] = {};
                  subObj = rootObj[sub] as Record<string, unknown>;
                }

                const appearance = toSafeRecord(sectionData.appearance) || {};
                const overlay =
                  toSafeRecord(
                    (appearance as Record<string, unknown>).overlay,
                  ) || {};
                const sectionBackgroundColor =
                  section === "services"
                    ? (appearance.backgroundColor as string) ||
                    (appearance.bgColor as string) ||
                    (sectionData.bgColor as string) ||
                    ""
                    : (appearance.backgroundColor as string) ||
                    (sectionData.backgroundColor as string) ||
                    (sectionData.bgColor as string) ||
                    "";
                const sectionCardBackgroundColor =
                  (sectionData.cardBgColor as string) ||
                  (sectionData.cardBackgroundColor as string) ||
                  (sectionData.card_background_color as string) ||
                  (appearance.cardBackgroundColor as string) ||
                  (appearance.cardBgColor as string) ||
                  ((sectionData.content as any)?.cardBgColor as string) ||
                  "";

                // Mapeia TODOS os campos de aparência para garantir sincronização total
                subObj.appearance = {
                  ...appearance,
                  backgroundImageUrl:
                    sectionData.bgImage || appearance.backgroundImageUrl || "",
                  showBackgroundImage: sectionData.bgType === "image",
                  backgroundColor: sectionBackgroundColor,
                  bgColor: sectionBackgroundColor,
                  overlayOpacity:
                    typeof sectionData.overlayOpacity === "number"
                      ? sectionData.overlayOpacity
                      : (appearance.overlayOpacity ?? 0),
                  overlay: {
                    ...overlay,
                    color: (overlay.color as string) || "",
                    opacity:
                      typeof sectionData.overlayOpacity === "number"
                        ? sectionData.overlayOpacity
                        : typeof overlay.opacity === "number"
                          ? overlay.opacity
                          : 0,
                  },
                  imageOpacity:
                    typeof sectionData.imageOpacity === "number"
                      ? sectionData.imageOpacity
                      : (appearance.imageOpacity ?? 1),
                  imageScale:
                    typeof sectionData.imageScale === "number"
                      ? sectionData.imageScale
                      : (appearance.imageScale ?? 1),
                  imageX:
                    typeof sectionData.imageX === "number"
                      ? sectionData.imageX
                      : (appearance.imageX ?? 50),
                  imageY:
                    typeof sectionData.imageY === "number"
                      ? sectionData.imageY
                      : (appearance.imageY ?? 50),
                  // Garante campos de cores e fontes na aparência também
                  titleColor:
                    sectionData.titleColor || appearance.titleColor || "",
                  subtitleColor:
                    sectionData.subtitleColor || appearance.subtitleColor || "",
                  titleFont:
                    sectionData.titleFont || appearance.titleFont || "",
                  subtitleFont:
                    sectionData.subtitleFont || appearance.subtitleFont || "",
                };

                // Se for Hero, adiciona campos de botões e badge na aparência
                if (section === "hero" || section === "aboutHero") {
                  const heroApp = subObj.appearance as Record<string, unknown>;
                  heroApp.badgeColor =
                    sectionData.badgeColor || appearance.badgeColor || "";
                  heroApp.badgeTextColor =
                    sectionData.badgeTextColor ||
                    appearance.badgeTextColor ||
                    "";
                  heroApp.badgeFont =
                    sectionData.badgeFont || appearance.badgeFont || "";
                  heroApp.primaryButtonColor =
                    sectionData.primaryButtonColor ||
                    appearance.primaryButtonColor ||
                    "";
                  heroApp.primaryButtonTextColor =
                    sectionData.primaryButtonTextColor ||
                    appearance.primaryButtonTextColor ||
                    "";
                  heroApp.primaryButtonFont =
                    sectionData.primaryButtonFont ||
                    appearance.primaryButtonFont ||
                    "";
                  heroApp.secondaryButtonColor =
                    sectionData.secondaryButtonColor ||
                    appearance.secondaryButtonColor ||
                    "";
                  heroApp.secondaryButtonTextColor =
                    sectionData.secondaryButtonTextColor ||
                    appearance.secondaryButtonTextColor ||
                    "";
                  heroApp.secondaryButtonFont =
                    sectionData.secondaryButtonFont ||
                    appearance.secondaryButtonFont ||
                    "";
                }

                // 2. Cores da Seção (Blindagem Total)
                subObj.bgType = sectionData.bgType || "color";
                subObj.bgColor = sectionBackgroundColor;
                subObj.backgroundColor = sectionBackgroundColor;
                subObj.bg_color = sectionBackgroundColor;
                subObj.background_color = sectionBackgroundColor;
                subObj.bgImage =
                  sectionData.bgImage || appearance.backgroundImageUrl || "";

                // 3. Mapeamento de conteúdo e cardConfig
                const cardConfig = {
                  backgroundColor: sectionCardBackgroundColor,
                  cardBackgroundColor: sectionCardBackgroundColor,
                  background_color: sectionCardBackgroundColor,
                  card_background_color: sectionCardBackgroundColor,
                  cardBgColor: sectionCardBackgroundColor,
                  card_bg_color: sectionCardBackgroundColor,
                };
                subObj.cardConfig = cardConfig;
                subObj.cardBgColor = sectionCardBackgroundColor;
                subObj.cardBackgroundColor = sectionCardBackgroundColor;
                subObj.card_bg_color = sectionCardBackgroundColor;
                subObj.card_background_color = sectionCardBackgroundColor;
                subObj.card_background = sectionCardBackgroundColor;

                // 4. Mapeamento de conteúdo completo para persistência
                const content: Record<string, unknown> = {
                  title: sectionData.title || "",
                  subtitle: sectionData.subtitle || "",
                  titleFont: sectionData.titleFont || "",
                  titleColor: sectionData.titleColor || "",
                  subtitleFont: sectionData.subtitleFont || "",
                  subtitleColor: sectionData.subtitleColor || "",
                };

                const genericColor =
                  section === "homeValuesSettings" ||
                    section === "aboutUsValuesSettings"
                    ? sectionBackgroundColor ||
                    (sectionData.values_bg as string) ||
                    (sectionData.about_values_bg as string) ||
                    ""
                    : sectionData.primaryButtonColor ||
                    sectionData.cardBgColor ||
                    sectionData.bgColor ||
                    "";

                Object.assign(subObj, {
                  ...sectionData, // Joga todas as propriedades (incluindo camelCase) na raiz
                  cardConfig, // Força o cardConfig atualizado
                  // Compatibilidade Snake Case para o Banco de Dados
                  primary_button_color:
                    sectionData.primaryButtonColor ||
                    sectionData.primary_button_color,
                  secondary_button_color:
                    sectionData.secondaryButtonColor ||
                    sectionData.secondary_button_color,
                  button_text:
                    sectionData.buttonText || sectionData.button_text,
                  button_color:
                    sectionData.buttonColor || sectionData.button_color,
                  button_text_color:
                    sectionData.buttonTextColor ||
                    sectionData.button_text_color,
                  button_font:
                    sectionData.buttonFont || sectionData.button_font,
                  button_link:
                    sectionData.buttonLink || sectionData.button_link,
                  title_font: sectionData.titleFont || sectionData.title_font,
                  subtitle_font:
                    sectionData.subtitleFont || sectionData.subtitle_font,
                  card_bg_color: sectionCardBackgroundColor,
                  card_background_color: sectionCardBackgroundColor,
                  cardBackgroundColor: sectionCardBackgroundColor,
                  cardBgColor: sectionCardBackgroundColor,
                  bgColor: sectionBackgroundColor, // Força o valor calculado
                  backgroundColor: sectionBackgroundColor, // Força o valor calculado
                  bg_color: sectionBackgroundColor, // Força o valor calculado
                  background_color: sectionBackgroundColor,
                  title_color:
                    sectionData.titleColor || sectionData.title_color,
                  subtitle_color:
                    sectionData.subtitleColor || sectionData.subtitle_color,
                  badge_color:
                    sectionData.badgeColor || sectionData.badge_color,
                  badge_text_color:
                    sectionData.badgeTextColor || sectionData.badge_text_color,
                  color: genericColor,
                  // Adicionado: Chaves específicas que o backend espera converter internamente
                  ...(section === "homeValuesSettings"
                    ? {
                      values_bg: genericColor,
                      valuesBg: genericColor,
                      // Garante que o appearance.backgroundColor seja preservado no objeto final
                      appearance: {
                        ...(subObj.appearance as Record<string, unknown>),
                        backgroundColor: sectionBackgroundColor,
                        bgColor: sectionBackgroundColor,
                        cardBgColor: sectionCardBackgroundColor,
                        cardBackgroundColor: sectionCardBackgroundColor,
                        titleColor:
                          sectionData.titleColor ||
                          appearance.titleColor ||
                          "",
                        subtitleColor:
                          sectionData.subtitleColor ||
                          appearance.subtitleColor ||
                          "",
                        cardTitleColor:
                          sectionData.cardTitleColor ||
                          appearance.cardTitleColor ||
                          "",
                        cardDescriptionColor:
                          sectionData.cardDescriptionColor ||
                          appearance.cardDescriptionColor ||
                          "",
                        cardIconColor:
                          sectionData.cardIconColor ||
                          appearance.cardIconColor ||
                          "",
                      },
                    }
                    : {}),
                  ...(section === "aboutUsValuesSettings"
                    ? {
                      about_values_bg: genericColor,
                      aboutValuesBg: genericColor,
                      // Garante que o appearance.backgroundColor seja preservado no objeto final
                      appearance: {
                        ...(subObj.appearance as Record<string, unknown>),
                        backgroundColor: sectionBackgroundColor,
                        bgColor: sectionBackgroundColor,
                        cardBgColor: sectionCardBackgroundColor,
                        cardBackgroundColor: sectionCardBackgroundColor,
                        titleColor:
                          sectionData.titleColor ||
                          appearance.titleColor ||
                          "",
                        subtitleColor:
                          sectionData.subtitleColor ||
                          appearance.subtitleColor ||
                          "",
                        cardTitleColor:
                          sectionData.cardTitleColor ||
                          appearance.cardTitleColor ||
                          "",
                        cardDescriptionColor:
                          sectionData.cardDescriptionColor ||
                          appearance.cardDescriptionColor ||
                          "",
                        cardIconColor:
                          sectionData.cardIconColor ||
                          appearance.cardIconColor ||
                          "",
                      },
                    }
                    : {}),
                });

                if (section === "hero" || section === "aboutHero") {
                  subObj.content = {
                    title: sectionData.title || "",
                    subtitle: sectionData.subtitle || "",
                  };
                } else {
                  // Campos específicos para outras seções (mantendo compatibilidade)
                  if (section === "story") {
                    content.title = sectionData.title || "";
                    content.subtitle = sectionData.subtitle || "";
                    content.content = sectionData.content || "";
                    content.image = sectionData.image || "";
                  }

                  if (section === "testimonials") {
                    content.title = sectionData.title || "";
                    content.subtitle = sectionData.subtitle || "";
                    content.testimonials = sectionData.testimonials || [];
                    content.starColor = sectionData.starColor || "";
                    content.cardBgColor = sectionData.cardBgColor || "";
                    content.cardNameFont = sectionData.cardNameFont || "";
                    content.cardNameColor = sectionData.cardNameColor || "";
                    content.cardTextFont = sectionData.cardTextFont || "";
                    content.cardTextColor = sectionData.cardTextColor || "";
                    content.cardRatingColor = sectionData.cardRatingColor || "";
                    content.cardBorderRadius =
                      sectionData.cardBorderRadius || "";

                    // Suporte para cardConfig exigido pelo backend
                    const cardConfig = {
                      backgroundColor: sectionCardBackgroundColor,
                      cardBackgroundColor: sectionCardBackgroundColor,
                      background_color: sectionCardBackgroundColor,
                      card_background_color: sectionCardBackgroundColor,
                      cardBgColor: sectionCardBackgroundColor,
                      card_bg_color: sectionCardBackgroundColor,
                    };
                    subObj.cardConfig = cardConfig;
                    (sectionData as Record<string, unknown>).cardConfig =
                      cardConfig;
                    content.cardBgColor = sectionCardBackgroundColor;
                    content.card_bg_color = sectionCardBackgroundColor;
                  }

                  if (
                    section === "galleryPreviewSettings" ||
                    section === "galleryPageSettings"
                  ) {
                    content.title = sectionData.title || "";
                    content.subtitle = sectionData.subtitle || "";
                    content.buttonText = sectionData.buttonText || "";
                    content.buttonFont = sectionData.buttonFont || "";
                    content.buttonColor = sectionData.buttonColor || "";
                    content.buttonTextColor = sectionData.buttonTextColor || "";
                    content.layout = sectionData.layout || "grid";
                    content.columns = sectionData.columns || 3;
                    content.gap = sectionData.gap || 16;
                    content.aspectRatio = sectionData.aspectRatio || "square";
                    content.cardBgColor = sectionCardBackgroundColor;
                    content.card_bg_color = sectionCardBackgroundColor;

                    // Suporte para cardConfig exigido pelo backend
                    const cardConfig = {
                      backgroundColor: sectionCardBackgroundColor,
                      cardBackgroundColor: sectionCardBackgroundColor,
                      background_color: sectionCardBackgroundColor,
                      card_background_color: sectionCardBackgroundColor,
                      cardBgColor: sectionCardBackgroundColor,
                      card_bg_color: sectionCardBackgroundColor,
                    };
                    subObj.cardConfig = cardConfig;
                    (sectionData as Record<string, unknown>).cardConfig =
                      cardConfig;
                  }

                  if (section === "cta") {
                    content.title = sectionData.title || "";
                    content.subtitle = sectionData.subtitle || "";
                    content.buttonText = sectionData.buttonText || "";
                    content.buttonFont = sectionData.buttonFont || "";
                    content.buttonColor = sectionData.buttonColor || "";
                    content.buttonTextColor = sectionData.buttonTextColor || "";
                    content.alignment = sectionData.alignment || "center";
                  }

                  if (
                    section === "homeValuesSettings" ||
                    section === "aboutUsValuesSettings"
                  ) {
                    content.title = sectionData.title || "";
                    content.subtitle = sectionData.subtitle || "";
                    content.items = sectionData.items || [];
                    content.cardBgColor = sectionCardBackgroundColor;
                    content.cardBackgroundColor = sectionCardBackgroundColor;
                    content.card_bg_color = sectionCardBackgroundColor;
                    content.card_background_color = sectionCardBackgroundColor;
                    content.cardTitleFont = sectionData.cardTitleFont || "";
                    content.cardTitleColor = sectionData.cardTitleColor || "";
                    content.cardDescriptionFont =
                      sectionData.cardDescriptionFont || "";
                    content.cardDescriptionColor =
                      sectionData.cardDescriptionColor || "";
                    content.cardIconColor = sectionData.cardIconColor || "";
                    content.showTitle = sectionData.showTitle ?? true;
                    content.showSubtitle = sectionData.showSubtitle ?? true;

                    // Suporte para cardConfig exigido pelo backend
                    const cardConfig = {
                      backgroundColor: sectionCardBackgroundColor,
                      cardBackgroundColor: sectionCardBackgroundColor,
                      background_color: sectionCardBackgroundColor,
                      card_background_color: sectionCardBackgroundColor,
                      cardBgColor: sectionCardBackgroundColor,
                      card_bg_color: sectionCardBackgroundColor,
                      titleColor:
                        sectionData.cardTitleColor ||
                        (appearance.cardTitleColor as string) ||
                        "",
                      cardTitleColor:
                        sectionData.cardTitleColor ||
                        (appearance.cardTitleColor as string) ||
                        "",
                      descriptionColor:
                        sectionData.cardDescriptionColor ||
                        (appearance.cardDescriptionColor as string) ||
                        "",
                      cardDescriptionColor:
                        sectionData.cardDescriptionColor ||
                        (appearance.cardDescriptionColor as string) ||
                        "",
                      iconColor:
                        sectionData.cardIconColor ||
                        (appearance.cardIconColor as string) ||
                        "",
                      cardIconColor:
                        sectionData.cardIconColor ||
                        (appearance.cardIconColor as string) ||
                        "",
                    };
                    subObj.cardConfig = cardConfig;
                    (sectionData as Record<string, unknown>).cardConfig =
                      cardConfig;
                  }

                  if (section === "services") {
                    content.title = sectionData.title || "";
                    content.subtitle = sectionData.subtitle || "";
                    content.cardBgColor = sectionCardBackgroundColor;
                    content.card_bg_color = sectionCardBackgroundColor;
                    content.cardTitleFont = sectionData.cardTitleFont || "";
                    content.cardTitleColor = sectionData.cardTitleColor || "";
                    content.cardDescriptionFont =
                      sectionData.cardDescriptionFont || "";
                    content.cardDescriptionColor =
                      sectionData.cardDescriptionColor || "";
                    content.cardPriceFont = sectionData.cardPriceFont || "";
                    content.cardPriceColor = sectionData.cardPriceColor || "";
                    content.cardIconColor = sectionData.cardIconColor || "";
                    content.cardBorderRadius =
                      sectionData.cardBorderRadius || "";
                    content.cardBorderWidth = sectionData.cardBorderWidth || "";
                    content.cardBorderColor = sectionData.cardBorderColor || "";
                    content.showTitle = sectionData.showTitle ?? true;
                    content.showSubtitle = sectionData.showSubtitle ?? true;

                    // Novo: Suporte para cardConfig exigido pelo backend
                    const cardConfig = {
                      backgroundColor: sectionCardBackgroundColor,
                      cardBackgroundColor: sectionCardBackgroundColor,
                      background_color: sectionCardBackgroundColor,
                      card_background_color: sectionCardBackgroundColor,
                      cardBgColor: sectionCardBackgroundColor,
                      card_bg_color: sectionCardBackgroundColor,
                      iconColor: sectionData.cardIconColor || "",
                      cardIconColor: sectionData.cardIconColor || "",
                      titleColor: sectionData.cardTitleColor || "",
                      cardTitleColor: sectionData.cardTitleColor || "",
                      descriptionColor: sectionData.cardDescriptionColor || "",
                      cardDescriptionColor:
                        sectionData.cardDescriptionColor || "",
                      priceColor: sectionData.cardPriceColor || "",
                      cardPriceColor: sectionData.cardPriceColor || "",
                    };

                    subObj.cardConfig = cardConfig;
                    // Garantir que o cardConfig também vá para o layoutGlobal.services
                    (sectionData as Record<string, unknown>).cardConfig =
                      cardConfig;
                  }

                  if (section === "team") {
                    content.title = sectionData.title || "";
                    content.subtitle = sectionData.subtitle || "";
                    content.members = sectionData.members || [];
                    content.cardBgColor = sectionCardBackgroundColor;
                    content.card_bg_color = sectionCardBackgroundColor;
                    content.cardTitleFont = sectionData.cardTitleFont || "";
                    content.cardTitleColor = sectionData.cardTitleColor || "";
                    content.cardRoleFont = sectionData.cardRoleFont || "";
                    content.cardRoleColor = sectionData.cardRoleColor || "";
                    content.cardDescriptionFont =
                      sectionData.cardDescriptionFont || "";
                    content.cardDescriptionColor =
                      sectionData.cardDescriptionColor || "";

                    // Suporte para cardConfig exigido pelo backend
                    const cardConfig = {
                      backgroundColor: sectionCardBackgroundColor,
                      cardBackgroundColor: sectionCardBackgroundColor,
                      background_color: sectionCardBackgroundColor,
                      card_background_color: sectionCardBackgroundColor,
                      cardBgColor: sectionCardBackgroundColor,
                      card_bg_color: sectionCardBackgroundColor,
                    };
                    subObj.cardConfig = cardConfig;
                    (sectionData as Record<string, unknown>).cardConfig =
                      cardConfig;
                  }

                  subObj.content = content;
                }

                sectionData.appearance = subObj.appearance;
                if (subObj.content) {
                  sectionData.content = subObj.content;
                }
              }
            }

            // Alinhamento com o Contrato (customization-schema-contract.md)
            if (section === "hero") {
              if (!payload.home) payload.home = {};
              (payload.home as Record<string, unknown>).heroBanner =
                sectionData;
            } else if (section === "galleryPreviewSettings") {
              if (!payload.home) payload.home = {};
              (payload.home as Record<string, unknown>).galleryPreview =
                sectionData;
            } else if (section === "homeValuesSettings") {
              if (!payload.home) payload.home = {};
              (payload.home as Record<string, unknown>).valuesSection =
                sectionData;
            } else {
              if (!payload.layoutGlobal) payload.layoutGlobal = {};
              (payload.layoutGlobal as Record<string, unknown>)[section] =
                sectionData;
            }
          }

          // Tratamento especial para fontes e cores globais (Theme)
          const fontData = settings.fontSettings as Record<string, unknown>;
          const normalizedFonts = {
            headingFont:
              (fontData.headingFont as string) ||
              (fontData.primaryFont as string) ||
              "",
            subtitleFont:
              (fontData.subtitleFont as string) ||
              (fontData.secondaryFont as string) ||
              "",
            bodyFont:
              (fontData.bodyFont as string) ||
              (fontData.accentFont as string) ||
              "",
          };
          if (!payload.layoutGlobal) payload.layoutGlobal = {};
          const layoutGlobal = payload.layoutGlobal as Record<string, unknown>;
          layoutGlobal.typography = normalizedFonts;
          layoutGlobal.fontes = normalizedFonts;
          layoutGlobal.font = normalizedFonts;

          const colorData = settings.colorSettings as Record<string, unknown>;
          const normalizedColors = {
            primary:
              (colorData.primary as string) ||
              (colorData.primaryColor as string) ||
              "",
            secondary:
              (colorData.secondary as string) ||
              (colorData.secondaryColor as string) ||
              "",
            accent:
              (colorData.accent as string) ||
              (colorData.accentColor as string) ||
              "",
            background:
              (colorData.background as string) ||
              (colorData.backgroundColor as string) ||
              "",
            text:
              (colorData.text as string) ||
              (colorData.textColor as string) ||
              "",
            buttonText:
              (colorData.buttonText as string) ||
              (colorData.buttonTextColor as string) ||
              "",
          };
          layoutGlobal.siteColors = normalizedColors;
          layoutGlobal.cores_base = normalizedColors;
          layoutGlobal.color = normalizedColors;

          // Tratar Header/Footer (se não estiverem no loop acima)
          if (!payload.layoutGlobal) payload.layoutGlobal = {};

          // Tratar Visibilidade
          (payload.layoutGlobal as Record<string, unknown>).pageVisibility =
            settings.pageVisibility;
          (payload.layoutGlobal as Record<string, unknown>).page_visibility =
            settings.pageVisibility;
          (payload.layoutGlobal as Record<string, unknown>).visibleSections =
            settings.visibleSections;
          (payload.layoutGlobal as Record<string, unknown>).visible_sections =
            settings.visibleSections;

          // Tratar Passos de Agendamento
          console.log(
            ">>> [API_SAVE] Mapeando bookingSteps para appointmentFlow:",
            sanitizedBookingSteps,
          );

          payload.appointmentFlow = {
            steps: {
              ...(cleanBookingSteps.service
                ? {
                  service: {
                    ...cleanBookingSteps.service,
                    // Mapeamento de Dualidade (camelCase -> snake_case)
                    cardBgColor: cleanBookingSteps.service.cardBgColor,
                    card_bg_color: cleanBookingSteps.service.cardBgColor,
                    card_background_color:
                      cleanBookingSteps.service.cardBgColor,
                    cardBackgroundColor:
                      cleanBookingSteps.service.cardBgColor,
                    bgColor: cleanBookingSteps.service.bgColor,
                    backgroundColor: cleanBookingSteps.service.bgColor,
                    button_color: cleanBookingSteps.service.buttonColor,
                    title_color: cleanBookingSteps.service.titleColor,
                    subtitle_color: cleanBookingSteps.service.subtitleColor,
                    accentColor: cleanBookingSteps.service.accentColor,
                    accent_color: cleanBookingSteps.service.accentColor,
                    bg_color: cleanBookingSteps.service.bgColor,
                    // Suporte para cardConfig exigido pelo backend no fluxo de agendamento
                    cardConfig: {
                      backgroundColor:
                        cleanBookingSteps.service.cardBgColor || "",
                      cardBackgroundColor:
                        cleanBookingSteps.service.cardBgColor || "",
                      background_color:
                        cleanBookingSteps.service.cardBgColor || "",
                      card_background_color:
                        cleanBookingSteps.service.cardBgColor || "",
                    },
                  },
                }
                : {}),
              ...(cleanBookingSteps.date
                ? {
                  date: {
                    ...cleanBookingSteps.date,
                    // Mapeamento de Dualidade
                    card_bg_color: cleanBookingSteps.date.cardBgColor,
                    card_background_color: cleanBookingSteps.date.cardBgColor,
                    cardBackgroundColor: cleanBookingSteps.date.cardBgColor,
                    title_color: cleanBookingSteps.date.titleColor,
                    subtitle_color: cleanBookingSteps.date.subtitleColor,
                    accent_color: cleanBookingSteps.date.accentColor,
                    bg_color: cleanBookingSteps.date.bgColor,
                    // Suporte para cardConfig
                    cardConfig: {
                      backgroundColor:
                        cleanBookingSteps.date.cardBgColor || "",
                      cardBackgroundColor:
                        cleanBookingSteps.date.cardBgColor || "",
                      background_color:
                        cleanBookingSteps.date.cardBgColor || "",
                      card_background_color:
                        cleanBookingSteps.date.cardBgColor || "",
                    },
                  },
                }
                : {}),
              ...(cleanBookingSteps.time
                ? {
                  time: {
                    ...cleanBookingSteps.time,
                    // Mapeamento de Dualidade
                    card_bg_color: cleanBookingSteps.time.cardBgColor,
                    card_background_color: cleanBookingSteps.time.cardBgColor,
                    cardBackgroundColor: cleanBookingSteps.time.cardBgColor,
                    title_color: cleanBookingSteps.time.titleColor,
                    subtitle_color: cleanBookingSteps.time.subtitleColor,
                    accent_color: cleanBookingSteps.time.accentColor,
                    bg_color: cleanBookingSteps.time.bgColor,
                    // Suporte para cardConfig
                    cardConfig: {
                      backgroundColor:
                        cleanBookingSteps.time.cardBgColor || "",
                      cardBackgroundColor:
                        cleanBookingSteps.time.cardBgColor || "",
                      background_color:
                        cleanBookingSteps.time.cardBgColor || "",
                      card_background_color:
                        cleanBookingSteps.time.cardBgColor || "",
                    },
                  },
                }
                : {}),
              ...(cleanBookingSteps.form
                ? {
                  form: {
                    ...cleanBookingSteps.form,
                    // Mapeamento de Dualidade
                    card_bg_color: cleanBookingSteps.form.cardBgColor,
                    card_background_color: cleanBookingSteps.form.cardBgColor,
                    cardBackgroundColor: cleanBookingSteps.form.cardBgColor,
                    title_color: cleanBookingSteps.form.titleColor,
                    subtitle_color: cleanBookingSteps.form.subtitleColor,
                    accent_color: cleanBookingSteps.form.accentColor,
                    bg_color: cleanBookingSteps.form.bgColor,
                    // Suporte para cardConfig
                    cardConfig: {
                      backgroundColor:
                        cleanBookingSteps.form.cardBgColor || "",
                      cardBackgroundColor:
                        cleanBookingSteps.form.cardBgColor || "",
                      background_color:
                        cleanBookingSteps.form.cardBgColor || "",
                      card_background_color:
                        cleanBookingSteps.form.cardBgColor || "",
                    },
                  },
                }
                : {}),
              ...(cleanBookingSteps.confirmation
                ? {
                  confirmation: {
                    ...cleanBookingSteps.confirmation,
                    // Mapeamento de Dualidade
                    card_bg_color: cleanBookingSteps.confirmation.cardBgColor,
                    card_background_color:
                      cleanBookingSteps.confirmation.cardBgColor,
                    cardBackgroundColor:
                      cleanBookingSteps.confirmation.cardBgColor,
                    title_color: cleanBookingSteps.confirmation.titleColor,
                    subtitle_color:
                      cleanBookingSteps.confirmation.subtitleColor,
                    accent_color: cleanBookingSteps.confirmation.accentColor,
                    bg_color: cleanBookingSteps.confirmation.bgColor,
                    // Suporte para cardConfig
                    cardConfig: {
                      backgroundColor:
                        cleanBookingSteps.confirmation.cardBgColor || "",
                      cardBackgroundColor:
                        cleanBookingSteps.confirmation.cardBgColor || "",
                      background_color:
                        cleanBookingSteps.confirmation.cardBgColor || "",
                      card_background_color:
                        cleanBookingSteps.confirmation.cardBgColor || "",
                    },
                  },
                }
                : {}),
            },
          };
          if (cleanBookingSteps.service) {
            const appointmentFlow = payload.appointmentFlow as Record<
              string,
              unknown
            >;
            const serviceCardBg =
              cleanBookingSteps.service.cardBgColor || "#ffffff";
            const serviceBg = cleanBookingSteps.service.bgColor || "";
            const serviceAccent = cleanBookingSteps.service.accentColor || "";
            const existingStep1Services =
              (appointmentFlow.step1Services as Record<string, unknown>) ||
              (appointmentFlow.step1_services as Record<string, unknown>) ||
              {};
            const existingStep1ServicesSnake =
              (appointmentFlow.step1_services as Record<string, unknown>) ||
              (appointmentFlow.step1Services as Record<string, unknown>) ||
              {};
            const step1Payload = {
              ...cleanBookingSteps.service,
              cardBgColor: serviceCardBg,
              card_bg_color: serviceCardBg,
              card_background_color: serviceCardBg,
              cardBackgroundColor: serviceCardBg,
              bgColor: serviceBg,
              backgroundColor: serviceBg,
              bg_color: serviceBg,
              accentColor: serviceAccent,
              accent_color: serviceAccent,
              cardConfig: {
                backgroundColor: serviceCardBg,
                cardBackgroundColor: serviceCardBg,
                background_color: serviceCardBg,
                card_background_color: serviceCardBg,
                cardBgColor: serviceCardBg,
                card_bg_color: serviceCardBg,
              },
            };
            appointmentFlow.step1Services = {
              ...existingStep1Services,
              ...step1Payload,
            };
            appointmentFlow.step1_services = {
              ...existingStep1ServicesSnake,
              ...step1Payload,
            };
          }

          // Adicionalmente, enviamos como bookingSteps para garantir compatibilidade
          payload.bookingSteps = cleanBookingSteps;

          // Limpar o payload de campos undefined para não quebrar o deepMerge do back
          const cleanPayload = JSON.parse(JSON.stringify(payload));

          // Sanitiza o payload antes de enviar para o backend
          const sanitizedPayload = sanitizePayload(cleanPayload);
          console.log("PAYLOAD SENDING TO API:", sanitizedPayload);
          console.log("PAYLOAD_READY", sanitizedPayload);
          console.log(
            ">>> [PAYLOAD FINAL]",
            JSON.stringify(sanitizedPayload, null, 2),
          );

          // 12. LOG DE AUDITORIA (Solicitado pelo usuário: Detalhado antes da chamada API)
          console.log(
            ">>> [AUDIT_LOG] Iniciando persistência de Full Sync no Backend",
            {
              companyId,
              timestamp: new Date().toISOString(),
              payloadSections: Object.keys(sanitizedPayload.sections || {}),
              payloadLayout: Object.keys(sanitizedPayload.layoutGlobal || {}),
              payloadAppointment: Object.keys(
                sanitizedPayload.appointmentFlow || {},
              ),
              fullPayload: sanitizedPayload,
            },
          );

          const fresh = await siteCustomizerService.saveDraftCustomization(
            companyId,
            sanitizedPayload,
          );

          if (typeof window !== "undefined") {
            if (fresh) {
              const normalizedFresh = normalizePayload(fresh as SiteConfigData);
              const freshConfig =
                normalizedFresh &&
                  typeof normalizedFresh === "object" &&
                  !Array.isArray(normalizedFresh)
                  ? (normalizedFresh as Record<string, unknown>)
                  : {};
              const freshSections =
                (freshConfig.sections as Record<string, unknown>) || {};
              const freshHome =
                (freshConfig.home as Record<string, unknown>) || {};
              const freshLayout =
                (freshConfig.layoutGlobal as Record<string, unknown>) || {};

              // --- NORMALIZAÇÃO DE TODAS AS SEÇÕES PARA EVITAR "RETURN LEAK" ---
              const normalizedSavedHero = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.homeHero] ||
                freshHome.heroBanner ||
                freshHome.hero ||
                freshConfig.hero ||
                sanitizedHero,
                sanitizedHero as Record<string, unknown>,
              ) as HeroSettings;

              const normalizedSavedAboutHero = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.aboutHero] ||
                (freshConfig.about as any)?.heroSection ||
                freshConfig.aboutHero ||
                sanitizedAboutHero,
                sanitizedAboutHero as Record<string, unknown>,
              ) as HeroSettings;

              const normalizedSavedStory = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.homeStory] ||
                freshHome.storySection ||
                freshHome.story ||
                freshConfig.story ||
                sanitizedStory,
                sanitizedStory as Record<string, unknown>,
              ) as StorySettings;

              const normalizedSavedTeam = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.homeTeam] ||
                freshHome.teamSection ||
                freshHome.team ||
                freshConfig.team ||
                sanitizedTeam,
                sanitizedTeam as Record<string, unknown>,
              ) as TeamSettings;

              const normalizedSavedTestimonials = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.homeTestimonials] ||
                freshHome.testimonialsSection ||
                freshHome.testimonials ||
                freshConfig.testimonials ||
                sanitizedTestimonials,
                sanitizedTestimonials as Record<string, unknown>,
              ) as TestimonialsSettings;

              const normalizedSavedServices = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.homeServices] ||
                freshHome.servicesSection ||
                freshHome.services ||
                freshConfig.services ||
                sanitizedServices,
                sanitizedServices as Record<string, unknown>,
              ) as ServicesSettings;

              const normalizedSavedHomeValues = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.homeValues] ||
                freshHome.homeValuesSettings ||
                freshHome.valuesSection ||
                freshHome.values ||
                freshConfig.homeValuesSettings ||
                freshConfig.values ||
                sanitizedHomeValues,
                sanitizedHomeValues as Record<string, unknown>,
              ) as ValuesSettings;

              const normalizedSavedAboutUsValues = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.aboutValues] ||
                (freshConfig.about as any)?.aboutUsValuesSettings ||
                freshConfig.aboutUsValuesSettings ||
                freshConfig.about_us_values ||
                sanitizedAboutUsValues,
                sanitizedAboutUsValues as Record<string, unknown>,
              ) as ValuesSettings;

              const normalizedSavedGallery = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.homeGallery] ||
                freshHome.galleryPreview ||
                freshHome.gallerySection ||
                freshConfig.galleryPreviewSettings ||
                freshSections.gallery ||
                gallerySectionPayload,
                gallerySectionPayload as Record<string, unknown>,
              ) as GallerySettings;
              const normalizedSavedGalleryPage = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.pageGallery] ||
                freshConfig.galleryPageSettings ||
                freshSections.galleryPageSettings ||
                freshConfig.gallery ||
                galleryPagePayload,
                galleryPagePayload as Record<string, unknown>,
              ) as GallerySettings;

              const normalizedSavedCTA = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.homeCta] ||
                freshHome.ctaSection ||
                freshHome.cta ||
                freshConfig.cta ||
                sanitizedCta,
                sanitizedCta as Record<string, unknown>,
              ) as CTASettings;

              const normalizedSavedHeader = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.layoutHeader] ||
                freshLayout.header ||
                freshConfig.header ||
                sanitizedHeader,
                sanitizedHeader as Record<string, unknown>,
              ) as HeaderSettings;

              const normalizedSavedFooter = normalizeSectionStatePayload(
                freshSections[SECTION_IDS.layoutFooter] ||
                freshLayout.footer ||
                freshConfig.footer ||
                sanitizedFooter,
                sanitizedFooter as Record<string, unknown>,
              ) as FooterSettings;

              const resolvedFont =
                (freshConfig.fontSettings as FontSettings) ||
                (freshConfig.theme as FontSettings) ||
                settings.fontSettings;
              const resolvedColor =
                (freshConfig.colorSettings as ColorSettings) ||
                (freshConfig.colors as ColorSettings) ||
                settings.colorSettings;
              const freshAppointmentFlow =
                ((freshConfig.appointmentFlow as Record<string, unknown>) ||
                  (freshConfig.appointment_flow as Record<string, unknown>) ||
                  {}) as Record<string, unknown>;
              const freshBookingSteps = ((freshConfig.bookingSteps as Record<
                string,
                unknown
              >) ||
                (freshConfig.booking_steps as Record<string, unknown>) ||
                (freshAppointmentFlow.steps as Record<string, unknown>) ||
                {}) as Record<string, unknown>;
              const normalizedSavedBookingService = normalizeStepSettings(
                ((freshAppointmentFlow.step1Services as Record<
                  string,
                  unknown
                >) ||
                  (freshAppointmentFlow.step1_services as Record<
                    string,
                    unknown
                  >) ||
                  (freshAppointmentFlow.step1_service as Record<
                    string,
                    unknown
                  >) ||
                  (freshBookingSteps.service as Record<string, unknown>) ||
                  (cleanBookingSteps.service as Record<
                    string,
                    unknown
                  >)) as Record<string, unknown>,
                cleanBookingSteps.service,
              );
              const normalizedSavedBookingDate = normalizeStepSettings(
                (freshBookingSteps.date as Record<string, unknown>) ||
                (cleanBookingSteps.date as Record<string, unknown>),
                cleanBookingSteps.date,
              );
              const normalizedSavedBookingTime = normalizeStepSettings(
                (freshBookingSteps.time as Record<string, unknown>) ||
                (cleanBookingSteps.time as Record<string, unknown>),
                cleanBookingSteps.time,
              );
              const normalizedSavedBookingForm = normalizeStepSettings(
                (freshBookingSteps.form as Record<string, unknown>) ||
                (cleanBookingSteps.form as Record<string, unknown>),
                cleanBookingSteps.form,
              );
              const normalizedSavedBookingConfirmation = normalizeStepSettings(
                (freshBookingSteps.confirmation as Record<string, unknown>) ||
                (cleanBookingSteps.confirmation as Record<string, unknown>),
                cleanBookingSteps.confirmation,
              );
              const applySavedState = () => {
                setters.setLastSavedHero(normalizedSavedHero);
                setters.setLastSavedAboutHero(normalizedSavedAboutHero);
                setters.setLastSavedStory(normalizedSavedStory);
                setters.setLastSavedTeam(normalizedSavedTeam);
                setters.setLastSavedTestimonials(normalizedSavedTestimonials);
                setters.setLastSavedFont(resolvedFont);
                setters.setLastSavedColor(resolvedColor);
                setters.setLastSavedServices(normalizedSavedServices);
                setters.setLastSavedHomeValues(normalizedSavedHomeValues);
                setters.setLastSavedAboutUsValues(normalizedSavedAboutUsValues);
                setters.setLastSavedGallery(normalizedSavedGallery);
                setters.setLastSavedGalleryPage(normalizedSavedGalleryPage);
                setters.setLastSavedCTA(normalizedSavedCTA);
                setters.setLastSavedHeader(normalizedSavedHeader);
                setters.setLastSavedFooter(normalizedSavedFooter);
                setters.setLastSavedPageVisibility(settings.pageVisibility);
                setters.setLastSavedVisibleSections(settings.visibleSections);
                setters.setLastSavedBookingService(
                  normalizedSavedBookingService,
                );
                setters.setLastSavedBookingDate(normalizedSavedBookingDate);
                setters.setLastSavedBookingTime(normalizedSavedBookingTime);
                setters.setLastSavedBookingForm(normalizedSavedBookingForm);
                setters.setLastSavedBookingConfirmation(
                  normalizedSavedBookingConfirmation,
                );
                setIsDirty(false);
              };

              // 5. ATUALIZAÇÃO DO CONTEXTO GLOBAL (Força re-render do site no editor)
              if (updateStudioInfo && fresh) {
                console.log(
                  ">>> [DEBUG_SAVE] Injetando no context - SanitizedServices:",
                  sanitizedServices,
                );
                const incomingAppointmentFlow =
                  ((payload.appointmentFlow as Record<string, unknown>) ||
                    {}) as Record<string, unknown>;
                const serviceCardBg =
                  normalizedSavedBookingService?.cardBgColor || "";
                const serviceBg = normalizedSavedBookingService?.bgColor || "";
                const serviceAccent =
                  normalizedSavedBookingService?.accentColor || "";

                const serviceFullConfig = normalizedSavedBookingService
                  ? {
                    ...normalizedSavedBookingService,
                    cardBgColor: serviceCardBg,
                    cardBackgroundColor: serviceCardBg,
                    card_bg_color: serviceCardBg,
                    card_background_color: serviceCardBg,
                    bgColor: serviceBg,
                    bg_color: serviceBg,
                    backgroundColor: serviceBg,
                    accentColor: serviceAccent,
                    accent_color: serviceAccent,
                    cardConfig: {
                      backgroundColor: serviceCardBg,
                      cardBackgroundColor: serviceCardBg,
                      background_color: serviceCardBg,
                      card_background_color: serviceCardBg,
                      cardBgColor: serviceCardBg,
                      card_bg_color: serviceCardBg,
                    },
                  }
                  : undefined;

                const normalizedBookingStepsForContext = {
                  service: normalizedSavedBookingService,
                  date: normalizedSavedBookingDate,
                  time: normalizedSavedBookingTime,
                  form: normalizedSavedBookingForm,
                  confirmation: normalizedSavedBookingConfirmation,
                };
                const incomingStep1Services =
                  ((incomingAppointmentFlow.step1Services as Record<
                    string,
                    unknown
                  >) ||
                    (incomingAppointmentFlow.step1_services as Record<
                      string,
                      unknown
                    >)) as Record<string, unknown> | undefined;
                const freshStep1Services =
                  ((freshAppointmentFlow.step1Services as Record<
                    string,
                    unknown
                  >) ||
                    (freshAppointmentFlow.step1_services as Record<
                      string,
                      unknown
                    >)) as Record<string, unknown> | undefined;
                const normalizedStep1ServicesForContext = normalizeStepSettings(
                  (serviceFullConfig ||
                    incomingStep1Services ||
                    freshStep1Services ||
                    (normalizedSavedBookingService as Record<string, unknown>)) as
                  | Record<string, unknown>
                  | undefined,
                  normalizedSavedBookingService,
                );

                const baseAuthoritativeConfig = {
                  ...freshConfig,
                  sections: {
                    ...freshSections,
                    [SECTION_IDS.homeHero]: normalizedSavedHero,
                    [SECTION_IDS.aboutHero]: normalizedSavedAboutHero,
                    [SECTION_IDS.homeStory]: normalizedSavedStory,
                    [SECTION_IDS.homeTeam]: normalizedSavedTeam,
                    [SECTION_IDS.homeTestimonials]: normalizedSavedTestimonials,
                    [SECTION_IDS.homeServices]: normalizedSavedServices,
                    [SECTION_IDS.homeValues]: normalizedSavedHomeValues,
                    [SECTION_IDS.aboutValues]: normalizedSavedAboutUsValues,
                    [SECTION_IDS.homeGallery]: normalizedSavedGallery,
                    [SECTION_IDS.pageGallery]: normalizedSavedGalleryPage,
                    [SECTION_IDS.homeCta]: normalizedSavedCTA,
                    [SECTION_IDS.layoutHeader]: normalizedSavedHeader,
                    [SECTION_IDS.layoutFooter]: normalizedSavedFooter,
                    [SECTION_IDS.bookingService]: normalizedSavedBookingService,
                    [SECTION_IDS.bookingDate]: normalizedSavedBookingDate,
                    [SECTION_IDS.bookingTime]: normalizedSavedBookingTime,
                    [SECTION_IDS.bookingForm]: normalizedSavedBookingForm,
                    [SECTION_IDS.bookingConfirmation]:
                      normalizedSavedBookingConfirmation,
                    gallery: normalizedSavedGallery,
                    galleryPageSettings: normalizedSavedGalleryPage,
                  },
                  bookingSteps: {
                    ...((freshConfig.bookingSteps as Record<string, unknown>) ||
                      (freshConfig.booking_steps as Record<string, unknown>) ||
                      {}),
                    ...normalizedBookingStepsForContext,
                  },
                  booking_steps: {
                    ...((freshConfig.booking_steps as Record<
                      string,
                      unknown
                    >) ||
                      (freshConfig.bookingSteps as Record<string, unknown>) ||
                      {}),
                    ...normalizedBookingStepsForContext,
                  },
                  appointmentFlow: {
                    ...freshAppointmentFlow,
                    ...incomingAppointmentFlow,
                    steps: {
                      ...((freshAppointmentFlow.steps as Record<
                        string,
                        unknown
                      >) || {}),
                      ...normalizedBookingStepsForContext,
                    },
                    passos: {
                      ...((freshAppointmentFlow.passos as Record<
                        string,
                        unknown
                      >) || {}),
                      ...normalizedBookingStepsForContext,
                    },
                    step1Services: normalizedStep1ServicesForContext,
                    step1_services: normalizedStep1ServicesForContext,
                  },
                  appointment_flow: {
                    ...freshAppointmentFlow,
                    ...incomingAppointmentFlow,
                    steps: {
                      ...((freshAppointmentFlow.steps as Record<
                        string,
                        unknown
                      >) || {}),
                      ...normalizedBookingStepsForContext,
                    },
                    passos: {
                      ...((freshAppointmentFlow.passos as Record<
                        string,
                        unknown
                      >) || {}),
                      ...normalizedBookingStepsForContext,
                    },
                    step1Services: normalizedStep1ServicesForContext,
                    step1_services: normalizedStep1ServicesForContext,
                  },
                  layoutGlobal: {
                    ...((freshConfig.layoutGlobal as Record<string, unknown>) ||
                      {}),
                    ...((payload.layoutGlobal as Record<string, unknown>) ||
                      {}),
                    header: normalizedSavedHeader,
                    footer: normalizedSavedFooter,
                    siteColors: settings.colorSettings,
                    color: settings.colorSettings,
                    cores_base: settings.colorSettings,
                    typography: settings.fontSettings,
                    fontes: settings.fontSettings,
                  },
                  home: {
                    ...freshHome,
                    heroBanner: normalizedSavedHero,
                    hero: normalizedSavedHero,
                    servicesSection: normalizedSavedServices,
                    services: normalizedSavedServices,
                    valuesSection: normalizedSavedHomeValues,
                    values: normalizedSavedHomeValues,
                    storySection: normalizedSavedStory,
                    story: normalizedSavedStory,
                    teamSection: normalizedSavedTeam,
                    team: normalizedSavedTeam,
                    testimonialsSection: normalizedSavedTestimonials,
                    testimonials: normalizedSavedTestimonials,
                    galleryPreview: normalizedSavedGallery,
                    gallerySection: normalizedSavedGallery,
                    ctaSection: normalizedSavedCTA,
                    cta: normalizedSavedCTA,
                  },
                  aboutUs: {
                    ...((freshConfig.aboutUs as Record<string, unknown>) || {}),
                    valuesSection: normalizedSavedAboutUsValues,
                    values: normalizedSavedAboutUsValues,
                  },
                  hero: normalizedSavedHero,
                  aboutHero: normalizedSavedAboutHero,
                  story: normalizedSavedStory,
                  team: normalizedSavedTeam,
                  testimonials: normalizedSavedTestimonials,
                  services: normalizedSavedServices,
                  homeValuesSettings: normalizedSavedHomeValues,
                  aboutUsValuesSettings: normalizedSavedAboutUsValues,
                  galleryPreviewSettings: normalizedSavedGallery,
                  galleryPageSettings: normalizedSavedGalleryPage,
                  cta: normalizedSavedCTA,
                  header: normalizedSavedHeader,
                  footer: normalizedSavedFooter,
                  pageVisibility: settings.pageVisibility,
                  visibleSections: settings.visibleSections,
                  fontSettings: settings.fontSettings,
                  colorSettings: settings.colorSettings,
                  colors: settings.colorSettings,
                  theme: settings.fontSettings,
                };
                const normalizedAuthoritativeConfig = normalizePayload(
                  baseAuthoritativeConfig as SiteConfigData,
                ) as Record<string, unknown>;
                const normalizedAuthoritativeFlow =
                  ((normalizedAuthoritativeConfig.appointmentFlow as Record<
                    string,
                    unknown
                  >) ||
                    (normalizedAuthoritativeConfig.appointment_flow as Record<
                      string,
                      unknown
                    >) ||
                    {}) as Record<string, unknown>;
                const stabilizedStep1Services = normalizeStepSettings(
                  ((normalizedAuthoritativeFlow.step1Services as Record<
                    string,
                    unknown
                  >) ||
                    (normalizedAuthoritativeFlow.step1_services as Record<
                      string,
                      unknown
                    >)) as Record<string, unknown>,
                  normalizedStep1ServicesForContext,
                );
                const authoritativeConfig = {
                  ...normalizedAuthoritativeConfig,
                  sections: {
                    ...((normalizedAuthoritativeConfig.sections as Record<
                      string,
                      unknown
                    >) || {}),
                    [SECTION_IDS.bookingService]: normalizedSavedBookingService,
                    [SECTION_IDS.bookingDate]: normalizedSavedBookingDate,
                    [SECTION_IDS.bookingTime]: normalizedSavedBookingTime,
                    [SECTION_IDS.bookingForm]: normalizedSavedBookingForm,
                    [SECTION_IDS.bookingConfirmation]:
                      normalizedSavedBookingConfirmation,
                  },
                  bookingSteps: {
                    ...((normalizedAuthoritativeConfig.bookingSteps as Record<
                      string,
                      unknown
                    >) ||
                      (normalizedAuthoritativeConfig.booking_steps as Record<
                        string,
                        unknown
                      >) ||
                      {}),
                    ...normalizedBookingStepsForContext,
                  },
                  booking_steps: {
                    ...((normalizedAuthoritativeConfig.booking_steps as Record<
                      string,
                      unknown
                    >) ||
                      (normalizedAuthoritativeConfig.bookingSteps as Record<
                        string,
                        unknown
                      >) ||
                      {}),
                    ...normalizedBookingStepsForContext,
                  },
                  appointmentFlow: {
                    ...normalizedAuthoritativeFlow,
                    steps: {
                      ...((normalizedAuthoritativeFlow.steps as Record<
                        string,
                        unknown
                      >) || {}),
                      ...normalizedBookingStepsForContext,
                    },
                    passos: {
                      ...((normalizedAuthoritativeFlow.passos as Record<
                        string,
                        unknown
                      >) || {}),
                      ...normalizedBookingStepsForContext,
                    },
                    step1Services: stabilizedStep1Services,
                    step1_services: stabilizedStep1Services,
                  },
                  appointment_flow: {
                    ...normalizedAuthoritativeFlow,
                    steps: {
                      ...((normalizedAuthoritativeFlow.steps as Record<
                        string,
                        unknown
                      >) || {}),
                      ...normalizedBookingStepsForContext,
                    },
                    passos: {
                      ...((normalizedAuthoritativeFlow.passos as Record<
                        string,
                        unknown
                      >) || {}),
                      ...normalizedBookingStepsForContext,
                    },
                    step1Services: stabilizedStep1Services,
                    step1_services: stabilizedStep1Services,
                  },
                };

                console.log(
                  ">>> [ESTRUTURA INJETADA NO CONTEXT]",
                  JSON.parse(JSON.stringify(authoritativeConfig)),
                );

                unstable_batchedUpdates(() => {
                  applySavedState();
                  updateStudioInfo({
                    config: authoritativeConfig,
                  });
                });
              } else {
                unstable_batchedUpdates(() => {
                  applySavedState();
                });
              }

              saveLocalDrafts({
                heroSettings: normalizedSavedHero,
                aboutHeroSettings: normalizedSavedAboutHero,
                storySettings: normalizedSavedStory,
                teamSettings: normalizedSavedTeam,
                testimonialsSettings: normalizedSavedTestimonials,
                fontSettings: resolvedFont,
                colorSettings: resolvedColor,
                servicesSettings: normalizedSavedServices,
                homeValuesSettings: normalizedSavedHomeValues,
                aboutUsValuesSettings: normalizedSavedAboutUsValues,
                gallerySettings: normalizedSavedGallery,
                galleryPageSettings: normalizedSavedGalleryPage,
                ctaSettings: normalizedSavedCTA,
                headerSettings: normalizedSavedHeader,
                footerSettings: normalizedSavedFooter,
                bookingServiceSettings: normalizedSavedBookingService,
                bookingDateSettings: normalizedSavedBookingDate,
                bookingTimeSettings: normalizedSavedBookingTime,
                bookingFormSettings: normalizedSavedBookingForm,
                bookingConfirmationSettings: normalizedSavedBookingConfirmation,
                pageVisibility: settings.pageVisibility,
                visibleSections: settings.visibleSections,
              });

              console.log(
                ">>> [ESTADO_POS_SAVE] Verificando cor final injetada:",
                {
                  sanitizedServicesColor:
                    sanitizedServices.bgColor ||
                    (sanitizedServices as any).appearance?.bgColor,
                  freshConfigServicesColor:
                    (freshConfig as any).home?.servicesSection?.bgColor ||
                    (freshConfig as any).services?.bgColor,
                },
              );

              // 6. LIMPEZA DE CACHE DE PREVIEW
              if (typeof localStorage !== "undefined") {
                console.log(">>> [CACHE] Limpando studio-preview-cache...");
                localStorage.removeItem("studio-preview-cache");
                // Limpa também o draft local para garantir sincronia com o banco
                localStorage.removeItem("studio-local-draft");
              }

              console.log(">>> [SYNC] Estado LAST_SAVED atualizado.");
            }
          }

          // REMOVIDO DISPARO RECURSIVO: O estado lastSaved já foi atualizado,
          // o que forçará a reavaliação de hasUnsavedGlobalChanges naturalmente.

          try {
            toast({
              title: "Salvo com sucesso!",
              description: "As alterações foram salvas no rascunho.",
              duration: 2000,
            });
          } catch (_e) { }
        } catch (err) {
          console.error(
            ">>> [useEditorApi] Erro fatal ao salvar no backend:",
            err,
          );
          toast({
            title: "Erro ao salvar",
            description:
              "As alterações foram salvas localmente, mas houve um erro ao sincronizar com o servidor.",
            variant: "destructive",
          });
        } finally {
          setIsSaving(false);
        }
      } else {
        console.warn(
          ">>> [useEditorApi] companyId não encontrado, salvando apenas localmente.",
        );

        // Em modo local, atualizamos o lastSaved para refletir o que foi salvo no localStorage
        setters.setLastSavedHero(sanitizedHero);
        setters.setLastSavedAboutHero(sanitizedAboutHero);
        setters.setLastSavedStory(sanitizedStory);
        setters.setLastSavedTeam(sanitizedTeam);
        setters.setLastSavedTestimonials(sanitizedTestimonials);
        setters.setLastSavedFont(settings.fontSettings);
        setters.setLastSavedColor(settings.colorSettings);
        setters.setLastSavedServices(sanitizedServices);
        setters.setLastSavedHomeValues(sanitizedHomeValues);
        setters.setLastSavedAboutUsValues(sanitizedAboutUsValues);
        setters.setLastSavedGallery(gallerySectionPayload);
        setters.setLastSavedGalleryPage(galleryPagePayload);
        setters.setLastSavedCTA(sanitizedCta);
        setters.setLastSavedHeader(sanitizedHeader);
        setters.setLastSavedFooter(sanitizedFooter);
        setters.setLastSavedPageVisibility(settings.pageVisibility);
        setters.setLastSavedVisibleSections(settings.visibleSections);
        setters.setLastSavedBookingService(cleanBookingSteps.service);
        setters.setLastSavedBookingDate(cleanBookingSteps.date);
        setters.setLastSavedBookingTime(cleanBookingSteps.time);
        setters.setLastSavedBookingForm(cleanBookingSteps.form);
        setters.setLastSavedBookingConfirmation(cleanBookingSteps.confirmation);

        toast({
          title: "Site salvo localmente!",
          description: "As alterações foram salvas no navegador.",
        });
      }

      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));

      // LOGS DE DEPURAÇÃO PARA IDENTIFICAR POR QUE O BOTÃO DE PUBLICAR PODE ESTAR DESABILITADO
      console.log(
        ">>> [useEditorApi] Fim de handleSaveGlobal. hasUnsavedGlobalChanges:",
        hasUnsavedGlobalChanges,
      );
    },
    [
      companyId,
      isPublishing,
      setters,
      settings,
      lastSaved,
      toast,
      hasUnsavedGlobalChanges,
      setIsDirty,
      saveLocalDrafts,
      updateStudioInfo,
    ],
  );

  const handlePublish = useCallback(async () => {
    if (!companyId) return;

    setIsPublishing(true);
    setIsSaving(true);
    try {
      console.log(">>> [useEditorApi] Iniciando publicação global...");

      // 1. Primeiro salvamos qualquer rascunho pendente
      const changes = getChangedSettings();
      if (Object.keys(changes).length > 0) {
        console.log(
          ">>> [useEditorApi] Salvando rascunho antes de publicar...",
        );
        await handleSaveGlobal(false); // Salva sem recarregar do banco ainda
      }

      // 2. Disparamos a publicação (copiar rascunho -> principal)
      const success =
        await siteCustomizerService.publishCustomization(companyId);

      if (success) {
        toast({
          title: "Site Publicado!",
          description:
            "As alterações agora estão visíveis para todos os clientes.",
        });

        // 3. Recarregar do banco para garantir sincronia total
        await fetchCustomization(companyId);

        // 4. ATUALIZAR ESTADOS LAST_APPLIED PARA REFLETIR QUE O RASCUNHO FOI PUBLICADO
        // Isso fará com que hasUnsavedGlobalChanges se torne FALSE após a publicação
        setters.setLastAppliedHero(settings.heroSettings);
        setters.setLastAppliedAboutHero(settings.aboutHeroSettings);
        setters.setLastAppliedStory(settings.storySettings);
        setters.setLastAppliedTeam(settings.teamSettings);
        setters.setLastAppliedTestimonials(settings.testimonialsSettings);
        setters.setLastAppliedFont(settings.fontSettings);
        setters.setLastAppliedColor(settings.colorSettings);
        setters.setLastAppliedServices(settings.servicesSettings);
        setters.setLastAppliedHomeValues(settings.homeValuesSettings);
        setters.setLastAppliedAboutUsValues(settings.aboutUsValuesSettings);
        setters.setLastAppliedGallery(settings.gallerySettings);
        setters.setLastAppliedGalleryPage(settings.galleryPageSettings);
        setters.setLastAppliedCTA(settings.ctaSettings);
        setters.setLastAppliedHeader(settings.headerSettings);
        setters.setLastAppliedFooter(settings.footerSettings);

        setters.setLastAppliedBookingService(settings.bookingServiceSettings);
        setters.setLastAppliedBookingDate(settings.bookingDateSettings);
        setters.setLastAppliedBookingTime(settings.bookingTimeSettings);
        setters.setLastAppliedBookingForm(settings.bookingFormSettings);
        setters.setLastAppliedBookingConfirmation(
          settings.bookingConfirmationSettings,
        );
      } else {
        toast({
          title: "Erro ao publicar",
          description:
            "Não foi possível publicar as alterações. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(">>> [useEditorApi] Erro ao publicar:", err);
      toast({
        title: "Erro de rede",
        description: "Falha na comunicação com o servidor.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  }, [
    companyId,
    toast,
    handleSaveGlobal,
    getChangedSettings,
    fetchCustomization,
    setters,
    settings,
  ]);

  // --- NOVO: Efeito para Auto-Save no Banco ---
  useEffect(() => {
    const handleLocalChange = () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Debounce de 3 segundos para evitar excesso de requisições ao banco
      autoSaveTimerRef.current = setTimeout(() => {
        console.log(
          ">>> [AutoSave] Mudança local detectada via evento. Sincronizando com o banco...",
        );
        // Chama o save global sem recarregar do banco
        // para manter a fluidez da edição e evitar sobrescrever rascunhos locais em progresso.
        handleSaveGlobal(false);
      }, 3000);
    };

    window.addEventListener("local_draft_changed", handleLocalChange);
    return () => {
      window.removeEventListener("local_draft_changed", handleLocalChange);
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [handleSaveGlobal]);

  return {
    fetchCustomization,
    getChangedSettings,
    handleSaveLocal,
    handleSaveGlobal,
    handlePublish,
    hasUnsavedGlobalChanges,
    isFetching,
    isSaving,
    isPublishing,
    fetchError,
  };
}
