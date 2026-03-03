import { useMemo } from "react";
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
  ValuesSettings
} from "@/lib/booking-data";

interface UseEditorChangesProps {
  settings: {
    heroSettings: HeroSettings;
    aboutHeroSettings: HeroSettings;
    storySettings: StorySettings;
    teamSettings: TeamSettings;
    testimonialsSettings: TestimonialsSettings;
    fontSettings: FontSettings;
    colorSettings: ColorSettings;
    servicesSettings: ServicesSettings;
    valuesSettings: ValuesSettings;
    gallerySettings: GallerySettings;
    ctaSettings: CTASettings;
    headerSettings: HeaderSettings;
    footerSettings: FooterSettings;
    bookingServiceSettings: BookingStepSettings;
    bookingDateSettings: BookingStepSettings;
    bookingTimeSettings: BookingStepSettings;
    bookingFormSettings: BookingStepSettings;
    bookingConfirmationSettings: BookingStepSettings;
  };
  lastApplied: {
    lastAppliedHero: HeroSettings;
    lastAppliedAboutHero: HeroSettings;
    lastAppliedStory: StorySettings;
    lastAppliedTeam: TeamSettings;
    lastAppliedTestimonials: TestimonialsSettings;
    lastAppliedFont: FontSettings;
    lastAppliedColor: ColorSettings;
    lastAppliedServices: ServicesSettings;
    lastAppliedValues: ValuesSettings;
    lastAppliedGallery: GallerySettings;
    lastAppliedCTA: CTASettings;
    lastAppliedHeader: HeaderSettings;
    lastAppliedFooter: FooterSettings;
    lastAppliedBookingService: BookingStepSettings;
    lastAppliedBookingDate: BookingStepSettings;
    lastAppliedBookingTime: BookingStepSettings;
    lastAppliedBookingForm: BookingStepSettings;
    lastAppliedBookingConfirmation: BookingStepSettings;
  };
}

const hasChanged = <T>(current: T, target: T) => {
  return JSON.stringify(current) !== JSON.stringify(target);
};

export function useEditorChanges({ settings, lastApplied }: UseEditorChangesProps) {

  const hasHeroChanges = useMemo(() => hasChanged(settings.heroSettings, lastApplied.lastAppliedHero), [settings.heroSettings, lastApplied.lastAppliedHero]);
  const hasAboutHeroChanges = useMemo(() => hasChanged(settings.aboutHeroSettings, lastApplied.lastAppliedAboutHero), [settings.aboutHeroSettings, lastApplied.lastAppliedAboutHero]);
  const hasStoryChanges = useMemo(() => hasChanged(settings.storySettings, lastApplied.lastAppliedStory), [settings.storySettings, lastApplied.lastAppliedStory]);
  const hasTeamChanges = useMemo(() => hasChanged(settings.teamSettings, lastApplied.lastAppliedTeam), [settings.teamSettings, lastApplied.lastAppliedTeam]);
  const hasTestimonialsChanges = useMemo(() => hasChanged(settings.testimonialsSettings, lastApplied.lastAppliedTestimonials), [settings.testimonialsSettings, lastApplied.lastAppliedTestimonials]);
  const hasFontChanges = useMemo(() => hasChanged(settings.fontSettings, lastApplied.lastAppliedFont), [settings.fontSettings, lastApplied.lastAppliedFont]);
  const hasColorChanges = useMemo(() => hasChanged(settings.colorSettings, lastApplied.lastAppliedColor), [settings.colorSettings, lastApplied.lastAppliedColor]);
  const hasServicesChanges = useMemo(() => hasChanged(settings.servicesSettings, lastApplied.lastAppliedServices), [settings.servicesSettings, lastApplied.lastAppliedServices]);
  const hasValuesChanges = useMemo(() => hasChanged(settings.valuesSettings, lastApplied.lastAppliedValues), [settings.valuesSettings, lastApplied.lastAppliedValues]);
  const hasGalleryChanges = useMemo(() => hasChanged(settings.gallerySettings, lastApplied.lastAppliedGallery), [settings.gallerySettings, lastApplied.lastAppliedGallery]);
  const hasCTAChanges = useMemo(() => hasChanged(settings.ctaSettings, lastApplied.lastAppliedCTA), [settings.ctaSettings, lastApplied.lastAppliedCTA]);
  const hasHeaderChanges = useMemo(() => hasChanged(settings.headerSettings, lastApplied.lastAppliedHeader), [settings.headerSettings, lastApplied.lastAppliedHeader]);
  const hasFooterChanges = useMemo(() => hasChanged(settings.footerSettings, lastApplied.lastAppliedFooter), [settings.footerSettings, lastApplied.lastAppliedFooter]);
  
  const hasBookingServiceChanges = useMemo(() => hasChanged(settings.bookingServiceSettings, lastApplied.lastAppliedBookingService), [settings.bookingServiceSettings, lastApplied.lastAppliedBookingService]);
  const hasBookingDateChanges = useMemo(() => hasChanged(settings.bookingDateSettings, lastApplied.lastAppliedBookingDate), [settings.bookingDateSettings, lastApplied.lastAppliedBookingDate]);
  const hasBookingTimeChanges = useMemo(() => hasChanged(settings.bookingTimeSettings, lastApplied.lastAppliedBookingTime), [settings.bookingTimeSettings, lastApplied.lastAppliedBookingTime]);
  const hasBookingFormChanges = useMemo(() => hasChanged(settings.bookingFormSettings, lastApplied.lastAppliedBookingForm), [settings.bookingFormSettings, lastApplied.lastAppliedBookingForm]);
  const hasBookingConfirmationChanges = useMemo(() => hasChanged(settings.bookingConfirmationSettings, lastApplied.lastAppliedBookingConfirmation), [settings.bookingConfirmationSettings, lastApplied.lastAppliedBookingConfirmation]);

  return {
    hasHeroChanges,
    hasAboutHeroChanges,
    hasStoryChanges,
    hasTeamChanges,
    hasTestimonialsChanges,
    hasFontChanges,
    hasColorChanges,
    hasServicesChanges,
    hasValuesChanges,
    hasGalleryChanges,
    hasCTAChanges,
    hasHeaderChanges,
    hasFooterChanges,
    hasBookingServiceChanges,
    hasBookingDateChanges,
    hasBookingTimeChanges,
    hasBookingFormChanges,
    hasBookingConfirmationChanges,
  };
}
