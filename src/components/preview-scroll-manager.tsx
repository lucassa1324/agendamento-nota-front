"use client";

import { useEffect } from "react";

export function PreviewScrollManager() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "SCROLL_TO_SECTION" && event.data.sectionId) {
        const element = document.getElementById(event.data.sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Também verificar se há um hash na URL ao carregar
    const hash = window.location.hash;
    if (hash) {
      const id = hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500); // Pequeno delay para garantir que os componentes montaram
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
