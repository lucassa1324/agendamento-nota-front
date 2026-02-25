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

// O Better-Auth EXIGE uma URL absoluta no baseURL para funcionar corretamente.
const getAbsoluteUrl = (path: string) => {
  if (path.startsWith("http")) return path;

  // No client-side, window.location.origin resolve
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }

  // No server-side (Next.js), precisamos de uma URL absoluta para o proxy
  // Usamos localhost:3000 como fallback padrão de desenvolvimento
  return `http://localhost:3000${path}`;
};

export const API_BASE_URL = getAbsoluteUrl(
  (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api-proxy"
  ).replace(/\/$/, ""),
);

// Agora forçamos o prefixo /api/auth para alinhar com o proxy e o back-end.
// Para o Better Auth funcionar corretamente com o proxy, o baseURL deve ser a origem (ex: http://localhost:3000)
// e o basePath deve ser o caminho completo do proxy (ex: /api-proxy/api/auth).
export const AUTH_BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

console.log(">>> [AUTH_CLIENT] API_BASE_URL configurada como:", API_BASE_URL);
console.log(">>> [AUTH_CLIENT] AUTH_BASE_URL configurada como:", AUTH_BASE_URL);

export const LANDING_PAGE_URL = cleanUrl(
  process.env.NEXT_PUBLIC_LANDING_PAGE_URL,
);
export const BASE_DOMAIN = cleanUrl(process.env.NEXT_PUBLIC_BASE_DOMAIN);
export const ADMIN_URL = cleanUrl(process.env.NEXT_PUBLIC_ADMIN_URL);

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  basePath: "/api-proxy/api/auth",
  fetchOptions: {
    credentials: "include",
    headers: {
      Accept: "application/json",
      // REMOVIDO: "Content-Type": "application/json" - Deixar o Better Auth gerenciar isso para garantir stringify correto
    },
    // biome-ignore lint/suspicious/noExplicitAny: Debugging purpose
    onRequest: async (context: any) => {
      // DEBUG CRÍTICO: Verificar se o body já foi stringify
      const bodyIsString = typeof context?.options?.body === "string";

      console.log(">>> [AUTH_CLIENT] REQUEST INTERCEPTOR:", {
        url: context?.request?.url,
        method: context?.request?.method,
        headers: context?.options?.headers,
        bodyType: typeof context?.options?.body,
        bodyIsString,
      });

      // Se o body for um objeto e o método não for GET/HEAD, forçamos o stringify
      // Isso corrige o erro onde o browser envia [object Object]
      if (
        !bodyIsString &&
        context?.options?.body &&
        typeof context?.options?.body === "object" &&
        !["GET", "HEAD"].includes(context?.request?.method || "")
      ) {
        console.warn(">>> [AUTH_CLIENT] FORÇANDO JSON.stringify NO BODY!");
        context.options.body = JSON.stringify(context.options.body);
        
        // Garante o header Content-Type
        context.options.headers = {
          ...context.options.headers,
          "Content-Type": "application/json",
        };
      }
    },
    // biome-ignore lint/suspicious/noExplicitAny: Debugging purpose
    onResponse: async (context: any) => {
      try {
        const clonedResponse = context.response.clone();
        const text = await clonedResponse.text();
        console.log(">>> [AUTH_CLIENT] RAW BACKEND RESPONSE:", text);
      } catch (e) {
        console.error(">>> [AUTH_CLIENT] Erro ao ler resposta raw:", e);
      }
      
      console.log(">>> [AUTH_CLIENT] RESPONSE INTERCEPTOR:", {
        status: context?.response?.status,
        url: context?.response?.url,
      });
    },
  },
  // O Better-Auth gerencia os cookies automaticamente
  session: {
    cookieCache: {
      enabled: true, // Reabilitado para reduzir chamadas ao network e evitar ERR_ABORTED em paralelo
      maxAge: 60, // Cache de 1 minuto
    },
  },
  // Tipagem para os campos customizados do usuário (slug, businessId, role)
  user: {
    additionalFields: {
      slug: {
        type: "string",
      },
      role: {
        type: "string",
      },
      businessId: {
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
  changePassword,
  updateUser,
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
  if (lastToken && now - lastFetchTime < CACHE_TTL) {
    return lastToken;
  }

  // 3. Se já houver uma requisição em curso, retornar a mesma promessa
  if (sessionPromise) return sessionPromise;

  // 4. Iniciar nova busca de sessão
  sessionPromise = (async () => {
    try {
      const resp = await fetch(`${AUTH_BASE_URL}/api/auth/session`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
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
      console.error(
        ">>> [AUTH_CLIENT] Erro ao buscar sessão via fetch direto:",
        e,
      );
      return null;
    } finally {
      sessionPromise = null;
    }
  })();

  return sessionPromise;
};
