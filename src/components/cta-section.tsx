"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/context/studio-context";
import {
  type CTASettings,
  getCTASettings,
  getPageVisibility,
  SECTION_IDS,
  sanitizeColor,
} from "@/lib/booking-data";
import { cn, renderSafeText } from "@/lib/utils";
import {
  SectionBackground,
  type SectionBackgroundSettings,
} from "./admin/site_editor/components/SectionBackground";
import { SessionWrapper } from "./admin/site_editor/components/SessionWrapper";

export function CTASection() {
  const { studio } = useStudio();
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<CTASettings | null>(null);
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
  const isInsideIframe =
    typeof window !== "undefined" && window.parent !== window;
  const hasLivePreviewUpdateRef = useRef(false);

  const loadData = useCallback(() => {
    // Tenta carregar do Storage primeiro (Rascunho)
    const localDraft = getCTASettings();
    const storageKey = `agendamento_nota_ctaSettings`;
    const hasDraft =
      typeof window !== "undefined" &&
      localStorage.getItem(storageKey) !== null;

    if (hasDraft && localDraft) {
      setSettings(localDraft);
    } else if (studioConfig) {
      // Só usa o studioConfig se não houver nada no storage e não estivermos editando
      const config = studioConfig as Record<string, unknown>;
      const layoutGlobal = (config?.layoutGlobal || config?.layout_global) as
        | Record<string, unknown>
        | undefined;

      // Buscar CTA no config ou no layoutGlobal
      const home = config?.home as Record<string, unknown> | undefined;
      const rawCTA = ((config as any)?.sections?.[SECTION_IDS.homeCta] ||
        home?.ctaSection ||
        home?.cta ||
        config?.cta ||
        layoutGlobal?.cta) as Record<string, unknown> | undefined;

      if (rawCTA) {
        const content = (
          rawCTA.content &&
          typeof rawCTA.content === "object" &&
          !Array.isArray(rawCTA.content)
            ? (rawCTA.content as Record<string, unknown>)
            : {}
        ) as Record<string, unknown>;
        const appearance = (
          rawCTA.appearance &&
          typeof rawCTA.appearance === "object" &&
          !Array.isArray(rawCTA.appearance)
            ? (rawCTA.appearance as Record<string, unknown>)
            : {}
        ) as Record<string, unknown>;
        const normalizedCTA = {
          ...(rawCTA && typeof rawCTA === "object" && !Array.isArray(rawCTA)
            ? (rawCTA as Record<string, unknown>)
            : {}),
          ...content,
          ...appearance,
          title: (content.title as string) ?? (rawCTA.title as string),
          subtitle: (content.subtitle as string) ?? (rawCTA.subtitle as string),
          titleColor: sanitizeColor(
            (rawCTA.titleColor as string) ||
              (appearance.titleColor as string) ||
              (content.titleColor as string),
          ),
          subtitleColor: sanitizeColor(
            (rawCTA.subtitleColor as string) ||
              (appearance.subtitleColor as string) ||
              (content.subtitleColor as string),
          ),
          titleFont:
            (rawCTA.titleFont as string) ||
            (appearance.titleFont as string) ||
            (content.titleFont as string),
          subtitleFont:
            (rawCTA.subtitleFont as string) ||
            (appearance.subtitleFont as string) ||
            (content.subtitleFont as string),
          buttonColor: sanitizeColor(
            (rawCTA.buttonColor as string) ||
              (appearance.buttonColor as string) ||
              (content.buttonColor as string),
          ),
          buttonTextColor: sanitizeColor(
            (rawCTA.buttonTextColor as string) ||
              (appearance.buttonTextColor as string) ||
              (content.buttonTextColor as string),
          ),
          buttonShape:
            (rawCTA.buttonShape as "pill" | "square" | "sharp") ||
            (appearance.buttonShape as "pill" | "square" | "sharp") ||
            (content.buttonShape as "pill" | "square" | "sharp"),
          buttonLink:
            (content.buttonLink as string) ?? (rawCTA.buttonLink as string),
          bgImage:
            (rawCTA.bgImage as string) ||
            (appearance.backgroundImageUrl as string) ||
            "",
          bgColor: sanitizeColor(
            (rawCTA.bgColor as string) ||
              (rawCTA.backgroundColor as string) ||
              (appearance.backgroundColor as string) ||
              "",
          ),
        };
        setSettings(normalizedCTA as CTASettings);
      } else {
        setSettings(getCTASettings());
      }
    } else {
      setSettings(getCTASettings());
    }
  }, [studioConfig]);

  // 1. Efeito para carregar estado inicial e reagir ao studioConfig
  useEffect(() => {
    setIsMounted(true);
    setPageVisibility(getPageVisibility());

    // Só sincroniza se não estivermos no iframe ou se ainda não houve atualização de preview
    if (!isInsideIframe || !hasLivePreviewUpdateRef.current) {
      loadData();
    }
  }, [loadData, isInsideIframe]);

  // 2. Efeito para Listeners de Eventos e Mensagens
  useEffect(() => {
    const handleVisibilityUpdate = () => {
      setPageVisibility(getPageVisibility());
    };

    const handleSettingsUpdate = () => {
      // Se não estivermos em modo de edição ativa via postMessage, podemos atualizar pelo storage
      if (!isInsideIframe || !hasLivePreviewUpdateRef.current) {
        setSettings(getCTASettings());
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (
        event.data.type === "UPDATE_CTA_SETTINGS" ||
        event.data.type === "UPDATE_SITE_DATA" ||
        event.data.type === "UPDATE_SITE_CONFIG"
      ) {
        hasLivePreviewUpdateRef.current = true;

        let rawCTA = event.data.settings as Record<string, unknown> | undefined;

        if (event.data.type === "UPDATE_SITE_DATA" && event.data.data) {
          const siteData = event.data.data as Record<string, unknown>;
          const layoutGlobal = (siteData.layoutGlobal ||
            siteData.layout_global) as Record<string, unknown> | undefined;
          const home = siteData.home as Record<string, unknown> | undefined;
          const sections = (siteData as any).sections as
            | Record<string, unknown>
            | undefined;
          rawCTA = (sections?.[SECTION_IDS.homeCta] ||
            home?.ctaSection ||
            home?.cta ||
            siteData.cta ||
            layoutGlobal?.cta) as Record<string, unknown>;
        } else if (
          event.data.type === "UPDATE_SITE_CONFIG" &&
          event.data.config
        ) {
          const siteConfig = event.data.config as Record<string, unknown>;
          const layoutGlobal = (siteConfig.layoutGlobal ||
            siteConfig.layout_global) as Record<string, unknown> | undefined;
          const home = siteConfig.home as Record<string, unknown> | undefined;
          const sections = (siteConfig as any).sections as
            | Record<string, unknown>
            | undefined;
          rawCTA = (sections?.[SECTION_IDS.homeCta] ||
            home?.ctaSection ||
            home?.cta ||
            siteConfig.cta ||
            layoutGlobal?.cta) as Record<string, unknown>;
        }

        if (rawCTA) {
          const content = (
            rawCTA.content &&
            typeof rawCTA.content === "object" &&
            !Array.isArray(rawCTA.content)
              ? (rawCTA.content as Record<string, unknown>)
              : {}
          ) as Record<string, unknown>;
          const appearance = (
            rawCTA.appearance &&
            typeof rawCTA.appearance === "object" &&
            !Array.isArray(rawCTA.appearance)
              ? (rawCTA.appearance as Record<string, unknown>)
              : {}
          ) as Record<string, unknown>;
          const normalizedCTA = {
            ...(rawCTA && typeof rawCTA === "object" && !Array.isArray(rawCTA)
              ? (rawCTA as Record<string, unknown>)
              : {}),
            ...content,
            ...appearance,
            title: (content.title as string) ?? (rawCTA.title as string),
            subtitle:
              (content.subtitle as string) ?? (rawCTA.subtitle as string),
            titleColor: sanitizeColor(
              (rawCTA.titleColor as string) ||
                (appearance.titleColor as string) ||
                (content.titleColor as string),
            ),
            subtitleColor: sanitizeColor(
              (rawCTA.subtitleColor as string) ||
                (appearance.subtitleColor as string) ||
                (content.subtitleColor as string),
            ),
            titleFont:
              (rawCTA.titleFont as string) ||
              (appearance.titleFont as string) ||
              (content.titleFont as string),
            subtitleFont:
              (rawCTA.subtitleFont as string) ||
              (appearance.subtitleFont as string) ||
              (content.subtitleFont as string),
            buttonColor: sanitizeColor(
              (rawCTA.buttonColor as string) ||
                (appearance.buttonColor as string) ||
                (content.buttonColor as string),
            ),
            buttonTextColor: sanitizeColor(
              (rawCTA.buttonTextColor as string) ||
                (appearance.buttonTextColor as string) ||
                (content.buttonTextColor as string),
            ),
            buttonLink:
              (content.buttonLink as string) ?? (rawCTA.buttonLink as string),
            bgImage:
              (rawCTA.bgImage as string) ||
              (appearance.backgroundImageUrl as string) ||
              "",
            bgColor: sanitizeColor(
              (rawCTA.bgColor as string) ||
                (rawCTA.backgroundColor as string) ||
                (appearance.backgroundColor as string) ||
                "",
            ),
          };
          setSettings((prev) => {
            if (!prev) return normalizedCTA as CTASettings;
            return { ...prev, ...normalizedCTA } as CTASettings;
          });
        }
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === SECTION_IDS.homeCta
      ) {
        setHighlightedElement(SECTION_IDS.homeCta);
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
    window.addEventListener("pageVisibilityUpdated", handleVisibilityUpdate);
    window.addEventListener("ctaSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("DataReady", handleDataReady);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(
        "pageVisibilityUpdated",
        handleVisibilityUpdate,
      );
      window.removeEventListener("ctaSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener("DataReady", handleDataReady);
    };
  }, [isInsideIframe, loadData]);

  if (!isMounted || !settings) return null;
  if (pageVisibility.agendar === false) return null;

  return (
    <SessionWrapper appearance={settings?.appearance}>
      <section
        id={SECTION_IDS.homeCta}
        className={cn(
          "py-20 md:py-32 relative overflow-hidden transition-all duration-500",
          highlightedElement === SECTION_IDS.homeCta &&
            "ring-4 ring-primary ring-inset z-50",
        )}
      >
        <SectionBackground settings={settings as SectionBackgroundSettings} />

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
              {renderSafeText(settings.title || "")}
            </h2>
            <p
              className="text-lg mb-8 text-pretty leading-relaxed max-w-2xl mx-auto"
              style={{
                fontFamily: settings.subtitleFont || "var(--font-subtitle)",
                color: settings.subtitleColor || "var(--foreground)",
              }}
            >
              {renderSafeText(settings.subtitle || "")}
            </p>
            <Button
              asChild
              size="lg"
              className="text-lg px-8 shadow-lg transition-all duration-300 hover:scale-105"
              style={{
                fontFamily: settings.buttonFont || "var(--font-body)",
                backgroundColor: settings.buttonColor || "var(--primary)",
                color: settings.buttonTextColor || "#ffffff",
                boxShadow: `0 10px 15px -3px ${settings.buttonColor ? `${settings.buttonColor}40` : "rgba(var(--primary), 0.25)"}`,
              }}
            >
              <Link href={settings.buttonLink || "/agendamento"}>
                {renderSafeText(settings.buttonText || "Agendar Horário")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SessionWrapper>
  );
}
