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

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  business?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Session {
  id: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
  sessionToken?: string; // Para compatibilidade com better-auth
  // biome-ignore lint/suspicious/noExplicitAny: Resposta dinâmica do back-end
  user?: any; // Em alguns casos o usuário vem dentro da sessão
  // biome-ignore lint/suspicious/noExplicitAny: Resposta dinâmica do back-end
  [key: string]: any; // Permite propriedades dinâmicas
}

export interface AuthResponse {
  // biome-ignore lint/suspicious/noExplicitAny: Resposta dinâmica do back-end
  user?: User | any;
  // biome-ignore lint/suspicious/noExplicitAny: Resposta dinâmica do back-end
  session?: Session | any;
  token?: string;
  slug?: string;
  email?: string; // Caso o objeto seja o próprio usuário
  business?:
    | {
        id: string;
        name: string;
        slug: string;
      }
    // biome-ignore lint/suspicious/noExplicitAny: Resposta dinâmica do back-end
    | any;
  data?: {
    // biome-ignore lint/suspicious/noExplicitAny: Resposta dinâmica do back-end
    user?: User | any;
    token?: string;
    // biome-ignore lint/suspicious/noExplicitAny: Resposta dinâmica do back-end
    session?: Session | any;
    business?:
      | {
          id: string;
          name: string;
          slug: string;
        }
      // biome-ignore lint/suspicious/noExplicitAny: Resposta dinâmica do back-end
      | any;
    // biome-ignore lint/suspicious/noExplicitAny: Resposta dinâmica do back-end
    [key: string]: any;
  };
  // biome-ignore lint/suspicious/noExplicitAny: Resposta dinâmica do back-end
  [key: string]: any; // Permite que a resposta tenha qualquer outra propriedade
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResponse | null> {
  try {
    console.log(">>> [AUTH] Iniciando login para:", email);
    const requestBody = {
      email,
      password,
      callbackURL: "/",
    };
    console.log(">>> [AUTH] Enviando para o back-end:", {
      ...requestBody,
      password: "***",
    });

    const response = await fetch(`${API_BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include", // Critical for cookies
    });

    console.log(
      ">>> [AUTH] Resposta do back-end (status):",
      response.status,
      response.statusText,
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: unknown;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      console.error(">>> [AUTH] Login falhou!", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return null;
    }

    const data = await response.json();
    console.log(">>> [AUTH] Login bem-sucedido. Dados recebidos:", {
      user: data.user,
      session: data.session,
      hasBusiness: !!data.business,
    });
    return data;
  } catch (error) {
    console.error(">>> [AUTH] Erro inesperado durante o login:", error);
    return null;
  }
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  studioName: string,
): Promise<AuthResponse | null> {
  try {
    console.log(
      ">>> [AUTH] Iniciando cadastro para:",
      email,
      "com estúdio:",
      studioName,
    );
    const requestBody = {
      email,
      password,
      name,
      studioName,
    };
    console.log(">>> [AUTH] Enviando para o back-end (POST /api/users):", {
      ...requestBody,
      password: "***",
    });

    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
    });

    console.log(">>> [AUTH] Resposta do cadastro (status):", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(">>> [AUTH] Cadastro falhou. Detalhes:", errorData);
      return null;
    }

    const data = await response.json();
    console.log(">>> [AUTH] Cadastro bem-sucedido. Dados:", {
      user: data.user,
      business: data.business,
      slug: data.slug,
    });
    return data;
  } catch (error) {
    console.error(">>> [AUTH] Erro inesperado durante o cadastro:", error);
    return null;
  }
}

export async function getSession(token?: string): Promise<AuthResponse | null> {
  try {
    console.log(">>> [AUTH] Verificando sessão ativa...");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      console.log(
        ">>> [AUTH] Enviando token puro no header Authorization:",
        `${token.substring(0, 10)}...`,
      );
      // Alterado de `Bearer ${token}` para apenas `${token}` conforme solicitado
      headers.Authorization = token;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    const responseText = await response.text();
    console.log(">>> [AUTH] Resposta get-session (status):", response.status);

    if (!response.ok) {
      console.warn(
        ">>> [AUTH] get-session falhou com status:",
        response.status,
        responseText,
      );
      return null;
    }

    try {
      const data = JSON.parse(responseText);
      console.log(
        ">>> [AUTH] Dados da sessão decodificados:",
        `${JSON.stringify(data).substring(0, 100)}...`,
      );
      return data as AuthResponse;
    } catch {
      console.error(">>> [AUTH] Erro ao parsear JSON da sessão:", responseText);
      return null;
    }
  } catch (error) {
    console.error(">>> [AUTH] Erro ao verificar sessão:", error);
    return null;
  }
}

import { createAuthClient } from "better-auth/client";

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

export async function logout(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/sign-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}
