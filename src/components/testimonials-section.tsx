"use client";

import { Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteConfigData } from "@/components/admin/site_editor/hooks/use-site-editor";
import { Card, CardContent } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import {
  getTestimonialsSettings,
  SECTION_IDS,
  sanitizeColor,
  type TestimonialsSettings,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import {
  SectionBackground,
  type SectionBackgroundSettings,
} from "./admin/site_editor/components/SectionBackground";
import { SessionWrapper } from "./admin/site_editor/components/SessionWrapper";

export function TestimonialsSection() {
  const { studio, isLoading } = useStudio();
  const [settings, setSettings] = useState<TestimonialsSettings | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const studioId = studio?.id;
  const studioConfig = studio?.config;
  const isInsideIframe =
    typeof window !== "undefined" && window.parent !== window;
  const hasLivePreviewUpdateRef = useRef(false);

  // Debug log para ver a estrutura do config que chega no site público
  useEffect(() => {
    if (studioConfig) {
      console.log(
        ">>> [TESTIMONIALS_RENDER_DEBUG] Config recebida:",
        studioConfig,
      );
    }
  }, [studioConfig]);

  const loadData = useCallback(() => {
    // Blindagem Absoluta: Se já recebemos atualização do editor, ignoramos o banco
    if (isInsideIframe && hasLivePreviewUpdateRef.current) {
      console.log("[TestimonialsSection] Guard Logic: Ignorando loadData do banco (Preview Ativo)");
      return;
    }

    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    if (studioId) {
      const config = studioConfig as SiteConfigData | undefined;
      const siteCustomization =
        config?.siteCustomization || config?.site_customization;
      const layoutGlobal =
        siteCustomization?.layoutGlobal ||
        siteCustomization?.layout_global ||
        (config as Record<string, unknown>)?.layoutGlobal ||
        (config as Record<string, unknown>)?.layout_global;
      const home = config?.home;
      const rawTestimonials =
        (home?.testimonialsSection as Record<string, unknown>) ||
        (config?.testimonials as Record<string, unknown>) ||
        (layoutGlobal as Record<string, unknown>)?.testimonials;

      if (rawTestimonials) {
        const content =
          (rawTestimonials.content as Record<string, unknown>) || {};
        const appearance =
          (rawTestimonials.appearance as Record<string, unknown>) || {};

        // MAPEAMENTO PLANO: Prioriza a raiz (que vem do banco) sobre content/appearance
        const testimonialsSettings = {
          ...rawTestimonials,
          ...content,
          ...appearance,
          title: (rawTestimonials.title as string) || (content.title as string),
          subtitle:
            (rawTestimonials.subtitle as string) ||
            (content.subtitle as string),
          titleColor: sanitizeColor(
            (rawTestimonials.titleColor as string) ||
              (appearance.titleColor as string) ||
              (content.titleColor as string),
          ),
          subtitleColor: sanitizeColor(
            (rawTestimonials.subtitleColor as string) ||
              (appearance.subtitleColor as string) ||
              (content.subtitleColor as string),
          ),
          titleFont:
            (rawTestimonials.titleFont as string) ||
            (appearance.titleFont as string) ||
            (content.titleFont as string),
          subtitleFont:
            (rawTestimonials.subtitleFont as string) ||
            (appearance.subtitleFont as string) ||
            (content.subtitleFont as string),
          cardBgColor: sanitizeColor(
            (rawTestimonials.cardBgColor as string) ||
              (rawTestimonials.cardBackgroundColor as string) ||
              (rawTestimonials.card_background_color as string) ||
              ((rawTestimonials.cardConfig as Record<string, unknown>)
                ?.cardBackgroundColor as string) ||
              ((rawTestimonials.cardConfig as Record<string, unknown>)
                ?.backgroundColor as string) ||
              (appearance.cardBgColor as string) ||
              (content.cardBgColor as string),
          ),
          cardNameColor: sanitizeColor(
            (rawTestimonials.cardNameColor as string) ||
              (appearance.cardNameColor as string) ||
              (content.cardNameColor as string),
          ),
          cardTextColor: sanitizeColor(
            (rawTestimonials.cardTextColor as string) ||
              (appearance.cardTextColor as string) ||
              (content.cardTextColor as string),
          ),
          cardNameFont:
            (rawTestimonials.cardNameFont as string) ||
            (appearance.cardNameFont as string) ||
            (content.cardNameFont as string),
          cardTextFont:
            (rawTestimonials.cardTextFont as string) ||
            (appearance.cardTextFont as string) ||
            (content.cardTextFont as string),
          starColor: sanitizeColor(
            (rawTestimonials.starColor as string) ||
              (appearance.starColor as string) ||
              (content.starColor as string),
          ),
          bgImage:
            (rawTestimonials.bgImage as string) ||
            appearance.backgroundImageUrl ||
            "",
          bgColor: sanitizeColor(
            (rawTestimonials.bgColor as string) ||
              (rawTestimonials.backgroundColor as string) ||
              (appearance.backgroundColor as string) ||
              "",
          ),
        } as TestimonialsSettings;

        // Se o studio tiver depoimentos específicos, usamos eles
        if (studio?.testimonials && studio.testimonials.length > 0) {
          setSettings({
            ...testimonialsSettings,
            testimonials: studio.testimonials,
          });
        } else {
          setSettings(testimonialsSettings);
        }
      } else {
        setSettings(getTestimonialsSettings());
      }
      return;
    }

    setSettings(getTestimonialsSettings());
  }, [studioId, studioConfig, studio?.testimonials]);

  useEffect(() => {
    setIsMounted(true);
    // Só carrega os dados iniciais se não houver um preview ativo ou se não estiver no iframe
    if (!isInsideIframe || !hasLivePreviewUpdateRef.current) {
      loadData();
    }

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (
        event.data.type === "UPDATE_TESTIMONIALS_SETTINGS" ||
        event.data.type === "UPDATE_SITE_DATA" ||
        event.data.type === "UPDATE_SITE_CONFIG"
      ) {
        hasLivePreviewUpdateRef.current = true;
        
        let rawTestimonials = event.data.settings as Record<string, unknown>;
        
        if (event.data.type === "UPDATE_SITE_DATA" && event.data.data) {
          const siteData = event.data.data as Record<string, unknown>;
          const layoutGlobal = (siteData.layoutGlobal ||
            siteData.layout_global) as Record<string, unknown> | undefined;
          const home = siteData.home as Record<string, unknown> | undefined;
          rawTestimonials = (home?.testimonialsSection ||
            siteData.testimonials ||
            layoutGlobal?.testimonials) as Record<string, unknown>;
        }

        if (
          !rawTestimonials ||
          typeof rawTestimonials !== "object" ||
          Array.isArray(rawTestimonials)
        ) {
          return;
        }

        const content = (rawTestimonials.content as Record<string, unknown>) || {};
        const appearance =
          (rawTestimonials.appearance as Record<string, unknown>) || {};

        const normalizedTestimonials = {
          ...rawTestimonials,
          ...content,
          ...appearance,
          title: (rawTestimonials.title as string) || (content.title as string),
          subtitle:
            (rawTestimonials.subtitle as string) ||
            (content.subtitle as string),
          titleColor: sanitizeColor(
            (rawTestimonials.titleColor as string) ||
              (appearance.titleColor as string) ||
              (content.titleColor as string),
          ),
          subtitleColor: sanitizeColor(
            (rawTestimonials.subtitleColor as string) ||
              (appearance.subtitleColor as string) ||
              (content.subtitleColor as string),
          ),
          titleFont:
            (rawTestimonials.titleFont as string) ||
            (appearance.titleFont as string) ||
            (content.titleFont as string),
          subtitleFont:
            (rawTestimonials.subtitleFont as string) ||
            (appearance.subtitleFont as string) ||
            (content.subtitleFont as string),
          cardBgColor: sanitizeColor(
            (rawTestimonials.cardBgColor as string) ||
              (rawTestimonials.cardBackgroundColor as string) ||
              (rawTestimonials.card_background_color as string) ||
              ((rawTestimonials.cardConfig as Record<string, unknown>)
                ?.cardBackgroundColor as string) ||
              ((rawTestimonials.cardConfig as Record<string, unknown>)
                ?.backgroundColor as string) ||
              (appearance.cardBgColor as string) ||
              (content.cardBgColor as string),
          ),
          cardNameColor: sanitizeColor(
            (rawTestimonials.cardNameColor as string) ||
              (appearance.cardNameColor as string) ||
              (content.cardNameColor as string),
          ),
          cardTextColor: sanitizeColor(
            (rawTestimonials.cardTextColor as string) ||
              (appearance.cardTextColor as string) ||
              (content.cardTextColor as string),
          ),
          cardNameFont:
            (rawTestimonials.cardNameFont as string) ||
            (appearance.cardNameFont as string) ||
            (content.cardNameFont as string),
          cardTextFont:
            (rawTestimonials.cardTextFont as string) ||
            (appearance.cardTextFont as string) ||
            (content.cardTextFont as string),
          starColor: sanitizeColor(
            (rawTestimonials.starColor as string) ||
              (appearance.starColor as string) ||
              (content.starColor as string),
          ),
          bgImage:
            (rawTestimonials.bgImage as string) ||
            appearance.backgroundImageUrl ||
            "",
          bgColor: sanitizeColor(
            (rawTestimonials.bgColor as string) ||
              (rawTestimonials.backgroundColor as string) ||
              (appearance.backgroundColor as string) ||
              "",
          ),
        };

        setSettings((prev) =>
          prev
            ? ({ ...prev, ...normalizedTestimonials } as TestimonialsSettings)
            : (normalizedTestimonials as unknown as TestimonialsSettings),
        );
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === SECTION_IDS.homeTestimonials
      ) {
        setHighlightedElement(SECTION_IDS.homeTestimonials);
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    const handleDataReady = () => {
      if (isInsideIframe && hasLivePreviewUpdateRef.current) {
        return;
      }
      loadData();
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("testimonialsSettingsUpdated", loadData);
    window.addEventListener("DataReady", handleDataReady);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("testimonialsSettingsUpdated", loadData);
      window.removeEventListener("DataReady", handleDataReady);
    };
  }, [isInsideIframe, loadData]);

  // Fallback Skeleton enquanto carrega do banco
  if (!isMounted || isLoading) {
    return (
      <section
        id={SECTION_IDS.homeTestimonials}
        className="py-20 bg-background"
      >
        <div className="container mx-auto px-4">
          <div className="h-10 w-64 bg-gray-200 animate-pulse mx-auto mb-4 rounded"></div>
          <div className="h-6 w-96 bg-gray-200 animate-pulse mx-auto mb-12 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[1, 2].map((i) => (
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

  return (
    <SessionWrapper appearance={settings?.appearance}>
      <section
        id={SECTION_IDS.homeTestimonials}
        className={cn(
          "relative py-20 md:py-32 transition-all duration-500 overflow-hidden",
          highlightedElement === SECTION_IDS.homeTestimonials &&
            "ring-8 ring-inset ring-primary/30 bg-primary/5",
        )}
      >
        <SectionBackground settings={settings as SectionBackgroundSettings} />

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
                        style={{
                          color: settings.starColor || "var(--primary)",
                        }}
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
                      fontFamily:
                        settings.cardNameFont || "var(--font-subtitle)",
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
    </SessionWrapper>
  );
}
