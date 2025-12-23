"use client";

import { Palette, Scissors, Sparkles, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getSettingsFromStorage, type Service } from "@/lib/booking-data";

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);

  const loadServices = useCallback(() => {
    const settings = getSettingsFromStorage();
    const homeServices = settings.services.filter((s: Service) => s.showOnHome);
    setServices(homeServices);
  }, []);

  useEffect(() => {
    loadServices();

    window.addEventListener("studioSettingsUpdated", loadServices);
    return () => {
      window.removeEventListener("studioSettingsUpdated", loadServices);
    };
  }, [loadServices]);

  if (services.length === 0) return null;

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-balance">
            Nossos Serviços
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Oferecemos uma variedade de tratamentos especializados para realçar
            sua beleza
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            // Lógica simples para escolher ícone baseado no nome
            let Icon = Sparkles;
            const name = service.name.toLowerCase();
            if (name.includes("design")) Icon = Scissors;
            else if (name.includes("color") || name.includes("henna"))
              Icon = Palette;
            else if (name.includes("lamina")) Icon = Star;

            return (
              <Card
                key={service.id}
                className="border-border hover:border-accent transition-colors"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <p className="text-accent font-semibold">
                    A partir de R$ {service.price.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
