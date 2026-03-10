import { useCallback, useState } from "react";
import type {
  AppearanceSettings,
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
} from "@/lib/booking-data";
import type { BackgroundSettings } from "../components/BackgroundEditor";

export function useEditorState() {
  // Helper para sincronizar bgImage com appearance.backgroundImageUrl
  const syncBackground = useCallback(
    <
      T extends {
        bgImage?: string;
        bgType?: string;
        bgColor?: string;
        titleColor?: string;
        subtitleColor?: string;
        titleFont?: string;
        subtitleFont?: string;
        cardBgColor?: string;
        appearance?: AppearanceSettings;
      },
    >(
      prev: T,
      updates: Partial<T>,
    ): T => {
      // Merge inicial raso para pegar as propriedades de nível superior
      const state = { ...prev, ...updates };

      // Garantir que o objeto appearance seja mesclado profundamente (Deep Merge)
      // Se updates trouxer um appearance, mesclamos com o anterior em vez de sobrescrever.
      if (updates.appearance || prev.appearance) {
        state.appearance = {
          ...(prev.appearance || {}),
          ...(updates.appearance || {}),
        } as T["appearance"];
      }

      const nextAppearance = { ...(state.appearance || {}) };

      // Tipografia e Cores de Texto (Prioridade para o que vem no updates, depois prev top-level, depois appearance)
      if (updates.titleColor !== undefined) {
        nextAppearance.titleColor = updates.titleColor;
      } else if (prev.titleColor !== undefined) {
        nextAppearance.titleColor = prev.titleColor;
      }
      
      if (updates.subtitleColor !== undefined) {
        nextAppearance.subtitleColor = updates.subtitleColor;
      } else if (prev.subtitleColor !== undefined) {
        nextAppearance.subtitleColor = prev.subtitleColor;
      }

      if (updates.titleFont !== undefined) {
        nextAppearance.titleFont = updates.titleFont;
      } else if (prev.titleFont !== undefined) {
        nextAppearance.titleFont = prev.titleFont;
      }

      if (updates.subtitleFont !== undefined) {
        nextAppearance.subtitleFont = updates.subtitleFont;
      } else if (prev.subtitleFont !== undefined) {
        nextAppearance.subtitleFont = prev.subtitleFont;
      }

      if (updates.cardBgColor !== undefined) {
        nextAppearance.cardBgColor = updates.cardBgColor;
      } else if (prev.cardBgColor !== undefined) {
        nextAppearance.cardBgColor = prev.cardBgColor;
      }

      if (updates.bgColor !== undefined) {
        nextAppearance.backgroundColor = updates.bgColor;
        state.bgColor = updates.bgColor;
      }

      if (updates.appearance?.backgroundColor !== undefined) {
        nextAppearance.backgroundColor = updates.appearance.backgroundColor;
        state.bgColor = updates.appearance.backgroundColor;
      }

      // Sincroniza o appearance final com as mudanças processadas
      state.appearance = nextAppearance;

      // Se bgImage foi definida, apenas atualizamos a URL, mantendo o bgType atual 
      // para permitir que o usuário escolha explicitamente entre cor e imagem.
      if (updates.bgImage) {
        state.appearance = {
          ...(state.appearance || {}),
          backgroundImageUrl: updates.bgImage,
        };
      }
      // Se appearance.backgroundImageUrl foi definida, sincroniza bgImage e garante bgType
      else if (updates.appearance?.backgroundImageUrl) {
        state.bgImage = updates.appearance.backgroundImageUrl;
        state.bgType = "image";
      }
      // Se bgImage ou backgroundImageUrl foram limpos explicitamente, volta para color
      else if (
        updates.bgImage === "" ||
        updates.appearance?.backgroundImageUrl === ""
      ) {
        state.bgType = "color";
        state.bgImage = "";
        state.appearance = {
          ...(state.appearance || {}),
          backgroundImageUrl: "",
        };
      }

      return state;
    },
    [],
  );

  const [heroSettings, setHeroSettings] =
    useState<HeroSettings>(defaultHeroSettings);
  const [aboutHeroSettings, setAboutHeroSettings] = useState<HeroSettings>(
    defaultAboutHeroSettings,
  );
  const [storySettings, setStorySettings] =
    useState<StorySettings>(defaultStorySettings);
  const [teamSettings, setTeamSettings] =
    useState<TeamSettings>(defaultTeamSettings);
  const [testimonialsSettings, setTestimonialsSettings] =
    useState<TestimonialsSettings>(defaultTestimonialsSettings);
  const [fontSettings, setFontSettings] =
    useState<FontSettings>(defaultFontSettings);
  const [colorSettings, setColorSettings] =
    useState<ColorSettings>(defaultColorSettings);
  const [servicesSettings, setServicesSettings] = useState<ServicesSettings>(
    defaultServicesSettings,
  );
  const [valuesSettings, setValuesSettings] = useState<ValuesSettings>(
    defaultValuesSettings,
  );
  const [gallerySettings, setGallerySettings] = useState<GallerySettings>(
    defaultGallerySettings,
  );
  const [ctaSettings, setCTASettings] =
    useState<CTASettings>(defaultCTASettings);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(
    defaultHeaderSettings,
  );
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(
    defaultFooterSettings,
  );

  const [bookingServiceSettings, setBookingServiceSettings] =
    useState<BookingStepSettings>(defaultBookingServiceSettings);
  const [bookingDateSettings, setBookingDateSettings] =
    useState<BookingStepSettings>(defaultBookingDateSettings);
  const [bookingTimeSettings, setBookingTimeSettings] =
    useState<BookingStepSettings>(defaultBookingTimeSettings);
  const [bookingFormSettings, setBookingFormSettings] =
    useState<BookingStepSettings>(defaultBookingFormSettings);
  const [bookingConfirmationSettings, setBookingConfirmationSettings] =
    useState<BookingStepSettings>(defaultBookingConfirmationSettings);

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
  const [lastAppliedValues, setLastAppliedValues] = useState<ValuesSettings>(
    defaultValuesSettings,
  );
  const [lastAppliedGallery, setLastAppliedGallery] = useState<GallerySettings>(
    defaultGallerySettings,
  );
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
  const [lastSavedValues, setLastSavedValues] = useState<ValuesSettings>(
    defaultValuesSettings,
  );
  const [lastSavedGallery, setLastSavedGallery] = useState<GallerySettings>(
    defaultGallerySettings,
  );
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

  const handleUpdateHero = useCallback(
    (updates: Partial<HeroSettings>) => {
      console.log(
        ">>> [useEditorState] handleUpdateHero chamado com:",
        updates,
      );
      setHeroSettings((prev: HeroSettings) => {
        const newState = syncBackground(prev, updates);
        console.log(
          ">>> [useEditorState] Estado HERO atualizado. bgImage:",
          newState.bgImage,
          " appearance.backgroundImageUrl:",
          newState.appearance?.backgroundImageUrl,
        );
        return newState;
      });
    },
    [syncBackground],
  );

  const handleUpdateAboutHero = useCallback(
    (updates: Partial<HeroSettings>) => {
      setAboutHeroSettings((prev: HeroSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateStory = useCallback(
    (updates: Partial<StorySettings>) => {
      setStorySettings((prev: StorySettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateTeam = useCallback(
    (updates: Partial<TeamSettings>) => {
      setTeamSettings((prev: TeamSettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateTestimonials = useCallback(
    (updates: Partial<TestimonialsSettings>) => {
      setTestimonialsSettings((prev: TestimonialsSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateFont = useCallback((updates: Partial<FontSettings>) => {
    setFontSettings((prev: FontSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateColors = useCallback((updates: Partial<ColorSettings>) => {
    setColorSettings((prev: ColorSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateServices = useCallback(
    (updates: Partial<ServicesSettings>) => {
      setServicesSettings((prev: ServicesSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateValues = useCallback(
    (updates: Partial<ValuesSettings>) => {
      setValuesSettings((prev: ValuesSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateGallery = useCallback(
    (updates: Partial<GallerySettings>) => {
      console.log(">>> [useEditorState] handleUpdateGallery chamado com:", updates);
      setGallerySettings((prev: GallerySettings) => {
        const newState = syncBackground(prev, updates);
        console.log(">>> [useEditorState] Estado GALLERY atualizado:", {
          bgType: newState.bgType,
          bgColor: newState.bgColor,
          bgImage: newState.bgImage,
          appearance: newState.appearance
        });
        return newState;
      });
    },
    [syncBackground],
  );

  const handleUpdateCTA = useCallback(
    (updates: Partial<CTASettings>) => {
      setCTASettings((prev: CTASettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateHeader = useCallback((updates: Partial<HeaderSettings>) => {
    setHeaderSettings((prev: HeaderSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateFooter = useCallback((updates: Partial<FooterSettings>) => {
    setFooterSettings((prev: FooterSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateBookingService = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setBookingServiceSettings((prev: BookingStepSettings) => {
        console.log(">>> [DEBUG] BookingService - Estado Anterior:", prev);
        console.log(">>> [DEBUG] BookingService - Updates Recebidos:", updates);
        // Sincroniza campos de topo com o objeto appearance se necessário via syncBackground
        return syncBackground(prev, updates);
      });
    },
    [syncBackground],
  );

  const handleUpdateBookingDate = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setBookingDateSettings((prev: BookingStepSettings) => {
        console.log(">>> [DEBUG] BookingDate - Estado Anterior:", prev);
        console.log(">>> [DEBUG] BookingDate - Updates Recebidos:", updates);
        return syncBackground(prev, updates);
      });
    },
    [syncBackground],
  );

  const handleUpdateBookingTime = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setBookingTimeSettings((prev: BookingStepSettings) => {
        console.log(">>> [DEBUG] BookingTime - Estado Anterior:", prev);
        console.log(">>> [DEBUG] BookingTime - Updates Recebidos:", updates);
        return syncBackground(prev, updates);
      });
    },
    [syncBackground],
  );

  const handleUpdateBookingForm = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setBookingFormSettings((prev: BookingStepSettings) => {
        console.log(">>> [DEBUG] BookingForm - Estado Anterior:", prev);
        console.log(">>> [DEBUG] BookingForm - Updates Recebidos:", updates);
        return syncBackground(prev, updates);
      });
    },
    [syncBackground],
  );

  const handleUpdateBookingConfirmation = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setBookingConfirmationSettings((prev: BookingStepSettings) => {
        console.log(">>> [DEBUG] BookingConfirmation - Estado Anterior:", prev);
        console.log(">>> [DEBUG] BookingConfirmation - Updates Recebidos:", updates);
        return syncBackground(prev, updates);
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
        values: handleUpdateValues as (u: Partial<BackgroundSettings>) => void,
        gallery: handleUpdateGallery as (u: Partial<BackgroundSettings>) => void,
        "gallery-preview": handleUpdateGallery as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "gallery-grid": handleUpdateGallery as (
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
      handleUpdateValues,
      handleUpdateGallery,
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
    valuesSettings,
    setValuesSettings,
    gallerySettings,
    setGallerySettings,
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
    pageVisibility,
    setPageVisibility,
    visibleSections,
    setVisibleSections,
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
    lastAppliedValues,
    setLastAppliedValues,
    lastAppliedGallery,
    setLastAppliedGallery,
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
    lastSavedValues,
    setLastSavedValues,
    lastSavedGallery,
    setLastSavedGallery,
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
    handleUpdateValues,
    handleUpdateGallery,
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
  };
}
