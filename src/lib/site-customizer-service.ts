import type { SiteConfigData } from "@/components/admin/site_editor/hooks/use-site-editor";
import { API_BASE_URL } from "@/lib/auth-client";
import { customFetch } from "@/lib/api-client";
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
      const response = await customFetch(`${this.baseUrl}/${companyId}?t=${timestamp}`, {
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
    const response = await customFetch(`${this.baseUrl}/${companyId}`, {
      method: "PATCH", // Use PATCH for partial updates
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
