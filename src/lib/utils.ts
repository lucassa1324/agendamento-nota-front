import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function maybeFixMojibake(value: string): string {
  if (!value) return value;
  if (!/[ÃÂ�]/.test(value)) return value;
  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder("utf-8").decode(bytes);
    const score = (text: string) => {
      const accents = (text.match(/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/g) || []).length;
      const mojibake = (text.match(/[ÃÂ]/g) || []).length;
      const replacement = (text.match(/�/g) || []).length;
      return accents * 2 - mojibake - replacement;
    };
    return score(decoded) > score(value) ? decoded : value;
  } catch {
    return value;
  }
}

/**
 * Converte um caminho de imagem em uma URL completa válida.
 * Atualmente prioriza URLs absolutas ou assets locais do frontend.
 * O backend não serve mais arquivos da pasta /public.
 */
export function getFullImageUrl(path: string | undefined | null) {
  if (!path) return "";

  // Se já for uma URL completa (http/https) ou base64, retorna como está
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  // Se começa com /, assume-se que é um asset local do FRONTEND (pasta public/ do Next.js)
  if (path.startsWith("/")) {
    return path;
  }

  // Caminhos relativos sem / não são mais suportados pelo backend (/public desativado)
  console.warn(
    `[getFullImageUrl] Caminho relativo detectado: "${path}". O backend não serve mais arquivos locais. Use o upload para o armazenamento em nuvem.`,
  );

  return path;
}

/**
 * Renderiza texto de forma segura, tratando objetos vindos do backend
 * que deveriam ser strings.
 */
export function renderSafeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return maybeFixMojibake(value);

  if (typeof value === "object") {
    // Se for o formato { text, color, font, size }
    if ("text" in value) {
      return maybeFixMojibake(String((value as { text?: string }).text || ""));
    }

    // Se for o formato { span: "texto" } ou similar que causa o erro do usuário
    if ("span" in value) {
      return maybeFixMojibake(String((value as { span?: string }).span || ""));
    }

    // Fallback: se for um objeto mas não tiver .text, tenta stringify ou retorna vazio
    try {
      console.warn("[renderSafeText] Objeto inesperado recebido como texto:", value);
      // Se tiver propriedades, talvez uma delas seja o texto? 
      // Mas para evitar "span" ou "[object Object]", retornamos vazio ou stringify seguro
      const keys = Object.keys(value);
      if (keys.length === 1 && typeof (value as any)[keys[0]] === 'string') {
        return maybeFixMojibake((value as any)[keys[0]]);
      }
      return "";
    } catch (_e) {
      return "";
    }
  }

  return String(value);
}
