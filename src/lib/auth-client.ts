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
export const BASE_DOMAIN = cleanUrl(process.env.NEXT_PUBLIC_BASE_DOMAIN);
export const ADMIN_URL = cleanUrl(process.env.NEXT_PUBLIC_ADMIN_URL);

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
      console.log(">>> [AUTH_CLIENT] REQUEST INTERCEPTOR START", {
        hasContext: !!context,
        hasOptions: !!context?.options,
        url: context?.request?.url,
      });

      // PROTEÇÃO TOTAL CONTRA UNDEFINED - Solicitado pelo usuário
      if (!context || !context.options) {
        console.warn(
          ">>> [AUTH_CLIENT] REQUEST INTERCEPTOR ABORTED: Missing context or options",
        );
        return;
      }

      // DEBUG CRÍTICO: Verificar se o body já foi stringify
      const bodyIsString = typeof context?.options?.body === "string";

      console.log(">>> [AUTH_CLIENT] REQUEST INTERCEPTOR BODY CHECK:", {
        url: context?.request?.url,
        method: context?.request?.method,
        bodyType: typeof context?.options?.body,
        bodyIsString,
        bodyContentSnippet: bodyIsString
          ? context.options.body.substring(0, 50)
          : context.options.body
            ? "Object"
            : "Empty/Null",
        hasJsonProp: !!(context?.options as { json?: unknown })?.json,
      });

      // Se tiver propriedade 'json', o better-fetch vai serializar automaticamente depois deste interceptor
      if ((context?.options as { json?: unknown })?.json) {
        console.log(
          ">>> [AUTH_CLIENT] Propriedade 'json' detectada. Better-fetch cuidará da serialização.",
        );
        return;
      }

      // Se o body for um objeto e o método não for GET/HEAD, forçamos o stringify
      // Isso corrige o erro onde o browser envia [object Object]
      if (
        !bodyIsString &&
        context?.options?.body &&
        typeof context?.options?.body === "object" &&
        !["GET", "HEAD"].includes(context?.request?.method || "")
      ) {
        console.warn(">>> [AUTH_CLIENT] FORÇANDO JSON.stringify NO BODY!");
        try {
          context.options.body = JSON.stringify(context.options.body);

          // Garante o header Content-Type APENAS quando nós mesmos serializamos
          context.options.headers = {
            ...context.options.headers,
            "Content-Type": "application/json",
          };
        } catch (e) {
          console.error(
            ">>> [AUTH_CLIENT] Erro ao fazer JSON.stringify do body:",
            e,
          );
        }
      }
    },
    // biome-ignore lint/suspicious/noExplicitAny: Debugging purpose
    onResponse: async (context: any) => {
      // try {
      //   const clonedResponse = context.response.clone();
      //   const text = await clonedResponse.text();
      //   console.log(">>> [AUTH_CLIENT] RAW BACKEND RESPONSE:", text);
      // } catch (e) {
      //   console.error(">>> [AUTH_CLIENT] Erro ao ler resposta raw:", e);
      // }

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
      const resp = await fetch(`${AUTH_BASE_URL}/api-proxy/api/auth/session`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

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
      console.error("Erro ao obter sessão:", error);
      return null;
    } finally {
      sessionPromise = null;
    }
  })();

  return sessionPromise;
};
