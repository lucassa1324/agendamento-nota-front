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
  typography?: FontSettings;
  font?: FontSettings;
  color?: ColorSettings;
  visibleSections?: Record<string, boolean>;
  visible_sections?: Record<string, boolean>;
  pageVisibility?: Record<string, boolean>;
  page_visibility?: Record<string, boolean>;
  card_bg_color?: string;
  hero?: HeroSettings;
  heroBanner?: HeroSettings;
  aboutHero?: HeroSettings;
  story?: StorySettings;
  team?: TeamSettings;
  testimonials?: TestimonialsSettings;
  services?: ServicesSettings;
  values?: ValuesSettings;
  homeValuesSettings?: ValuesSettings;
  aboutUsValuesSettings?: ValuesSettings;
  galleryPreviewSettings?: GallerySettings;
  galleryPageSettings?: GallerySettings;
  gallery?: GallerySettings;
  galleryPage?: GallerySettings;
  cta?: CTASettings;
  header?: HeaderSettings;
  footer?: FooterSettings;
}

export interface SiteConfigData {
  [key: string]: unknown;
  home?: Record<string, unknown>;
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
  homeValuesSettings?: ValuesSettings;
  aboutUsValuesSettings?: ValuesSettings;
  gallery?: GallerySettings;
  cta?: CTASettings;
  header?: HeaderSettings;
  footer?: FooterSettings;
  pageVisibility?: Record<string, boolean>;
  visibleSections?: Record<string, boolean>;
  siteCustomization?: {
    layoutGlobal?: LayoutGlobalSettings;
    layout_global?: LayoutGlobalSettings;
  };
  site_customization?: {
    layoutGlobal?: LayoutGlobalSettings;
    layout_global?: LayoutGlobalSettings;
  };
  bookingSteps?: {
    service?: BookingStepSettings;
    date?: BookingStepSettings;
    time?: BookingStepSettings;
    form?: BookingStepSettings;
    confirmation?: BookingStepSettings;
  };
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
  updatedAt?: string;
}
