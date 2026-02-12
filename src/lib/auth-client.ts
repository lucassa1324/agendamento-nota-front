import { createAuthClient } from "better-auth/react";

// Função para limpar e garantir que a URL seja absoluta
const cleanUrl = (url?: string) => {
  if (!url) return "";
  // Garante que a URL não termine com barra e seja absoluta
  return url.replace(/\/$/, "");
};

export const API_BASE_URL =
  cleanUrl(process.env.NEXT_PUBLIC_API_URL) || "http://localhost:3001";

// Configura a URL base do Better Auth
// O Better-Auth EXIGE uma URL absoluta no baseURL para funcionar corretamente no client-side.
// Mesmo usando Rewrites no Next.js, o client precisa saber a origem absoluta.
export const AUTH_BASE_URL = `${API_BASE_URL}/api/auth`;

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
  if (typeof window === "undefined") return null;

  // 1. Tentar pegar de locais síncronos primeiro (LocalStorage/Cookies)
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  const syncToken =
    localStorage.getItem("better-auth.session_token") ||
    localStorage.getItem("better-auth.access_token") ||
    getCookie("better-auth.session_token");

  if (syncToken) return syncToken;

  // 2. Verificar cache de memória válido
  const now = Date.now();
  if (lastToken && (now - lastFetchTime < CACHE_TTL)) {
    return lastToken;
  }

  // 3. Se já houver uma requisição em curso, retornar a mesma promessa
  if (sessionPromise) return sessionPromise;

  // 4. Iniciar nova busca de sessão
  sessionPromise = (async () => {
    try {
      const resp = await fetch(`${AUTH_BASE_URL}/get-session`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (resp.ok) {
        const data = await resp.json();
        const token = data?.session?.token || null;
        lastToken = token;
        lastFetchTime = Date.now();
        return token;
      }
      return null;
    } catch (e) {
      console.error(">>> [AUTH_CLIENT] Erro ao buscar sessão via fetch direto:", e);
      return null;
    } finally {
      sessionPromise = null;
    }
  })();

  return sessionPromise;
};
