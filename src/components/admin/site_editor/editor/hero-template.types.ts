import type { HeroSettings, ServicesSettings } from "@/lib/booking-data";

export const HERO_TEMPLATE_ICON_NAMES = ["Sparkles", "Star", "Heart", "Crown", "Flower2", "Moon", "Sun", "Gem", "Smile", "Award"] as const;

export type HeroTemplateIconName = (typeof HERO_TEMPLATE_ICON_NAMES)[number];

export type HeroTemplateTitleSize = "sm" | "md" | "lg" | "xl";

export type HeroTemplateFontFamily =
  | "sans"
  | "serif"
  | "montserrat"
  | "lora"
  | "syne"
  | "bebas"
  | "space"
  | "poppins"
  | "cinzel";

export interface HeroTemplatePreset extends Partial<HeroSettings> {
  id: string;
  niche: string;
  variationName?: string;
  titleSize?: HeroTemplateTitleSize;
  fontFamily?: HeroTemplateFontFamily;
  sectionId?: string;
}

export interface ServicesTemplatePreset extends Partial<ServicesSettings> {
  id: string;
  niche: string;
  variationName?: string;
}
