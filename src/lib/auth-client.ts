import { createAuthClient } from "better-auth/react";

// Função para limpar e garantir que a URL seja absoluta
const cleanUrl = (url?: string) => {
  if (!url) return "";
  // Garante que a URL não termine com barra e seja absoluta
  return url.replace(/\/$/, "");
};

export const API_BASE_URL = cleanUrl(process.env.NEXT_PUBLIC_API_URL);
export const LANDING_PAGE_URL = cleanUrl(
  process.env.NEXT_PUBLIC_LANDING_PAGE_URL,
);
export const BASE_DOMAIN = cleanUrl(process.env.NEXT_PUBLIC_BASE_DOMAIN);
export const ADMIN_URL = cleanUrl(process.env.NEXT_PUBLIC_ADMIN_URL);

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
  // Prioriza cookies e garante persistência estável
  session: {
    cookieCache: {
      enabled: true,
      factor: 0.8,
    },
  },
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
