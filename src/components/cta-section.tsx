"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getPageVisibility } from "@/lib/booking-data";

export function CTASection() {
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(
    () => getPageVisibility(),
  );

  useEffect(() => {
    const handleVisibilityUpdate = () => {
      setPageVisibility(getPageVisibility());
    };

    window.addEventListener("pageVisibilityUpdated", handleVisibilityUpdate);

    return () => {
      window.removeEventListener(
        "pageVisibilityUpdated",
        handleVisibilityUpdate,
      );
    };
  }, []);

  if (pageVisibility.agendar === false) return null;

  return (
    <section id="cta" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-linear-to-br from-accent/10 to-primary/10 rounded-2xl p-8 md:p-16 text-center border border-accent/20">
          <Calendar className="w-16 h-16 text-accent mx-auto mb-6" />
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-balance">
            Pronta Para Transformar Seu Olhar?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty leading-relaxed max-w-2xl mx-auto">
            Agende seu horário agora e descubra como sobrancelhas bem feitas
            podem realçar toda sua beleza
          </p>
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8"
          >
            <Link href="/agendamento">Agendar Agora</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
