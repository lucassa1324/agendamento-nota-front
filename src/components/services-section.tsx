"use client";

import {
  Award,
  Briefcase,
  Brush,
  Camera,
  Car,
  Code,
  Coffee,
  Crown,
  Dumbbell,
  Flower2,
  Gem,
  Heart,
  Laptop,
  type LucideIcon,
  Medal,
  Moon,
  Music,
  Palette,
  Plane,
  Scissors,
  ShoppingBag,
  Smartphone,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Users,
  Utensils,
  Wind,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import {
  getServicesSettings,
  getSettingsFromStorage,
  type Service,
  type ServicesSettings,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Scissors,
  Palette,
  Star,
  Award,
  Crown,
  Flower2,
  Gem,
  Heart,
  Moon,
  Smile,
  Sun,
  Users,
  Medal,
  Briefcase,
  Coffee,
  Utensils,
  Laptop,
  Smartphone,
  Camera,
  Music,
  Dumbbell,
  Plane,
  Car,
  ShoppingBag,
  Stethoscope,
  Code,
  Brush,
  Wind,
};

export function ServicesSection() {
  const { studio } = useStudio();
  const [isMounted, setIsMounted] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<ServicesSettings | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const loadData = useCallback(() => {
    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    if (studio) {
      const homeServices = (studio?.services || []).filter(
        (s: Service) => s?.showOnHome,
      );
      setServices(homeServices);

      const configServices = studio?.config?.services as
        | ServicesSettings
        | undefined;
      setSettings(configServices || getServicesSettings());
      return;
    }

    const studioSettings = getSettingsFromStorage();
    if (studioSettings?.services) {
      const homeServices = studioSettings?.services?.filter(
        (s: Service) => s?.showOnHome,
      );
      setServices(homeServices || []);
    }
    setSettings(getServicesSettings());
  }, [studio]);

  useEffect(() => {
    setIsMounted(true);
    loadData();

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_SERVICES_SETTINGS") {
        setSettings((prev) =>
          prev ? { ...prev, ...event.data.settings } : prev,
        );
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === "services"
      ) {
        setHighlightedElement("services");
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("studioSettingsUpdated", loadData);
    window.addEventListener("servicesSettingsUpdated", loadData);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("studioSettingsUpdated", loadData);
      window.removeEventListener("servicesSettingsUpdated", loadData);
    };
  }, [loadData]);

  if (services.length === 0 || !settings) return null;

  if (!isMounted) {
    return (
      <section id="servicos" className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl font-bold mb-4">
            Nossos Serviços
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section
      id="services"
      className={cn(
        "relative py-20 md:py-32 transition-all duration-500 overflow-hidden",
        highlightedElement === "services" &&
          "ring-8 ring-inset ring-primary/30 bg-primary/5",
      )}
    >
      <SectionBackground settings={settings} />

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-balance transition-all duration-300"
            style={{
              color: settings.titleColor || "var(--foreground)",
              fontFamily: settings.titleFont || "var(--font-title)",
            }}
          >
            {settings.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto text-pretty leading-relaxed transition-all duration-300"
            style={{
              color: settings.subtitleColor || "var(--foreground)",
              fontFamily: settings.subtitleFont || "var(--font-subtitle)",
            }}
          >
            {settings.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services?.map((service: Service) => {
            // Usa o ícone definido no serviço ou tenta inferir pelo nome
            let Icon = Sparkles;

            if (service?.icon && iconMap[service.icon]) {
              Icon = iconMap[service.icon];
            } else {
              const name = service?.name?.toLowerCase() || "";
              if (name.includes("design")) Icon = Scissors;
              else if (name.includes("color") || name.includes("henna"))
                Icon = Palette;
              else if (name.includes("lamina")) Icon = Star;
            }

            return (
              <Card
                key={service?.id}
                className="border-border hover:border-accent transition-colors overflow-hidden"
                style={{
                  backgroundColor: settings?.cardBgColor || "transparent",
                }}
              >
                <CardContent className="p-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors"
                    style={{
                      backgroundColor: settings?.cardIconColor
                        ? `${settings.cardIconColor}1a`
                        : "var(--muted)",
                    }}
                  >
                    <Icon
                      className="w-6 h-6 transition-colors"
                      style={{
                        color: settings?.cardIconColor || "var(--primary)",
                      }}
                    />
                  </div>
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{
                      color: settings?.cardTitleColor || "var(--foreground)",
                      fontFamily:
                        settings?.cardTitleFont || "var(--font-subtitle)",
                    }}
                  >
                    {service?.name}
                  </h3>
                  <p
                    className="text-sm mb-4 leading-relaxed opacity-80"
                    style={{
                      color:
                        settings?.cardDescriptionColor || "var(--foreground)",
                      fontFamily:
                        settings?.cardDescriptionFont || "var(--font-body)",
                    }}
                  >
                    {service?.description}
                  </p>
                  <p
                    className="font-semibold"
                    style={{
                      color: settings?.cardPriceColor || "var(--primary)",
                      fontFamily: settings?.cardPriceFont || "var(--font-body)",
                    }}
                  >
                    A partir de R$ {service?.price?.toFixed(2) || "0,00"}
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
