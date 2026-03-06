import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";
import type { SiteConfigData } from "@/lib/site-config-types";
import {
  clearAllCustomizationCache,
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

  async getDraftCustomization(
    companyId: string,
    signal?: AbortSignal,
  ): Promise<SiteConfigData | null> {
    const timestamp = Date.now();

    try {
      const response = await customFetch(
        `${this.buildUrl("/api/settings/draft")}/${companyId}?t=${timestamp}`,
        {
          method: "GET",
          signal,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          cache: "no-store",
          next: { revalidate: 0 },
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
      if (error instanceof Error && error.name === "AbortError") {
        console.log(">>> [SITE_DEBUG] Busca de customização (draft) cancelada.");
        return null;
      }

      console.warn(
        ">>> [SITE_WARN] Erro de rede ao buscar customização. Aplicando tema padrão (fallback).",
        error,
      );
      return DEFAULT_SITE_CONFIG;
    }
  }

  async getPublishedCustomization(
    companyId: string,
    signal?: AbortSignal,
  ): Promise<SiteConfigData | null> {
    const timestamp = Date.now();

    try {
      const response = await customFetch(
        `${this.buildUrl("/api/settings/published")}/${companyId}?t=${timestamp}`,
        {
          method: "GET",
          signal,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          cache: "no-store",
          next: { revalidate: 0 },
        },
      );

      const data = await this.handleResponse<SiteConfigData>(response);

      if (!data) {
        console.warn(
          ">>> [SITE_WARN] Falha ao obter customização publicada. Aplicando tema padrão (fallback).",
        );
        return DEFAULT_SITE_CONFIG;
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log(">>> [SITE_DEBUG] Busca de customização (publicada) cancelada.");
        return null;
      }

      console.warn(
        ">>> [SITE_WARN] Erro de rede ao buscar customização publicada. Aplicando tema padrão (fallback).",
        error,
      );
      return DEFAULT_SITE_CONFIG;
    }
  }

  async saveCustomization(
    companyId: string,
    data: Partial<SiteConfigData>,
  ): Promise<SiteConfigData | null> {
    return this.saveDraftCustomization(companyId, data);
  }

  async saveDraftCustomization(
    companyId: string,
    data: Partial<SiteConfigData>,
  ): Promise<SiteConfigData | null> {
    console.log(">>> [FRONT_API_CALL] Enviando para o servidor...", data);

    console.log(
      `[CUSTOMIZER] Salvando configurações em: /api/settings/draft/${companyId}`,
    );
    console.log("Payload Final:", JSON.stringify(data, null, 2));
    const rawResponse = await customFetch(
      `${this.buildUrl("/api/settings/draft")}/${companyId}`,
      {
        method: "PATCH", // Use PATCH for partial updates
        body: JSON.stringify(data),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const result = await this.handleResponse<SiteConfigData>(rawResponse);
    if (rawResponse.ok && result) {
      console.log(">>> [FRONT_SAVE_SUCCESS] Banco atualizado com sucesso.", result);
    }
    return result;
  }

  async publishCustomization(companyId: string): Promise<boolean> {
    const rawResponse = await customFetch(
      `${this.buildUrl("/api/settings/publish")}/${companyId}`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (!rawResponse.ok) {
      await this.handleResponse<void>(rawResponse);
      return false;
    }

    await rawResponse.text().catch(() => "");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("site-published-success"));
      // Limpeza profunda de todo o cache local para garantir que a produção seja carregada fresca
      clearAllCustomizationCache();
    }
    return true;
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
    const imageUrl =
      data.url || data.data?.url || data.imageUrl || data.result?.url;

    if (!imageUrl) {
      console.error(
        ">>> [SiteCustomizerService] ERRO: URL não encontrada na resposta:",
        data,
      );
    } else {
      console.log(
        ">>> [SiteCustomizerService] URL extraída com sucesso:",
        imageUrl,
      );
    }

    return imageUrl;
  }

  async deleteBackgroundImage(
    imageUrl: string,
    businessId: string,
  ): Promise<boolean> {
    console.log(
      `>>> [SiteCustomizerService] Solicitando deleção de imagem: ${imageUrl}`,
    );

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
        console.error(
          ">>> [SiteCustomizerService] Erro ao deletar imagem:",
          errorData,
        );
        return false;
      }

      console.log(">>> [SiteCustomizerService] Deleção concluída com sucesso.");
      return true;
    } catch (error) {
      console.error(
        ">>> [SiteCustomizerService] Erro de rede ao deletar imagem:",
        error,
      );
      return false;
    }
  }
}

export const siteCustomizerService = new SiteCustomizerService();
