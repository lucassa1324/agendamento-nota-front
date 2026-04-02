"use client";

import {
  AlertTriangle,
  Clock,
  History,
  Loader2,
  RefreshCw,
  Search,
  ShieldBan,
  Trash2,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";

interface CompanyMasterData {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  subscriptionStatus: string;
  accessType: string;
  ownerEmail: string;
}

interface SystemLog {
  id: string;
  userName: string | null;
  action: string;
  details: string | null;
  level: string;
  companyName: string | null;
  createdAt: string;
}

interface HealthCheckSetupResponse {
  companyId: string;
  serviceId: string;
  serviceName: string;
  servicePrice: string;
  serviceDuration: string;
  testCustomerName: string;
  testCustomerEmail: string;
  testCustomerPhone: string;
}

interface RouteDiagnostic {
  id: string;
  checkName: string;
  method: string;
  route: string;
  status: "OK" | "ERRO";
  httpStatus: number | null;
  durationMs: number;
  errorMessage: string | null;
  errorLocation: string;
  responsePreview: string | null;
}

const extractString = (value: unknown) =>
  typeof value === "string" ? value : null;

const isHealthCheckSetupResponse = (
  value: unknown,
): value is HealthCheckSetupResponse => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const parsed = value as Record<string, unknown>;
  return (
    typeof parsed.companyId === "string" &&
    typeof parsed.serviceId === "string" &&
    typeof parsed.serviceName === "string" &&
    typeof parsed.servicePrice === "string" &&
    typeof parsed.serviceDuration === "string" &&
    typeof parsed.testCustomerName === "string" &&
    typeof parsed.testCustomerEmail === "string" &&
    typeof parsed.testCustomerPhone === "string"
  );
};

export default function MasterDeveloperAreaPage() {
  const [companies, setCompanies] = useState<CompanyMasterData[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [diagnostics, setDiagnostics] = useState<RouteDiagnostic[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [autoDiagnostics, setAutoDiagnostics] = useState(false);
  const [lastDiagnosticsRunAt, setLastDiagnosticsRunAt] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [expiringId, setExpiringId] = useState<string | null>(null);

  // Estados para o diálogo de reset
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedCompanyForReset, setSelectedCompanyForReset] =
    useState<CompanyMasterData | null>(null);
  const [resetOptions, setResetOptions] = useState({
    appointments: true,
    services: false,
  });

  const { toast } = useToast();

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/businesses`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Falha ao carregar empresas");
      }

      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error(
        "Erro ao carregar empresas na área do desenvolvedor:",
        error,
      );
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas para testes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/logs`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Falha ao carregar logs");
      }

      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
    fetchLogs();
  }, [fetchCompanies, fetchLogs]);

  const handleSync = async (companyId: string) => {
    setSyncingId(companyId);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/companies/${companyId}/sync`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao sincronizar cobrança");
      }

      toast({
        title: "Sincronização concluída",
        description: data.message,
      });

      fetchCompanies();
      fetchLogs();
    } catch (error) {
      console.error("Erro ao sincronizar cobrança:", error);
      toast({
        title: "Erro",
        description: "Não foi possível sincronizar cobrança no Asaas.",
        variant: "destructive",
      });
    } finally {
      setSyncingId(null);
    }
  };

  const handleSimulateBlock = async (companyId: string) => {
    setSimulatingId(companyId);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/companies/${companyId}/simulate-block`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao simular bloqueio");
      }

      toast({
        title: "Bloqueio simulado",
        description: data.message,
      });

      fetchCompanies();
      fetchLogs();
    } catch (error) {
      console.error("Erro ao simular bloqueio:", error);
      toast({
        title: "Erro",
        description: "Não foi possível simular o bloqueio da empresa.",
        variant: "destructive",
      });
    } finally {
      setSimulatingId(null);
    }
  };

  const handleResetData = async () => {
    if (!selectedCompanyForReset) return;

    setResettingId(selectedCompanyForReset.id);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/companies/${selectedCompanyForReset.id}/reset-data`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            resetAppointments: resetOptions.appointments,
            resetServices: resetOptions.services,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao resetar dados");
      }

      toast({
        title: "Dados resetados",
        description: data.message,
      });

      setIsResetDialogOpen(false);
      fetchLogs();
    } catch (error) {
      console.error("Erro ao resetar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível resetar os dados da empresa.",
        variant: "destructive",
      });
    } finally {
      setResettingId(null);
    }
  };

  const handleTestExpiration = async (companyId: string) => {
    setExpiringId(companyId);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/companies/${companyId}/test-expiration`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao configurar expiração");
      }

      toast({
        title: "Expiração configurada",
        description: data.message,
      });

      fetchCompanies();
      fetchLogs();
    } catch (error) {
      console.error("Erro ao configurar expiração:", error);
      toast({
        title: "Erro",
        description: "Não foi possível configurar a expiração de teste.",
        variant: "destructive",
      });
    } finally {
      setExpiringId(null);
    }
  };

  const resolveErrorLocation = useCallback(
    (route: string, httpStatus: number | null, errorMessage: string) => {
      const routeLower = route.toLowerCase();
      const messageLower = errorMessage.toLowerCase();

      if (httpStatus === 401 || httpStatus === 403) {
        return "Autenticação / Permissão";
      }

      if (
        routeLower.includes("/api/appointments") ||
        messageLower.includes("appointment")
      ) {
        return "Módulo de Agendamentos";
      }

      if (routeLower.includes("/api/admin/master/prospects")) {
        return "Módulo Prospects (Master Admin)";
      }

      if (routeLower.includes("/api/admin/master")) {
        return "Módulo Master Admin";
      }

      if (
        messageLower.includes("fetch") ||
        messageLower.includes("network") ||
        messageLower.includes("failed to fetch")
      ) {
        return "Conexão Front-End -> Back-End";
      }

      if (httpStatus !== null && httpStatus >= 500) {
        return "Erro interno no Back-End";
      }

      return "Origem não mapeada";
    },
    [],
  );

  const buildNextBusinessDayAtTenBrt = useCallback(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}T10:00:00-03:00`;
  }, []);

  const runRouteDiagnostics = useCallback(async () => {
    setIsRunningDiagnostics(true);
    const collected: RouteDiagnostic[] = [];

    const appendDiagnostic = (item: RouteDiagnostic) => {
      collected.push(item);
      setDiagnostics([...collected]);
    };

    const runCheck = async ({
      id,
      checkName,
      method,
      route,
      body,
    }: {
      id: string;
      checkName: string;
      method: "GET" | "POST" | "PATCH" | "DELETE";
      route: string;
      body?: unknown;
    }) => {
      const startedAt = Date.now();

      try {
        const response = await customFetch(`${API_BASE_URL}${route}`, {
          method,
          credentials: "include",
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });

        const raw = await response.text();
        let parsed: Record<string, unknown> | null = null;
        try {
          parsed = raw ? JSON.parse(raw) : null;
        } catch {
          parsed = null;
        }

        const durationMs = Date.now() - startedAt;
        const apiError = extractString(parsed?.error);
        const apiMessage = extractString(parsed?.message);
        const message =
          apiError ||
          apiMessage ||
          (response.ok ? "" : raw || `HTTP ${response.status}`);
        const responsePreview =
          raw && raw.length > 180 ? `${raw.slice(0, 177)}...` : raw || null;

        appendDiagnostic({
          id,
          checkName,
          method,
          route,
          status: response.ok ? "OK" : "ERRO",
          httpStatus: response.status,
          durationMs,
          errorMessage: response.ok ? null : message,
          errorLocation: response.ok
            ? "-"
            : resolveErrorLocation(route, response.status, message || ""),
          responsePreview,
        });

        return {
          ok: response.ok,
          status: response.status,
          parsed,
          raw,
        };
      } catch (error: unknown) {
        const durationMs = Date.now() - startedAt;
        const message =
          error instanceof Error
            ? error.message
            : "Falha de rede ao chamar rota";

        appendDiagnostic({
          id,
          checkName,
          method,
          route,
          status: "ERRO",
          httpStatus: null,
          durationMs,
          errorMessage: message,
          errorLocation: resolveErrorLocation(route, null, message),
          responsePreview: null,
        });

        return {
          ok: false,
          status: null,
          parsed: null,
          raw: "",
        };
      }
    };

    try {
      const setupResult = await runCheck({
        id: "setup-health-company",
        checkName: "Preparar Empresa de Teste",
        method: "POST",
        route: "/api/admin/master/health/ensure-test-company",
      });

      await runCheck({
        id: "master-stats",
        checkName: "Ler Estatísticas Master",
        method: "GET",
        route: "/api/admin/master/stats",
      });

      await runCheck({
        id: "master-logs",
        checkName: "Ler Logs do Sistema",
        method: "GET",
        route: "/api/admin/master/logs",
      });

      let createdAppointmentId: string | null = null;
      let setupPayload: HealthCheckSetupResponse | null = null;

      if (setupResult.ok && isHealthCheckSetupResponse(setupResult.parsed)) {
        setupPayload = setupResult.parsed;
      }

      if (setupPayload?.companyId && setupPayload?.serviceId) {
        const appointmentPayload = {
          companyId: setupPayload.companyId,
          serviceId: setupPayload.serviceId,
          scheduledAt: buildNextBusinessDayAtTenBrt(),
          customerName: setupPayload.testCustomerName,
          customerEmail: setupPayload.testCustomerEmail,
          customerPhone: setupPayload.testCustomerPhone,
          serviceNameSnapshot: setupPayload.serviceName,
          servicePriceSnapshot: setupPayload.servicePrice,
          serviceDurationSnapshot: setupPayload.serviceDuration,
        };

        const createAppointment = await runCheck({
          id: "appointment-create",
          checkName: "Criar Agendamento de Diagnóstico",
          method: "POST",
          route: "/api/appointments",
          body: appointmentPayload,
        });

        if (createAppointment.ok && createAppointment.parsed?.id) {
          createdAppointmentId = String(createAppointment.parsed.id);
        }

        const dateRangeStart = new Date();
        dateRangeStart.setDate(dateRangeStart.getDate() - 1);
        const dateRangeEnd = new Date();
        dateRangeEnd.setDate(dateRangeEnd.getDate() + 7);

        await runCheck({
          id: "appointment-list-admin",
          checkName: "Listar Agendamentos (Admin)",
          method: "GET",
          route: `/api/appointments/admin/company/${setupPayload.companyId}?startDate=${dateRangeStart.toISOString()}&endDate=${dateRangeEnd.toISOString()}`,
        });

        if (createdAppointmentId) {
          await runCheck({
            id: "appointment-delete",
            checkName: "Remover Agendamento de Diagnóstico",
            method: "DELETE",
            route: `/api/appointments/${createdAppointmentId}`,
          });
        } else {
          appendDiagnostic({
            id: "appointment-delete",
            checkName: "Remover Agendamento de Diagnóstico",
            method: "DELETE",
            route: "/api/appointments/:id",
            status: "ERRO",
            httpStatus: null,
            durationMs: 0,
            errorMessage: "Agendamento não criado, limpeza não executada.",
            errorLocation: "Fluxo de Diagnóstico",
            responsePreview: null,
          });
        }
      } else {
        appendDiagnostic({
          id: "appointment-flow",
          checkName: "Fluxo de Agendamento",
          method: "POST",
          route: "/api/appointments",
          status: "ERRO",
          httpStatus: null,
          durationMs: 0,
          errorMessage:
            "Empresa de teste indisponível para validar agendamentos.",
          errorLocation: "Setup de Diagnóstico",
          responsePreview: null,
        });
      }

      const prospectPayload = {
        name: "Health Check Prospect",
        phone: "11999999999",
        establishmentName: "Teste Diagnóstico",
        category: "Diagnóstico",
        status: "Não Contatado",
      };

      const createProspect = await runCheck({
        id: "prospect-create",
        checkName: "Criar Prospect de Diagnóstico",
        method: "POST",
        route: "/api/admin/master/prospects",
        body: prospectPayload,
      });

      if (createProspect.ok && createProspect.parsed?.id) {
        await runCheck({
          id: "prospect-delete",
          checkName: "Remover Prospect de Diagnóstico",
          method: "DELETE",
          route: `/api/admin/master/prospects/${createProspect.parsed.id}`,
        });
      }

      setLastDiagnosticsRunAt(new Date().toISOString());

      const hasErrors = collected.some((item) => item.status === "ERRO");
      toast({
        title: hasErrors
          ? "Diagnóstico concluído com erros"
          : "Diagnóstico concluído com sucesso",
        description: hasErrors
          ? "Abra os detalhes para ver qual rota falhou e onde está o problema."
          : "Todas as rotas monitoradas responderam corretamente.",
        variant: hasErrors ? "destructive" : "default",
      });
    } finally {
      setIsRunningDiagnostics(false);
    }
  }, [buildNextBusinessDayAtTenBrt, resolveErrorLocation, toast]);

  useEffect(() => {
    if (!autoDiagnostics) {
      return;
    }

    const timer = setInterval(() => {
      if (!isRunningDiagnostics) {
        runRouteDiagnostics();
      }
    }, 300000);

    return () => clearInterval(timer);
  }, [autoDiagnostics, isRunningDiagnostics, runRouteDiagnostics]);

  const filteredCompanies = useMemo(
    () =>
      companies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (company.ownerEmail || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      ),
    [companies, searchTerm],
  );

  const statusMap: Record<string, string> = {
    active: "Ativo",
    trialing: "Trial",
    trial: "Trial",
    past_due: "Vencido",
    extended_trial: "Trial Estendido",
    unpaid: "Não Pago",
    canceled: "Cancelado",
  };

  const accessTypeMap: Record<string, string> = {
    automatic: "Automático",
    manual: "Manual",
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Área do Desenvolvedor
        </h1>
        <p className="text-muted-foreground">
          Ferramentas de teste rápido para validar bloqueios, sincronização e
          comportamento de cobrança.
        </p>
      </div>

      <Card className="border-orange-200 bg-orange-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-600" />
            Ambiente de Testes do Super Admin
          </CardTitle>
          <CardDescription>
            Esta área executa ações operacionais diretamente nas empresas. Use
            somente para testes e diagnóstico.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="diagnostics" className="space-y-4">
        <TabsList className="grid h-auto w-full max-w-md grid-cols-2 gap-1">
          <TabsTrigger value="diagnostics">Diagnóstico de Rotas</TabsTrigger>
          <TabsTrigger value="manual">Testes Manuais</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Ferramentas por Empresa</CardTitle>
              <CardDescription>
                Selecione a empresa desejada e execute as ações de validação.
              </CardDescription>
              <div className="flex flex-wrap gap-2 pt-4">
                <div className="relative flex-1 min-w-60">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, slug ou email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={fetchCompanies}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Atualizar Lista
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Acesso</TableHead>
                      <TableHead className="text-right">
                        Ações de Teste
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Carregando empresas...
                        </TableCell>
                      </TableRow>
                    ) : filteredCompanies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Nenhuma empresa encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCompanies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">
                            {company.name}
                            <span className="block text-xs text-muted-foreground">
                              {company.slug} • {company.ownerEmail}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                company.subscriptionStatus === "active"
                                  ? "default"
                                  : company.subscriptionStatus === "past_due"
                                    ? "destructive"
                                    : "outline"
                              }
                              className={
                                company.subscriptionStatus === "active"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : undefined
                              }
                            >
                              {statusMap[company.subscriptionStatus] ||
                                company.subscriptionStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {accessTypeMap[company.accessType] ||
                                "Automático"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                title="Sincronizar com Asaas"
                                onClick={() => handleSync(company.id)}
                                disabled={
                                  syncingId === company.id ||
                                  simulatingId === company.id ||
                                  expiringId === company.id
                                }
                              >
                                {syncingId === company.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                )}
                                Sync
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                title="Testar Expiração (Manual -> Automático)"
                                onClick={() => handleTestExpiration(company.id)}
                                disabled={
                                  expiringId === company.id ||
                                  syncingId === company.id ||
                                  simulatingId === company.id
                                }
                              >
                                {expiringId === company.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Clock className="w-4 h-4 mr-1" />
                                )}
                                Expirar
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                title="Resetar Dados Específicos"
                                onClick={() => {
                                  setSelectedCompanyForReset(company);
                                  setIsResetDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Reset
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                title="Simular Bloqueio Completo"
                                onClick={() => handleSimulateBlock(company.id)}
                                disabled={
                                  simulatingId === company.id ||
                                  syncingId === company.id ||
                                  expiringId === company.id
                                }
                              >
                                {simulatingId === company.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ShieldBan className="w-4 h-4 mr-1" />
                                )}
                                Bloquear
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Bloqueio Simulado:</strong> Desativa empresa/dono e
                    mata sessões.
                  </div>
                </div>
                <div className="p-3 rounded-md border border-blue-200 bg-blue-50 text-blue-900 text-sm flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Teste de Expiração:</strong> Define acesso manual
                    expirado. Valida se o sistema volta para automático ao
                    acessar.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Diagnóstico de Rotas</CardTitle>
                  <CardDescription>
                    Executa chamadas reais de leitura e escrita para validar se
                    as rotas principais estão funcionando.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAutoDiagnostics((prev) => !prev)}
                    disabled={isRunningDiagnostics}
                  >
                    {autoDiagnostics ? "Auto 5min: ON" : "Auto 5min: OFF"}
                  </Button>
                  <Button
                    onClick={runRouteDiagnostics}
                    disabled={isRunningDiagnostics}
                  >
                    {isRunningDiagnostics ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Executar Check-up
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {lastDiagnosticsRunAt
                  ? `Última execução: ${new Date(lastDiagnosticsRunAt).toLocaleString("pt-BR")}`
                  : "Nenhum check-up executado ainda."}
              </p>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Verificação</TableHead>
                      <TableHead>Rota</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>HTTP</TableHead>
                      <TableHead>Tempo</TableHead>
                      <TableHead>Erro</TableHead>
                      <TableHead>Onde está</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diagnostics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Execute o check-up para visualizar os resultados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      diagnostics.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.checkName}
                          </TableCell>
                          <TableCell className="text-xs">
                            {item.route}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.status === "OK" ? "default" : "destructive"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.httpStatus ?? "-"}</TableCell>
                          <TableCell>{item.durationMs} ms</TableCell>
                          <TableCell
                            className="max-w-sm truncate"
                            title={
                              item.responsePreview || item.errorMessage || ""
                            }
                          >
                            {item.errorMessage || "-"}
                          </TableCell>
                          <TableCell>{item.errorLocation}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Logs do Sistema
              </CardTitle>
              <CardDescription>
                Acompanhe as últimas ações realizadas pelos administradores.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchLogs}
              disabled={isLoadingLogs}
            >
              {isLoadingLogs ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Data/Hora</TableHead>
                  <TableHead className="w-[120px]">Ação</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="w-[120px]">Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLogs ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Carregando logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum log encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="text-sm">
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.level === "WARN"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : log.level === "ERROR"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-blue-200 bg-blue-50 text-blue-700"
                          }
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="max-w-md truncate"
                        title={log.details || ""}
                      >
                        {log.details}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.companyName || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.userName || "Sistema"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Reset de Dados */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resetar Dados de Teste</DialogTitle>
            <DialogDescription>
              Selecione quais dados da empresa{" "}
              <strong>{selectedCompanyForReset?.name}</strong> você deseja
              remover permanentemente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reset-appointments"
                checked={resetOptions.appointments}
                onCheckedChange={(checked) =>
                  setResetOptions((prev) => ({
                    ...prev,
                    appointments: !!checked,
                  }))
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="reset-appointments">Agendamentos</Label>
                <p className="text-xs text-muted-foreground">
                  Remove todos os agendamentos marcados.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="reset-services"
                checked={resetOptions.services}
                onCheckedChange={(checked) =>
                  setResetOptions((prev) => ({ ...prev, services: !!checked }))
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="reset-services">Serviços / Trabalhos</Label>
                <p className="text-xs text-muted-foreground">
                  Remove todos os serviços cadastrados. Atenção: Isso também
                  removerá os agendamentos vinculados.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => setIsResetDialogOpen(false)}
              disabled={!!resettingId}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetData}
              disabled={
                !!resettingId ||
                (!resetOptions.appointments && !resetOptions.services)
              }
            >
              {resettingId ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Confirmar Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
