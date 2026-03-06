import { useCallback } from "react";
import type { BookingStepSettings } from "@/lib/booking-data";
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

      const saveFn = saveFnMap[targetSectionId];
      if (saveFn) {
        const currentSettings = currentSettingsMap[targetSectionId];
        const merged = currentSettings
          ? { ...currentSettings, ...normalizedUpdates }
          : normalizedUpdates;

        // Garante limpeza de bgImage se for cor
        if (merged.bgType === "color") {
          merged.bgImage = "";
          merged.appearance = {
            ...(merged.appearance || {}),
            backgroundImageUrl: "",
          };
        }

        saveFn(merged);

        // Dispara evento para o auto-save e sincronização de preview
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("local_draft_changed"));
        }
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
      businessId,
      deleteOrphanImage,
    ],
  );

  const handleUpdateBookingService = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingServiceState(updates);
      saveBookingServiceSettings({ ...bookingServiceSettings, ...updates });
    },
    [
      handleUpdateBookingServiceState,
      saveBookingServiceSettings,
      bookingServiceSettings,
    ],
  );

  const handleUpdateBookingDate = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingDateState(updates);
      saveBookingDateSettings({ ...bookingDateSettings, ...updates });
    },
    [
      handleUpdateBookingDateState,
      saveBookingDateSettings,
      bookingDateSettings,
    ],
  );

  const handleUpdateBookingTime = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingTimeState(updates);
      saveBookingTimeSettings({ ...bookingTimeSettings, ...updates });
    },
    [
      handleUpdateBookingTimeState,
      saveBookingTimeSettings,
      bookingTimeSettings,
    ],
  );

  const handleUpdateBookingForm = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingFormState(updates);
      saveBookingFormSettings({ ...bookingFormSettings, ...updates });
    },
    [
      handleUpdateBookingFormState,
      saveBookingFormSettings,
      bookingFormSettings,
    ],
  );

  const handleUpdateBookingConfirmation = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingConfirmationState(updates);
      saveBookingConfirmationSettings({
        ...bookingConfirmationSettings,
        ...updates,
      });
    },
    [
      handleUpdateBookingConfirmationState,
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
    handleUpdateBookingService,
    handleUpdateBookingDate,
    handleUpdateBookingTime,
    handleUpdateBookingForm,
    handleUpdateBookingConfirmation,
  };
}
