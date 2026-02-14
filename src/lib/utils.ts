import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_BASE_URL } from "./auth-client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converte um caminho de imagem (relativo ou absoluto) em uma URL completa válida.
 * Útil para exibir imagens que vêm do backend.
 */
export function getFullImageUrl(path: string | undefined | null) {
  if (!path) return "";
  
  // Se já for uma URL completa (http/https) ou base64, retorna como está
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  
  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  // Garante que o path comece com /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // Se o path não começa com /public, nós adicionamos (exigência do backend)
  const finalPath = cleanPath.startsWith("/public") ? cleanPath : `/public${cleanPath}`;

  return `${baseUrl}${finalPath}`;
}
