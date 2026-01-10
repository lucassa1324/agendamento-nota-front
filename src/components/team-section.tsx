"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getTeamSettings, type TeamSettings } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { SectionBackground } from "./admin/site_editor/components/SectionBackground";
import { useStudio } from "@/context/studio-context";

export function TeamSection() {
  const { studio } = useStudio();
  const [settings, setSettings] = useState<TeamSettings | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  const loadData = useCallback(() => {
    // Se tivermos dados do studio via context (multi-tenant), usamos eles
    if (studio?.config?.team) {
      setSettings(studio.config.team as TeamSettings);
    } else {
      setSettings(getTeamSettings());
    }
  }, [studio]);

  useEffect(() => {
    setIsMounted(true);
    loadData();

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_TEAM_SETTINGS") {
        setSettings((prev) =>
          prev ? { ...prev, ...event.data.settings } : prev,
        );
      }

      if (
        event.data.type === "HIGHLIGHT_SECTION" &&
        event.data.sectionId === "team"
      ) {
        setHighlightedElement("team");
        setTimeout(() => setHighlightedElement(null), 2000);
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("teamSettingsUpdated", loadData);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("teamSettingsUpdated", loadData);
    };
  }, [loadData]);

  if (!settings) return null;
  if (!isMounted) return null;

  return (
    <section
      id="team"
      className={cn(
        "relative py-20 md:py-32 transition-all duration-500 overflow-hidden",
        highlightedElement === "team" &&
          "ring-8 ring-inset ring-primary/30 bg-primary/5",
      )}
    >
      <SectionBackground settings={settings} />

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
                    fontFamily: settings.cardTitleFont || "var(--font-subtitle)",
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
                    color: settings.cardDescriptionColor || "var(--foreground)",
                    fontFamily: settings.cardDescriptionFont || "var(--font-body)",
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
  );
}
