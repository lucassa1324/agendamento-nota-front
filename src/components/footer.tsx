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
import {
  getPageVisibility,
  getSiteProfile,
  type SiteProfile,
} from "@/lib/booking-data";

export function Footer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname?.startsWith("/admin")) return null;

  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({
    inicio: true,
    galeria: true,
    sobre: true,
    agendar: true,
  });

  const only = searchParams.get("only");

  useEffect(() => {
    setProfile(getSiteProfile());
    setPageVisibility(getPageVisibility());

    const handleProfileUpdate = () => {
      setProfile(getSiteProfile());
    };

    const handleVisibilityUpdate = () => {
      setPageVisibility(getPageVisibility());
    };

    window.addEventListener("siteProfileUpdated", handleProfileUpdate);
    window.addEventListener("pageVisibilityUpdated", handleVisibilityUpdate);

    return () => {
      window.removeEventListener("siteProfileUpdated", handleProfileUpdate);
      window.removeEventListener(
        "pageVisibilityUpdated",
        handleVisibilityUpdate,
      );
    };
  }, []);

  // Se estivermos isolando algo que não seja o footer, escondemos o footer
  if (only && only !== "footer") return null;

  if (!profile) return null;

  return (
    <footer id="footer" className="bg-secondary/30 border-t border-border">
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
              <h3 className="font-serif text-2xl font-bold text-primary">
                {profile.name}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.description}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              {pageVisibility.inicio !== false && (
                <li>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Início
                  </Link>
                </li>
              )}
              {pageVisibility.galeria !== false && (
                <li>
                  <Link
                    href="/galeria"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Galeria
                  </Link>
                </li>
              )}
              {pageVisibility.sobre !== false && (
                <li>
                  <Link
                    href="/sobre"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sobre Nós
                  </Link>
                </li>
              )}
              {pageVisibility.agendar !== false && (
                <li>
                  <Link
                    href="/agendamento"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Agendar
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {profile.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{profile.phone}</span>
                </li>
              )}
              {profile.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </li>
              )}
              {profile.address && (
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.address}</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              {profile.showInstagram && profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-accent" />
                </a>
              )}
              {profile.showFacebook && profile.facebook && (
                <a
                  href={`https://facebook.com/${profile.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors"
                >
                  <Facebook className="w-5 h-5 text-accent" />
                </a>
              )}
              {profile.showWhatsapp && profile.whatsapp && (
                <a
                  href={`https://wa.me/${profile.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-accent" />
                </a>
              )}
              {profile.showTiktok && profile.tiktok && (
                <a
                  href={`https://tiktok.com/@${profile.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 fill-accent"
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
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-accent" />
                </a>
              )}
              {profile.showX && profile.x && (
                <a
                  href={`https://x.com/${profile.x}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 fill-accent"
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

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {profile.name}. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
