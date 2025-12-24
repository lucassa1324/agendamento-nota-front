"use client";

import { useEffect, useState } from "react";
import { getFontSettings } from "@/lib/booking-data";

export function PreviewStyleManager() {
  const [fonts, setFonts] = useState({
    headingFont: "",
    bodyFont: "",
  });

  useEffect(() => {
    // Carregar fontes salvas inicialmente
    const savedFonts = getFontSettings();
    setFonts({
      headingFont: savedFonts.headingFont,
      bodyFont: savedFonts.bodyFont,
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "UPDATE_FONTS") {
        setFonts({
          headingFont: event.data.headingFont,
          bodyFont: event.data.bodyFont,
        });
      }
    };

    const handleSettingsUpdate = () => {
      const updatedFonts = getFontSettings();
      setFonts({
        headingFont: updatedFonts.headingFont,
        bodyFont: updatedFonts.bodyFont,
      });
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("fontSettingsUpdated", handleSettingsUpdate);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("fontSettingsUpdated", handleSettingsUpdate);
    };
  }, []);

  if (!fonts.headingFont && !fonts.bodyFont) return null;

  // Geramos as URLs do Google Fonts para as fontes selecionadas
  const fontFamilies = [];
  if (fonts.headingFont)
    fontFamilies.push(fonts.headingFont.replace(/\s+/g, "+"));
  if (fonts.bodyFont) fontFamilies.push(fonts.bodyFont.replace(/\s+/g, "+"));

  const googleFontsUrl =
    fontFamilies.length > 0
      ? `https://fonts.googleapis.com/css2?${fontFamilies.map((f) => `family=${f}:wght@400;500;600;700;800;900`).join("&")}&display=swap`
      : "";

  return (
    <>
      {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Dinamic injection for preview
        dangerouslySetInnerHTML={{
          __html: `
        :root {
          ${fonts.bodyFont ? `--font-sans: "${fonts.bodyFont}", sans-serif !important;` : ""}
          ${fonts.headingFont ? `--font-serif: "${fonts.headingFont}", serif !important;` : ""}
        }
        
        /* Forçamos a aplicação nas classes do Tailwind se necessário */
        .font-sans {
          font-family: ${fonts.bodyFont ? `"${fonts.bodyFont}", sans-serif !important` : "inherit"};
        }
        
        .font-serif {
          font-family: ${fonts.headingFont ? `"${fonts.headingFont}", serif !important` : "inherit"};
        }
        
        h1, h2, h3, h4, h5, h6, .font-serif {
          font-family: ${fonts.headingFont ? `"${fonts.headingFont}", serif !important` : "inherit"};
        }
        
        body, .font-sans {
          font-family: ${fonts.bodyFont ? `"${fonts.bodyFont}", sans-serif !important` : "inherit"};
        }
      `,
        }}
      />
    </>
  );
}
