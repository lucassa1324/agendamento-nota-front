import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import type {
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
    handleUpdateBookingService,
    handleUpdateBookingDate,
    handleUpdateBookingTime,
    handleUpdateBookingForm,
    handleUpdateBookingConfirmation,
    handlePageVisibilityChange,
    handleSectionVisibilityToggle,
  } = state;

  useEffect(() => {
    const drafts = loadLocalDrafts();

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

    setLastSavedHero(drafts.heroSettings);
    setLastSavedAboutHero(drafts.aboutHeroSettings);
    setLastSavedStory(drafts.storySettings);
    setLastSavedTeam(drafts.teamSettings);
    setLastSavedTestimonials(drafts.testimonialsSettings);
    setLastSavedFont(drafts.fontSettings);
    setLastSavedColor(drafts.colorSettings);
    setLastSavedServices(drafts.servicesSettings);
    setLastSavedValues(drafts.valuesSettings);
    setLastSavedGallery(drafts.gallerySettings);
    setLastSavedCTA(drafts.ctaSettings);
    setLastSavedHeader(drafts.headerSettings);
    setLastSavedFooter(drafts.footerSettings);

    setLastSavedBookingService(drafts.bookingServiceSettings);
    setLastSavedBookingDate(drafts.bookingDateSettings);
    setLastSavedBookingTime(drafts.bookingTimeSettings);
    setLastSavedBookingForm(drafts.bookingFormSettings);
    setLastSavedBookingConfirmation(drafts.bookingConfirmationSettings);

    setLastSavedPageVisibility(drafts.pageVisibility);
    setLastSavedVisibleSections(drafts.visibleSections);
  }, [
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
    setLastSavedAboutHero,
    setLastSavedBookingConfirmation,
    setLastSavedBookingDate,
    setLastSavedBookingForm,
    setLastSavedBookingService,
    setLastSavedBookingTime,
    setLastSavedCTA,
    setLastSavedColor,
    setLastSavedFont,
    setLastSavedFooter,
    setLastSavedGallery,
    setLastSavedHeader,
    setLastSavedHero,
    setLastSavedPageVisibility,
    setLastSavedServices,
    setLastSavedStory,
    setLastSavedTeam,
    setLastSavedTestimonials,
    setLastSavedValues,
    setLastSavedVisibleSections,
    setPageVisibility,
    setServicesSettings,
    setStorySettings,
    setTeamSettings,
    setTestimonialsSettings,
    setValuesSettings,
    setVisibleSections,
    setFontSettings,
  ]);

  const loadExternalConfig = useCallback(
    (config: Record<string, unknown>) => {
      if (!config) return;
      const drafts = loadLocalDrafts();

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
      } as SiteConfigData;

      const useLocalHero = hasLocalDraft("heroSettings");
      const resolvedHero = useLocalHero ? drafts.heroSettings : data.hero;
      if (resolvedHero) {
        setHeroSettings(resolvedHero);
      }
      if (data.hero) {
        setLastSavedHero(data.hero);
      }
      if (!useLocalHero && data.hero) {
        setLastAppliedHero(data.hero);
        saveHeroSettings(data.hero);
      }

      const useLocalAboutHero = hasLocalDraft("aboutHeroSettings");
      const resolvedAboutHero = useLocalAboutHero
        ? drafts.aboutHeroSettings
        : data.aboutHero;
      if (resolvedAboutHero) {
        setAboutHeroSettings(resolvedAboutHero);
      }
      if (data.aboutHero) {
        setLastSavedAboutHero(data.aboutHero);
      }
      if (!useLocalAboutHero && data.aboutHero) {
        setLastAppliedAboutHero(data.aboutHero);
        saveAboutHeroSettings(data.aboutHero);
      }

      const useLocalStory = hasLocalDraft("storySettings");
      const resolvedStory = useLocalStory ? drafts.storySettings : data.story;
      if (resolvedStory) {
        setStorySettings(resolvedStory);
      }
      if (data.story) {
        setLastSavedStory(data.story);
      }
      if (!useLocalStory && data.story) {
        setLastAppliedStory(data.story);
        saveStorySettings(data.story);
      }

      const useLocalTeam = hasLocalDraft("teamSettings");
      const resolvedTeam = useLocalTeam ? drafts.teamSettings : data.team;
      if (resolvedTeam) {
        setTeamSettings(resolvedTeam);
      }
      if (data.team) {
        setLastSavedTeam(data.team);
      }
      if (!useLocalTeam && data.team) {
        setLastAppliedTeam(data.team);
        saveTeamSettings(data.team);
      }

      const useLocalTestimonials = hasLocalDraft("testimonialsSettings");
      const resolvedTestimonials = useLocalTestimonials
        ? drafts.testimonialsSettings
        : data.testimonials;
      if (resolvedTestimonials) {
        setTestimonialsSettings(resolvedTestimonials);
      }
      if (data.testimonials) {
        setLastSavedTestimonials(data.testimonials);
      }
      if (!useLocalTestimonials && data.testimonials) {
        setLastAppliedTestimonials(data.testimonials);
        saveTestimonialsSettings(data.testimonials);
      }

      const useLocalFont = hasLocalDraft("fontSettings");
      const resolvedFont = useLocalFont ? drafts.fontSettings : data.theme;
      if (resolvedFont) {
        setFontSettings(resolvedFont);
      }
      if (data.theme) {
        setLastSavedFont(data.theme);
      }
      if (!useLocalFont && data.theme) {
        setLastAppliedFont(data.theme);
        saveFontSettings(data.theme);
      }

      const useLocalColors = hasLocalDraft("colorSettings");
      const resolvedColors = useLocalColors ? drafts.colorSettings : data.colors;
      if (resolvedColors) {
        setColorSettings(resolvedColors);
      }
      if (data.colors) {
        setLastSavedColor(data.colors);
      }
      if (!useLocalColors && data.colors) {
        setLastAppliedColor(data.colors);
        saveColorSettings(data.colors);
      }

      const useLocalServices = hasLocalDraft("servicesSettings");
      const resolvedServices = useLocalServices
        ? drafts.servicesSettings
        : data.services;
      if (resolvedServices) {
        setServicesSettings(resolvedServices);
      }
      if (data.services) {
        setLastSavedServices(data.services);
      }
      if (!useLocalServices && data.services) {
        setLastAppliedServices(data.services);
        saveServicesSettings(data.services);
      }

      const useLocalValues = hasLocalDraft("valuesSettings");
      const resolvedValues = useLocalValues ? drafts.valuesSettings : data.values;
      if (resolvedValues) {
        setValuesSettings(resolvedValues);
      }
      if (data.values) {
        setLastSavedValues(data.values);
      }
      if (!useLocalValues && data.values) {
        setLastAppliedValues(data.values);
        saveValuesSettings(data.values);
      }

      const useLocalGallery = hasLocalDraft("gallerySettings");
      const resolvedGallery = useLocalGallery
        ? drafts.gallerySettings
        : data.gallery;
      if (resolvedGallery) {
        setGallerySettings(resolvedGallery);
      }
      if (data.gallery) {
        setLastSavedGallery(data.gallery);
      }
      if (!useLocalGallery && data.gallery) {
        setLastAppliedGallery(data.gallery);
        saveGallerySettings(data.gallery);
      }

      const useLocalCTA = hasLocalDraft("ctaSettings");
      const resolvedCTA = useLocalCTA ? drafts.ctaSettings : data.cta;
      if (resolvedCTA) {
        setCTASettings(resolvedCTA);
      }
      if (data.cta) {
        setLastSavedCTA(data.cta);
      }
      if (!useLocalCTA && data.cta) {
        setLastAppliedCTA(data.cta);
        saveCTASettings(data.cta);
      }

      const useLocalHeader = hasLocalDraft("headerSettings");
      const resolvedHeader = useLocalHeader ? drafts.headerSettings : data.header;
      if (resolvedHeader) {
        setHeaderSettings(resolvedHeader);
      }
      if (data.header) {
        setLastSavedHeader(data.header);
      }
      if (!useLocalHeader && data.header) {
        setLastAppliedHeader(data.header);
        saveHeaderSettings(data.header);
      }

      const useLocalFooter = hasLocalDraft("footerSettings");
      const resolvedFooter = useLocalFooter ? drafts.footerSettings : data.footer;
      const resolvedBookingService = hasLocalDraft("bookingServiceSettings")
        ? drafts.bookingServiceSettings
        : data.bookingSteps?.service;
      const resolvedBookingDate = hasLocalDraft("bookingDateSettings")
        ? drafts.bookingDateSettings
        : data.bookingSteps?.date;
      const resolvedBookingTime = hasLocalDraft("bookingTimeSettings")
        ? drafts.bookingTimeSettings
        : data.bookingSteps?.time;
      const resolvedBookingForm = hasLocalDraft("bookingFormSettings")
        ? drafts.bookingFormSettings
        : data.bookingSteps?.form;
      const resolvedBookingConfirmation = hasLocalDraft(
        "bookingConfirmationSettings",
      )
        ? drafts.bookingConfirmationSettings
        : data.bookingSteps?.confirmation;
      if (resolvedFooter) {
        setFooterSettings(resolvedFooter);
      }
      if (data.footer) {
        setLastSavedFooter(data.footer);
      }
      if (!useLocalFooter && data.footer) {
        setLastAppliedFooter(data.footer);
        saveFooterSettings(data.footer);
      }

      if (data.bookingSteps) {
        const steps = data.bookingSteps;
        if (resolvedBookingService) {
          setBookingServiceSettings(resolvedBookingService);
        }
        if (steps.service) {
          setLastSavedBookingService(steps.service);
        }
        if (!hasLocalDraft("bookingServiceSettings") && steps.service) {
          setLastAppliedBookingService(steps.service);
        }

        if (resolvedBookingDate) {
          setBookingDateSettings(resolvedBookingDate);
        }
        if (steps.date) {
          setLastSavedBookingDate(steps.date);
        }
        if (!hasLocalDraft("bookingDateSettings") && steps.date) {
          setLastAppliedBookingDate(steps.date);
        }

        if (resolvedBookingTime) {
          setBookingTimeSettings(resolvedBookingTime);
        }
        if (steps.time) {
          setLastSavedBookingTime(steps.time);
        }
        if (!hasLocalDraft("bookingTimeSettings") && steps.time) {
          setLastAppliedBookingTime(steps.time);
        }

        if (resolvedBookingForm) {
          setBookingFormSettings(resolvedBookingForm);
        }
        if (steps.form) {
          setLastSavedBookingForm(steps.form);
        }
        if (!hasLocalDraft("bookingFormSettings") && steps.form) {
          setLastAppliedBookingForm(steps.form);
        }

        if (resolvedBookingConfirmation) {
          setBookingConfirmationSettings(resolvedBookingConfirmation);
        }
        if (steps.confirmation) {
          setLastSavedBookingConfirmation(steps.confirmation);
        }
        if (!hasLocalDraft("bookingConfirmationSettings") && steps.confirmation) {
          setLastAppliedBookingConfirmation(steps.confirmation);
        }
      }

      const useLocalPageVisibility = hasLocalDraft("pageVisibility");
      const resolvedPageVisibility = useLocalPageVisibility
        ? drafts.pageVisibility
        : data.pageVisibility;
      if (resolvedPageVisibility) {
        setPageVisibility(resolvedPageVisibility);
      }
      if (data.pageVisibility) {
        setLastSavedPageVisibility(data.pageVisibility);
      }
      if (!useLocalPageVisibility && data.pageVisibility) {
        savePageVisibility(data.pageVisibility);
      }

      const useLocalVisibleSections = hasLocalDraft("visibleSections");
      const resolvedVisibleSections = useLocalVisibleSections
        ? drafts.visibleSections
        : data.visibleSections;
      if (resolvedVisibleSections) {
        setVisibleSections(resolvedVisibleSections);
      }
      if (data.visibleSections) {
        setLastSavedVisibleSections(data.visibleSections);
      }
      if (!useLocalVisibleSections && data.visibleSections) {
        saveVisibleSections(data.visibleSections);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("DataReady"));
      }
      const timer = setTimeout(() => {
        if (iframeRef.current?.contentWindow) {
          const win = iframeRef.current.contentWindow;
          if (resolvedHero)
            win.postMessage(
              { type: "UPDATE_HERO_SETTINGS", settings: resolvedHero },
              "*",
            );
          if (resolvedAboutHero)
            win.postMessage(
              {
                type: "UPDATE_ABOUT_HERO_SETTINGS",
                settings: resolvedAboutHero,
              },
              "*",
            );
          if (resolvedStory)
            win.postMessage(
              { type: "UPDATE_STORY_SETTINGS", settings: resolvedStory },
              "*",
            );
          if (resolvedTeam)
            win.postMessage(
              { type: "UPDATE_TEAM_SETTINGS", settings: resolvedTeam },
              "*",
            );
          if (resolvedTestimonials)
            win.postMessage(
              {
                type: "UPDATE_TESTIMONIALS_SETTINGS",
                settings: resolvedTestimonials,
              },
              "*",
            );
          if (resolvedFont)
            win.postMessage(
              { type: "UPDATE_TYPOGRAPHY", settings: resolvedFont },
              "*",
            );
          if (resolvedColors)
            win.postMessage(
              { type: "UPDATE_COLORS", settings: resolvedColors },
              "*",
            );
          if (resolvedServices)
            win.postMessage(
              { type: "UPDATE_SERVICES_SETTINGS", settings: resolvedServices },
              "*",
            );
          if (resolvedValues)
            win.postMessage(
              { type: "UPDATE_VALUES_SETTINGS", settings: resolvedValues },
              "*",
            );
          if (resolvedGallery)
            win.postMessage(
              { type: "UPDATE_GALLERY_SETTINGS", settings: resolvedGallery },
              "*",
            );
          if (resolvedCTA)
            win.postMessage(
              { type: "UPDATE_CTA_SETTINGS", settings: resolvedCTA },
              "*",
            );
          if (resolvedHeader)
            win.postMessage(
              { type: "UPDATE_HEADER_SETTINGS", settings: resolvedHeader },
              "*",
            );
          if (resolvedFooter)
            win.postMessage(
              { type: "UPDATE_FOOTER_SETTINGS", settings: resolvedFooter },
              "*",
            );

          if (data.bookingSteps) {
            if (resolvedBookingService)
              win.postMessage(
                {
                  type: "UPDATE_BOOKING_SERVICE_SETTINGS",
                  settings: resolvedBookingService,
                },
                "*",
              );
            if (resolvedBookingDate)
              win.postMessage(
                {
                  type: "UPDATE_BOOKING_DATE_SETTINGS",
                  settings: resolvedBookingDate,
                },
                "*",
              );
            if (resolvedBookingTime)
              win.postMessage(
                {
                  type: "UPDATE_BOOKING_TIME_SETTINGS",
                  settings: resolvedBookingTime,
                },
                "*",
              );
            if (resolvedBookingForm)
              win.postMessage(
                {
                  type: "UPDATE_BOOKING_FORM_SETTINGS",
                  settings: resolvedBookingForm,
                },
                "*",
              );
            if (resolvedBookingConfirmation)
              win.postMessage(
                {
                  type: "UPDATE_BOOKING_CONFIRMATION_SETTINGS",
                  settings: resolvedBookingConfirmation,
                },
                "*",
              );
          }

          if (resolvedPageVisibility)
            win.postMessage(
              {
                type: "UPDATE_PAGE_VISIBILITY",
                visibility: resolvedPageVisibility,
              },
              "*",
            );
          if (resolvedVisibleSections)
            win.postMessage(
              {
                type: "UPDATE_VISIBLE_SECTIONS",
                sections: resolvedVisibleSections,
              },
              "*",
            );
        }
      }, 100);

      return () => clearTimeout(timer);
    },
    [
      iframeRef,
      loadLocalDrafts,
      hasLocalDraft,
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
      setLastSavedAboutHero,
      setLastSavedBookingConfirmation,
      setLastSavedBookingDate,
      setLastSavedBookingForm,
      setLastSavedBookingService,
      setLastSavedBookingTime,
      setLastSavedCTA,
      setLastSavedColor,
      setLastSavedFont,
      setLastSavedFooter,
      setLastSavedGallery,
      setLastSavedHeader,
      setLastSavedHero,
      setLastSavedPageVisibility,
      setLastSavedServices,
      setLastSavedStory,
      setLastSavedTeam,
      setLastSavedTestimonials,
      setLastSavedValues,
      setLastSavedVisibleSections,
      setPageVisibility,
      setServicesSettings,
      setStorySettings,
      setTeamSettings,
      setTestimonialsSettings,
      setValuesSettings,
      setVisibleSections,
      setFontSettings,
    ],
  );

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
        win.postMessage(
          { type: "UPDATE_COLORS", settings: initialColors },
          "*",
        );
      }
      if (initialFonts) {
        win.postMessage(
          { type: "UPDATE_TYPOGRAPHY", settings: initialFonts },
          "*",
        );
      }
    }
  }, [studio, loadExternalConfig, iframeRef]);

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
            saveBookingConfirmationSettings(
              defaultBookingConfirmationSettings,
            );
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
    handleSaveGlobal: api.handleSaveGlobal,
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
