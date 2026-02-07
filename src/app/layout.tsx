import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import type React from "react";
import { FaviconUpdater } from "@/components/favicon-updater";
import { LayoutClientWrapper } from "@/components/layout-client-wrapper";
import { PreviewStyleManager } from "@/components/preview-style-manager";
import { ThemeInjector } from "@/components/theme-injector";
import { Toaster } from "@/components/ui/toaster";
import { StudioProvider } from "@/context/studio-context";
import { API_BASE_URL } from "@/lib/auth-client";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const slug = headersList.get("x-studio-slug");

  if (!slug) {
    return {
      title: "StudioManager | Gestão e Agendamentos",
      description: "A plataforma completa para gestão do seu studio.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/studios/slug/${slug}`, {
      next: { revalidate: 3600 }, // Cache de 1 hora
    });

    if (response.ok) {
      const studio = await response.json();
      const suffix = studio.titleSuffix || "Agendamento Online";
      return {
        title: `${studio.name} | ${suffix}`,
        description: `Agende seu horário no ${studio.name}. Especialistas prontos para te atender.`,
      };
    }
  } catch (error) {
    console.error("Erro ao gerar metadata:", error);
  }

  return {
    title: "StudioManager | Agendamento Online",
    description: "Agende seu horário e realce sua beleza natural.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const slug = headersList.get("x-studio-slug") || undefined;

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <StudioProvider initialSlug={slug}>
          <ThemeInjector />
          <PreviewStyleManager />
          <FaviconUpdater />
          <LayoutClientWrapper>{children}</LayoutClientWrapper>
          <Toaster />
          <Analytics />
        </StudioProvider>
      </body>
    </html>
  );
}
