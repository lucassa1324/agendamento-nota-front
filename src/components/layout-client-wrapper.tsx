"use client";

import { Suspense, useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import type { FooterSettings, HeaderSettings } from "@/lib/booking-data";

export function LayoutClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | undefined>(undefined);
  const [footerSettings, setFooterSettings] = useState<FooterSettings | undefined>(undefined);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_HEADER_SETTINGS") {
        setHeaderSettings(event.data.settings);
      }
      if (event.data?.type === "UPDATE_FOOTER_SETTINGS") {
        setFooterSettings(event.data.settings);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <>
      <Suspense
        fallback={<div className="h-16 border-b border-border bg-background" />}
      >
        <Navigation externalHeaderSettings={headerSettings} />
      </Suspense>
      {children}
      <Suspense
        fallback={<div className="h-32 bg-secondary/30 border-t border-border" />}
      >
        <Footer externalFooterSettings={footerSettings} />
      </Suspense>
    </>
  );
}
