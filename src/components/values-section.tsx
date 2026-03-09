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
import { getValuesSettings, sanitizeColor, type ValuesSettings } from "@/lib/booking-data";
import { cn, renderSafeText } from "@/lib/utils";
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";
import { SessionWrapper } from "./admin/site_editor/components/SessionWrapper";
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

export function ValuesSection() {
  const { studio, isLoading } = useStudio();
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<ValuesSettings | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const studioId = studio?.id;
  const studioConfig = studio?.config;

  // Debug log para ver a estrutura do config que chega no site público
  useEffect(() => {
    if (studioConfig) {
      console.log(">>> [VALUES_RENDER_DEBUG] Config recebida:", studioConfig);
    }
  }, [studioConfig]);

  const loadData = useCallback(() => {
    // PRIORIDADE: URL de Preview (localStorage) > Banco de Dados (studioConfig)
    const isPreviewMode =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=true");

    if (isPreviewMode) {
      setSettings(getValuesSettings());
      return;
    }

    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    if (studioId) {
      const config = studioConfig as SiteConfigData | undefined;
      const layoutGlobal = (config?.layoutGlobal ||
        config?.layout_global) as Record<string, unknown> | undefined;
      const home = config?.home as Record<string, unknown> | undefined;
      const rawValues = (home?.valuesSection ||
        home?.values ||
        config?.values ||
        layoutGlobal?.values) as Record<string, unknown> | undefined;

      if (rawValues) {
        // Normalização manual semelhante ao que o editor faz
        const content = (rawValues.content as Record<string, unknown>) || {};
        const appearance =
          (rawValues.appearance as Record<string, unknown>) || {};
        
        // MAPEAMENTO PLANO: Prioriza a raiz (que vem do banco) sobre content/appearance
        const normalizedValues = {
          ...rawValues,
          ...content,
          ...appearance,
          title: (rawValues.title as string) || (content.title as string),
          subtitle: (rawValues.subtitle as string) || (content.subtitle as string),
          showTitle: rawValues.showTitle ?? content.showTitle ?? appearance.showTitle ?? true,
          showSubtitle: rawValues.showSubtitle ?? content.showSubtitle ?? appearance.showSubtitle ?? true,
          titleColor: sanitizeColor(
            (rawValues.titleColor as string) ||
            (appearance.titleColor as string) ||
            (content.titleColor as string)
          ),
          subtitleColor: sanitizeColor(
            (rawValues.subtitleColor as string) ||
            (appearance.subtitleColor as string) ||
            (content.subtitleColor as string)
          ),
          titleFont:
            (rawValues.titleFont as string) ||
            (appearance.titleFont as string) ||
            (content.titleFont as string),
          subtitleFont:
            (rawValues.subtitleFont as string) ||
            (appearance.subtitleFont as string) ||
            (content.subtitleFont as string),
          cardBgColor: sanitizeColor(
            (rawValues.cardBgColor as string) ||
            (appearance.cardBgColor as string) ||
            (content.cardBgColor as string)
          ),
          cardTitleColor: sanitizeColor(
            (rawValues.cardTitleColor as string) ||
            (appearance.cardTitleColor as string) ||
            (content.cardTitleColor as string)
          ),
          cardDescriptionColor: sanitizeColor(
            (rawValues.cardDescriptionColor as string) ||
            (appearance.cardDescriptionColor as string) ||
            (content.cardDescriptionColor as string)
          ),
          cardIconColor: sanitizeColor(
            (rawValues.cardIconColor as string) ||
            (appearance.cardIconColor as string) ||
            (content.cardIconColor as string)
          ),
          bgImage: (rawValues.bgImage as string) || appearance.backgroundImageUrl || "",
          bgColor: sanitizeColor(
            (rawValues.bgColor as string) ||
            (rawValues.backgroundColor as string) ||
            (appearance.backgroundColor as string) ||
            "",
          ),
        };
        setSettings(normalizedValues as ValuesSettings);
      } else {
        setSettings(getValuesSettings());
      }
    } else {
      setSettings(getValuesSettings());
    }
  }, [studioId, studioConfig]);

  useEffect(() => {
    setIsMounted(true);
    loadData();

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_VALUES_SETTINGS") {
        setSettings((prev) =>
          prev ? { ...prev, ...event.data.settings } : prev,
        );
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === "values"
      ) {
        setHighlightedElement("values");
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("valuesSettingsUpdated", loadData);
    window.addEventListener("DataReady", loadData);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("valuesSettingsUpdated", loadData);
      window.removeEventListener("DataReady", loadData);
    };
  }, [loadData]);

  // Fallback Skeleton enquanto carrega do banco
  if (!isMounted || isLoading) {
    return (
      <section id="values" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="h-10 w-64 bg-gray-200 animate-pulse mx-auto mb-4 rounded"></div>
          <div className="h-6 w-96 bg-gray-200 animate-pulse mx-auto mb-12 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!settings) return null;

  return (
    <SessionWrapper appearance={settings?.appearance}>
      <section
        id="values"
        className={cn(
          "relative py-20 md:py-32 transition-all duration-500 overflow-hidden",
          highlightedElement === "values" &&
            "ring-8 ring-inset ring-primary/30 bg-primary/5",
        )}
      >
      <SectionBackground settings={settings} />

      <div className="container relative z-10 mx-auto px-4">
        {(settings?.showTitle !== false || settings?.showSubtitle !== false) && (
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
                      color: settings?.cardTitleColor || "var(--primary)",
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
                        settings?.cardDescriptionColor || "var(--foreground)",
                      fontFamily:
                        settings?.cardDescriptionFont || "var(--font-body)",
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
    </SessionWrapper>
  );
}
