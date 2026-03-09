"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/context/studio-context";
import {
  getAboutHeroSettings,
  type HeroSettings,
  sanitizeColor,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";
import { SessionWrapper } from "./admin/site_editor/components/SessionWrapper";

export function AboutHero() {
  const { studio } = useStudio();
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const home = studio?.config?.home as Record<string, unknown> | undefined;
  const layoutGlobal = (studio?.config?.layoutGlobal || studio?.config?.layout_global) as Record<string, unknown> | undefined;
  const aboutHeroConfig = home?.aboutHero || studio?.config?.aboutHero || layoutGlobal?.aboutHero || layoutGlobal?.hero;

  useEffect(() => {
    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    if (aboutHeroConfig) {
      const rawAboutHero = aboutHeroConfig as Record<string, unknown>;
      const content = (rawAboutHero.content as Record<string, unknown>) || {};
      const appearance =
        (rawAboutHero.appearance as Record<string, unknown>) || {};

      const normalizedAboutHero = {
        ...rawAboutHero,
        ...content,
        ...appearance,
        title: (content.title as string) ?? (rawAboutHero.title as string),
        subtitle:
          (content.subtitle as string) ?? (rawAboutHero.subtitle as string),
        showBadge:
          content.showBadge !== undefined
            ? (content.showBadge as boolean)
            : rawAboutHero.showBadge !== undefined
              ? (rawAboutHero.showBadge as boolean)
              : true,
        badge: (content.badge as string) ?? (rawAboutHero.badge as string),
        badgeIcon:
          (content.badgeIcon as string) ?? (rawAboutHero.badgeIcon as string),
        badgeColor: sanitizeColor(
          (rawAboutHero.badgeColor as string) ||
            (appearance.badgeColor as string) ||
            (content.badgeColor as string),
        ),
        badgeTextColor: sanitizeColor(
          (rawAboutHero.badgeTextColor as string) ||
            (appearance.badgeTextColor as string) ||
            (content.badgeTextColor as string),
        ),
        primaryButton:
          (content.primaryButton as string) ??
          (rawAboutHero.primaryButton as string),
        primaryButtonLink:
          (content.primaryButtonLink as string) ??
          (rawAboutHero.primaryButtonLink as string),
        secondaryButton:
          (content.secondaryButton as string) ??
          (rawAboutHero.secondaryButton as string),
        secondaryButtonLink:
          (content.secondaryButtonLink as string) ??
          (rawAboutHero.secondaryButtonLink as string),
        titleColor: sanitizeColor(
          (rawAboutHero.titleColor as string) ||
            (appearance.titleColor as string) ||
            (content.titleColor as string),
        ),
        subtitleColor: sanitizeColor(
          (rawAboutHero.subtitleColor as string) ||
            (appearance.subtitleColor as string) ||
            (content.subtitleColor as string),
        ),
        titleFont:
          (rawAboutHero.titleFont as string) ||
          (appearance.titleFont as string) ||
          (content.titleFont as string),
        subtitleFont:
          (rawAboutHero.subtitleFont as string) ||
          (appearance.subtitleFont as string) ||
          (content.subtitleFont as string),
        primaryButtonColor: sanitizeColor(
          (rawAboutHero.primaryButtonColor as string) ||
            (appearance.primaryButtonColor as string) ||
            (content.primaryButtonColor as string),
        ),
        primaryButtonTextColor: sanitizeColor(
          (rawAboutHero.primaryButtonTextColor as string) ||
            (appearance.primaryButtonTextColor as string) ||
            (content.primaryButtonTextColor as string),
        ),
        secondaryButtonColor: sanitizeColor(
          (rawAboutHero.secondaryButtonColor as string) ||
            (appearance.secondaryButtonColor as string) ||
            (content.secondaryButtonColor as string),
        ),
        secondaryButtonTextColor: sanitizeColor(
          (rawAboutHero.secondaryButtonTextColor as string) ||
            (appearance.secondaryButtonTextColor as string) ||
            (content.secondaryButtonTextColor as string),
        ),
        bgImage:
          (rawAboutHero.bgImage as string) ||
          (appearance.backgroundImageUrl as string) ||
          "",
        bgColor: sanitizeColor(
          (rawAboutHero.bgColor as string) ||
            (rawAboutHero.backgroundColor as string) ||
            (appearance.backgroundColor as string) ||
            "",
        ),
      };

      setSettings(normalizedAboutHero as HeroSettings);
    } else {
      setSettings(getAboutHeroSettings());
    }

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_ABOUT_HERO_SETTINGS") {
        // Sanitize colors in real-time update
        const updatedSettings = { ...event.data.settings };
        const colorFields = [
          "badgeColor",
          "badgeTextColor",
          "titleColor",
          "subtitleColor",
          "primaryButtonColor",
          "primaryButtonTextColor",
          "secondaryButtonColor",
          "secondaryButtonTextColor",
          "bgColor",
        ];

        colorFields.forEach((field) => {
          if (updatedSettings[field] !== undefined) {
            updatedSettings[field] = sanitizeColor(updatedSettings[field]);
          }
        });

        setSettings((prev) => (prev ? { ...prev, ...updatedSettings } : prev));
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
  }, [aboutHeroConfig]);

  if (!settings) return null;

  const getHighlightClass = (id: string) => {
    return highlightedElement === id
      ? "ring-4 ring-primary ring-offset-4 rounded-lg transition-all duration-500 scale-[1.02] z-20 relative"
      : "transition-all duration-500 relative";
  };

  return (
    <SessionWrapper appearance={settings?.appearance}>
      <section
        id="about-hero"
        className={cn(
          "relative py-20 md:py-32 overflow-hidden transition-all duration-700",
          (highlightedElement === "about-hero-bg" ||
            highlightedElement === "about-hero") &&
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
            appearance: settings.appearance,
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
                color: settings.badgeTextColor || settings.badgeColor || "rgba(var(--accent), 0.8)",
                borderColor: settings.badgeColor || "rgba(var(--accent), 0.2)",
                backgroundColor: settings.badgeColor
                  ? `${settings.badgeColor}22`
                  : "rgba(var(--accent), 0.1)",
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
              "flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-300",
              getHighlightClass("about-hero-buttons"),
            )}
          >
            {settings.primaryButton && (
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor:
                    settings.primaryButtonColor || "var(--primary)",
                  color: settings.primaryButtonTextColor || "#ffffff",
                  fontFamily: settings.primaryButtonFont || "var(--font-body)",
                  boxShadow: `0 10px 15px -3px ${settings.primaryButtonColor ? `${settings.primaryButtonColor}40` : 'rgba(var(--primary), 0.25)'}`,
                }}
              >
                <Link href={settings.primaryButtonLink || "/agendamento"}>
                  {settings.primaryButton || "Nossos Serviços"}
                </Link>
              </Button>
            )}

            {settings.secondaryButton && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-bold rounded-full border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
                style={{
                  borderColor: settings.secondaryButtonColor || "var(--primary)",
                  color: settings.secondaryButtonTextColor || (settings.secondaryButtonColor || "var(--primary)"),
                  fontFamily: settings.secondaryButtonFont || "var(--font-body)",
                }}
              >
                <Link href={settings.secondaryButtonLink || "/sobre"}>
                  {settings.secondaryButton || "Saiba Mais"}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
    </SessionWrapper>
  );
}
