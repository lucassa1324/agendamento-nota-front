"use client";

import { useEffect } from "react";
import { getSiteProfile } from "@/lib/booking-data";

export function FaviconUpdater() {
  useEffect(() => {
    const updateFavicon = () => {
      const profile = getSiteProfile();

      // Remove ALL existing favicon-related tags
      const existingIcons = document.querySelectorAll(
        "link[rel*='icon'], link[rel='apple-touch-icon'], link[rel='mask-icon']",
      );
      existingIcons.forEach((el) => {
        el.remove();
      });

      if (profile.logoUrl) {
        // 1. Standard Icon
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = profile.logoUrl.startsWith("data:image/svg")
          ? "image/svg+xml"
          : "image/x-icon";
        link.href = profile.logoUrl;
        document.head.appendChild(link);

        // 2. Shortcut Icon (Older browsers)
        const shortcutLink = document.createElement("link");
        shortcutLink.rel = "shortcut icon";
        shortcutLink.href = profile.logoUrl;
        document.head.appendChild(shortcutLink);

        // 3. Apple Touch Icon
        const appleLink = document.createElement("link");
        appleLink.rel = "apple-touch-icon";
        appleLink.href = profile.logoUrl;
        document.head.appendChild(appleLink);
      }

      // Update Page Title
      if (profile.name) {
        document.title = `${profile.name} | Design & Beleza`;
      }
    };

    updateFavicon();

    window.addEventListener("siteProfileUpdated", updateFavicon);
    return () => {
      window.removeEventListener("siteProfileUpdated", updateFavicon);
    };
  }, []);

  return null;
}
