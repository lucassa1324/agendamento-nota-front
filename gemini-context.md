# src/lib/booking-data.ts

```ts
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

```

# src/components/admin/site_editor/hooks/use-editor-api.ts

```ts
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
  saveLocalDrafts: (drafts: EditorLocalDrafts) => void;
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
      changes.homeValuesSettings = settings.homeValuesSettings;
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

      // ABANDONA O DIFF: Agora enviamos o payload completo para garantir integridade.
      // O backend usará as seções presentes no layoutGlobal e appointmentFlow.
      const payload: Record<string, unknown> = {
        sections: {
          hero: sanitizedHero,
          aboutHero: sanitizedAboutHero,
          story: sanitizedStory,
          team: sanitizedTeam,
          testimonials: sanitizedTestimonials,
          services: sanitizedServices,
          homeValuesSettings: sanitizedHomeValues,
          aboutUsValuesSettings: sanitizedAboutUsValues,
          galleryPreviewSettings: sanitizedGalleryPreview,
          galleryPageSettings: sanitizedGalleryPage,
          cta: sanitizedCta,
          header: sanitizedHeader,
          footer: sanitizedFooter,
          fontSettings: settings.fontSettings,
          colorSettings: settings.colorSettings,
          pageVisibility: settings.pageVisibility,
          visibleSections: settings.visibleSections,
          bookingSteps: cleanBookingSteps,
        }
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
            "galleryPreviewSettings",
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
            homeValuesSettings: sanitizedHomeValues,
            aboutUsValuesSettings: sanitizedAboutUsValues,
            galleryPreviewSettings: sanitizedGalleryPreview,
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
            homeValuesSettings: "homeValuesSettings",
            aboutUsValuesSettings: [
              "aboutUsValuesSettings",
              "aboutUs.valuesSection",
              "aboutUs.values",
            ],
            galleryPreviewSettings: [
              "galleryPreviewSettings",
              "home.galleryPreview",
              "home.gallerySection",
            ],
            galleryPageSettings: "galleryPageSettings",
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

          // 1. Normalização Recursiva antes de mapear
          const serviceCardBg =
            cleanBookingSteps.service?.cardBgColor ||
            (cleanBookingSteps.service?.appearance as Record<string, unknown> | undefined)
              ?.cardBgColor;

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
            appointmentFlow.step1Services = {
              cardConfig: {
                backgroundColor: (serviceCardBg as string) || "#ffffff",
                cardBackgroundColor: (serviceCardBg as string) || "#ffffff",
                background_color: (serviceCardBg as string) || "#ffffff",
                card_background_color: (serviceCardBg as string) || "#ffffff",
              },
            };
          }

          // Adicionalmente, enviamos como bookingSteps para garantir compatibilidade
          payload.bookingSteps = cleanBookingSteps;

          // Limpar o payload de campos undefined para não quebrar o deepMerge do back
          const cleanPayload = JSON.parse(JSON.stringify(payload));

          // Sanitiza o payload antes de enviar para o backend
          const sanitizedPayload = sanitizePayload(cleanPayload);
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

```

# src/components/admin/site_editor/hooks/use-editor-sync.ts

```ts
import { type RefObject, useCallback, useEffect, useMemo } from "react";
import {
  normalizeStepSettings,
  SECTION_IDS,
  type SectionConfig,
  type SectionsMap,
  sanitizeColor,
  defaultHeroSettings,
  defaultAboutHeroSettings,
  defaultStorySettings,
  defaultTeamSettings,
  defaultTestimonialsSettings,
  defaultServicesSettings,
  defaultCTASettings,
  defaultHeaderSettings,
  defaultFooterSettings,
  defaultGallerySettings,
  defaultColorSettings,
  defaultFontSettings,
  defaultValuesSettings,
  defaultBookingServiceSettings,
  defaultBookingDateSettings,
  defaultBookingTimeSettings,
  defaultBookingFormSettings,
  defaultBookingConfirmationSettings,
  sanitizeSection,
} from "@/lib/booking-data";
import type { useEditorState } from "./use-editor-state";

interface UseEditorSyncProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  state: ReturnType<typeof useEditorState>;
  pageVisibility: Record<string, boolean>;
  visibleSections: Record<string, boolean>;
}

export function useEditorSync({
  iframeRef,
  state,
  pageVisibility,
  visibleSections,
}: UseEditorSyncProps) {
  const sanitizeSectionData = useCallback(
    (current: unknown, fallback: unknown): Record<string, unknown> =>
      sanitizeSection(current, fallback),
    [],
  );

  const {
    heroSettings,
    aboutHeroSettings,
    storySettings,
    teamSettings,
    testimonialsSettings,
    fontSettings,
    colorSettings,
    servicesSettings,
    homeValuesSettings,
    aboutUsValuesSettings,
    gallerySettings,
    galleryPageSettings,
    ctaSettings,
    headerSettings,
    footerSettings,
    bookingServiceSettings,
    bookingDateSettings,
    bookingTimeSettings,
    bookingFormSettings,
    bookingConfirmationSettings,
    lastSavedHero,
    lastSavedAboutHero,
    lastSavedStory,
    lastSavedTeam,
    lastSavedTestimonials,
    lastSavedFont,
    lastSavedColor,
    lastSavedServices,
    lastSavedHomeValues,
    lastSavedAboutUsValues,
    lastSavedGallery,
    lastSavedGalleryPage,
    lastSavedCTA,
    lastSavedHeader,
    lastSavedFooter,
    lastSavedBookingService,
    lastSavedBookingDate,
    lastSavedBookingTime,
    lastSavedBookingForm,
    lastSavedBookingConfirmation,
  } = state;

  const previewHeroSettings = useMemo(() => {
    const merged = sanitizeSectionData(heroSettings, lastSavedHero) as typeof heroSettings &
      Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (heroSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedHero, heroSettings, sanitizeSectionData]);

  const previewAboutHeroSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      aboutHeroSettings,
      lastSavedAboutHero,
    ) as typeof aboutHeroSettings & Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (aboutHeroSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedAboutHero, aboutHeroSettings, sanitizeSectionData]);

  const previewStorySettings = useMemo(() => {
    const merged = sanitizeSectionData(
      storySettings,
      lastSavedStory,
    ) as typeof storySettings & Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (storySettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedStory, storySettings, sanitizeSectionData]);

  const previewTeamSettings = useMemo(() => {
    const merged = sanitizeSectionData(teamSettings, lastSavedTeam) as typeof teamSettings &
      Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (teamSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedTeam, teamSettings, sanitizeSectionData]);

  const previewTestimonialsSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      testimonialsSettings,
      lastSavedTestimonials,
    ) as typeof testimonialsSettings & Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (testimonialsSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedTestimonials, testimonialsSettings, sanitizeSectionData]);

  const previewServicesSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      servicesSettings,
      lastSavedServices,
    ) as typeof servicesSettings & Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (servicesSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }

    // Sanitização de Cores
    merged.bgColor = sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.titleColor = sanitizeColor(merged.titleColor) || "";
    merged.subtitleColor = sanitizeColor(merged.subtitleColor) || "";
    merged.cardBgColor = sanitizeColor(merged.cardBgColor || merged.appearance?.cardBgColor) || "";
    merged.cardTitleColor = sanitizeColor(merged.cardTitleColor) || "";
    merged.cardDescriptionColor = sanitizeColor(merged.cardDescriptionColor) || "";
    merged.cardPriceColor = sanitizeColor(merged.cardPriceColor) || "";
    merged.cardIconColor = sanitizeColor(merged.cardIconColor) || "";

    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: merged.bgColor,
        cardBgColor: merged.cardBgColor,
      };
    }

    return merged;
  }, [lastSavedServices, servicesSettings, sanitizeSectionData]);

  const previewHomeValuesSettings = useMemo(() => {
    const merged = sanitizeSectionData(homeValuesSettings, lastSavedHomeValues) as
      | (typeof homeValuesSettings & Record<string, unknown>)
      | (typeof lastSavedHomeValues & Record<string, unknown>);
    if (homeValuesSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    const mergedRecord = merged as Record<string, unknown>;
    const mergedCardConfig = mergedRecord.cardConfig as Record<string, unknown> | undefined;
    const mergedContent = mergedRecord.content as Record<string, unknown> | undefined;
    const mergedItemsStyle = mergedRecord.itemsStyle as Record<string, unknown> | undefined;
    const mergedAppearance = mergedRecord.appearance as Record<string, unknown> | undefined;
    const resolvedCardBgColor =
      sanitizeColor(
        (merged.cardBgColor as string | undefined) ||
          (mergedRecord.cardBackgroundColor as string | undefined) ||
          (mergedRecord.card_background_color as string | undefined) ||
          (mergedCardConfig?.cardBackgroundColor as string | undefined) ||
          (mergedCardConfig?.backgroundColor as string | undefined) ||
          (mergedContent?.cardBgColor as string | undefined) ||
          (mergedItemsStyle?.itemBackgroundColor as string | undefined) ||
          (mergedAppearance?.cardBgColor as string | undefined) ||
          (mergedAppearance?.cardBackgroundColor as string | undefined),
      ) || "";
    if (!merged.cardBgColor && resolvedCardBgColor) {
      merged.cardBgColor = resolvedCardBgColor;
    }
    if (!mergedRecord.cardBackgroundColor && resolvedCardBgColor) {
      mergedRecord.cardBackgroundColor = resolvedCardBgColor;
    }
    return merged;
  }, [lastSavedHomeValues, homeValuesSettings, sanitizeSectionData]);

  const previewAboutUsValuesSettings = useMemo(() => {
    const merged = sanitizeSectionData(aboutUsValuesSettings, lastSavedAboutUsValues) as
      | (typeof aboutUsValuesSettings & Record<string, unknown>)
      | (typeof lastSavedAboutUsValues & Record<string, unknown>);
    if (aboutUsValuesSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    const mergedRecord = merged as Record<string, unknown>;
    const mergedCardConfig = mergedRecord.cardConfig as Record<string, unknown> | undefined;
    const mergedContent = mergedRecord.content as Record<string, unknown> | undefined;
    const mergedItemsStyle = mergedRecord.itemsStyle as Record<string, unknown> | undefined;
    const mergedAppearance = mergedRecord.appearance as Record<string, unknown> | undefined;
    const resolvedCardBgColor =
      sanitizeColor(
        (merged.cardBgColor as string | undefined) ||
          (mergedRecord.cardBackgroundColor as string | undefined) ||
          (mergedRecord.card_background_color as string | undefined) ||
          (mergedCardConfig?.cardBackgroundColor as string | undefined) ||
          (mergedCardConfig?.backgroundColor as string | undefined) ||
          (mergedContent?.cardBgColor as string | undefined) ||
          (mergedItemsStyle?.itemBackgroundColor as string | undefined) ||
          (mergedAppearance?.cardBgColor as string | undefined) ||
          (mergedAppearance?.cardBackgroundColor as string | undefined),
      ) || "";
    if (!merged.cardBgColor && resolvedCardBgColor) {
      merged.cardBgColor = resolvedCardBgColor;
    }
    if (!mergedRecord.cardBackgroundColor && resolvedCardBgColor) {
      mergedRecord.cardBackgroundColor = resolvedCardBgColor;
    }
    return merged;
  }, [lastSavedAboutUsValues, aboutUsValuesSettings, sanitizeSectionData]);

  const previewCTASettings = useMemo(() => {
    const merged = sanitizeSectionData(ctaSettings, lastSavedCTA);
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (ctaSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return merged;
  }, [lastSavedCTA, ctaSettings, sanitizeSectionData]);

  const previewBookingServiceSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      bookingServiceSettings,
      lastSavedBookingService,
    ) as typeof bookingServiceSettings & Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingServiceSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return normalizeStepSettings(merged);
  }, [lastSavedBookingService, bookingServiceSettings, sanitizeSectionData]);

  const previewBookingDateSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      bookingDateSettings,
      lastSavedBookingDate,
    ) as typeof bookingDateSettings & Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingDateSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return normalizeStepSettings(merged);
  }, [lastSavedBookingDate, bookingDateSettings, sanitizeSectionData]);

  const previewBookingTimeSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      bookingTimeSettings,
      lastSavedBookingTime,
    ) as typeof bookingTimeSettings & Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingTimeSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return normalizeStepSettings(merged);
  }, [lastSavedBookingTime, bookingTimeSettings, sanitizeSectionData]);

  const previewBookingFormSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      bookingFormSettings,
      lastSavedBookingForm,
    ) as typeof bookingFormSettings & Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingFormSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return normalizeStepSettings(merged);
  }, [lastSavedBookingForm, bookingFormSettings, sanitizeSectionData]);

  const previewBookingConfirmationSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      bookingConfirmationSettings,
      lastSavedBookingConfirmation,
    ) as typeof bookingConfirmationSettings & Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (bookingConfirmationSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    return normalizeStepSettings(merged);
  }, [lastSavedBookingConfirmation, bookingConfirmationSettings, sanitizeSectionData]);

  const previewFontSettings = useMemo(
    () => sanitizeSectionData(fontSettings, lastSavedFont),
    [lastSavedFont, fontSettings, sanitizeSectionData],
  );
  const previewColorSettings = useMemo(
    () => sanitizeSectionData(colorSettings, lastSavedColor),
    [lastSavedColor, colorSettings, sanitizeSectionData],
  );
  const previewGallerySettings = useMemo(() => {
    const merged = sanitizeSectionData(gallerySettings, lastSavedGallery) as typeof gallerySettings &
      Record<string, unknown>;
    // Bloqueio de Imagem Zumbi: Se o rascunho for cor, mata a URL do banco no merge
    if (gallerySettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }

    // Sanitização de Cores
    merged.bgColor = sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.titleColor = sanitizeColor(merged.titleColor) || "";
    merged.subtitleColor = sanitizeColor(merged.subtitleColor) || "";
    merged.buttonColor = sanitizeColor(merged.buttonColor) || "";
    merged.buttonTextColor = sanitizeColor(merged.buttonTextColor) || "";
    merged.cardBgColor = sanitizeColor(merged.cardBgColor || merged.appearance?.cardBgColor) || "";

    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: merged.bgColor,
        cardBgColor: merged.cardBgColor,
      };
    }

    return merged;
  }, [lastSavedGallery, gallerySettings, sanitizeSectionData]);
  const previewGalleryPageSettings = useMemo(() => {
    const merged = sanitizeSectionData(
      galleryPageSettings,
      lastSavedGalleryPage,
    ) as typeof galleryPageSettings & Record<string, unknown>;
    if (galleryPageSettings.bgType === "color") {
      merged.bgImage = "";
      if (merged.appearance)
        merged.appearance = { ...merged.appearance, backgroundImageUrl: "" };
    }
    merged.bgColor = sanitizeColor(merged.bgColor || merged.appearance?.backgroundColor) || "";
    merged.titleColor = sanitizeColor(merged.titleColor) || "";
    merged.subtitleColor = sanitizeColor(merged.subtitleColor) || "";
    merged.buttonColor = sanitizeColor(merged.buttonColor) || "";
    merged.buttonTextColor = sanitizeColor(merged.buttonTextColor) || "";
    merged.cardBgColor = sanitizeColor(merged.cardBgColor || merged.appearance?.cardBgColor) || "";

    if (merged.appearance) {
      merged.appearance = {
        ...merged.appearance,
        backgroundColor: merged.bgColor,
        cardBgColor: merged.cardBgColor,
      };
    }

    return merged;
  }, [lastSavedGalleryPage, galleryPageSettings, sanitizeSectionData]);
  const previewHeaderSettings = useMemo(
    () => sanitizeSectionData(headerSettings, lastSavedHeader),
    [lastSavedHeader, headerSettings, sanitizeSectionData],
  );
  const previewFooterSettings = useMemo(
    () => sanitizeSectionData(footerSettings, lastSavedFooter),
    [lastSavedFooter, footerSettings, sanitizeSectionData],
  );

  const previewBookingSteps = useMemo(
    () => ({
      service: previewBookingServiceSettings,
      date: previewBookingDateSettings,
      time: previewBookingTimeSettings,
      form: previewBookingFormSettings,
      confirmation: previewBookingConfirmationSettings,
    }),
    [
      previewBookingServiceSettings,
      previewBookingDateSettings,
      previewBookingTimeSettings,
      previewBookingFormSettings,
      previewBookingConfirmationSettings,
    ],
  );

  const previewSections = useMemo(
    (): SectionsMap => ({
      [SECTION_IDS.homeHero]: previewHeroSettings as SectionConfig,
      [SECTION_IDS.aboutHero]: previewAboutHeroSettings as SectionConfig,
      [SECTION_IDS.homeStory]: previewStorySettings as SectionConfig,
      [SECTION_IDS.homeTeam]: previewTeamSettings as SectionConfig,
      [SECTION_IDS.homeTestimonials]: previewTestimonialsSettings as SectionConfig,
      [SECTION_IDS.homeServices]: previewServicesSettings as SectionConfig,
      [SECTION_IDS.homeValues]: previewHomeValuesSettings as SectionConfig,
      [SECTION_IDS.aboutValues]: previewAboutUsValuesSettings as SectionConfig,
      [SECTION_IDS.homeGallery]: previewGallerySettings as SectionConfig,
      [SECTION_IDS.pageGallery]: previewGalleryPageSettings as SectionConfig,
      [SECTION_IDS.homeCta]: previewCTASettings as SectionConfig,
      [SECTION_IDS.layoutHeader]: previewHeaderSettings as SectionConfig,
      [SECTION_IDS.layoutFooter]: previewFooterSettings as SectionConfig,
      [SECTION_IDS.bookingService]: previewBookingServiceSettings as SectionConfig,
      [SECTION_IDS.bookingDate]: previewBookingDateSettings as SectionConfig,
      [SECTION_IDS.bookingTime]: previewBookingTimeSettings as SectionConfig,
      [SECTION_IDS.bookingForm]: previewBookingFormSettings as SectionConfig,
      [SECTION_IDS.bookingConfirmation]: previewBookingConfirmationSettings as SectionConfig,
    }),
    [
      previewHeroSettings,
      previewAboutHeroSettings,
      previewStorySettings,
      previewTeamSettings,
      previewTestimonialsSettings,
      previewServicesSettings,
      previewHomeValuesSettings,
      previewAboutUsValuesSettings,
      previewGallerySettings,
      previewGalleryPageSettings,
      previewCTASettings,
      previewHeaderSettings,
      previewFooterSettings,
      previewBookingServiceSettings,
      previewBookingDateSettings,
      previewBookingTimeSettings,
      previewBookingFormSettings,
      previewBookingConfirmationSettings,
    ],
  );

  const siteCustomization = useMemo(
    () => ({
      hero: previewHeroSettings,
      aboutHero: previewAboutHeroSettings,
      story: previewStorySettings,
      team: previewTeamSettings,
      testimonials: previewTestimonialsSettings,
      services: previewServicesSettings,
      homeValuesSettings: previewHomeValuesSettings,
      aboutUsValuesSettings: previewAboutUsValuesSettings,
      galleryPreviewSettings: previewGallerySettings,
      galleryPageSettings: previewGalleryPageSettings,
      cta: previewCTASettings,
      header: previewHeaderSettings,
      footer: previewFooterSettings,
      bookingSteps: previewBookingSteps,
      theme: previewFontSettings,
      colors: previewColorSettings,
      visibleSections,
      pageVisibility,
      sections: previewSections,
      layoutGlobal: {
        hero: previewHeroSettings,
        aboutHero: previewAboutHeroSettings,
        story: previewStorySettings,
        team: previewTeamSettings,
        testimonials: previewTestimonialsSettings,
        services: previewServicesSettings,
        homeValuesSettings: previewHomeValuesSettings,
        aboutUsValuesSettings: previewAboutUsValuesSettings,
        galleryPreviewSettings: previewGallerySettings,
        galleryPageSettings: previewGalleryPageSettings,
        cta: previewCTASettings,
        header: previewHeaderSettings,
        footer: previewFooterSettings,
        bookingSteps: previewBookingSteps,
        siteColors: previewColorSettings,
        typography: previewFontSettings,
        visibleSections,
        pageVisibility,
        sections: previewSections,
      },
    }),
    [
      previewHeroSettings,
      previewAboutHeroSettings,
      previewStorySettings,
      previewTeamSettings,
      previewTestimonialsSettings,
      previewServicesSettings,
      previewHomeValuesSettings,
      previewAboutUsValuesSettings,
      previewGallerySettings,
      previewGalleryPageSettings,
      previewCTASettings,
      previewHeaderSettings,
      previewFooterSettings,
      previewBookingSteps,
      previewFontSettings,
      previewColorSettings,
      visibleSections,
      pageVisibility,
      previewSections,
    ],
  );

  // Função de sanitização para garantir que as configurações sejam objetos válidos
  const sanitizeSettings = useCallback(
    (settings: Record<string, unknown> | null | undefined, defaultSettings: Record<string, unknown>) =>
      sanitizeSection(settings, defaultSettings),
    [],
  );

  // Mapa de configurações padrão por tipo de mensagem
  const defaultSettingsMap: Record<string, Record<string, unknown>> = useMemo(
    () => ({
      UPDATE_HERO_SETTINGS: defaultHeroSettings,
      UPDATE_ABOUT_HERO_SETTINGS: defaultAboutHeroSettings,
      UPDATE_STORY_SETTINGS: defaultStorySettings,
      UPDATE_TEAM_SETTINGS: defaultTeamSettings,
      UPDATE_TESTIMONIALS_SETTINGS: defaultTestimonialsSettings,
      UPDATE_SERVICES_SETTINGS: defaultServicesSettings,
      UPDATE_HOME_VALUES_SETTINGS: defaultValuesSettings,
      UPDATE_ABOUT_US_VALUES_SETTINGS: defaultValuesSettings,
      UPDATE_GALLERY_SETTINGS: defaultGallerySettings,
      UPDATE_GALLERY_PAGE_SETTINGS: defaultGallerySettings,
      UPDATE_CTA_SETTINGS: defaultCTASettings,
      UPDATE_HEADER_SETTINGS: defaultHeaderSettings,
      UPDATE_FOOTER_SETTINGS: defaultFooterSettings,
      UPDATE_BOOKING_SERVICE_SETTINGS: defaultBookingServiceSettings,
      UPDATE_BOOKING_DATE_SETTINGS: defaultBookingDateSettings,
      UPDATE_BOOKING_TIME_SETTINGS: defaultBookingTimeSettings,
      UPDATE_BOOKING_FORM_SETTINGS: defaultBookingFormSettings,
      UPDATE_BOOKING_CONFIRMATION_SETTINGS: defaultBookingConfirmationSettings,
      UPDATE_FONT_SETTINGS: defaultFontSettings,
      UPDATE_COLOR_SETTINGS: defaultColorSettings,
    }),
    [],
  );

  const syncToIframe = useCallback(
    (type: string, settings: Record<string, unknown> | null | undefined) => {
      const sanitizedSettings = sanitizeSettings(settings, defaultSettingsMap[type] || {});
      iframeRef.current?.contentWindow?.postMessage({ type, settings: sanitizedSettings }, "*");
    },
    [iframeRef, sanitizeSettings, defaultSettingsMap],
  );

  useEffect(
    () => syncToIframe("UPDATE_HERO_SETTINGS", previewHeroSettings),
    [previewHeroSettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_ABOUT_HERO_SETTINGS", previewAboutHeroSettings),
    [previewAboutHeroSettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_STORY_SETTINGS", previewStorySettings),
    [previewStorySettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_TEAM_SETTINGS", previewTeamSettings),
    [previewTeamSettings, syncToIframe],
  );
  useEffect(
    () =>
      syncToIframe("UPDATE_TESTIMONIALS_SETTINGS", previewTestimonialsSettings),
    [previewTestimonialsSettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_SERVICES_SETTINGS", previewServicesSettings),
    [previewServicesSettings, syncToIframe],
  );
  useEffect(() => {
    console.log(
      ">>> [EDITOR_SYNC] Syncing Home values settings to iframe:",
      previewHomeValuesSettings,
    );
    syncToIframe("UPDATE_HOME_VALUES_SETTINGS", previewHomeValuesSettings);
  }, [previewHomeValuesSettings, syncToIframe]);

  useEffect(() => {
    console.log(
      ">>> [EDITOR_SYNC] Syncing About Us values settings to iframe:",
      previewAboutUsValuesSettings,
    );
    syncToIframe(
      "UPDATE_ABOUT_US_VALUES_SETTINGS",
      previewAboutUsValuesSettings,
    );
  }, [previewAboutUsValuesSettings, syncToIframe]);

  useEffect(() => {
    console.log(
      ">>> [EDITOR_SYNC] Syncing booking service settings to iframe:",
      previewBookingServiceSettings,
    );
    syncToIframe(
      "UPDATE_BOOKING_SERVICE_SETTINGS",
      previewBookingServiceSettings,
    );
  }, [previewBookingServiceSettings, syncToIframe]);
  useEffect(
    () => syncToIframe("UPDATE_TYPOGRAPHY", previewFontSettings),
    [previewFontSettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_COLORS", previewColorSettings),
    [previewColorSettings, syncToIframe],
  );
  useEffect(() => {
    console.log(
      ">>> [EDITOR_SYNC] Syncing gallery settings to iframe:",
      previewGallerySettings,
    );
    syncToIframe("UPDATE_GALLERY_PREVIEW", previewGallerySettings);
  }, [previewGallerySettings, syncToIframe]);
  useEffect(() => {
    console.log(
      ">>> [EDITOR_SYNC] Syncing gallery page settings to iframe:",
      previewGalleryPageSettings,
    );
    syncToIframe("UPDATE_GALLERY_PAGE", previewGalleryPageSettings);
  }, [previewGalleryPageSettings, syncToIframe]);
  useEffect(
    () => syncToIframe("UPDATE_CTA_SETTINGS", previewCTASettings),
    [previewCTASettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_HEADER_SETTINGS", previewHeaderSettings),
    [previewHeaderSettings, syncToIframe],
  );
  useEffect(
    () => syncToIframe("UPDATE_FOOTER_SETTINGS", previewFooterSettings),
    [previewFooterSettings, syncToIframe],
  );
  useEffect(
    () =>
      syncToIframe("UPDATE_BOOKING_DATE_SETTINGS", previewBookingDateSettings),
    [previewBookingDateSettings, syncToIframe],
  );
  useEffect(
    () =>
      syncToIframe("UPDATE_BOOKING_TIME_SETTINGS", previewBookingTimeSettings),
    [previewBookingTimeSettings, syncToIframe],
  );
  useEffect(
    () =>
      syncToIframe("UPDATE_BOOKING_FORM_SETTINGS", previewBookingFormSettings),
    [previewBookingFormSettings, syncToIframe],
  );
  useEffect(
    () =>
      syncToIframe(
        "UPDATE_BOOKING_CONFIRMATION_SETTINGS",
        previewBookingConfirmationSettings,
      ),
    [previewBookingConfirmationSettings, syncToIframe],
  );

  // Função para sanitizar o objeto siteCustomization completo
  const sanitizeSiteCustomization = useCallback(
    (customization: Record<string, unknown>) => {
      const sanitized = { ...customization };

      // Mapa de seções específicas para garantir que as chaves de background persistam
      const sectionSpecificMappings: Record<string, { backgroundKey: string; state: any }> = {
        values: { backgroundKey: 'values_bg', state: state.homeValuesSettings },
        hero: { backgroundKey: 'hero_bg', state: state.heroSettings }
      };

      // Merging section-specific background keys into customization
      Object.entries(sectionSpecificMappings).forEach(([section, { backgroundKey, state: sectionState }]) => {
        if (sectionState?.bgColor) {
          sanitized[backgroundKey] = sectionState.bgColor;
        }
      });

      // Verifica e sanitiza cada seção
      const sectionsToCheck = [
        "hero",
        "aboutHero",
        "story",
        "team",
        "testimonials",
        "services",
        "homeValuesSettings",
        "aboutUsValuesSettings",
        "galleryPreviewSettings",
        "galleryPageSettings",
        "cta",
        "header",
        "footer",
        "bookingSteps",
        "theme",
        "colors",
      ];

      sectionsToCheck.forEach((section) => {
        if (sanitized[section]) {
          const sectionData = sanitized[section] as Record<string, unknown>;
          const keys = Object.keys(sectionData);

          // Se a seção foi corrompida (transformada em string indexada)
          if (keys.length > 0 && keys.every((key) => /^\d+$/.test(key))) {
            console.error(
              `>>> [EDITOR_SYNC] Seção ${section} corrompida detectada no siteCustomization, usando padrão`,
            );

            // Encontra o padrão correspondente
            const defaultMap: Record<string, Record<string, unknown>> = {
              hero: defaultHeroSettings,
              aboutHero: defaultAboutHeroSettings,
              story: defaultStorySettings,
              team: defaultTeamSettings,
              testimonials: defaultTestimonialsSettings,
              services: defaultServicesSettings,
              homeValuesSettings: defaultValuesSettings,
              aboutUsValuesSettings: defaultValuesSettings,
              galleryPreviewSettings: defaultGallerySettings,
              galleryPageSettings: defaultGallerySettings,
              cta: defaultCTASettings,
              header: defaultHeaderSettings,
              footer: defaultFooterSettings,
              bookingSteps: defaultBookingServiceSettings,
              theme: defaultFontSettings,
              colors: defaultColorSettings,
            };

            sanitized[section] = defaultMap[section] || {};
          }
        }
      });

      return sanitized;
    },
    [],
  );

  const sanitizedSiteCustomization = useMemo(
    () => sanitizeSiteCustomization(siteCustomization),
    [siteCustomization, sanitizeSiteCustomization],
  );

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_SITE_DATA", data: sanitizedSiteCustomization },
      "*",
    );
  }, [sanitizedSiteCustomization, iframeRef]);

  useEffect(() => {
    syncToIframe("UPDATE_PAGE_VISIBILITY", pageVisibility);
  }, [pageVisibility, syncToIframe]);

  useEffect(() => {
    syncToIframe("UPDATE_VISIBLE_SECTIONS", visibleSections);
  }, [visibleSections, syncToIframe]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "BOOKING_FLOW_READY" ||
        event.data?.type === "IFRAME_READY"
      ) {
        console.log(
          `>>> [EDITOR] ${event.data.type} recebido, enviando todas as configurações...`,
        );
        if (iframeRef.current?.contentWindow) {
          const win = iframeRef.current.contentWindow;

          // Enviar configurações globais de tema
          win.postMessage(
            { type: "UPDATE_COLORS", settings: previewColorSettings },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_TYPOGRAPHY", settings: previewFontSettings },
            "*",
          );

          // Enviar visibilidade
          win.postMessage(
            { type: "UPDATE_PAGE_VISIBILITY", settings: pageVisibility },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_VISIBLE_SECTIONS", settings: visibleSections },
            "*",
          );

          // Enviar configurações de cada seção
          win.postMessage(
            { type: "UPDATE_HERO_SETTINGS", settings: previewHeroSettings },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_ABOUT_HERO_SETTINGS",
              settings: previewAboutHeroSettings,
            },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_STORY_SETTINGS", settings: previewStorySettings },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_TEAM_SETTINGS", settings: previewTeamSettings },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_TESTIMONIALS_SETTINGS",
              settings: previewTestimonialsSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_SERVICES_SETTINGS",
              settings: previewServicesSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_HOME_VALUES_SETTINGS",
              settings: previewHomeValuesSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_ABOUT_US_VALUES_SETTINGS",
              settings: previewAboutUsValuesSettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_GALLERY_PREVIEW",
              settings: previewGallerySettings,
            },
            "*",
          );
          win.postMessage(
            {
              type: "UPDATE_GALLERY_PAGE",
              settings: previewGalleryPageSettings,
            },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_CTA_SETTINGS", settings: previewCTASettings },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_HEADER_SETTINGS", settings: previewHeaderSettings },
            "*",
          );
          win.postMessage(
            { type: "UPDATE_FOOTER_SETTINGS", settings: previewFooterSettings },
            "*",
          );

          // Enviar configurações de agendamento
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

          // Dados do site completo (fallback)
          win.postMessage(
            { type: "UPDATE_SITE_DATA", data: siteCustomization },
            "*",
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    previewHeroSettings,
    previewAboutHeroSettings,
    previewStorySettings,
    previewTeamSettings,
    previewTestimonialsSettings,
    previewServicesSettings,
    previewHomeValuesSettings,
    previewAboutUsValuesSettings,
    previewGallerySettings,
    previewGalleryPageSettings,
    previewCTASettings,
    previewHeaderSettings,
    previewFooterSettings,
    previewBookingServiceSettings,
    previewBookingDateSettings,
    previewBookingTimeSettings,
    previewBookingFormSettings,
    previewBookingConfirmationSettings,
    previewColorSettings,
    previewFontSettings,
    pageVisibility,
    visibleSections,
    siteCustomization,
    iframeRef,
  ]);

  return {
    previewHeroSettings,
    previewAboutHeroSettings,
    previewStorySettings,
    previewTeamSettings,
    previewTestimonialsSettings,
    previewServicesSettings,
    previewHomeValuesSettings,
    previewAboutUsValuesSettings,
    previewFontSettings,
    previewColorSettings,
    previewGallerySettings,
    previewGalleryPageSettings,
    previewCTASettings,
    previewHeaderSettings,
    previewFooterSettings,
    previewBookingServiceSettings,
    previewBookingDateSettings,
    previewBookingTimeSettings,
    previewBookingFormSettings,
    previewBookingConfirmationSettings,
  };
}

```

# src/components/admin/site_editor/hooks/use-editor-state.ts

```ts
import { useCallback, useEffect, useState } from "react";
import { useStudio } from "@/context/studio-context";
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
  getAboutHeroSettings,
  getAboutUsValuesSettings,
  getBookingConfirmationSettings,
  getBookingDateSettings,
  getBookingFormSettings,
  getBookingServiceSettings,
  getBookingTimeSettings,
  getColorSettings,
  getCTASettings,
  getFontSettings,
  getFooterSettings,
  getGalleryPageSettings,
  getGallerySettings,
  getHeaderSettings,
  getHeroSettings,
  getHomeValuesSettings,
  getServicesSettings,
  getStorySettings,
  getTeamSettings,
  getTestimonialsSettings,
  type HeaderSettings,
  type HeroSettings,
  normalizePayload,
  normalizeStepSettings,
  SECTION_IDS,
  type SectionConfig,
  type SectionsMap,
  type ServicesSettings,
  type StorySettings,
  sanitizeColor,
  type TeamSettings,
  type TestimonialsSettings,
  type ValuesSettings,
} from "@/lib/booking-data";
import type { SiteConfigData } from "@/lib/site-config-types";
import type { BackgroundSettings } from "../components/BackgroundEditor";

const resolveBgType = (
  explicit: unknown,
  imageValue?: string,
): "color" | "image" =>
  explicit === "image" || explicit === "color"
    ? explicit
    : imageValue
      ? "image"
      : "color";

export function useEditorState() {
  const { studio } = useStudio();
  const createDefaultSections = useCallback(
    (): SectionsMap => ({
      [SECTION_IDS.homeHero]: defaultHeroSettings as SectionConfig,
      [SECTION_IDS.aboutHero]: defaultAboutHeroSettings as SectionConfig,
      [SECTION_IDS.homeStory]: defaultStorySettings as SectionConfig,
      [SECTION_IDS.homeTeam]: defaultTeamSettings as SectionConfig,
      [SECTION_IDS.homeTestimonials]:
        defaultTestimonialsSettings as SectionConfig,
      [SECTION_IDS.homeServices]: defaultServicesSettings as SectionConfig,
      [SECTION_IDS.homeValues]: defaultValuesSettings as SectionConfig,
      [SECTION_IDS.aboutValues]: defaultValuesSettings as SectionConfig,
      [SECTION_IDS.homeGallery]: defaultGallerySettings as SectionConfig,
      [SECTION_IDS.pageGallery]: defaultGallerySettings as SectionConfig,
      [SECTION_IDS.homeCta]: defaultCTASettings as SectionConfig,
      [SECTION_IDS.layoutHeader]: defaultHeaderSettings as SectionConfig,
      [SECTION_IDS.layoutFooter]: defaultFooterSettings as SectionConfig,
      [SECTION_IDS.bookingService]:
        defaultBookingServiceSettings as SectionConfig,
      [SECTION_IDS.bookingDate]: defaultBookingDateSettings as SectionConfig,
      [SECTION_IDS.bookingTime]: defaultBookingTimeSettings as SectionConfig,
      [SECTION_IDS.bookingForm]: defaultBookingFormSettings as SectionConfig,
      [SECTION_IDS.bookingConfirmation]:
        defaultBookingConfirmationSettings as SectionConfig,
    }),
    [],
  );
  // Helper para sincronizar bgImage com appearance.backgroundImageUrl
  const syncBackground = useCallback(
    <T extends object>(prev: T, updates: Partial<T>): T => {
      // Validação: aborta se updates não for um objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [SYNC_BACKGROUND] Updates inválido recebido:', updates);
        return prev;
      }
      
      const state = { ...prev, ...updates } as Record<string, unknown>;
      const upds = updates as Record<string, unknown>;
      const prvs = prev as Record<string, unknown>;
      const appearanceUpdate = upds.appearance as
        | Record<string, unknown>
        | undefined;
      const appearancePrev = prvs.appearance as
        | Record<string, unknown>
        | undefined;

      const nextAppearance = {
        ...(appearancePrev || {}),
        ...(appearanceUpdate || {}),
      } as Record<string, unknown>;

      // Helper para sincronizar cores com fallback seguro (Blindagem)
      const syncColor = (
        fieldName: string,
        updateVal: unknown,
        prevVal: unknown,
        appearanceKey?: string,
      ) => {
        // Tenta pegar o valor do update (topo ou appearance)
        const valFromUpdate =
          updateVal !== undefined
            ? updateVal
            : appearanceKey
              ? appearanceUpdate?.[appearanceKey]
              : undefined;

        if (valFromUpdate !== undefined) {
          const sanitized = sanitizeColor(valFromUpdate);
          // Se o valor de atualização for inválido e não for string vazia, mantemos o valor anterior
          const final =
            sanitized !== undefined
              ? sanitized
              : valFromUpdate === ""
                ? ""
                : (prevVal as string);
          state[fieldName] = final;
          if (appearanceKey) nextAppearance[appearanceKey] = final;
        } else if (prevVal !== undefined) {
          const sanitized = sanitizeColor(prevVal);
          const final =
            sanitized !== undefined
              ? sanitized
              : prevVal === ""
                ? ""
                : (prevVal as string);
          state[fieldName] = final;
          if (appearanceKey) nextAppearance[appearanceKey] = final;
        }
      };

      // Tipografia e Cores de Texto
      syncColor("titleColor", upds.titleColor, prvs.titleColor, "titleColor");
      syncColor(
        "subtitleColor",
        upds.subtitleColor,
        prvs.subtitleColor,
        "subtitleColor",
      );

      if (upds.titleFont !== undefined) {
        nextAppearance.titleFont = upds.titleFont;
      } else if (prvs.titleFont !== undefined) {
        nextAppearance.titleFont = prvs.titleFont;
      }

      if (upds.subtitleFont !== undefined) {
        nextAppearance.subtitleFont = upds.subtitleFont;
      } else if (prvs.subtitleFont !== undefined) {
        nextAppearance.subtitleFont = prvs.subtitleFont;
      }

      // Card Styles Sync
      syncColor(
        "cardBgColor",
        upds.cardBgColor,
        prvs.cardBgColor,
        "cardBgColor",
      );
      syncColor(
        "cardTitleColor",
        upds.cardTitleColor,
        prvs.cardTitleColor,
        "cardTitleColor",
      );
      syncColor(
        "cardDescriptionColor",
        upds.cardDescriptionColor,
        prvs.cardDescriptionColor,
        "cardDescriptionColor",
      );
      syncColor(
        "cardIconColor",
        upds.cardIconColor,
        prvs.cardIconColor,
        "cardIconColor",
      );

      syncColor(
        "cardPriceColor",
        upds.cardPriceColor,
        prvs.cardPriceColor,
        "cardPriceColor",
      );

      syncColor("badgeColor", upds.badgeColor, prvs.badgeColor, "badgeColor");
      syncColor(
        "badgeTextColor",
        upds.badgeTextColor,
        prvs.badgeTextColor,
        "badgeTextColor",
      );
      syncColor(
        "primaryButtonColor",
        upds.primaryButtonColor,
        prvs.primaryButtonColor,
        "primaryButtonColor",
      );
      syncColor(
        "secondaryButtonColor",
        upds.secondaryButtonColor,
        prvs.secondaryButtonColor,
        "secondaryButtonColor",
      );
      syncColor(
        "primaryButtonTextColor",
        upds.primaryButtonTextColor,
        prvs.primaryButtonTextColor,
        "primaryButtonTextColor",
      );
      syncColor(
        "secondaryButtonTextColor",
        upds.secondaryButtonTextColor,
        prvs.secondaryButtonTextColor,
        "secondaryButtonTextColor",
      );

      syncColor(
        "buttonColor",
        upds.buttonColor,
        prvs.buttonColor,
        "buttonColor",
      );

      syncColor(
        "buttonTextColor",
        upds.buttonTextColor,
        prvs.buttonTextColor,
        "buttonTextColor",
      );

      // Card Borders Sync
      if (upds.cardBorderRadius !== undefined) {
        nextAppearance.cardBorderRadius = upds.cardBorderRadius;
        state.cardBorderRadius = upds.cardBorderRadius;
      } else if (prvs.cardBorderRadius !== undefined) {
        state.cardBorderRadius = prvs.cardBorderRadius;
      }

      if (upds.cardBorderWidth !== undefined) {
        nextAppearance.cardBorderWidth = upds.cardBorderWidth;
        state.cardBorderWidth = upds.cardBorderWidth;
      } else if (prvs.cardBorderWidth !== undefined) {
        state.cardBorderWidth = prvs.cardBorderWidth;
      }

      syncColor(
        "cardBorderColor",
        upds.cardBorderColor,
        prvs.cardBorderColor,
        "cardBorderColor",
      );

      if (upds.cardTitleFont !== undefined) {
        nextAppearance.cardTitleFont = upds.cardTitleFont;
      } else if (prvs.cardTitleFont !== undefined) {
        nextAppearance.cardTitleFont = prvs.cardTitleFont;
      }

      if (upds.cardDescriptionFont !== undefined) {
        nextAppearance.cardDescriptionFont = upds.cardDescriptionFont;
      } else if (prvs.cardDescriptionFont !== undefined) {
        nextAppearance.cardDescriptionFont = prvs.cardDescriptionFont;
      }

      syncColor(
        "accentColor",
        upds.accentColor,
        prvs.accentColor,
        "accentColor",
      );

      // Background Color Sync (bgColor -> appearance.backgroundColor)
      syncColor("bgColor", upds.bgColor, prvs.bgColor, "backgroundColor");

      // Background Image Sync (bgImage -> appearance.backgroundImageUrl)
      if (upds.bgImage !== undefined) {
        nextAppearance.backgroundImageUrl = upds.bgImage;
        state.bgImage = upds.bgImage;
        // Se a imagem for definida e não for vazia, garantimos que o tipo seja 'image'
        if (upds.bgImage && upds.bgImage !== "" && !upds.bgType) {
          nextAppearance.bgType = "image";
          state.bgType = "image";
        } else if ((upds.bgImage === "" || !upds.bgImage) && !upds.bgType) {
          // Se a imagem for limpa e não houver tipo definido, voltamos para 'color'
          nextAppearance.bgType = "color";
          state.bgType = "color";
        }
      } else if (appearanceUpdate?.backgroundImageUrl !== undefined) {
        state.bgImage = appearanceUpdate.backgroundImageUrl;
        nextAppearance.backgroundImageUrl = appearanceUpdate.backgroundImageUrl;
        if (
          appearanceUpdate.backgroundImageUrl &&
          appearanceUpdate.backgroundImageUrl !== "" &&
          !upds.bgType &&
          !appearanceUpdate.bgType
        ) {
          nextAppearance.bgType = "image";
          state.bgType = "image";
        }
      } else if (prvs.bgImage !== undefined) {
        state.bgImage = prvs.bgImage;
        nextAppearance.backgroundImageUrl = prvs.bgImage;
      }

      // Sync bgType
      if (upds.bgType !== undefined) {
        nextAppearance.bgType = upds.bgType;
        state.bgType = upds.bgType;
      } else if (appearanceUpdate?.bgType !== undefined) {
        state.bgType = appearanceUpdate.bgType;
        nextAppearance.bgType = appearanceUpdate.bgType;
      } else if (prvs.bgType !== undefined) {
        state.bgType = prvs.bgType;
        nextAppearance.bgType = prvs.bgType;
      }

      // Overlay Sync
      if (upds.overlayOpacity !== undefined) {
        nextAppearance.overlay = {
          ...(nextAppearance.overlay || { color: "" }),
          opacity: upds.overlayOpacity,
        };
        state.overlayOpacity = upds.overlayOpacity;
      } else if (prvs.overlayOpacity !== undefined) {
        state.overlayOpacity = prvs.overlayOpacity;
      }

      const overlayUpdate = appearanceUpdate?.overlay as
        | Record<string, unknown>
        | undefined;
      if (overlayUpdate?.color !== undefined) {
        nextAppearance.overlay = {
          ...(nextAppearance.overlay || { opacity: state.overlayOpacity || 0 }),
          color: overlayUpdate.color,
        };
      }

      // Image Controls Sync
      if (upds.imageOpacity !== undefined) {
        nextAppearance.imageOpacity = upds.imageOpacity;
        state.imageOpacity = upds.imageOpacity;
      } else if (prvs.imageOpacity !== undefined) {
        state.imageOpacity = prvs.imageOpacity;
      }

      if (upds.imageScale !== undefined) {
        nextAppearance.imageScale = upds.imageScale;
        state.imageScale = upds.imageScale;
      } else if (prvs.imageScale !== undefined) {
        state.imageScale = prvs.imageScale;
      }

      if (upds.imageX !== undefined) {
        nextAppearance.imageX = upds.imageX;
        state.imageX = upds.imageX;
      } else if (prvs.imageX !== undefined) {
        state.imageX = prvs.imageX;
      }

      if (upds.imageY !== undefined) {
        nextAppearance.imageY = upds.imageY;
        state.imageY = upds.imageY;
      } else if (prvs.imageY !== undefined) {
        state.imageY = prvs.imageY;
      }

      // Sincroniza o appearance final com as mudanças processadas
      state.appearance = nextAppearance;

      return state as T;
    },
    [],
  );

  // Helpers para normalização de dados do banco (Dual-Case Blindagem)
  const normalizeHeroFromConfig = useCallback((hero: unknown): HeroSettings => {
    if (!hero || typeof hero !== "object") return defaultHeroSettings;
    const heroData = hero as Record<string, unknown>;
    const appearance = (heroData.appearance as Record<string, unknown>) || {};
    const heroImage =
      (heroData.bgImage as string) ||
      (appearance.backgroundImageUrl as string) ||
      "";
    const heroBgType = resolveBgType(
      heroData.bgType ?? appearance.bgType,
      heroImage,
    );
    return {
      ...defaultHeroSettings,
      ...(hero as Partial<HeroSettings>),
      titleColor:
        sanitizeColor(heroData.titleColor ?? appearance.titleColor) ||
        defaultHeroSettings.titleColor,
      subtitleColor:
        sanitizeColor(heroData.subtitleColor ?? appearance.subtitleColor) ||
        defaultHeroSettings.subtitleColor,
      bgColor:
        sanitizeColor(heroData.bgColor ?? appearance.backgroundColor) ||
        defaultHeroSettings.bgColor,
      bgImage: heroImage,
      bgType: heroBgType,
      appearance: {
        ...defaultHeroSettings.appearance,
        ...appearance,
        titleColor: sanitizeColor(heroData.titleColor ?? appearance.titleColor),
        subtitleColor: sanitizeColor(
          heroData.subtitleColor ?? appearance.subtitleColor,
        ),
        backgroundColor: sanitizeColor(
          heroData.bgColor ?? appearance.backgroundColor,
        ),
        backgroundImageUrl: heroImage,
        bgType: heroBgType,
      },
    };
  }, []);

  const normalizeValuesFromConfig = useCallback(
    (values: unknown): ValuesSettings => {
      if (!values || typeof values !== "object") return defaultValuesSettings;
      const valuesData = values as Record<string, unknown>;
      const appearance =
        (valuesData.appearance as Record<string, unknown>) || {};
      const content = (valuesData.content as Record<string, unknown>) || {};
      const itemsStyle =
        (valuesData.itemsStyle as Record<string, unknown>) || {};
      const cardConfig =
        (valuesData.cardConfig as Record<string, unknown>) || {};
      const valuesImage =
        (valuesData.bgImage as string) ||
        (appearance.backgroundImageUrl as string) ||
        "";
      const valuesBgType = resolveBgType(
        valuesData.bgType ?? appearance.bgType,
        valuesImage,
      );

      const cardBg = sanitizeColor(
        valuesData.cardBgColor ||
          valuesData.cardBackgroundColor ||
          valuesData.card_background_color ||
          cardConfig.backgroundColor ||
          cardConfig.cardBackgroundColor ||
          content.cardBgColor ||
          itemsStyle.itemBackgroundColor ||
          appearance.cardBgColor,
      );

      return {
        ...defaultValuesSettings,
        ...(values as Partial<ValuesSettings>),
        titleColor:
          sanitizeColor(valuesData.titleColor || appearance.titleColor) ||
          defaultValuesSettings.titleColor,
        subtitleColor:
          sanitizeColor(valuesData.subtitleColor || appearance.subtitleColor) ||
          defaultValuesSettings.subtitleColor,
        cardBgColor: cardBg || defaultValuesSettings.cardBgColor,
        cardTitleColor:
          sanitizeColor(
            valuesData.cardTitleColor ||
              appearance.cardTitleColor ||
              content.cardTitleColor,
          ) || defaultValuesSettings.cardTitleColor,
        cardDescriptionColor:
          sanitizeColor(
            valuesData.cardDescriptionColor ||
              appearance.cardDescriptionColor ||
              content.cardDescriptionColor,
          ) || defaultValuesSettings.cardDescriptionColor,
        cardIconColor:
          sanitizeColor(
            valuesData.cardIconColor ||
              appearance.cardIconColor ||
              content.cardIconColor,
          ) || defaultValuesSettings.cardIconColor,
        bgColor:
          sanitizeColor(valuesData.bgColor || appearance.backgroundColor) ||
          defaultValuesSettings.bgColor,
        bgImage: valuesImage,
        bgType: valuesBgType,
        appearance: {
          ...defaultValuesSettings.appearance,
          ...appearance,
          titleColor: sanitizeColor(
            valuesData.titleColor || appearance.titleColor,
          ),
          subtitleColor: sanitizeColor(
            valuesData.subtitleColor || appearance.subtitleColor,
          ),
          cardBgColor: cardBg,
          cardTitleColor: sanitizeColor(
            valuesData.cardTitleColor ||
              appearance.cardTitleColor ||
              content.cardTitleColor,
          ),
          cardDescriptionColor: sanitizeColor(
            valuesData.cardDescriptionColor ||
              appearance.cardDescriptionColor ||
              content.cardDescriptionColor,
          ),
          cardIconColor: sanitizeColor(
            valuesData.cardIconColor ||
              appearance.cardIconColor ||
              content.cardIconColor,
          ),
          backgroundColor: sanitizeColor(
            valuesData.bgColor || appearance.backgroundColor,
          ),
          backgroundImageUrl: valuesImage,
          bgType: valuesBgType,
        },
      };
    },
    [],
  );

  const normalizeServicesFromConfig = useCallback(
    (services: unknown): ServicesSettings => {
      if (!services || typeof services !== "object")
        return defaultServicesSettings;
      const servicesData = services as Record<string, unknown>;
      const appearance =
        (servicesData.appearance as Record<string, unknown>) || {};
      const content = (servicesData.content as Record<string, unknown>) || {};
      const itemsStyle =
        (servicesData.itemsStyle as Record<string, unknown>) || {};
      const cardConfig =
        (servicesData.cardConfig as Record<string, unknown>) || {};
      const servicesImage =
        (servicesData.bgImage as string) ||
        (appearance.backgroundImageUrl as string) ||
        "";
      const servicesBgType = resolveBgType(
        servicesData.bgType ?? appearance.bgType,
        servicesImage,
      );

      const cardBg = sanitizeColor(
        servicesData.cardBgColor ||
          servicesData.cardBackgroundColor ||
          servicesData.card_background_color ||
          cardConfig.backgroundColor ||
          cardConfig.cardBackgroundColor ||
          content.cardBgColor ||
          itemsStyle.itemBackgroundColor ||
          appearance.cardBgColor,
      );

      return {
        ...defaultServicesSettings,
        ...(services as Partial<ServicesSettings>),
        titleColor:
          sanitizeColor(servicesData.titleColor || appearance.titleColor) ||
          defaultServicesSettings.titleColor,
        subtitleColor:
          sanitizeColor(
            servicesData.subtitleColor || appearance.subtitleColor,
          ) || defaultServicesSettings.subtitleColor,
        cardBgColor: cardBg || defaultServicesSettings.cardBgColor,
        cardTitleColor:
          sanitizeColor(
            servicesData.cardTitleColor ||
              appearance.cardTitleColor ||
              content.cardTitleColor,
          ) || defaultServicesSettings.cardTitleColor,
        cardDescriptionColor:
          sanitizeColor(
            servicesData.cardDescriptionColor ||
              appearance.cardDescriptionColor ||
              content.cardDescriptionColor,
          ) || defaultServicesSettings.cardDescriptionColor,
        cardPriceColor:
          sanitizeColor(
            servicesData.cardPriceColor ||
              appearance.cardPriceColor ||
              content.cardPriceColor,
          ) || defaultServicesSettings.cardPriceColor,
        cardIconColor:
          sanitizeColor(
            servicesData.cardIconColor ||
              appearance.cardIconColor ||
              content.cardIconColor,
          ) || defaultServicesSettings.cardIconColor,
        bgColor:
          sanitizeColor(servicesData.bgColor || appearance.backgroundColor) ||
          defaultServicesSettings.bgColor,
        bgImage: servicesImage,
        bgType: servicesBgType,
        appearance: {
          ...defaultServicesSettings.appearance,
          ...appearance,
          titleColor: sanitizeColor(
            servicesData.titleColor || appearance.titleColor,
          ),
          subtitleColor: sanitizeColor(
            servicesData.subtitleColor || appearance.subtitleColor,
          ),
          cardBgColor: cardBg,
          cardTitleColor: sanitizeColor(
            servicesData.cardTitleColor ||
              appearance.cardTitleColor ||
              content.cardTitleColor,
          ),
          cardDescriptionColor: sanitizeColor(
            servicesData.cardDescriptionColor ||
              appearance.cardDescriptionColor ||
              content.cardDescriptionColor,
          ),
          cardPriceColor: sanitizeColor(
            servicesData.cardPriceColor ||
              appearance.cardPriceColor ||
              content.cardPriceColor,
          ),
          cardIconColor: sanitizeColor(
            servicesData.cardIconColor ||
              appearance.cardIconColor ||
              content.cardIconColor,
          ),
          backgroundColor: sanitizeColor(
            servicesData.bgColor || appearance.backgroundColor,
          ),
          backgroundImageUrl: servicesImage,
          bgType: servicesBgType,
        },
      };
    },
    [],
  );

  const normalizeGalleryFromConfig = useCallback(
    (gallery: unknown): GallerySettings => {
      if (!gallery || typeof gallery !== "object")
        return defaultGallerySettings;
      const galleryData = gallery as Record<string, unknown>;
      const appearance =
        (galleryData.appearance as Record<string, unknown>) || {};
      const content = (galleryData.content as Record<string, unknown>) || {};
      const itemsStyle =
        (galleryData.itemsStyle as Record<string, unknown>) || {};
      const cardConfig =
        (galleryData.cardConfig as Record<string, unknown>) || {};
      const galleryImage =
        (galleryData.bgImage as string) ||
        (appearance.backgroundImageUrl as string) ||
        "";
      const galleryBgType = resolveBgType(
        galleryData.bgType ?? appearance.bgType,
        galleryImage,
      );

      const cardBg = sanitizeColor(
        galleryData.cardBgColor ||
          galleryData.cardBackgroundColor ||
          galleryData.card_background_color ||
          cardConfig.backgroundColor ||
          cardConfig.cardBackgroundColor ||
          content.cardBgColor ||
          itemsStyle.itemBackgroundColor ||
          appearance.cardBgColor,
      );

      return {
        ...defaultGallerySettings,
        ...(gallery as Partial<GallerySettings>),
        titleColor:
          sanitizeColor(galleryData.titleColor || appearance.titleColor) ||
          defaultGallerySettings.titleColor,
        subtitleColor:
          sanitizeColor(
            galleryData.subtitleColor || appearance.subtitleColor,
          ) || defaultGallerySettings.subtitleColor,
        buttonColor:
          sanitizeColor(galleryData.buttonColor || appearance.buttonColor) ||
          defaultGallerySettings.buttonColor,
        buttonTextColor:
          sanitizeColor(
            galleryData.buttonTextColor || appearance.buttonTextColor,
          ) || defaultGallerySettings.buttonTextColor,
        cardBgColor: cardBg || defaultGallerySettings.cardBgColor,
        bgColor:
          sanitizeColor(galleryData.bgColor || appearance.backgroundColor) ||
          defaultGallerySettings.bgColor,
        bgImage: galleryImage,
        bgType: galleryBgType,
        appearance: {
          ...defaultGallerySettings.appearance,
          ...appearance,
          titleColor: sanitizeColor(
            galleryData.titleColor || appearance.titleColor,
          ),
          subtitleColor: sanitizeColor(
            galleryData.subtitleColor || appearance.subtitleColor,
          ),
          buttonColor: sanitizeColor(
            galleryData.buttonColor || appearance.buttonColor,
          ),
          buttonTextColor: sanitizeColor(
            galleryData.buttonTextColor || appearance.buttonTextColor,
          ),
          cardBgColor: cardBg,
          backgroundColor: sanitizeColor(
            galleryData.bgColor || appearance.backgroundColor,
          ),
          backgroundImageUrl: galleryImage,
          bgType: galleryBgType,
        },
      };
    },
    [],
  );

  const normalizeCTAFromConfig = useCallback((cta: unknown): CTASettings => {
    if (!cta || typeof cta !== "object") return defaultCTASettings;
    const ctaData = cta as Record<string, unknown>;
    const appearance = (ctaData.appearance as Record<string, unknown>) || {};
    const ctaImage =
      (ctaData.bgImage as string) ||
      (appearance.backgroundImageUrl as string) ||
      "";
    const ctaBgType = resolveBgType(
      ctaData.bgType ?? appearance.bgType,
      ctaImage,
    );
    return {
      ...defaultCTASettings,
      ...(cta as Partial<CTASettings>),
      titleColor:
        sanitizeColor(ctaData.titleColor || appearance.titleColor) ||
        defaultCTASettings.titleColor,
      subtitleColor:
        sanitizeColor(ctaData.subtitleColor || appearance.subtitleColor) ||
        defaultCTASettings.subtitleColor,
      buttonColor:
        sanitizeColor(ctaData.buttonColor || appearance.buttonColor) ||
        defaultCTASettings.buttonColor,
      buttonTextColor:
        sanitizeColor(ctaData.buttonTextColor || appearance.buttonTextColor) ||
        defaultCTASettings.buttonTextColor,
      bgColor:
        sanitizeColor(ctaData.bgColor || appearance.backgroundColor) ||
        defaultCTASettings.bgColor,
      bgImage: ctaImage,
      bgType: ctaBgType,
      appearance: {
        ...defaultCTASettings.appearance,
        ...appearance,
        titleColor: sanitizeColor(ctaData.titleColor || appearance.titleColor),
        subtitleColor: sanitizeColor(
          ctaData.subtitleColor || appearance.subtitleColor,
        ),
        buttonColor: sanitizeColor(
          ctaData.buttonColor || appearance.buttonColor,
        ),
        buttonTextColor: sanitizeColor(
          ctaData.buttonTextColor || appearance.buttonTextColor,
        ),
        backgroundColor: sanitizeColor(
          ctaData.bgColor || appearance.backgroundColor,
        ),
        backgroundImageUrl: ctaImage,
        bgType: ctaBgType,
      },
    };
  }, []);

  const normalizeStoryFromConfig = useCallback(
    (story: unknown): StorySettings => {
      if (!story || typeof story !== "object") return defaultStorySettings;
      const storyData = story as Record<string, unknown>;
      const appearance =
        (storyData.appearance as Record<string, unknown>) || {};
      const storyImage =
        (storyData.bgImage as string) ||
        (appearance.backgroundImageUrl as string) ||
        "";
      const storyBgType = resolveBgType(
        storyData.bgType ?? appearance.bgType,
        storyImage,
      );
      return {
        ...defaultStorySettings,
        ...(story as Partial<StorySettings>),
        titleColor:
          sanitizeColor(storyData.titleColor || appearance.titleColor) ||
          defaultStorySettings.titleColor,
        contentColor:
          sanitizeColor(storyData.contentColor) ||
          defaultStorySettings.contentColor,
        bgColor:
          sanitizeColor(storyData.bgColor || appearance.backgroundColor) ||
          defaultStorySettings.bgColor,
        bgImage: storyImage,
        bgType: storyBgType,
        appearance: {
          ...defaultStorySettings.appearance,
          ...appearance,
          titleColor: sanitizeColor(
            storyData.titleColor || appearance.titleColor,
          ),
          backgroundColor: sanitizeColor(
            storyData.bgColor || appearance.backgroundColor,
          ),
          backgroundImageUrl: storyImage,
          bgType: storyBgType,
        },
      };
    },
    [],
  );

  const normalizeTeamFromConfig = useCallback((team: unknown): TeamSettings => {
    if (!team || typeof team !== "object") return defaultTeamSettings;
    const teamData = team as Record<string, unknown>;
    const appearance = (teamData.appearance as Record<string, unknown>) || {};
    const teamImage =
      (teamData.bgImage as string) ||
      (appearance.backgroundImageUrl as string) ||
      "";
    const teamBgType = resolveBgType(
      teamData.bgType ?? appearance.bgType,
      teamImage,
    );
    return {
      ...defaultTeamSettings,
      ...(team as Partial<TeamSettings>),
      titleColor:
        sanitizeColor(teamData.titleColor || appearance.titleColor) ||
        defaultTeamSettings.titleColor,
      subtitleColor:
        sanitizeColor(teamData.subtitleColor || appearance.subtitleColor) ||
        defaultTeamSettings.subtitleColor,
      bgColor:
        sanitizeColor(teamData.bgColor || appearance.backgroundColor) ||
        defaultTeamSettings.bgColor,
      bgImage: teamImage,
      bgType: teamBgType,
      appearance: {
        ...defaultTeamSettings.appearance,
        ...appearance,
        titleColor: sanitizeColor(teamData.titleColor || appearance.titleColor),
        subtitleColor: sanitizeColor(
          teamData.subtitleColor || appearance.subtitleColor,
        ),
        backgroundColor: sanitizeColor(
          teamData.bgColor || appearance.backgroundColor,
        ),
        backgroundImageUrl: teamImage,
        bgType: teamBgType,
      },
    };
  }, []);

  const normalizeTestimonialsFromConfig = useCallback(
    (testimonials: unknown): TestimonialsSettings => {
      if (!testimonials || typeof testimonials !== "object")
        return defaultTestimonialsSettings;
      const testimonialsData = testimonials as Record<string, unknown>;
      const appearance =
        (testimonialsData.appearance as Record<string, unknown>) || {};
      const testimonialsImage =
        (testimonialsData.bgImage as string) ||
        (appearance.backgroundImageUrl as string) ||
        "";
      const testimonialsBgType = resolveBgType(
        testimonialsData.bgType ?? appearance.bgType,
        testimonialsImage,
      );
      return {
        ...defaultTestimonialsSettings,
        ...(testimonials as Partial<TestimonialsSettings>),
        titleColor:
          sanitizeColor(testimonialsData.titleColor || appearance.titleColor) ||
          defaultTestimonialsSettings.titleColor,
        subtitleColor:
          sanitizeColor(
            testimonialsData.subtitleColor || appearance.subtitleColor,
          ) || defaultTestimonialsSettings.subtitleColor,
        bgColor:
          sanitizeColor(
            testimonialsData.bgColor || appearance.backgroundColor,
          ) || defaultTestimonialsSettings.bgColor,
        bgImage: testimonialsImage,
        bgType: testimonialsBgType,
        appearance: {
          ...defaultTestimonialsSettings.appearance,
          ...appearance,
          titleColor: sanitizeColor(
            testimonialsData.titleColor || appearance.titleColor,
          ),
          subtitleColor: sanitizeColor(
            testimonialsData.subtitleColor || appearance.subtitleColor,
          ),
          backgroundColor: sanitizeColor(
            testimonialsData.bgColor || appearance.backgroundColor,
          ),
          backgroundImageUrl: testimonialsImage,
          bgType: testimonialsBgType,
        },
      };
    },
    [],
  );

  const normalizeHeaderFromConfig = useCallback(
    (header: unknown): HeaderSettings => {
      if (!header || typeof header !== "object") return defaultHeaderSettings;
      const headerData = header as Record<string, unknown>;
      return {
        ...defaultHeaderSettings,
        ...(header as Partial<HeaderSettings>),
        bgColor:
          sanitizeColor(headerData.bgColor || headerData.background_color) ||
          defaultHeaderSettings.bgColor,
        textColor:
          sanitizeColor(headerData.textColor || headerData.text_color) ||
          defaultHeaderSettings.textColor,
      };
    },
    [],
  );

  const normalizeFooterFromConfig = useCallback(
    (footer: unknown): FooterSettings => {
      if (!footer || typeof footer !== "object") return defaultFooterSettings;
      const footerData = footer as Record<string, unknown>;
      return {
        ...defaultFooterSettings,
        ...(footer as Partial<FooterSettings>),
        bgColor:
          sanitizeColor(footerData.bgColor || footerData.background_color) ||
          defaultFooterSettings.bgColor,
        textColor:
          sanitizeColor(footerData.textColor || footerData.text_color) ||
          defaultFooterSettings.textColor,
      };
    },
    [],
  );

  const [heroSettings, setHeroSettings] =
    useState<HeroSettings>(getHeroSettings());
  const [aboutHeroSettings, setAboutHeroSettings] = useState<HeroSettings>(
    getAboutHeroSettings(),
  );
  const [storySettings, setStorySettings] =
    useState<StorySettings>(getStorySettings());
  const [teamSettings, setTeamSettings] =
    useState<TeamSettings>(getTeamSettings());
  const [testimonialsSettings, setTestimonialsSettings] =
    useState<TestimonialsSettings>(getTestimonialsSettings());
  const [fontSettings, setFontSettings] =
    useState<FontSettings>(getFontSettings());
  const [colorSettings, setColorSettings] =
    useState<ColorSettings>(getColorSettings());
  const [servicesSettings, setServicesSettings] = useState<ServicesSettings>(
    getServicesSettings(),
  );
  const [homeValuesSettings, setHomeValuesSettings] = useState<ValuesSettings>(
    getHomeValuesSettings(),
  );
  const [aboutUsValuesSettings, setAboutUsValuesSettings] =
    useState<ValuesSettings>(getAboutUsValuesSettings());
  const [gallerySettings, setGallerySettings] = useState<GallerySettings>(
    getGallerySettings(),
  );
  const [galleryPageSettings, setGalleryPageSettings] =
    useState<GallerySettings>(getGalleryPageSettings());
  const [ctaSettings, setCTASettings] =
    useState<CTASettings>(getCTASettings());
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(
    getHeaderSettings(),
  );
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(
    getFooterSettings(),
  );

  const [bookingServiceSettings, setBookingServiceSettings] =
    useState<BookingStepSettings>(getBookingServiceSettings());
  const [bookingDateSettings, setBookingDateSettings] =
    useState<BookingStepSettings>(getBookingDateSettings());
  const [bookingTimeSettings, setBookingTimeSettings] =
    useState<BookingStepSettings>(getBookingTimeSettings());
  const [bookingFormSettings, setBookingFormSettings] =
    useState<BookingStepSettings>(getBookingFormSettings());
  const [bookingConfirmationSettings, setBookingConfirmationSettings] =
    useState<BookingStepSettings>(getBookingConfirmationSettings());
  const [sections, setSections] = useState<SectionsMap>(createDefaultSections);

  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(
    {},
  );
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});

  const [lastAppliedHero, setLastAppliedHero] =
    useState<HeroSettings>(defaultHeroSettings);
  const [lastAppliedAboutHero, setLastAppliedAboutHero] =
    useState<HeroSettings>(defaultAboutHeroSettings);
  const [lastAppliedStory, setLastAppliedStory] =
    useState<StorySettings>(defaultStorySettings);
  const [lastAppliedTeam, setLastAppliedTeam] =
    useState<TeamSettings>(defaultTeamSettings);
  const [lastAppliedTestimonials, setLastAppliedTestimonials] =
    useState<TestimonialsSettings>(defaultTestimonialsSettings);
  const [lastAppliedFont, setLastAppliedFont] =
    useState<FontSettings>(defaultFontSettings);
  const [lastAppliedColor, setLastAppliedColor] =
    useState<ColorSettings>(defaultColorSettings);
  const [lastAppliedServices, setLastAppliedServices] =
    useState<ServicesSettings>(defaultServicesSettings);
  const [lastAppliedHomeValues, setLastAppliedHomeValues] =
    useState<ValuesSettings>(defaultValuesSettings);
  const [lastAppliedAboutUsValues, setLastAppliedAboutUsValues] =
    useState<ValuesSettings>(defaultValuesSettings);
  const [lastAppliedGallery, setLastAppliedGallery] = useState<GallerySettings>(
    defaultGallerySettings,
  );
  const [lastAppliedGalleryPage, setLastAppliedGalleryPage] =
    useState<GallerySettings>(defaultGallerySettings);
  const [lastAppliedCTA, setLastAppliedCTA] =
    useState<CTASettings>(defaultCTASettings);
  const [lastAppliedHeader, setLastAppliedHeader] = useState<HeaderSettings>(
    defaultHeaderSettings,
  );
  const [lastAppliedFooter, setLastAppliedFooter] = useState<FooterSettings>(
    defaultFooterSettings,
  );

  const [lastAppliedBookingService, setLastAppliedBookingService] =
    useState<BookingStepSettings>(defaultBookingServiceSettings);
  const [lastAppliedBookingDate, setLastAppliedBookingDate] =
    useState<BookingStepSettings>(defaultBookingDateSettings);
  const [lastAppliedBookingTime, setLastAppliedBookingTime] =
    useState<BookingStepSettings>(defaultBookingTimeSettings);
  const [lastAppliedBookingForm, setLastAppliedBookingForm] =
    useState<BookingStepSettings>(defaultBookingFormSettings);
  const [lastAppliedBookingConfirmation, setLastAppliedBookingConfirmation] =
    useState<BookingStepSettings>(defaultBookingConfirmationSettings);

  const [lastSavedHero, setLastSavedHero] =
    useState<HeroSettings>(defaultHeroSettings);
  const [lastSavedAboutHero, setLastSavedAboutHero] = useState<HeroSettings>(
    defaultAboutHeroSettings,
  );
  const [lastSavedStory, setLastSavedStory] =
    useState<StorySettings>(defaultStorySettings);
  const [lastSavedTeam, setLastSavedTeam] =
    useState<TeamSettings>(defaultTeamSettings);
  const [lastSavedTestimonials, setLastSavedTestimonials] =
    useState<TestimonialsSettings>(defaultTestimonialsSettings);
  const [lastSavedFont, setLastSavedFont] =
    useState<FontSettings>(defaultFontSettings);
  const [lastSavedColor, setLastSavedColor] =
    useState<ColorSettings>(defaultColorSettings);
  const [lastSavedServices, setLastSavedServices] = useState<ServicesSettings>(
    defaultServicesSettings,
  );
  const [lastSavedHomeValues, setLastSavedHomeValues] =
    useState<ValuesSettings>(defaultValuesSettings);
  const [lastSavedAboutUsValues, setLastSavedAboutUsValues] =
    useState<ValuesSettings>(defaultValuesSettings);
  const [lastSavedGallery, setLastSavedGallery] = useState<GallerySettings>(
    defaultGallerySettings,
  );
  const [lastSavedGalleryPage, setLastSavedGalleryPage] =
    useState<GallerySettings>(defaultGallerySettings);
  const [lastSavedCTA, setLastSavedCTA] =
    useState<CTASettings>(defaultCTASettings);
  const [lastSavedHeader, setLastSavedHeader] = useState<HeaderSettings>(
    defaultHeaderSettings,
  );
  const [lastSavedFooter, setLastSavedFooter] = useState<FooterSettings>(
    defaultFooterSettings,
  );

  const [lastSavedBookingService, setLastSavedBookingService] =
    useState<BookingStepSettings>(defaultBookingServiceSettings);
  const [lastSavedBookingDate, setLastSavedBookingDate] =
    useState<BookingStepSettings>(defaultBookingDateSettings);
  const [lastSavedBookingTime, setLastSavedBookingTime] =
    useState<BookingStepSettings>(defaultBookingTimeSettings);
  const [lastSavedBookingForm, setLastSavedBookingForm] =
    useState<BookingStepSettings>(defaultBookingFormSettings);
  const [lastSavedBookingConfirmation, setLastSavedBookingConfirmation] =
    useState<BookingStepSettings>(defaultBookingConfirmationSettings);

  const [lastSavedPageVisibility, setLastSavedPageVisibility] = useState<
    Record<string, boolean>
  >({});
  const [lastSavedVisibleSections, setLastSavedVisibleSections] = useState<
    Record<string, boolean>
  >({});

  const [activeSectionId, setActiveSectionId] = useState<string>("hero");

  const [isInitialized, setIsInitialized] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  useEffect(() => {
    setSections((prev) => ({
      ...prev,
      [SECTION_IDS.homeHero]: heroSettings as SectionConfig,
      [SECTION_IDS.aboutHero]: aboutHeroSettings as SectionConfig,
      [SECTION_IDS.homeStory]: storySettings as SectionConfig,
      [SECTION_IDS.homeTeam]: teamSettings as SectionConfig,
      [SECTION_IDS.homeTestimonials]: testimonialsSettings as SectionConfig,
      [SECTION_IDS.homeServices]: servicesSettings as SectionConfig,
      [SECTION_IDS.homeValues]: homeValuesSettings as SectionConfig,
      [SECTION_IDS.aboutValues]: aboutUsValuesSettings as SectionConfig,
      [SECTION_IDS.homeGallery]: gallerySettings as SectionConfig,
      [SECTION_IDS.pageGallery]: galleryPageSettings as SectionConfig,
      [SECTION_IDS.homeCta]: ctaSettings as SectionConfig,
      [SECTION_IDS.layoutHeader]: headerSettings as SectionConfig,
      [SECTION_IDS.layoutFooter]: footerSettings as SectionConfig,
      [SECTION_IDS.bookingService]: bookingServiceSettings as SectionConfig,
      [SECTION_IDS.bookingDate]: bookingDateSettings as SectionConfig,
      [SECTION_IDS.bookingTime]: bookingTimeSettings as SectionConfig,
      [SECTION_IDS.bookingForm]: bookingFormSettings as SectionConfig,
      [SECTION_IDS.bookingConfirmation]:
        bookingConfirmationSettings as SectionConfig,
    }));
  }, [
    heroSettings,
    aboutHeroSettings,
    storySettings,
    teamSettings,
    testimonialsSettings,
    servicesSettings,
    homeValuesSettings,
    aboutUsValuesSettings,
    gallerySettings,
    galleryPageSettings,
    ctaSettings,
    headerSettings,
    footerSettings,
    bookingServiceSettings,
    bookingDateSettings,
    bookingTimeSettings,
    bookingFormSettings,
    bookingConfirmationSettings,
  ]);

  // 1. Adicionar um efeito que observa o studio.config para sincronização inicial reativa
  useEffect(() => {
    // Só sincronizamos se os dados do banco existirem e se o utilizador ainda não fez alterações manuais (isDirty)
    if (studio?.config && !isDirty) {
      const config = normalizePayload(studio.config as SiteConfigData);
      const sections = (config.sections || {}) as SectionsMap;
      const siteCustomization =
        config.siteCustomization || config.site_customization;
      const layoutGlobal = (siteCustomization?.layoutGlobal ||
        siteCustomization?.layout_global ||
        {}) as Record<string, unknown>;
      const siteColors =
        (layoutGlobal.siteColors as Record<string, unknown> | undefined) ||
        (layoutGlobal.color as Record<string, unknown> | undefined) ||
        (layoutGlobal.site_colors as Record<string, unknown> | undefined) ||
        (layoutGlobal.cores_base as Record<string, unknown> | undefined);
      const resolvedColors: ColorSettings = {
        primary:
          (siteColors?.primary as string) ||
          config.colors?.primary ||
          defaultColorSettings.primary,
        secondary:
          (siteColors?.secondary as string) ||
          config.colors?.secondary ||
          defaultColorSettings.secondary,
        background:
          (siteColors?.background as string) ||
          config.colors?.background ||
          defaultColorSettings.background,
        text:
          (siteColors?.text as string) ||
          config.colors?.text ||
          defaultColorSettings.text,
        accent:
          (siteColors?.accent as string) ||
          config.colors?.accent ||
          defaultColorSettings.primary,
        buttonText:
          (siteColors?.buttonText as string) || config.colors?.buttonText || "",
      };
      const hasLastSavedColors =
        lastSavedColor.primary !== defaultColorSettings.primary ||
        lastSavedColor.secondary !== defaultColorSettings.secondary ||
        lastSavedColor.background !== defaultColorSettings.background ||
        lastSavedColor.text !== defaultColorSettings.text;
      const normalizeColor = (value?: string) => sanitizeColor(value || "") || "";
      const isConfigAlignedWithLastSaved =
        !hasLastSavedColors ||
        (normalizeColor(resolvedColors.primary) ===
          normalizeColor(lastSavedColor.primary) &&
          normalizeColor(resolvedColors.secondary) ===
            normalizeColor(lastSavedColor.secondary) &&
          normalizeColor(resolvedColors.background) ===
            normalizeColor(lastSavedColor.background) &&
          normalizeColor(resolvedColors.text) ===
            normalizeColor(lastSavedColor.text) &&
          normalizeColor(resolvedColors.accent || "") ===
            normalizeColor(lastSavedColor.accent || ""));
      if (!isConfigAlignedWithLastSaved) {
        console.log(
          ">>> [SYNC] studio.config desatualizado em relação ao lastSaved. Ignorando sync.",
        );
        return;
      }

      const heroSection =
        sections[SECTION_IDS.homeHero] || (config.hero as SectionConfig);
      const normalizedHero = normalizeHeroFromConfig(heroSection);
      const hasLastSavedHero =
        lastSavedHero.title !== defaultHeroSettings.title ||
        lastSavedHero.bgImage !== "" ||
        lastSavedHero.bgColor !== defaultHeroSettings.bgColor;
      const isHeroAlignedWithLastSaved =
        !hasLastSavedHero ||
        (normalizeColor(normalizedHero.bgColor) ===
          normalizeColor(lastSavedHero.bgColor) &&
          (normalizedHero.bgType || "") === (lastSavedHero.bgType || "") &&
          (normalizedHero.bgImage || "") === (lastSavedHero.bgImage || ""));
      if (!isHeroAlignedWithLastSaved) {
        console.log(
          ">>> [SYNC] studio.config desatualizado para HERO em relação ao lastSaved. Ignorando sync.",
        );
        return;
      }

      console.log(
        ">>> [SYNC] Sincronizando estado do editor com studio.config (isDirty=false)",
      );

      const siteFonts =
        (layoutGlobal.fontes as Record<string, unknown> | undefined) ||
        (layoutGlobal.typography as Record<string, unknown> | undefined);

      const hasValidColors = (colors?: unknown) =>
        !!colors &&
        typeof colors === "object" &&
        Object.values(colors as Record<string, unknown>).some(
          (value) =>
            typeof value === "string" &&
            value.startsWith("#") &&
            value.length >= 4,
        );

      if (hasValidColors(siteColors) || hasValidColors(config.colors)) {
        setColorSettings((prev) => ({
          ...prev,
          ...(config.colors || {}),
          ...(siteColors || {}),
        }));
      }

      if (siteFonts || config.typography || config.theme) {
        setFontSettings((prev) => ({
          ...prev,
          ...(config.theme || {}),
          ...(config.typography || {}),
          ...(siteFonts || {}),
        }));
      }

      if (heroSection) setHeroSettings(normalizeHeroFromConfig(heroSection));

      const aboutHeroSection =
        sections[SECTION_IDS.aboutHero] ||
        (config.aboutHero as SectionConfig) ||
        (config.about as SectionConfig);
      if (aboutHeroSection)
        setAboutHeroSettings(normalizeHeroFromConfig(aboutHeroSection));

      const storySection =
        sections[SECTION_IDS.homeStory] || (config.story as SectionConfig);
      if (storySection)
        setStorySettings(normalizeStoryFromConfig(storySection));

      const teamSection =
        sections[SECTION_IDS.homeTeam] || (config.team as SectionConfig);
      if (teamSection) setTeamSettings(normalizeTeamFromConfig(teamSection));

      const testimonialsSection =
        sections[SECTION_IDS.homeTestimonials] ||
        (config.testimonials as SectionConfig);
      if (testimonialsSection)
        setTestimonialsSettings(
          normalizeTestimonialsFromConfig(testimonialsSection),
        );

      const servicesSection =
        sections[SECTION_IDS.homeServices] ||
        (config.services as SectionConfig);
      if (servicesSection)
        setServicesSettings(normalizeServicesFromConfig(servicesSection));

      const homeValuesSection =
        sections[SECTION_IDS.homeValues] ||
        (config.homeValuesSettings as SectionConfig) ||
        (config.values as SectionConfig);
      if (homeValuesSection)
        setHomeValuesSettings(normalizeValuesFromConfig(homeValuesSection));

      const aboutValuesSection =
        sections[SECTION_IDS.aboutValues] ||
        (config.aboutUsValuesSettings as SectionConfig) ||
        (config.values as SectionConfig);
      if (aboutValuesSection)
        setAboutUsValuesSettings(normalizeValuesFromConfig(aboutValuesSection));

      const galleryPreviewSection =
        sections[SECTION_IDS.homeGallery] ||
        (config.galleryPreviewSettings as SectionConfig);
      if (galleryPreviewSection)
        setGallerySettings(normalizeGalleryFromConfig(galleryPreviewSection));

      const galleryPageSection =
        sections[SECTION_IDS.pageGallery] ||
        (config.galleryPageSettings as SectionConfig);
      if (galleryPageSection)
        setGalleryPageSettings(normalizeGalleryFromConfig(galleryPageSection));

      const ctaSection =
        sections[SECTION_IDS.homeCta] || (config.cta as SectionConfig);
      if (ctaSection) setCTASettings(normalizeCTAFromConfig(ctaSection));

      const headerSection =
        sections[SECTION_IDS.layoutHeader] || (config.header as SectionConfig);
      if (headerSection)
        setHeaderSettings(normalizeHeaderFromConfig(headerSection));

      const footerSection =
        sections[SECTION_IDS.layoutFooter] || (config.footer as SectionConfig);
      if (footerSection)
        setFooterSettings(normalizeFooterFromConfig(footerSection));

      // Sincronizar bookingSteps se houver
      const bookingSteps = (config.appointmentFlow || config.bookingSteps) as
        | Record<string, BookingStepSettings | undefined>
        | undefined;

      const bookingServiceSection =
        sections[SECTION_IDS.bookingService] ||
        (bookingSteps?.service as SectionConfig | undefined);
      if (bookingServiceSection) {
        setBookingServiceSettings(
          normalizeStepSettings(bookingServiceSection as BookingStepSettings),
        );
      }
      const bookingDateSection =
        sections[SECTION_IDS.bookingDate] ||
        (bookingSteps?.date as SectionConfig | undefined);
      if (bookingDateSection) {
        setBookingDateSettings(
          normalizeStepSettings(bookingDateSection as BookingStepSettings),
        );
      }
      const bookingTimeSection =
        sections[SECTION_IDS.bookingTime] ||
        (bookingSteps?.time as SectionConfig | undefined);
      if (bookingTimeSection) {
        setBookingTimeSettings(
          normalizeStepSettings(bookingTimeSection as BookingStepSettings),
        );
      }
      const bookingFormSection =
        sections[SECTION_IDS.bookingForm] ||
        (bookingSteps?.form as SectionConfig | undefined);
      if (bookingFormSection) {
        setBookingFormSettings(
          normalizeStepSettings(bookingFormSection as BookingStepSettings),
        );
      }
      const bookingConfirmationSection =
        sections[SECTION_IDS.bookingConfirmation] ||
        (bookingSteps?.confirmation as SectionConfig | undefined);
      if (bookingConfirmationSection) {
        setBookingConfirmationSettings(
          normalizeStepSettings(
            bookingConfirmationSection as BookingStepSettings,
          ),
        );
      }

      // Seções e Visibilidade
      if (config.visibleSections)
        setVisibleSections((prev) => ({ ...prev, ...config.visibleSections }));
      if (config.pageVisibility)
        setPageVisibility((prev) => ({ ...prev, ...config.pageVisibility }));

      console.log(
        ">>> [SYNC] Estado do editor sincronizado com o Banco de Dados.",
      );
    }
  }, [
    studio?.config,
    isDirty,
    normalizeHeroFromConfig,
    normalizeServicesFromConfig,
    normalizeValuesFromConfig,
    normalizeGalleryFromConfig,
    normalizeCTAFromConfig,
    normalizeStoryFromConfig,
    normalizeTeamFromConfig,
    normalizeTestimonialsFromConfig,
    normalizeHeaderFromConfig,
    normalizeFooterFromConfig,
    lastSavedColor.primary,
    lastSavedColor.secondary,
    lastSavedColor.background,
    lastSavedColor.text,
    lastSavedColor.accent,
    lastSavedHero.title,
    lastSavedHero.bgImage,
    lastSavedHero.bgColor,
    lastSavedHero.bgType,
  ]);

  // --- Efeito de Inicialização (TASK 1 & 4) ---
  // Monitora a chegada dos dados salvos no banco (lastSaved) para forçar a sincronização inicial
  useEffect(() => {
    if (isInitialSyncDone) return;

    // Critério: Observamos os estados 'lastSaved' que vêm do fetch inicial
    const hasSavedColors =
      lastSavedColor.primary !== defaultColorSettings.primary &&
      lastSavedColor.primary !== "";
    const hasSavedHero =
      lastSavedHero.title !== defaultHeroSettings.title ||
      lastSavedHero.bgImage !== "";

    if (hasSavedColors || hasSavedHero) {
      console.log(
        ">>> [INIT_LOAD] Dados do banco detectados em lastSaved. Sincronizando estado local 'dirty'.",
      );

      // Sincronizar seções de agendamento que costumam dar fallback rosa
      setBookingServiceSettings((prev) => syncBackground(prev, {}));
      setBookingDateSettings((prev) => syncBackground(prev, {}));
      setBookingTimeSettings((prev) => syncBackground(prev, {}));
      setBookingFormSettings((prev) => syncBackground(prev, {}));
      setBookingConfirmationSettings((prev) => syncBackground(prev, {}));

      // Sincronizar outras seções principais
      setHeroSettings((prev) => syncBackground(prev, {}));
      setServicesSettings((prev) => syncBackground(prev, {}));
      setHomeValuesSettings((prev) => syncBackground(prev, {}));
      setAboutUsValuesSettings((prev) => syncBackground(prev, {}));
      setCTASettings((prev) => syncBackground(prev, {}));

      setIsInitialSyncDone(true);
    }
  }, [
    isInitialSyncDone,
    lastSavedColor.primary,
    lastSavedHero.title,
    lastSavedHero.bgImage,
    syncBackground,
  ]);

  const handleUpdateHero = useCallback(
    (updates: Partial<HeroSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateHero recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setHeroSettings((prev: HeroSettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateAboutHero = useCallback(
    (updates: Partial<HeroSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateAboutHero recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setAboutHeroSettings((prev: HeroSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateStory = useCallback(
    (updates: Partial<StorySettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateStory recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setStorySettings((prev: StorySettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateTeam = useCallback(
    (updates: Partial<TeamSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateTeam recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setTeamSettings((prev: TeamSettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateTestimonials = useCallback(
    (updates: Partial<TestimonialsSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateTestimonials recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setTestimonialsSettings((prev: TestimonialsSettings) =>
        syncBackground(prev, updates),
      );
    },
    [syncBackground],
  );

  const handleUpdateFont = useCallback((updates: Partial<FontSettings>) => {
    // Type guard: aborta se updates não for objeto válido
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      console.error('>>> [EDITOR_STATE] handleUpdateFont recebeu updates inválido:', updates);
      return;
    }
    setIsDirty(true);
    setFontSettings((prev: FontSettings) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateColors = useCallback((updates: Partial<ColorSettings>) => {
    // Type guard: aborta se updates não for objeto válido
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      console.error('>>> [EDITOR_STATE] handleUpdateColors recebeu updates inválido:', updates);
      return;
    }
    setIsDirty(true);
    setColorSettings((prev: ColorSettings) => {
      const newState = { ...prev };
      if (updates.primary !== undefined)
        newState.primary = sanitizeColor(updates.primary) || prev.primary;
      if (updates.secondary !== undefined)
        newState.secondary = sanitizeColor(updates.secondary) || prev.secondary;
      if (updates.accent !== undefined)
        newState.accent = sanitizeColor(updates.accent) || prev.accent;
      if (updates.background !== undefined)
        newState.background =
          sanitizeColor(updates.background) || prev.background;
      if (updates.text !== undefined)
        newState.text = sanitizeColor(updates.text) || prev.text;
      return newState;
    });
  }, []);

  const handleUpdateServices = useCallback(
    (updates: Partial<ServicesSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateServices recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setServicesSettings((prev: ServicesSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        if (updates.titleColor !== undefined)
          newState.titleColor =
            sanitizeColor(updates.titleColor) || prev.titleColor;
        if (updates.subtitleColor !== undefined)
          newState.subtitleColor =
            sanitizeColor(updates.subtitleColor) || prev.subtitleColor;
        if (updates.cardBgColor !== undefined)
          newState.cardBgColor =
            sanitizeColor(updates.cardBgColor) || prev.cardBgColor;
        if (updates.cardTitleColor !== undefined)
          newState.cardTitleColor =
            sanitizeColor(updates.cardTitleColor) || prev.cardTitleColor;
        if (updates.cardDescriptionColor !== undefined)
          newState.cardDescriptionColor =
            sanitizeColor(updates.cardDescriptionColor) ||
            prev.cardDescriptionColor;
        if (updates.cardPriceColor !== undefined)
          newState.cardPriceColor =
            sanitizeColor(updates.cardPriceColor) || prev.cardPriceColor;
        if (updates.cardIconColor !== undefined)
          newState.cardIconColor =
            sanitizeColor(updates.cardIconColor) || prev.cardIconColor;
        return newState;
      });
    },
    [syncBackground],
  );

  const handleUpdateHomeValues = useCallback(
    (updates: Partial<ValuesSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateHomeValues recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setHomeValuesSettings((prev: ValuesSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        if (updates.titleColor !== undefined)
          newState.titleColor =
            sanitizeColor(updates.titleColor) || prev.titleColor;
        if (updates.subtitleColor !== undefined)
          newState.subtitleColor =
            sanitizeColor(updates.subtitleColor) || prev.subtitleColor;
        if (updates.cardBgColor !== undefined)
          newState.cardBgColor =
            sanitizeColor(updates.cardBgColor) || prev.cardBgColor;
        if (updates.cardTitleColor !== undefined)
          newState.cardTitleColor =
            sanitizeColor(updates.cardTitleColor) || prev.cardTitleColor;
        if (updates.cardDescriptionColor !== undefined)
          newState.cardDescriptionColor =
            sanitizeColor(updates.cardDescriptionColor) ||
            prev.cardDescriptionColor;
        return newState;
      });
    },
    [syncBackground],
  );

  const handleUpdateAboutUsValues = useCallback(
    (updates: Partial<ValuesSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateAboutUsValues recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setAboutUsValuesSettings((prev: ValuesSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        if (updates.titleColor !== undefined)
          newState.titleColor =
            sanitizeColor(updates.titleColor) || prev.titleColor;
        if (updates.subtitleColor !== undefined)
          newState.subtitleColor =
            sanitizeColor(updates.subtitleColor) || prev.subtitleColor;
        if (updates.cardBgColor !== undefined)
          newState.cardBgColor =
            sanitizeColor(updates.cardBgColor) || prev.cardBgColor;
        if (updates.cardTitleColor !== undefined)
          newState.cardTitleColor =
            sanitizeColor(updates.cardTitleColor) || prev.cardTitleColor;
        if (updates.cardDescriptionColor !== undefined)
          newState.cardDescriptionColor =
            sanitizeColor(updates.cardDescriptionColor) ||
            prev.cardDescriptionColor;
        return newState;
      });
    },
    [syncBackground],
  );

  const handleUpdateGalleryPreview = useCallback(
    (updates: Partial<GallerySettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateGalleryPreview recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setGallerySettings((prev: GallerySettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        if (updates.titleColor !== undefined)
          newState.titleColor =
            sanitizeColor(updates.titleColor) || prev.titleColor;
        if (updates.subtitleColor !== undefined)
          newState.subtitleColor =
            sanitizeColor(updates.subtitleColor) || prev.subtitleColor;
        if (updates.buttonColor !== undefined)
          newState.buttonColor =
            sanitizeColor(updates.buttonColor) || prev.buttonColor;
        if (updates.buttonTextColor !== undefined)
          newState.buttonTextColor =
            sanitizeColor(updates.buttonTextColor) || prev.buttonTextColor;
        if (updates.cardBgColor !== undefined)
          newState.cardBgColor =
            sanitizeColor(updates.cardBgColor) || prev.cardBgColor;
        return newState;
      });
    },
    [syncBackground],
  );

  const handleUpdateGalleryPage = useCallback(
    (updates: Partial<GallerySettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateGalleryPage recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setGalleryPageSettings((prev: GallerySettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        if (updates.titleColor !== undefined)
          newState.titleColor =
            sanitizeColor(updates.titleColor) || prev.titleColor;
        if (updates.subtitleColor !== undefined)
          newState.subtitleColor =
            sanitizeColor(updates.subtitleColor) || prev.subtitleColor;
        if (updates.buttonColor !== undefined)
          newState.buttonColor =
            sanitizeColor(updates.buttonColor) || prev.buttonColor;
        if (updates.buttonTextColor !== undefined)
          newState.buttonTextColor =
            sanitizeColor(updates.buttonTextColor) || prev.buttonTextColor;
        if (updates.cardBgColor !== undefined)
          newState.cardBgColor =
            sanitizeColor(updates.cardBgColor) || prev.cardBgColor;
        return newState;
      });
    },
    [syncBackground],
  );

  const handleUpdateCTA = useCallback(
    (updates: Partial<CTASettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateCTA recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setCTASettings((prev: CTASettings) => syncBackground(prev, updates));
    },
    [syncBackground],
  );

  const handleUpdateHeader = useCallback((updates: Partial<HeaderSettings>) => {
    // Type guard: aborta se updates não for objeto válido
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      console.error('>>> [EDITOR_STATE] handleUpdateHeader recebeu updates inválido:', updates);
      return;
    }
    setIsDirty(true);
    setHeaderSettings((prev: HeaderSettings) => {
      const newState = { ...prev, ...updates };
      if (updates.bgColor !== undefined)
        newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
      if (updates.textColor !== undefined)
        newState.textColor = sanitizeColor(updates.textColor) || prev.textColor;
      if (updates.buttonBgColor !== undefined)
        newState.buttonBgColor =
          sanitizeColor(updates.buttonBgColor) || prev.buttonBgColor;
      if (updates.buttonTextColor !== undefined)
        newState.buttonTextColor =
          sanitizeColor(updates.buttonTextColor) || prev.buttonTextColor;
      return newState;
    });
  }, []);

  const handleUpdateFooter = useCallback((updates: Partial<FooterSettings>) => {
    // Type guard: aborta se updates não for objeto válido
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      console.error('>>> [EDITOR_STATE] handleUpdateFooter recebeu updates inválido:', updates);
      return;
    }
    setIsDirty(true);
    setFooterSettings((prev: FooterSettings) => {
      const newState = { ...prev, ...updates };
      if (updates.bgColor !== undefined)
        newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
      if (updates.textColor !== undefined)
        newState.textColor = sanitizeColor(updates.textColor) || prev.textColor;
      if (updates.titleColor !== undefined)
        newState.titleColor =
          sanitizeColor(updates.titleColor) || prev.titleColor;
      if (updates.iconColor !== undefined)
        newState.iconColor = sanitizeColor(updates.iconColor) || prev.iconColor;
      return newState;
    });
  }, []);

  const handleUpdateBookingService = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateBookingService recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setBookingServiceSettings((prev: BookingStepSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        return normalizeStepSettings(newState);
      });
    },
    [syncBackground],
  );

  const handleUpdateBookingDate = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateBookingDate recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setBookingDateSettings((prev: BookingStepSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        return normalizeStepSettings(newState);
      });
    },
    [syncBackground],
  );

  const handleUpdateBookingTime = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateBookingTime recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setBookingTimeSettings((prev: BookingStepSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        return normalizeStepSettings(newState);
      });
    },
    [syncBackground],
  );

  const handleUpdateBookingForm = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateBookingForm recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setBookingFormSettings((prev: BookingStepSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        return normalizeStepSettings(newState);
      });
    },
    [syncBackground],
  );

  const handleUpdateBookingConfirmation = useCallback(
    (updates: Partial<BookingStepSettings>) => {
      // Type guard: aborta se updates não for objeto válido
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        console.error('>>> [EDITOR_STATE] handleUpdateBookingConfirmation recebeu updates inválido:', updates);
        return;
      }
      setIsDirty(true);
      setBookingConfirmationSettings((prev: BookingStepSettings) => {
        const newState = syncBackground(prev, updates);
        if (updates.bgColor !== undefined)
          newState.bgColor = sanitizeColor(updates.bgColor) || prev.bgColor;
        return normalizeStepSettings(newState);
      });
    },
    [syncBackground],
  );

  const handlePageVisibilityChange = useCallback(
    (pageId: string, isVisible: boolean) => {
      setPageVisibility((prev: Record<string, boolean>) => ({
        ...prev,
        [pageId]: isVisible,
      }));
    },
    [],
  );

  const handleSectionVisibilityToggle = useCallback((sectionId: string) => {
    setVisibleSections((prev: Record<string, boolean>) => {
      const isCurrentlyVisible = prev[sectionId] !== false;
      return {
        ...prev,
        [sectionId]: !isCurrentlyVisible,
      };
    });
  }, []);

  const handleUpdateBackground = useCallback(
    (updates: Partial<BackgroundSettings>, sectionId?: string) => {
      const targetSectionId = sectionId || activeSectionId;
      console.log(
        `>>> [useEditorState] handleUpdateBackground para seção: ${targetSectionId}`,
        updates,
      );

      const updateFnMap: Record<
        string,
        (u: Partial<BackgroundSettings>) => void
      > = {
        hero: handleUpdateHero as (u: Partial<BackgroundSettings>) => void,
        "about-hero": handleUpdateAboutHero as (
          u: Partial<BackgroundSettings>,
        ) => void,
        story: handleUpdateStory as (u: Partial<BackgroundSettings>) => void,
        team: handleUpdateTeam as (u: Partial<BackgroundSettings>) => void,
        testimonials: handleUpdateTestimonials as (
          u: Partial<BackgroundSettings>,
        ) => void,
        services: handleUpdateServices as (
          u: Partial<BackgroundSettings>,
        ) => void,
        values: handleUpdateHomeValues as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "home-values": handleUpdateHomeValues as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "about-us-values": handleUpdateAboutUsValues as (
          u: Partial<BackgroundSettings>,
        ) => void,
        gallery: handleUpdateGalleryPreview as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "gallery-preview": handleUpdateGalleryPreview as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "gallery-grid": handleUpdateGalleryPage as (
          u: Partial<BackgroundSettings>,
        ) => void,
        cta: handleUpdateCTA as (u: Partial<BackgroundSettings>) => void,
        "booking-service": handleUpdateBookingService as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "booking-date": handleUpdateBookingDate as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "booking-time": handleUpdateBookingTime as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "booking-form": handleUpdateBookingForm as (
          u: Partial<BackgroundSettings>,
        ) => void,
        "booking-confirmation": handleUpdateBookingConfirmation as (
          u: Partial<BackgroundSettings>,
        ) => void,
      };

      const updateFn = updateFnMap[targetSectionId];
      if (updateFn) {
        updateFn(updates);
      } else {
        console.warn(
          `>>> [useEditorState] Nenhuma função de atualização encontrada para a seção: ${targetSectionId}`,
        );
      }
    },
    [
      activeSectionId,
      handleUpdateHero,
      handleUpdateAboutHero,
      handleUpdateStory,
      handleUpdateTeam,
      handleUpdateTestimonials,
      handleUpdateServices,
      handleUpdateHomeValues,
      handleUpdateAboutUsValues,
      handleUpdateGalleryPreview,
      handleUpdateGalleryPage,
      handleUpdateCTA,
      handleUpdateBookingService,
      handleUpdateBookingDate,
      handleUpdateBookingTime,
      handleUpdateBookingForm,
      handleUpdateBookingConfirmation,
    ],
  );

  return {
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
    homeValuesSettings,
    setHomeValuesSettings,
    aboutUsValuesSettings,
    setAboutUsValuesSettings,
    gallerySettings,
    setGallerySettings,
    galleryPageSettings,
    setGalleryPageSettings,
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
    sections,
    setSections,
    pageVisibility,
    setPageVisibility,
    visibleSections,
    setVisibleSections,
    isInitialized,
    setIsInitialized,
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
    lastAppliedHomeValues,
    setLastAppliedHomeValues,
    lastAppliedAboutUsValues,
    setLastAppliedAboutUsValues,
    lastAppliedGallery,
    setLastAppliedGallery,
    lastAppliedGalleryPage,
    setLastAppliedGalleryPage,
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
    lastSavedHomeValues,
    setLastSavedHomeValues,
    lastSavedAboutUsValues,
    setLastSavedAboutUsValues,
    lastSavedGallery,
    setLastSavedGallery,
    lastSavedGalleryPage,
    setLastSavedGalleryPage,
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
    handleUpdateHomeValues,
    handleUpdateAboutUsValues,
    handleUpdateGalleryPreview,
    handleUpdateGalleryPage,
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
    handleUpdateBackground,
    activeSectionId,
    setActiveSectionId,
    isDirty,
    setIsDirty,
  };
}

```

# src/components/admin/customizer/hero-editor.tsx

```tsx
"use client";

import { Award, Crown, Flower2, Gem, Heart, Moon, Smile, Sparkles, Star, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackgroundEditor, type BackgroundSettings } from "../site_editor/components/BackgroundEditor";
import { SectionSubtitleEditor } from "../site_editor/components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../site_editor/components/SectionTitleEditor";

const iconOptions = [
  { name: "Sparkles", icon: Sparkles },
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
  { name: "Crown", icon: Crown },
  { name: "Flower2", icon: Flower2 },
  { name: "Moon", icon: Moon },
  { name: "Sun", icon: Sun },
  { name: "Gem", icon: Gem },
  { name: "Smile", icon: Smile },
  { name: "Award", icon: Award },
];

export interface HeroEditorProps {
  settings: {
    // Badge Fields
    showBadge?: boolean;
    badge?: string;
    badgeIcon?: string;
    badgeColor?: string;
    badgeTextColor?: string;

    // Title Fields
    title: string;
    titleFont: string;
    titleColor: string;

    // Subtitle Fields
    subtitle: string;
    subtitleFont: string;
    subtitleColor: string;

    // Button Fields
    primaryButton?: string;
    primaryButtonColor?: string;
    primaryButtonTextColor?: string;
    secondaryButton?: string;
    secondaryButtonColor?: string;
    secondaryButtonTextColor?: string;

    // Background Fields
    bgType: "color" | "image";
    bgColor: string;
    bgImage: string;
    imageOpacity: number;
    overlayOpacity: number;
    imageScale: number;
    imageX: number;
    imageY: number;

    appearance?: {
      backgroundImageUrl?: string;
      overlay?: {
        color: string;
        opacity: number;
      };
    };

    // Legacy/Unused
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: unknown;
  };
  onUpdate: (updates: Partial<HeroEditorProps["settings"]>) => void;
  onUpdateBackground?: (updates: Partial<BackgroundSettings>, sectionId?: string) => void;
  onHighlight?: (sectionId: string) => void;
  hasChanges?: boolean;
  onSave?: () => void;
}

export function HeroEditor({
  settings,
  onUpdate,
  onUpdateBackground,
  hasChanges,
  onSave: externalOnSave,
}: HeroEditorProps) {
  // Helper to ensure updates are propagated correctly
  const handleUpdate = (updates: Partial<HeroEditorProps["settings"]>) => {
    console.log(">>> [HeroEditor] handleUpdate chamado com:", updates);
    console.log(">>> [HeroEditor] Estado ATUAL antes da atualização:", settings);
    onUpdate({ ...settings, ...updates });
  };

  console.log(">>> [HeroEditor] RENDER: settings.bgImage =", settings.bgImage);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8 sm:h-9 mb-3 sm:mb-4">
          <TabsTrigger value="content" className="text-[11px] sm:text-xs">
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="style" className="text-[11px] sm:text-xs">
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-3 sm:space-y-4 mt-0">
          {/* Badge Editor */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Badge de Destaque</Label>
                <p className="text-[10px] text-muted-foreground">Exibe um selo acima do título</p>
              </div>
              <Switch
                checked={settings.showBadge !== false}
                onCheckedChange={(checked) => handleUpdate({ showBadge: checked })}
              />
            </div>

            {settings.showBadge !== false && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">Texto do Badge</Label>
                  <Input
                    value={typeof settings.badge === 'object' ? ((settings.badge as unknown as { text?: string }).text || "") : (settings.badge || "")}
                    onChange={(e) => handleUpdate({ badge: e.target.value })}
                    placeholder="Ex: Especialistas em Design"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">Ícone</Label>
                    <Select
                      value={settings.badgeIcon || "Sparkles"}
                      onValueChange={(v) => handleUpdate({ badgeIcon: v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((opt) => (
                          <SelectItem key={opt.name} value={opt.name} className="text-xs">
                            <div className="flex items-center gap-2">
                              <opt.icon className="w-3 h-3" />
                              <span>{opt.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">Cor do Badge</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.badgeColor || "#000000"}
                        onChange={(e) => handleUpdate({ badgeColor: e.target.value })}
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.badgeColor || ""}
                        onChange={(e) => handleUpdate({ badgeColor: e.target.value })}
                        placeholder="#000000"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">Cor do Texto do Badge</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.badgeTextColor || "#000000"}
                      onChange={(e) => handleUpdate({ badgeTextColor: e.target.value })}
                      className="h-8 w-8 p-0 border-none bg-transparent"
                    />
                    <Input
                      value={settings.badgeTextColor || ""}
                      onChange={(e) => handleUpdate({ badgeTextColor: e.target.value })}
                      placeholder="#000000"
                      className="h-8 text-[10px] uppercase"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <SectionTitleEditor
            title={settings.title}
            font={settings.titleFont}
            color={settings.titleColor}
            onUpdate={(updates) =>
              handleUpdate({
                ...(updates.title !== undefined && { title: updates.title }),
                ...(updates.font !== undefined && { titleFont: updates.font }),
                ...(updates.color !== undefined && { titleColor: updates.color }),
              })
            }
          />

          <SectionSubtitleEditor
            subtitle={settings.subtitle}
            font={settings.subtitleFont}
            color={settings.subtitleColor}
            onUpdate={(updates) =>
              handleUpdate({
                ...(updates.subtitle !== undefined && {
                  subtitle: updates.subtitle,
                }),
                ...(updates.font !== undefined && {
                  subtitleFont: updates.font,
                }),
                ...(updates.color !== undefined && {
                  subtitleColor: updates.color,
                }),
              })
            }
          />

          {/* Buttons Editor */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Botões de Ação</Label>
            
            <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-primary">Botão Principal</Label>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">Texto</Label>
                  <Input
                    value={typeof settings.primaryButton === 'object' ? ((settings.primaryButton as unknown as { text?: string }).text || "") : (settings.primaryButton || "")}
                    onChange={(e) => handleUpdate({ primaryButton: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.primaryButtonColor || "#000000"}
                        onChange={(e) => handleUpdate({ primaryButtonColor: e.target.value })}
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.primaryButtonColor || ""}
                        onChange={(e) => handleUpdate({ primaryButtonColor: e.target.value })}
                        placeholder="#000000"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.primaryButtonTextColor || "#ffffff"}
                        onChange={(e) => handleUpdate({ primaryButtonTextColor: e.target.value })}
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.primaryButtonTextColor || ""}
                        onChange={(e) => handleUpdate({ primaryButtonTextColor: e.target.value })}
                        placeholder="#ffffff"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-[10px] uppercase font-bold text-primary">Botão Secundário</Label>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground font-medium">Texto</Label>
                  <Input
                    value={typeof settings.secondaryButton === 'object' ? ((settings.secondaryButton as unknown as { text?: string }).text || "") : (settings.secondaryButton || "")}
                    onChange={(e) => handleUpdate({ secondaryButton: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">Cor da Borda/Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.secondaryButtonColor || "#000000"}
                        onChange={(e) => handleUpdate({ secondaryButtonColor: e.target.value })}
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.secondaryButtonColor || ""}
                        onChange={(e) => handleUpdate({ secondaryButtonColor: e.target.value })}
                        placeholder="#000000"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-medium">Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.secondaryButtonTextColor || "#000000"}
                        onChange={(e) => handleUpdate({ secondaryButtonTextColor: e.target.value })}
                        className="h-8 w-8 p-0 border-none bg-transparent"
                      />
                      <Input
                        value={settings.secondaryButtonTextColor || ""}
                        onChange={(e) => handleUpdate({ secondaryButtonTextColor: e.target.value })}
                        placeholder="#000000"
                        className="h-8 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-3 sm:space-y-4 mt-0">
           <BackgroundEditor
            settings={{
              bgType: settings.bgType,
              bgColor: settings.bgColor,
              bgImage: settings.bgImage,
              imageOpacity: settings.imageOpacity,
              overlayOpacity: settings.overlayOpacity,
              imageScale: settings.imageScale,
              imageX: settings.imageX,
              imageY: settings.imageY,
              appearance: settings.appearance,
            }}
          onUpdate={(updates) => {
            if (onUpdateBackground) {
              onUpdateBackground(updates, "hero");
            } else {
              handleUpdate(updates);
            }
          }}
          section="hero"
        />
         </TabsContent>
      </Tabs>

      <div className="pt-2">
        <Button
          type="button"
          disabled={!hasChanges}
          onClick={externalOnSave}
          className={`w-full h-11 text-sm font-bold transition-all duration-300 ${
            hasChanges
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          }`}
        >
          {hasChanges ? (
            "Salvar Alterações"
          ) : (
            <span className="opacity-50">Nenhuma alteração</span>
          )}
        </Button>
      </div>
    </div>
  );
}

```
