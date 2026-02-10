import { API_BASE_URL, getSessionToken } from "./auth-client";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "POSTPONED";

export interface CreateAppointmentDTO {
  companyId: string;
  serviceId: string;
  scheduledAt: string; // ISO Date String (UTC)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceNameSnapshot: string;
  servicePriceSnapshot: string; // ex: "150.00"
  serviceDurationSnapshot: string; // formato HH:mm, ex: "01:00"
  customerId: string | null;
  notes?: string;
  studioId?: string; // Mantido para compatibilidade se necessário
}

export interface Appointment {
  id: string;
  companyId: string;
  customerId: string;
  serviceId: string;
  scheduledAt: string;
  status: AppointmentStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceNameSnapshot: string;
  servicePriceSnapshot: string;
  serviceDurationSnapshot: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  status: number;
  statusText?: string;
  url?: string;
  code: string;
  message: string;
  raw?: unknown;
}

class AppointmentService {
  private baseUrl = `${API_BASE_URL}/api/appointments`;

  private async getAuthHeaders(skipWarning = false) {
    const sessionToken = await getSessionToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (sessionToken) {
      headers.Authorization = `Bearer ${sessionToken}`;
    } else if (!skipWarning) {
      console.warn(">>> [AppointmentService] Nenhum token encontrado!");
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Se for 401, podemos dar uma mensagem mais específica
      if (response.status === 401) {
        console.error(">>> [AppointmentService] Erro 401: Não autorizado!", {
          url: response.url,
          statusText: response.statusText,
          errorData
        });
      }

      throw {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        code: errorData.code || "UNKNOWN_ERROR",
        message: errorData.message || "Ocorreu um erro inesperado",
        raw: errorData
      };
    }
    return response.json();
  }

  async create(data: CreateAppointmentDTO): Promise<Appointment> {
    // Para criação (fluxo público), não avisamos se não houver token
    const headers = await this.getAuthHeaders(true);
    
    console.log(">>> [AppointmentService] POST /appointments", {
      hasAuth: !!headers.Authorization,
      companyId: data.companyId
    });

    const response = await fetch(`${this.baseUrl}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      // Removido credentials: "include" para evitar envio de cookies em rota pública 
      // que podem causar 401 se estiverem expirados ou forem inválidos
    });
    return this.handleResponse(response);
  }

  async listByCompany(companyId: string): Promise<Appointment[]> {
    // Para listagem por empresa (verificar disponibilidade no fluxo público), não avisamos se não houver token
    const headers = await this.getAuthHeaders(true);

    console.log(`>>> [AppointmentService] GET /appointments/company/${companyId}`, {
      hasAuth: !!headers.Authorization
    });

    const response = await fetch(`${this.baseUrl}/company/${companyId}`, {
      method: "GET",
      headers,
    });
    return this.handleResponse(response);
  }

  async listByCompanyAdmin(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Appointment[]> {
    const headers = await this.getAuthHeaders();

    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = `${this.baseUrl}/admin/company/${companyId}${queryString ? `?${queryString}` : ""}`;

    // console.log(`>>> [AppointmentService] GET ${url}`, {
    //   hasAuth: !!headers.Authorization,
    // });

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async delete(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        code: errorData.code || "UNKNOWN_ERROR",
        message: errorData.message || "Erro ao excluir agendamento",
      };
    }
  }
}

export const appointmentService = new AppointmentService();
