"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL, BASE_DOMAIN } from "@/lib/auth-client";
import type {
  Business,
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
  getStorageKey,
  normalizeStepSettings,
  sanitizeColor,
  saveAboutHeroSettings,
  saveAboutUsValuesSettings,
  saveBookingConfirmationSettings,
  saveBookingDateSettings,
  saveBookingFormSettings,
  saveBookingServiceSettings,
  saveBookingTimeSettings,
  saveColorSettings,
  saveCTASettings,
  saveFontSettings,
  saveFooterSettings,
  saveGalleryPageSettings,
  saveGallerySettings,
  saveHeaderSettings,
  saveHeroSettings,
  saveHomeValuesSettings,
  savePageVisibility,
  saveServices,
  saveServicesSettings,
  saveSiteProfile,
  saveStorySettings,
  saveTeamSettings,
  saveTestimonialsSettings,
  saveVisibleSections,
} from "@/lib/booking-data";
import type { SiteConfigData } from "@/lib/site-config-types";
import { siteCustomizerService } from "@/lib/site-customizer-service";

interface StudioContextType {
  studio: Business | null;
  isLoading: boolean;
  error: string | null;
  slug: string | null;
  businessId: string | null;
  updateStudioInfo: (updates: Partial<Business>) => void;
  refreshData: () => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

// Fallback "Site Base" hardcoded para emergências (Blindagem de UI)
const SITE_BASE_FALLBACK = (id: string, slug: string): Business => ({
  id: id || "fallback-id",
  slug: slug || "fallback-slug",
  name: "Site Base",
  siteName: "Site Base",
  active: true,
  config: {
    isFallback: true,
    colors: defaultColorSettings,
    hero: defaultHeroSettings,
    aboutHero: defaultAboutHeroSettings,
    story: defaultStorySettings,
    team: defaultTeamSettings,
    testimonials: defaultTestimonialsSettings,
    services: defaultServicesSettings,
    values: defaultValuesSettings,
    homeValuesSettings: defaultValuesSettings,
    aboutUsValuesSettings: defaultValuesSettings,
    gallery: defaultGallerySettings,
    cta: defaultCTASettings,
    header: defaultHeaderSettings,
    footer: defaultFooterSettings,
    theme: defaultFontSettings,
    visibleSections: {
      hero: true,
      services: true,
      gallery: true,
      cta: true,
      footer: true,
      values: true,
      story: true,
      testimonials: true,
      team: true,
    },
    bookingSteps: {
      service: defaultBookingServiceSettings,
      date: defaultBookingDateSettings,
      time: defaultBookingTimeSettings,
      form: defaultBookingFormSettings,
      confirmation: defaultBookingConfirmationSettings,
    }
  } as unknown as Business["config"],
  services: [],
});

export function StudioProvider({
  children,
  initialSlug,
  initialId,
}: {
  children: ReactNode;
  initialSlug?: string;
  initialId?: string;
}) {
  const pathname = usePathname();
  const isPreview =
    typeof window !== "undefined" &&
    window.location.search.includes("preview=true");
  const isAdminPath = pathname?.startsWith("/admin") ?? false;

  const [studio, setStudio] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(initialSlug || null);
  const [businessId, setBusinessId] = useState<string | null>(
    initialId || null,
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasCleared = sessionStorage.getItem("emergency_storage_cleared");
    if (hasCleared) return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("emergency_storage_cleared", "1");
  }, []);

  const refreshData = useCallback(() => {
    console.log(">>> [STUDIO_CONTEXT] Forçando atualização de dados...");
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isPreview) return;

    const handleSyncMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      const { type, settings } = event.data;

      if (typeof type === "string" && type.startsWith("UPDATE_") && settings) {
        console.log(`>>> [STUDIO_CONTEXT] Recebendo sincronização via postMessage: ${type}`);
        
        setStudio((prev) => {
          if (!prev) return null;
          
          const currentConfig = (prev.config as SiteConfigData) || {};
          const updatedConfig = { ...currentConfig };

          switch (type) {
            case "UPDATE_HERO_SETTINGS":
              updatedConfig.hero = settings;
              break;
            case "UPDATE_ABOUT_HERO_SETTINGS":
              updatedConfig.aboutHero = settings;
              break;
            case "UPDATE_SERVICES_SETTINGS":
              updatedConfig.services = settings;
              break;
            case "UPDATE_COLOR_SETTINGS":
              updatedConfig.colors = settings;
              break;
            case "UPDATE_FONT_SETTINGS":
              updatedConfig.theme = settings;
              break;
            case "UPDATE_GALLERY_PREVIEW":
              updatedConfig.galleryPreviewSettings = settings;
              break;
            case "UPDATE_GALLERY_PAGE":
              updatedConfig.galleryPageSettings = settings;
              break;
            case "UPDATE_GALLERY_SETTINGS":
              updatedConfig.galleryPreviewSettings = settings;
              break;
            case "UPDATE_GALLERY_PAGE_SETTINGS":
              updatedConfig.galleryPageSettings = settings;
              break;
            case "UPDATE_STORY_SETTINGS":
              updatedConfig.story = settings;
              break;
            case "UPDATE_TEAM_SETTINGS":
              updatedConfig.team = settings;
              break;
            case "UPDATE_TESTIMONIALS_SETTINGS":
              updatedConfig.testimonials = settings;
              break;
            case "UPDATE_HOME_VALUES_SETTINGS":
              updatedConfig.homeValuesSettings = settings;
              break;
            case "UPDATE_ABOUT_US_VALUES_SETTINGS":
              updatedConfig.aboutUsValuesSettings = settings;
              break;
            case "UPDATE_CTA_SETTINGS":
              updatedConfig.cta = settings;
              break;
            case "UPDATE_HEADER_SETTINGS":
              updatedConfig.header = settings;
              break;
            case "UPDATE_FOOTER_SETTINGS":
              updatedConfig.footer = settings;
              break;
            case "UPDATE_PAGE_VISIBILITY":
              updatedConfig.pageVisibility = settings;
              break;
            case "UPDATE_VISIBLE_SECTIONS":
              updatedConfig.visibleSections = settings;
              break;
            case "UPDATE_BOOKING_SERVICE_SETTINGS":
              updatedConfig.bookingSteps = {
                ...updatedConfig.bookingSteps,
                service: settings,
              };
              break;
            case "UPDATE_BOOKING_DATE_SETTINGS":
              updatedConfig.bookingSteps = {
                ...updatedConfig.bookingSteps,
                date: settings,
              };
              break;
            case "UPDATE_BOOKING_TIME_SETTINGS":
              updatedConfig.bookingSteps = {
                ...updatedConfig.bookingSteps,
                time: settings,
              };
              break;
            case "UPDATE_BOOKING_FORM_SETTINGS":
              updatedConfig.bookingSteps = {
                ...updatedConfig.bookingSteps,
                form: settings,
              };
              break;
            case "UPDATE_BOOKING_CONFIRMATION_SETTINGS":
              updatedConfig.bookingSteps = {
                ...updatedConfig.bookingSteps,
                confirmation: settings,
              };
              break;
          }

          return {
            ...prev,
            config: updatedConfig as unknown as Business["config"],
          };
        });
      }
    };

    window.addEventListener("message", handleSyncMessage);
    return () => window.removeEventListener("message", handleSyncMessage);
  }, [isPreview]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleGlobalUpdate = () => {
        console.log(
          ">>> [CACHE] Sinal de publicação recebido. Forçando atualização do contexto...",
        );
        refreshData();
      };
      window.addEventListener("site-published-success", handleGlobalUpdate);
      return () =>
        window.removeEventListener(
          "site-published-success",
          handleGlobalUpdate,
        );
    }
  }, [refreshData]);

  const updateStudioInfo = useCallback((updates: Partial<Business>) => {
    setStudio((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const mapConfig = useCallback(
    (customData: Record<string, unknown>): SiteConfigData => {
      const rawCandidate = customData as Record<string, unknown>;
      const hasDirectConfig =
        "layoutGlobal" in rawCandidate ||
        "layout_global" in rawCandidate ||
        "home" in rawCandidate ||
        "hero" in rawCandidate ||
        "heroBanner" in rawCandidate ||
        "colors" in rawCandidate ||
        "theme" in rawCandidate ||
        "typography" in rawCandidate;
      const raw = hasDirectConfig
        ? rawCandidate
        : (customData?.siteCustomization as Record<string, unknown>) ||
          (customData?.site_customization as Record<string, unknown>) ||
          customData;
      const config = raw as SiteConfigData;
      const configRecord = config as SiteConfigData & Record<string, unknown>;

      if (!configRecord.appointmentFlow && customData.appointmentFlow) {
        configRecord.appointmentFlow = customData.appointmentFlow;
      }
      if (!configRecord.appointment_flow && customData.appointment_flow) {
        configRecord.appointment_flow = customData.appointment_flow;
      }
      if (typeof configRecord.appointmentFlow === "string") {
        try {
          configRecord.appointmentFlow = JSON.parse(
            configRecord.appointmentFlow,
          );
        } catch {
          configRecord.appointmentFlow = undefined;
        }
      }
      if (typeof configRecord.appointment_flow === "string") {
        try {
          configRecord.appointment_flow = JSON.parse(
            configRecord.appointment_flow,
          );
        } catch {
          configRecord.appointment_flow = undefined;
        }
      }

      const layoutGlobal = (config.layoutGlobal ||
        config.layout_global ||
        {}) as Record<string, unknown>;
      const home = config.home as Record<string, unknown> | undefined;
      const aboutUs = (config as Record<string, unknown>)?.aboutUs as
        | Record<string, unknown>
        | undefined;
      const layoutColors = (layoutGlobal?.siteColors ||
        (layoutGlobal as Record<string, unknown>)?.color ||
        (layoutGlobal as Record<string, unknown>)?.site_colors ||
        (layoutGlobal as Record<string, unknown>)?.cores_base ||
        layoutGlobal) as Record<string, unknown>;

      const finalColors: ColorSettings = {
        primary:
          sanitizeColor(layoutColors?.primary) ||
          sanitizeColor(config.colors?.primary) ||
          defaultColorSettings.primary ||
          "#000000",
        secondary:
          sanitizeColor(layoutColors?.secondary) ||
          sanitizeColor(config.colors?.secondary) ||
          defaultColorSettings.secondary ||
          "#1a1a1a",
        background:
          sanitizeColor(layoutColors?.background) ||
          sanitizeColor(config.colors?.background) ||
          defaultColorSettings.background ||
          "#ffffff",
        text:
          sanitizeColor(layoutColors?.text) ||
          sanitizeColor(config.colors?.text) ||
          defaultColorSettings.text ||
          "#1a1a1a",
        accent:
          sanitizeColor(layoutColors?.accent) ||
          sanitizeColor(config.colors?.accent) ||
          defaultColorSettings.primary ||
          "#000000",
        buttonText:
          sanitizeColor(layoutColors?.buttonText) ||
          sanitizeColor(config.colors?.buttonText) ||
          "#ffffff",
        specialtyBadge: {
          background:
            ((layoutColors?.specialtyBadge as Record<string, string>)?.background) ||
            ((layoutColors?.specialty_badge as Record<string, string>)?.background) ||
            defaultColorSettings.specialtyBadge.background,
          text:
            ((layoutColors?.specialtyBadge as Record<string, string>)?.text) ||
            ((layoutColors?.specialty_badge as Record<string, string>)?.text) ||
            defaultColorSettings.specialtyBadge.text,
          borderRadius:
            ((layoutColors?.specialtyBadge as Record<string, string>)?.borderRadius) ||
            ((layoutColors?.specialty_badge as Record<string, string>)?.borderRadius) ||
            ((layoutColors?.specialty_badge as Record<string, string>)?.border_radius) ||
            defaultColorSettings.specialtyBadge.borderRadius,
        },
      };

      const bookingFromLayoutRaw = (layoutGlobal?.bookingSteps ||
        layoutGlobal?.booking_steps ||
        layoutGlobal?.appointmentFlow ||
        layoutGlobal?.appointment_flow) as SiteConfigData["bookingSteps"] | undefined;

      // Normalização profunda para garantir que o cardBgColor seja capturado de qualquer fonte (snake_case, cardConfig, etc.)
      const normalizeDeepStep = (step: unknown) => {
        if (!step) return undefined;
        // normalizeStepSettings em booking-data.ts já é robusto o suficiente para capturar cardBgColor de múltiplas fontes
        return normalizeStepSettings(step as Record<string, unknown>);
      };

      const normalizedBookingFromLayout = bookingFromLayoutRaw
        ? {
            service: normalizeDeepStep(bookingFromLayoutRaw.service),
            date: normalizeDeepStep(bookingFromLayoutRaw.date),
            time: normalizeDeepStep(bookingFromLayoutRaw.time),
            form: normalizeDeepStep(bookingFromLayoutRaw.form),
            confirmation: normalizeDeepStep(bookingFromLayoutRaw.confirmation),
          }
        : undefined;

      const layoutBookingLegacy =
        (layoutGlobal as Record<string, unknown>)?.bookingService ||
        (layoutGlobal as Record<string, unknown>)?.booking_service ||
        (layoutGlobal as Record<string, unknown>)?.bookingDate ||
        (layoutGlobal as Record<string, unknown>)?.booking_date ||
        (layoutGlobal as Record<string, unknown>)?.bookingTime ||
        (layoutGlobal as Record<string, unknown>)?.booking_time ||
        (layoutGlobal as Record<string, unknown>)?.bookingForm ||
        (layoutGlobal as Record<string, unknown>)?.booking_form ||
        (layoutGlobal as Record<string, unknown>)?.bookingConfirmation ||
        (layoutGlobal as Record<string, unknown>)?.booking_confirmation
          ? {
              service: normalizeDeepStep(
                (layoutGlobal as Record<string, unknown>)?.bookingService ||
                  (layoutGlobal as Record<string, unknown>)?.booking_service,
              ),
              date: normalizeDeepStep(
                (layoutGlobal as Record<string, unknown>)?.bookingDate ||
                  (layoutGlobal as Record<string, unknown>)?.booking_date,
              ),
              time: normalizeDeepStep(
                (layoutGlobal as Record<string, unknown>)?.bookingTime ||
                  (layoutGlobal as Record<string, unknown>)?.booking_time,
              ),
              form: normalizeDeepStep(
                (layoutGlobal as Record<string, unknown>)?.bookingForm ||
                  (layoutGlobal as Record<string, unknown>)?.booking_form,
              ),
              confirmation: normalizeDeepStep(
                (layoutGlobal as Record<string, unknown>)?.bookingConfirmation ||
                  (layoutGlobal as Record<string, unknown>)?.booking_confirmation,
              ),
            }
          : undefined;

      const bookingFromConfig = (config.bookingSteps ||
        config.booking_steps ||
        config.appointmentFlow ||
        config.appointment_flow) as SiteConfigData["bookingSteps"] | undefined;

      const normalizedBookingFromConfig = bookingFromConfig
        ? {
            service: normalizeDeepStep(bookingFromConfig.service),
            date: normalizeDeepStep(bookingFromConfig.date),
            time: normalizeDeepStep(bookingFromConfig.time),
            form: normalizeDeepStep(bookingFromConfig.form),
            confirmation: normalizeDeepStep(bookingFromConfig.confirmation),
          }
        : undefined;

      return {
        ...config,
        colors: finalColors,
        hero: (layoutGlobal?.heroBanner ||
          layoutGlobal?.hero ||
          home?.heroBanner ||
          home?.hero ||
          (config as Record<string, unknown>).heroBanner ||
          config.hero) as HeroSettings | undefined,
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
        services: normalizeDeepStep(
          layoutGlobal?.services ||
            layoutGlobal?.services_section ||
            layoutGlobal?.services_settings ||
            home?.servicesSection ||
            home?.services_section ||
            home?.services ||
            config.services ||
            (config as Record<string, unknown>).services_section,
        ) as ServicesSettings | undefined,
        homeValuesSettings: normalizeDeepStep(
          (config as Record<string, unknown>)?.homeValuesSettings ||
            (layoutGlobal as Record<string, unknown>)?.homeValuesSettings ||
            (home as Record<string, unknown>)?.valuesSection ||
            (home as Record<string, unknown>)?.values ||
            (config as Record<string, unknown>)?.values,
        ) as ValuesSettings | undefined,
        aboutUsValuesSettings: normalizeDeepStep(
          (config as Record<string, unknown>)?.aboutUsValuesSettings ||
            aboutUs?.valuesSection ||
            aboutUs?.values ||
            (layoutGlobal as Record<string, unknown>)?.aboutUsValuesSettings ||
            (config as Record<string, unknown>)?.values,
        ) as ValuesSettings | undefined,
        values: normalizeDeepStep(
          layoutGlobal?.values ||
            layoutGlobal?.values_section ||
            layoutGlobal?.values_settings ||
            home?.valuesSection ||
            home?.values_section ||
            home?.values ||
            config.values ||
            (config as Record<string, unknown>).values_section,
        ) as ValuesSettings | undefined,
        galleryPreviewSettings: (config.galleryPreviewSettings ||
          layoutGlobal?.galleryPreview ||
          home?.galleryPreview ||
          home?.gallerySection) as GallerySettings | undefined,
        galleryPageSettings: (config.galleryPageSettings ||
          config.gallery ||
          layoutGlobal?.gallery) as GallerySettings | undefined,
        gallery: (layoutGlobal?.gallery ||
          config.gallery) as GallerySettings | undefined,
        cta: (layoutGlobal?.cta ||
          home?.ctaSection ||
          home?.cta ||
          config.cta) as CTASettings | undefined,
        header: (layoutGlobal?.header || config.header) as
          | HeaderSettings
          | undefined,
        footer: (layoutGlobal?.footer || config.footer) as
          | FooterSettings
          | undefined,
        theme: (layoutGlobal?.fontes ||
          layoutGlobal?.typography ||
          config.theme ||
          config.typography) as FontSettings | undefined,
        visibleSections: (layoutGlobal?.visibleSections ||
          layoutGlobal?.visible_sections ||
          config.visibleSections ||
          config.visible_sections) as Record<string, boolean> | undefined,
        pageVisibility: (layoutGlobal?.pageVisibility ||
          layoutGlobal?.page_visibility ||
          config.pageVisibility ||
          config.page_visibility) as Record<string, boolean> | undefined,
        bookingSteps:
          normalizedBookingFromLayout ||
          layoutBookingLegacy ||
          normalizedBookingFromConfig,
      };
    },
    [],
  );

  useEffect(() => {
    if (!isPreview || typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type !== "UPDATE_SITE_DATA") return;

      const incoming =
        (event.data.data as Record<string, unknown>) ||
        (event.data.settings as Record<string, unknown>) ||
        (event.data.siteCustomization as Record<string, unknown>) ||
        (event.data.payload as Record<string, unknown>) ||
        (event.data as Record<string, unknown>);

      const mappedConfig = mapConfig(incoming);
      
      console.log(">>> [STUDIO_CONTEXT] Reidratando estado do Studio com dados recebidos:", {
        hasColors: !!mappedConfig.colors,
        hasTheme: !!mappedConfig.theme,
        hasBooking: !!mappedConfig.bookingSteps
      });

      setStudio((prev) =>
        prev
          ? { ...prev, config: mappedConfig as unknown as Business["config"] }
          : prev,
      );

      const lg = (mappedConfig.layoutGlobal ||
        (mappedConfig as Record<string, unknown>).layout_global ||
        {}) as Record<string, unknown>;
      localStorage.setItem("layoutGlobal", JSON.stringify(lg));

      if (mappedConfig.hero) saveHeroSettings(mappedConfig.hero);
      if (mappedConfig.aboutHero) saveAboutHeroSettings(mappedConfig.aboutHero);
      if (mappedConfig.story) saveStorySettings(mappedConfig.story);
      if (mappedConfig.team) saveTeamSettings(mappedConfig.team);
      if (mappedConfig.testimonials)
        saveTestimonialsSettings(mappedConfig.testimonials);
      if (mappedConfig.services) saveServicesSettings(mappedConfig.services);
      if (mappedConfig.homeValuesSettings)
        saveHomeValuesSettings(mappedConfig.homeValuesSettings);
      if (mappedConfig.aboutUsValuesSettings)
        saveAboutUsValuesSettings(mappedConfig.aboutUsValuesSettings);
      if (mappedConfig.galleryPreviewSettings)
        saveGallerySettings(
          mappedConfig.galleryPreviewSettings as GallerySettings,
        );
      if (mappedConfig.galleryPageSettings)
        saveGalleryPageSettings(
          mappedConfig.galleryPageSettings as GallerySettings,
        );
      if (mappedConfig.cta) saveCTASettings(mappedConfig.cta);
      if (mappedConfig.header) saveHeaderSettings(mappedConfig.header);
      if (mappedConfig.footer) saveFooterSettings(mappedConfig.footer);
      if (mappedConfig.visibleSections)
        saveVisibleSections(mappedConfig.visibleSections);
      if (mappedConfig.pageVisibility)
        savePageVisibility(mappedConfig.pageVisibility);
      if (mappedConfig.colors) saveColorSettings(mappedConfig.colors);
      if (mappedConfig.theme) saveFontSettings(mappedConfig.theme);

      if (mappedConfig.bookingSteps?.service)
        saveBookingServiceSettings(mappedConfig.bookingSteps.service);
      if (mappedConfig.bookingSteps?.date)
        saveBookingDateSettings(mappedConfig.bookingSteps.date);
      if (mappedConfig.bookingSteps?.time)
        saveBookingTimeSettings(mappedConfig.bookingSteps.time);
      if (mappedConfig.bookingSteps?.form)
        saveBookingFormSettings(mappedConfig.bookingSteps.form);
      if (mappedConfig.bookingSteps?.confirmation)
        saveBookingConfirmationSettings(mappedConfig.bookingSteps.confirmation);

      window.dispatchEvent(new Event("DataReady"));
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isPreview, mapConfig]);

  // --- NOVO: Sincronização de Fonte Única da Verdade (DB -> LocalStorage) ---
  useEffect(() => {
    if (isPreview) return;
    if (studio) {
      try {
        console.log(
          ">>> [STORAGE_SYNC] Sincronizando dados do Banco para LocalStorage...",
          {
            studioId: studio.id,
            slug: studio.slug,
            hasConfig: !!studio.config,
          },
        );

        // --- LOGO LEAK FIX: Limpeza de cache ao trocar de estúdio ---
        if (typeof window !== "undefined") {
          const lastSlug = localStorage.getItem("studio_last_slug");
          // Se temos um slug e ele mudou, limpamos o cache para evitar vazamento de dados
          if (studio.slug && lastSlug && lastSlug !== studio.slug) {
            console.log(
              `>>> [CONTEXT] Troca de estúdio detectada (${lastSlug} -> ${studio.slug}). Limpando cache sensível.`,
            );

            // Remove chaves específicas do usuário anterior
            localStorage.removeItem(getStorageKey("siteProfile"));
            localStorage.removeItem(getStorageKey("services"));
            localStorage.removeItem(getStorageKey("studioSettings"));

            // Remove chaves compartilhadas (legado/fallback)
            localStorage.removeItem("siteProfile");
            localStorage.removeItem("services");
            localStorage.removeItem("studioSettings");
          }

          // Atualiza o slug atual no storage
          if (studio.slug) {
            localStorage.setItem("studio_last_slug", studio.slug);
          }
        }

        // Sincronização do Perfil do Site - SOMENTE se tivermos dados válidos do banco
        const currentStoredProfile =
          typeof window !== "undefined"
            ? JSON.parse(
                localStorage.getItem(getStorageKey("siteProfile")) || "{}",
              )
            : {};

        // Função auxiliar para validar se uma string do banco não é vazia
        const getValidValue = (
          apiVal: string | undefined | null,
          storageVal: string,
        ) => {
          // Se o dado existe na API e não é apenas espaço em branco, PRIORIDADE TOTAL
          if (apiVal && apiVal.trim() !== "") {
            return apiVal.trim();
          }
          // Só retorna o storage se a API vier nula ou vazia
          return storageVal;
        };

        const profile = {
          name:
            studio.siteName?.trim() ||
            studio.name?.trim() ||
            currentStoredProfile.name ||
            "",
          description: getValidValue(
            studio.description,
            currentStoredProfile.description,
          ),
          phone: getValidValue(studio.phone, currentStoredProfile.phone),
          // E-MAIL: Prioridade absoluta para o dado do banco. Se existir, IGNORA o storage.
          email:
            studio.contact?.email && studio.contact.email.trim() !== ""
              ? studio.contact.email
              : studio.email && studio.email.trim() !== ""
                ? studio.email
                : currentStoredProfile.email,
          address: getValidValue(studio.address, currentStoredProfile.address),
          instagram: getValidValue(
            studio.instagram,
            currentStoredProfile.instagram,
          ),
          facebook: getValidValue(
            studio.facebook,
            currentStoredProfile.facebook,
          ),
          whatsapp: getValidValue(
            studio.whatsapp,
            currentStoredProfile.whatsapp,
          ),
          tiktok: getValidValue(studio.tiktok, currentStoredProfile.tiktok),
          linkedin: getValidValue(
            studio.linkedin,
            currentStoredProfile.linkedin,
          ),
          x: getValidValue(studio.x, currentStoredProfile.x),
          logoUrl: getValidValue(studio.logoUrl, currentStoredProfile.logoUrl),
          showInstagram:
            studio.showInstagram ?? currentStoredProfile.showInstagram ?? true,
          showFacebook:
            studio.showFacebook ?? currentStoredProfile.showFacebook ?? true,
          showWhatsapp:
            studio.showWhatsapp ?? currentStoredProfile.showWhatsapp ?? true,
          showTiktok:
            studio.showTiktok ?? currentStoredProfile.showTiktok ?? false,
          showLinkedin:
            studio.showLinkedin ?? currentStoredProfile.showLinkedin ?? false,
          showX: studio.showX ?? currentStoredProfile.showX ?? false,
        };

        // Log de verificação final antes de salvar
        if (profile.phone && profile.phone.trim() !== "") {
          console.log(">>> [FINAL_SYNC_CHECK] Telefone final:", profile.phone);
        }
        if (profile.email && profile.email.trim() !== "") {
          console.log(">>> [FINAL_SYNC_CHECK] Email final:", profile.email);
        }

        // Forçamos a sincronização sempre que houver um estúdio carregado
        console.log(
          ">>> [STORAGE_SYNC] Salvando perfil do site no storage:",
          profile,
        );
        saveSiteProfile(profile);

        if (studio.services && studio.services.length > 0) {
          console.log(
            `>>> [STORAGE_SYNC] Sincronizando ${studio.services.length} serviços...`,
          );

          // 1. Limpeza de dados antigos/órfãos para garantir frescor
          localStorage.removeItem("services");
          localStorage.removeItem("studioSettings");

          const userServicesKey = getStorageKey("services");
          const userSettingsKey = getStorageKey("studioSettings");

          if (userServicesKey !== "services")
            localStorage.removeItem(userServicesKey);
          if (userSettingsKey !== "studioSettings")
            localStorage.removeItem(userSettingsKey);

          // 2. Sincronização via helper saveServices
          saveServices(studio.services);

          // Dispara eventos para componentes
          window.dispatchEvent(new Event("servicesUpdated"));
          window.dispatchEvent(new Event("studioSettingsUpdated"));
        }

        console.log(">>> [STORAGE_SYNC] LocalStorage atualizado com sucesso.");
      } catch (err) {
        console.error(
          ">>> [STORAGE_SYNC] Erro ao sincronizar dados com LocalStorage:",
          err,
        );
      }
    }
  }, [isPreview, studio]);

  // --- NOVO: Sincronização do Título da Página (Aba do Navegador) ---
  useEffect(() => {
    if (studio && typeof window !== "undefined") {
      // Apenas acessando pathname para garantir que o efeito rode na troca de rota
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const siteName = studio.siteName || studio.name || "Agendamento";
      const suffix = studio.titleSuffix?.trim();

      if (suffix) {
        // Verifica se o sufixo já começa com separador comum
        const hasSeparator = /^[-|–—]/.test(suffix);
        document.title = hasSeparator
          ? `${siteName} ${suffix}`
          : `${siteName} - ${suffix}`;
      } else {
        document.title = siteName;
      }
    }
  }, [studio]);
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (initialSlug) {
      setSlug(initialSlug);
    }
    if (initialId) {
      setBusinessId(initialId);
    }
  }, [initialSlug, initialId]);

  // --- NOVO: Listener para publicação bem sucedida ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePublishSuccess = () => {
      console.log(
        ">>> [StudioContext] Sinal de publicação recebido. Forçando atualização dos dados...",
      );
      // Incrementa o trigger para disparar o fetchStudio no useEffect principal
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener("site-published-success", handlePublishSuccess);
    return () =>
      window.removeEventListener("site-published-success", handlePublishSuccess);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (isPreview) {
      // Removido: Não carregamos mais studio_data do localStorage no início
      // O Banco de Dados deve ser a única fonte da verdade ao carregar/atualizar a página (F5)
    }
    async function fetchStudio() {
      setError(null);
      console.log(
        `>>> [StudioProvider] Buscando dados (trigger: ${refreshTrigger})...`,
      );
      let currentSlug = slug;
      let currentId = businessId;

      // EXCEÇÃO PARA ROTA MASTER: Se estivermos no painel master, não buscamos slug
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin/master")
      ) {
        console.log(
          ">>> [StudioProvider] Rota MASTER detectada. Pulando busca de slug de estúdio.",
        );
        setIsLoading(false);
        return;
      }

      // Se não temos um ID ou slug inicial, tenta extrair
      if (!currentId && !currentSlug && typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const slugParam = urlParams.get("slug");
        const idParam = urlParams.get("businessId") || urlParams.get("id");

        if (idParam) {
          currentId = idParam;
          setBusinessId(currentId);
        } else if (slugParam) {
          currentSlug = slugParam;
          console.log(
            `>>> [StudioProvider] SLUG extraído dos QUERY PARAMS: ${currentSlug}`,
          );
          setSlug(currentSlug);
        } else {
          // Tenta extrair da PATH (/admin/[slug]/...)
          const pathname = window.location.pathname;
          if (pathname.startsWith("/admin/")) {
            const segments = pathname.split("/").filter(Boolean);
            // O padrão é /admin/[slug]/...
            if (
              segments.length >= 2 &&
              segments[0] === "admin" &&
              segments[1] !== "master"
            ) {
              currentSlug = segments[1];
              console.log(
                `>>> [StudioProvider] SLUG extraído do PATH (/admin/[slug]): ${currentSlug}`,
              );
              setSlug(currentSlug);
            }
          }

          if (!currentSlug) {
            const host = window.location.host;
            console.log(
              `>>> [StudioProvider] Analisando HOST para extração de SLUG: ${host}`,
            );

            // Caso especial para desenvolvimento: subdomínio em localhost (ex: lucas-studio.localhost:3000)
            if (host.includes(".localhost")) {
              const parts = host.split(".");
              if (parts.length > 1 && parts[0] !== "www") {
                currentSlug = parts[0];
                console.log(
                  `>>> [StudioProvider] SLUG extraído do subdomínio LOCALHOST: ${currentSlug}`,
                );
                setSlug(currentSlug);
              }
            }
            // Caso para produção: subdomínio do BASE_DOMAIN
            else if (
              BASE_DOMAIN &&
              host.endsWith(BASE_DOMAIN) &&
              host !== BASE_DOMAIN &&
              host !== `www.${BASE_DOMAIN}`
            ) {
              const possibleSlug = host
                .replace(`.${BASE_DOMAIN}`, "")
                .replace("www.", "");
              if (possibleSlug) {
                currentSlug = possibleSlug;
                console.log(
                  `>>> [StudioProvider] SLUG extraído do subdomínio PRODUÇÃO: ${currentSlug}`,
                );
                setSlug(currentSlug);
              }
            }
          }
        }
      }

      if (!currentId && !currentSlug) {
        setIsLoading(false);
        return;
      }

      try {
        const timestamp = Date.now();
        let fetchUrl: string;

        if (currentId) {
          fetchUrl = `${API_BASE_URL}/api/business/${currentId}?t=${timestamp}`;
          console.log(
            `>>> [CACHE_CHECK] StudioProvider buscando studio via ID: ${fetchUrl}`,
          );
        } else {
          // Normalização do slug para evitar erros de case-sensitivity e garantir consistência
          const finalSlug = (currentSlug || "").toLowerCase();
          fetchUrl = `${API_BASE_URL}/api/business/slug/${finalSlug}?t=${timestamp}`;
          console.log(
            `>>> [CACHE_CHECK] StudioProvider buscando studio via SLUG: ${fetchUrl}`,
          );
        }

        let response: Response;
        try {
          response = await customFetch(fetchUrl, {
            credentials: "include",
            cache: "no-store",
            next: { revalidate: 0 },
            signal,
            headers: {
              Accept: "application/json",
            },
          });
        } catch (fetchErr: unknown) {
          if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
            console.log(">>> [StudioProvider] Busca de studio cancelada.");
            return;
          }

          const errorMessage =
            fetchErr instanceof Error ? fetchErr.message : "Erro desconhecido";
          console.error(
            ">>> [StudioProvider] Falha Crítica na Rede ao buscar Studio:",
            errorMessage,
          );
          throw fetchErr; // Re-lança se não houver cache
        }

        if (response.ok) {
          // Blindagem contra JSON vazio ou malformado
          const text = await response.text();
          console.log(">>> [StudioProvider] Resposta bruta do servidor:", text);

          if (!text || text.trim() === "") {
            console.warn(">>> [StudioProvider] Resposta vazia. Aplicando Site Base Fallback.");
            setStudio(SITE_BASE_FALLBACK(currentId || "", currentSlug || ""));
            setIsLoading(false);
            return;
          }

          try {
            const data = JSON.parse(text);
            
            if (!data || (!data.id && !data.slug)) {
               console.warn(">>> [StudioProvider] Dados inválidos. Aplicando Site Base Fallback.");
               setStudio(SITE_BASE_FALLBACK(currentId || "", currentSlug || ""));
               setIsLoading(false);
               return;
            }
            console.log(
              ">>> [StudioProvider] Dados do studio carregados com sucesso:",
              data?.id,
            );
            console.log(
              ">>> [StudioProvider] Configuração bruta do studio:",
              data?.config,
            );
            // Log de depuração da resposta bruta da API do Studio
            console.log(">>> [DEBUG_API] Dados do Studio (Slug):", data);

            // --- NOVO: Chamada Adicional para Perfil Público ---
            let publicProfileData = null;
            if (data?.id) {
              try {
                console.log(
                  `>>> [DEBUG_API] Buscando perfil público para Business ID: ${data.id}`,
                );
                const profileRes = await customFetch(
                  `${API_BASE_URL}/api/settings/profile/${data.id}`,
                  {
                    cache: "no-store",
                    next: { revalidate: 0 },
                    signal,
                    headers: { Accept: "application/json" },
                  },
                );

                if (profileRes.ok) {
                  try {
                    const profileText = await profileRes.text();
                    if (profileText && profileText.trim() !== "") {
                      publicProfileData = JSON.parse(profileText);
                      console.log(
                        ">>> [DEBUG_API] Perfil público carregado com sucesso:",
                        publicProfileData,
                      );
                    } else {
                      console.warn(
                        ">>> [DEBUG_API] Perfil público retornou corpo vazio.",
                      );
                    }
                  } catch (jsonErr) {
                    console.error(
                      ">>> [DEBUG_API] Erro ao parsear JSON do perfil público:",
                      jsonErr,
                    );
                  }
                } else {
                  console.warn(
                    `>>> [DEBUG_API] Falha ao carregar perfil público: ${profileRes.status}`,
                  );
                }
              } catch (profileErr) {
                if (
                  profileErr instanceof Error &&
                  profileErr.name === "AbortError"
                ) {
                  return;
                }
                console.error(
                  ">>> [DEBUG_API] Erro na chamada do perfil público:",
                  profileErr,
                );
              }
            }

            // Mesclamos os dados do studio com os dados do perfil público de forma não destrutiva
            // Só sobrescrevemos se o dado do perfil público for válido (não vazio)
            // IMPORTANTE: Não sobrescrevemos campos de identificação ou configurações estruturais
            const studioWithProfile = { ...data };
            if (publicProfileData) {
              const protectedKeys = [
                "id",
                "slug",
                "email",
                "config",
                "services",
                "gallery",
                "testimonials",
                "createdAt",
                "updatedAt",
              ];

              Object.keys(publicProfileData).forEach((key) => {
                if (protectedKeys.includes(key)) return;

                const val = (publicProfileData as Record<string, unknown>)[key];
                const isPlaceholder =
                  typeof val === "string" &&
                  (val.includes("exemplo.com") ||
                    val.includes("lucasstudio.com"));

                if (
                  val !== null &&
                  val !== undefined &&
                  !isPlaceholder &&
                  (typeof val !== "string" || val.trim() !== "")
                ) {
                  (studioWithProfile as Record<string, unknown>)[key] = val;
                }
              });
            }

            // --- NOVO: Limpeza Preventiva e Log de IDs ---
            if (typeof window !== "undefined" && data?.id) {
              const savedBusinessId = localStorage.getItem("last_business_id");
              console.log(">>> [DEBUG_SYNC] Buscando config para ID:", data.id);

              if (savedBusinessId && savedBusinessId !== data.id) {
                console.log(
                  ">>> [DEBUG_SYNC] BusinessId alterado. Limpando localStorage antigo...",
                );
                // Limpa chaves de configuração para evitar conflito entre empresas
                const keysToClear = [
                  "heroSettings",
                  "fontSettings",
                  "colorSettings",
                  "headerSettings",
                  "footerSettings",
                  "servicesSettings",
                  "homeValuesSettings",
                  "aboutUsValuesSettings",
                  "gallerySettings",
                  "ctaSettings",
                  "pageVisibility",
                  "visibleSections",
                  "studioSettings",
                  "layoutGlobal",
                ];
                keysToClear.forEach((k) => {
                  localStorage.removeItem(k);
                });
              }
              localStorage.setItem("last_business_id", data.id);
            }
            // ---------------------------------------------

            const customizationResponse = data?.id
              ? await (isAdminPath || isPreview
                  ? siteCustomizerService.getDraftCustomization(data.id, signal)
                  : siteCustomizerService.getPublishedCustomization(data.id, signal))
              : null;

            if (signal.aborted) return;

            const rawCustomization = ((customizationResponse &&
              !customizationResponse.isFallback
                ? customizationResponse
                : data.siteCustomization ||
                  data.site_customization ||
                  data.config ||
                  data) ?? {}) as Record<string, unknown>;

            const initialConfig = mapConfig(rawCustomization);

            console.log(">>> [StudioProvider] Configuração inicial mapeada:", {
              hasConfig: !!initialConfig,
              hasColors: !!initialConfig.colors,
              primary: initialConfig.colors?.primary,
            });

            const initialStudio: Business = {
              ...studioWithProfile,
              services: data.services || [], // Garante que services existe
              config: initialConfig as unknown as Business["config"],
            };

            setStudio(initialStudio);

            // 6. Guarda de Rota: Se o estúdio estiver inativo, redirecionar (Exceto para Master Admin e Minha Conta)
            if (initialStudio.active === false) {
              if (
                typeof window !== "undefined" &&
                !window.location.pathname.startsWith("/admin/master") &&
                !window.location.pathname.includes("/dashboard/minha-conta")
              ) {
                console.error(
                  ">>> [STUDIO_GUARD] Estúdio inativo detectado no carregamento inicial. Redirecionando...",
                );
                window.location.href = "/acesso-suspenso";
                return;
              }
            }

            // Busca serviços explicitamente se não vieram no objeto business
            // Isso resolve o problema de serviços não aparecerem no site público
            if (!data.services || data.services.length === 0) {
              const servicesTimestamp = Date.now();
              const servicesUrl = `${API_BASE_URL}/api/services/company/${data.id}?t=${servicesTimestamp}`;
              console.log(
                `>>> [StudioProvider] Buscando serviços separadamente (Rota Pública): ${servicesUrl}`,
              );

              // Removido credentials: "include" para evitar 401 em rotas públicas que não precisam de auth
              customFetch(servicesUrl)
                .then((res) => {
                  if (res.status === 401) {
                    console.warn(
                      ">>> [SITE_WARN] Acesso restrito à API de serviços (401). Usando dados locais/padrão.",
                    );
                    return null;
                  }
                  return res.ok ? res.json() : null;
                })
                .then((servicesData) => {
                  if (Array.isArray(servicesData) && servicesData.length > 0) {
                    console.log(
                      `>>> [StudioProvider] ${servicesData.length} serviços carregados com sucesso.`,
                    );
                    setStudio((prev) =>
                      prev ? { ...prev, services: servicesData } : null,
                    );

                    // Sincroniza com o cache local para outros componentes usarem
                    try {
                      saveServices(servicesData);
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new Event("DataReady"));
                      }
                    } catch (e) {
                      console.warn(
                        ">>> [StudioProvider] Falha ao sincronizar cache de serviços:",
                        e,
                      );
                    }
                  } else if (servicesData === null) {
                    console.log(
                      ">>> [StudioProvider] API de serviços indisponível. Mantendo estado atual.",
                    );
                  }
                })
                .catch((err) =>
                  console.warn(
                    ">>> [StudioProvider] Erro ao buscar serviços:",
                    err,
                  ),
                );
            }
            // Busca de customização EXTRA (sem cache) apenas para garantir atualização em tempo real
            if (data?.id) {
              const fetcher = (companyId: string, signal?: AbortSignal) =>
                isAdminPath || isPreview
                  ? siteCustomizerService.getDraftCustomization(
                      companyId,
                      signal,
                    )
                  : siteCustomizerService.getPublishedCustomization(
                      companyId,
                      signal,
                    );

              fetcher(data.id, signal)
                .then((customization: SiteConfigData | null) => {
                  if (signal.aborted) return;
                  if (!customization || customization.isFallback) {
                    console.log(
                      ">>> [StudioProvider] Customização extra falhou ou retornou fallback. Mantendo configuração inicial.",
                    );
                    return;
                  }
                  console.log(
                    ">>> [StudioProvider] Customização extra recebida.",
                  );

                  const mappedConfig = mapConfig(
                    customization as unknown as Record<string, unknown>,
                  );

                  setStudio((prev) => {
                    if (!prev) return prev;
                    const layoutGlobal =
                      (mappedConfig.layoutGlobal ||
                        (mappedConfig as Record<string, unknown>)
                          .layout_global) as Record<string, unknown> | undefined;
                    const newColors =
                      (layoutGlobal?.siteColors as ColorSettings | undefined) ||
                      (layoutGlobal?.color as ColorSettings | undefined) ||
                      (layoutGlobal?.site_colors as ColorSettings | undefined) ||
                      (layoutGlobal?.cores_base as ColorSettings | undefined) ||
                      mappedConfig.colors;
                    const hasNewColors =
                      newColors && Object.keys(newColors).length > 0;
                    if (!hasNewColors) {
                      console.warn(
                        ">>> [SYNC] Tentativa de sincronizar cores vazias abortada para evitar tela branca.",
                      );
                    }
                    const nextColors = hasNewColors
                      ? newColors
                      : prev.config?.colors;
                    const newStudio = {
                      ...prev,
                      config: {
                        ...(mappedConfig as unknown as Business["config"]),
                        colors: nextColors,
                      },
                    };
                    console.log(
                      ">>> [DEBUG_SYNC] Estado Studio reidratado com novas cores:",
                      nextColors?.background || "N/A",
                    );
                    return newStudio;
                  });

                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("DataReady"));
                  }
                })
                .catch((err) =>
                  console.warn(
                    ">>> [StudioProvider] Erro ao buscar customização extra:",
                    err,
                  ),
                );
            }
          } catch (parseErr) {
            console.warn(
              ">>> [StudioProvider] Erro ao processar JSON:",
              parseErr,
            );
            throw new Error("Resposta do servidor não é um JSON válido.");
          }
        } else {
          const errorText = await response
            .text()
            .catch(() => "Sem detalhes no corpo da resposta");
          console.warn(
            `>>> [StudioProvider] Resposta do servidor não foi OK:`,
            {
              status: response.status,
              statusText: response.statusText,
              details: errorText,
              url: response.url,
            },
          );

          if (response.status === 404) {
            console.warn(">>> [StudioProvider] 404 detectado. Aplicando Site Base Fallback.");
            setStudio(SITE_BASE_FALLBACK(currentId || "", currentSlug || ""));
            setError("Studio não encontrado");
          } else {
            console.warn(`>>> [StudioProvider] Erro ${response.status}. Aplicando Site Base Fallback.`);
            setStudio(SITE_BASE_FALLBACK(currentId || "", currentSlug || ""));
            setError(`Erro do servidor (${response.status})`);
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log(">>> [StudioProvider] Fluxo de busca de studio abortado. Ignorando atualização de erro.");
          return;
        }

        console.warn(">>> [StudioProvider] Erro capturado. Aplicando Site Base Fallback.", err);
        setStudio(SITE_BASE_FALLBACK(currentId || "", currentSlug || ""));
        setError(
          err instanceof Error
            ? err.message
            : "Erro de conexão com o servidor.",
        );
      } finally {
        if (!signal.aborted) {
          // Garantimos um delay mínimo para evitar flickering e garantir sincronia
          setTimeout(() => {
            setIsLoading(false);
            console.log(">>> [StudioProvider] Sincronização finalizada. Desativando loading.");
          }, 300);
        } else {
           console.log(">>> [StudioProvider] Sinal abortado detectado no finally. Mantendo isLoading para próxima tentativa.");
        }
      }
    }

    fetchStudio();

    return () => {
      controller.abort();
    };
  }, [
    slug,
    businessId,
    isPreview,
    isAdminPath,
    refreshTrigger,
    mapConfig,
  ]);

  useEffect(() => {
    // REMOVIDO: Redirecionamento automático para /404 ou home
    // O tratamento de erro agora é feito visualmente no render do provider
    if (error) {
      console.warn(">>> [StudioProvider] Erro detectado:", error);
    }
  }, [error]);

  // Monitora mudanças no status de ativação do estúdio (Guarda de Rota)
  useEffect(() => {
    if (studio && studio.active === false) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/admin/master") &&
        !window.location.pathname.includes("/dashboard/minha-conta") &&
        !window.location.pathname.startsWith("/acesso-suspenso")
      ) {
        console.error(
          ">>> [STUDIO_GUARD] Estúdio inativo detectado via monitoramento. Redirecionando...",
        );
        window.location.href = "/acesso-suspenso";
      }
    }
  }, [studio]);

  const value = useMemo(
    () => ({
      studio,
      isLoading,
      error,
      slug,
      businessId,
      updateStudioInfo,
      refreshData,
    }),
    [studio, isLoading, error, slug, businessId, updateStudioInfo, refreshData],
  );

  // Tratamento visual para erro 404 (Studio não encontrado)
  // Mas evitamos mostrar esse 404 para rotas de admin, permitindo que o admin-layout tome decisões
  if (
    !isLoading &&
    error === "Studio não encontrado" &&
    !pathname?.startsWith("/admin")
  ) {
    return (
      <StudioContext.Provider value={value}>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-6">Studio não encontrado</h2>
          <p className="text-zinc-500 mb-8 max-w-md">
            O estabelecimento que você está procurando não existe ou o endereço
            está incorreto.
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="px-6 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"
          >
            Voltar para o início
          </button>
        </div>
      </StudioContext.Provider>
    );
  }

  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error("useStudio deve ser usado dentro de um StudioProvider");
  }
  return context;
}
