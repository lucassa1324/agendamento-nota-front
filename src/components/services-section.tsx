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
import type { SiteConfigData } from "./admin/site_editor/hooks/use-site-editor";

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

  const loadData = useCallback((forceRevalidate = false) => {
    // Tenta pegar do cache primeiro para ser instantâneo
    const cachedStudioStr = localStorage.getItem("studio_data");
    const settings = getSettingsFromStorage();
    
    let currentServices: Service[] = [];
    let currentConfig: SiteConfigData | null = null;
    
    // Se forceRevalidate for true, ignoramos o cache de configurações locais e usamos o context/API
    const useCache = !forceRevalidate;

    // 1. Prioridade para studioSettings (onde o ServicesManager salva)
    if (useCache && settings && settings.services && settings.services.length > 0) {
      currentServices = settings.services;
    }

    // 2. Context do studio (Dados vindos da API/Backend)
    if (studio) {
      if (currentServices.length === 0) {
        currentServices = (studio.services || []);
      }
      currentConfig = studio.config as SiteConfigData;
    } 
    
    // 3. Se ainda não encontrou, tenta o studio_data legado (Cache do Browser)
    if (useCache && currentServices.length === 0 && cachedStudioStr) {
      try {
        const parsed = JSON.parse(cachedStudioStr);
        currentServices = (parsed.services || []);
        if (!currentConfig) currentConfig = parsed.config;
      } catch (e) {
        console.warn(">>> [SITE_WARN] Erro ao parsear studio_data do cache", e);
      }
    }

    // Normaliza todos os serviços para garantir que showOnHome seja boolean
    const normalizedServices = currentServices.map((s: Service) => {
      const isShowOnHome = s.showOnHome === true || 
                          s.show_on_home === true || 
                          s.showOnHome === "true" || 
                          s.show_on_home === "true" || 
                          s.showOnHome === 1 || 
                          s.show_on_home === 1;
      return {
        ...s,
        showOnHome: isShowOnHome
      };
    });

    // Filtra apenas os serviços marcados para home
    const homeServices = normalizedServices.filter((s: Service) => s?.showOnHome === true);
    
    const layoutGlobal = currentConfig?.layoutGlobal || currentConfig?.layout_global;
    const configServices = currentConfig?.services || layoutGlobal?.services;
    const finalSettings = configServices || getServicesSettings();

    console.log(">>> [SITE_SERVICES] Sincronizando Serviços:", {
      forceRevalidate,
      total_recebido: currentServices.length,
      filtrados_home: homeServices.length,
      slug_contexto: studio?.slug,
      tem_settings_cache: !!settings,
      nomes_na_home: homeServices.map(s => s.name)
    });

    console.log('>>> [SITE_DEBUG] Config recebida:', {
      cardBgColor: finalSettings.cardBgColor,
      cardIconColor: finalSettings.cardIconColor,
      cardTitleColor: finalSettings.cardTitleColor,
      cardDescriptionColor: finalSettings.cardDescriptionColor,
      hasLayoutGlobal: !!layoutGlobal,
      servicesFromLayout: !!layoutGlobal?.services
    });

    setServices(homeServices);
    setSettings(finalSettings);
  }, [studio]);

  useEffect(() => {
    setIsMounted(true);
    // Na primeira montagem no site oficial, forçamos a revalidação ignorando o cache local de settings
    const isPreview = typeof window !== "undefined" && window.location.search.includes("preview=true");
    loadData(!isPreview);

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

    const onSettingsUpdate = () => loadData();

    window.addEventListener("message", handleMessage);
    window.addEventListener("studioSettingsUpdated", onSettingsUpdate);
    window.addEventListener("servicesSettingsUpdated", onSettingsUpdate);
    window.addEventListener("servicesUpdated", onSettingsUpdate);
    window.addEventListener("DataReady", onSettingsUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("studioSettingsUpdated", onSettingsUpdate);
      window.removeEventListener("servicesSettingsUpdated", onSettingsUpdate);
      window.removeEventListener("servicesUpdated", onSettingsUpdate);
      window.removeEventListener("DataReady", onSettingsUpdate);
    };
  }, [loadData]);

  if (!isMounted) {
    return (
      <section id="services" className="py-24 bg-background animate-pulse">
        <div className="container mx-auto px-4 text-center">
          <div className="h-10 w-64 bg-muted mx-auto mb-4 rounded" />
          <div className="h-4 w-96 bg-muted mx-auto mb-12 rounded" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No editor (isPreview), permitimos renderizar mesmo sem serviços para o usuário poder configurar a seção
  const isPreview = typeof window !== "undefined" && window.location.search.includes("preview=true");

  // Se não houver serviços e não estivermos no editor, a seção não deve aparecer
  if (!isPreview && services.length === 0) return null;
  if (!settings) return null;

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
          {services?.map((service: Service, index: number) => {
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
                key={service?.id ? `${service.id}-${index}` : `service-${index}`}
                className="border-border hover:border-accent transition-all duration-300 overflow-hidden"
                style={{
                  backgroundColor: settings?.cardBgColor || "white",
                  borderRadius: settings?.cardBorderRadius || "0.75rem",
                  borderWidth: settings?.cardBorderWidth || "1px",
                  borderColor: settings?.cardBorderColor || "var(--border)",
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
                        settings?.cardDescriptionFont || "var(--font-text)",
                    }}
                  >
                    {service?.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className="font-bold text-lg"
                      style={{
                        color: settings?.cardPriceColor || "var(--primary)",
                      }}
                    >
                      R$ {service?.price}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {service?.duration} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
