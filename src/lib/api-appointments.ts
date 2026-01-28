
import { API_BASE_URL, authClient } from "./auth-client";

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

  private async getAuthHeaders() {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    let sessionToken = typeof window !== "undefined" 
      ? (localStorage.getItem("better-auth.session_token") || 
         localStorage.getItem("better-auth.access_token") ||
         getCookie("better-auth.session_token"))
      : null;

    // Se não encontrou manualmente, tenta via authClient (Better-Auth)
    if (!sessionToken && typeof window !== "undefined") {
      try {
        const { data: sessionData } = await authClient.getSession();
        sessionToken = sessionData?.session?.token || null;
      } catch (e) {
        console.error(
          ">>> [AppointmentService] Erro ao buscar sessão via authClient:",
          e,
        );
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (sessionToken) {
      headers.Authorization = `Bearer ${sessionToken}`;
      // console.log(">>> [AppointmentService] Token anexado:", `Bearer ${sessionToken.substring(0, 10)}...`);
    } else {
      console.warn(">>> [AppointmentService] Nenhum token encontrado!");
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 500) {
        console.error(
          ">>> [ERRO 500] Detalhes do Servidor (API Appointments):",
          errorData,
        );
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
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async listByCompany(companyId: string): Promise<Appointment[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/company/${companyId}`, {
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
