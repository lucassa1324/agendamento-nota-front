"use client";

import {
  Award,
  Crown,
  Flower2,
  Gem,
  Heart,
  type LucideIcon,
  Moon,
  Smile,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/context/studio-context";
import {
  getHeroSettings,
  getPageVisibility,
  getSiteProfile,
  type HeroSettings,
  type SiteProfile,
  sanitizeColor,
} from "@/lib/booking-data";
import { cn, renderSafeText } from "@/lib/utils";
import {
  SectionBackground,
  type SectionBackgroundSettings,
} from "./admin/site_editor/components/SectionBackground";
import { SessionWrapper } from "./admin/site_editor/components/SessionWrapper";
import type { SiteConfigData } from "./admin/site_editor/hooks/use-site-editor";

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Star,
  Heart,
  Crown,
  Flower2,
  Moon,
  Sun,
  Gem,
  Smile,
  Award,
};

export function HeroSection() {
  const { studio, isLoading } = useStudio();
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [customStyles, setCustomStyles] = useState<Partial<HeroSettings>>({});
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(
    {
      inicio: true,
      galeria: true,
      sobre: true,
      agendar: true,
    },
  );
  console.log(">>> [HERO] pageVisibility:", pageVisibility);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const [isMounted, setIsMounted] = useState(false);

  const config = studio?.config as SiteConfigData | undefined;

  // Sincronização Unificada: O estado customStyles agora é derivado DIRETAMENTE do StudioContext.
  // Isso resolve a divergência entre editor e preview, pois ambos passam a beber da mesma fonte.
  useEffect(() => {
    if (!config) return;

    const home = config?.home as Record<string, unknown> | undefined;
    const layoutGlobal = (config?.layoutGlobal || config?.layout_global) as Record<string, unknown> | undefined;
    const rawHero = (home?.heroBanner || home?.hero || config?.heroBanner || config?.hero || layoutGlobal?.heroBanner || layoutGlobal?.hero) as Record<string, unknown> | undefined;

    if (rawHero) {
      const content = (rawHero.content as Record<string, unknown>) || {};
      const appearance = (rawHero.appearance as Record<string, unknown>) || {};
      
      const normalizedHero = {
        ...rawHero,
        ...content,
        ...appearance,
        title: (content.title as string) ?? (rawHero.title as string),
        subtitle: (content.subtitle as string) ?? (rawHero.subtitle as string),
        showTitle: content.showTitle !== undefined ? content.showTitle : (rawHero.showTitle !== undefined ? rawHero.showTitle : true),
        showSubtitle: content.showSubtitle !== undefined ? content.showSubtitle : (rawHero.showSubtitle !== undefined ? rawHero.showSubtitle : true),
        showBadge: content.showBadge !== undefined ? content.showBadge : (rawHero.showBadge !== undefined ? rawHero.showBadge : true),
        badge: (rawHero.badge as string) || (content.badge as string) || "",
        badgeIcon: (rawHero.badgeIcon as string) || (content.badgeIcon as string) || "",
        badgeFont: (rawHero.badgeFont as string) || (appearance.badgeFont as string) || (content.badgeFont as string),
        badgeColor: sanitizeColor((rawHero.badgeColor as string) || (appearance.badgeColor as string) || (content.badgeColor as string)),
        badgeTextColor: sanitizeColor((rawHero.badgeTextColor as string) || (appearance.badgeTextColor as string) || (content.badgeTextColor as string)),
        primaryButton: (rawHero.primaryButton as string) ?? (content.primaryButton as string),
        primaryButtonFont: (rawHero.primaryButtonFont as string) || (appearance.primaryButtonFont as string) || (content.primaryButtonFont as string),
        primaryButtonColor: sanitizeColor((rawHero.primaryButtonColor as string) || (appearance.primaryButtonColor as string) || (content.primaryButtonColor as string)),
        primaryButtonTextColor: sanitizeColor((rawHero.primaryButtonTextColor as string) || (appearance.primaryButtonTextColor as string) || (content.primaryButtonTextColor as string)),
        primaryButtonLink: (rawHero.primaryButtonLink as string) ?? (content.primaryButtonLink as string),
        secondaryButton: (rawHero.secondaryButton as string) ?? (content.secondaryButton as string),
        secondaryButtonFont: (rawHero.secondaryButtonFont as string) || (appearance.secondaryButtonFont as string) || (content.secondaryButtonFont as string),
        secondaryButtonColor: sanitizeColor((rawHero.secondaryButtonColor as string) || (appearance.secondaryButtonColor as string) || (content.secondaryButtonColor as string)),
        secondaryButtonTextColor: sanitizeColor((rawHero.secondaryButtonTextColor as string) || (appearance.secondaryButtonTextColor as string) || (content.secondaryButtonTextColor as string)),
        secondaryButtonLink: (rawHero.secondaryButtonLink as string) ?? (content.secondaryButtonLink as string),
        titleColor: sanitizeColor((rawHero.titleColor as string) || (appearance.titleColor as string) || (content.titleColor as string)),
        subtitleColor: sanitizeColor((rawHero.subtitleColor as string) || (appearance.subtitleColor as string) || (content.subtitleColor as string)),
        titleFont: (rawHero.titleFont as string) || (appearance.titleFont as string) || (content.titleFont as string),
        subtitleFont: (rawHero.subtitleFont as string) || (appearance.subtitleFont as string) || (content.subtitleFont as string),
        bgImage: (rawHero.bgImage as string) || (appearance.backgroundImageUrl as string) || "",
        bgColor: sanitizeColor((rawHero.bgColor as string) || (rawHero.backgroundColor as string) || (appearance.backgroundColor as string) || ""),
      };
      setCustomStyles(normalizedHero as HeroSettings);
    } else {
      setCustomStyles(getHeroSettings());
    }
  }, [config]);

  // Log de depuração solicitado para verificar a estrutura dos dados
  useEffect(() => {
    if (config) {
      console.log(">>> [HERO_RENDER_DEBUG]", config);
    }
  }, [config]);

  useEffect(() => {
    setIsMounted(true);
    setProfile(getSiteProfile());

    const handleProfileUpdate = () => {
      setProfile(getSiteProfile());
    };

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "HIGHLIGHT_SECTION") {
        setHighlightedElement(event.data.sectionId);
        setTimeout(() => {
          setHighlightedElement(null);
        }, 2000);
      } else if (event.data.type === "UPDATE_HERO_SETTINGS") {
        console.log(">>> [HERO] Recebido update via postMessage", event.data.settings);
        setCustomStyles((prev) => ({ ...prev, ...event.data.settings }));
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("heroSettingsUpdated", () => setCustomStyles(getHeroSettings()));
    window.addEventListener("pageVisibilityUpdated", () => setPageVisibility(getPageVisibility()));
    window.addEventListener("siteProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("heroSettingsUpdated", () => setCustomStyles(getHeroSettings()));
      window.removeEventListener("pageVisibilityUpdated", () => setPageVisibility(getPageVisibility()));
      window.removeEventListener("siteProfileUpdated", handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    console.log("[BG_CHECK]", {
      type: customStyles.bgType,
      hasImage: !!(
        customStyles.appearance?.backgroundImageUrl || customStyles.bgImage
      ),
      bgColor: customStyles.bgColor,
    });
  }, [
    customStyles.bgType,
    customStyles.appearance?.backgroundImageUrl,
    customStyles.bgImage,
    customStyles.bgColor,
  ]);

  const getHighlightClass = (id: string) => {
    return highlightedElement === id
      ? "ring-4 ring-primary ring-offset-4 rounded-lg transition-all duration-500 scale-[1.02] z-20 relative"
      : "transition-all duration-500 relative";
  };

  if (!isMounted || isLoading) {
    return (
      <section
        id="inicio"
        className="relative min-h-[90vh] flex items-center justify-center bg-background"
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 animate-pulse bg-gray-200 h-20 rounded-lg">
              <span className="sr-only">Carregando título do Hero...</span>
            </h1>
            <p className="animate-pulse bg-gray-200 h-10 w-2/3 mx-auto rounded-lg mb-8">
              <span className="sr-only">Carregando subtítulo do Hero...</span>
            </p>
            <div className="flex gap-4 justify-center">
              <div className="animate-pulse bg-gray-200 h-12 w-40 rounded-full"></div>
              <div className="animate-pulse bg-gray-200 h-12 w-40 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!customStyles) return null;

  const description =
    profile?.description ||
    "Transforme seu olhar com técnicas profissionais de design de sobrancelhas. Atendimento personalizado para destacar sua beleza única.";

  return (
    <SessionWrapper appearance={customStyles?.appearance}>
      <section
        id="inicio"
        className={cn(
          "relative min-h-[80vh] md:min-h-screen flex items-center transition-all duration-500 pt-16 md:pt-0 overflow-hidden",
          getHighlightClass("inicio"),
        )}
      >
        <SectionBackground settings={customStyles as SectionBackgroundSettings} />

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            {customStyles.showBadge !== false && (
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 animate-in fade-in zoom-in duration-500",
                  getHighlightClass("hero-badge"),
                )}
                style={{
                  fontFamily: customStyles.badgeFont || "var(--font-body)",
                  borderColor: customStyles.badgeColor || "rgba(var(--accent), 0.2)",
                  backgroundColor: customStyles.badgeColor
                    ? `${customStyles.badgeColor}22`
                    : "rgba(var(--accent), 0.1)",
                }}
              >
                {(() => {
                  const BadgeIcon =
                    iconMap[customStyles.badgeIcon || "Sparkles"] || Sparkles;
                  return (
                    <BadgeIcon
                      className="w-4 h-4"
                      style={{
                        color: customStyles.badgeColor || "var(--accent)",
                      }}
                    />
                  );
                })()}
                <span
                  className="text-sm font-medium"
                  style={{
                    color:
                      customStyles.badgeTextColor ||
                      customStyles.badgeColor ||
                      "var(--accent)",
                  }}
                >
                  {renderSafeText(customStyles.badge) ||
                    "Especialistas em Design de Sobrancelhas"}
                </span>
              </div>
            )}

            {customStyles.showTitle !== false && (
              <h1
                className={cn(
                  "font-serif text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight transition-all duration-300",
                  getHighlightClass("hero-title"),
                )}
                style={{
                  fontFamily: customStyles.titleFont
                    ? `"${customStyles.titleFont}", sans-serif`
                    : "var(--font-title)",
                  color: customStyles.titleColor || "var(--foreground)",
                }}
              >
                {renderSafeText(customStyles.title) ||
                  "Realce Sua Beleza Natural"}
              </h1>
            )}

            {customStyles.showSubtitle !== false && (
              <p
                className={cn(
                  "text-lg md:text-xl mb-8 text-pretty leading-relaxed max-w-2xl mx-auto transition-all duration-300",
                  !customStyles.subtitleColor && "text-muted-foreground",
                  getHighlightClass("hero-subtitle"),
                )}
                style={{
                  fontFamily: customStyles.subtitleFont
                    ? `"${customStyles.subtitleFont}", sans-serif`
                    : "var(--font-subtitle)",
                  color: customStyles.subtitleColor || "var(--foreground)",
                }}
              >
                {renderSafeText(customStyles.subtitle) || description}
              </p>
            )}

            <div
              className={cn(
                "flex flex-col sm:flex-row gap-4 justify-center",
                getHighlightClass("hero-buttons"),
              )}
            >
              {pageVisibility.agendar !== false && (
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "h-14 px-8 text-base font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                    getHighlightClass("hero-primary-button"),
                  )}
                  style={{
                    backgroundColor:
                      customStyles.primaryButtonColor || "var(--primary)",
                    color: customStyles.primaryButtonTextColor || "#ffffff",
                    fontFamily:
                      customStyles.primaryButtonFont || "var(--font-body)",
                    boxShadow: `0 10px 15px -3px ${customStyles.primaryButtonColor ? `${customStyles.primaryButtonColor}40` : 'rgba(var(--primary), 0.25)'}`,
                  }}
                >
                  <Link href={customStyles.primaryButtonLink || "/agendamento"}>
                    {renderSafeText(customStyles.primaryButton) ||
                      "Agendar Agora"}
                  </Link>
                </Button>
              )}
              {pageVisibility.galeria !== false && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className={cn(
                    "h-14 px-8 text-base font-bold rounded-full bg-background/50 backdrop-blur-sm border-border hover:bg-background/80 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                    getHighlightClass("hero-secondary-button"),
                  )}
                  style={{
                  color:
                    customStyles.secondaryButtonTextColor ||
                    (customStyles.secondaryButtonColor || "var(--primary)"),
                  borderColor:
                    customStyles.secondaryButtonColor ||
                    "var(--primary)",
                  backgroundColor: "transparent",
                  fontFamily:
                    customStyles.secondaryButtonFont || "var(--font-body)",
                }}
                >
                  <Link href={customStyles.secondaryButtonLink || "/servicos"}>
                    {renderSafeText(customStyles.secondaryButton)}
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
