"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useStudio } from "@/context/studio-context";
import {
  type ColorSettings,
  defaultColorSettings,
  defaultFontSettings,
  type FontSettings,
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
  sanitizeColor,
} from "@/lib/booking-data";
import type {
  LayoutGlobalSettings,
  SiteConfigData,
} from "@/lib/site-config-types";
import { useEditorState } from "./admin/site_editor/hooks/use-editor-state";

// Extender FontSettings para incluir extraFonts
type ExtendedFontSettings = FontSettings & { extraFonts?: string[] };

export interface ThemeInjectorProps {
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
}

export function ThemeInjector({ iframeRef }: ThemeInjectorProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { studio, isLoading } = useStudio();
  const {
    isInitialized,
    setIsInitialized,
    colorSettings,
    fontSettings,
    heroSettings,
    servicesSettings,
    homeValuesSettings,
    aboutUsValuesSettings,
    teamSettings,
    testimonialsSettings,
    ctaSettings,
    headerSettings,
    footerSettings,
    gallerySettings,
    galleryPageSettings,
    storySettings,
    bookingServiceSettings,
    bookingDateSettings,
    bookingTimeSettings,
    bookingFormSettings,
    bookingConfirmationSettings,
  } = useEditorState();
  const isEditorPreview = !!iframeRef;
  const isPreviewPage = !!searchParams?.get("preview");

  const loadSettings = useCallback((): {
    colors: ColorSettings;
    fonts: ExtendedFontSettings;
    sectionStyles: Record<string, string>;
  } => {
    if (isEditorPreview) {
      const resolvedColors: ColorSettings = {
        ...defaultColorSettings,
        ...colorSettings,
      };
      const resolvedFonts: FontSettings = {
        ...defaultFontSettings,
        ...fontSettings,
      };

      const extraFonts = new Set<string>();
      if (heroSettings?.titleFont) extraFonts.add(heroSettings.titleFont);
      if (heroSettings?.subtitleFont) extraFonts.add(heroSettings.subtitleFont);
      if (servicesSettings?.titleFont)
        extraFonts.add(servicesSettings.titleFont);
      if (servicesSettings?.subtitleFont)
        extraFonts.add(servicesSettings.subtitleFont);
      if (servicesSettings?.cardTitleFont)
        extraFonts.add(servicesSettings.cardTitleFont);
      if (servicesSettings?.cardDescriptionFont)
        extraFonts.add(servicesSettings.cardDescriptionFont);
      if (servicesSettings?.cardPriceFont)
        extraFonts.add(servicesSettings.cardPriceFont);
      if (homeValuesSettings?.titleFont)
        extraFonts.add(homeValuesSettings.titleFont);
      if (homeValuesSettings?.subtitleFont)
        extraFonts.add(homeValuesSettings.subtitleFont);
      if (homeValuesSettings?.cardTitleFont)
        extraFonts.add(homeValuesSettings.cardTitleFont);
      if (homeValuesSettings?.cardDescriptionFont)
        extraFonts.add(homeValuesSettings.cardDescriptionFont);
      if (aboutUsValuesSettings?.titleFont)
        extraFonts.add(aboutUsValuesSettings.titleFont);
      if (aboutUsValuesSettings?.subtitleFont)
        extraFonts.add(aboutUsValuesSettings.subtitleFont);
      if (aboutUsValuesSettings?.cardTitleFont)
        extraFonts.add(aboutUsValuesSettings.cardTitleFont);
      if (aboutUsValuesSettings?.cardDescriptionFont)
        extraFonts.add(aboutUsValuesSettings.cardDescriptionFont);
      if (teamSettings?.titleFont) extraFonts.add(teamSettings.titleFont);
      if (teamSettings?.subtitleFont) extraFonts.add(teamSettings.subtitleFont);
      if (testimonialsSettings?.titleFont)
        extraFonts.add(testimonialsSettings.titleFont);
      if (testimonialsSettings?.subtitleFont)
        extraFonts.add(testimonialsSettings.subtitleFont);
      if (ctaSettings?.titleFont) extraFonts.add(ctaSettings.titleFont);
      if (ctaSettings?.subtitleFont) extraFonts.add(ctaSettings.subtitleFont);
      if (headerSettings?.titleFont) extraFonts.add(headerSettings.titleFont);
      if (headerSettings?.linksFont) extraFonts.add(headerSettings.linksFont);
      if (footerSettings?.titleFont) extraFonts.add(footerSettings.titleFont);
      if (gallerySettings?.titleFont) extraFonts.add(gallerySettings.titleFont);
      if (gallerySettings?.subtitleFont)
        extraFonts.add(gallerySettings.subtitleFont);
      if (gallerySettings?.buttonFont)
        extraFonts.add(gallerySettings.buttonFont);
      if (galleryPageSettings?.titleFont)
        extraFonts.add(galleryPageSettings.titleFont);
      if (galleryPageSettings?.subtitleFont)
        extraFonts.add(galleryPageSettings.subtitleFont);
      if (storySettings?.titleFont) extraFonts.add(storySettings.titleFont);
      if (storySettings?.contentFont) extraFonts.add(storySettings.contentFont);

      const sectionStyles: Record<string, string> = {};
      if (heroSettings?.titleColor)
        sectionStyles["--hero-title"] = heroSettings.titleColor;
      if (heroSettings?.subtitleColor)
        sectionStyles["--hero-subtitle"] = heroSettings.subtitleColor;

      const bookingBg =
        sanitizeColor(bookingServiceSettings?.bgColor) ||
        sanitizeColor(bookingDateSettings?.bgColor) ||
        sanitizeColor(bookingTimeSettings?.bgColor) ||
        sanitizeColor(bookingFormSettings?.bgColor) ||
        sanitizeColor(bookingConfirmationSettings?.bgColor) ||
        resolvedColors.background;
      if (bookingBg) sectionStyles["--booking-background"] = bookingBg;

      const cardBg =
        sanitizeColor(bookingServiceSettings?.cardBgColor) ||
        sanitizeColor(bookingDateSettings?.cardBgColor) ||
        sanitizeColor(bookingTimeSettings?.cardBgColor) ||
        sanitizeColor(bookingFormSettings?.cardBgColor) ||
        sanitizeColor(bookingConfirmationSettings?.cardBgColor);
      if (cardBg) sectionStyles["--card-background"] = cardBg;

      return {
        colors: resolvedColors,
        fonts: { ...resolvedFonts, extraFonts: Array.from(extraFonts) },
        sectionStyles,
      };
    }

    if (isPreviewPage) {
      const resolvedColors: ColorSettings = {
        ...defaultColorSettings,
        ...getColorSettings(),
      };
      const resolvedFonts: FontSettings = {
        ...defaultFontSettings,
        ...getFontSettings(),
      };

      const heroSettings = getHeroSettings();
      const servicesSettings = getServicesSettings();
      const homeValuesSettings = getHomeValuesSettings();
      const aboutUsValuesSettings = getAboutUsValuesSettings();
      const teamSettings = getTeamSettings();
      const testimonialsSettings = getTestimonialsSettings();
      const ctaSettings = getCTASettings();
      const headerSettings = getHeaderSettings();
      const footerSettings = getFooterSettings();
      const gallerySettings = getGallerySettings();
      const galleryPageSettings = getGalleryPageSettings();
      const storySettings = getStorySettings();

      const bookingServiceSettings = getBookingServiceSettings();
      const bookingDateSettings = getBookingDateSettings();
      const bookingTimeSettings = getBookingTimeSettings();
      const bookingFormSettings = getBookingFormSettings();
      const bookingConfirmationSettings = getBookingConfirmationSettings();

      const extraFonts = new Set<string>();
      if (heroSettings?.titleFont) extraFonts.add(heroSettings.titleFont);
      if (heroSettings?.subtitleFont) extraFonts.add(heroSettings.subtitleFont);
      if (servicesSettings?.titleFont)
        extraFonts.add(servicesSettings.titleFont);
      if (servicesSettings?.subtitleFont)
        extraFonts.add(servicesSettings.subtitleFont);
      if (servicesSettings?.cardTitleFont)
        extraFonts.add(servicesSettings.cardTitleFont);
      if (servicesSettings?.cardDescriptionFont)
        extraFonts.add(servicesSettings.cardDescriptionFont);
      if (servicesSettings?.cardPriceFont)
        extraFonts.add(servicesSettings.cardPriceFont);
      if (homeValuesSettings?.titleFont)
        extraFonts.add(homeValuesSettings.titleFont);
      if (homeValuesSettings?.subtitleFont)
        extraFonts.add(homeValuesSettings.subtitleFont);
      if (homeValuesSettings?.cardTitleFont)
        extraFonts.add(homeValuesSettings.cardTitleFont);
      if (homeValuesSettings?.cardDescriptionFont)
        extraFonts.add(homeValuesSettings.cardDescriptionFont);
      if (aboutUsValuesSettings?.titleFont)
        extraFonts.add(aboutUsValuesSettings.titleFont);
      if (aboutUsValuesSettings?.subtitleFont)
        extraFonts.add(aboutUsValuesSettings.subtitleFont);
      if (aboutUsValuesSettings?.cardTitleFont)
        extraFonts.add(aboutUsValuesSettings.cardTitleFont);
      if (aboutUsValuesSettings?.cardDescriptionFont)
        extraFonts.add(aboutUsValuesSettings.cardDescriptionFont);
      if (teamSettings?.titleFont) extraFonts.add(teamSettings.titleFont);
      if (teamSettings?.subtitleFont) extraFonts.add(teamSettings.subtitleFont);
      if (testimonialsSettings?.titleFont)
        extraFonts.add(testimonialsSettings.titleFont);
      if (testimonialsSettings?.subtitleFont)
        extraFonts.add(testimonialsSettings.subtitleFont);
      if (ctaSettings?.titleFont) extraFonts.add(ctaSettings.titleFont);
      if (ctaSettings?.subtitleFont) extraFonts.add(ctaSettings.subtitleFont);
      if (headerSettings?.titleFont) extraFonts.add(headerSettings.titleFont);
      if (headerSettings?.linksFont) extraFonts.add(headerSettings.linksFont);
      if (footerSettings?.titleFont) extraFonts.add(footerSettings.titleFont);
      if (gallerySettings?.titleFont) extraFonts.add(gallerySettings.titleFont);
      if (gallerySettings?.subtitleFont)
        extraFonts.add(gallerySettings.subtitleFont);
      if (gallerySettings?.buttonFont)
        extraFonts.add(gallerySettings.buttonFont);
      if (galleryPageSettings?.titleFont)
        extraFonts.add(galleryPageSettings.titleFont);
      if (galleryPageSettings?.subtitleFont)
        extraFonts.add(galleryPageSettings.subtitleFont);
      if (storySettings?.titleFont) extraFonts.add(storySettings.titleFont);
      if (storySettings?.contentFont) extraFonts.add(storySettings.contentFont);

      const sectionStyles: Record<string, string> = {};
      if (heroSettings?.titleColor)
        sectionStyles["--hero-title"] = heroSettings.titleColor;
      if (heroSettings?.subtitleColor)
        sectionStyles["--hero-subtitle"] = heroSettings.subtitleColor;

      const bookingBg =
        sanitizeColor(bookingServiceSettings?.bgColor) ||
        sanitizeColor(bookingDateSettings?.bgColor) ||
        sanitizeColor(bookingTimeSettings?.bgColor) ||
        sanitizeColor(bookingFormSettings?.bgColor) ||
        sanitizeColor(bookingConfirmationSettings?.bgColor) ||
        resolvedColors.background;
      if (bookingBg) sectionStyles["--booking-background"] = bookingBg;

      const cardBg =
        sanitizeColor(bookingServiceSettings?.cardBgColor) ||
        sanitizeColor(bookingDateSettings?.cardBgColor) ||
        sanitizeColor(bookingTimeSettings?.cardBgColor) ||
        sanitizeColor(bookingFormSettings?.cardBgColor) ||
        sanitizeColor(bookingConfirmationSettings?.cardBgColor);
      if (cardBg) sectionStyles["--card-background"] = cardBg;

      return {
        colors: resolvedColors,
        fonts: { ...resolvedFonts, extraFonts: Array.from(extraFonts) },
        sectionStyles,
      };
    }

    if (studio?.config) {
      console.log(">>> [THEME] Carregando tema a partir do Banco de Dados");
      const config = studio.config as SiteConfigData;
      const siteCustomization =
        config.siteCustomization || config.site_customization;
      const layoutGlobal = (siteCustomization?.layoutGlobal ||
        siteCustomization?.layout_global) as LayoutGlobalSettings | undefined;

      const siteColors = (layoutGlobal?.siteColors ||
        layoutGlobal?.cores_base) as Record<string, unknown> | undefined;
      const siteFonts = (layoutGlobal?.fontes || layoutGlobal?.typography) as
        | Record<string, unknown>
        | undefined;
      const badgeRecord =
        (siteColors?.specialtyBadge as Record<string, unknown>) ||
        (siteColors?.specialty_badge as Record<string, unknown>) ||
        {};

      const colorSettings = {
        primary:
          (siteColors?.primary as string) ||
          config.colors?.primary ||
          defaultColorSettings.primary,
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
          (siteColors?.primary as string) ||
          config.colors?.accent ||
          defaultColorSettings.primary,
        secondary:
          (siteColors?.secondary as string) ||
          config.colors?.secondary ||
          defaultColorSettings.secondary,
        buttonText:
          (siteColors?.buttonText as string) ||
          config.colors?.buttonText ||
          defaultColorSettings.buttonText,
        specialtyBadge: {
          background:
            (badgeRecord.background as string) ||
            defaultColorSettings.specialtyBadge.background,
          text:
            (badgeRecord.text as string) ||
            defaultColorSettings.specialtyBadge.text,
          borderRadius:
            (badgeRecord.borderRadius as string) ||
            (badgeRecord.border_radius as string) ||
            defaultColorSettings.specialtyBadge.borderRadius,
        },
      };

      const fontSettings = {
        bodyFont:
          (siteFonts?.bodyFont as string) ||
          config.typography?.bodyFont ||
          config.theme?.bodyFont ||
          defaultFontSettings.bodyFont,
        headingFont:
          (siteFonts?.headingFont as string) ||
          config.typography?.headingFont ||
          config.theme?.headingFont ||
          defaultFontSettings.headingFont,
        subtitleFont:
          (siteFonts?.subtitleFont as string) ||
          config.typography?.subtitleFont ||
          config.theme?.subtitleFont ||
          defaultFontSettings.subtitleFont,
      };

      const sectionStyles: Record<string, string> = {};
      if (config.hero?.appearance?.titleColor)
        sectionStyles["--hero-title"] = config.hero.appearance.titleColor;
      if (config.hero?.appearance?.subtitleColor)
        sectionStyles["--hero-subtitle"] = config.hero.appearance.subtitleColor;

      const layoutBookingSteps = ((layoutGlobal as Record<string, unknown>)
        ?.bookingSteps ||
        (layoutGlobal as Record<string, unknown>)?.appointmentFlow) as
        | SiteConfigData["bookingSteps"]
        | undefined;
      const layoutBookingLegacy =
        (layoutGlobal as Record<string, unknown>)?.bookingService ||
        (layoutGlobal as Record<string, unknown>)?.bookingDate ||
        (layoutGlobal as Record<string, unknown>)?.bookingTime ||
        (layoutGlobal as Record<string, unknown>)?.bookingForm ||
        (layoutGlobal as Record<string, unknown>)?.bookingConfirmation
          ? ({
              service: (layoutGlobal as Record<string, unknown>)
                ?.bookingService,
              date: (layoutGlobal as Record<string, unknown>)?.bookingDate,
              time: (layoutGlobal as Record<string, unknown>)?.bookingTime,
              form: (layoutGlobal as Record<string, unknown>)?.bookingForm,
              confirmation: (layoutGlobal as Record<string, unknown>)
                ?.bookingConfirmation,
            } as SiteConfigData["bookingSteps"])
          : undefined;

      const appointmentFlow = (config.appointmentFlow ||
        config.appointment_flow) as Record<string, unknown> | undefined;

      // 1. Fundo do Agendamento: appointmentFlow.colors.background
      const appointmentFlowColors = (appointmentFlow?.colors ||
        appointmentFlow?.cores) as Record<string, string> | undefined;
      const bookingBg = sanitizeColor(
        (appointmentFlowColors?.background as string) ||
          (siteColors?.background as string) ||
          (config.colors?.background as string) ||
          defaultColorSettings.background,
      );
      if (bookingBg) {
        sectionStyles["--booking-background"] = bookingBg;
      }

      const step1Services =
        (appointmentFlow?.step1Services as Record<string, unknown>) ||
        (appointmentFlow?.step1_services as Record<string, unknown>) ||
        (appointmentFlow?.step1_service as Record<string, unknown>);
      const step1CardConfig =
        (step1Services?.cardConfig as Record<string, unknown>) ||
        (step1Services?.card_config as Record<string, unknown>);
      const cardBgFromFlow = sanitizeColor(
        (step1CardConfig?.backgroundColor as string) ||
          (step1CardConfig?.cardBackgroundColor as string) ||
          (step1CardConfig?.background_color as string) ||
          (step1CardConfig?.card_background_color as string),
      );

      const bookingSteps = (appointmentFlow ||
        config.bookingSteps ||
        layoutBookingSteps ||
        layoutBookingLegacy) as SiteConfigData["bookingSteps"];
      const cardBg =
        bookingSteps?.service?.appearance?.cardBgColor ||
        (bookingSteps?.service as Record<string, unknown> | undefined)
          ?.cardBgColor ||
        cardBgFromFlow;
      if (cardBg) {
        sectionStyles["--card-background"] = cardBg as string;
      } else if (layoutGlobal?.card_bg_color) {
        sectionStyles["--card-background"] = layoutGlobal.card_bg_color;
      }

      // Coleta de Fontes Extras (Seções)
      const extraFonts = new Set<string>();

      // Hero
      const hero = config.hero as Record<string, unknown> | undefined;
      const heroContent = hero?.content as Record<string, unknown> | undefined;
      const heroAppearance = hero?.appearance as
        | Record<string, unknown>
        | undefined;

      const heroTitleFont =
        (heroAppearance?.titleFont as string) ||
        (heroContent?.titleFont as string) ||
        (hero?.titleFont as string);
      if (heroTitleFont) extraFonts.add(heroTitleFont);

      const heroSubtitleFont =
        (heroAppearance?.subtitleFont as string) ||
        (heroContent?.subtitleFont as string) ||
        (hero?.subtitleFont as string);
      if (heroSubtitleFont) extraFonts.add(heroSubtitleFont);

      // Services
      const services = config.services as Record<string, unknown> | undefined;
      const servicesAppearance = services?.appearance as
        | Record<string, unknown>
        | undefined;
      if (servicesAppearance?.titleFont)
        extraFonts.add(servicesAppearance.titleFont as string);
      if (servicesAppearance?.subtitleFont)
        extraFonts.add(servicesAppearance.subtitleFont as string);
      if (servicesAppearance?.cardTitleFont)
        extraFonts.add(servicesAppearance.cardTitleFont as string);
      if (servicesAppearance?.cardDescriptionFont)
        extraFonts.add(servicesAppearance.cardDescriptionFont as string);
      if (servicesAppearance?.cardPriceFont)
        extraFonts.add(servicesAppearance.cardPriceFont as string);

      return {
        colors: colorSettings,
        fonts: { ...fontSettings, extraFonts: Array.from(extraFonts) },
        sectionStyles,
      };
    }

    return {
      colors: defaultColorSettings,
      fonts: { ...defaultFontSettings, extraFonts: [] },
      sectionStyles: {} as Record<string, string>,
    };
  }, [
    isEditorPreview,
    isPreviewPage,
    colorSettings,
    fontSettings,
    heroSettings,
    servicesSettings,
    homeValuesSettings,
    aboutUsValuesSettings,
    teamSettings,
    testimonialsSettings,
    ctaSettings,
    headerSettings,
    footerSettings,
    gallerySettings,
    galleryPageSettings,
    storySettings,
    bookingServiceSettings,
    bookingDateSettings,
    bookingTimeSettings,
    bookingFormSettings,
    bookingConfirmationSettings,
    studio?.config,
  ]);

  const {
    colors: initialColors,
    fonts: initialFonts,
    sectionStyles: initialSectionStyles,
  } = loadSettings();

  const [colors, setColors] = useState<ColorSettings | null>(initialColors);
  const [fonts, setFonts] = useState<ExtendedFontSettings | null>(initialFonts);
  const [sectionStyles, setSectionStyles] =
    useState<Record<string, string>>(initialSectionStyles);

  useEffect(() => {
    const { colors: c, fonts: f, sectionStyles: s } = loadSettings();
    setColors(c);
    setFonts(f);
    setSectionStyles(s);
  }, [loadSettings]);

  // Páginas que NÃO devem receber o tema customizado (usam cores base/fixas)
  const isFixedColorPage =
    pathname === "/admin" ||
    pathname?.startsWith("/admin/register") ||
    pathname?.startsWith("/admin/login");

  useEffect(() => {
    if (!isLoading && studio?.config && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isLoading, studio?.config, isInitialized, setIsInitialized]);

  // 3. Escuta Reativa Global: Sincroniza o estado local com o studio e eventos do editor
  useEffect(() => {
    if (isFixedColorPage) return;

    const updateTheme = () => {
      const {
        colors: newColors,
        fonts: newFonts,
        sectionStyles: newSectionStyles,
      } = loadSettings();
      setColors(newColors);
      setFonts(newFonts);
      setSectionStyles(newSectionStyles);
    };

    updateTheme();

    // Escutar eventos de atualização do editor (mesma aba)
    window.addEventListener("colorSettingsUpdated", updateTheme);
    window.addEventListener("fontSettingsUpdated", updateTheme);
    window.addEventListener("editorSettingsUpdated", updateTheme);
    window.addEventListener("DataReady", updateTheme);

    // Sincronia de Preview (postMessage para o iframe)
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_COLORS") {
        setColors(event.data.settings);
      } else if (event.data.type === "UPDATE_TYPOGRAPHY") {
        setFonts((prev) =>
          prev ? { ...prev, ...event.data.settings } : event.data.settings,
        );
      } else if (event.data.type === "UPDATE_HERO_SETTINGS") {
        console.log(">>> [THEME] Recebido update HERO:", event.data.settings);
        setFonts((prev) => {
          // Se prev for null, tentamos recuperar do loadSettings ou usamos default
          const current = prev || loadSettings().fonts;
          const newExtras = new Set(current.extraFonts || []);
          const settings = event.data.settings;

          if (settings?.titleFont) {
            console.log(
              ">>> [THEME] Adicionando fonte extra (Hero Title):",
              settings.titleFont,
            );
            newExtras.add(settings.titleFont);
          }
          if (settings?.subtitleFont) {
            console.log(
              ">>> [THEME] Adicionando fonte extra (Hero Subtitle):",
              settings.subtitleFont,
            );
            newExtras.add(settings.subtitleFont);
          }

          return { ...current, extraFonts: Array.from(newExtras) };
        });
      } else if (event.data.type === "UPDATE_SERVICES_SETTINGS") {
        console.log(
          ">>> [THEME] Recebido update SERVICES:",
          event.data.settings,
        );
        setFonts((prev) => {
          const current = prev || loadSettings().fonts;
          const newExtras = new Set(current.extraFonts || []);
          const settings = event.data.settings;

          if (settings?.titleFont) newExtras.add(settings.titleFont);
          if (settings?.subtitleFont) newExtras.add(settings.subtitleFont);
          if (settings?.cardTitleFont) newExtras.add(settings.cardTitleFont);
          if (settings?.cardDescriptionFont)
            newExtras.add(settings.cardDescriptionFont);
          if (settings?.cardPriceFont) newExtras.add(settings.cardPriceFont);

          return { ...current, extraFonts: Array.from(newExtras) };
        });
      } else if (
        event.data.type === "UPDATE_TEAM_SETTINGS" ||
        event.data.type === "UPDATE_TESTIMONIALS_SETTINGS" ||
        event.data.type === "UPDATE_HOME_VALUES_SETTINGS" ||
        event.data.type === "UPDATE_ABOUT_US_VALUES_SETTINGS" ||
        event.data.type === "UPDATE_CTA_SETTINGS" ||
        event.data.type === "UPDATE_HEADER_SETTINGS" ||
        event.data.type === "UPDATE_FOOTER_SETTINGS" ||
        event.data.type === "UPDATE_GALLERY_PREVIEW" ||
        event.data.type === "UPDATE_GALLERY_SETTINGS" ||
        event.data.type === "UPDATE_GALLERY_PAGE" ||
        event.data.type === "UPDATE_GALLERY_PAGE_SETTINGS" ||
        event.data.type === "UPDATE_STORY_SETTINGS" ||
        event.data.type === "UPDATE_ABOUT_HERO_SETTINGS"
      ) {
        console.log(
          `>>> [THEME] Recebido update para seção ${event.data.type}:`,
          event.data.settings,
        );
        setFonts((prev) => {
          const current = prev || loadSettings().fonts;
          const newExtras = new Set(current.extraFonts || []);
          const settings = event.data.settings;

          if (!settings) return current;

          // Mapeamento genérico de fontes comuns em seções
          if (settings.titleFont) newExtras.add(settings.titleFont);
          if (settings.subtitleFont) newExtras.add(settings.subtitleFont);
          if (settings.cardTitleFont) newExtras.add(settings.cardTitleFont);
          if (settings.cardDescriptionFont)
            newExtras.add(settings.cardDescriptionFont);
          if (settings.cardPriceFont) newExtras.add(settings.cardPriceFont);
          if (settings.cardRoleFont) newExtras.add(settings.cardRoleFont);
          if (settings.cardNameFont) newExtras.add(settings.cardNameFont);
          if (settings.cardTextFont) newExtras.add(settings.cardTextFont);
          if (settings.buttonFont) newExtras.add(settings.buttonFont);
          if (settings.linksFont) newExtras.add(settings.linksFont);
          if (settings.bodyFont) newExtras.add(settings.bodyFont);
          if (settings.contentFont) newExtras.add(settings.contentFont);

          return { ...current, extraFonts: Array.from(newExtras) };
        });
      } else if (
        event.data.type === "UPDATE_EDITOR_STATE" ||
        event.data.type === "UPDATE_SITE_DATA"
      ) {
        // Quando o estado completo mudar, recarregamos tudo
        console.log(
          `>>> [THEME] Recebido ${event.data.type}, recarregando tema completo`,
        );
        updateTheme();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("colorSettingsUpdated", updateTheme);
      window.removeEventListener("fontSettingsUpdated", updateTheme);
      window.removeEventListener("editorSettingsUpdated", updateTheme);
      window.removeEventListener("DataReady", updateTheme);
      window.removeEventListener("message", handleMessage);
    };
  }, [isFixedColorPage, loadSettings]);

  useEffect(() => {
    if (isFixedColorPage || !colors || !fonts) return;

    // Forçar Injeção Direta no DOM (:root) e carregar fontes
    const applyToDocument = (doc: Document) => {
      const root = doc.documentElement;
      console.log(
        ">>> [THEME] Injetando estilos e fontes no documento:",
        fonts,
      );

      // 1. Injetar Link do Google Fonts
      const fontFamilies = new Set<string>();
      const defaultFonts = ["Inter", "Playfair Display"];

      if (fonts.headingFont && !defaultFonts.includes(fonts.headingFont))
        fontFamilies.add(fonts.headingFont.replace(/\s+/g, "+"));
      if (fonts.subtitleFont && !defaultFonts.includes(fonts.subtitleFont))
        fontFamilies.add(fonts.subtitleFont.replace(/\s+/g, "+"));
      if (fonts.bodyFont && !defaultFonts.includes(fonts.bodyFont))
        fontFamilies.add(fonts.bodyFont.replace(/\s+/g, "+"));

      // Adicionar fontes extras coletadas
      if (fonts.extraFonts) {
        fonts.extraFonts.forEach((font) => {
          if (font && !defaultFonts.includes(font)) {
            fontFamilies.add(font.replace(/\s+/g, "+"));
          }
        });
      }

      const familiesArray = Array.from(fontFamilies);
      if (familiesArray.length > 0) {
        const googleFontsUrl = `https://fonts.googleapis.com/css2?${familiesArray.map((f) => `family=${f}:wght@400;500;600;700;800;900`).join("&")}&display=swap`;

        let link = doc.getElementById(
          "dynamic-google-fonts",
        ) as HTMLLinkElement;
        if (!link) {
          link = doc.createElement("link");
          link.id = "dynamic-google-fonts";
          link.rel = "stylesheet";
          doc.head.appendChild(link);
        }
        if (link.href !== googleFontsUrl) {
          link.href = googleFontsUrl;
        }
      }

      // Fonts Variables
      if (fonts.bodyFont) {
        root.style.setProperty(
          "--font-body",
          `"${fonts.bodyFont}", sans-serif`,
        );
        root.style.setProperty(
          "--font-sans",
          `"${fonts.bodyFont}", sans-serif`,
        );
      }
      if (fonts.headingFont) {
        root.style.setProperty("--font-title", `"${fonts.headingFont}", serif`);
        root.style.setProperty("--font-serif", `"${fonts.headingFont}", serif`);
      }
      if (fonts.subtitleFont) {
        root.style.setProperty(
          "--font-subtitle",
          `"${fonts.subtitleFont}", sans-serif`,
        );
      }

      // Colors (Alinhado com Shadcn/UI e Tailwind)
      if (colors.primary) {
        root.style.setProperty("--primary", colors.primary);
        root.style.setProperty("--ring", colors.primary);
      }
      if (colors.secondary) {
        root.style.setProperty("--secondary", colors.secondary);
        root.style.setProperty("--accent", colors.secondary);
        root.style.setProperty("--muted", `${colors.secondary}1a`);
      }
      if (colors.background) {
        root.style.setProperty("--background", colors.background);
        root.style.setProperty("--card", colors.background);
        root.style.setProperty("--card-bg", colors.background);
        root.style.setProperty("--popover", colors.background);
        if (doc.body) doc.body.style.backgroundColor = colors.background;
      }
      if (colors.text) {
        root.style.setProperty("--foreground", colors.text);
        root.style.setProperty("--card-foreground", colors.text);
        root.style.setProperty("--popover-foreground", colors.text);
        root.style.setProperty("--muted-foreground", `${colors.text}cc`);
      }
      if (colors.accent) {
        root.style.setProperty("--accent", colors.accent);
        root.style.setProperty(
          "--accent-foreground",
          colors.buttonText || "#ffffff",
        );
      }
      if (colors.buttonText) {
        root.style.setProperty("--primary-foreground", colors.buttonText);
        root.style.setProperty("--secondary-foreground", colors.buttonText);
      }

      // Section Specific Styles
      Object.entries(sectionStyles).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    };

    // Aplica no documento principal
    applyToDocument(document);

    // TASK 3: Sincronização de Iframe (Preview)
    // 1. Aplica imediatamente se o documento já estiver pronto
    if (iframeRef?.current?.contentDocument) {
      console.log(
        ">>> [THEME_IFRAME] Injetando variáveis CSS no Iframe (Imediato)",
      );
      applyToDocument(iframeRef.current.contentDocument);
    }

    // 2. Registra listener para quando o Iframe carregar (ou recarregar)
    const iframe = iframeRef?.current;
    const handleIframeLoad = () => {
      if (iframe?.contentDocument) {
        console.log(
          ">>> [THEME_IFRAME] Injetando variáveis CSS no Iframe (Evento Load)",
        );
        applyToDocument(iframe.contentDocument);
      }
    };

    if (iframe) {
      iframe.addEventListener("load", handleIframeLoad);
      return () => iframe.removeEventListener("load", handleIframeLoad);
    }
  }, [colors, fonts, sectionStyles, isFixedColorPage, iframeRef]);

  if (isFixedColorPage || !colors || !fonts) return null;

  // Geramos as URLs do Google Fonts
  const fontFamilies = new Set<string>();
  const defaultFonts = ["Inter", "Playfair Display"];

  if (fonts.headingFont && !defaultFonts.includes(fonts.headingFont))
    fontFamilies.add(fonts.headingFont.replace(/\s+/g, "+"));
  if (fonts.subtitleFont && !defaultFonts.includes(fonts.subtitleFont))
    fontFamilies.add(fonts.subtitleFont.replace(/\s+/g, "+"));
  if (fonts.bodyFont && !defaultFonts.includes(fonts.bodyFont))
    fontFamilies.add(fonts.bodyFont.replace(/\s+/g, "+"));

  // Adicionar fontes extras coletadas
  if (fonts.extraFonts) {
    fonts.extraFonts.forEach((font) => {
      if (font && !defaultFonts.includes(font)) {
        fontFamilies.add(font.replace(/\s+/g, "+"));
      }
    });
  }

  const familiesArray = Array.from(fontFamilies);
  const googleFontsUrl =
    familiesArray.length > 0
      ? `https://fonts.googleapis.com/css2?${familiesArray.map((f) => `family=${f}:wght@400;500;600;700;800;900`).join("&")}&display=swap`
      : "";

  return (
    <>
      {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
      <style>
        {`
        :root {
          /* Fonts */
          ${fonts.bodyFont ? `--font-body: "${fonts.bodyFont}", sans-serif; --font-sans: "${fonts.bodyFont}", sans-serif;` : ""}
          ${fonts.headingFont ? `--font-title: "${fonts.headingFont}", serif; --font-serif: "${fonts.headingFont}", serif;` : ""}
          ${fonts.subtitleFont ? `--font-subtitle: "${fonts.subtitleFont}", sans-serif;` : ""}
          
          /* Colors (Mapped to Shadcn/UI variables) */
          ${colors.primary ? `--primary: ${colors.primary}; --ring: ${colors.primary};` : ""}
          ${colors.secondary ? `--secondary: ${colors.secondary}; --accent: ${colors.secondary}; --muted: ${colors.secondary}1a;` : ""}
          ${colors.background ? `--background: ${colors.background}; --card: ${colors.background}; --card-bg: ${colors.background}; --popover: ${colors.background};` : ""}
          ${colors.text ? `--foreground: ${colors.text}; --card-foreground: ${colors.text}; --popover-foreground: ${colors.text}; --muted-foreground: ${colors.text}cc;` : ""}
          
          /* Section Specific Styles */
          ${Object.entries(sectionStyles)
            .map(([key, value]) => `${key}: ${value};`)
            .join("\n          ")}
        }
        
        /* Font Family Overrides */
        h1, h2, .font-serif, .font-title {
          font-family: ${fonts.headingFont ? `"${fonts.headingFont}", serif` : "inherit"};
        }

        h3, h4, .font-subtitle {
          font-family: ${fonts.subtitleFont ? `"${fonts.subtitleFont}", sans-serif` : "inherit"};
        }
        
        body, p, span, li, button, .font-sans, .font-body {
          font-family: ${fonts.bodyFont ? `"${fonts.bodyFont}", sans-serif` : "inherit"};
        }
      `}
      </style>
    </>
  );
}
