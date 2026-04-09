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
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import {
  type AppearanceSettings,
  getAboutUsValuesSettings,
  getHomeValuesSettings,
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
  const [settings, setSettings] = useState<ValuesSettings | null>(
    propSettings || null,
  );
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

  // Atualiza o estado interno se a prop settings mudar
  useEffect(() => {
    if (propSettings && (!isInsideIframe || !hasLivePreviewUpdateRef.current)) {
      setSettings(propSettings);
    }
  }, [isInsideIframe, propSettings]);

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
      ...rawValues,
      ...content,
      ...appearance,
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

  const loadData = useCallback(() => {
    // Blindagem Absoluta: Se já recebemos atualização do editor, ignoramos o banco
    if (isInsideIframe && hasLivePreviewUpdateRef.current) {
      console.log(
        "[ValuesSection] Guard Logic: Ignorando loadData do banco (Preview Ativo)",
      );
      return;
    }

    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    if (studioId) {
      const config = studioConfig as SiteConfigData | undefined;

      // Sincroniza o array de visibilidade
      const rawVisible =
        config?.visibleSections ||
        (config as Record<string, unknown>)?.visible_sections;
      if (rawVisible) {
        if (Array.isArray(rawVisible)) {
          const mapped: Record<string, boolean> = {};
          (rawVisible as string[]).forEach((id: string) => {
            mapped[id] = true;
          });
          setVisibleSections(mapped);
        } else {
          setVisibleSections(rawVisible as Record<string, boolean>);
        }
      }

      const layoutGlobal = (config?.layoutGlobal || config?.layout_global) as
        | Record<string, unknown>
        | undefined;
      const home = (config?.home ||
        (config as Record<string, unknown>)?.home_page) as
        | Record<string, unknown>
        | undefined;
      const aboutUs = ((config as Record<string, unknown>)?.aboutUs ||
        (config as Record<string, unknown>)?.about_us) as
        | Record<string, unknown>
        | undefined;
      const rawValues =
        source === "home"
          ? ((config?.homeValuesSettings ||
              config?.homeValues ||
              config?.home_values ||
              layoutGlobal?.homeValuesSettings ||
              home?.valuesSection ||
              home?.values ||
              layoutGlobal?.values ||
              config?.values ||
              config?.valuesSection) as Record<string, unknown> | undefined)
          : ((config?.aboutUsValuesSettings ||
              config?.aboutUsValues ||
              config?.about_us_values ||
              layoutGlobal?.aboutUsValuesSettings ||
              aboutUs?.valuesSection ||
              aboutUs?.values ||
              layoutGlobal?.values ||
              config?.values ||
              config?.valuesSection) as Record<string, unknown> | undefined);

      if (rawValues) {
        setSettings(normalizeValues(rawValues));
      } else {
        // PASSE O CONFIG PARA A FUNÇÃO LER OS DADOS! (Solicitado pelo usuário)
        const fallback =
          source === "home"
            ? getHomeValuesSettings(config)
            : getAboutUsValuesSettings(config);

        // Se já temos um objeto ValuesSettings pronto do fallback, usamos ele diretamente
        // ou normalizamos se necessário para garantir que as chaves de aparência existam.
        setSettings(
          normalizeValues(fallback as unknown as Record<string, unknown>),
        );
      }
    } else {
      const defaultSettings =
        source === "home"
          ? getHomeValuesSettings()
          : getAboutUsValuesSettings();
      setSettings(
        normalizeValues(defaultSettings as unknown as Record<string, unknown>),
      );
    }
  }, [isInsideIframe, normalizeValues, source, studioId, studioConfig]);

  // Efeito para sincronizar com mudanças no contexto global (Hydration/Post-Save)
  useEffect(() => {
    if (isMounted) {
      // Só sincroniza se não estivermos no iframe ou se ainda não houve atualização de preview
      if (!isInsideIframe || !hasLivePreviewUpdateRef.current) {
        console.log(">>> [VALUES_SECTION] Syncing with studioConfig change...");
        loadData();
      }
    }
  }, [isMounted, loadData, isInsideIframe]);

  useEffect(() => {
    setIsMounted(true);
    // Só carrega os dados iniciais se não houver um preview ativo ou se não estiver no iframe
    if (!isInsideIframe || !hasLivePreviewUpdateRef.current) {
      loadData();
    }

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
          rawValues =
            source === "home"
              ? ((siteData.homeValuesSettings ||
                  siteData.homeValues ||
                  siteData.home_values ||
                  layoutGlobal?.homeValuesSettings ||
                  homeData?.valuesSection ||
                  homeData?.values ||
                  layoutGlobal?.values ||
                  siteData.valuesSection ||
                  siteData.values) as Record<string, unknown> | undefined)
              : ((siteData.aboutUsValuesSettings ||
                  siteData.aboutUsValues ||
                  siteData.about_us_values ||
                  layoutGlobal?.aboutUsValuesSettings ||
                  aboutData?.valuesSection ||
                  aboutData?.values ||
                  layoutGlobal?.values ||
                  siteData.valuesSection ||
                  siteData.values) as Record<string, unknown> | undefined);
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
              ? ((config.homeValuesSettings ||
                  config.homeValues ||
                  config.home_values ||
                  layoutGlobal?.homeValuesSettings ||
                  homeData?.valuesSection ||
                  homeData?.values ||
                  layoutGlobal?.values ||
                  config.valuesSection ||
                  config.values) as Record<string, unknown> | undefined)
              : ((config.aboutUsValuesSettings ||
                  config.aboutUsValues ||
                  config.about_us_values ||
                  layoutGlobal?.aboutUsValuesSettings ||
                  aboutData?.valuesSection ||
                  aboutData?.values ||
                  layoutGlobal?.values ||
                  config.valuesSection ||
                  config.values) as Record<string, unknown> | undefined);
        } else {
          rawValues = event.data.settings as
            | Record<string, unknown>
            | undefined;
        }

        if (rawValues) {
          setSettings((prev) => {
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

            // Se for um evento genérico (UPDATE_SITE_DATA), usamos o normalizeValues completo
            if (isGenericSiteEvent) {
              const normalized = normalizeValues(rawValues);
              if (!prev) return normalized;
              return {
                ...prev,
                ...normalized,
                items:
                  Array.isArray(normalized.items) && normalized.items.length > 0
                    ? normalized.items
                    : prev.items,
              };
            }

            // Se for um evento específico (UPDATE_HOME_VALUES_SETTINGS), fazemos um merge cirúrgico
            // para não perder o que já temos no estado (especialmente se o payload for parcial)
            if (!prev) return normalizeValues(rawValues);

            const merged = {
              ...prev,
              ...incoming,
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
                (prev.appearance as Record<string, unknown> | undefined) || {};
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

            // Se o payload trouxe itens, atualizamos. Se não, mantemos os atuais.
            if (Array.isArray(incoming.items) && incoming.items.length > 0) {
              merged.items = incoming.items as ValueItem[];
            } else if (
              Array.isArray(incomingContent.items) &&
              incomingContent.items.length > 0
            ) {
              merged.items = incomingContent.items as ValueItem[];
            }

            return merged as ValuesSettings;
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
    window.addEventListener(updateEvent, loadData);
    const handleDataReady = () => {
      if (isInsideIframe && hasLivePreviewUpdateRef.current) {
        return;
      }
      loadData();
    };
    window.addEventListener("DataReady", handleDataReady);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(updateEvent, loadData);
      window.removeEventListener("DataReady", handleDataReady);
    };
  }, [isInsideIframe, loadData, normalizeValues, source]);

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
