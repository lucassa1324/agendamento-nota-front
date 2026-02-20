import { customFetch } from "./api-client";
import { API_BASE_URL } from "./auth-client";

export interface InventoryLog {
  id?: string;
  type: "ENTRY" | "EXIT" | "entrada" | "saida" | "ajuste" | "venda" | "servico";
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
  isShared?: boolean;
  price: number;
  unitPrice?: number;
  lastUpdate: string;
  logs?: InventoryLog[];
}

export interface TransactionPayload {
  productId: string;
  type: "ENTRY" | "EXIT";
  quantity: number;
  reason: string;
  companyId: string;
}

class InventoryService {
  private baseUrl = `${API_BASE_URL}/api/inventory`;

  async createTransaction(
    payload: TransactionPayload,
  ): Promise<{ product: InventoryItem; log: InventoryLog }> {
    if (!payload.companyId || payload.companyId === "N/A") {
      throw new Error("ID da empresa inválido. Recarregue a página.");
    }
    const response = await customFetch(`${this.baseUrl}/transactions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  async getLogs(productId: string): Promise<InventoryLog[]> {
    const response = await customFetch(`${this.baseUrl}/${productId}/logs`);
    return this.handleResponse(response);
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

  async list(
    companyId: string,
    forceRefresh = false,
  ): Promise<InventoryItem[]> {
    const url = forceRefresh
      ? `${this.baseUrl}/company/${companyId}?t=${Date.now()}`
      : `${this.baseUrl}/company/${companyId}`;
    const response = await customFetch(url);
    return this.handleResponse(response);
  }

  async create(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await customFetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async update(
    id: string,
    data: Partial<InventoryItem>,
  ): Promise<InventoryItem> {
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

  async addLog(
    id: string,
    log: Omit<InventoryLog, "timestamp">,
  ): Promise<InventoryItem> {
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
