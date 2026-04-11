/**
 * Schema de normalização para a seção de Serviços do Editor.
 * Isola a lógica de blindagem de cores e estrutura de dados.
 */

import { defaultServicesSettings, type ServicesSettings } from "@/lib/booking-data";

/**
 * Schema de normalização para a seção de Serviços do Editor.
 * Isola a lógica de blindagem de cores e estrutura de dados.
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

export function normalizeServicesSchema(
  servicesSource: any,
  defaultValue: ServicesSettings = defaultServicesSettings
): ServicesSettings {
  if (!servicesSource || !isRecord(servicesSource)) return defaultValue;

  const servicesRecord = servicesSource as Record<string, unknown>;
  const content = isRecord(servicesRecord.content) ? servicesRecord.content : {};
  const appearance = isRecord(servicesRecord.appearance) ? servicesRecord.appearance : {};
  const cardConfig = isRecord(servicesRecord.cardConfig) ? servicesRecord.cardConfig : {};
  const itemsStyle = isRecord(servicesRecord.itemsStyle) ? servicesRecord.itemsStyle : {};

  // Resolução de Cores do Card (Fallback em cascata)
  const resolvedCardBg =
    (servicesRecord.cardBgColor as string) ||
    (servicesRecord.cardBackgroundColor as string) ||
    (content.cardBgColor as string) ||
    (appearance.cardBgColor as string) ||
    (cardConfig.backgroundColor as string) ||
    (itemsStyle.itemBackgroundColor as string) ||
    defaultValue.cardBgColor || "";

  const resolvedCardIconColor =
    (servicesRecord.cardIconColor as string) ||
    (content.cardIconColor as string) ||
    (appearance.cardIconColor as string) ||
    (cardConfig.iconColor as string) ||
    defaultValue.cardIconColor || "";

  return {
    ...defaultValue,
    ...servicesRecord,
    title: (content.title as string) || (servicesRecord.title as string) || defaultValue.title,
    subtitle: (content.subtitle as string) || (content.description as string) || (servicesRecord.subtitle as string) || (servicesRecord.description as string) || defaultValue.subtitle,
    cardBgColor: resolvedCardBg,
    cardBackgroundColor: resolvedCardBg,
    cardIconColor: resolvedCardIconColor,
  } as ServicesSettings;
}
