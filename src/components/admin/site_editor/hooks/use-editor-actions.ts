import { useCallback } from "react";
import type { 
  AppearanceSettings, 
  BookingStepSettings,
} from "@/lib/booking-data";
import type { BackgroundSettings } from "../components/BackgroundEditor";
import type { useEditorLocal } from "./use-editor-local";
import type { useEditorState } from "./use-editor-state";

interface UseEditorActionsProps {
  state: ReturnType<typeof useEditorState>;
  local: ReturnType<typeof useEditorLocal>;
  toast: (options: { title?: string; description?: string; variant?: "default" | "destructive" }) => void;
}

export function useEditorActions({ state, local, toast }: UseEditorActionsProps) {
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
    handleUpdateBookingService: handleUpdateBookingServiceState,
    handleUpdateBookingDate: handleUpdateBookingDateState,
    handleUpdateBookingTime: handleUpdateBookingTimeState,
    handleUpdateBookingForm: handleUpdateBookingFormState,
    handleUpdateBookingConfirmation: handleUpdateBookingConfirmationState,
    handleUpdateBackground: handleUpdateBackgroundState,
    activeSectionId,
  } = state;

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
    toast({ title: "Sucesso", description: "Configurações do Hero aplicadas." });
  }, [heroSettings, setLastAppliedHero, toast]);

  const handleApplyAboutHero = useCallback(() => {
    setLastAppliedAboutHero(aboutHeroSettings);
    toast({ title: "Sucesso", description: "Configurações do Sobre aplicadas." });
  }, [aboutHeroSettings, setLastAppliedAboutHero, toast]);

  const handleApplyStory = useCallback(() => {
    setLastAppliedStory(storySettings);
    toast({ title: "Sucesso", description: "Configurações da História aplicadas." });
  }, [storySettings, setLastAppliedStory, toast]);

  const handleApplyTeam = useCallback(() => {
    setLastAppliedTeam(teamSettings);
    toast({ title: "Sucesso", description: "Configurações da Equipe aplicadas." });
  }, [teamSettings, setLastAppliedTeam, toast]);

  const handleApplyTestimonials = useCallback(() => {
    setLastAppliedTestimonials(testimonialsSettings);
    toast({ title: "Sucesso", description: "Configurações de Depoimentos aplicadas." });
  }, [testimonialsSettings, setLastAppliedTestimonials, toast]);

  const handleApplyFont = useCallback(() => {
    setLastAppliedFont(fontSettings);
    toast({ title: "Sucesso", description: "Configurações de Fontes aplicadas." });
  }, [fontSettings, setLastAppliedFont, toast]);

  const handleApplyTypography = handleApplyFont;

  const handleApplyColors = useCallback(() => {
    setLastAppliedColor(colorSettings);
    toast({ title: "Sucesso", description: "Configurações de Cores aplicadas." });
  }, [colorSettings, setLastAppliedColor, toast]);

  const handleApplyServices = useCallback(() => {
    setLastAppliedServices(servicesSettings);
    toast({ title: "Sucesso", description: "Configurações de Serviços aplicadas." });
  }, [servicesSettings, setLastAppliedServices, toast]);

  const handleApplyValues = useCallback(() => {
    setLastAppliedValues(valuesSettings);
    toast({ title: "Sucesso", description: "Configurações de Valores aplicadas." });
  }, [valuesSettings, setLastAppliedValues, toast]);

  const handleApplyGallery = useCallback(() => {
    setLastAppliedGallery(gallerySettings);
    toast({ title: "Sucesso", description: "Configurações da Galeria aplicadas." });
  }, [gallerySettings, setLastAppliedGallery, toast]);

  const handleApplyCTA = useCallback(() => {
    setLastAppliedCTA(ctaSettings);
    toast({ title: "Sucesso", description: "Configurações de CTA aplicadas." });
  }, [ctaSettings, setLastAppliedCTA, toast]);

  const handleApplyHeader = useCallback(() => {
    setLastAppliedHeader(headerSettings);
    toast({ title: "Sucesso", description: "Configurações do Cabeçalho aplicadas." });
  }, [headerSettings, setLastAppliedHeader, toast]);

  const handleApplyFooter = useCallback(() => {
    setLastAppliedFooter(footerSettings);
    toast({ title: "Sucesso", description: "Configurações do Rodapé aplicadas." });
  }, [footerSettings, setLastAppliedFooter, toast]);

  const handleApplyBookingService = useCallback(() => {
    setLastAppliedBookingService(bookingServiceSettings);
    toast({ title: "Sucesso", description: "Configurações do Passo 1 aplicadas." });
  }, [bookingServiceSettings, setLastAppliedBookingService, toast]);

  const handleApplyBookingDate = useCallback(() => {
    setLastAppliedBookingDate(bookingDateSettings);
    toast({ title: "Sucesso", description: "Configurações do Passo 2 aplicadas." });
  }, [bookingDateSettings, setLastAppliedBookingDate, toast]);

  const handleApplyBookingTime = useCallback(() => {
    setLastAppliedBookingTime(bookingTimeSettings);
    toast({ title: "Sucesso", description: "Configurações do Passo 3 aplicadas." });
  }, [bookingTimeSettings, setLastAppliedBookingTime, toast]);

  const handleApplyBookingForm = useCallback(() => {
    setLastAppliedBookingForm(bookingFormSettings);
    toast({ title: "Sucesso", description: "Configurações do Passo 4 aplicadas." });
  }, [bookingFormSettings, setLastAppliedBookingForm, toast]);

  const handleApplyBookingConfirmation = useCallback(() => {
    setLastAppliedBookingConfirmation(bookingConfirmationSettings);
    toast({ title: "Sucesso", description: "Configurações de Confirmação aplicadas." });
  }, [bookingConfirmationSettings, setLastAppliedBookingConfirmation, toast]);

  const resetSettings = useCallback(() => {
    clearLocalDrafts();
    window.location.reload();
  }, [clearLocalDrafts]);

  const handleUpdateBackground = useCallback(
    (updates: Partial<BackgroundSettings>, sectionId?: string) => {
      const targetSectionId = sectionId || activeSectionId;
      handleUpdateBackgroundState(updates, targetSectionId);

      const saveFnMap: Record<string, (u: { appearance?: AppearanceSettings }) => void> = {
        hero: (s) => saveHeroSettings({ ...heroSettings, ...s }),
        "about-hero": (s) => saveAboutHeroSettings({ ...aboutHeroSettings, ...s }),
        story: (s) => saveStorySettings({ ...storySettings, ...s }),
        team: (s) => saveTeamSettings({ ...teamSettings, ...s }),
        testimonials: (s) => saveTestimonialsSettings({ ...testimonialsSettings, ...s }),
        services: (s) => saveServicesSettings({ ...servicesSettings, ...s }),
        values: (s) => saveValuesSettings({ ...valuesSettings, ...s }),
        "gallery-preview": (s) => saveGallerySettings({ ...gallerySettings, ...s }),
        "gallery-grid": (s) => saveGallerySettings({ ...gallerySettings, ...s }),
        cta: (s) => saveCTASettings({ ...ctaSettings, ...s }),
        "booking-service": (s) => saveBookingServiceSettings({ ...bookingServiceSettings, ...s }),
        "booking-date": (s) => saveBookingDateSettings({ ...bookingDateSettings, ...s }),
        "booking-time": (s) => saveBookingTimeSettings({ ...bookingTimeSettings, ...s }),
        "booking-form": (s) => saveBookingFormSettings({ ...bookingFormSettings, ...s }),
        "booking-confirmation": (s) => saveBookingConfirmationSettings({ ...bookingConfirmationSettings, ...s }),
      };

      const saveFn = saveFnMap[targetSectionId];
      if (saveFn) {
        // Normaliza para o tipo AppearanceSettings esperado pelas funções de salvamento
        const appearanceUpdates = updates.appearance || (updates.bgImage ? { backgroundImageUrl: updates.bgImage } : undefined);
        if (appearanceUpdates) {
          saveFn({ appearance: appearanceUpdates as AppearanceSettings });
        }
      }
    },
    [
      activeSectionId,
      handleUpdateBackgroundState,
      heroSettings,
      saveHeroSettings,
      aboutHeroSettings,
      saveAboutHeroSettings,
      storySettings,
      saveStorySettings,
      teamSettings,
      saveTeamSettings,
      testimonialsSettings,
      saveTestimonialsSettings,
      servicesSettings,
      saveServicesSettings,
      valuesSettings,
      saveValuesSettings,
      gallerySettings,
      saveGallerySettings,
      ctaSettings,
      saveCTASettings,
      bookingServiceSettings,
      saveBookingServiceSettings,
      bookingDateSettings,
      saveBookingDateSettings,
      bookingTimeSettings,
      saveBookingTimeSettings,
      bookingFormSettings,
      saveBookingFormSettings,
      bookingConfirmationSettings,
      saveBookingConfirmationSettings,
    ],
  );

  const handleUpdateBookingService = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingServiceState(updates);
      saveBookingServiceSettings({ ...bookingServiceSettings, ...updates });
    },
    [handleUpdateBookingServiceState, saveBookingServiceSettings, bookingServiceSettings],
  );

  const handleUpdateBookingDate = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingDateState(updates);
      saveBookingDateSettings({ ...bookingDateSettings, ...updates });
    },
    [handleUpdateBookingDateState, saveBookingDateSettings, bookingDateSettings],
  );

  const handleUpdateBookingTime = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingTimeState(updates);
      saveBookingTimeSettings({ ...bookingTimeSettings, ...updates });
    },
    [handleUpdateBookingTimeState, saveBookingTimeSettings, bookingTimeSettings],
  );

  const handleUpdateBookingForm = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingFormState(updates);
      saveBookingFormSettings({ ...bookingFormSettings, ...updates });
    },
    [handleUpdateBookingFormState, saveBookingFormSettings, bookingFormSettings],
  );

  const handleUpdateBookingConfirmation = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      handleUpdateBookingConfirmationState(updates);
      saveBookingConfirmationSettings({
        ...bookingConfirmationSettings,
        ...updates,
      });
    },
    [handleUpdateBookingConfirmationState, saveBookingConfirmationSettings, bookingConfirmationSettings],
  );

  const handleSectionReset = useCallback(
    (sectionId?: string) => {
      const targetSectionId = sectionId || activeSectionId;
      const resetMap: Record<string, () => void> = {
        hero: () => setHeroSettings(state.lastSavedHero),
        "about-hero": () => setAboutHeroSettings(state.lastSavedAboutHero),
        story: () => setStorySettings(state.lastSavedStory),
        team: () => setTeamSettings(state.lastSavedTeam),
        testimonials: () => setTestimonialsSettings(state.lastSavedTestimonials),
        services: () => setServicesSettings(state.lastSavedServices),
        values: () => setValuesSettings(state.lastSavedValues),
        "gallery-preview": () => setGallerySettings(state.lastSavedGallery),
        "gallery-grid": () => setGallerySettings(state.lastSavedGallery),
        cta: () => setCTASettings(state.lastSavedCTA),
        header: () => setHeaderSettings(state.lastSavedHeader),
        footer: () => setFooterSettings(state.lastSavedFooter),
        "booking-service": () => setBookingServiceSettings(state.lastSavedBookingService),
        "booking-date": () => setBookingDateSettings(state.lastSavedBookingDate),
        "booking-time": () => setBookingTimeSettings(state.lastSavedBookingTime),
        "booking-form": () => setBookingFormSettings(state.lastSavedBookingForm),
        "booking-confirmation": () => setBookingConfirmationSettings(state.lastSavedBookingConfirmation),
      };

      const resetFn = resetMap[targetSectionId];
      if (resetFn) {
        resetFn();
        toast({ title: "Resetado", description: `Seção ${targetSectionId} voltou ao estado salvo.` });
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
