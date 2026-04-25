import { customFetch } from "./api-client";
import { API_BASE_URL } from "./auth-client";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ONGOING"
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
  auto_assign?: boolean;
  force_staff_id?: string | null;
  ignoreBusinessHoursValidation?: boolean;
  studioId?: string; // Mantido para compatibilidade se necessário
  items?: CreateAppointmentItemDTO[]; // Nova tabela appointment_items
}

export interface UpdateAppointmentDTO {
  serviceId: string;
  scheduledAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  servicePriceSnapshot: string;
  notes?: string;
  ignoreBusinessHoursValidation?: boolean;
}

export interface OverrideAssignmentDTO {
  professionalId?: string | null;
  force_staff_id?: string | null;
  scheduledAt?: string;
  expectedVersion?: number;
}

export interface SetAssignmentModeDTO {
  mode: "manual" | "automatic";
  expectedVersion?: number;
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
  assignedBy?: "system" | "staff";
  validationStatus?: "suggested" | "confirmed";
  priorityScore?: number;
  version?: number;
  staffId?: string | null;
  calendarColor?: string | null;
  assignedStaffName?: string | null;
  assignedStaff?: {
    id: string;
    name: string;
    calendarColor?: string | null;
  } | null;
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

export interface RedistributeSummary {
  scanned: number;
  reassigned: number;
  unchanged: number;
  skipped: number;
}

export interface RedistributeResponse {
  success: boolean;
  summary: RedistributeSummary;
}

type RichError = Error & {
  status?: number;
  statusText?: string;
  url?: string;
  code?: string;
  raw?: unknown;
};

class AppointmentService {
  private baseUrl = `${API_BASE_URL}/api/appointments`;

  private createError(payload: {
    message: string;
    status?: number;
    statusText?: string;
    url?: string;
    code?: string;
    raw?: unknown;
  }): RichError {
    const error = new Error(payload.message) as RichError;
    error.status = payload.status;
    error.statusText = payload.statusText;
    error.url = payload.url;
    error.code = payload.code;
    error.raw = payload.raw;
    return error;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      let errorData: { code?: string; message?: string; error?: string } = {};
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

      throw this.createError({
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        code: errorData.code || "UNKNOWN_ERROR",
        message:
          errorData.message ||
          errorData.error ||
          response.statusText ||
          "Ocorreu um erro inesperado",
        raw: errorData,
      });
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
      if (error && typeof error === "object" && "name" in error && error.name === "AbortError") {
        throw this.createError({
          status: 408,
          code: "TIMEOUT",
          message: "O servidor demorou muito para responder. Tente novamente.",
        });
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

  async reschedule(id: string, scheduledAt: string): Promise<Appointment> {
    const response = await customFetch(`${this.baseUrl}/${id}/schedule`, {
      method: "PATCH",
      body: JSON.stringify({ scheduledAt }),
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async update(id: string, data: UpdateAppointmentDTO): Promise<Appointment> {
    const response = await customFetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async listUnassigned(companyId: string): Promise<Appointment[]> {
    const response = await customFetch(
      `${this.baseUrl}/admin/company/${companyId}/unassigned`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );
    return this.handleResponse(response);
  }

  async redistribute(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<RedistributeResponse> {
    const response = await customFetch(
      `${this.baseUrl}/admin/company/${companyId}/redistribute`,
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      },
    );
    return this.handleResponse(response);
  }

  async listMyDaily(companyId: string, date?: string): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    const response = await customFetch(
      `${this.baseUrl}/my/company/${companyId}/daily${params.toString() ? `?${params.toString()}` : ""}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );
    return this.handleResponse(response);
  }

  async listMyOpportunities(companyId: string): Promise<Appointment[]> {
    const response = await customFetch(
      `${this.baseUrl}/my/company/${companyId}/opportunities`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );
    return this.handleResponse(response);
  }

  async overrideAssignment(
    id: string,
    data: OverrideAssignmentDTO,
  ): Promise<Appointment> {
    const response = await customFetch(`${this.baseUrl}/${id}/assignment`, {
      method: "PATCH",
      body: JSON.stringify({
        ...data,
        force_staff_id: data.force_staff_id ?? data.professionalId,
      }),
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async claimOpportunity(
    id: string,
    companyId: string,
    expectedVersion: number,
  ): Promise<Appointment> {
    const response = await customFetch(`${this.baseUrl}/${id}/claim`, {
      method: "POST",
      body: JSON.stringify({ companyId, expectedVersion }),
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
      throw this.createError({
        status: response.status,
        code: errorData.code || "UNKNOWN_ERROR",
        message: errorData.message || "Erro ao excluir agendamento",
      });
    }
  }

  async setAssignmentMode(
    id: string,
    data: SetAssignmentModeDTO,
  ): Promise<Appointment> {
    const response = await customFetch(`${this.baseUrl}/${id}/assignment-mode`, {
      method: "PATCH",
      body: JSON.stringify(data),
      credentials: "include",
    });
    return this.handleResponse(response);
  }
}

export const appointmentService = new AppointmentService();
