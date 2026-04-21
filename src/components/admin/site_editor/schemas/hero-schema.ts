/**
 * Schema de normalização para a seção Hero (Banner Principal).
 */

import { defaultHeroSettings, type HeroSettings } from "@/lib/booking-data";

/**
 * Schema de normalização para a seção Hero (Banner Principal).
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

export function normalizeHeroSchema(
  heroSource: any,
  defaultValue: HeroSettings = defaultHeroSettings
): HeroSettings {
  if (!heroSource || !isRecord(heroSource)) return defaultValue;

  const heroRecord = heroSource as Record<string, unknown>;
  const content = isRecord(heroRecord.content) ? heroRecord.content : {};
  const appearance = isRecord(heroRecord.appearance) ? heroRecord.appearance : {};

  return {
    ...defaultValue,
    ...heroRecord,
    title: (content.title as string) || (heroRecord.title as string) || defaultValue.title,
    subtitle: (content.subtitle as string) || (heroRecord.subtitle as string) || defaultValue.subtitle,
    primaryButton: (content.primaryButton as string) || (content.buttonText as string) || (heroRecord.primaryButton as string) || (heroRecord.buttonText as string) || defaultValue.primaryButton,
    bgImage: (appearance.backgroundImageUrl as string) || (heroRecord.bgImage as string) || defaultValue.bgImage,
    bgColor: (appearance.backgroundColor as string) || (heroRecord.bgColor as string) || defaultValue.bgColor,
    overlayOpacity: (appearance.overlayOpacity as number) ?? (heroRecord.overlayOpacity as number) ?? defaultValue.overlayOpacity,
  } as HeroSettings;
}
