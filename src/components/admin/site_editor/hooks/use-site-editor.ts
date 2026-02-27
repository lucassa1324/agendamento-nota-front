import { type RefObject, useCallback, useEffect, useMemo } from "react";
import { useStudio } from "@/context/studio-context";
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
  normalizeStepSettings,
} from "@/lib/booking-data";
import type {
  LayoutGlobalSettings,
  SiteConfigData,
} from "@/lib/site-config-types";
import { useEditorApi } from "./use-editor-api";
import { useEditorLocal } from "./use-editor-local";
import { useEditorState } from "./use-editor-state";

export type { LayoutGlobalSettings, SiteConfigData };

export function useSiteEditor(iframeRef: RefObject<HTMLIFrameElement | null>) {
  const { toast } = useToast();
  const { studio } = useStudio();
  const local = useEditorLocal();
  const state = useEditorState();
  const {
    hasLocalDraft,
    loadLocalDrafts,
    saveLocalDrafts,
    saveHeroSettings,
    saveAboutHeroSettings,
    saveStorySettings,
    saveTeamSettings,
    saveTestimonialsSettings,
    saveFontSettings,
    saveColorSettings,
    saveServicesSettings,
    saveValuesSettings,
    saveGallerySettings,
    saveCTASettings,
    saveHeaderSettings,
    saveFooterSettings,
    savePageVisibility,
    saveVisibleSections,
    saveBookingServiceSettings,
    saveBookingDateSettings,
    saveBookingTimeSettings,
    saveBookingFormSettings,
    saveBookingConfirmationSettings,
  } = local;

  const {
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
    handleUpdateBookingService: handleUpdateBookingServiceState,
    handleUpdateBookingDate: handleUpdateBookingDateState,
    handleUpdateBookingTime: handleUpdateBookingTimeState,
    handleUpdateBookingForm: handleUpdateBookingFormState,
    handleUpdateBookingConfirmation: handleUpdateBookingConfirmationState,
    handlePageVisibilityChange,
    handleSectionVisibilityToggle,
  } = state;

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

  const loadExternalConfig = useCallback(
    (config: Record<string, unknown>) => {
      if (!config) return;
      console.log(
        "[useSiteEditor] loadExternalConfig iniciada com config:",
        config,
      );
      const drafts = loadLocalDrafts();
      console.log("[useSiteEditor] Rascunhos locais carregados:", drafts);

      const layoutGlobal = (config.layoutGlobal || config.layout_global) as
        | Record<string, unknown>
        | undefined;

      const data = {
        ...config,
        hero: (layoutGlobal?.hero || config.hero) as HeroSettings | undefined,
        aboutHero: (layoutGlobal?.aboutHero || config.aboutHero) as
          | HeroSettings
          | undefined,
        story: (layoutGlobal?.story || config.story) as
          | StorySettings
          | undefined,
        team: (layoutGlobal?.team || config.team) as TeamSettings | undefined,
        testimonials: (layoutGlobal?.testimonials || config.testimonials) as
          | TestimonialsSettings
          | undefined,
        services: (layoutGlobal?.services || config.services) as
          | ServicesSettings
          | undefined,
        values: (layoutGlobal?.values || config.values) as
          | ValuesSettings
          | undefined,
        gallery: (layoutGlobal?.gallery || config.gallery) as
          | GallerySettings
          | undefined,
        cta: (layoutGlobal?.cta || config.cta) as CTASettings | undefined,
        header: (layoutGlobal?.header || config.header) as
          | HeaderSettings
          | undefined,
        footer: (layoutGlobal?.footer || config.footer) as
          | FooterSettings
          | undefined,
        colors: (layoutGlobal?.siteColors ||
          layoutGlobal?.cores_base ||
          config.colors) as ColorSettings | undefined,
        theme: (layoutGlobal?.fontes || config.theme || config.typography) as
          | FontSettings
          | undefined,
        visibleSections: (layoutGlobal?.visibleSections ||
          config.visibleSections) as Record<string, boolean> | undefined,
        pageVisibility: (layoutGlobal?.pageVisibility ||
          config.pageVisibility) as Record<string, boolean> | undefined,
        bookingSteps: config.bookingSteps as
          | {
              service?: Record<string, unknown>;
              date?: Record<string, unknown>;
              time?: Record<string, unknown>;
              form?: Record<string, unknown>;
              confirmation?: Record<string, unknown>;
            }
          | undefined,
      } as SiteConfigData;

      const useLocalHero = hasLocalDraft("heroSettings");
      if (data.hero) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedHero com dados da API: ${JSON.stringify(
            data.hero,
          )}`,
        );
        setLastSavedHero(data.hero);
      }
      if (useLocalHero) {
        console.log(
          `[useSiteEditor] Hero: Usando rascunho local: ${JSON.stringify(
            drafts.heroSettings,
          )}`,
        );
        setHeroSettings(drafts.heroSettings);
        setLastAppliedHero(drafts.heroSettings);
      } else if (data.hero) {
        console.log(
          `[useSiteEditor] Hero: Usando dados da API: ${JSON.stringify(
            data.hero,
          )}`,
        );
        setHeroSettings(data.hero);
        setLastAppliedHero(data.hero);
        saveHeroSettings(data.hero);
      }

      const useLocalAboutHero = hasLocalDraft("aboutHeroSettings");
      if (data.aboutHero) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedAboutHero com dados da API: ${JSON.stringify(
            data.aboutHero,
          )}`,
        );
        setLastSavedAboutHero(data.aboutHero);
      }
      if (useLocalAboutHero) {
        console.log(
          `[useSiteEditor] About Hero: Usando rascunho local: ${JSON.stringify(
            drafts.aboutHeroSettings,
          )}`,
        );
        setAboutHeroSettings(drafts.aboutHeroSettings);
        setLastAppliedAboutHero(drafts.aboutHeroSettings);
      } else if (data.aboutHero) {
        console.log(
          `[useSiteEditor] About Hero: Usando dados da API: ${JSON.stringify(
            data.aboutHero,
          )}`,
        );
        setAboutHeroSettings(data.aboutHero);
        setLastAppliedAboutHero(data.aboutHero);
        saveAboutHeroSettings(data.aboutHero);
      }

      const useLocalStory = hasLocalDraft("storySettings");
      if (data.story) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedStory com dados da API: ${JSON.stringify(
            data.story,
          )}`,
        );
        setLastSavedStory(data.story);
      }
      if (useLocalStory) {
        console.log(
          `[useSiteEditor] Story: Usando rascunho local: ${JSON.stringify(
            drafts.storySettings,
          )}`,
        );
        setStorySettings(drafts.storySettings);
        setLastAppliedStory(drafts.storySettings);
      } else if (data.story) {
        console.log(
          `[useSiteEditor] Story: Usando dados da API: ${JSON.stringify(
            data.story,
          )}`,
        );
        setStorySettings(data.story);
        setLastAppliedStory(data.story);
        saveStorySettings(data.story);
      }

      const useLocalTeam = hasLocalDraft("teamSettings");
      if (data.team) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedTeam com dados da API: ${JSON.stringify(
            data.team,
          )}`,
        );
        setLastSavedTeam(data.team);
      }
      if (useLocalTeam) {
        console.log(
          `[useSiteEditor] Team: Usando rascunho local: ${JSON.stringify(
            drafts.teamSettings,
          )}`,
        );
        setTeamSettings(drafts.teamSettings);
        setLastAppliedTeam(drafts.teamSettings);
      } else if (data.team) {
        console.log(
          `[useSiteEditor] Team: Usando dados da API: ${JSON.stringify(
            data.team,
          )}`,
        );
        setTeamSettings(data.team);
        setLastAppliedTeam(data.team);
        saveTeamSettings(data.team);
      }

      const useLocalTestimonials = hasLocalDraft("testimonialsSettings");
      if (data.testimonials) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedTestimonials com dados da API: ${JSON.stringify(
            data.testimonials,
          )}`,
        );
        setLastSavedTestimonials(data.testimonials);
      }
      if (useLocalTestimonials) {
        console.log(
          `[useSiteEditor] Testimonials: Usando rascunho local: ${JSON.stringify(
            drafts.testimonialsSettings,
          )}`,
        );
        setTestimonialsSettings(drafts.testimonialsSettings);
        setLastAppliedTestimonials(drafts.testimonialsSettings);
      } else if (data.testimonials) {
        console.log(
          `[useSiteEditor] Testimonials: Usando dados da API: ${JSON.stringify(
            data.testimonials,
          )}`,
        );
        setTestimonialsSettings(data.testimonials);
        setLastAppliedTestimonials(data.testimonials);
        saveTestimonialsSettings(data.testimonials);
      }

      const useLocalFont = hasLocalDraft("fontSettings");
      if (data.theme) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedFont com dados da API: ${JSON.stringify(
            data.theme,
          )}`,
        );
        setLastSavedFont(data.theme);
      }
      if (useLocalFont) {
        console.log(
          `[useSiteEditor] Font: Usando rascunho local: ${JSON.stringify(
            drafts.fontSettings,
          )}`,
        );
        setFontSettings(drafts.fontSettings);
        setLastAppliedFont(drafts.fontSettings);
      } else if (data.theme) {
        console.log(
          `[useSiteEditor] Font: Usando dados da API: ${JSON.stringify(
            data.theme,
          )}`,
        );
        setFontSettings(data.theme);
        setLastAppliedFont(data.theme);
        saveFontSettings(data.theme);
      }

      const useLocalColors = hasLocalDraft("colorSettings");
      if (data.colors) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedColor com dados da API: ${JSON.stringify(
            data.colors,
          )}`,
        );
        setLastSavedColor(data.colors);
      }
      if (useLocalColors) {
        console.log(
          `[useSiteEditor] Colors: Usando rascunho local: ${JSON.stringify(
            drafts.colorSettings,
          )}`,
        );
        setColorSettings(drafts.colorSettings);
        setLastAppliedColor(drafts.colorSettings);
      } else if (data.colors) {
        console.log(
          `[useSiteEditor] Colors: Usando dados da API: ${JSON.stringify(
            data.colors,
          )}`,
        );
        setColorSettings(data.colors);
        setLastAppliedColor(data.colors);
        saveColorSettings(data.colors);
      }

      const useLocalServices = hasLocalDraft("servicesSettings");
      if (data.services) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedServices com dados da API: ${JSON.stringify(
            data.services,
          )}`,
        );
        setLastSavedServices(data.services);
      }
      if (useLocalServices) {
        console.log(
          `[useSiteEditor] Services: Usando rascunho local: ${JSON.stringify(
            drafts.servicesSettings,
          )}`,
        );
        setServicesSettings(drafts.servicesSettings);
        setLastAppliedServices(drafts.servicesSettings);
      } else if (data.services) {
        console.log(
          `[useSiteEditor] Services: Usando dados da API: ${JSON.stringify(
            data.services,
          )}`,
        );
        setServicesSettings(data.services);
        setLastAppliedServices(data.services);
        saveServicesSettings(data.services);
      }

      const useLocalValues = hasLocalDraft("valuesSettings");
      if (data.values) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedValues com dados da API: ${JSON.stringify(
            data.values,
          )}`,
        );
        setLastSavedValues(data.values);
      }
      if (useLocalValues) {
        console.log(
          `[useSiteEditor] Values: Usando rascunho local: ${JSON.stringify(
            drafts.valuesSettings,
          )}`,
        );
        setValuesSettings(drafts.valuesSettings);
        setLastAppliedValues(drafts.valuesSettings);
      } else if (data.values) {
        console.log(
          `[useSiteEditor] Values: Usando dados da API: ${JSON.stringify(
            data.values,
          )}`,
        );
        setValuesSettings(data.values);
        setLastAppliedValues(data.values);
        saveValuesSettings(data.values);
      }

      const useLocalGallery = hasLocalDraft("gallerySettings");
      if (data.gallery) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedGallery com dados da API: ${JSON.stringify(
            data.gallery,
          )}`,
        );
        setLastSavedGallery(data.gallery);
      }
      if (useLocalGallery) {
        console.log(
          `[useSiteEditor] Gallery: Usando rascunho local: ${JSON.stringify(
            drafts.gallerySettings,
          )}`,
        );
        setGallerySettings(drafts.gallerySettings);
        setLastAppliedGallery(drafts.gallerySettings);
      } else if (data.gallery) {
        console.log(
          `[useSiteEditor] Gallery: Usando dados da API: ${JSON.stringify(
            data.gallery,
          )}`,
        );
        setGallerySettings(data.gallery);
        setLastAppliedGallery(data.gallery);
        saveGallerySettings(data.gallery);
      }

      const useLocalCTA = hasLocalDraft("ctaSettings");
      if (data.cta) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedCTA com dados da API: ${JSON.stringify(
            data.cta,
          )}`,
        );
        setLastSavedCTA(data.cta);
      }
      if (useLocalCTA) {
        console.log(
          `[useSiteEditor] CTA: Usando rascunho local: ${JSON.stringify(
            drafts.ctaSettings,
          )}`,
        );
        setCTASettings(drafts.ctaSettings);
        setLastAppliedCTA(drafts.ctaSettings);
      } else if (data.cta) {
        console.log(
          `[useSiteEditor] CTA: Usando dados da API: ${JSON.stringify(
            data.cta,
          )}`,
        );
        setCTASettings(data.cta);
        setLastAppliedCTA(data.cta);
        saveCTASettings(data.cta);
      }

      const useLocalHeader = hasLocalDraft("headerSettings");
      if (data.header) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedHeader com dados da API: ${JSON.stringify(
            data.header,
          )}`,
        );
        setLastSavedHeader(data.header);
      }
      if (useLocalHeader) {
        console.log(
          `[useSiteEditor] Header: Usando rascunho local: ${JSON.stringify(
            drafts.headerSettings,
          )}`,
        );
        setHeaderSettings(drafts.headerSettings);
        setLastAppliedHeader(drafts.headerSettings);
      } else if (data.header) {
        console.log(
          `[useSiteEditor] Header: Usando dados da API: ${JSON.stringify(
            data.header,
          )}`,
        );
        setHeaderSettings(data.header);
        setLastAppliedHeader(data.header);
        saveHeaderSettings(data.header);
      }

      const useLocalFooter = hasLocalDraft("footerSettings");
      if (data.footer) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedFooter com dados da API: ${JSON.stringify(
            data.footer,
          )}`,
        );
        setLastSavedFooter(data.footer);
      }
      if (useLocalFooter) {
        console.log(
          `[useSiteEditor] Footer: Usando rascunho local: ${JSON.stringify(
            drafts.footerSettings,
          )}`,
        );
        setFooterSettings(drafts.footerSettings);
        setLastAppliedFooter(drafts.footerSettings);
      } else if (data.footer) {
        console.log(
          `[useSiteEditor] Footer: Usando dados da API: ${JSON.stringify(
            data.footer,
          )}`,
        );
        setFooterSettings(data.footer);
        setLastAppliedFooter(data.footer);
        saveFooterSettings(data.footer);
      }

      if (data.bookingSteps) {
        const steps = data.bookingSteps;

        // Service Step
        if (steps.service) {
          console.log(
            `[useSiteEditor] Atualizando lastSavedBookingService com dados da API: ${JSON.stringify(
              steps.service,
            )}`,
          );
          setLastSavedBookingService(steps.service);
        }
        if (hasLocalDraft("bookingServiceSettings")) {
          console.log(
            `[useSiteEditor] Booking Service: Usando rascunho local: ${JSON.stringify(
              drafts.bookingServiceSettings,
            )}`,
          );
          setBookingServiceSettings(drafts.bookingServiceSettings);
          setLastAppliedBookingService(drafts.bookingServiceSettings);
        } else if (steps.service) {
          console.log(
            `[useSiteEditor] Booking Service: Usando dados da API: ${JSON.stringify(
              steps.service,
            )}`,
          );
          setBookingServiceSettings(steps.service);
          setLastAppliedBookingService(steps.service);
          saveBookingServiceSettings(steps.service);
        }

        // Date Step
        if (steps.date) {
          console.log(
            `[useSiteEditor] Atualizando lastSavedBookingDate com dados da API: ${JSON.stringify(
              steps.date,
            )}`,
          );
          setLastSavedBookingDate(steps.date);
        }
        if (hasLocalDraft("bookingDateSettings")) {
          console.log(
            `[useSiteEditor] Booking Date: Usando rascunho local: ${JSON.stringify(
              drafts.bookingDateSettings,
            )}`,
          );
          setBookingDateSettings(drafts.bookingDateSettings);
          setLastAppliedBookingDate(drafts.bookingDateSettings);
        } else if (steps.date) {
          console.log(
            `[useSiteEditor] Booking Date: Usando dados da API: ${JSON.stringify(
              steps.date,
            )}`,
          );
          setBookingDateSettings(steps.date);
          setLastAppliedBookingDate(steps.date);
          saveBookingDateSettings(steps.date);
        }

        // Time Step
        if (steps.time) {
          console.log(
            `[useSiteEditor] Atualizando lastSavedBookingTime com dados da API: ${JSON.stringify(
              steps.time,
            )}`,
          );
          setLastSavedBookingTime(steps.time);
        }
        if (hasLocalDraft("bookingTimeSettings")) {
          console.log(
            `[useSiteEditor] Booking Time: Usando rascunho local: ${JSON.stringify(
              drafts.bookingTimeSettings,
            )}`,
          );
          setBookingTimeSettings(drafts.bookingTimeSettings);
          setLastAppliedBookingTime(drafts.bookingTimeSettings);
        } else if (steps.time) {
          console.log(
            `[useSiteEditor] Booking Time: Usando dados da API: ${JSON.stringify(
              steps.time,
            )}`,
          );
          setBookingTimeSettings(steps.time);
          setLastAppliedBookingTime(steps.time);
          saveBookingTimeSettings(steps.time);
        }

        // Form Step
        if (steps.form) {
          console.log(
            `[useSiteEditor] Atualizando lastSavedBookingForm com dados da API: ${JSON.stringify(
              steps.form,
            )}`,
          );
          setLastSavedBookingForm(steps.form);
        }
        if (hasLocalDraft("bookingFormSettings")) {
          console.log(
            `[useSiteEditor] Booking Form: Usando rascunho local: ${JSON.stringify(
              drafts.bookingFormSettings,
            )}`,
          );
          setBookingFormSettings(drafts.bookingFormSettings);
          setLastAppliedBookingForm(drafts.bookingFormSettings);
        } else if (steps.form) {
          console.log(
            `[useSiteEditor] Booking Form: Usando dados da API: ${JSON.stringify(
              steps.form,
            )}`,
          );
          setBookingFormSettings(steps.form);
          setLastAppliedBookingForm(steps.form);
          saveBookingFormSettings(steps.form);
        }

        // Confirmation Step
        if (steps.confirmation) {
          console.log(
            `[useSiteEditor] Atualizando lastSavedBookingConfirmation com dados da API: ${JSON.stringify(
              steps.confirmation,
            )}`,
          );
          setLastSavedBookingConfirmation(steps.confirmation);
        }
        if (hasLocalDraft("bookingConfirmationSettings")) {
          console.log(
            `[useSiteEditor] Booking Confirmation: Usando rascunho local: ${JSON.stringify(
              drafts.bookingConfirmationSettings,
            )}`,
          );
          setBookingConfirmationSettings(drafts.bookingConfirmationSettings);
          setLastAppliedBookingConfirmation(drafts.bookingConfirmationSettings);
        } else if (steps.confirmation) {
          console.log(
            `[useSiteEditor] Booking Confirmation: Usando dados da API: ${JSON.stringify(
              steps.confirmation,
            )}`,
          );
          setBookingConfirmationSettings(steps.confirmation);
          setLastAppliedBookingConfirmation(steps.confirmation);
          saveBookingConfirmationSettings(steps.confirmation);
        }
      }

      const useLocalPageVisibility = hasLocalDraft("pageVisibility");
      if (data.pageVisibility) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedPageVisibility com dados da API: ${JSON.stringify(
            data.pageVisibility,
          )}`,
        );
        setLastSavedPageVisibility(data.pageVisibility);
      }
      if (useLocalPageVisibility) {
        console.log(
          `[useSiteEditor] Page Visibility: Usando rascunho local: ${JSON.stringify(
            drafts.pageVisibility,
          )}`,
        );
        setPageVisibility(drafts.pageVisibility);
      } else if (data.pageVisibility) {
        console.log(
          `[useSiteEditor] Page Visibility: Usando dados da API: ${JSON.stringify(
            data.pageVisibility,
          )}`,
        );
        setPageVisibility(data.pageVisibility);
        savePageVisibility(data.pageVisibility);
      }

      const useLocalVisibleSections = hasLocalDraft("visibleSections");
      if (data.visibleSections) {
        console.log(
          `[useSiteEditor] Atualizando lastSavedVisibleSections com dados da API: ${JSON.stringify(
            data.visibleSections,
          )}`,
        );
        setLastSavedVisibleSections(data.visibleSections);
      }
      if (useLocalVisibleSections) {
        console.log(
          `[useSiteEditor] Visible Sections: Usando rascunho local: ${JSON.stringify(
            drafts.visibleSections,
          )}`,
        );
        setVisibleSections(drafts.visibleSections);
      } else if (data.visibleSections) {
        console.log(
          `[useSiteEditor] Visible Sections: Usando dados da API: ${JSON.stringify(
            data.visibleSections,
          )}`,
        );
        setVisibleSections(data.visibleSections);
        saveVisibleSections(data.visibleSections);
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("DataReady"));
      }
    },
    [
      loadLocalDrafts,
      hasLocalDraft,
      setLastSavedHero,
      setHeroSettings,
      setLastAppliedHero,
      saveHeroSettings,
      setLastSavedAboutHero,
      setAboutHeroSettings,
      setLastAppliedAboutHero,
      saveAboutHeroSettings,
      setLastSavedStory,
      setStorySettings,
      setLastAppliedStory,
      saveStorySettings,
      setLastSavedTeam,
      setTeamSettings,
      setLastAppliedTeam,
      saveTeamSettings,
      setLastSavedTestimonials,
      setTestimonialsSettings,
      setLastAppliedTestimonials,
      saveTestimonialsSettings,
      setLastSavedFont,
      setFontSettings,
      setLastAppliedFont,
      saveFontSettings,
      setLastSavedColor,
      setColorSettings,
      setLastAppliedColor,
      saveColorSettings,
      setLastSavedServices,
      setServicesSettings,
      setLastAppliedServices,
      saveServicesSettings,
      setLastSavedValues,
      setValuesSettings,
      setLastAppliedValues,
      saveValuesSettings,
      setLastSavedGallery,
      setGallerySettings,
      setLastAppliedGallery,
      saveGallerySettings,
      setLastSavedCTA,
      setCTASettings,
      setLastAppliedCTA,
      saveCTASettings,
      setLastSavedHeader,
      setHeaderSettings,
      setLastAppliedHeader,
      saveHeaderSettings,
      setLastSavedFooter,
      setFooterSettings,
      setLastAppliedFooter,
      saveFooterSettings,
      setLastSavedBookingService,
      setBookingServiceSettings,
      setLastAppliedBookingService,
      saveBookingServiceSettings,
      setLastSavedBookingDate,
      setBookingDateSettings,
      setLastAppliedBookingDate,
      saveBookingDateSettings,
      setLastSavedBookingTime,
      setBookingTimeSettings,
      setLastAppliedBookingTime,
      saveBookingTimeSettings,
      setLastSavedBookingForm,
      setBookingFormSettings,
      setLastAppliedBookingForm,
      saveBookingFormSettings,
      setLastSavedBookingConfirmation,
      setBookingConfirmationSettings,
      setLastAppliedBookingConfirmation,
      saveBookingConfirmationSettings,
      setLastSavedPageVisibility,
      setPageVisibility,
      savePageVisibility,
      setLastSavedVisibleSections,
      setVisibleSections,
      saveVisibleSections,
    ],
  );

  useEffect(() => {
    console.log("[useSiteEditor] useEffect inicial: Carregando rascunhos...");
    const drafts = loadLocalDrafts();
    console.log("[useSiteEditor] Rascunhos iniciais carregados:", drafts);

    setHeroSettings(drafts.heroSettings);
    setAboutHeroSettings(drafts.aboutHeroSettings);
    setStorySettings(drafts.storySettings);
    setTeamSettings(drafts.teamSettings);
    setTestimonialsSettings(drafts.testimonialsSettings);
    setFontSettings(drafts.fontSettings);
    setColorSettings(drafts.colorSettings);
    setServicesSettings(drafts.servicesSettings);
    setValuesSettings(drafts.valuesSettings);
    setGallerySettings(drafts.gallerySettings);
    setCTASettings(drafts.ctaSettings);
    setHeaderSettings(drafts.headerSettings);
    setFooterSettings(drafts.footerSettings);
    setPageVisibility(drafts.pageVisibility);
    setVisibleSections(drafts.visibleSections);

    setBookingServiceSettings(drafts.bookingServiceSettings);
    setBookingDateSettings(drafts.bookingDateSettings);
    setBookingTimeSettings(drafts.bookingTimeSettings);
    setBookingFormSettings(drafts.bookingFormSettings);
    setBookingConfirmationSettings(drafts.bookingConfirmationSettings);

    setLastAppliedHero(drafts.heroSettings);
    setLastAppliedAboutHero(drafts.aboutHeroSettings);
    setLastAppliedStory(drafts.storySettings);
    setLastAppliedTeam(drafts.teamSettings);
    setLastAppliedTestimonials(drafts.testimonialsSettings);
    setLastAppliedFont(drafts.fontSettings);
    setLastAppliedColor(drafts.colorSettings);
    setLastAppliedServices(drafts.servicesSettings);
    setLastAppliedValues(drafts.valuesSettings);
    setLastAppliedGallery(drafts.gallerySettings);
    setLastAppliedCTA(drafts.ctaSettings);
    setLastAppliedHeader(drafts.headerSettings);
    setLastAppliedFooter(drafts.footerSettings);

    setLastAppliedBookingService(drafts.bookingServiceSettings);
    setLastAppliedBookingDate(drafts.bookingDateSettings);
    setLastAppliedBookingTime(drafts.bookingTimeSettings);
    setLastAppliedBookingForm(drafts.bookingFormSettings);
    setLastAppliedBookingConfirmation(drafts.bookingConfirmationSettings);

    if (studio?.config) {
      console.log(
        "[useSiteEditor] studio?.config detectado no useEffect inicial, chamando loadExternalConfig",
      );
      loadExternalConfig(studio.config as Record<string, unknown>);
    } else {
      // Forçar re-aplicação de cores e fontes para garantir que o rascunho seja injetado
      // caso o loadExternalConfig não seja chamado (ex: navegação sem mudança de config)
      const freshDrafts = loadLocalDrafts();
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "UPDATE_COLORS", settings: freshDrafts.colorSettings },
          "*",
        );
        iframeRef.current.contentWindow.postMessage(
          { type: "UPDATE_TYPOGRAPHY", settings: freshDrafts.fontSettings },
          "*",
        );
      }
    }
  }, [
    studio?.config,
    loadExternalConfig,
    loadLocalDrafts,
    setAboutHeroSettings,
    setBookingConfirmationSettings,
    setBookingDateSettings,
    setBookingFormSettings,
    setBookingServiceSettings,
    setBookingTimeSettings,
    setCTASettings,
    setColorSettings,
    setFooterSettings,
    setGallerySettings,
    setHeaderSettings,
    setHeroSettings,
    setLastAppliedAboutHero,
    setLastAppliedBookingConfirmation,
    setLastAppliedBookingDate,
    setLastAppliedBookingForm,
    setLastAppliedBookingService,
    setLastAppliedBookingTime,
    setLastAppliedCTA,
    setLastAppliedColor,
    setLastAppliedFont,
    setLastAppliedFooter,
    setLastAppliedGallery,
    setLastAppliedHeader,
    setLastAppliedHero,
    setLastAppliedServices,
    setLastAppliedStory,
    setLastAppliedTeam,
    setLastAppliedTestimonials,
    setLastAppliedValues,
    setPageVisibility,
    setServicesSettings,
    setStorySettings,
    setTeamSettings,
    setTestimonialsSettings,
    setValuesSettings,
    setVisibleSections,
    setFontSettings,
    iframeRef,
  ]);

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

  const previewHeroSettings = useMemo(
    () => ({ ...lastSavedHero, ...heroSettings }),
    [lastSavedHero, heroSettings],
  );
  const previewAboutHeroSettings = useMemo(
    () => ({ ...lastSavedAboutHero, ...aboutHeroSettings }),
    [lastSavedAboutHero, aboutHeroSettings],
  );
  const previewStorySettings = useMemo(
    () => ({ ...lastSavedStory, ...storySettings }),
    [lastSavedStory, storySettings],
  );
  const previewTeamSettings = useMemo(
    () => ({ ...lastSavedTeam, ...teamSettings }),
    [lastSavedTeam, teamSettings],
  );
  const previewTestimonialsSettings = useMemo(
    () => ({ ...lastSavedTestimonials, ...testimonialsSettings }),
    [lastSavedTestimonials, testimonialsSettings],
  );
  const previewServicesSettings = useMemo(
    () => ({ ...lastSavedServices, ...servicesSettings }),
    [lastSavedServices, servicesSettings],
  );
  const previewValuesSettings = useMemo(
    () => ({ ...lastSavedValues, ...valuesSettings }),
    [lastSavedValues, valuesSettings],
  );
  const previewFontSettings = useMemo(
    () => ({ ...lastSavedFont, ...fontSettings }),
    [lastSavedFont, fontSettings],
  );
  const previewColorSettings = useMemo(
    () => ({ ...lastSavedColor, ...colorSettings }),
    [lastSavedColor, colorSettings],
  );
  const previewGallerySettings = useMemo(
    () => ({ ...lastSavedGallery, ...gallerySettings }),
    [lastSavedGallery, gallerySettings],
  );
  const previewCTASettings = useMemo(
    () => ({ ...lastSavedCTA, ...ctaSettings }),
    [lastSavedCTA, ctaSettings],
  );
  const previewHeaderSettings = useMemo(
    () => ({ ...lastSavedHeader, ...headerSettings }),
    [lastSavedHeader, headerSettings],
  );
  const previewFooterSettings = useMemo(
    () => ({ ...lastSavedFooter, ...footerSettings }),
    [lastSavedFooter, footerSettings],
  );

  const previewBookingServiceSettings = useMemo(
    () =>
      normalizeStepSettings({
        ...lastSavedBookingService,
        ...bookingServiceSettings,
      }),
    [lastSavedBookingService, bookingServiceSettings],
  );
  const previewBookingDateSettings = useMemo(
    () =>
      normalizeStepSettings({
        ...lastSavedBookingDate,
        ...bookingDateSettings,
      }),
    [lastSavedBookingDate, bookingDateSettings],
  );
  const previewBookingTimeSettings = useMemo(
    () =>
      normalizeStepSettings({
        ...lastSavedBookingTime,
        ...bookingTimeSettings,
      }),
    [lastSavedBookingTime, bookingTimeSettings],
  );
  const previewBookingFormSettings = useMemo(
    () =>
      normalizeStepSettings({
        ...lastSavedBookingForm,
        ...bookingFormSettings,
      }),
    [lastSavedBookingForm, bookingFormSettings],
  );
  const previewBookingConfirmationSettings = useMemo(
    () =>
      normalizeStepSettings({
        ...lastSavedBookingConfirmation,
        ...bookingConfirmationSettings,
      }),
    [lastSavedBookingConfirmation, bookingConfirmationSettings],
  );

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_HERO_SETTINGS", settings: previewHeroSettings },
      "*",
    );
  }, [previewHeroSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "UPDATE_ABOUT_HERO_SETTINGS",
        settings: previewAboutHeroSettings,
      },
      "*",
    );
  }, [previewAboutHeroSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_STORY_SETTINGS", settings: previewStorySettings },
      "*",
    );
  }, [previewStorySettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_TEAM_SETTINGS", settings: previewTeamSettings },
      "*",
    );
  }, [previewTeamSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "UPDATE_TESTIMONIALS_SETTINGS",
        settings: previewTestimonialsSettings,
      },
      "*",
    );
  }, [previewTestimonialsSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_SERVICES_SETTINGS", settings: previewServicesSettings },
      "*",
    );
  }, [previewServicesSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_VALUES_SETTINGS", settings: previewValuesSettings },
      "*",
    );
  }, [previewValuesSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_TYPOGRAPHY", settings: previewFontSettings },
      "*",
    );
  }, [previewFontSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_COLORS", settings: previewColorSettings },
      "*",
    );
  }, [previewColorSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_GALLERY_SETTINGS", settings: previewGallerySettings },
      "*",
    );
  }, [previewGallerySettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_CTA_SETTINGS", settings: previewCTASettings },
      "*",
    );
  }, [previewCTASettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_HEADER_SETTINGS", settings: previewHeaderSettings },
      "*",
    );
  }, [previewHeaderSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_FOOTER_SETTINGS", settings: previewFooterSettings },
      "*",
    );
  }, [previewFooterSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "UPDATE_BOOKING_SERVICE_SETTINGS",
        settings: previewBookingServiceSettings,
      },
      "*",
    );
  }, [previewBookingServiceSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "UPDATE_BOOKING_DATE_SETTINGS",
        settings: previewBookingDateSettings,
      },
      "*",
    );
  }, [previewBookingDateSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "UPDATE_BOOKING_TIME_SETTINGS",
        settings: previewBookingTimeSettings,
      },
      "*",
    );
  }, [previewBookingTimeSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "UPDATE_BOOKING_FORM_SETTINGS",
        settings: previewBookingFormSettings,
      },
      "*",
    );
  }, [previewBookingFormSettings, iframeRef]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "UPDATE_BOOKING_CONFIRMATION_SETTINGS",
        settings: previewBookingConfirmationSettings,
      },
      "*",
    );
  }, [previewBookingConfirmationSettings, iframeRef]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "BOOKING_FLOW_READY") {
        console.log(">>> [EDITOR] BookingFlow ready, resending settings...");
        if (iframeRef.current?.contentWindow) {
          const win = iframeRef.current.contentWindow;
          win.postMessage(
            {
              type: "UPDATE_BOOKING_SERVICE_SETTINGS",
              settings: previewBookingServiceSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_BOOKING_DATE_SETTINGS",
              settings: previewBookingDateSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_BOOKING_TIME_SETTINGS",
              settings: previewBookingTimeSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_BOOKING_FORM_SETTINGS",
              settings: previewBookingFormSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_BOOKING_CONFIRMATION_SETTINGS",
              settings: previewBookingConfirmationSettings,
            },
            "*",
          );

          win.postMessage(
            { type: "UPDATE_COLORS", settings: previewColorSettings },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_TYPOGRAPHY", settings: previewFontSettings },
            "*",
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    previewBookingServiceSettings,
    previewBookingDateSettings,
    previewBookingTimeSettings,
    previewBookingFormSettings,
    previewBookingConfirmationSettings,
    previewColorSettings,
    previewFontSettings,
    iframeRef,
  ]);

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
  }, [heroSettings, iframeRef, saveHeroSettings, setLastAppliedHero, toast]);

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
  }, [
    aboutHeroSettings,
    iframeRef,
    saveAboutHeroSettings,
    setLastAppliedAboutHero,
    toast,
  ]);

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
  }, [storySettings, iframeRef, saveStorySettings, setLastAppliedStory, toast]);

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
  }, [teamSettings, iframeRef, saveTeamSettings, setLastAppliedTeam, toast]);

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
  }, [
    testimonialsSettings,
    iframeRef,
    saveTestimonialsSettings,
    setLastAppliedTestimonials,
    toast,
  ]);

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
  }, [fontSettings, iframeRef, saveFontSettings, setLastAppliedFont, toast]);

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
  }, [colorSettings, iframeRef, saveColorSettings, setLastAppliedColor, toast]);

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
  }, [
    servicesSettings,
    iframeRef,
    saveServicesSettings,
    setLastAppliedServices,
    toast,
  ]);

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
  }, [
    valuesSettings,
    iframeRef,
    saveValuesSettings,
    setLastAppliedValues,
    toast,
  ]);

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
  }, [
    gallerySettings,
    iframeRef,
    saveGallerySettings,
    setLastAppliedGallery,
    toast,
  ]);

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
  }, [ctaSettings, iframeRef, saveCTASettings, setLastAppliedCTA, toast]);

  const handleApplyHeader = useCallback(() => {
    setLastAppliedHeader({ ...headerSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_HEADER_SETTINGS", settings: { ...headerSettings } },
        "*",
      );
    }
    saveHeaderSettings(headerSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do cabeçalho foram aplicadas ao rascunho.",
    });
  }, [
    headerSettings,
    iframeRef,
    saveHeaderSettings,
    setLastAppliedHeader,
    toast,
  ]);

  const handleApplyFooter = useCallback(() => {
    setLastAppliedFooter({ ...footerSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_FOOTER_SETTINGS", settings: { ...footerSettings } },
        "*",
      );
    }
    saveFooterSettings(footerSettings);
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do rodapé foram aplicadas ao rascunho.",
    });
  }, [
    footerSettings,
    iframeRef,
    saveFooterSettings,
    setLastAppliedFooter,
    toast,
  ]);

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
  }, [
    bookingServiceSettings,
    iframeRef,
    saveBookingServiceSettings,
    setLastAppliedBookingService,
    toast,
  ]);

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
  }, [
    bookingDateSettings,
    iframeRef,
    saveBookingDateSettings,
    setLastAppliedBookingDate,
    toast,
  ]);

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
  }, [
    bookingTimeSettings,
    iframeRef,
    saveBookingTimeSettings,
    setLastAppliedBookingTime,
    toast,
  ]);

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
  }, [
    bookingFormSettings,
    iframeRef,
    saveBookingFormSettings,
    setLastAppliedBookingForm,
    toast,
  ]);

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
  }, [
    bookingConfirmationSettings,
    iframeRef,
    saveBookingConfirmationSettings,
    setLastAppliedBookingConfirmation,
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
      setColorSettings(defaultColorSettings);
      setServicesSettings(defaultServicesSettings);
      setValuesSettings(defaultValuesSettings);
      setGallerySettings(defaultGallerySettings);
      setCTASettings(defaultCTASettings);
      setHeaderSettings(defaultHeaderSettings);
      setFooterSettings(defaultFooterSettings);
    }
  }, [
    setAboutHeroSettings,
    setCTASettings,
    setColorSettings,
    setFooterSettings,
    setGallerySettings,
    setHeaderSettings,
    setHeroSettings,
    setServicesSettings,
    setStorySettings,
    setTeamSettings,
    setTestimonialsSettings,
    setValuesSettings,
    setFontSettings,
  ]);

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
    [
      iframeRef,
      saveAboutHeroSettings,
      saveBookingConfirmationSettings,
      saveBookingDateSettings,
      saveBookingFormSettings,
      saveBookingServiceSettings,
      saveBookingTimeSettings,
      saveCTASettings,
      saveColorSettings,
      saveFooterSettings,
      saveGallerySettings,
      saveHeaderSettings,
      saveHeroSettings,
      saveServicesSettings,
      saveStorySettings,
      saveTeamSettings,
      saveTestimonialsSettings,
      saveValuesSettings,
      saveFontSettings,
      setAboutHeroSettings,
      setBookingConfirmationSettings,
      setBookingDateSettings,
      setBookingFormSettings,
      setBookingServiceSettings,
      setBookingTimeSettings,
      setCTASettings,
      setColorSettings,
      setFooterSettings,
      setGallerySettings,
      setHeaderSettings,
      setHeroSettings,
      setServicesSettings,
      setStorySettings,
      setTeamSettings,
      setTestimonialsSettings,
      setValuesSettings,
      setFontSettings,
      toast,
    ],
  );

  const api = useEditorApi({
    iframeRef,
    loadExternalConfig,
    settings: {
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
    },
    lastSaved: {
      lastSavedHero,
      lastSavedAboutHero,
      lastSavedStory,
      lastSavedTeam,
      lastSavedTestimonials,
      lastSavedFont,
      lastSavedColor,
      lastSavedServices,
      lastSavedValues,
      lastSavedGallery,
      lastSavedCTA,
      lastSavedHeader,
      lastSavedFooter,
      lastSavedBookingService,
      lastSavedBookingDate,
      lastSavedBookingTime,
      lastSavedBookingForm,
      lastSavedBookingConfirmation,
      lastSavedPageVisibility,
      lastSavedVisibleSections,
    },
    lastApplied: {
      lastAppliedHero,
      lastAppliedAboutHero,
      lastAppliedStory,
      lastAppliedTeam,
      lastAppliedTestimonials,
      lastAppliedFont,
      lastAppliedColor,
      lastAppliedServices,
      lastAppliedValues,
      lastAppliedGallery,
      lastAppliedCTA,
      lastAppliedHeader,
      lastAppliedFooter,
      lastAppliedBookingService,
      lastAppliedBookingDate,
      lastAppliedBookingTime,
      lastAppliedBookingForm,
      lastAppliedBookingConfirmation,
    },
    setters: {
      setLastSavedHero,
      setLastSavedAboutHero,
      setLastSavedStory,
      setLastSavedTeam,
      setLastSavedTestimonials,
      setLastSavedFont,
      setLastSavedColor,
      setLastSavedServices,
      setLastSavedValues,
      setLastSavedGallery,
      setLastSavedCTA,
      setLastSavedHeader,
      setLastSavedFooter,
      setLastSavedBookingService,
      setLastSavedBookingDate,
      setLastSavedBookingTime,
      setLastSavedBookingForm,
      setLastSavedBookingConfirmation,
      setLastSavedPageVisibility,
      setLastSavedVisibleSections,
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
    },
    saveLocalDrafts,
  });

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

  const hasUnsavedGlobalChanges = useMemo(
    () => api.hasUnsavedGlobalChanges(),
    [api.hasUnsavedGlobalChanges],
  );

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
    handleSaveLocal: api.handleSaveLocal,
    handleSaveGlobal: (shouldReloadFromBank?: boolean) =>
      api.handleSaveGlobal(shouldReloadFromBank),
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
    getChangedSettings: api.getChangedSettings,
    fetchCustomization: api.fetchCustomization,
    isFetching: api.isFetching,
    fetchError: api.fetchError,
    isSaving: api.isSaving,
  };
}
