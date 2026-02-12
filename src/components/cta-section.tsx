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
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";

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

  useEffect(() => {
    setIsMounted(true);
    setPageVisibility(getPageVisibility());

    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    const config = studio?.config as Record<string, unknown>;
    const layoutGlobal = (config?.layoutGlobal || config?.layout_global) as Record<string, unknown>;
    
    // Buscar CTA no config ou no layoutGlobal
    const dbCTA = (config?.cta || (layoutGlobal as Record<string, unknown>)?.cta) as CTASettings;

    if (dbCTA) {
      setSettings(dbCTA as CTASettings);
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
        setSettings((prev) =>
          prev ? { ...prev, ...event.data.settings } : prev,
        );
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
  }, [studio]);

  if (!isMounted || !settings) return null;
  if (pageVisibility.agendar === false) return null;

  return (
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
            {settings.title}
          </h2>
          <p
            className="text-lg mb-8 text-pretty leading-relaxed max-w-2xl mx-auto"
            style={{
              fontFamily: settings.subtitleFont || "var(--font-subtitle)",
              color: settings.subtitleColor || "var(--foreground)",
            }}
          >
            {settings.subtitle}
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
            <Link href="/agendamento">{settings.buttonText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
