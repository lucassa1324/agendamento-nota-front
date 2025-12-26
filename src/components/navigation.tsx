"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getPageVisibility,
  getVisibleSections,
  getSiteProfile,
  type SiteProfile,
} from "@/lib/booking-data";

export function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(
    {
      inicio: true,
      galeria: true,
      sobre: true,
      agendar: true,
    },
  );
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});

  const only = searchParams.get("only");

  useEffect(() => {
    // Sempre buscamos o perfil e visibilidade, independente do pathname para manter a ordem dos hooks
    setProfile(getSiteProfile());
    setPageVisibility(getPageVisibility());
    setVisibleSections(getVisibleSections());

    if (pathname?.startsWith("/admin")) return;

    const handleProfileUpdate = () => {
      setProfile(getSiteProfile());
    };

    const handleVisibilityUpdate = () => {
      setPageVisibility(getPageVisibility());
    };

    const handleSectionsUpdate = () => {
      setVisibleSections(getVisibleSections());
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_PAGE_VISIBILITY") {
        setPageVisibility(event.data.visibility);
      }
      if (event.data?.type === "UPDATE_VISIBLE_SECTIONS") {
        setVisibleSections(event.data.sections);
      }
    };

    window.addEventListener("siteProfileUpdated", handleProfileUpdate);
    window.addEventListener("pageVisibilityUpdated", handleVisibilityUpdate);
    window.addEventListener("visibleSectionsUpdated", handleSectionsUpdate);
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("siteProfileUpdated", handleProfileUpdate);
      window.removeEventListener(
        "pageVisibilityUpdated",
        handleVisibilityUpdate,
      );
      window.removeEventListener("visibleSectionsUpdated", handleSectionsUpdate);
      window.removeEventListener("message", handleMessage);
    };
  }, [pathname]);

  // Se estivermos isolando algo que não seja o header, escondemos o navigation
  if (only && only !== "header") return null;

  // Se o header estiver desativado nas seções visíveis, e não estivermos isolando ele
  if (!only && visibleSections.header === false) return null;

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

  const siteName = profile?.name || "Brow Studio";

  return (
    <nav
      id="header"
      className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 border-b border-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-serif text-xl lg:text-2xl font-bold text-primary flex items-center gap-2 lg:gap-3"
          >
            {profile?.logoUrl ? (
              <Image
                src={profile.logoUrl}
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
                className={`text-xs lg:text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="text-xs lg:text-sm font-medium text-muted-foreground transition-colors hover:text-primary whitespace-nowrap"
            >
              Acesse sua conta
            </Link>
            {pageVisibility.agendar !== false && (
              <Button
                asChild
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-3 lg:px-4 text-xs lg:text-sm h-9 lg:h-10"
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
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Acesse sua conta
              </Link>
              {pageVisibility.agendar !== false && (
                <Button
                  asChild
                  className="bg-accent hover:bg-accent/90 text-accent-foreground w-full"
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
