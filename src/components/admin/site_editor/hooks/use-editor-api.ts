import { type RefObject, useCallback, useState } from "react";
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
  iframeRef: RefObject<HTMLIFrameElement | null>;
  loadExternalConfig: (config: Record<string, unknown>) => void;
  settings: EditorSettings;
  lastSaved: EditorSavedState;
  lastApplied: EditorAppliedState;
  setters: EditorStateSetters;
  saveLocalDrafts: (drafts: EditorLocalDrafts) => void;
};

export function useEditorApi({
  iframeRef,
  loadExternalConfig,
  settings,
  lastSaved,
  lastApplied,
  setters,
  saveLocalDrafts,
}: UseEditorApiParams) {
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getChangedSettings = useCallback(() => {
    const changes: Partial<SiteConfigData> = {};

    if (JSON.stringify(settings.heroSettings) !== JSON.stringify(lastSaved.lastSavedHero)) {
      changes.hero = settings.heroSettings;
    }
    if (
      JSON.stringify(settings.aboutHeroSettings) !==
      JSON.stringify(lastSaved.lastSavedAboutHero)
    ) {
      changes.aboutHero = settings.aboutHeroSettings;
    }
    if (
      JSON.stringify(settings.storySettings) !==
      JSON.stringify(lastSaved.lastSavedStory)
    ) {
      changes.story = settings.storySettings;
    }
    if (JSON.stringify(settings.teamSettings) !== JSON.stringify(lastSaved.lastSavedTeam)) {
      changes.team = settings.teamSettings;
    }
    if (
      JSON.stringify(settings.testimonialsSettings) !==
      JSON.stringify(lastSaved.lastSavedTestimonials)
    ) {
      changes.testimonials = settings.testimonialsSettings;
    }
    if (JSON.stringify(settings.fontSettings) !== JSON.stringify(lastSaved.lastSavedFont)) {
      changes.theme = settings.fontSettings;
    }
    if (JSON.stringify(settings.colorSettings) !== JSON.stringify(lastSaved.lastSavedColor)) {
      changes.colors = settings.colorSettings;
    }
    if (
      JSON.stringify(settings.servicesSettings) !==
      JSON.stringify(lastSaved.lastSavedServices)
    ) {
      changes.services = settings.servicesSettings;
    }
    if (
      JSON.stringify(settings.valuesSettings) !==
      JSON.stringify(lastSaved.lastSavedValues)
    ) {
      changes.values = settings.valuesSettings;
    }
    if (
      JSON.stringify(settings.gallerySettings) !==
      JSON.stringify(lastSaved.lastSavedGallery)
    ) {
      changes.gallery = settings.gallerySettings;
    }
    if (JSON.stringify(settings.ctaSettings) !== JSON.stringify(lastSaved.lastSavedCTA)) {
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

  const handleSaveGlobal = useCallback(async () => {
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

    if (companyId) {
      setIsSaving(true);
      try {
        const changes = getChangedSettings();
        const payload: Record<string, unknown> = { ...changes };

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

        for (const section of sectionsToGlobal) {
          if (changes[section]) {
            payload.layoutGlobal = {
              ...((payload.layoutGlobal as Record<string, unknown>) || {}),
              [section]: changes[section],
            };
          }
        }

        if (changes.colors) {
          const colors = changes.colors as Record<string, string | undefined>;
          payload.layoutGlobal = {
            ...((payload.layoutGlobal as Record<string, unknown>) || {}),
            siteColors: {
              primary: colors.primary,
              secondary: colors.secondary,
              accent: colors.accent || colors.primary,
              background: colors.background,
              text: colors.text,
              buttonText: colors.buttonText || "#ffffff",
            },
          };
          delete payload.colors;
        }

        if (changes.theme) {
          payload.typography = changes.theme;
          payload.layoutGlobal = {
            ...((payload.layoutGlobal as Record<string, unknown>) || {}),
            fontes: changes.theme,
          };
          delete payload.theme;
        }

        if (changes.visibleSections) {
          payload.layoutGlobal = {
            ...((payload.layoutGlobal as Record<string, unknown>) || {}),
            visibleSections: changes.visibleSections,
          };
          delete payload.visibleSections;
        }

        if (changes.pageVisibility) {
          payload.layoutGlobal = {
            ...((payload.layoutGlobal as Record<string, unknown>) || {}),
            pageVisibility: changes.pageVisibility,
          };
          delete payload.pageVisibility;
        }

        const bookingChanges: Record<string, unknown> = {};
        if (changes.bookingSteps) {
          interface StepConfig {
            bgType?: string;
            bgColor?: string;
            backgroundColor?: string;
            cardBgColor?: string;
            cardConfig?: {
              backgroundColor?: string;
            };
            [key: string]: unknown;
          }
          const steps = changes.bookingSteps as Record<string, StepConfig>;

          if (steps.service) {
            bookingChanges.step1Services = {
              ...steps.service,
              bgType: steps.service.bgType,
              bgColor: steps.service.bgColor,
              cardConfig: {
                backgroundColor:
                  steps.service.cardConfig?.backgroundColor ||
                  steps.service.cardBgColor ||
                  steps.service.backgroundColor ||
                  "#FFFFFF",
              },
            };
          }
          if (steps.date) {
            bookingChanges.step2Dates = {
              ...steps.date,
              bgType: steps.date.bgType,
              bgColor: steps.date.bgColor,
              cardConfig: {
                backgroundColor:
                  steps.date.cardConfig?.backgroundColor ||
                  steps.date.cardBgColor ||
                  steps.date.backgroundColor ||
                  "#FFFFFF",
              },
            };
          }
          if (steps.time) {
            bookingChanges.step3Times = {
              ...steps.time,
              bgType: steps.time.bgType,
              bgColor: steps.time.bgColor,
              cardConfig: {
                backgroundColor:
                  steps.time.cardConfig?.backgroundColor ||
                  steps.time.cardBgColor ||
                  steps.time.backgroundColor ||
                  "#FFFFFF",
              },
            };
          }
          if (steps.form) {
            bookingChanges.step4Form = {
              ...steps.form,
              bgType: steps.form.bgType,
              bgColor: steps.form.bgColor,
              cardConfig: {
                backgroundColor:
                  steps.form.cardConfig?.backgroundColor ||
                  steps.form.cardBgColor ||
                  steps.form.backgroundColor ||
                  "#FFFFFF",
              },
            };
          }
          if (steps.confirmation) {
            bookingChanges.step5Confirmation = {
              ...steps.confirmation,
              bgType: steps.confirmation.bgType,
              bgColor: steps.confirmation.bgColor,
              cardConfig: {
                backgroundColor:
                  steps.confirmation.cardConfig?.backgroundColor ||
                  steps.confirmation.cardBgColor ||
                  steps.confirmation.backgroundColor ||
                  "#FFFFFF",
              },
            };
          }

          delete payload.bookingSteps;
        }

        if (Object.keys(bookingChanges).length > 0) {
          payload.appointmentFlow = {
            ...((payload.appointmentFlow as Record<string, unknown>) || {}),
            ...bookingChanges,
          };
          const currentLayoutGlobal =
            (payload.layoutGlobal as Record<string, unknown>) || {};
          payload.layoutGlobal = {
            ...currentLayoutGlobal,
            bookingSteps: {
              ...((currentLayoutGlobal.bookingSteps as Record<string, unknown>) ||
                {}),
              ...bookingChanges,
            },
          };
        }

        await siteCustomizerService.saveCustomization(companyId, payload);

        try {
          const fresh = await siteCustomizerService.getCustomization(companyId);
          if (fresh) {
            loadExternalConfig(fresh as unknown as Record<string, unknown>);
            const layoutGlobal = fresh.layoutGlobal || fresh.layout_global;
            const freshColors =
              fresh.colors ||
              layoutGlobal?.siteColors ||
              layoutGlobal?.cores_base;
            const freshFonts =
              fresh.theme || fresh.typography || layoutGlobal?.fontes;

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
          }
        } catch (reloadErr) {
          console.warn(
            ">>> [ADMIN_WARN] Falha ao recarregar dados do banco após salvar:",
            reloadErr,
          );
        }

        toast({
          title: "Salvo com sucesso!",
          description: "As alterações foram publicadas no seu site.",
        });
      } catch (err) {
        console.warn(">>> [ADMIN_WARN] Erro ao salvar no backend:", err);
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
      toast({
        title: "Site salvo localmente!",
        description: "As alterações foram salvas no navegador.",
      });
    }

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
    setters.setLastSavedBookingConfirmation(settings.bookingConfirmationSettings);

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
    setters.setLastAppliedBookingConfirmation(settings.bookingConfirmationSettings);

    window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
  }, [
    companyId,
    getChangedSettings,
    iframeRef,
    loadExternalConfig,
    saveLocalDrafts,
    setters,
    settings,
    toast,
  ]);

  const fetchCustomization = useCallback(
    async (id: string) => {
      setCompanyId(id);
      setIsFetching(true);
      setFetchError(null);
      try {
        const data = await siteCustomizerService.getCustomization(id);
        loadExternalConfig(data as unknown as Record<string, unknown>);
      } catch (err) {
        console.warn(">>> [ADMIN_WARN] Falha ao buscar customização:", err);
        setFetchError("Falha ao carregar configurações do site.");
      } finally {
        setIsFetching(false);
      }
    },
    [loadExternalConfig],
  );

  const hasUnsavedGlobalChanges = useCallback(() => {
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
  }, [lastApplied, lastSaved, settings.pageVisibility, settings.visibleSections]);

  return {
    fetchCustomization,
    getChangedSettings,
    handleSaveGlobal,
    hasUnsavedGlobalChanges,
    isFetching,
    fetchError,
    isSaving,
  };
}
