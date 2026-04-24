"use client";

import { addDays, differenceInDays, endOfDay, startOfDay } from "date-fns";
import {
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import { appointmentService, type Appointment } from "@/lib/api-appointments";
import { authClient, useSession } from "@/lib/auth-client";
import { customFetch } from "@/lib/api-client";
import {
  getBookingsFromStorage,
  getSettingsFromStorage,
} from "@/lib/booking-data";
import { businessService } from "@/lib/business-service";

export function DashboardStats() {
  const pathname = usePathname();
  const { studio } = useStudio();
  const { data: session } = useSession();
  const isStaffUser = ((session?.user as { role?: string } | undefined)?.role || "")
    .toLowerCase() === "user";
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [sessionData, setSessionData] = useState<
    typeof authClient.$Infer.Session | null
  >(null);
  const [billingError, setBillingError] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    weekBookings: 0,
    monthRevenue: 0,
    commissionAccrued: 0,
    avgDurationMinutes: 0,
    agendaStatus: true,
  });

  const describeError = (reason: unknown) => {
    if (reason instanceof Error) {
      return reason.message || reason.toString();
    }
    if (typeof reason === "string") {
      return reason;
    }
    if (typeof reason === "object" && reason !== null) {
      const candidate = reason as {
        message?: unknown;
        error?: unknown;
        status?: unknown;
        code?: unknown;
      };
      if (typeof candidate.message === "string" && candidate.message.trim()) {
        return candidate.message;
      }
      if (typeof candidate.error === "string" && candidate.error.trim()) {
        return candidate.error;
      }
      try {
        return JSON.stringify({
          status: candidate.status,
          code: candidate.code,
          message: candidate.message,
          error: candidate.error,
        });
      } catch {
        return "Erro não serializável";
      }
    }
    return "Erro desconhecido";
  };

  const loadStats = useCallback(async () => {
    if (!studio?.id) return;
    setIsLoadingStats(true);
    try {
      setBillingError(false);
      const now = new Date();
      const dayStart = startOfDay(now);
      const dayEnd = endOfDay(now);

      if (isStaffUser) {
        const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        const monthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

        const monthDays =
          Math.floor((monthEnd.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;

        const monthBatch = await Promise.all(
          Array.from({ length: monthDays }, (_, index) =>
            appointmentService.listMyDaily(studio.id, addDays(monthStart, index).toISOString()),
          ),
        );

        const weekBatch = await Promise.all(
          Array.from({ length: 7 }, (_, index) =>
            appointmentService.listMyDaily(studio.id, addDays(dayStart, index).toISOString()),
          ),
        );

        const monthAppointments = monthBatch.flat();
        const weekAppointments = weekBatch.flat();
        const todayAppointments = monthAppointments.filter((item) => {
          const at = new Date(item.scheduledAt).getTime();
          return at >= dayStart.getTime() && at <= dayEnd.getTime();
        });

        let commissionRate = 0;
        try {
          const staffResponse = await customFetch(`/api/staff/company/${studio.id}`, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });
          if (staffResponse.ok) {
            const payload = await staffResponse.json();
            const rows = Array.isArray(payload)
              ? payload
              : Array.isArray(payload?.data)
                ? payload.data
                : [];
            const userId = (session?.user as { id?: string } | undefined)?.id;
            const userEmail = (session?.user as { email?: string } | undefined)?.email;
            const staffRow = rows.find(
              (member: { userId?: string; email?: string; isActive?: boolean }) =>
                member.isActive &&
                ((userId && member.userId === userId) ||
                  (userEmail && member.email?.toLowerCase() === userEmail.toLowerCase())),
            );
            commissionRate = Number(staffRow?.commissionRate ?? 0);
          }
        } catch (error) {
          console.warn("Dashboard staff: não foi possível resolver comissão.", error);
        }

        const completedMonth = monthAppointments.filter(
          (item) => item.status?.toUpperCase() === "COMPLETED",
        );

        const productionValue = completedMonth.reduce((sum, item) => {
          const price = Number(item.servicePriceSnapshot ?? 0);
          return sum + (Number.isFinite(price) ? price : 0);
        }, 0);

        const commissionAccrued = productionValue * (commissionRate / 100);

        const durationSamples = completedMonth
          .map((item) => {
            const start = new Date(item.scheduledAt).getTime();
            const end = new Date(item.updatedAt).getTime();
            if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
            return Math.round((end - start) / (1000 * 60));
          })
          .filter((value): value is number => typeof value === "number");

        const avgDurationMinutes = durationSamples.length
          ? Math.round(durationSamples.reduce((a, b) => a + b, 0) / durationSamples.length)
          : 0;

        setStats({
          totalBookings: monthAppointments.length,
          todayBookings: todayAppointments.length,
          weekBookings: weekAppointments.length,
          monthRevenue: productionValue,
          commissionAccrued,
          avgDurationMinutes,
          agendaStatus: true,
        });
        return;
      }

      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const [appointmentsResult, settingsResult] = await Promise.allSettled([
        appointmentService.listByCompanyAdmin(studio.id, firstDay, lastDay),
        businessService.getSettings(studio.id),
      ]);
      const isBillingRequired = (reason: unknown) => {
        if (!reason) return false;
        if (typeof reason === "object" && reason !== null) {
          const status = (reason as { status?: number }).status;
          const code = (reason as { code?: string }).code;
          const message = (reason as { message?: string }).message;
          if (status === 402 || code === "BILLING_REQUIRED") return true;
          if (typeof message === "string" && message.includes("BILLING_REQUIRED")) return true;
        }
        return reason instanceof Error && reason.message.includes("BILLING_REQUIRED");
      };
      const hasBillingBlock =
        (appointmentsResult.status === "rejected" && isBillingRequired(appointmentsResult.reason)) ||
        (settingsResult.status === "rejected" && isBillingRequired(settingsResult.reason));
      if (hasBillingBlock) {
        setBillingError(true);
        return;
      }

      const appointments: Appointment[] =
        appointmentsResult.status === "fulfilled" ? appointmentsResult.value : [];
      const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
      const todayBookings = appointments.filter((app) => {
        const date = new Date(app.scheduledAt).getTime();
        return date >= dayStart.getTime() && date <= dayEnd.getTime();
      }).length;
      const weekEnd = endOfDay(addDays(dayStart, 6));
      const weekBookings = appointments.filter((app) => {
        const date = new Date(app.scheduledAt).getTime();
        return date >= dayStart.getTime() && date <= weekEnd.getTime();
      }).length;
      const monthRevenue = appointments
        .filter((app) => app.status.toUpperCase() === "COMPLETED")
        .reduce((sum, app) => sum + Number(app.servicePriceSnapshot || 0), 0);

      setStats({
        totalBookings: appointments.length,
        todayBookings,
        weekBookings,
        monthRevenue,
        commissionAccrued: 0,
        avgDurationMinutes: 0,
        agendaStatus: settings?.agendaAberta ?? true,
      });
    } catch (error: unknown) {
      console.error("Erro crítico (inesperado) ao carregar estatísticas:", error);
      const isBillingIssue =
        (typeof error === "object" &&
          error !== null &&
          "status" in error &&
          (error as { status: unknown }).status === 402) ||
        (error instanceof Error && error.message.includes("BILLING_REQUIRED"));
      if (isBillingIssue) {
        setBillingError(true);
        return;
      }
      const bookings = getBookingsFromStorage();
      const settings = getSettingsFromStorage();
      setStats({
        totalBookings: bookings.length,
        todayBookings: bookings.filter(
          (b: { date: string }) => b.date === new Date().toISOString().split("T")[0],
        ).length,
        weekBookings: 0,
        monthRevenue: 0,
        commissionAccrued: 0,
        avgDurationMinutes: 0,
        agendaStatus: settings.agendaAberta,
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [isStaffUser, session?.user, studio?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (isStaffUser) return;
    if (!pathname?.includes("/dashboard/overview")) return;
    const hasSeenOverviewTour = localStorage.getItem("tour_overview_v1");
    if (hasSeenOverviewTour === "true") return;
    const timer = window.setTimeout(() => {
      setIsTourRunning(true);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [pathname, isStaffUser]);

  const handleTourCallback = (data: CallBackProps) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      localStorage.setItem("tour_overview_v1", "true");
      setIsTourRunning(false);
    }
  };

  // Busca dados atualizados da sessão para garantir que temos o status mais recente (Igual ao TrialBanner)
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const result = await authClient.getSession();
        if (result.data) {
          setSessionData(result.data);
        }
      } catch (error) {
        console.error("Erro ao buscar sessão no Dashboard:", error);
      }
    };
    fetchSession();
  }, []);

  const statCards = isStaffUser
    ? [
        {
          title: "Atendimentos Hoje",
          value: stats.todayBookings,
          icon: Calendar,
          color: "text-blue-500",
          tourTarget: "overview-card-today",
        },
        {
          title: "Atendimentos na Semana",
          value: stats.weekBookings,
          icon: Users,
          color: "text-green-500",
          tourTarget: "overview-card-total",
        },
        {
          title: "Comissão Acumulada",
          value: `R$ ${stats.commissionAccrued.toFixed(2)}`,
          icon: DollarSign,
          color: "text-accent",
          tourTarget: "overview-card-revenue",
        },
        {
          title: "Tempo Médio (estimado)",
          value: `${stats.avgDurationMinutes} min`,
          icon: Clock,
          color: "text-primary",
          tourTarget: "overview-card-status",
        },
      ]
    : [
        {
          title: "Agendamentos Hoje",
          value: billingError ? "---" : stats.todayBookings,
          icon: Calendar,
          color: billingError ? "text-muted-foreground" : "text-blue-500",
          tourTarget: "overview-card-today",
        },
        {
          title: "Total de Agendamentos",
          value: billingError ? "---" : stats.totalBookings,
          icon: Users,
          color: billingError ? "text-muted-foreground" : "text-green-500",
          tourTarget: "overview-card-total",
        },
        {
          title: "Faturamento do Mês",
          value: billingError ? "---" : `R$ ${stats.monthRevenue.toFixed(2)}`,
          icon: DollarSign,
          color: billingError ? "text-muted-foreground" : "text-accent",
          tourTarget: "overview-card-revenue",
        },
        {
          title: "Status da Agenda",
          value: billingError ? "---" : stats.agendaStatus ? "Aberta" : "Fechada",
          icon: TrendingUp,
          color: billingError
            ? "text-muted-foreground"
            : stats.agendaStatus
              ? "text-green-500"
              : "text-red-500",
          tourTarget: "overview-card-status",
        },
      ];

  // Adiciona card de dias restantes se estiver em trial
  if (
    !isStaffUser &&
    (studio?.subscriptionStatus === "trialing" ||
      studio?.subscriptionStatus === "trial")
  ) {
    let daysLeft = 0;

    // Lógica unificada com o Banner: Prioriza daysLeft da SESSÃO (mais atual), senão do studio, senão calcula via trialEndsAt
    // NUNCA usar createdAt + 14

    // Tenta pegar da sessão atualizada (fetch) ou do hook (cache), igual ao TrialBanner
    const currentSession = sessionData || session;
    const userWithBusiness = currentSession?.user as
      | {
          business?: { daysLeft?: number; slug?: string; trialEndsAt?: string };
        }
      | undefined;
    const userBusiness = userWithBusiness?.business;
    const isOwner = userBusiness?.slug === studio.slug;

    if (isOwner && typeof userBusiness?.daysLeft === "number") {
      daysLeft = userBusiness.daysLeft;
    } else if (typeof studio.daysLeft === "number") {
      daysLeft = studio.daysLeft;
    } else {
      // Fallback para trialEndsAt (Sessão ou Studio)
      const trialEndsAt =
        isOwner && userBusiness?.trialEndsAt
          ? userBusiness.trialEndsAt
          : studio.trialEndsAt;

      if (trialEndsAt) {
        const endDate = new Date(trialEndsAt);
        const today = new Date();
        const diff = differenceInDays(endDate, today);
        daysLeft = diff < 0 ? 0 : diff;
      }
    }

    statCards.push({
      title: "Tempo Restante",
      value: `${daysLeft} dias`,
      icon: Clock,
      color: daysLeft <= 3 ? "text-red-500" : "text-blue-500",
      tourTarget: "overview-card-trial",
    });
  }

  if (isLoadingStats) {
    return (
      <div className="rounded-lg border bg-card p-8 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando indicadores...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isStaffUser && (
        <Joyride
          run={isTourRunning}
          continuous
          showProgress
          showSkipButton
          disableOverlayClose
          callback={handleTourCallback}
          locale={{
            back: "Voltar",
            close: "Fechar",
            last: "Concluir",
            next: "Próximo",
            skip: "Pular",
          }}
          steps={
            [
              {
                target: '[data-tour="overview-title"]',
                content:
                  "Aqui você acompanha o resumo geral do seu negócio em tempo real.",
                placement: "bottom",
              },
              {
                target: '[data-tour="overview-card-today"]',
                content:
                  "Este card mostra quantos agendamentos você tem hoje para organizar sua operação.",
              },
              {
                target: '[data-tour="overview-card-revenue"]',
                content:
                  "Aqui você vê o faturamento do mês com base nos atendimentos concluídos.",
              },
              {
                target: '[data-tour="overview-card-status"]',
                content:
                  "Use este indicador para conferir se a agenda está aberta ou fechada.",
              },
            ] satisfies Step[]
          }
          styles={{
            options: {
              zIndex: 10000,
            },
          }}
        />
      )}
      {stats.totalBookings === 0 && !billingError && (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Você ainda não tem agendamentos neste período.
        </div>
      )}
      <div
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        data-tour="overview-grid"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} data-tour={stat.tourTarget}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
