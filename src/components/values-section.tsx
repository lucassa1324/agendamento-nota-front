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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import {
  type AppearanceSettings,
  getAboutUsValuesSettings,
  getHomeValuesSettings,
  SECTION_IDS,
  sanitizeColor,
  type ValueItem,
  type ValuesSettings,
} from "@/lib/booking-data";
import { cn, renderSafeText } from "@/lib/utils";
import {
  SectionBackground,
  type SectionBackgroundSettings,
} from "./admin/site_editor/components/SectionBackground";
import type { SiteConfigData } from "./admin/site_editor/hooks/use-site-editor";

const iconMap: Record<string, LucideIcon> = {
  Heart,
  Award,
  Users,
  Sparkles,
  Palette,
  Scissors,
  Star,
  Crown,
  Flower2,
  Gem,
  Moon,
  Smile,
  Sun,
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

export function ValuesSection({
  source = "home",
  settings: propSettings,
}: {
  source?: "home" | "about";
  settings?: ValuesSettings | null;
}) {
  const { studio, isLoading } = useStudio();
  const [isMounted, setIsMounted] = useState(false);
  const [liveSettings, setLiveSettings] = useState<ValuesSettings | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );
  const [isolatedSection, setIsolatedSection] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});
  const sectionId = source === "about" ? "about-values" : "home-values";

  const studioId = studio?.id;
  const studioConfig = studio?.config;
  const isInsideIframe =
    typeof window !== "undefined" && window.parent !== window;
  const hasLivePreviewUpdateRef = useRef(false);

  const normalizeValues = useCallback((rawValues: Record<string, unknown>) => {
    const content = (rawValues.content as Record<string, unknown>) || {};
    const appearance = (rawValues.appearance as AppearanceSettings) || {};
    const header = (rawValues.header as Record<string, unknown>) || {};
    const headerTitle = (header.title as Record<string, unknown>) || {};
    const headerSubtitle = (header.subtitle as Record<string, unknown>) || {};
    const itemsStyle =
      (rawValues.itemsStyle as Record<string, unknown>) ||
      (content.itemsStyle as Record<string, unknown>) ||
      {};

    // PADRONIZAÇÃO DE CHAVES (Solicitado pelo usuário)
    // Prioriza o nível superior (rawValues) antes de buscar fallbacks em appearance/itemsStyle
    const resolvedCardBgColor = sanitizeColor(
      (rawValues.cardBackgroundColor as string) ||
        (rawValues.cardBgColor as string) ||
        (rawValues.card_background_color as string) ||
        ((rawValues.cardConfig as Record<string, unknown>)
          ?.cardBackgroundColor as string) ||
        ((rawValues.cardConfig as Record<string, unknown>)
          ?.backgroundColor as string) ||
        (content.cardBgColor as string) ||
        (itemsStyle.itemBackgroundColor as string) ||
        (appearance.cardBgColor as string) ||
        ((appearance as Record<string, unknown>).cardBackgroundColor as string),
    );

    const resolvedSectionBgColor = sanitizeColor(
      (rawValues.about_values_bg as string) ||
        (rawValues.values_bg as string) ||
        (rawValues.backgroundColor as string) ||
        (rawValues.bgColor as string) ||
        ((rawValues.appearance as Record<string, unknown>)?.backgroundColor as
          | string
          | undefined) ||
        (rawValues.about_us_bg as string) ||
        (rawValues.about_us_values_bg as string) ||
        (rawValues.about_values_background as string) ||
        (appearance.backgroundColor as string) ||
        "transparent",
    );
    const explicitSectionBgColor = sanitizeColor(
      (rawValues.about_values_bg as string) ||
        (rawValues.values_bg as string) ||
        (rawValues.backgroundColor as string) ||
        (rawValues.bgColor as string) ||
        ((rawValues.appearance as Record<string, unknown>)?.backgroundColor as
          | string
          | undefined) ||
        (appearance.backgroundColor as string),
    );
    const resolvedBgType =
      explicitSectionBgColor ||
      sanitizeColor(
        (rawValues.appearance as Record<string, unknown>)?.bgColor as string,
      )
        ? "color"
        : (rawValues.bgType as string) ||
          (appearance.bgType as string) ||
          "color";
    const resolvedBgImage =
      resolvedBgType === "color"
        ? ""
        : (rawValues.bgImage as string) || appearance.backgroundImageUrl || "";

    const resolvedShowTitle =
      typeof rawValues.showTitle === "boolean"
        ? rawValues.showTitle
        : typeof content.showTitle === "boolean"
          ? content.showTitle
          : typeof appearance.showTitle === "boolean"
            ? appearance.showTitle
            : true;
    const resolvedShowSubtitle =
      typeof rawValues.showSubtitle === "boolean"
        ? rawValues.showSubtitle
        : typeof content.showSubtitle === "boolean"
          ? content.showSubtitle
          : typeof appearance.showSubtitle === "boolean"
            ? appearance.showSubtitle
            : true;

    const normalized = {
      ...(rawValues &&
      typeof rawValues === "object" &&
      !Array.isArray(rawValues)
        ? (rawValues as Record<string, unknown>)
        : {}),
      ...(content && typeof content === "object" && !Array.isArray(content)
        ? (content as Record<string, unknown>)
        : {}),
      ...(appearance &&
      typeof appearance === "object" &&
      !Array.isArray(appearance)
        ? (appearance as Record<string, unknown>)
        : {}),
      // EXTRAÇÃO DE HEADER E FALLBACKS (Solicitado pelo usuário)
      title:
        (rawValues.title as string) ||
        (content.title as string) ||
        (headerTitle.text as string) ||
        "",
      subtitle:
        (rawValues.subtitle as string) ||
        (content.subtitle as string) ||
        (headerSubtitle.text as string) ||
        "",
      // MAPEAMENTO DE ITENS (Suporte para .items ou .values)
      items: Array.isArray(rawValues.items)
        ? (rawValues.items as ValueItem[])
        : Array.isArray(content.items)
          ? (content.items as ValueItem[])
          : Array.isArray(rawValues.values)
            ? (rawValues.values as ValueItem[])
            : [],
      showTitle: resolvedShowTitle,
      showSubtitle: resolvedShowSubtitle,
      titleColor: sanitizeColor(
        (rawValues.titleColor as string) ||
          (appearance.titleColor as string) ||
          (content.titleColor as string),
      ),
      subtitleColor: sanitizeColor(
        (rawValues.subtitleColor as string) ||
          (appearance.subtitleColor as string) ||
          (content.subtitleColor as string),
      ),
      titleFont:
        (rawValues.titleFont as string) ||
        (appearance.titleFont as string) ||
        (content.titleFont as string),
      subtitleFont:
        (rawValues.subtitleFont as string) ||
        (appearance.subtitleFont as string) ||
        (content.subtitleFont as string),
      // PADRONIZAÇÃO FINAL DAS CHAVES DE COR
      cardBgColor: resolvedCardBgColor,
      cardBackgroundColor: resolvedCardBgColor,
      cardTitleColor: sanitizeColor(
        (rawValues.cardTitleColor as string) ||
          (appearance.cardTitleColor as string) ||
          (content.cardTitleColor as string),
      ),
      cardDescriptionColor: sanitizeColor(
        (rawValues.cardDescriptionColor as string) ||
          (appearance.cardDescriptionColor as string) ||
          (content.cardDescriptionColor as string),
      ),
      cardIconColor: sanitizeColor(
        (rawValues.cardIconColor as string) ||
          (rawValues.iconColor as string) ||
          (itemsStyle.itemIconColor as string) ||
          (appearance.cardIconColor as string) ||
          (content.cardIconColor as string),
      ),
      cardTextColor: sanitizeColor(
        (rawValues.cardTextColor as string) ||
          (content.cardTextColor as string),
      ),
      borderRadius:
        (rawValues.borderRadius as string) ||
        (appearance.cardBorderRadius !== undefined
          ? `${appearance.cardBorderRadius}px`
          : "") ||
        (content.borderRadius as string) ||
        "0.5rem",
      cardTitleFont:
        (rawValues.cardTitleFont as string) ||
        (appearance.cardTitleFont as string) ||
        (content.cardTitleFont as string),
      cardDescriptionFont:
        (rawValues.cardDescriptionFont as string) ||
        (appearance.cardDescriptionFont as string) ||
        (content.cardDescriptionFont as string),
      bgImage: resolvedBgImage,
      bgColor: resolvedSectionBgColor,
      backgroundColor: resolvedSectionBgColor,
      bgType: resolvedBgType,
      imageOpacity:
        (rawValues.imageOpacity as number) ??
        (appearance.imageOpacity as number) ??
        1,
      overlayOpacity:
        (rawValues.overlayOpacity as number) ??
        (appearance.overlay?.opacity as number) ??
        0,
      imageScale:
        (rawValues.imageScale as number) ??
        (appearance.imageScale as number) ??
        1,
      imageX:
        (rawValues.imageX as number) ?? (appearance.imageX as number) ?? 50,
      imageY:
        (rawValues.imageY as number) ?? (appearance.imageY as number) ?? 50,
      appearance: {
        backgroundColor: resolvedSectionBgColor,
        backgroundImageUrl: resolvedBgImage,
        overlay: {
          color:
            (rawValues.overlayColor as string) ||
            (appearance.overlay?.color as string) ||
            "",
          opacity:
            (rawValues.overlayOpacity as number) ??
            (appearance.overlay?.opacity as number) ??
            0,
        },
        imageOpacity:
          (rawValues.imageOpacity as number) ??
          (appearance.imageOpacity as number) ??
          1,
        imageScale:
          (rawValues.imageScale as number) ??
          (appearance.imageScale as number) ??
          1,
        imageX:
          (rawValues.imageX as number) ?? (appearance.imageX as number) ?? 50,
        imageY:
          (rawValues.imageY as number) ?? (appearance.imageY as number) ?? 50,
      },
    } as ValuesSettings;

    return normalized;
  }, []);

  const asRecord = useCallback((value: unknown) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return undefined;
    }
    return value as Record<string, unknown>;
  }, []);

  const baseSettings = useMemo(() => {
    if (propSettings) {
      return normalizeValues(
        propSettings as unknown as Record<string, unknown>,
      );
    }
    if (studioId) {
      const config = studioConfig as SiteConfigData | undefined;
      const targetId =
        source === "home" ? SECTION_IDS.homeValues : SECTION_IDS.aboutValues;
      const sections = (config as Record<string, unknown> | undefined)
        ?.sections as Record<string, unknown> | undefined;
      const fallback =
        sections?.[targetId] ||
        (source === "home"
          ? getHomeValuesSettings(config)
          : getAboutUsValuesSettings(config));
      return normalizeValues(fallback as Record<string, unknown>);
    }
    const defaults =
      source === "home" ? getHomeValuesSettings() : getAboutUsValuesSettings();
    return normalizeValues(defaults as unknown as Record<string, unknown>);
  }, [normalizeValues, propSettings, source, studioConfig, studioId]);

  const settings = useMemo(() => {
    if (!liveSettings) return baseSettings;
    const baseRecord = baseSettings as unknown as Record<string, unknown>;
    const liveRecord = liveSettings as unknown as Record<string, unknown>;
    const merged = {
      ...baseRecord,
      ...liveRecord,
      appearance: {
        ...((baseRecord.appearance as Record<string, unknown>) || {}),
        ...((liveRecord.appearance as Record<string, unknown>) || {}),
      },
      content: {
        ...((baseRecord.content as Record<string, unknown>) || {}),
        ...((liveRecord.content as Record<string, unknown>) || {}),
      },
      cardConfig: {
        ...((baseRecord.cardConfig as Record<string, unknown>) || {}),
        ...((liveRecord.cardConfig as Record<string, unknown>) || {}),
      },
      items:
        Array.isArray(liveRecord.items) && liveRecord.items.length > 0
          ? liveRecord.items
          : baseRecord.items,
    };
    return normalizeValues(merged);
  }, [baseSettings, liveSettings, normalizeValues]);

  const syncVisibleSectionsFromStudio = useCallback(() => {
    if (!studioId) return;
    const config = studioConfig as SiteConfigData | undefined;
    const rawVisible =
      config?.visibleSections ||
      (config as Record<string, unknown> | undefined)?.visible_sections;
    if (!rawVisible) return;
    if (Array.isArray(rawVisible)) {
      const mapped: Record<string, boolean> = {};
      (rawVisible as string[]).forEach((id) => {
        mapped[id] = true;
      });
      setVisibleSections(mapped);
      return;
    }
    setVisibleSections(rawVisible as Record<string, boolean>);
  }, [studioConfig, studioId]);

  useEffect(() => {
    setIsMounted(true);
    syncVisibleSectionsFromStudio();

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      const isSpecificValuesEvent =
        (event.data.type === "UPDATE_HOME_VALUES_SETTINGS" &&
          source === "home") ||
        (event.data.type === "UPDATE_ABOUT_US_VALUES_SETTINGS" &&
          source === "about");
      const isGenericSiteEvent =
        event.data.type === "UPDATE_SITE_DATA" ||
        event.data.type === "UPDATE_SITE_CONFIG";

      // Blindagem contra eventos genéricos se já recebemos um específico
      if (isGenericSiteEvent && hasLivePreviewUpdateRef.current) {
        console.log(
          `>>> [ValuesSection] Ignorando ${event.data.type} após preview específico (${source})`,
        );
        return;
      }

      if (
        isSpecificValuesEvent ||
        (isGenericSiteEvent && !hasLivePreviewUpdateRef.current)
      ) {
        if (isSpecificValuesEvent) {
          hasLivePreviewUpdateRef.current = true;
        }

        let rawValues: Record<string, unknown> | undefined;

        console.log(`>>> [ValuesSection] Recebido ${event.data.type}:`, {
          source,
          settings: event.data.settings,
          bgColor: event.data.settings?.bgColor,
          cardBgColor: event.data.settings?.cardBgColor,
          appearanceBg: event.data.settings?.appearance?.backgroundColor,
        });

        if (event.data.type === "UPDATE_SITE_DATA" && event.data.data) {
          const siteData = event.data.data as Record<string, unknown>;
          const homeData = (siteData.home || siteData.home_page) as
            | Record<string, unknown>
            | undefined;
          const aboutData = (siteData.aboutUs || siteData.about_us) as
            | Record<string, unknown>
            | undefined;
          const layoutGlobal = (siteData.layoutGlobal ||
            siteData.layout_global) as Record<string, unknown> | undefined;
          const sections = siteData.sections as
            | Record<string, unknown>
            | undefined;

          if (source === "home") {
            rawValues =
              asRecord(sections?.[SECTION_IDS.homeValues]) ||
              asRecord(siteData.homeValuesSettings) ||
              asRecord(siteData.homeValues) ||
              asRecord(siteData.home_values) ||
              asRecord(layoutGlobal?.homeValuesSettings) ||
              asRecord(homeData?.valuesSection) ||
              asRecord(homeData?.values) ||
              asRecord(layoutGlobal?.values) ||
              asRecord(siteData.valuesSection) ||
              asRecord(siteData.values);
          } else {
            rawValues =
              asRecord(sections?.[SECTION_IDS.aboutValues]) ||
              asRecord(siteData.aboutUsValuesSettings) ||
              asRecord(siteData.aboutUsValues) ||
              asRecord(siteData.about_us_values) ||
              asRecord(layoutGlobal?.aboutUsValuesSettings) ||
              asRecord(aboutData?.valuesSection) ||
              asRecord(aboutData?.values) ||
              asRecord(layoutGlobal?.values) ||
              asRecord(siteData.valuesSection) ||
              asRecord(siteData.values);
          }
        } else if (
          event.data.type === "UPDATE_SITE_CONFIG" &&
          event.data.config
        ) {
          const config = event.data.config as Record<string, unknown>;
          const homeData = (config.home || config.home_page) as
            | Record<string, unknown>
            | undefined;
          const aboutData = (config.aboutUs || config.about_us) as
            | Record<string, unknown>
            | undefined;
          const layoutGlobal = (config.layoutGlobal || config.layout_global) as
            | Record<string, unknown>
            | undefined;
          rawValues =
            source === "home"
              ? asRecord(config.homeValuesSettings) ||
                asRecord(config.homeValues) ||
                asRecord(config.home_values) ||
                asRecord(layoutGlobal?.homeValuesSettings) ||
                asRecord(homeData?.valuesSection) ||
                asRecord(homeData?.values) ||
                asRecord(layoutGlobal?.values) ||
                asRecord(config.valuesSection) ||
                asRecord(config.values)
              : asRecord(config.aboutUsValuesSettings) ||
                asRecord(config.aboutUsValues) ||
                asRecord(config.about_us_values) ||
                asRecord(layoutGlobal?.aboutUsValuesSettings) ||
                asRecord(aboutData?.valuesSection) ||
                asRecord(aboutData?.values) ||
                asRecord(layoutGlobal?.values) ||
                asRecord(config.valuesSection) ||
                asRecord(config.values);
        } else {
          rawValues = event.data.settings as
            | Record<string, unknown>
            | undefined;
        }

        if (rawValues) {
          setLiveSettings((prev) => {
            const incoming = rawValues as Record<string, unknown>;
            const incomingAppearance =
              (incoming.appearance as Record<string, unknown>) || {};
            const incomingContent =
              (incoming.content as Record<string, unknown>) || {};

            // Sanitização manual estilo GalleryPreview para garantir que as cores não se percam
            const sanitizedColors = {
              bgColor: sanitizeColor(
                (incoming.bgColor as string) ||
                  (incoming.backgroundColor as string) ||
                  (incoming.values_bg as string) ||
                  (incoming.about_values_bg as string) ||
                  (incomingAppearance.backgroundColor as string) ||
                  (incomingAppearance.bgColor as string),
              ),
              cardBgColor: sanitizeColor(
                (incoming.cardBackgroundColor as string) ||
                  (incoming.cardBgColor as string) ||
                  (incoming.card_background_color as string) ||
                  (incomingAppearance.cardBackgroundColor as string) ||
                  (incomingAppearance.cardBgColor as string) ||
                  (incomingContent.cardBgColor as string),
              ),
            };

            const normalizedIncoming = normalizeValues(rawValues);
            const prevRecord = (prev || baseSettings) as unknown as Record<
              string,
              unknown
            >;
            const merged = {
              ...prevRecord,
              ...incoming,
              ...normalizedIncoming,
              ...(sanitizedColors.bgColor
                ? {
                    bgColor: sanitizedColors.bgColor,
                    backgroundColor: sanitizedColors.bgColor,
                    bgType: "color",
                    bgImage: "",
                  }
                : {}),
              ...(sanitizedColors.cardBgColor
                ? {
                    cardBgColor: sanitizedColors.cardBgColor,
                    cardBackgroundColor: sanitizedColors.cardBgColor,
                  }
                : {}),
            };

            if (sanitizedColors.bgColor || sanitizedColors.cardBgColor) {
              const previousAppearance =
                (prevRecord.appearance as
                  | Record<string, unknown>
                  | undefined) || {};
              const incomingAppearanceData =
                (incoming.appearance as Record<string, unknown> | undefined) ||
                {};
              merged.appearance = {
                ...previousAppearance,
                ...incomingAppearanceData,
                ...(sanitizedColors.bgColor
                  ? {
                      bgType: "color",
                      backgroundColor: sanitizedColors.bgColor,
                      bgColor: sanitizedColors.bgColor,
                      backgroundImageUrl: "",
                    }
                  : {}),
                ...(sanitizedColors.cardBgColor
                  ? {
                      cardBgColor: sanitizedColors.cardBgColor,
                      cardBackgroundColor: sanitizedColors.cardBgColor,
                    }
                  : {}),
              };
            }

            if (Array.isArray(incoming.items) && incoming.items.length > 0) {
              merged.items = incoming.items as ValueItem[];
            } else if (
              Array.isArray(incomingContent.items) &&
              incomingContent.items.length > 0
            ) {
              merged.items = incomingContent.items as ValueItem[];
            } else if (
              Array.isArray(normalizedIncoming.items) &&
              normalizedIncoming.items.length > 0
            ) {
              merged.items = normalizedIncoming.items as ValueItem[];
            }

            return normalizeValues(merged);
          });
        }
      }

      if (event.data.type === "SET_ISOLATED_SECTION") {
        setIsolatedSection(event.data.sectionId);
      }

      if (event.data.type === "UPDATE_VISIBLE_SECTIONS") {
        setVisibleSections(event.data.settings || {});
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        (event.data.sectionId === "home-values" ||
          event.data.sectionId === "about-values")
      ) {
        setHighlightedElement(event.data.sectionId);
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    window.addEventListener("message", handleMessage);
    const updateEvent =
      source === "home"
        ? "homeValuesSettingsUpdated"
        : "aboutUsValuesSettingsUpdated";
    window.addEventListener(updateEvent, syncVisibleSectionsFromStudio);
    const handleDataReady = () => {
      syncVisibleSectionsFromStudio();
    };
    window.addEventListener("DataReady", handleDataReady);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(updateEvent, syncVisibleSectionsFromStudio);
      window.removeEventListener("DataReady", handleDataReady);
    };
  }, [
    asRecord,
    baseSettings,
    normalizeValues,
    source,
    syncVisibleSectionsFromStudio,
  ]);

  useEffect(() => {
    if (!isInsideIframe) {
      setLiveSettings(null);
    }
  }, [isInsideIframe]);

  // Lógica interna de visibilidade para sincronizar com o que o Editor manda via PostMessage
  const isSectionVisible = (id: string) => {
    // Se estivermos no modo isolado (foco em uma única seção no editor)
    if (
      isolatedSection &&
      isolatedSection !== "typography" &&
      isolatedSection !== "colors"
    ) {
      return isolatedSection === id;
    }

    // Caso contrário, checa se a seção está ativa no array de visibilidade
    return visibleSections[id] !== false;
  };

  const isVisible =
    source === "about"
      ? isSectionVisible("about-values")
      : isSectionVisible("home-values");

  // Fallback Skeleton enquanto carrega do banco
  if (!isMounted || isLoading) {
    return (
      <section id={sectionId} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="h-10 w-64 bg-gray-200 animate-pulse mx-auto mb-4 rounded"></div>
          <div className="h-6 w-96 bg-gray-200 animate-pulse mx-auto mb-12 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-48 bg-gray-100 animate-pulse rounded-xl"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!settings || !isVisible) return null;

  const sectionBackgroundColor =
    sanitizeColor(settings.bgColor) ||
    sanitizeColor(settings.appearance?.backgroundColor) ||
    "var(--background)";
  const sectionUsesColorBackground = settings.bgType !== "image";

  return (
    <section
      id={sectionId}
      className={cn(
        "relative isolate z-0 py-20 md:py-32 transition-all duration-500 overflow-hidden",
        highlightedElement === sectionId &&
          "ring-8 ring-inset ring-primary/30 bg-primary/5",
      )}
      style={{
        backgroundColor: sectionUsesColorBackground
          ? sectionBackgroundColor
          : undefined,
        backgroundImage: sectionUsesColorBackground ? "none" : undefined,
      }}
    >
      <SectionBackground
        settings={settings as SectionBackgroundSettings}
        className="z-0"
      />

      <div className="container relative z-10 mx-auto px-4">
        {(settings?.showTitle !== false ||
          settings?.showSubtitle !== false) && (
          <div className="text-center mb-16">
            {settings?.showTitle !== false && (
              <h2
                className="text-4xl md:text-5xl font-bold mb-4 text-balance transition-all duration-300"
                style={{
                  color: settings?.titleColor || "var(--foreground)",
                  fontFamily: settings?.titleFont || "var(--font-title)",
                }}
              >
                {renderSafeText(settings?.title)}
              </h2>
            )}
            {settings?.showSubtitle !== false && (
              <p
                className="text-lg max-w-2xl mx-auto text-pretty leading-relaxed transition-all duration-300"
                style={{
                  color: settings?.subtitleColor || "var(--foreground)",
                  fontFamily: settings?.subtitleFont || "var(--font-subtitle)",
                }}
              >
                {renderSafeText(settings?.subtitle)}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {settings?.items?.map((value) => {
            const Icon = (value?.icon && iconMap[value.icon]) || Heart;
            return (
              <Card
                key={value?.id}
                className="border-border hover:border-accent transition-all overflow-hidden text-center backdrop-blur-sm"
                style={{
                  backgroundColor: settings?.cardBgColor || "var(--card)",
                  borderRadius: settings?.borderRadius || "0.5rem",
                }}
              >
                <CardContent className="p-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300"
                    style={{
                      backgroundColor: settings?.cardIconColor
                        ? `${settings.cardIconColor}1a`
                        : "var(--muted)",
                      opacity: settings?.cardIconColor ? 1 : 1,
                      borderRadius: "100%", // Force circle regardless of card radius
                    }}
                  >
                    <Icon
                      className="w-8 h-8 transition-all duration-300"
                      style={{
                        color: settings?.cardIconColor || "var(--primary)",
                      }}
                    />
                  </div>
                  <h3
                    className="text-xl font-semibold mb-3 transition-all duration-300"
                    style={{
                      color:
                        settings?.cardTitleColor ||
                        settings?.cardTextColor ||
                        "var(--primary)",
                      fontFamily:
                        settings?.cardTitleFont || "var(--font-title)",
                    }}
                  >
                    {renderSafeText(value?.title)}
                  </h3>
                  <p
                    className="text-sm leading-relaxed transition-all duration-300"
                    style={{
                      color:
                        settings?.cardDescriptionColor ||
                        settings?.cardTextColor ||
                        "var(--foreground)",
                      fontFamily:
                        settings?.cardDescriptionFont || "var(--font-subtitle)",
                    }}
                  >
                    {renderSafeText(value?.description)}
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
