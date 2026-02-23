import { createAuthClient } from "better-auth/react";

// Função para limpar e garantir que a URL seja absoluta
const cleanUrl = (url?: string) => {
  if (!url) return "";
  // Garante que a URL não termine com barra e seja absoluta
  let cleaned = url.replace(/\/$/, "");

  // Remove /api/auth do final se existir, para evitar duplicação pelo Better Auth
  if (cleaned.endsWith("/api/auth")) {
    cleaned = cleaned.substring(0, cleaned.length - "/api/auth".length);
  }

  return cleaned;
};

export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");

// Configura a URL base do Better Auth
// O Better-Auth EXIGE uma URL absoluta no baseURL para funcionar corretamente no client-side.
// IMPORTANTE: Garantir que termine com /api/auth se não estiver presente
const getAuthUrl = (baseUrl: string) => {
  const url = baseUrl.startsWith("/")
    ? typeof window !== "undefined"
      ? `${window.location.origin}${baseUrl}`
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || "localhost:3000"}${baseUrl}`
    : baseUrl;

  // Remove /api/auth do final se existir, pois o createAuthClient já adiciona automaticamente
  if (url.endsWith("/api/auth")) {
    return url.substring(0, url.length - "/api/auth".length);
  }

  return url.replace(/\/$/, "");
};

export const AUTH_BASE_URL = getAuthUrl(API_BASE_URL);

console.log(">>> [AUTH_CLIENT] API_BASE_URL configurada como:", API_BASE_URL);
console.log(">>> [AUTH_CLIENT] AUTH_BASE_URL configurada como:", AUTH_BASE_URL);

export const LANDING_PAGE_URL = cleanUrl(
  process.env.NEXT_PUBLIC_LANDING_PAGE_URL,
);
export const BASE_DOMAIN = cleanUrl(process.env.NEXT_PUBLIC_BASE_DOMAIN);
export const ADMIN_URL = cleanUrl(process.env.NEXT_PUBLIC_ADMIN_URL);

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
  // O Better-Auth gerencia os cookies automaticamente
  session: {
    cookieCache: {
      enabled: true, // Reabilitado para reduzir chamadas ao network e evitar ERR_ABORTED em paralelo
      maxAge: 60, // Cache de 1 minuto
    },
  },
  // Tipagem para os campos customizados do usuário (slug, business, role)
  user: {
    additionalFields: {
      slug: {
        type: "string",
      },
      role: {
        type: "string",
      },
      business: {
        type: "object",
      },
    },
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  listSessions,
  revokeSession,
} = authClient;

/**
 * Singleton para gerenciar a busca do token de sessão.
 * Evita múltiplas chamadas paralelas ao endpoint de sessão (Race Conditions / ERR_ABORTED).
 */
let sessionPromise: Promise<string | null> | null = null;
let lastToken: string | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 segundos

export const getSessionToken = async (): Promise<string | null> => {
  const now = Date.now();

  // Se tivermos um token válido e recente, retornamos ele
  if (lastToken && now - lastFetchTime < CACHE_TTL) {
    return lastToken;
  }

  // Se já houver uma requisição em andamento, retornamos a mesma promise
  if (sessionPromise) {
    return sessionPromise;
  }

  // Iniciamos uma nova requisição
  sessionPromise = (async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        lastToken = "true"; // O Better Auth usa cookies, não temos um token JWT exposto aqui
        lastFetchTime = Date.now();
        return lastToken;
      }
      return null;
    } catch (error) {
      console.error("Erro ao obter sessão:", error);
      return null;
    } finally {
      sessionPromise = null;
    }
  })();

  return sessionPromise;
};
