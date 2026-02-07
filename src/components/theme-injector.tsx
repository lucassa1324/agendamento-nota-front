"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LayoutGlobalSettings, SiteConfigData } from "@/components/admin/site_editor/hooks/use-site-editor";
import { useStudio } from "@/context/studio-context";
import {
  type ColorSettings,
  type FontSettings,
  getColorSettings,
  getFontSettings,
} from "@/lib/booking-data";

export function ThemeInjector() {
  const pathname = usePathname();
  const { studio, isLoading } = useStudio();
  const [colors, setColors] = useState<ColorSettings | null>(null);
  const [fonts, setFonts] = useState<FontSettings | null>(null);

  // Páginas que NÃO devem receber o tema customizado (usam cores base/fixas)
  const isFixedColorPage =
    pathname === "/admin" ||
    pathname === "/admin/register" ||
    pathname?.startsWith("/admin/login");

  useEffect(() => {
    // Se for uma página de cores fixas, resetamos qualquer estilo injetado e não carregamos nada
    if (isFixedColorPage) {
      console.log(`[THEME] Cores fixas aplicadas para a página: ${pathname}`);
      const root = document.documentElement;
      root.style.removeProperty("--primary");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--background");
      root.style.removeProperty("--foreground");
      root.style.removeProperty("--card");
      root.style.removeProperty("--popover");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--muted");
      root.style.removeProperty("--font-body");
      root.style.removeProperty("--font-title");
      root.style.removeProperty("--font-subtitle");
      root.style.removeProperty("--font-sans");
      root.style.removeProperty("--font-serif");
      document.body.style.backgroundColor = "";
      return;
    }

    // 1. Carregamento Inicial com Prioridade de API
    const loadSettings = () => {
      if (isLoading) return;

      if (studio?.config) {
        // Prioridade Absoluta: Dados da API/Banco
        const config = studio.config as SiteConfigData;

        // Mapeamento flexível para suportar diferentes estruturas de config (camelCase ou snake_case)
        const layoutGlobal = (config.layoutGlobal || config.layout_global) as LayoutGlobalSettings | undefined;
        if (layoutGlobal) {
          console.log(
            ">>> [LAYOUT_SYNC] Dados do Hero carregados do banco:",
            layoutGlobal.hero,
          );
          window.dispatchEvent(new Event("DataReady"));
        }
        const apiColors =
          config.colors ||
          layoutGlobal?.siteColors ||
          layoutGlobal?.cores_base;
        const apiFonts =
          config.typography ||
          config.theme ||
          layoutGlobal?.fontes;

        if (apiColors && Object.keys(apiColors).length > 0) {
          console.log(
            `[THEME_AUTO_APPLY] Cores do banco aplicadas no carregamento inicial: ${apiColors.primary || "#N/A"}`,
            apiColors,
          );
          setColors(apiColors);
        } else {
          console.warn("[THEME_AUTO_APPLY] Config presente, mas apiColors vazio. Aplicando fallback padrão no carregamento.");
          setColors(getColorSettings());
        }

        if (apiFonts && Object.keys(apiFonts).length > 0) {
          setFonts(apiFonts);
        } else {
          setFonts(getFontSettings());
        }

        if (studio.id) {
          console.log(
            `[THEME] Customização ativa para empresa: ${studio.id}`,
          );
        }
      } else {
        // Se não houver config da API, usamos os padrões globais
        console.log(
          "[THEME_AUTO_APPLY] Usando padrões iniciais no carregamento.",
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
  }, [studio, isLoading, isFixedColorPage, pathname]);

  useEffect(() => {
    if (isFixedColorPage || !colors || !fonts) return;

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
      console.log(`[THEME_DOM] Cor primária aplicada: ${colors.primary}`);
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
      // Força o background do body para garantir que o Chrome aplique em toda a tela
      document.body.style.backgroundColor = colors.background;
      console.log(`[THEME_DOM] Cor de fundo aplicada: ${colors.background}`);
    }
    if (colors.text) {
      root.style.setProperty("--foreground", colors.text);
      root.style.setProperty("--card-foreground", colors.text);
      root.style.setProperty("--popover-foreground", colors.text);
      root.style.setProperty("--muted-foreground", `${colors.text}cc`);
    }
    if (colors.accent) {
      root.style.setProperty("--accent", colors.accent);
      root.style.setProperty("--accent-foreground", colors.buttonText || "#ffffff");
    }
    if (colors.buttonText) {
      root.style.setProperty("--primary-foreground", colors.buttonText);
      root.style.setProperty("--secondary-foreground", colors.buttonText);
    }

    if (colors.primary || colors.background) {
      console.log(`[THEME_SUCCESS] Cores injetadas do banco no :root: Primária=${colors.primary}, Fundo=${colors.background}`);
    } else {
      console.log("[THEME_DOM] Variáveis CSS injetadas diretamente no :root");
    }
  }, [colors, fonts, isFixedColorPage]);

  if (isFixedColorPage || !colors || !fonts) return null;

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
