"use client";

import { MasterLayoutClient } from "./master-layout-client";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MasterLayoutClient>{children}</MasterLayoutClient>;
}
