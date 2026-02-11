import { API_BASE_URL, getSessionToken } from "./auth-client";

export interface InventoryLog {
  id?: string;
  type: "entrada" | "saida" | "ajuste";
  quantityChange: number;
  reason?: string;
  notes?: string;
  timestamp: string;
}

export interface InventoryItem {
  id: string;
  companyId: string;
  name: string;
  quantity: number;
  currentQuantity?: number;
  minQuantity: number;
  unit: string;
  secondaryUnit?: string;
  conversionFactor?: number;
  price: number;
  unitPrice?: number;
  lastUpdate: string;
  logs?: InventoryLog[];
}

class InventoryService {
  private baseUrl = `${API_BASE_URL}/api/inventory`;

  private async getAuthHeaders() {
    const sessionToken = await getSessionToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers.Authorization = `Bearer ${sessionToken}`;
    }
    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || "Ocorreu um erro inesperado",
        raw: errorData,
      };
    }
    return response.json();
  }

  async list(companyId: string): Promise<InventoryItem[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/company/${companyId}`, {
      headers,
    });
    return this.handleResponse(response);
  }

  async create(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async delete(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || "Erro ao excluir item do estoque",
      };
    }
  }

  async addLog(id: string, log: Omit<InventoryLog, "timestamp">): Promise<InventoryItem> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}/logs`, {
      method: "POST",
      headers,
      body: JSON.stringify(log),
    });
    return this.handleResponse(response);
  }
}

export const inventoryService = new InventoryService();
