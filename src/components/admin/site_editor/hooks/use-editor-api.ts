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
  clearLocalDrafts,
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

  const handleSaveLocal = useCallback(() => {
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('local_draft_changed'));
    }
  }, [saveLocalDrafts, settings]);

  const handleSaveGlobal = useCallback(
    async () => {
      if (isPublishing) {
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

                if (!payload.layoutGlobal) payload.layoutGlobal = {};
              const layoutKey = section === "hero" ? "heroBanner" : section;
              (payload.layoutGlobal as Record<string, unknown>)[layoutKey] =
                sectionData;

              const dbPath = sectionToDatabasePath[section];
              if (dbPath) {
                const [root, sub] = dbPath.split(".");
                if (!payload[root]) payload[root] = {};
                const rootObj = payload[root] as Record<string, unknown>;

                if (!rootObj[sub]) rootObj[sub] = {};
                const subObj = rootObj[sub] as Record<string, unknown>;

                const appearance = sectionData.appearance as
                  | Record<string, unknown>
                  | undefined;

                subObj.appearance = {
                  ...(appearance || {}),
                  backgroundImageUrl:
                    sectionData.bgImage || appearance?.backgroundImageUrl || "",
                  showBackgroundImage: sectionData.bgType === "image",
                  backgroundColor:
                    (sectionData.bgColor as string) ||
                    (appearance?.backgroundColor as string) ||
                    "",
                  overlayOpacity:
                    typeof sectionData.overlayOpacity === "number"
                      ? sectionData.overlayOpacity
                      : appearance?.overlayOpacity ?? 0.5,
                };

                subObj.bgType = sectionData.bgType || "color";
                subObj.bgColor =
                  (sectionData.bgColor as string) ||
                  (appearance?.backgroundColor as string) ||
                  "";
                subObj.bgImage =
                  sectionData.bgImage || appearance?.backgroundImageUrl || "";

                // Mapeamento de conteúdo específico por seção
                const content: Record<string, unknown> = {
                  title:
                    typeof sectionData.title === "string"
                      ? sectionData.title
                      : "",
                  subtitle:
                    typeof sectionData.subtitle === "string"
                      ? sectionData.subtitle
                      : "",
                  titleFont: sectionData.titleFont || "",
                  titleColor: sectionData.titleColor || "",
                  subtitleFont: sectionData.subtitleFont || "",
                  subtitleColor: sectionData.subtitleColor || "",
                };

                // Campos extras para Hero
                if (section === "hero" || section === "aboutHero") {
                  content.badge = sectionData.badge || "";
                  content.showBadge = sectionData.showBadge ?? true;
                  content.primaryButton = sectionData.primaryButton || "";
                  content.secondaryButton = sectionData.secondaryButton || "";
                }

                // Campos extras para Story
                if (section === "story") {
                  content.text = sectionData.content || "";
                  content.image = sectionData.image || "";
                }

                // Campos extras para Depoimentos
                if (section === "testimonials") {
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

                // Campos extras para Galeria
                if (section === "gallery") {
                  content.buttonText = sectionData.buttonText || "";
                  content.buttonFont = sectionData.buttonFont || "";
                  content.buttonColor = sectionData.buttonColor || "";
                  content.buttonTextColor = sectionData.buttonTextColor || "";
                  content.layout = sectionData.layout || "grid";
                  content.columns = sectionData.columns || 3;
                  content.gap = sectionData.gap || 16;
                  content.aspectRatio = sectionData.aspectRatio || "square";
                }

                // Campos extras para CTA
                if (section === "cta") {
                  content.buttonText = sectionData.buttonText || "";
                  content.buttonFont = sectionData.buttonFont || "";
                  content.buttonColor = sectionData.buttonColor || "";
                  content.buttonTextColor = sectionData.buttonTextColor || "";
                  content.alignment = sectionData.alignment || "center";
                }

                // Campos extras para Valores
                if (section === "values") {
                  content.items = sectionData.items || [];
                  content.cardBgColor = sectionData.cardBgColor || "";
                  content.cardTitleFont = sectionData.cardTitleFont || "";
                  content.cardTitleColor = sectionData.cardTitleColor || "";
                  content.cardDescriptionFont =
                    sectionData.cardDescriptionFont || "";
                  content.cardDescriptionColor =
                    sectionData.cardDescriptionColor || "";
                  content.cardIconColor = sectionData.cardIconColor || "";
                }

                // Campos extras para Serviços
                if (section === "services") {
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
                }

                // Campos extras para Equipe
                if (section === "team") {
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
            }
          }

          // Tratamento especial para fontes e cores globais (Theme)
          if (changes.theme) {
            const fontData = changes.theme as Record<string, unknown>;
            if (!payload.theme) payload.theme = {};
            (payload.theme as Record<string, unknown>).fonts = {
              primary: fontData.primaryFont || "",
              secondary: fontData.secondaryFont || "",
              accent: fontData.accentFont || "",
            };
          }

          if (changes.colors) {
            const colorData = changes.colors as Record<string, unknown>;
            if (!payload.theme) payload.theme = {};
            (payload.theme as Record<string, unknown>).colors = {
              primary: colorData.primaryColor || "",
              secondary: colorData.secondaryColor || "",
              accent: colorData.accentColor || "",
              background: colorData.backgroundColor || "",
              text: colorData.textColor || "",
            };
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
            payload.pageVisibility = changes.pageVisibility;
          }
          if (changes.visibleSections) {
            payload.visibleSections = changes.visibleSections;
          }

          // Tratar Passos de Agendamento
          if (changes.bookingSteps) {
            payload.appointmentFlow = {
              steps: {
                ...(changes.bookingSteps.service ? { service: changes.bookingSteps.service } : {}),
                ...(changes.bookingSteps.date ? { date: changes.bookingSteps.date } : {}),
                ...(changes.bookingSteps.time ? { time: changes.bookingSteps.time } : {}),
                ...(changes.bookingSteps.form ? { form: changes.bookingSteps.form } : {}),
                ...(changes.bookingSteps.confirmation ? { confirmation: changes.bookingSteps.confirmation } : {}),
              }
            };
          }

          // Limpar o payload de campos undefined para não quebrar o deepMerge do back
          const cleanPayload = JSON.parse(JSON.stringify(payload));

          console.log(">>> [useEditorApi] Payload final limpo para PATCH:", cleanPayload);

          const fresh = await siteCustomizerService.saveDraftCustomization( 
            companyId, 
            cleanPayload, 
          ); 

          console.log(">>> [SYNC] Rascunho salvo. Iniciando limpeza de caches locais..."); 

          // 1. LIMPEZA RADICAL DE CACHE LOCAL 
          if (typeof window !== "undefined") { 
            localStorage.removeItem("studio_data"); 
            localStorage.removeItem(`site_draft_${companyId}`); 
            
            try { 
              // Verifica se a função existe no contexto do hook ou utilitário local 
              if (typeof clearLocalDrafts === "function") { 
                clearLocalDrafts(); 
              } 
            } catch (_e) { 
              console.warn("Aviso: Falha ao limpar rascunhos locais, prosseguindo..."); 
            } 
          } 
 
          // 2. ATUALIZAÇÃO DO ESTADO VISUAL COM DADOS CONFIRMADOS 
          if (fresh) { 
            if (typeof loadExternalConfig === "function") { 
              loadExternalConfig(fresh, true); 
            } 
 
            if (typeof window !== "undefined") { 
              localStorage.setItem("studio_data", JSON.stringify(fresh)); 
            }
          } 
 
          // 3. FINALIZAÇÃO DO FLUXO 
          if (typeof handleSaveLocal === "function") handleSaveLocal(); 
          setIsSaving(false); 
          
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

      window.dispatchEvent(new CustomEvent("storySettingsUpdated"));
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
      clearLocalDrafts,
    ],
  );

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
        await handleSaveGlobal(); // Salva sem recarregar do banco ainda
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
  ]);

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
        handleSaveGlobal();
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
