"use client";

import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStudio } from "@/context/studio-context";
import {
  defaultFooterSettings,
  type FooterSettings,
  getFooterSettings,
  getPageVisibility,
  getSiteProfile,
  getVisibleSections,
  type SiteProfile,
} from "@/lib/booking-data";

export function Footer({ externalFooterSettings }: { externalFooterSettings?: FooterSettings }) {
  const { studio } = useStudio();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(
    externalFooterSettings || defaultFooterSettings,
  );
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({
    inicio: true,
    galeria: true,
    sobre: true,
    agendar: true,
  });
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});

  const only = searchParams.get("only");

  useEffect(() => {
    if (externalFooterSettings) {
      setFooterSettings(externalFooterSettings);
    }
  }, [externalFooterSettings]);

  useEffect(() => {
    // Sempre buscamos o perfil e visibilidade, independente do pathname para manter a ordem dos hooks
    const baseProfile = getSiteProfile();
    if (studio) {
      setProfile({
        ...baseProfile,
        name: studio.name || baseProfile.name,
        // Você pode adicionar outros campos do studio aqui se houver mapeamento
      });
    } else {
      setProfile(baseProfile);
    }
    
    setPageVisibility(getPageVisibility());
    setVisibleSections(getVisibleSections());
    
    if (!externalFooterSettings) {
      if (studio?.config?.footer) {
        setFooterSettings(studio.config.footer as FooterSettings);
      } else {
        setFooterSettings(getFooterSettings());
      }
    }

    // Notificar o pai (admin) que o componente de rodapé está pronto
    if (window.self !== window.top) {
      window.parent.postMessage({ type: "COMPONENT_READY", component: "footer" }, "*");
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_PAGE_VISIBILITY") {
        setPageVisibility(event.data.visibility);
      }
      if (event.data?.type === "UPDATE_VISIBLE_SECTIONS") {
        setVisibleSections(event.data.sections);
      }
      if (event.data?.type === "UPDATE_FOOTER_SETTINGS") {
        console.log("Footer: Recebendo novas configurações", event.data.settings);
        setFooterSettings(event.data.settings);
      }
    };

    window.addEventListener("message", handleMessage);

    // Se estivermos no admin propriamente dito, não precisamos dos outros listeners
    if (pathname?.startsWith("/admin")) {
      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }

    const handleProfileUpdate = () => {
      setProfile(getSiteProfile());
    };

    const handleVisibilityUpdate = () => {
      setPageVisibility(getPageVisibility());
    };

    const handleSectionsUpdate = () => {
      setVisibleSections(getVisibleSections());
    };

    const handleFooterUpdate = () => {
      setFooterSettings(getFooterSettings());
    };

    window.addEventListener("siteProfileUpdated", handleProfileUpdate);
    window.addEventListener("pageVisibilityUpdated", handleVisibilityUpdate);
    window.addEventListener("visibleSectionsUpdated", handleSectionsUpdate);
    window.addEventListener("footerSettingsUpdated", handleFooterUpdate);

    return () => {
      window.removeEventListener("siteProfileUpdated", handleProfileUpdate);
      window.removeEventListener("pageVisibilityUpdated", handleVisibilityUpdate);
      window.removeEventListener("visibleSectionsUpdated", handleSectionsUpdate);
      window.removeEventListener("footerSettingsUpdated", handleFooterUpdate);
      window.removeEventListener("message", handleMessage);
    };
  }, [pathname, externalFooterSettings, studio]);

  // Se estivermos isolando algo que não seja o footer, escondemos o footer
  if (only && only !== "footer") return null;

  // Se o footer estiver desativado nas seções visíveis, e não estivermos isolando ele
  if (!only && visibleSections.footer === false) return null;

  if (!profile) return null;

  const footerStyle = {
    backgroundColor: footerSettings.bgColor || "var(--background)",
    fontFamily: footerSettings.bodyFont || "var(--font-body)",
  };

  const titleStyle = {
    color: footerSettings.titleColor || "var(--foreground)",
    fontFamily: footerSettings.titleFont || "var(--font-title)",
  };

  const textStyle = {
    color: footerSettings.textColor || "var(--foreground)",
  };

  const iconStyle = {
    color: footerSettings.iconColor || "var(--secondary)",
  };

  const iconBgStyle = {
    backgroundColor: footerSettings.iconColor
      ? `${footerSettings.iconColor}1a`
      : "var(--secondary)",
    opacity: footerSettings.iconColor ? 1 : 0.1,
  };

  return (
    <footer
      id="footer"
      className={`border-t border-border transition-colors duration-300 ${!footerSettings.bgColor ? "bg-secondary/30" : ""}`}
      style={footerStyle}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {profile.logoUrl && (
                <Image
                  src={profile.logoUrl}
                  alt={profile.name}
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                  unoptimized
                />
              )}
              <h3 className="font-serif text-2xl font-bold" style={titleStyle}>
                {profile.name}
              </h3>
            </div>
            <p
              className={`text-sm leading-relaxed ${!footerSettings.textColor ? "text-muted-foreground" : ""}`}
              style={textStyle}
            >
              {profile.description}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={titleStyle}>
              Links Rápidos
            </h4>
            <ul className="space-y-2 text-sm">
              {pageVisibility.inicio !== false && (
                <li>
                  <Link
                    href="/"
                    className={`transition-colors hover:opacity-80 ${!footerSettings.textColor ? "text-muted-foreground" : ""}`}
                    style={textStyle}
                  >
                    Início
                  </Link>
                </li>
              )}
              {pageVisibility.galeria !== false && (
                <li>
                  <Link
                    href="/galeria"
                    className={`transition-colors hover:opacity-80 ${!footerSettings.textColor ? "text-muted-foreground" : ""}`}
                    style={textStyle}
                  >
                    Galeria
                  </Link>
                </li>
              )}
              {pageVisibility.sobre !== false && (
                <li>
                  <Link
                    href="/sobre"
                    className={`transition-colors hover:opacity-80 ${!footerSettings.textColor ? "text-muted-foreground" : ""}`}
                    style={textStyle}
                  >
                    Sobre Nós
                  </Link>
                </li>
              )}
              {pageVisibility.agendar !== false && (
                <li>
                  <Link
                    href="/agendamento"
                    className={`transition-colors hover:opacity-80 ${!footerSettings.textColor ? "text-muted-foreground" : ""}`}
                    style={textStyle}
                  >
                    Agendar
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={titleStyle}>
              Contato
            </h4>
            <ul className={`space-y-2 text-sm ${!footerSettings.textColor ? "text-muted-foreground" : ""}`}>
              {profile.phone && (
                <li className="flex items-center gap-2" style={textStyle}>
                  <Phone className="w-4 h-4" style={iconStyle} />
                  <span>{profile.phone}</span>
                </li>
              )}
              {profile.email && (
                <li className="flex items-center gap-2" style={textStyle}>
                  <Mail className="w-4 h-4" style={iconStyle} />
                  <span>{profile.email}</span>
                </li>
              )}
              {profile.address && (
                <li className="flex items-center gap-2" style={textStyle}>
                  <MapPin className="w-4 h-4" style={iconStyle} />
                  <span>{profile.address}</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={titleStyle}>
              Redes Sociais
            </h4>
            <div className="flex gap-4">
              {profile.showInstagram && profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80 ${!footerSettings.iconColor ? "bg-accent/10" : ""}`}
                  style={footerSettings.iconColor ? iconBgStyle : undefined}
                >
                  <Instagram
                    className="w-5 h-5"
                    style={iconStyle || { color: "var(--accent)" }}
                  />
                </a>
              )}
              {profile.showFacebook && profile.facebook && (
                <a
                  href={`https://facebook.com/${profile.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80 ${!footerSettings.iconColor ? "bg-accent/10" : ""}`}
                  style={footerSettings.iconColor ? iconBgStyle : undefined}
                >
                  <Facebook
                    className="w-5 h-5"
                    style={iconStyle || { color: "var(--accent)" }}
                  />
                </a>
              )}
              {profile.showWhatsapp && profile.whatsapp && (
                <a
                  href={`https://wa.me/${profile.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80 ${!footerSettings.iconColor ? "bg-accent/10" : ""}`}
                  style={footerSettings.iconColor ? iconBgStyle : undefined}
                >
                  <MessageCircle
                    className="w-5 h-5"
                    style={iconStyle || { color: "var(--accent)" }}
                  />
                </a>
              )}
              {profile.showTiktok && profile.tiktok && (
                <a
                  href={`https://tiktok.com/@${profile.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80 ${!footerSettings.iconColor ? "bg-accent/10" : ""}`}
                  style={footerSettings.iconColor ? iconBgStyle : undefined}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    style={
                      iconStyle
                        ? { fill: footerSettings.iconColor }
                        : { fill: "var(--accent)" }
                    }
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>TikTok</title>
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.42-.14 1.01.23 2.08.94 2.82.65.7 1.61 1.07 2.54 1.02.56-.01 1.13-.19 1.57-.55.8-.61 1.21-1.6 1.25-2.61.03-3.4.02-6.8.03-10.2z" />
                  </svg>
                </a>
              )}
              {profile.showLinkedin && profile.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80 ${!footerSettings.iconColor ? "bg-accent/10" : ""}`}
                  style={footerSettings.iconColor ? iconBgStyle : undefined}
                >
                  <Linkedin
                    className="w-5 h-5"
                    style={iconStyle || { color: "var(--accent)" }}
                  />
                </a>
              )}
              {profile.showX && profile.x && (
                <a
                  href={`https://x.com/${profile.x}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80 ${!footerSettings.iconColor ? "bg-accent/10" : ""}`}
                  style={footerSettings.iconColor ? iconBgStyle : undefined}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    style={
                      iconStyle
                        ? { fill: footerSettings.iconColor }
                        : { fill: "var(--accent)" }
                    }
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>X (Twitter)</title>
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div
          className={`mt-8 border-t border-border pt-8 text-center text-sm ${!footerSettings.textColor ? "text-muted-foreground" : ""}`}
          style={textStyle}
        >
          <p>
            &copy; {new Date().getFullYear()} {profile.name}. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
