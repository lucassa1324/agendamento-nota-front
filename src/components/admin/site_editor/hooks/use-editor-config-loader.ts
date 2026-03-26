import { useCallback, useRef } from "react";
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
  slug?: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const normalizeSection = <T extends Record<string, unknown>>(
  value: T | undefined,
  defaultValue?: T,
): T | undefined => {
  if (!value || !isRecord(value)) return defaultValue;

  // Deep merge com o valor padrão para garantir que todos os campos existam
  const merged = defaultValue 
    ? { ...defaultValue, ...value } 
    : { ...value };

  // Tratamento de segurança contra o Object Object Bug
  // Se campos que deveriam ser strings vierem como objetos, extraímos o texto ou usamos o default
  const safeString = (val: unknown, defaultStr: string = ""): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val !== null) {
      const obj = val as Record<string, unknown>;
      // Tenta pegar o texto de várias formas comuns que o CMS pode enviar
      const extracted = (obj.text as string) || (obj.value as string) || (obj.content as string) || (obj.title as string);
      if (typeof extracted === 'string') return extracted;
      
      // Se ainda for objeto e tiver um toString personalizado, usa, senão retorna o default
      return defaultStr;
    }
    return val ? String(val) : defaultStr;
  };

  const content = isRecord(merged.content) ? merged.content : {};
  const appearance = isRecord(merged.appearance) ? merged.appearance : {};
  const cardConfig = isRecord(merged.cardConfig) ? merged.cardConfig : {};
  const itemsStyle = isRecord(merged.itemsStyle) ? merged.itemsStyle : {};

  const bgImage = safeString(appearance.backgroundImageUrl || merged.bgImage || "");

  let bgType: "color" | "image" = merged.bgType as "color" | "image";
    if (merged.bgType === "color" || merged.bgType === "image") {
      bgType = merged.bgType as "color" | "image";
    } 
    else if (typeof appearance.showBackgroundImage === "boolean") {
      bgType = appearance.showBackgroundImage ? "image" : "color";
    } 
    else {
      bgType = bgImage ? "image" : "color";
    }

  const bgColor = safeString(
    appearance.backgroundColor ||
    merged.backgroundColor ||
    merged.bgColor ||
    appearance.cardBgColor ||
    merged.cardBgColor ||
    ""
  );

  const cardBgColor = safeString(
    merged.cardBgColor ||
      (merged as Record<string, unknown>).cardBackgroundColor ||
      (merged as Record<string, unknown>).card_background_color ||
      content.cardBgColor ||
      appearance.cardBgColor ||
      appearance.cardBackgroundColor ||
      cardConfig.cardBackgroundColor ||
      cardConfig.backgroundColor ||
      itemsStyle.itemBackgroundColor ||
      ""
  );

  const flattened = {
    ...merged,
    ...content,
    ...appearance,
    title: safeString(content.title ?? merged.title ?? "", (defaultValue as Record<string, unknown> | undefined)?.title as string || ""),
    subtitle: safeString(content.subtitle ?? merged.subtitle ?? "", (defaultValue as Record<string, unknown> | undefined)?.subtitle as string || ""),
    description: safeString(content.description ?? merged.description ?? "", (defaultValue as Record<string, unknown> | undefined)?.description as string || ""),
    content: safeString(content.content ?? merged.content ?? "", (defaultValue as Record<string, unknown> | undefined)?.content as string || ""),
    bgImage,
    bgColor,
    bgType,
    cardBgColor,
    cardBackgroundColor:
      (merged as Record<string, unknown>).cardBackgroundColor || cardBgColor,
    overlayOpacity: appearance.overlayOpacity ?? merged.overlayOpacity ?? 0.5,
  };

  return flattened as T;
};

const normalizeHeroSettings = (
  value?: HeroSettings,
  defaultValue: HeroSettings = defaultHeroSettings,
) => {
  if (!value || !isRecord(value)) return defaultValue;

  const base = normalizeSection(value, defaultValue) || value;

  console.log("[BG_CHECK] Normalizando HeroSettings:", {
    type: base.bgType,
    hasImage: !!base.bgImage,
    bgColor: base.bgColor,
  });

  return {
    ...base,
    overlayOpacity: base.overlayOpacity ?? 0.5,
    imageOpacity:
      base.imageOpacity === defaultValue.imageOpacity
        ? 1
        : base.imageOpacity,
  };
};

const normalizeValuesSettings = (
  valuesSource: ValuesSettings | undefined,
  draftValue: ValuesSettings | undefined,
  defaultValue: ValuesSettings = defaultValuesSettings,
  getSectionValue: <T>(
    sectionKey: string,
    bankValue: T | undefined,
    draftValue: T | undefined,
    defaultValue?: T,
  ) => T | undefined,
  sectionKey: string,
  slug?: string | null,
) => {
  const valuesRecord = isRecord(valuesSource)
    ? (valuesSource as Record<string, unknown>)
    : undefined;
  const itemsStyle = valuesRecord?.itemsStyle as Record<string, unknown> | undefined;
  const itemsStyleCardBg =
    (itemsStyle?.itemBackgroundColor as string) || "";
    
  const content = valuesRecord?.content as Record<string, unknown> | undefined;
  const contentCardBg = content?.cardBgColor as string || "";
  const appearance = valuesRecord?.appearance as Record<string, unknown> | undefined;
  const appearanceCardBg =
    (appearance?.cardBgColor as string) ||
    (appearance?.cardBackgroundColor as string) ||
    "";

  const valuesSourceWithCardBg = (itemsStyleCardBg || contentCardBg || appearanceCardBg)
    ? {
        ...valuesRecord,
        cardBgColor: (valuesRecord?.cardBgColor as string | undefined) ||
          contentCardBg ||
          appearanceCardBg ||
          itemsStyleCardBg,
        cardBackgroundColor:
          (valuesRecord?.cardBackgroundColor as string | undefined) ||
          contentCardBg || appearanceCardBg || itemsStyleCardBg,
      }
    : (valuesRecord || defaultValue);

  const base = normalizeSection(
    getSectionValue(
      sectionKey,
      valuesSourceWithCardBg,
      draftValue,
      defaultValue,
    ),
    defaultValue,
  );

  const sourceBgColor =
    (valuesRecord?.bgColor as string | undefined) ||
    (valuesRecord?.backgroundColor as string | undefined) ||
    (valuesRecord?.appearance as Record<string, unknown>)?.backgroundColor;

  const sourceCardBgColor =
    (valuesRecord?.cardBgColor as string | undefined) ||
    (valuesRecord?.cardBackgroundColor as string | undefined) ||
    (valuesRecord as Record<string, unknown> | undefined)?.card_background_color ||
    (valuesRecord?.cardConfig as Record<string, unknown>)?.backgroundColor ||
    (valuesRecord?.cardConfig as Record<string, unknown>)?.cardBackgroundColor ||
    appearanceCardBg ||
    contentCardBg ||
    itemsStyleCardBg;

  const hasExplicitBg = Boolean(
    sourceBgColor && sourceBgColor !== sourceCardBgColor,
  );

  const baseAppearance = base && isRecord(base.appearance) ? base.appearance : {};
  if (!hasExplicitBg && base?.cardBgColor && base.bgColor === base.cardBgColor) {
    return {
      ...base,
      bgColor: "",
      appearance: { ...baseAppearance, backgroundColor: "" },
    };
  }

  const baseItems = base && Array.isArray(base.items) ? base.items : undefined;
  if (slug === "aura.teste" && (!baseItems || baseItems.length < 5)) {
    return {
      ...defaultValue,
      ...base,
      items: defaultValue?.items,
    };
  }

  return base;
};

export function useEditorConfigLoader({
  local,
  state,
  checkShouldRecoverDraft,
  slug,
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
    setHomeValuesSettings,
    setAboutUsValuesSettings,
    setGallerySettings,
    setGalleryPageSettings,
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
    setLastSavedHomeValues,
    setLastSavedAboutUsValues,
    setLastSavedGallery,
    setLastSavedGalleryPage,
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
    setLastAppliedHomeValues,
    setLastAppliedAboutUsValues,
    setLastAppliedGallery,
    setLastAppliedGalleryPage,
    setLastAppliedCTA,
    setLastAppliedHeader,
    setLastAppliedFooter,
    setLastAppliedBookingService,
    setLastAppliedBookingDate,
    setLastAppliedBookingTime,
    setLastAppliedBookingForm,
    setLastAppliedBookingConfirmation,
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

      // LOG de Sincronização
      const apiTime = baseConfig.updatedAt ? new Date(baseConfig.updatedAt).getTime() : 0;
      const localTime = Number(drafts.draftTimestamp) || 0;
      const isFallback = (config as Record<string, unknown>).isFallback || (baseConfig as Record<string, unknown>).isFallback;
      
      console.log(`>>> [SYNC_CHECK] Server: ${apiTime} | Local: ${localTime} | Fallback: ${isFallback}`);

      // REMOVIDO: Sincronização automática para o LocalStorage. 
      // O Banco de Dados é a única fonte da verdade no F5.
      // if (apiTime > localTime && !isFallback) { ... }

      const layoutGlobal = (baseConfig.layoutGlobal ||
        baseConfig.layout_global) as Record<string, unknown> | undefined;
      const home = baseConfig.home as
        | Record<string, Record<string, unknown>>
        | undefined;
      const aboutUs = (baseConfig as Record<string, unknown>)?.aboutUs as
        | Record<string, unknown>
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

      const isBankValueEmptyOrDefault = <T>(
        bankValue: T | undefined,
        defaultValue?: T,
      ): boolean => {
        const isBankValueValid =
          bankValue !== undefined &&
          bankValue !== null &&
          Object.keys(bankValue as object).length > 0;

        return (
          !isBankValueValid ||
          (!!defaultValue &&
            JSON.stringify(bankValue) === JSON.stringify(defaultValue))
        );
      };

      const getSectionValue = <T>(
        sectionKey: string,
        bankValue: T | undefined,
        draftValue: T | undefined,
        defaultValue?: T,
      ): T | undefined => {
        const apiTime = baseConfig.updatedAt
          ? new Date(baseConfig.updatedAt).getTime()
          : config.updatedAt
            ? new Date(config.updatedAt).getTime()
            : 0;

        const localTime = Number(drafts.draftTimestamp) || 0;
        const isLocalNewer = shouldRecoverDrafts && localTime > apiTime;
        const isServerNewer = apiTime > localTime;
        const isFallback = (config as Record<string, unknown>).isFallback || (baseConfig as Record<string, unknown>).isFallback;

        // Mapeamento inteligente para chaves de agendamento (JSONB aninhado)
        let effectiveBankValue = bankValue;
        if (sectionKey.startsWith("booking")) {
          const stepKey = sectionKey
            .replace("booking", "")
            .replace("Settings", "")
            .toLowerCase();
          
          const appointmentFlow = (baseConfig as Record<string, unknown>).appointmentFlow as Record<string, unknown> | undefined;
          const nestedValue = 
            (appointmentFlow?.[stepKey] as Record<string, unknown>) || 
            (appointmentFlow?.steps as Record<string, unknown>)?.[stepKey] ||
            (appointmentFlow?.steps as Record<string, unknown>)?.step1Services || // Mapeamento profundo para step1Services
            ((baseConfig as Record<string, unknown>).bookingSteps as Record<string, unknown>)?.[stepKey];

          if (nestedValue && !isBankValueEmptyOrDefault(nestedValue as T, defaultValue)) {
            effectiveBankValue = nestedValue as T;
          }
        }

        const isBankEmpty = isBankValueEmptyOrDefault(effectiveBankValue, defaultValue);

        console.log(
          `>>> [SYNC] Section: ${sectionKey} | Local: ${localTime} | Server: ${apiTime} | LocalNewer: ${isLocalNewer} | ServerNewer: ${isServerNewer} | BankEmpty: ${isBankEmpty} | IsFallback: ${isFallback}`,
        );

        // 1. Se o banco falhou (fallback), o LocalStorage vence sempre
        if (isFallback) {
          console.log(`>>> [LOADER] Fallback detectado para ${sectionKey}. Usando rascunho local.`);
          return draftValue || defaultValue;
        }

        // 2. Se o servidor for MAIS RECENTE que o rascunho local, o servidor vence e limpa o conflito.
        if (isServerNewer && !isBankEmpty) {
          console.log(`>>> [LOADER] Servidor é mais recente para ${sectionKey}. Sincronizando LocalStorage.`);
          return effectiveBankValue;
        }

        // 3. Se o rascunho local for MAIS RECENTE e tiver dados válidos, use o rascunho.
        if (
          isLocalNewer &&
          draftValue !== undefined &&
          draftValue !== null &&
          Object.keys(draftValue as object).length > 0
        ) {
          console.log(`>>> [LOADER] Rascunho local é mais recente para ${sectionKey}.`);
          return draftValue;
        }

        // 4. Se o banco NÃO estiver vazio e não houver rascunho mais recente, o banco vence.
        if (!isBankEmpty) {
          return effectiveBankValue;
        }

        // 5. Se o banco for vazio/default, mas o LocalStorage tiver dados, não sobrescreva (preserva edição em andamento).
        if (
          isBankEmpty &&
          draftValue !== undefined &&
          draftValue !== null &&
          Object.keys(draftValue as object).length > 0
        ) {
          console.log(`>>> [LOADER] Banco vazio/default para ${sectionKey}, preservando rascunho local.`);
          return draftValue;
        }

        // Fallback final
        if (shouldRecoverDrafts) return draftValue;

        return defaultValue;
      };

      const data = {
        ...baseConfig,
        hero: normalizeHeroSettings(
          getSectionValue(
            "heroSettings",
            heroSource,
            drafts.heroSettings as HeroSettings,
            defaultHeroSettings,
          ),
          defaultHeroSettings,
        ),
        aboutHero: normalizeHeroSettings(
          getSectionValue(
            "aboutHeroSettings",
            (layoutGlobal?.aboutHero || baseConfig.aboutHero) as HeroSettings,
            drafts.aboutHeroSettings as HeroSettings,
            defaultAboutHeroSettings,
          ),
          defaultAboutHeroSettings,
        ),
        story: normalizeSection(
          getSectionValue(
            "storySettings",
            (home?.storySection ||
              home?.story ||
              layoutGlobal?.story ||
              baseConfig.story) as StorySettings,
            drafts.storySettings as StorySettings,
            defaultStorySettings,
          ),
          defaultStorySettings,
        ),
        team: normalizeSection(
          getSectionValue(
            "teamSettings",
            (home?.teamSection ||
              home?.team ||
              layoutGlobal?.team ||
              baseConfig.team) as TeamSettings,
            drafts.teamSettings as TeamSettings,
            defaultTeamSettings,
          ),
          defaultTeamSettings,
        ),
        testimonials: normalizeSection(
          getSectionValue(
            "testimonialsSettings",
            (home?.testimonialsSection ||
              home?.testimonials ||
              layoutGlobal?.testimonials ||
              baseConfig.testimonials) as TestimonialsSettings,
            drafts.testimonialsSettings as TestimonialsSettings,
            defaultTestimonialsSettings,
          ),
          defaultTestimonialsSettings,
        ),
        services: normalizeSection(
          getSectionValue(
            "servicesSettings",
            (() => {
              const servicesSource = (home?.servicesSection ||
                home?.services ||
                layoutGlobal?.services ||
                baseConfig.services) as ServicesSettings;
              
              const cardConfig = (servicesSource as Record<string, unknown>)?.cardConfig as Record<string, unknown>;
              if (cardConfig) {
                return {
                  ...servicesSource,
                  cardBgColor: (cardConfig.cardBackgroundColor as string) || (cardConfig.backgroundColor as string) || (servicesSource as Record<string, unknown>).cardBgColor as string,
                };
              }
              return servicesSource;
            })(),
            drafts.servicesSettings as ServicesSettings,
            defaultServicesSettings,
          ),
          defaultServicesSettings,
        ),
        homeValuesSettings: normalizeValuesSettings(
          (baseConfig.homeValuesSettings ||
            layoutGlobal?.homeValuesSettings ||
            home?.valuesSection ||
            home?.values ||
            baseConfig.values) as ValuesSettings,
          drafts.homeValuesSettings as ValuesSettings,
          defaultValuesSettings,
          getSectionValue,
          "homeValuesSettings",
          slug,
        ),
        aboutUsValuesSettings: normalizeValuesSettings(
          (baseConfig.aboutUsValuesSettings ||
            layoutGlobal?.aboutUsValuesSettings ||
            aboutUs?.valuesSection ||
            aboutUs?.values ||
            baseConfig.values) as ValuesSettings,
          drafts.aboutUsValuesSettings as ValuesSettings,
          defaultValuesSettings,
          getSectionValue,
          "aboutUsValuesSettings",
          slug,
        ),
        visibleSections: (() => {
          const base = (drafts.visibleSections as Record<string, boolean>) || 
            layoutGlobal?.visibleSections || 
            layoutGlobal?.visible_sections ||
            baseConfig.visibleSections || 
            baseConfig.visible_sections || 
            {};
          const resolvedAboutValues =
            base["about-values"] ?? base.values ?? true;
          
          // Forçar visibilidade para aura.teste se estiverem faltando
          if (slug === "aura.teste") {
            return {
              ...base,
              hero: true,
              services: true,
              gallery: true,
              cta: true,
              footer: true,
              values: true,
              "about-values": true,
              story: true,
              testimonials: true,
              team: true,
            };
          }
          return base["about-values"] === undefined
            ? {
                ...base,
                "about-values": resolvedAboutValues,
              }
            : base;
        })(),
        galleryPreviewSettings: normalizeSection(
          getSectionValue(
            "gallerySettings",
            (baseConfig.galleryPreviewSettings ||
              home?.galleryPreview ||
              home?.gallerySection ||
              layoutGlobal?.galleryPreview ||
              layoutGlobal?.gallerySection) as GallerySettings,
            drafts.gallerySettings as GallerySettings,
            defaultGallerySettings,
          ),
          defaultGallerySettings,
        ),
        galleryPageSettings: normalizeSection(
          getSectionValue(
            "galleryPageSettings",
            baseConfig.galleryPageSettings as GallerySettings,
            drafts.galleryPageSettings as GallerySettings,
            defaultGallerySettings,
          ),
          defaultGallerySettings,
        ),
        cta: normalizeSection(
          getSectionValue(
            "ctaSettings",
            (home?.ctaSection ||
              home?.cta ||
              layoutGlobal?.cta ||
              baseConfig.cta) as CTASettings,
            drafts.ctaSettings as CTASettings,
            defaultCTASettings,
          ),
          defaultCTASettings,
        ),
        header: getSectionValue(
          "headerSettings",
          (layoutGlobal?.header || baseConfig.header) as HeaderSettings,
          drafts.headerSettings as HeaderSettings,
          defaultHeaderSettings,
        ),
        footer: getSectionValue(
          "footerSettings",
          (layoutGlobal?.footer || baseConfig.footer) as FooterSettings,
          drafts.footerSettings as FooterSettings,
          defaultFooterSettings,
        ),
        bookingService: getSectionValue(
          "bookingServiceSettings",
          ((baseConfig.appointmentFlow as Record<string, unknown>)?.service ||
            ((baseConfig.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.service ||
            (baseConfig.bookingSteps as Record<string, unknown>)?.service ||
            baseConfig.bookingService) as BookingStepSettings,
          drafts.bookingServiceSettings as BookingStepSettings,
          defaultBookingServiceSettings,
        ),
        bookingDate: getSectionValue(
          "bookingDateSettings",
          ((baseConfig.appointmentFlow as Record<string, unknown>)?.date ||
            ((baseConfig.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.date ||
            (baseConfig.bookingSteps as Record<string, unknown>)?.date ||
            baseConfig.bookingDate) as BookingStepSettings,
          drafts.bookingDateSettings as BookingStepSettings,
          defaultBookingDateSettings,
        ),
        bookingTime: getSectionValue(
          "bookingTimeSettings",
          ((baseConfig.appointmentFlow as Record<string, unknown>)?.time ||
            ((baseConfig.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.time ||
            (baseConfig.bookingSteps as Record<string, unknown>)?.time ||
            baseConfig.bookingTime) as BookingStepSettings,
          drafts.bookingTimeSettings as BookingStepSettings,
          defaultBookingTimeSettings,
        ),
        bookingForm: getSectionValue(
          "bookingFormSettings",
          ((baseConfig.appointmentFlow as Record<string, unknown>)?.form ||
            ((baseConfig.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.form ||
            (baseConfig.bookingSteps as Record<string, unknown>)?.form ||
            baseConfig.bookingForm) as BookingStepSettings,
          drafts.bookingFormSettings as BookingStepSettings,
          defaultBookingFormSettings,
        ),
        bookingConfirmation: getSectionValue(
          "bookingConfirmationSettings",
          ((baseConfig.appointmentFlow as Record<string, unknown>)?.confirmation ||
            ((baseConfig.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.confirmation ||
            (baseConfig.bookingSteps as Record<string, unknown>)?.confirmation ||
            baseConfig.bookingConfirmation) as BookingStepSettings,
          drafts.bookingConfirmationSettings as BookingStepSettings,
          defaultBookingConfirmationSettings,
        ),
        font: getSectionValue(
          "fontSettings",
          (layoutGlobal?.font || baseConfig.font) as FontSettings,
          drafts.fontSettings as FontSettings,
          defaultFontSettings,
        ),
        color: getSectionValue(
          "colorSettings",
          (layoutGlobal?.color || baseConfig.color) as ColorSettings,
          drafts.colorSettings as ColorSettings,
          defaultColorSettings,
        ),
      } as SiteConfigData;

      console.log(
        ">>> [SYNC] Dados do banco carregados com autoridade. LocalStorage ignorado no refresh.",
      );

      const sanitizedHero = normalizeHeroSettings(data.hero);

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

      // Autoridade máxima removida: agora usamos getSectionValue que já decide entre banco e rascunho.
      if (sanitizedHero) {
        // Se o valor carregado for igual ao rascunho e o rascunho for mais recente, 
        // mantemos o lastSaved como o valor do banco para permitir salvar.
        const isUsingDraft = JSON.stringify(sanitizedHero) === JSON.stringify(drafts.heroSettings);
        
        if (isUsingDraft && !isBankValueEmptyOrDefault(heroSource, defaultHeroSettings)) {
          setLastSavedHero(normalizeHeroSettings(heroSource) || defaultHeroSettings);
        } else {
        setLastSavedHero(sanitizedHero);
        }
        setHeroSettings(sanitizedHero);
      if (force) {
        setLastAppliedHero(sanitizedHero);
      }
      }

      // Resto das seções...
      const processSection = <T>(
        _draftKey: keyof EditorLocalDrafts,
        dataValue: T | undefined,
        setSettings: (v: T) => void,
        setLastSaved: (v: T) => void,
      setLastApplied: ((v: T) => void) | undefined,
        defaultValue: T,
        bankValue: T | undefined,
      ) => {
        if (dataValue) {
          const isUsingDraft =
            JSON.stringify(dataValue) === JSON.stringify(drafts[_draftKey]);

          if (
            isUsingDraft &&
            !isBankValueEmptyOrDefault(bankValue, defaultValue)
          ) {
            setLastSaved(bankValue || defaultValue);
          } else {
            setLastSaved(dataValue);
          }
        setSettings(dataValue);
        if (force && setLastApplied) {
          setLastApplied(dataValue);
        }
      } else {
        setSettings(defaultValue);
        setLastSaved(defaultValue);
        if (force && setLastApplied) {
          setLastApplied(defaultValue);
        }
      }
      };

      const normalizeColorSettings = (value?: ColorSettings): ColorSettings => {
        const record = (value || {}) as Record<string, unknown>;
        const badgeRecord =
          (record.specialtyBadge as Record<string, unknown>) ||
          (record.specialty_badge as Record<string, unknown>) ||
          {};
        return {
          ...defaultColorSettings,
          ...value,
          specialtyBadge: {
            ...defaultColorSettings.specialtyBadge,
            background:
              (badgeRecord.background as string) ||
              defaultColorSettings.specialtyBadge.background,
            text:
              (badgeRecord.text as string) ||
              defaultColorSettings.specialtyBadge.text,
            borderRadius:
              (badgeRecord.borderRadius as string) ||
              (badgeRecord.border_radius as string) ||
              defaultColorSettings.specialtyBadge.borderRadius,
          },
        };
      };

      processSection(
        "aboutHeroSettings",
        data.aboutHero as HeroSettings,
        setAboutHeroSettings,
        setLastSavedAboutHero,
        setLastAppliedAboutHero,
        defaultAboutHeroSettings,
        (layoutGlobal?.aboutHero || baseConfig.aboutHero) as HeroSettings,
      );
      processSection(
        "storySettings",
        data.story as StorySettings,
        setStorySettings,
        setLastSavedStory,
        setLastAppliedStory,
        defaultStorySettings,
        (layoutGlobal?.story || baseConfig.story) as StorySettings,
      );
      processSection(
        "teamSettings",
        data.team as TeamSettings,
        setTeamSettings,
        setLastSavedTeam,
        setLastAppliedTeam,
        defaultTeamSettings,
        (layoutGlobal?.team || baseConfig.team) as TeamSettings,
      );
      processSection(
        "testimonialsSettings",
        data.testimonials as TestimonialsSettings,
        setTestimonialsSettings,
        setLastSavedTestimonials,
        setLastAppliedTestimonials,
        defaultTestimonialsSettings,
        (layoutGlobal?.testimonials ||
          baseConfig.testimonials) as TestimonialsSettings,
      );
      processSection(
        "servicesSettings",
        data.services as ServicesSettings,
        setServicesSettings,
        setLastSavedServices,
        setLastAppliedServices,
        defaultServicesSettings,
        (home?.servicesSection ||
          home?.services ||
          layoutGlobal?.services ||
          baseConfig.services) as ServicesSettings,
      );
      processSection(
        "homeValuesSettings",
        data.homeValuesSettings as ValuesSettings,
        setHomeValuesSettings,
        setLastSavedHomeValues,
        setLastAppliedHomeValues,
        defaultValuesSettings,
        (baseConfig.homeValuesSettings ||
          layoutGlobal?.homeValuesSettings ||
          home?.valuesSection ||
          home?.values ||
          baseConfig.values) as ValuesSettings,
      );
      processSection(
        "aboutUsValuesSettings",
        data.aboutUsValuesSettings as ValuesSettings,
        setAboutUsValuesSettings,
        setLastSavedAboutUsValues,
        setLastAppliedAboutUsValues,
        defaultValuesSettings,
        (baseConfig.aboutUsValuesSettings ||
          layoutGlobal?.aboutUsValuesSettings ||
          aboutUs?.valuesSection ||
          aboutUs?.values ||
          baseConfig.values) as ValuesSettings,
      );
      processSection(
        "gallerySettings",
        data.galleryPreviewSettings as GallerySettings,
        setGallerySettings,
        setLastSavedGallery,
        setLastAppliedGallery,
        defaultGallerySettings,
        (baseConfig.galleryPreviewSettings ||
          home?.galleryPreview ||
          home?.gallerySection ||
          layoutGlobal?.galleryPreview ||
          layoutGlobal?.gallerySection) as GallerySettings,
      );
      processSection(
        "galleryPageSettings",
        data.galleryPageSettings as GallerySettings,
        setGalleryPageSettings,
        setLastSavedGalleryPage,
        setLastAppliedGalleryPage,
        defaultGallerySettings,
        (baseConfig.galleryPageSettings ||
          baseConfig.gallery ||
          layoutGlobal?.gallery) as GallerySettings,
      );
      processSection(
        "ctaSettings",
        data.cta as CTASettings,
        setCTASettings,
        setLastSavedCTA,
        setLastAppliedCTA,
        defaultCTASettings,
        (home?.ctaSection ||
          home?.cta ||
          layoutGlobal?.cta ||
          baseConfig.cta) as CTASettings,
      );
      processSection(
        "headerSettings",
        data.header as HeaderSettings,
        setHeaderSettings,
        setLastSavedHeader,
        setLastAppliedHeader,
        defaultHeaderSettings,
        (layoutGlobal?.header || baseConfig.header) as HeaderSettings,
      );
      processSection(
        "footerSettings",
        data.footer as FooterSettings,
        setFooterSettings,
        setLastSavedFooter,
        setLastAppliedFooter,
        defaultFooterSettings,
        (layoutGlobal?.footer || baseConfig.footer) as FooterSettings,
      );
      processSection(
        "fontSettings",
        data.font as FontSettings,
        setFontSettings,
        setLastSavedFont,
        setLastAppliedFont,
        defaultFontSettings,
        (layoutGlobal?.font || baseConfig.font) as FontSettings,
      );
      const normalizedColorData = normalizeColorSettings(
        data.color as ColorSettings,
      );
      const normalizedColorBank = normalizeColorSettings(
        (layoutGlobal?.color || baseConfig.color) as ColorSettings,
      );
      processSection(
        "colorSettings",
        normalizedColorData,
        setColorSettings,
        setLastSavedColor,
        setLastAppliedColor,
        defaultColorSettings,
        normalizedColorBank,
      );

      // Booking steps...
      const bookingSteps = [
        {
          key: "bookingServiceSettings" as keyof EditorLocalDrafts,
          data: data.bookingService as BookingStepSettings, // Usando data (que é draft-aware)
          bank:
            ((layoutGlobal?.bookingSteps as Record<string, unknown>)?.service as BookingStepSettings) ||
            ((baseConfig.bookingSteps as Record<string, unknown>)?.service as BookingStepSettings) ||
            (((layoutGlobal?.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.service as BookingStepSettings) ||
            (((baseConfig.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.service as BookingStepSettings) ||
            ((layoutGlobal?.appointmentFlow as Record<string, unknown>)?.service as BookingStepSettings) ||
            ((baseConfig.appointmentFlow as Record<string, unknown>)?.service as BookingStepSettings) ||
            (layoutGlobal as Record<string, unknown>)?.bookingService ||
            (baseConfig as Record<string, unknown>).bookingService,
          set: setBookingServiceSettings as (v: BookingStepSettings) => void,
          setLast: setLastSavedBookingService as (v: BookingStepSettings) => void,
          setApplied: setLastAppliedBookingService as (
            v: BookingStepSettings,
          ) => void,
          def: defaultBookingServiceSettings,
        },
        {
          key: "bookingDateSettings" as keyof EditorLocalDrafts,
          data: data.bookingDate as BookingStepSettings,
          bank:
            ((layoutGlobal?.bookingSteps as Record<string, unknown>)?.date as BookingStepSettings) ||
            ((baseConfig.bookingSteps as Record<string, unknown>)?.date as BookingStepSettings) ||
            (((layoutGlobal?.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.date as BookingStepSettings) ||
            (((baseConfig.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.date as BookingStepSettings) ||
            ((layoutGlobal?.appointmentFlow as Record<string, unknown>)?.date as BookingStepSettings) ||
            ((baseConfig.appointmentFlow as Record<string, unknown>)?.date as BookingStepSettings) ||
            (layoutGlobal as Record<string, unknown>)?.bookingDate ||
            (baseConfig as Record<string, unknown>).bookingDate,
          set: setBookingDateSettings as (v: BookingStepSettings) => void,
          setLast: setLastSavedBookingDate as (v: BookingStepSettings) => void,
          setApplied: setLastAppliedBookingDate as (
            v: BookingStepSettings,
          ) => void,
          def: defaultBookingDateSettings,
        },
        {
          key: "bookingTimeSettings" as keyof EditorLocalDrafts,
          data: data.bookingTime as BookingStepSettings,
          bank:
            ((layoutGlobal?.bookingSteps as Record<string, unknown>)?.time as BookingStepSettings) ||
            ((baseConfig.bookingSteps as Record<string, unknown>)?.time as BookingStepSettings) ||
            (((layoutGlobal?.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.time as BookingStepSettings) ||
            (((baseConfig.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.time as BookingStepSettings) ||
            ((layoutGlobal?.appointmentFlow as Record<string, unknown>)?.time as BookingStepSettings) ||
            ((baseConfig.appointmentFlow as Record<string, unknown>)?.time as BookingStepSettings) ||
            (layoutGlobal as Record<string, unknown>)?.bookingTime ||
            (baseConfig as Record<string, unknown>).bookingTime,
          set: setBookingTimeSettings as (v: BookingStepSettings) => void,
          setLast: setLastSavedBookingTime as (v: BookingStepSettings) => void,
          setApplied: setLastAppliedBookingTime as (
            v: BookingStepSettings,
          ) => void,
          def: defaultBookingTimeSettings,
        },
        {
          key: "bookingFormSettings" as keyof EditorLocalDrafts,
          data: data.bookingForm as BookingStepSettings,
          bank:
            ((layoutGlobal?.bookingSteps as Record<string, unknown>)?.form as BookingStepSettings) ||
            ((baseConfig.bookingSteps as Record<string, unknown>)?.form as BookingStepSettings) ||
            (((layoutGlobal?.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.form as BookingStepSettings) ||
            (((baseConfig.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.form as BookingStepSettings) ||
            ((layoutGlobal?.appointmentFlow as Record<string, unknown>)?.form as BookingStepSettings) ||
            ((baseConfig.appointmentFlow as Record<string, unknown>)?.form as BookingStepSettings) ||
            (layoutGlobal as Record<string, unknown>)?.bookingForm ||
            (baseConfig as Record<string, unknown>).bookingForm,
          set: setBookingFormSettings as (v: BookingStepSettings) => void,
          setLast: setLastSavedBookingForm as (v: BookingStepSettings) => void,
          setApplied: setLastAppliedBookingForm as (
            v: BookingStepSettings,
          ) => void,
          def: defaultBookingFormSettings,
        },
        {
          key: "bookingConfirmationSettings" as keyof EditorLocalDrafts,
          data: data.bookingConfirmation as BookingStepSettings,
          bank:
            ((layoutGlobal?.bookingSteps as Record<string, unknown>)?.confirmation as BookingStepSettings) ||
            ((baseConfig.bookingSteps as Record<string, unknown>)?.confirmation as BookingStepSettings) ||
            (((layoutGlobal?.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.confirmation as BookingStepSettings) ||
            (((baseConfig.appointmentFlow as Record<string, unknown>)?.steps as Record<string, unknown>)?.confirmation as BookingStepSettings) ||
            ((layoutGlobal?.appointmentFlow as Record<string, unknown>)?.confirmation as BookingStepSettings) ||
            ((baseConfig.appointmentFlow as Record<string, unknown>)?.confirmation as BookingStepSettings) ||
            (layoutGlobal as Record<string, unknown>)?.bookingConfirmation ||
            (baseConfig as Record<string, unknown>).bookingConfirmation,
          set: setBookingConfirmationSettings as (v: BookingStepSettings) => void,
          setLast: setLastSavedBookingConfirmation as (v: BookingStepSettings) => void,
          setApplied: setLastAppliedBookingConfirmation as (
            v: BookingStepSettings,
          ) => void,
          def: defaultBookingConfirmationSettings,
        },
      ];

      bookingSteps.forEach((step) => {
        processSection(
          step.key,
          step.data,
          step.set,
          step.setLast,
          step.setApplied,
          step.def,
          step.bank as BookingStepSettings,
        );
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
          (data as Record<string, unknown>).theme &&
          typeof (data as Record<string, unknown>).theme === "object" &&
          Object.keys((data as Record<string, unknown>).theme as object).length > 0
            ? ((data as Record<string, unknown>).theme as FontSettings)
            : data.font &&
                typeof data.font === "object" &&
                Object.keys(data.font).length > 0
              ? (data.font as FontSettings)
              : defaultFontSettings,
        colorSettings:
          (data as Record<string, unknown>).colors &&
          typeof (data as Record<string, unknown>).colors === "object" &&
          Object.keys((data as Record<string, unknown>).colors as object).length > 0
            ? ((data as Record<string, unknown>).colors as ColorSettings)
            : data.color &&
                typeof data.color === "object" &&
                Object.keys(data.color).length > 0
              ? (data.color as ColorSettings)
              : defaultColorSettings,
        servicesSettings: data.services || defaultServicesSettings,
        homeValuesSettings: data.homeValuesSettings || defaultValuesSettings,
        aboutUsValuesSettings: data.aboutUsValuesSettings || defaultValuesSettings,
        gallerySettings:
          (data.galleryPreviewSettings as GallerySettings) ||
          defaultGallerySettings,
        galleryPageSettings:
          (data.galleryPageSettings as GallerySettings) ||
          defaultGallerySettings,
        ctaSettings: data.cta || defaultCTASettings,
        headerSettings: data.header || defaultHeaderSettings,
        footerSettings: data.footer || defaultFooterSettings,
        bookingServiceSettings:
          ((data as Record<string, unknown>).bookingSteps as Record<string, unknown>)?.service &&
          typeof ((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).service === "object" &&
          Object.keys(((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).service as object).length > 0
            ? (((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).service as BookingStepSettings)
            : data.bookingService &&
                typeof data.bookingService === "object" &&
                Object.keys(data.bookingService).length > 0
              ? (data.bookingService as BookingStepSettings)
              : defaultBookingServiceSettings,
        bookingDateSettings:
          ((data as Record<string, unknown>).bookingSteps as Record<string, unknown>)?.date &&
          typeof ((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).date === "object" &&
          Object.keys(((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).date as object).length > 0
            ? (((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).date as BookingStepSettings)
            : data.bookingDate &&
                typeof data.bookingDate === "object" &&
                Object.keys(data.bookingDate).length > 0
              ? (data.bookingDate as BookingStepSettings)
              : defaultBookingDateSettings,
        bookingTimeSettings:
          ((data as Record<string, unknown>).bookingSteps as Record<string, unknown>)?.time &&
          typeof ((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).time === "object" &&
          Object.keys(((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).time as object).length > 0
            ? (((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).time as BookingStepSettings)
            : data.bookingTime &&
                typeof data.bookingTime === "object" &&
                Object.keys(data.bookingTime).length > 0
              ? (data.bookingTime as BookingStepSettings)
              : defaultBookingTimeSettings,
        bookingFormSettings:
          ((data as Record<string, unknown>).bookingSteps as Record<string, unknown>)?.form &&
          typeof ((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).form === "object" &&
          Object.keys(((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).form as object).length > 0
            ? (((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).form as BookingStepSettings)
            : data.bookingForm &&
                typeof data.bookingForm === "object" &&
                Object.keys(data.bookingForm).length > 0
              ? (data.bookingForm as BookingStepSettings)
              : defaultBookingFormSettings,
        bookingConfirmationSettings:
          ((data as Record<string, unknown>).bookingSteps as Record<string, unknown>)?.confirmation &&
          typeof ((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).confirmation === "object" &&
          Object.keys(((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).confirmation as object).length > 0
            ? (((data as Record<string, unknown>).bookingSteps as Record<string, unknown>).confirmation as BookingStepSettings)
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
      setHomeValuesSettings,
      setAboutUsValuesSettings,
      setGallerySettings,
      setGalleryPageSettings,
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
      setLastSavedHomeValues,
      setLastSavedAboutUsValues,
      setLastSavedGallery,
      setLastSavedGalleryPage,
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
      setLastAppliedHomeValues,
      setLastAppliedAboutUsValues,
      setLastAppliedGallery,
      setLastAppliedGalleryPage,
      setLastAppliedCTA,
      setLastAppliedHeader,
      setLastAppliedFooter,
      setLastAppliedBookingService,
      setLastAppliedBookingDate,
      setLastAppliedBookingTime,
      setLastAppliedBookingForm,
      setLastAppliedBookingConfirmation,
      checkShouldRecoverDraft,
      slug,
    ],
  );

  return { loadExternalConfig };
}
