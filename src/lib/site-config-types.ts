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

export interface LayoutGlobalSettings {
  siteColors?: ColorSettings;
  cores_base?: ColorSettings;
  fontes?: FontSettings;
  visibleSections?: Record<string, boolean>;
  pageVisibility?: Record<string, boolean>;
  hero?: HeroSettings;
  aboutHero?: HeroSettings;
  story?: StorySettings;
  team?: TeamSettings;
  testimonials?: TestimonialsSettings;
  services?: ServicesSettings;
  values?: ValuesSettings;
  gallery?: GallerySettings;
  cta?: CTASettings;
  header?: HeaderSettings;
  footer?: FooterSettings;
}

export interface SiteConfigData {
  [key: string]: unknown;
  hero?: HeroSettings;
  aboutHero?: HeroSettings;
  story?: StorySettings;
  team?: TeamSettings;
  testimonials?: TestimonialsSettings;
  theme?: FontSettings;
  typography?: FontSettings; // Alinhamento com o Back-end
  colors?: ColorSettings;
  services?: ServicesSettings;
  values?: ValuesSettings;
  gallery?: GallerySettings;
  cta?: CTASettings;
  header?: HeaderSettings;
  footer?: FooterSettings;
  pageVisibility?: Record<string, boolean>;
  visibleSections?: Record<string, boolean>;
  layoutGlobal?: LayoutGlobalSettings; // Suporte para estrutura aninhada do banco
  layout_global?: LayoutGlobalSettings; // Suporte para snake_case do banco
  bookingSteps?: {
    service?: BookingStepSettings;
    date?: BookingStepSettings;
    time?: BookingStepSettings;
    form?: BookingStepSettings;
    confirmation?: BookingStepSettings;
  };
  updatedAt?: string;
}
