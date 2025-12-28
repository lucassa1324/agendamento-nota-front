"use client";

import { useEffect, useState } from "react";
import {
  getColorSettings,
  getCTASettings,
  getFontSettings,
  getFooterSettings,
  getGallerySettings,
  getHeaderSettings,
  getHeroSettings,
  getServicesSettings,
  getStorySettings,
  getTeamSettings,
  getTestimonialsSettings,
  getValuesSettings,
} from "@/lib/booking-data";

export function PreviewStyleManager() {
  const [fonts, setFonts] = useState({
    headingFont: "",
    subtitleFont: "",
    bodyFont: "",
    extraFonts: [] as string[],
  });

  const [colors, setColors] = useState({
    primary: "",
    secondary: "",
    background: "",
    text: "",
  });

  useEffect(() => {
    const loadAllFonts = () => {
      const savedFonts = getFontSettings();
      const savedColors = getColorSettings();
      const heroSettings = getHeroSettings();
      const servicesSettings = getServicesSettings();
      const valuesSettings = getValuesSettings();
      const teamSettings = getTeamSettings();
      const testimonialsSettings = getTestimonialsSettings();
      const ctaSettings = getCTASettings();
      const headerSettings = getHeaderSettings();
      const footerSettings = getFooterSettings();
      const gallerySettings = getGallerySettings();
      const storySettings = getStorySettings();

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
      if (valuesSettings.cardTitleFont) extras.add(valuesSettings.cardTitleFont);
      if (valuesSettings.cardDescriptionFont)
        extras.add(valuesSettings.cardDescriptionFont);

      if (teamSettings.titleFont) extras.add(teamSettings.titleFont);
      if (teamSettings.subtitleFont) extras.add(teamSettings.subtitleFont);
      if (teamSettings.cardTitleFont) extras.add(teamSettings.cardTitleFont);
      if (teamSettings.cardRoleFont) extras.add(teamSettings.cardRoleFont);
      if (teamSettings.cardDescriptionFont)
        extras.add(teamSettings.cardDescriptionFont);

      if (testimonialsSettings.titleFont)
        extras.add(testimonialsSettings.titleFont);
      if (testimonialsSettings.subtitleFont)
        extras.add(testimonialsSettings.subtitleFont);
      if (testimonialsSettings.cardNameFont)
        extras.add(testimonialsSettings.cardNameFont);
      if (testimonialsSettings.cardTextFont)
        extras.add(testimonialsSettings.cardTextFont);
      if (ctaSettings.titleFont) extras.add(ctaSettings.titleFont);
      if (ctaSettings.subtitleFont) extras.add(ctaSettings.subtitleFont);
      if (ctaSettings.buttonFont) extras.add(ctaSettings.buttonFont);
      if (headerSettings.titleFont) extras.add(headerSettings.titleFont);
      if (headerSettings.linksFont) extras.add(headerSettings.linksFont);
      if (footerSettings.titleFont) extras.add(footerSettings.titleFont);
      if (footerSettings.bodyFont) extras.add(footerSettings.bodyFont);
      if (gallerySettings.titleFont) extras.add(gallerySettings.titleFont);
      if (gallerySettings.subtitleFont) extras.add(gallerySettings.subtitleFont);
      if (gallerySettings.buttonFont) extras.add(gallerySettings.buttonFont);
      if (storySettings.titleFont) extras.add(storySettings.titleFont);
      if (storySettings.contentFont) extras.add(storySettings.contentFont);

      setFonts({
        headingFont: savedFonts.headingFont,
        subtitleFont: savedFonts.subtitleFont || "",
        bodyFont: savedFonts.bodyFont,
        extraFonts: Array.from(extras),
      });

      setColors({
        primary: savedColors.primary,
        secondary: savedColors.secondary,
        background: savedColors.background,
        text: savedColors.text,
      });
    };

    loadAllFonts();

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_TYPOGRAPHY") {
        setFonts((prev) => ({
          ...prev,
          headingFont: event.data.settings.headingFont,
          subtitleFont: event.data.settings.subtitleFont || prev.subtitleFont,
          bodyFont: event.data.settings.bodyFont,
        }));
      } else if (event.data.type === "UPDATE_COLORS") {
        setColors({
          primary: event.data.settings.primary,
          secondary: event.data.settings.secondary,
          background: event.data.settings.background,
          text: event.data.settings.text,
        });
      } else if (event.data.type === "UPDATE_HERO_SETTINGS") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.settings?.titleFont)
            extras.add(event.data.settings.titleFont);
          if (event.data.settings?.subtitleFont)
            extras.add(event.data.settings.subtitleFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      } else if (event.data.type === "UPDATE_ABOUT_HERO_SETTINGS") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.settings?.titleFont)
            extras.add(event.data.settings.titleFont);
          if (event.data.settings?.subtitleFont)
            extras.add(event.data.settings.subtitleFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      } else if (event.data.type === "UPDATE_SERVICES_SETTINGS") {
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
      } else if (event.data.type === "UPDATE_VALUES_SETTINGS") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.settings?.titleFont)
            extras.add(event.data.settings.titleFont);
          if (event.data.settings?.subtitleFont)
            extras.add(event.data.settings.subtitleFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      } else if (event.data.type === "UPDATE_TEAM_SETTINGS") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.settings?.titleFont)
            extras.add(event.data.settings.titleFont);
          if (event.data.settings?.subtitleFont)
            extras.add(event.data.settings.subtitleFont);
          if (event.data.settings?.cardTitleFont)
            extras.add(event.data.settings.cardTitleFont);
          if (event.data.settings?.cardRoleFont)
            extras.add(event.data.settings.cardRoleFont);
          if (event.data.settings?.cardDescriptionFont)
            extras.add(event.data.settings.cardDescriptionFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      } else if (event.data.type === "UPDATE_TESTIMONIALS_SETTINGS") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.settings?.titleFont)
            extras.add(event.data.settings.titleFont);
          if (event.data.settings?.subtitleFont)
            extras.add(event.data.settings.subtitleFont);
          if (event.data.settings?.cardNameFont)
            extras.add(event.data.settings.cardNameFont);
          if (event.data.settings?.cardTextFont)
            extras.add(event.data.settings.cardTextFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      } else if (event.data.type === "UPDATE_CTA_SETTINGS") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.settings?.titleFont)
            extras.add(event.data.settings.titleFont);
          if (event.data.settings?.subtitleFont)
            extras.add(event.data.settings.subtitleFont);
          if (event.data.settings?.buttonFont)
            extras.add(event.data.settings.buttonFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      } else if (event.data.type === "UPDATE_HEADER_SETTINGS") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.settings?.titleFont)
            extras.add(event.data.settings.titleFont);
          if (event.data.settings?.linksFont)
            extras.add(event.data.settings.linksFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      } else if (event.data.type === "UPDATE_FOOTER_SETTINGS") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.settings?.titleFont)
            extras.add(event.data.settings.titleFont);
          if (event.data.settings?.bodyFont)
            extras.add(event.data.settings.bodyFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      } else if (event.data.type === "UPDATE_GALLERY_SETTINGS") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.settings?.titleFont)
            extras.add(event.data.settings.titleFont);
          if (event.data.settings?.subtitleFont)
            extras.add(event.data.settings.subtitleFont);
          if (event.data.settings?.buttonFont)
            extras.add(event.data.settings.buttonFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      } else if (event.data.type === "UPDATE_STORY_SETTINGS") {
        setFonts((prev) => {
          const extras = new Set(prev.extraFonts);
          if (event.data.settings?.titleFont)
            extras.add(event.data.settings.titleFont);
          if (event.data.settings?.contentFont)
            extras.add(event.data.settings.contentFont);
          return { ...prev, extraFonts: Array.from(extras) };
        });
      }
    };

    const handleSettingsUpdate = () => {
      loadAllFonts();
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("fontSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("colorSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("heroSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("servicesSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("valuesSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("teamSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("testimonialsSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("ctaSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("headerSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("footerSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("gallerySettingsUpdated", handleSettingsUpdate);
    window.addEventListener("storySettingsUpdated", handleSettingsUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("fontSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener("colorSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener("heroSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener(
        "servicesSettingsUpdated",
        handleSettingsUpdate,
      );
      window.removeEventListener("valuesSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener("teamSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener(
        "testimonialsSettingsUpdated",
        handleSettingsUpdate,
      );
      window.removeEventListener("ctaSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener("headerSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener("footerSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener("gallerySettingsUpdated", handleSettingsUpdate);
      window.removeEventListener("storySettingsUpdated", handleSettingsUpdate);
    };
  }, []);

  // Geramos as URLs do Google Fonts para as fontes selecionadas
  const fontFamilies = new Set<string>();
  if (fonts.headingFont)
    fontFamilies.add(fonts.headingFont.replace(/\s+/g, "+"));
  if (fonts.subtitleFont)
    fontFamilies.add(fonts.subtitleFont.replace(/\s+/g, "+"));
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
          ${fonts.bodyFont ? `--font-body: "${fonts.bodyFont}", sans-serif; --font-sans: "${fonts.bodyFont}", sans-serif;` : ""}
          ${fonts.headingFont ? `--font-title: "${fonts.headingFont}", serif; --font-serif: "${fonts.headingFont}", serif;` : ""}
          ${fonts.subtitleFont ? `--font-subtitle: "${fonts.subtitleFont}", sans-serif;` : ""}
          
          ${colors.primary ? `--primary: ${colors.primary}; --ring: ${colors.primary};` : ""}
          ${colors.secondary ? `--secondary: ${colors.secondary}; --accent: ${colors.secondary}; --muted: ${colors.secondary}1a;` : ""}
          ${colors.background ? `--background: ${colors.background}; --card: ${colors.background}; --popover: ${colors.background};` : ""}
          ${colors.text ? `--foreground: ${colors.text}; --card-foreground: ${colors.text}; --popover-foreground: ${colors.text}; --muted-foreground: ${colors.text}cc;` : ""}
        }
        
        /* Forçamos a aplicação nas classes do Tailwind se necessário */
        .font-sans, .font-body {
          font-family: ${fonts.bodyFont ? `"${fonts.bodyFont}", sans-serif` : "inherit"};
        }
        
        .font-serif, .font-title {
          font-family: ${fonts.headingFont ? `"${fonts.headingFont}", serif` : "inherit"};
        }

        .font-subtitle {
          font-family: ${fonts.subtitleFont ? `"${fonts.subtitleFont}", sans-serif` : "inherit"};
        }
        
        h1, h2, .font-serif, .font-title {
          font-family: ${fonts.headingFont ? `"${fonts.headingFont}", serif` : "inherit"};
        }

        h3, h4, .font-subtitle {
          font-family: ${fonts.subtitleFont ? `"${fonts.subtitleFont}", sans-serif` : "inherit"};
        }
        
        body, p, span, li, .font-sans, .font-body {
          font-family: ${fonts.bodyFont ? `"${fonts.bodyFont}", sans-serif` : "inherit"};
        }
      `,
        }}
      />
    </>
  );
}
