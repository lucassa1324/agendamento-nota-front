import { API_BASE_URL, getSessionToken } from "./auth-client";

export type ExpenseCategory =
  | "INFRAESTRUTURA"
  | "UTILIDADES"
  | "MARKETING"
  | "PRODUTOS_INSUMOS"
  | "PESSOAL"
  | "SISTEMAS_SOFTWARE"
  | "IMPOSTOS"
  | "GERAL";

export interface Expense {
  id: string;
  companyId: string;
  description: string;
  value: string; // decimal string
  category: ExpenseCategory;
  dueDate: string; // ISO string
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDTO {
  companyId: string;
  description: string;
  value: string; // decimal string
  category: ExpenseCategory;
  dueDate: string; // ISO string
}

export interface ProfitReport {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  margin: number;
}

class ExpensesService {
  private baseUrl = `${API_BASE_URL}/api/expenses`;

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

  async list(companyId: string): Promise<Expense[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}?companyId=${companyId}`, {
      headers,
    });
    return this.handleResponse(response);
  }

  async create(data: CreateExpenseDTO): Promise<Expense> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async update(id: string, data: Partial<Expense>): Promise<Expense> {
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
        message: errorData.message || "Erro ao excluir gasto",
      };
    }
  }

  async getProfitReport(companyId: string): Promise<ProfitReport> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/reports/profit?companyId=${companyId}`, {
      headers,
    });
    return this.handleResponse(response);
  }
}

export const expensesService = new ExpensesService();
