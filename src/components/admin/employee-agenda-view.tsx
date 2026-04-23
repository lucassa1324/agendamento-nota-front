"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Sparkles, UserCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import { type Appointment, appointmentService } from "@/lib/api-appointments";

type TabMode = "daily" | "pool";

export function EmployeeAgendaView() {
  const { studio } = useStudio();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabMode>("daily");
  const [daily, setDaily] = useState<Appointment[]>([]);
  const [opportunities, setOpportunities] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!studio?.id) return;

    setLoading(true);
    try {
      const [dailyRows, opportunitiesRows] = await Promise.all([
        appointmentService.listMyDaily(studio.id),
        appointmentService.listMyOpportunities(studio.id),
      ]);
      setDaily(dailyRows);
      setOpportunities(opportunitiesRows);
    } catch (error) {
      console.error("Erro ao carregar agenda do funcionário:", error);
      toast({
        title: "Erro ao carregar agenda",
        description: "Não foi possível atualizar sua visão de execução.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [studio?.id, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 7000);
    return () => clearInterval(interval);
  }, [loadData]);

  const nextClient = useMemo(() => {
    const now = Date.now();
    return [...daily]
      .filter((item) => new Date(item.scheduledAt).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )[0];
  }, [daily]);

  const handleClaim = async (appointment: Appointment) => {
    if (!studio?.id) return;
    setClaimingId(appointment.id);
    try {
      await appointmentService.claimOpportunity(
        appointment.id,
        studio.id,
        appointment.version ?? 1,
      );
      toast({
        title: "Serviço assumido",
        description: "O agendamento foi atribuído à sua agenda com sucesso.",
      });
      await loadData();
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
    } finally {
      setClaimingId(null);
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
          variant={tab === "daily" ? "default" : "outline"}
          onClick={() => setTab("daily")}
        >
          Agenda diária
        </Button>
        <Button
          variant={tab === "pool" ? "default" : "outline"}
          onClick={() => setTab("pool")}
        >
          Oportunidades
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card p-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : tab === "daily" ? (
        <div className="space-y-3">
          {daily.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Nenhum agendamento atribuído para hoje.
              </CardContent>
            </Card>
          )}
          {daily
            .slice()
            .sort(
              (a, b) =>
                new Date(a.scheduledAt).getTime() -
                new Date(b.scheduledAt).getTime(),
            )
            .map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="flex items-center justify-between pt-6">
                  <div>
                    <p className="font-medium">{appointment.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.serviceNameSnapshot} •{" "}
                      {format(parseISO(appointment.scheduledAt), "dd/MM HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <span className="text-xs uppercase text-muted-foreground">
                    {appointment.status}
                  </span>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Sem oportunidades disponíveis para suas skills.
              </CardContent>
            </Card>
          )}
          {opportunities.map((appointment) => (
            <Card key={appointment.id}>
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
                  disabled={claimingId === appointment.id}
                  className="gap-2"
                >
                  {claimingId === appointment.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Assumindo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Assumir serviço
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
