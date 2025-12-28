import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import type React from "react";
import { FaviconUpdater } from "@/components/favicon-updater";
import { LayoutClientWrapper } from "@/components/layout-client-wrapper";
import { PreviewStyleManager } from "@/components/preview-style-manager";
import { Toaster } from "@/components/ui/toaster";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`font-sans antialiased`}>
        <PreviewStyleManager />
        <FaviconUpdater />
        <LayoutClientWrapper>
          {children}
        </LayoutClientWrapper>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
