"use client";

import { addDays, format, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BadgeStatus } from "@/components/admin/badge-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/use-appointments";
import type { Appointment } from "@/lib/api-appointments";

type ViewMode = "day" | "week";

const statusLabel = (appointment: Appointment) => {
  if (appointment.status === "ONGOING") return "In Progress";
  if (appointment.status === "COMPLETED") return "Done";
  return "Waiting";
};

const statusClassName = (appointment: Appointment) => {
  if (appointment.status === "ONGOING") return "bg-amber-100 text-amber-700";
  if (appointment.status === "COMPLETED") return "bg-emerald-100 text-emerald-700";
  if (appointment.validationStatus === "suggested") return "bg-blue-100 text-blue-700";
  return "bg-zinc-100 text-zinc-700";
};

export function EmployeeAgendaView() {
  const { studio } = useStudio();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [baseDate, setBaseDate] = useState(() => startOfDay(new Date()));
  const {
    appointments,
    opportunities,
    isLoading,
    prefetchNextDays,
    claimOpportunity,
    claimInFlightId,
  } = useAppointments({
    companyId: studio?.id,
    viewMode,
    date: baseDate,
    includeOpportunities: viewMode === "day",
    audience: "employee",
  });

  useEffect(() => {
    prefetchNextDays(2);
  }, [prefetchNextDays]);

  const nextClient = useMemo(() => {
    const now = Date.now();
    return [...appointments]
      .filter((item) => new Date(item.scheduledAt).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )[0];
  }, [appointments]);

  const groupedByDay = useMemo(
    () =>
      appointments.reduce<Record<string, Appointment[]>>((acc, item) => {
        const key = format(parseISO(item.scheduledAt), "yyyy-MM-dd");
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {}),
    [appointments],
  );

  const handleClaim = async (appointment: Appointment) => {
    try {
      await claimOpportunity({
        id: appointment.id,
        expectedVersion: appointment.version ?? 1,
      });
      toast({
        title: "Serviço assumido",
        description: "O agendamento foi atribuído à sua agenda com sucesso.",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível assumir esse serviço.";
      toast({
        title: "Falha ao assumir",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Minha execução diária
          </CardTitle>
          {nextClient ? (
            <p className="text-sm text-muted-foreground">
              Próximo cliente: <strong>{nextClient.customerName}</strong> às{" "}
              {format(parseISO(nextClient.scheduledAt), "HH:mm")}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sem próximos clientes no momento.
            </p>
          )}
        </CardHeader>
      </Card>

      <div className="flex gap-2">
        <Button
          variant={viewMode === "day" ? "default" : "outline"}
          onClick={() => setViewMode("day")}
        >
          Hoje
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          onClick={() => setViewMode("week")}
        >
          Semana
        </Button>
        <Button variant="outline" onClick={() => setBaseDate(startOfDay(new Date()))}>
          Hoje (reset)
        </Button>
        <Button variant="outline" onClick={() => setBaseDate((current) => addDays(current, -1))}>
          -1 dia
        </Button>
        <Button variant="outline" onClick={() => setBaseDate((current) => addDays(current, 1))}>
          +1 dia
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card p-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === "day" ? (
            <motion.div
              key="day-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {appointments.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    Nenhum agendamento atribuído para hoje.
                  </CardContent>
                </Card>
              )}
              {appointments
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.scheduledAt).getTime() -
                    new Date(b.scheduledAt).getTime(),
                )
                .map((appointment) => (
                  <Card key={`${appointment.id}-${appointment.version ?? 1}`}>
                    <CardContent className="flex items-center justify-between gap-4 pt-6">
                      <div className="space-y-1">
                        <p className="font-medium">{appointment.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.serviceNameSnapshot} •{" "}
                          {format(parseISO(appointment.scheduledAt), "dd/MM HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                        <div className="flex items-center gap-2">
                          <BadgeStatus
                            assignedBy={appointment.assignedBy}
                            validationStatus={appointment.validationStatus}
                          />
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClassName(appointment)}`}
                          >
                            {statusLabel(appointment)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              <div className="space-y-3 rounded-xl border p-3">
                <h3 className="text-sm font-semibold">Mural de Oportunidades</h3>
                {opportunities.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Sem oportunidades disponíveis para suas skills.
                  </p>
                )}
                {opportunities.map((appointment) => (
                  <Card key={`${appointment.id}-${appointment.version ?? 1}`}>
                    <CardContent className="flex items-center justify-between gap-4 pt-6">
                      <div className="space-y-1">
                        <p className="font-medium">{appointment.serviceNameSnapshot}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.customerName} •{" "}
                          {format(parseISO(appointment.scheduledAt), "dd/MM HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleClaim(appointment)}
                        disabled={claimInFlightId === appointment.id}
                        className="gap-2"
                      >
                        {claimInFlightId === appointment.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Assumindo...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Assumir atendimento
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="week-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {Object.keys(groupedByDay).length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    Nenhum agendamento encontrado na semana selecionada.
                  </CardContent>
                </Card>
              )}
              {Object.entries(groupedByDay)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([day, rows]) => (
                  <Card key={day}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        {format(parseISO(`${day}T12:00:00`), "EEEE, dd/MM", { locale: ptBR })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      {rows.map((appointment) => (
                        <div
                          key={`${appointment.id}-${appointment.version ?? 1}`}
                          className="flex items-center justify-between rounded-lg border p-2"
                        >
                          <div>
                            <p className="text-sm font-medium">{appointment.customerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(appointment.scheduledAt), "HH:mm")} •{" "}
                              {appointment.serviceNameSnapshot}
                            </p>
                          </div>
                          <BadgeStatus
                            assignedBy={appointment.assignedBy}
                            validationStatus={appointment.validationStatus}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
