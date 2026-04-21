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

  const isStoragePath = (pathname: string) => pathname.startsWith("/api/storage/");

  const toProxyStorageUrl = (pathname: string, search = "", hash = "") => {
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `/api-proxy${normalizedPath}${search}${hash}`;
  };

  // Se já for uma URL completa (http/https) ou base64, retorna como está
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    try {
      const parsed = new URL(path);
      // Evita depender do domínio direto do backend (.vercel.app), usando o proxy do frontend.
      if (isStoragePath(parsed.pathname)) {
        return toProxyStorageUrl(parsed.pathname, parsed.search, parsed.hash);
      }
    } catch {
      // Se falhar o parse, mantém o valor original.
    }
    return path;
  }

  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  // Se começa com /, assume-se que é um asset local do FRONTEND (pasta public/ do Next.js)
  if (path.startsWith("/")) {
    if (isStoragePath(path)) {
      return toProxyStorageUrl(path);
    }
    return path;
  }

  // Garante que o path comece com /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Se o path não começa com /public, nós adicionamos (exigência do backend)
  const finalPath = cleanPath.startsWith("/public")
    ? cleanPath
    : `/public${cleanPath}`;

  return `${baseUrl}${finalPath}`;
}
