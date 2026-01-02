"use client";

import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  FileText,
  History,
  LayoutDashboard,
  Package,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBookingsFromStorage, getInventoryFromStorage, type InventoryLog } from "@/lib/booking-data";
import { cn } from "@/lib/utils";

type GlobalInventoryLog = InventoryLog & { productName: string; unit: string };

export function Reports() {
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    monthlyRevenue: [] as { month: string; revenue: number }[],
    serviceDistribution: [] as { name: string; value: number }[],
    totalBookings: 0,
    recentMovements: [] as GlobalInventoryLog[],
    totalInventoryValue: 0,
    lowStockCount: 0,
    topServices: [] as { name: string; count: number }[],
  });

  const generateReports = useCallback(() => {
    const bookings = getBookingsFromStorage();
    const inventory = getInventoryFromStorage();

    // Valor total do inventário e contagem de estoque baixo
    let lowStockCount = 0;
    const totalInventoryValue = inventory.reduce((sum, item) => {
      if (item.quantity <= item.minQuantity) lowStockCount++;
      return sum + (item.price * item.quantity);
    }, 0);

    // Coletar todos os logs de todos os produtos e ordenar por data
    const allLogs: GlobalInventoryLog[] = [];
    inventory.forEach(item => {
      if (item.logs) {
        item.logs.forEach(log => {
          allLogs.push({
            ...log,
            productName: item.name,
            unit: item.unit
          });
        });
      }
    });

    const recentMovements = allLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15); // Aumentado para 15

    // Total de faturamento
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + (booking.servicePrice || 0);
    }, 0);

    // Faturamento mensal (últimos 6 meses)
    const monthlyData: { [key: string]: number } = {};
    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    bookings.forEach((booking) => {
      const date = new Date(booking.date);
      const monthKey = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`;
      monthlyData[monthKey] =
        (monthlyData[monthKey] || 0) + (booking.servicePrice || 0);
    });

    const monthlyRevenue = Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-6);

    // Distribuição por serviço
    const serviceCount: { [key: string]: number } = {};
    bookings.forEach((booking) => {
      const serviceNames = booking.serviceName.split(" + ");
      serviceNames.forEach((name) => {
        serviceCount[name] = (serviceCount[name] || 0) + 1;
      });
    });

    const serviceDistribution = Object.entries(serviceCount).map(
      ([name, value]) => ({ name, value }),
    );

    const topServices = Object.entries(serviceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setReportData({
      totalRevenue,
      monthlyRevenue,
      serviceDistribution,
      totalBookings: bookings.length,
      recentMovements,
      totalInventoryValue,
      lowStockCount,
      topServices,
    });
  }, []);

  const handleExport = (type: "financeiro" | "agendamentos" | "estoque" | "geral") => {
    let csvContent = "";
    const fileName = `relatorio_${type}_${new Date().toISOString().split("T")[0]}.csv`;

    if (type === "financeiro") {
      csvContent = "Mes,Faturamento\n";
      reportData.monthlyRevenue.forEach((row) => {
        csvContent += `${row.month},${row.revenue}\n`;
      });
      csvContent += `\nTotal Faturamento,${reportData.totalRevenue}\n`;
      csvContent += `Ticket Medio,${reportData.totalBookings > 0 ? reportData.totalRevenue / reportData.totalBookings : 0}\n`;
    } else if (type === "agendamentos") {
      csvContent = "Servico,Quantidade\n";
      reportData.serviceDistribution.forEach((row) => {
        csvContent += `${row.name},${row.value}\n`;
      });
      csvContent += `\nTotal Agendamentos,${reportData.totalBookings}\n`;
    } else if (type === "estoque") {
      const inventory = getInventoryFromStorage();
      csvContent = "Produto,Quantidade,Unidade,Preco,Valor Total\n";
      inventory.forEach((item) => {
        csvContent += `${item.name},${item.quantity},${item.unit},${item.price},${item.quantity * item.price}\n`;
      });
      csvContent += `\nValor Total em Estoque,${reportData.totalInventoryValue}\n`;
    } else if (type === "geral") {
      csvContent = "Indicador,Valor\n";
      csvContent += `Faturamento Total,R$ ${reportData.totalRevenue}\n`;
      csvContent += `Total de Atendimentos,${reportData.totalBookings}\n`;
      csvContent += `Ticket Medio,R$ ${reportData.totalBookings > 0 ? reportData.totalRevenue / reportData.totalBookings : 0}\n`;
      csvContent += `Patrimonio em Estoque,R$ ${reportData.totalInventoryValue}\n`;
      csvContent += `Produtos com Baixo Estoque,${reportData.lowStockCount}\n`;
      csvContent += `Servico Principal,${reportData.topServices[0]?.name || "N/A"}\n`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    generateReports();
  }, [generateReports]);

  const COLORS = ["#d4a574", "#8b6f47", "#c9956e", "#a67c52", "#b8936a"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-3xl font-bold tracking-tight">
          Painel de Relatórios
        </h2>
        <p className="text-muted-foreground">
          Acompanhe o desempenho do seu estúdio em tempo real.
        </p>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-125">
          <TabsTrigger value="geral" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="agendamentos" className="gap-2">
            <Users className="w-4 h-4" />
            Trabalhos
          </TabsTrigger>
          <TabsTrigger value="estoque" className="gap-2">
            <Package className="w-4 h-4" />
            Estoque
          </TabsTrigger>
        </TabsList>

        {/* ABA GERAL */}
        <TabsContent value="geral" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-accent/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Faturamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  R$ {reportData.totalRevenue.toLocaleString("pt-BR")}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-green-600 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  Geral acumulado
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Atendimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalBookings}</div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                  <Users className="w-3 h-3" />
                  Total realizados
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {reportData.totalInventoryValue.toLocaleString("pt-BR")}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                  <Package className="w-3 h-3" />
                  Valor em produtos
                </div>
              </CardContent>
            </Card>

            <Card className={cn(reportData.lowStockCount > 0 ? "border-red-200 bg-red-50/50" : "")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", reportData.lowStockCount > 0 ? "text-red-600" : "")}>
                  {reportData.lowStockCount}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                  <History className="w-3 h-3" />
                  Reposição necessária
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Exportar Dados</CardTitle>
                  <CardDescription>Baixe as informações em formato de planilha (CSV)</CardDescription>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground/20" />
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start h-12 gap-3" 
                  onClick={() => handleExport("financeiro")}
                >
                  <div className="bg-green-100 p-1.5 rounded text-green-700">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Financeiro</div>
                    <div className="text-[10px] text-muted-foreground font-normal">Fluxo de caixa</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-12 gap-3"
                  onClick={() => handleExport("agendamentos")}
                >
                  <div className="bg-blue-100 p-1.5 rounded text-blue-700">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Trabalhos</div>
                    <div className="text-[10px] text-muted-foreground font-normal">Serviços e ranking</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-12 gap-3"
                  onClick={() => handleExport("estoque")}
                >
                  <div className="bg-orange-100 p-1.5 rounded text-orange-700">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Estoque</div>
                    <div className="text-[10px] text-muted-foreground font-normal">Produtos e logs</div>
                  </div>
                </Button>
                <Button 
                  className="justify-start h-12 gap-3 bg-accent hover:bg-accent/90"
                  onClick={() => handleExport("geral")}
                >
                  <div className="bg-white/20 p-1.5 rounded text-white">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Relatório Geral</div>
                    <div className="text-[10px] text-white/70 font-normal">Todas as métricas</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Destaques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-accent/10">
                    <BarChart3 className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase">Serviço + Vendido</div>
                    <div className="text-sm font-bold truncate max-w-37.5">
                      {reportData.topServices[0]?.name || "Carregando..."}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-accent/10">
                    <TrendingUp className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase">Ticket Médio</div>
                    <div className="text-sm font-bold">
                      R$ {reportData.totalBookings > 0 
                        ? (reportData.totalRevenue / reportData.totalBookings).toLocaleString("pt-BR") 
                        : "0,00"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA FINANCEIRA */}
        <TabsContent value="financeiro" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Desempenho Financeiro</h3>
            <Button variant="outline" size="sm" onClick={() => handleExport("financeiro")} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Faturamento Total
                </CardTitle>
                <DollarSign className="w-5 h-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {reportData.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Acumulado de todos os tempos
                </p>
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
                    ? (reportData.totalRevenue / reportData.totalBookings).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                    : "0,00"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Média por atendimento
                </p>
              </CardContent>
            </Card>

            <Card className="bg-accent/5 border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Projeção Mensal
                </CardTitle>
                <Calendar className="w-5 h-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  R$ {(reportData.totalRevenue / 12 || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Média mensal estimada
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evolução de Faturamento</CardTitle>
              <CardDescription>Visualização dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.monthlyRevenue.length > 0 ? (
                <div className="h-87.5 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#888', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#888', fontSize: 12 }}
                        tickFormatter={(value) => `R$ ${value}`}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8f8f8' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="#d4a574" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-75 flex items-center justify-center text-muted-foreground italic">
                  Nenhum dado financeiro disponível para o período.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA AGENDAMENTOS */}
        <TabsContent value="agendamentos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Análise de Trabalhos</h3>
            <Button variant="outline" size="sm" onClick={() => handleExport("agendamentos")} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Atendimentos
                </CardTitle>
                <Users className="w-5 h-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalBookings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Trabalhos realizados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Serviço Principal
                </CardTitle>
                <PieChartIcon className="w-5 h-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold truncate">
                  {reportData.topServices[0]?.name || "Nenhum"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Mais solicitado pelas clientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Diversidade de Serviços
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.serviceDistribution.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tipos de serviços oferecidos
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Serviço</CardTitle>
                <CardDescription>Frequência de cada procedimento</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.serviceDistribution.length > 0 ? (
                  <div className="h-75 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.serviceDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
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
                  </div>
                ) : (
                  <div className="h-75 flex items-center justify-center text-muted-foreground">
                    Sem dados de serviços.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ranking de Serviços</CardTitle>
                <CardDescription>Top 5 procedimentos mais realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.topServices.map((service, index) => (
                    <div key={service.name} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{service.name}</span>
                          <span className="text-sm text-muted-foreground">{service.count}x</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-accent h-1.5 rounded-full" 
                            style={{ width: `${(service.count / reportData.totalBookings) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {reportData.topServices.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground italic">
                      Nenhum agendamento registrado ainda.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA ESTOQUE */}
        <TabsContent value="estoque" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Gestão de Inventário</h3>
            <Button variant="outline" size="sm" onClick={() => handleExport("estoque")} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-accent text-accent-foreground">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Patrimônio em Produtos
                </CardTitle>
                <Package className="w-5 h-5 opacity-70" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  R$ {reportData.totalInventoryValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-sm opacity-80 mt-1">
                  Valor total investido em estoque atual
                </p>
              </CardContent>
            </Card>

            <Card className={cn(reportData.lowStockCount > 0 ? "border-red-200 bg-red-50" : "")}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Alertas de Reposição
                </CardTitle>
                <History className={cn("w-5 h-5", reportData.lowStockCount > 0 ? "text-red-500" : "text-accent")} />
              </CardHeader>
              <CardContent>
                <div className={cn("text-3xl font-bold", reportData.lowStockCount > 0 ? "text-red-600" : "")}>
                  {reportData.lowStockCount}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Produtos abaixo do nível mínimo
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico de Movimentações</CardTitle>
                <CardDescription>Últimas 15 entradas e saídas registradas</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {reportData.recentMovements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Alteração</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.recentMovements.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">
                          {new Date(log.timestamp).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="font-medium">{log.productName}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-2 py-0 h-5",
                              log.type === "entrada"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : log.type === "saida" ||
                                    log.type === "servico" ||
                                    log.type === "venda"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200",
                            )}
                          >
                            {log.type === "entrada" ? "Entrada" : 
                             log.type === "saida" ? "Saída" :
                             log.type === "servico" ? "Serviço" :
                             log.type === "venda" ? "Venda" : "Ajuste"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "font-bold text-xs",
                            log.quantityChange > 0 ? "text-green-600" : "text-red-600",
                          )}
                        >
                          {log.quantityChange > 0 ? "+" : ""}
                          {log.quantityChange.toLocaleString("pt-BR")} {log.unit}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {log.newQuantity.toLocaleString("pt-BR")} {log.unit}
                        </TableCell>
                        <TableCell className="text-[11px] text-muted-foreground italic max-w-50 truncate" title={log.notes}>
                          {log.notes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-muted-foreground italic">
                  Nenhuma movimentação de estoque para exibir.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
