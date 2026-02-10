import { API_BASE_URL, getSessionToken } from "@/lib/auth-client";
import type { BlockedPeriod, DaySchedule } from "@/lib/booking-data";

type WeekdaySchedulePayload = {
  dayOfWeek: string;
  status: "OPEN" | "CLOSED";
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
};

type BlockPayload = {
  companyId: string;
  type: "BLOCK_DAY" | "BLOCK_HOUR" | "BLOCK_PERIOD";
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
};

type SettingsPayload = {
  companyId: string;
  interval?: string;
  slotInterval?: string; // Adicionado para suportar o campo que o backend retorna
  weekly: WeekdaySchedulePayload[];
  agendaAberta?: boolean; // Adicionado para refletir o status da agenda no Dashboard
};

class BusinessService {
  private baseUrl = `${API_BASE_URL}/api/business/settings`;

  private async getAuthHeaders() {
    const sessionToken = await getSessionToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (sessionToken) {
      headers.Authorization = `Bearer ${sessionToken}`;
      console.log(
        ">>> [BusinessService] Sessão válida encontrada (token presente).",
      );
    } else {
      console.warn(
        ">>> [BusinessService] Nenhuma sessão encontrada. Requisições podem retornar 401.",
      );
    }

    return headers;
  }

  async saveSettings(payload: SettingsPayload) {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseUrl}/${payload.companyId}`;

    // Remove companyId do corpo para evitar erro de additionalProperties: false
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { companyId: _, ...rest } = payload;

    console.log("JSON enviado (Settings):", JSON.stringify(rest, null, 2));

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(rest),
      credentials: "include",
    });

    if (!response.ok) {
      const msg = await response.text().catch(() => "");
      throw new Error(
        msg || `Falha ao salvar configurações (${response.status})`,
      );
    }

    return response.json().catch(() => ({}));
  }

  async getSettings(companyId: string): Promise<SettingsPayload | null> {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseUrl}/${companyId}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      // Removido credentials para permitir chamadas públicas se o backend suportar
      credentials: headers.Authorization ? "include" : "omit",
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      if (response.status === 401) {
        console.warn(`>>> [BusinessService] Acesso não autorizado ao buscar configurações para ${companyId}.`);
        return null;
      }
      const msg = await response.text().catch(() => "");
      throw new Error(
        msg || `Falha ao buscar configurações (${response.status})`,
      );
    }

    const data = await response.json();

    // Normalizar slotInterval para interval se necessário
    if (data?.slotInterval && !data.interval) {
      data.interval = data.slotInterval;
    }

    return data;
  }

  async getBlocks(companyId: string): Promise<BlockedPeriod[]> {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseUrl}/${companyId}/blocks`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: headers.Authorization ? "include" : "omit",
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn(`>>> [BusinessService] Acesso não autorizado ao buscar bloqueios para ${companyId}.`);
        return [];
      }
      const msg = await response.text().catch(() => "");
      throw new Error(msg || `Falha ao buscar bloqueios (${response.status})`);
    }

    const data = await response.json();

    // Mapear do backend para o formato esperado pelo frontend se necessário
    if (Array.isArray(data)) {
      return data.map(
        (
          b: Partial<
            BlockPayload & { id?: string; startDate?: string; date?: string }
          >,
        ) => ({
          id: b.id || Math.random().toString(36).slice(2, 11),
          date: b.startDate || b.date || "",
          startTime: b.startTime,
          endTime: b.endTime,
          reason: b.reason,
        }),
      );
    }

    return [];
  }

  async createBlock(payload: BlockPayload) {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseUrl}/${payload.companyId}/blocks`;

    // Remove companyId do corpo pois já está na URL
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { companyId: _, ...rest } = payload;

    console.log("JSON enviado (Block):", JSON.stringify(rest, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(rest),
      credentials: "include",
    });

    if (!response.ok) {
      const msg = await response.text().catch(() => "");
      throw new Error(msg || `Falha ao criar bloqueio (${response.status})`);
    }

    return response.json().catch(() => ({}));
  }

  async deleteBlock(companyId: string, blockId: string) {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseUrl}/${companyId}/blocks/${blockId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const msg = await response.text().catch(() => "");
      throw new Error(msg || `Falha ao excluir bloqueio (${response.status})`);
    }

    return true;
  }
}

export const businessService = new BusinessService();

export function buildSchedulePayload(
  week: DaySchedule[],
): WeekdaySchedulePayload[] {
  // Retorna um Array de 7 objetos conforme esperado pelo Back-end
  return week.map((day) => ({
    dayOfWeek: day.dayOfWeek.toString(),
    status: day.isOpen ? "OPEN" : "CLOSED",
    morningStart: normalizeTime(day.openTime),
    morningEnd: normalizeTime(day.lunchStart),
    afternoonStart: normalizeTime(day.lunchEnd),
    afternoonEnd: normalizeTime(day.closeTime),
  }));
}

export function normalizeTime(time: string): string {
  if (!time) return "00:00";
  if (time.length === 5 && time.includes(":")) return time;
  // Se for apenas H:mm ou algo assim, tenta normalizar
  const [h, m] = time.split(":");
  return `${h.padStart(2, "0")}:${(m || "00").padEnd(2, "0")}`;
}

export function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
