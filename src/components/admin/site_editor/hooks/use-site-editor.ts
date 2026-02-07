export interface LayoutGlobalSettings {
  siteColors?: ColorSettings;
  cores_base?: ColorSettings;
  fontes?: FontSettings;
  visibleSections?: Record<string, boolean>;
  pageVisibility?: Record<string, boolean>;
  hero?: HeroSettings;
  aboutHero?: HeroSettings;
  story?: StorySettings;
  team?: TeamSettings;
  testimonials?: TestimonialsSettings;
  services?: ServicesSettings;
  values?: ValuesSettings;
  gallery?: GallerySettings;
  cta?: CTASettings;
  header?: HeaderSettings;
  footer?: FooterSettings;
}

export interface SiteConfigData {
  [key: string]: unknown;
  hero?: HeroSettings;
  aboutHero?: HeroSettings;
  story?: StorySettings;
  team?: TeamSettings;
  testimonials?: TestimonialsSettings;
  theme?: FontSettings;
  typography?: FontSettings; // Alinhamento com o Back-end
  colors?: ColorSettings;
  services?: ServicesSettings;
  values?: ValuesSettings;
  gallery?: GallerySettings;
  cta?: CTASettings;
  header?: HeaderSettings;
  footer?: FooterSettings;
  pageVisibility?: Record<string, boolean>;
  visibleSections?: Record<string, boolean>;
  layoutGlobal?: LayoutGlobalSettings; // Suporte para estrutura aninhada do banco
  layout_global?: LayoutGlobalSettings; // Suporte para snake_case do banco
  bookingSteps?: {
    service?: BookingStepSettings;
    date?: BookingStepSettings;
    time?: BookingStepSettings;
    form?: BookingStepSettings;
    confirmation?: BookingStepSettings;
  };
}

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
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
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
  getBookingConfirmationSettings,
  getBookingDateSettings,
  getBookingFormSettings,
  getBookingServiceSettings,
  getBookingTimeSettings,
  getColorSettings,
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
  type HeaderSettings,
  type HeroSettings,
  type ServicesSettings,
  type StorySettings,
  saveAboutHeroSettings,
  saveBookingConfirmationSettings,
  saveBookingDateSettings,
  saveBookingFormSettings,
  saveBookingServiceSettings,
  saveBookingTimeSettings,
  saveColorSettings,
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
  type TeamSettings,
  type TestimonialsSettings,
  type ValuesSettings,
} from "@/lib/booking-data";
import { siteCustomizerService } from "@/lib/site-customizer-service";

export function useSiteEditor(iframeRef: RefObject<HTMLIFrameElement | null>) {
  const { toast } = useToast();
  const { studio } = useStudio();

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  // Carregamento inicial
  useEffect(() => {
    const loadedHero = getHeroSettings();
    const loadedAboutHero = getAboutHeroSettings();
    const loadedStory = getStorySettings();
    const loadedTeam = getTeamSettings();
    const loadedTestimonials = getTestimonialsSettings();
    const loadedFont = getFontSettings();
    const loadedColor = getColorSettings();
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
    setColorSettings(loadedColor);
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
    setLastAppliedColor(loadedColor);
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
    setLastSavedColor(loadedColor);
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

  // (movido para baixo de loadExternalConfig para evitar uso antes da declaração)

  const loadExternalConfig = useCallback(
    (config: Record<string, unknown>) => {
      if (!config) return;
      
      // Mapeamento flexível para suportar layoutGlobal/layout_global do banco
      const layoutGlobal = (config.layoutGlobal || config.layout_global) as Record<string, unknown> | undefined;
      
      const data = {
        ...config,
        hero: (config.hero || layoutGlobal?.hero) as HeroSettings | undefined,
        aboutHero: (config.aboutHero || layoutGlobal?.aboutHero) as HeroSettings | undefined,
        story: (config.story || layoutGlobal?.story) as StorySettings | undefined,
        team: (config.team || layoutGlobal?.team) as TeamSettings | undefined,
        testimonials: (config.testimonials || layoutGlobal?.testimonials) as TestimonialsSettings | undefined,
        services: (config.services || layoutGlobal?.services) as ServicesSettings | undefined,
        values: (config.values || layoutGlobal?.values) as ValuesSettings | undefined,
        gallery: (config.gallery || layoutGlobal?.gallery) as GallerySettings | undefined,
        cta: (config.cta || layoutGlobal?.cta) as CTASettings | undefined,
        header: (config.header || layoutGlobal?.header) as HeaderSettings | undefined,
        footer: (config.footer || layoutGlobal?.footer) as FooterSettings | undefined,
        colors: (config.colors || layoutGlobal?.siteColors || layoutGlobal?.cores_base) as ColorSettings | undefined,
        theme: (config.theme || config.typography || layoutGlobal?.fontes) as FontSettings | undefined,
        visibleSections: (config.visibleSections || layoutGlobal?.visibleSections) as Record<string, boolean> | undefined,
        pageVisibility: (config.pageVisibility || layoutGlobal?.pageVisibility) as Record<string, boolean> | undefined,
      } as SiteConfigData;

      if (data.hero) {
        setHeroSettings(data.hero);
        setLastSavedHero(data.hero);
        setLastAppliedHero(data.hero);
        saveHeroSettings(data.hero);
      }

      if (data.aboutHero) {
        setAboutHeroSettings(data.aboutHero);
        setLastSavedAboutHero(data.aboutHero);
        setLastAppliedAboutHero(data.aboutHero);
        saveAboutHeroSettings(data.aboutHero);
      }

      if (data.story) {
        setStorySettings(data.story);
        setLastSavedStory(data.story);
        setLastAppliedStory(data.story);
        saveStorySettings(data.story);
      }

      if (data.team) {
        setTeamSettings(data.team);
        setLastSavedTeam(data.team);
        setLastAppliedTeam(data.team);
        saveTeamSettings(data.team);
      }

      if (data.testimonials) {
        setTestimonialsSettings(data.testimonials);
        setLastSavedTestimonials(data.testimonials);
        setLastAppliedTestimonials(data.testimonials);
        saveTestimonialsSettings(data.testimonials);
      }

      if (data.theme) {
        setFontSettings(data.theme);
        setLastSavedFont(data.theme);
        setLastAppliedFont(data.theme);
        saveFontSettings(data.theme);
      }

      if (data.colors) {
        setColorSettings(data.colors);
        setLastSavedColor(data.colors);
        setLastAppliedColor(data.colors);
        saveColorSettings(data.colors);
      }

      if (data.services) {
        setServicesSettings(data.services);
        setLastSavedServices(data.services);
        setLastAppliedServices(data.services);
        saveServicesSettings(data.services);
      }

      if (data.values) {
        setValuesSettings(data.values);
        setLastSavedValues(data.values);
        setLastAppliedValues(data.values);
        saveValuesSettings(data.values);
      }

      if (data.gallery) {
        setGallerySettings(data.gallery);
        setLastSavedGallery(data.gallery);
        setLastAppliedGallery(data.gallery);
        saveGallerySettings(data.gallery);
      }

      if (data.cta) {
        setCTASettings(data.cta);
        setLastSavedCTA(data.cta);
        setLastAppliedCTA(data.cta);
        saveCTASettings(data.cta);
      }

      if (data.header) {
        setHeaderSettings(data.header);
        setLastSavedHeader(data.header);
        setLastAppliedHeader(data.header);
        saveHeaderSettings(data.header);
      }

      if (data.footer) {
        setFooterSettings(data.footer);
        setLastSavedFooter(data.footer);
        setLastAppliedFooter(data.footer);
        saveFooterSettings(data.footer);
      }

      if (data.bookingSteps) {
        const steps = data.bookingSteps;
        if (steps.service) {
          setBookingServiceSettings(steps.service);
          setLastSavedBookingService(steps.service);
          setLastAppliedBookingService(steps.service);
        }
        if (steps.date) {
          setBookingDateSettings(steps.date);
          setLastSavedBookingDate(steps.date);
          setLastAppliedBookingDate(steps.date);
        }
        if (steps.time) {
          setBookingTimeSettings(steps.time);
          setLastSavedBookingTime(steps.time);
          setLastAppliedBookingTime(steps.time);
        }
        if (steps.form) {
          setBookingFormSettings(steps.form);
          setLastSavedBookingForm(steps.form);
          setLastAppliedBookingForm(steps.form);
        }
        if (steps.confirmation) {
          setBookingConfirmationSettings(steps.confirmation);
          setLastSavedBookingConfirmation(steps.confirmation);
          setLastAppliedBookingConfirmation(steps.confirmation);
        }
      }

      if (data.pageVisibility) {
        setPageVisibility(data.pageVisibility);
        setLastSavedPageVisibility(data.pageVisibility);
        savePageVisibility(data.pageVisibility);
      }

      if (data.visibleSections) {
        setVisibleSections(data.visibleSections);
        setLastSavedVisibleSections(data.visibleSections);
        saveVisibleSections(data.visibleSections);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("DataReady"));
      }
      // Sincroniza com o iframe se necessário
      const timer = setTimeout(() => {
        if (iframeRef.current?.contentWindow) {
          const win = iframeRef.current.contentWindow;
          if (data.hero)
            win.postMessage(
              { type: "UPDATE_HERO_SETTINGS", settings: data.hero },
              "*",
            );
          if (data.aboutHero)
            win.postMessage(
              { type: "UPDATE_ABOUT_HERO_SETTINGS", settings: data.aboutHero },
              "*",
            );
          if (data.story)
            win.postMessage(
              { type: "UPDATE_STORY_SETTINGS", settings: data.story },
              "*",
            );
          if (data.team)
            win.postMessage(
              { type: "UPDATE_TEAM_SETTINGS", settings: data.team },
              "*",
            );
          if (data.testimonials)
            win.postMessage(
              {
                type: "UPDATE_TESTIMONIALS_SETTINGS",
                settings: data.testimonials,
              },
              "*",
            );
          if (data.theme)
            win.postMessage(
              { type: "UPDATE_TYPOGRAPHY", settings: data.theme },
              "*",
            );
          if (data.colors)
            win.postMessage(
              { type: "UPDATE_COLORS", settings: data.colors },
              "*",
            );
          if (data.services)
            win.postMessage(
              { type: "UPDATE_SERVICES_SETTINGS", settings: data.services },
              "*",
            );
          if (data.values)
            win.postMessage(
              { type: "UPDATE_VALUES_SETTINGS", settings: data.values },
              "*",
            );
          if (data.gallery)
            win.postMessage(
              { type: "UPDATE_GALLERY_SETTINGS", settings: data.gallery },
              "*",
            );
          if (data.cta)
            win.postMessage(
              { type: "UPDATE_CTA_SETTINGS", settings: data.cta },
              "*",
            );
          if (data.header)
            win.postMessage(
              { type: "UPDATE_HEADER_SETTINGS", settings: data.header },
              "*",
            );
          if (data.footer)
            win.postMessage(
              { type: "UPDATE_FOOTER_SETTINGS", settings: data.footer },
              "*",
            );

          if (data.bookingSteps) {
            const steps = data.bookingSteps;
            if (steps.service)
              win.postMessage(
                {
                  type: "UPDATE_BOOKING_SERVICE_SETTINGS",
                  settings: steps.service,
                },
                "*",
              );
            if (steps.date)
              win.postMessage(
                { type: "UPDATE_BOOKING_DATE_SETTINGS", settings: steps.date },
                "*",
              );
            if (steps.time)
              win.postMessage(
                { type: "UPDATE_BOOKING_TIME_SETTINGS", settings: steps.time },
                "*",
              );
            if (steps.form)
              win.postMessage(
                { type: "UPDATE_BOOKING_FORM_SETTINGS", settings: steps.form },
                "*",
              );
            if (steps.confirmation)
              win.postMessage(
                {
                  type: "UPDATE_BOOKING_CONFIRMATION_SETTINGS",
                  settings: steps.confirmation,
                },
                "*",
              );
          }

          if (data.pageVisibility)
            win.postMessage(
              {
                type: "UPDATE_PAGE_VISIBILITY",
                visibility: data.pageVisibility,
              },
              "*",
            );
          if (data.visibleSections)
            win.postMessage(
              {
                type: "UPDATE_VISIBLE_SECTIONS",
                sections: data.visibleSections,
              },
              "*",
            );
        }
      }, 100);

      return () => clearTimeout(timer);
    },
    [iframeRef],
  );

  const getChangedSettings = useCallback(() => {
    const changes: Partial<SiteConfigData> = {};

    if (JSON.stringify(heroSettings) !== JSON.stringify(lastSavedHero)) {
      changes.hero = heroSettings;
    }
    if (
      JSON.stringify(aboutHeroSettings) !== JSON.stringify(lastSavedAboutHero)
    ) {
      changes.aboutHero = aboutHeroSettings;
    }
    if (JSON.stringify(storySettings) !== JSON.stringify(lastSavedStory)) {
      changes.story = storySettings;
    }
    if (JSON.stringify(teamSettings) !== JSON.stringify(lastSavedTeam)) {
      changes.team = teamSettings;
    }
    if (
      JSON.stringify(testimonialsSettings) !==
      JSON.stringify(lastSavedTestimonials)
    ) {
      changes.testimonials = testimonialsSettings;
    }
    if (JSON.stringify(fontSettings) !== JSON.stringify(lastSavedFont)) {
      changes.theme = fontSettings;
    }
    if (JSON.stringify(colorSettings) !== JSON.stringify(lastSavedColor)) {
      changes.colors = colorSettings;
    }
    if (
      JSON.stringify(servicesSettings) !== JSON.stringify(lastSavedServices)
    ) {
      changes.services = servicesSettings;
    }
    if (JSON.stringify(valuesSettings) !== JSON.stringify(lastSavedValues)) {
      changes.values = valuesSettings;
    }
    if (JSON.stringify(gallerySettings) !== JSON.stringify(lastSavedGallery)) {
      changes.gallery = gallerySettings;
    }
    if (JSON.stringify(ctaSettings) !== JSON.stringify(lastSavedCTA)) {
      changes.cta = ctaSettings;
    }
    if (JSON.stringify(headerSettings) !== JSON.stringify(lastSavedHeader)) {
      changes.header = headerSettings;
    }
    if (JSON.stringify(footerSettings) !== JSON.stringify(lastSavedFooter)) {
      changes.footer = footerSettings;
    }

    if (
      JSON.stringify(pageVisibility) !== JSON.stringify(lastSavedPageVisibility)
    ) {
      changes.pageVisibility = pageVisibility;
    }
    if (
      JSON.stringify(visibleSections) !==
      JSON.stringify(lastSavedVisibleSections)
    ) {
      changes.visibleSections = visibleSections;
    }

    // Booking Steps
    const bookingChanges: SiteConfigData["bookingSteps"] = {};
    if (
      JSON.stringify(bookingServiceSettings) !==
      JSON.stringify(lastSavedBookingService)
    ) {
      bookingChanges.service = bookingServiceSettings;
    }
    if (
      JSON.stringify(bookingDateSettings) !==
      JSON.stringify(lastSavedBookingDate)
    ) {
      bookingChanges.date = bookingDateSettings;
    }
    if (
      JSON.stringify(bookingTimeSettings) !==
      JSON.stringify(lastSavedBookingTime)
    ) {
      bookingChanges.time = bookingTimeSettings;
    }
    if (
      JSON.stringify(bookingFormSettings) !==
      JSON.stringify(lastSavedBookingForm)
    ) {
      bookingChanges.form = bookingFormSettings;
    }
    if (
      JSON.stringify(bookingConfirmationSettings) !==
      JSON.stringify(lastSavedBookingConfirmation)
    ) {
      bookingChanges.confirmation = bookingConfirmationSettings;
    }

    if (Object.keys(bookingChanges).length > 0) {
      changes.bookingSteps = bookingChanges;
    }

    return changes;
  }, [
    heroSettings,
    lastSavedHero,
    aboutHeroSettings,
    lastSavedAboutHero,
    storySettings,
    lastSavedStory,
    teamSettings,
    lastSavedTeam,
    testimonialsSettings,
    lastSavedTestimonials,
    fontSettings,
    lastSavedFont,
    colorSettings,
    lastSavedColor,
    servicesSettings,
    lastSavedServices,
    valuesSettings,
    lastSavedValues,
    gallerySettings,
    lastSavedGallery,
    ctaSettings,
    lastSavedCTA,
    headerSettings,
    lastSavedHeader,
    footerSettings,
    lastSavedFooter,
    pageVisibility,
    lastSavedPageVisibility,
    visibleSections,
    lastSavedVisibleSections,
    bookingServiceSettings,
    lastSavedBookingService,
    bookingDateSettings,
    lastSavedBookingDate,
    bookingTimeSettings,
    lastSavedBookingTime,
    bookingFormSettings,
    lastSavedBookingForm,
    bookingConfirmationSettings,
    lastSavedBookingConfirmation,
  ]);

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

  // Hidratação inicial do Customizer a partir do StudioProvider (aplicação automática)
  useEffect(() => {
    const cfg = studio?.config as Record<string, unknown> | undefined;
    if (!cfg) return;
    loadExternalConfig(cfg);
    const layoutGlobal =
      (cfg as SiteConfigData).layoutGlobal ||
      (cfg as SiteConfigData).layout_global;
    const initialColors =
      (cfg as SiteConfigData).colors ||
      layoutGlobal?.siteColors ||
      layoutGlobal?.cores_base;
    const initialFonts =
      (cfg as SiteConfigData).theme ||
      (cfg as SiteConfigData).typography ||
      layoutGlobal?.fontes;
    if (iframeRef.current?.contentWindow) {
      const win = iframeRef.current.contentWindow;
      if (initialColors) {
        win.postMessage({ type: "UPDATE_COLORS", settings: initialColors }, "*");
      }
      if (initialFonts) {
        win.postMessage(
          { type: "UPDATE_TYPOGRAPHY", settings: initialFonts },
          "*",
        );
      }
    }
  }, [studio, loadExternalConfig, iframeRef]);

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

  const handleUpdateColors = useCallback((updates: Partial<ColorSettings>) => {
    setColorSettings((prev: ColorSettings) => ({ ...prev, ...updates }));
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
    setVisibleSections((prev: Record<string, boolean>) => {
      const isCurrentlyVisible = prev[sectionId] !== false;
      return {
        ...prev,
        [sectionId]: !isCurrentlyVisible,
      };
    });
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
        { type: "UPDATE_HERO_SETTINGS", settings: heroSettings },
        "*",
      );
    }
  }, [heroSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_ABOUT_HERO_SETTINGS", settings: aboutHeroSettings },
        "*",
      );
    }
  }, [aboutHeroSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_STORY_SETTINGS", settings: storySettings },
        "*",
      );
    }
  }, [storySettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_TEAM_SETTINGS", settings: teamSettings },
        "*",
      );
    }
  }, [teamSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_TESTIMONIALS_SETTINGS",
          settings: testimonialsSettings,
        },
        "*",
      );
    }
  }, [testimonialsSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_SERVICES_SETTINGS", settings: servicesSettings },
        "*",
      );
    }
  }, [servicesSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_VALUES_SETTINGS", settings: valuesSettings },
        "*",
      );
    }
  }, [valuesSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_TYPOGRAPHY", settings: fontSettings },
        "*",
      );
    }
  }, [fontSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_COLORS", settings: colorSettings },
        "*",
      );
    }
  }, [colorSettings, iframeRef]);

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
      win.postMessage(
        { type: "UPDATE_HERO_SETTINGS", settings: heroSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_ABOUT_HERO_SETTINGS", settings: aboutHeroSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_STORY_SETTINGS", settings: storySettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_TEAM_SETTINGS", settings: teamSettings },
        "*",
      );
      win.postMessage(
        {
          type: "UPDATE_TESTIMONIALS_SETTINGS",
          settings: testimonialsSettings,
        },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_SERVICES_SETTINGS", settings: servicesSettings },
        "*",
      );
      win.postMessage(
        { type: "UPDATE_VALUES_SETTINGS", settings: valuesSettings },
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
      win.postMessage({ type: "UPDATE_COLORS", settings: colorSettings }, "*");
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
    colorSettings,
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
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_HERO_SETTINGS", settings: { ...heroSettings } },
        "*",
      );
    }
    saveHeroSettings(heroSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do banner foram aplicadas ao rascunho.",
    });
  }, [heroSettings, toast, iframeRef]);

  const handleApplyAboutHero = useCallback(() => {
    setLastAppliedAboutHero({ ...aboutHeroSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_ABOUT_HERO_SETTINGS",
          settings: { ...aboutHeroSettings },
        },
        "*",
      );
    }
    saveAboutHeroSettings(aboutHeroSettings);
    toast({
      title: "Preview atualizado!",
      description:
        "As mudanças do banner sobre nós foram aplicadas ao rascunho.",
    });
  }, [aboutHeroSettings, toast, iframeRef]);

  const handleApplyStory = useCallback(() => {
    setLastAppliedStory({ ...storySettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_STORY_SETTINGS", settings: { ...storySettings } },
        "*",
      );
    }
    saveStorySettings(storySettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças da história foram aplicadas ao rascunho.",
    });
  }, [storySettings, toast, iframeRef]);

  const handleApplyTeam = useCallback(() => {
    setLastAppliedTeam({ ...teamSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_TEAM_SETTINGS", settings: { ...teamSettings } },
        "*",
      );
    }
    saveTeamSettings(teamSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças da equipe foram aplicadas ao rascunho.",
    });
  }, [teamSettings, toast, iframeRef]);

  const handleApplyTestimonials = useCallback(() => {
    setLastAppliedTestimonials({ ...testimonialsSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_TESTIMONIALS_SETTINGS",
          settings: { ...testimonialsSettings },
        },
        "*",
      );
    }
    saveTestimonialsSettings(testimonialsSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças dos depoimentos foram aplicadas ao rascunho.",
    });
  }, [testimonialsSettings, toast, iframeRef]);

  const handleApplyTypography = useCallback(() => {
    setLastAppliedFont({ ...fontSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_TYPOGRAPHY", settings: { ...fontSettings } },
        "*",
      );
    }
    saveFontSettings(fontSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças de tipografia foram aplicadas ao rascunho.",
    });
  }, [fontSettings, toast, iframeRef]);

  const handleApplyColors = useCallback(() => {
    setLastAppliedColor({ ...colorSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_COLORS", settings: { ...colorSettings } },
        "*",
      );
    }
    saveColorSettings(colorSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças de cores foram aplicadas ao rascunho.",
    });
  }, [colorSettings, toast, iframeRef]);

  const handleApplyServices = useCallback(() => {
    setLastAppliedServices({ ...servicesSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_SERVICES_SETTINGS", settings: { ...servicesSettings } },
        "*",
      );
    }
    saveServicesSettings(servicesSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças de serviços foram aplicadas ao rascunho.",
    });
  }, [servicesSettings, toast, iframeRef]);

  const handleApplyValues = useCallback(() => {
    setLastAppliedValues({ ...valuesSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_VALUES_SETTINGS", settings: { ...valuesSettings } },
        "*",
      );
    }
    saveValuesSettings(valuesSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças de valores foram aplicadas ao rascunho.",
    });
  }, [valuesSettings, toast, iframeRef]);

  const handleApplyGallery = useCallback(() => {
    setLastAppliedGallery({ ...gallerySettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_GALLERY_SETTINGS", settings: { ...gallerySettings } },
        "*",
      );
    }
    saveGallerySettings(gallerySettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças da galeria foram aplicadas ao rascunho.",
    });
  }, [gallerySettings, toast, iframeRef]);

  const handleApplyCTA = useCallback(() => {
    setLastAppliedCTA({ ...ctaSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_CTA_SETTINGS", settings: { ...ctaSettings } },
        "*",
      );
    }
    saveCTASettings(ctaSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças da chamada foram aplicadas ao rascunho.",
    });
  }, [ctaSettings, toast, iframeRef]);

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
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_BOOKING_SERVICE_SETTINGS",
          settings: { ...bookingServiceSettings },
        },
        "*",
      );
    }
    saveBookingServiceSettings(bookingServiceSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do passo 1 (serviços) foram aplicadas.",
    });
  }, [bookingServiceSettings, toast, iframeRef]);

  const handleApplyBookingDate = useCallback(() => {
    setLastAppliedBookingDate({ ...bookingDateSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_BOOKING_DATE_SETTINGS",
          settings: { ...bookingDateSettings },
        },
        "*",
      );
    }
    saveBookingDateSettings(bookingDateSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do passo 2 (data) foram aplicadas.",
    });
  }, [bookingDateSettings, toast, iframeRef]);

  const handleApplyBookingTime = useCallback(() => {
    setLastAppliedBookingTime({ ...bookingTimeSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_BOOKING_TIME_SETTINGS",
          settings: { ...bookingTimeSettings },
        },
        "*",
      );
    }
    saveBookingTimeSettings(bookingTimeSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do passo 3 (horário) foram aplicadas.",
    });
  }, [bookingTimeSettings, toast, iframeRef]);

  const handleApplyBookingForm = useCallback(() => {
    setLastAppliedBookingForm({ ...bookingFormSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_BOOKING_FORM_SETTINGS",
          settings: { ...bookingFormSettings },
        },
        "*",
      );
    }
    saveBookingFormSettings(bookingFormSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do passo 4 (dados) foram aplicadas.",
    });
  }, [bookingFormSettings, toast, iframeRef]);

  const handleApplyBookingConfirmation = useCallback(() => {
    setLastAppliedBookingConfirmation({ ...bookingConfirmationSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_BOOKING_CONFIRMATION_SETTINGS",
          settings: { ...bookingConfirmationSettings },
        },
        "*",
      );
    }
    saveBookingConfirmationSettings(bookingConfirmationSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças da confirmação foram aplicadas.",
    });
  }, [bookingConfirmationSettings, toast, iframeRef]);

  const handleSaveGlobal = useCallback(async () => {
    // 1. Persistência Local (Backup/Offline)
    saveHeroSettings(heroSettings);
    saveAboutHeroSettings(aboutHeroSettings);
    saveStorySettings(storySettings);
    saveTeamSettings(teamSettings);
    saveTestimonialsSettings(testimonialsSettings);
    saveFontSettings(fontSettings);
    saveColorSettings(colorSettings);
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

    // 2. Persistência no Backend (se companyId estiver definido)
    if (companyId) {
      setIsSaving(true);
      try {
        const changes = getChangedSettings();

        // Alinhamento com o Back-end: Converter 'colors' para 'layoutGlobal' com 'siteColors'
        const payload: Record<string, unknown> = { ...changes };

        // Mapeamento de seções para layoutGlobal para persistência centralizada
        const sectionsToGlobal = [
          'hero', 'aboutHero', 'story', 'team', 'testimonials', 
          'services', 'values', 'gallery', 'cta', 'header', 'footer'
        ];

        for (const section of sectionsToGlobal) {
          if (changes[section]) {
            payload.layoutGlobal = {
              ...(payload.layoutGlobal as Record<string, unknown> || {}),
              [section]: changes[section],
            };
            // Mantemos no root para compatibilidade imediata se necessário
            // payload[section] = changes[section];
          }
        }

        if (changes.colors) {
          const colors = changes.colors as Record<string, string | undefined>;
          payload.layoutGlobal = {
            ...(payload.layoutGlobal as Record<string, unknown> || {}),
            siteColors: {
              primary: colors.primary,
              secondary: colors.secondary,
              accent: colors.accent || colors.primary,
              background: colors.background,
              text: colors.text,
              buttonText: colors.buttonText || "#ffffff",
            },
          };
          // Removemos a chave antiga para evitar duplicidade ou confusão no back-end
          delete payload.colors;
        }

        if (changes.theme) {
          payload.typography = changes.theme;
          payload.layoutGlobal = {
            ...(payload.layoutGlobal as Record<string, unknown> || {}),
            fontes: changes.theme,
          };
          delete payload.theme;
        }

        if (changes.visibleSections) {
          payload.layoutGlobal = {
            ...(payload.layoutGlobal as Record<string, unknown> || {}),
            visibleSections: changes.visibleSections,
          };
          delete payload.visibleSections;
        }

        if (changes.pageVisibility) {
          payload.layoutGlobal = {
            ...(payload.layoutGlobal as Record<string, unknown> || {}),
            pageVisibility: changes.pageVisibility,
          };
          delete payload.pageVisibility;
        }

        console.log("ENVIANDO PARA O BANCO:", payload);
        await siteCustomizerService.saveCustomization(companyId, payload);

        // Pós-salvamento: recarrega do banco (sem cache) e aplica imediatamente
        try {
          const fresh = await siteCustomizerService.getCustomization(companyId);
          loadExternalConfig(fresh as unknown as Record<string, unknown>);

          // Sincronização explícita com o preview para cores e fontes (que são as mais sensíveis)
          const layoutGlobal = fresh.layoutGlobal || fresh.layout_global;
          const freshColors = fresh.colors || layoutGlobal?.siteColors || layoutGlobal?.cores_base;
          const freshFonts = fresh.theme || fresh.typography || layoutGlobal?.fontes;

          if (iframeRef.current?.contentWindow) {
            if (freshColors) {
              iframeRef.current.contentWindow.postMessage(
                { type: "UPDATE_COLORS", settings: freshColors },
                "*",
              );
            }
            if (freshFonts) {
              iframeRef.current.contentWindow.postMessage(
                { type: "UPDATE_TYPOGRAPHY", settings: freshFonts },
                "*",
              );
            }
          }
        } catch (reloadErr) {
          console.error(
            "Falha ao recarregar dados do banco após salvar:",
            reloadErr,
          );
        }

        toast({
          title: "Salvo com sucesso!",
          description: "As alterações foram publicadas no seu site.",
        });
      } catch (err) {
        console.error("Erro ao salvar no backend:", err);
        toast({
          title: "Erro ao salvar",
          description:
            "As alterações foram salvas localmente, mas houve um erro ao sincronizar com o servidor.",
          variant: "destructive",
        });
        // Não retornamos aqui, deixamos atualizar os estados "lastSaved" para que o botão fique desabilitado,
        // pois já salvamos localmente. Ou deveríamos manter habilitado?
        // Assumindo que o local storage é a fonte de verdade imediata para o editor.
      } finally {
        setIsSaving(false);
      }
    } else {
      toast({
        title: "Site salvo localmente!",
        description: "As alterações foram salvas no navegador.",
      });
    }

    // 3. Atualiza estados "LastSaved" para refletir o que está "commitado"
    setLastSavedHero(heroSettings);
    setLastSavedAboutHero(aboutHeroSettings);
    setLastSavedStory(storySettings);
    setLastSavedTeam(teamSettings);
    setLastSavedTestimonials(testimonialsSettings);
    setLastSavedFont(fontSettings);
    setLastSavedColor(colorSettings);
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
    setLastAppliedColor(colorSettings);
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

    window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
  }, [
    companyId,
    getChangedSettings,
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
    pageVisibility,
    visibleSections,
    bookingServiceSettings,
    bookingDateSettings,
    bookingTimeSettings,
    bookingFormSettings,
    bookingConfirmationSettings,
    toast,
    iframeRef.current?.contentWindow,
    loadExternalConfig,
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
      setColorSettings(defaultColorSettings);
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
              { type: "UPDATE_HERO_SETTINGS", settings: defaultHeroSettings },
              "*",
            );
            break;
          case "about-hero":
            setAboutHeroSettings(defaultAboutHeroSettings);
            saveAboutHeroSettings(defaultAboutHeroSettings);
            win.postMessage(
              {
                type: "UPDATE_ABOUT_HERO_SETTINGS",
                settings: defaultAboutHeroSettings,
              },
              "*",
            );
            break;
          case "story":
            setStorySettings(defaultStorySettings);
            saveStorySettings(defaultStorySettings);
            win.postMessage(
              { type: "UPDATE_STORY_SETTINGS", settings: defaultStorySettings },
              "*",
            );
            break;
          case "team":
            setTeamSettings(defaultTeamSettings);
            saveTeamSettings(defaultTeamSettings);
            win.postMessage(
              { type: "UPDATE_TEAM_SETTINGS", settings: defaultTeamSettings },
              "*",
            );
            break;
          case "testimonials":
            setTestimonialsSettings(defaultTestimonialsSettings);
            saveTestimonialsSettings(defaultTestimonialsSettings);
            win.postMessage(
              {
                type: "UPDATE_TESTIMONIALS_SETTINGS",
                settings: defaultTestimonialsSettings,
              },
              "*",
            );
            break;
          case "typography":
            setFontSettings(defaultFontSettings);
            saveFontSettings(defaultFontSettings);
            win.postMessage(
              { type: "UPDATE_TYPOGRAPHY", settings: defaultFontSettings },
              "*",
            );
            break;
          case "colors":
            setColorSettings(defaultColorSettings);
            saveColorSettings(defaultColorSettings);
            win.postMessage(
              { type: "UPDATE_COLORS", settings: defaultColorSettings },
              "*",
            );
            break;
          case "services":
            setServicesSettings(defaultServicesSettings);
            saveServicesSettings(defaultServicesSettings);
            win.postMessage(
              {
                type: "UPDATE_SERVICES_SETTINGS",
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
                type: "UPDATE_VALUES_SETTINGS",
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

  const fetchCustomization = useCallback(
    async (id: string) => {
      setCompanyId(id);
      setIsFetching(true);
      setFetchError(null);
      try {
        const data = await siteCustomizerService.getCustomization(id);
        // Cast to unknown first to avoid partial match issues if types slightly differ
        loadExternalConfig(data as unknown as Record<string, unknown>);
      } catch (err) {
        console.error("Failed to fetch customization", err);
        setFetchError("Falha ao carregar configurações do site.");
      } finally {
        setIsFetching(false);
      }
    },
    [loadExternalConfig],
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
  const hasColorChanges =
    JSON.stringify(colorSettings) !== JSON.stringify(lastAppliedColor);
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
    const colorChanged =
      JSON.stringify(lastAppliedColor) !== JSON.stringify(lastSavedColor);
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
      colorChanged,
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
      visibleSectionsChanged,
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
    lastAppliedColor,
    lastSavedColor,
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
    pageVisibility,
    visibleSections,
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
    handleApplyHero,
    handleApplyAboutHero,
    handleApplyStory,
    handleApplyTeam,
    handleApplyTestimonials,
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
    handleSaveGlobal,
    resetSettings,
    handleSectionReset,
    hasHeroChanges,
    hasAboutHeroChanges,
    hasStoryChanges,
    hasTeamChanges,
    hasTestimonialsChanges,
    hasFontChanges,
    hasColorChanges,
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
    loadExternalConfig,
    getChangedSettings,
    fetchCustomization,
    isFetching,
    fetchError,
    isSaving,
  };
}
