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
import { SectionBackground } from "@/components/admin/site_editor/components/SectionBackground";
import { SessionWrapper } from "@/components/admin/site_editor/components/SessionWrapper";
import type { SiteConfigData } from "@/components/admin/site_editor/hooks/use-site-editor";
import { Card, CardContent } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import {
  getServicesSettings,
  getSettingsFromStorage,
  type Service,
  type ServicesSettings,
  sanitizeColor,
} from "@/lib/booking-data";
import { cn, renderSafeText } from "@/lib/utils";

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
  const { studio, isLoading } = useStudio();
  const [isMounted, setIsMounted] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<ServicesSettings | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const studioId = studio?.id;
  const studioConfig = studio?.config;

  // Debug log para ver a estrutura do config que chega no site público
  useEffect(() => {
    if (studioConfig) {
      console.log(">>> [SERVICES_RENDER_DEBUG] Config recebida:", studioConfig);
    }
  }, [studioConfig]);

  const loadData = useCallback(
    (forceRevalidate = false) => {
      // Tenta pegar do cache primeiro para ser instantâneo
      const cachedStudioStr = localStorage.getItem("studio_data");
      const settings = getSettingsFromStorage();

      let currentServices: Service[] = [];
      let currentConfig: SiteConfigData | null = null;

      // Se forceRevalidate for true, ignoramos o cache de configurações locais e usamos o context/API
      const useCache = !forceRevalidate;

      // 1. Prioridade para studioSettings (onde o ServicesManager salva)
      if (
        useCache &&
        settings &&
        settings.services &&
        settings.services.length > 0
      ) {
        currentServices = settings.services;
      }

      // 2. Context do studio (Dados vindos da API/Backend)
      if (studioId) {
        if (currentServices.length === 0) {
          currentServices = studio?.services || [];
        }
        currentConfig = studioConfig as SiteConfigData;
      }

      // 3. Se ainda não encontrou, tenta o studio_data legado (Cache do Browser)
      if (useCache && currentServices.length === 0 && cachedStudioStr) {
        try {
          const parsed = JSON.parse(cachedStudioStr);
          currentServices = parsed.services || [];
          if (!currentConfig) currentConfig = parsed.config;
        } catch (e) {
          console.warn(
            ">>> [SITE_WARN] Erro ao parsear studio_data do cache",
            e,
          );
        }
      }

      // Normaliza todos os serviços para garantir que showOnHome seja boolean
      const normalizedServices = currentServices.map((s: Service) => {
        const isShowOnHome =
          s.showOnHome === true ||
          s.show_on_home === true ||
          s.showOnHome === "true" ||
          s.show_on_home === "true" ||
          s.showOnHome === 1 ||
          s.show_on_home === 1;
        return {
          ...s,
          showOnHome: isShowOnHome,
        };
      });

      // Filtra apenas os serviços marcados para home
      const homeServices = normalizedServices.filter(
        (s: Service) => s?.showOnHome === true,
      );

      const layoutGlobal = (currentConfig?.layoutGlobal || currentConfig?.layout_global) as Record<string, unknown> | undefined;
      
      // No site em produção, priorizamos home.servicesSection se existir
      const home = currentConfig?.home as Record<string, unknown> | undefined;
      const homeServicesSection = (home?.servicesSection ||
        home?.services_section) as Record<string, unknown> | undefined;

      const configServices = (homeServicesSection ||
        home?.services ||
        currentConfig?.services ||
        layoutGlobal?.services) as Record<string, unknown> | undefined;

      let finalConfigServices: ServicesSettings | undefined;
      if (configServices) {
        const content = (configServices.content as Record<string, unknown>) || {};
        const appearance =
          (configServices.appearance as Record<string, unknown>) || {};
        
        // MAPEAMENTO PLANO: Prioriza a raiz (que vem do banco) sobre content/appearance
        finalConfigServices = {
          ...configServices,
          ...content,
          ...appearance,
          title: (configServices.title as string) || (content.title as string),
          subtitle: (configServices.subtitle as string) || (content.subtitle as string),
          titleColor: sanitizeColor(
            (configServices.titleColor as string) ||
            (appearance.titleColor as string) ||
            (content.titleColor as string)
          ),
          subtitleColor: sanitizeColor(
            (configServices.subtitleColor as string) ||
            (appearance.subtitleColor as string) ||
            (content.subtitleColor as string)
          ),
          titleFont:
            (configServices.titleFont as string) ||
            (appearance.titleFont as string) ||
            (content.titleFont as string),
          subtitleFont:
            (configServices.subtitleFont as string) ||
            (appearance.subtitleFont as string) ||
            (content.subtitleFont as string),
          cardBgColor: sanitizeColor(
            (configServices.cardBgColor as string) ||
            (appearance.cardBgColor as string) ||
            (content.cardBgColor as string)
          ),
          cardTitleColor: sanitizeColor(
            (configServices.cardTitleColor as string) ||
            (appearance.cardTitleColor as string) ||
            (content.cardTitleColor as string)
          ),
          cardDescriptionColor: sanitizeColor(
            (configServices.cardDescriptionColor as string) ||
            (appearance.cardDescriptionColor as string) ||
            (content.cardDescriptionColor as string)
          ),
          cardPriceColor: sanitizeColor(
            (configServices.cardPriceColor as string) ||
            (appearance.cardPriceColor as string) ||
            (content.cardPriceColor as string)
          ),
          cardIconColor: sanitizeColor(
            (configServices.cardIconColor as string) ||
            (appearance.cardIconColor as string) ||
            (content.cardIconColor as string)
          ),
          cardTitleFont:
            (configServices.cardTitleFont as string) ||
            (appearance.cardTitleFont as string) ||
            (content.cardTitleFont as string),
          cardDescriptionFont:
            (configServices.cardDescriptionFont as string) ||
            (appearance.cardDescriptionFont as string) ||
            (content.cardDescriptionFont as string),
          cardPriceFont:
            (configServices.cardPriceFont as string) ||
            (appearance.cardPriceFont as string) ||
            (content.cardPriceFont as string),
          bgImage:
            (configServices.bgImage as string) ||
            (appearance.backgroundImageUrl as string) ||
            "",
          bgColor: sanitizeColor(
            (configServices.bgColor as string) ||
            (configServices.backgroundColor as string) ||
            (appearance.backgroundColor as string) ||
            "",
          ),
        } as unknown as ServicesSettings;
      }
      
      setServices(homeServices);
      if (finalConfigServices) {
        setSettings(finalConfigServices);
      } else {
        setSettings(getServicesSettings());
      }
    },
    [studioId, studioConfig, studio?.services],
  );

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
    window.addEventListener("servicesSettingsUpdated", () => loadData(true));
    window.addEventListener("DataReady", () => loadData());

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("servicesSettingsUpdated", () =>
        loadData(true),
      );
      window.removeEventListener("DataReady", () => loadData());
    };
  }, [loadData]);

  // Fallback Skeleton enquanto carrega do banco
  if (!isMounted || isLoading) {
    return (
      <section id="services" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="h-10 w-64 bg-gray-200 animate-pulse mx-auto mb-4 rounded"></div>
          <div className="h-6 w-96 bg-gray-200 animate-pulse mx-auto mb-12 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!settings) return null;

  const backgroundUrl =
    settings.bgImage || settings.appearance?.backgroundImageUrl;
  const hasImage = !!backgroundUrl && backgroundUrl.trim() !== "";
  const effectiveOverlayOpacity =
    settings.appearance?.overlay?.opacity ??
    (backgroundUrl ? 0 : settings.overlayOpacity);
  const effectiveImageOpacity =
    backgroundUrl && !settings.appearance?.overlay ? 1 : settings.imageOpacity;
  const effectiveBackgroundColor =
    settings.appearance?.backgroundColor || settings.bgColor || "#ffffff";

  return (
    <SessionWrapper appearance={settings?.appearance}>
      <section
        id="services"
        className={cn(
          "relative py-20 md:py-32 transition-all duration-500 overflow-hidden",
          highlightedElement === "services" &&
            "ring-8 ring-inset ring-primary/30 bg-primary/5",
        )}
      >
      <SectionBackground
        settings={{
          ...settings,
          bgType: (settings.bgType === "color" || !hasImage
            ? "color"
            : "image") as "color" | "image",
          bgColor: effectiveBackgroundColor,
          bgImage: backgroundUrl || "",
          imageOpacity: effectiveImageOpacity,
          overlayOpacity: effectiveOverlayOpacity,
          appearance: {
            ...settings.appearance,
            backgroundColor: effectiveBackgroundColor,
          },
        }}
        defaultImage=""
      />

      <div className="container relative z-10 mx-auto px-4">
        {(settings.showTitle !== false || settings.showSubtitle !== false) && (
          <div className="text-center mb-16">
            {settings.showTitle !== false && (
              <h2
                className="text-4xl md:text-5xl font-bold mb-4 text-balance transition-all duration-300"
                style={{
                  color: settings.titleColor || "var(--foreground)",
                  fontFamily: settings.titleFont || "var(--font-title)",
                }}
              >
                {renderSafeText(settings.title)}
              </h2>
            )}
            {settings.showSubtitle !== false && (
              <p
                className="text-lg max-w-2xl mx-auto text-pretty leading-relaxed transition-all duration-300"
                style={{
                  color: settings.subtitleColor || "var(--foreground)",
                  fontFamily: settings.subtitleFont || "var(--font-subtitle)",
                }}
              >
                {renderSafeText(settings.subtitle)}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services?.map((service: Service, index: number) => {
            // Usa o ícone definido no serviço ou tenta inferir pelo nome
            let Icon = Sparkles;

            if (service?.icon && iconMap[service.icon]) {
              Icon = iconMap[service.icon];
            } else {
              const name = renderSafeText(service?.name).toLowerCase() || "";
              if (name.includes("design")) Icon = Scissors;
              else if (name.includes("color") || name.includes("henna"))
                Icon = Palette;
              else if (name.includes("lamina")) Icon = Star;
            }

            return (
              <Card
                key={
                  service?.id ? `${service.id}-${index}` : `service-${index}`
                }
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
                    {renderSafeText(service?.name)}
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
                    {renderSafeText(service?.description)}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className="font-bold text-lg"
                      style={{
                        color: settings?.cardPriceColor || "var(--primary)",
                      }}
                    >
                      R$ {renderSafeText(service?.price)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {renderSafeText(service?.duration)} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
    </SessionWrapper>
  );
}
