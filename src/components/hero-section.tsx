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
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/context/studio-context";
import {
  defaultHeroSettings,
  getHeroSettings,
  getPageVisibility,
  getSiteProfile,
  getStorageKey,
  type HeroSettings,
  SECTION_IDS,
  type SectionsMap,
  type SiteProfile,
  sanitizeColor,
  sanitizeSection,
} from "@/lib/booking-data";
import type { SiteConfigData } from "@/lib/site-config-types";
import { cn, renderSafeText } from "@/lib/utils";
import {
  SectionBackground,
  type SectionBackgroundSettings,
} from "./admin/site_editor/components/SectionBackground";

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

  const isInsideIframe =
    typeof window !== "undefined" && window.parent !== window;
  const hasLivePreviewUpdateRef = useRef(false);
  const hasRequestedIframeSyncRef = useRef(false);

  const loadData = useCallback(() => {
    if (!config) return;

    const sections = config?.sections as SectionsMap | undefined;
    const home = config?.home as Record<string, unknown> | undefined;
    const layoutGlobal = (config?.layoutGlobal || config?.layout_global) as
      | Record<string, unknown>
      | undefined;
    const rawHero = (sections?.[SECTION_IDS.homeHero] ||
      home?.heroBanner ||
      home?.hero ||
      config?.heroBanner ||
      config?.hero ||
      layoutGlobal?.heroBanner ||
      layoutGlobal?.hero) as Record<string, unknown> | undefined;

    if (rawHero) {
      const content = (
        rawHero.content &&
        typeof rawHero.content === "object" &&
        !Array.isArray(rawHero.content)
          ? (rawHero.content as Record<string, unknown>)
          : {}
      ) as Record<string, unknown>;

      const appearance = (
        rawHero.appearance &&
        typeof rawHero.appearance === "object" &&
        !Array.isArray(rawHero.appearance)
          ? (rawHero.appearance as Record<string, unknown>)
          : {}
      ) as Record<string, unknown>;

      const bgImage =
        (rawHero.bgImage as string) ||
        (appearance.backgroundImageUrl as string) ||
        "";
      const bgColor =
        sanitizeColor(
          (rawHero.bgColor as string) ||
            (rawHero.bg_color as string) ||
            (rawHero.backgroundColor as string) ||
            (appearance.backgroundColor as string) ||
            (appearance.bgColor as string) ||
            "",
        ) || "";
      let bgType = (rawHero.bgType ||
        appearance.bgType ||
        (bgImage ? "image" : "color")) as "color" | "image";
      if (bgColor && bgColor !== "transparent" && !bgImage) {
        bgType = "color";
      }

      const normalizedHero = {
        ...rawHero,
        ...(typeof rawHero.content === "object" ? content : {}),
        ...(typeof rawHero.appearance === "object" ? appearance : {}),
        title: rawHero.title !== undefined ? rawHero.title : content.title,
        subtitle:
          rawHero.subtitle !== undefined ? rawHero.subtitle : content.subtitle,
        showTitle:
          content.showTitle !== undefined
            ? content.showTitle
            : rawHero.showTitle !== undefined
              ? rawHero.showTitle
              : true,
        showSubtitle:
          content.showSubtitle !== undefined
            ? content.showSubtitle
            : rawHero.showSubtitle !== undefined
              ? rawHero.showSubtitle
              : true,
        showBadge:
          content.showBadge !== undefined
            ? content.showBadge
            : rawHero.showBadge !== undefined
              ? rawHero.showBadge
              : true,
        badge: rawHero.badge || content.badge || "",
        badgeIcon: rawHero.badgeIcon || content.badgeIcon || "",
        badgeFont:
          rawHero.badgeFont || appearance.badgeFont || content.badgeFont,
        badgeColor: sanitizeColor(
          rawHero.badgeColor || appearance.badgeColor || content.badgeColor,
        ),
        badgeTextColor: sanitizeColor(
          rawHero.badgeTextColor ||
            appearance.badgeTextColor ||
            content.badgeTextColor,
        ),
        primaryButton: rawHero.primaryButton ?? content.primaryButton,
        primaryButtonFont:
          rawHero.primaryButtonFont ||
          appearance.primaryButtonFont ||
          content.primaryButtonFont,
        primaryButtonColor: sanitizeColor(
          rawHero.primaryButtonColor ||
            appearance.primaryButtonColor ||
            content.primaryButtonColor,
        ),
        primaryButtonTextColor: sanitizeColor(
          rawHero.primaryButtonTextColor ||
            appearance.primaryButtonTextColor ||
            content.primaryButtonTextColor,
        ),
        primaryButtonLink:
          rawHero.primaryButtonLink ?? content.primaryButtonLink,
        secondaryButton: rawHero.secondaryButton ?? content.secondaryButton,
        secondaryButtonFont:
          rawHero.secondaryButtonFont ||
          appearance.secondaryButtonFont ||
          content.secondaryButtonFont,
        secondaryButtonColor: sanitizeColor(
          rawHero.secondaryButtonColor ||
            appearance.secondaryButtonColor ||
            content.secondaryButtonColor,
        ),
        secondaryButtonTextColor: sanitizeColor(
          rawHero.secondaryButtonTextColor ||
            appearance.secondaryButtonTextColor ||
            content.secondaryButtonTextColor,
        ),
        secondaryButtonLink:
          rawHero.secondaryButtonLink ?? content.secondaryButtonLink,
        titleColor: sanitizeColor(
          rawHero.titleColor || appearance.titleColor || content.titleColor,
        ),
        subtitleColor: sanitizeColor(
          rawHero.subtitleColor ||
            appearance.subtitleColor ||
            content.subtitleColor,
        ),
        titleFont:
          rawHero.titleFont || appearance.titleFont || content.titleFont,
        subtitleFont:
          rawHero.subtitleFont ||
          appearance.subtitleFont ||
          content.subtitleFont,
        bgImage,
        bgColor,
        bgType,
      };

      if (isInsideIframe && typeof window !== "undefined") {
        const draftRaw = localStorage.getItem(getStorageKey("heroSettings"));
        if (draftRaw) {
          try {
            const draftParsed = JSON.parse(draftRaw);
            if (
              draftParsed &&
              typeof draftParsed === "object" &&
              !Array.isArray(draftParsed)
            ) {
              const mergedFromDraft = sanitizeSection(
                draftParsed,
                normalizedHero,
              ) as Record<string, unknown>;
              const mergedAppearance =
                (mergedFromDraft.appearance as
                  | Record<string, unknown>
                  | undefined) || {};
              const mergedBgImage =
                (mergedFromDraft.bgImage as string) ||
                (mergedAppearance.backgroundImageUrl as string) ||
                "";
              const mergedBgColor =
                sanitizeColor(
                  (mergedFromDraft.bgColor as string) ||
                    (mergedFromDraft.bg_color as string) ||
                    (mergedFromDraft.backgroundColor as string) ||
                    (mergedFromDraft.background_color as string) ||
                    (mergedAppearance.backgroundColor as string) ||
                    (mergedAppearance.bgColor as string) ||
                    "",
                ) || "";
              const enforcedBgType =
                mergedBgColor &&
                mergedBgColor !== "transparent" &&
                !mergedBgImage
                  ? "color"
                  : (mergedFromDraft.bgType as "color" | "image" | undefined) ||
                    (mergedAppearance.bgType as
                      | "color"
                      | "image"
                      | undefined) ||
                    (mergedBgImage ? "image" : "color");

              const heroFromDraft = {
                ...mergedFromDraft,
                bgImage: mergedBgImage,
                bgColor: mergedBgColor,
                bgType: enforcedBgType,
                appearance: {
                  ...mergedAppearance,
                  backgroundColor: mergedBgColor,
                  backgroundImageUrl: mergedBgImage,
                  bgType: enforcedBgType,
                },
              } as HeroSettings;

              setCustomStyles(heroFromDraft);
              return;
            }
          } catch (_e) {}
        }
      }

      console.log("[HeroSection] loadData: Dados normalizados com sucesso", {
        bgColor: normalizedHero.bgColor,
        bgType: normalizedHero.bgType,
      });
      setCustomStyles(normalizedHero as HeroSettings);
    } else {
      console.log(
        "[HeroSection] loadData: Nenhum dado encontrado no config, usando default",
      );
      setCustomStyles(getHeroSettings());
    }
  }, [config, isInsideIframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (config) {
      // console.log(">>> [HERO_RENDER_DEBUG]", config);
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
      } else if (
        event.data.type === "UPDATE_HERO_SETTINGS" ||
        event.data.type === "UPDATE_SITE_DATA" ||
        event.data.type === "UPDATE_SITE_CONFIG"
      ) {
        hasLivePreviewUpdateRef.current = true;

        let rawHero: Record<string, unknown> | undefined;

        if (event.data.type === "UPDATE_SITE_DATA" && event.data.data) {
          const siteData = event.data.data as Record<string, unknown>;
          const sections = siteData.sections as SectionsMap | undefined;
          const layoutGlobal = (siteData.layoutGlobal ||
            siteData.layout_global) as Record<string, unknown> | undefined;
          const home = siteData.home as Record<string, unknown> | undefined;
          rawHero = (sections?.[SECTION_IDS.homeHero] ||
            home?.heroBanner ||
            home?.hero ||
            siteData.hero ||
            layoutGlobal?.hero) as Record<string, unknown>;
        } else if (
          event.data.type === "UPDATE_SITE_CONFIG" &&
          event.data.config
        ) {
          const siteConfig = event.data.config as Record<string, unknown>;
          const sections = siteConfig.sections as SectionsMap | undefined;
          const layoutGlobal = (siteConfig.layoutGlobal ||
            siteConfig.layout_global) as Record<string, unknown> | undefined;
          const home = siteConfig.home as Record<string, unknown> | undefined;
          rawHero = (sections?.[SECTION_IDS.homeHero] ||
            home?.heroBanner ||
            home?.hero ||
            siteConfig.hero ||
            layoutGlobal?.hero) as Record<string, unknown>;
        } else {
          rawHero = event.data.settings as Record<string, unknown>;
        }

        if (rawHero) {
          const incomingContent =
            rawHero.content &&
            typeof rawHero.content === "object" &&
            !Array.isArray(rawHero.content)
              ? (rawHero.content as Record<string, unknown>)
              : {};
          console.log(">>> IFRAME_RECEIVE:", {
            type: event.data.type,
            title: rawHero.title,
            subtitle: rawHero.subtitle,
            contentTitle: incomingContent.title,
            contentSubtitle: incomingContent.subtitle,
          });

          const content = (
            rawHero.content &&
            typeof rawHero.content === "object" &&
            !Array.isArray(rawHero.content)
              ? (rawHero.content as Record<string, unknown>)
              : {}
          ) as Record<string, unknown>;

          const appearance = (
            rawHero.appearance &&
            typeof rawHero.appearance === "object" &&
            !Array.isArray(rawHero.appearance)
              ? (rawHero.appearance as Record<string, unknown>)
              : {}
          ) as Record<string, unknown>;

          const bgImage =
            (rawHero.bgImage as string) ||
            (appearance.backgroundImageUrl as string) ||
            "";
          const bgColor =
            sanitizeColor(
              (rawHero.bgColor as string) ||
                (rawHero.bg_color as string) ||
                (rawHero.backgroundColor as string) ||
                (rawHero.background_color as string) ||
                (appearance.backgroundColor as string) ||
                (appearance.bgColor as string) ||
                "",
            ) || "";
          let bgType = (rawHero.bgType ||
            appearance.bgType ||
            (bgImage ? "image" : "color")) as "color" | "image";
          if (bgColor && bgColor !== "transparent" && !bgImage) {
            bgType = "color";
          }

          const normalizedHero = {
            ...rawHero,
            ...(typeof rawHero.content === "object" ? content : {}),
            ...(typeof rawHero.appearance === "object" ? appearance : {}),
            title: rawHero.title !== undefined ? rawHero.title : content.title,
            subtitle:
              rawHero.subtitle !== undefined
                ? rawHero.subtitle
                : content.subtitle,
            showTitle:
              content.showTitle !== undefined
                ? content.showTitle
                : rawHero.showTitle !== undefined
                  ? rawHero.showTitle
                  : true,
            showSubtitle:
              content.showSubtitle !== undefined
                ? content.showSubtitle
                : rawHero.showSubtitle !== undefined
                  ? rawHero.showSubtitle
                  : true,
            showBadge:
              content.showBadge !== undefined
                ? content.showBadge
                : rawHero.showBadge !== undefined
                  ? rawHero.showBadge
                  : true,
            badge: rawHero.badge || content.badge || "",
            badgeIcon: rawHero.badgeIcon || content.badgeIcon || "",
            badgeFont:
              rawHero.badgeFont || appearance.badgeFont || content.badgeFont,
            badgeColor:
              sanitizeColor(
                rawHero.badgeColor ||
                  appearance.badgeColor ||
                  content.badgeColor,
              ) || "",
            badgeTextColor:
              sanitizeColor(
                rawHero.badgeTextColor ||
                  appearance.badgeTextColor ||
                  content.badgeTextColor,
              ) || "",
            primaryButton: rawHero.primaryButton ?? content.primaryButton,
            primaryButtonFont:
              rawHero.primaryButtonFont ||
              appearance.primaryButtonFont ||
              content.primaryButtonFont,
            primaryButtonColor:
              sanitizeColor(
                rawHero.primaryButtonColor ||
                  appearance.primaryButtonColor ||
                  content.primaryButtonColor,
              ) || "",
            primaryButtonTextColor:
              sanitizeColor(
                rawHero.primaryButtonTextColor ||
                  appearance.primaryButtonTextColor ||
                  content.primaryButtonTextColor,
              ) || "",
            primaryButtonLink:
              rawHero.primaryButtonLink ?? content.primaryButtonLink,
            secondaryButton: rawHero.secondaryButton ?? content.secondaryButton,
            secondaryButtonFont:
              rawHero.secondaryButtonFont ||
              appearance.secondaryButtonFont ||
              content.secondaryButtonFont,
            secondaryButtonColor:
              sanitizeColor(
                rawHero.secondaryButtonColor ||
                  appearance.secondaryButtonColor ||
                  content.secondaryButtonColor,
              ) || "",
            secondaryButtonTextColor:
              sanitizeColor(
                rawHero.secondaryButtonTextColor ||
                  appearance.secondaryButtonTextColor ||
                  content.secondaryButtonTextColor,
              ) || "",
            secondaryButtonLink:
              rawHero.secondaryButtonLink ?? content.secondaryButtonLink,
            titleColor:
              sanitizeColor(
                rawHero.titleColor ||
                  appearance.titleColor ||
                  content.titleColor,
              ) || "",
            subtitleColor:
              sanitizeColor(
                rawHero.subtitleColor ||
                  appearance.subtitleColor ||
                  content.subtitleColor,
              ) || "",
            titleFont:
              rawHero.titleFont || appearance.titleFont || content.titleFont,
            subtitleFont:
              rawHero.subtitleFont ||
              appearance.subtitleFont ||
              content.subtitleFont,
            bgImage,
            bgColor,
            bgType,
            appearance: {
              ...appearance,
              backgroundColor: bgColor,
              backgroundImageUrl: bgImage,
              bgType,
            },
          };

          console.log(
            "[HeroSection] handleMessage: Aplicando atualização do editor",
            {
              bgColor: normalizedHero.bgColor,
              bgType: normalizedHero.bgType,
              type: event.data.type,
            },
          );

          const safeHero = sanitizeSection(
            normalizedHero,
            defaultHeroSettings,
          ) as Partial<HeroSettings>;
          setCustomStyles((prev) => ({
            ...prev,
            ...safeHero,
          }));
        }
      }
    };

    const handleHeroSettingsUpdate = () => {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(getStorageKey("heroSettings"));
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setCustomStyles((prev) => sanitizeSection(parsed, prev));
        }
      } catch (_e) {}
    };

    const handleDataReady = () => {
      if (isInsideIframe && hasLivePreviewUpdateRef.current) {
        return;
      }
      loadData();
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("heroSettingsUpdated", handleHeroSettingsUpdate);
    window.addEventListener("pageVisibilityUpdated", () =>
      setPageVisibility(getPageVisibility()),
    );
    window.addEventListener("siteProfileUpdated", handleProfileUpdate);
    window.addEventListener("DataReady", handleDataReady);

    if (isInsideIframe && !hasRequestedIframeSyncRef.current) {
      hasRequestedIframeSyncRef.current = true;
      window.parent.postMessage({ type: "IFRAME_READY" }, "*");
    }

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(
        "heroSettingsUpdated",
        handleHeroSettingsUpdate,
      );
      window.removeEventListener("pageVisibilityUpdated", () =>
        setPageVisibility(getPageVisibility()),
      );
      window.removeEventListener("siteProfileUpdated", handleProfileUpdate);
      window.removeEventListener("DataReady", handleDataReady);
    };
  }, [isInsideIframe, loadData]);

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
        id={SECTION_IDS.homeHero}
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
  const badgeValue = customStyles.badge;
  const badgeText =
    badgeValue === undefined || badgeValue === null
      ? defaultHeroSettings.badge
      : renderSafeText(badgeValue);
  const titleValue = customStyles.title;
  const titleText =
    titleValue === undefined || titleValue === null
      ? defaultHeroSettings.title
      : renderSafeText(titleValue);
  const subtitleValue = customStyles.subtitle;
  const subtitleText =
    subtitleValue === undefined || subtitleValue === null
      ? description || defaultHeroSettings.subtitle
      : renderSafeText(subtitleValue);
  const primaryValue = customStyles.primaryButton;
  const primaryText =
    primaryValue === undefined || primaryValue === null
      ? defaultHeroSettings.primaryButton
      : renderSafeText(primaryValue);
  const secondaryValue = customStyles.secondaryButton;
  const secondaryText =
    secondaryValue === undefined || secondaryValue === null
      ? defaultHeroSettings.secondaryButton
      : renderSafeText(secondaryValue);

  return (
    <section
      id={SECTION_IDS.homeHero}
      className={cn(
        "relative min-h-[80vh] md:min-h-screen flex items-center transition-all duration-500 pt-16 md:pt-0 overflow-hidden",
        getHighlightClass(SECTION_IDS.homeHero),
      )}
    >
      <SectionBackground settings={customStyles as SectionBackgroundSettings} />

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          {customStyles.showBadge !== false && badgeText.trim().length > 0 && (
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 animate-in fade-in zoom-in duration-500",
                getHighlightClass("hero-badge"),
              )}
              style={{
                fontFamily: customStyles.badgeFont || "var(--font-body)",
                borderColor:
                  customStyles.badgeColor || "rgba(var(--accent), 0.2)",
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
                {badgeText}
              </span>
            </div>
          )}

          {customStyles.showTitle !== false && titleText.trim().length > 0 && (
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
              {titleText}
            </h1>
          )}

          {customStyles.showSubtitle !== false &&
            subtitleText.trim().length > 0 && (
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
                {subtitleText}
              </p>
            )}

          <div
            className={cn(
              "flex flex-col sm:flex-row gap-4 justify-center",
              getHighlightClass("hero-buttons"),
            )}
          >
            {pageVisibility.agendar !== false &&
              primaryText.trim().length > 0 && (
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
                    boxShadow: `0 10px 15px -3px ${customStyles.primaryButtonColor ? `${customStyles.primaryButtonColor}40` : "rgba(var(--primary), 0.25)"}`,
                  }}
                >
                  <Link href={customStyles.primaryButtonLink || "/agendamento"}>
                    {primaryText}
                  </Link>
                </Button>
              )}
            {pageVisibility.galeria !== false &&
              secondaryText.trim().length > 0 && (
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
                      customStyles.secondaryButtonColor ||
                      "var(--primary)",
                    borderColor:
                      customStyles.secondaryButtonColor || "var(--primary)",
                    backgroundColor: "transparent",
                    fontFamily:
                      customStyles.secondaryButtonFont || "var(--font-body)",
                  }}
                >
                  <Link href={customStyles.secondaryButtonLink || "/servicos"}>
                    {secondaryText}
                  </Link>
                </Button>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}
