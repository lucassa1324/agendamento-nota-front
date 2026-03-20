import { useCallback, useRef } from "react";
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
    handleUpdateValues: handleUpdateValuesState,
    handleUpdateGallery: handleUpdateGalleryState,
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
    setHeroSettings,
    setAboutHeroSettings,
    setStorySettings,
    setTeamSettings,
    setTestimonialsSettings,
    setServicesSettings,
    setValuesSettings,
    setGallerySettings,
    setCTASettings,
    setHeaderSettings,
    setFooterSettings,
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
    setLastAppliedValues,
    setLastAppliedGallery,
    setLastAppliedCTA,
    setLastAppliedHeader,
    setLastAppliedFooter,
    setLastAppliedBookingService,
    setLastAppliedBookingDate,
    setLastAppliedBookingTime,
    setLastAppliedBookingForm,
    setLastAppliedBookingConfirmation,
  } = state;

  const saveTimersRef = useRef<Record<string, number>>({});

  const scheduleDraftSave = useCallback((key: string, saveFn: () => void) => {
    if (typeof window === "undefined") return;
    const timers = saveTimersRef.current;
    if (timers[key]) {
      window.clearTimeout(timers[key]);
    }
    timers[key] = window.setTimeout(() => {
      saveFn();
      window.dispatchEvent(new Event("local_draft_changed"));
      delete timers[key];
    }, 1000);
  }, []);

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
    saveHeroSettings,
    saveAboutHeroSettings,
    saveStorySettings,
    saveTeamSettings,
    saveTestimonialsSettings,
    saveServicesSettings,
    saveValuesSettings,
    saveGallerySettings,
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
    clearLocalDrafts,
  } = local;

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
  }, [aboutHeroSettings, setLastAppliedAboutHero, toast]);

  const handleApplyStory = useCallback(() => {
    setLastAppliedStory(storySettings);
    toast({
      title: "Sucesso",
      description: "Configurações da História aplicadas.",
    });
  }, [storySettings, setLastAppliedStory, toast]);

  const handleApplyTeam = useCallback(() => {
    setLastAppliedTeam(teamSettings);
    toast({
      title: "Sucesso",
      description: "Configurações da Equipe aplicadas.",
    });
  }, [teamSettings, setLastAppliedTeam, toast]);

  const handleApplyTestimonials = useCallback(() => {
    setLastAppliedTestimonials(testimonialsSettings);
    toast({
      title: "Sucesso",
      description: "Configurações de Depoimentos aplicadas.",
    });
  }, [testimonialsSettings, setLastAppliedTestimonials, toast]);

  const handleApplyFont = useCallback(() => {
    setLastAppliedFont(fontSettings);
    toast({
      title: "Sucesso",
      description: "Configurações de Fontes aplicadas.",
    });
  }, [fontSettings, setLastAppliedFont, toast]);

  const handleApplyTypography = handleApplyFont;

  const handleApplyColors = useCallback(() => {
    setLastAppliedColor(colorSettings);
    toast({
      title: "Sucesso",
      description: "Configurações de Cores aplicadas.",
    });
  }, [colorSettings, setLastAppliedColor, toast]);

  const handleApplyServices = useCallback(() => {
    setLastAppliedServices(servicesSettings);
    toast({
      title: "Sucesso",
      description: "Configurações de Serviços aplicadas.",
    });
  }, [servicesSettings, setLastAppliedServices, toast]);

  const handleApplyValues = useCallback(() => {
    setLastAppliedValues(valuesSettings);
    toast({
      title: "Sucesso",
      description: "Configurações de Valores aplicadas.",
    });
  }, [valuesSettings, setLastAppliedValues, toast]);

  const handleApplyGallery = useCallback(() => {
    setLastAppliedGallery(gallerySettings);
    toast({
      title: "Sucesso",
      description: "Configurações da Galeria aplicadas.",
    });
  }, [gallerySettings, setLastAppliedGallery, toast]);

  const handleApplyCTA = useCallback(() => {
    setLastAppliedCTA(ctaSettings);
    toast({ title: "Sucesso", description: "Configurações de CTA aplicadas." });
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

  const resetSettings = useCallback(() => {
    clearLocalDrafts();
    window.location.reload();
  }, [clearLocalDrafts]);

  const handleUpdateBackground = useCallback(
    async (updates: Partial<BackgroundSettings>, sectionId?: string) => {
      const targetSectionId = sectionId || activeSectionId;

      // 1. Identificar configurações atuais da seção para detecção de mudanças
      const settingsMap: Record<string, BackgroundSettings> = {
        hero: heroSettings,
        "about-hero": aboutHeroSettings,
        story: storySettings,
        team: teamSettings,
        testimonials: testimonialsSettings,
        services: servicesSettings,
        values: valuesSettings,
        gallery: gallerySettings,
        "gallery-preview": gallerySettings,
        "gallery-grid": gallerySettings,
        cta: ctaSettings,
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
      const normalizedUpdates = { ...updates };

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
        await deleteOrphanImage(currentImageUrl);

        normalizedUpdates.bgImage = "";
        normalizedUpdates.appearance = {
          ...(currentSettings?.appearance || {}),
          ...(normalizedUpdates.appearance || {}),
          backgroundImageUrl: "",
        };
      }

      handleUpdateBackgroundState(normalizedUpdates, targetSectionId);

      const currentSettingsMap: Record<string, BackgroundSettings | undefined> =
        {
          hero: heroSettings,
          "about-hero": aboutHeroSettings,
          story: storySettings,
          team: teamSettings,
          testimonials: testimonialsSettings,
          services: servicesSettings,
          values: valuesSettings,
          gallery: gallerySettings,
          "gallery-preview": gallerySettings,
          "gallery-grid": gallerySettings,
          cta: ctaSettings,
          "booking-service": bookingServiceSettings,
          "booking-date": bookingDateSettings,
          "booking-time": bookingTimeSettings,
          "booking-form": bookingFormSettings,
          "booking-confirmation": bookingConfirmationSettings,
        };

      const saveFnMap: Record<
        string,
        (u: Partial<BackgroundSettings>) => void
      > = {
        hero: (u) => saveHeroSettings({ ...heroSettings, ...u }),
        "about-hero": (u) =>
          saveAboutHeroSettings({ ...aboutHeroSettings, ...u }),
        story: (u) => saveStorySettings({ ...storySettings, ...u }),
        team: (u) => saveTeamSettings({ ...teamSettings, ...u }),
        testimonials: (u) =>
          saveTestimonialsSettings({ ...testimonialsSettings, ...u }),
        services: (u) => saveServicesSettings({ ...servicesSettings, ...u }),
        values: (u) => saveValuesSettings({ ...valuesSettings, ...u }),
        gallery: (u) => saveGallerySettings({ ...gallerySettings, ...u }),
        "gallery-preview": (u) =>
          saveGallerySettings({ ...gallerySettings, ...u }),
        "gallery-grid": (u) =>
          saveGallerySettings({ ...gallerySettings, ...u }),
        cta: (u) => saveCTASettings({ ...ctaSettings, ...u }),
        "booking-service": (u) =>
          saveBookingServiceSettings({ ...bookingServiceSettings, ...u }),
        "booking-date": (u) =>
          saveBookingDateSettings({ ...bookingDateSettings, ...u }),
        "booking-time": (u) =>
          saveBookingTimeSettings({ ...bookingTimeSettings, ...u }),
        "booking-form": (u) =>
          saveBookingFormSettings({ ...bookingFormSettings, ...u }),
        "booking-confirmation": (u) =>
          saveBookingConfirmationSettings({
            ...bookingConfirmationSettings,
            ...u,
          }),
      };

      const saveKeyMap: Record<string, string> = {
        hero: "heroSettings",
        "about-hero": "aboutHeroSettings",
        story: "storySettings",
        team: "teamSettings",
        testimonials: "testimonialsSettings",
        services: "servicesSettings",
        values: "valuesSettings",
        gallery: "gallerySettings",
        "gallery-preview": "gallerySettings",
        "gallery-grid": "gallerySettings",
        cta: "ctaSettings",
        "booking-service": "bookingServiceSettings",
        "booking-date": "bookingDateSettings",
        "booking-time": "bookingTimeSettings",
        "booking-form": "bookingFormSettings",
        "booking-confirmation": "bookingConfirmationSettings",
      };

      const saveFn = saveFnMap[targetSectionId];
      if (saveFn) {
        const currentSettings = currentSettingsMap[targetSectionId];
        const merged = currentSettings
          ? { ...currentSettings, ...normalizedUpdates }
          : normalizedUpdates;

        console.log(`>>> [useEditorActions] Salvando rascunho para ${targetSectionId}:`, {
          bgType: merged.bgType,
          bgColor: merged.bgColor,
          bgImage: merged.bgImage,
          appearance: merged.appearance
        });

        // Garante limpeza de bgImage se for cor
        if (merged.bgType === "color") {
          merged.bgImage = "";
          merged.appearance = {
            ...(merged.appearance || {}),
            backgroundImageUrl: "",
          };
        }

        const saveKey = saveKeyMap[targetSectionId] || targetSectionId;
        scheduleDraftSave(saveKey, () => saveFn(merged));
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
      valuesSettings,
      gallerySettings,
      ctaSettings,
      bookingServiceSettings,
      bookingDateSettings,
      bookingTimeSettings,
      bookingFormSettings,
      bookingConfirmationSettings,
      handleUpdateBackgroundState,
      saveHeroSettings,
      saveAboutHeroSettings,
      saveStorySettings,
      saveTeamSettings,
      saveTestimonialsSettings,
      saveServicesSettings,
      saveValuesSettings,
      saveGallerySettings,
      saveCTASettings,
      saveBookingServiceSettings,
      saveBookingDateSettings,
      saveBookingTimeSettings,
      saveBookingFormSettings,
      saveBookingConfirmationSettings,
      deleteOrphanImage,
      scheduleDraftSave,
    ],
  );

  const handleUpdateFont = useCallback(
    (updates: Partial<FontSettings>) => {
      handleUpdateFontState(updates);
      scheduleDraftSave("fontSettings", () =>
        saveFontSettings({ ...fontSettings, ...updates }),
      );
    },
    [handleUpdateFontState, scheduleDraftSave, saveFontSettings, fontSettings],
  );

  const handleUpdateColors = useCallback(
    (updates: Partial<ColorSettings>) => {
      handleUpdateColorsState(updates);
      scheduleDraftSave("colorSettings", () =>
        saveColorSettings({ ...colorSettings, ...updates }),
      );
    },
    [
      handleUpdateColorsState,
      scheduleDraftSave,
      saveColorSettings,
      colorSettings,
    ],
  );

  const handleUpdateHero = useCallback(
    (updates: Partial<HeroSettings>) => {
      handleUpdateHeroState(updates);
      scheduleDraftSave("heroSettings", () =>
        saveHeroSettings({ ...heroSettings, ...updates }),
      );
    },
    [handleUpdateHeroState, scheduleDraftSave, saveHeroSettings, heroSettings],
  );

  const handleUpdateAboutHero = useCallback(
    (updates: Partial<HeroSettings>) => {
      handleUpdateAboutHeroState(updates);
      scheduleDraftSave("aboutHeroSettings", () =>
        saveAboutHeroSettings({ ...aboutHeroSettings, ...updates }),
      );
    },
    [
      handleUpdateAboutHeroState,
      scheduleDraftSave,
      saveAboutHeroSettings,
      aboutHeroSettings,
    ],
  );

  const handleUpdateStory = useCallback(
    (updates: Partial<StorySettings>) => {
      handleUpdateStoryState(updates);
      scheduleDraftSave("storySettings", () =>
        saveStorySettings({ ...storySettings, ...updates }),
      );
    },
    [
      handleUpdateStoryState,
      scheduleDraftSave,
      saveStorySettings,
      storySettings,
    ],
  );

  const handleUpdateTeam = useCallback(
    (updates: Partial<TeamSettings>) => {
      handleUpdateTeamState(updates);
      scheduleDraftSave("teamSettings", () =>
        saveTeamSettings({ ...teamSettings, ...updates }),
      );
    },
    [handleUpdateTeamState, scheduleDraftSave, saveTeamSettings, teamSettings],
  );

  const handleUpdateTestimonials = useCallback(
    (updates: Partial<TestimonialsSettings>) => {
      handleUpdateTestimonialsState(updates);
      scheduleDraftSave("testimonialsSettings", () =>
        saveTestimonialsSettings({ ...testimonialsSettings, ...updates }),
      );
    },
    [
      handleUpdateTestimonialsState,
      scheduleDraftSave,
      saveTestimonialsSettings,
      testimonialsSettings,
    ],
  );

  const handleUpdateServices = useCallback(
    (updates: Partial<ServicesSettings>) => {
      handleUpdateServicesState(updates);
      scheduleDraftSave("servicesSettings", () =>
        saveServicesSettings({ ...servicesSettings, ...updates }),
      );
    },
    [
      handleUpdateServicesState,
      scheduleDraftSave,
      saveServicesSettings,
      servicesSettings,
    ],
  );

  const handleUpdateGallery = useCallback(
    (updates: Partial<GallerySettings>) => {
      handleUpdateGalleryState(updates);
      scheduleDraftSave("gallerySettings", () =>
        saveGallerySettings({ ...gallerySettings, ...updates }),
      );
    },
    [
      handleUpdateGalleryState,
      scheduleDraftSave,
      saveGallerySettings,
      gallerySettings,
    ],
  );

  const handleUpdateHeader = useCallback(
    (updates: Partial<HeaderSettings>) => {
      handleUpdateHeaderState(updates);
      scheduleDraftSave("headerSettings", () =>
        saveHeaderSettings({ ...headerSettings, ...updates }),
      );
    },
    [
      handleUpdateHeaderState,
      scheduleDraftSave,
      saveHeaderSettings,
      headerSettings,
    ],
  );

  const handleUpdateFooter = useCallback(
    (updates: Partial<FooterSettings>) => {
      handleUpdateFooterState(updates);
      scheduleDraftSave("footerSettings", () =>
        saveFooterSettings({ ...footerSettings, ...updates }),
      );
    },
    [
      handleUpdateFooterState,
      scheduleDraftSave,
      saveFooterSettings,
      footerSettings,
    ],
  );

  const handleUpdateBookingService = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingServiceState(updates);
      scheduleDraftSave("bookingServiceSettings", () =>
        saveBookingServiceSettings({ ...bookingServiceSettings, ...updates }),
      );
    },
    [
      handleUpdateBookingServiceState,
      scheduleDraftSave,
      saveBookingServiceSettings,
      bookingServiceSettings,
    ],
  );

  const handleUpdateValues = useCallback(
    (updates: Partial<ValuesSettings>) => {
      handleUpdateValuesState(updates);
      const newSettings = { ...valuesSettings, ...updates };
      scheduleDraftSave("valuesSettings", () =>
        saveValuesSettings(newSettings),
      );
    },
    [
      handleUpdateValuesState,
      scheduleDraftSave,
      saveValuesSettings,
      valuesSettings,
    ],
  );

  const handleUpdateCTA = useCallback(
    (updates: Partial<CTASettings>) => {
      handleUpdateCTAState(updates);
      scheduleDraftSave("ctaSettings", () =>
        saveCTASettings({ ...ctaSettings, ...updates }),
      );
    },
    [handleUpdateCTAState, scheduleDraftSave, saveCTASettings, ctaSettings],
  );

  const handleUpdateBookingDate = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingDateState(updates);
      scheduleDraftSave("bookingDateSettings", () =>
        saveBookingDateSettings({ ...bookingDateSettings, ...updates }),
      );
    },
    [
      handleUpdateBookingDateState,
      scheduleDraftSave,
      saveBookingDateSettings,
      bookingDateSettings,
    ],
  );

  const handleUpdateBookingTime = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingTimeState(updates);
      scheduleDraftSave("bookingTimeSettings", () =>
        saveBookingTimeSettings({ ...bookingTimeSettings, ...updates }),
      );
    },
    [
      handleUpdateBookingTimeState,
      scheduleDraftSave,
      saveBookingTimeSettings,
      bookingTimeSettings,
    ],
  );

  const handleUpdateBookingForm = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingFormState(updates);
      scheduleDraftSave("bookingFormSettings", () =>
        saveBookingFormSettings({ ...bookingFormSettings, ...updates }),
      );
    },
    [
      handleUpdateBookingFormState,
      scheduleDraftSave,
      saveBookingFormSettings,
      bookingFormSettings,
    ],
  );

  const handleUpdateBookingConfirmation = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingConfirmationState(updates);
      scheduleDraftSave("bookingConfirmationSettings", () =>
        saveBookingConfirmationSettings({
          ...bookingConfirmationSettings,
          ...updates,
        }),
      );
    },
    [
      handleUpdateBookingConfirmationState,
      scheduleDraftSave,
      saveBookingConfirmationSettings,
      bookingConfirmationSettings,
    ],
  );

  const handleSectionReset = useCallback(
    (sectionId?: string) => {
      const targetSectionId = sectionId || activeSectionId;
      const resetMap: Record<string, () => void> = {
        hero: () => setHeroSettings(state.lastSavedHero),
        "about-hero": () => setAboutHeroSettings(state.lastSavedAboutHero),
        story: () => setStorySettings(state.lastSavedStory),
        team: () => setTeamSettings(state.lastSavedTeam),
        testimonials: () =>
          setTestimonialsSettings(state.lastSavedTestimonials),
        services: () => setServicesSettings(state.lastSavedServices),
        values: () => setValuesSettings(state.lastSavedValues),
        gallery: () => setGallerySettings(state.lastSavedGallery),
        "gallery-preview": () => setGallerySettings(state.lastSavedGallery),
        "gallery-grid": () => setGallerySettings(state.lastSavedGallery),
        cta: () => setCTASettings(state.lastSavedCTA),
        header: () => setHeaderSettings(state.lastSavedHeader),
        footer: () => setFooterSettings(state.lastSavedFooter),
        "booking-service": () =>
          setBookingServiceSettings(state.lastSavedBookingService),
        "booking-date": () =>
          setBookingDateSettings(state.lastSavedBookingDate),
        "booking-time": () =>
          setBookingTimeSettings(state.lastSavedBookingTime),
        "booking-form": () =>
          setBookingFormSettings(state.lastSavedBookingForm),
        "booking-confirmation": () =>
          setBookingConfirmationSettings(state.lastSavedBookingConfirmation),
      };

      const resetFn = resetMap[targetSectionId];
      if (resetFn) {
        resetFn();
        toast({
          title: "Resetado",
          description: `Seção ${targetSectionId} voltou ao estado salvo.`,
        });
      }
    },
    [
      activeSectionId,
      state.lastSavedHero,
      state.lastSavedAboutHero,
      state.lastSavedStory,
      state.lastSavedTeam,
      state.lastSavedTestimonials,
      state.lastSavedServices,
      state.lastSavedValues,
      state.lastSavedGallery,
      state.lastSavedCTA,
      state.lastSavedHeader,
      state.lastSavedFooter,
      state.lastSavedBookingService,
      state.lastSavedBookingDate,
      state.lastSavedBookingTime,
      state.lastSavedBookingForm,
      state.lastSavedBookingConfirmation,
      setHeroSettings,
      setAboutHeroSettings,
      setStorySettings,
      setTeamSettings,
      setTestimonialsSettings,
      setServicesSettings,
      setValuesSettings,
      setGallerySettings,
      setCTASettings,
      setHeaderSettings,
      setFooterSettings,
      setBookingServiceSettings,
      setBookingDateSettings,
      setBookingTimeSettings,
      setBookingFormSettings,
      setBookingConfirmationSettings,
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
    handleApplyValues,
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
    handleUpdateHeader,
    handleUpdateFooter,
    handleUpdateBookingService,
    handleUpdateBookingDate,
    handleUpdateBookingTime,
    handleUpdateBookingForm,
    handleUpdateBookingConfirmation,
    handleUpdateCTA,
    handleUpdateValues,
    handleUpdateFont,
    handleUpdateColors,
  };
}
