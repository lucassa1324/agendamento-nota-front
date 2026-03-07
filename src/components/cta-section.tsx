"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/context/studio-context";
import {
  type CTASettings,
  getCTASettings,
  getPageVisibility,
  sanitizeColor,
} from "@/lib/booking-data";
import { cn, renderSafeText } from "@/lib/utils";
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";
import { SessionWrapper } from "./admin/site_editor/components/SessionWrapper";

export function CTASection() {
  const { studio } = useStudio();
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<CTASettings | null>(() => {
    if (typeof window !== "undefined") {
      // Prioridade para o contexto se disponível
      return null;
    }
    return null;
  });
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(
    {
      inicio: true,
      galeria: true,
      sobre: true,
      agendar: true,
    },
  );
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const studioConfig = studio?.config;

  useEffect(() => {
    setIsMounted(true);
    setPageVisibility(getPageVisibility());

    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    const config = studioConfig as Record<string, unknown> | undefined;
    const layoutGlobal = (config?.layoutGlobal ||
      config?.layout_global) as Record<string, unknown> | undefined;

    // Buscar CTA no config ou no layoutGlobal
    const home = config?.home as Record<string, unknown> | undefined;
    const rawCTA = (home?.ctaSection ||
      home?.cta ||
      config?.cta ||
      layoutGlobal?.cta) as
      | Record<string, unknown>
      | undefined;

    if (rawCTA) {
      const content = (rawCTA.content as Record<string, unknown>) || {};
      const appearance = (rawCTA.appearance as Record<string, unknown>) || {};
      const normalizedCTA = {
        ...rawCTA,
        ...content,
        ...appearance,
        title: (content.title as string) ?? (rawCTA.title as string),
        subtitle: (content.subtitle as string) ?? (rawCTA.subtitle as string),
        titleColor: sanitizeColor(
          (appearance.titleColor as string) ||
            (content.titleColor as string) ||
            (rawCTA.titleColor as string),
        ),
        subtitleColor: sanitizeColor(
          (appearance.subtitleColor as string) ||
            (content.subtitleColor as string) ||
            (rawCTA.subtitleColor as string),
        ),
        titleFont:
          (appearance.titleFont as string) ||
          (content.titleFont as string) ||
          (rawCTA.titleFont as string),
        subtitleFont:
          (appearance.subtitleFont as string) ||
          (content.subtitleFont as string) ||
          (rawCTA.subtitleFont as string),
        buttonColor: sanitizeColor(
          (appearance.buttonColor as string) ||
            (content.buttonColor as string) ||
            (rawCTA.buttonColor as string),
        ),
        buttonTextColor: sanitizeColor(
          (appearance.buttonTextColor as string) ||
            (content.buttonTextColor as string) ||
            (rawCTA.buttonTextColor as string),
        ),
        buttonLink: (content.buttonLink as string) ?? (rawCTA.buttonLink as string),
        bgImage:
          (appearance.backgroundImageUrl as string) ||
          (rawCTA.bgImage as string) ||
          "",
        bgColor: sanitizeColor(
          (appearance.backgroundColor as string) ||
            (rawCTA.backgroundColor as string) ||
            (rawCTA.bgColor as string) ||
            "",
        ),
      };
      setSettings(normalizedCTA as CTASettings);
    } else {
      setSettings(getCTASettings());
    }

    const handleVisibilityUpdate = () => {
      setPageVisibility(getPageVisibility());
    };

    const handleSettingsUpdate = () => {
      setSettings(getCTASettings());
    };

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_CTA_SETTINGS") {
        // Sanitize colors in real-time update
        const updatedSettings = { ...event.data.settings };
        const colorFields = [
          "titleColor",
          "subtitleColor",
          "buttonColor",
          "buttonTextColor",
          "bgColor",
        ];

        colorFields.forEach((field) => {
          if (updatedSettings[field] !== undefined) {
            updatedSettings[field] = sanitizeColor(updatedSettings[field]);
          }
        });

        setSettings((prev) => (prev ? { ...prev, ...updatedSettings } : prev));
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === "cta"
      ) {
        setHighlightedElement("cta");
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("pageVisibilityUpdated", handleVisibilityUpdate);
    window.addEventListener("ctaSettingsUpdated", handleSettingsUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(
        "pageVisibilityUpdated",
        handleVisibilityUpdate,
      );
      window.removeEventListener("ctaSettingsUpdated", handleSettingsUpdate);
    };
  }, [studioConfig]);

  if (!isMounted || !settings) return null;
  if (pageVisibility.agendar === false) return null;

  return (
    <SessionWrapper appearance={settings?.appearance}>
      <section
        id="cta"
        className={cn(
          "py-20 md:py-32 relative overflow-hidden transition-all duration-500",
          highlightedElement === "cta" && "ring-4 ring-primary ring-inset z-50",
        )}
      >
      <SectionBackground settings={settings} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm rounded-2xl p-8 md:p-16 text-center border border-border/50 shadow-xl">
          <Calendar
            className="w-16 h-16 mx-auto mb-6"
            style={{ color: settings.buttonColor || "var(--primary)" }}
          />
          <h2
            className="text-3xl md:text-5xl font-bold mb-4 text-balance"
            style={{
              fontFamily: settings.titleFont || "var(--font-title)",
              color: settings.titleColor || "var(--foreground)",
            }}
          >
            {renderSafeText(settings.title)}
          </h2>
          <p
            className="text-lg mb-8 text-pretty leading-relaxed max-w-2xl mx-auto"
            style={{
              fontFamily: settings.subtitleFont || "var(--font-subtitle)",
              color: settings.subtitleColor || "var(--foreground)",
            }}
          >
            {renderSafeText(settings.subtitle)}
          </p>
          <Button
            asChild
            size="lg"
            className="text-lg px-8 shadow-lg hover:scale-105 transition-all duration-300"
            style={{
              fontFamily: settings.buttonFont || "var(--font-body)",
              backgroundColor: settings.buttonColor || "var(--primary)",
              color: settings.buttonTextColor || "#ffffff",
            }}
          >
            <Link href={settings.buttonLink || "/agendamento"}>
              {renderSafeText(settings.buttonText)}
            </Link>
          </Button>
        </div>
      </div>
    </section>
    </SessionWrapper>
  );
}
