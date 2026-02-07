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
import { getValuesSettings, type ValuesSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";
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
  const { studio } = useStudio();
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<ValuesSettings | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const loadData = useCallback(() => {
    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    if (studio) {
      const config = studio?.config as SiteConfigData | undefined;
      const layoutGlobal = config?.layoutGlobal || config?.layout_global;
      const configValues = config?.values || layoutGlobal?.values;
      setSettings(configValues || getValuesSettings());
    } else {
      setSettings(getValuesSettings());
    }
  }, [studio]);

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

  if (!settings) return null;
  if (!isMounted) return null;

  return (
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
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-balance transition-all duration-300"
            style={{
              color: settings?.titleColor || "var(--foreground)",
              fontFamily: settings?.titleFont || "var(--font-title)",
            }}
          >
            {settings?.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto text-pretty leading-relaxed transition-all duration-300"
            style={{
              color: settings?.subtitleColor || "var(--foreground)",
              fontFamily: settings?.subtitleFont || "var(--font-subtitle)",
            }}
          >
            {settings?.subtitle}
          </p>
        </div>

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
                    {value?.title}
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
                    {value?.description}
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
