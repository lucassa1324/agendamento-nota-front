"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { SectionBackground } from "@/components/admin/site_editor/components/SectionBackground";
import { useStudio } from "@/context/studio-context";
import { getStorySettings, type StorySettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";

export function StorySection() {
  const { studio } = useStudio();
  const [settings, setSettings] = useState<StorySettings | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    if (studio?.config?.story) {
      setSettings(studio.config.story as StorySettings);
    } else {
      setSettings(getStorySettings());
    }

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_STORY_SETTINGS") {
        setSettings((prev) =>
          prev ? { ...prev, ...event.data.settings } : prev,
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

    window.addEventListener("message", handleMessage);
    window.addEventListener("storySettingsUpdated", handleUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storySettingsUpdated", handleUpdate);
    };
  }, [studio]);

  if (!settings) return null;

  return (
    <section
      id="story"
      className={cn(
        "relative py-20 md:py-32 overflow-hidden transition-all duration-500",
        highlightedElement === "story" &&
          "ring-8 ring-inset ring-primary/30 bg-primary/5",
      )}
    >
      <SectionBackground settings={settings} />
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
                fontFamily: settings.titleFont || "var(--font-title)"
              }}
            >
              {settings.title}
            </h2>
            <div
              className="space-y-4 leading-relaxed transition-all duration-300"
              style={{ 
                color: settings.contentColor || "var(--foreground)",
                fontFamily: settings.contentFont || "var(--font-body)"
              }}
            >
              {settings.content
                .split("\n")
                .filter((p) => p.trim() !== "")
                .map((paragraph, index) => (
                  <p
                    key={`${paragraph.slice(0, 20)}-${index}`}
                  >
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
