import type { Metadata } from "next";
import { MasterLayoutClient } from "./master-layout-client";

export const metadata: Metadata = {
  title: "StudioManager | Admin Master",
  description: "Painel Administrativo Geral",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛠️</text></svg>",
  },
};

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MasterLayoutClient>{children}</MasterLayoutClient>;
}
