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
  name: string;
  isProfessional: boolean;
  isActive: boolean;
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

const isSystemSuggested = (appointment: Appointment) =>
  appointment.assignedBy === "system" &&
  appointment.validationStatus === "suggested";

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
  const [professionals, setProfessionals] = useState<StaffMember[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [assignByAppointment, setAssignByAppointment] = useState<AssignState>({});
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(`${selectedDate}T12:00:00`),
  );
  const [selectedCalendarAppointment, setSelectedCalendarAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    const nextMonth = new Date(`${selectedDate}T12:00:00`);
    if (
      nextMonth.getMonth() !== calendarMonth.getMonth() ||
      nextMonth.getFullYear() !== calendarMonth.getFullYear()
    ) {
      setCalendarMonth(nextMonth);
    }
  }, [calendarMonth, selectedDate]);

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

      const [allAppointments, unassignedRows, monthRows, staffResponse] =
        await Promise.all([
          appointmentService.listByCompanyAdmin(studio.id, start, end),
          appointmentService.listUnassigned(studio.id),
          appointmentService.listByCompanyAdmin(studio.id, monthStart, monthEnd),
          customFetch(`/api/staff/company/${studio.id}`, { method: "GET" }),
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

      const professionalRows = staffPayload.filter(
        (member) => member.isActive && member.isProfessional,
      );

      setAppointments(allAppointments);
      setMonthAppointments(monthRows);
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
    professionals.forEach((professional, index) => {
      map.set(
        professional.id,
        STAFF_COLOR_PALETTE[index % STAFF_COLOR_PALETTE.length],
      );
    });
    return map;
  }, [professionals]);

  const calendarLegend = useMemo(
    () => [
      { id: "pending", label: "Pendente", color: PENDING_COLOR },
      ...professionals.map((professional) => ({
        id: professional.id,
        label: professional.name,
        color: staffColorMap.get(professional.id) || PENDING_COLOR,
      })),
    ],
    [professionals, staffColorMap],
  );

  const staffNameMap = useMemo(() => {
    const map = new Map<string, string>();
    professionals.forEach((professional) => {
      map.set(professional.id, professional.name);
    });
    return map;
  }, [professionals]);

  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const calendarDaysInMonth = getDaysInMonth(calendarMonth);
  const calendarStartDayOfWeek = getDay(startOfMonth(calendarMonth));
  const calendarDayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

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
        );
    },
    [calendarMonthIndex, calendarYear, monthAppointments],
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
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Visão mensal de todos os agendamentos
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCalendarMonth((prev) => subMonths(prev, 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-42.5 text-center text-sm font-medium capitalize">
                  {monthLabel}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCalendarMonth((prev) => addMonths(prev, 1))}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 border-b border-r">
              {calendarDayNames.map((dayName) => (
                <div
                  key={dayName}
                  className="border-l border-t bg-muted/30 py-2 text-center text-xs font-semibold uppercase text-muted-foreground"
                >
                  {dayName}
                </div>
              ))}

              {Array.from({ length: calendarStartDayOfWeek }).map((_, idx) => (
                <div
                  key={`start-empty-${idx}`}
                  className="h-32 border-l border-t bg-muted/10"
                />
              ))}

              {Array.from({ length: calendarDaysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const rows = getAppointmentsForCalendarDay(day);
                const isToday = isSameDay(
                  new Date(calendarYear, calendarMonthIndex, day),
                  new Date(),
                );
                return (
                  <div
                    key={day}
                    className={`h-32 overflow-y-auto border-l border-t p-1.5 ${isToday ? "bg-primary/5" : ""}`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold">{day}</span>
                      {rows.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {rows.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {rows.slice(0, 4).map((appointment) => {
                        const color = appointment.staffId
                          ? staffColorMap.get(appointment.staffId) || PENDING_COLOR
                          : PENDING_COLOR;
                        const assignedLabel = appointment.staffId
                          ? staffNameMap.get(appointment.staffId) || "Profissional"
                          : "Pendente";
                        return (
                          <button
                            key={appointment.id}
                            type="button"
                            title={assignedLabel}
                            className="w-full rounded border px-1.5 py-1 text-left text-[10px] transition hover:brightness-95"
                            style={getCardStyle(color, isSystemSuggested(appointment))}
                            onClick={() => setSelectedCalendarAppointment(appointment)}
                          >
                            <p className="font-semibold">
                              {format(parseISO(appointment.scheduledAt), "HH:mm")} •{" "}
                              {appointment.customerName}
                            </p>
                          </button>
                        );
                      })}
                      {rows.length > 4 && (
                        <p className="text-[10px] text-muted-foreground">
                          + {rows.length - 4} agendamentos
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {Array.from({
                length:
                  (7 - ((calendarStartDayOfWeek + calendarDaysInMonth) % 7)) % 7,
              }).map((_, idx) => (
                <div
                  key={`end-empty-${idx}`}
                  className="h-32 border-l border-t bg-muted/10"
                />
              ))}
            </div>
          </CardContent>
        </Card>
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
                    {selectedCalendarAppointment.staffId
                      ? staffNameMap.get(selectedCalendarAppointment.staffId) ||
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
                      assignByAppointment[selectedCalendarAppointment.id] ||
                      selectedCalendarAppointment.staffId ||
                      ""
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
                        assignByAppointment[selectedCalendarAppointment.id] ||
                          selectedCalendarAppointment.staffId ||
                          "",
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
