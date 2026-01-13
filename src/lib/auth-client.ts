import { createAuthClient } from "better-auth/react";

// Função para limpar e garantir que a URL seja absoluta
const cleanUrl = (url?: string) => {
  if (!url) return "";
  // Garante que a URL não termine com barra e seja absoluta
  return url.replace(/\/$/, "");
};

export const API_BASE_URL = cleanUrl(process.env.NEXT_PUBLIC_API_URL);
// Em produção, o Better-Auth exige uma URL absoluta. Usamos o próprio domínio do Front,
// garantindo cookies de primeira parte, combinando com o rewrite para o backend.
const ensureAbsolute = (origin?: string) => {
  if (!origin) return "";
  const normalized = cleanUrl(origin);
  return normalized.startsWith("http") ? normalized : `https://${normalized}`;
};

const FRONT_ORIGIN =
  typeof window !== "undefined"
    ? window.location.origin
    : ensureAbsolute(
        process.env.NEXT_PUBLIC_FRONT_URL ||
          process.env.VERCEL_URL ||
          process.env.NEXT_PUBLIC_BASE_DOMAIN ||
          "http://localhost:3000",
      );

export const AUTH_BASE_URL = `${FRONT_ORIGIN}/api/auth`;

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
      enabled: true,
      factor: 0.8,
    },
  },
  // Tipagem para os campos customizados do usuário (slug, business)
  user: {
    additionalFields: {
      slug: {
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
