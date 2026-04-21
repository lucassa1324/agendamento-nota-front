"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { useStudio } from "@/context/studio-context";
import {
  type FooterSettings,
  getVisibleSections,
  type HeaderSettings,
} from "@/lib/booking-data";
import { captureAppError } from "@/lib/error-monitoring";
import type { SiteConfigData } from "@/lib/site-config-types";

export function LayoutClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { studio, slug } = useStudio();
  const [headerSettings, setHeaderSettings] = useState<
    HeaderSettings | undefined
  >(undefined);
  const [footerSettings, setFooterSettings] = useState<
    FooterSettings | undefined
  >(undefined);
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});
  const [isolatedSection, setIsolatedSection] = useState<string | null>(null);

  // Sincronização com os dados vindos do StudioContext (Banco de Dados)
  useEffect(() => {
    if (studio?.config) {
      const config = studio.config as unknown as SiteConfigData;
      if (config.visibleSections) {
        setVisibleSections(config.visibleSections);
      }
    }
  }, [studio]);

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
    if (window.self !== window.top) {
      window.parent.postMessage({ type: "IFRAME_READY" }, "*");
    }
  }, []);

  useEffect(() => {
    const onWindowError = (event: ErrorEvent) => {
      const fallbackMessage =
        event.error instanceof Error
          ? event.error.message
          : typeof event.error === "string"
            ? event.error
            : "Erro global de execução";

      captureAppError({
        message: event.message || fallbackMessage,
        source: event.filename,
        stack: event.error?.stack,
        metadata: {
          pathname,
          line: event.lineno,
          column: event.colno,
        },
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason =
        typeof event.reason === "string"
          ? event.reason
          : event.reason?.message || "Promise rejeitada sem mensagem";
      captureAppError({
        message: reason,
        source: "unhandledrejection",
        stack: event.reason?.stack,
        metadata: { pathname },
      });
    };

    window.addEventListener("error", onWindowError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [pathname]);

  useEffect(() => {
    setVisibleSections(getVisibleSections());

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type) {
        console.log(
          ">>> [RECEIVE_POST_MESSAGE]",
          event.data.type,
          event.data.settings || event.data.payload,
        );
      }

      if (event.data?.type === "UPDATE_HEADER_SETTINGS") {
        setHeaderSettings(event.data.settings);
      }
      if (event.data?.type === "UPDATE_FOOTER_SETTINGS") {
        setFooterSettings(event.data.settings);
      }
      if (event.data?.type === "UPDATE_SERVICES_SETTINGS") {
        console.log(
          ">>> [LayoutWrapper] Detectado UPDATE_SERVICES_SETTINGS no iframe.",
        );
      }
      if (event.data?.type === "UPDATE_VISIBLE_SECTIONS") {
        setVisibleSections(event.data.settings || {});
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

  const isSectionVisible = (id: string) => {
    if (isolatedSection) return isolatedSection === id || isGlobalEdit;
    if (!visibleSections) return true;
    return visibleSections[id] !== false;
  };

  // REGRAS ESTRITAS PARA OCULTAR HEADER/FOOTER
  const showHeader =
    isSectionVisible("layout-header") &&
    !isAdminRoute &&
    !isLandingPage &&
    pathname !== "/acesso-suspenso" &&
    pathname !== "/admin/master"; // Garantia extra para a rota master

  const showFooter =
    isSectionVisible("layout-footer") &&
    !isAdminRoute &&
    !isLandingPage &&
    pathname !== "/acesso-suspenso" &&
    pathname !== "/admin/master"; // Garantia extra para a rota master

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
