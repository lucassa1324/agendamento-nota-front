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
  (process.env.NEXT_PUBLIC_API_URL || "/api-proxy").replace(/\/$/, ""),
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

// Lógica inteligente para detectar o domínio base em produção
const getBaseDomain = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Se estivermos no domínio oficial, forçamos o uso dele como base
    if (host.endsWith("aurasistema.com.br")) {
      return "aurasistema.com.br";
    }
  }
  return process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost:3000";
};

export const BASE_DOMAIN = cleanUrl(getBaseDomain());

// ADMIN_URL: Deve sempre apontar para o dashboard administrativo
// Adicionamos lógica para garantir que termine em /admin e não apenas no domínio
export const ADMIN_URL = (() => {
  const envUrl = cleanUrl(process.env.NEXT_PUBLIC_ADMIN_URL);

  // Se tivermos a URL no env, garantimos que ela termine em /admin
  if (envUrl) {
    return envUrl.endsWith("/admin") ? envUrl : `${envUrl}/admin`;
  }

  // Caso contrário, usamos o window.location.origin em tempo de execução
  return typeof window !== "undefined"
    ? `${window.location.origin}/admin`
    : "http://localhost:3000/admin";
})();

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  basePath: "/api-proxy/api/auth",
  fetchOptions: {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    // biome-ignore lint/suspicious/noExplicitAny: Debugging purpose
    onRequest: async (context: any) => {
      if (!context || !context.options) return;

      const bodyIsString = typeof context.options.body === "string";
      console.log(">>> [AUTH_CLIENT] REQUEST:", {
        url: context?.request?.url,
        method: context?.request?.method,
        bodyIsString,
      });
    },
    // biome-ignore lint/suspicious/noExplicitAny: Debugging purpose
    onResponse: async (context: any) => {
      console.log(">>> [AUTH_CLIENT] RESPONSE:", {
        status: context?.response?.status,
        url: context?.response?.url,
      });
    },
  },
  // O Better-Auth gerencia os cookies automaticamente
  session: {
    cookieCache: {
      enabled: false, // Desabilitado para evitar que o usuário veja "não verificado" após clicar no link
      maxAge: 0,
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
      cpfCnpj: {
        type: "string",
        input: true,
        returned: true,
      },
      business: {
        type: "object",
      },
      hasCompletedOnboarding: {
        type: "boolean",
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
  sendVerificationEmail,
} = authClient;

/**
 * Singleton para gerenciar a busca do token de sessão.
 * Evita múltiplas chamadas paralelas ao endpoint de sessão (Race Conditions / ERR_ABORTED).
 */
let sessionPromise: Promise<string | null> | null = null;
let lastToken: string | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 segundos
const SESSION_FETCH_TIMEOUT_MS = 2500;

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
  const currentPromise = (async () => {
    try {
      // No client-side, usamos URL relativa para evitar problemas de CORS em subdomínios
      const fetchUrl = typeof window !== "undefined"
        ? "/api-proxy/api/auth/session"
        : `${AUTH_BASE_URL}/api-proxy/api/auth/session`;

      console.log(`>>> [AUTH_CLIENT] Buscando sessão em: ${fetchUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        SESSION_FETCH_TIMEOUT_MS,
      );

      const resp = await fetch(fetchUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (resp.ok) {
        try {
          const text = await resp.text();
          if (!text || text.trim() === "") {
            return null;
          }
          const data = JSON.parse(text);
          // Em Better Auth, a sessão é gerenciada via cookies, mas podemos verificar se existe sessão ativa
          const token =
            data?.session?.token || (data?.user ? "authenticated" : null);
          lastToken = token;
          lastFetchTime = Date.now();
          return lastToken;
        } catch (jsonErr) {
          console.warn("[AUTH_CLIENT] Erro ao parsear sessão:", jsonErr);
          return null;
        }
      }
      return null;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return null;
      }
      console.error(">>> [AUTH_CLIENT] Erro CRÍTICO ao obter sessão:", error);
      return null;
    } finally {
      sessionPromise = null;
    }
  })();

  sessionPromise = currentPromise;
  return currentPromise;
};
