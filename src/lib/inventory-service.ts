import { API_BASE_URL } from "./auth-client";
import { customFetch } from "./api-client";

export interface InventoryLog {
  id?: string;
  type: "entrada" | "saida" | "ajuste" | "venda" | "servico";
  quantityChange: number;
  previousQuantity?: number;
  newQuantity?: number;
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
    const response = await customFetch(`${this.baseUrl}/company/${companyId}`);
    return this.handleResponse(response);
  }

  async create(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await customFetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await customFetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async delete(id: string): Promise<void> {
    const response = await customFetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
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
    const response = await customFetch(`${this.baseUrl}/${id}/logs`, {
      method: "POST",
      body: JSON.stringify(log),
    });
    return this.handleResponse(response);
  }

  async subtract(id: string, quantity: number): Promise<InventoryItem> {
    const response = await customFetch(`${this.baseUrl}/${id}/subtract`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    });
    return this.handleResponse(response);
  }
}

export const inventoryService = new InventoryService();
