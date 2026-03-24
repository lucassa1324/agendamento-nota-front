import { inventoryService } from "./inventory-service";
import type { SiteConfigData } from "./site-config-types";

export type ServiceResource = {
  inventoryId: string;
  quantity: number;
  unit: string;
  useSecondaryUnit: boolean;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // em minutos
  price: number;
  showOnHome?: boolean | string | number;
  show_on_home?: boolean | string | number;
  icon?: string;
  conflictGroupId?: string;
  conflict_group_id?: string;
  conflictingServiceIds?: string[];
  conflicting_service_ids?: string[];
  advanced_rules?:
    | {
        conflicts?: string[];
      }
    | string[];
  advancedRules?:
    | {
        conflicts?: string[];
      }
    | string[];
  resources?: ServiceResource[];
  // Mantido para compatibilidade temporária com componentes legados
  products?: {
    productId: string;
    quantity: number;
    useSecondaryUnit?: boolean;
  }[];
};

export type InventoryLog = {
  id?: string;
  timestamp: string;
  type: "entrada" | "saida" | "ajuste" | "venda" | "servico" | "ENTRY" | "EXIT";
  quantityChange: number;
  previousQuantity?: number;
  newQuantity?: number;
  notes?: string;
  userName?: string;
  reason?: string;
};

export type InventoryItem = {
  id: string;
  companyId?: string;
  name: string;
  quantity: number;
  currentQuantity?: number; // Compatibilidade com Back-end (Drizzle camelCase)
  minQuantity: number;
  unit: string;
  price: number;
  unitPrice?: number; // Compatibilidade com Back-end
  lastUpdate: string;
  secondaryUnit?: string;
  conversionFactor?: number;
  isShared?: boolean;
  logs?: InventoryLog[];
};

export type TimeSlot = {
  time: string;
  available: boolean;
};

export type BookingStatus =
  | "pendente"
  | "pending"
  | "confirmado"
  | "cancelado"
  | "concluído";

export type Booking = {
  id: string;
  serviceId: string | string[];
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: BookingStatus;
  createdAt: string;
  serviceDurationSnapshot?: string | number;
  notificationsSent: {
    email: boolean;
    whatsapp: boolean;
  };
};

export type BlockedPeriod = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // opcional, se for o dia todo
  endTime?: string; // opcional
  reason?: string;
};

export type BusinessHours = {
  openTime: string; // ex: "09:00"
  lunchStart: string; // ex: "12:00"
  lunchEnd: string; // ex: "14:00"
  closeTime: string; // ex: "18:00"
};

export type DaySchedule = {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, etc.
  dayName: string;
  isOpen: boolean;
  openTime: string;
  lunchStart: string;
  lunchEnd: string;
  closeTime: string;
  interval: number;
};

export type WeekSchedule = DaySchedule[];

// Helper para isolamento de dados por usuário
export const sanitizeColor = (
  color: unknown,
): string | undefined => {
  if (!color) return undefined;
  
  // Se for um objeto, tenta extrair a string de cor (caso comum em alguns componentes de UI)
  if (typeof color === "object" && color !== null) {
    const colorObj = color as Record<string, unknown>;
    if (typeof colorObj.hex === "string") return colorObj.hex;
    if (typeof colorObj.text === "string") return colorObj.text;
    if (typeof colorObj.color === "string") return colorObj.color;
    // Se não encontrar nada óbvio, tenta converter para string e ver o que acontece
    try {
      const str = String(color);
      if (str.startsWith("[object")) return undefined;
      return sanitizeColor(str);
    } catch (_e) {
      return undefined;
    }
  }

  if (typeof color !== "string") return undefined;

  const trimmed = color.trim();
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("rgb") ||
    trimmed.startsWith("hsl") ||
    trimmed.startsWith("var")
  ) {
    return trimmed;
  }
  // Se for apenas hex sem #, adiciona #
  if (/^[0-9A-Fa-f]{3,6}$/.test(trimmed)) {
    return `#${trimmed}`;
  }
  return trimmed;
};

/**
 * Função de utilidade que limpa o objeto de configurações antes de qualquer operação 
 * de persistência ou renderização, garantindo que "lixo" de UI não chegue ao estado global.
 * Implementa normalização recursiva para chaves de cores.
 */
export const normalizePersistenceData = (data: unknown): unknown => {
  if (!data || typeof data !== "object") return data;

  // Se for um array, processa cada item
  if (Array.isArray(data)) {
    return data.map(item => normalizePersistenceData(item));
  }

  const cleanData: Record<string, unknown> = { ...(data as Record<string, unknown>) };

  Object.keys(cleanData).forEach((key) => {
    const value = cleanData[key];

    // 1. Se o valor for um objeto que parece uma cor (ex: ColorPicker), sanitiza
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const v = value as Record<string, unknown>;
      if (v.hex || v.color || v.rgb) {
        cleanData[key] = sanitizeColor(value);
      } 
      // 2. Se for um objeto aninhado (não nulo), limpa recursivamente
      else if (!(value instanceof Date)) {
        cleanData[key] = normalizePersistenceData(value);
      }
    }
  });

  return cleanData;
};

export const sanitizeSection = (
  currentData: unknown,
  fallbackData: unknown,
): Record<string, unknown> => {
  const fallback =
    fallbackData && typeof fallbackData === "object" && !Array.isArray(fallbackData)
      ? (fallbackData as Record<string, unknown>)
      : {};

  if (typeof currentData === "string") {
    const trimmed = currentData.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return { ...fallback, ...(parsed as Record<string, unknown>) };
        }
      } catch (_e) {
        return { ...fallback, title: currentData };
      }
    }
    return { ...fallback, title: currentData };
  }

  if (!currentData || typeof currentData !== "object" || Array.isArray(currentData)) {
    return { ...fallback };
  }

  const record = currentData as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length > 0 && keys.every((key) => /^\d+$/.test(key))) {
    return { ...fallback };
  }

  return { ...fallback, ...record };
};

export type SectionConfig = Record<string, unknown>;
export type SectionsMap = Record<string, SectionConfig>;

export const SECTION_IDS = {
  homeHero: "home-hero",
  aboutHero: "about-hero",
  homeStory: "home-story",
  homeTeam: "home-team",
  homeTestimonials: "home-testimonials",
  homeServices: "home-services",
  homeValues: "home-values",
  aboutValues: "about-values",
  homeGallery: "home-gallery",
  pageGallery: "page-gallery",
  homeCta: "home-cta",
  layoutHeader: "layout-header",
  layoutFooter: "layout-footer",
  bookingService: "booking-service",
  bookingDate: "booking-date",
  bookingTime: "booking-time",
  bookingForm: "booking-form",
  bookingConfirmation: "booking-confirmation",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

const normalizeSectionConfig = <T extends Record<string, unknown>>(
  raw: T | undefined,
  defaults: T,
) => {
  const merged = {
    ...defaults,
    ...(raw || {}),
    appearance: {
      ...(defaults.appearance as Record<string, unknown> | undefined),
      ...(raw?.appearance as Record<string, unknown> | undefined),
    },
    content: {
      ...(defaults.content as Record<string, unknown> | undefined),
      ...(raw?.content as Record<string, unknown> | undefined),
    },
  };

  return normalizePersistenceData(merged) as T;
};

const getPayloadRoot = (config: SiteConfigData | null | undefined) => {
  if (!config || typeof config !== "object") return {};
  return (config.siteCustomization ||
    config.site_customization ||
    config) as SiteConfigData;
};

export const normalizePayload = (
  config: SiteConfigData | null | undefined,
) => {
  const safeConfig = (config || {}) as SiteConfigData;
  const root = getPayloadRoot(safeConfig);

  const layoutGlobal = (root.layoutGlobal ||
    root.layout_global) as Record<string, unknown> | undefined;
  const home = root.home as Record<string, unknown> | undefined;
  const about = root.about as Record<string, unknown> | undefined;

  const sections: SectionsMap = {
    [SECTION_IDS.homeHero]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.homeHero] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.homeHero
        ] ||
        (root.hero as SectionConfig | undefined) ||
        (layoutGlobal?.hero as SectionConfig | undefined) ||
        (home?.heroSection as SectionConfig | undefined) ||
        (home?.hero as SectionConfig | undefined),
      defaultHeroSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.aboutHero]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.aboutHero] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.aboutHero
        ] ||
        (root.aboutHero as SectionConfig | undefined) ||
        (layoutGlobal?.aboutHero as SectionConfig | undefined) ||
        (about?.heroSection as SectionConfig | undefined) ||
        (about?.hero as SectionConfig | undefined),
      defaultAboutHeroSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeStory]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.homeStory] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.homeStory
        ] ||
        (root.story as SectionConfig | undefined) ||
        (layoutGlobal?.story as SectionConfig | undefined) ||
        (home?.storySection as SectionConfig | undefined) ||
        (home?.story as SectionConfig | undefined),
      defaultStorySettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeTeam]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.homeTeam] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.homeTeam
        ] ||
        (root.team as SectionConfig | undefined) ||
        (layoutGlobal?.team as SectionConfig | undefined) ||
        (home?.teamSection as SectionConfig | undefined) ||
        (home?.team as SectionConfig | undefined),
      defaultTeamSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeTestimonials]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[
        SECTION_IDS.homeTestimonials
      ] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.homeTestimonials
        ] ||
        (root.testimonials as SectionConfig | undefined) ||
        (layoutGlobal?.testimonials as SectionConfig | undefined) ||
        (home?.testimonialsSection as SectionConfig | undefined) ||
        (home?.testimonials as SectionConfig | undefined),
      defaultTestimonialsSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeServices]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.homeServices] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.homeServices
        ] ||
        (root.services as SectionConfig | undefined) ||
        (layoutGlobal?.services as SectionConfig | undefined) ||
        (home?.servicesSection as SectionConfig | undefined) ||
        (home?.services as SectionConfig | undefined),
      defaultServicesSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeValues]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.homeValues] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.homeValues
        ] ||
        (root.homeValuesSettings as SectionConfig | undefined) ||
        (layoutGlobal?.homeValuesSettings as SectionConfig | undefined) ||
        (home?.valuesSection as SectionConfig | undefined) ||
        (home?.values as SectionConfig | undefined) ||
        (root.values as SectionConfig | undefined),
      defaultValuesSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.aboutValues]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.aboutValues] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.aboutValues
        ] ||
        (root.aboutUsValuesSettings as SectionConfig | undefined) ||
        (layoutGlobal?.aboutUsValuesSettings as SectionConfig | undefined) ||
        (about?.valuesSection as SectionConfig | undefined) ||
        (about?.values as SectionConfig | undefined) ||
        (root.values as SectionConfig | undefined),
      defaultValuesSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeGallery]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.homeGallery] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.homeGallery
        ] ||
        (root.galleryPreviewSettings as SectionConfig | undefined) ||
        (layoutGlobal?.galleryPreview as SectionConfig | undefined) ||
        (layoutGlobal?.gallerySection as SectionConfig | undefined) ||
        (home?.galleryPreview as SectionConfig | undefined) ||
        (home?.gallerySection as SectionConfig | undefined),
      defaultGallerySettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.pageGallery]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.pageGallery] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.pageGallery
        ] ||
        (root.galleryPageSettings as SectionConfig | undefined) ||
        (root.gallery as SectionConfig | undefined) ||
        (layoutGlobal?.gallery as SectionConfig | undefined),
      defaultGallerySettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeCta]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.homeCta] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.homeCta
        ] ||
        (root.cta as SectionConfig | undefined) ||
        (layoutGlobal?.cta as SectionConfig | undefined) ||
        (home?.ctaSection as SectionConfig | undefined) ||
        (home?.cta as SectionConfig | undefined),
      defaultCTASettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.layoutHeader]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.layoutHeader] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.layoutHeader
        ] ||
        (root.header as SectionConfig | undefined) ||
        (layoutGlobal?.header as SectionConfig | undefined),
      defaultHeaderSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.layoutFooter]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.layoutFooter] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.layoutFooter
        ] ||
        (root.footer as SectionConfig | undefined) ||
        (layoutGlobal?.footer as SectionConfig | undefined),
      defaultFooterSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.bookingService]: normalizeSectionConfig(
      ((root.sections as SectionsMap | undefined)?.[
        SECTION_IDS.bookingService
      ] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.bookingService
        ] ||
        ((root.appointmentFlow as Record<string, unknown> | undefined)
          ?.service as SectionConfig | undefined) ||
        ((root.appointmentFlow as Record<string, unknown> | undefined)?.steps as
          | Record<string, unknown>
          | undefined)?.service ||
        ((root.bookingSteps as Record<string, unknown> | undefined)?.service as
          | SectionConfig
          | undefined) ||
        (root.bookingService as SectionConfig | undefined)) as
        | SectionConfig
        | undefined,
      defaultBookingServiceSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.bookingDate]: normalizeSectionConfig(
      ((root.sections as SectionsMap | undefined)?.[SECTION_IDS.bookingDate] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.bookingDate
        ] ||
        ((root.appointmentFlow as Record<string, unknown> | undefined)
          ?.date as SectionConfig | undefined) ||
        ((root.appointmentFlow as Record<string, unknown> | undefined)?.steps as
          | Record<string, unknown>
          | undefined)?.date ||
        ((root.bookingSteps as Record<string, unknown> | undefined)?.date as
          | SectionConfig
          | undefined) ||
        (root.bookingDate as SectionConfig | undefined)) as
        | SectionConfig
        | undefined,
      defaultBookingDateSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.bookingTime]: normalizeSectionConfig(
      ((root.sections as SectionsMap | undefined)?.[SECTION_IDS.bookingTime] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.bookingTime
        ] ||
        ((root.appointmentFlow as Record<string, unknown> | undefined)
          ?.time as SectionConfig | undefined) ||
        ((root.appointmentFlow as Record<string, unknown> | undefined)?.steps as
          | Record<string, unknown>
          | undefined)?.time ||
        ((root.bookingSteps as Record<string, unknown> | undefined)?.time as
          | SectionConfig
          | undefined) ||
        (root.bookingTime as SectionConfig | undefined)) as
        | SectionConfig
        | undefined,
      defaultBookingTimeSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.bookingForm]: normalizeSectionConfig(
      ((root.sections as SectionsMap | undefined)?.[SECTION_IDS.bookingForm] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.bookingForm
        ] ||
        ((root.appointmentFlow as Record<string, unknown> | undefined)
          ?.form as SectionConfig | undefined) ||
        ((root.appointmentFlow as Record<string, unknown> | undefined)?.steps as
          | Record<string, unknown>
          | undefined)?.form ||
        ((root.bookingSteps as Record<string, unknown> | undefined)?.form as
          | SectionConfig
          | undefined) ||
        (root.bookingForm as SectionConfig | undefined)) as
        | SectionConfig
        | undefined,
      defaultBookingFormSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.bookingConfirmation]: normalizeSectionConfig(
      ((root.sections as SectionsMap | undefined)?.[
        SECTION_IDS.bookingConfirmation
      ] ||
        (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.bookingConfirmation
        ] ||
        ((root.appointmentFlow as Record<string, unknown> | undefined)
          ?.confirmation as SectionConfig | undefined) ||
        ((root.appointmentFlow as Record<string, unknown> | undefined)?.steps as
          | Record<string, unknown>
          | undefined)?.confirmation ||
        ((root.bookingSteps as Record<string, unknown> | undefined)
          ?.confirmation as SectionConfig | undefined) ||
        (root.bookingConfirmation as SectionConfig | undefined)) as
        | SectionConfig
        | undefined,
      defaultBookingConfirmationSettings as unknown as SectionConfig,
    ),
  };

  const normalizedRoot = {
    ...root,
    sections,
  };

  return {
    ...safeConfig,
    siteCustomization: normalizedRoot,
    site_customization: normalizedRoot,
    sections,
  } as SiteConfigData;
};

export function getStorageKey(key: string): string {
  if (typeof window === "undefined") return key;
  const userId = localStorage.getItem("current_admin_id");
  const result = userId ? `${userId}_${key}` : key;
  return result;
}

export function updateDraftTimestamp(): void {
  if (typeof window === "undefined") return;
  const timestamp = new Date().toISOString();
  localStorage.setItem(getStorageKey("last_draft_update"), timestamp);
  console.log(`>>> [booking-data] Draft timestamp atualizado: ${timestamp}`);

  // Dispara evento para o editor saber que houve mudança e salvar no banco
  window.dispatchEvent(
    new CustomEvent("local_draft_changed", { detail: { timestamp } }),
  );
}

export function getDraftTimestamp(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(getStorageKey("last_draft_update"));
}

export type NotificationSettings = {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  adminEmail: string;
  adminPhone: string;
  reminderHoursBefore: number;
};

export type GoogleCalendarSettings = {
  enabled: boolean;
  calendarUrl: string;
  lastSync: string | null;
};

export type ScheduleSettings = {
  timeInterval: number; // intervalo em minutos (15, 30, 60)
  businessHours: BusinessHours;
};

export type StudioSettings = {
  agendaAberta: boolean;
  services: Service[];
  scheduleSettings: ScheduleSettings;
};

export type SiteProfile = {
  name: string;
  description: string;
  titleSuffix?: string;
  logoUrl?: string;
  instagram?: string;
  whatsapp?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  x?: string;
  phone?: string;
  email?: string;
  address?: string;
  showInstagram: boolean;
  showWhatsapp: boolean;
  showFacebook: boolean;
  showTiktok: boolean;
  showLinkedin: boolean;
  showX: boolean;
};

export type HeaderSettings = {
  bgColor: string;
  opacity: number;
  textColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  blurAmount: number; // para o efeito glassmorphism
  titleFont: string;
  linksFont: string;
};

export type FooterSettings = {
  bgColor: string;
  textColor: string;
  titleColor: string;
  iconColor: string;
  titleFont: string;
  bodyFont: string;
};

export const defaultHeaderSettings: HeaderSettings = {
  bgColor: "#ffffff",
  opacity: 0.8,
  textColor: "",
  buttonBgColor: "",
  buttonTextColor: "",
  blurAmount: 8,
  titleFont: "",
  linksFont: "",
};

export const defaultFooterSettings: FooterSettings = {
  bgColor: "", // vindo de secondary/30 por padrão no componente
  textColor: "", // text-muted-foreground
  titleColor: "", // text-primary
  iconColor: "", // text-accent
  titleFont: "Playfair Display",
  bodyFont: "Inter",
};

export type AppearanceSettings = {
  backgroundColor?: string;
  backgroundImageUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  titleFont?: string;
  subtitleFont?: string;
  cardBgColor?: string;
  cardTitleColor?: string;
  cardDescriptionColor?: string;
  cardPriceColor?: string;
  cardIconColor?: string;
  cardTitleFont?: string;
  cardDescriptionFont?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  primaryButtonColor?: string;
  secondaryButtonColor?: string;
  primaryButtonTextColor?: string;
  secondaryButtonTextColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  cardBorderRadius?: number;
  cardBorderWidth?: number;
  cardBorderColor?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  bgType?: string;
  overlay?: {
    color: string;
    opacity: number;
  };
  imageOpacity?: number;
  imageScale?: number;
  imageX?: number;
  imageY?: number;
};

export type HeroSettings = {
  badge: string;
  showBadge: boolean;
  title: string;
  subtitle: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  primaryButton: string;
  secondaryButton: string;
  badgeIcon: string;
  badgeColor: string;
  badgeTextColor: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  titleFont: string;
  subtitleFont: string;
  badgeFont: string;
  primaryButtonColor: string;
  secondaryButtonColor: string;
  primaryButtonTextColor: string;
  secondaryButtonTextColor: string;
  titleColor: string;
  subtitleColor: string;
  primaryButtonFont: string;
  secondaryButtonFont: string;
  primaryButtonLink?: string;
  secondaryButtonLink?: string;
  appearance?: AppearanceSettings;
};

export type StorySettings = {
  title: string;
  showTitle?: boolean;
  titleColor: string;
  titleFont: string;
  content: string;
  contentColor: string;
  contentFont: string;
  image: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  appearance?: AppearanceSettings;
};

export type ValueItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export type ValuesSettings = {
  title: string;
  subtitle: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  titleColor: string;
  subtitleColor: string;
  titleFont: string;
  subtitleFont: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  appearance?: AppearanceSettings;
  // Card specific styles
  cardBgColor: string;
  cardTitleColor: string;
  cardDescriptionColor: string;
  cardIconColor: string;
  cardTitleFont: string;
  cardDescriptionFont: string;
  items: ValueItem[];
};

export type ServicesSettings = {
  title: string;
  subtitle: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  titleColor: string;
  subtitleColor: string;
  titleFont: string;
  subtitleFont: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  appearance?: AppearanceSettings;
  // Card specific styles
  cardBgColor: string;
  cardTitleColor: string;
  cardDescriptionColor: string;
  cardPriceColor: string;
  cardIconColor: string;
  cardTitleFont: string;
  cardDescriptionFont: string;
  cardPriceFont: string;
  cardBorderRadius?: string;
  cardBorderWidth?: string;
  cardBorderColor?: string;
};

export const defaultServicesSettings: ServicesSettings = {
  title: "Nossos Serviços",
  subtitle: "Tratamentos especializados para realçar seu olhar",
  showTitle: true,
  showSubtitle: true,
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "",
  cardTitleColor: "",
  cardDescriptionColor: "",
  cardPriceColor: "",
  cardIconColor: "",
  cardTitleFont: "",
  cardDescriptionFont: "",
  cardPriceFont: "",
};

export const defaultStorySettings: StorySettings = {
  title: "Nossa História",
  titleColor: "",
  titleFont: "",
  content:
    "O Brow Studio nasceu da paixão por realçar a beleza natural de cada pessoa através do design de sobrancelhas. Com mais de 10 anos de experiência no mercado, nos especializamos em técnicas avançadas que valorizam a individualidade de cada cliente.\n\nNossa missão é proporcionar não apenas um serviço de qualidade, mas uma experiência transformadora. Acreditamos que sobrancelhas bem feitas têm o poder de elevar a autoestima e destacar a beleza única de cada pessoa.\n\nInvestimos constantemente em capacitação e nas melhores técnicas do mercado para garantir resultados excepcionais e a satisfação total de nossas clientes.",
  contentColor: "",
  contentFont: "",
  image: "/professional-eyebrow-artist-at-work.jpg",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  appearance: {
    backgroundColor: "",
    backgroundImageUrl: "",
  },
};

export const defaultValuesSettings: ValuesSettings = {
  title: "Nossos Valores",
  subtitle:
    "Os princípios que guiam nosso trabalho e relacionamento com cada cliente",
  showTitle: true,
  showSubtitle: true,
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "",
  cardTitleColor: "",
  cardDescriptionColor: "",
  cardIconColor: "",
  cardTitleFont: "",
  cardDescriptionFont: "",
  items: [
    {
      id: "1",
      icon: "Heart",
      title: "Paixão pelo que Fazemos",
      description:
        "Cada atendimento é realizado com dedicação e amor pela arte de realçar a beleza natural.",
    },
    {
      id: "2",
      icon: "Award",
      title: "Excelência e Qualidade",
      description:
        "Utilizamos apenas produtos de alta qualidade e técnicas comprovadas para resultados perfeitos.",
    },
    {
      id: "3",
      icon: "Users",
      title: "Atendimento Personalizado",
      description:
        "Cada cliente é única e merece um design exclusivo que valorize suas características.",
    },
    {
      id: "4",
      icon: "Sparkles",
      title: "Inovação Constante",
      description:
        "Sempre atualizadas com as últimas tendências e técnicas do mercado de beleza.",
    },
    {
      id: "5",
      icon: "Medal",
      title: "Biossegurança e Higiene",
      description:
        "Seguimos rigorosos protocolos de esterilização e materiais descartáveis para sua total segurança.",
    },
  ],
};

export type GallerySettings = {
  title: string;
  subtitle: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  buttonText: string;
  titleColor: string;
  subtitleColor: string;
  buttonColor: string;
  buttonTextColor: string;
  titleFont: string;
  subtitleFont: string;
  buttonFont: string;
  buttonLink?: string;
  layout: "grid" | "carousel";
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  appearance?: AppearanceSettings;
  // Card specific styles
  cardBgColor?: string;
};

export const defaultGallerySettings: GallerySettings = {
  title: "Nossos Trabalhos",
  subtitle:
    "Veja alguns dos resultados incríveis que alcançamos com nossas clientes",
  buttonText: "Ver Galeria Completa",
  titleColor: "",
  subtitleColor: "",
  buttonColor: "",
  buttonTextColor: "",
  titleFont: "",
  subtitleFont: "",
  buttonFont: "",
  layout: "grid",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "",
};

export type CTASettings = {
  title: string;
  subtitle: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  buttonText: string;
  titleColor: string;
  subtitleColor: string;
  buttonColor: string;
  buttonTextColor: string;
  titleFont: string;
  subtitleFont: string;
  buttonFont: string;
  buttonLink?: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  appearance?: AppearanceSettings;
};

export type BookingStepSettings = {
  title: string;
  subtitle: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  titleColor: string;
  subtitleColor: string;
  titleFont: string;
  subtitleFont: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  accentColor?: string;
  cardBgColor?: string;
  interval?: string | number;
  slotInterval?: string | number;
  step3Times?: {
    interval?: string | number;
  };
  buttonColor?: string;
  appearance?: AppearanceSettings;
};

export const defaultBookingServiceSettings: BookingStepSettings = {
  title: "Escolha seus Serviços",
  subtitle: "Selecione um ou mais serviços para o seu agendamento",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "",
  cardBgColor: "",
  appearance: {
    backgroundImageUrl: "",
  },
};

export const defaultBookingDateSettings: BookingStepSettings = {
  title: "Escolha a Data",
  subtitle: "Selecione o dia de sua preferência",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "",
  cardBgColor: "",
  appearance: {
    backgroundImageUrl: "",
  },
};

export const defaultBookingTimeSettings: BookingStepSettings = {
  title: "Escolha o Horário",
  subtitle: "Selecione o melhor horário disponível",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "",
  cardBgColor: "",
  appearance: {
    backgroundImageUrl: "",
  },
};

export const defaultBookingFormSettings: BookingStepSettings = {
  title: "Seus Dados",
  subtitle: "Preencha suas informações para finalizar o agendamento",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "",
  cardBgColor: "",
  appearance: {
    backgroundImageUrl: "",
  },
};

export const defaultBookingConfirmationSettings: BookingStepSettings = {
  title: "Agendamento Confirmado!",
  subtitle: "Tudo pronto! Você receberá um e-mail com os detalhes.",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "",
  cardBgColor: "",
  appearance: {
    backgroundImageUrl: "",
  },
};

export interface BookingConfig {
  appointmentFlow?: {
    steps?: {
      service?: BookingStepSettings;
      date?: BookingStepSettings;
      time?: BookingStepSettings;
      form?: BookingStepSettings;
      confirmation?: BookingStepSettings;
    };
    service?: BookingStepSettings;
    date?: BookingStepSettings;
    time?: BookingStepSettings;
    form?: BookingStepSettings;
    confirmation?: BookingStepSettings;
  };
  bookingSteps?: {
    service?: BookingStepSettings;
    date?: BookingStepSettings;
    time?: BookingStepSettings;
    form?: BookingStepSettings;
    confirmation?: BookingStepSettings;
  };
}

export function getBookingServiceSettings(config?: SiteConfigData): BookingStepSettings {
  // 1. Inicia com o default imutável
  let base = { ...defaultBookingServiceSettings };

  // Extrai as cores globais do site a partir da configuração
  const siteCustomization = config?.siteCustomization || config?.site_customization;
  const layoutGlobal = siteCustomization?.layoutGlobal || siteCustomization?.layout_global;
  const siteColors = (layoutGlobal as Record<string, unknown>)?.siteColors as Record<string, string> | undefined;
  const globalCardBgColor = siteColors?.cardBackground;
  const globalAccentColor = siteColors?.accent;
  const globalBgColor = siteColors?.background;
  const appointmentFlow = (config as Record<string, unknown> | undefined)
    ?.appointmentFlow as Record<string, unknown> | undefined;
  const step1Services =
    (appointmentFlow?.step1Services as Record<string, unknown>) ||
    (appointmentFlow?.step1_services as Record<string, unknown>) ||
    (appointmentFlow?.step1_service as Record<string, unknown>);
  const step1CardConfig =
    (step1Services?.cardConfig as Record<string, unknown>) ||
    (step1Services?.card_config as Record<string, unknown>);
  const step1CardBg = sanitizeColor(
    (step1CardConfig?.backgroundColor as string) ||
      (step1CardConfig?.cardBackgroundColor as string) ||
      (step1CardConfig?.background_color as string) ||
      (step1CardConfig?.card_background_color as string),
  );

  // 2. Tenta carregar do config (seja appointmentFlow ou bookingSteps)
  const stepConfig =
    config?.bookingSteps?.service ||
    config?.appointmentFlow?.steps?.service ||
    config?.appointmentFlow?.service;

  if (stepConfig) {
    base = {
      ...base,
      ...(stepConfig as BookingStepSettings),
      appearance: {
        ...(base.appearance || {}),
        ...((stepConfig as BookingStepSettings).appearance || {}),
      },
    };
  }

  // 3. Tenta carregar do localStorage (Sobrescreve config se houver rascunho local)
  if (typeof window !== "undefined") {
    const settings = localStorage.getItem(getStorageKey("bookingServiceSettings"));
    if (settings) {
      try {
        const saved = JSON.parse(settings);
        base = {
          ...base,
          ...saved,
          appearance: {
            ...(base.appearance || {}),
            ...(saved.appearance || {}),
          },
        };
      } catch (e) {
        console.error("Erro ao parsear bookingServiceSettings:", e);
      }
    }
  }

  // 4. Sanitização Final: Garante que os campos de topo reflitam o appearance se existirem e estejam sanitizados
  return {
    ...base,
    titleColor: sanitizeColor(base.titleColor || base.appearance?.titleColor || defaultBookingServiceSettings.titleColor) || "",
    subtitleColor: sanitizeColor(base.subtitleColor || base.appearance?.subtitleColor || defaultBookingServiceSettings.subtitleColor) || "",
    titleFont: base.titleFont || base.appearance?.titleFont || defaultBookingServiceSettings.titleFont,
    subtitleFont: base.subtitleFont || base.appearance?.subtitleFont || defaultBookingServiceSettings.subtitleFont,
    cardBgColor: sanitizeColor(base.cardBgColor || base.appearance?.cardBgColor || step1CardBg || globalCardBgColor || defaultBookingServiceSettings.cardBgColor) || "",
    accentColor: sanitizeColor(base.accentColor || base.appearance?.accentColor || globalAccentColor || defaultBookingServiceSettings.accentColor) || "",
    bgColor: sanitizeColor(base.bgColor || base.appearance?.backgroundColor || globalBgColor || defaultBookingServiceSettings.bgColor) || "",
  };
}

export function saveBookingServiceSettings(
  settings: BookingStepSettings,
): void {
  localStorage.setItem(
    getStorageKey("bookingServiceSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bookingServiceSettingsUpdated"));
  }
}

export function getBookingDateSettings(config?: BookingConfig): BookingStepSettings {
  let base = { ...defaultBookingDateSettings };
  const stepConfig = 
    config?.bookingSteps?.date ||
    config?.appointmentFlow?.steps?.date || 
    config?.appointmentFlow?.date;
  
  if (stepConfig) {
    base = {
      ...base,
      ...(stepConfig as BookingStepSettings),
      appearance: {
        ...(base.appearance || {}),
        ...((stepConfig as BookingStepSettings).appearance || {}),
      },
    };
  }
  // 3. Tenta carregar do localStorage (Sobrescreve config se houver rascunho local)
  if (typeof window !== "undefined") {
    const settings = localStorage.getItem(getStorageKey("bookingDateSettings"));
    if (settings) {
      try {
        const saved = JSON.parse(settings);
        base = {
          ...base,
          ...saved,
          appearance: {
            ...(base.appearance || {}),
            ...(saved.appearance || {}),
          },
        };
      } catch (e) {
        console.error("Erro ao parsear bookingDateSettings:", e);
      }
    }
  }

  return {
    ...base,
    titleColor: sanitizeColor(base.titleColor || base.appearance?.titleColor || defaultBookingDateSettings.titleColor) || "",
    subtitleColor: sanitizeColor(base.subtitleColor || base.appearance?.subtitleColor || defaultBookingDateSettings.subtitleColor) || "",
    titleFont: base.titleFont || base.appearance?.titleFont || defaultBookingDateSettings.titleFont,
    subtitleFont: base.subtitleFont || base.appearance?.subtitleFont || defaultBookingDateSettings.subtitleFont,
    cardBgColor: sanitizeColor(base.cardBgColor || base.appearance?.cardBgColor || defaultBookingDateSettings.cardBgColor) || "",
    accentColor: sanitizeColor(base.accentColor || base.appearance?.accentColor || defaultBookingDateSettings.accentColor) || "",
    bgColor: sanitizeColor(base.bgColor || base.appearance?.backgroundColor || defaultBookingDateSettings.bgColor) || "",
  };
}

export function saveBookingDateSettings(settings: BookingStepSettings): void {
  localStorage.setItem(
    getStorageKey("bookingDateSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bookingDateSettingsUpdated"));
  }
}

export function getBookingTimeSettings(config?: BookingConfig): BookingStepSettings {
  let base = { ...defaultBookingTimeSettings };
  const stepConfig = 
    config?.bookingSteps?.time ||
    config?.appointmentFlow?.steps?.time || 
    config?.appointmentFlow?.time;
  
  if (stepConfig) {
    base = {
      ...base,
      ...(stepConfig as BookingStepSettings),
      appearance: {
        ...(base.appearance || {}),
        ...((stepConfig as BookingStepSettings).appearance || {}),
      },
    };
  }
  // 3. Tenta carregar do localStorage (Sobrescreve config se houver rascunho local)
  if (typeof window !== "undefined") {
    const settings = localStorage.getItem(getStorageKey("bookingTimeSettings"));
    if (settings) {
      try {
        const saved = JSON.parse(settings);
        base = {
          ...base,
          ...saved,
          appearance: {
            ...(base.appearance || {}),
            ...(saved.appearance || {}),
          },
        };
      } catch (e) {
        console.error("Erro ao parsear bookingTimeSettings:", e);
      }
    }
  }

  return {
    ...base,
    titleColor: sanitizeColor(base.titleColor || base.appearance?.titleColor || defaultBookingTimeSettings.titleColor) || "",
    subtitleColor: sanitizeColor(base.subtitleColor || base.appearance?.subtitleColor || defaultBookingTimeSettings.subtitleColor) || "",
    titleFont: base.titleFont || base.appearance?.titleFont || defaultBookingTimeSettings.titleFont,
    subtitleFont: base.subtitleFont || base.appearance?.subtitleFont || defaultBookingTimeSettings.subtitleFont,
    cardBgColor: sanitizeColor(base.cardBgColor || base.appearance?.cardBgColor || defaultBookingTimeSettings.cardBgColor) || "",
    accentColor: sanitizeColor(base.accentColor || base.appearance?.accentColor || defaultBookingTimeSettings.accentColor) || "",
    bgColor: sanitizeColor(base.bgColor || base.appearance?.backgroundColor || defaultBookingTimeSettings.bgColor) || "",
  };
}

export function saveBookingTimeSettings(settings: BookingStepSettings): void {
  localStorage.setItem(
    getStorageKey("bookingTimeSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bookingTimeSettingsUpdated"));
  }
}

export function getBookingFormSettings(config?: BookingConfig): BookingStepSettings {
  let base = { ...defaultBookingFormSettings };
  const stepConfig = 
    config?.bookingSteps?.form ||
    config?.appointmentFlow?.steps?.form || 
    config?.appointmentFlow?.form;
  
  if (stepConfig) {
    base = {
      ...base,
      ...(stepConfig as BookingStepSettings),
      appearance: {
        ...(base.appearance || {}),
        ...((stepConfig as BookingStepSettings).appearance || {}),
      },
    };
  }
  // 3. Tenta carregar do localStorage (Sobrescreve config se houver rascunho local)
  if (typeof window !== "undefined") {
    const settings = localStorage.getItem(getStorageKey("bookingFormSettings"));
    if (settings) {
      try {
        const saved = JSON.parse(settings);
        base = {
          ...base,
          ...saved,
          appearance: {
            ...(base.appearance || {}),
            ...(saved.appearance || {}),
          },
        };
      } catch (e) {
        console.error("Erro ao parsear bookingFormSettings:", e);
      }
    }
  }

  return {
    ...base,
    titleColor: sanitizeColor(base.titleColor || base.appearance?.titleColor || defaultBookingFormSettings.titleColor) || "",
    subtitleColor: sanitizeColor(base.subtitleColor || base.appearance?.subtitleColor || defaultBookingFormSettings.subtitleColor) || "",
    titleFont: base.titleFont || base.appearance?.titleFont || defaultBookingFormSettings.titleFont,
    subtitleFont: base.subtitleFont || base.appearance?.subtitleFont || defaultBookingFormSettings.subtitleFont,
    cardBgColor: sanitizeColor(base.cardBgColor || base.appearance?.cardBgColor || defaultBookingFormSettings.cardBgColor) || "",
    accentColor: sanitizeColor(base.accentColor || base.appearance?.accentColor || defaultBookingFormSettings.accentColor) || "",
    bgColor: sanitizeColor(base.bgColor || base.appearance?.backgroundColor || defaultBookingFormSettings.bgColor) || "",
  };
}

export function saveBookingFormSettings(settings: BookingStepSettings): void {
  localStorage.setItem(
    getStorageKey("bookingFormSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bookingFormSettingsUpdated"));
  }
}

export function getBookingConfirmationSettings(config?: BookingConfig): BookingStepSettings {
  let base = { ...defaultBookingConfirmationSettings };
  const stepConfig = 
    config?.bookingSteps?.confirmation ||
    config?.appointmentFlow?.steps?.confirmation || 
    config?.appointmentFlow?.confirmation;
  
  if (stepConfig) {
    base = {
      ...base,
      ...(stepConfig as BookingStepSettings),
      appearance: {
        ...(base.appearance || {}),
        ...((stepConfig as BookingStepSettings).appearance || {}),
      },
    };
  }
  // 3. Tenta carregar do localStorage (Sobrescreve config se houver rascunho local)
  if (typeof window !== "undefined") {
    const settings = localStorage.getItem(getStorageKey("bookingConfirmationSettings"));
    if (settings) {
      try {
        const saved = JSON.parse(settings);
        base = {
          ...base,
          ...saved,
          appearance: {
            ...(base.appearance || {}),
            ...(saved.appearance || {}),
          },
        };
      } catch (e) {
        console.error("Erro ao parsear bookingConfirmationSettings:", e);
      }
    }
  }

  return {
    ...base,
    titleColor: sanitizeColor(base.titleColor || base.appearance?.titleColor || defaultBookingConfirmationSettings.titleColor) || "",
    subtitleColor: sanitizeColor(base.subtitleColor || base.appearance?.subtitleColor || defaultBookingConfirmationSettings.subtitleColor) || "",
    titleFont: base.titleFont || base.appearance?.titleFont || defaultBookingConfirmationSettings.titleFont,
    subtitleFont: base.subtitleFont || base.appearance?.subtitleFont || defaultBookingConfirmationSettings.subtitleFont,
    cardBgColor: sanitizeColor(base.cardBgColor || base.appearance?.cardBgColor || defaultBookingConfirmationSettings.cardBgColor) || "",
    accentColor: sanitizeColor(base.accentColor || base.appearance?.accentColor || defaultBookingConfirmationSettings.accentColor) || "",
    bgColor: sanitizeColor(base.bgColor || base.appearance?.backgroundColor || defaultBookingConfirmationSettings.bgColor) || "",
  };
}

export function saveBookingConfirmationSettings(
  settings: BookingStepSettings,
): void {
  localStorage.setItem(
    getStorageKey("bookingConfirmationSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bookingConfirmationSettingsUpdated"));
  }
}

export function clearAllCustomizationCache(): void {
  if (typeof window === "undefined") return;

  const keysToClear = [
    "heroSettings",
    "aboutHeroSettings",
    "storySettings",
    "teamSettings",
    "testimonialsSettings",
    "fontSettings",
    "colorSettings",
    "servicesSettings",
    "valuesSettings",
    "homeValuesSettings",
    "aboutUsValuesSettings",
    "gallerySettings",
    "ctaSettings",
    "headerSettings",
    "footerSettings",
    "bookingServiceSettings",
    "bookingDateSettings",
    "bookingTimeSettings",
    "bookingFormSettings",
    "bookingConfirmationSettings",
    "pageVisibility",
    "visibleSections",
    "layoutGlobal",
    "siteProfile",
    "studio_data",
    "studio_last_slug",
    "last_draft_update",
    "services",
    "studioSettings",
  ];

  keysToClear.forEach((key) => {
    localStorage.removeItem(getStorageKey(key));
    // Também limpa a versão sem o prefixo do usuário, por precaução
    localStorage.removeItem(key);
    localStorage.removeItem(`aura_${key}`);
    localStorage.removeItem(`booking_${key}`);
  });

  console.log(">>> [booking-data] Todo o cache de customização foi limpo.");
}

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  description: string;
};

export type TeamSettings = {
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  titleFont: string;
  subtitleFont: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  cardBgColor: string;
  cardTitleColor: string;
  cardRoleColor: string;
  cardDescriptionColor: string;
  cardTitleFont: string;
  cardRoleFont: string;
  cardDescriptionFont: string;
  appearance?: AppearanceSettings;
  members: TeamMember[];
};

export type Testimonial = {
  id: string;
  name: string;
  text: string;
  rating: number;
  image?: string;
};

export type TestimonialsSettings = {
  starColor: string;
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  titleFont: string;
  subtitleFont: string;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  cardBgColor: string;
  cardNameColor: string;
  cardTextColor: string;
  cardNameFont: string;
  cardTextFont: string;
  appearance?: AppearanceSettings;
  testimonials: Testimonial[];
};

export const defaultCTASettings: CTASettings = {
  title: "Pronta Para Transformar Seu Olhar?",
  subtitle:
    "Agende seu horário agora e descubra como sobrancelhas bem feitas podem realçar toda sua beleza",
  buttonText: "Agendar Agora",
  titleColor: "",
  subtitleColor: "",
  buttonColor: "",
  buttonTextColor: "",
  titleFont: "",
  subtitleFont: "",
  buttonFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.1,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
};

export const defaultTeamSettings: TeamSettings = {
  title: "Nossa Equipe",
  subtitle: "Conheça as profissionais especialistas que cuidarão do seu olhar",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "",
  cardTitleColor: "",
  cardRoleColor: "",
  cardDescriptionColor: "",
  cardTitleFont: "",
  cardRoleFont: "",
  cardDescriptionFont: "",
  members: [
    {
      id: "1",
      name: "Ana Silva",
      role: "Master Designer",
      image: "/professional-eyebrow-artist-at-work.jpg",
      description:
        "Especialista em micropigmentação e design personalizado com mais de 8 anos de experiência.",
    },
    {
      id: "2",
      name: "Beatriz Costa",
      role: "Designer & Lash Artist",
      image: "/professional-eyebrow-artist-at-work.jpg",
      description:
        "Especialista em lash lifting e design de sobrancelhas com foco em naturalidade.",
    },
  ],
};

export const defaultTestimonialsSettings: TestimonialsSettings = {
  starColor: "",
  title: "O Que Dizem Nossas Clientes",
  subtitle: "A satisfação de nossas clientes é nossa maior conquista",
  titleColor: "",
  subtitleColor: "",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "",
  cardNameColor: "",
  cardTextColor: "",
  cardNameFont: "",
  cardTextFont: "",
  testimonials: [
    {
      id: "1",
      name: "Maria Oliveira",
      text: "Simplesmente perfeito! A Ana entendeu exatamente o que eu queria e o resultado ficou incrível.",
      rating: 5,
    },
    {
      id: "2",
      name: "Fernanda Lima",
      text: "Profissionais extremamente capacitadas e atenciosas. O ambiente é acolhedor e o resultado superou minhas expectativas.",
      rating: 5,
    },
  ],
};

export type FontSettings = {
  headingFont: string;
  subtitleFont: string;
  bodyFont: string;
};

export type Expense = {
  id: string;
  description: string;
  value: number;
  category: string;
  date: string; // YYYY-MM-DD
  isFixed: boolean;
};

export type ColorSettings = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent?: string;
  buttonText?: string;
};

export const services: Service[] = [];

// Helper para normalizar configurações (usado tanto no load inicial quanto no preview)
export const normalizeStepSettings = (
  stepData: Record<string, unknown> | undefined,
): BookingStepSettings => {
  if (!stepData) return {} as BookingStepSettings;

  // 1. Resolver cor do CARD
  // Prioridade para configurações específicas de card, com fallback para backgroundColor legado
  const cardConfig = (stepData.cardConfig || stepData.card_config || {}) as Record<string, unknown>;
  const appearanceRaw = (stepData.appearance || {}) as Record<string, unknown>;
  const content = (stepData.content || {}) as Record<string, unknown>;
  const itemsStyle = (stepData.itemsStyle || stepData.items_style || {}) as Record<string, unknown>;

  const rawCardColor =
    (stepData.cardBgColor as string) ||
    (stepData.card_bg_color as string) ||
    (stepData.cardBackgroundColor as string) ||
    (stepData.card_background_color as string) ||
    (cardConfig.cardBackgroundColor as string) ||
    (cardConfig.backgroundColor as string) ||
    (cardConfig.card_background_color as string) ||
    (cardConfig.background_color as string) ||
    (appearanceRaw.cardBgColor as string) ||
    (appearanceRaw.cardBackgroundColor as string) ||
    (appearanceRaw.card_bg_color as string) ||
    (appearanceRaw.card_background_color as string) ||
    (content.cardBgColor as string) ||
    (content.card_bg_color as string) ||
    (itemsStyle.itemBackgroundColor as string) ||
    (itemsStyle.item_background_color as string) ||
    (stepData.backgroundColor as string);

  const finalCardColor = sanitizeColor(rawCardColor);

  // 2. Resolver cor do FUNDO DA SEÇÃO
  // NÃO usar rawCardColor como fallback para evitar que a cor do card pinte o fundo
  const rawBgColor =
    (stepData.bgColor as string) || (stepData.bg_color as string);
  const finalBgColor = sanitizeColor(rawBgColor);

  // 3. Resolver Appearance (Source of Truth do banco)
  const appearance = (stepData.appearance as Record<string, unknown>) || {
    backgroundImageUrl: (stepData.bgImage as string) || "",
  };

  return {
    ...stepData,
    cardBgColor: finalCardColor || "",
    bgColor: finalBgColor || "transparent",
    appearance: {
      backgroundImageUrl:
        (appearance.backgroundImageUrl as string) ||
        (stepData.bgImage as string) ||
        "",
    },
  } as BookingStepSettings;
};

export const defaultScheduleSettings: ScheduleSettings = {
  timeInterval: 30,
  businessHours: {
    openTime: "09:00",
    lunchStart: "12:00",
    lunchEnd: "14:00",
    closeTime: "18:00",
  },
};

export const defaultWeekSchedule: WeekSchedule = [
  {
    dayOfWeek: 0,
    dayName: "Domingo",
    isOpen: false,
    openTime: "09:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "18:00",
    interval: 30,
  },
  {
    dayOfWeek: 1,
    dayName: "Segunda-feira",
    isOpen: true,
    openTime: "07:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "18:00",
    interval: 30,
  },
  {
    dayOfWeek: 2,
    dayName: "Terça-feira",
    isOpen: true,
    openTime: "07:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "18:00",
    interval: 30,
  },
  {
    dayOfWeek: 3,
    dayName: "Quarta-feira",
    isOpen: true,
    openTime: "07:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "18:00",
    interval: 30,
  },
  {
    dayOfWeek: 4,
    dayName: "Quinta-feira",
    isOpen: true,
    openTime: "07:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "18:00",
    interval: 30,
  },
  {
    dayOfWeek: 5,
    dayName: "Sexta-feira",
    isOpen: true,
    openTime: "07:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "18:00",
    interval: 30,
  },
  {
    dayOfWeek: 6,
    dayName: "Sábado",
    isOpen: true,
    openTime: "08:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    closeTime: "17:00",
    interval: 30,
  },
];

export const defaultNotificationSettings: NotificationSettings = {
  emailEnabled: true,
  whatsappEnabled: true,
  adminEmail: "studio@example.com",
  adminPhone: "5511999999999",
  reminderHoursBefore: 24,
};

export const defaultGoogleCalendarSettings: GoogleCalendarSettings = {
  enabled: false,
  calendarUrl: "",
  lastSync: null,
};

export const defaultSiteProfile: SiteProfile = {
  name: "",
  description:
    "Especialistas em design de sobrancelhas, dedicados a realçar sua beleza natural.",
  titleSuffix: "Agendamento Online",
  logoUrl: "",
  instagram: "",
  whatsapp: "",
  facebook: "",
  tiktok: "",
  linkedin: "",
  x: "",
  phone: "",
  email: "",
  address: "",
  showInstagram: true,
  showWhatsapp: true,
  showFacebook: true,
  showTiktok: false,
  showLinkedin: false,
  showX: false,
};

export const defaultHeroSettings: HeroSettings = {
  badge: "Especialistas em Design de Sobrancelhas",
  showBadge: true,
  badgeIcon: "Sparkles",
  badgeColor: "",
  badgeTextColor: "",
  title: "Realce Sua Beleza Natural",
  subtitle:
    "Especialistas em design de sobrancelhas, dedicados a realçar sua beleza natural.",
  primaryButton: "Agendar Horário",
  secondaryButton: "Ver Trabalhos",
  bgType: "color",
  bgColor: "#ffffff",
  bgImage: "",
  imageOpacity: 0.2,
  overlayOpacity: 0.8,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  titleFont: "",
  subtitleFont: "",
  badgeFont: "",
  primaryButtonColor: "",
  secondaryButtonColor: "",
  primaryButtonTextColor: "",
  secondaryButtonTextColor: "",
  titleColor: "",
  subtitleColor: "",
  primaryButtonFont: "",
  secondaryButtonFont: "",
};

export const defaultFontSettings: FontSettings = {
  headingFont: "Playfair Display",
  subtitleFont: "Playfair Display",
  bodyFont: "Inter",
};

export const defaultColorSettings: ColorSettings = {
  primary: "#111827", // slate-900
  secondary: "#4b5563", // slate-600
  background: "#ffffff",
  text: "#111827",
};

export function getColorSettings(): ColorSettings {
  if (typeof window === "undefined") return defaultColorSettings;
  const settings = localStorage.getItem(getStorageKey("colorSettings"));
  return settings ? JSON.parse(settings) : defaultColorSettings;
}

export function saveColorSettings(settings: ColorSettings): void {
  localStorage.setItem(
    getStorageKey("colorSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("colorSettingsUpdated"));
  }
}

export function generateTimeSlotsForDate(
  date: string,
  forcedInterval?: number,
  externalSchedule?: DaySchedule,
): string[] {
  const dateObj = new Date(`${date}T00:00:00`);
  const dayOfWeek = dateObj.getDay();
  const weekSchedule = getWeekSchedule();
  const daySchedule =
    externalSchedule || weekSchedule.find((d) => d.dayOfWeek === dayOfWeek);

  if (!daySchedule || !daySchedule.isOpen) {
    return [];
  }

  const slots: string[] = [];
  const { openTime, lunchStart, lunchEnd, closeTime } = daySchedule;
  const interval = forcedInterval || daySchedule.interval || 30; // Prioridade para o forçado, depois schedule, depois 30

  console.log(`>>> [TIME_SLOTS] Gerando horários para o dia ${dayOfWeek}:`, {
    interval: `${interval}min`,
    open: openTime,
    lunch: `${lunchStart} - ${lunchEnd}`,
    close: closeTime,
    isExternal: !!externalSchedule,
  });

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const openMinutes = timeToMinutes(openTime);
  const lunchStartMinutes = timeToMinutes(lunchStart);
  const lunchEndMinutes = timeToMinutes(lunchEnd);
  const closeMinutes = timeToMinutes(closeTime);

  // Manhã
  for (let time = openMinutes; time < lunchStartMinutes; time += interval) {
    slots.push(minutesToTime(time));
  }

  // Tarde
  for (let time = lunchEndMinutes; time < closeMinutes; time += interval) {
    slots.push(minutesToTime(time));
  }

  return slots;
}

export function parseDuration(val?: string | number): number {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const strVal = String(val);
  if (strVal.includes(":")) {
    const [hrs, mins] = strVal.split(":").map((n) => parseInt(n, 10));
    return hrs * 60 + (mins || 0);
  }
  return parseInt(strVal, 10) || 0;
}

export function getAvailableTimeSlots(
  date: string,
  serviceDuration = 60,
  forcedInterval?: number,
  externalBookings?: Booking[],
  externalSchedule?: DaySchedule,
  externalBlocks?: BlockedPeriod[],
): TimeSlot[] {
  const allSlots = generateTimeSlotsForDate(
    date,
    forcedInterval,
    externalSchedule,
  );
  const bookings = externalBookings || getBookingsFromStorage();
  const blockedPeriods = externalBlocks || getBlockedPeriods();
  const dateObj = new Date(`${date}T00:00:00`);
  const dayOfWeek = dateObj.getDay();
  const weekSchedule = getWeekSchedule();

  // Usar schedule externo (do backend) se fornecido, senão fallback para localStorage
  const daySchedule =
    externalSchedule || weekSchedule.find((d) => d.dayOfWeek === dayOfWeek);

  if (!daySchedule || !daySchedule.isOpen) {
    return [];
  }

  // Filtrar bloqueios para este dia específico
  const dayBlocks = blockedPeriods.filter((b) => b.date === date);

  const dayBookings = bookings.filter(
    (b: Booking) => b.date === date && b.status !== "cancelado",
  );

  return allSlots.map((time) => {
    const available = isTimeSlotAvailable(
      time,
      serviceDuration,
      dayBookings,
      daySchedule,
      dayBlocks,
    );
    return { time, available };
  });
}

function isTimeSlotAvailable(
  time: string,
  duration: number,
  bookings: Booking[],
  daySchedule: DaySchedule,
  dayBlocks: BlockedPeriod[] = [],
): boolean {
  const timeToMinutes = (t: string) => {
    const [hours, minutes] = t.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = timeToMinutes(time);
  const numericDuration =
    typeof duration === "string" ? parseInt(duration, 10) : duration;
  const endMinutes = startMinutes + numericDuration;

  // console.log(`>>> [AVAILABILITY_CHECK] ${time} (dur: ${duration}min):`, {
  //   start: startMinutes,
  //   end: endMinutes,
  //   close: daySchedule.closeTime,
  //   lunch: `${daySchedule.lunchStart}-${daySchedule.lunchEnd}`
  // });

  // 1. Verificar se o dia todo está bloqueado
  const fullDayBlock = dayBlocks.find((b) => !b.startTime && !b.endTime);
  if (fullDayBlock) {
    console.log(`>>> [AVAILABILITY] ${time} indisponível: Dia bloqueado`);
    return false;
  }

  // 2. Verificar bloqueios de horário parcial
  for (const block of dayBlocks) {
    if (block.startTime && block.endTime) {
      const blockStart = timeToMinutes(block.startTime);
      const blockEnd = timeToMinutes(block.endTime);

      if (startMinutes < blockEnd && endMinutes > blockStart) {
        console.log(
          `>>> [AVAILABILITY] ${time} indisponível: Conflito com bloqueio (${block.startTime}-${block.endTime})`,
        );
        return false;
      }
    }
  }

  // 3. Verificar se não ultrapassa horário de fechamento
  const closeMinutes = timeToMinutes(daySchedule.closeTime);
  if (endMinutes > closeMinutes) {
    console.log(
      `>>> [AVAILABILITY] ${time} indisponível: Ultrapassa fechamento (${daySchedule.closeTime}). Start: ${time}, End: ${minutesToTime(endMinutes)}, Close: ${daySchedule.closeTime}`,
    );
    return false;
  }

  // 4. Verificar se não conflita com horário de almoço
  const lunchStartMinutes = timeToMinutes(daySchedule.lunchStart);
  const lunchEndMinutes = timeToMinutes(daySchedule.lunchEnd);

  // Se lunchStart === lunchEnd, não há almoço
  if (lunchStartMinutes !== lunchEndMinutes) {
    if (startMinutes < lunchEndMinutes && endMinutes > lunchStartMinutes) {
      console.log(
        `>>> [AVAILABILITY] ${time} indisponível: Conflito com almoço (${daySchedule.lunchStart}-${daySchedule.lunchEnd}). Slot: ${time}-${minutesToTime(endMinutes)}, Lunch: ${daySchedule.lunchStart}-${daySchedule.lunchEnd}`,
      );
      return false;
    }
  }

  // 5. Verificar conflitos com outros agendamentos
  for (const booking of bookings) {
    const bookingStart = timeToMinutes(booking.time);

    let bookingDuration: number;

    if (booking.serviceDurationSnapshot) {
      if (
        typeof booking.serviceDurationSnapshot === "string" &&
        booking.serviceDurationSnapshot.includes(":")
      ) {
        const [h, m] = booking.serviceDurationSnapshot.split(":").map(Number);
        bookingDuration = h * 60 + m;
      } else {
        bookingDuration = parseInt(String(booking.serviceDurationSnapshot), 10);
      }
    } else {
      bookingDuration =
        typeof booking.serviceDuration === "string"
          ? parseInt(booking.serviceDuration, 10)
          : booking.serviceDuration;
    }

    const bookingEnd = bookingStart + bookingDuration;

    // Se o slot começa antes do fim do agendamento E termina depois do início do agendamento
    if (startMinutes < bookingEnd && endMinutes > bookingStart) {
      console.log(
        `>>> [AVAILABILITY] ${time} indisponível: Conflito com agendamento (${booking.time}, ${bookingDuration}min). Slot: ${time}-${minutesToTime(endMinutes)}, Booking: ${booking.time}-${minutesToTime(bookingEnd)}`,
      );
      return false;
    }
  }

  return true;
}

const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

export function getBookingsFromStorage(): Booking[] {
  // O Banco de Dados é a única fonte da verdade no F5.
  return [];
}

export function saveBookingToStorage(_booking: Booking): void {
  // const bookings = getBookingsFromStorage();
  // bookings.push(booking);
  // localStorage.setItem(getStorageKey("bookings"), JSON.stringify(bookings));
}

export function saveBookingsToStorage(_newBookings: Booking[]): void {
  // const bookings = getBookingsFromStorage();
  // const updated = [...bookings, ...newBookings];
  // localStorage.setItem(getStorageKey("bookings"), JSON.stringify(updated));
}

export function updateBookingStatus(
  _bookingId: string,
  _status: BookingStatus,
): void {
  // const bookings = getBookingsFromStorage();
  // const updated = bookings.map((b) =>
  //   b.id === bookingId ? { ...b, status } : b,
  // );
  // localStorage.setItem(getStorageKey("bookings"), JSON.stringify(updated));
}

export function updateBooking(_updatedBooking: Booking): void {
  // const bookings = getBookingsFromStorage();
  // const updated = bookings.map((b) =>
  //   b.id === updatedBooking.id ? updatedBooking : b,
  // );
  // localStorage.setItem(getStorageKey("bookings"), JSON.stringify(updated));
}

export function markNotificationsSent(
  _bookingId: string,
  _type: "email" | "whatsapp",
): void {
  // const bookings = getBookingsFromStorage();
  // const updated = bookings.map((b) =>
  //   b.id === bookingId
  //     ? { ...b, notificationsSent: { ...b.notificationsSent, [type]: true } }
  //     : b,
  // );
  // localStorage.setItem(getStorageKey("bookings"), JSON.stringify(updated));
}

export function getInventoryFromStorage(): InventoryItem[] {
  // O Banco de Dados é a única fonte da verdade no F5.
  return [];
}

export function saveInventoryToStorage(_inventory: InventoryItem[]): void {
  // localStorage.setItem(getStorageKey("inventory"), JSON.stringify(inventory));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("inventoryUpdated"));
  }
}

export async function subtractInventoryForServiceAsync(
  serviceIds: string | string[],
  companyId: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const ids = Array.isArray(serviceIds) ? serviceIds : [serviceIds];

    // 1. Buscar estoque atual da API
    const inventory = await inventoryService.list(companyId);
    if (!inventory || inventory.length === 0) {
      return { success: false, message: "Estoque vazio ou não encontrado." };
    }

    // 2. Buscar configurações (para obter detalhes dos serviços e seus produtos)
    const settings = getSettingsFromStorage();
    const logs: string[] = [];
    let updatedAny = false;

    // Mapa para agregar itens (Product ID -> Quantidade Total)
    const aggregatedItems: Record<
      string,
      { quantity: number; product: InventoryItem; name: string }
    > = {};

    for (const serviceId of ids) {
      const service = settings.services.find(
        (s: Service) => s.id === serviceId,
      );
      if (!service) continue;

      // Priorizar 'resources' (novo formato) sobre 'products' (legado)
      const itemsToSubtract = service.resources?.length
        ? service.resources.map((r) => ({
            productId: r.inventoryId,
            quantity: r.quantity,
            useSecondaryUnit: r.useSecondaryUnit,
          }))
        : service.products || [];

      if (itemsToSubtract.length === 0) continue;

      for (const serviceProduct of itemsToSubtract) {
        const product = inventory.find(
          (p) => p.id === serviceProduct.productId,
        );

        if (product) {
          let quantityToSubtract = serviceProduct.quantity;

          // Lógica de conversão de unidade
          if (
            serviceProduct.useSecondaryUnit &&
            product.conversionFactor &&
            product.conversionFactor > 0
          ) {
            quantityToSubtract =
              serviceProduct.quantity / product.conversionFactor;
          }

          // Verificação de EPI/Reutilização
          const isReusable = product.isShared === true;

          if (aggregatedItems[product.id]) {
            if (isReusable) {
              // Se é reutilizável, usamos a quantidade máxima necessária (não soma)
              // Ex: Serviço A precisa de 1 par de luvas, Serviço B precisa de 1 par. Total = 1 par.
              aggregatedItems[product.id].quantity = Math.max(
                aggregatedItems[product.id].quantity,
                quantityToSubtract,
              );
            } else {
              // Se não é reutilizável (ex: ml de shampoo), somamos
              aggregatedItems[product.id].quantity += quantityToSubtract;
            }
          } else {
            aggregatedItems[product.id] = {
              quantity: quantityToSubtract,
              product: product,
              name: product.name,
            };
          }
        }
      }
    }

    // 3. Processar a subtração dos itens agregados
    for (const productId in aggregatedItems) {
      const { quantity, product, name } = aggregatedItems[productId];
      const quantityToSubtract = quantity;

      const currentQty = Number(product.quantity);
      const minQty = Number(product.minQuantity || 0);

      if (currentQty < quantityToSubtract) {
        logs.push(
          `Estoque insuficiente para ${name}: necessário ${quantityToSubtract.toLocaleString("pt-BR")}${product.unit}, disponível ${currentQty.toLocaleString("pt-BR")}${product.unit}`,
        );
      } else {
        const newQty = currentQty - quantityToSubtract;
        if (newQty <= minQty) {
          logs.push(
            `Atenção: Estoque baixo de ${name} (${newQty.toLocaleString("pt-BR")}${product.unit}). Mínimo: ${minQty}${product.unit}`,
          );
        }
      }

      // Realizar a baixa de estoque via API
      console.log("[DEBUG_PAYLOAD]", { quantity: quantityToSubtract });
      await inventoryService.subtract(product.id, quantityToSubtract);
      updatedAny = true;
    }

    if (!updatedAny) {
      return {
        success: true,
        message: "Nenhum produto vinculado a este serviço para baixar.",
      };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("inventoryUpdated"));
    }

    if (logs.length > 0) {
      return {
        success: true,
        message: `Estoque atualizado, mas houve alertas:\n${logs.join("\n")}`,
      };
    }

    return { success: true, message: "Estoque atualizado com sucesso via API" };
  } catch (error) {
    const err = error as { response?: { data?: unknown }; message?: string };
    console.error(
      "[SUBTRACT_INVENTORY_ERROR]",
      err.response?.data || err.message || err,
    );
    return {
      success: false,
      message: "Erro ao atualizar estoque no servidor.",
    };
  }
}

export function subtractInventoryForService(serviceIds: string | string[]): {
  success: boolean;
  message: string;
} {
  if (typeof window === "undefined")
    return { success: false, message: "Ambiente inválido" };

  const ids = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
  const settings = getSettingsFromStorage();
  const inventory = getInventoryFromStorage();
  const updatedInventory = [...inventory];
  const logs: string[] = [];

  for (const serviceId of ids) {
    const service = settings.services.find((s: Service) => s.id === serviceId);
    if (!service) continue;

    // Priorizar 'resources' (novo formato) sobre 'products' (legado)
    const itemsToSubtract = service.resources?.length
      ? service.resources.map((r) => ({
          productId: r.inventoryId,
          quantity: r.quantity,
          useSecondaryUnit: r.useSecondaryUnit,
        }))
      : service.products || [];

    if (itemsToSubtract.length === 0) continue;

    for (const serviceProduct of itemsToSubtract) {
      const inventoryProductIndex = updatedInventory.findIndex(
        (p) => p.id === serviceProduct.productId,
      );

      if (inventoryProductIndex !== -1) {
        const product = updatedInventory[inventoryProductIndex];

        let quantityToSubtract = serviceProduct.quantity;
        let unitLabel = product.unit;

        if (
          serviceProduct.useSecondaryUnit &&
          product.conversionFactor &&
          product.conversionFactor > 0
        ) {
          quantityToSubtract =
            serviceProduct.quantity / product.conversionFactor;
          unitLabel = product.secondaryUnit || product.unit;
        }

        if (product.quantity < quantityToSubtract) {
          logs.push(
            `Estoque insuficiente para ${product.name}: necessário ${serviceProduct.quantity}${unitLabel}, disponível ${product.quantity.toLocaleString("pt-BR")}${product.unit}`,
          );
        }

        const newQuantity = Math.max(0, product.quantity - quantityToSubtract);

        const logEntry: InventoryLog = {
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date().toISOString(),
          type: "servico",
          quantityChange: -quantityToSubtract,
          previousQuantity: product.quantity,
          newQuantity: newQuantity,
          notes: `Baixa automática via serviço: ${service.name}`,
        };

        updatedInventory[inventoryProductIndex] = {
          ...product,
          quantity: newQuantity,
          lastUpdate: new Date().toISOString(),
          logs: [logEntry, ...(product.logs || [])].slice(0, 50),
        };
      }
    }
  }

  saveInventoryToStorage(updatedInventory);

  if (logs.length > 0) {
    return {
      success: true,
      message: `Estoque atualizado, mas houve alertas:\n${logs.join("\n")}`,
    };
  }

  return { success: true, message: "Estoque atualizado com sucesso" };
}

export function getSettingsFromStorage(): StudioSettings {
  const defaultValue: StudioSettings = {
    agendaAberta: true,
    services: services,
    scheduleSettings: defaultScheduleSettings,
  };

  // O Banco de Dados é a única fonte da verdade no F5.
  return defaultValue;

  /* 
  if (typeof window === "undefined") return defaultValue;

  try {
    const settings = localStorage.getItem(getStorageKey("studioSettings"));
    if (!settings || settings === "undefined") return defaultValue;

    const parsed = JSON.parse(settings);
    if (!parsed || typeof parsed !== "object") return defaultValue;

    return parsed as StudioSettings;
  } catch (error) {
    console.warn(
      ">>> [STORAGE_WARN] Erro ao ler configurações do estúdio:",
      error,
    );
    return defaultValue;
  }
  */
}

export function saveSettingsToStorage(_settings: StudioSettings): void {
  // localStorage.setItem(
  //   getStorageKey("studioSettings"),
  //   JSON.stringify(settings),
  // );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("studioSettingsUpdated"));
  }
}

export function getScheduleSettings(): ScheduleSettings {
  const settings = getSettingsFromStorage();
  return settings.scheduleSettings || defaultScheduleSettings;
}

export function getWeekSchedule(): WeekSchedule {
  // O Banco de Dados é a única fonte da verdade no F5.
  return defaultWeekSchedule;
  /*
  if (typeof window === "undefined") return defaultWeekSchedule;
  const settings = localStorage.getItem(getStorageKey("weekSchedule"));
  return settings ? JSON.parse(settings) : defaultWeekSchedule;
  */
}

export function saveWeekSchedule(_schedule: WeekSchedule): void {
  // localStorage.setItem(getStorageKey("weekSchedule"), JSON.stringify(schedule));
}

export type GalleryImage = {
  id: string;
  url: string;
  title: string;
  category: string;
  createdAt: string;
  showOnHome: boolean;
};

export function getGalleryImages(): GalleryImage[] {
  // O Banco de Dados é a única fonte da verdade no F5.
  return [];
  /*
  if (typeof window === "undefined") return [];
  const images = localStorage.getItem(getStorageKey("galleryImages"));
  return images ? JSON.parse(images) : [];
  */
}

export function saveGalleryImages(_images: GalleryImage[]): void {
  // localStorage.setItem(getStorageKey("galleryImages"), JSON.stringify(images));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("galleryUpdated"));
  }
}

export function getBlockedPeriods(): BlockedPeriod[] {
  // O Banco de Dados é a única fonte da verdade no F5.
  return [];
  /*
  if (typeof window === "undefined") return [];
  const blocked = localStorage.getItem(getStorageKey("blockedPeriods"));
  return blocked ? JSON.parse(blocked) : [];
  */
}

export function getServices(): Service[] {
  const settings = getSettingsFromStorage();
  return settings.services && settings.services.length > 0
    ? settings.services
    : services;
}

export function saveServices(_newServices: Service[]): void {
  /*
  const settings = getSettingsFromStorage();
  settings.services = newServices;
  localStorage.setItem(
    getStorageKey("studioSettings"),
    JSON.stringify(settings),
  );
  localStorage.setItem(getStorageKey("services"), JSON.stringify(newServices));
  */
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("studioSettingsUpdated"));
    window.dispatchEvent(new Event("servicesUpdated"));
  }
}

export function saveBlockedPeriods(_blocked: BlockedPeriod[]): void {
  // localStorage.setItem(
  //   getStorageKey("blockedPeriods"),
  //   JSON.stringify(blocked),
  // );
}

export function getNotificationSettings(): NotificationSettings {
  // O Banco de Dados é a única fonte da verdade no F5.
  return defaultNotificationSettings;
  /*
  if (typeof window === "undefined") return defaultNotificationSettings;
  const settings = localStorage.getItem(getStorageKey("notificationSettings"));
  return settings ? JSON.parse(settings) : defaultNotificationSettings;
  */
}

export function saveNotificationSettings(_settings: NotificationSettings): void {
  // localStorage.setItem(
  //   getStorageKey("notificationSettings"),
  //   JSON.stringify(settings),
  // );
}

export function getGoogleCalendarSettings(): GoogleCalendarSettings {
  // O Banco de Dados é a única fonte da verdade no F5.
  return defaultGoogleCalendarSettings;
  /*
  if (typeof window === "undefined") return defaultGoogleCalendarSettings;
  const settings = localStorage.getItem(
    getStorageKey("googleCalendarSettings"),
  );
  return settings ? JSON.parse(settings) : defaultGoogleCalendarSettings;
  */
}

export function saveGoogleCalendarSettings(
  _settings: GoogleCalendarSettings,
): void {
  // localStorage.setItem(
  //   getStorageKey("googleCalendarSettings"),
  //   JSON.stringify(settings),
  // );
}

export function getSiteProfile(): SiteProfile {
  // O Banco de Dados é a única fonte da verdade no F5.
  return defaultSiteProfile;
  /*
  if (typeof window === "undefined") return defaultSiteProfile;
  const profile = localStorage.getItem(getStorageKey("siteProfile"));
  return profile
    ? { ...defaultSiteProfile, ...JSON.parse(profile) }
    : defaultSiteProfile;
  */
}

export function saveSiteProfile(_profile: SiteProfile): void {
  // const storageKey = getStorageKey("siteProfile");
  // console.log(
  //   `>>> [booking-data] Salvando siteProfile em ${storageKey}:`,
  //   profile,
  // );
  // localStorage.setItem(storageKey, JSON.stringify(profile));
  // Dispatch custom event so components can update immediately
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("siteProfileUpdated"));
  }
}

export function getHeroSettings(): HeroSettings {
  if (typeof window === "undefined") return defaultHeroSettings;
  const storageKey = getStorageKey("heroSettings");
  const settings = localStorage.getItem(storageKey);
  if (settings) {
    console.log(
      `>>> [booking-data] getHeroSettings: Carregando de ${storageKey}`,
    );
  }
  return settings ? JSON.parse(settings) : defaultHeroSettings;
}

export function saveHeroSettings(settings: HeroSettings): void {
  const storageKey = getStorageKey("heroSettings");
  console.log(
    `>>> [booking-data] Salvando heroSettings em ${storageKey}:`,
    settings,
  );
  localStorage.setItem(storageKey, JSON.stringify(settings));
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("heroSettingsUpdated"));
  }
}

export const defaultAboutHeroSettings: HeroSettings = {
  ...defaultHeroSettings,
  badge: "Sobre Nós",
  title: "Nossa Paixão é Realçar Sua Beleza",
  subtitle:
    "Conheça a história por trás do Studio e nossa dedicação à excelência.",
  primaryButton: "Nossos Serviços",
  secondaryButton: "Agendar Agora",
};

export function getAboutHeroSettings(): HeroSettings {
  if (typeof window === "undefined") return defaultAboutHeroSettings;
  const settings = localStorage.getItem(getStorageKey("aboutHeroSettings"));
  return settings ? JSON.parse(settings) : defaultAboutHeroSettings;
}

export function saveAboutHeroSettings(settings: HeroSettings): void {
  localStorage.setItem(
    getStorageKey("aboutHeroSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("aboutHeroSettingsUpdated"));
  }
}

export function getStorySettings(): StorySettings {
  if (typeof window === "undefined") return defaultStorySettings;
  const settings = localStorage.getItem(getStorageKey("storySettings"));
  return settings ? JSON.parse(settings) : defaultStorySettings;
}

export function saveStorySettings(settings: StorySettings): void {
  localStorage.setItem(
    getStorageKey("storySettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storySettingsUpdated"));
  }
}

export function getHomeValuesSettings(): ValuesSettings {
  if (typeof window === "undefined") return defaultValuesSettings;
  const settings = localStorage.getItem(getStorageKey("homeValuesSettings"));
  return settings ? JSON.parse(settings) : defaultValuesSettings;
}

export function saveHomeValuesSettings(settings: ValuesSettings): void {
  localStorage.setItem(
    getStorageKey("homeValuesSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("homeValuesSettingsUpdated"));
  }
}

export function getAboutUsValuesSettings(): ValuesSettings {
  if (typeof window === "undefined") return defaultValuesSettings;
  const settings = localStorage.getItem(getStorageKey("aboutUsValuesSettings"));
  return settings ? JSON.parse(settings) : defaultValuesSettings;
}

export function saveAboutUsValuesSettings(settings: ValuesSettings): void {
  localStorage.setItem(
    getStorageKey("aboutUsValuesSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("aboutUsValuesSettingsUpdated"));
  }
}

export function getValuesSettings(): ValuesSettings {
  if (typeof window === "undefined") return defaultValuesSettings;
  const settings = localStorage.getItem(getStorageKey("valuesSettings"));
  return settings ? JSON.parse(settings) : defaultValuesSettings;
}

export function saveValuesSettings(settings: ValuesSettings): void {
  localStorage.setItem(
    getStorageKey("valuesSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("valuesSettingsUpdated"));
  }
}

export function getServicesSettings(): ServicesSettings {
  if (typeof window === "undefined") return defaultServicesSettings;
  const settings = localStorage.getItem(getStorageKey("servicesSettings"));
  return settings ? JSON.parse(settings) : defaultServicesSettings;
}

export function saveServicesSettings(settings: ServicesSettings): void {
  localStorage.setItem(
    getStorageKey("servicesSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("servicesSettingsUpdated"));
  }
}

export function getFontSettings(): FontSettings {
  if (typeof window === "undefined") return defaultFontSettings;
  const settings = localStorage.getItem(getStorageKey("fontSettings"));
  return settings ? JSON.parse(settings) : defaultFontSettings;
}

export function saveFontSettings(settings: FontSettings): void {
  localStorage.setItem(getStorageKey("fontSettings"), JSON.stringify(settings));
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("fontSettingsUpdated"));
  }
}

export function getGallerySettings(): GallerySettings {
  if (typeof window === "undefined") return defaultGallerySettings;
  const settings = localStorage.getItem(getStorageKey("gallerySettings"));
  return settings ? JSON.parse(settings) : defaultGallerySettings;
}

export function saveGallerySettings(settings: GallerySettings): void {
  localStorage.setItem(
    getStorageKey("gallerySettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("gallerySettingsUpdated"));
  }
}

export function getGalleryPageSettings(): GallerySettings {
  if (typeof window === "undefined") return defaultGallerySettings;
  const settings = localStorage.getItem(getStorageKey("galleryPageSettings"));
  return settings ? JSON.parse(settings) : defaultGallerySettings;
}

export function saveGalleryPageSettings(settings: GallerySettings): void {
  localStorage.setItem(
    getStorageKey("galleryPageSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("galleryPageSettingsUpdated"));
  }
}

export function getCTASettings(): CTASettings {
  if (typeof window === "undefined") return defaultCTASettings;
  const settings = localStorage.getItem(getStorageKey("ctaSettings"));
  return settings ? JSON.parse(settings) : defaultCTASettings;
}

export function saveCTASettings(settings: CTASettings): void {
  localStorage.setItem(getStorageKey("ctaSettings"), JSON.stringify(settings));
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ctaSettingsUpdated"));
  }
}

export function getTeamSettings(): TeamSettings {
  if (typeof window === "undefined") return defaultTeamSettings;
  const settings = localStorage.getItem(getStorageKey("teamSettings"));
  return settings ? JSON.parse(settings) : defaultTeamSettings;
}

export function saveTeamSettings(settings: TeamSettings): void {
  localStorage.setItem(getStorageKey("teamSettings"), JSON.stringify(settings));
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("teamSettingsUpdated"));
  }
}

export function getTestimonialsSettings(): TestimonialsSettings {
  if (typeof window === "undefined") return defaultTestimonialsSettings;
  const settings = localStorage.getItem(getStorageKey("testimonialsSettings"));
  return settings ? JSON.parse(settings) : defaultTestimonialsSettings;
}

export function saveTestimonialsSettings(settings: TestimonialsSettings): void {
  localStorage.setItem(
    getStorageKey("testimonialsSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("testimonialsSettingsUpdated"));
  }
}

export function getHeaderSettings(): HeaderSettings {
  if (typeof window === "undefined") return defaultHeaderSettings;
  const settings = localStorage.getItem(getStorageKey("headerSettings"));
  return settings ? JSON.parse(settings) : defaultHeaderSettings;
}

export function saveHeaderSettings(settings: HeaderSettings): void {
  localStorage.setItem(
    getStorageKey("headerSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("headerSettingsUpdated"));
  }
}

export function getFooterSettings(): FooterSettings {
  if (typeof window === "undefined") return defaultFooterSettings;
  const settings = localStorage.getItem(getStorageKey("footerSettings"));
  return settings ? JSON.parse(settings) : defaultFooterSettings;
}

export function saveFooterSettings(settings: FooterSettings): void {
  localStorage.setItem(
    getStorageKey("footerSettings"),
    JSON.stringify(settings),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("footerSettingsUpdated"));
  }
}

export function getPageVisibility(): Record<string, boolean> {
  const defaultVisibility = {
    inicio: true,
    galeria: true,
    sobre: true,
    agendar: true,
  };

  if (typeof window === "undefined") {
    return defaultVisibility;
  }
  const visibility = localStorage.getItem(getStorageKey("pageVisibility"));
  if (visibility) return JSON.parse(visibility);

  return defaultVisibility;
}

export function savePageVisibility(visibility: Record<string, boolean>): void {
  localStorage.setItem(
    getStorageKey("pageVisibility"),
    JSON.stringify(visibility),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("pageVisibilityUpdated"));
  }
}

export function getVisibleSections(): Record<string, boolean> {
  const defaultSections = {
    header: true,
    footer: true,
    hero: true,
    story: true,
    services: true,
    values: true,
    "gallery-preview": true,
    cta: true,
    "gallery-grid": true,
    "about-hero": true,
    booking: true,
  };

  if (typeof window === "undefined") {
    return defaultSections;
  }
  const sections = localStorage.getItem(getStorageKey("visibleSections"));
  if (sections) return JSON.parse(sections);

  return defaultSections;
}

export function saveVisibleSections(sections: Record<string, boolean>): void {
  localStorage.setItem(
    getStorageKey("visibleSections"),
    JSON.stringify(sections),
  );
  updateDraftTimestamp();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("visibleSectionsUpdated"));
  }
}

export async function sendBookingNotifications(
  booking: Booking,
): Promise<void> {
  const notificationSettings = getNotificationSettings();

  if (notificationSettings.emailEnabled) {
    await sendEmailNotification(booking, notificationSettings);
  }

  if (notificationSettings.whatsappEnabled) {
    await sendWhatsAppNotification(booking, notificationSettings);
  }
}

async function sendEmailNotification(
  booking: Booking,
  _settings: NotificationSettings,
): Promise<void> {
  // Simulação de envio de email
  // console.log("[v0] Enviando email para:", booking.clientEmail);
  // console.log("[v0] Cópia para admin:", settings.adminEmail);
  // Em produção, integrar com serviço de email (SendGrid, Resend, etc.)
  markNotificationsSent(booking.id, "email");
}

async function sendWhatsAppNotification(
  booking: Booking,
  _settings: NotificationSettings,
): Promise<void> {
  // Simulação de envio de WhatsApp
  // const message = `Olá ${booking.clientName}! Seu agendamento de ${booking.serviceName} foi confirmado para ${new Date(booking.date).toLocaleDateString("pt-BR")} às ${booking.time}. Estúdio de Sobrancelhas.`;
  // console.log("[v0] Enviando WhatsApp para:", booking.clientPhone);
  // console.log("[v0] Mensagem:", message);
  // Em produção, integrar com API do WhatsApp Business
  markNotificationsSent(booking.id, "whatsapp");
}

export interface BusinessConfig extends SiteConfigData {
  interval?: string | number;
  slotInterval?: string | number;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  active?: boolean;
  subscriptionStatus?: string;
  trialEndsAt?: string;
  daysLeft?: number;
  accessType?: string;
  siteName?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  tiktok?: string;
  linkedin?: string;
  x?: string;
  showInstagram?: boolean;
  showFacebook?: boolean;
  showWhatsapp?: boolean;
  showTiktok?: boolean;
  showLinkedin?: boolean;
  showX?: boolean;
  titleSuffix?: string;
  logoUrl?: string;
  config: BusinessConfig;
  services?: Service[];
  gallery?: GalleryImage[];
  testimonials?: Testimonial[];
  contact?: {
    email?: string;
    phone?: string;
  };
}

/**
 * Calcula os recursos consumidos por um agendamento, aplicando as regras de compartilhamento (isShared).
 * - Se isShared = true: Conta apenas a primeira ocorrência do item (deduplicação por agendamento).
 * - Se isShared = false: Soma todas as ocorrências (consumo bruto).
 */
export function calculateBookingResources(
  booking: Booking,
  services: Service[],
  inventory: InventoryItem[],
): { item: InventoryItem; quantity: number; mode: string }[] {
  // 1. Identificar todos os IDs de serviço (pode ser string, string separada por vírgula ou array)
  let serviceIds: string[] = [];
  if (Array.isArray(booking.serviceId)) {
    serviceIds = booking.serviceId;
  } else if (typeof booking.serviceId === "string") {
    serviceIds = booking.serviceId.split(",").map((id) => id.trim());
  } else {
    serviceIds = [booking.serviceId];
  }

  // 2. Mapear serviços na ordem em que aparecem
  const servicesInOrder = serviceIds
    .map((id) => services.find((s) => s.id === id))
    .filter((s): s is Service => !!s);

  // 3. Processar recursos
  const resourceMap = new Map<
    string,
    { item: InventoryItem; quantity: number; mode: string }
  >();
  const processedSharedItems = new Set<string>();

  servicesInOrder.forEach((service) => {
    const resList = service.resources || service.products || [];

    resList.forEach((r) => {
      const item = r as {
        inventoryId?: string;
        productId?: string;
        quantity: number | string;
      };
      const invId = item.inventoryId || item.productId;
      if (!invId) return;

      const inventoryItem = inventory.find((i) => i.id === invId);
      if (!inventoryItem) return;

      const qty = Number(r.quantity);
      const isShared = inventoryItem.isShared === true;

      if (isShared) {
        // Se for compartilhado:
        // "contabiliza os itens em comum so do primeiro item, ignora os itens em comum do segundo"
        if (!processedSharedItems.has(invId)) {
          resourceMap.set(invId, {
            item: inventoryItem,
            quantity: qty,
            mode: "Compartilhado",
          });
          processedSharedItems.add(invId);
        }
        // Se já foi processado (está no Set), ignoramos as ocorrências seguintes
      } else {
        // Não compartilhado: soma tudo
        const current = resourceMap.get(invId);
        if (current) {
          current.quantity += qty;
        } else {
          resourceMap.set(invId, {
            item: inventoryItem,
            quantity: qty,
            mode: "Não compartilhado",
          });
        }
      }
    });
  });

  return Array.from(resourceMap.values());
}

export async function returnInventoryForServiceAsync(
  serviceIds: string | string[],
  companyId: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const ids = Array.isArray(serviceIds) ? serviceIds : [serviceIds];

    // 1. Buscar estoque atual da API
    const inventory = await inventoryService.list(companyId);
    if (!inventory || inventory.length === 0) {
      return { success: false, message: "Estoque vazio ou não encontrado." };
    }

    // 2. Buscar configurações
    const settings = getSettingsFromStorage();
    let updatedAny = false;

    // Mapa para agregar itens (Product ID -> Quantidade Total)
    const aggregatedItems: Record<
      string,
      {
        quantity: number;
        product: InventoryItem;
        name: string;
        useSecondaryUnit: boolean;
      }
    > = {};

    for (const serviceId of ids) {
      const service = settings.services.find(
        (s: Service) => s.id === serviceId,
      );
      if (!service) continue;

      const itemsToReturn = service.resources?.length
        ? service.resources.map((r) => ({
            productId: r.inventoryId,
            quantity: r.quantity,
            useSecondaryUnit: r.useSecondaryUnit,
          }))
        : service.products || [];

      if (itemsToReturn.length === 0) continue;

      for (const serviceProduct of itemsToReturn) {
        const product = inventory.find(
          (p) => p.id === serviceProduct.productId,
        );

        if (product) {
          let quantityToReturn = serviceProduct.quantity;

          // Lógica de conversão de unidade
          if (
            serviceProduct.useSecondaryUnit &&
            product.conversionFactor &&
            product.conversionFactor > 0
          ) {
            quantityToReturn =
              serviceProduct.quantity / product.conversionFactor;
          }

          // Verificação de EPI/Reutilização
          const isReusable = product.isShared === true;

          if (aggregatedItems[product.id]) {
            if (isReusable) {
              aggregatedItems[product.id].quantity = Math.max(
                aggregatedItems[product.id].quantity,
                quantityToReturn,
              );
            } else {
              aggregatedItems[product.id].quantity += quantityToReturn;
            }
          } else {
            aggregatedItems[product.id] = {
              quantity: quantityToReturn,
              product: product,
              name: product.name,
              useSecondaryUnit: !!serviceProduct.useSecondaryUnit,
            };
          }
        }
      }
    }

    // 3. Processar a devolução dos itens agregados
    for (const productId in aggregatedItems) {
      const { quantity, product } = aggregatedItems[productId];

      console.log(
        `>>> [RETURN_INVENTORY] Estornando ${product.name}. Qtd: ${quantity}`,
      );

      await inventoryService.createTransaction({
        productId: product.id,
        type: "ENTRY",
        quantity: quantity,
        reason: "Reversão de status (Concluído -> Pendente)",
        companyId: companyId,
      });

      updatedAny = true;
    }

    if (!updatedAny) {
      return {
        success: true,
        message: "Nenhum produto vinculado a este serviço para devolver.",
      };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("inventoryUpdated"));
    }

    return {
      success: true,
      message: "Estoque atualizado (produtos devolvidos) com sucesso.",
    };
  } catch (error) {
    console.error(">>> [RETURN_INVENTORY_ERROR]", error);
    return {
      success: false,
      message: "Erro ao atualizar estoque no servidor.",
    };
  }
}

export async function calculateInventoryReturn(
  serviceIds: string | string[],
  companyId: string,
): Promise<{ name: string; quantity: string }[]> {
  const inventory = await inventoryService.list(companyId);
  const settings = getSettingsFromStorage();
  const ids = Array.isArray(serviceIds) ? serviceIds : [serviceIds];

  // Mapa para agregar itens
  const aggregatedItems: Record<
    string,
    { quantity: number; product: InventoryItem; unitLabel: string }
  > = {};

  for (const serviceId of ids) {
    const service = settings.services.find((s: Service) => s.id === serviceId);
    if (!service) continue;

    const itemsToReturn = service.resources?.length
      ? service.resources.map((r) => ({
          productId: r.inventoryId,
          quantity: r.quantity,
          useSecondaryUnit: r.useSecondaryUnit,
        }))
      : service.products || [];

    for (const req of itemsToReturn) {
      const product = inventory.find((p) => p.id === req.productId);
      if (!product) continue;

      let quantityToReturn = req.quantity;

      // Normalizar para unidade primária se necessário
      if (
        req.useSecondaryUnit &&
        product.conversionFactor &&
        product.conversionFactor > 0
      ) {
        quantityToReturn = req.quantity / product.conversionFactor;
      }

      const isReusable = product.isShared === true;
      // Sempre usamos a unidade primária para o cálculo agregado e exibição
      // para garantir consistência com o backend
      const unitLabel = product.unit;

      if (aggregatedItems[product.id]) {
        if (isReusable) {
          aggregatedItems[product.id].quantity = Math.max(
            aggregatedItems[product.id].quantity,
            quantityToReturn,
          );
        } else {
          aggregatedItems[product.id].quantity += quantityToReturn;
        }
      } else {
        aggregatedItems[product.id] = {
          quantity: quantityToReturn,
          product: product,
          unitLabel: unitLabel,
        };
      }
    }
  }

  return Object.values(aggregatedItems).map((item) => {
    // Formatar quantidade para evitar muitas casas decimais se for float
    const formattedQty = Number.isInteger(item.quantity)
      ? item.quantity.toString()
      : item.quantity.toFixed(2).replace(/\.?0+$/, "");

    console.log(
      `>>> [CALC_RETURN] Item: ${item.product.name}, Display: ${formattedQty} ${item.unitLabel}`,
    );
    return {
      name: item.product.name,
      quantity: `${formattedQty} ${item.unitLabel}`,
    };
  });
}
