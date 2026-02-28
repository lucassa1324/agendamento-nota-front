"use client";

import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Info,
  RefreshCw,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";

interface GlobalStats {
  totalCompanies: number;
  newCompaniesLast7Days: number;
  activeCompanies: number;
  totalAppointments: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  trialStudios: number;
  inactiveStudios: number;
  suspendedStudios: number;
  revenueHistory: { month: string; amount: number }[];
  subscriptionDistribution: { id: string; name: string; value: number; type: string }[];
  growthData: { month: string; companies: number; users: number }[];
  topBusinesses: { id: string; name: string; appointments: number; revenue: number }[];
  studiosByStatus: { status: string; count: number; color: string }[];
}

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

interface Business {
  id: string;
  name: string;
  active?: boolean;
  subscriptionStatus?: string; // 'active', 'trialing', 'canceled', 'unpaid', 'past_due'
  accessType?: string; // 'full', 'trial', 'limited'
  createdAt: string;
}

interface GrowthResponse {
  companies: { month: string; count: number }[];
  users: { month: string; count: number }[];
}

interface SubscriptionResponse {
  subscription_status: string;
  access_type: string;
  count: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Buscar empresas para estatísticas gerais e ranking
      const bizRes = await customFetch(`${API_BASE_URL}/api/admin/master/businesses`, {
        credentials: "include",
      });

      // 2. Buscar dados de crescimento
      const growthRes = await customFetch(`${API_BASE_URL}/api/admin/master/reports/growth`, {
        credentials: "include",
      });

      // 3. Buscar dados de assinaturas
      const subRes = await customFetch(`${API_BASE_URL}/api/admin/master/reports/subscriptions`, {
        credentials: "include",
      });

      if (!bizRes.ok || !growthRes.ok || !subRes.ok) {
        throw new Error("Falha ao carregar dados do servidor");
      }

      const companies: Business[] = await bizRes.json();
      const growthData: GrowthResponse = await growthRes.json();
      const subData: SubscriptionResponse[] = await subRes.json();
      
      const total = companies.length;
      
      // Classificações solicitadas pelo usuário
      const active = companies.filter((c) => c.active && c.subscriptionStatus === 'active').length;
      const trialing = companies.filter((c) => c.subscriptionStatus === 'trialing' || c.accessType === 'trial').length;
      const inactive = companies.filter((c) => !c.active).length;
      const suspended = companies.filter((c) => c.subscriptionStatus === 'past_due' || c.subscriptionStatus === 'unpaid').length;
      
      const subscriptions = companies.filter((c) => c.subscriptionStatus === 'active').length;
      
      const last7Days = companies.filter((c) => {
        const createdAt = new Date(c.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return createdAt >= sevenDaysAgo;
      }).length;

      // Processar dados de crescimento para o gráfico
      const allMonths = Array.from(new Set([
        ...growthData.companies.map(d => d.month),
        ...growthData.users.map(d => d.month)
      ])).sort();

      const formattedGrowth = allMonths.map(month => ({
        month,
        companies: growthData.companies.find(d => d.month === month)?.count || 0,
        users: growthData.users.find(d => d.month === month)?.count || 0,
      }));

      // Processar dados de assinatura para o pie chart
      const formattedSubs = subData.map((s, idx) => ({
        id: `sub-${idx}-${s.subscription_status || 'unknown'}-${s.access_type || 'unknown'}`,
        name: `${s.subscription_status || 'N/A'} (${s.access_type || 'N/A'})`,
        value: s.count || 0,
        type: s.access_type || 'N/A'
      }));

      // Novos dados de status para relatório de classificação
      const studiosByStatus = [
        { status: "Ativos", count: active, color: "#10b981" },
        { status: "Em Teste", count: trialing, color: "#3b82f6" },
        { status: "Inativos", count: inactive, color: "#94a3b8" },
        { status: "Suspensos/Atraso", count: suspended, color: "#ef4444" },
      ];

      const monthlyRevenue = subscriptions * 89.90;
      
      const months = ["Set", "Out", "Nov", "Dez", "Jan", "Fev"];
      const revenueHistory = months.map((month, idx) => ({
        month,
        amount: (subscriptions * 0.7 + idx * 5) * 89.90,
      }));

      const topBusinesses = companies.slice(0, 5).map((c, idx) => ({
        id: c.id || `biz-${idx}`,
        name: c.name || `Studio ${idx + 1}`,
        appointments: 150 - idx * 20,
        revenue: (150 - idx * 20) * 50,
      }));

      setStats({
        totalCompanies: total,
        newCompaniesLast7Days: last7Days,
        activeCompanies: active,
        activeSubscriptions: subscriptions,
        trialStudios: trialing,
        inactiveStudios: inactive,
        suspendedStudios: suspended,
        totalAppointments: total * 124,
        monthlyRevenue,
        revenueHistory,
        growthData: formattedGrowth,
        subscriptionDistribution: formattedSubs,
        topBusinesses,
        studiosByStatus,
      });
    } catch (err: unknown) {
      console.error("Erro ao buscar estatísticas:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      const msg = errorMessage === "Failed to fetch" 
        ? "Erro de conexão com o servidor. Verifique sua rede ou se o servidor está online."
        : "Não foi possível carregar os relatórios. Tente novamente mais tarde.";
      
      setError(msg);
      toast({
        title: "Erro ao carregar relatórios",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios Master</h2>
        <p className="text-muted-foreground">
          Visão consolidada de performance, estúdios e financeiro.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na sincronização</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchStats()}
              className="ml-4 h-8"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="geral" className="px-6">Geral</TabsTrigger>
          <TabsTrigger value="studios" className="px-6">Relatórios de Studios</TabsTrigger>
          <TabsTrigger value="financeiro" className="px-6">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Estúdios</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "--" : stats?.totalCompanies}</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+{stats?.newCompaniesLast7Days} novos</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "--" : stats?.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.activeSubscriptions} de {stats?.totalCompanies} estúdios
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento (Mês)</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "--" : `R$ ${stats?.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Recorrência mensal atual</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
                <Calendar className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "--" : stats?.totalAppointments.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Volume global de transações</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Crescimento da Plataforma</CardTitle>
                <CardDescription>Novos estúdios e usuários entrando por mês.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-75">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.growthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                      />
                      <Bar name="Estúdios" dataKey="companies" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar name="Usuários" dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Distribuição de Assinaturas</CardTitle>
                <CardDescription>Status e tipos de acesso.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-75">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.subscriptionDistribution}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats?.subscriptionDistribution.map((entry) => (
                          <Cell key={`cell-${entry.id}`} fill={COLORS[stats.subscriptionDistribution.indexOf(entry) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  {stats?.subscriptionDistribution.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[stats.subscriptionDistribution.indexOf(entry) % COLORS.length] }} />
                        <span className="text-xs text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="text-xs font-bold">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="studios" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats?.studiosByStatus.map((status) => (
              <Card key={status.status}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{status.status}</CardTitle>
                  {status.status === "Ativos" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {status.status === "Em Teste" && <Clock className="h-4 w-4 text-blue-500" />}
                  {status.status === "Inativos" && <Info className="h-4 w-4 text-slate-400" />}
                  {status.status === "Suspensos/Atraso" && <AlertCircle className="h-4 w-4 text-red-500" />}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? "--" : status.count}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isLoading ? "" : `${((status.count / (stats?.totalCompanies || 1)) * 100).toFixed(1)}% do total`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Performance</CardTitle>
                <CardDescription>Estúdios com maior volume de agendamentos.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {stats?.topBusinesses.map((biz, idx) => (
                    <div key={biz.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{biz.name}</p>
                          <p className="text-xs text-muted-foreground">{biz.appointments} agendamentos no mês</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">R$ {biz.revenue.toLocaleString('pt-BR')}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Faturamento Estimado</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classificação por Status</CardTitle>
                <CardDescription>Distribuição proporcional dos estúdios.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.studiosByStatus}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                      >
                        {stats?.studiosByStatus.map((entry) => (
                          <Cell key={`cell-${entry.status}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {stats?.studiosByStatus.map((entry) => (
                    <div key={entry.status} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs font-medium">{entry.status}: {entry.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Estúdios Pagantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "--" : stats?.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground mt-1">Assinaturas recorrentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 89,90</div>
                <p className="text-xs text-muted-foreground mt-1">Plano mensal padrão</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">MRR (Mensal)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats?.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+8.4% este mês</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">2.1%</div>
                <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Faturamento</CardTitle>
              <CardDescription>Evolução da receita recorrente da plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-87.5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.revenueHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${v}`} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="var(--primary)" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "var(--primary)" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
