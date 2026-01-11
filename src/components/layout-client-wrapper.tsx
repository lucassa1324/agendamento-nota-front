"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { useStudio } from "@/context/studio-context";
import type { FooterSettings, HeaderSettings } from "@/lib/booking-data";

export function LayoutClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { slug } = useStudio();
  const [headerSettings, setHeaderSettings] = useState<
    HeaderSettings | undefined
  >(undefined);
  const [footerSettings, setFooterSettings] = useState<
    FooterSettings | undefined
  >(undefined);
  const [isolatedSection, setIsolatedSection] = useState<string | null>(null);

  // Notifica o editor (parent) sobre a mudança de rota interna
  useEffect(() => {
    if (window.self !== window.top) {
      window.parent.postMessage(
        {
          type: "PAGE_NAVIGATED",
          path: pathname,
        },
        "*",
      );
    }
  }, [pathname]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_HEADER_SETTINGS") {
        setHeaderSettings(event.data.settings);
      }
      if (event.data?.type === "UPDATE_FOOTER_SETTINGS") {
        setFooterSettings(event.data.settings);
      }
      if (event.data?.type === "SET_ISOLATED_SECTION") {
        requestAnimationFrame(() => {
          setIsolatedSection(event.data.sectionId);
        });
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const isAdminRoute =
    pathname?.startsWith("/admin") || pathname?.includes("/admin/");
  const isLandingPage = !slug && pathname === "/";
  const isGlobalEdit =
    isolatedSection === "typography" || isolatedSection === "colors";

  const showHeader =
    (!isolatedSection || isolatedSection === "header" || isGlobalEdit) &&
    !isAdminRoute &&
    !isLandingPage;
  const showFooter =
    (!isolatedSection || isolatedSection === "footer" || isGlobalEdit) &&
    !isAdminRoute &&
    !isLandingPage;

  return (
    <>
      {showHeader && (
        <Suspense
          fallback={
            <div className="h-16 border-b border-border bg-background" />
          }
        >
          <Navigation externalHeaderSettings={headerSettings} />
        </Suspense>
      )}
      {children}
      {showFooter && (
        <Suspense
          fallback={
            <div className="h-32 bg-secondary/30 border-t border-border" />
          }
        >
          <Footer externalFooterSettings={footerSettings} />
        </Suspense>
      )}
    </>
  );
}
