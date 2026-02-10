"use client";

import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import { appointmentService } from "@/lib/api-appointments";
import {
  getBookingsFromStorage,
  getSettingsFromStorage,
} from "@/lib/booking-data";
import { businessService } from "@/lib/business-service";

export function DashboardStats() {
  const { studio } = useStudio();
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    monthRevenue: 0,
    agendaStatus: true,
  });

  const loadStats = useCallback(async () => {
    if (!studio?.id) return;

    try {
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
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      // Fallback para storage se falhar
      const bookings = getBookingsFromStorage();
      const settings = getSettingsFromStorage();
      setStats({
        totalBookings: bookings.length,
        todayBookings: bookings.filter(b => b.date === new Date().toISOString().split("T")[0]).length,
        monthRevenue: 0, // Simplificado no fallback
        agendaStatus: settings.agendaAberta,
      });
    }
  }, [studio?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = [
    {
      title: "Agendamentos Hoje",
      value: stats.todayBookings,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      title: "Total de Agendamentos",
      value: stats.totalBookings,
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Faturamento do Mês",
      value: `R$ ${stats.monthRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-accent",
    },
    {
      title: "Status da Agenda",
      value: stats.agendaStatus ? "Aberta" : "Fechada",
      icon: TrendingUp,
      color: stats.agendaStatus ? "text-green-500" : "text-red-500",
    },
  ];

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
