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
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { SectionBackground } from "@/components/admin/site_editor/components/SectionBackground";
import type { SiteConfigData } from "@/components/admin/site_editor/hooks/use-site-editor";
import { Card, CardContent } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import {
  getServicesSettings,
  getSettingsFromStorage,
  SECTION_IDS,
  type Service,
  type ServicesSettings,
  sanitizeColor,
  sanitizeSection,
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

const MOCK_SERVICES: Service[] = [
  {
    id: "mock-1",
    name: "Corte de Cabelo Premium",
    description:
      "Corte moderno realizado com visagismo para realçar seu rosto.",
    price: 60,
    duration: 45,
    icon: "Scissors",
    showOnHome: true,
  },
  {
    id: "mock-2",
    name: "Barba com Toalha Quente",
    description: "Experiência relaxante com hidratação e alinhamento completo.",
    price: 40,
    duration: 30,
    icon: "Smile",
    showOnHome: true,
  },
  {
    id: "mock-3",
    name: "Combo Completo",
    description: "Cabelo, barba e sobrancelha com finalização exclusiva.",
    price: 90,
    duration: 90,
    icon: "Sparkles",
    showOnHome: true,
  },
  {
    id: "mock-4",
    name: "Sobrancelha Design",
    description: "Limpeza e design de sobrancelhas com pinça ou cera.",
    price: 25,
    duration: 20,
    icon: "Star",
    showOnHome: true,
  },
];

export function ServicesSection() {
  const { studio, isLoading } = useStudio();
  const [isMounted, setIsMounted] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  // Determina quais serviços deverão ser mostrados na Home
  const displayedServices = useMemo(() => {
    // Primeiro tenta usar serviços explicitamente marcados
    const marked = services?.filter((s) => s.showOnHome);
    if (marked?.length) {
      // Se houver serviços marcados, exibe todos (permite mais de 4)
      return marked;
    }
    // Caso nenhum serviço esteja marcado, seleciona até 4 aleatórios
    const list = [...services];
    // Embaralha (Fisher‑Yates)
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    // Marca os aleatórios como exibidos (não persiste)
    const randomSelection = list.slice(0, 4).map(s => ({ ...s, showOnHome: true }));
    return randomSelection;
  }, [services]);
  // Não retorna mais null; a seção será exibida com até 4 serviços.

  const [settings, setSettings] = useState<ServicesSettings | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const studioId = studio?.id;
  const studioConfig = studio?.config;
  const isInsideIframe =
    typeof window !== "undefined" && window.parent !== window;
  const hasLivePreviewUpdateRef = useRef(false);

  const normalizeConfigServices = useCallback(
    (configServices: Record<string, unknown>): ServicesSettings => {
      // 1. Sanitizar primeiro para tirar lixo de configurações antigas e priorizar o novo
      // Usamos getServicesSettings() como fallback para preencher o que faltar (campos padrão)
      const sanitized = sanitizeSection(configServices, getServicesSettings());

      const content = (sanitized.content as Record<string, unknown>) || {};
      const appearance =
        (sanitized.appearance as Record<string, unknown>) || {};
      const itemsStyle =
        (sanitized.itemsStyle as Record<string, unknown>) || {};

      const pickFirstDefined = (...values: unknown[]) =>
        values.find((value) => value !== undefined && value !== null);

      const rawBgImage = ((sanitized.bgImage as string) ||
        (appearance.backgroundImageUrl as string) ||
        "") as string;
      const hasBgImage = rawBgImage.trim().length > 0;
      const rawBgType = pickFirstDefined(sanitized.bgType, appearance.bgType);
      const resolvedBgType =
        rawBgType === "color" || rawBgType === "image"
          ? rawBgType
          : hasBgImage
            ? "image"
            : "color";

      const rawBgColor = pickFirstDefined(
        sanitized.bgColor,
        sanitized.backgroundColor,
        appearance.backgroundColor,
        appearance.bgColor,
      );

      const normalizedBgColor =
        resolvedBgType === "color"
          ? sanitizeColor(rawBgColor) || ""
          : sanitizeColor(
              (rawBgColor as string) || (appearance.backgroundColor as string),
            ) || "";

      // PILAR: Unificação e Robustez
      // Começamos com um merge de tudo para não perder nenhuma propriedade nova (passthrough)
      const merged = {
        ...(appearance && typeof appearance === "object" ? appearance : {}),
        ...(content && typeof content === "object" ? content : {}),
        ...(itemsStyle && typeof itemsStyle === "object" ? itemsStyle : {}),
        ...sanitized,
      };

      return {
        ...merged,
        title: (sanitized.title as string) || (content.title as string),
        subtitle:
          (sanitized.subtitle as string) || (content.subtitle as string),
        titleColor: sanitizeColor(
          (sanitized.titleColor as string) ||
            (appearance.titleColor as string) ||
            (content.titleColor as string),
        ),
        subtitleColor: sanitizeColor(
          (sanitized.subtitleColor as string) ||
            (appearance.subtitleColor as string) ||
            (content.subtitleColor as string),
        ),
        cardBgColor: sanitizeColor(
          (sanitized.cardBgColor as string) ||
            (sanitized.cardBackgroundColor as string) ||
            (sanitized.card_background_color as string) ||
            (appearance.cardBgColor as string) ||
            (appearance.cardBackgroundColor as string) ||
            (content.cardBgColor as string) ||
            (itemsStyle.itemBackgroundColor as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.cardBgColor as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.cardBackgroundColor as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.backgroundColor as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.card_bg_color as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.background_color as string),
        ),
        cardTitleColor: sanitizeColor(
          (sanitized.cardTitleColor as string) ||
            (appearance.cardTitleColor as string) ||
            (content.cardTitleColor as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.cardTitleColor as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.titleColor as string),
        ),
        cardDescriptionColor: sanitizeColor(
          (sanitized.cardDescriptionColor as string) ||
            (appearance.cardDescriptionColor as string) ||
            (content.cardDescriptionColor as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.cardDescriptionColor as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.descriptionColor as string),
        ),
        cardPriceColor: sanitizeColor(
          (sanitized.cardPriceColor as string) ||
            (appearance.cardPriceColor as string) ||
            (content.cardPriceColor as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.cardPriceColor as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.priceColor as string),
        ),
        cardIconColor: sanitizeColor(
          (sanitized.cardIconColor as string) ||
            (appearance.cardIconColor as string) ||
            (content.cardIconColor as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.cardIconColor as string) ||
            ((sanitized.cardConfig as Record<string, unknown>)
              ?.iconColor as string),
        ),
        buttonShape:
          (sanitized.buttonShape as "pill" | "square" | "sharp") ||
          (appearance.buttonShape as "pill" | "square" | "sharp") ||
          (content.buttonShape as "pill" | "square" | "sharp") ||
          (itemsStyle.buttonShape as "pill" | "square" | "sharp") ||
          "square",
        badgeShape:
          (sanitized.badgeShape as "pill" | "square" | "sharp") ||
          (appearance.badgeShape as "pill" | "square" | "sharp") ||
          (content.badgeShape as "pill" | "square" | "sharp") ||
          (itemsStyle.badgeShape as "pill" | "square" | "sharp") ||
          "square",
        bgImage: resolvedBgType === "image" ? rawBgImage : "",
        bgColor: normalizedBgColor,
        bgType: resolvedBgType,
        appearance: {
          ...appearance,
          backgroundColor: normalizedBgColor,
          backgroundImageUrl: resolvedBgType === "image" ? rawBgImage : "",
          overlay: {
            ...((appearance.overlay as Record<string, unknown>) || {}),
            color: (sanitized.overlayColor ||
              (appearance.overlay as Record<string, unknown>)?.color ||
              "") as string,
            opacity: Number(
              sanitized.overlayOpacity ??
                appearance.overlayOpacity ??
                (appearance.overlay as Record<string, unknown>)?.opacity ??
                0,
            ),
          },
        },
      } as ServicesSettings;
    },
    [],
  );

  const loadData = useCallback(
    (forceRevalidate = false) => {
      // Tenta pegar do cache primeiro para ser instantâneo
      const cachedStudioStr = localStorage.getItem("studio_data");
      const settingsFromStorage = getSettingsFromStorage();

      let currentServices: Service[] = [];
      let currentConfig: SiteConfigData | null = null;

      // Se forceRevalidate for true, ignoramos o cache de configurações locais e usamos o context/API
      const useCache = !forceRevalidate;

      if (isInsideIframe) {
        currentServices = MOCK_SERVICES;
        currentConfig = studioConfig as SiteConfigData;
      } else {
        // 1. Prioridade para studioSettings (onde o ServicesManager salva)
        if (
          useCache &&
          settingsFromStorage &&
          settingsFromStorage.services &&
          settingsFromStorage.services.length > 0
        ) {
          currentServices = settingsFromStorage.services;
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
      let homeServices: Service[] = normalizedServices.filter(
        (s: Service) => s?.showOnHome === true,
      );

      if (homeServices.length === 0 && normalizedServices.length > 0) {
        homeServices = normalizedServices;
      }

      const layoutGlobal = (currentConfig?.layoutGlobal ||
        currentConfig?.layout_global) as Record<string, unknown> | undefined;

      // No site em produção, priorizamos home.servicesSection se existir
      const home = currentConfig?.home as Record<string, unknown> | undefined;
      const homeServicesSection = (home?.servicesSection ||
        home?.services_section) as Record<string, unknown> | undefined;

      const configServices = ((currentConfig as any)?.sections?.[
        SECTION_IDS.homeServices
      ] ||
        homeServicesSection ||
        home?.services ||
        currentConfig?.services ||
        layoutGlobal?.servicesSection ||
        layoutGlobal?.services) as Record<string, unknown> | undefined;

      const finalConfigServices = configServices
        ? normalizeConfigServices(configServices)
        : undefined;

      setServices(homeServices);
      if (finalConfigServices) {
        setSettings(finalConfigServices);
      } else {
        setSettings(getServicesSettings());
      }
    },
    [
      normalizeConfigServices,
      studioId,
      studioConfig,
      studio?.services,
      isInsideIframe,
    ],
  );

  useEffect(() => {
    setIsMounted(true);
    loadData();

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type) {
        console.log(
          ">>> [RECEIVE_POST_MESSAGE]",
          event.data.type,
          event.data.settings || event.data.payload,
        );
      }

      if (event.data.type === "UPDATE_SERVICES_SETTINGS") {
        hasLivePreviewUpdateRef.current = true;
        const incoming = event.data.settings as
          | Record<string, unknown>
          | undefined;

        console.log(
          ">>> [ServicesSection] Recebido UPDATE_SERVICES_SETTINGS:",
          {
            incoming,
            bgColor: incoming?.bgColor,
            appearanceBg: (
              incoming?.appearance as Record<string, unknown> | undefined
            )?.backgroundColor,
          },
        );

        if (incoming) {
          const normalized = normalizeConfigServices(incoming);
          setSettings(normalized);
        }
      }

      if (event.data.type === "UPDATE_SITE_DATA" && event.data.data) {
        hasLivePreviewUpdateRef.current = true;
        const siteData = event.data.data as Record<string, unknown>;

        console.log(">>> [ServicesSection] Recebido UPDATE_SITE_DATA:", {
          hasServices: !!siteData.services,
          hasHome: !!siteData.home,
          hasLayout: !!siteData.layoutGlobal,
        });

        const layoutGlobal = (siteData.layoutGlobal ||
          siteData.layout_global) as Record<string, unknown> | undefined;
        const home = siteData.home as Record<string, unknown> | undefined;
        const homeServicesSection = (home?.servicesSection ||
          home?.services_section) as Record<string, unknown> | undefined;
        const sections = (siteData as any).sections as
          | Record<string, unknown>
          | undefined;
        const siteServices =
          sections?.[SECTION_IDS.homeServices] ||
          homeServicesSection ||
          (home?.services as Record<string, unknown> | undefined) ||
          (siteData.services as Record<string, unknown> | undefined) ||
          (layoutGlobal?.servicesSection as
            | Record<string, unknown>
            | undefined) ||
          (layoutGlobal?.services as Record<string, unknown> | undefined);
        const siteServicesRecord =
          siteServices &&
          typeof siteServices === "object" &&
          !Array.isArray(siteServices)
            ? (siteServices as Record<string, unknown>)
            : null;
        if (siteServicesRecord) {
          setSettings(normalizeConfigServices(siteServicesRecord));
        }
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === SECTION_IDS.homeServices
      ) {
        setHighlightedElement(SECTION_IDS.homeServices);
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    const handleServicesSettingsUpdated = () => loadData(true);
    const handleDataReady = () => {
      if (isInsideIframe && hasLivePreviewUpdateRef.current) {
        return;
      }
      loadData();
    };
    window.addEventListener("message", handleMessage);
    window.addEventListener(
      "servicesSettingsUpdated",
      handleServicesSettingsUpdated,
    );
    window.addEventListener("DataReady", handleDataReady);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(
        "servicesSettingsUpdated",
        handleServicesSettingsUpdated,
      );
      window.removeEventListener("DataReady", handleDataReady);
    };
  }, [isInsideIframe, loadData, normalizeConfigServices]);

  // Fallback Skeleton enquanto carrega do banco
  if (!isMounted || (isLoading && !isInsideIframe)) {
    return (
      <section id={SECTION_IDS.homeServices} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="h-10 w-64 bg-gray-200 animate-pulse mx-auto mb-4 rounded"></div>
          <div className="h-6 w-96 bg-gray-200 animate-pulse mx-auto mb-12 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-100 animate-pulse rounded-xl"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!settings) return null;

  const sectionBackgroundColor =
    sanitizeColor(settings.bgColor) ||
    sanitizeColor(settings.appearance?.backgroundColor) ||
    "var(--background)";
  const sectionUsesColorBackground = settings.bgType !== "image";

  console.log(">>> [IFRAME_RENDER]", {
    isInsideIframe,
    bgColor: settings.bgColor,
    appearanceBg: settings.appearance?.backgroundColor,
    bgType: settings.bgType,
  });

  return (
    <section
      id={SECTION_IDS.homeServices}
      className={cn(
        "relative isolate py-20 md:py-32 transition-all duration-500 overflow-hidden",
        highlightedElement === SECTION_IDS.homeServices &&
          "ring-8 ring-inset ring-primary/30 bg-primary/5",
      )}
      style={{
        backgroundColor: sectionUsesColorBackground
          ? sectionBackgroundColor
          : undefined,
        backgroundImage: sectionUsesColorBackground ? "none" : undefined,
      }}
    >
      <SectionBackground settings={settings} className="z-0" />

      <div className="container relative z-10 mx-auto px-4">
        {(settings.showTitle !== false || settings.showSubtitle !== false) && (
          <div className="text-center mb-16">
            {settings.showTitle !== false && (
              <h2
                className="text-4xl md:text-5xl font-bold mb-4 text-balance transition-all duration-300"
                style={{
                  color: settings.titleColor || "var(--foreground)",
                  fontFamily: settings.titleFont
                    ? `"${settings.titleFont}", sans-serif`
                    : "var(--font-title)",
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
                  fontFamily: settings.subtitleFont
                    ? `"${settings.subtitleFont}", sans-serif`
                    : "var(--font-subtitle)",
                }}
              >
                {renderSafeText(settings.subtitle)}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedServices?.map((service: Service, index: number) => {
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
                className={cn(
                  "border-border hover:border-accent transition-all duration-300 overflow-hidden",
                  !settings?.cardBgColor && "bg-card",
                  settings.buttonShape === "pill" && "rounded-3xl",
                  settings.buttonShape === "square" && "rounded-xl",
                  settings.buttonShape === "sharp" && "rounded-none",
                )}
                style={{
                  backgroundColor: settings?.cardBgColor || undefined,
                  borderRadius: settings?.cardBorderRadius || "0.75rem",
                  borderWidth: settings?.cardBorderWidth || "1px",
                  borderColor: settings?.cardBorderColor || "var(--border)",
                }}
              >
                <CardContent className="p-6">
                  <div
                    className={cn(
                      "w-12 h-12 flex items-center justify-center mb-4 transition-all duration-300",
                      settings.badgeShape === "pill" && "rounded-full",
                      settings.badgeShape === "square" && "rounded-lg",
                      settings.badgeShape === "sharp" && "rounded-none",
                    )}
                    style={{
                      backgroundColor: settings?.cardIconColor
                        ? settings.cardIconColor.startsWith("#")
                          ? `${settings.cardIconColor}1a`
                          : settings.cardIconColor.startsWith("rgb")
                            ? settings.cardIconColor
                                .replace("rgb", "rgba")
                                .replace(")", ", 0.1)")
                            : "var(--primary-muted, rgba(0, 0, 0, 0.05))"
                        : "var(--primary-muted, rgba(0, 0, 0, 0.05))",
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
                      color:
                        settings?.cardTitleColor ||
                        "var(--card-foreground, var(--foreground))",
                      fontFamily: settings?.cardTitleFont
                        ? `"${settings.cardTitleFont}", sans-serif`
                        : "var(--font-subtitle)",
                    }}
                  >
                    {renderSafeText(service?.name) || "Serviço sem nome"}
                  </h3>
                  <p
                    className="text-sm mb-4 leading-relaxed opacity-80"
                    style={{
                      color:
                        settings?.cardDescriptionColor ||
                        "var(--card-foreground, var(--foreground))",
                      fontFamily: settings?.cardDescriptionFont
                        ? `"${settings.cardDescriptionFont}", sans-serif`
                        : "var(--font-text)",
                    }}
                  >
                    {renderSafeText(service?.description) ||
                      "Sem descrição disponível"}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className="font-bold text-lg"
                      style={{
                        color: settings?.cardPriceColor || "var(--primary)",
                        fontFamily: settings?.cardPriceFont
                          ? `"${settings.cardPriceFont}", sans-serif`
                          : "inherit",
                      }}
                    >
                      R$ {renderSafeText(service?.price) || "0,00"}
                    </span>
                    <span
                      className="text-xs opacity-70"
                      style={{
                        color:
                          settings?.cardDescriptionColor ||
                          "var(--muted-foreground)",
                      }}
                    >
                      {renderSafeText(service?.duration) || "0"} min
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
