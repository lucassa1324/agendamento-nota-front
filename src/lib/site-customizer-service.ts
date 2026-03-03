import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";
import type { SiteConfigData } from "@/lib/site-config-types";
import {
  defaultColorSettings,
  defaultFontSettings,
  defaultFooterSettings,
  defaultGallerySettings,
  defaultHeaderSettings,
  defaultHeroSettings,
  defaultServicesSettings,
  defaultStorySettings,
  defaultValuesSettings,
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
    footer: true,
  },
};

class SiteCustomizerService {
  private buildUrl(path: string) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    if (typeof window !== "undefined" && API_BASE_URL.startsWith("http")) {
      try {
        const apiOrigin = new URL(API_BASE_URL).origin;
        if (apiOrigin !== window.location.origin) {
          return `/api-proxy${normalizedPath}`;
        }
      } catch {
        return `/api-proxy${normalizedPath}`;
      }
    }

    const base = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;
    return `${base}${normalizedPath}`;
  }

  private async handleResponse<T>(response: Response): Promise<T | null> {
    if (response.status === 401) {
      console.warn(
        `>>> [SITE_WARN] Acesso restrito à API de customização (401) em: ${response.url}. Usando fallback silencioso.`,
      );
      return null;
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn(
        `>>> [SITE_WARN] Erro na API de customização (${response.status}): ${errorData.message || "Erro desconhecido"}`,
      );
      return null;
    }
    return response.json();
  }

  async getCustomization(companyId: string): Promise<SiteConfigData | null> {
    const timestamp = Date.now();

    try {
      const response = await customFetch(
        `${this.buildUrl("/api/settings/customization")}/${companyId}?t=${timestamp}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      const data = await this.handleResponse<SiteConfigData>(response);

      if (!data) {
        console.warn(
          ">>> [SITE_WARN] Falha ao obter customização. Aplicando tema padrão (fallback).",
        );
        return DEFAULT_SITE_CONFIG;
      }

      return data;
    } catch (error) {
      console.warn(
        ">>> [SITE_WARN] Erro de rede ao buscar customização. Aplicando tema padrão (fallback).",
        error,
      );
      return DEFAULT_SITE_CONFIG;
    }
  }

  async saveCustomization(
     companyId: string,
     data: Partial<SiteConfigData>,
   ): Promise<void> {
     console.log(">>> [FRONT_API_CALL] Enviando para o servidor...", data);
 
     console.log(
       `[CUSTOMIZER] Salvando configurações em: /api/settings/customization/${companyId}`,
     );
     console.log("Payload Final:", JSON.stringify(data, null, 2));
     const response = await customFetch(
       `${this.buildUrl("/api/settings/customization")}/${companyId}`,
       {
       method: "PATCH", // Use PATCH for partial updates
       body: JSON.stringify(data),
       credentials: "include",
      },
     );
 
     await this.handleResponse<void>(response);
     if (response.ok) {
       console.log(">>> [FRONT_SAVE_SUCCESS] Banco atualizado.");
     }
   }
 
   async uploadBackgroundImage(
    file: File | Blob,
    section: string,
    businessId: string,
  ): Promise<string> {
    console.log(
      `>>> [SiteCustomizerService] Iniciando upload para a seção: ${section}, businessId: ${businessId}`,
    );

    const formData = new FormData();
    formData.append("file", file);
    formData.append("section", section);
    formData.append("businessId", businessId);

    const response = await customFetch(
      this.buildUrl("/api/settings/background-image"),
      {
        method: "POST",
        body: formData,
      },
    );
 
     if (!response.ok) {
       const errorData = await response.json().catch(() => ({}));
       console.error(">>> [SiteCustomizerService] Erro no upload:", errorData);
       throw new Error(errorData.message || "Erro ao fazer upload da imagem.");
     }
 
     const data = await response.json();
    console.log(">>> [SiteCustomizerService] Resposta bruta do backend:", data);

    // Tentar encontrar a URL em diferentes formatos comuns
    const imageUrl = data.url || data.data?.url || data.imageUrl || data.result?.url;

    if (!imageUrl) {
      console.error(">>> [SiteCustomizerService] ERRO: URL não encontrada na resposta:", data);
    } else {
      console.log(">>> [SiteCustomizerService] URL extraída com sucesso:", imageUrl);
    }

    return imageUrl;
  }

  async deleteBackgroundImage(
    imageUrl: string,
    businessId: string,
  ): Promise<boolean> {
    console.log(`>>> [SiteCustomizerService] Solicitando deleção de imagem: ${imageUrl}`);

    try {
      const response = await customFetch(
        this.buildUrl("/api/settings/background-image"),
        {
          method: "DELETE",
          body: JSON.stringify({
            businessId,
            imageUrl,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(">>> [SiteCustomizerService] Erro ao deletar imagem:", errorData);
        return false;
      }

      console.log(">>> [SiteCustomizerService] Deleção concluída com sucesso.");
      return true;
    } catch (error) {
      console.error(">>> [SiteCustomizerService] Erro de rede ao deletar imagem:", error);
      return false;
    }
  }
}

export const siteCustomizerService = new SiteCustomizerService();
