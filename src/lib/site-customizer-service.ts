import type { SiteConfigData } from "@/components/admin/site_editor/hooks/use-site-editor";
import { API_BASE_URL, authClient } from "@/lib/auth-client";
import { 
  defaultColorSettings, 
  defaultFontSettings, 
  defaultFooterSettings,
  defaultGallerySettings,
  defaultHeaderSettings, 
  defaultHeroSettings, 
  defaultServicesSettings,
  defaultStorySettings, 
  defaultValuesSettings
} from "./booking-data";

const DEFAULT_SITE_CONFIG: SiteConfigData = {
  isFallback: true,
  colors: defaultColorSettings,
  theme: defaultFontSettings,
  hero: defaultHeroSettings,
  header: defaultHeaderSettings,
  footer: defaultFooterSettings,
  services: defaultServicesSettings,
  values: defaultValuesSettings,
  gallery: defaultGallerySettings,
  story: defaultStorySettings,
  visibleSections: {
    hero: true,
    services: true,
    gallery: true,
    cta: true,
    footer: true
  }
};

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

  private async handleResponse<T>(response: Response): Promise<T | null> {
    if (response.status === 401) {
      console.warn(`>>> [SITE_WARN] Acesso restrito à API de customização (401) em: ${response.url}. Usando fallback silencioso.`);
      return null;
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn(`>>> [SITE_WARN] Erro na API de customização (${response.status}): ${errorData.message || 'Erro desconhecido'}`);
      return null;
    }
    return response.json();
  }

  async getCustomization(companyId: string): Promise<SiteConfigData | null> {
    const timestamp = Date.now();
    
    try {
      // Removido credentials: "include" para rotas GET públicas para evitar 401 desnecessários
      const response = await fetch(`${this.baseUrl}/${companyId}?t=${timestamp}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      
      const data = await this.handleResponse<SiteConfigData>(response);
      
      if (!data) {
        console.warn(">>> [SITE_WARN] Falha ao obter customização. Aplicando tema padrão (fallback).");
        return DEFAULT_SITE_CONFIG;
      }
      
      return data;
    } catch (error) {
      console.warn(">>> [SITE_WARN] Erro de rede ao buscar customização. Aplicando tema padrão (fallback).", error);
      return DEFAULT_SITE_CONFIG;
    }
  }

  async saveCustomization(
    companyId: string,
    data: Partial<SiteConfigData>,
  ): Promise<void> {
    console.log('>>> [FRONT_API_CALL] Enviando para o servidor...', data);
    
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
    
    await this.handleResponse<void>(response);
    if (response.ok) {
      console.log('>>> [FRONT_SAVE_SUCCESS] Banco atualizado.');
    }
  }
}

export const siteCustomizerService = new SiteCustomizerService();
