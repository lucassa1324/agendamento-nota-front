import { createAuthClient } from "better-auth/react";
import {
  API_BASE_URL,
  APP_BASE_URL,
  AUTH_BASE_PATH,
  buildAuthUrl,
} from "./api-client";

export { API_BASE_URL } from "./api-client";

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

export const AUTH_BASE_URL = API_BASE_URL;

console.log(">>> [AUTH_CLIENT] API_BASE_URL configurada como:", API_BASE_URL);
console.log(">>> [AUTH_CLIENT] AUTH_BASE_URL configurada como:", AUTH_BASE_URL);
console.log(">>> [AUTH_CLIENT] APP_BASE_URL configurada como:", APP_BASE_URL);

export const LANDING_PAGE_URL = cleanUrl(
  process.env.NEXT_PUBLIC_LANDING_PAGE_URL,
);

// Lógica inteligente para detectar o domínio base em produção
const getBaseDomain = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Se estivermos no domínio oficial, forçamos o uso dele como base
    // Suporte para staging e produção
    if (host.endsWith("staging.aurasistema.com.br")) {
      return "staging.aurasistema.com.br";
    }
    if (host.endsWith("aurasistema.com.br")) {
      return "aurasistema.com.br";
    }
  }
  return process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost:3000";
};

export const BASE_DOMAIN = cleanUrl(getBaseDomain());
export const ADMIN_URL = cleanUrl(process.env.NEXT_PUBLIC_ADMIN_URL);

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  basePath: AUTH_BASE_PATH,
  fetchOptions: {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    // biome-ignore lint/suspicious/noExplicitAny: Debugging purpose
    onRequest: async (context: any) => {
      // PROTEÇÃO CONTRA UNDEFINED - Solicitado pelo usuário
      // Mas se não houver context ou options, apenas retornamos para deixar o better-fetch seguir seu curso padrão
      if (!context || !context.options) {
        return;
      }

      // DEBUG CRÍTICO: Verificar se o body já foi stringify
      const bodyIsString = typeof context.options.body === "string";

      console.log(">>> [AUTH_CLIENT] REQUEST INTERCEPTOR BODY CHECK:", {
        url: context?.request?.url,
        method: context?.request?.method,
        bodyType: typeof context.options.body,
        bodyIsString,
        bodyContentSnippet: bodyIsString
          ? (context.options.body as string).substring(0, 50)
          : context.options.body
            ? "Object"
            : "Empty/Null",
        hasJsonProp: !!(context.options as { json?: unknown })?.json,
      });

      if ((context?.options as { json?: unknown })?.json) {
        console.log(
          ">>> [AUTH_CLIENT] Propriedade 'json' detectada. Better-fetch cuidará da serialização.",
        );
      }
    },
    // biome-ignore lint/suspicious/noExplicitAny: Debugging purpose
    onResponse: async (context: any) => {
      if (context.response.status >= 400) {
        try {
          const clonedResponse = context.response.clone();
          const text = await clonedResponse.text();
          console.error(
            `>>> [AUTH_CLIENT] ERROR RESPONSE (${context.response.status}):`,
            text,
          );
        } catch (e) {
          console.error(">>> [AUTH_CLIENT] Erro ao ler resposta de erro:", e);
        }
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
      enabled: false, // Desabilitado para evitar que o usuário veja "não verificado" após clicar no link
      maxAge: 0,
    },
  },
  // Tipagem para os campos customizados do usuário (slug, businessId, role)
  user: {
    additionalFields: {
      cpfCnpj: {
        type: "string",
      },
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
      acceptedTerms: {
        type: "boolean",
      },
      acceptedTermsAt: {
        type: "string",
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

// O cookie de sessão é assinado como TOKEN.SIGNATURE. O token puro é a parte antes do último "."
// (formato confirmado no better-call: getSignedCookie faz value.substring(0, value.lastIndexOf("."))).
const readTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const cookieNames = [
    "__Secure-better-auth.session_token",
    "better-auth.session_token",
  ];
  for (const name of cookieNames) {
    const match = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${name}=`));
    if (match) {
      const value = match.substring(name.length + 1);
      const sigStart = value.lastIndexOf(".");
      if (sigStart > 0) return value.substring(0, sigStart);
      return value || null;
    }
  }
  return null;
};

export const getSessionToken = async (): Promise<string | null> => {
  const now = Date.now();

  // Se tivermos um token válido e recente, retornamos ele
  if (lastToken && now - lastFetchTime < CACHE_TTL) {
    return lastToken;
  }

  // No client-side, lemos o token direto do cookie: sem rede, sem timeout, sem cold start
  const cookieToken = readTokenFromCookie();
  if (cookieToken) {
    lastToken = cookieToken;
    lastFetchTime = Date.now();
    return lastToken;
  }

  // Se já houver uma requisição em andamento, retornamos a mesma promise
  if (sessionPromise) {
    return sessionPromise;
  }

  // Iniciamos uma nova requisição
  const currentPromise = (async () => {
    try {
      const fetchUrl = buildAuthUrl("/session");

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
          const token =
            typeof data?.session?.token === "string" &&
            data.session.token.trim().length > 0
              ? data.session.token
              : null;
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
