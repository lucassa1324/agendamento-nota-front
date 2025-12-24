"use client";

import { GalleryGrid } from "@/components/gallery-grid";
import { useEffect, useState } from "react";
import { getPageVisibility } from "@/lib/booking-data";
import { useRouter } from "next/navigation";

export default function GaleriaPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ only?: string }>;
}) {
  const router = useRouter();
  const [only, setOnly] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean | null>(null);

  useEffect(() => {
    // Resolver searchParams
    searchParamsPromise.then((params) => {
      setOnly(params.only || null);
    });

    // Verificar visibilidade
    const visibility = getPageVisibility();
    if (visibility.galeria === false) {
      setIsVisible(false);
      router.push("/");
    } else {
      setIsVisible(true);
    }
  }, [searchParamsPromise, router]);

  if (isVisible === false) return null;
  if (isVisible === null) return null; // Loading state

  return (
    <main>
      {(!only || only === "gallery-grid") && (
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
