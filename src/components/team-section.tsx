"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import {
  getTeamSettings,
  SECTION_IDS,
  sanitizeColor,
  type TeamSettings,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import {
  SectionBackground,
  type SectionBackgroundSettings,
} from "./admin/site_editor/components/SectionBackground";
import { SessionWrapper } from "./admin/site_editor/components/SessionWrapper";
import type { SiteConfigData } from "./admin/site_editor/hooks/use-site-editor";

export function TeamSection() {
  const { studio, isLoading } = useStudio();
  const [settings, setSettings] = useState<TeamSettings | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const studioConfig = studio?.config;
  const isInsideIframe =
    typeof window !== "undefined" && window.parent !== window;
  const hasLivePreviewUpdateRef = useRef(false);

  // Debug log para ver a estrutura do config que chega no site público
  useEffect(() => {
    if (studioConfig) {
      console.log(">>> [TEAM_RENDER_DEBUG] Config recebida:", studioConfig);
    }
  }, [studioConfig]);

  const loadData = useCallback(() => {
    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    const config = studioConfig as SiteConfigData | undefined;
    const siteCustomization =
      config?.siteCustomization || config?.site_customization;
    const layoutGlobal =
      siteCustomization?.layoutGlobal ||
      siteCustomization?.layout_global ||
      (config as Record<string, unknown>)?.layoutGlobal ||
      (config as Record<string, unknown>)?.layout_global;
    const home = config?.home;
    const rawTeam = ((config as any)?.sections?.[SECTION_IDS.homeTeam] ||
      home?.teamSection ||
      config?.team ||
      (layoutGlobal as Record<string, unknown>)?.team) as
      | Record<string, unknown>
      | undefined;

    if (rawTeam) {
      const content = (rawTeam.content && typeof rawTeam.content === "object" && !Array.isArray(rawTeam.content)
        ? (rawTeam.content as Record<string, unknown>)
        : {}) as Record<string, unknown>;
      const appearance = (rawTeam.appearance && typeof rawTeam.appearance === "object" && !Array.isArray(rawTeam.appearance)
        ? (rawTeam.appearance as Record<string, unknown>)
        : {}) as Record<string, unknown>;

      // MAPEAMENTO PLANO: Prioriza a raiz (que vem do banco) sobre content/appearance
      const normalizedTeam = {
        ...(rawTeam && typeof rawTeam === "object" && !Array.isArray(rawTeam)
          ? (rawTeam as Record<string, unknown>)
          : {}),
        ...content,
        ...appearance,
        title: (rawTeam.title as string) || (content.title as string),
        subtitle: (rawTeam.subtitle as string) || (content.subtitle as string),
        titleColor: sanitizeColor(
          (rawTeam.titleColor as string) ||
            (appearance.titleColor as string) ||
            (content.titleColor as string),
        ),
        subtitleColor: sanitizeColor(
          (rawTeam.subtitleColor as string) ||
            (appearance.subtitleColor as string) ||
            (content.subtitleColor as string),
        ),
        titleFont:
          (rawTeam.titleFont as string) ||
          (appearance.titleFont as string) ||
          (content.titleFont as string),
        subtitleFont:
          (rawTeam.subtitleFont as string) ||
          (appearance.subtitleFont as string) ||
          (content.subtitleFont as string),
        cardBgColor: sanitizeColor(
          (rawTeam.cardBgColor as string) ||
            (rawTeam.cardBackgroundColor as string) ||
            (rawTeam.card_background_color as string) ||
            ((rawTeam.cardConfig as Record<string, unknown>)
              ?.cardBackgroundColor as string) ||
            ((rawTeam.cardConfig as Record<string, unknown>)
              ?.backgroundColor as string) ||
            (appearance.cardBgColor as string) ||
            (content.cardBgColor as string),
        ),
        cardTitleColor: sanitizeColor(
          (rawTeam.cardTitleColor as string) ||
            (appearance.cardTitleColor as string) ||
            (content.cardTitleColor as string),
        ),
        cardRoleColor: sanitizeColor(
          (rawTeam.cardRoleColor as string) ||
            (appearance.cardRoleColor as string) ||
            (content.cardRoleColor as string),
        ),
        cardDescriptionColor: sanitizeColor(
          (rawTeam.cardDescriptionColor as string) ||
            (appearance.cardDescriptionColor as string) ||
            (content.cardDescriptionColor as string),
        ),
        cardTitleFont:
          (rawTeam.cardTitleFont as string) ||
          (appearance.cardTitleFont as string) ||
          (content.cardTitleFont as string),
        cardRoleFont:
          (rawTeam.cardRoleFont as string) ||
          (appearance.cardRoleFont as string) ||
          (content.cardRoleFont as string),
        cardDescriptionFont:
          (rawTeam.cardDescriptionFont as string) ||
          (appearance.cardDescriptionFont as string) ||
          (content.cardDescriptionFont as string),
        bgImage:
          (rawTeam.bgImage as string) || appearance.backgroundImageUrl || "",
        bgColor: sanitizeColor(
          (rawTeam.bgColor as string) ||
            (rawTeam.backgroundColor as string) ||
            (appearance.backgroundColor as string) ||
            "",
        ),
      };
      setSettings(normalizedTeam as TeamSettings);
    } else {
      setSettings(getTeamSettings());
    }
  }, [studioConfig]);

  useEffect(() => {
    setIsMounted(true);
    // Só carrega os dados iniciais se não houver um preview ativo ou se não estiver no iframe
    if (!isInsideIframe || !hasLivePreviewUpdateRef.current) {
      loadData();
    }

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (
        event.data.type === "UPDATE_TEAM_SETTINGS" ||
        event.data.type === "UPDATE_SITE_DATA" ||
        event.data.type === "UPDATE_SITE_CONFIG"
      ) {
        hasLivePreviewUpdateRef.current = true;
        
        let rawTeam = event.data.settings as Record<string, unknown>;
        
        if (event.data.type === "UPDATE_SITE_DATA" && event.data.data) {
          const siteData = event.data.data as Record<string, unknown>;
          const layoutGlobal = (siteData.layoutGlobal ||
            siteData.layout_global) as Record<string, unknown> | undefined;
          const home = siteData.home as Record<string, unknown> | undefined;
          const sections = (siteData as any).sections as Record<string, unknown> | undefined;
          rawTeam = (sections?.[SECTION_IDS.homeTeam] ||
            home?.teamSection ||
            siteData.team ||
            layoutGlobal?.team) as Record<string, unknown>;
        }

        if (!rawTeam || typeof rawTeam !== "object" || Array.isArray(rawTeam)) {
          return;
        }

        const content = (rawTeam.content && typeof rawTeam.content === "object" && !Array.isArray(rawTeam.content)
          ? (rawTeam.content as Record<string, unknown>)
          : {}) as Record<string, unknown>;
        const appearance = (rawTeam.appearance && typeof rawTeam.appearance === "object" && !Array.isArray(rawTeam.appearance)
          ? (rawTeam.appearance as Record<string, unknown>)
          : {}) as Record<string, unknown>;

        const normalizedTeam = {
          ...(rawTeam && typeof rawTeam === "object" && !Array.isArray(rawTeam)
            ? (rawTeam as Record<string, unknown>)
            : {}),
          ...content,
          ...appearance,
          title: (rawTeam.title as string) || (content.title as string),
          subtitle: (rawTeam.subtitle as string) || (content.subtitle as string),
          titleColor: sanitizeColor(
            (rawTeam.titleColor as string) ||
              (appearance.titleColor as string) ||
              (content.titleColor as string),
          ),
          subtitleColor: sanitizeColor(
            (rawTeam.subtitleColor as string) ||
              (appearance.subtitleColor as string) ||
              (content.subtitleColor as string),
          ),
          titleFont:
            (rawTeam.titleFont as string) ||
            (appearance.titleFont as string) ||
            (content.titleFont as string),
          subtitleFont:
            (rawTeam.subtitleFont as string) ||
            (appearance.subtitleFont as string) ||
            (content.subtitleFont as string),
          cardBgColor: sanitizeColor(
            (rawTeam.cardBgColor as string) ||
              (rawTeam.cardBackgroundColor as string) ||
              (rawTeam.card_background_color as string) ||
              ((rawTeam.cardConfig as Record<string, unknown>)
                ?.cardBackgroundColor as string) ||
              ((rawTeam.cardConfig as Record<string, unknown>)
                ?.backgroundColor as string) ||
              (appearance.cardBgColor as string) ||
              (content.cardBgColor as string),
          ),
          cardTitleColor: sanitizeColor(
            (rawTeam.cardTitleColor as string) ||
              (appearance.cardTitleColor as string) ||
              (content.cardTitleColor as string),
          ),
          cardRoleColor: sanitizeColor(
            (rawTeam.cardRoleColor as string) ||
              (appearance.cardRoleColor as string) ||
              (content.cardRoleColor as string),
          ),
          cardDescriptionColor: sanitizeColor(
            (rawTeam.cardDescriptionColor as string) ||
              (appearance.cardDescriptionColor as string) ||
              (content.cardDescriptionColor as string),
          ),
          cardTitleFont:
            (rawTeam.cardTitleFont as string) ||
            (appearance.cardTitleFont as string) ||
            (content.cardTitleFont as string),
          cardRoleFont:
            (rawTeam.cardRoleFont as string) ||
            (appearance.cardRoleFont as string) ||
            (content.cardRoleFont as string),
          cardDescriptionFont:
            (rawTeam.cardDescriptionFont as string) ||
            (appearance.cardDescriptionFont as string) ||
            (content.cardDescriptionFont as string),
          bgImage:
            (rawTeam.bgImage as string) || appearance.backgroundImageUrl || "",
          bgColor: sanitizeColor(
            (rawTeam.bgColor as string) ||
              (rawTeam.backgroundColor as string) ||
              (appearance.backgroundColor as string) ||
              "",
          ),
        };

        setSettings((prev) =>
          prev
            ? ({ ...prev, ...normalizedTeam } as TeamSettings)
            : (normalizedTeam as TeamSettings),
        );
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === SECTION_IDS.homeTeam
      ) {
        setHighlightedElement(SECTION_IDS.homeTeam);
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
    window.addEventListener("teamSettingsUpdated", loadData);
    window.addEventListener("DataReady", handleDataReady);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("teamSettingsUpdated", loadData);
      window.removeEventListener("DataReady", handleDataReady);
    };
  }, [isInsideIframe, loadData]);

  // Fallback Skeleton enquanto carrega do banco
  if (!isMounted || isLoading) {
    return (
      <section id={SECTION_IDS.homeTeam} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="h-10 w-64 bg-gray-200 animate-pulse mx-auto mb-4 rounded"></div>
          <div className="h-6 w-96 bg-gray-200 animate-pulse mx-auto mb-12 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-gray-100 animate-pulse rounded-xl"
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
        id={SECTION_IDS.homeTeam}
        className={cn(
          "relative py-20 md:py-32 transition-all duration-500 overflow-hidden",
          highlightedElement === SECTION_IDS.homeTeam &&
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {settings.members.map((member) => (
              <Card
                key={member.id}
                className="border-border overflow-hidden backdrop-blur-sm"
                style={{
                  backgroundColor: settings.cardBgColor || "transparent",
                }}
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6 text-center">
                  <h3
                    className="text-xl font-semibold mb-1 transition-all duration-300"
                    style={{
                      color: settings.cardTitleColor || "var(--primary)",
                      fontFamily:
                        settings.cardTitleFont || "var(--font-subtitle)",
                    }}
                  >
                    {member.name}
                  </h3>
                  <p
                    className="text-sm font-medium mb-3 transition-all duration-300"
                    style={{
                      color: settings.cardRoleColor || "var(--secondary)",
                      fontFamily: settings.cardRoleFont || "var(--font-body)",
                    }}
                  >
                    {member.role}
                  </p>
                  <p
                    className="text-sm leading-relaxed transition-all duration-300"
                    style={{
                      color:
                        settings.cardDescriptionColor || "var(--foreground)",
                      fontFamily:
                        settings.cardDescriptionFont || "var(--font-body)",
                    }}
                  >
                    {member.description}
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
