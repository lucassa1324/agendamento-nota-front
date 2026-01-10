"use client";

import { Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getTestimonialsSettings, type TestimonialsSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";
import { useStudio } from "@/context/studio-context";

export function TestimonialsSection() {
  const { studio } = useStudio();
  const [settings, setSettings] = useState<TestimonialsSettings | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  const loadData = useCallback(() => {
    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    if (studio) {
      const testimonialsSettings = (studio.config.testimonials as TestimonialsSettings) || getTestimonialsSettings();
      
      // Se o studio tiver depoimentos específicos, usamos eles
      if (studio.testimonials && studio.testimonials.length > 0) {
        setSettings({
          ...testimonialsSettings,
          testimonials: studio.testimonials
        });
      } else {
        setSettings(testimonialsSettings);
      }
      return;
    }

    setSettings(getTestimonialsSettings());
  }, [studio]);

  useEffect(() => {
    setIsMounted(true);
    loadData();

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_TESTIMONIALS_SETTINGS") {
        setSettings((prev) =>
          prev ? { ...prev, ...event.data.settings } : prev,
        );
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === "testimonials"
      ) {
        setHighlightedElement("testimonials");
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("testimonialsSettingsUpdated", loadData);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("testimonialsSettingsUpdated", loadData);
    };
  }, [loadData]);

  if (!settings) return null;
  if (!isMounted) return null;

  return (
    <section
      id="testimonials"
      className={cn(
        "relative py-20 md:py-32 transition-all duration-500 overflow-hidden",
        highlightedElement === "testimonials" &&
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

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {settings.testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="border-border backdrop-blur-sm"
              style={{
                backgroundColor: settings.cardBgColor || "transparent",
              }}
            >
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={`${testimonial.id}-star-${i}`}
                      className="w-5 h-5 fill-current"
                      style={{ color: settings.starColor || "var(--primary)" }}
                    />
                  ))}
                </div>
                <p
                  className="leading-relaxed mb-4 transition-all duration-300"
                  style={{
                    color: settings.cardTextColor || "var(--foreground)",
                    fontFamily: settings.cardTextFont || "var(--font-body)",
                  }}
                >
                  {testimonial.text}
                </p>
                <p
                  className="font-semibold transition-all duration-300"
                  style={{
                    color: settings.cardNameColor || "var(--primary)",
                    fontFamily: settings.cardNameFont || "var(--font-subtitle)",
                  }}
                >
                  {testimonial.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
