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
import { getValuesSettings, type ValuesSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";

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
  const [settings, setSettings] = useState<ValuesSettings | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const loadData = useCallback(() => {
    setSettings(getValuesSettings());
  }, []);

  useEffect(() => {
    loadData();

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "UPDATE_VALUES_CONTENT") {
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

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("valuesSettingsUpdated", loadData);
    };
  }, [loadData]);

  if (!settings) return null;

  return (
    <section
      id="values"
      className={cn(
        "relative py-20 md:py-32 transition-all duration-500 overflow-hidden",
        highlightedElement === "values" &&
          "ring-8 ring-inset ring-primary/30 bg-primary/5",
      )}
    >
      {/* Background Color Layer */}
      <div
        className="absolute inset-0 z-0 transition-colors duration-500"
        style={{
          backgroundColor:
            settings.bgType === "color"
              ? settings.bgColor || "white"
              : "transparent",
        }}
      />

      {/* Background Image Layer */}
      {settings.bgType === "image" && settings.bgImage && (
        <div
          className="absolute inset-0 z-0 transition-all duration-500"
          style={{
            backgroundImage: `url(${settings.bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: `${settings.imageX}% ${settings.imageY}%`,
            transform: `scale(${settings.imageScale})`,
            opacity: settings.imageOpacity,
          }}
        />
      )}

      {/* Overlay/Gradient Layer */}
      <div
        className="absolute inset-0 z-1 bg-linear-to-b from-black/20 via-black/50 to-black transition-opacity duration-500 pointer-events-none"
        style={{
          opacity: settings.overlayOpacity,
        }}
      />

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-balance transition-all duration-300"
            style={{
              color: settings.titleColor || undefined,
              fontFamily: settings.titleFont
                ? `'${settings.titleFont}', serif`
                : undefined,
            }}
          >
            {settings.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto text-pretty leading-relaxed transition-all duration-300"
            style={{
              color: settings.subtitleColor || undefined,
              fontFamily: settings.subtitleFont
                ? `'${settings.subtitleFont}', sans-serif`
                : undefined,
            }}
          >
            {settings.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {settings.items.map((value) => {
            const Icon = iconMap[value.icon] || Heart;
            return (
              <Card
                key={value.id}
                className="border-border hover:border-accent transition-colors overflow-hidden text-center backdrop-blur-sm"
                style={{
                  backgroundColor: settings.cardBgColor || undefined,
                }}
              >
                <CardContent className="p-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300"
                    style={{
                      backgroundColor: settings.cardIconColor
                        ? `${settings.cardIconColor}1a`
                        : undefined,
                    }}
                  >
                    <Icon
                      className="w-8 h-8 transition-colors duration-300"
                      style={{ color: settings.cardIconColor || undefined }}
                    />
                  </div>
                  <h3
                    className="text-xl font-semibold mb-3 transition-colors duration-300"
                    style={{
                      color: settings.cardTitleColor || undefined,
                      fontFamily: settings.cardTitleFont
                        ? `'${settings.cardTitleFont}', serif`
                        : undefined,
                    }}
                  >
                    {value.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed transition-colors duration-300"
                    style={{
                      color: settings.cardDescriptionColor || undefined,
                      fontFamily: settings.cardDescriptionFont
                        ? `'${settings.cardDescriptionFont}', sans-serif`
                        : undefined,
                    }}
                  >
                    {value.description}
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
