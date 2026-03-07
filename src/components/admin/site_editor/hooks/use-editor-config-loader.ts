import { useCallback, useRef } from "react";
import {
  type AppearanceSettings,
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
  getStorageKey,
  type HeaderSettings,
  type HeroSettings,
  type ServicesSettings,
  type StorySettings,
  type TeamSettings,
  type TestimonialsSettings,
  type ValuesSettings,
} from "@/lib/booking-data";
import type { SiteConfigData } from "@/lib/site-config-types";
import type { EditorLocalDrafts, useEditorLocal } from "./use-editor-local";
import type { useEditorState } from "./use-editor-state";

interface UseEditorConfigLoaderProps {
  local: ReturnType<typeof useEditorLocal>;
  state: ReturnType<typeof useEditorState>;
  checkShouldRecoverDraft: () => {
    shouldRecoverDrafts: boolean;
    draftTimestamp: number;
  };
}

const normalizeSection = <T extends Record<string, unknown>>(
  value: T | undefined,
): T | undefined => {
  if (!value) return value;

  const content = (value.content as Record<string, unknown>) || {};
  const appearance = (value.appearance as Record<string, unknown>) || {};

  const bgImage = (appearance.backgroundImageUrl as string) || (value.bgImage as string) || "";

  let bgType: "color" | "image" = value.bgType as "color" | "image";
    // 2. Prioridade 1: Se o banco enviou explicitamente o tipo (bgType), usamos ele e não discutimos.
    if (value.bgType === "color" || value.bgType === "image") {
      bgType = value.bgType as "color" | "image";
    } 
    // 3. Prioridade 2: Se não tem bgType, mas tem a trava visual (showBackgroundImage), seguimos ela.
    else if (typeof appearance.showBackgroundImage === "boolean") {
      bgType = appearance.showBackgroundImage ? "image" : "color";
    } 
    // 4. Prioridade 3: Só se não houver NADA das opções acima, olhamos se tem imagem.
    else {
      bgType = bgImage ? "image" : "color";
    }

  const bgColor =
    (appearance.backgroundColor as string) ||
    (value.backgroundColor as string) ||
    (value.bgColor as string) ||
    (appearance.cardBgColor as string) ||
    (value.cardBgColor as string) ||
    "";

  const flattened = {
    ...value,
    ...content,
    ...appearance,
    title: content.title ?? value.title ?? "",
    subtitle: content.subtitle ?? value.subtitle ?? "",
    description: content.description ?? value.description ?? "",
    bgImage,
    bgColor,
    bgType,
    overlayOpacity: appearance.overlayOpacity ?? value.overlayOpacity ?? 0.5,
  };

  return flattened as T;
};

const normalizeHeroSettings = (value?: HeroSettings) => {
  if (!value) return value;

  // Normalização baseada em section (achata content e appearance)
  const base = normalizeSection(value) || value;

  console.log("[BG_CHECK] Normalizando HeroSettings:", {
    type: base.bgType,
    hasImage: !!base.bgImage,
    bgColor: base.bgColor,
  });

  return {
    ...base,
    overlayOpacity: base.overlayOpacity ?? 0.5,
    imageOpacity:
      base.imageOpacity === defaultHeroSettings.imageOpacity
        ? 1
        : base.imageOpacity,
  };
};

export function useEditorConfigLoader({
  local,
  state,
  checkShouldRecoverDraft,
}: UseEditorConfigLoaderProps) {
  const hasLoadedFromBank = useRef(false);

  const {
    loadLocalDrafts,
    saveLocalDrafts,
    saveHeroSettings,
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
    (config: SiteConfigData, force: boolean = false) => {
      if (!config) return;

      // Se force for true, resetamos a trava para permitir a recarga (usado após salvar/publicar)
      if (force) {
        console.log(
          ">>> [LOADER_FORCE] Forçando recarga dos dados do banco...",
        );
        hasLoadedFromBank.current = false;
      }

      // REMOVIDO: Bloqueio de navegação que preservava rascunhos locais antigos.
      // Agora sempre permitimos que os dados do banco entrem, pois o rascunho local
      // já é mesclado logo abaixo se for necessário.
      hasLoadedFromBank.current = true;

      const baseConfig = ((
        config as SiteConfigData & { siteCustomization?: SiteConfigData }
      ).siteCustomization || config) as SiteConfigData;

      const drafts = loadLocalDrafts();
      const layoutGlobal = (baseConfig.layoutGlobal ||
        baseConfig.layout_global) as Record<string, unknown> | undefined;
      const home = baseConfig.home as
        | Record<string, Record<string, unknown>>
        | undefined;

      const rootHeroBanner = (baseConfig as Record<string, unknown>)
        ?.heroBanner as HeroSettings | undefined;
      const heroSource = (layoutGlobal?.heroBanner ||
        home?.heroBanner ||
        rootHeroBanner ||
        home?.hero ||
        layoutGlobal?.hero ||
        baseConfig.hero) as HeroSettings | undefined;

      const { shouldRecoverDrafts } = checkShouldRecoverDraft();

      const getSectionValue = <T>(
        bankValue: T | undefined,
        draftValue: T | undefined,
      ): T | undefined => {
        // PRIORIDADE: Banco de Dados > Rascunho Local
        // Se houver qualquer valor vindo do banco, ele vence.
        if (bankValue !== undefined && bankValue !== null && Object.keys(bankValue as object).length > 0) {
          return bankValue;
        }
        
        // Se o banco estiver vazio e houver um rascunho que o usuário aceitou recuperar:
        if (shouldRecoverDrafts) return draftValue;
        
        return undefined;
      };

      const data = {
        ...baseConfig,
        hero: normalizeHeroSettings(
          getSectionValue(heroSource, drafts.heroSettings as HeroSettings),
        ),
        aboutHero: normalizeHeroSettings(
          getSectionValue(
            (layoutGlobal?.aboutHero || baseConfig.aboutHero) as HeroSettings,
            drafts.aboutHeroSettings as HeroSettings,
          ),
        ),
        story: normalizeSection(
          getSectionValue(
            (layoutGlobal?.story || baseConfig.story) as StorySettings,
            drafts.storySettings as StorySettings,
          ),
        ),
        team: normalizeSection(
          getSectionValue(
            (layoutGlobal?.team || baseConfig.team) as TeamSettings,
            drafts.teamSettings as TeamSettings,
          ),
        ),
        testimonials: normalizeSection(
          getSectionValue(
            (layoutGlobal?.testimonials ||
              baseConfig.testimonials) as TestimonialsSettings,
            drafts.testimonialsSettings as TestimonialsSettings,
          ),
        ),
        services: normalizeSection(
          getSectionValue(
            (home?.servicesSection ||
              home?.services ||
              layoutGlobal?.services ||
              baseConfig.services) as ServicesSettings,
            drafts.servicesSettings as ServicesSettings,
          ),
        ),
        values: normalizeSection(
          getSectionValue(
            (home?.valuesSection ||
              home?.values ||
              layoutGlobal?.values ||
              baseConfig.values) as ValuesSettings,
            drafts.valuesSettings as ValuesSettings,
          ),
        ),
        gallery: normalizeSection(
          getSectionValue(
            (home?.galleryPreview ||
              home?.gallerySection ||
              home?.gallery ||
              layoutGlobal?.gallery ||
              baseConfig.gallery) as GallerySettings,
            drafts.gallerySettings as GallerySettings,
          ),
        ),
        cta: normalizeSection(
          getSectionValue(
            (home?.ctaSection ||
              home?.cta ||
              layoutGlobal?.cta ||
              baseConfig.cta) as CTASettings,
            drafts.ctaSettings as CTASettings,
          ),
        ),
        header: getSectionValue(
          (layoutGlobal?.header || baseConfig.header) as HeaderSettings,
          drafts.headerSettings as HeaderSettings,
        ),
        footer: getSectionValue(
          (layoutGlobal?.footer || baseConfig.footer) as FooterSettings,
          drafts.footerSettings as FooterSettings,
        ),
        bookingService: getSectionValue(
          (layoutGlobal?.bookingService ||
            baseConfig.bookingService) as AppearanceSettings,
          drafts.bookingServiceSettings as AppearanceSettings,
        ),
        bookingDate: getSectionValue(
          (layoutGlobal?.bookingDate ||
            baseConfig.bookingDate) as AppearanceSettings,
          drafts.bookingDateSettings as AppearanceSettings,
        ),
        bookingTime: getSectionValue(
          (layoutGlobal?.bookingTime ||
            baseConfig.bookingTime) as AppearanceSettings,
          drafts.bookingTimeSettings as AppearanceSettings,
        ),
        bookingForm: getSectionValue(
          (layoutGlobal?.bookingForm ||
            baseConfig.bookingForm) as AppearanceSettings,
          drafts.bookingFormSettings as AppearanceSettings,
        ),
        bookingConfirmation: getSectionValue(
          (layoutGlobal?.bookingConfirmation ||
            baseConfig.bookingConfirmation) as AppearanceSettings,
          drafts.bookingConfirmationSettings as AppearanceSettings,
        ),
        font: getSectionValue(
          (layoutGlobal?.font || baseConfig.font) as FontSettings,
          drafts.fontSettings as FontSettings,
        ),
        color: getSectionValue(
          (layoutGlobal?.color || baseConfig.color) as ColorSettings,
          drafts.colorSettings as ColorSettings,
        ),
      } as SiteConfigData;

      console.log(
        ">>> [SYNC] Dados do banco carregados com autoridade. LocalStorage ignorado no refresh.",
      );

      const sanitizedHero = normalizeHeroSettings(data.hero);
      const bankUpdatedAt = baseConfig.updatedAt
        ? new Date(baseConfig.updatedAt).getTime()
        : config.updatedAt
          ? new Date(config.updatedAt).getTime()
          : 0;

      let heroDraft = normalizeHeroSettings(
        drafts.heroSettings as HeroSettings | undefined,
      );
      if (
        shouldRecoverDrafts &&
        heroDraft &&
        sanitizedHero?.appearance?.backgroundImageUrl &&
        !heroDraft.appearance?.backgroundImageUrl &&
        !heroDraft.bgImage
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

      // Autoridade máxima: Se temos dados do banco, eles SEMPRE sobrescrevem o local
      if (sanitizedHero) {
        setLastSavedHero(sanitizedHero);
        setHeroSettings(sanitizedHero);
      }

      // Resto das seções...
      const processSection = <T>(
        _draftKey: keyof EditorLocalDrafts,
        dataValue: T | undefined,
        setSettings: (v: T) => void,
        setLastSaved: (v: T) => void,
        defaultValue: T,
      ) => {
        if (dataValue) {
          setLastSaved(dataValue);
          setSettings(dataValue);
        } else {
          setSettings(defaultValue);
        }
      };

      processSection(
        "aboutHeroSettings",
        data.aboutHero,
        setAboutHeroSettings,
        setLastSavedAboutHero,
        defaultAboutHeroSettings,
      );
      processSection(
        "storySettings",
        data.story,
        setStorySettings,
        setLastSavedStory,
        defaultStorySettings,
      );
      processSection(
        "teamSettings",
        data.team,
        setTeamSettings,
        setLastSavedTeam,
        defaultTeamSettings,
      );
      processSection(
        "testimonialsSettings",
        data.testimonials,
        setTestimonialsSettings,
        setLastSavedTestimonials,
        defaultTestimonialsSettings,
      );
      processSection(
        "servicesSettings",
        data.services,
        setServicesSettings,
        setLastSavedServices,
        defaultServicesSettings,
      );
      processSection(
        "valuesSettings",
        data.values,
        setValuesSettings,
        setLastSavedValues,
        defaultValuesSettings,
      );
      processSection(
        "gallerySettings",
        data.gallery,
        setGallerySettings,
        setLastSavedGallery,
        defaultGallerySettings,
      );
      processSection(
        "ctaSettings",
        data.cta,
        setCTASettings,
        setLastSavedCTA,
        defaultCTASettings,
      );
      processSection(
        "headerSettings",
        data.header,
        setHeaderSettings,
        setLastSavedHeader,
        defaultHeaderSettings,
      );
      processSection(
        "footerSettings",
        data.footer,
        setFooterSettings,
        setLastSavedFooter,
        defaultFooterSettings,
      );
      processSection(
        "fontSettings",
        data.theme,
        setFontSettings,
        setLastSavedFont,
        defaultFontSettings,
      );
      processSection(
        "colorSettings",
        data.colors,
        setColorSettings,
        setLastSavedColor,
        defaultColorSettings,
      );

      // Booking steps...
      const bookingSteps = [
        {
          key: "bookingServiceSettings",
          data: data.bookingSteps?.service,
          set: setBookingServiceSettings,
          setLast: setLastSavedBookingService,
          def: defaultBookingServiceSettings,
        },
        {
          key: "bookingDateSettings",
          data: data.bookingSteps?.date,
          set: setBookingDateSettings,
          setLast: setLastSavedBookingDate,
          def: defaultBookingDateSettings,
        },
        {
          key: "bookingTimeSettings",
          data: data.bookingSteps?.time,
          set: setBookingTimeSettings,
          setLast: setLastSavedBookingTime,
          def: defaultBookingTimeSettings,
        },
        {
          key: "bookingFormSettings",
          data: data.bookingSteps?.form,
          set: setBookingFormSettings,
          setLast: setLastSavedBookingForm,
          def: defaultBookingFormSettings,
        },
        {
          key: "bookingConfirmationSettings",
          data: data.bookingSteps?.confirmation,
          set: setBookingConfirmationSettings,
          setLast: setLastSavedBookingConfirmation,
          def: defaultBookingConfirmationSettings,
        },
      ];

      bookingSteps.forEach((step) => {
        processSection(step.key, step.data, step.set, step.setLast, step.def);
      });

      if (data.pageVisibility) {
        setLastSavedPageVisibility(data.pageVisibility);
        setPageVisibility(data.pageVisibility);
      }

      if (data.visibleSections) {
        setLastSavedVisibleSections(data.visibleSections);
        setVisibleSections(data.visibleSections);
      }

      // Sincroniza sempre com o localStorage para que o preview reflita os dados do banco
      saveLocalDrafts({
        heroSettings: sanitizedHero || defaultHeroSettings,
        aboutHeroSettings: data.aboutHero || defaultAboutHeroSettings,
        storySettings: data.story || defaultStorySettings,
        teamSettings: data.team || defaultTeamSettings,
        testimonialsSettings: data.testimonials || defaultTestimonialsSettings,
        fontSettings:
          data.theme &&
          typeof data.theme === "object" &&
          Object.keys(data.theme).length > 0
            ? (data.theme as FontSettings)
            : data.font &&
                typeof data.font === "object" &&
                Object.keys(data.font).length > 0
              ? (data.font as FontSettings)
              : defaultFontSettings,
        colorSettings:
          data.colors &&
          typeof data.colors === "object" &&
          Object.keys(data.colors).length > 0
            ? (data.colors as ColorSettings)
            : data.color &&
                typeof data.color === "object" &&
                Object.keys(data.color).length > 0
              ? (data.color as ColorSettings)
              : defaultColorSettings,
        servicesSettings: data.services || defaultServicesSettings,
        valuesSettings: data.values || defaultValuesSettings,
        gallerySettings: data.gallery || defaultGallerySettings,
        ctaSettings: data.cta || defaultCTASettings,
        headerSettings: data.header || defaultHeaderSettings,
        footerSettings: data.footer || defaultFooterSettings,
        bookingServiceSettings:
          data.bookingSteps?.service &&
          typeof data.bookingSteps.service === "object" &&
          Object.keys(data.bookingSteps.service).length > 0
            ? (data.bookingSteps.service as BookingStepSettings)
            : data.bookingService &&
                typeof data.bookingService === "object" &&
                Object.keys(data.bookingService).length > 0
              ? (data.bookingService as BookingStepSettings)
              : defaultBookingServiceSettings,
        bookingDateSettings:
          data.bookingSteps?.date &&
          typeof data.bookingSteps.date === "object" &&
          Object.keys(data.bookingSteps.date).length > 0
            ? (data.bookingSteps.date as BookingStepSettings)
            : data.bookingDate &&
                typeof data.bookingDate === "object" &&
                Object.keys(data.bookingDate).length > 0
              ? (data.bookingDate as BookingStepSettings)
              : defaultBookingDateSettings,
        bookingTimeSettings:
          data.bookingSteps?.time &&
          typeof data.bookingSteps.time === "object" &&
          Object.keys(data.bookingSteps.time).length > 0
            ? (data.bookingSteps.time as BookingStepSettings)
            : data.bookingTime &&
                typeof data.bookingTime === "object" &&
                Object.keys(data.bookingTime).length > 0
              ? (data.bookingTime as BookingStepSettings)
              : defaultBookingTimeSettings,
        bookingFormSettings:
          data.bookingSteps?.form &&
          typeof data.bookingSteps.form === "object" &&
          Object.keys(data.bookingSteps.form).length > 0
            ? (data.bookingSteps.form as BookingStepSettings)
            : data.bookingForm &&
                typeof data.bookingForm === "object" &&
                Object.keys(data.bookingForm).length > 0
              ? (data.bookingForm as BookingStepSettings)
              : defaultBookingFormSettings,
        bookingConfirmationSettings:
          data.bookingSteps?.confirmation &&
          typeof data.bookingSteps.confirmation === "object" &&
          Object.keys(data.bookingSteps.confirmation).length > 0
            ? (data.bookingSteps.confirmation as BookingStepSettings)
            : data.bookingConfirmation &&
                typeof data.bookingConfirmation === "object" &&
                Object.keys(data.bookingConfirmation).length > 0
              ? (data.bookingConfirmation as BookingStepSettings)
              : defaultBookingConfirmationSettings,
        pageVisibility: data.pageVisibility || {},
        visibleSections: data.visibleSections || {},
      });

      // Dispara evento para o preview atualizar se necessário
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("local_draft_changed"));
      }

      if (typeof window !== "undefined") {
        const draftKey = getStorageKey("last_draft_update");
        if (bankUpdatedAt) {
          localStorage.setItem(
            draftKey,
            new Date(bankUpdatedAt).toISOString(),
          );
        } else {
          localStorage.removeItem(draftKey);
        }
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("DataReady"));
      }
    },
    [
      loadLocalDrafts,
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
    ],
  );

  return { loadExternalConfig };
}
