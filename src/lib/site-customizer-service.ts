import type { SiteConfigData } from "@/components/admin/site_editor/hooks/use-site-editor";
import { API_BASE_URL, authClient } from "@/lib/auth-client";

class SiteCustomizerService {
  private baseUrl = `${API_BASE_URL}/api/settings/customization`;

  private async getAuthHeaders() {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    // 1. Tenta pegar o token de forma síncrona primeiro (mais rápido)
    let sessionToken =
      typeof window !== "undefined"
        ? localStorage.getItem("better-auth.session_token") ||
          localStorage.getItem("better-auth.access_token") ||
          getCookie("better-auth.session_token")
        : null;

    // 2. Só chama getSession() se houver algum indício de que existe uma sessão, 
    // ou se estivermos em um ambiente que exige verificação (opcional).
    // Para visitantes (sem cookies/localStorage), evitamos essa chamada para reduzir latência e erros de rede.
    const hasPossibleSession = !!(
      sessionToken || 
      getCookie("better-auth.session_token") || 
      (typeof window !== "undefined" && localStorage.getItem("better-auth.session_token"))
    );

    if (!sessionToken && hasPossibleSession && typeof window !== "undefined") {
      try {
        const { data: sessionData } = await authClient.getSession();
        sessionToken = sessionData?.session?.token || null;
      } catch (_) {
        // Silenciosamente falha se o backend estiver fora ou session for inválida
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (sessionToken) {
      headers.Authorization = `Bearer ${sessionToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    return response.json();
  }

  async getCustomization(companyId: string): Promise<SiteConfigData> {
    console.log(
      `[CUSTOMIZER] Carregando configurações de: /api/settings/customization/${companyId}`,
    );
    
    // Para o GET (público), usamos headers mínimos se não houver sessão
    // Isso evita o erro 401 para visitantes
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Se houver token, adicionamos, mas o GET deve ser permitido pelo back-end sem ele
    try {
      const authHeaders = await this.getAuthHeaders();
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }
    } catch (_) {
      // Falha ao pegar headers de auth não deve travar o GET público
    }

    const response = await fetch(`${this.baseUrl}/${companyId}`, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store", // Forçar cores sempre frescas
    });
    return this.handleResponse<SiteConfigData>(response);
  }

  async saveCustomization(
    companyId: string,
    data: Partial<SiteConfigData>,
  ): Promise<void> {
    console.log(
      `[CUSTOMIZER] Salvando configurações em: /api/settings/customization/${companyId}`,
    );
    console.log("Payload Final:", JSON.stringify(data, null, 2));
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${companyId}`, {
      method: "PATCH", // Use PATCH for partial updates
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    });
    return this.handleResponse<void>(response);
  }
}

export const siteCustomizerService = new SiteCustomizerService();
