"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getStorySettings, type StorySettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";

export function StorySection() {
  const [settings, setSettings] = useState<StorySettings | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getStorySettings());

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "UPDATE_STORY_CONTENT") {
        setSettings((prev) => prev ? { ...prev, ...event.data.settings } : prev);
      }

      if (event.data.type === "HIGHLIGHT_SECTION" && event.data.sectionId === "story") {
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
  }, []);

  if (!settings) return null;

  return (
    <section 
              id="story" 
              className={cn(
                "py-20 md:py-32 transition-all duration-500",
                highlightedElement === "story" && "ring-8 ring-inset ring-primary/30 bg-primary/5"
              )}
            >
              <div className="container mx-auto px-4">
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
              className="font-serif text-4xl md:text-5xl font-bold mb-6 text-balance transition-colors duration-300"
              style={{ color: settings.titleColor || undefined }}
            >
              {settings.title}
            </h2>
            <div 
              className="space-y-4 leading-relaxed transition-colors duration-300"
              style={{ color: settings.contentColor || undefined }}
            >
              {settings.content.split('\n').map((paragraph, i) => (
                <p key={i} className={cn(!settings.contentColor && "text-muted-foreground")}>
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
