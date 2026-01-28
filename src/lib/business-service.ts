import { API_BASE_URL, authClient } from "@/lib/auth-client";
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
  interval: string;
  weekly: WeekdaySchedulePayload[];
  // Removido blocks daqui pois agora será POST individual
};

class BusinessService {
  private baseUrl = `${API_BASE_URL}/api/business/settings`;

  private async getAuthHeaders() {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    let sessionToken =
      typeof window !== "undefined"
        ? localStorage.getItem("better-auth.session_token") ||
          localStorage.getItem("better-auth.access_token") ||
          getCookie("better-auth.session_token")
        : null;

    if (!sessionToken && typeof window !== "undefined") {
      try {
        const { data: sessionData } = await authClient.getSession();
        sessionToken = sessionData?.session?.token || null;
      } catch (_) {}
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (sessionToken) {
      headers.Authorization = `Bearer ${sessionToken}`;
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

export function buildBlocksPayload(
  blocks: BlockedPeriod[],
  companyId: string,
): BlockPayload[] {
  return blocks.map((b) => {
    let type: "BLOCK_DAY" | "BLOCK_HOUR" | "BLOCK_PERIOD" = "BLOCK_DAY";
    if (b.startTime && b.endTime) {
      type = "BLOCK_HOUR";
    }

    return {
      companyId,
      type,
      startDate: b.date,
      endDate: b.date,
      startTime: b.startTime ? normalizeTime(b.startTime) : undefined,
      endTime: b.endTime ? normalizeTime(b.endTime) : undefined,
      reason: b.reason,
    };
  });
}

export function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
}

function normalizeTime(value: string): string {
  const v = (value || "").trim();
  if (/^\d{2}:\d{2}$/.test(v)) return v;
  const parts = v.split(":");
  const hh = parts[0] || "00";
  const mm = parts[1] || "00";
  const pad = (s: string) => s.padStart(2, "0").slice(-2);
  return `${pad(hh)}:${pad(mm)}`;
}
