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
    const timestamp = Date.now();
    console.log(
      `>>> [CACHE_CHECK] Buscando dados com timestamp: ${timestamp} para: /api/settings/customization/${companyId}`,
    );
    
    const response = await fetch(`${this.baseUrl}/${companyId}?t=${timestamp}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      credentials: "include",
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
