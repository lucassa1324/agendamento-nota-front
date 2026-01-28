
import { API_BASE_URL } from "./auth-client";

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "POSTPONED";

export interface CreateAppointmentDTO {
  companyId: string;
  serviceId: string;
  scheduledAt: string; // ISO Date String
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceNameSnapshot: string;
  servicePriceSnapshot: string; // decimal string
  serviceDurationSnapshot: string; // minutos string
  customerId?: string | null;
  notes?: string;
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

class AppointmentService {
  private baseUrl = `${API_BASE_URL}/api/appointments`;

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 500) {
        console.error(">>> [ERRO 500] Detalhes do Servidor (API Appointments):", errorData);
      }
      throw {
        status: response.status,
        code: errorData.code || "UNKNOWN_ERROR",
        message: errorData.message || "Ocorreu um erro inesperado",
      };
    }
    return response.json();
  }

  async create(data: CreateAppointmentDTO): Promise<Appointment> {
    const response = await fetch(`${this.baseUrl}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async listByCompany(companyId: string): Promise<Appointment[]> {
    const response = await fetch(`${this.baseUrl}/company/${companyId}`, {
      method: "GET",
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
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
