"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { BookingFlow } from "@/components/booking-flow";
import { getPageVisibility } from "@/lib/booking-data";

export default function AgendamentoPage({
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
    if (visibility.agendar === false) {
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
      {(!only || only === "booking") && (
        <section className="py-20 md:py-32 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 text-balance">
                Agende Seu Horário
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                Escolha o serviço, data e horário que melhor se encaixam na sua
                rotina
              </p>
            </div>

            <BookingFlow />
          </div>
        </section>
      )}
    </main>
  );
}
