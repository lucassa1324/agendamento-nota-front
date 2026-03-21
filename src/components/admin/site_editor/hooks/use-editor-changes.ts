import { useMemo, useState, useEffect } from "react";
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
}

const hasChanged = <T>(current: T, target: T) => {
  if (!current || !target) return !!current !== !!target;
  try {
    return JSON.stringify(current) !== JSON.stringify(target);
  } catch (e) {
    return false;
  }
};

export function useEditorChanges({ settings, lastApplied }: UseEditorChangesProps) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setVersion(v => v + 1);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("local_draft_changed", handleUpdate);
      window.addEventListener("storySettingsUpdated", handleUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("local_draft_changed", handleUpdate);
        window.removeEventListener("storySettingsUpdated", handleUpdate);
      }
    };
  }, []);

  const hasHeroChanges = useMemo(() => hasChanged(settings.heroSettings, lastApplied.lastAppliedHero), [settings.heroSettings, lastApplied.lastAppliedHero, version]);
  const hasAboutHeroChanges = useMemo(() => hasChanged(settings.aboutHeroSettings, lastApplied.lastAppliedAboutHero), [settings.aboutHeroSettings, lastApplied.lastAppliedAboutHero, version]);
  const hasStoryChanges = useMemo(() => hasChanged(settings.storySettings, lastApplied.lastAppliedStory), [settings.storySettings, lastApplied.lastAppliedStory, version]);
  const hasTeamChanges = useMemo(() => hasChanged(settings.teamSettings, lastApplied.lastAppliedTeam), [settings.teamSettings, lastApplied.lastAppliedTeam, version]);
  const hasTestimonialsChanges = useMemo(() => hasChanged(settings.testimonialsSettings, lastApplied.lastAppliedTestimonials), [settings.testimonialsSettings, lastApplied.lastAppliedTestimonials, version]);
  const hasFontChanges = useMemo(() => hasChanged(settings.fontSettings, lastApplied.lastAppliedFont), [settings.fontSettings, lastApplied.lastAppliedFont, version]);
  const hasColorChanges = useMemo(() => hasChanged(settings.colorSettings, lastApplied.lastAppliedColor), [settings.colorSettings, lastApplied.lastAppliedColor, version]);
  const hasServicesChanges = useMemo(() => hasChanged(settings.servicesSettings, lastApplied.lastAppliedServices), [settings.servicesSettings, lastApplied.lastAppliedServices, version]);
  const hasHomeValuesChanges = useMemo(() => hasChanged(settings.homeValuesSettings, lastApplied.lastAppliedHomeValues), [settings.homeValuesSettings, lastApplied.lastAppliedHomeValues, version]);
  const hasAboutUsValuesChanges = useMemo(() => hasChanged(settings.aboutUsValuesSettings, lastApplied.lastAppliedAboutUsValues), [settings.aboutUsValuesSettings, lastApplied.lastAppliedAboutUsValues, version]);
  const hasGalleryChanges = useMemo(() => hasChanged(settings.gallerySettings, lastApplied.lastAppliedGallery), [settings.gallerySettings, lastApplied.lastAppliedGallery, version]);
  const hasGalleryPageChanges = useMemo(() => hasChanged(settings.galleryPageSettings, lastApplied.lastAppliedGalleryPage), [settings.galleryPageSettings, lastApplied.lastAppliedGalleryPage, version]);
  const hasCTAChanges = useMemo(() => hasChanged(settings.ctaSettings, lastApplied.lastAppliedCTA), [settings.ctaSettings, lastApplied.lastAppliedCTA, version]);
  const hasHeaderChanges = useMemo(() => hasChanged(settings.headerSettings, lastApplied.lastAppliedHeader), [settings.headerSettings, lastApplied.lastAppliedHeader, version]);
  const hasFooterChanges = useMemo(() => hasChanged(settings.footerSettings, lastApplied.lastAppliedFooter), [settings.footerSettings, lastApplied.lastAppliedFooter, version]);
  
  const hasBookingServiceChanges = useMemo(() => hasChanged(settings.bookingServiceSettings, lastApplied.lastAppliedBookingService), [settings.bookingServiceSettings, lastApplied.lastAppliedBookingService, version]);
  const hasBookingDateChanges = useMemo(() => hasChanged(settings.bookingDateSettings, lastApplied.lastAppliedBookingDate), [settings.bookingDateSettings, lastApplied.lastAppliedBookingDate, version]);
  const hasBookingTimeChanges = useMemo(() => hasChanged(settings.bookingTimeSettings, lastApplied.lastAppliedBookingTime), [settings.bookingTimeSettings, lastApplied.lastAppliedBookingTime, version]);
  const hasBookingFormChanges = useMemo(() => hasChanged(settings.bookingFormSettings, lastApplied.lastAppliedBookingForm), [settings.bookingFormSettings, lastApplied.lastAppliedBookingForm, version]);
  const hasBookingConfirmationChanges = useMemo(() => hasChanged(settings.bookingConfirmationSettings, lastApplied.lastAppliedBookingConfirmation), [settings.bookingConfirmationSettings, lastApplied.lastAppliedBookingConfirmation, version]);

  return {
    hasHeroChanges,
    hasAboutHeroChanges,
    hasStoryChanges,
    hasTeamChanges,
    hasTestimonialsChanges,
    hasFontChanges,
    hasColorChanges,
    hasServicesChanges,
    hasHomeValuesChanges,
    hasAboutUsValuesChanges,
    hasGalleryChanges,
    hasGalleryPageChanges,
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
