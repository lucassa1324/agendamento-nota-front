"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/context/studio-context";
import { ADMIN_URL } from "@/lib/auth-client";
import {
  defaultHeaderSettings,
  getHeaderSettings,
  getPageVisibility,
  getSiteProfile,
  getVisibleSections,
  type HeaderSettings,
  type SiteProfile,
  SECTION_IDS,
} from "@/lib/booking-data";
import { getFullImageUrl } from "@/lib/utils";

export function Navigation({
  externalHeaderSettings,
}: {
  externalHeaderSettings?: HeaderSettings;
}) {
  const { studio } = useStudio();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(
    externalHeaderSettings || defaultHeaderSettings,
  );
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(
    {
      inicio: true,
      galeria: true,
      sobre: true,
      agendar: true,
    },
  );
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});

  const hasLivePreviewUpdateRef = useRef(false);
  const [isInsideIframe, setIsInsideIframe] = useState(false);

  const only = searchParams.get("only");

  const studioId = studio?.id;
  const studioName = studio?.name;
  const studioLogoUrl = studio?.logoUrl;
  const studioHeaderConfig = studio?.config?.header;

  const loadData = useCallback(() => {
    // Blindagem Absoluta: Se já recebemos atualização do editor, ignoramos o banco
    if (isInsideIframe && hasLivePreviewUpdateRef.current) {
      console.log("[Navigation] Guard Logic: Ignorando loadData do banco (Preview Ativo)");
      return;
    }

    // Sempre buscamos o perfil e visibilidade, independente do pathname para manter a ordem dos hooks
    const baseProfile = getSiteProfile();
    if (studioId) {
      setProfile({
        ...baseProfile,
        name: studioName || baseProfile.name,
        logoUrl: studioLogoUrl || baseProfile.logoUrl,
      });
    } else {
      setProfile(baseProfile);
    }

    setPageVisibility(getPageVisibility());
    setVisibleSections(getVisibleSections());

    if (!externalHeaderSettings) {
      if (studioHeaderConfig) {
        setHeaderSettings(studioHeaderConfig as HeaderSettings);
      } else {
        setHeaderSettings(getHeaderSettings());
      }
    }
  }, [
    studioId,
    studioName,
    studioLogoUrl,
    studioHeaderConfig,
    externalHeaderSettings,
  ]);

  useEffect(() => {
    setIsInsideIframe(window.self !== window.top);
  }, []);

  useEffect(() => {
    if (externalHeaderSettings) {
      setHeaderSettings(externalHeaderSettings);
    }
  }, [externalHeaderSettings]);

  useEffect(() => {
    // Só carrega os dados iniciais se não houver um preview ativo ou se não estiver no iframe
    if (!isInsideIframe || !hasLivePreviewUpdateRef.current) {
      loadData();
    }

    // Notificar o pai (admin) que o componente de navegação está pronto
    if (window.self !== window.top) {
      window.parent.postMessage(
        { type: "COMPONENT_READY", component: "header" },
        "*",
      );
    }

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_PAGE_VISIBILITY") {
        setPageVisibility(event.data.settings || {});
      }
      if (event.data.type === "UPDATE_VISIBLE_SECTIONS") {
        setVisibleSections(event.data.settings || {});
      }
      if (
        event.data.type === "UPDATE_HEADER_SETTINGS" ||
        event.data.type === "UPDATE_SITE_DATA" ||
        event.data.type === "UPDATE_SITE_CONFIG"
      ) {
        hasLivePreviewUpdateRef.current = true;

        let rawHeader: Record<string, unknown> | undefined;

        if (event.data.type === "UPDATE_SITE_DATA" && event.data.data) {
          const siteData = event.data.data as Record<string, unknown>;
          rawHeader = siteData.header as Record<string, unknown>;
        } else if (event.data.type === "UPDATE_SITE_CONFIG" && event.data.config) {
          const siteConfig = event.data.config as Record<string, unknown>;
          rawHeader = siteConfig.header as Record<string, unknown>;
        } else {
          rawHeader = event.data.settings as Record<string, unknown>;
        }

        if (rawHeader) {
          const appearance =
            (rawHeader.appearance as Record<string, unknown>) || {};
          const normalizedHeader = {
            ...rawHeader,
            ...appearance,
            bgColor:
              (rawHeader.bgColor as string) ||
              (rawHeader.backgroundColor as string) ||
              (appearance.backgroundColor as string) ||
              "",
            textColor:
              (rawHeader.textColor as string) ||
              (appearance.textColor as string) ||
              "",
            buttonBgColor:
              (rawHeader.buttonBgColor as string) ||
              (appearance.buttonBgColor as string) ||
              "",
            buttonTextColor:
              (rawHeader.buttonTextColor as string) ||
              (appearance.buttonTextColor as string) ||
              "",
          };

          setHeaderSettings((prev) =>
            prev
              ? { ...prev, ...normalizedHeader }
              : (normalizedHeader as HeaderSettings),
          );
        }
      }
    };

    const handleHeaderUpdate = () => {
      setHeaderSettings(getHeaderSettings());
    };

    const handleVisibilityUpdate = () => {
      setPageVisibility(getPageVisibility());
    };

    const handleSectionsUpdate = () => {
      setVisibleSections(getVisibleSections());
    };

    const handleDataReady = () => {
      if (!hasLivePreviewUpdateRef.current) {
        loadData();
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("headerSettingsUpdated", handleHeaderUpdate);
    window.addEventListener("pageVisibilityUpdated", handleVisibilityUpdate);
    window.addEventListener("visibleSectionsUpdated", handleSectionsUpdate);
    window.addEventListener("DataReady", handleDataReady);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("headerSettingsUpdated", handleHeaderUpdate);
      window.removeEventListener(
        "pageVisibilityUpdated",
        handleVisibilityUpdate,
      );
      window.removeEventListener(
        "visibleSectionsUpdated",
        handleSectionsUpdate,
      );
      window.removeEventListener("DataReady", handleDataReady);
    };
  }, [isInsideIframe, loadData]);

  // Se estivermos isolando algo que não seja o header, escondemos o navigation
  if (only && only !== SECTION_IDS.layoutHeader) return null;

  // Se o header estiver desativado nas seções visíveis, e não estivermos isolando ele
  if (!only && visibleSections[SECTION_IDS.layoutHeader] === false) return null;

  const isActive = (path: string) => pathname === path;

  const allNavLinks = [
    { id: "inicio", href: "/", label: "Início" },
    { id: "galeria", href: "/galeria", label: "Galeria" },
    { id: "sobre", href: "/sobre", label: "Sobre Nós" },
    { id: "agendar", href: "/agendamento", label: "Agendar" },
  ];

  const navLinks = allNavLinks.filter(
    (link) => pageVisibility[link.id] !== false,
  );

  const siteName = profile?.name || "Aura Sistema";

  // Estilos dinâmicos para o Glassmorphism
  const headerStyle = {
    backgroundColor: headerSettings.bgColor
      ? `${headerSettings.bgColor}${Math.round(headerSettings.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`
      : undefined,
    backdropFilter: `blur(${headerSettings.blurAmount}px)`,
    WebkitBackdropFilter: `blur(${headerSettings.blurAmount}px)`,
  };

  const titleStyle = {
    color: headerSettings.textColor || "var(--foreground)",
    fontFamily: headerSettings.titleFont || "var(--font-title)",
  };

  const linksStyle = {
    color: headerSettings.textColor || "var(--foreground)",
    fontFamily: headerSettings.linksFont || "var(--font-subtitle)",
  };

  const buttonStyle = {
    backgroundColor: headerSettings.buttonBgColor || "var(--primary)",
    color: headerSettings.buttonTextColor || "white",
    fontFamily: headerSettings.linksFont || "var(--font-body)",
  };

  const activeLinkStyle = {
    ...linksStyle,
    borderBottom: `2px solid ${headerSettings.buttonBgColor || "var(--primary)"}`,
  };

  return (
    <nav
      id={SECTION_IDS.layoutHeader}
      className="sticky top-0 z-50 border-b border-border/50 transition-all duration-300"
      style={headerStyle}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-serif text-xl lg:text-2xl font-bold flex items-center gap-2 lg:gap-3"
            style={titleStyle}
          >
            {profile?.logoUrl ? (
              <Image
                src={getFullImageUrl(profile.logoUrl)}
                alt={siteName}
                width={100}
                height={40}
                className="h-8 lg:h-10 w-auto object-contain"
                unoptimized
              />
            ) : null}
            <span className="truncate max-w-37.5 lg:max-w-none">
              {siteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs lg:text-sm font-medium transition-colors hover:opacity-80 ${
                  isActive(link.href) ? "" : "opacity-70"
                }`}
                style={isActive(link.href) ? activeLinkStyle : linksStyle}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={ADMIN_URL}
              className="text-xs lg:text-sm font-medium opacity-70 transition-colors hover:opacity-100 whitespace-nowrap"
              style={linksStyle}
            >
              Acesse sua conta
            </Link>
            {pageVisibility.agendar !== false && (
              <Button
                asChild
                size="sm"
                className="px-3 lg:px-4 text-xs lg:text-sm h-9 lg:h-10 shadow-sm"
                style={buttonStyle}
              >
                <Link href="/agendamento">Agende Agora</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={linksStyle}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-medium transition-colors ${
                    isActive(link.href) ? "text-primary" : ""
                  }`}
                  style={linksStyle}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={ADMIN_URL}
                className="text-lg font-medium opacity-70"
                style={linksStyle}
                onClick={() => setMobileMenuOpen(false)}
              >
                Acesse sua conta
              </Link>
              {pageVisibility.agendar !== false && (
                <Button
                  asChild
                  className="w-full shadow-sm"
                  style={buttonStyle}
                >
                  <Link
                    href="/agendamento"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Agende Agora
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
