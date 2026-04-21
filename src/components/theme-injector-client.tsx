"use client";

import dynamic from "next/dynamic";
import type { RefObject } from "react";

export const ThemeInjector = dynamic(
  () => import("@/components/theme-injector").then((mod) => mod.ThemeInjector),
  { ssr: false },
);

export function ThemeInjectorClient({ iframeRef }: { iframeRef?: RefObject<HTMLIFrameElement | null> }) {
  return <ThemeInjector iframeRef={iframeRef} />;
}
