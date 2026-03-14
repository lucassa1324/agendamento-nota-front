import { useCallback, useEffect, useState } from "react";
import { useStudio } from "@/context/studio-context";
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
import { type SiteConfigData } from "@/lib/site-config-types";
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
import type { BackgroundSettings } from "../components/BackgroundEditor";

export function useEditorState() {
  const { studio } = useStudio();
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
        accentColor?: string;
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
        nextAppearance.titleColor = sanitizeColor(updates.titleColor);
        state.titleColor = sanitizeColor(updates.titleColor);
      } else if (prev.titleColor !== undefined) {
        nextAppearance.titleColor = sanitizeColor(prev.titleColor);
        state.titleColor = sanitizeColor(prev.titleColor);
      }
      
      if (updates.subtitleColor !== undefined) {
        nextAppearance.subtitleColor = sanitizeColor(updates.subtitleColor);
        state.subtitleColor = sanitizeColor(updates.subtitleColor);
      } else if (prev.subtitleColor !== undefined) {
        nextAppearance.subtitleColor = sanitizeColor(prev.subtitleColor);
        state.subtitleColor = sanitizeColor(prev.subtitleColor);
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
        nextAppearance.cardBgColor = sanitizeColor(updates.cardBgColor);
        state.cardBgColor = sanitizeColor(updates.cardBgColor);
      } else if (prev.cardBgColor !== undefined) {
        nextAppearance.cardBgColor = sanitizeColor(prev.cardBgColor);
        state.cardBgColor = sanitizeColor(prev.cardBgColor);
      }

      if (updates.accentColor !== undefined) {
        nextAppearance.accentColor = sanitizeColor(updates.accentColor);
        state.accentColor = sanitizeColor(updates.accentColor);
      } else if (prev.accentColor !== undefined) {
        nextAppearance.accentColor = sanitizeColor(prev.accentColor);
        state.accentColor = sanitizeColor(prev.accentColor);
      }

      if (updates.bgColor !== undefined) {
        const sanitized = sanitizeColor(updates.bgColor);
        nextAppearance.backgroundColor = sanitized;
        state.bgColor = sanitized;
      }

      if (updates.appearance?.backgroundColor !== undefined) {
        const sanitized = sanitizeColor(updates.appearance.backgroundColor);
        nextAppearance.backgroundColor = sanitized;
        state.bgColor = sanitized;
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

  const [isInitialized, setIsInitialized] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  // 1. Adicionar um efeito que observa o studio.config para sincronização inicial reativa
  useEffect(() => {
    // Só sincronizamos se os dados do banco existirem e se o utilizador ainda não fez alterações manuais (isDirty)
    if (studio?.config && !isDirty) {
      const config = studio.config as SiteConfigData;
      console.log(">>> [SYNC] Sincronizando estado do editor com studio.config (isDirty=false)");

      const siteCustomization = config.siteCustomization || config.site_customization;
      const layoutGlobal = (siteCustomization?.layoutGlobal ||
        siteCustomization?.layout_global) || {};
      
      const siteColors = (layoutGlobal as any)?.siteColors || (layoutGlobal as any)?.color || (layoutGlobal as any)?.site_colors || (layoutGlobal as any)?.cores_base;
      const siteFonts = (layoutGlobal as any)?.fontes || (layoutGlobal as any)?.typography;
      const appointmentFlow = config.appointmentFlow as Record<string, unknown> | undefined;
      const step1Services =
        (appointmentFlow?.step1Services as Record<string, unknown>) ||
        (appointmentFlow?.step1_services as Record<string, unknown>) ||
        (appointmentFlow?.step1_service as Record<string, unknown>);
      const step1CardConfig =
        (step1Services?.cardConfig as Record<string, unknown>) ||
        (step1Services?.card_config as Record<string, unknown>);
      const step1CardBg = sanitizeColor(
        (step1CardConfig?.backgroundColor as string) ||
          (step1CardConfig?.cardBackgroundColor as string) ||
          (step1CardConfig?.background_color as string) ||
          (step1CardConfig?.card_background_color as string),
      );

      const hasValidColors = (colors: any) => 
        colors && Object.values(colors).some(v => typeof v === 'string' && v.startsWith('#') && v.length >= 4);

      if (hasValidColors(siteColors) || hasValidColors(config.colors)) {
        console.log(">>> [SYNC] Cores válidas encontradas no banco. Aplicando...");
        setColorSettings(prev => ({
          ...prev,
          ...(config.colors || {}),
          ...(siteColors || {}),
        }));
      } else {
        console.warn(">>> [SYNC] Cores do banco inválidas ou vazias. Mantendo default.");
      }

      if (siteFonts || config.typography || config.theme) {
        setFontSettings(prev => ({
          ...prev,
          ...(config.theme || {}),
          ...(config.typography || {}),
          ...(siteFonts || {}),
        }));
      }

      if (config.hero) setHeroSettings(prev => ({ ...prev, ...config.hero }));
      if (config.about) setAboutHeroSettings(prev => ({ ...prev, ...(config.about as any) }));
      if (config.story) setStorySettings(prev => ({ ...prev, ...config.story }));
      if (config.team) setTeamSettings(prev => ({ ...prev, ...config.team }));
      if (config.testimonials) setTestimonialsSettings(prev => ({ ...prev, ...config.testimonials }));
      if (config.services) setServicesSettings(prev => ({ ...prev, ...config.services }));
      if (config.values) setValuesSettings(prev => ({ ...prev, ...config.values }));
      if (config.gallery) setGallerySettings(prev => ({ ...prev, ...config.gallery }));
      if (config.cta) setCTASettings(prev => ({ ...prev, ...config.cta }));
      if (config.header) setHeaderSettings(prev => ({ ...prev, ...config.header }));
      if (config.footer) setFooterSettings(prev => ({ ...prev, ...config.footer }));
      
      // Sincronizar bookingSteps se houver
      const bookingSteps = (config.appointmentFlow || config.bookingSteps) as
        | Record<string, BookingStepSettings | undefined>
        | undefined;
      const serviceStep = bookingSteps?.service;
      if (bookingSteps) {
        if (serviceStep) {
          setBookingServiceSettings(prev => ({
            ...prev,
            ...serviceStep,
            cardBgColor:
              sanitizeColor(serviceStep.cardBgColor || step1CardBg) ||
              prev.cardBgColor,
          }));
        } else if (step1CardBg) {
          setBookingServiceSettings(prev => ({
            ...prev,
            cardBgColor: step1CardBg,
          }));
        }
        if (bookingSteps.date) setBookingDateSettings(prev => ({ ...prev, ...bookingSteps.date }));
        if (bookingSteps.time) setBookingTimeSettings(prev => ({ ...prev, ...bookingSteps.time }));
        if (bookingSteps.form) setBookingFormSettings(prev => ({ ...prev, ...bookingSteps.form }));
        if (bookingSteps.confirmation) setBookingConfirmationSettings(prev => ({ ...prev, ...bookingSteps.confirmation }));
      }

      // Seções e Visibilidade
      if (config.visibleSections) setVisibleSections(prev => ({ ...prev, ...config.visibleSections }));
      if (config.pageVisibility) setPageVisibility(prev => ({ ...prev, ...config.pageVisibility }));

      console.log(">>> [SYNC] Estado do editor sincronizado com o Banco de Dados.");
    }
  }, [studio?.config, isDirty]);

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
      setValuesSettings((prev) => syncBackground(prev, {}));
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
      setIsDirty(true);
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
      setIsDirty(true);
      setAboutHeroSettings((prev: HeroSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateStory = useCallback(
    (updates: Partial<StorySettings>) => {
      setIsDirty(true);
      setStorySettings((prev: StorySettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateTeam = useCallback(
    (updates: Partial<TeamSettings>) => {
      setIsDirty(true);
      setTeamSettings((prev: TeamSettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateTestimonials = useCallback(
    (updates: Partial<TestimonialsSettings>) => {
      setIsDirty(true);
      setTestimonialsSettings((prev: TestimonialsSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateFont = useCallback((updates: Partial<FontSettings>) => {
    setIsDirty(true);
    setFontSettings((prev: FontSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateColors = useCallback((updates: Partial<ColorSettings>) => {
    setIsDirty(true);
    setColorSettings((prev: ColorSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateServices = useCallback(
    (updates: Partial<ServicesSettings>) => {
      setIsDirty(true);
      setServicesSettings((prev: ServicesSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateValues = useCallback(
    (updates: Partial<ValuesSettings>) => {
      setIsDirty(true);
      setValuesSettings((prev: ValuesSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateGallery = useCallback(
    (updates: Partial<GallerySettings>) => {
      setIsDirty(true);
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
      setIsDirty(true);
      setCTASettings((prev: CTASettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateHeader = useCallback((updates: Partial<HeaderSettings>) => {
    setIsDirty(true);
    setHeaderSettings((prev: HeaderSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateFooter = useCallback((updates: Partial<FooterSettings>) => {
    setIsDirty(true);
    setFooterSettings((prev: FooterSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateBookingService = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setIsDirty(true);
      setBookingServiceSettings((prev: BookingStepSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateBookingDate = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setIsDirty(true);
      setBookingDateSettings((prev: BookingStepSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateBookingTime = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setIsDirty(true);
      setBookingTimeSettings((prev: BookingStepSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateBookingForm = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setIsDirty(true);
      setBookingFormSettings((prev: BookingStepSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateBookingConfirmation = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setIsDirty(true);
      setBookingConfirmationSettings((prev: BookingStepSettings) =>
        syncBackground(prev, updates),
      );
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
