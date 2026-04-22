"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useStudio } from "@/context/studio-context";
import { getSiteProfile } from "@/lib/booking-data";
import { getFullImageUrl } from "@/lib/utils";

export function FaviconUpdater() {
  const { studio } = useStudio();
  const pathname = usePathname();

  useEffect(() => {
    const getIconTypeFromUrl = (url: string) => {
      const cleanUrl = url.split("?")[0].toLowerCase();
      if (cleanUrl.endsWith(".svg")) return "image/svg+xml";
      if (cleanUrl.endsWith(".png")) return "image/png";
      if (cleanUrl.endsWith(".jpg") || cleanUrl.endsWith(".jpeg")) return "image/jpeg";
      if (cleanUrl.endsWith(".webp")) return "image/webp";
      if (cleanUrl.endsWith(".gif")) return "image/gif";
      if (cleanUrl.endsWith(".ico")) return "image/x-icon";
      return undefined;
    };

    const upsertIconLink = (
      selector: string,
      rel: string,
      href: string,
      type?: string,
    ) => {
      const existing = document.querySelector<HTMLLinkElement>(selector);
      const link = existing || document.createElement("link");
      link.dataset.dynamicFavicon = "true";
      link.rel = rel;
      link.href = href;
      if (type) {
        link.type = type;
      } else {
        link.removeAttribute("type");
      }
      if (!existing) {
        document.head.appendChild(link);
      }
    };

    const updateFavicon = () => {
      // Remover apenas ícones dinâmicos criados anteriormente por este componente
      const dynamicIcons = document.querySelectorAll(
        "link[data-dynamic-favicon='true']",
      );
      dynamicIcons.forEach((el) => {
        el.remove();
      });

      // Se for master admin, não aplica favicon de estúdio
      // O favicon do master deve ser definido via Metadata API no layout
      if (pathname?.startsWith("/admin/master")) {
        // Opcional: Remover ícones que não sejam do Next.js se necessário
        // Mas idealmente o Metadata API sobrescreve
        return;
      }

      let logoUrl = "";
      let name = "";

      if (studio) {
        logoUrl = studio.logoUrl || "";
        name = studio.name || "";
      } else {
        const profile = getSiteProfile();
        logoUrl = profile.logoUrl || "";
        name = profile.name || "";
      }

      if (logoUrl) {
        const fullLogoUrl = getFullImageUrl(logoUrl);
        const iconType =
          logoUrl.startsWith("data:image/svg") || fullLogoUrl.startsWith("data:image/svg")
            ? "image/svg+xml"
            : getIconTypeFromUrl(fullLogoUrl);

        // Cache bust para evitar manter favicon antigo da Aura.
        const separator = fullLogoUrl.includes("?") ? "&" : "?";
        const versionedLogoUrl = `${fullLogoUrl}${separator}v=${Date.now()}`;

        upsertIconLink(
          "link[rel='icon']",
          "icon",
          versionedLogoUrl,
          iconType,
        );
        upsertIconLink(
          "link[rel='shortcut icon']",
          "shortcut icon",
          versionedLogoUrl,
          iconType,
        );
        upsertIconLink(
          "link[rel='apple-touch-icon']",
          "apple-touch-icon",
          versionedLogoUrl,
          iconType,
        );
      }

      // Update Page Title
      if (name) {
        document.title = `${name} | Design & Beleza`;
      }
    };

    updateFavicon();

    window.addEventListener("siteProfileUpdated", updateFavicon);
    return () => {
      window.removeEventListener("siteProfileUpdated", updateFavicon);
    };
  }, [studio, pathname]);

  return null;
}
