
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
  token?: string;
  slug?: string;
  business?: {
    id: string;
    name: string;
    slug: string;
  };
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse | null> {
  try {
    console.log(">>> [AUTH] Iniciando login para:", email);
    const requestBody = {
      email,
      password,
      callbackURL: "/",
    };
    console.log(">>> [AUTH] Enviando para o back-end:", { ...requestBody, password: "***" });

    const response = await fetch(`${API_BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include", // Critical for cookies
    });

    console.log(">>> [AUTH] Resposta do back-end (status):", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(">>> [AUTH] Login falhou. Detalhes do erro:", errorData);
      return null;
    }

    const data = await response.json();
    console.log(">>> [AUTH] Login bem-sucedido. Dados recebidos:", {
      user: data.user,
      session: data.session,
      hasBusiness: !!data.business
    });
    return data;
  } catch (error) {
    console.error(">>> [AUTH] Erro inesperado durante o login:", error);
    return null;
  }
}

export async function signUp(email: string, password: string, name: string, studioName: string): Promise<AuthResponse | null> {
  try {
    console.log(">>> [AUTH] Iniciando cadastro para:", email, "com estúdio:", studioName);
    const requestBody = {
      email,
      password,
      name,
      studioName,
    };
    console.log(">>> [AUTH] Enviando para o back-end (POST /api/users):", { ...requestBody, password: "***" });

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
      slug: data.slug
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
      console.log(">>> [AUTH] Usando Token para verificar sessão.");
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    console.log(">>> [AUTH] Resposta get-session (status):", response.status);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    console.log(">>> [AUTH] Sessão encontrada:", !!data);
    return data;
  } catch (error) {
    console.error(">>> [AUTH] Erro ao verificar sessão:", error);
    return null;
  }
}

// Nota: O código abaixo foi solicitado pelo usuário para configuração do Better-Auth Client.
// Caso a biblioteca 'better-auth/client' seja instalada futuramente, este cliente pode ser utilizado.
/*
import { createAuthClient } from "better-auth/client";
export const authClient = createAuthClient({ 
  baseURL: API_BASE_URL, 
  fetchOptions: { 
    credentials: "include" 
  } 
});
*/

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
