"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { AboutHero } from "@/components/about-hero";
import { StorySection } from "@/components/story-section";
import { TeamSection } from "@/components/team-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { ValuesSection } from "@/components/values-section";
import { getPageVisibility, getVisibleSections } from "@/lib/booking-data";

export default function SobrePage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ only?: string }>;
}) {
  const router = useRouter();
  const searchParams = use(searchParamsPromise);
  const only = searchParams.only;
  const [isVisible, setIsVisible] = useState<boolean | null>(null);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [isolatedSection, setIsolatedSection] = useState<string | null>(only || null);

  useEffect(() => {
    setIsolatedSection(only || null);
  }, [only]);

  useEffect(() => {
    const checkVisibility = (visibility: Record<string, boolean>) => {
      if (visibility.sobre === false) {
        setIsVisible(false);
        router.push("/");
      } else {
        setIsVisible(true);
      }
    };

    const initialVisibility = getPageVisibility();
    checkVisibility(initialVisibility);
    setVisibleSections(getVisibleSections());

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_PAGE_VISIBILITY") {
        checkVisibility(event.data.visibility);
      }
      if (event.data?.type === "UPDATE_VISIBLE_SECTIONS") {
        setVisibleSections(event.data.sections);
      }
      if (event.data?.type === "SET_ISOLATED_SECTION") {
        setIsolatedSection(event.data.sectionId);
      }
    };

    const handleSectionsUpdate = () => {
      setVisibleSections(getVisibleSections());
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("visibleSectionsUpdated", handleSectionsUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("visibleSectionsUpdated", handleSectionsUpdate);
    };
  }, [router]);

  const isSectionVisible = (sectionId: string) => {
    if (isolatedSection) return isolatedSection === sectionId;
    return visibleSections[sectionId] !== false;
  };

  if (isVisible === null) return null;
  if (!isVisible) return null;

  return (
    <main>
      {isSectionVisible("about-hero") && <AboutHero />}
      {isSectionVisible("story") && <StorySection />}
      {isSectionVisible("values") && <ValuesSection />}
      {isSectionVisible("team") && <TeamSection />}
      {isSectionVisible("testimonials") && <TestimonialsSection />}
    </main>
  );
}
