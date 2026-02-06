"use client";

import { useEffect, useState } from "react";
import { useStudio } from "@/context/studio-context";
import {
  type ColorSettings,
  type FontSettings,
  getColorSettings,
  getFontSettings,
} from "@/lib/booking-data";

export function ThemeInjector() {
  const { studio, isLoading } = useStudio();
  const [colors, setColors] = useState<ColorSettings | null>(null);
  const [fonts, setFonts] = useState<FontSettings | null>(null);

  useEffect(() => {
    // 1. Carregamento Inicial com Prioridade de API
    const loadSettings = () => {
      if (isLoading) return;

      if (studio?.config) {
        // Prioridade Absoluta: Dados da API/Banco
        const config = studio.config as Record<string, unknown>;

        // Mapeamento flexível para suportar diferentes estruturas de config (camelCase ou snake_case)
        const layoutGlobal = (config.layoutGlobal || config.layout_global) as
          | Record<string, unknown>
          | undefined;
        const apiColors =
          (config.colors as ColorSettings | undefined) ||
          (layoutGlobal?.siteColors as ColorSettings | undefined) ||
          (layoutGlobal?.cores_base as ColorSettings | undefined);
        const apiFonts =
          (config.typography as FontSettings | undefined) ||
          (config.theme as FontSettings | undefined) ||
          (layoutGlobal?.fontes as FontSettings | undefined);

        if (apiColors) {
          const timestamp = new Date().toLocaleTimeString();
          console.log(
            `[THEME_API] Cores recebidas do banco às ${timestamp}:`,
            apiColors,
          );
          setColors(apiColors);
        }

        if (apiFonts) {
          setFonts(apiFonts);
        }

        if (studio.id) {
          console.log(
            `[THEME] Aplicando customização da empresa: ${studio.id}`,
          );
        }
      } else {
        // Se não houver config da API, usamos os padrões globais (NÃO localStorage)
        // Isso força o site a esperar os dados do banco ou usar o padrão limpo
        console.log(
          "[THEME_API] Studio ou Config ausente. Usando padrões iniciais.",
        );
        setColors(getColorSettings());
        setFonts(getFontSettings());
      }
    };

    loadSettings();

    // 2. Sincronia de Preview (postMessage para o iframe)
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_COLORS") {
        setColors(event.data.settings);
      } else if (event.data.type === "UPDATE_TYPOGRAPHY") {
        setFonts(event.data.settings);
      }
    };

    // 3. Escutar eventos do editor (mesma aba)
    const handleSettingsUpdate = () => {
      loadSettings();
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("colorSettingsUpdated", handleSettingsUpdate);
    window.addEventListener("fontSettingsUpdated", handleSettingsUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("colorSettingsUpdated", handleSettingsUpdate);
      window.removeEventListener("fontSettingsUpdated", handleSettingsUpdate);
    };
  }, [studio, isLoading]);

  useEffect(() => {
    if (!colors || !fonts) return;

    // Forçar Injeção Direta no DOM (:root)
    const root = document.documentElement;

    // Fonts
    if (fonts.bodyFont) {
      root.style.setProperty("--font-body", `"${fonts.bodyFont}", sans-serif`);
      root.style.setProperty("--font-sans", `"${fonts.bodyFont}", sans-serif`);
    }
    if (fonts.headingFont) {
      root.style.setProperty("--font-title", `"${fonts.headingFont}", serif`);
      root.style.setProperty("--font-serif", `"${fonts.headingFont}", serif`);
    }
    if (fonts.subtitleFont) {
      root.style.setProperty(
        "--font-subtitle",
        `"${fonts.subtitleFont}", sans-serif`,
      );
    }

    // Colors (Alinhado com Shadcn/UI e Tailwind)
    if (colors.primary) {
      root.style.setProperty("--primary", colors.primary);
      root.style.setProperty("--ring", colors.primary);
    }
    if (colors.secondary) {
      root.style.setProperty("--secondary", colors.secondary);
      root.style.setProperty("--accent", colors.secondary);
      root.style.setProperty("--muted", `${colors.secondary}1a`);
    }
    if (colors.background) {
      root.style.setProperty("--background", colors.background);
      root.style.setProperty("--card", colors.background);
      root.style.setProperty("--popover", colors.background);
    }
    if (colors.text) {
      root.style.setProperty("--foreground", colors.text);
      root.style.setProperty("--card-foreground", colors.text);
      root.style.setProperty("--popover-foreground", colors.text);
      root.style.setProperty("--muted-foreground", `${colors.text}cc`);
    }

    console.log("[THEME_DOM] Variáveis CSS injetadas diretamente no :root");
  }, [colors, fonts]);

  if (!colors || !fonts) return null;

  // Geramos as URLs do Google Fonts
  const fontFamilies = new Set<string>();
  if (fonts.headingFont)
    fontFamilies.add(fonts.headingFont.replace(/\s+/g, "+"));
  if (fonts.subtitleFont)
    fontFamilies.add(fonts.subtitleFont.replace(/\s+/g, "+"));
  if (fonts.bodyFont) fontFamilies.add(fonts.bodyFont.replace(/\s+/g, "+"));

  const familiesArray = Array.from(fontFamilies);
  const googleFontsUrl =
    familiesArray.length > 0
      ? `https://fonts.googleapis.com/css2?${familiesArray.map((f) => `family=${f}:wght@400;500;600;700;800;900`).join("&")}&display=swap`
      : "";

  return (
    <>
      {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
      <style>
        {`
        :root {
          /* Fonts */
          ${fonts.bodyFont ? `--font-body: "${fonts.bodyFont}", sans-serif; --font-sans: "${fonts.bodyFont}", sans-serif;` : ""}
          ${fonts.headingFont ? `--font-title: "${fonts.headingFont}", serif; --font-serif: "${fonts.headingFont}", serif;` : ""}
          ${fonts.subtitleFont ? `--font-subtitle: "${fonts.subtitleFont}", sans-serif;` : ""}
          
          /* Colors (Mapped to Shadcn/UI variables) */
          ${colors.primary ? `--primary: ${colors.primary}; --ring: ${colors.primary};` : ""}
          ${colors.secondary ? `--secondary: ${colors.secondary}; --accent: ${colors.secondary}; --muted: ${colors.secondary}1a;` : ""}
          ${colors.background ? `--background: ${colors.background}; --card: ${colors.background}; --popover: ${colors.background};` : ""}
          ${colors.text ? `--foreground: ${colors.text}; --card-foreground: ${colors.text}; --popover-foreground: ${colors.text}; --muted-foreground: ${colors.text}cc;` : ""}
        }
        
        /* Font Family Overrides */
        h1, h2, .font-serif, .font-title {
          font-family: ${fonts.headingFont ? `"${fonts.headingFont}", serif` : "inherit"} !important;
        }

        h3, h4, .font-subtitle {
          font-family: ${fonts.subtitleFont ? `"${fonts.subtitleFont}", sans-serif` : "inherit"} !important;
        }
        
        body, p, span, li, button, .font-sans, .font-body {
          font-family: ${fonts.bodyFont ? `"${fonts.bodyFont}", sans-serif` : "inherit"} !important;
        }
      `}
      </style>
    </>
  );
}
