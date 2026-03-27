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
import {
  normalizePayload as normalizePayloadData,
  normalizePersistenceData,
  sanitizeSection,
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
  homeValuesSettings: ValuesSettings;
  aboutUsValuesSettings: ValuesSettings;
  gallerySettings: GallerySettings;
  galleryPageSettings: GallerySettings;
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
  lastSavedHomeValues: ValuesSettings;
  lastSavedAboutUsValues: ValuesSettings;
  lastSavedGallery: GallerySettings;
  lastSavedGalleryPage: GallerySettings;
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
  lastAppliedHomeValues: ValuesSettings;
  lastAppliedAboutUsValues: ValuesSettings;
  lastAppliedGallery: GallerySettings;
  lastAppliedGalleryPage: GallerySettings;
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
  setLastSavedHomeValues: (value: ValuesSettings) => void;
  setLastSavedAboutUsValues: (value: ValuesSettings) => void;
  setLastSavedGallery: (value: GallerySettings) => void;
  setLastSavedGalleryPage: (value: GallerySettings) => void;
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
  setLastAppliedHomeValues: (value: ValuesSettings) => void;
  setLastAppliedAboutUsValues: (value: ValuesSettings) => void;
  setLastAppliedGallery: (value: GallerySettings) => void;
  setLastAppliedGalleryPage: (value: GallerySettings) => void;
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
  setIsDirty: (value: boolean) => void;
  saveLocalDrafts: (data: EditorLocalDrafts) => void;
  updateStudioInfo?: (updates: Record<string, unknown>) => void;
};

const normalizePayload = (data: SiteConfigData | null | undefined) =>
  normalizePayloadData(data);

// Função de validação robusta para objetos de configuração
const validateSectionObject = (obj: unknown, sectionName: string): boolean => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    console.error(`>>> [API_GUARD] Objeto inválido para ${sectionName}:`, obj);
    return false;
  }
  
  const keys = Object.keys(obj as Record<string, unknown>);
  
  // Verifica se o objeto foi corrompido (transformado em string indexada)
  if (keys.length > 0 && keys.every(key => /^\d+$/.test(key))) {
    console.error(`>>> [API_GUARD] Objeto corrompido detectado para ${sectionName} (string indexada):`, obj);
    return false;
  }
  
  // Verifica se há propriedades esperadas ausentes (indica corrompimento)
  const hasValidProperties = keys.some(key => 
    !/^\d+$/.test(key) && key.length > 1 && key !== 'length'
  );
  
  if (!hasValidProperties && keys.length > 0) {
    console.error(`>>> [API_GUARD] Objeto sem propriedades válidas para ${sectionName}:`, obj);
    return false;
  }
  
  return true;
};

// Função para sanitizar o payload antes de enviar para o backend
const sanitizePayload = (payload: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (validateSectionObject(value, key)) {
        sanitized[key] = value;
      } else {
        console.warn(`>>> [API_GUARD] Seção ${key} removida do payload por ser inválida`);
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

export function useEditorApi({
  loadExternalConfig,
  settings,
  lastSaved,
  lastApplied,
  setters,
  setIsDirty,
  saveLocalDrafts,
  updateStudioInfo,
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
      changes.services = settings.servicesSettings;
    }
    if (hasChanged(settings.homeValuesSettings, lastSaved.lastSavedHomeValues)) {
      changes.homeValuesSettings = {
        ...settings.homeValuesSettings,
        appearance: {
          ...settings.homeValuesSettings.appearance,
          backgroundColor:
            settings.homeValuesSettings.appearance?.backgroundColor ||
            settings.homeValuesSettings.bgColor ||
            "",
        },
      };
      (changes.homeValuesSettings as Record<string, unknown>).values_bg =
        settings.homeValuesSettings.appearance?.backgroundColor ||
        settings.homeValuesSettings.bgColor ||
        "";
    }
    if (
      hasChanged(settings.aboutUsValuesSettings, lastSaved.lastSavedAboutUsValues)
    ) {
      changes.aboutUsValuesSettings = settings.aboutUsValuesSettings;
    }
    if (hasChanged(settings.gallerySettings, lastSaved.lastSavedGallery)) {
      changes.galleryPreviewSettings = settings.gallerySettings;
    }
    if (
      hasChanged(settings.galleryPageSettings, lastSaved.lastSavedGalleryPage)
    ) {
      changes.galleryPageSettings = settings.galleryPageSettings;
    }
    if (hasChanged(settings.ctaSettings, lastSaved.lastSavedCTA)) {
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
      homeValuesSettings: settings.homeValuesSettings,
      aboutUsValuesSettings: settings.aboutUsValuesSettings,
      gallerySettings: settings.gallerySettings,
      galleryPageSettings: settings.galleryPageSettings,
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
    const homeValuesChanged =
      JSON.stringify(lastApplied.lastAppliedHomeValues) !==
      JSON.stringify(lastSaved.lastSavedHomeValues);
    const aboutUsValuesChanged =
      JSON.stringify(lastApplied.lastAppliedAboutUsValues) !==
      JSON.stringify(lastSaved.lastSavedAboutUsValues);
    const galleryChanged =
      JSON.stringify(lastApplied.lastAppliedGallery) !==
      JSON.stringify(lastSaved.lastSavedGallery);
    const galleryPageChanged =
      JSON.stringify(lastApplied.lastAppliedGalleryPage) !==
      JSON.stringify(lastSaved.lastSavedGalleryPage);
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
      homeValuesChanged,
      aboutUsValuesChanged,
      galleryChanged,
      galleryPageChanged,
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
          const normalized = normalizePayload(data);
          loadExternalConfig(normalized);
          return normalized;
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

      const sanitizeSectionData = <T,>(current: T, fallback: T) =>
        sanitizeSection(current, fallback) as T;

      const sanitizedHero = sanitizeSectionData(
        settings.heroSettings,
        lastSaved.lastSavedHero,
      );
      const sanitizedAboutHero = sanitizeSectionData(
        settings.aboutHeroSettings,
        lastSaved.lastSavedAboutHero,
      );
      const sanitizedStory = sanitizeSectionData(
        settings.storySettings,
        lastSaved.lastSavedStory,
      );
      const sanitizedTeam = sanitizeSectionData(
        settings.teamSettings,
        lastSaved.lastSavedTeam,
      );
      const sanitizedTestimonials = sanitizeSectionData(
        settings.testimonialsSettings,
        lastSaved.lastSavedTestimonials,
      );
      const sanitizedServices = sanitizeSectionData(
        settings.servicesSettings,
        lastSaved.lastSavedServices,
      );
      const sanitizedHomeValues = sanitizeSectionData(
        settings.homeValuesSettings,
        lastSaved.lastSavedHomeValues,
      );
      const sanitizedAboutUsValues = sanitizeSectionData(
        settings.aboutUsValuesSettings,
        lastSaved.lastSavedAboutUsValues,
      );
      const normalizeValuesAppearance = (section: Record<string, unknown>) => {
        const appearance =
          (section.appearance as Record<string, unknown> | undefined) || {};
        const backgroundColor =
          (section.backgroundColor as string) ||
          (section.bgColor as string) ||
          (appearance.backgroundColor as string) ||
          "";
        return {
          ...section,
          backgroundColor,
          appearance: {
            ...appearance,
            backgroundColor,
          },
        };
      };
      const normalizedHomeValues = normalizeValuesAppearance(
        sanitizedHomeValues,
      );
      const normalizedAboutUsValues = normalizeValuesAppearance(
        sanitizedAboutUsValues,
      );
      const sanitizedGalleryPreview = sanitizeSectionData(
        settings.gallerySettings,
        lastSaved.lastSavedGallery,
      );
      const sanitizedGalleryPage = sanitizeSectionData(
        settings.galleryPageSettings,
        lastSaved.lastSavedGalleryPage,
      );
      const sanitizedCta = sanitizeSectionData(
        settings.ctaSettings,
        lastSaved.lastSavedCTA,
      );
      const sanitizedHeader = sanitizeSectionData(
        settings.headerSettings,
        lastSaved.lastSavedHeader,
      );
      const sanitizedFooter = sanitizeSectionData(
        settings.footerSettings,
        lastSaved.lastSavedFooter,
      );

      const sanitizedBookingSteps = {
        service: sanitizeSectionData(
          settings.bookingServiceSettings,
          lastSaved.lastSavedBookingService,
        ),
        date: sanitizeSectionData(
          settings.bookingDateSettings,
          lastSaved.lastSavedBookingDate,
        ),
        time: sanitizeSectionData(
          settings.bookingTimeSettings,
          lastSaved.lastSavedBookingTime,
        ),
        form: sanitizeSectionData(
          settings.bookingFormSettings,
          lastSaved.lastSavedBookingForm,
        ),
        confirmation: sanitizeSectionData(
          settings.bookingConfirmationSettings,
          lastSaved.lastSavedBookingConfirmation,
        ),
      };

      const cleanBookingSteps = normalizePersistenceData(
        sanitizedBookingSteps,
      ) as Record<string, BookingStepSettings>;

      const galleryBackgroundColor =
        sanitizedGalleryPreview.appearance?.backgroundColor ||
        sanitizedGalleryPreview.bgColor ||
        "";
      const rawGalleryStyles = (sanitizedGalleryPreview as Record<string, unknown>)
        .styles as Record<string, unknown> | undefined;
      const gallerySectionPayload = {
        ...sanitizedGalleryPreview,
        styles: {
          ...(rawGalleryStyles && typeof rawGalleryStyles === "object"
            ? rawGalleryStyles
            : {}),
          backgroundColor: galleryBackgroundColor,
        },
      };

      const payload: Record<string, unknown> = {
        sections: {
          hero: sanitizedHero,
          aboutHero: sanitizedAboutHero,
          story: sanitizedStory,
          team: sanitizedTeam,
          testimonials: sanitizedTestimonials,
          services: sanitizedServices,
          homeValuesSettings: normalizedHomeValues,
          aboutUsValuesSettings: normalizedAboutUsValues,
          gallery: gallerySectionPayload,
          galleryPageSettings: sanitizedGalleryPage,
          cta: sanitizedCta,
          header: sanitizedHeader,
          footer: sanitizedFooter,
          fontSettings: settings.fontSettings,
          colorSettings: settings.colorSettings,
          pageVisibility: settings.pageVisibility,
          visibleSections: settings.visibleSections,
          bookingSteps: cleanBookingSteps,
        },
        homeValuesSettings: normalizedHomeValues,
        aboutUsValuesSettings: normalizedAboutUsValues,
      };

      if (companyId) {
        setIsSaving(true);
        try {
          // Mapeamento explícito para compatibilidade com o backend (Snake Case e Estrutura de Pastas)
          const sectionsToGlobal = [
            "hero",
            "aboutHero",
            "story",
            "team",
            "testimonials",
            "services",
            "homeValuesSettings",
            "aboutUsValuesSettings",
            "gallery",
            "galleryPageSettings",
            "cta",
            "header",
            "footer",
          ];
          const sectionDataMap: Record<string, unknown> = {
            hero: sanitizedHero,
            aboutHero: sanitizedAboutHero,
            story: sanitizedStory,
            team: sanitizedTeam,
            testimonials: sanitizedTestimonials,
            services: sanitizedServices,
            homeValuesSettings: normalizedHomeValues,
            aboutUsValuesSettings: normalizedAboutUsValues,
            gallery: gallerySectionPayload,
            galleryPageSettings: sanitizedGalleryPage,
            cta: sanitizedCta,
            header: sanitizedHeader,
            footer: sanitizedFooter,
          };
          const isRecord = (value: unknown): value is Record<string, unknown> =>
            !!value && typeof value === "object" && !Array.isArray(value);
          const toSafeRecord = (
            value: unknown,
          ): Record<string, unknown> | undefined => (isRecord(value) ? value : undefined);

          const sectionToDatabasePath: Record<string, string | string[]> = {
            hero: "home.heroBanner",
            aboutHero: "home.aboutHero",
            story: "home.storySection",
            team: "home.teamSection",
            testimonials: "home.testimonialsSection",
            services: "home.servicesSection",
            homeValuesSettings: ["homeValuesSettings", "home.homeValuesSettings"],
            aboutUsValuesSettings: [
              "aboutUsValuesSettings",
              "aboutUs.valuesSection",
              "aboutUs.values",
            ],
            gallery: ["home.galleryPreview", "sections.gallery"],
            galleryPageSettings: ["gallery", "galleryPageSettings"],
            cta: "home.ctaSection",
            header: "layoutGlobal.header",
            footer: "layoutGlobal.footer",
          };

          for (const section of sectionsToGlobal) {
            const rawSectionData = sectionDataMap[section];
            if (!isRecord(rawSectionData)) {
              console.warn(">>> [SAVE_GUARD] Seção inválida, ignorando:", {
                section,
                rawSectionData,
              });
              continue;
            }
            const sectionData = { ...rawSectionData };

            const dbPaths = sectionToDatabasePath[section];
            const resolvedPaths = Array.isArray(dbPaths)
              ? dbPaths
              : dbPaths
                ? [dbPaths]
                : [];
            if (resolvedPaths.length > 0) {
              for (const dbPath of resolvedPaths) {
                const pathParts = dbPath.split(".");
                let subObj: Record<string, unknown>;
                if (pathParts.length === 1) {
                  if (!payload[dbPath]) payload[dbPath] = {};
                  subObj = payload[dbPath] as Record<string, unknown>;
                } else {
                  const [root, sub] = pathParts;
                  if (!payload[root]) payload[root] = {};
                  const rootObj = payload[root] as Record<string, unknown>;

                  if (!rootObj[sub]) rootObj[sub] = {};
                  subObj = rootObj[sub] as Record<string, unknown>;
                }

                const appearance = toSafeRecord(sectionData.appearance) || {};
                const overlay = toSafeRecord(
                  (appearance as Record<string, unknown>).overlay,
                ) || {};

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
                      : appearance.overlayOpacity ?? 0,
                  overlay: {
                    ...overlay,
                    color: (overlay.color as string) || "",
                    opacity:
                      typeof sectionData.overlayOpacity === "number"
                        ? sectionData.overlayOpacity
                        : typeof overlay.opacity === "number"
                          ? overlay.opacity
                          : 0,
                  },
                  imageOpacity:
                    typeof sectionData.imageOpacity === "number"
                      ? sectionData.imageOpacity
                      : appearance.imageOpacity ?? 1,
                  imageScale:
                    typeof sectionData.imageScale === "number"
                      ? sectionData.imageScale
                      : appearance.imageScale ?? 1,
                  imageX:
                    typeof sectionData.imageX === "number"
                      ? sectionData.imageX
                      : appearance.imageX ?? 50,
                  imageY:
                    typeof sectionData.imageY === "number"
                      ? sectionData.imageY
                      : appearance.imageY ?? 50,
                  // Garante campos de cores e fontes na aparência também
                  titleColor: sectionData.titleColor || appearance.titleColor || "",
                  subtitleColor: sectionData.subtitleColor || appearance.subtitleColor || "",
                  titleFont: sectionData.titleFont || appearance.titleFont || "",
                  subtitleFont: sectionData.subtitleFont || appearance.subtitleFont || "",
                };

                // Se for Hero, adiciona campos de botões e badge na aparência
                if (section === "hero" || section === "aboutHero") {
                  const heroApp = subObj.appearance as Record<string, unknown>;
                  heroApp.badgeColor =
                    sectionData.badgeColor || appearance.badgeColor || "";
                  heroApp.badgeTextColor =
                    sectionData.badgeTextColor ||
                    appearance.badgeTextColor ||
                    "";
                  heroApp.badgeFont = sectionData.badgeFont || appearance.badgeFont || "";
                  heroApp.primaryButtonColor =
                    sectionData.primaryButtonColor ||
                    appearance.primaryButtonColor ||
                    "";
                  heroApp.primaryButtonTextColor =
                    sectionData.primaryButtonTextColor ||
                    appearance.primaryButtonTextColor ||
                    "";
                  heroApp.primaryButtonFont =
                    sectionData.primaryButtonFont || appearance.primaryButtonFont || "";
                  heroApp.secondaryButtonColor =
                    sectionData.secondaryButtonColor ||
                    appearance.secondaryButtonColor ||
                    "";
                  heroApp.secondaryButtonTextColor =
                    sectionData.secondaryButtonTextColor ||
                    appearance.secondaryButtonTextColor ||
                    "";
                  heroApp.secondaryButtonFont =
                    sectionData.secondaryButtonFont ||
                    appearance.secondaryButtonFont ||
                    "";
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

                const genericColor =
                  section === "homeValuesSettings" ||
                  section === "aboutUsValuesSettings"
                    ? (sectionData.bgColor as string) || ""
                    : sectionData.primaryButtonColor ||
                      sectionData.cardBgColor ||
                      sectionData.bgColor ||
                      "";
                Object.assign(subObj, {
                  ...sectionData, // Joga todas as propriedades (incluindo camelCase) na raiz
                  // Compatibilidade Snake Case para o Banco de Dados
                  primary_button_color:
                    sectionData.primaryButtonColor || sectionData.primary_button_color,
                  secondary_button_color:
                    sectionData.secondaryButtonColor || sectionData.secondary_button_color,
                  button_text: sectionData.buttonText || sectionData.button_text,
                  button_color: sectionData.buttonColor || sectionData.button_color,
                  button_text_color:
                    sectionData.buttonTextColor || sectionData.button_text_color,
                  button_font: sectionData.buttonFont || sectionData.button_font,
                  button_link: sectionData.buttonLink || sectionData.button_link,
                  title_font: sectionData.titleFont || sectionData.title_font,
                  subtitle_font: sectionData.subtitleFont || sectionData.subtitle_font,
                  card_bg_color: sectionData.cardBgColor || sectionData.card_bg_color,
                  card_background_color:
                    sectionData.cardBgColor || sectionData.card_background_color,
                  cardBackgroundColor:
                    sectionData.cardBgColor || sectionData.cardBackgroundColor,
                  bg_color: sectionData.bgColor || sectionData.bg_color,
                  title_color: sectionData.titleColor || sectionData.title_color,
                  subtitle_color: sectionData.subtitleColor || sectionData.subtitle_color,
                  badge_color: sectionData.badgeColor || sectionData.badge_color,
                  badge_text_color:
                    sectionData.badgeTextColor || sectionData.badge_text_color,
                  color: genericColor,
                  // Adicionado: Chaves específicas que o backend espera converter internamente
                  ...(section === "homeValuesSettings" ? { 
                    values_bg: genericColor,
                    // Garante que o appearance.backgroundColor seja preservado no objeto final
                    appearance: {
                      ...(subObj.appearance as Record<string, unknown>),
                      backgroundColor: genericColor
                    }
                  } : {}),
                  ...(section === "aboutUsValuesSettings" ? { 
                    about_values_bg: genericColor,
                    // Garante que o appearance.backgroundColor seja preservado no objeto final
                    appearance: {
                      ...(subObj.appearance as Record<string, unknown>),
                      backgroundColor: genericColor
                    }
                  } : {}),
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

                    // Suporte para cardConfig exigido pelo backend
                    const cardConfig = {
                      backgroundColor: sectionData.cardBgColor || "",
                      cardBackgroundColor: sectionData.cardBgColor || "",
                      background_color: sectionData.cardBgColor || "",
                      card_background_color: sectionData.cardBgColor || "",
                    };
                    subObj.cardConfig = cardConfig;
                    (sectionData as Record<string, unknown>).cardConfig = cardConfig;
                  }

                  if (
                    section === "galleryPreviewSettings" ||
                    section === "galleryPageSettings"
                  ) {
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
                    content.cardBgColor =
                      (sectionData as Record<string, unknown>).cardBgColor as string || "";

                    // Suporte para cardConfig exigido pelo backend
                    const cardConfig = {
                      backgroundColor:
                        (sectionData as Record<string, unknown>).cardBgColor as string ||
                        "",
                      cardBackgroundColor:
                        (sectionData as Record<string, unknown>).cardBgColor as string ||
                        "",
                      background_color:
                        (sectionData as Record<string, unknown>).cardBgColor as string ||
                        "",
                      card_background_color:
                        (sectionData as Record<string, unknown>).cardBgColor as string ||
                        "",
                    };
                    subObj.cardConfig = cardConfig;
                    (sectionData as Record<string, unknown>).cardConfig = cardConfig;
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

                  if (
                    section === "homeValuesSettings" ||
                    section === "aboutUsValuesSettings"
                  ) {
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

                    // Suporte para cardConfig exigido pelo backend
                    const cardConfig = {
                      backgroundColor: sectionData.cardBgColor || "",
                      cardBackgroundColor: sectionData.cardBgColor || "",
                      background_color: sectionData.cardBgColor || "",
                      card_background_color: sectionData.cardBgColor || "",
                    };
                    subObj.cardConfig = cardConfig;
                    (sectionData as Record<string, unknown>).cardConfig = cardConfig;
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

                    // Novo: Suporte para cardConfig exigido pelo backend
                    const cardConfig = {
                      backgroundColor: sectionData.cardBgColor || "",
                      cardBackgroundColor: sectionData.cardBgColor || "",
                      background_color: sectionData.cardBgColor || "",
                      card_background_color: sectionData.cardBgColor || "",
                    };

                    subObj.cardConfig = cardConfig;
                    // Garantir que o cardConfig também vá para o layoutGlobal.services
                    (sectionData as Record<string, unknown>).cardConfig = cardConfig;
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

                    // Suporte para cardConfig exigido pelo backend
                    const cardConfig = {
                      backgroundColor: sectionData.cardBgColor || "",
                      cardBackgroundColor: sectionData.cardBgColor || "",
                      background_color: sectionData.cardBgColor || "",
                      card_background_color: sectionData.cardBgColor || "",
                    };
                    subObj.cardConfig = cardConfig;
                    (sectionData as Record<string, unknown>).cardConfig = cardConfig;
                  }

                  subObj.content = content;
                }

                sectionData.appearance = subObj.appearance;
                if (subObj.content) {
                  sectionData.content = subObj.content;
                }
              }
            }

            if (!payload.layoutGlobal) payload.layoutGlobal = {};
            const layoutKey = section === "hero" ? "heroBanner" : section;
            (payload.layoutGlobal as Record<string, unknown>)[layoutKey] =
              sectionData;
          }

          // Tratamento especial para fontes e cores globais (Theme)
          const fontData = settings.fontSettings as Record<string, unknown>;
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

          const colorData = settings.colorSettings as Record<string, unknown>;
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
          layoutGlobal.siteColors = normalizedColors;
          layoutGlobal.cores_base = normalizedColors;
          layoutGlobal.color = normalizedColors;

          // Tratar Header/Footer (se não estiverem no loop acima)
          if (!payload.layoutGlobal) payload.layoutGlobal = {};

          // Tratar Visibilidade
          (payload.layoutGlobal as Record<string, unknown>).pageVisibility =
            settings.pageVisibility;
          (payload.layoutGlobal as Record<string, unknown>).visibleSections =
            settings.visibleSections;

          // Tratar Passos de Agendamento
          console.log(
            ">>> [API_SAVE] Mapeando bookingSteps para appointmentFlow:",
            sanitizedBookingSteps,
          );

          payload.appointmentFlow = {
            steps: {
              ...(cleanBookingSteps.service
                ? {
                    service: {
                      ...cleanBookingSteps.service,
                      // Mapeamento de Dualidade (camelCase -> snake_case)
                      card_bg_color: cleanBookingSteps.service.cardBgColor,
                      card_background_color: cleanBookingSteps.service.cardBgColor,
                      cardBackgroundColor: cleanBookingSteps.service.cardBgColor,
                      button_color: cleanBookingSteps.service.buttonColor,
                      title_color: cleanBookingSteps.service.titleColor,
                      subtitle_color: cleanBookingSteps.service.subtitleColor,
                      accent_color: cleanBookingSteps.service.accentColor,
                      bg_color: cleanBookingSteps.service.bgColor,
                      // Suporte para cardConfig exigido pelo backend no fluxo de agendamento
                      cardConfig: {
                        backgroundColor: cleanBookingSteps.service.cardBgColor || "",
                        cardBackgroundColor: cleanBookingSteps.service.cardBgColor || "",
                        background_color: cleanBookingSteps.service.cardBgColor || "",
                        card_background_color: cleanBookingSteps.service.cardBgColor || "",
                      },
                    },
                  }
                : {}),
              ...(cleanBookingSteps.date
                ? {
                    date: {
                      ...cleanBookingSteps.date,
                      // Mapeamento de Dualidade
                      card_bg_color: cleanBookingSteps.date.cardBgColor,
                      card_background_color: cleanBookingSteps.date.cardBgColor,
                      cardBackgroundColor: cleanBookingSteps.date.cardBgColor,
                      title_color: cleanBookingSteps.date.titleColor,
                      subtitle_color: cleanBookingSteps.date.subtitleColor,
                      accent_color: cleanBookingSteps.date.accentColor,
                      bg_color: cleanBookingSteps.date.bgColor,
                      // Suporte para cardConfig
                      cardConfig: {
                        backgroundColor: cleanBookingSteps.date.cardBgColor || "",
                        cardBackgroundColor: cleanBookingSteps.date.cardBgColor || "",
                        background_color: cleanBookingSteps.date.cardBgColor || "",
                        card_background_color: cleanBookingSteps.date.cardBgColor || "",
                      },
                    },
                  }
                : {}),
              ...(cleanBookingSteps.time
                ? {
                    time: {
                      ...cleanBookingSteps.time,
                      // Mapeamento de Dualidade
                      card_bg_color: cleanBookingSteps.time.cardBgColor,
                      card_background_color: cleanBookingSteps.time.cardBgColor,
                      cardBackgroundColor: cleanBookingSteps.time.cardBgColor,
                      title_color: cleanBookingSteps.time.titleColor,
                      subtitle_color: cleanBookingSteps.time.subtitleColor,
                      accent_color: cleanBookingSteps.time.accentColor,
                      bg_color: cleanBookingSteps.time.bgColor,
                      // Suporte para cardConfig
                      cardConfig: {
                        backgroundColor: cleanBookingSteps.time.cardBgColor || "",
                        cardBackgroundColor: cleanBookingSteps.time.cardBgColor || "",
                        background_color: cleanBookingSteps.time.cardBgColor || "",
                        card_background_color: cleanBookingSteps.time.cardBgColor || "",
                      },
                    },
                  }
                : {}),
              ...(cleanBookingSteps.form
                ? {
                    form: {
                      ...cleanBookingSteps.form,
                      // Mapeamento de Dualidade
                      card_bg_color: cleanBookingSteps.form.cardBgColor,
                      card_background_color: cleanBookingSteps.form.cardBgColor,
                      cardBackgroundColor: cleanBookingSteps.form.cardBgColor,
                      title_color: cleanBookingSteps.form.titleColor,
                      subtitle_color: cleanBookingSteps.form.subtitleColor,
                      accent_color: cleanBookingSteps.form.accentColor,
                      bg_color: cleanBookingSteps.form.bgColor,
                      // Suporte para cardConfig
                      cardConfig: {
                        backgroundColor: cleanBookingSteps.form.cardBgColor || "",
                        cardBackgroundColor: cleanBookingSteps.form.cardBgColor || "",
                        background_color: cleanBookingSteps.form.cardBgColor || "",
                        card_background_color: cleanBookingSteps.form.cardBgColor || "",
                      },
                    },
                  }
                : {}),
              ...(cleanBookingSteps.confirmation
                ? {
                    confirmation: {
                      ...cleanBookingSteps.confirmation,
                      // Mapeamento de Dualidade
                      card_bg_color: cleanBookingSteps.confirmation.cardBgColor,
                      card_background_color:
                        cleanBookingSteps.confirmation.cardBgColor,
                      cardBackgroundColor:
                        cleanBookingSteps.confirmation.cardBgColor,
                      title_color: cleanBookingSteps.confirmation.titleColor,
                      subtitle_color: cleanBookingSteps.confirmation.subtitleColor,
                      accent_color: cleanBookingSteps.confirmation.accentColor,
                      bg_color: cleanBookingSteps.confirmation.bgColor,
                      // Suporte para cardConfig
                      cardConfig: {
                        backgroundColor:
                          cleanBookingSteps.confirmation.cardBgColor || "",
                        cardBackgroundColor:
                          cleanBookingSteps.confirmation.cardBgColor || "",
                        background_color:
                          cleanBookingSteps.confirmation.cardBgColor || "",
                        card_background_color:
                          cleanBookingSteps.confirmation.cardBgColor || "",
                      },
                    },
                  }
                : {}),
            },
          };
          if (cleanBookingSteps.service) {
            const appointmentFlow = payload.appointmentFlow as Record<
              string,
              unknown
            >;
            const serviceCardBg = cleanBookingSteps.service.cardBgColor || "#ffffff";
            const existingStep1 =
              (appointmentFlow.step1Services as Record<string, unknown>) || {};
            appointmentFlow.step1Services = {
              ...existingStep1,
              ...cleanBookingSteps.service,
              card_bg_color: serviceCardBg,
              cardBackgroundColor: serviceCardBg,
              bg_color: cleanBookingSteps.service.bgColor,
              accent_color: cleanBookingSteps.service.accentColor,
              cardConfig: {
                backgroundColor: serviceCardBg,
                cardBackgroundColor: serviceCardBg,
                background_color: serviceCardBg,
                card_background_color: serviceCardBg,
              },
            };
          }

          // Adicionalmente, enviamos como bookingSteps para garantir compatibilidade
          payload.bookingSteps = cleanBookingSteps;

          // Limpar o payload de campos undefined para não quebrar o deepMerge do back
          const cleanPayload = JSON.parse(JSON.stringify(payload));

          // Sanitiza o payload antes de enviar para o backend
          const sanitizedPayload = sanitizePayload(cleanPayload);
          console.log("PAYLOAD SENDING TO API:", sanitizedPayload);
          console.log("PAYLOAD_READY", sanitizedPayload);
          console.log(
            ">>> [PAYLOAD FINAL]",
            JSON.stringify(sanitizedPayload, null, 2),
          );

          // 12. LOG DE AUDITORIA (Solicitado pelo usuário: Detalhado antes da chamada API)
          console.log(">>> [AUDIT_LOG] Iniciando persistência de Full Sync no Backend", {
            companyId,
            timestamp: new Date().toISOString(),
            payloadSections: Object.keys(sanitizedPayload.sections || {}),
            payloadLayout: Object.keys(sanitizedPayload.layoutGlobal || {}),
            payloadAppointment: Object.keys(sanitizedPayload.appointmentFlow || {}),
            fullPayload: sanitizedPayload
          });

          const fresh = await siteCustomizerService.saveDraftCustomization(
            companyId,
            sanitizedPayload,
          );

          if (typeof window !== "undefined") {
            if (fresh) {
              // REMOVIDO: clearLocalDrafts(); 
              // Mantemos o localStorage para evitar que o preview resete para o padrão (rosa) 
              // enquanto o studio.config do banco não é atualizado no frontend.
              // O estado isDirty=false já garante que não haverá aviso de alterações não salvas.
              
              // 4. ATUALIZAÇÃO DO ESTADO LAST_SAVED (Sempre que o save no banco der certo)
              setters.setLastSavedHero(sanitizedHero);
              setters.setLastSavedAboutHero(sanitizedAboutHero);
              setters.setLastSavedStory(sanitizedStory);
              setters.setLastSavedTeam(sanitizedTeam);
              setters.setLastSavedTestimonials(sanitizedTestimonials);
              setters.setLastSavedFont(settings.fontSettings);
              setters.setLastSavedColor(settings.colorSettings);
              setters.setLastSavedServices(sanitizedServices);
              setters.setLastSavedHomeValues(sanitizedHomeValues);
              setters.setLastSavedAboutUsValues(sanitizedAboutUsValues);
              setters.setLastSavedGallery(sanitizedGalleryPreview);
              setters.setLastSavedGalleryPage(sanitizedGalleryPage);
              setters.setLastSavedCTA(sanitizedCta);
              setters.setLastSavedHeader(sanitizedHeader);
              setters.setLastSavedFooter(sanitizedFooter);
              setters.setLastSavedPageVisibility(settings.pageVisibility);
              setters.setLastSavedVisibleSections(settings.visibleSections);
              setters.setLastSavedBookingService(cleanBookingSteps.service);
              setters.setLastSavedBookingDate(cleanBookingSteps.date);
              setters.setLastSavedBookingTime(cleanBookingSteps.time);
              setters.setLastSavedBookingForm(cleanBookingSteps.form);
              setters.setLastSavedBookingConfirmation(
                cleanBookingSteps.confirmation,
              );
              
              setIsDirty(false);

              // 5. ATUALIZAÇÃO DO CONTEXTO GLOBAL (Força re-render do site no editor)
              if (updateStudioInfo && fresh) {
                console.log(">>> [SYNC] Atualizando studio.config com os dados salvos.");
                updateStudioInfo({ config: fresh });
              }

              // 6. LIMPEZA DE CACHE DE PREVIEW
              if (typeof localStorage !== "undefined") {
                console.log(">>> [CACHE] Limpando studio-preview-cache...");
                localStorage.removeItem("studio-preview-cache");
                // Limpa também o draft local para garantir sincronia com o banco
                localStorage.removeItem("studio-local-draft");
              }

              console.log(">>> [SYNC] Estado LAST_SAVED atualizado.");
            }
          }

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
        
        // Em modo local, atualizamos o lastSaved para refletir o que foi salvo no localStorage
        setters.setLastSavedHero(sanitizedHero);
        setters.setLastSavedAboutHero(sanitizedAboutHero);
        setters.setLastSavedStory(sanitizedStory);
        setters.setLastSavedTeam(sanitizedTeam);
        setters.setLastSavedTestimonials(sanitizedTestimonials);
        setters.setLastSavedFont(settings.fontSettings);
        setters.setLastSavedColor(settings.colorSettings);
        setters.setLastSavedServices(sanitizedServices);
        setters.setLastSavedHomeValues(sanitizedHomeValues);
        setters.setLastSavedAboutUsValues(sanitizedAboutUsValues);
        setters.setLastSavedGallery(sanitizedGalleryPreview);
        setters.setLastSavedGalleryPage(sanitizedGalleryPage);
        setters.setLastSavedCTA(sanitizedCta);
        setters.setLastSavedHeader(sanitizedHeader);
        setters.setLastSavedFooter(sanitizedFooter);
        setters.setLastSavedPageVisibility(settings.pageVisibility);
        setters.setLastSavedVisibleSections(settings.visibleSections);
        setters.setLastSavedBookingService(cleanBookingSteps.service);
        setters.setLastSavedBookingDate(cleanBookingSteps.date);
        setters.setLastSavedBookingTime(cleanBookingSteps.time);
        setters.setLastSavedBookingForm(cleanBookingSteps.form);
        setters.setLastSavedBookingConfirmation(cleanBookingSteps.confirmation);

        toast({
          title: "Site salvo localmente!",
          description: "As alterações foram salvas no navegador.",
        });
      }

      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
      
      // LOGS DE DEPURAÇÃO PARA IDENTIFICAR POR QUE O BOTÃO DE PUBLICAR PODE ESTAR DESABILITADO
      console.log(">>> [useEditorApi] Fim de handleSaveGlobal. hasUnsavedGlobalChanges:", hasUnsavedGlobalChanges);
    },
    [
      companyId,
      isPublishing,
      setters,
      settings,
      lastSaved,
      toast,
      hasUnsavedGlobalChanges,
      setIsDirty,
      updateStudioInfo,
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
      setters.setLastAppliedHomeValues(settings.homeValuesSettings);
      setters.setLastAppliedAboutUsValues(settings.aboutUsValuesSettings);
      setters.setLastAppliedGallery(settings.gallerySettings);
      setters.setLastAppliedGalleryPage(settings.galleryPageSettings);
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
