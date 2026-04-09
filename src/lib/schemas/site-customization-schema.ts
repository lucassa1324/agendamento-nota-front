import { z } from "zod";

/**
 * SCHEMA DE BLINDAGEM - PILAR 1
 * Garante que dados vindos de qualquer fonte (API, LocalStorage, postMessage)
 * tenham o formato mínimo esperado para não quebrar a UI.
 */

// Schema para cores que aceita diversos formatos de entrada (Porteiro de Cores)
// Usamos preprocess para ser mais robusto contra versões diferentes de Zod e evitar erros internos
export const ColorSchema = z.preprocess((val) => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) {
    const obj = val as any;
    return obj.hex || obj.text || obj.color || undefined;
  }
  return undefined;
}, z.string().optional());

// Schema de Aparência Base para qualquer seção
export const AppearanceSchema = z
  .object({
    backgroundColor: ColorSchema,
    backgroundImageUrl: z.string().optional(),
    textColor: ColorSchema,
    padding: z.string().optional(),
    gap: z.string().optional(),
    borderRadius: z.string().optional(),
  })
  .passthrough(); // passthrough() é mais robusto que catchall(z.any()) em algumas versões

// Schema para seções genéricas do site
export const SectionSchema = z
  .object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    appearance: AppearanceSchema.optional(),
    content: z.preprocess((val) => {
      if (typeof val === "string") {
        const trimmed = val.trim();
        if (!trimmed || trimmed === "{}" || trimmed === "[]") return undefined;
        if (
          (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
          (trimmed.startsWith("[") && trimmed.endsWith("]"))
        ) {
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              return parsed;
            }
          } catch (_e) {}
        }
        return { text: val };
      }
      if (Array.isArray(val)) return { items: val };
      if (val && typeof val !== "object") return { value: val };
      return val;
    }, z.record(z.string(), z.any()).optional()),
    visible: z.boolean().optional().default(true),
  })
  .passthrough();

// Schema para os Steps de Agendamento (Onde o editor quebrou recentemente)
export const BookingStepSchema = z
  .object({
    cardBgColor: ColorSchema,
    bgColor: ColorSchema,
    appearance: AppearanceSchema.optional(),
  })
  .passthrough();

// Schema mestre para as seções de agendamento
export const BookingStepsMapSchema = z.object({
  service: BookingStepSchema.optional(),
  date: BookingStepSchema.optional(),
  time: BookingStepSchema.optional(),
  form: BookingStepSchema.optional(),
  confirmation: BookingStepSchema.optional(),
});
