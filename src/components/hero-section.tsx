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
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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

export function HeroSection() {
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
    setCustomStyles(getHeroSettings());
    setPageVisibility(getPageVisibility());

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data.type === "UPDATE_HERO_BG" ||
        event.data.type === "UPDATE_HERO_CONTENT"
      ) {
        setCustomStyles((prev) => ({
          ...prev,
          ...event.data,
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
  }, []);

  const getHighlightClass = (id: string) => {
    return highlightedElement === id
      ? "ring-4 ring-primary ring-offset-4 rounded-lg transition-all duration-500 scale-[1.02] z-20 relative"
      : "transition-all duration-500 relative";
  };

  const description =
    profile?.description ||
    "Transforme seu olhar com técnicas profissionais de design de sobrancelhas. Atendimento personalizado para destacar sua beleza única.";

  const bgStyle =
    customStyles.bgType === "color"
      ? { backgroundColor: customStyles.bgColor || "transparent" }
      : {};

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
      style={bgStyle}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {(customStyles.bgType === "image" ||
          (!customStyles.bgType && true)) && (
          <Image
            src={
              customStyles.bgImage ||
              "/elegant-eyebrow-studio-interior-with-soft-lighting.jpg"
            }
            alt="Studio"
            fill
            className="object-cover"
            style={{
              opacity: customStyles.imageOpacity ?? 0.2,
              transform: `scale(${customStyles.imageScale ?? 1})`,
              objectPosition: `${customStyles.imageX ?? 50}% ${customStyles.imageY ?? 50}%`,
            }}
            priority
            unoptimized={!!customStyles.bgImage}
          />
        )}
        <div
          className="absolute inset-0 bg-linear-to-b from-background/50 via-background/80 to-background"
          style={{ opacity: customStyles.overlayOpacity ?? 1 }}
        />
      </div>

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
                fontFamily: customStyles.badgeFont,
                borderColor: customStyles.badgeColor
                  ? `${customStyles.badgeColor}33`
                  : undefined,
                backgroundColor: customStyles.badgeColor
                  ? `${customStyles.badgeColor}11`
                  : undefined,
              }}
            >
              {(() => {
                const BadgeIcon =
                  iconMap[customStyles.badgeIcon || "Sparkles"] || Sparkles;
                return (
                  <BadgeIcon
                    className="w-4 h-4"
                    style={{ color: customStyles.badgeColor || undefined }}
                  />
                );
              })()}
              <span
                className="text-sm font-medium"
                style={{
                  color:
                    customStyles.badgeTextColor ||
                    customStyles.badgeColor ||
                    undefined,
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
              fontFamily: customStyles.titleFont,
              color: customStyles.titleColor || undefined,
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
              fontFamily: customStyles.subtitleFont,
              color: customStyles.subtitleColor || undefined,
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
                  backgroundColor: customStyles.primaryButtonColor || undefined,
                  color: customStyles.primaryButtonTextColor || undefined,
                  fontFamily: customStyles.primaryButtonFont,
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
                    undefined,
                  borderColor: customStyles.secondaryButtonColor || undefined,
                  fontFamily: customStyles.secondaryButtonFont,
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
