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
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";
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
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const [isMounted, setIsMounted] = useState(false);

  const config = studio?.config as SiteConfigData | undefined;

  // Log de depuração solicitado para verificar a estrutura dos dados
  useEffect(() => {
    if (config) {
      console.log(">>> [HERO_RENDER_DEBUG]", config);
    }
  }, [config]);

  useEffect(() => {
    const isPreview = window.location.search.includes("preview=true");
    setIsMounted(true);
    setProfile(getSiteProfile());

    // Carregar configurações iniciais
    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    const home = config?.home as Record<string, unknown> | undefined;
    const layoutGlobal = (config?.layoutGlobal || config?.layout_global) as Record<string, unknown> | undefined;
    const rawHero = (home?.heroBanner || home?.hero || config?.heroBanner || config?.hero || layoutGlobal?.heroBanner || layoutGlobal?.hero) as Record<string, unknown> | undefined;

    if (!isPreview && rawHero) {
      const content = (rawHero.content as Record<string, unknown>) || {};
      const appearance = (rawHero.appearance as Record<string, unknown>) || {};
      
      // Mapeamento Robusto: Prioriza a RAIZ (conforme logs do banco), depois content, depois appearance
      const normalizedHero = {
        ...rawHero,
        ...content,
        ...appearance,
        title: content.title ?? rawHero.title,
        subtitle: content.subtitle ?? rawHero.subtitle,
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
    setPageVisibility(getPageVisibility());

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_HERO_SETTINGS") {
        console.log(
          ">>> [HERO_SYNC] Atualização recebida via MessageEvent:",
          renderSafeText(event.data.settings.title),
        );

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

        setCustomStyles((prev) => ({
          ...prev,
          ...updatedSettings,
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

    const handleDataReady = () => {
      // Se estivermos em modo preview, não aceite dados vindos de 'DataReady' ou 'fetch' direto do banco.
      // Apenas aceite dados vindos via 'window.addEventListener("message", ...)'
      if (isPreview) {
        console.log(
          "[HERO_SYNC] Modo Preview detectado. Bloqueando sobreposição pelo banco.",
        );
        return;
      }
      const cfg = config;
      const home = cfg?.home as Record<string, unknown> | undefined;
      const lg = (cfg?.layoutGlobal || cfg?.layout_global) as Record<string, unknown> | undefined;
      const rawHero = (home?.heroBanner || home?.hero || cfg?.heroBanner || cfg?.hero || lg?.heroBanner || lg?.hero) as Record<string, unknown> | undefined;
      if (rawHero) {
        const content = (rawHero.content as Record<string, unknown>) || {};
        const appearance = (rawHero.appearance as Record<string, unknown>) || {};
        
        // Mapeamento Robusto: Prioriza a RAIZ (conforme logs do banco), depois content, depois appearance
        const normalizedHero = {
          ...rawHero,
          ...content,
          ...appearance,
          title: content.title ?? rawHero.title,
          subtitle: content.subtitle ?? rawHero.subtitle,
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
      }
    };

    const handleProfileUpdate = () => {
      setProfile(getSiteProfile());
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("heroSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("pageVisibilityUpdated", handleVisibilityUpdate);
    window.addEventListener("siteProfileUpdated", handleProfileUpdate);
    window.addEventListener("DataReady", handleDataReady);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("heroSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener(
        "pageVisibilityUpdated",
        handleVisibilityUpdate,
      );
      window.removeEventListener("siteProfileUpdated", handleProfileUpdate);
      window.removeEventListener("DataReady", handleDataReady);
    };
  }, [config]);

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

  const heroBackgroundUrl =
    customStyles.bgImage || customStyles.appearance?.backgroundImageUrl;
  const effectiveOverlayOpacity =
    customStyles.appearance?.overlay?.opacity ??
    (heroBackgroundUrl ? 0 : customStyles.overlayOpacity);
  const effectiveImageOpacity =
    heroBackgroundUrl && !customStyles.appearance?.overlay
      ? 1
      : customStyles.imageOpacity;

  const getHighlightClass = (id: string) => {
    return highlightedElement === id
      ? "ring-4 ring-primary ring-offset-4 rounded-lg transition-all duration-500 scale-[1.02] z-20 relative"
      : "transition-all duration-500 relative";
  };

  const description =
    profile?.description ||
    "Transforme seu olhar com técnicas profissionais de design de sobrancelhas. Atendimento personalizado para destacar sua beleza única.";

  const hasImage = !!heroBackgroundUrl && heroBackgroundUrl.trim() !== "";

  // Prioriza explicitamente a cor do banco/studio se disponível
  const effectiveBackgroundColor =
    customStyles.appearance?.backgroundColor ||
    customStyles.bgColor ||
    "#ffffff";

  useEffect(() => {
    if (isMounted) {
      console.log("[SINC_SUCESSO] Lógica de fundo blindada", {
        backgroundColor: effectiveBackgroundColor,
        bgType: customStyles.bgType,
      });
    }
  }, [isMounted, effectiveBackgroundColor, customStyles.bgType]);

  if (!isMounted || isLoading) {
    return (
      <section
        id="hero"
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

  return (
    <SessionWrapper appearance={customStyles.appearance}>
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
            // Aqui forçamos o tipo correto: se não tem URL ou se o tipo explicitamente for cor, o tipo TEM que ser 'color'
            bgType: (customStyles.bgType === "color" || !hasImage
              ? "color"
              : "image") as "color" | "image",
            bgColor: effectiveBackgroundColor,
            bgImage: heroBackgroundUrl || "",
            imageOpacity: effectiveImageOpacity,
            overlayOpacity: effectiveOverlayOpacity,
            imageScale: customStyles.imageScale,
            imageX: customStyles.imageX,
            imageY: customStyles.imageY,
            appearance: {
              ...customStyles.appearance,
              backgroundColor: effectiveBackgroundColor,
            },
          }}
          // Deixe o defaultImage vazio para ele não inventar imagem sozinho
          defaultImage=""
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
                  fontFamily: customStyles.titleFont || "var(--font-title)",
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
                  fontFamily: customStyles.subtitleFont || "var(--font-subtitle)",
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
