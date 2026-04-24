"use client";

import {
  addMonths,
  endOfMonth,
  format,
  getDay,
  getDaysInMonth,
  isSameDay,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminResourceTimeline } from "@/components/admin/admin-resource-timeline";
import { SuggestedAppointmentCard } from "@/components/admin/suggested-appointment-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import { type Appointment, appointmentService } from "@/lib/api-appointments";
import { customFetch } from "@/lib/api-client";

type StaffMember = {
  id: string;
  userId?: string | null;
  name: string;
  isProfessional: boolean;
  isActive: boolean;
  calendarColor?: string | null;
};

type AssignState = Record<string, string>;
type BoardMode = "assignment" | "calendar";

type AdminAssignmentBoardProps = {
  mode?: BoardMode;
};

const STAFF_COLOR_PALETTE = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#ca8a04",
  "#db2777",
];
const PENDING_COLOR = "#64748b";
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const AUTO_RELOAD_STORAGE_KEY = "admin_assignment_auto_reload_ms";
const AUTO_RELOAD_ENABLED_STORAGE_KEY = "admin_assignment_auto_reload_enabled";
const AUTO_RELOAD_OPTIONS = [
  { label: "5s", value: 5000 },
  { label: "10s", value: 10000 },
  { label: "15s", value: 15000 },
  { label: "30s", value: 30000 },
  { label: "60s", value: 60000 },
];

const isSystemSuggested = (appointment: Appointment) =>
  appointment.assignedBy === "system" &&
  appointment.validationStatus === "suggested";

const normalizeStaffColor = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return HEX_COLOR_REGEX.test(normalized) ? normalized : fallback;
};

const normalizeLookupKey = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
};

const withAlpha = (hexColor: string, alphaHex: string) => {
  const normalized = normalizeStaffColor(hexColor, PENDING_COLOR);
  return `${normalized}${alphaHex}`;
};

const getCardStyle = (color: string, suggested?: boolean) => ({
  borderColor: color,
  backgroundColor: `${color}26`,
  boxShadow: `inset 0 0 0 1px ${color}33`,
  ...(suggested
    ? {
        backgroundImage:
          "repeating-linear-gradient(-45deg, rgba(255,255,255,0.18), rgba(255,255,255,0.18) 8px, transparent 8px, transparent 16px)",
      }
    : {}),
});

export function AdminAssignmentBoard({ mode = "assignment" }: AdminAssignmentBoardProps) {
  const { studio } = useStudio();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd"),
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([]);
  const [unassigned, setUnassigned] = useState<Appointment[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [professionals, setProfessionals] = useState<StaffMember[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [redistributing, setRedistributing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignByAppointment, setAssignByAppointment] = useState<AssignState>({});
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(`${selectedDate}T12:00:00`),
  );
  const [selectedCalendarAppointment, setSelectedCalendarAppointment] =
    useState<Appointment | null>(null);
  const [autoReloadEnabled, setAutoReloadEnabled] = useState(true);
  const [autoReloadMs, setAutoReloadMs] = useState(15000);

  const getResolvedStaffId = useCallback(
    (appointment: Appointment | null) => {
      if (!appointment) return "";
      return (
        assignByAppointment[appointment.id] ||
        appointment.assignedStaff?.id ||
        appointment.staffId ||
        ""
      );
    },
    [assignByAppointment],
  );

  useEffect(() => {
    const nextMonth = new Date(`${selectedDate}T12:00:00`);
    if (
      nextMonth.getMonth() !== calendarMonth.getMonth() ||
      nextMonth.getFullYear() !== calendarMonth.getFullYear()
    ) {
      setCalendarMonth(nextMonth);
    }
  }, [calendarMonth, selectedDate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEnabled = window.localStorage.getItem(
      AUTO_RELOAD_ENABLED_STORAGE_KEY,
    );
    const storedMs = window.localStorage.getItem(AUTO_RELOAD_STORAGE_KEY);

    if (storedEnabled === "false") {
      setAutoReloadEnabled(false);
    }

    if (storedMs) {
      const parsed = Number(storedMs);
      if (
        Number.isFinite(parsed) &&
        AUTO_RELOAD_OPTIONS.some((option) => option.value === parsed)
      ) {
        setAutoReloadMs(parsed);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      AUTO_RELOAD_ENABLED_STORAGE_KEY,
      String(autoReloadEnabled),
    );
  }, [autoReloadEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTO_RELOAD_STORAGE_KEY, String(autoReloadMs));
  }, [autoReloadMs]);

  const dayLabel = useMemo(() => {
    const date = new Date(`${selectedDate}T12:00:00`);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }, [selectedDate]);

  const monthLabel = useMemo(
    () => format(calendarMonth, "MMMM yyyy", { locale: ptBR }),
    [calendarMonth],
  );

  const loadBoard = useCallback(async () => {
    if (!studio?.id) return;
    setLoading(true);
    try {
      const start = `${selectedDate}T00:00:00Z`;
      const end = `${selectedDate}T23:59:59Z`;
      const monthStart = startOfMonth(calendarMonth).toISOString();
      const monthEnd = endOfMonth(calendarMonth).toISOString();

      const [unassignedRows, staffResponse] = await Promise.all([
        appointmentService.listUnassigned(studio.id),
        customFetch(`/api/staff/company/${studio.id}`, { method: "GET" }),
      ]);

      const [allAppointments, monthRows] = await Promise.all([
        appointmentService.listByCompanyAdmin(studio.id, start, end),
        appointmentService.listByCompanyAdmin(studio.id, monthStart, monthEnd),
      ]);

      if (!staffResponse.ok) {
        const staffError = await staffResponse
          .json()
          .catch(() => ({ error: "Não foi possível carregar as funcionárias." }));
        throw new Error(
          typeof staffError?.error === "string"
            ? staffError.error
            : "Não foi possível carregar as funcionárias.",
        );
      }

      const rawStaffPayload = (await staffResponse.json().catch(() => [])) as
        | StaffMember[]
        | { data?: StaffMember[]; members?: StaffMember[]; error?: string };
      const staffPayload = Array.isArray(rawStaffPayload)
        ? rawStaffPayload
        : Array.isArray(rawStaffPayload?.data)
          ? rawStaffPayload.data
          : Array.isArray(rawStaffPayload?.members)
            ? rawStaffPayload.members
            : [];

      const activeRows = staffPayload.filter((member) => member.isActive);
      const professionalRows = activeRows.filter((member) => member.isProfessional);

      setAppointments(allAppointments);
      setMonthAppointments(monthRows);
      setStaffMembers(activeRows);
      setProfessionals(professionalRows);
      setUnassigned(
        unassignedRows.filter((item) => item.scheduledAt.startsWith(selectedDate)),
      );
      setAssignByAppointment((current) => {
        const next: AssignState = { ...current };
        for (const appt of allAppointments) {
          if (appt.staffId) next[appt.id] = appt.staffId;
        }
        return next;
      });
    } catch (error) {
      console.error("Erro ao carregar painel de designação:", error);
      toast({
        title: "Falha ao carregar painel",
        description:
          mode === "calendar"
            ? "Não foi possível carregar o calendário da equipe."
            : "Não foi possível montar o fluxo de encaminhamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [calendarMonth, mode, selectedDate, studio?.id, toast]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    if (!selectedCalendarAppointment) return;
    const freshAppointment = monthAppointments.find(
      (item) => item.id === selectedCalendarAppointment.id,
    );
    if (freshAppointment) {
      setSelectedCalendarAppointment(freshAppointment);
    }
  }, [monthAppointments, selectedCalendarAppointment]);

  useEffect(() => {
    if (!autoReloadEnabled) return;
    const intervalId = window.setInterval(() => {
      loadBoard();
    }, autoReloadMs);

    const handleWindowFocus = () => {
      loadBoard();
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleWindowFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleWindowFocus);
    };
  }, [autoReloadEnabled, autoReloadMs, loadBoard]);

  const groupedByProfessional = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const professional of professionals) {
      map.set(professional.id, []);
    }
    for (const appointment of appointments) {
      if (!appointment.staffId) continue;
      if (!map.has(appointment.staffId)) continue;
      map.get(appointment.staffId)?.push(appointment);
    }
    for (const [, list] of map) {
      list.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
    }
    return map;
  }, [appointments, professionals]);

  const staffColorMap = useMemo(() => {
    const map = new Map<string, string>();
    staffMembers.forEach((member, index) => {
      const color = normalizeStaffColor(
        member.calendarColor,
        STAFF_COLOR_PALETTE[index % STAFF_COLOR_PALETTE.length],
      );
      map.set(member.id, color);
      map.set(normalizeLookupKey(member.id), color);
      if (member.userId) {
        map.set(member.userId, color);
        map.set(normalizeLookupKey(member.userId), color);
      }
    });
    return map;
  }, [staffMembers]);

  const calendarLegend = useMemo(
    () => [
      { id: "pending", label: "Pendente", color: PENDING_COLOR },
      ...staffMembers.map((member) => ({
        id: member.id,
        label: member.name,
        color: staffColorMap.get(member.id) || PENDING_COLOR,
      })),
    ],
    [staffMembers, staffColorMap],
  );

  const staffNameMap = useMemo(() => {
    const map = new Map<string, string>();
    staffMembers.forEach((member) => {
      map.set(member.id, member.name);
      map.set(normalizeLookupKey(member.id), member.name);
      if (member.userId) {
        map.set(member.userId, member.name);
        map.set(normalizeLookupKey(member.userId), member.name);
      }
    });
    return map;
  }, [staffMembers]);

  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const calendarDaysInMonth = getDaysInMonth(calendarMonth);
  const calendarStartDayOfWeek = getDay(startOfMonth(calendarMonth));
  const calendarDayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  const getAppointmentResolvedColor = useCallback(
    (appointment: Appointment) => {
      const extended = appointment as Appointment & {
        color?: string | null;
        calendarColor?: string | null;
        staffColor?: string | null;
      };

      const byAssignedStaffObject = appointment.assignedStaff?.calendarColor;

      const byStaffId = appointment.staffId
        ? staffColorMap.get(appointment.staffId) ||
          staffColorMap.get(normalizeLookupKey(appointment.staffId))
        : undefined;

      const persistedColor =
        byAssignedStaffObject ||
        extended.color ||
        extended.calendarColor ||
        extended.staffColor;

      const baseColor = byStaffId || persistedColor || PENDING_COLOR;
      const normalizedColor = normalizeStaffColor(baseColor, PENDING_COLOR);

      return {
        color: withAlpha(normalizedColor, "26"),
        borderColor: normalizedColor,
      };
    },
    [staffColorMap],
  );

  const getAppointmentsForCalendarDay = useCallback(
    (day: number) => {
      const date = new Date(calendarYear, calendarMonthIndex, day);
      return monthAppointments
        .filter((appointment) =>
          isSameDay(parseISO(appointment.scheduledAt), date),
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
        )
        .map((appointment) => ({
          appointment,
          resolvedColor: getAppointmentResolvedColor(appointment),
        }));
    },
    [calendarMonthIndex, calendarYear, getAppointmentResolvedColor, monthAppointments],
  );

  const handleAssign = async (
    appointment: Appointment,
    professionalId: string,
  ) => {
    if (!professionalId) {
      toast({
        title: "Selecione uma funcionária",
        description: "Escolha o profissional antes de encaminhar.",
        variant: "destructive",
      });
      return;
    }

    setAssigningId(appointment.id);
    try {
      const updatedAppointment = await appointmentService.overrideAssignment(
        appointment.id,
        {
        professionalId,
        expectedVersion: appointment.version ?? 1,
        },
      );

      setAppointments((current) =>
        current.map((item) =>
          item.id === updatedAppointment.id ? updatedAppointment : item,
        ),
      );
      setMonthAppointments((current) =>
        current.map((item) =>
          item.id === updatedAppointment.id ? updatedAppointment : item,
        ),
      );
      setUnassigned((current) =>
        professionalId
          ? current.filter((item) => item.id !== updatedAppointment.id)
          : current.map((item) =>
              item.id === updatedAppointment.id ? updatedAppointment : item,
            ),
      );
      setAssignByAppointment((current) => ({
        ...current,
        [updatedAppointment.id]: professionalId,
      }));

      toast({
        title: "Encaminhado com sucesso",
        description: "A agenda foi confirmada manualmente pela secretaria/admin.",
      });
      setSelectedCalendarAppointment(null);
      await loadBoard();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível encaminhar este agendamento.";

      const errorStatus =
        typeof error === "object" && error && "status" in error
          ? Number((error as { status?: number }).status)
          : undefined;

      if (errorStatus === 409) {
        await loadBoard();
      }

      toast({
        title: "Falha ao encaminhar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setAssigningId(null);
    }
  };

  const handleRedistribute = async () => {
    if (!studio?.id) return;
    setRedistributing(true);
    try {
      const monthStart = startOfMonth(calendarMonth).toISOString();
      const monthEnd = endOfMonth(calendarMonth).toISOString();
      const response = await appointmentService.redistribute(
        studio.id,
        monthStart,
        monthEnd,
      );
      const summary = response.summary;
      toast({
        title: "Redistribuição concluída",
        description: `${summary.reassigned} redistribuídos, ${summary.unchanged} mantidos e ${summary.skipped} sem elegibilidade.`,
      });
      await loadBoard();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível redistribuir os agendamentos.";
      toast({
        title: "Falha na redistribuição",
        description: message,
        variant: "destructive",
      });
    } finally {
      setRedistributing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 text-primary" />
              {mode === "calendar"
                ? "Calendário de Agendamentos"
                : "Painel de Encaminhamentos"}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "calendar"
                ? "Visualize o mês inteiro com cores por funcionária e pendências em destaque."
                : "Organize os agendamentos pendentes e confirme os encaminhamentos do dia."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-9 rounded-md border px-3 text-sm"
            />
            <select
              className="h-9 rounded-md border px-2 text-sm"
              value={String(autoReloadMs)}
              onChange={(event) => setAutoReloadMs(Number(event.target.value))}
              disabled={!autoReloadEnabled}
              aria-label="Intervalo de autoatualização"
            >
              {AUTO_RELOAD_OPTIONS.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  Auto {option.label}
                </option>
              ))}
            </select>
            <Button
              variant={autoReloadEnabled ? "default" : "outline"}
              onClick={() => setAutoReloadEnabled((current) => !current)}
            >
              {autoReloadEnabled ? "Auto ON" : "Auto OFF"}
            </Button>
            <Button
              variant="outline"
              onClick={handleRedistribute}
              disabled={loading || redistributing}
            >
              {redistributing ? "Redistribuindo..." : "Redistribuir"}
            </Button>
            <Button variant="outline" onClick={loadBoard} disabled={loading}>
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Operação do dia: <strong>{dayLabel}</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {calendarLegend.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card p-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : mode === "calendar" ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">Calendário mensal</CardTitle>
                  <p className="text-sm text-muted-foreground capitalize">
                    {monthLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCalendarMonth((prev) => subMonths(prev, 1))}
                    aria-label="Mês anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCalendarMonth(new Date(`${selectedDate}T12:00:00`))
                    }
                  >
                    Ir para dia selecionado
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCalendarMonth((prev) => addMonths(prev, 1))}
                    aria-label="Próximo mês"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground">
                {calendarDayNames.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {Array.from({ length: calendarStartDayOfWeek }).map((_, index) => (
                  <div
                    key={`calendar-start-empty-${index}`}
                    className="min-h-24 rounded-md border border-dashed bg-muted/10"
                  />
                ))}

                {Array.from({ length: calendarDaysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const date = new Date(calendarYear, calendarMonthIndex, day);
                  const dateIso = format(date, "yyyy-MM-dd");
                  const dayAppointments = getAppointmentsForCalendarDay(day);
                  const isSelected = dateIso === selectedDate;
                  const isToday = isSameDay(date, new Date());

                  return (
                    <div
                      key={`calendar-day-${dateIso}`}
                      className={`min-h-24 rounded-md border p-2 ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background"
                      }`}
                    >
                      <button
                        type="button"
                        className={`mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                        onClick={() => setSelectedDate(dateIso)}
                        aria-label={`Selecionar dia ${dateIso}`}
                      >
                        {day}
                      </button>

                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map(({ appointment, resolvedColor }) => {
                          return (
                            <button
                              key={appointment.id}
                              type="button"
                              onClick={() => setSelectedCalendarAppointment(appointment)}
                              className="w-full truncate rounded border px-1.5 py-1 text-left text-[10px]"
                              style={{
                                ...getCardStyle(resolvedColor.borderColor, isSystemSuggested(appointment)),
                                backgroundColor: resolvedColor.color,
                                borderColor: resolvedColor.borderColor,
                              }}
                            >
                              {format(parseISO(appointment.scheduledAt), "HH:mm")}{" "}
                              {appointment.customerName}
                            </button>
                          );
                        })}
                        {dayAppointments.length > 3 && (
                          <p className="text-[10px] text-muted-foreground">
                            +{dayAppointments.length - 3} agend.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-3">
              <CardTitle className="text-base">God View - Timeline diária</CardTitle>
              <p className="text-sm text-muted-foreground">
                Arraste um card para outro profissional para aplicar override manual.
              </p>
            </CardHeader>
            <CardContent>
              {unassigned.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Backlog sem profissional
                  </p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {unassigned.map((appointment) => (
                      <SuggestedAppointmentCard
                        key={`${appointment.id}-${appointment.version ?? 1}`}
                        appointment={appointment}
                        timeLabel={format(parseISO(appointment.scheduledAt), "HH:mm")}
                      />
                    ))}
                  </div>
                </div>
              )}
              <AdminResourceTimeline
                date={selectedDate}
                professionals={professionals.map((item) => ({
                  id: item.id,
                  name: item.name,
                }))}
                appointments={appointments}
                onDropAssignment={async (appointment, staffId) => {
                  await handleAssign(appointment, staffId);
                }}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-base">
                Backlog - Pendentes ({unassigned.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {unassigned.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Sem pendências para encaminhar neste dia.
                </p>
              )}
              {unassigned.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-lg border p-3"
                  style={getCardStyle(PENDING_COLOR, isSystemSuggested(appointment))}
                >
                  <p className="text-sm font-medium">{appointment.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.serviceNameSnapshot} •{" "}
                    {format(parseISO(appointment.scheduledAt), "HH:mm")}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <select
                      className="h-9 flex-1 rounded-md border px-2 text-sm"
                      value={assignByAppointment[appointment.id] || ""}
                      onChange={(event) =>
                        setAssignByAppointment((current) => ({
                          ...current,
                          [appointment.id]: event.target.value,
                        }))
                      }
                    >
                      <option value="">Selecionar profissional</option>
                      {professionals.map((professional) => (
                        <option key={professional.id} value={professional.id}>
                          {professional.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      className="gap-1"
                      disabled={assigningId === appointment.id}
                      onClick={() =>
                        handleAssign(
                          appointment,
                          assignByAppointment[appointment.id] || "",
                        )
                      }
                    >
                      {assigningId === appointment.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                      )}
                      Encaminhar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:col-span-8 md:grid-cols-2">
            {professionals.map((professional) => {
              const rows = groupedByProfessional.get(professional.id) || [];
              const color = staffColorMap.get(professional.id) || PENDING_COLOR;
              return (
                <Card key={professional.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {professional.name} ({rows.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {rows.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Sem agendamentos nesta coluna.
                      </p>
                    )}
                    {rows.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="rounded-lg border p-3"
                        style={getCardStyle(color, isSystemSuggested(appointment))}
                      >
                        <p className="text-sm font-medium">
                          {format(parseISO(appointment.scheduledAt), "HH:mm")} •{" "}
                          {appointment.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.serviceNameSnapshot}
                        </p>
                        {isSystemSuggested(appointment) && (
                          <p className="mt-1 text-[11px] font-medium text-blue-700">
                            Sugestão automática do sistema
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(selectedCalendarAppointment)}
        onOpenChange={(open) => {
          if (!open) setSelectedCalendarAppointment(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {selectedCalendarAppointment && (
            <>
              <DialogHeader>
                <DialogTitle>Atribuir agendamento</DialogTitle>
                <DialogDescription>
                  Ajuste a responsável pelo atendimento diretamente pelo calendário.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold text-foreground">
                    {selectedCalendarAppointment.customerName}
                  </p>
                  <p className="text-muted-foreground">
                    {format(
                      parseISO(selectedCalendarAppointment.scheduledAt),
                      "dd/MM/yyyy 'às' HH:mm",
                    )}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    <span className="font-medium text-foreground">Procedimento:</span>{" "}
                    {selectedCalendarAppointment.serviceNameSnapshot}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Responsável:</span>{" "}
                    {getResolvedStaffId(selectedCalendarAppointment)
                      ? selectedCalendarAppointment.assignedStaff?.name ||
                        selectedCalendarAppointment.assignedStaffName ||
                        staffNameMap.get(
                          getResolvedStaffId(selectedCalendarAppointment),
                        ) ||
                        "Profissional"
                      : "Pendente"}
                  </p>
                  {isSystemSuggested(selectedCalendarAppointment) && (
                    <p className="mt-2 text-[12px] font-medium text-blue-700">
                      Sugestão automática do sistema
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="calendar-appointment-assignee"
                    className="text-sm font-medium"
                  >
                    Funcionária responsável
                  </label>
                  <select
                    id="calendar-appointment-assignee"
                    className="h-10 w-full rounded-md border px-3 text-sm"
                    value={
                      getResolvedStaffId(selectedCalendarAppointment)
                    }
                    onChange={(event) =>
                      setAssignByAppointment((current) => ({
                        ...current,
                        [selectedCalendarAppointment.id]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Selecionar profissional</option>
                    {professionals.map((professional) => (
                      <option key={professional.id} value={professional.id}>
                        {professional.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCalendarAppointment(null)}
                  >
                    Fechar
                  </Button>
                  <Button
                    className="gap-2"
                    disabled={assigningId === selectedCalendarAppointment.id}
                    onClick={() =>
                      handleAssign(
                        selectedCalendarAppointment,
                        getResolvedStaffId(selectedCalendarAppointment),
                      )
                    }
                  >
                    {assigningId === selectedCalendarAppointment.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                    )}
                    Salvar atribuição
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
