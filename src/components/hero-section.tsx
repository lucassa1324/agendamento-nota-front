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

import { SectionBackground } from "./admin/site_editor/components/SectionBackground";

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

import {
  getHeroSettings,
  getPageVisibility,
  getSiteProfile,
  type HeroSettings,
  type SiteProfile,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { useStudio } from "@/context/studio-context";

export function HeroSection() {
  const { studio } = useStudio();
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
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setProfile(getSiteProfile());

    // Carregar configurações iniciais
    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    if (studio?.config?.hero) {
      setCustomStyles(studio.config.hero);
    } else {
      setCustomStyles(getHeroSettings());
    }
    setPageVisibility(getPageVisibility());

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_HERO_SETTINGS") {
        setCustomStyles((prev) => ({
          ...prev,
          ...event.data.settings,
        }));
      }

      if (event.data.type === "HIGHLIGHT_SECTION") {
        setHighlightedElement(event.data.sectionId);
        // Remove highlight after 2 seconds
        setTimeout(() => {
          setHighlightedElement(null);
        }, 2000);
      }
    };

    const handleSettingsUpdate = () => {
      setCustomStyles(getHeroSettings());
    };

    const handleVisibilityUpdate = () => {
      setPageVisibility(getPageVisibility());
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("heroSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("pageVisibilityUpdated", handleVisibilityUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("heroSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener(
        "pageVisibilityUpdated",
        handleVisibilityUpdate,
      );
    };
  }, [studio]);

  const getHighlightClass = (id: string) => {
    return highlightedElement === id
      ? "ring-4 ring-primary ring-offset-4 rounded-lg transition-all duration-500 scale-[1.02] z-20 relative"
      : "transition-all duration-500 relative";
  };

  const description =
    profile?.description ||
    "Transforme seu olhar com técnicas profissionais de design de sobrancelhas. Atendimento personalizado para destacar sua beleza única.";

  if (!isMounted) {
    return (
      <section
        id="hero"
        className="relative min-h-[90vh] flex items-center justify-center bg-background"
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">
              Realce Sua Beleza Natural
            </h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="hero"
      className={cn(
        "relative min-h-[90vh] flex items-center justify-center overflow-hidden transition-all duration-700",
        (highlightedElement === "hero-bg" || highlightedElement === "hero") &&
          "ring-8 ring-inset ring-primary/30",
      )}
    >
      <SectionBackground
        settings={{
          bgType: customStyles.bgType as "color" | "image",
          bgColor: customStyles.bgColor,
          bgImage: customStyles.bgImage,
          imageOpacity: customStyles.imageOpacity,
          overlayOpacity: customStyles.overlayOpacity,
          imageScale: customStyles.imageScale,
          imageX: customStyles.imageX,
          imageY: customStyles.imageY,
        }}
        defaultImage="/elegant-eyebrow-studio-interior-with-soft-lighting.jpg"
        gradientClassName="bg-linear-to-b from-background/50 via-background/80 to-background"
      />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {customStyles.showBadge !== false && (
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 animate-in fade-in zoom-in duration-500",
                getHighlightClass("hero-badge"),
              )}
              style={{
                fontFamily: customStyles.badgeFont || "var(--font-body)",
                borderColor: customStyles.badgeColor
                  ? `${customStyles.badgeColor}33`
                  : "var(--secondary)",
                backgroundColor: customStyles.badgeColor
                  ? `${customStyles.badgeColor}11`
                  : "transparent",
              }}
            >
              {(() => {
                const BadgeIcon =
                  iconMap[customStyles.badgeIcon || "Sparkles"] || Sparkles;
                return (
                  <BadgeIcon
                    className="w-4 h-4"
                    style={{ color: customStyles.badgeColor || "var(--secondary)" }}
                  />
                );
              })()}
              <span
                className="text-sm font-medium"
                style={{
                  color:
                    customStyles.badgeTextColor ||
                    customStyles.badgeColor ||
                    "var(--foreground)",
                }}
              >
                {customStyles.badge ||
                  "Especialistas em Design de Sobrancelhas"}
              </span>
            </div>
          )}

          <h1
            className={cn(
              "font-serif text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight transition-all duration-300",
              getHighlightClass("hero-title"),
            )}
            style={{
              fontFamily: customStyles.titleFont || "var(--font-title)",
              color: customStyles.titleColor || "var(--foreground)",
            }}
          >
            {customStyles.title || "Realce Sua Beleza Natural"}
          </h1>

          <p
            className={cn(
              "text-lg md:text-xl mb-8 text-pretty leading-relaxed max-w-2xl mx-auto transition-all duration-300",
              !customStyles.subtitleColor && "text-muted-foreground",
              getHighlightClass("hero-subtitle"),
            )}
            style={{
              fontFamily: customStyles.subtitleFont || "var(--font-subtitle)",
              color: customStyles.subtitleColor || "var(--foreground)",
            }}
          >
            {customStyles.subtitle || description}
          </p>

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
                className="h-14 px-8 text-base font-bold rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: customStyles.primaryButtonColor || "var(--primary)",
                  color: customStyles.primaryButtonTextColor || "#ffffff",
                  fontFamily: customStyles.primaryButtonFont || "var(--font-body)",
                }}
              >
                <Link href="/agendamento">
                  {customStyles.primaryButton || "Agendar Horário"}
                </Link>
              </Button>
            )}
            {pageVisibility.galeria !== false && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-bold rounded-full bg-background/50 backdrop-blur-sm border-border hover:bg-background/80 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  color:
                    customStyles.secondaryButtonTextColor ||
                    customStyles.secondaryButtonColor ||
                    "var(--foreground)",
                  borderColor: customStyles.secondaryButtonColor || "var(--secondary)",
                  fontFamily: customStyles.secondaryButtonFont || "var(--font-body)",
                }}
              >
                <Link href="/galeria">
                  {customStyles.secondaryButton || "Ver Trabalhos"}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
