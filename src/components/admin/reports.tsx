"use client";

import { Calendar, DollarSign, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getBookingsFromStorage,
  getSettingsFromStorage,
  type Service,
} from "@/lib/booking-data";

export function Reports() {
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    monthlyRevenue: [] as { month: string; revenue: number }[],
    serviceDistribution: [] as { name: string; value: number }[],
    totalBookings: 0,
  });

  const generateReports = useCallback(() => {
    const bookings = getBookingsFromStorage();
    const settings = getSettingsFromStorage();

    // Total de faturamento
    const totalRevenue = bookings.reduce((sum, booking) => {
      const service = settings.services.find(
        (s: Service) => s.id === booking.serviceId,
      );
      return sum + (service?.price || 0);
    }, 0);

    // Faturamento mensal (últimos 6 meses)
    const monthlyData: { [key: string]: number } = {};
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    bookings.forEach((booking) => {
      const date = new Date(booking.date);
      const monthKey = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`;
      const service = settings.services.find(
        (s: Service) => s.id === booking.serviceId,
      );
      monthlyData[monthKey] =
        (monthlyData[monthKey] || 0) + (service?.price || 0);
    });

    const monthlyRevenue = Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-6);

    // Distribuição por serviço
    const serviceCount: { [key: string]: number } = {};
    bookings.forEach((booking) => {
      const service = settings.services.find(
        (s: Service) => s.id === booking.serviceId,
      );
      if (service) {
        serviceCount[service.name] = (serviceCount[service.name] || 0) + 1;
      }
    });

    const serviceDistribution = Object.entries(serviceCount).map(
      ([name, value]) => ({ name, value }),
    );

    setReportData({
      totalRevenue,
      monthlyRevenue,
      serviceDistribution,
      totalBookings: bookings.length,
    });
  }, []);

  useEffect(() => {
    generateReports();
  }, [generateReports]);

  const COLORS = ["#d4a574", "#8b6f47", "#c9956e", "#a67c52", "#b8936a"];

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold mb-6">
        Relatórios e Estatísticas
      </h2>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento Total
            </CardTitle>
            <DollarSign className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {reportData.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Atendimentos
            </CardTitle>
            <Calendar className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {reportData.totalBookings > 0
                ? (reportData.totalRevenue / reportData.totalBookings).toFixed(
                    2,
                  )
                : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#d4a574" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-75 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.serviceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.serviceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportData.serviceDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-75 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
