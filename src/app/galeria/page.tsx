"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GalleryGrid } from "@/components/gallery-grid";
import { getPageVisibility, getVisibleSections } from "@/lib/booking-data";

export default function GaleriaPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ only?: string }>;
}) {
  const router = useRouter();
  const [only, setOnly] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean | null>(null);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Resolver searchParams
    searchParamsPromise.then((params) => {
      setOnly(params.only || null);
    });

    // Verificar visibilidade
    const checkVisibility = (visibility: Record<string, boolean>) => {
      if (visibility.galeria === false) {
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
  }, [searchParamsPromise, router]);

  if (isVisible === false) return null;
  if (isVisible === null) return null; // Loading state

  const isSectionVisible = (id: string) => {
    if (only) return only === id;
    return visibleSections[id] !== false;
  };

  return (
    <main>
      {isSectionVisible("gallery-grid") && (
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 text-balance">
                Nossa Galeria
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                Confira alguns dos nossos trabalhos e veja a transformação que
                podemos fazer por você
              </p>
            </div>

            <GalleryGrid />
          </div>
        </section>
      )}
    </main>
  );
}
