import { useCallback } from "react";
import { 
  type AppearanceSettings, 
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
  getStorageKey,
  type HeaderSettings, 
  type HeroSettings, 
  type ServicesSettings, 
  type StorySettings, 
  type TeamSettings, 
  type TestimonialsSettings, 
  type ValuesSettings
} from "@/lib/booking-data";
import type { SiteConfigData } from "@/lib/site-config-types";
import type { EditorLocalDrafts, useEditorLocal } from "./use-editor-local";
import type { useEditorState } from "./use-editor-state";

interface UseEditorConfigLoaderProps {
  local: ReturnType<typeof useEditorLocal>;
  state: ReturnType<typeof useEditorState>;
  checkShouldRecoverDraft: (bankUpdatedAt: number) => { shouldRecoverDrafts: boolean; draftTimestamp: number };
}

const normalizeBg = <T extends { bgImage?: string; bgType?: string; appearance?: AppearanceSettings }>(
  settings: T | undefined
): T | undefined => {
  if (!settings) return settings;
  
  const hasUrl = settings.appearance?.backgroundImageUrl || settings.bgImage;
  
  if (hasUrl) {
     return {
       ...settings,
       bgImage: settings.appearance?.backgroundImageUrl || settings.bgImage,
       bgType: "image"
     };
  }
  
  return settings;
};

const sanitizeHeroText = (value?: HeroSettings) =>
  value
    ? {
        ...value,
        title: typeof value.title === "string" ? value.title : "",
        subtitle:
          typeof value.subtitle === "string" ? value.subtitle : "",
      }
    : value;

const normalizeHeroMedia = (value?: HeroSettings) => {
  if (!value?.appearance?.backgroundImageUrl) return value;
  const shouldUseOverlay =
    value.appearance.overlay?.opacity !== undefined &&
    value.appearance.overlay?.opacity !== null;
  return {
    ...value,
    overlayOpacity: shouldUseOverlay
      ? value.appearance.overlay?.opacity ?? value.overlayOpacity
      : 0,
    imageOpacity:
      value.imageOpacity === defaultHeroSettings.imageOpacity
        ? 1
        : value.imageOpacity,
  };
};

const normalizeServices = (value?: ServicesSettings) => {
  if (!value) return value;
  const base = normalizeBg(value) || value;
  return {
    ...base,
    title: typeof base.title === "string" ? base.title : "",
    subtitle: typeof base.subtitle === "string" ? base.subtitle : "",
    bgImage: base.appearance?.backgroundImageUrl || base.bgImage || "",
    bgType: (base.appearance?.backgroundImageUrl || base.bgImage) ? "image" : (base.bgType || "color")
  };
};

export function useEditorConfigLoader({ 
  local, 
  state, 
  checkShouldRecoverDraft 
}: UseEditorConfigLoaderProps) {
  const {
    loadLocalDrafts,
    hasLocalDraft,
    saveLocalDrafts,
    saveHeroSettings,
    savePageVisibility,
    saveVisibleSections,
  } = local;

  const {
    setHeroSettings,
    setAboutHeroSettings,
    setStorySettings,
    setTeamSettings,
    setTestimonialsSettings,
    setFontSettings,
    setColorSettings,
    setServicesSettings,
    setValuesSettings,
    setGallerySettings,
    setCTASettings,
    setHeaderSettings,
    setFooterSettings,
    setBookingServiceSettings,
    setBookingDateSettings,
    setBookingTimeSettings,
    setBookingFormSettings,
    setBookingConfirmationSettings,
    setPageVisibility,
    setVisibleSections,
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
  } = state;

  const loadExternalConfig = useCallback(
    (config: SiteConfigData) => {
      if (!config) return;
      const baseConfig = ((config as SiteConfigData & { siteCustomization?: SiteConfigData }).siteCustomization || config) as SiteConfigData;
      
      const drafts = loadLocalDrafts();
      const layoutGlobal = (baseConfig.layoutGlobal || baseConfig.layout_global) as Record<string, unknown> | undefined;
      const home = baseConfig.home as Record<string, Record<string, unknown>> | undefined;

      const rootHeroBanner = (baseConfig as Record<string, unknown>)?.heroBanner as HeroSettings | undefined;
      const heroSource = (home?.heroBanner || rootHeroBanner || home?.hero || layoutGlobal?.hero || baseConfig.hero) as HeroSettings | undefined;

      const data = {
        ...baseConfig,
        hero: normalizeBg(heroSource),
        aboutHero: normalizeBg((layoutGlobal?.aboutHero || baseConfig.aboutHero) as HeroSettings | undefined),
        story: normalizeBg((layoutGlobal?.story || baseConfig.story) as StorySettings | undefined),
        team: normalizeBg((layoutGlobal?.team || baseConfig.team) as TeamSettings | undefined),
        testimonials: normalizeBg((layoutGlobal?.testimonials || baseConfig.testimonials) as TestimonialsSettings | undefined),
        services: normalizeServices((home?.servicesSection || home?.services || layoutGlobal?.services || baseConfig.services) as ServicesSettings | undefined),
        values: normalizeBg((home?.valuesSection || home?.values || layoutGlobal?.values || baseConfig.values) as ValuesSettings | undefined),
        gallery: normalizeBg((home?.gallerySection || home?.gallery || layoutGlobal?.gallery || baseConfig.gallery) as GallerySettings | undefined),
        cta: normalizeBg((home?.ctaSection || home?.cta || layoutGlobal?.cta || baseConfig.cta) as CTASettings | undefined),
        header: (layoutGlobal?.header || baseConfig.header) as HeaderSettings | undefined,
        footer: (layoutGlobal?.footer || baseConfig.footer) as FooterSettings | undefined,
        colors: (layoutGlobal?.siteColors || layoutGlobal?.cores_base || baseConfig.colors) as ColorSettings | undefined,
        theme: (layoutGlobal?.fontes || baseConfig.theme || baseConfig.typography) as FontSettings | undefined,
        visibleSections: (layoutGlobal?.visibleSections || baseConfig.visibleSections) as Record<string, boolean> | undefined,
        pageVisibility: (layoutGlobal?.pageVisibility || baseConfig.pageVisibility) as Record<string, boolean> | undefined,
        bookingSteps: baseConfig.bookingSteps ? {
          service: normalizeBg(baseConfig.bookingSteps.service),
          date: normalizeBg(baseConfig.bookingSteps.date),
          time: normalizeBg(baseConfig.bookingSteps.time),
          form: normalizeBg(baseConfig.bookingSteps.form),
          confirmation: normalizeBg(baseConfig.bookingSteps.confirmation),
        } : undefined,
      } as SiteConfigData;

      const sanitizedHero = normalizeHeroMedia(sanitizeHeroText(data.hero));
      const bankUpdatedAt = baseConfig.updatedAt
        ? new Date(baseConfig.updatedAt).getTime()
        : config.updatedAt
          ? new Date(config.updatedAt).getTime()
          : 0;

      const { shouldRecoverDrafts } = checkShouldRecoverDraft(bankUpdatedAt);

      let heroDraft = normalizeHeroMedia(
        sanitizeHeroText(drafts.heroSettings as HeroSettings | undefined),
      );
      if (
        shouldRecoverDrafts &&
        heroDraft &&
        sanitizedHero?.appearance?.backgroundImageUrl &&
        !heroDraft.appearance?.backgroundImageUrl
      ) {
        const mergedHeroDraft = {
          ...heroDraft,
          appearance: {
            ...heroDraft.appearance,
            ...sanitizedHero.appearance,
            backgroundImageUrl: sanitizedHero.appearance.backgroundImageUrl,
          },
          bgImage: sanitizedHero.appearance.backgroundImageUrl,
          bgType: heroDraft.bgType || "image",
        } as HeroSettings;
        saveHeroSettings(mergedHeroDraft);
        heroDraft = mergedHeroDraft;
      }

      const useLocalHero = shouldRecoverDrafts && hasLocalDraft("heroSettings");
      if (sanitizedHero) {
        setLastSavedHero(sanitizedHero);
      }
      if (useLocalHero) {
        const normalizedHeroDraft = normalizeBg(heroDraft);
        setHeroSettings(normalizedHeroDraft as HeroSettings);
      } else if (sanitizedHero) {
        setHeroSettings(sanitizedHero);
      }

      // Resto das seções...
      const processSection = <T>(
        draftKey: keyof EditorLocalDrafts,
        dataValue: T | undefined,
        setSettings: (v: T) => void,
        setLastSaved: (v: T) => void,
        defaultValue: T
      ) => {
        const useLocal = shouldRecoverDrafts && hasLocalDraft(draftKey as string);
        if (dataValue) setLastSaved(dataValue);
        if (useLocal) {
          const draftValue = drafts[draftKey];
          setSettings(normalizeBg(draftValue as Parameters<typeof normalizeBg>[0]) as T);
        } else if (dataValue) {
          setSettings(dataValue);
        } else {
          setSettings(defaultValue);
        }
      };

      processSection("aboutHeroSettings", data.aboutHero, setAboutHeroSettings, setLastSavedAboutHero, defaultAboutHeroSettings);
      processSection("storySettings", data.story, setStorySettings, setLastSavedStory, defaultStorySettings);
      processSection("teamSettings", data.team, setTeamSettings, setLastSavedTeam, defaultTeamSettings);
      processSection("testimonialsSettings", data.testimonials, setTestimonialsSettings, setLastSavedTestimonials, defaultTestimonialsSettings);
      processSection("servicesSettings", data.services, setServicesSettings, setLastSavedServices, defaultServicesSettings);
      processSection("valuesSettings", data.values, setValuesSettings, setLastSavedValues, defaultValuesSettings);
      processSection("gallerySettings", data.gallery, setGallerySettings, setLastSavedGallery, defaultGallerySettings);
      processSection("ctaSettings", data.cta, setCTASettings, setLastSavedCTA, defaultCTASettings);
      processSection("headerSettings", data.header, setHeaderSettings, setLastSavedHeader, defaultHeaderSettings);
      processSection("footerSettings", data.footer, setFooterSettings, setLastSavedFooter, defaultFooterSettings);
      processSection("fontSettings", data.theme, setFontSettings, setLastSavedFont, defaultFontSettings);
      processSection("colorSettings", data.colors, setColorSettings, setLastSavedColor, defaultColorSettings);

      // Booking steps...
      const bookingSteps = [
        { key: "bookingServiceSettings", data: data.bookingSteps?.service, set: setBookingServiceSettings, setLast: setLastSavedBookingService, def: defaultBookingServiceSettings },
        { key: "bookingDateSettings", data: data.bookingSteps?.date, set: setBookingDateSettings, setLast: setLastSavedBookingDate, def: defaultBookingDateSettings },
        { key: "bookingTimeSettings", data: data.bookingSteps?.time, set: setBookingTimeSettings, setLast: setLastSavedBookingTime, def: defaultBookingTimeSettings },
        { key: "bookingFormSettings", data: data.bookingSteps?.form, set: setBookingFormSettings, setLast: setLastSavedBookingForm, def: defaultBookingFormSettings },
        { key: "bookingConfirmationSettings", data: data.bookingSteps?.confirmation, set: setBookingConfirmationSettings, setLast: setLastSavedBookingConfirmation, def: defaultBookingConfirmationSettings },
      ];

      bookingSteps.forEach(step => {
        processSection(step.key, step.data, step.set, step.setLast, step.def);
      });

      if (data.pageVisibility) {
        setLastSavedPageVisibility(data.pageVisibility);
        if (!(shouldRecoverDrafts && hasLocalDraft("pageVisibility"))) {
          setPageVisibility(data.pageVisibility);
          savePageVisibility(data.pageVisibility);
        }
      }

      if (data.visibleSections) {
        setLastSavedVisibleSections(data.visibleSections);
        if (!(shouldRecoverDrafts && hasLocalDraft("visibleSections"))) {
          setVisibleSections(data.visibleSections);
          saveVisibleSections(data.visibleSections);
        }
      }

      if (!shouldRecoverDrafts) {
        saveLocalDrafts({
          heroSettings: sanitizedHero || defaultHeroSettings,
          aboutHeroSettings: data.aboutHero || defaultAboutHeroSettings,
          storySettings: data.story || defaultStorySettings,
          teamSettings: data.team || defaultTeamSettings,
          testimonialsSettings: data.testimonials || defaultTestimonialsSettings,
          fontSettings: data.theme || defaultFontSettings,
          colorSettings: data.colors || defaultColorSettings,
          servicesSettings: data.services || defaultServicesSettings,
          valuesSettings: data.values || defaultValuesSettings,
          gallerySettings: data.gallery || defaultGallerySettings,
          ctaSettings: data.cta || defaultCTASettings,
          headerSettings: data.header || defaultHeaderSettings,
          footerSettings: data.footer || defaultFooterSettings,
          bookingServiceSettings: data.bookingSteps?.service || defaultBookingServiceSettings,
          bookingDateSettings: data.bookingSteps?.date || defaultBookingDateSettings,
          bookingTimeSettings: data.bookingSteps?.time || defaultBookingTimeSettings,
          bookingFormSettings: data.bookingSteps?.form || defaultBookingFormSettings,
          bookingConfirmationSettings: data.bookingSteps?.confirmation || defaultBookingConfirmationSettings,
          pageVisibility: data.pageVisibility || drafts.pageVisibility,
          visibleSections: data.visibleSections || drafts.visibleSections,
        });
        
        if (typeof window !== "undefined") {
          const draftKey = getStorageKey("last_draft_update");
          if (bankUpdatedAt) {
            localStorage.setItem(draftKey, new Date(bankUpdatedAt).toISOString());
          } else {
            localStorage.removeItem(draftKey);
          }
        }
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("DataReady"));
      }
    },
    [
      loadLocalDrafts,
      hasLocalDraft,
      saveLocalDrafts,
      saveHeroSettings,
      setHeroSettings,
      setAboutHeroSettings,
      setStorySettings,
      setTeamSettings,
      setTestimonialsSettings,
      setFontSettings,
      setColorSettings,
      setServicesSettings,
      setValuesSettings,
      setGallerySettings,
      setCTASettings,
      setHeaderSettings,
      setFooterSettings,
      setBookingServiceSettings,
      setBookingDateSettings,
      setBookingTimeSettings,
      setBookingFormSettings,
      setBookingConfirmationSettings,
      setPageVisibility,
      setVisibleSections,
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
      checkShouldRecoverDraft,
      savePageVisibility,
      saveVisibleSections,
    ]
  );

  return { loadExternalConfig };
}
