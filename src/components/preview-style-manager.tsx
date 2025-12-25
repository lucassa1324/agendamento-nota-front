"use client";

import { useEffect, useState } from "react";
import {
  getFontSettings,
  getHeroSettings,
  getServicesSettings,
  getValuesSettings,
} from "@/lib/booking-data";

export function PreviewStyleManager() {
  const [fonts, setFonts] = useState({
    headingFont: "",
    bodyFont: "",
    extraFonts: [] as string[],
  });

  useEffect(() => {
    const loadAllFonts = () => {
      const savedFonts = getFontSettings();
      const heroSettings = getHeroSettings();
      const servicesSettings = getServicesSettings();
      const valuesSettings = getValuesSettings();

      const extras = new Set<string>();
      if (heroSettings.titleFont) extras.add(heroSettings.titleFont);
      if (heroSettings.subtitleFont) extras.add(heroSettings.subtitleFont);
      if (servicesSettings.titleFont) extras.add(servicesSettings.titleFont);
      if (servicesSettings.subtitleFont)
        extras.add(servicesSettings.subtitleFont);
      if (servicesSettings.cardTitleFont)
        extras.add(servicesSettings.cardTitleFont);
      if (servicesSettings.cardDescriptionFont)
        extras.add(servicesSettings.cardDescriptionFont);
      if (servicesSettings.cardPriceFont)
        extras.add(servicesSettings.cardPriceFont);
      if (valuesSettings.titleFont) extras.add(valuesSettings.titleFont);
      if (valuesSettings.subtitleFont) extras.add(valuesSettings.subtitleFont);

      setFonts({
        headingFont: savedFonts.headingFont,
        bodyFont: savedFonts.bodyFont,
        extraFonts: Array.from(extras),
      });
    };

    loadAllFonts();

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "UPDATE_FONTS") {
        setFonts((prev) => ({
          ...prev,
          headingFont: event.data.headingFont,
          bodyFont: event.data.bodyFont,
        }));
      } else if (event.data.type === "UPDATE_HERO_CONTENT") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.titleFont) extras.add(event.data.titleFont);
          if (event.data.subtitleFont) extras.add(event.data.subtitleFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      } else if (event.data.type === "UPDATE_SERVICES_CONTENT") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.settings?.titleFont)
            extras.add(event.data.settings.titleFont);
          if (event.data.settings?.subtitleFont)
            extras.add(event.data.settings.subtitleFont);
          if (event.data.settings?.cardTitleFont)
            extras.add(event.data.settings.cardTitleFont);
          if (event.data.settings?.cardDescriptionFont)
            extras.add(event.data.settings.cardDescriptionFont);
          if (event.data.settings?.cardPriceFont)
            extras.add(event.data.settings.cardPriceFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      } else if (event.data.type === "UPDATE_VALUES_CONTENT") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.settings?.titleFont)
            extras.add(event.data.settings.titleFont);
          if (event.data.settings?.subtitleFont)
            extras.add(event.data.settings.subtitleFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      }
    };

    const handleSettingsUpdate = () => {
      loadAllFonts();
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("fontSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("heroSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("servicesSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("valuesSettingsUpdated", handleSettingsUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("fontSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener("heroSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener(
        "servicesSettingsUpdated",
        handleSettingsUpdate,
      );
      window.removeEventListener("valuesSettingsUpdated", handleSettingsUpdate);
    };
  }, []);

  // Geramos as URLs do Google Fonts para as fontes selecionadas
  const fontFamilies = new Set<string>();
  if (fonts.headingFont)
    fontFamilies.add(fonts.headingFont.replace(/\s+/g, "+"));
  if (fonts.bodyFont) fontFamilies.add(fonts.bodyFont.replace(/\s+/g, "+"));
  for (const f of fonts.extraFonts) {
    if (f) fontFamilies.add(f.replace(/\s+/g, "+"));
  }

  const familiesArray = Array.from(fontFamilies);
  const googleFontsUrl =
    familiesArray.length > 0
      ? `https://fonts.googleapis.com/css2?${familiesArray.map((f) => `family=${f}:wght@400;500;600;700;800;900`).join("&")}&display=swap`
      : "";

  return (
    <>
      {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Dinamic injection for preview
        dangerouslySetInnerHTML={{
          __html: `
        :root {
          ${fonts.bodyFont ? `--font-sans: "${fonts.bodyFont}", sans-serif;` : ""}
          ${fonts.headingFont ? `--font-serif: "${fonts.headingFont}", serif;` : ""}
        }
        
        /* Forçamos a aplicação nas classes do Tailwind se necessário */
        .font-sans {
          font-family: ${fonts.bodyFont ? `"${fonts.bodyFont}", sans-serif` : "inherit"};
        }
        
        .font-serif {
          font-family: ${fonts.headingFont ? `"${fonts.headingFont}", serif` : "inherit"};
        }
        
        h1, h2, h3, h4, h5, h6, .font-serif {
          font-family: ${fonts.headingFont ? `"${fonts.headingFont}", serif` : "inherit"};
        }
        
        body, .font-sans {
          font-family: ${fonts.bodyFont ? `"${fonts.bodyFont}", sans-serif` : "inherit"};
        }
      `,
        }}
      />
    </>
  );
}
