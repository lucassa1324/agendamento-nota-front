import { customFetch } from "./api-client";
import { API_BASE_URL } from "./auth-client";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "POSTPONED";

export interface CreateAppointmentItemDTO {
  serviceId: string;
  serviceNameSnapshot: string;
  servicePriceSnapshot: string;
  serviceDurationSnapshot: string;
}

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
  items?: CreateAppointmentItemDTO[]; // Nova tabela appointment_items
}

export interface AppointmentItem {
  id: string;
  appointmentId: string;
  serviceId: string;
  serviceNameSnapshot: string;
  servicePriceSnapshot: string;
  serviceDurationSnapshot: string;
  createdAt: string;
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
  items?: AppointmentItem[];
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
      let errorData: { code?: string; message?: string } = {};
      const contentType = response.headers.get("content-type");
      
      try {
        if (contentType?.includes("application/json")) {
          errorData = await response.json();
        } else {
          errorData = { message: await response.text() };
        }
      } catch {
        errorData = { message: "Erro ao processar resposta do servidor" };
      }

      // Se for 401, podemos dar uma mensagem mais específica
      if (response.status === 401) {
        console.error(">>> [AppointmentService] Erro 401: Não autorizado!", {
          url: response.url,
          statusText: response.statusText,
          errorData,
        });
      }

      throw {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        code: errorData.code || "UNKNOWN_ERROR",
        message: errorData.message || "Ocorreu um erro inesperado",
        raw: errorData,
      };
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }

  async create(data: CreateAppointmentDTO): Promise<Appointment> {
    console.log(">>> [AppointmentService] POST /appointments", {
      companyId: data.companyId,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout

    try {
      const response = await customFetch(`${this.baseUrl}`, {
        method: "POST",
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      return await this.handleResponse(response);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error && error.name === "AbortError") {
        throw {
          status: 408,
          code: "TIMEOUT",
          message: "O servidor demorou muito para responder. Tente novamente.",
        };
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async listByCompany(companyId: string): Promise<Appointment[]> {
    console.log(
      `>>> [AppointmentService] GET /appointments/company/${companyId}`,
    );

    const response = await customFetch(`${this.baseUrl}/company/${companyId}`, {
      method: "GET",
      cache: "no-store",
      next: { revalidate: 0 },
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
      cache: "no-store",
      next: { revalidate: 0 },
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
      const errorData: { code?: string; message?: string } = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        code: errorData.code || "UNKNOWN_ERROR",
        message: errorData.message || "Erro ao excluir agendamento",
      };
    }
  }
}

export const appointmentService = new AppointmentService();
