import { API_BASE_URL } from "./auth-client";
import { customFetch } from "./api-client";

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
    console.log(">>> [AppointmentService] POST /appointments", {
      companyId: data.companyId
    });

    const response = await customFetch(`${this.baseUrl}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async listByCompany(companyId: string): Promise<Appointment[]> {
    console.log(`>>> [AppointmentService] GET /appointments/company/${companyId}`);

    const response = await customFetch(`${this.baseUrl}/company/${companyId}`, {
      method: "GET",
    });
    return this.handleResponse(response);
  }

  async listByCompanyAdmin(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = `${this.baseUrl}/admin/company/${companyId}${queryString ? `?${queryString}` : ""}`;

    const response = await customFetch(url, {
      method: "GET",
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    const response = await customFetch(`${this.baseUrl}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async delete(id: string): Promise<void> {
    const response = await customFetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
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
