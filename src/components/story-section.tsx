"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  SectionBackground,
  type SectionBackgroundSettings,
} from "@/components/admin/site_editor/components/SectionBackground";
import { SessionWrapper } from "@/components/admin/site_editor/components/SessionWrapper";
import type { SiteConfigData } from "@/components/admin/site_editor/hooks/use-site-editor";
import { useStudio } from "@/context/studio-context";
import {
  getStorySettings,
  type StorySettings,
  sanitizeColor,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";

const safeString = (val: unknown, defaultStr: string = ""): string => {
  if (typeof val === "string") return val;
  if (val === null || val === undefined) return defaultStr;
  
  if (Array.isArray(val)) {
    const joined = val
      .map((item) => safeString(item, ""))
      .filter((item) => item.trim() !== "")
      .join("\n");
    return joined || defaultStr;
  }
  
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    const candidate =
      obj.text ?? obj.value ?? obj.content ?? obj.title;
    
    if (candidate !== undefined && candidate !== val) {
      return safeString(candidate, defaultStr);
    }
    
    try {
      return JSON.stringify(val);
    } catch (e) {
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

  useEffect(() => {
    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    const config = studioConfig as SiteConfigData | undefined;
    const siteCustomization = config?.siteCustomization || config?.site_customization;
    const layoutGlobal = siteCustomization?.layoutGlobal || 
                        siteCustomization?.layout_global || 
                        (config as Record<string, unknown>)?.layoutGlobal || 
                        (config as Record<string, unknown>)?.layout_global;
    const home = config?.home;
    const rawStory = (home?.storySection || home?.historySection || config?.story || (layoutGlobal as Record<string, unknown>)?.story) as Record<string, unknown> | undefined;

    if (rawStory) {
      const content = (rawStory.content as Record<string, unknown>) || {};
      const appearance = (rawStory.appearance as Record<string, unknown>) || {};

      const normalizedStory = {
        ...rawStory,
        ...content,
        ...appearance,
        title: safeString(content.title ?? rawStory.title ?? ""),
        content: safeString(content.content ?? rawStory.content ?? ""),
        titleColor: sanitizeColor(
          (rawStory.titleColor as string) || (appearance.titleColor as string) || (content.titleColor as string),
        ),
        titleFont:
          (rawStory.titleFont as string) || (appearance.titleFont as string) || (content.titleFont as string),
        contentColor: sanitizeColor(
          (rawStory.contentColor as string) ||
            (appearance.contentColor as string) ||
            (content.contentColor as string),
        ),
        contentFont:
          (rawStory.contentFont as string) ||
          (appearance.contentFont as string) ||
          (content.contentFont as string),
        bgImage: (rawStory.bgImage as string) || (appearance.backgroundImageUrl as string) || "",
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

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_STORY_SETTINGS") {
        const rawStory = event.data.settings as Record<string, unknown>;
        if (!rawStory) return;

        const content = (rawStory.content as Record<string, unknown>) || {};
        const appearance = (rawStory.appearance as Record<string, unknown>) || {};

        const normalizedStory = {
          ...rawStory,
          ...content,
          ...appearance,
          title: safeString(content.title ?? rawStory.title ?? ""),
          content: safeString(content.content ?? rawStory.content ?? ""),
          titleColor: sanitizeColor(
            (rawStory.titleColor as string) || (appearance.titleColor as string) || (content.titleColor as string),
          ) || "",
          titleFont:
            safeString(
              (rawStory.titleFont as string) ||
                (appearance.titleFont as string) ||
                (content.titleFont as string),
            ),
          contentColor: sanitizeColor(
            (rawStory.contentColor as string) ||
              (appearance.contentColor as string) ||
              (content.contentColor as string),
          ) || "",
          contentFont:
            safeString(
              (rawStory.contentFont as string) ||
                (appearance.contentFont as string) ||
                (content.contentFont as string),
            ),
          bgImage: (rawStory.bgImage as string) || (appearance.backgroundImageUrl as string) || "",
          bgColor: sanitizeColor(
            (rawStory.bgColor as string) ||
              (rawStory.backgroundColor as string) ||
              (appearance.backgroundColor as string) ||
              "",
          ) || "",
        };

        setSettings((prev) =>
          prev ? { ...prev, ...normalizedStory } : (normalizedStory as unknown as StorySettings),
        );
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === "story"
      ) {
        setHighlightedElement("story");
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    const handleUpdate = () => {
      setSettings(getStorySettings());
    };
    const handleDataReady = () => {
      const cfg = studioConfig as SiteConfigData | undefined;
      const lg = (cfg?.layoutGlobal || cfg?.layout_global) as Record<string, unknown> | undefined;
      const homeData = cfg?.home;
      const rawStoryData = (homeData?.storySection || homeData?.historySection || cfg?.story || lg?.story) as Record<string, unknown> | undefined;
      if (rawStoryData) {
        const content = (rawStoryData.content as Record<string, unknown>) || {};
        const appearance = (rawStoryData.appearance as Record<string, unknown>) || {};

        const normalizedStory = {
          ...rawStoryData,
          ...content,
          ...appearance,
          title: safeString(content.title ?? rawStoryData.title ?? ""),
          content: safeString(content.content ?? rawStoryData.content ?? ""),
          titleColor: sanitizeColor(
            (rawStoryData.titleColor as string) || (appearance.titleColor as string) || (content.titleColor as string),
          ) || "",
          titleFont:
            safeString(
              (rawStoryData.titleFont as string) ||
                (appearance.titleFont as string) ||
                (content.titleFont as string),
            ),
          contentColor: sanitizeColor(
            (rawStoryData.contentColor as string) ||
              (appearance.contentColor as string) ||
              (content.contentColor as string),
          ) || "",
          contentFont:
            safeString(
              (rawStoryData.contentFont as string) ||
                (appearance.contentFont as string) ||
                (content.contentFont as string),
            ),
          bgImage: (rawStoryData.bgImage as string) || (appearance.backgroundImageUrl as string) || "",
          bgColor: sanitizeColor(
            (rawStoryData.bgColor as string) ||
              (rawStoryData.backgroundColor as string) ||
              (appearance.backgroundColor as string) ||
              "",
          ) || "",
        };
        setSettings(normalizedStory as unknown as StorySettings);
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("storySettingsUpdated", handleUpdate);
    window.addEventListener("DataReady", handleDataReady);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storySettingsUpdated", handleUpdate);
      window.removeEventListener("DataReady", handleDataReady);
    };
  }, [studioConfig]);

  if (!settings) return null;

  const contentText = safeString(settings.content);

  return (
    <SessionWrapper appearance={settings?.appearance}>
      <section
        id="historia"
        className={cn(
          "relative py-20 md:py-32 overflow-hidden transition-all duration-500",
          highlightedElement === "historia" &&
            "ring-8 ring-inset ring-primary/30 bg-primary/5",
        )}
      >
        <SectionBackground settings={settings as SectionBackgroundSettings} />
        <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-100 w-full overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={settings.image || "/professional-eyebrow-artist-at-work.jpg"}
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
                    <p key={`${paragraph.slice(0, 20)}-${index}`}>{paragraph}</p>
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
