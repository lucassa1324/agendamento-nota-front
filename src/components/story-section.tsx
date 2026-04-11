"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStudio } from "@/context/studio-context";
import type { SiteConfigData, SectionsMap } from "@/components/admin/site_editor/hooks/use-site-editor";
import {
  getStorageKey,
  getStorySettings,
  defaultStorySettings,
  SECTION_IDS,
  type StorySettings,
  sanitizeColor,
  sanitizeSection,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import {
  SectionBackground,
  type SectionBackgroundSettings,
} from "./admin/site_editor/components/SectionBackground";
import { SessionWrapper } from "./admin/site_editor/components/SessionWrapper";
import type { SiteConfigData } from "./admin/site_editor/hooks/use-site-editor";

const safeString = (val: unknown, defaultStr: string = ""): string => {
  if (val === null || val === undefined) return defaultStr;

  if (typeof val === "string") {
    const trimmed = val.trim();
    // Se for uma string de objeto vazio ou array vazio, tratamos como vazio
    if (trimmed === "{}" || trimmed === "[]") return defaultStr;
    return val;
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return defaultStr;
    const joined = val
      .map((item) => safeString(item, ""))
      .filter((item) => item.trim() !== "")
      .join("\n");
    return joined || defaultStr;
  }

  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;

    // Se o objeto estiver vazio, retorna o default
    if (Object.keys(obj).length === 0) return defaultStr;

    // Se for um objeto com campo 'text' ou similar que é um objeto vazio
    const candidate = obj.text ?? obj.value ?? obj.content ?? obj.title;

    if (candidate !== undefined && candidate !== val) {
      return safeString(candidate, defaultStr);
    }

    // Blindagem Adicional: Se for um objeto que não tem conteúdo textual óbvio,
    // evitamos stringificar se ele parecer "lixo" de UI ou metadados
    const keys = Object.keys(obj);
    if (
      keys.length > 0 &&
      keys.every((k) => k.startsWith("_") || k === "id" || k === "updatedAt")
    ) {
      return defaultStr;
    }

    try {
      const stringified = JSON.stringify(val);
      if (stringified === "{}" || stringified === "[]") return defaultStr;
      
      // Se o stringify resultou em algo que contém objetos vazios em campos chave, 
      // podemos ter problemas. Mas geralmente o safeString é chamado recursivamente.
      return stringified;
    } catch (_e) {
      return defaultStr;
    }
  }

  return String(val);
};

export function StorySection() {
  const { studio } = useStudio();
  const [settings, setSettings] = useState<StorySettings | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  const studioConfig = studio?.config;
  const isInsideIframe =
    typeof window !== "undefined" && window.parent !== window;
  const hasLivePreviewUpdateRef = useRef(false);

  const loadData = useCallback(() => {
    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    const config = studioConfig as SiteConfigData | undefined;
    const siteCustomization =
      config?.siteCustomization || config?.site_customization;
    const sections = config?.sections as Record<string, any> | undefined;
    const layoutGlobal =
      siteCustomization?.layoutGlobal ||
      siteCustomization?.layout_global ||
      (config as Record<string, unknown>)?.layoutGlobal ||
      (config as Record<string, unknown>)?.layout_global;
    const home = config?.home;

    const rawStory = (sections?.[SECTION_IDS.homeStory] ||
      home?.storySection ||
      home?.historySection ||
      config?.story ||
      (layoutGlobal as Record<string, unknown>)?.story) as
      | Record<string, unknown>
      | undefined;

    console.log("[StorySection] loadData - rawStory:", {
      found: !!rawStory,
      source: sections?.[SECTION_IDS.homeStory] ? "sections" : (home?.storySection ? "home.storySection" : "other"),
      hasContent: !!rawStory?.content
    });

    const isEffectivelyEmpty =
      !rawStory ||
      Object.keys(rawStory).length === 0 ||
      (Object.keys(rawStory).length === 1 && (rawStory as any).id);

    if (rawStory && !isEffectivelyEmpty) {
      const content = (rawStory.content && typeof rawStory.content === "object" && !Array.isArray(rawStory.content)
        ? (rawStory.content as Record<string, unknown>)
        : {}) as Record<string, unknown>;
      
      const appearance = (rawStory.appearance && typeof rawStory.appearance === "object" && !Array.isArray(rawStory.appearance)
        ? (rawStory.appearance as Record<string, unknown>)
        : {}) as Record<string, unknown>;

      const normalizedStory = {
        ...rawStory,
        ...(typeof rawStory.content === "object" ? content : {}),
        ...(typeof rawStory.appearance === "object" ? appearance : {}),
        title: safeString(
          content.title ?? rawStory.title ?? "",
          defaultStorySettings.title,
        ),
        content: safeString(
          content.content ?? rawStory.content ?? "",
          defaultStorySettings.content,
        ),
        titleColor: sanitizeColor(
          (rawStory.titleColor as string) ||
            (appearance.titleColor as string) ||
            (content.titleColor as string),
        ),
        titleFont:
          (rawStory.titleFont as string) ||
          (appearance.titleFont as string) ||
          (content.titleFont as string),
        contentColor: sanitizeColor(
          (rawStory.contentColor as string) ||
            (appearance.contentColor as string) ||
            (content.contentColor as string),
        ),
        contentFont:
          (rawStory.contentFont as string) ||
          (appearance.contentFont as string) ||
          (content.contentFont as string),
        bgImage:
          (rawStory.bgImage as string) ||
          (appearance.backgroundImageUrl as string) ||
          "",
        bgColor: sanitizeColor(
          (rawStory.bgColor as string) ||
            (rawStory.backgroundColor as string) ||
            (appearance.backgroundColor as string) ||
            "",
        ),
      };
      setSettings(normalizedStory as unknown as StorySettings);
    } else {
      setSettings(getStorySettings());
    }
  }, [studioConfig]);

  useEffect(() => {
    // Só carrega os dados iniciais se não houver um preview ativo ou se não estiver no iframe
    if (!isInsideIframe || !hasLivePreviewUpdateRef.current) {
      loadData();
    }

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (
        event.data.type === "UPDATE_STORY_SETTINGS" ||
        event.data.type === "UPDATE_SITE_DATA" ||
        event.data.type === "UPDATE_SITE_CONFIG"
      ) {
        hasLivePreviewUpdateRef.current = true;
        
        let rawStory = event.data.settings as Record<string, unknown> | undefined;
        
        if (event.data.type === "UPDATE_SITE_DATA" && event.data.data) {
          const siteData = event.data.data as Record<string, unknown>;
          const sections = siteData.sections as Record<string, unknown> | undefined;
          const layoutGlobal = (siteData.layoutGlobal ||
            siteData.layout_global) as Record<string, unknown> | undefined;
          const home = siteData.home as Record<string, unknown> | undefined;
          rawStory = (sections?.[SECTION_IDS.homeStory] ||
            home?.storySection ||
            home?.historySection ||
            siteData.story ||
            layoutGlobal?.story) as Record<string, unknown>;
        }

        if (!rawStory) return;

        // Blindagem contra objetos vazios ou lixo no evento de mensagem
        const isEffectivelyEmpty =
          !rawStory ||
          Object.keys(rawStory).length === 0 ||
          (Object.keys(rawStory).length === 1 && rawStory.id);

        if (isEffectivelyEmpty) {
          console.log(
            "[StorySection] Message received with empty rawStory, ignoring update",
          );
          return;
        }

        console.log("[StorySection] handleMessage - rawStory found:", {
          type: event.data.type,
          hasContent: !!rawStory.content
        });

        const content = (rawStory.content && typeof rawStory.content === "object" && !Array.isArray(rawStory.content)
          ? (rawStory.content as Record<string, unknown>)
          : {}) as Record<string, unknown>;
        
        const appearance = (rawStory.appearance && typeof rawStory.appearance === "object" && !Array.isArray(rawStory.appearance)
          ? (rawStory.appearance as Record<string, unknown>)
          : {}) as Record<string, unknown>;

        const normalizedStory = {
          ...rawStory,
          ...(typeof rawStory.content === "object" ? content : {}),
          ...(typeof rawStory.appearance === "object" ? appearance : {}),
          title: safeString(
            content.title ?? rawStory.title ?? "",
            defaultStorySettings.title,
          ),
          content: safeString(
            content.content ?? rawStory.content ?? "",
            defaultStorySettings.content,
          ),
          titleColor: sanitizeColor(
            (rawStory.titleColor as string) ||
              (appearance.titleColor as string) ||
              (content.titleColor as string),
          ),
          titleFont:
            (rawStory.titleFont as string) ||
            (appearance.titleFont as string) ||
            (content.titleFont as string),
          contentColor: sanitizeColor(
            (rawStory.contentColor as string) ||
              (appearance.contentColor as string) ||
              (content.contentColor as string),
          ),
          contentFont:
            (rawStory.contentFont as string) ||
            (appearance.contentFont as string) ||
            (content.contentFont as string),
          bgImage:
            (rawStory.bgImage as string) ||
            (appearance.backgroundImageUrl as string) ||
            "",
          bgColor: sanitizeColor(
            (rawStory.bgColor as string) ||
              (rawStory.backgroundColor as string) ||
              (appearance.backgroundColor as string) ||
              "",
          ),
        };

        setSettings((prev) =>
          prev
            ? { ...prev, ...normalizedStory }
            : (normalizedStory as unknown as StorySettings),
        );
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === SECTION_IDS.homeStory
      ) {
        setHighlightedElement(SECTION_IDS.homeStory);
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    const handleUpdate = () => {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(getStorageKey("storySettings"));
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setSettings((prev) => {
            const merged = prev
              ? sanitizeSection(parsed, prev)
              : sanitizeSection(parsed, {});
            return merged as StorySettings;
          });
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
    window.addEventListener("storySettingsUpdated", handleUpdate);
    window.addEventListener("DataReady", handleDataReady);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storySettingsUpdated", handleUpdate);
      window.removeEventListener("DataReady", handleDataReady);
    };
  }, [isInsideIframe, studioConfig, loadData]);

  if (!settings) return null;

  const contentText = safeString(settings.content);

  return (
    <SessionWrapper appearance={settings?.appearance}>
      <section
        id={SECTION_IDS.homeStory}
        className={cn(
          "relative py-20 md:py-32 overflow-hidden transition-all duration-500",
          highlightedElement === SECTION_IDS.homeStory &&
            "ring-8 ring-inset ring-primary/30 bg-primary/5",
        )}
      >
        <SectionBackground settings={settings as SectionBackgroundSettings} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-100 w-full overflow-hidden rounded-2xl shadow-xl">
              <Image
                src={
                  settings.image || "/professional-eyebrow-artist-at-work.jpg"
                }
                alt={settings.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2
                className="font-serif text-4xl md:text-5xl font-bold mb-6 text-balance transition-all duration-300"
                style={{
                  color: settings.titleColor || "var(--foreground)",
                  fontFamily: settings.titleFont || "var(--font-title)",
                }}
              >
                {settings.title}
              </h2>
              <div
                className="space-y-4 leading-relaxed transition-all duration-300"
                style={{
                  color: settings.contentColor || "var(--foreground)",
                  fontFamily: settings.contentFont || "var(--font-body)",
                }}
              >
                {typeof contentText === "string" && contentText.split ? (
                  contentText
                    .split("\n")
                    .filter((p) => p && p.trim() !== "")
                    .map((paragraph, index) => (
                      <p key={`${paragraph.slice(0, 20)}-${index}`}>
                        {paragraph}
                      </p>
                    ))
                ) : (
                  <p>{String(contentText || "")}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SessionWrapper>
  );
}
