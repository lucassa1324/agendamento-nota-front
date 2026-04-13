import { format } from "date-fns";
import { inventoryService } from "./inventory-service";
import {
  BookingStepSchema,
  SectionSchema,
} from "./schemas/site-customization-schema";
import type { SiteConfigData } from "./site-config-types";

// --- Sincronização Global entre Abas via LocalStorage ---
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (!event.key) return;

    // Mapa de chaves para eventos customizados correspondentes
    const keyToEvent: Record<string, string> = {
      heroSettings: "heroSettingsUpdated",
      aboutHeroSettings: "aboutHeroSettingsUpdated",
      storySettings: "storySettingsUpdated",
      homeValuesSettings: "homeValuesSettingsUpdated",
      aboutUsValuesSettings: "aboutUsValuesSettingsUpdated",
      valuesSettings: "valuesSettingsUpdated",
      servicesSettings: "servicesSettingsUpdated",
      fontSettings: "fontSettingsUpdated",
      gallerySettings: "gallerySettingsUpdated",
      galleryPageSettings: "galleryPageSettingsUpdated",
      ctaSettings: "ctaSettingsUpdated",
      teamSettings: "teamSettingsUpdated",
      testimonialsSettings: "testimonialsSettingsUpdated",
      headerSettings: "headerSettingsUpdated",
      footerSettings: "footerSettingsUpdated",
      colorSettings: "colorSettingsUpdated",
      pageVisibility: "pageVisibilityUpdated",
      visibleSections: "visibleSectionsUpdated",
      siteProfile: "siteProfileUpdated",
      services: "servicesUpdated",
      bookingServiceSettings: "bookingServiceSettingsUpdated",
      bookingDateSettings: "bookingDateSettingsUpdated",
      bookingTimeSettings: "bookingTimeSettingsUpdated",
      bookingFormSettings: "bookingFormSettingsUpdated",
      bookingConfirmationSettings: "bookingConfirmationSettingsUpdated",
    };

    // Remove o prefixo do adminId se existir
    const currentAdminId = localStorage.getItem("current_admin_id");
    let baseKey = event.key;
    if (currentAdminId && event.key.startsWith(`${currentAdminId}_`)) {
      baseKey = event.key.substring(currentAdminId.length + 1);
    }

    const eventToDispatch = keyToEvent[baseKey];
    if (eventToDispatch) {
      console.log(
        `>>> [STORAGE_SYNC] Disparando ${eventToDispatch} devido a mudança em ${event.key}`,
      );
      window.dispatchEvent(new Event(eventToDispatch));
    }
  });
}

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
  minimumBookingLeadMinutes?: number;
};

export type WeekSchedule = DaySchedule[];

// Helper para isolamento de dados por usuário
export const sanitizeColor = (color: unknown): string | undefined => {
  if (!color) return undefined;

  // Se for um objeto, tenta extrair a string de cor (caso comum em alguns componentes de UI)
  if (typeof color === "object" && color !== null) {
    const colorObj = color as Record<string, unknown>;
    if (typeof colorObj.hex === "string") return colorObj.hex;
    if (typeof colorObj.text === "string") return colorObj.text;
    if (typeof colorObj.color === "string") return colorObj.color;
    if (typeof colorObj.rgb === "string") return colorObj.rgb;
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

export const sanitizeFont = (font: unknown): string | undefined => {
  if (!font) return undefined;
  if (typeof font === "string") {
    const trimmed = font.trim();
    if (trimmed && trimmed !== "{}" && trimmed !== "[]") return trimmed;
  }
  if (typeof font === "object" && font !== null) {
    const fontObj = font as Record<string, unknown>;
    if (typeof fontObj.family === "string") return fontObj.family;
    if (typeof fontObj.name === "string") return fontObj.name;
    if (typeof fontObj.value === "string") return fontObj.value;
  }
  return undefined;
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
    return data.map((item) => normalizePersistenceData(item));
  }

  const cleanData: Record<string, unknown> = {
    ...(data as Record<string, unknown>),
  };

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
    fallbackData &&
      typeof fallbackData === "object" &&
      !Array.isArray(fallbackData)
      ? (fallbackData as Record<string, unknown>)
      : {};

  if (typeof currentData === "string") {
    const trimmed = currentData.trim();
    const fallbackContent = fallback.content;
    const fallbackUsesContent =
      fallbackContent !== undefined ||
      (fallback.title === undefined && fallback.subtitle === undefined);
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
        return fallbackUsesContent
          ? { ...fallback, content: currentData }
          : { ...fallback, title: currentData };
      }
    }
    return fallbackUsesContent
      ? { ...fallback, content: currentData }
      : { ...fallback, title: currentData };
  }

  if (
    !currentData ||
    typeof currentData !== "object" ||
    Array.isArray(currentData)
  ) {
    return { ...fallback };
  }

  const record = currentData as Record<string, unknown>;

  // PILAR: Limpeza de Objeto - Evitar acumular "lixo" de configurações antigas
  // Em vez de fazer merge cego (...fallback, ...record), vamos construir o objeto
  // priorizando o que vem do registro novo.
  // Somente adicionamos do fallback o que for estritamente necessário (whitelist de campos padrão)
  const mergedRoot: Record<string, unknown> = {
    ...record,
  };

  const WHITELIST_FIELDS = [
    "title",
    "subtitle",
    "description",
    "visible",
    "showTitle",
    "showSubtitle",
    "bgType",
    "bgColor",
    "backgroundColor",
    "bg_color",
    "background_color",
    "titleColor",
    "subtitleColor",
    "titleFont",
    "subtitleFont",
    "contentFont",
    "cardBgColor",
    "cardTitleColor",
    "cardDescriptionColor",
    "cardPriceColor",
    "cardIconColor",
    "cardTitleFont",
    "cardDescriptionFont",
    "cardPriceFont",
    "typography",
  ];

  // Só adicionamos do fallback o que for estritamente necessário e não estiver no record
  Object.entries(fallback).forEach(([key, value]) => {
    // Se a chave não está no record, verificamos se ela é "lixo" ou campo padrão
    if (mergedRoot[key] === undefined || mergedRoot[key] === null) {
      // Se for um campo padrão conhecido, mantemos do fallback
      if (
        WHITELIST_FIELDS.includes(key) ||
        key === "appearance" ||
        key === "content"
      ) {
        mergedRoot[key] = value;
      }
      // Caso contrário, ignoramos para evitar acumular propriedades obsoletas
    }
  });

  const recordAppearance =
    record.appearance &&
      typeof record.appearance === "object" &&
      !Array.isArray(record.appearance)
      ? (record.appearance as Record<string, unknown>)
      : {};

  const recordContent =
    record.content &&
      typeof record.content === "object" &&
      !Array.isArray(record.content)
      ? (record.content as Record<string, unknown>)
      : {};
  const recordContentString =
    typeof record.content === "string" ? record.content : undefined;

  // Se o recordContent ou recordAppearance tiverem valores, eles devem estar no root para compatibilidade.
  // Importante: nunca sobrescrever valores explícitos já presentes no root (ex.: title/subtitle recém-digitados).
  for (const [key, value] of Object.entries(recordContent)) {
    if (
      value !== undefined &&
      value !== null &&
      (mergedRoot[key] === undefined || mergedRoot[key] === null)
    ) {
      mergedRoot[key] = value;
    }
  }

  for (const [key, value] of Object.entries(recordAppearance)) {
    if (
      value !== undefined &&
      value !== null &&
      (mergedRoot[key] === undefined || mergedRoot[key] === null)
    ) {
      mergedRoot[key] = value;
    }
  }

  const fallbackAppearance =
    fallback.appearance &&
      typeof fallback.appearance === "object" &&
      !Array.isArray(fallback.appearance)
      ? (fallback.appearance as Record<string, unknown>)
      : {};

  const fallbackContent =
    fallback.content &&
      typeof fallback.content === "object" &&
      !Array.isArray(fallback.content)
      ? (fallback.content as Record<string, unknown>)
      : {};
  const fallbackContentString =
    typeof fallback.content === "string" ? fallback.content : undefined;

  const finalAppearance: Record<string, unknown> = { ...recordAppearance };
  Object.entries(fallbackAppearance).forEach(([key, value]) => {
    if (finalAppearance[key] === undefined || finalAppearance[key] === null) {
      finalAppearance[key] = value;
    }
  });

  const finalContent: Record<string, unknown> = { ...recordContent };
  Object.entries(fallbackContent).forEach(([key, value]) => {
    if (finalContent[key] === undefined || finalContent[key] === null) {
      finalContent[key] = value;
    }
  });

  const resolvedContent =
    recordContentString !== undefined
      ? recordContentString
      : typeof mergedRoot.content === "string"
        ? (mergedRoot.content as string)
        : fallbackContentString !== undefined
          ? fallbackContentString
          : Object.keys(finalContent).length > 0
            ? finalContent
            : mergedRoot.content;

  return {
    ...mergedRoot,
    appearance: finalAppearance,
    ...(resolvedContent !== undefined ? { content: resolvedContent } : {}),
  };
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
  booking: "booking",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

const normalizeSectionConfig = <T extends Record<string, unknown>>(
  raw: T | string | undefined,
  defaults: T,
) => {
  // Se não tem dados brutos, retorna o padrão
  if (!raw) return defaults;

  // Se o dado bruto for uma string, tentamos converter para objeto
  let actualRaw: Record<string, unknown>;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          actualRaw = parsed as Record<string, unknown>;
        } else {
          actualRaw = { content: raw };
        }
      } catch (_e) {
        actualRaw = { content: raw };
      }
    } else {
      // Se for uma string pura, assumimos que é o conteúdo principal
      actualRaw = { content: raw };
    }
  } else {
    actualRaw = raw as Record<string, unknown>;
  }

  // PILAR: Prioridade Invertida e Limpeza
  // O que vem do "raw" (banco ou editor) deve ter prioridade TOTAL sobre o defaults.
  // Começamos com raw e preenchemos apenas o estritamente necessário dos defaults.
  const merged: Record<string, unknown> = {
    ...actualRaw,
  };

  const CORE_FIELDS = [
    "title",
    "subtitle",
    "description",
    "visible",
    "showTitle",
    "showSubtitle",
  ];

  // Preenche campos principais se estiverem ausentes ou forem strings vazias/lixo
  CORE_FIELDS.forEach((field) => {
    const val = merged[field];
    const isEmpty =
      val === undefined ||
      val === null ||
      (typeof val === "string" &&
        (val.trim() === "" || val.trim() === "{}" || val.trim() === "[]"));

    if (isEmpty) {
      merged[field] = defaults[field];
    }
  });

  // O mesmo para content
  const rawContent = actualRaw.content;
  let normalizedContent: Record<string, unknown> | undefined;

  if (typeof rawContent === "string") {
    const trimmed = rawContent.trim();
    if (trimmed && trimmed !== "{}" && trimmed !== "[]") {
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            normalizedContent = parsed as Record<string, unknown>;
          } else {
            normalizedContent = { text: rawContent };
          }
        } catch (_e) {
          normalizedContent = { text: rawContent };
        }
      } else {
        normalizedContent = { text: rawContent };
      }
    }
  } else if (
    rawContent &&
    typeof rawContent === "object" &&
    !Array.isArray(rawContent) &&
    Object.keys(rawContent).length > 0
  ) {
    normalizedContent = rawContent as Record<string, unknown>;
  }

  const isDefaultContentString = typeof defaults.content === "string";

  if (normalizedContent) {
    if (isDefaultContentString) {
      // Se o default é string, tentamos manter como string se for um objeto {text: ...} ou {value: ...}
      merged.content =
        normalizedContent.text ||
        normalizedContent.value ||
        (Object.keys(normalizedContent).length === 0 ? "" : normalizedContent);
    } else {
      const safeDefaultContent =
        defaults.content &&
          typeof defaults.content === "object" &&
          !Array.isArray(defaults.content)
          ? (defaults.content as Record<string, unknown>)
          : {};

      merged.content = {
        ...safeDefaultContent,
        ...normalizedContent,
      };
    }
  } else if (defaults.content !== undefined) {
    merged.content = defaults.content;
  }

  // Só forçamos objeto se o default NÃO for string
  if (!isDefaultContentString) {
    if (typeof merged.content === "string") {
      const trimmed = (merged.content as string).trim();
      if (!trimmed || trimmed === "{}" || trimmed === "[]") {
        delete merged.content;
      } else if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            merged.content = parsed as Record<string, unknown>;
          } else {
            merged.content = { text: merged.content };
          }
        } catch (_e) {
          merged.content = { text: merged.content };
        }
      } else {
        merged.content = { text: merged.content };
      }
    } else if (Array.isArray(merged.content)) {
      merged.content = { items: merged.content };
    } else if (
      merged.content &&
      typeof merged.content !== "object" &&
      merged.content !== null
    ) {
      merged.content = { value: merged.content };
    }
  }

  // O mesmo para appearance
  const rawAppearance = actualRaw.appearance;
  let normalizedAppearance: Record<string, unknown> | undefined;

  if (typeof rawAppearance === "string") {
    const trimmed = rawAppearance.trim();
    if (trimmed && trimmed !== "{}" && trimmed !== "[]") {
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            normalizedAppearance = parsed as Record<string, unknown>;
          }
        } catch (_e) { }
      }
    }
  } else if (
    rawAppearance &&
    typeof rawAppearance === "object" &&
    !Array.isArray(rawAppearance) &&
    Object.keys(rawAppearance).length > 0
  ) {
    normalizedAppearance = rawAppearance as Record<string, unknown>;
  }

  const isDefaultAppearanceString = typeof defaults.appearance === "string";

  if (normalizedAppearance) {
    if (isDefaultAppearanceString) {
      merged.appearance = normalizedAppearance;
    } else {
      const safeDefaultAppearance =
        defaults.appearance &&
          typeof defaults.appearance === "object" &&
          !Array.isArray(defaults.appearance)
          ? (defaults.appearance as Record<string, unknown>)
          : {};

      merged.appearance = {
        ...safeDefaultAppearance,
        ...normalizedAppearance,
      };
    }
  } else if (defaults.appearance !== undefined) {
    merged.appearance = defaults.appearance;
  }

  if (!isDefaultAppearanceString) {
    if (typeof merged.appearance === "string") {
      const trimmed = (merged.appearance as string).trim();
      if (trimmed && trimmed !== "{}" && trimmed !== "[]") {
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (
              parsed &&
              typeof parsed === "object" &&
              !Array.isArray(parsed)
            ) {
              merged.appearance = parsed as Record<string, unknown>;
            } else {
              delete merged.appearance;
            }
          } catch (_e) {
            delete merged.appearance;
          }
        } else {
          delete merged.appearance;
        }
      } else {
        delete merged.appearance;
      }
    } else if (Array.isArray(merged.appearance)) {
      delete merged.appearance;
    } else if (
      merged.appearance &&
      typeof merged.appearance !== "object" &&
      merged.appearance !== null
    ) {
      delete merged.appearance;
    }
  }

  // 1. Pilar 3: Reidratação de Cores (Recuperar de qualquer chave possível)
  const sectionBgColor = sanitizeColor(
    merged.bgColor ||
    merged.backgroundColor ||
    (merged.appearance as Record<string, unknown> | undefined)
      ?.backgroundColor ||
    (merged.appearance as Record<string, unknown> | undefined)?.bgColor ||
    (raw as Record<string, unknown>).bgColor ||
    (raw as Record<string, unknown>).backgroundColor ||
    (raw as Record<string, unknown>).bg_color ||
    (raw as Record<string, unknown>).background_color,
  );

  const sectionCardBgColor = sanitizeColor(
    merged.cardBgColor ||
    merged.cardBackgroundColor ||
    (merged.appearance as Record<string, unknown> | undefined)?.cardBgColor ||
    (merged.appearance as Record<string, unknown> | undefined)
      ?.cardBackgroundColor ||
    (merged.content as Record<string, unknown> | undefined)?.cardBgColor ||
    (merged.content as Record<string, unknown> | undefined)
      ?.cardBackgroundColor ||
    (merged.cardConfig as Record<string, unknown> | undefined)?.cardBgColor ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.cardBackgroundColor ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.backgroundColor ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.card_bg_color ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.background_color ||
    (raw as Record<string, unknown>).cardBgColor ||
    (raw as Record<string, unknown>).cardBackgroundColor ||
    (raw as Record<string, unknown>).card_bg_color ||
    (raw as Record<string, unknown>).card_background_color ||
    (raw as Record<string, unknown>).card_background ||
    (raw as Record<string, unknown>).card_background_color,
  );

  if (sectionBgColor) {
    merged.bgColor = sectionBgColor;
    merged.backgroundColor = sectionBgColor;
    merged.bg_color = sectionBgColor;
    merged.background_color = sectionBgColor;
    if (merged.appearance && typeof merged.appearance === "object") {
      (merged.appearance as Record<string, unknown>).backgroundColor =
        sectionBgColor;
      (merged.appearance as Record<string, unknown>).bgColor = sectionBgColor;
      (merged.appearance as Record<string, unknown>).bg_color = sectionBgColor;
      (merged.appearance as Record<string, unknown>).background_color =
        sectionBgColor;
    }
  }

  if (sectionCardBgColor) {
    merged.cardBgColor = sectionCardBgColor;
    merged.cardBackgroundColor = sectionCardBgColor;
    merged.card_bg_color = sectionCardBgColor;
    merged.card_background_color = sectionCardBgColor;
    if (merged.appearance && typeof merged.appearance === "object") {
      (merged.appearance as Record<string, unknown>).cardBgColor =
        sectionCardBgColor;
      (merged.appearance as Record<string, unknown>).cardBackgroundColor =
        sectionCardBgColor;
      (merged.appearance as Record<string, unknown>).card_bg_color =
        sectionCardBgColor;
      (merged.appearance as Record<string, unknown>).card_background_color =
        sectionCardBgColor;
    }
  }

  const sectionCardIconColor = sanitizeColor(
    merged.cardIconColor ||
    (merged.appearance as Record<string, unknown> | undefined)
      ?.cardIconColor ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.cardIconColor ||
    (merged.cardConfig as Record<string, unknown> | undefined)?.iconColor ||
    (raw as Record<string, unknown>).cardIconColor ||
    (raw as Record<string, unknown>).card_icon_color ||
    (raw as Record<string, unknown>).iconColor,
  );

  const sectionCardTitleColor = sanitizeColor(
    merged.cardTitleColor ||
    (merged.appearance as Record<string, unknown> | undefined)
      ?.cardTitleColor ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.cardTitleColor ||
    (merged.cardConfig as Record<string, unknown> | undefined)?.titleColor ||
    (raw as Record<string, unknown>).cardTitleColor ||
    (raw as Record<string, unknown>).card_title_color,
  );

  const sectionCardDescriptionColor = sanitizeColor(
    merged.cardDescriptionColor ||
    (merged.appearance as Record<string, unknown> | undefined)
      ?.cardDescriptionColor ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.cardDescriptionColor ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.descriptionColor ||
    (raw as Record<string, unknown>).cardDescriptionColor ||
    (raw as Record<string, unknown>).card_description_color,
  );

  const sectionCardPriceColor = sanitizeColor(
    merged.cardPriceColor ||
    (merged.appearance as Record<string, unknown> | undefined)
      ?.cardPriceColor ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.cardPriceColor ||
    (merged.cardConfig as Record<string, unknown> | undefined)?.priceColor ||
    (raw as Record<string, unknown>).cardPriceColor ||
    (raw as Record<string, unknown>).card_price_color,
  );

  // 2. Pilar 2: Sincronização Multiponto (Injetar em todas as chaves)
  if (sectionBgColor) {
    merged.bgColor = sectionBgColor;
    merged.backgroundColor = sectionBgColor;
    merged.bg_color = sectionBgColor;
    merged.background_color = sectionBgColor;
    if (merged.appearance && typeof merged.appearance === "object") {
      (merged.appearance as Record<string, unknown>).backgroundColor =
        sectionBgColor;
      (merged.appearance as Record<string, unknown>).bgColor = sectionBgColor;
      (merged.appearance as Record<string, unknown>).bg_color = sectionBgColor;
      (merged.appearance as Record<string, unknown>).background_color =
        sectionBgColor;
    }
  }

  const cardConfig: Record<string, unknown> =
    (merged.cardConfig as Record<string, unknown>) || {};

  if (sectionCardBgColor) {
    merged.cardBgColor = sectionCardBgColor;
    merged.cardBackgroundColor = sectionCardBgColor;
    cardConfig.cardBgColor = sectionCardBgColor;
    cardConfig.cardBackgroundColor = sectionCardBgColor;
    cardConfig.backgroundColor = sectionCardBgColor;
    cardConfig.background_color = sectionCardBgColor;
    if (merged.appearance && typeof merged.appearance === "object") {
      (merged.appearance as Record<string, unknown>).cardBgColor =
        sectionCardBgColor;
      (merged.appearance as Record<string, unknown>).cardBackgroundColor =
        sectionCardBgColor;
    }
  }

  if (sectionCardIconColor) {
    merged.cardIconColor = sectionCardIconColor;
    cardConfig.cardIconColor = sectionCardIconColor;
    cardConfig.iconColor = sectionCardIconColor;
    if (merged.appearance && typeof merged.appearance === "object") {
      (merged.appearance as Record<string, unknown>).cardIconColor =
        sectionCardIconColor;
    }
  }

  if (sectionCardTitleColor) {
    merged.cardTitleColor = sectionCardTitleColor;
    cardConfig.cardTitleColor = sectionCardTitleColor;
    cardConfig.titleColor = sectionCardTitleColor;
  }

  if (sectionCardDescriptionColor) {
    merged.cardDescriptionColor = sectionCardDescriptionColor;
    cardConfig.cardDescriptionColor = sectionCardDescriptionColor;
    cardConfig.descriptionColor = sectionCardDescriptionColor;
  }

  if (sectionCardPriceColor) {
    merged.cardPriceColor = sectionCardPriceColor;
    cardConfig.cardPriceColor = sectionCardPriceColor;
    cardConfig.priceColor = sectionCardPriceColor;
  }

  // Reidratação de Fontes
  const sectionTitleFont = sanitizeFont(
    merged.titleFont ||
    (merged.appearance as Record<string, unknown> | undefined)?.titleFont ||
    (merged.content as Record<string, unknown> | undefined)?.titleFont ||
    (merged.typography as Record<string, unknown> | undefined)?.titleFont ||
    (raw as Record<string, unknown>).titleFont ||
    (raw as Record<string, unknown>).title_font,
  );

  const sectionContentFont = sanitizeFont(
    merged.contentFont ||
    (merged.appearance as Record<string, unknown> | undefined)?.contentFont ||
    (merged.content as Record<string, unknown> | undefined)?.contentFont ||
    (merged.typography as Record<string, unknown> | undefined)?.fontFamily ||
    (merged.typography as Record<string, unknown> | undefined)?.contentFont ||
    (raw as Record<string, unknown>).contentFont ||
    (raw as Record<string, unknown>).content_font,
  );

  if (sectionTitleFont) {
    merged.titleFont = sectionTitleFont;
    if (merged.appearance && typeof merged.appearance === "object") {
      (merged.appearance as Record<string, unknown>).titleFont =
        sectionTitleFont;
    }
    if (merged.content && typeof merged.content === "object") {
      (merged.content as Record<string, unknown>).titleFont = sectionTitleFont;
    }
  }

  if (sectionContentFont) {
    merged.contentFont = sectionContentFont;
    if (merged.appearance && typeof merged.appearance === "object") {
      (merged.appearance as Record<string, unknown>).contentFont =
        sectionContentFont;
    }
    if (merged.content && typeof merged.content === "object") {
      (merged.content as Record<string, unknown>).contentFont =
        sectionContentFont;
    }
  }

  const sectionCardTitleFont = sanitizeFont(
    merged.cardTitleFont ||
    (merged.appearance as Record<string, unknown> | undefined)
      ?.cardTitleFont ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.cardTitleFont ||
    (merged.cardConfig as Record<string, unknown> | undefined)?.titleFont ||
    (raw as Record<string, unknown>).cardTitleFont ||
    (raw as Record<string, unknown>).card_title_font,
  );

  const sectionCardDescriptionFont = sanitizeFont(
    merged.cardDescriptionFont ||
    (merged.appearance as Record<string, unknown> | undefined)
      ?.cardDescriptionFont ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.cardDescriptionFont ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.descriptionFont ||
    (raw as Record<string, unknown>).cardDescriptionFont ||
    (raw as Record<string, unknown>).card_description_font,
  );

  const sectionCardPriceFont = sanitizeFont(
    merged.cardPriceFont ||
    (merged.appearance as Record<string, unknown> | undefined)
      ?.cardPriceFont ||
    (merged.cardConfig as Record<string, unknown> | undefined)
      ?.cardPriceFont ||
    (merged.cardConfig as Record<string, unknown> | undefined)?.priceFont ||
    (raw as Record<string, unknown>).cardPriceFont ||
    (raw as Record<string, unknown>).card_price_font,
  );

  if (sectionCardTitleFont) {
    merged.cardTitleFont = sectionCardTitleFont;
    cardConfig.cardTitleFont = sectionCardTitleFont;
    cardConfig.titleFont = sectionCardTitleFont;
  }

  if (sectionCardDescriptionFont) {
    merged.cardDescriptionFont = sectionCardDescriptionFont;
    cardConfig.cardDescriptionFont = sectionCardDescriptionFont;
    cardConfig.descriptionFont = sectionCardDescriptionFont;
  }

  if (sectionCardPriceFont) {
    merged.cardPriceFont = sectionCardPriceFont;
    cardConfig.cardPriceFont = sectionCardPriceFont;
    cardConfig.priceFont = sectionCardPriceFont;
  }

  if (Object.keys(cardConfig).length > 0) {
    merged.cardConfig = cardConfig;
  }

  // 3. PILAR 1: Validar e Limpar via Schema (Zod)
  // Isso garante que cores em formatos estranhos sejam convertidas e campos obrigatórios existam.
  try {
    // Verificação de segurança: Se o SectionSchema por algum motivo for undefined ou inválido,
    // não chamamos o parse para evitar que o erro interno do Zod pare o editor.
    if (SectionSchema && typeof SectionSchema.parse === "function") {
      const validated = SectionSchema.parse(merged);
      return normalizePersistenceData(validated) as T;
    }
    console.warn(
      ">>> [SCHEMA_WARNING] SectionSchema não disponível para validação.",
    );
    return normalizePersistenceData(merged) as T;
  } catch (e) {
    console.error(">>> [SCHEMA_VALIDATION_ERROR] Erro ao validar seção:", e);
    return normalizePersistenceData(merged) as T;
  }
};

const getPayloadRoot = (config: SiteConfigData | null | undefined) => {
  if (!config || typeof config !== "object") return {};
  return (config.siteCustomization ||
    config.site_customization ||
    config) as SiteConfigData;
};

export const normalizePayload = (config: SiteConfigData | null | undefined) => {
  const safeConfig = (config || {}) as SiteConfigData;
  const root = getPayloadRoot(safeConfig);

  const layoutGlobal = (root.layoutGlobal || root.layout_global) as
    | Record<string, unknown>
    | undefined;
  const home = root.home as Record<string, unknown> | undefined;
  const about = root.about as Record<string, unknown> | undefined;
  const rootSections = root.sections as Record<string, unknown> | undefined;
  const gallerySection = rootSections?.gallery as
    | Record<string, unknown>
    | undefined;
  const galleryStyles = gallerySection?.styles as
    | Record<string, unknown>
    | undefined;
  const galleryBackgroundColor =
    typeof galleryStyles?.backgroundColor === "string"
      ? galleryStyles.backgroundColor
      : undefined;
  const gallerySectionWithAppearance = gallerySection
    ? {
      ...gallerySection,
      bgColor:
        (gallerySection.bgColor as string | undefined) ||
        galleryBackgroundColor,
      appearance: {
        ...((gallerySection.appearance as Record<string, unknown>) || {}),
        backgroundColor:
          (gallerySection.appearance as Record<string, unknown> | undefined)
            ?.backgroundColor || galleryBackgroundColor,
      },
    }
    : undefined;

  const sections: SectionsMap = {
    // 1. Preservar seções existentes para não perder nada novo
    ...(rootSections || {}),
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
      (home?.storySection as SectionConfig | undefined) ||
      (home?.story as SectionConfig | undefined) ||
      (layoutGlobal?.story as SectionConfig | undefined) ||
      (root.story as SectionConfig | undefined),
      defaultStorySettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeTeam]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.homeTeam] ||
      (layoutGlobal?.sections as SectionsMap | undefined)?.[
      SECTION_IDS.homeTeam
      ] ||
      (home?.teamSection as SectionConfig | undefined) ||
      (home?.team as SectionConfig | undefined) ||
      (layoutGlobal?.team as SectionConfig | undefined) ||
      (root.team as SectionConfig | undefined),
      defaultTeamSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeTestimonials]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[
      SECTION_IDS.homeTestimonials
      ] ||
      (layoutGlobal?.sections as SectionsMap | undefined)?.[
      SECTION_IDS.homeTestimonials
      ] ||
      (home?.testimonialsSection as SectionConfig | undefined) ||
      (home?.testimonials as SectionConfig | undefined) ||
      (layoutGlobal?.testimonials as SectionConfig | undefined) ||
      (root.testimonials as SectionConfig | undefined),
      defaultTestimonialsSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeServices]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.homeServices] ||
      (layoutGlobal?.sections as SectionsMap | undefined)?.[
      SECTION_IDS.homeServices
      ] ||
      (home?.servicesSection as SectionConfig | undefined) ||
      (home?.services as SectionConfig | undefined) ||
      (layoutGlobal?.services as SectionConfig | undefined) ||
      (root.services as SectionConfig | undefined),
      defaultServicesSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeValues]: normalizeSectionConfig(
      (() => {
        const raw =
          (root.sections as SectionsMap | undefined)?.[
          SECTION_IDS.homeValues
          ] ||
          (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.homeValues
          ] ||
          (home?.homeValuesSettings as SectionConfig | undefined) ||
          (home?.valuesSection as SectionConfig | undefined) ||
          (home?.values as SectionConfig | undefined) ||
          (layoutGlobal?.homeValuesSettings as SectionConfig | undefined) ||
          (root.homeValuesSettings as SectionConfig | undefined) ||
          (root.values as SectionConfig | undefined) ||
          (root.valuesSection as SectionConfig | undefined);
        if (!raw) return raw;
        const legacyBgColor =
          sanitizeColor(
            raw.values_bg ||
            raw.about_values_bg ||
            root.values_bg ||
            root.valuesBg,
          ) || "";
        if (!raw.bgColor && legacyBgColor) {
          return {
            ...raw,
            bgColor: legacyBgColor,
            backgroundColor: legacyBgColor,
          };
        }
        return raw as SectionConfig;
      })(),
      defaultValuesSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.aboutValues]: normalizeSectionConfig(
      (() => {
        const raw =
          (root.sections as SectionsMap | undefined)?.[
          SECTION_IDS.aboutValues
          ] ||
          (layoutGlobal?.sections as SectionsMap | undefined)?.[
          SECTION_IDS.aboutValues
          ] ||
          (root.aboutUsValuesSettings as SectionConfig | undefined) ||
          (root.aboutUsValues as SectionConfig | undefined) ||
          (about?.aboutUsValuesSettings as SectionConfig | undefined) ||
          (about?.aboutUsValues as SectionConfig | undefined) ||
          (about?.valuesSection as SectionConfig | undefined) ||
          (about?.values as SectionConfig | undefined) ||
          (layoutGlobal?.aboutUsValuesSettings as SectionConfig | undefined) ||
          (layoutGlobal?.aboutUsValues as SectionConfig | undefined) ||
          (root.about_us_values as SectionConfig | undefined);
        if (!raw) return raw;
        const legacyBgColor =
          sanitizeColor(
            raw.about_values_bg ||
            raw.values_bg ||
            root.about_values_bg ||
            root.aboutValuesBg,
          ) || "";
        if (!raw.bgColor && legacyBgColor) {
          return {
            ...raw,
            bgColor: legacyBgColor,
            backgroundColor: legacyBgColor,
          };
        }
        return raw as SectionConfig;
      })(),
      defaultValuesSettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeGallery]: normalizeSectionConfig(
      (home?.galleryPreview as SectionConfig | undefined) ||
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.homeGallery] ||
      (gallerySectionWithAppearance as SectionConfig | undefined) ||
      ((root.sections as Record<string, unknown> | undefined)
        ?.galleryPreview as SectionConfig | undefined) ||
      ((root.sections as Record<string, unknown> | undefined)
        ?.galleryPreviewSettings as SectionConfig | undefined) ||
      ((root.sections as Record<string, unknown> | undefined)
        ?.gallerySection as SectionConfig | undefined) ||
      (layoutGlobal?.sections as SectionsMap | undefined)?.[
      SECTION_IDS.homeGallery
      ] ||
      (root.galleryPreviewSettings as SectionConfig | undefined) ||
      (layoutGlobal?.galleryPreview as SectionConfig | undefined) ||
      (layoutGlobal?.gallerySection as SectionConfig | undefined) ||
      (home?.gallerySection as SectionConfig | undefined),
      defaultGallerySettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.pageGallery]: normalizeSectionConfig(
      (root.gallery as SectionConfig | undefined) ||
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.pageGallery] ||
      ((root.sections as Record<string, unknown> | undefined)
        ?.galleryPageSettings as SectionConfig | undefined) ||
      ((root.sections as Record<string, unknown> | undefined)?.gallery as
        | SectionConfig
        | undefined) ||
      (layoutGlobal?.sections as SectionsMap | undefined)?.[
      SECTION_IDS.pageGallery
      ] ||
      (root.galleryPageSettings as SectionConfig | undefined) ||
      (layoutGlobal?.gallery as SectionConfig | undefined),
      defaultGallerySettings as unknown as SectionConfig,
    ),
    [SECTION_IDS.homeCta]: normalizeSectionConfig(
      (root.sections as SectionsMap | undefined)?.[SECTION_IDS.homeCta] ||
      (layoutGlobal?.sections as SectionsMap | undefined)?.[
      SECTION_IDS.homeCta
      ] ||
      (home?.ctaSection as SectionConfig | undefined) ||
      (home?.cta as SectionConfig | undefined) ||
      (layoutGlobal?.cta as SectionConfig | undefined) ||
      (root.cta as SectionConfig | undefined),
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
        (
          (root.appointmentFlow as Record<string, unknown> | undefined)
            ?.steps as Record<string, unknown> | undefined
        )?.service ||
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
        ((root.appointmentFlow as Record<string, unknown> | undefined)?.date as
          | SectionConfig
          | undefined) ||
        (
          (root.appointmentFlow as Record<string, unknown> | undefined)
            ?.steps as Record<string, unknown> | undefined
        )?.date ||
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
        ((root.appointmentFlow as Record<string, unknown> | undefined)?.time as
          | SectionConfig
          | undefined) ||
        (
          (root.appointmentFlow as Record<string, unknown> | undefined)
            ?.steps as Record<string, unknown> | undefined
        )?.time ||
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
        ((root.appointmentFlow as Record<string, unknown> | undefined)?.form as
          | SectionConfig
          | undefined) ||
        (
          (root.appointmentFlow as Record<string, unknown> | undefined)
            ?.steps as Record<string, unknown> | undefined
        )?.form ||
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
        (
          (root.appointmentFlow as Record<string, unknown> | undefined)
            ?.steps as Record<string, unknown> | undefined
        )?.confirmation ||
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
  bgColor?: string;
  backgroundImageUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  titleFont?: string;
  subtitleFont?: string;
  contentFont?: string;
  cardBgColor?: string;
  cardBackgroundColor?: string;
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
  cardTextColor?: string;
  iconColor?: string;
  borderRadius?: string;
  backgroundColor?: string;
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
  titleColor: "#000000",
  subtitleColor: "#000000",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "#FFFFFF",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "#FFFFFF",
  cardTitleColor: "#000000",
  cardDescriptionColor: "#000000",
  cardPriceColor: "#000000",
  cardIconColor: "#000000",
  cardTitleFont: "",
  cardDescriptionFont: "",
  cardPriceFont: "",
};

export const defaultStorySettings: StorySettings = {
  title: "Nossa História",
  titleColor: "#000000",
  titleFont: "",
  content:
    "A Aura Sistema nasceu da paixão por realçar a beauty natural de cada pessoa através do design de sobrancelhas. Com mais de 10 anos de experiência no mercado, nos especializamos em técnicas avançadas que valorizam a individualidade de cada cliente.\n\nNossa missão é proporcionar não apenas um serviço de qualidade, mas uma experiência transformadora. Acreditamos que sobrancelhas bem feitas têm o poder de elevar a autoestima e destacar a beleza única de cada pessoa.\n\nInvestimos constantemente em capacitação e nas melhores técnicas do mercado para garantir resultados excepcionais e a satisfação total de nossas clientes.",
  contentColor: "#000000",
  contentFont: "",
  image: "/professional-eyebrow-artist-at-work.jpg",
  bgType: "color",
  bgColor: "#FFFFFF",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  appearance: {
    backgroundColor: "#FFFFFF",
    backgroundImageUrl: "",
  },
};

export const defaultValuesSettings: ValuesSettings = {
  title: "Nossos Valores",
  subtitle:
    "Os princípios que guiam nosso trabalho e relacionamento com cada cliente",
  showTitle: true,
  showSubtitle: true,
  titleColor: "#000000",
  subtitleColor: "#000000",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "#FFFFFF",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "#FFFFFF",
  cardTitleColor: "#000000",
  cardDescriptionColor: "#000000",
  cardIconColor: "#000000",
  cardTitleFont: "",
  cardDescriptionFont: "",
  cardTextColor: "#000000",
  iconColor: "#000000",
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
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
  // Estruturas conforme contrato
  gridConfig?: {
    columns: number;
    gap: string;
  };
  displayLogic?: {
    photoCount: number;
  };
  photoStyle?: {
    borderRadius: string;
  };
  // Card specific styles
  cardBgColor?: string;
};

export const defaultGallerySettings: GallerySettings = {
  title: "Nossos Trabalhos",
  subtitle:
    "Veja alguns dos resultados incríveis que alcançamos com nossas clientes",
  buttonText: "Ver Galeria Completa",
  titleColor: "#000000",
  subtitleColor: "#666666",
  buttonColor: "#000000",
  buttonTextColor: "#FFFFFF",
  titleFont: "",
  subtitleFont: "",
  buttonFont: "",
  layout: "grid",
  bgType: "color",
  bgColor: "#FFFFFF",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "transparent",
  gridConfig: {
    columns: 3,
    gap: "16px",
  },
  displayLogic: {
    photoCount: 6,
  },
  photoStyle: {
    borderRadius: "8px",
  },
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
  minimumBookingLeadMinutes?: number;
  step3Times?: {
    interval?: string | number;
    minimumBookingLeadMinutes?: number;
  };
  buttonColor?: string;
  appearance?: AppearanceSettings;
};

export const defaultBookingServiceSettings: BookingStepSettings = {
  title: "Escolha seus Serviços",
  subtitle: "Selecione um ou mais serviços para o seu agendamento",
  titleColor: "#000000",
  subtitleColor: "#000000",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "#FFFFFF",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "#000000",
  cardBgColor: "#FFFFFF",
  minimumBookingLeadMinutes: 0,
  step3Times: {
    minimumBookingLeadMinutes: 0,
  },
  appearance: {
    backgroundImageUrl: "",
  },
};

export const defaultBookingDateSettings: BookingStepSettings = {
  title: "Escolha a Data",
  subtitle: "Selecione o dia de sua preferência",
  titleColor: "#000000",
  subtitleColor: "#000000",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "#FFFFFF",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "#000000",
  cardBgColor: "#FFFFFF",
  appearance: {
    backgroundImageUrl: "",
  },
};

export const defaultBookingTimeSettings: BookingStepSettings = {
  title: "Escolha o Horário",
  subtitle: "Selecione o melhor horário disponível",
  titleColor: "#000000",
  subtitleColor: "#000000",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "#FFFFFF",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "#000000",
  cardBgColor: "#FFFFFF",
  appearance: {
    backgroundImageUrl: "",
  },
};

export const defaultBookingFormSettings: BookingStepSettings = {
  title: "Seus Dados",
  subtitle: "Preencha suas informações para finalizar o agendamento",
  titleColor: "#000000",
  subtitleColor: "#000000",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "#FFFFFF",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "#000000",
  cardBgColor: "#FFFFFF",
  appearance: {
    backgroundImageUrl: "",
  },
};

export const defaultBookingConfirmationSettings: BookingStepSettings = {
  title: "Agendamento Confirmado!",
  subtitle: "Tudo pronto! Você receberá um e-mail com os detalhes.",
  titleColor: "#000000",
  subtitleColor: "#000000",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "#FFFFFF",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  accentColor: "#000000",
  cardBgColor: "#FFFFFF",
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
  appointment_flow?: BookingConfig["appointmentFlow"];
  bookingSteps?: {
    service?: BookingStepSettings;
    date?: BookingStepSettings;
    time?: BookingStepSettings;
    form?: BookingStepSettings;
    confirmation?: BookingStepSettings;
  };
}

export function getBookingServiceSettings(
  studio?: Record<string, unknown>,
): BookingStepSettings {
  const flow = (studio?.appointmentFlow || studio?.appointment_flow) as
    | Record<string, unknown>
    | undefined;
  const step1 = (flow?.step1Services ||
    flow?.step1_services ||
    flow?.step1_service ||
    (studio?.bookingSteps as Record<string, unknown> | undefined)?.service ||
    {}) as Record<string, unknown>;

  let normalized = normalizeStepSettings(step1, defaultBookingServiceSettings);

  if (
    normalized.bgColor &&
    normalized.bgColor !== "transparent" &&
    !normalized.bgImage
  ) {
    normalized.bgType = "color";
  }

  // Tenta carregar do localStorage (Sobrescreve config se houver rascunho local)
  if (typeof window !== "undefined") {
    const settings = localStorage.getItem(
      getStorageKey("bookingServiceSettings"),
    );
    if (settings) {
      try {
        const saved = JSON.parse(settings);
        normalized = normalizeStepSettings(saved, normalized);

        if (
          normalized.bgColor &&
          normalized.bgColor !== "transparent" &&
          !normalized.bgImage
        ) {
          normalized.bgType = "color";
        }
      } catch (e) {
        console.error("Erro ao parsear bookingServiceSettings:", e);
      }
    }
  }

  return {
    ...normalized,
    title: normalized.title || "Escolha seus Serviços",
    subtitle:
      normalized.subtitle ||
      "Selecione um ou mais serviços para o seu agendamento",
    bgColor: normalized.bgColor || "#ffffff",
    cardBgColor: normalized.cardBgColor || "rgba(255,255,255,0.6)",
    accentColor: normalized.accentColor || "#000000",
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

export function getBookingDateSettings(
  config?: BookingConfig,
): BookingStepSettings {
  const stepConfig =
    (config?.bookingSteps?.date as Record<string, unknown> | undefined) ||
    (config?.appointmentFlow?.steps?.date as
      | Record<string, unknown>
      | undefined) ||
    (config?.appointment_flow?.steps?.date as
      | Record<string, unknown>
      | undefined) ||
    (config?.appointmentFlow?.date as Record<string, unknown> | undefined) ||
    (config?.appointment_flow?.date as Record<string, unknown> | undefined);

  let base = normalizeStepSettings(
    stepConfig as Record<string, unknown> | undefined,
    defaultBookingDateSettings,
  );

  if (base.bgColor && base.bgColor !== "transparent" && !base.bgImage) {
    base.bgType = "color";
  }

  // Tenta carregar do localStorage (Sobrescreve config se houver rascunho local)
  if (typeof window !== "undefined") {
    const settings = localStorage.getItem(getStorageKey("bookingDateSettings"));
    if (settings) {
      try {
        const saved = JSON.parse(settings);
        base = normalizeStepSettings(saved, base);

        if (base.bgColor && base.bgColor !== "transparent" && !base.bgImage) {
          base.bgType = "color";
        }
      } catch (e) {
        console.error("Erro ao parsear bookingDateSettings:", e);
      }
    }
  }

  return base;
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

export function getBookingTimeSettings(
  config?: BookingConfig,
): BookingStepSettings {
  const stepConfig =
    (config?.bookingSteps?.time as Record<string, unknown> | undefined) ||
    (config?.appointmentFlow?.steps?.time as
      | Record<string, unknown>
      | undefined) ||
    (config?.appointment_flow?.steps?.time as
      | Record<string, unknown>
      | undefined) ||
    (config?.appointmentFlow?.time as Record<string, unknown> | undefined) ||
    (config?.appointment_flow?.time as Record<string, unknown> | undefined);

  let base = normalizeStepSettings(
    stepConfig as Record<string, unknown> | undefined,
    defaultBookingTimeSettings,
  );

  if (base.bgColor && base.bgColor !== "transparent" && !base.bgImage) {
    base.bgType = "color";
  }

  // Tenta carregar do localStorage (Sobrescreve config se houver rascunho local)
  if (typeof window !== "undefined") {
    const settings = localStorage.getItem(getStorageKey("bookingTimeSettings"));
    if (settings) {
      try {
        const saved = JSON.parse(settings);
        base = normalizeStepSettings(saved, base);

        if (base.bgColor && base.bgColor !== "transparent" && !base.bgImage) {
          base.bgType = "color";
        }
      } catch (e) {
        console.error("Erro ao parsear bookingTimeSettings:", e);
      }
    }
  }

  return base;
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

export function getBookingFormSettings(
  config?: BookingConfig,
): BookingStepSettings {
  const stepConfig =
    (config?.bookingSteps?.form as Record<string, unknown> | undefined) ||
    (config?.appointmentFlow?.steps?.form as
      | Record<string, unknown>
      | undefined) ||
    (config?.appointment_flow?.steps?.form as
      | Record<string, unknown>
      | undefined) ||
    (config?.appointmentFlow?.form as Record<string, unknown> | undefined) ||
    (config?.appointment_flow?.form as Record<string, unknown> | undefined);

  let base = normalizeStepSettings(
    stepConfig as Record<string, unknown> | undefined,
    defaultBookingFormSettings,
  );

  if (base.bgColor && base.bgColor !== "transparent" && !base.bgImage) {
    base.bgType = "color";
  }

  // Tenta carregar do localStorage (Sobrescreve config se houver rascunho local)
  if (typeof window !== "undefined") {
    const settings = localStorage.getItem(getStorageKey("bookingFormSettings"));
    if (settings) {
      try {
        const saved = JSON.parse(settings);
        base = normalizeStepSettings(saved, base);

        if (base.bgColor && base.bgColor !== "transparent" && !base.bgImage) {
          base.bgType = "color";
        }
      } catch (e) {
        console.error("Erro ao parsear bookingFormSettings:", e);
      }
    }
  }

  return base;
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

export function getBookingConfirmationSettings(
  config?: BookingConfig,
): BookingStepSettings {
  const stepConfig =
    (config?.bookingSteps?.confirmation as
      | Record<string, unknown>
      | undefined) ||
    (config?.appointmentFlow?.steps?.confirmation as
      | Record<string, unknown>
      | undefined) ||
    (config?.appointment_flow?.steps?.confirmation as
      | Record<string, unknown>
      | undefined) ||
    (config?.appointmentFlow?.confirmation as
      | Record<string, unknown>
      | undefined) ||
    (config?.appointment_flow?.confirmation as
      | Record<string, unknown>
      | undefined);

  let base = normalizeStepSettings(
    stepConfig as Record<string, unknown> | undefined,
    defaultBookingConfirmationSettings,
  );

  if (base.bgColor && base.bgColor !== "transparent" && !base.bgImage) {
    base.bgType = "color";
  }

  // Tenta carregar do localStorage (Sobrescreve config se houver rascunho local)
  if (typeof window !== "undefined") {
    const settings = localStorage.getItem(
      getStorageKey("bookingConfirmationSettings"),
    );
    if (settings) {
      try {
        const saved = JSON.parse(settings);
        base = normalizeStepSettings(saved, base);

        if (base.bgColor && base.bgColor !== "transparent" && !base.bgImage) {
          base.bgType = "color";
        }
      } catch (e) {
        console.error("Erro ao parsear bookingConfirmationSettings:", e);
      }
    }
  }

  return base;
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
  titleColor: "#000000",
  subtitleColor: "#000000",
  buttonColor: "#000000",
  buttonTextColor: "#FFFFFF",
  titleFont: "",
  subtitleFont: "",
  buttonFont: "",
  bgType: "color",
  bgColor: "#FFFFFF",
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
  titleColor: "#000000",
  subtitleColor: "#000000",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "#FFFFFF",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "#FFFFFF",
  cardTitleColor: "#000000",
  cardRoleColor: "#000000",
  cardDescriptionColor: "#000000",
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
  starColor: "#000000",
  title: "O Que Dizem Nossas Clientes",
  subtitle: "A satisfação de nossas clientes é nossa maior conquista",
  titleColor: "#000000",
  subtitleColor: "#000000",
  titleFont: "",
  subtitleFont: "",
  bgType: "color",
  bgColor: "#FFFFFF",
  bgImage: "",
  imageOpacity: 1,
  overlayOpacity: 0.5,
  imageScale: 1,
  imageX: 50,
  imageY: 50,
  cardBgColor: "#FFFFFF",
  cardNameColor: "#000000",
  cardTextColor: "#000000",
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

export type GlobalColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  buttonText: string;
  specialtyBadge: {
    background: string;
    text: string;
    borderRadius: string;
  };
};

export const defaultGlobalColors: GlobalColors = {
  primary: "#000000",
  secondary: "#000000",
  background: "#FFFFFF",
  text: "#000000",
  accent: "#000000",
  buttonText: "#FFFFFF",
  specialtyBadge: {
    background: "#000000",
    text: "#FFFFFF",
    borderRadius: "8px",
  },
};

export type ColorSettings = GlobalColors;

export const services: Service[] = [];

// Helper para normalizar configurações (usado tanto no load inicial quanto no preview)
export const normalizeStepSettings = (
  stepData: Record<string, unknown> | undefined,
  defaults?: BookingStepSettings,
): BookingStepSettings => {
  if (!stepData && !defaults) return {} as BookingStepSettings;
  if (!stepData) return defaults as BookingStepSettings;

  // 1. Resolver cor do CARD
  const cardConfig = (stepData.cardConfig ||
    stepData.card_config ||
    {}) as Record<string, unknown>;
  const appearanceRaw = (stepData.appearance || {}) as Record<string, unknown>;
  const content = (stepData.content || {}) as Record<string, unknown>;
  const itemsStyle = (stepData.itemsStyle ||
    stepData.items_style ||
    {}) as Record<string, unknown>;

  const rawCardColor =
    (stepData.cardBgColor as string) ||
    (stepData.card_bg_color as string) ||
    (stepData.cardBackgroundColor as string) ||
    (stepData.card_background_color as string) ||
    (cardConfig.cardBgColor as string) ||
    (cardConfig.card_bg_color as string) ||
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

  // Criar um cardConfig unificado para evitar perdas
  const unifiedCardConfig = {
    ...cardConfig,
    ...(finalCardColor
      ? {
        cardBgColor: finalCardColor,
        card_bg_color: finalCardColor,
        cardBackgroundColor: finalCardColor,
        card_background_color: finalCardColor,
        backgroundColor: finalCardColor,
        background_color: finalCardColor,
      }
      : {}),
  };

  // 2. Resolver cor do FUNDO DA SEÇÃO
  const rawBgColor =
    (stepData.bgColor as string) ||
    (stepData.bg_color as string) ||
    (appearanceRaw.backgroundColor as string) ||
    (appearanceRaw.background_color as string) ||
    (stepData.backgroundColor as string);
  const finalBgColor = sanitizeColor(rawBgColor);

  // 3. Resolver Appearance (Source of Truth do banco)
  const appearance = (stepData.appearance as Record<string, unknown>) || {
    backgroundImageUrl:
      (stepData.bgImage as string) || (stepData.bg_image as string) || "",
  };

  // 4. Blindagem: Se o stepData já tiver propriedades que o normalizeStepSettings não conhece, preserve-as!
  const final = {
    ...defaults, // Inicia com defaults se fornecido
    ...stepData, // Spread do original (sobrescreve defaults)
    titleColor:
      sanitizeColor(
        (stepData.titleColor as string) ||
        (appearanceRaw.titleColor as string) ||
        (defaults?.titleColor as string),
      ) || "",
    subtitleColor:
      sanitizeColor(
        (stepData.subtitleColor as string) ||
        (appearanceRaw.subtitleColor as string) ||
        (defaults?.subtitleColor as string),
      ) || "",
    accentColor:
      sanitizeColor(
        (stepData.accentColor as string) ||
        (appearanceRaw.accentColor as string) ||
        (defaults?.accentColor as string),
      ) || "",
    cardBgColor: finalCardColor || defaults?.cardBgColor || "",
    card_bg_color:
      finalCardColor ||
      ((defaults as Record<string, unknown> | undefined)?.card_bg_color as
        | string
        | undefined) ||
      "",
    cardBackgroundColor:
      finalCardColor ||
      ((defaults as Record<string, unknown> | undefined)?.cardBackgroundColor as
        | string
        | undefined) ||
      "",
    card_background_color:
      finalCardColor ||
      ((defaults as Record<string, unknown> | undefined)
        ?.card_background_color as string | undefined) ||
      "",
    cardConfig: unifiedCardConfig,
    bgColor:
      finalBgColor ||
      sanitizeColor(
        (stepData.bgColor as string) ||
        (stepData.bg_color as string) ||
        (defaults?.bgColor as string),
      ) ||
      "transparent",
    appearance: {
      ...(defaults?.appearance || {}),
      ...appearance,
      cardBgColor:
        finalCardColor ||
        ((defaults?.appearance as Record<string, unknown> | undefined)
          ?.cardBgColor as string | undefined) ||
        "",
      cardBackgroundColor:
        finalCardColor ||
        ((defaults?.appearance as Record<string, unknown> | undefined)
          ?.cardBackgroundColor as string | undefined) ||
        "",
      cardConfig: unifiedCardConfig,
      backgroundColor:
        (appearance.backgroundColor as string) ||
        (appearance.background_color as string) ||
        finalBgColor ||
        "",
      backgroundImageUrl:
        (appearance.backgroundImageUrl as string) ||
        (stepData.bgImage as string) ||
        (stepData.bg_image as string) ||
        "",
    },
  };

  // 5. PILAR 1: Validar e Limpar via Schema (Zod)
  // Isso converte objetos de cor do Picker para strings e garante tipos mínimos.
  try {
    if (BookingStepSchema && typeof BookingStepSchema.parse === "function") {
      const validated = BookingStepSchema.parse(final);
      return validated as BookingStepSettings;
    }
    console.warn(">>> [SCHEMA_WARNING] BookingStepSchema não disponível.");
    return final as BookingStepSettings;
  } catch (e) {
    console.error(">>> [SCHEMA_VALIDATION_ERROR] Erro ao validar Step:", e);
    return final as BookingStepSettings;
  }
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
    minimumBookingLeadMinutes: 0,
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
    minimumBookingLeadMinutes: 0,
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
    minimumBookingLeadMinutes: 0,
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
    minimumBookingLeadMinutes: 0,
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
    minimumBookingLeadMinutes: 0,
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
    minimumBookingLeadMinutes: 0,
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
    minimumBookingLeadMinutes: 0,
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
  badgeColor: "#000000",
  badgeTextColor: "#FFFFFF",
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
  primaryButtonColor: "#000000",
  secondaryButtonColor: "",
  primaryButtonTextColor: "#FFFFFF",
  secondaryButtonTextColor: "",
  titleColor: "#000000",
  subtitleColor: "#000000",
  primaryButtonFont: "",
  secondaryButtonFont: "",
};

export const defaultFontSettings: FontSettings = {
  headingFont: "Playfair Display",
  subtitleFont: "Playfair Display",
  bodyFont: "Inter",
};

export const defaultColorSettings: ColorSettings = defaultGlobalColors;

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

  const nowInSaoPaulo = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Sao_Paulo",
    }),
  );
  const nowDateKey = format(nowInSaoPaulo, "yyyy-MM-dd");
  const nowMinutes = nowInSaoPaulo.getHours() * 60 + nowInSaoPaulo.getMinutes();
  const minimumLeadMinutes = daySchedule.minimumBookingLeadMinutes || 0;

  return allSlots.map((time) => {
    const available = isTimeSlotAvailable(
      time,
      serviceDuration,
      dayBookings,
      daySchedule,
      dayBlocks,
    );

    // Se o slot estiver disponível, verificar a antecedência mínima se for para hoje
    let finalAvailable = available;
    if (available && date === nowDateKey) {
      const [slotHour, slotMinute] = time.split(":").map(Number);
      const slotMinutes = slotHour * 60 + slotMinute;
      if (slotMinutes - nowMinutes < minimumLeadMinutes) {
        finalAvailable = false;
      }
    }

    return { time, available: finalAvailable };
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

export function saveNotificationSettings(
  _settings: NotificationSettings,
): void {
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
  if (typeof window === "undefined") return defaultSiteProfile;
  const profile = localStorage.getItem(getStorageKey("siteProfile"));
  if (!profile) return defaultSiteProfile;
  try {
    const parsed = JSON.parse(profile);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return { ...defaultSiteProfile, ...(parsed as Record<string, unknown>) };
    }
  } catch (_e) { }
  return defaultSiteProfile;
}

export function saveSiteProfile(profile: SiteProfile): void {
  if (typeof window === "undefined") return;
  const storageKey = getStorageKey("siteProfile");
  localStorage.setItem(storageKey, JSON.stringify(profile));
  updateDraftTimestamp();
  window.dispatchEvent(new Event("siteProfileUpdated"));
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

export function getHomeValuesSettings(data?: unknown): ValuesSettings {
  const root =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const home =
    (root.home as Record<string, unknown> | undefined) ||
    (root.home_page as Record<string, unknown> | undefined) ||
    {};
  const layoutGlobal =
    (root.layoutGlobal as Record<string, unknown> | undefined) ||
    (root.layout_global as Record<string, unknown> | undefined) ||
    {};
  const values =
    (root[SECTION_IDS.homeValues] as Record<string, unknown> | undefined) ||
    (root.homeValuesSettings as Record<string, unknown> | undefined) ||
    (root.homeValues as Record<string, unknown> | undefined) ||
    (root.home_values as Record<string, unknown> | undefined) ||
    (home.homeValuesSettings as Record<string, unknown> | undefined) ||
    (root.valuesSection as Record<string, unknown> | undefined) ||
    (home.valuesSection as Record<string, unknown> | undefined) ||
    (home.values as Record<string, unknown> | undefined) ||
    (layoutGlobal.homeValuesSettings as Record<string, unknown> | undefined) ||
    (layoutGlobal.values as Record<string, unknown> | undefined) ||
    (root.values as Record<string, unknown> | undefined) ||
    {};
  const appearance = values.appearance as Record<string, unknown> | undefined;
  const title =
    typeof values.title === "string" ? values.title : defaultValuesSettings.title;
  const subtitle = typeof values.subtitle === "string" ? values.subtitle : defaultValuesSettings.subtitle;
  const items = Array.isArray(values.items)
    ? values.items
    : defaultValuesSettings.items || [];
  const backgroundColor =
    (typeof values.backgroundColor === "string" && values.backgroundColor) ||
    (typeof values.bgColor === "string" && values.bgColor) ||
    (typeof appearance?.backgroundColor === "string" &&
      appearance.backgroundColor) ||
    (values.values_bg as string) ||
    defaultValuesSettings.backgroundColor;
  const bgColor =
    (typeof values.bgColor === "string" && values.bgColor) ||
    (typeof values.backgroundColor === "string" && values.backgroundColor) ||
    (values.values_bg as string) ||
    defaultValuesSettings.bgColor;
  const cardBgColor =
    (typeof values.cardBgColor === "string" && values.cardBgColor) ||
    (typeof values.cardBackgroundColor === "string" &&
      values.cardBackgroundColor) ||
    defaultValuesSettings.cardBgColor;
  const cardTextColor =
    (typeof values.cardTextColor === "string" && values.cardTextColor) ||
    defaultValuesSettings.cardTextColor;
  const iconColor =
    (typeof values.iconColor === "string" && values.iconColor) ||
    defaultValuesSettings.iconColor;
  const borderRadius =
    (typeof values.borderRadius === "string" && values.borderRadius) ||
    defaultValuesSettings.borderRadius;

  return {
    ...defaultValuesSettings,
    ...values,
    title,
    subtitle,
    items,
    backgroundColor,
    bgColor,
    cardBgColor,
    cardTextColor,
    iconColor,
    borderRadius,
  };
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

export function getAboutUsValuesSettings(data?: unknown): ValuesSettings {
  const root =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const values =
    (root[SECTION_IDS.aboutValues] as Record<string, unknown> | undefined) ||
    (root.aboutUsValuesSettings as Record<string, unknown> | undefined) ||
    (root.aboutUsValues as Record<string, unknown> | undefined) ||
    (root.about_us_values as Record<string, unknown> | undefined) ||
    {};
  const title =
    typeof values.title === "string" ? values.title : defaultValuesSettings.title;
  const subtitle = typeof values.subtitle === "string" ? values.subtitle : defaultValuesSettings.subtitle;
  const items = Array.isArray(values.items)
    ? values.items
    : defaultValuesSettings.items || [];
  const backgroundColor =
    (typeof values.backgroundColor === "string" && values.backgroundColor) ||
    (typeof values.bgColor === "string" && values.bgColor) ||
    defaultValuesSettings.backgroundColor;
  const bgColor =
    (typeof values.bgColor === "string" && values.bgColor) ||
    (typeof values.backgroundColor === "string" && values.backgroundColor) ||
    defaultValuesSettings.bgColor;
  const cardBgColor =
    (typeof values.cardBgColor === "string" && values.cardBgColor) ||
    (typeof values.cardBackgroundColor === "string" &&
      values.cardBackgroundColor) ||
    defaultValuesSettings.cardBgColor;
  const cardTextColor =
    (typeof values.cardTextColor === "string" && values.cardTextColor) ||
    defaultValuesSettings.cardTextColor;
  const iconColor =
    (typeof values.iconColor === "string" && values.iconColor) ||
    defaultValuesSettings.iconColor;
  const borderRadius =
    (typeof values.borderRadius === "string" && values.borderRadius) ||
    defaultValuesSettings.borderRadius;

  return {
    ...defaultValuesSettings,
    ...values,
    title,
    subtitle,
    items,
    backgroundColor,
    bgColor,
    cardBgColor,
    cardTextColor,
    iconColor,
    borderRadius,
  };
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
    "about-values": true,
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
