"use client";

import { useRouter } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";
import { BookingFlow } from "@/components/booking-flow";
import { getPageVisibility, getVisibleSections } from "@/lib/booking-data";

export default function AgendamentoPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ only?: string; preview?: string }>;
}) {
  const router = useRouter();
  const searchParams = use(searchParamsPromise);
  const only = searchParams.only;
  const isPreview = searchParams.preview === "true";
  const [isVisible, setIsVisible] = useState<boolean | null>(null);
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});
  const [isolatedSection, setIsolatedSection] = useState<string | null>(
    only || null,
  );

  useEffect(() => {
    setIsolatedSection(only || null);
  }, [only]);

  useEffect(() => {
    const checkVisibility = (visibility: Record<string, boolean>) => {
      // Se estiver em modo preview, não redirecionamos mesmo que a página esteja desativada
      if (visibility.agendar === false && !isPreview) {
        setIsVisible(false);
        router.push("/");
      } else {
        setIsVisible(true);
      }
    };

    checkVisibility(getPageVisibility());
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
      window.removeEventListener(
        "visibleSectionsUpdated",
        handleSectionsUpdate,
      );
    };
  }, [router, isPreview]);

  if (isVisible === false) return null;
  if (isVisible === null) return null;

  const isSectionVisible = (id: string) => {
    if (isolatedSection) {
      // Se for o componente de booking, permitimos que ele apareça se qualquer um de seus passos estiver isolado
      if (id === "booking") {
        return (
          isolatedSection === "booking" ||
          isolatedSection.startsWith("booking-")
        );
      }
      return isolatedSection === id;
    }
    return visibleSections[id] !== false;
  };

  return (
    <main>
      {isSectionVisible("booking") && (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <BookingFlow />
        </Suspense>
      )}
    </main>
  );
}
