import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  valuesSettings: ValuesSettings;
  gallerySettings: GallerySettings;
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
  lastSavedValues: ValuesSettings;
  lastSavedGallery: GallerySettings;
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
  lastAppliedValues: ValuesSettings;
  lastAppliedGallery: GallerySettings;
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
  setLastSavedValues: (value: ValuesSettings) => void;
  setLastSavedGallery: (value: GallerySettings) => void;
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
  setLastAppliedValues: (value: ValuesSettings) => void;
  setLastAppliedGallery: (value: GallerySettings) => void;
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
  loadExternalConfig: (
    config: SiteConfigData,
    force?: boolean,
  ) => void;
  settings: EditorSettings;
  lastSaved: EditorSavedState;
  lastApplied: EditorAppliedState;
  setters: EditorStateSetters;
  saveLocalDrafts: (drafts: EditorLocalDrafts) => void;
  clearLocalDrafts: () => void;
};

export function useEditorApi({
  loadExternalConfig,
  settings,
  lastSaved,
  lastApplied,
  setters,
  saveLocalDrafts,
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
      console.log(">>> [useEditorApi] Services mudou:", {
        currentAppearance: settings.servicesSettings.appearance,
        savedAppearance: lastSaved.lastSavedServices.appearance,
      });
      changes.services = settings.servicesSettings;
    }
    if (hasChanged(settings.valuesSettings, lastSaved.lastSavedValues)) {
      console.log(">>> [useEditorApi] Values mudou:", {
        currentAppearance: settings.valuesSettings.appearance,
        savedAppearance: lastSaved.lastSavedValues.appearance,
      });
      changes.values = settings.valuesSettings;
    }
    if (hasChanged(settings.gallerySettings, lastSaved.lastSavedGallery)) {
      console.log(">>> [useEditorApi] Gallery mudou:", {
        currentAppearance: settings.gallerySettings.appearance,
        savedAppearance: lastSaved.lastSavedGallery.appearance,
      });
      changes.gallery = settings.gallerySettings;
    }
    if (hasChanged(settings.ctaSettings, lastSaved.lastSavedCTA)) {
      console.log(">>> [useEditorApi] CTA mudou:", {
        currentAppearance: settings.ctaSettings.appearance,
        savedAppearance: lastSaved.lastSavedCTA.appearance,
      });
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
    if (
      JSON.stringify(settings.bookingServiceSettings) !==
      JSON.stringify(lastSaved.lastSavedBookingService)
    ) {
      bookingChanges.service = settings.bookingServiceSettings;
    }
    if (
      JSON.stringify(settings.bookingDateSettings) !==
      JSON.stringify(lastSaved.lastSavedBookingDate)
    ) {
      bookingChanges.date = settings.bookingDateSettings;
    }
    if (
      JSON.stringify(settings.bookingTimeSettings) !==
      JSON.stringify(lastSaved.lastSavedBookingTime)
    ) {
      bookingChanges.time = settings.bookingTimeSettings;
    }
    if (
      JSON.stringify(settings.bookingFormSettings) !==
      JSON.stringify(lastSaved.lastSavedBookingForm)
    ) {
      bookingChanges.form = settings.bookingFormSettings;
    }
    if (
      JSON.stringify(settings.bookingConfirmationSettings) !==
      JSON.stringify(lastSaved.lastSavedBookingConfirmation)
    ) {
      bookingChanges.confirmation = settings.bookingConfirmationSettings;
    }

    if (Object.keys(bookingChanges).length > 0) {
      changes.bookingSteps = bookingChanges;
    }

    return changes;
  }, [lastSaved, settings]);

  const handleSaveLocal = useCallback((skipEvent = false) => {
    saveLocalDrafts({
      heroSettings: settings.heroSettings,
      aboutHeroSettings: settings.aboutHeroSettings,
      storySettings: settings.storySettings,
      teamSettings: settings.teamSettings,
      testimonialsSettings: settings.testimonialsSettings,
      fontSettings: settings.fontSettings,
      colorSettings: settings.colorSettings,
      servicesSettings: settings.servicesSettings,
      valuesSettings: settings.valuesSettings,
      gallerySettings: settings.gallerySettings,
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
    if (!skipEvent && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('local_draft_changed'));
    }
  }, [saveLocalDrafts, settings]);

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
    const valuesChanged =
      JSON.stringify(lastApplied.lastAppliedValues) !==
      JSON.stringify(lastSaved.lastSavedValues);
    const galleryChanged =
      JSON.stringify(lastApplied.lastAppliedGallery) !==
      JSON.stringify(lastSaved.lastSavedGallery);
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
          loadExternalConfig(data);
          return data;
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

      if (companyId) {
        setIsSaving(true);
        try {
          const changes = getChangedSettings();
          console.log(">>> [useEditorApi] Alterações detectadas:", changes);

          if (Object.keys(changes).length === 0) {
            console.log(
              ">>> [useEditorApi] Nenhuma alteração detectada. Pulando salvamento.",
            );
            return;
          }

          const payload: Record<string, unknown> = {};

          const sectionsToGlobal = [
            "hero",
            "aboutHero",
            "story",
            "team",
            "testimonials",
            "services",
            "values",
            "gallery",
            "cta",
            "header",
            "footer",
          ];

          const sectionToDatabasePath: Record<string, string> = {
            hero: "home.heroBanner",
            aboutHero: "home.aboutHero",
            story: "home.storySection",
            team: "home.teamSection",
            testimonials: "home.testimonialsSection",
            services: "home.servicesSection",
            values: "home.valuesSection",
            gallery: "home.galleryPreview",
            cta: "home.ctaSection",
          };

          for (const section of sectionsToGlobal) {
            const sectionKey = section as keyof typeof changes;
              if (changes[sectionKey]) {
                const sectionData = {
                  ...(changes[sectionKey] as Record<string, unknown>),
                };

              const dbPath = sectionToDatabasePath[section];
              if (dbPath) {
                const [root, sub] = dbPath.split(".");
                if (!payload[root]) payload[root] = {};
                const rootObj = payload[root] as Record<string, unknown>;

                if (!rootObj[sub]) rootObj[sub] = {};
                const subObj = rootObj[sub] as Record<string, unknown>;

                const appearance = (sectionData.appearance as
                  | Record<string, unknown>
                  | undefined) || {};

                // Mapeia TODOS os campos de aparência para garantir sincronização total
                subObj.appearance = {
                  ...appearance,
                  backgroundImageUrl:
                    sectionData.bgImage || appearance.backgroundImageUrl || "",
                  showBackgroundImage: sectionData.bgType === "image",
                  backgroundColor:
                    (sectionData.bgColor as string) ||
                    (appearance.backgroundColor as string) ||
                    "",
                  overlayOpacity:
                    typeof sectionData.overlayOpacity === "number"
                      ? sectionData.overlayOpacity
                      : appearance.overlayOpacity ?? 0.5,
                  // Garante campos de cores e fontes na aparência também
                  titleColor: sectionData.titleColor || appearance.titleColor || "",
                  subtitleColor: sectionData.subtitleColor || appearance.subtitleColor || "",
                  titleFont: sectionData.titleFont || appearance.titleFont || "",
                  subtitleFont: sectionData.subtitleFont || appearance.subtitleFont || "",
                };

                // Se for Hero, adiciona campos de botões e badge na aparência
                if (section === "hero" || section === "aboutHero") {
                  const heroApp = subObj.appearance as Record<string, unknown>;
                  heroApp.badgeColor = sectionData.badgeColor || appearance.badgeColor || "";
                  heroApp.badgeTextColor = sectionData.badgeTextColor || appearance.badgeTextColor || "";
                  heroApp.badgeFont = sectionData.badgeFont || appearance.badgeFont || "";
                  heroApp.primaryButtonColor = sectionData.primaryButtonColor || appearance.primaryButtonColor || "";
                  heroApp.primaryButtonTextColor = sectionData.primaryButtonTextColor || appearance.primaryButtonTextColor || "";
                  heroApp.primaryButtonFont = sectionData.primaryButtonFont || appearance.primaryButtonFont || "";
                  heroApp.secondaryButtonColor = sectionData.secondaryButtonColor || appearance.secondaryButtonColor || "";
                  heroApp.secondaryButtonTextColor = sectionData.secondaryButtonTextColor || appearance.secondaryButtonTextColor || "";
                  heroApp.secondaryButtonFont = sectionData.secondaryButtonFont || appearance.secondaryButtonFont || "";
                }

                subObj.bgType = sectionData.bgType || "color";
                subObj.bgColor =
                  (sectionData.bgColor as string) ||
                  (appearance.backgroundColor as string) ||
                  "";
                subObj.bgImage =
                  sectionData.bgImage || appearance.backgroundImageUrl || "";

                // Mapeamento de conteúdo completo para persistência
                const content: Record<string, unknown> = {
                  title: sectionData.title || "",
                  subtitle: sectionData.subtitle || "",
                  titleFont: sectionData.titleFont || "",
                  titleColor: sectionData.titleColor || "",
                  subtitleFont: sectionData.subtitleFont || "",
                  subtitleColor: sectionData.subtitleColor || "",
                };

                // Inclusão explícita de campos na RAIZ para todas as seções
                // Isso garante que o banco de dados receba os campos fora do objeto 'content'
                Object.assign(subObj, {
                  ...sectionData, // Joga todas as propriedades (incluindo camelCase) na raiz
                  // Compatibilidade Snake Case para o Banco de Dados
                  primary_button_color: sectionData.primaryButtonColor || sectionData.primary_button_color,
                  secondary_button_color: sectionData.secondaryButtonColor || sectionData.secondary_button_color,
                  button_text: sectionData.buttonText || sectionData.button_text,
                  button_color: sectionData.buttonColor || sectionData.button_color,
                  button_text_color: sectionData.buttonTextColor || sectionData.button_text_color,
                  button_font: sectionData.buttonFont || sectionData.button_font,
                  button_link: sectionData.buttonLink || sectionData.button_link,
                  title_font: sectionData.titleFont || sectionData.title_font,
                  subtitle_font: sectionData.subtitleFont || sectionData.subtitle_font,
                  card_bg_color: sectionData.cardBgColor || sectionData.card_bg_color,
                  bg_color: sectionData.bgColor || sectionData.bg_color,
                  title_color: sectionData.titleColor || sectionData.title_color,
                  subtitle_color: sectionData.subtitleColor || sectionData.subtitle_color,
                  badge_color: sectionData.badgeColor || sectionData.badge_color,
                  badge_text_color: sectionData.badgeTextColor || sectionData.badge_text_color,
                  // Teste de Força Bruta: campo 'color' genérico para ver se o banco aceita
                  color: sectionData.primaryButtonColor || sectionData.cardBgColor || sectionData.bgColor || "",
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
                    content.cardBorderRadius = sectionData.cardBorderRadius || "";
                  }

                  if (section === "gallery") {
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

                  if (section === "values") {
                    content.title = sectionData.title || "";
                    content.subtitle = sectionData.subtitle || "";
                    content.items = sectionData.items || [];
                    content.cardBgColor = sectionData.cardBgColor || "";
                    content.cardTitleFont = sectionData.cardTitleFont || "";
                    content.cardTitleColor = sectionData.cardTitleColor || "";
                    content.cardDescriptionFont =
                      sectionData.cardDescriptionFont || "";
                    content.cardDescriptionColor =
                      sectionData.cardDescriptionColor || "";
                    content.cardIconColor = sectionData.cardIconColor || "";
                    content.showTitle = sectionData.showTitle ?? true;
                    content.showSubtitle = sectionData.showSubtitle ?? true;
                  }

                  if (section === "services") {
                    content.title = sectionData.title || "";
                    content.subtitle = sectionData.subtitle || "";
                    content.cardBgColor = sectionData.cardBgColor || "";
                    content.cardTitleFont = sectionData.cardTitleFont || "";
                    content.cardTitleColor = sectionData.cardTitleColor || "";
                    content.cardDescriptionFont =
                      sectionData.cardDescriptionFont || "";
                    content.cardDescriptionColor =
                      sectionData.cardDescriptionColor || "";
                    content.cardPriceFont = sectionData.cardPriceFont || "";
                    content.cardPriceColor = sectionData.cardPriceColor || "";
                    content.cardIconColor = sectionData.cardIconColor || "";
                    content.cardBorderRadius = sectionData.cardBorderRadius || "";
                    content.cardBorderWidth = sectionData.cardBorderWidth || "";
                    content.cardBorderColor = sectionData.cardBorderColor || "";
                    content.showTitle = sectionData.showTitle ?? true;
                    content.showSubtitle = sectionData.showSubtitle ?? true;
                  }

                  if (section === "team") {
                    content.title = sectionData.title || "";
                    content.subtitle = sectionData.subtitle || "";
                    content.members = sectionData.members || [];
                    content.cardBgColor = sectionData.cardBgColor || "";
                    content.cardTitleFont = sectionData.cardTitleFont || "";
                    content.cardTitleColor = sectionData.cardTitleColor || "";
                    content.cardRoleFont = sectionData.cardRoleFont || "";
                    content.cardRoleColor = sectionData.cardRoleColor || "";
                    content.cardDescriptionFont =
                      sectionData.cardDescriptionFont || "";
                    content.cardDescriptionColor =
                      sectionData.cardDescriptionColor || "";
                  }

                  subObj.content = content;
                }

                sectionData.appearance = subObj.appearance;
                if (subObj.content) {
                  sectionData.content = subObj.content;
                }
              }

              if (!payload.layoutGlobal) payload.layoutGlobal = {};
              const layoutKey = section === "hero" ? "heroBanner" : section;
              (payload.layoutGlobal as Record<string, unknown>)[layoutKey] =
                sectionData;
            }
          }

          // Tratamento especial para fontes e cores globais (Theme)
          if (changes.theme) {
            const fontData = changes.theme as Record<string, unknown>;
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
          }

          if (changes.colors) {
            const colorData = changes.colors as Record<string, unknown>;
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
            if (!payload.layoutGlobal) payload.layoutGlobal = {};
            const layoutGlobal = payload.layoutGlobal as Record<string, unknown>;
            layoutGlobal.siteColors = normalizedColors;
            layoutGlobal.cores_base = normalizedColors;
            layoutGlobal.color = normalizedColors;
          }

          // Tratar Header/Footer (se não estiverem no loop acima)
          if (changes.header) {
            if (!payload.layoutGlobal) payload.layoutGlobal = {};
            (payload.layoutGlobal as Record<string, unknown>).header =
              changes.header;
          }
          if (changes.footer) {
            if (!payload.layoutGlobal) payload.layoutGlobal = {};
            (payload.layoutGlobal as Record<string, unknown>).footer =
              changes.footer;
          }

          // Tratar Visibilidade
          if (changes.pageVisibility) {
            if (!payload.layoutGlobal) payload.layoutGlobal = {};
            (payload.layoutGlobal as Record<string, unknown>).pageVisibility =
              changes.pageVisibility;
          }
          if (changes.visibleSections) {
            if (!payload.layoutGlobal) payload.layoutGlobal = {};
            (payload.layoutGlobal as Record<string, unknown>).visibleSections =
              changes.visibleSections;
          }

          // Tratar Passos de Agendamento
          if (changes.bookingSteps) {
            console.log(">>> [API_SAVE] Mapeando bookingSteps para appointmentFlow:", changes.bookingSteps);
            payload.appointmentFlow = {
              steps: {
                ...(changes.bookingSteps.service ? { service: changes.bookingSteps.service } : {}),
                ...(changes.bookingSteps.date ? { date: changes.bookingSteps.date } : {}),
                ...(changes.bookingSteps.time ? { time: changes.bookingSteps.time } : {}),
                ...(changes.bookingSteps.form ? { form: changes.bookingSteps.form } : {}),
                ...(changes.bookingSteps.confirmation ? { confirmation: changes.bookingSteps.confirmation } : {}),
              }
            };
            
            // Log de Payload de Saída solicitado pelo usuário
            console.log(">>> [API_SAVE] Enviando para o banco (appointmentFlow):", payload.appointmentFlow);
            
            // Adicionalmente, enviamos como bookingSteps para garantir compatibilidade se o banco esperar a chave separada
            payload.bookingSteps = changes.bookingSteps;
          }

          // Limpar o payload de campos undefined para não quebrar o deepMerge do back
          const cleanPayload = JSON.parse(JSON.stringify(payload));

          console.log(">>> [useEditorApi] Payload final limpo para PATCH:", cleanPayload);

          const fresh = await siteCustomizerService.saveDraftCustomization(
            companyId,
            cleanPayload,
          );

          if (typeof window !== "undefined") {
            // REMOVIDO: Não limpamos mais o rascunho local, apenas atualizamos com o que foi salvo
            // localStorage.removeItem("studio_data");
            // localStorage.removeItem(`site_draft_${companyId}`);

            if (fresh && shouldReload) {
              console.log(">>> [SYNC] Atualizando interface com dados frescos do servidor.");
              // Usamos (fresh as SiteConfigData) para evitar erro de 'possibly null' que trava a execução
              loadExternalConfig(fresh as SiteConfigData, true);
              localStorage.setItem("studio_data", JSON.stringify(fresh));
              
              // Sincroniza o rascunho local com os dados frescos
              handleSaveLocal(true);
              
              console.log(">>> [SYNC] Buscando customização atualizada para sincronizar contexto...");
              await fetchCustomization(companyId);
            }
          }

          // Garante que o rascunho local reflita o estado atual após o save
          handleSaveLocal(true);
          setIsSaving(false); 
      
      // REMOVIDO DISPARO RECURSIVO: O estado lastSaved já foi atualizado, 
      // o que forçará a reavaliação de hasUnsavedGlobalChanges naturalmente.

      try { 
        toast({ 
          title: "Salvo com sucesso!", 
          description: "As alterações foram salvas no rascunho.", 
          duration: 2000, 
        }); 
      } catch(_e) {} 
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
        toast({
          title: "Site salvo localmente!",
          description: "As alterações foram salvas no navegador.",
        });
      }

      // ATUALIZAÇÃO DO ESTADO LAST_SAVED
      // Isso garante que shouldSaveLocal() retorne false até que novas mudanças sejam feitas.
      // Note que NÃO atualizamos lastApplied aqui, pois o rascunho salvo ainda não foi publicado.
      setters.setLastSavedHero(settings.heroSettings);
      setters.setLastSavedAboutHero(settings.aboutHeroSettings);
      setters.setLastSavedStory(settings.storySettings);
      setters.setLastSavedTeam(settings.teamSettings);
      setters.setLastSavedTestimonials(settings.testimonialsSettings);
      setters.setLastSavedFont(settings.fontSettings);
      setters.setLastSavedColor(settings.colorSettings);
      setters.setLastSavedServices(settings.servicesSettings);
      setters.setLastSavedValues(settings.valuesSettings);
      setters.setLastSavedGallery(settings.gallerySettings);
      setters.setLastSavedCTA(settings.ctaSettings);
      setters.setLastSavedHeader(settings.headerSettings);
      setters.setLastSavedFooter(settings.footerSettings);
      setters.setLastSavedPageVisibility(settings.pageVisibility);
      setters.setLastSavedVisibleSections(settings.visibleSections);

      setters.setLastSavedBookingService(settings.bookingServiceSettings);
      setters.setLastSavedBookingDate(settings.bookingDateSettings);
      setters.setLastSavedBookingTime(settings.bookingTimeSettings);
      setters.setLastSavedBookingForm(settings.bookingFormSettings);
      setters.setLastSavedBookingConfirmation(
        settings.bookingConfirmationSettings,
      );

      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
      
      // LOGS DE DEPURAÇÃO PARA IDENTIFICAR POR QUE O BOTÃO DE PUBLICAR PODE ESTAR DESABILITADO
      console.log(">>> [useEditorApi] Fim de handleSaveGlobal. hasUnsavedGlobalChanges:", hasUnsavedGlobalChanges);
    },
    [
      companyId,
      isPublishing,
      getChangedSettings,
      loadExternalConfig,
      handleSaveLocal,
      setters,
      settings,
      toast,
      hasUnsavedGlobalChanges,
      fetchCustomization, // Adicionado às dependências
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
        console.log(">>> [useEditorApi] Salvando rascunho antes de publicar...");
        await handleSaveGlobal(false); // Salva sem recarregar do banco ainda
      }

      // 2. Disparamos a publicação (copiar rascunho -> principal)
      const success = await siteCustomizerService.publishCustomization(companyId);

      if (success) {
        toast({
          title: "Site Publicado!",
          description: "As alterações agora estão visíveis para todos os clientes.",
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
      setters.setLastAppliedValues(settings.valuesSettings);
      setters.setLastAppliedGallery(settings.gallerySettings);
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
          description: "Não foi possível publicar as alterações. Tente novamente.",
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
