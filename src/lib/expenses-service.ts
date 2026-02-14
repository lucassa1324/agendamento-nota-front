import { customFetch } from "./api-client";
import { API_BASE_URL } from "./auth-client";

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
    const response = await customFetch(`${this.baseUrl}?companyId=${companyId}`);
    return this.handleResponse(response);
  }

  async create(data: CreateExpenseDTO): Promise<Expense> {
    const response = await customFetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async update(id: string, data: Partial<Expense>): Promise<Expense> {
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
        message: errorData.message || "Erro ao excluir gasto",
      };
    }
  }

  async getProfitReport(companyId: string): Promise<ProfitReport> {
    const response = await customFetch(`${API_BASE_URL}/api/reports/profit?companyId=${companyId}`);
    return this.handleResponse(response);
  }
}

export const expensesService = new ExpensesService();
