"use client";

import { differenceInDays } from "date-fns";
import { Calendar, Clock, DollarSign, TrendingUp, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import { appointmentService } from "@/lib/api-appointments";
import { authClient, useSession } from "@/lib/auth-client";
import {
  getBookingsFromStorage,
  getSettingsFromStorage,
} from "@/lib/booking-data";
import { businessService } from "@/lib/business-service";

export function DashboardStats() {
  const { studio } = useStudio();
  const { data: session } = useSession();
  const [sessionData, setSessionData] = useState<any | null>(null);
  const [billingError, setBillingError] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    monthRevenue: 0,
    agendaStatus: true,
  });

  const loadStats = useCallback(async () => {
    if (!studio?.id) return;

    try {
      setBillingError(false);
      // Para as estatísticas, podemos buscar todos os agendamentos ou um range largo
      // Por simplicidade e performance, vamos buscar o mês atual
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const [appointments, settings] = await Promise.all([
        appointmentService.listByCompanyAdmin(studio.id, firstDay, lastDay),
        businessService.getSettings(studio.id),
      ]);

      const todayStr = now.toISOString().split("T")[0];
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const todayBookings = appointments.filter((app) => {
        const date = new Date(app.scheduledAt).toISOString().split("T")[0];
        return date === todayStr;
      }).length;

      const monthRevenue = appointments
        .filter((app) => {
          const date = new Date(app.scheduledAt);
          return (
            app.status.toUpperCase() === "COMPLETED" &&
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          );
        })
        .reduce((sum, app) => {
          const price = app.servicePriceSnapshot ? parseFloat(app.servicePriceSnapshot) : 0;
          return sum + price;
        }, 0);

      setStats({
        totalBookings: appointments.length,
        todayBookings,
        monthRevenue,
        agendaStatus: settings?.agendaAberta ?? true,
      });
    } catch (error: unknown) {
      console.error("Erro ao carregar estatísticas:", error);
      
      const isBillingError = 
        (typeof error === "object" && error !== null && "status" in error && (error as { status: unknown }).status === 402) || 
        (error instanceof Error && error.message.includes("BILLING_REQUIRED"));

      if (isBillingError) {
        setBillingError(true);
        return;
      }

      // Fallback para storage se falhar
      const bookings = getBookingsFromStorage();
      const settings = getSettingsFromStorage();
      setStats({
        totalBookings: bookings.length,
        todayBookings: bookings.filter((b: { date: string }) => b.date === new Date().toISOString().split("T")[0]).length,
        monthRevenue: 0, // Simplificado no fallback
        agendaStatus: settings.agendaAberta,
      });
    }
  }, [studio?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

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

  const statCards = [
    {
      title: "Agendamentos Hoje",
      value: billingError ? "---" : stats.todayBookings,
      icon: Calendar,
      color: billingError ? "text-muted-foreground" : "text-blue-500",
    },
    {
      title: "Total de Agendamentos",
      value: billingError ? "---" : stats.totalBookings,
      icon: Users,
      color: billingError ? "text-muted-foreground" : "text-green-500",
    },
    {
      title: "Faturamento do Mês",
      value: billingError ? "---" : `R$ ${stats.monthRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: billingError ? "text-muted-foreground" : "text-accent",
    },
    {
      title: "Status da Agenda",
      value: billingError ? "---" : (stats.agendaStatus ? "Aberta" : "Fechada"),
      icon: TrendingUp,
      color: billingError ? "text-muted-foreground" : (stats.agendaStatus ? "text-green-500" : "text-red-500"),
    },
  ];

  // Adiciona card de dias restantes se estiver em trial
  if (studio?.subscriptionStatus === "trialing" || studio?.subscriptionStatus === "trial") {
    let daysLeft = 0;
    
    // Lógica unificada com o Banner: Prioriza daysLeft da SESSÃO (mais atual), senão do studio, senão calcula via trialEndsAt
    // NUNCA usar createdAt + 14
    
    // Tenta pegar da sessão atualizada (fetch) ou do hook (cache), igual ao TrialBanner
    const currentSession = sessionData || session;
    const userBusiness = currentSession?.user?.business as { daysLeft?: number; slug?: string; trialEndsAt?: string } | undefined;
    const isOwner = userBusiness?.slug === studio.slug;
    
    if (isOwner && typeof userBusiness?.daysLeft === 'number') {
      daysLeft = userBusiness.daysLeft;
    } else if (typeof studio.daysLeft === 'number') {
      daysLeft = studio.daysLeft;
    } else {
      // Fallback para trialEndsAt (Sessão ou Studio)
      const trialEndsAt = (isOwner && userBusiness?.trialEndsAt) ? userBusiness.trialEndsAt : studio.trialEndsAt;
      
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
    });
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
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
  );
}
