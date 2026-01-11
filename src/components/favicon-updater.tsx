"use client";

import { useEffect } from "react";

import { useStudio } from "@/context/studio-context";
import { getSiteProfile } from "@/lib/booking-data";

export function FaviconUpdater() {
  const { studio } = useStudio();
  useEffect(() => {
    const updateFavicon = () => {
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

      // Remove ALL existing favicon-related tags
      const existingIcons = document.querySelectorAll(
        "link[rel*='icon'], link[rel='apple-touch-icon'], link[rel='mask-icon']",
      );
      existingIcons.forEach((el) => {
        el.remove();
      });

      if (logoUrl) {
        // 1. Standard Icon
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = logoUrl.startsWith("data:image/svg")
          ? "image/svg+xml"
          : "image/x-icon";
        link.href = logoUrl;
        document.head.appendChild(link);

        // 2. Shortcut Icon (Older browsers)
        const shortcutLink = document.createElement("link");
        shortcutLink.rel = "shortcut icon";
        shortcutLink.href = logoUrl;
        document.head.appendChild(shortcutLink);

        // 3. Apple Touch Icon
        const appleLink = document.createElement("link");
        appleLink.rel = "apple-touch-icon";
        appleLink.href = logoUrl;
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
  }, [studio]);

  return null;
}
