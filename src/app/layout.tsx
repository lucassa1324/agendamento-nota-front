import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import type React from "react";
import { FaviconUpdater } from "@/components/favicon-updater";
import { LayoutClientWrapper } from "@/components/layout-client-wrapper";
import { PreviewStyleManager } from "@/components/preview-style-manager";
import { Toaster } from "@/components/ui/toaster";
import { StudioProvider } from "@/context/studio-context";
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

export const metadata: Metadata = {
  title: "Studio de Sobrancelhas | Design & Beleza",
  description:
    "Especialistas em design de sobrancelhas. Agende seu horário e realce sua beleza natural.",
  generator: "v0.app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const slug = headersList.get("x-studio-slug") || undefined;

  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <StudioProvider initialSlug={slug}>
          <PreviewStyleManager />
          <FaviconUpdater />
          <LayoutClientWrapper>
            {children}
          </LayoutClientWrapper>
          <Toaster />
          <Analytics />
        </StudioProvider>
      </body>
    </html>
  );
}
