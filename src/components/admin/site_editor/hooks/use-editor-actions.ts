import { useCallback, useEffect, useRef } from "react";
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
  sanitizeColor,
} from "@/lib/booking-data";
import { siteCustomizerService } from "@/lib/site-customizer-service";
import type { BackgroundSettings } from "../components/BackgroundEditor";
import type { useEditorLocal } from "./use-editor-local";
import type { useEditorState } from "./use-editor-state";

interface UseEditorActionsProps {
  state: ReturnType<typeof useEditorState>;
  local: ReturnType<typeof useEditorLocal>;
  toast: (options: {
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
  }) => void;
  businessId: string;
}

const isVisualKey = (key: string) => {
  const k = key.toLowerCase();
  return (
    k.includes("color") ||
    k.includes("font") ||
    k.includes("bg") ||
    k.includes("opacity") ||
    k.includes("scale") ||
    k.includes("image") ||
    k.includes("icon") ||
    k.includes("shadow") ||
    k.includes("radius") ||
    k === "appearance"
  );
};

const applyDefaultVisuals = <T extends Record<string, unknown>>(
  current: T,
  defaults: T,
): T => {
  const next = { ...current } as Record<string, unknown>;
  for (const [key, value] of Object.entries(defaults)) {
    if (isVisualKey(key)) {
      if (key === "appearance" && value && typeof value === "object") {
        next[key] = {
          ...((next[key] as Record<string, unknown>) || {}),
          ...(value as Record<string, unknown>),
        };
      } else {
        next[key] = value;
      }
    }
  }

  return next as T;
};

const cloneValue = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const normalizeGalleryForPersistence = (
  rawSettings: GallerySettings,
): GallerySettings => {
  const rawRecord = rawSettings as Record<string, unknown>;
  const appearance =
    (rawRecord.appearance as Record<string, unknown> | undefined) || {};
  const bgColor =
    sanitizeColor(
      rawSettings.bgColor ||
        (rawRecord.backgroundColor as string | undefined) ||
        (rawRecord.bg_color as string | undefined) ||
        (rawRecord.background_color as string | undefined) ||
        (appearance.backgroundColor as string | undefined) ||
        (appearance.bgColor as string | undefined),
    ) || "";
  const cardBgColor =
    sanitizeColor(
      rawSettings.cardBgColor ||
        (rawRecord.cardBackgroundColor as string | undefined) ||
        (rawRecord.card_bg_color as string | undefined) ||
        (rawRecord.card_background_color as string | undefined) ||
        (appearance.cardBgColor as string | undefined) ||
        (appearance.cardBackgroundColor as string | undefined),
    ) || "";

  const normalized = {
    ...rawSettings,
    bgColor,
    cardBgColor,
    appearance: {
      ...appearance,
      backgroundColor: bgColor,
      bgColor,
      ...(cardBgColor
        ? {
            cardBgColor,
            cardBackgroundColor: cardBgColor,
          }
        : {}),
    },
  } as GallerySettings;

  const normalizedRecord = normalized as Record<string, unknown>;
  normalizedRecord.backgroundColor = bgColor;
  normalizedRecord.bg_color = bgColor;
  normalizedRecord.background_color = bgColor;
  if (cardBgColor) {
    normalizedRecord.cardBackgroundColor = cardBgColor;
    normalizedRecord.card_bg_color = cardBgColor;
    normalizedRecord.card_background_color = cardBgColor;
  }

  return normalized;
};

export function useEditorActions({
  state,
  local,
  toast,
  businessId,
}: UseEditorActionsProps) {
  const {
    activeSectionId,
    handleUpdateBackground: handleUpdateBackgroundState,
    handleUpdateCTA: handleUpdateCTAState,
    handleUpdateHero: handleUpdateHeroState,
    handleUpdateAboutHero: handleUpdateAboutHeroState,
    handleUpdateStory: handleUpdateStoryState,
    handleUpdateTeam: handleUpdateTeamState,
    handleUpdateTestimonials: handleUpdateTestimonialsState,
    handleUpdateFont: handleUpdateFontState,
    handleUpdateColors: handleUpdateColorsState,
    handleUpdateServices: handleUpdateServicesState,
    handleUpdateHomeValues: handleUpdateHomeValuesState,
    handleUpdateAboutUsValues: handleUpdateAboutUsValuesState,
    handleUpdateGalleryPreview: handleUpdateGalleryPreviewState,
    handleUpdateGalleryPage: handleUpdateGalleryPageState,
    handleUpdateHeader: handleUpdateHeaderState,
    handleUpdateFooter: handleUpdateFooterState,
    handleUpdateBookingService: handleUpdateBookingServiceState,
    handleUpdateBookingDate: handleUpdateBookingDateState,
    handleUpdateBookingTime: handleUpdateBookingTimeState,
    handleUpdateBookingForm: handleUpdateBookingFormState,
    handleUpdateBookingConfirmation: handleUpdateBookingConfirmationState,
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
    setHeroSettings,
    setAboutHeroSettings,
    setStorySettings,
    setTeamSettings,
    setTestimonialsSettings,
    setServicesSettings,
    setHomeValuesSettings,
    setAboutUsValuesSettings,
    setGallerySettings,
    setGalleryPageSettings,
    setCTASettings,
    setHeaderSettings,
    setFooterSettings,
    setColorSettings,
    setFontSettings,
    setBookingServiceSettings,
    setBookingDateSettings,
    setBookingTimeSettings,
    setBookingFormSettings,
    setBookingConfirmationSettings,
    setLastAppliedHero,
    setLastAppliedAboutHero,
    setLastAppliedStory,
    setLastAppliedTeam,
    setLastAppliedTestimonials,
    setLastAppliedFont,
    setLastAppliedColor,
    setLastAppliedServices,
    setLastAppliedHomeValues,
    setLastAppliedAboutUsValues,
    setLastAppliedGallery,
    setLastAppliedGalleryPage,
    setLastAppliedCTA,
    setLastAppliedHeader,
    setLastAppliedFooter,
    setLastAppliedBookingService,
    setLastAppliedBookingDate,
    setLastAppliedBookingTime,
    setLastAppliedBookingForm,
    setLastAppliedBookingConfirmation,
    setLastSavedHomeValues,
    setLastSavedAboutUsValues,
    baseSettingsRef,
  } = state;

  const saveTimersRef = useRef<Record<string, number>>({});
  const latestSettingsRef = useRef({
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
  });

  useEffect(() => {
    latestSettingsRef.current = {
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
    };
  }, [
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
  ]);

  const deleteOrphanImage = useCallback(
    async (url?: string) => {
      if (!url || !url.includes("/api/storage/")) return;
      try {
        await siteCustomizerService.deleteBackgroundImage(url, businessId);
      } catch (error) {
        console.error("Erro ao deletar imagem órfã:", error);
      }
    },
    [businessId],
  );

  const {
    clearLocalDrafts,
    saveColorSettings,
    saveFontSettings,
    saveHeroSettings,
    saveAboutHeroSettings,
    saveStorySettings,
    saveTeamSettings,
    saveTestimonialsSettings,
    saveServicesSettings,
    saveHomeValuesSettings,
    saveAboutUsValuesSettings,
    saveGallerySettings,
    saveGalleryPageSettings,
    saveCTASettings,
    saveHeaderSettings,
    saveFooterSettings,
    saveBookingServiceSettings,
    saveBookingDateSettings,
    saveBookingTimeSettings,
    saveBookingFormSettings,
    saveBookingConfirmationSettings,
  } = local;

  const persistDraftByKey = useCallback(
    (key: string) => {
      const latest = latestSettingsRef.current;
      const saveMap: Record<string, () => void> = {
        heroSettings: () => saveHeroSettings(latest.heroSettings),
        aboutHeroSettings: () =>
          saveAboutHeroSettings(latest.aboutHeroSettings),
        storySettings: () => saveStorySettings(latest.storySettings),
        teamSettings: () => saveTeamSettings(latest.teamSettings),
        testimonialsSettings: () =>
          saveTestimonialsSettings(latest.testimonialsSettings),
        fontSettings: () => saveFontSettings(latest.fontSettings),
        colorSettings: () => saveColorSettings(latest.colorSettings),
        servicesSettings: () => saveServicesSettings(latest.servicesSettings),
        homeValuesSettings: () =>
          saveHomeValuesSettings(latest.homeValuesSettings),
        aboutUsValuesSettings: () =>
          saveAboutUsValuesSettings(latest.aboutUsValuesSettings),
        gallerySettings: () => saveGallerySettings(latest.gallerySettings),
        galleryPageSettings: () =>
          saveGalleryPageSettings(latest.galleryPageSettings),
        ctaSettings: () => saveCTASettings(latest.ctaSettings),
        headerSettings: () => saveHeaderSettings(latest.headerSettings),
        footerSettings: () => saveFooterSettings(latest.footerSettings),
        bookingServiceSettings: () =>
          saveBookingServiceSettings(latest.bookingServiceSettings),
        bookingDateSettings: () =>
          saveBookingDateSettings(latest.bookingDateSettings),
        bookingTimeSettings: () =>
          saveBookingTimeSettings(latest.bookingTimeSettings),
        bookingFormSettings: () =>
          saveBookingFormSettings(latest.bookingFormSettings),
        bookingConfirmationSettings: () =>
          saveBookingConfirmationSettings(latest.bookingConfirmationSettings),
      };

      saveMap[key]?.();
    },
    [
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
      saveBookingServiceSettings,
      saveBookingDateSettings,
      saveBookingTimeSettings,
      saveBookingFormSettings,
      saveBookingConfirmationSettings,
    ],
  );

  const scheduleDraftSave = useCallback(
    (key: string) => {
      if (typeof window === "undefined") return;
      const timers = saveTimersRef.current;
      if (timers[key]) {
        window.clearTimeout(timers[key]);
      }
      timers[key] = window.setTimeout(() => {
        persistDraftByKey(key);
        window.dispatchEvent(new Event("local_draft_changed"));
        delete timers[key];
      }, 1000);
    },
    [persistDraftByKey],
  );

  const handleApplyHero = useCallback(() => {
    setLastAppliedHero(heroSettings);
    toast({
      title: "Sucesso",
      description: "Configurações do Hero aplicadas.",
    });
  }, [heroSettings, setLastAppliedHero, toast]);

  const handleApplyAboutHero = useCallback(() => {
    setLastAppliedAboutHero(aboutHeroSettings);
    toast({
      title: "Sucesso",
      description: "Configurações do Sobre aplicadas.",
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
    }
  }, [aboutHeroSettings, setLastAppliedAboutHero, toast]);

  const handleApplyStory = useCallback(() => {
    setLastAppliedStory(storySettings);
    toast({
      title: "Sucesso",
      description: "Configurações da História aplicadas.",
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
    }
  }, [storySettings, setLastAppliedStory, toast]);

  const handleApplyTeam = useCallback(() => {
    setLastAppliedTeam(teamSettings);
    toast({
      title: "Sucesso",
      description: "Configurações da Equipe aplicadas.",
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
    }
  }, [teamSettings, setLastAppliedTeam, toast]);

  const handleApplyTestimonials = useCallback(() => {
    setLastAppliedTestimonials(testimonialsSettings);
    toast({
      title: "Sucesso",
      description: "Configurações de Depoimentos aplicadas.",
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
    }
  }, [testimonialsSettings, setLastAppliedTestimonials, toast]);

  const handleApplyFont = useCallback(() => {
    setLastAppliedFont(fontSettings);
    toast({
      title: "Sucesso",
      description: "Configurações de Fontes aplicadas.",
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
    }
  }, [fontSettings, setLastAppliedFont, toast]);

  const handleApplyTypography = handleApplyFont;

  const handleApplyColors = useCallback(() => {
    setLastAppliedColor(colorSettings);
    toast({
      title: "Sucesso",
      description: "Configurações de Cores aplicadas.",
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("colorSettingsUpdated"));
    }
  }, [colorSettings, setLastAppliedColor, toast]);

  const handleApplyServices = useCallback(() => {
    setLastAppliedServices(servicesSettings);
    toast({
      title: "Sucesso",
      description: "Configurações de Serviços aplicadas.",
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
    }
  }, [servicesSettings, setLastAppliedServices, toast]);

  const handleApplyHomeValues = useCallback(() => {
    setLastAppliedHomeValues(homeValuesSettings);
    toast({
      title: "Sucesso",
      description: "Configurações de Valores aplicadas.",
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
    }
  }, [homeValuesSettings, setLastAppliedHomeValues, toast]);

  const handleApplyAboutUsValues = useCallback(() => {
    setLastAppliedAboutUsValues(aboutUsValuesSettings);
    toast({
      title: "Sucesso",
      description: "Configurações de Valores aplicadas.",
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
    }
  }, [aboutUsValuesSettings, setLastAppliedAboutUsValues, toast]);

  const handleApplyGallery = useCallback(() => {
    const normalizedGallery = normalizeGalleryForPersistence(gallerySettings);
    const normalizedGalleryPage =
      normalizeGalleryForPersistence(galleryPageSettings);
    if (activeSectionId === "gallery-grid") {
      setLastAppliedGalleryPage(normalizedGalleryPage);
    } else {
      setLastAppliedGallery(normalizedGallery);
    }
    toast({
      title: "Sucesso",
      description: "Configurações da Galeria aplicadas.",
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
    }
  }, [
    activeSectionId,
    galleryPageSettings,
    gallerySettings,
    setLastAppliedGallery,
    setLastAppliedGalleryPage,
    toast,
  ]);

  const handleApplyCTA = useCallback(() => {
    setLastAppliedCTA(ctaSettings);
    toast({ title: "Sucesso", description: "Configurações de CTA aplicadas." });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
    }
  }, [ctaSettings, setLastAppliedCTA, toast]);

  const handleApplyHeader = useCallback(() => {
    setLastAppliedHeader(headerSettings);
    toast({
      title: "Sucesso",
      description: "Configurações do Cabeçalho aplicadas.",
    });
  }, [headerSettings, setLastAppliedHeader, toast]);

  const handleApplyFooter = useCallback(() => {
    setLastAppliedFooter(footerSettings);
    toast({
      title: "Sucesso",
      description: "Configurações do Rodapé aplicadas.",
    });
  }, [footerSettings, setLastAppliedFooter, toast]);

  const handleApplyBookingService = useCallback(() => {
    setLastAppliedBookingService(bookingServiceSettings);
    toast({
      title: "Sucesso",
      description: "Configurações do Passo 1 aplicadas.",
    });
  }, [bookingServiceSettings, setLastAppliedBookingService, toast]);

  const handleApplyBookingDate = useCallback(() => {
    setLastAppliedBookingDate(bookingDateSettings);
    toast({
      title: "Sucesso",
      description: "Configurações do Passo 2 aplicadas.",
    });
  }, [bookingDateSettings, setLastAppliedBookingDate, toast]);

  const handleApplyBookingTime = useCallback(() => {
    setLastAppliedBookingTime(bookingTimeSettings);
    toast({
      title: "Sucesso",
      description: "Configurações do Passo 3 aplicadas.",
    });
  }, [bookingTimeSettings, setLastAppliedBookingTime, toast]);

  const handleApplyBookingForm = useCallback(() => {
    setLastAppliedBookingForm(bookingFormSettings);
    toast({
      title: "Sucesso",
      description: "Configurações do Passo 4 aplicadas.",
    });
  }, [bookingFormSettings, setLastAppliedBookingForm, toast]);

  const handleApplyBookingConfirmation = useCallback(() => {
    setLastAppliedBookingConfirmation(bookingConfirmationSettings);
    toast({
      title: "Sucesso",
      description: "Configurações de Confirmação aplicadas.",
    });
  }, [bookingConfirmationSettings, setLastAppliedBookingConfirmation, toast]);

  const resetSettings = useCallback(async () => {
    if (businessId) {
      await siteCustomizerService.resetCustomization(businessId);
    }
    // 1. Limpar drafts do localStorage (Source of Truth do Editor Local)
    clearLocalDrafts();

    // 2. Resetar todos os estados para os defaults definidos em booking-data.ts
    // Usamos applyDefaultVisuals para manter o conteúdo (textos) e resetar apenas o visual
    setHeroSettings(applyDefaultVisuals(heroSettings, defaultHeroSettings));
    setAboutHeroSettings(
      applyDefaultVisuals(aboutHeroSettings, defaultAboutHeroSettings),
    );
    setStorySettings(applyDefaultVisuals(storySettings, defaultStorySettings));
    setTeamSettings(applyDefaultVisuals(teamSettings, defaultTeamSettings));
    setTestimonialsSettings(
      applyDefaultVisuals(testimonialsSettings, defaultTestimonialsSettings),
    );
    setServicesSettings(
      applyDefaultVisuals(servicesSettings, defaultServicesSettings),
    );
    setHomeValuesSettings(
      applyDefaultVisuals(homeValuesSettings, defaultValuesSettings),
    );
    setAboutUsValuesSettings(
      applyDefaultVisuals(aboutUsValuesSettings, defaultValuesSettings),
    );
    setGallerySettings(
      applyDefaultVisuals(gallerySettings, defaultGallerySettings),
    );
    setGalleryPageSettings(
      applyDefaultVisuals(galleryPageSettings, defaultGallerySettings),
    );
    setCTASettings(applyDefaultVisuals(ctaSettings, defaultCTASettings));
    setHeaderSettings(
      applyDefaultVisuals(headerSettings, defaultHeaderSettings),
    );
    setFooterSettings(
      applyDefaultVisuals(footerSettings, defaultFooterSettings),
    );
    setBookingServiceSettings(
      applyDefaultVisuals(
        bookingServiceSettings,
        defaultBookingServiceSettings,
      ),
    );
    setBookingDateSettings(
      applyDefaultVisuals(bookingDateSettings, defaultBookingDateSettings),
    );
    setBookingTimeSettings(
      applyDefaultVisuals(bookingTimeSettings, defaultBookingTimeSettings),
    );
    setBookingFormSettings(
      applyDefaultVisuals(bookingFormSettings, defaultBookingFormSettings),
    );
    setBookingConfirmationSettings(
      applyDefaultVisuals(
        bookingConfirmationSettings,
        defaultBookingConfirmationSettings,
      ),
    );

    // 3. Resetar cores globais e fontes
    setColorSettings(defaultColorSettings);
    setFontSettings(defaultFontSettings);

    // 4. Salvar os novos estados resetados no localStorage para garantir que o reload os pegue
    saveColorSettings(defaultColorSettings);
    saveFontSettings(defaultFontSettings);
    saveHeroSettings(applyDefaultVisuals(heroSettings, defaultHeroSettings));
    saveAboutHeroSettings(
      applyDefaultVisuals(aboutHeroSettings, defaultAboutHeroSettings),
    );
    saveStorySettings(applyDefaultVisuals(storySettings, defaultStorySettings));
    saveTeamSettings(applyDefaultVisuals(teamSettings, defaultTeamSettings));
    saveTestimonialsSettings(
      applyDefaultVisuals(testimonialsSettings, defaultTestimonialsSettings),
    );
    saveServicesSettings(
      applyDefaultVisuals(servicesSettings, defaultServicesSettings),
    );
    saveHomeValuesSettings(
      applyDefaultVisuals(homeValuesSettings, defaultValuesSettings),
    );
    saveAboutUsValuesSettings(
      applyDefaultVisuals(aboutUsValuesSettings, defaultValuesSettings),
    );
    saveGallerySettings(
      applyDefaultVisuals(gallerySettings, defaultGallerySettings),
    );
    saveGalleryPageSettings(
      applyDefaultVisuals(galleryPageSettings, defaultGallerySettings),
    );
    saveCTASettings(applyDefaultVisuals(ctaSettings, defaultCTASettings));
    saveHeaderSettings(
      applyDefaultVisuals(headerSettings, defaultHeaderSettings),
    );
    saveFooterSettings(
      applyDefaultVisuals(footerSettings, defaultFooterSettings),
    );
    saveBookingServiceSettings(
      applyDefaultVisuals(
        bookingServiceSettings,
        defaultBookingServiceSettings,
      ),
    );
    saveBookingDateSettings(
      applyDefaultVisuals(bookingDateSettings, defaultBookingDateSettings),
    );
    saveBookingTimeSettings(
      applyDefaultVisuals(bookingTimeSettings, defaultBookingTimeSettings),
    );
    saveBookingFormSettings(
      applyDefaultVisuals(bookingFormSettings, defaultBookingFormSettings),
    );
    saveBookingConfirmationSettings(
      applyDefaultVisuals(
        bookingConfirmationSettings,
        defaultBookingConfirmationSettings,
      ),
    );

    toast({
      title: "Site Resetado",
      description: "Visual do site restaurado para o design de referência.",
    });

    if (typeof window !== "undefined") {
      window.postMessage({ type: "SYNC_RESET" }, "*");
    }
  }, [
    businessId,
    clearLocalDrafts,
    saveBookingConfirmationSettings,
    saveBookingDateSettings,
    saveBookingFormSettings,
    saveBookingServiceSettings,
    saveBookingTimeSettings,
    saveCTASettings,
    saveFooterSettings,
    saveGalleryPageSettings,
    saveGallerySettings,
    saveHeaderSettings,
    saveHeroSettings,
    saveAboutHeroSettings,
    saveStorySettings,
    saveTeamSettings,
    saveTestimonialsSettings,
    saveServicesSettings,
    saveHomeValuesSettings,
    saveAboutUsValuesSettings,
    saveColorSettings,
    saveFontSettings,
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
    setHeroSettings,
    setAboutHeroSettings,
    setStorySettings,
    setTeamSettings,
    setTestimonialsSettings,
    setServicesSettings,
    setHomeValuesSettings,
    setAboutUsValuesSettings,
    setGallerySettings,
    setGalleryPageSettings,
    setCTASettings,
    setHeaderSettings,
    setFooterSettings,
    setBookingServiceSettings,
    setBookingDateSettings,
    setBookingTimeSettings,
    setBookingFormSettings,
    setBookingConfirmationSettings,
    setColorSettings,
    setFontSettings,
    toast,
  ]);

  const handleUpdateBackground = useCallback(
    async (updates: Partial<BackgroundSettings>, sectionId?: string) => {
      const targetSectionId = sectionId || activeSectionId;

      // 1. Identificar configurações atuais da seção para detecção de mudanças
      const settingsMap: Record<string, BackgroundSettings> = {
        hero: heroSettings,
        "home-hero": heroSettings,
        "about-hero": aboutHeroSettings,
        story: storySettings,
        "home-story": storySettings,
        team: teamSettings,
        "home-team": teamSettings,
        testimonials: testimonialsSettings,
        "home-testimonials": testimonialsSettings,
        services: servicesSettings,
        "home-services": servicesSettings,
        "home-values": homeValuesSettings,
        "about-values": aboutUsValuesSettings,
        "about-us-values": aboutUsValuesSettings,
        gallery: gallerySettings,
        "home-gallery": gallerySettings,
        "gallery-preview": gallerySettings,
        "page-gallery": galleryPageSettings,
        "gallery-grid": galleryPageSettings,
        cta: ctaSettings,
        "home-cta": ctaSettings,
        "booking-service": bookingServiceSettings as BackgroundSettings,
        "booking-date": bookingDateSettings as BackgroundSettings,
        "booking-time": bookingTimeSettings as BackgroundSettings,
        "booking-form": bookingFormSettings as BackgroundSettings,
        "booking-confirmation":
          bookingConfirmationSettings as BackgroundSettings,
      };

      const currentSettings = settingsMap[targetSectionId];
      const currentImageUrl =
        currentSettings?.appearance?.backgroundImageUrl ||
        currentSettings?.bgImage;
      const currentBgType = currentSettings?.bgType;
      const currentSettingsRecord = currentSettings as unknown as
        | Record<string, unknown>
        | undefined;
      const updatesRecord = updates as unknown as Record<string, unknown>;
      const normalizedUpdates: Partial<BackgroundSettings> &
        Record<string, unknown> = { ...updates };

      // Garantia para seções de "Values": preservar cardBgColor se não enviado explicitamente
      if (targetSectionId.includes("values")) {
        normalizedUpdates.cardBgColor =
          updatesRecord.cardBgColor || currentSettingsRecord?.cardBgColor;
      }

      if (
        normalizedUpdates.bgColor !== undefined &&
        !normalizedUpdates.appearance?.backgroundColor
      ) {
        normalizedUpdates.appearance = {
          ...(currentSettings?.appearance || {}),
          ...(normalizedUpdates.appearance || {}),
          backgroundColor: normalizedUpdates.bgColor,
        };
      }

      if (
        normalizedUpdates.appearance?.backgroundColor !== undefined &&
        normalizedUpdates.bgColor === undefined
      ) {
        normalizedUpdates.bgColor =
          normalizedUpdates.appearance.backgroundColor;
      }

      // Scenario 1: Troca de Imagem (quando uma nova URL é fornecida e difere da atual)
      if (
        normalizedUpdates.bgImage &&
        normalizedUpdates.bgImage !== currentImageUrl
      ) {
        // Nota: O BackgroundEditor já faz essa limpeza no upload.
        // Aqui garantimos que qualquer outra forma de troca também limpe a imagem órfã.
        if (currentImageUrl?.includes("/api/storage/")) {
          deleteOrphanImage(currentImageUrl);
        }
      }

      // Scenario 2: Mudança para Cor Sólida (bgType image -> color)
      if (
        normalizedUpdates.bgType === "color" &&
        currentBgType === "image" &&
        currentImageUrl
      ) {
        // REMOVIDO: Não deletar automaticamente a imagem ao trocar para cor sólida.
        // Isso permite que o usuário teste cores sem perder a imagem já enviada.
        // A imagem só deve ser deletada se o usuário clicar explicitamente no botão de remover (X).
        // Apenas limpamos a URL da imagem para que a cor sólida apareça
        // mas mantemos a referência no banco se o usuário não quiser deletar.
        // Se o usuário quiser realmente deletar, ele usará o botão (X) no BackgroundEditor.
      }

      // Scenario 3: Deleção Explícita da Imagem (bgImage set to empty)
      if (
        normalizedUpdates.bgImage === "" &&
        currentImageUrl?.includes("/api/storage/")
      ) {
        // Aqui sim deletamos do servidor, pois o usuário clicou no (X) ou limpou o campo manualmente
        deleteOrphanImage(currentImageUrl);
      }

      handleUpdateBackgroundState(normalizedUpdates, targetSectionId);

      const currentSettingsMap: Record<string, BackgroundSettings | undefined> =
        {
          hero: heroSettings,
          "home-hero": heroSettings,
          "about-hero": aboutHeroSettings,
          story: storySettings,
          "home-story": storySettings,
          team: teamSettings,
          "home-team": teamSettings,
          testimonials: testimonialsSettings,
          "home-testimonials": testimonialsSettings,
          services: servicesSettings,
          "home-services": servicesSettings,
          "home-values": homeValuesSettings,
          "about-values": aboutUsValuesSettings,
          "about-us-values": aboutUsValuesSettings,
          gallery: gallerySettings,
          "home-gallery": gallerySettings,
          "gallery-preview": gallerySettings,
          "page-gallery": galleryPageSettings,
          "gallery-grid": galleryPageSettings,
          cta: ctaSettings,
          "home-cta": ctaSettings,
          "booking-service": bookingServiceSettings,
          "booking-date": bookingDateSettings,
          "booking-time": bookingTimeSettings,
          "booking-form": bookingFormSettings,
          "booking-confirmation": bookingConfirmationSettings,
        };

      const saveKeyMap: Record<string, string> = {
        hero: "heroSettings",
        "home-hero": "heroSettings",
        "about-hero": "aboutHeroSettings",
        story: "storySettings",
        "home-story": "storySettings",
        team: "teamSettings",
        "home-team": "teamSettings",
        testimonials: "testimonialsSettings",
        "home-testimonials": "testimonialsSettings",
        services: "servicesSettings",
        "home-services": "servicesSettings",
        "home-values": "homeValuesSettings",
        "about-values": "aboutUsValuesSettings",
        "about-us-values": "aboutUsValuesSettings",
        gallery: "gallerySettings",
        "home-gallery": "gallerySettings",
        "gallery-preview": "gallerySettings",
        "page-gallery": "galleryPageSettings",
        "gallery-grid": "galleryPageSettings",
        cta: "ctaSettings",
        "home-cta": "ctaSettings",
        "booking-service": "bookingServiceSettings",
        "booking-date": "bookingDateSettings",
        "booking-time": "bookingTimeSettings",
        "booking-form": "bookingFormSettings",
        "booking-confirmation": "bookingConfirmationSettings",
      };

      const saveKey = saveKeyMap[targetSectionId] || targetSectionId;
      if (saveKey) {
        const currentSettings = currentSettingsMap[targetSectionId];
        const merged = currentSettings
          ? { ...currentSettings, ...normalizedUpdates }
          : normalizedUpdates;

        console.log(
          `>>> [useEditorActions] Salvando rascunho para ${targetSectionId}:`,
          {
            bgType: merged.bgType,
            bgColor: merged.bgColor,
            bgImage: merged.bgImage,
            appearance: merged.appearance,
          },
        );

        /* REMOVIDO: Não limpamos a URL da imagem ao salvar se for cor sólida.
           Isso permite que o usuário alterne de volta para 'imagem' sem perder o upload anterior.
        if (merged.bgType === "color") {
          merged.bgImage = "";
          merged.appearance = {
            ...(merged.appearance || {}),
            backgroundImageUrl: "",
          };
        }
        */

        scheduleDraftSave(saveKey);
      }
    },
    [
      activeSectionId,
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
      bookingServiceSettings,
      bookingDateSettings,
      bookingTimeSettings,
      bookingFormSettings,
      bookingConfirmationSettings,
      handleUpdateBackgroundState,
      deleteOrphanImage,
      scheduleDraftSave,
    ],
  );

  const handleUpdateFont = useCallback(
    (updates: Partial<FontSettings>) => {
      handleUpdateFontState(updates);
      scheduleDraftSave("fontSettings");
    },
    [handleUpdateFontState, scheduleDraftSave],
  );

  const handleUpdateColors = useCallback(
    (updates: Partial<ColorSettings>) => {
      handleUpdateColorsState(updates);
      scheduleDraftSave("colorSettings");
    },
    [handleUpdateColorsState, scheduleDraftSave],
  );

  const handleUpdateHero = useCallback(
    (updates: Partial<HeroSettings>) => {
      handleUpdateHeroState(updates);
      scheduleDraftSave("heroSettings");
    },
    [handleUpdateHeroState, scheduleDraftSave],
  );

  const handleUpdateAboutHero = useCallback(
    (updates: Partial<HeroSettings>) => {
      handleUpdateAboutHeroState(updates);
      scheduleDraftSave("aboutHeroSettings");
    },
    [handleUpdateAboutHeroState, scheduleDraftSave],
  );

  const handleUpdateStory = useCallback(
    (updates: Partial<StorySettings>) => {
      handleUpdateStoryState(updates);
      scheduleDraftSave("storySettings");
    },
    [handleUpdateStoryState, scheduleDraftSave],
  );

  const handleUpdateTeam = useCallback(
    (updates: Partial<TeamSettings>) => {
      handleUpdateTeamState(updates);
      scheduleDraftSave("teamSettings");
    },
    [handleUpdateTeamState, scheduleDraftSave],
  );

  const handleUpdateTestimonials = useCallback(
    (updates: Partial<TestimonialsSettings>) => {
      handleUpdateTestimonialsState(updates);
      scheduleDraftSave("testimonialsSettings");
    },
    [handleUpdateTestimonialsState, scheduleDraftSave],
  );

  const handleUpdateServices = useCallback(
    (updates: Partial<ServicesSettings>) => {
      handleUpdateServicesState(updates);
      scheduleDraftSave("servicesSettings");
    },
    [handleUpdateServicesState, scheduleDraftSave],
  );

  const handleUpdateGallery = useCallback(
    (updates: Partial<GallerySettings>) => {
      handleUpdateGalleryPreviewState(updates);
      scheduleDraftSave("gallerySettings");
    },
    [handleUpdateGalleryPreviewState, scheduleDraftSave],
  );

  const handleUpdateGalleryPage = useCallback(
    (updates: Partial<GallerySettings>) => {
      handleUpdateGalleryPageState(updates);
      scheduleDraftSave("galleryPageSettings");
    },
    [handleUpdateGalleryPageState, scheduleDraftSave],
  );

  const handleUpdateHeader = useCallback(
    (updates: Partial<HeaderSettings>) => {
      handleUpdateHeaderState(updates);
      scheduleDraftSave("headerSettings");
    },
    [handleUpdateHeaderState, scheduleDraftSave],
  );

  const handleUpdateFooter = useCallback(
    (updates: Partial<FooterSettings>) => {
      handleUpdateFooterState(updates);
      scheduleDraftSave("footerSettings");
    },
    [handleUpdateFooterState, scheduleDraftSave],
  );

  const handleUpdateBookingService = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingServiceState(updates);
      scheduleDraftSave("bookingServiceSettings");
    },
    [handleUpdateBookingServiceState, scheduleDraftSave],
  );

  const handleUpdateHomeValues = useCallback(
    (updates: Partial<ValuesSettings>) => {
      handleUpdateHomeValuesState(updates);
      const currentSettings = homeValuesSettings;
      const updatedSettings = {
        ...currentSettings,
        ...updates,
        bgType: updates.bgColor
          ? "color"
          : updates.bgType || currentSettings.bgType,
        bgColor: updates.bgColor || currentSettings.bgColor,
        cardBgColor: updates.cardBgColor || currentSettings.cardBgColor,
        appearance: {
          ...(currentSettings.appearance || {}),
          ...(updates.appearance || {}),
          backgroundColor: updates.bgColor || currentSettings.bgColor,
          cardBackgroundColor:
            updates.cardBgColor || currentSettings.cardBgColor,
        },
        values_bg: updates.bgColor || currentSettings.bgColor,
        about_values_bg: updates.bgColor || currentSettings.bgColor,
      };
      console.log(">>> [VALUES_SAVE_AUDIT] homeValuesSettings", {
        bgType: updatedSettings.bgType,
        bgColor: updatedSettings.bgColor,
        cardBgColor: updatedSettings.cardBgColor,
        values_bg: updatedSettings.values_bg,
        about_values_bg: updatedSettings.about_values_bg,
        appearance: updatedSettings.appearance,
      });

      setLastSavedHomeValues(updatedSettings);
      scheduleDraftSave("homeValuesSettings");
    },
    [
      handleUpdateHomeValuesState,
      setLastSavedHomeValues,
      scheduleDraftSave,
      homeValuesSettings,
    ],
  );

  const handleUpdateAboutUsValues = useCallback(
    (updates: Partial<ValuesSettings>) => {
      handleUpdateAboutUsValuesState(updates);
      const currentSettings = aboutUsValuesSettings;
      const updatedSettings = {
        ...currentSettings,
        ...updates,
        bgType: updates.bgColor
          ? "color"
          : updates.bgType || currentSettings.bgType,
        bgColor: updates.bgColor || currentSettings.bgColor,
        cardBgColor: updates.cardBgColor || currentSettings.cardBgColor,
        appearance: {
          ...(currentSettings.appearance || {}),
          ...(updates.appearance || {}),
          backgroundColor: updates.bgColor || currentSettings.bgColor,
          cardBackgroundColor:
            updates.cardBgColor || currentSettings.cardBgColor,
        },
        values_bg: updates.bgColor || currentSettings.bgColor,
        about_values_bg: updates.bgColor || currentSettings.bgColor,
      };
      console.log(">>> [VALUES_SAVE_AUDIT] aboutUsValuesSettings", {
        bgType: updatedSettings.bgType,
        bgColor: updatedSettings.bgColor,
        cardBgColor: updatedSettings.cardBgColor,
        values_bg: updatedSettings.values_bg,
        about_values_bg: updatedSettings.about_values_bg,
        appearance: updatedSettings.appearance,
      });

      setLastSavedAboutUsValues(updatedSettings);
      scheduleDraftSave("aboutUsValuesSettings");
    },
    [
      handleUpdateAboutUsValuesState,
      setLastSavedAboutUsValues,
      scheduleDraftSave,
      aboutUsValuesSettings,
    ],
  );

  const handleUpdateCTA = useCallback(
    (updates: Partial<CTASettings>) => {
      handleUpdateCTAState(updates);
      scheduleDraftSave("ctaSettings");
    },
    [handleUpdateCTAState, scheduleDraftSave],
  );

  const handleUpdateBookingDate = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingDateState(updates);
      scheduleDraftSave("bookingDateSettings");
    },
    [handleUpdateBookingDateState, scheduleDraftSave],
  );

  const handleUpdateBookingTime = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingTimeState(updates);
      scheduleDraftSave("bookingTimeSettings");
    },
    [handleUpdateBookingTimeState, scheduleDraftSave],
  );

  const handleUpdateBookingForm = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingFormState(updates);
      scheduleDraftSave("bookingFormSettings");
    },
    [handleUpdateBookingFormState, scheduleDraftSave],
  );

  const handleUpdateBookingConfirmation = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingConfirmationState(updates);
      scheduleDraftSave("bookingConfirmationSettings");
    },
    [handleUpdateBookingConfirmationState, scheduleDraftSave],
  );

  const handleSectionReset = useCallback(
    (sectionId?: string) => {
      const targetSectionId = sectionId || activeSectionId;

      // Mapa de defaults por seção
      const defaultsMap: Record<string, string> = {
        hero: "heroSettings",
        "about-hero": "aboutHeroSettings",
        story: "storySettings",
        team: "teamSettings",
        testimonials: "testimonialsSettings",
        services: "servicesSettings",
        values: "homeValuesSettings",
        "home-values": "homeValuesSettings",
        "about-values": "aboutUsValuesSettings",
        "about-us-values": "aboutUsValuesSettings",
        gallery: "gallerySettings",
        "gallery-preview": "gallerySettings",
        "gallery-grid": "galleryPageSettings",
        cta: "ctaSettings",
        header: "headerSettings",
        footer: "footerSettings",
        typography: "fontSettings",
        colors: "colorSettings",
        "booking-service": "bookingServiceSettings",
        "booking-date": "bookingDateSettings",
        "booking-time": "bookingTimeSettings",
        "booking-form": "bookingFormSettings",
        "booking-confirmation": "bookingConfirmationSettings",
      };

      // Mapa de setters de estado
      const setterMap: Record<string, (u: unknown) => void> = {
        hero: setHeroSettings as (u: unknown) => void,
        "about-hero": setAboutHeroSettings as (u: unknown) => void,
        story: setStorySettings as (u: unknown) => void,
        team: setTeamSettings as (u: unknown) => void,
        testimonials: setTestimonialsSettings as (u: unknown) => void,
        services: setServicesSettings as (u: unknown) => void,
        values: setHomeValuesSettings as (u: unknown) => void,
        "home-values": setHomeValuesSettings as (u: unknown) => void,
        "about-values": setAboutUsValuesSettings as (u: unknown) => void,
        "about-us-values": setAboutUsValuesSettings as (u: unknown) => void,
        gallery: setGallerySettings as (u: unknown) => void,
        "gallery-preview": setGallerySettings as (u: unknown) => void,
        "gallery-grid": setGalleryPageSettings as (u: unknown) => void,
        cta: setCTASettings as (u: unknown) => void,
        header: setHeaderSettings as (u: unknown) => void,
        footer: setFooterSettings as (u: unknown) => void,
        typography: setFontSettings as (u: unknown) => void,
        colors: setColorSettings as (u: unknown) => void,
        "booking-service": setBookingServiceSettings as (u: unknown) => void,
        "booking-date": setBookingDateSettings as (u: unknown) => void,
        "booking-time": setBookingTimeSettings as (u: unknown) => void,
        "booking-form": setBookingFormSettings as (u: unknown) => void,
        "booking-confirmation": setBookingConfirmationSettings as (
          u: unknown,
        ) => void,
      };

      // Mapa de funções de salvamento (localStorage)
      const saveFnMap: Record<string, (u: unknown) => void> = {
        hero: saveHeroSettings as (u: unknown) => void,
        "about-hero": saveAboutHeroSettings as (u: unknown) => void,
        story: saveStorySettings as (u: unknown) => void,
        team: saveTeamSettings as (u: unknown) => void,
        testimonials: saveTestimonialsSettings as (u: unknown) => void,
        services: saveServicesSettings as (u: unknown) => void,
        values: saveHomeValuesSettings as (u: unknown) => void,
        "home-values": saveHomeValuesSettings as (u: unknown) => void,
        "about-values": saveAboutUsValuesSettings as (u: unknown) => void,
        "about-us-values": saveAboutUsValuesSettings as (u: unknown) => void,
        gallery: saveGallerySettings as (u: unknown) => void,
        "gallery-preview": saveGallerySettings as (u: unknown) => void,
        "gallery-grid": saveGalleryPageSettings as (u: unknown) => void,
        cta: saveCTASettings as (u: unknown) => void,
        header: saveHeaderSettings as (u: unknown) => void,
        footer: saveFooterSettings as (u: unknown) => void,
        typography: saveFontSettings as (u: unknown) => void,
        colors: saveColorSettings as (u: unknown) => void,
        "booking-service": saveBookingServiceSettings as (u: unknown) => void,
        "booking-date": saveBookingDateSettings as (u: unknown) => void,
        "booking-time": saveBookingTimeSettings as (u: unknown) => void,
        "booking-form": saveBookingFormSettings as (u: unknown) => void,
        "booking-confirmation": saveBookingConfirmationSettings as (
          u: unknown,
        ) => void,
      };

      // Mapa de chaves para o draft
      const saveKeyMap: Record<string, string> = {
        hero: "heroSettings",
        "about-hero": "aboutHeroSettings",
        story: "storySettings",
        team: "teamSettings",
        testimonials: "testimonialsSettings",
        services: "servicesSettings",
        values: "homeValuesSettings",
        "home-values": "homeValuesSettings",
        "about-values": "aboutUsValuesSettings",
        "about-us-values": "aboutUsValuesSettings",
        gallery: "gallerySettings",
        "gallery-preview": "gallerySettings",
        "gallery-grid": "galleryPageSettings",
        cta: "ctaSettings",
        header: "headerSettings",
        footer: "footerSettings",
        typography: "fontSettings",
        colors: "colorSettings",
        "booking-service": "bookingServiceSettings",
        "booking-date": "bookingDateSettings",
        "booking-time": "bookingTimeSettings",
        "booking-form": "bookingFormSettings",
        "booking-confirmation": "bookingConfirmationSettings",
      };

      // Mapa de configurações atuais
      const currentSettingsMap: Record<string, unknown> = {
        hero: heroSettings,
        "about-hero": aboutHeroSettings,
        story: storySettings,
        team: teamSettings,
        testimonials: testimonialsSettings,
        services: servicesSettings,
        values: homeValuesSettings,
        "home-values": homeValuesSettings,
        "about-values": aboutUsValuesSettings,
        "about-us-values": aboutUsValuesSettings,
        gallery: gallerySettings,
        "gallery-preview": gallerySettings,
        "gallery-grid": galleryPageSettings,
        cta: ctaSettings,
        header: headerSettings,
        footer: footerSettings,
        typography: fontSettings,
        colors: colorSettings,
        "booking-service": bookingServiceSettings,
        "booking-date": bookingDateSettings,
        "booking-time": bookingTimeSettings,
        "booking-form": bookingFormSettings,
        "booking-confirmation": bookingConfirmationSettings,
      };

      const baseKey = defaultsMap[targetSectionId];
      const setter = setterMap[targetSectionId];
      const saveFn = saveFnMap[targetSectionId];
      const saveKey = saveKeyMap[targetSectionId];
      const current = currentSettingsMap[targetSectionId];

      if (baseKey && setter && saveFn && saveKey && current) {
        const resetSource =
          baseSettingsRef.current[
            baseKey as keyof typeof baseSettingsRef.current
          ];
        const reseted = cloneValue(resetSource);

        setter(reseted);
        saveFn(reseted);
        scheduleDraftSave(saveKey);

        toast({
          title: "Seção Resetada",
          description: `Seção ${targetSectionId} voltou para o padrão do site base.`,
        });
      }
    },
    [
      activeSectionId,
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
      colorSettings,
      fontSettings,
      setHeroSettings,
      setAboutHeroSettings,
      setStorySettings,
      setTeamSettings,
      setTestimonialsSettings,
      setServicesSettings,
      setHomeValuesSettings,
      setAboutUsValuesSettings,
      setGallerySettings,
      setGalleryPageSettings,
      setCTASettings,
      setHeaderSettings,
      setFooterSettings,
      setFontSettings,
      setColorSettings,
      setBookingServiceSettings,
      setBookingDateSettings,
      setBookingTimeSettings,
      setBookingFormSettings,
      setBookingConfirmationSettings,
      saveHeroSettings,
      saveAboutHeroSettings,
      saveStorySettings,
      saveTeamSettings,
      saveTestimonialsSettings,
      saveServicesSettings,
      saveHomeValuesSettings,
      saveAboutUsValuesSettings,
      saveGallerySettings,
      saveGalleryPageSettings,
      saveCTASettings,
      saveHeaderSettings,
      saveFooterSettings,
      saveFontSettings,
      saveColorSettings,
      saveBookingServiceSettings,
      saveBookingDateSettings,
      saveBookingTimeSettings,
      saveBookingFormSettings,
      saveBookingConfirmationSettings,
      baseSettingsRef,
      scheduleDraftSave,
      toast,
    ],
  );

  return {
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
    handleUpdateBookingService,
    handleUpdateBookingDate,
    handleUpdateBookingTime,
    handleUpdateBookingForm,
    handleUpdateBookingConfirmation,
    handleUpdateCTA,
    handleUpdateHomeValues,
    handleUpdateAboutUsValues,
    handleUpdateFont,
    handleUpdateColors,
  };
}
