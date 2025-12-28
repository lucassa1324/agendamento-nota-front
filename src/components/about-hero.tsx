"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAboutHeroSettings, type HeroSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";

export function AboutHero() {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getAboutHeroSettings());

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_ABOUT_HERO_SETTINGS") {
        setSettings((prev) => (prev ? { ...prev, ...event.data.settings } : prev));
      }

      if (event.data.type === "HIGHLIGHT_SECTION") {
        setHighlightedElement(event.data.sectionId);
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    const handleUpdate = () => {
      setSettings(getAboutHeroSettings());
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("aboutHeroSettingsUpdated", handleUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("aboutHeroSettingsUpdated", handleUpdate);
    };
  }, []);

  if (!settings) return null;

  const getHighlightClass = (id: string) => {
    return highlightedElement === id
      ? "ring-4 ring-primary ring-offset-4 rounded-lg transition-all duration-500 scale-[1.02] z-20 relative"
      : "transition-all duration-500 relative";
  };

  return (
    <section
      id="about-hero"
      className={cn(
        "relative py-20 md:py-32 overflow-hidden transition-all duration-700",
        (highlightedElement === "about-hero-bg" || highlightedElement === "about-hero") &&
          "ring-8 ring-inset ring-primary/30",
      )}
    >
      <SectionBackground
        settings={{
          bgType: settings.bgType as "color" | "image",
          bgColor: settings.bgColor,
          bgImage: settings.bgImage,
          imageOpacity: settings.imageOpacity,
          overlayOpacity: settings.overlayOpacity,
          imageScale: settings.imageScale,
          imageX: settings.imageX,
          imageY: settings.imageY,
        }}
        defaultImage="/beauty-salon-professional-workspace.jpg"
        gradientClassName="bg-linear-to-b from-background/50 via-background/80 to-background"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {settings.showBadge !== false && (
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6",
                getHighlightClass("about-hero-badge"),
              )}
              style={{
                fontFamily: settings.badgeFont || "var(--font-body)",
                color: settings.badgeColor || "var(--secondary)",
                borderColor: settings.badgeColor ? `${settings.badgeColor}33` : "var(--secondary)",
              }}
            >
              <span className="text-sm font-medium">
                {settings.badge || "Sobre Nós"}
              </span>
            </div>
          )}

          <h1
            className={cn(
              "font-serif text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight transition-all duration-300",
              getHighlightClass("about-hero-title"),
            )}
            style={{
              fontFamily: settings.titleFont || "var(--font-title)",
              color: settings.titleColor || "var(--foreground)",
            }}
          >
            {settings.title}
          </h1>

          <p
            className={cn(
              "text-lg md:text-xl mb-8 text-pretty leading-relaxed max-w-2xl mx-auto transition-all duration-300",
              !settings.subtitleColor && "text-muted-foreground",
              getHighlightClass("about-hero-subtitle"),
            )}
            style={{
              fontFamily: settings.subtitleFont || "var(--font-subtitle)",
              color: settings.subtitleColor || "var(--foreground)",
            }}
          >
            {settings.subtitle}
          </p>

          <div
            className={cn(
              "flex flex-col sm:flex-row gap-4 justify-center",
              getHighlightClass("about-hero-buttons"),
            )}
          >
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-base font-bold rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: settings.primaryButtonColor || "var(--primary)",
                color: settings.primaryButtonTextColor || "#ffffff",
                fontFamily: settings.primaryButtonFont || "var(--font-body)",
              }}
            >
              <Link href="/agendamento">
                {settings.primaryButton || "Nossos Serviços"}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base font-bold rounded-full bg-background/50 backdrop-blur-sm border-border hover:bg-background/80 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                color: settings.secondaryButtonTextColor || settings.secondaryButtonColor || "var(--foreground)",
                borderColor: settings.secondaryButtonColor || "var(--secondary)",
                fontFamily: settings.secondaryButtonFont || "var(--font-body)",
              }}
            >
              <Link href="/agendamento">
                {settings.secondaryButton || "Agendar Agora"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

