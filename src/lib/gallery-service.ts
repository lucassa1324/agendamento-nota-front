import { API_BASE_URL } from "./auth-client";
import { customFetch } from "./api-client";

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string | null;
  category: string | null;
  showInHome: boolean;
  order: number;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryDTO {
  imageUrl: string;
  title?: string;
  category?: string;
  showInHome?: boolean;
  order?: number | string;
}

export interface UpdateGalleryDTO {
  imageUrl?: string;
  title?: string;
  category?: string;
  showInHome?: boolean;
  order?: number | string;
}

class GalleryService {
  private baseUrl = `${API_BASE_URL}/api/gallery`;

  // --- Rotas Privadas (Admin) ---

  async create(data: CreateGalleryDTO): Promise<GalleryItem> {
    console.log(">>> [GalleryService] POST /api/gallery - Enviando com credentials: include");

    const response = await customFetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include", // ESSENCIAL para enviar cookies de sessão do Better-Auth
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error(">>> [GalleryService] Erro 401 ou outro no POST:", response.status, error);
      throw new Error(error.message || `Erro ${response.status} ao criar imagem na galeria`);
    }

    return response.json();
  }

  async update(id: string, data: UpdateGalleryDTO): Promise<GalleryItem> {
    const response = await customFetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      credentials: "include", // ESSENCIAL
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erro ${response.status} ao atualizar imagem na galeria`);
    }

    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await customFetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      credentials: "include", // ESSENCIAL
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erro ${response.status} ao excluir imagem da galeria`);
    }
  }

  // --- Rotas Públicas ---

  async getPublicGallery(businessId: string, filters?: { category?: string; showInHome?: boolean }): Promise<GalleryItem[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.showInHome !== undefined) params.append("showInHome", String(filters.showInHome));

    const queryString = params.toString();
    const url = `${this.baseUrl}/public/${businessId}${queryString ? `?${queryString}` : ""}`;

    const response = await customFetch(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao buscar galeria pública");
    }

    return response.json();
  }
}

export const galleryService = new GalleryService();
