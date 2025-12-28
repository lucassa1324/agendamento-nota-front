/**
 * useSiteEditor: Hook de Orquestração do Estado do Site
 *
 * Este é o hook "cérebro" do editor de site. Ele gerencia todo o estado das configurações
 * visíveis no painel e garante que essas mudanças sejam persistidas e refletidas no preview.
 *
 * Responsabilidades principais:
 *
 * 1. Gestão de Estados de Seção:
 *    - Mantém os dados atuais de cada seção do site (Hero, Serviços, Galeria, etc.).
 *    - Gerencia estados temporários de edição (o que o usuário está digitando no momento).
 *    - Controla os estados "Dirty" (compara o estado atual com o último salvo para habilitar botões).
 *
 * 2. Persistência de Dados:
 *    - Ao carregar, recupera as configurações salvas do `localStorage`.
 *    - Ao clicar em 'Salvar', grava as alterações permanentemente no armazenamento do navegador.
 *
 * 3. Sincronização em Tempo Real (PostMessage):
 *    - Possui um mecanismo que envia mensagens (`postMessage`) para o iframe do preview sempre
 *      que qualquer configuração é alterada. Isso permite que o usuário veja as mudanças
 *      instantaneamente enquanto digita, sem precisar recarregar.
 *
 * 4. Controle de Visibilidade:
 *    - Gerencia quais páginas e quais seções específicas do site estão ativas ou ocultas.
 *
 * 5. Sistema de Feedback:
 *    - Integrado com o sistema de `Toast` para notificar o usuário sobre o sucesso ou falha
 *      ao salvar as alterações.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";
import { useToast } from "@/hooks/use-toast";
import {
  type BookingStepSettings,
  type CTASettings,
  type FontSettings,
  type FooterSettings,
  type GallerySettings,
  type HeaderSettings,
  type HeroSettings,
  type ServicesSettings,
  type StorySettings,
  type TeamSettings,
  type TestimonialsSettings,
  type ValuesSettings,
  defaultAboutHeroSettings,
  defaultBookingConfirmationSettings,
  defaultBookingDateSettings,
  defaultBookingFormSettings,
  defaultBookingServiceSettings,
  defaultBookingTimeSettings,
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
  getAboutHeroSettings,
  getBookingConfirmationSettings,
  getBookingDateSettings,
  getBookingFormSettings,
  getBookingServiceSettings,
  getBookingTimeSettings,
  getCTASettings,
  getFontSettings,
  getFooterSettings,
  getGallerySettings,
  getHeaderSettings,
  getHeroSettings,
  getPageVisibility,
  getServicesSettings,
  getStorySettings,
  getTeamSettings,
  getTestimonialsSettings,
  getValuesSettings,
  getVisibleSections,
  saveAboutHeroSettings,
  saveBookingConfirmationSettings,
  saveBookingDateSettings,
  saveBookingFormSettings,
  saveBookingServiceSettings,
  saveBookingTimeSettings,
  saveCTASettings,
  saveFontSettings,
  saveFooterSettings,
  saveGallerySettings,
  saveHeaderSettings,
  saveHeroSettings,
  savePageVisibility,
  saveServicesSettings,
  saveStorySettings,
  saveTeamSettings,
  saveTestimonialsSettings,
  saveValuesSettings,
  saveVisibleSections,
} from "@/lib/booking-data";

export function useSiteEditor(iframeRef: RefObject<HTMLIFrameElement | null>) {
  const { toast } = useToast();

  // Estados de customização (inicializados do storage)
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

  // Estados de agendamento por passos
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

  // Estados de visibilidade
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(
    {},
  );
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});

  // Estados para controle de botões (Aplicar vs Salvar)
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

  // Carregamento inicial
  useEffect(() => {
    const loadedHero = getHeroSettings();
    const loadedAboutHero = getAboutHeroSettings();
    const loadedStory = getStorySettings();
    const loadedTeam = getTeamSettings();
    const loadedTestimonials = getTestimonialsSettings();
    const loadedFont = getFontSettings();
    const loadedServices = getServicesSettings();
    const loadedValues = getValuesSettings();
    const loadedGallery = getGallerySettings();
    const loadedCTA = getCTASettings();
    const loadedHeader = getHeaderSettings();
    const loadedFooter = getFooterSettings();
    const loadedPageVisibility = getPageVisibility();
    const loadedVisibleSections = getVisibleSections();

    const loadedBookingService = getBookingServiceSettings();
    const loadedBookingDate = getBookingDateSettings();
    const loadedBookingTime = getBookingTimeSettings();
    const loadedBookingForm = getBookingFormSettings();
    const loadedBookingConfirmation = getBookingConfirmationSettings();

    setHeroSettings(loadedHero);
    setAboutHeroSettings(loadedAboutHero);
    setStorySettings(loadedStory);
    setTeamSettings(loadedTeam);
    setTestimonialsSettings(loadedTestimonials);
    setFontSettings(loadedFont);
    setServicesSettings(loadedServices);
    setValuesSettings(loadedValues);
    setGallerySettings(loadedGallery);
    setCTASettings(loadedCTA);
    setHeaderSettings(loadedHeader);
    setFooterSettings(loadedFooter);
    setPageVisibility(loadedPageVisibility);
    setVisibleSections(loadedVisibleSections);

    setBookingServiceSettings(loadedBookingService);
    setBookingDateSettings(loadedBookingDate);
    setBookingTimeSettings(loadedBookingTime);
    setBookingFormSettings(loadedBookingForm);
    setBookingConfirmationSettings(loadedBookingConfirmation);

    setLastAppliedHero(loadedHero);
    setLastAppliedAboutHero(loadedAboutHero);
    setLastAppliedStory(loadedStory);
    setLastAppliedTeam(loadedTeam);
    setLastAppliedTestimonials(loadedTestimonials);
    setLastAppliedFont(loadedFont);
    setLastAppliedServices(loadedServices);
    setLastAppliedValues(loadedValues);
    setLastAppliedGallery(loadedGallery);
    setLastAppliedCTA(loadedCTA);
    setLastAppliedHeader(loadedHeader);
    setLastAppliedFooter(loadedFooter);

    setLastAppliedBookingService(loadedBookingService);
    setLastAppliedBookingDate(loadedBookingDate);
    setLastAppliedBookingTime(loadedBookingTime);
    setLastAppliedBookingForm(loadedBookingForm);
    setLastAppliedBookingConfirmation(loadedBookingConfirmation);

    setLastSavedHero(loadedHero);
    setLastSavedAboutHero(loadedAboutHero);
    setLastSavedStory(loadedStory);
    setLastSavedTeam(loadedTeam);
    setLastSavedTestimonials(loadedTestimonials);
    setLastSavedFont(loadedFont);
    setLastSavedServices(loadedServices);
    setLastSavedValues(loadedValues);
    setLastSavedGallery(loadedGallery);
    setLastSavedCTA(loadedCTA);
    setLastSavedHeader(loadedHeader);
    setLastSavedFooter(loadedFooter);

    setLastSavedBookingService(loadedBookingService);
    setLastSavedBookingDate(loadedBookingDate);
    setLastSavedBookingTime(loadedBookingTime);
    setLastSavedBookingForm(loadedBookingForm);
    setLastSavedBookingConfirmation(loadedBookingConfirmation);

    setLastSavedPageVisibility(loadedPageVisibility);
    setLastSavedVisibleSections(loadedVisibleSections);
  }, []);

  // Handlers de atualização
  const handleUpdateHero = useCallback((updates: Partial<HeroSettings>) => {
    setHeroSettings((prev: HeroSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateAboutHero = useCallback(
    (updates: Partial<HeroSettings>) => {
      setAboutHeroSettings((prev: HeroSettings) => ({ ...prev, ...updates }));
    },
    [],
  );

  const handleUpdateStory = useCallback((updates: Partial<StorySettings>) => {
    setStorySettings((prev: StorySettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateTeam = useCallback((updates: Partial<TeamSettings>) => {
    setTeamSettings((prev: TeamSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateTestimonials = useCallback(
    (updates: Partial<TestimonialsSettings>) => {
      setTestimonialsSettings((prev: TestimonialsSettings) => ({
        ...prev,
        ...updates,
      }));
    },
    [],
  );

  const handleUpdateFont = useCallback((updates: Partial<FontSettings>) => {
    setFontSettings((prev: FontSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateServices = useCallback(
    (updates: Partial<ServicesSettings>) => {
      setServicesSettings((prev: ServicesSettings) => ({
        ...prev,
        ...updates,
      }));
    },
    [],
  );

  const handleUpdateValues = useCallback((updates: Partial<ValuesSettings>) => {
    setValuesSettings((prev: ValuesSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateGallery = useCallback(
    (updates: Partial<GallerySettings>) => {
      setGallerySettings((prev: GallerySettings) => ({ ...prev, ...updates }));
    },
    [],
  );

  const handleUpdateCTA = useCallback((updates: Partial<CTASettings>) => {
    setCTASettings((prev: CTASettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateHeader = useCallback((updates: Partial<HeaderSettings>) => {
    setHeaderSettings((prev: HeaderSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateFooter = useCallback((updates: Partial<FooterSettings>) => {
    setFooterSettings((prev: FooterSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateBookingService = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setBookingServiceSettings((prev: BookingStepSettings) => ({
        ...prev,
        ...updates,
      }));
    },
    [],
  );

  const handleUpdateBookingDate = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setBookingDateSettings((prev: BookingStepSettings) => ({
        ...prev,
        ...updates,
      }));
    },
    [],
  );

  const handleUpdateBookingTime = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setBookingTimeSettings((prev: BookingStepSettings) => ({
        ...prev,
        ...updates,
      }));
    },
    [],
  );

  const handleUpdateBookingForm = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setBookingFormSettings((prev: BookingStepSettings) => ({
        ...prev,
        ...updates,
      }));
    },
    [],
  );

  const handleUpdateBookingConfirmation = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      setBookingConfirmationSettings((prev: BookingStepSettings) => ({
        ...prev,
        ...updates,
      }));
    },
    [],
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
    setVisibleSections((prev: Record<string, boolean>) => ({
      ...prev,

      [sectionId]: !prev[sectionId],
    }));
  }, []);

  // Notificamos o iframe sobre a mudança de visibilidade das páginas
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_PAGE_VISIBILITY",
          visibility: pageVisibility,
        },
        "*",
      );
    }
  }, [pageVisibility, iframeRef]);

  // Notificamos o iframe sobre a mudança de visibilidade das seções
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_VISIBLE_SECTIONS",
          sections: visibleSections,
        },
        "*",
      );
    }
  }, [visibleSections, iframeRef]);

  // Sincronização com o iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_HERO_BG", ...heroSettings },
        "*",
      );
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_HERO_CONTENT", ...heroSettings },
        "*",
      );
    }
  }, [heroSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_ABOUT_HERO_BG", ...aboutHeroSettings },
        "*",
      );
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_ABOUT_HERO_CONTENT", ...aboutHeroSettings },
        "*",
      );
    }
  }, [aboutHeroSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_STORY_CONTENT", settings: storySettings },
        "*",
      );
    }
  }, [storySettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_TEAM_CONTENT", settings: teamSettings },
        "*",
      );
    }
  }, [teamSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_TESTIMONIALS_CONTENT", settings: testimonialsSettings },
        "*",
      );
    }
  }, [testimonialsSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_SERVICES_CONTENT", settings: servicesSettings },
        "*",
      );
    }
  }, [servicesSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_VALUES_CONTENT", settings: valuesSettings },
        "*",
      );
    }
  }, [valuesSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_FONTS", ...fontSettings },
        "*",
      );
    }
  }, [fontSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_GALLERY_SETTINGS", settings: gallerySettings },
        "*",
      );
    }
  }, [gallerySettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_CTA_SETTINGS", settings: ctaSettings },
        "*",
      );
    }
  }, [ctaSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_HEADER_SETTINGS", settings: headerSettings },
        "*",
      );
    }
  }, [headerSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_FOOTER_SETTINGS", settings: footerSettings },
        "*",
      );
    }
  }, [footerSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_BOOKING_SERVICE_SETTINGS",
          settings: bookingServiceSettings,
        },
        "*",
      );
    }
  }, [bookingServiceSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_BOOKING_DATE_SETTINGS", settings: bookingDateSettings },
        "*",
      );
    }
  }, [bookingDateSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_BOOKING_TIME_SETTINGS", settings: bookingTimeSettings },
        "*",
      );
    }
  }, [bookingTimeSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_BOOKING_FORM_SETTINGS", settings: bookingFormSettings },
        "*",
      );
    }
  }, [bookingFormSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_BOOKING_CONFIRMATION_SETTINGS",
          settings: bookingConfirmationSettings,
        },
        "*",
      );
    }
  }, [bookingConfirmationSettings, iframeRef]);

  // Notificamos o iframe sobre mudanças em tempo real em qualquer seção
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      const win = iframeRef.current.contentWindow;
      win.postMessage({ type: "UPDATE_HERO_CONTENT", ...heroSettings }, "*");
      win.postMessage({ type: "UPDATE_HERO_BG", ...heroSettings }, "*");
      win.postMessage(
        { type: "UPDATE_ABOUT_HERO_CONTENT", ...aboutHeroSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_ABOUT_HERO_BG", ...aboutHeroSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_STORY_CONTENT", settings: storySettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_TEAM_CONTENT", settings: teamSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_TESTIMONIALS_CONTENT", settings: testimonialsSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_SERVICES_CONTENT", settings: servicesSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_VALUES_CONTENT", settings: valuesSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_GALLERY_SETTINGS", settings: gallerySettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_CTA_SETTINGS", settings: ctaSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_HEADER_SETTINGS", settings: headerSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_FOOTER_SETTINGS", settings: footerSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_TYPOGRAPHY", settings: fontSettings },
        "*",
      );
      win.postMessage(
        {
          type: "UPDATE_BOOKING_SERVICE_SETTINGS",
          settings: bookingServiceSettings,
        },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_BOOKING_DATE_SETTINGS", settings: bookingDateSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_BOOKING_TIME_SETTINGS", settings: bookingTimeSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_BOOKING_FORM_SETTINGS", settings: bookingFormSettings },
        "*",
      );
      win.postMessage(
        {
          type: "UPDATE_BOOKING_CONFIRMATION_SETTINGS",
          settings: bookingConfirmationSettings,
        },
        "*",
      );
    }
  }, [
    heroSettings,
    aboutHeroSettings,
    storySettings,
    teamSettings,
    testimonialsSettings,
    servicesSettings,
    valuesSettings,
    gallerySettings,
    ctaSettings,
    headerSettings,
    footerSettings,
    fontSettings,
    bookingServiceSettings,
    bookingDateSettings,
    bookingTimeSettings,
    bookingFormSettings,
    bookingConfirmationSettings,
    iframeRef,
  ]);

  // Aplicar mudanças (atualizar estados applied e notificar iframe)
  const handleApplyHero = useCallback(() => {
    setLastAppliedHero({ ...heroSettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do banner foram aplicadas ao rascunho.",
    });
  }, [heroSettings, toast]);

  const handleApplyAboutHero = useCallback(() => {
    setLastAppliedAboutHero({ ...aboutHeroSettings });
    toast({
      title: "Preview atualizado!",
      description:
        "As mudanças do banner sobre nós foram aplicadas ao rascunho.",
    });
  }, [aboutHeroSettings, toast]);

  const handleApplyStory = useCallback(() => {
    setLastAppliedStory({ ...storySettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças da história foram aplicadas ao rascunho.",
    });
  }, [storySettings, toast]);

  const handleApplyTeam = useCallback(() => {
    setLastAppliedTeam({ ...teamSettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças da equipe foram aplicadas ao rascunho.",
    });
  }, [teamSettings, toast]);

  const handleApplyTestimonials = useCallback(() => {
    setLastAppliedTestimonials({ ...testimonialsSettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças dos depoimentos foram aplicadas ao rascunho.",
    });
  }, [testimonialsSettings, toast]);

  const handleApplyTypography = useCallback(() => {
    setLastAppliedFont({ ...fontSettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças de tipografia foram aplicadas ao rascunho.",
    });
  }, [fontSettings, toast]);

  const handleApplyServices = useCallback(() => {
    setLastAppliedServices({ ...servicesSettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças de serviços foram aplicadas ao rascunho.",
    });
  }, [servicesSettings, toast]);

  const handleApplyValues = useCallback(() => {
    setLastAppliedValues({ ...valuesSettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças de valores foram aplicadas ao rascunho.",
    });
  }, [valuesSettings, toast]);

  const handleApplyGallery = useCallback(() => {
    setLastAppliedGallery({ ...gallerySettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças da galeria foram aplicadas ao rascunho.",
    });
  }, [gallerySettings, toast]);

  const handleApplyCTA = useCallback(() => {
    setLastAppliedCTA({ ...ctaSettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças da chamada foram aplicadas ao rascunho.",
    });
  }, [ctaSettings, toast]);

  const handleApplyHeader = useCallback(() => {
    setLastAppliedHeader({ ...headerSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_HEADER_SETTINGS", settings: { ...headerSettings } },
        "*",
      );
    }
    // Forçar persistência temporária no localStorage para o preview ler em caso de refresh
    saveHeaderSettings(headerSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do cabeçalho foram aplicadas ao rascunho.",
    });
  }, [headerSettings, toast, iframeRef]);

  const handleApplyFooter = useCallback(() => {
    setLastAppliedFooter({ ...footerSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_FOOTER_SETTINGS", settings: { ...footerSettings } },
        "*",
      );
    }
    // Forçar persistência temporária no localStorage para o preview ler em caso de refresh
    saveFooterSettings(footerSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do rodapé foram aplicadas ao rascunho.",
    });
  }, [footerSettings, toast, iframeRef]);

  const handleApplyBookingService = useCallback(() => {
    setLastAppliedBookingService({ ...bookingServiceSettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do passo 1 (serviços) foram aplicadas.",
    });
  }, [bookingServiceSettings, toast]);

  const handleApplyBookingDate = useCallback(() => {
    setLastAppliedBookingDate({ ...bookingDateSettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do passo 2 (data) foram aplicadas.",
    });
  }, [bookingDateSettings, toast]);

  const handleApplyBookingTime = useCallback(() => {
    setLastAppliedBookingTime({ ...bookingTimeSettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do passo 3 (horário) foram aplicadas.",
    });
  }, [bookingTimeSettings, toast]);

  const handleApplyBookingForm = useCallback(() => {
    setLastAppliedBookingForm({ ...bookingFormSettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do passo 4 (dados) foram aplicadas.",
    });
  }, [bookingFormSettings, toast]);

  const handleApplyBookingConfirmation = useCallback(() => {
    setLastAppliedBookingConfirmation({ ...bookingConfirmationSettings });
    toast({
      title: "Preview atualizado!",
      description: "As mudanças da confirmação foram aplicadas.",
    });
  }, [bookingConfirmationSettings, toast]);

  const handleSaveGlobal = useCallback(() => {
    saveHeroSettings(heroSettings);
    saveAboutHeroSettings(aboutHeroSettings);
    saveStorySettings(storySettings);
    saveTeamSettings(teamSettings);
    saveTestimonialsSettings(testimonialsSettings);
    saveFontSettings(fontSettings);
    saveServicesSettings(servicesSettings);
    saveValuesSettings(valuesSettings);
    saveGallerySettings(gallerySettings);
    saveCTASettings(ctaSettings);
    saveHeaderSettings(headerSettings);
    saveFooterSettings(footerSettings);
    savePageVisibility(pageVisibility);
    saveVisibleSections(visibleSections);

    saveBookingServiceSettings(bookingServiceSettings);
    saveBookingDateSettings(bookingDateSettings);
    saveBookingTimeSettings(bookingTimeSettings);
    saveBookingFormSettings(bookingFormSettings);
    saveBookingConfirmationSettings(bookingConfirmationSettings);

    setLastSavedHero(heroSettings);
    setLastSavedAboutHero(aboutHeroSettings);
    setLastSavedStory(storySettings);
    setLastSavedTeam(teamSettings);
    setLastSavedTestimonials(testimonialsSettings);
    setLastSavedFont(fontSettings);
    setLastSavedServices(servicesSettings);
    setLastSavedValues(valuesSettings);
    setLastSavedGallery(gallerySettings);
    setLastSavedCTA(ctaSettings);
    setLastSavedHeader(headerSettings);
    setLastSavedFooter(footerSettings);
    setLastSavedPageVisibility(pageVisibility);
    setLastSavedVisibleSections(visibleSections);

    setLastSavedBookingService(bookingServiceSettings);
    setLastSavedBookingDate(bookingDateSettings);
    setLastSavedBookingTime(bookingTimeSettings);
    setLastSavedBookingForm(bookingFormSettings);
    setLastSavedBookingConfirmation(bookingConfirmationSettings);

    setLastAppliedHero(heroSettings);
    setLastAppliedAboutHero(aboutHeroSettings);
    setLastAppliedStory(storySettings);
    setLastAppliedTeam(teamSettings);
    setLastAppliedTestimonials(testimonialsSettings);
    setLastAppliedFont(fontSettings);
    setLastAppliedServices(servicesSettings);
    setLastAppliedValues(valuesSettings);
    setLastAppliedGallery(gallerySettings);
    setLastAppliedCTA(ctaSettings);
    setLastAppliedHeader(headerSettings);
    setLastAppliedFooter(footerSettings);

    setLastAppliedBookingService(bookingServiceSettings);
    setLastAppliedBookingDate(bookingDateSettings);
    setLastAppliedBookingTime(bookingTimeSettings);
    setLastAppliedBookingForm(bookingFormSettings);
    setLastAppliedBookingConfirmation(bookingConfirmationSettings);

    toast({
      title: "Site publicado!",
      description: "Todas as alterações foram salvas com sucesso.",
    });
    window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
  }, [
    heroSettings,
    aboutHeroSettings,
    storySettings,
    teamSettings,
    testimonialsSettings,
    fontSettings,
    servicesSettings,
    valuesSettings,
    gallerySettings,
    ctaSettings,
    headerSettings,
    footerSettings,
    pageVisibility,
    visibleSections,
    bookingServiceSettings,
    bookingDateSettings,
    bookingTimeSettings,
    bookingFormSettings,
    bookingConfirmationSettings,
    toast,
  ]);

  const resetSettings = useCallback(() => {
    if (
      confirm(
        "Tem certeza que deseja resetar todas as configurações para o padrão original?",
      )
    ) {
      setHeroSettings(defaultHeroSettings);
      setAboutHeroSettings(defaultAboutHeroSettings);
      setStorySettings(defaultStorySettings);
      setTeamSettings(defaultTeamSettings);
      setTestimonialsSettings(defaultTestimonialsSettings);
      setFontSettings(defaultFontSettings);
      setServicesSettings(defaultServicesSettings);
      setValuesSettings(defaultValuesSettings);
      setGallerySettings(defaultGallerySettings);
      setCTASettings(defaultCTASettings);
      setHeaderSettings(defaultHeaderSettings);
      setFooterSettings(defaultFooterSettings);
    }
  }, []);

  const handleSectionReset = useCallback(
    (sectionId: string) => {
      if (
        confirm(
          `Deseja resetar as configurações da seção "${sectionId}" para o padrão?`,
        )
      ) {
        if (!iframeRef.current?.contentWindow) return;
        const win = iframeRef.current.contentWindow;

        switch (sectionId) {
          case "header":
            setHeaderSettings(defaultHeaderSettings);
            saveHeaderSettings(defaultHeaderSettings);
            win.postMessage(
              {
                type: "UPDATE_HEADER_SETTINGS",
                settings: defaultHeaderSettings,
              },
              "*",
            );
            break;
          case "footer":
            setFooterSettings(defaultFooterSettings);
            saveFooterSettings(defaultFooterSettings);
            win.postMessage(
              {
                type: "UPDATE_FOOTER_SETTINGS",
                settings: defaultFooterSettings,
              },
              "*",
            );
            break;
          case "hero":
            setHeroSettings(defaultHeroSettings);
            saveHeroSettings(defaultHeroSettings);
            win.postMessage(
              { type: "UPDATE_HERO_CONTENT", ...defaultHeroSettings },
              "*",
            );
            win.postMessage(
              { type: "UPDATE_HERO_BG", ...defaultHeroSettings },
              "*",
            );
            break;
          case "about-hero":
            setAboutHeroSettings(defaultAboutHeroSettings);
            saveAboutHeroSettings(defaultAboutHeroSettings);
            win.postMessage(
              {
                type: "UPDATE_ABOUT_HERO_CONTENT",
                ...defaultAboutHeroSettings,
              },
              "*",
            );
            win.postMessage(
              { type: "UPDATE_ABOUT_HERO_BG", ...defaultAboutHeroSettings },
              "*",
            );
            break;
          case "story":
            setStorySettings(defaultStorySettings);
            saveStorySettings(defaultStorySettings);
            win.postMessage(
              { type: "UPDATE_STORY_CONTENT", settings: defaultStorySettings },
              "*",
            );
            break;
          case "team":
            setTeamSettings(defaultTeamSettings);
            saveTeamSettings(defaultTeamSettings);
            win.postMessage(
              { type: "UPDATE_TEAM_CONTENT", settings: defaultTeamSettings },
              "*",
            );
            break;
          case "testimonials":
            setTestimonialsSettings(defaultTestimonialsSettings);
            saveTestimonialsSettings(defaultTestimonialsSettings);
            win.postMessage(
              {
                type: "UPDATE_TESTIMONIALS_CONTENT",
                settings: defaultTestimonialsSettings,
              },
              "*",
            );
            break;
          case "typography":
            setFontSettings(defaultFontSettings);
            saveFontSettings(defaultFontSettings);
            win.postMessage(
              { type: "UPDATE_FONTS", ...defaultFontSettings },
              "*",
            );
            break;
          case "services":
            setServicesSettings(defaultServicesSettings);
            saveServicesSettings(defaultServicesSettings);
            win.postMessage(
              {
                type: "UPDATE_SERVICES_CONTENT",
                settings: defaultServicesSettings,
              },
              "*",
            );
            break;
          case "values":
            setValuesSettings(defaultValuesSettings);
            saveValuesSettings(defaultValuesSettings);
            win.postMessage(
              {
                type: "UPDATE_VALUES_CONTENT",
                settings: defaultValuesSettings,
              },
              "*",
            );
            break;
          case "gallery-preview":
          case "gallery-grid":
            setGallerySettings(defaultGallerySettings);
            saveGallerySettings(defaultGallerySettings);
            win.postMessage(
              {
                type: "UPDATE_GALLERY_SETTINGS",
                settings: defaultGallerySettings,
              },
              "*",
            );
            break;
          case "cta":
            setCTASettings(defaultCTASettings);
            saveCTASettings(defaultCTASettings);
            win.postMessage(
              { type: "UPDATE_CTA_SETTINGS", settings: defaultCTASettings },
              "*",
            );
            break;
          case "booking-service":
            setBookingServiceSettings(defaultBookingServiceSettings);
            saveBookingServiceSettings(defaultBookingServiceSettings);
            win.postMessage(
              {
                type: "UPDATE_BOOKING_SERVICE_SETTINGS",
                settings: defaultBookingServiceSettings,
              },
              "*",
            );
            break;
          case "booking-date":
            setBookingDateSettings(defaultBookingDateSettings);
            saveBookingDateSettings(defaultBookingDateSettings);
            win.postMessage(
              {
                type: "UPDATE_BOOKING_DATE_SETTINGS",
                settings: defaultBookingDateSettings,
              },
              "*",
            );
            break;
          case "booking-time":
            setBookingTimeSettings(defaultBookingTimeSettings);
            saveBookingTimeSettings(defaultBookingTimeSettings);
            win.postMessage(
              {
                type: "UPDATE_BOOKING_TIME_SETTINGS",
                settings: defaultBookingTimeSettings,
              },
              "*",
            );
            break;
          case "booking-form":
            setBookingFormSettings(defaultBookingFormSettings);
            saveBookingFormSettings(defaultBookingFormSettings);
            win.postMessage(
              {
                type: "UPDATE_BOOKING_FORM_SETTINGS",
                settings: defaultBookingFormSettings,
              },
              "*",
            );
            break;
          case "booking-confirmation":
            setBookingConfirmationSettings(defaultBookingConfirmationSettings);
            saveBookingConfirmationSettings(defaultBookingConfirmationSettings);
            win.postMessage(
              {
                type: "UPDATE_BOOKING_CONFIRMATION_SETTINGS",
                settings: defaultBookingConfirmationSettings,
              },
              "*",
            );
            break;
          default:
            toast({
              title: "Aviso",
              description:
                "Esta seção não possui configurações customizáveis para resetar.",
            });
            break;
        }
      }
    },
    [toast, iframeRef],
  );

  // Booleans para habilitar/desabilitar botões
  const hasHeroChanges =
    JSON.stringify(heroSettings) !== JSON.stringify(lastAppliedHero);
  const hasAboutHeroChanges =
    JSON.stringify(aboutHeroSettings) !== JSON.stringify(lastAppliedAboutHero);
  const hasStoryChanges =
    JSON.stringify(storySettings) !== JSON.stringify(lastAppliedStory);
  const hasTeamChanges =
    JSON.stringify(teamSettings) !== JSON.stringify(lastAppliedTeam);
  const hasTestimonialsChanges =
    JSON.stringify(testimonialsSettings) !==
    JSON.stringify(lastAppliedTestimonials);
  const hasFontChanges =
    JSON.stringify(fontSettings) !== JSON.stringify(lastAppliedFont);
  const hasServicesChanges =
    JSON.stringify(servicesSettings) !== JSON.stringify(lastAppliedServices);
  const hasValuesChanges =
    JSON.stringify(valuesSettings) !== JSON.stringify(lastAppliedValues);
  const hasGalleryChanges =
    JSON.stringify(gallerySettings) !== JSON.stringify(lastAppliedGallery);
  const hasCTAChanges =
    JSON.stringify(ctaSettings) !== JSON.stringify(lastAppliedCTA);
  const hasHeaderChanges =
    JSON.stringify(headerSettings) !== JSON.stringify(lastAppliedHeader);
  const hasFooterChanges =
    JSON.stringify(footerSettings) !== JSON.stringify(lastAppliedFooter);
  const hasBookingServiceChanges =
    JSON.stringify(bookingServiceSettings) !==
    JSON.stringify(lastAppliedBookingService);
  const hasBookingDateChanges =
    JSON.stringify(bookingDateSettings) !==
    JSON.stringify(lastAppliedBookingDate);
  const hasBookingTimeChanges =
    JSON.stringify(bookingTimeSettings) !==
    JSON.stringify(lastAppliedBookingTime);
  const hasBookingFormChanges =
    JSON.stringify(bookingFormSettings) !==
    JSON.stringify(lastAppliedBookingForm);
  const hasBookingConfirmationChanges =
    JSON.stringify(bookingConfirmationSettings) !==
    JSON.stringify(lastAppliedBookingConfirmation);

  const hasUnsavedGlobalChanges = useMemo(() => {
    const heroChanged =
      JSON.stringify(lastAppliedHero) !== JSON.stringify(lastSavedHero);
    const aboutHeroChanged =
      JSON.stringify(lastAppliedAboutHero) !==
      JSON.stringify(lastSavedAboutHero);
    const storyChanged =
      JSON.stringify(lastAppliedStory) !== JSON.stringify(lastSavedStory);
    const teamChanged =
      JSON.stringify(lastAppliedTeam) !== JSON.stringify(lastSavedTeam);
    const testimonialsChanged =
      JSON.stringify(lastAppliedTestimonials) !==
      JSON.stringify(lastSavedTestimonials);
    const fontChanged =
      JSON.stringify(lastAppliedFont) !== JSON.stringify(lastSavedFont);
    const servicesChanged =
      JSON.stringify(lastAppliedServices) !== JSON.stringify(lastSavedServices);
    const valuesChanged =
      JSON.stringify(lastAppliedValues) !== JSON.stringify(lastSavedValues);
    const galleryChanged =
      JSON.stringify(lastAppliedGallery) !== JSON.stringify(lastSavedGallery);
    const ctaChanged =
      JSON.stringify(lastAppliedCTA) !== JSON.stringify(lastSavedCTA);
    const headerChanged =
      JSON.stringify(lastAppliedHeader) !== JSON.stringify(lastSavedHeader);
    const footerChanged =
      JSON.stringify(lastAppliedFooter) !== JSON.stringify(lastSavedFooter);

    const bookingServiceChanged =
      JSON.stringify(lastAppliedBookingService) !==
      JSON.stringify(lastSavedBookingService);
    const bookingDateChanged =
      JSON.stringify(lastAppliedBookingDate) !==
      JSON.stringify(lastSavedBookingDate);
    const bookingTimeChanged =
      JSON.stringify(lastAppliedBookingTime) !==
      JSON.stringify(lastSavedBookingTime);
    const bookingFormChanged =
      JSON.stringify(lastAppliedBookingForm) !==
      JSON.stringify(lastSavedBookingForm);
    const bookingConfirmationChanged =
      JSON.stringify(lastAppliedBookingConfirmation) !==
      JSON.stringify(lastSavedBookingConfirmation);

    const pageVisibilityChanged =
      JSON.stringify(pageVisibility) !==
      JSON.stringify(lastSavedPageVisibility);
    const visibleSectionsChanged =
      JSON.stringify(visibleSections) !==
      JSON.stringify(lastSavedVisibleSections);

    const changes = [
      heroChanged,
      aboutHeroChanged,
      storyChanged,
      teamChanged,
      testimonialsChanged,
      fontChanged,
      servicesChanged,
      valuesChanged,
      galleryChanged,
      ctaChanged,
      headerChanged,
      footerChanged,
      bookingServiceChanged,
      bookingDateChanged,
      bookingTimeChanged,
      bookingFormChanged,
      bookingConfirmationChanged,
      pageVisibilityChanged,
      visibleSectionsChanged
    ];

    return changes.some(Boolean);
  }, [
    lastAppliedHero,
    lastSavedHero,
    lastAppliedAboutHero,
    lastSavedAboutHero,
    lastAppliedStory,
    lastSavedStory,
    lastAppliedTeam,
    lastSavedTeam,
    lastAppliedTestimonials,
    lastSavedTestimonials,
    lastAppliedFont,
    lastSavedFont,
    lastAppliedServices,
    lastSavedServices,
    lastAppliedValues,
    lastSavedValues,
    lastAppliedGallery,
    lastSavedGallery,
    lastAppliedCTA,
    lastSavedCTA,
    lastAppliedHeader,
    lastSavedHeader,
    lastAppliedFooter,
    lastSavedFooter,
    lastAppliedBookingService,
    lastSavedBookingService,
    lastAppliedBookingDate,
    lastSavedBookingDate,
    lastAppliedBookingTime,
    lastSavedBookingTime,
    lastAppliedBookingForm,
    lastSavedBookingForm,
    lastAppliedBookingConfirmation,
    lastSavedBookingConfirmation,
    pageVisibility,
    lastSavedPageVisibility,
    visibleSections,
    lastSavedVisibleSections,
  ]);

  return {
    heroSettings,
    aboutHeroSettings,
    storySettings,
    teamSettings,
    testimonialsSettings,
    fontSettings,
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
    pageVisibility,
    visibleSections,
    handleUpdateHero,
    handleUpdateAboutHero,
    handleUpdateStory,
    handleUpdateTeam,
    handleUpdateTestimonials,
    handleUpdateFont,
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
    handleApplyHero,
    handleApplyAboutHero,
    handleApplyStory,
    handleApplyTeam,
    handleApplyTestimonials,
    handleApplyTypography,
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
    handleSaveGlobal,
    resetSettings,
    handleSectionReset,
    hasHeroChanges,
    hasAboutHeroChanges,
    hasStoryChanges,
    hasTeamChanges,
    hasTestimonialsChanges,
    hasFontChanges,
    hasServicesChanges,
    hasValuesChanges,
    hasGalleryChanges,
    hasCTAChanges,
    hasHeaderChanges,
    hasFooterChanges,
    hasBookingServiceChanges,
    hasBookingDateChanges,
    hasBookingTimeChanges,
    hasBookingFormChanges,
    hasBookingConfirmationChanges,
    hasUnsavedGlobalChanges,
  };
}
