/**
 * Schema de normalização para a seção "Nossos Valores" (ou diferenciais).
 */

import { defaultValuesSettings, type ValuesSettings } from "@/lib/booking-data";

/**
 * Schema de normalização para a seção "Nossos Valores" (ou diferenciais).
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

export function normalizeValuesSchema(
  valuesSource: any,
  defaultValue: ValuesSettings = defaultValuesSettings
): ValuesSettings {
  if (!valuesSource || !isRecord(valuesSource)) return defaultValue;

  const valuesRecord = valuesSource as Record<string, unknown>;
  const content = isRecord(valuesRecord.content) ? valuesRecord.content : {};
  const appearance = isRecord(valuesRecord.appearance) ? valuesRecord.appearance : {};
  const itemsStyle = isRecord(valuesRecord.itemsStyle) ? valuesRecord.itemsStyle : {};

  const resolvedCardBg =
    (valuesRecord.cardBgColor as string) ||
    (content.cardBgColor as string) ||
    (appearance.cardBgColor as string) ||
    (appearance.cardBackgroundColor as string) ||
    (itemsStyle.itemBackgroundColor as string) ||
    defaultValue.cardBgColor || "";

  const resolvedTitleColor =
    (valuesRecord.titleColor as string) ||
    (content.titleColor as string) ||
    (appearance.titleColor as string) ||
    defaultValue.titleColor || "";

  const resolvedSubtitleColor =
    (valuesRecord.subtitleColor as string) ||
    (content.subtitleColor as string) ||
    (appearance.subtitleColor as string) ||
    defaultValue.subtitleColor || "";

  const resolvedCardTitleColor =
    (valuesRecord.cardTitleColor as string) ||
    (content.cardTitleColor as string) ||
    (appearance.cardTitleColor as string) ||
    defaultValue.cardTitleColor || "";

  const resolvedCardDescriptionColor =
    (valuesRecord.cardDescriptionColor as string) ||
    (content.cardDescriptionColor as string) ||
    (appearance.cardDescriptionColor as string) ||
    defaultValue.cardDescriptionColor || "";

  const resolvedCardIconColor =
    (valuesRecord.cardIconColor as string) ||
    (content.cardIconColor as string) ||
    (appearance.cardIconColor as string) ||
    defaultValue.cardIconColor || "";

  const resolvedBgColor =
    (valuesRecord.bgColor as string) ||
    (appearance.backgroundColor as string) ||
    defaultValue.bgColor || "";

  return {
    ...defaultValue,
    ...valuesRecord,
    title: (content.title as string) || (valuesRecord.title as string) || defaultValue.title,
    subtitle: (content.subtitle as string) || (content.description as string) || (valuesRecord.subtitle as string) || (valuesRecord.description as string) || defaultValue.subtitle,
    items: Array.isArray(valuesRecord.items) ? valuesRecord.items : defaultValue.items,
    cardBgColor: resolvedCardBg,
    cardBackgroundColor: resolvedCardBg,
    titleColor: resolvedTitleColor,
    subtitleColor: resolvedSubtitleColor,
    cardTitleColor: resolvedCardTitleColor,
    cardDescriptionColor: resolvedCardDescriptionColor,
    cardIconColor: resolvedCardIconColor,
    bgColor: resolvedBgColor,
    appearance: {
      ...defaultValue.appearance,
      ...(valuesRecord.appearance as any),
      cardBgColor: resolvedCardBg,
      cardBackgroundColor: resolvedCardBg,
      titleColor: resolvedTitleColor,
      subtitleColor: resolvedSubtitleColor,
      cardTitleColor: resolvedCardTitleColor,
      cardDescriptionColor: resolvedCardDescriptionColor,
      cardIconColor: resolvedCardIconColor,
      backgroundColor: resolvedBgColor,
    }
  } as ValuesSettings;
}
