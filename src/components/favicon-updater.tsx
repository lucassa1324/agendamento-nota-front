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
        // 1. Standard Icon
        const link = document.createElement("link");
        link.dataset.dynamicFavicon = "true";
        link.rel = "icon";
        link.type = logoUrl.startsWith("data:image/svg")
          ? "image/svg+xml"
          : "image/x-icon";
        link.href = fullLogoUrl;
        document.head.appendChild(link);

        // 2. Shortcut Icon (Older browsers)
        const shortcutLink = document.createElement("link");
        shortcutLink.dataset.dynamicFavicon = "true";
        shortcutLink.rel = "shortcut icon";
        shortcutLink.href = fullLogoUrl;
        document.head.appendChild(shortcutLink);

        // 3. Apple Touch Icon
        const appleLink = document.createElement("link");
        appleLink.dataset.dynamicFavicon = "true";
        appleLink.rel = "apple-touch-icon";
        appleLink.href = fullLogoUrl;
        document.head.appendChild(appleLink);
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
