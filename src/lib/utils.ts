import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converte um caminho de imagem em uma URL completa válida.
 * Atualmente prioriza URLs absolutas (Blackblaze B2) ou assets locais do frontend.
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
    `[getFullImageUrl] Caminho relativo detectado: "${path}". O backend não serve mais arquivos locais. Use o upload para o B2.`,
  );

  return path;
}

/**
 * Renderiza texto de forma segura, tratando objetos vindos do backend
 * que deveriam ser strings.
 */
export function renderSafeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  
  if (typeof value === "object") {
    // Se for o formato { text, color, font, size }
    if ("text" in value) return String((value as { text?: string }).text || "");
    
    // Fallback: se for um objeto mas não tiver .text, tenta stringify ou retorna vazio
    try {
      console.warn("[renderSafeText] Objeto inesperado recebido como texto:", value);
      return "";
    } catch (_e) {
      return "";
    }
  }
  
  return String(value);
}
