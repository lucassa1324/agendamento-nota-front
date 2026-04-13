"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useStudio } from "@/context/studio-context";
import {
  defaultStorySettings,
  getStorageKey,
  getStorySettings,
  SECTION_IDS,
  type SectionsMap,
  type StorySettings,
  sanitizeColor,
  sanitizeSection,
} from "@/lib/booking-data";
import type { SiteConfigData } from "@/lib/site-config-types";
import { cn } from "@/lib/utils";
import {
  SectionBackground,
  type SectionBackgroundSettings,
} from "./admin/site_editor/components/SectionBackground";
import { SessionWrapper } from "./admin/site_editor/components/SessionWrapper";

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

const toFontFamily = (value: unknown): string => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "default") return "";
  return trimmed;
};

const pickFirstValidFont = (...values: unknown[]): string => {
  for (const value of values) {
    const font = toFontFamily(value);
    if (font) return font;
  }
  return "";
};

const resolveStoryFonts = (
  story: Record<string, unknown>,
  appearance: Record<string, unknown>,
  content: Record<string, unknown>,
): { titleFont: string; contentFont: string } => {
  const typography =
    story.typography &&
      typeof story.typography === "object" &&
      !Array.isArray(story.typography)
      ? (story.typography as Record<string, unknown>)
      : {};

  const fallbackFamily = pickFirstValidFont(
    typography.fontFamily,
    appearance.fontFamily,
    content.fontFamily,
  );

  const titleFont = pickFirstValidFont(
    story.titleFont,
    appearance.titleFont,
    content.titleFont,
  );
  const contentFont = pickFirstValidFont(
    story.contentFont,
    appearance.contentFont,
    content.contentFont,
    fallbackFamily,
  );

  return { titleFont, contentFont };
};

const ensureFontsLoadedInIframe = (fonts: string[]) => {
  if (typeof document === "undefined") return;
  const uniqueFonts = Array.from(
    new Set(
      fonts
        .map((font) => toFontFamily(font))
        .filter((font) => !!font && font !== "Inter" && font !== "Playfair Display"),
    ),
  );
  if (uniqueFonts.length === 0) return;

  const families = uniqueFonts.map((font) => font.replace(/\s+/g, "+"));
  const href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}:wght@400;500;600;700;800;900`).join("&")}&display=swap`;
  let link = document.getElementById(
    "story-dynamic-google-fonts",
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = "story-dynamic-google-fonts";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) {
    link.href = href;
  }
};

const buildSingleFontGoogleUrl = (font: string): string | null => {
  const safeFont = toFontFamily(font);
  if (!safeFont) return null;
  const family = encodeURIComponent(safeFont).replace(/%20/g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@300;400;500;600;700&display=swap`;
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
      source: sections?.[SECTION_IDS.homeStory]
        ? "sections"
        : home?.storySection
          ? "home.storySection"
          : "other",
      hasContent: !!rawStory?.content,
    });

    const isEffectivelyEmpty =
      !rawStory ||
      Object.keys(rawStory).length === 0 ||
      (Object.keys(rawStory).length === 1 && (rawStory as any).id);

    if (rawStory && !isEffectivelyEmpty) {
      const content = (
        rawStory.content &&
        typeof rawStory.content === "object" &&
        !Array.isArray(rawStory.content)
          ? (rawStory.content as Record<string, unknown>)
          : {}
      ) as Record<string, unknown>;

      const appearance = (
        rawStory.appearance &&
        typeof rawStory.appearance === "object" &&
        !Array.isArray(rawStory.appearance)
          ? (rawStory.appearance as Record<string, unknown>)
          : {}
      ) as Record<string, unknown>;

      const resolvedFonts = resolveStoryFonts(rawStory, appearance, content);
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
        titleFont: resolvedFonts.titleFont,
        contentColor: sanitizeColor(
          (rawStory.contentColor as string) ||
            (appearance.contentColor as string) ||
            (content.contentColor as string),
        ),
        contentFont: resolvedFonts.contentFont,
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

      if (isInsideIframe && typeof window !== "undefined") {
        const draftRaw = localStorage.getItem(getStorageKey("storySettings"));
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
                normalizedStory,
              ) as Record<string, unknown>;

              const draftContent = (
                mergedFromDraft.content &&
                typeof mergedFromDraft.content === "object" &&
                !Array.isArray(mergedFromDraft.content)
                  ? (mergedFromDraft.content as Record<string, unknown>)
                  : {}
              ) as Record<string, unknown>;

              const draftAppearance = (
                mergedFromDraft.appearance &&
                typeof mergedFromDraft.appearance === "object" &&
                !Array.isArray(mergedFromDraft.appearance)
                  ? (mergedFromDraft.appearance as Record<string, unknown>)
                  : {}
              ) as Record<string, unknown>;

              const storyFromDraft = {
                ...mergedFromDraft,
                ...(typeof mergedFromDraft.content === "object"
                  ? draftContent
                  : {}),
                ...(typeof mergedFromDraft.appearance === "object"
                  ? draftAppearance
                  : {}),
                ...resolveStoryFonts(mergedFromDraft, draftAppearance, draftContent),
                titleColor: sanitizeColor(
                  (mergedFromDraft.titleColor as string) ||
                    (draftAppearance.titleColor as string) ||
                    (draftContent.titleColor as string),
                ),
                contentColor: sanitizeColor(
                  (mergedFromDraft.contentColor as string) ||
                    (draftAppearance.contentColor as string) ||
                    (draftContent.contentColor as string),
                ),
              };

              ensureFontsLoadedInIframe([
                storyFromDraft.titleFont as string,
                storyFromDraft.contentFont as string,
              ]);
              setSettings(storyFromDraft as unknown as StorySettings);
              return;
            }
          } catch (_e) {}
        }
      }

      ensureFontsLoadedInIframe([
        normalizedStory.titleFont as string,
        normalizedStory.contentFont as string,
      ]);
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

        let rawStory = event.data.settings as
          | Record<string, unknown>
          | undefined;

        if (event.data.type === "UPDATE_SITE_DATA" && event.data.data) {
          const siteData = event.data.data as Record<string, unknown>;
          const sections = siteData.sections as
            | Record<string, unknown>
            | undefined;
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
          hasContent: !!rawStory.content,
        });

        const content = (
          rawStory.content &&
          typeof rawStory.content === "object" &&
          !Array.isArray(rawStory.content)
            ? (rawStory.content as Record<string, unknown>)
            : {}
        ) as Record<string, unknown>;

        const appearance = (
          rawStory.appearance &&
          typeof rawStory.appearance === "object" &&
          !Array.isArray(rawStory.appearance)
            ? (rawStory.appearance as Record<string, unknown>)
            : {}
        ) as Record<string, unknown>;

        const resolvedFonts = resolveStoryFonts(rawStory, appearance, content);
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
          titleColor:
            sanitizeColor(
              (rawStory.titleColor as string) ||
                (appearance.titleColor as string) ||
                (content.titleColor as string),
            ) || "",
          titleFont: resolvedFonts.titleFont,
          contentColor:
            sanitizeColor(
              (rawStory.contentColor as string) ||
                (appearance.contentColor as string) ||
                (content.contentColor as string),
            ) || "",
          contentFont: resolvedFonts.contentFont,
          bgImage:
            (rawStory.bgImage as string) ||
            (appearance.backgroundImageUrl as string) ||
            "",
          bgColor:
            sanitizeColor(
              (rawStory.bgColor as string) ||
                (rawStory.backgroundColor as string) ||
                (appearance.backgroundColor as string) ||
                "",
            ) || "",
        };

        ensureFontsLoadedInIframe([
          normalizedStory.titleFont as string,
          normalizedStory.contentFont as string,
        ]);
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
            const mergedRecord = merged as Record<string, unknown>;
            const mergedContent =
              mergedRecord.content &&
                typeof mergedRecord.content === "object" &&
                !Array.isArray(mergedRecord.content)
                ? (mergedRecord.content as Record<string, unknown>)
                : {};
            const mergedAppearance =
              mergedRecord.appearance &&
                typeof mergedRecord.appearance === "object" &&
                !Array.isArray(mergedRecord.appearance)
                ? (mergedRecord.appearance as Record<string, unknown>)
                : {};
            const resolvedFonts = resolveStoryFonts(
              mergedRecord,
              mergedAppearance,
              mergedContent,
            );
            ensureFontsLoadedInIframe([
              resolvedFonts.titleFont,
              resolvedFonts.contentFont,
            ]);
            return merged as StorySettings;
          });
        }
      } catch (_e) {}
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== getStorageKey("storySettings")) return;
      if (!event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setSettings((prev) => {
            const merged = prev
              ? sanitizeSection(parsed, prev)
              : sanitizeSection(parsed, defaultStorySettings);
            const mergedRecord = merged as Record<string, unknown>;
            const mergedContent =
              mergedRecord.content &&
                typeof mergedRecord.content === "object" &&
                !Array.isArray(mergedRecord.content)
                ? (mergedRecord.content as Record<string, unknown>)
                : {};
            const mergedAppearance =
              mergedRecord.appearance &&
                typeof mergedRecord.appearance === "object" &&
                !Array.isArray(mergedRecord.appearance)
                ? (mergedRecord.appearance as Record<string, unknown>)
                : {};
            const resolvedFonts = resolveStoryFonts(
              mergedRecord,
              mergedAppearance,
              mergedContent,
            );
            ensureFontsLoadedInIframe([
              resolvedFonts.titleFont,
              resolvedFonts.contentFont,
            ]);
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
    window.addEventListener("storage", handleStorage);
    window.addEventListener("DataReady", handleDataReady);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storySettingsUpdated", handleUpdate);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("DataReady", handleDataReady);
    };
  }, [isInsideIframe, loadData]);

  if (!settings) return null;

  const contentText = safeString(settings.content);
  const settingsRecord = settings as unknown as Record<string, unknown>;
  const settingsTypography =
    settingsRecord.typography &&
      typeof settingsRecord.typography === "object" &&
      !Array.isArray(settingsRecord.typography)
      ? (settingsRecord.typography as Record<string, unknown>)
      : {};
  const fallbackTypographyFont = toFontFamily(settingsTypography.fontFamily);
  const resolvedTitleFont = toFontFamily(settings.titleFont) || "var(--font-title)";
  const resolvedContentFont =
    toFontFamily(settings.contentFont) ||
    fallbackTypographyFont ||
    "var(--font-body)";
  const titleFontStyle =
    resolvedTitleFont.startsWith("var(")
      ? resolvedTitleFont
      : `"${resolvedTitleFont}", var(--font-title), serif`;
  const contentFontStyle =
    resolvedContentFont.startsWith("var(")
      ? resolvedContentFont
      : `"${resolvedContentFont}", var(--font-body), sans-serif`;
  const fontToUse =
    toFontFamily(settingsTypography.fontFamily) ||
    toFontFamily(settings.contentFont) ||
    toFontFamily(settings.titleFont);
  const fontUrl = fontToUse ? buildSingleFontGoogleUrl(fontToUse) : null;
  const sectionStyles: CSSProperties | undefined = fontToUse
    ? {
      fontFamily: `"${fontToUse}", sans-serif`,
      ["--font-sans" as "--font-sans"]: `"${fontToUse}", sans-serif`,
      ["--font-body" as "--font-body"]: `"${fontToUse}", sans-serif`,
      ["--font-heading" as "--font-heading"]: `"${fontToUse}", sans-serif`,
      ["--font-title" as "--font-title"]: `"${fontToUse}", sans-serif`,
      ["--font-serif" as "--font-serif"]: `"${fontToUse}", sans-serif`,
    }
    : undefined;

  return (
    <SessionWrapper appearance={settings?.appearance}>
      {fontUrl ? (
        <link
          id="story-section-font"
          rel="stylesheet"
          href={fontUrl}
          data-story-font={fontToUse}
        />
      ) : null}
      <section
        id={SECTION_IDS.homeStory}
        className={cn(
          "relative py-20 md:py-32 overflow-hidden transition-all duration-500",
          highlightedElement === SECTION_IDS.homeStory &&
            "ring-8 ring-inset ring-primary/30 bg-primary/5",
        )}
        style={sectionStyles}
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
                  fontFamily: titleFontStyle,
                }}
              >
                {settings.title}
              </h2>
              <div
                className="space-y-4 leading-relaxed transition-all duration-300"
                style={{
                  color: settings.contentColor || "var(--foreground)",
                  fontFamily: contentFontStyle,
                  ["--tw-prose-body" as "--tw-prose-body"]: "inherit",
                  ["--tw-prose-headings" as "--tw-prose-headings"]: "inherit",
                  ["--tw-prose-links" as "--tw-prose-links"]: "inherit",
                }}
              >
                {typeof contentText === "string" && contentText.split ? (
                  contentText
                    .split("\n")
                    .filter((p) => p && p.trim() !== "")
                    .map((paragraph, index) => (
                      <p
                        key={`${paragraph.slice(0, 20)}-${index}`}
                        style={{ fontFamily: "inherit" }}
                      >
                        {paragraph}
                      </p>
                    ))
                ) : (
                  <p style={{ fontFamily: "inherit" }}>
                    {String(contentText || "")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SessionWrapper>
  );
}
