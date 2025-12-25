"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { AboutHero } from "@/components/about-hero";
import { StorySection } from "@/components/story-section";
import { TeamSection } from "@/components/team-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { ValuesSection } from "@/components/values-section";
import { getPageVisibility } from "@/lib/booking-data";

export default function SobrePage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ only?: string }>;
}) {
  const router = useRouter();
  const searchParams = use(searchParamsPromise);
  const only = searchParams.only;
  const [isVisible, setIsVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const visibility = getPageVisibility();
    if (visibility.sobre === false) {
      setIsVisible(false);
      router.push("/");
    } else {
      setIsVisible(true);
    }
  }, [router]);

  if (isVisible === false) return null;
  if (isVisible === null) return null;

  return (
    <main>
      {(!only || only === "about-hero") && <AboutHero />}
      {(!only || only === "story") && <StorySection />}
      {(!only || only === "values") && <ValuesSection />}
      {!only && (
        <>
          <TeamSection />
          <TestimonialsSection />
        </>
      )}
    </main>
  );
}
