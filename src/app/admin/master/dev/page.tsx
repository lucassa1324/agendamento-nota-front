"use client";

import {
  AlertTriangle,
  Clock,
  CreditCard,
  History,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Settings,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { API_BASE_URL, useSession } from "@/lib/auth-client";

interface CompanyMasterData {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  subscriptionStatus: string;
  accessType: string;
  asaasSubscriptionId?: string | null;
  ownerId: string;
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
  companyName: string;
  companySlug: string;
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

interface BillingFlowDebugResponse {
  success: boolean;
  localBillingType?: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    ownerEmail: string;
    ownerActive: boolean;
    subscriptionStatus: string;
    accessType: string;
    trialEndsAt: string | null;
    billingGraceEndsAt: string | null;
    asaasSubscriptionId: string | null;
    lastRetentionDiscountAt: string | null;
  };
  asaas: {
    id: string | null;
    status: string | null;
    billingType: string | null;
    value: number | null;
    nextDueDate: string | null;
    cycle: string | null;
    discount: unknown;
    dateCreated: string | null;
  } | null;
  payments: {
    total: number;
    confirmedCount: number;
    pendingCount: number;
    latest: {
      id: string | null;
      status: string | null;
      dueDate: string | null;
      paymentDate: string | null;
      value: number | null;
    } | null;
  };
  diagnostic: {
    canAutoCharge: boolean;
    reasons: string[];
    recommendedNextStep: string;
  };
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
    typeof parsed.companyName === "string" &&
    typeof parsed.companySlug === "string" &&
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
  const { refetch } = useSession();
  const [companies, setCompanies] = useState<CompanyMasterData[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [diagnostics, setDiagnostics] = useState<RouteDiagnostic[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [autoDiagnostics, setAutoDiagnostics] = useState(false);
  const [autoDiagnosticsInterval, setAutoDiagnosticsInterval] = useState(5); // em minutos
  const [lastDiagnosticsRunAt, setLastDiagnosticsRunAt] = useState<
    string | null
  >(null);

  // Ações que ficam fora do menu "+"
  const [pinnedActions, setPinnedActions] = useState<string[]>([
    "sync",
    "vencer",
  ]);
  const [isActionsConfigOpen, setIsActionsConfigOpen] = useState(false);

  // Lista de todas as ações possíveis
  const ALL_ACTIONS = [
    {
      id: "sync",
      label: "Sync (Asaas)",
      icon: RefreshCw,
      color: "text-slate-600",
      help: "Sincroniza a empresa com o Asaas para atualizar status de pagamento e liberar/bloquear acesso conforme retorno real.",
    },
    {
      id: "vencer",
      label: "Vencer (Auto)",
      icon: AlertTriangle,
      color: "text-orange-600",
      help: "Simula empresa vencida no modo automático (`past_due`) para validar fluxo de bloqueio por inadimplência.",
    },
    {
      id: "carencia",
      label: "Carência (Auto)",
      icon: Clock,
      color: "text-emerald-600",
      help: "Coloca em carência (`grace_period`), mantendo acesso ativo por prazo curto mesmo sem pagamento.",
    },
    {
      id: "transicao",
      label: "Transição (Expira)",
      icon: Clock,
      color: "text-blue-600",
      help: "Força expiração de modo manual para testar transição e retorno ao modo automático no próximo acesso.",
    },
    {
      id: "email",
      label: "Reset E-mail",
      icon: Mail,
      color: "text-cyan-600",
      help: "Marca o e-mail do dono como não verificado para testar validação e onboarding.",
    },
    {
      id: "onboarding",
      label: "Reset 1º Acesso",
      icon: Wrench,
      color: "text-violet-600",
      help: "Reinicia o fluxo de primeiro acesso/onboarding da empresa.",
    },
    {
      id: "dados",
      label: "Reset Dados",
      icon: Trash2,
      color: "text-amber-600",
      help: "Apaga dados de teste da empresa (agendamentos e, opcionalmente, serviços).",
    },
    {
      id: "bloquear",
      label: "Bloquear",
      icon: ShieldBan,
      color: "text-red-600",
      help: "Executa bloqueio completo da empresa e do dono, incluindo invalidação de sessões.",
    },
    {
      id: "reset-billing-lock",
      label: "Reset Trava Cobrança",
      icon: RefreshCw,
      color: "text-purple-600",
      help: "Remove a trava de 3 meses para permitir alterar dia de cobrança imediatamente.",
    },
    {
      id: "fluxo-cobranca",
      label: "Fluxo Cobrança",
      icon: CreditCard,
      color: "text-indigo-600",
      help: "Abre diagnóstico guiado de cobrança, desconto e autocobrança com ações rápidas.",
    },
  ];

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedAuto = localStorage.getItem("master_auto_diag");
    const savedInterval = localStorage.getItem("master_auto_diag_interval");
    const savedPinned = localStorage.getItem("master_pinned_actions");

    if (savedAuto !== null) setAutoDiagnostics(savedAuto === "true");
    if (savedInterval !== null)
      setAutoDiagnosticsInterval(Number(savedInterval));
    if (savedPinned !== null) {
      try {
        setPinnedActions(JSON.parse(savedPinned));
      } catch (e) {
        console.error("Erro ao carregar pinned actions:", e);
      }
    }
  }, []);

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem("master_auto_diag", String(autoDiagnostics));
    localStorage.setItem(
      "master_auto_diag_interval",
      String(autoDiagnosticsInterval),
    );
    localStorage.setItem(
      "master_pinned_actions",
      JSON.stringify(pinnedActions),
    );
  }, [autoDiagnostics, autoDiagnosticsInterval, pinnedActions]);

  const [searchTerm, setSearchTerm] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resettingEmailId, setResettingEmailId] = useState<string | null>(null);
  const [resettingOnboardingId, setResettingOnboardingId] = useState<
    string | null
  >(null);
  const [expiringId, setExpiringId] = useState<string | null>(null);
  const [vencendoId, setVencendoId] = useState<string | null>(null);
  const [carenciaId, setCarenciaId] = useState<string | null>(null);
  const [resettingLockId, setResettingLockId] = useState<string | null>(null);
  const [isBillingFlowOpen, setIsBillingFlowOpen] = useState(false);
  const [selectedCompanyForBillingFlow, setSelectedCompanyForBillingFlow] =
    useState<CompanyMasterData | null>(null);
  const [billingFlowDebug, setBillingFlowDebug] =
    useState<BillingFlowDebugResponse | null>(null);
  const [isBillingFlowLoading, setIsBillingFlowLoading] = useState(false);
  const [billingFlowActionLoading, setBillingFlowActionLoading] = useState<
    | "offer"
    | "past-due"
    | "sync"
    | "auto-debit"
    | "create-subscription"
    | "create-subscription-card"
    | null
  >(null);

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

  const handleResetEmailVerification = async (
    userId: string,
    companyId: string,
  ) => {
    setResettingEmailId(companyId);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/users/${userId}/reset-email-verification`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao resetar verificação de e-mail");
      }

      toast({
        title: "Verificação resetada",
        description: data.message,
      });

      fetchLogs();
    } catch (error) {
      console.error("Erro ao resetar verificação de e-mail:", error);
      toast({
        title: "Erro",
        description: "Não foi possível resetar a verificação de e-mail.",
        variant: "destructive",
      });
    } finally {
      setResettingEmailId(null);
    }
  };

  const handleResetOnboarding = async (companyId: string) => {
    setResettingOnboardingId(companyId);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/companies/${companyId}/reset-onboarding`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao resetar primeiro acesso");
      }

      toast({
        title: "Primeiro acesso resetado",
        description: data.message,
      });

      // Atualiza a sessão local caso o admin esteja resetando sua própria conta de teste
      await refetch();

      // Limpa os flags de tour para permitir re-testar o tutorial interativo
      localStorage.removeItem("tour_overview_v1");
      localStorage.removeItem("tour_customizer_v1");

      fetchCompanies();
      fetchLogs();
    } catch (error) {
      console.error("Erro ao resetar primeiro acesso:", error);
      toast({
        title: "Erro",
        description: "Não foi possível resetar o primeiro acesso da empresa.",
        variant: "destructive",
      });
    } finally {
      setResettingOnboardingId(null);
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

  const handleSimulatePastDue = async (companyId: string) => {
    setVencendoId(companyId);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/companies/${companyId}/simulate-past-due`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao simular vencimento");
      }

      toast({
        title: "Vencimento simulado",
        description: data.message,
      });

      fetchCompanies();
      fetchLogs();
    } catch (error) {
      console.error("Erro ao simular vencimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível simular o vencimento da empresa.",
        variant: "destructive",
      });
    } finally {
      setVencendoId(null);
    }
  };

  const handleSimulateGracePeriod = async (companyId: string) => {
    setCarenciaId(companyId);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/companies/${companyId}/simulate-grace-period`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao simular carência");
      }

      toast({
        title: "Carência ativada",
        description: data.message,
      });

      fetchCompanies();
      fetchLogs();
    } catch (error) {
      console.error("Erro ao simular carência:", error);
      toast({
        title: "Erro",
        description: "Não foi possível colocar a empresa em carência.",
        variant: "destructive",
      });
    } finally {
      setCarenciaId(null);
    }
  };

  const handleResetBillingLock = async (companyId: string) => {
    setResettingLockId(companyId);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/companies/${companyId}/billing-day/reset-lock`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao resetar trava");
      }

      toast({
        title: "Trava resetada",
        description: data.message,
      });

      fetchCompanies();
      fetchLogs();
    } catch (error) {
      console.error("Erro ao resetar trava de cobrança:", error);
      toast({
        title: "Erro",
        description: "Não foi possível resetar a trava de cobrança.",
        variant: "destructive",
      });
    } finally {
      setResettingLockId(null);
    }
  };

  const fetchBillingFlowDebug = useCallback(
    async (companyId: string) => {
      setIsBillingFlowLoading(true);
      try {
        const response = await customFetch(
          `${API_BASE_URL}/api/admin/master/companies/${companyId}/billing-flow-debug`,
          {
            credentials: "include",
          },
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Falha ao carregar diagnóstico");
        }

        setBillingFlowDebug(data as BillingFlowDebugResponse);
      } catch (error) {
        console.error("Erro ao carregar diagnóstico de cobrança:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o diagnóstico de cobrança.",
          variant: "destructive",
        });
      } finally {
        setIsBillingFlowLoading(false);
      }
    },
    [toast],
  );

  const openBillingFlow = async (company: CompanyMasterData) => {
    setSelectedCompanyForBillingFlow(company);
    setIsBillingFlowOpen(true);
    setBillingFlowDebug(null);
    await fetchBillingFlowDebug(company.id);
  };

  const runBillingFlowAction = async (
    action:
      | "offer"
      | "past-due"
      | "sync"
      | "auto-debit"
      | "create-subscription"
      | "create-subscription-card",
  ) => {
    if (!selectedCompanyForBillingFlow) return;
    const companyId = selectedCompanyForBillingFlow.id;

    setBillingFlowActionLoading(action);
    try {
      let response: Response;
      if (action === "offer") {
        response = await customFetch(
          `${API_BASE_URL}/api/admin/master/companies/${companyId}/test-retention-offer`,
          {
            method: "POST",
            credentials: "include",
          },
        );
      } else if (action === "past-due") {
        response = await customFetch(
          `${API_BASE_URL}/api/admin/master/companies/${companyId}/simulate-past-due`,
          {
            method: "POST",
            credentials: "include",
          },
        );
      } else if (action === "auto-debit") {
        response = await customFetch(
          `${API_BASE_URL}/api/admin/master/companies/${companyId}/test-auto-debit`,
          {
            method: "POST",
            credentials: "include",
          },
        );
      } else if (action === "create-subscription") {
        response = await customFetch(
          `${API_BASE_URL}/api/admin/master/companies/${companyId}/create-test-subscription`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ billingType: "PIX" }),
          },
        );
      } else if (action === "create-subscription-card") {
        response = await customFetch(
          `${API_BASE_URL}/api/admin/master/companies/${companyId}/create-test-subscription`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              billingType: "CREDIT_CARD",
              creditCard: {
                number: "4012001038443335",
                holderName: "Teste Asaas",
                expiryMonth: "12",
                expiryYear: "2030",
                ccv: "123",
              },
            }),
          },
        );
      } else {
        response = await customFetch(
          `${API_BASE_URL}/api/admin/master/companies/${companyId}/sync`,
          {
            method: "POST",
            credentials: "include",
          },
        );
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Falha ao executar ação");
      }

      toast({
        title: "Ação executada",
        description: data?.warning || data?.message || "Fluxo atualizado.",
        variant: data?.warning ? "destructive" : "default",
      });

      await Promise.all([
        fetchCompanies(),
        fetchLogs(),
        fetchBillingFlowDebug(companyId),
      ]);
    } catch (error) {
      console.error("Erro ao executar ação do fluxo de cobrança:", error);
      const detail =
        error instanceof Error
          ? error.message
          : "Não foi possível executar a ação do fluxo de cobrança.";
      toast({
        title: "Erro",
        description: detail,
        variant: "destructive",
      });
    } finally {
      setBillingFlowActionLoading(null);
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
      rawBody,
      headers,
      acceptedStatuses,
    }: {
      id: string;
      checkName: string;
      method: "GET" | "POST" | "PATCH" | "DELETE";
      route: string;
      body?: unknown;
      rawBody?: BodyInit;
      headers?: HeadersInit;
      acceptedStatuses?: number[];
    }) => {
      const startedAt = Date.now();

      try {
        const requestBody =
          rawBody !== undefined
            ? rawBody
            : body !== undefined
              ? JSON.stringify(body)
              : undefined;
        const requestHeaders =
          headers ||
          (rawBody !== undefined
            ? undefined
            : body !== undefined
              ? { "Content-Type": "application/json" }
              : undefined);
        const response = await customFetch(`${API_BASE_URL}${route}`, {
          method,
          credentials: "include",
          headers: requestHeaders,
          body: requestBody,
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
        const isSuccessful =
          response.ok || Boolean(acceptedStatuses?.includes(response.status));

        appendDiagnostic({
          id,
          checkName,
          method,
          route,
          status: isSuccessful ? "OK" : "ERRO",
          httpStatus: response.status,
          durationMs,
          errorMessage: isSuccessful ? null : message,
          errorLocation: isSuccessful
            ? "-"
            : resolveErrorLocation(route, response.status, message || ""),
          responsePreview,
        });

        return {
          ok: isSuccessful,
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

      await runCheck({
        id: "api-health",
        checkName: "Verificar Saúde da API",
        method: "GET",
        route: "/api/health",
      });

      await runCheck({
        id: "pricing-public",
        checkName: "Ler Preço Público",
        method: "GET",
        route: "/api/business/settings/pricing",
      });

      await runCheck({
        id: "auth-session",
        checkName: "Validar Sessão Master",
        method: "GET",
        route: "/api/auth/get-session",
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
          id: "service-list-public",
          checkName: "Listar Serviços (Público)",
          method: "GET",
          route: `/api/services/company/${setupPayload.companyId}`,
        });

        await runCheck({
          id: "agenda-blocks-public",
          checkName: "Listar Bloqueios de Agenda (Público)",
          method: "GET",
          route: `/api/business/settings/${setupPayload.companyId}/blocks`,
        });

        await runCheck({
          id: "appointment-list-public",
          checkName: "Listar Agendamentos (Público)",
          method: "GET",
          route: `/api/appointments/company/${setupPayload.companyId}?startDate=${dateRangeStart.toISOString()}&endDate=${dateRangeEnd.toISOString()}`,
        });

        await runCheck({
          id: "business-slug-public",
          checkName: "Buscar Empresa por Slug (Público)",
          method: "GET",
          route: `/api/business/slug/${setupPayload.companySlug}`,
        });

        await runCheck({
          id: "business-id-public",
          checkName: "Buscar Empresa por ID (Público)",
          method: "GET",
          route: `/api/business/${setupPayload.companyId}`,
        });

        await runCheck({
          id: "master-reset-billing-day-lock",
          checkName: "Resetar Trava de Dia de Cobrança (Master)",
          method: "POST",
          route: `/api/admin/master/companies/${setupPayload.companyId}/billing-day/reset-lock`,
        });

        await runCheck({
          id: "business-settings-public",
          checkName: "Ler Horários de Funcionamento (Público)",
          method: "GET",
          route: `/api/business/settings/${setupPayload.companyId}`,
        });

        await runCheck({
          id: "business-profile-public",
          checkName: "Ler Perfil Público (Público)",
          method: "GET",
          route: `/api/settings/profile/${setupPayload.companyId}`,
        });

        await runCheck({
          id: "business-published-public",
          checkName: "Ler Customização Publicada (Público)",
          method: "GET",
          route: `/api/settings/published/${setupPayload.companyId}`,
        });

        await runCheck({
          id: "gallery-list-public",
          checkName: "Listar Galeria (Público)",
          method: "GET",
          route: `/api/gallery/public/${setupPayload.companyId}`,
        });

        const imageBytes = Uint8Array.from([
          137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0,
          1, 0, 0, 0, 1, 8, 4, 0, 0, 0, 181, 28, 12, 2, 0, 0, 0, 11, 73, 68, 65,
          84, 120, 218, 99, 252, 255, 31, 0, 3, 3, 1, 253, 163, 115, 253, 234,
          0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
        ]);
        const imageFile = new File([imageBytes], "diagnostic-bg.png", {
          type: "image/png",
        });
        const uploadBody = new FormData();
        uploadBody.append("file", imageFile);
        uploadBody.append("businessId", setupPayload.companyId);
        uploadBody.append("section", "gallery");

        const uploadBackgroundResult = await runCheck({
          id: "backblaze-upload-bg",
          checkName: "Upload de Imagem no Backblaze",
          method: "POST",
          route: "/api/settings/background-image",
          rawBody: uploadBody,
        });

        let uploadedImageRoute: string | null = null;
        const uploadedImageUrl = extractString(
          uploadBackgroundResult.parsed?.imageUrl,
        );
        if (uploadedImageUrl) {
          try {
            uploadedImageRoute = uploadedImageUrl.startsWith("http")
              ? new URL(uploadedImageUrl).pathname
              : uploadedImageUrl;
          } catch {
            uploadedImageRoute = uploadedImageUrl;
          }
        }

        if (uploadedImageRoute && uploadedImageUrl) {
          await runCheck({
            id: "backblaze-fetch-bg",
            checkName: "Buscar Imagem Salva no Backblaze",
            method: "GET",
            route: uploadedImageRoute,
          });

          await runCheck({
            id: "backblaze-delete-bg",
            checkName: "Excluir Imagem do Backblaze",
            method: "DELETE",
            route: "/api/settings/background-image",
            body: {
              imageUrl: uploadedImageUrl,
              businessId: setupPayload.companyId,
            },
          });

          await runCheck({
            id: "backblaze-verify-delete-bg",
            checkName: "Validar Exclusão no Backblaze",
            method: "GET",
            route: uploadedImageRoute,
            acceptedStatuses: [404],
          });
        } else {
          appendDiagnostic({
            id: "backblaze-flow",
            checkName: "Fluxo Backblaze",
            method: "POST",
            route: "/api/settings/background-image",
            status: "ERRO",
            httpStatus: uploadBackgroundResult.status,
            durationMs: 0,
            errorMessage:
              "Upload retornou sem imageUrl; não foi possível validar leitura/exclusão.",
            errorLocation: "Módulo Settings / Storage",
            responsePreview: uploadBackgroundResult.raw || null,
          });
        }

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

    const timer = setInterval(
      () => {
        if (!isRunningDiagnostics) {
          runRouteDiagnostics();
        }
      },
      autoDiagnosticsInterval * 60 * 1000,
    );

    return () => clearInterval(timer);
  }, [
    autoDiagnostics,
    autoDiagnosticsInterval,
    isRunningDiagnostics,
    runRouteDiagnostics,
  ]);

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val >= 1) {
      setAutoDiagnosticsInterval(val);
    }
  };

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
    grace_period: "Carência",
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
                  size="icon"
                  title="Configurar botões visíveis"
                  onClick={() => setIsActionsConfigOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
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
                            <div className="flex justify-end gap-1.5 flex-wrap max-w-100 ml-auto">
                              {/* Botões Pinned (Fora do +) */}
                              {pinnedActions.includes("sync") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2"
                                  title="Sincronizar com Asaas"
                                  onClick={() => handleSync(company.id)}
                                  disabled={
                                    syncingId === company.id ||
                                    simulatingId === company.id ||
                                    expiringId === company.id ||
                                    vencendoId === company.id ||
                                    resettingEmailId === company.id
                                  }
                                >
                                  {syncingId === company.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                                  )}
                                  Sync
                                </Button>
                              )}

                              {pinnedActions.includes("vencer") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                                  title="Simular Vencimento (Automático)"
                                  onClick={() =>
                                    handleSimulatePastDue(company.id)
                                  }
                                  disabled={
                                    vencendoId === company.id ||
                                    syncingId === company.id ||
                                    simulatingId === company.id ||
                                    expiringId === company.id ||
                                    resettingEmailId === company.id
                                  }
                                >
                                  {vencendoId === company.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                  )}
                                  Vencer
                                </Button>
                              )}

                              {pinnedActions.includes("carencia") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                  title="Colocar em Carência (Modo Automático)"
                                  onClick={() =>
                                    handleSimulateGracePeriod(company.id)
                                  }
                                  disabled={
                                    carenciaId === company.id ||
                                    vencendoId === company.id ||
                                    syncingId === company.id ||
                                    simulatingId === company.id ||
                                    expiringId === company.id ||
                                    resettingEmailId === company.id
                                  }
                                >
                                  {carenciaId === company.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                  )}
                                  Carência
                                </Button>
                              )}

                              {pinnedActions.includes("transicao") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                  title="Transição (Manual → Auto)"
                                  onClick={() =>
                                    handleTestExpiration(company.id)
                                  }
                                  disabled={
                                    expiringId === company.id ||
                                    syncingId === company.id ||
                                    simulatingId === company.id ||
                                    vencendoId === company.id ||
                                    resettingEmailId === company.id
                                  }
                                >
                                  {expiringId === company.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                  )}
                                  Transição
                                </Button>
                              )}

                              {pinnedActions.includes("email") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-cyan-600 border-cyan-200 hover:bg-cyan-50"
                                  title="Resetar Verificação E-mail"
                                  onClick={() =>
                                    handleResetEmailVerification(
                                      company.ownerId,
                                      company.id,
                                    )
                                  }
                                  disabled={
                                    resettingEmailId === company.id ||
                                    syncingId === company.id ||
                                    simulatingId === company.id ||
                                    vencendoId === company.id ||
                                    expiringId === company.id
                                  }
                                >
                                  {resettingEmailId === company.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Mail className="w-3.5 h-3.5 mr-1" />
                                  )}
                                  Email
                                </Button>
                              )}

                              {pinnedActions.includes("onboarding") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-violet-600 border-violet-200 hover:bg-violet-50"
                                  title="Resetar Primeiro Acesso"
                                  onClick={() =>
                                    handleResetOnboarding(company.id)
                                  }
                                  disabled={
                                    resettingOnboardingId === company.id ||
                                    resettingEmailId === company.id ||
                                    syncingId === company.id ||
                                    simulatingId === company.id ||
                                    vencendoId === company.id ||
                                    expiringId === company.id
                                  }
                                >
                                  {resettingOnboardingId === company.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Wrench className="w-3.5 h-3.5 mr-1" />
                                  )}
                                  1º Acesso
                                </Button>
                              )}

                              {pinnedActions.includes("dados") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                                  title="Resetar Dados (Serviços/Agend.)"
                                  onClick={() => {
                                    setSelectedCompanyForReset(company);
                                    setIsResetDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                                  Dados
                                </Button>
                              )}

                              {pinnedActions.includes("bloquear") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                  title="Bloquear Empresa (Completo)"
                                  onClick={() =>
                                    handleSimulateBlock(company.id)
                                  }
                                  disabled={
                                    simulatingId === company.id ||
                                    syncingId === company.id ||
                                    expiringId === company.id ||
                                    vencendoId === company.id ||
                                    resettingEmailId === company.id
                                  }
                                >
                                  {simulatingId === company.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <ShieldBan className="w-3.5 h-3.5 mr-1" />
                                  )}
                                  Bloquear
                                </Button>
                              )}

                              {pinnedActions.includes("reset-billing-lock") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                                  title="Resetar Trava de Cobrança"
                                  onClick={() =>
                                    handleResetBillingLock(company.id)
                                  }
                                  disabled={
                                    resettingLockId === company.id ||
                                    syncingId === company.id ||
                                    simulatingId === company.id ||
                                    vencendoId === company.id ||
                                    expiringId === company.id
                                  }
                                >
                                  {resettingLockId === company.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                                  )}
                                  Reset Trava
                                </Button>
                              )}

                              {pinnedActions.includes("fluxo-cobranca") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                  title="Modo de teste do fluxo de cobrança"
                                  onClick={() => openBillingFlow(company)}
                                  disabled={
                                    syncingId === company.id ||
                                    simulatingId === company.id ||
                                    vencendoId === company.id ||
                                    expiringId === company.id
                                  }
                                >
                                  <CreditCard className="w-3.5 h-3.5 mr-1" />
                                  Fluxo
                                </Button>
                              )}

                              {/* Menu "+" para as ações não pinned */}
                              {pinnedActions.length < ALL_ACTIONS.length && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-2"
                                      title="Mais opções de teste"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                  >
                                    {!pinnedActions.includes("sync") && (
                                      <DropdownMenuItem
                                        onClick={() => handleSync(company.id)}
                                        disabled={
                                          syncingId === company.id ||
                                          simulatingId === company.id ||
                                          expiringId === company.id ||
                                          vencendoId === company.id ||
                                          resettingEmailId === company.id
                                        }
                                      >
                                        {syncingId === company.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                          <RefreshCw className="w-4 h-4 mr-2" />
                                        )}
                                        Sincronizar Asaas
                                      </DropdownMenuItem>
                                    )}

                                    {!pinnedActions.includes("vencer") && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleSimulatePastDue(company.id)
                                        }
                                        disabled={
                                          vencendoId === company.id ||
                                          syncingId === company.id ||
                                          simulatingId === company.id ||
                                          expiringId === company.id ||
                                          resettingEmailId === company.id
                                        }
                                        className="text-orange-600 focus:text-orange-600"
                                      >
                                        {vencendoId === company.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                          <AlertTriangle className="w-4 h-4 mr-2" />
                                        )}
                                        Simular Vencimento
                                      </DropdownMenuItem>
                                    )}

                                    {!pinnedActions.includes("carencia") && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleSimulateGracePeriod(company.id)
                                        }
                                        disabled={
                                          carenciaId === company.id ||
                                          vencendoId === company.id ||
                                          syncingId === company.id ||
                                          simulatingId === company.id ||
                                          expiringId === company.id ||
                                          resettingEmailId === company.id
                                        }
                                        className="text-emerald-700 focus:text-emerald-700"
                                      >
                                        {carenciaId === company.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                          <Clock className="w-4 h-4 mr-2" />
                                        )}
                                        Colocar em Carência
                                      </DropdownMenuItem>
                                    )}

                                    {!pinnedActions.includes("transicao") && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleTestExpiration(company.id)
                                        }
                                        disabled={
                                          expiringId === company.id ||
                                          syncingId === company.id ||
                                          simulatingId === company.id ||
                                          vencendoId === company.id ||
                                          resettingEmailId === company.id
                                        }
                                        className="text-blue-600 focus:text-blue-600"
                                      >
                                        {expiringId === company.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                          <Clock className="w-4 h-4 mr-2" />
                                        )}
                                        Transição (Manual → Auto)
                                      </DropdownMenuItem>
                                    )}

                                    {!pinnedActions.includes("email") && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleResetEmailVerification(
                                            company.ownerId,
                                            company.id,
                                          )
                                        }
                                        disabled={
                                          resettingEmailId === company.id ||
                                          syncingId === company.id ||
                                          simulatingId === company.id ||
                                          vencendoId === company.id ||
                                          expiringId === company.id
                                        }
                                        className="text-cyan-600 focus:text-cyan-600"
                                      >
                                        {resettingEmailId === company.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                          <Mail className="w-4 h-4 mr-2" />
                                        )}
                                        Resetar Verificação E-mail
                                      </DropdownMenuItem>
                                    )}

                                    {!pinnedActions.includes("dados") && (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedCompanyForReset(company);
                                          setIsResetDialogOpen(true);
                                        }}
                                        className="text-amber-600 focus:text-amber-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Resetar Dados
                                      </DropdownMenuItem>
                                    )}

                                    {!pinnedActions.includes("onboarding") && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleResetOnboarding(company.id)
                                        }
                                        disabled={
                                          resettingOnboardingId ===
                                            company.id ||
                                          resettingEmailId === company.id ||
                                          syncingId === company.id ||
                                          simulatingId === company.id ||
                                          vencendoId === company.id ||
                                          expiringId === company.id
                                        }
                                        className="text-violet-600 focus:text-violet-600"
                                      >
                                        {resettingOnboardingId ===
                                        company.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                          <Wrench className="w-4 h-4 mr-2" />
                                        )}
                                        Resetar 1º Acesso
                                      </DropdownMenuItem>
                                    )}

                                    {!pinnedActions.includes("bloquear") && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleSimulateBlock(company.id)
                                        }
                                        disabled={
                                          simulatingId === company.id ||
                                          syncingId === company.id ||
                                          expiringId === company.id ||
                                          vencendoId === company.id ||
                                          resettingEmailId === company.id
                                        }
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        {simulatingId === company.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                          <ShieldBan className="w-4 h-4 mr-2" />
                                        )}
                                        Bloquear Empresa
                                      </DropdownMenuItem>
                                    )}

                                    {!pinnedActions.includes("reset-billing-lock") && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleResetBillingLock(company.id)
                                        }
                                        disabled={
                                          resettingLockId === company.id ||
                                          syncingId === company.id ||
                                          simulatingId === company.id ||
                                          vencendoId === company.id ||
                                          expiringId === company.id
                                        }
                                        className="text-purple-600 focus:text-purple-600"
                                      >
                                        {resettingLockId === company.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                          <RefreshCw className="w-4 h-4 mr-2" />
                                        )}
                                        Reset Trava Cobrança
                                      </DropdownMenuItem>
                                    )}

                                    {!pinnedActions.includes("fluxo-cobranca") && (
                                      <DropdownMenuItem
                                        onClick={() => openBillingFlow(company)}
                                        disabled={
                                          syncingId === company.id ||
                                          simulatingId === company.id ||
                                          vencendoId === company.id ||
                                          expiringId === company.id
                                        }
                                        className="text-indigo-600 focus:text-indigo-600"
                                      >
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Modo Fluxo Cobrança
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-md border border-orange-200 bg-orange-50 text-orange-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Simular Vencimento:</strong> Define como Automático
                    com status Vencido. Útil para testar bloqueios leves.
                  </div>
                </div>
                <div className="p-3 rounded-md border border-blue-200 bg-blue-50 text-blue-900 text-sm flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Teste de Transição:</strong> Define acesso manual
                    expirado. Valida se o sistema volta para automático ao
                    acessar.
                  </div>
                </div>
                <div className="p-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Carência:</strong> Mantém acesso ativo com status
                    de inadimplência temporária (grace_period), simulando conta
                    sem pagamento ainda dentro do prazo de carência.
                  </div>
                </div>
                <div className="p-3 rounded-md border border-cyan-200 bg-cyan-50 text-cyan-900 text-sm flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Reset E-mail:</strong> Define a verificação de
                    e-mail do proprietário como pendente. Útil para testar o
                    fluxo de onboarding.
                  </div>
                </div>
                <div className="p-3 rounded-md border border-red-200 bg-red-50 text-red-900 text-sm flex items-start gap-2">
                  <ShieldBan className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Bloqueio Completo:</strong> Desativa empresa/dono e
                    mata sessões.
                  </div>
                </div>
                <div className="p-3 rounded-md border border-purple-200 bg-purple-50 text-purple-900 text-sm flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Reset Trava:</strong> Libera a alteração do dia de
                    cobrança imediatamente, sem esperar 3 meses.
                  </div>
                </div>
                <div className="p-3 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-900 text-sm flex items-start gap-2">
                  <CreditCard className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Fluxo Cobrança:</strong> Abre diagnóstico completo
                    da assinatura (Asaas + status local), com botões guiados
                    para aplicar oferta, simular vencimento e sincronizar.
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
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-background shadow-sm">
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Intervalo (min):
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={autoDiagnosticsInterval}
                      onChange={handleIntervalChange}
                      className="w-10 bg-transparent text-sm font-bold focus:outline-none text-center"
                      title="Intervalo em minutos para o diagnóstico automático"
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setAutoDiagnostics((prev) => !prev)}
                    disabled={isRunningDiagnostics}
                    className={`transition-colors ${
                      autoDiagnostics
                        ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                        : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
                    }`}
                  >
                    Auto {autoDiagnosticsInterval}min:{" "}
                    {autoDiagnostics ? "ON" : "OFF"}
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
                  <TableHead className="w-45">Data/Hora</TableHead>
                  <TableHead className="w-30">Ação</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="w-30">Usuário</TableHead>
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

      <Dialog open={isBillingFlowOpen} onOpenChange={setIsBillingFlowOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Modo Fluxo de Cobrança
            </DialogTitle>
            <DialogDescription>
              Empresa:{" "}
              <strong>{selectedCompanyForBillingFlow?.name || "-"}</strong>.
              Use as ações guiadas para validar desconto e cobrança automática.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  selectedCompanyForBillingFlow &&
                  fetchBillingFlowDebug(selectedCompanyForBillingFlow.id)
                }
                disabled={
                  isBillingFlowLoading ||
                  billingFlowActionLoading !== null ||
                  !selectedCompanyForBillingFlow
                }
              >
                {isBillingFlowLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Recarregar Diagnóstico
              </Button>
              <Button
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => runBillingFlowAction("offer")}
                disabled={
                  isBillingFlowLoading || billingFlowActionLoading !== null
                }
              >
                {billingFlowActionLoading === "offer" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                Aplicar Oferta 20% (3 ciclos)
              </Button>
              <Button
                variant="outline"
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
                onClick={() => runBillingFlowAction("create-subscription")}
                disabled={
                  isBillingFlowLoading || billingFlowActionLoading !== null
                }
              >
                {billingFlowActionLoading === "create-subscription" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Criar Assinatura Teste (PIX)
              </Button>
              <Button
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => runBillingFlowAction("create-subscription-card")}
                disabled={
                  isBillingFlowLoading || billingFlowActionLoading !== null
                }
              >
                {billingFlowActionLoading === "create-subscription-card" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                Criar Assinatura Teste (CARTÃO)
              </Button>
              <Button
                variant="outline"
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                onClick={() => runBillingFlowAction("auto-debit")}
                disabled={
                  isBillingFlowLoading || billingFlowActionLoading !== null
                }
              >
                {billingFlowActionLoading === "auto-debit" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                Simular Débito Automático
              </Button>
              <Button
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => runBillingFlowAction("past-due")}
                disabled={
                  isBillingFlowLoading || billingFlowActionLoading !== null
                }
              >
                {billingFlowActionLoading === "past-due" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-2" />
                )}
                Simular Vencido
              </Button>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => runBillingFlowAction("sync")}
                disabled={
                  isBillingFlowLoading || billingFlowActionLoading !== null
                }
              >
                {billingFlowActionLoading === "sync" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sync Asaas
              </Button>
            </div>

            <div className="rounded-md border p-3 text-sm space-y-2">
              {!billingFlowDebug && !isBillingFlowLoading && (
                <p className="text-muted-foreground">
                  Abra o diagnóstico para visualizar os dados da assinatura.
                </p>
              )}
              {billingFlowDebug && (
                <>
                  <p>
                    <strong>Local:</strong>{" "}
                    status={billingFlowDebug.company.subscriptionStatus} | acesso=
                    {billingFlowDebug.company.accessType} | dono ativo=
                    {billingFlowDebug.company.ownerActive ? "sim" : "não"}
                  </p>
                  <p>
                    <strong>Asaas:</strong>{" "}
                    {billingFlowDebug.asaas
                      ? `status=${billingFlowDebug.asaas.status || "-"} | billingType=${billingFlowDebug.asaas.billingType || "-"} | próximo vencimento=${billingFlowDebug.asaas.nextDueDate || "-"}`
                      : "assinatura não encontrada"}
                  </p>
                  <p>
                    <strong>Tipo Local (Banco):</strong>{" "}
                    {billingFlowDebug.localBillingType || "-"}
                  </p>
                  <p>
                    <strong>Pagamentos:</strong>{" "}
                    total={billingFlowDebug.payments.total} | confirmados=
                    {billingFlowDebug.payments.confirmedCount} | pendentes=
                    {billingFlowDebug.payments.pendingCount}
                  </p>
                  <p>
                    <strong>Desconto:</strong>{" "}
                    {billingFlowDebug.asaas?.discount
                      ? JSON.stringify(billingFlowDebug.asaas.discount)
                      : "nenhum desconto ativo retornado"}
                  </p>
                  <p>
                    <strong>Autocobrança pronta:</strong>{" "}
                    {billingFlowDebug.diagnostic.canAutoCharge ? "SIM" : "NÃO"}
                  </p>
                  {!billingFlowDebug.diagnostic.canAutoCharge &&
                    billingFlowDebug.diagnostic.reasons.length > 0 && (
                      <p className="text-red-700">
                        <strong>Bloqueios:</strong>{" "}
                        {billingFlowDebug.diagnostic.reasons.join(" | ")}
                      </p>
                    )}
                  <p className="text-muted-foreground">
                    {billingFlowDebug.diagnostic.recommendedNextStep}
                  </p>
                  <p className="text-muted-foreground">
                    Roteiro recomendado: Criar Assinatura Teste (CARTÃO),
                    depois Simular Debito Automatico, aguardar 1-3 minutos e por fim
                    Sync Asaas para confirmar nova cobranca/pagamento.
                  </p>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Diálogo de Configuração de Ações */}
      <Dialog open={isActionsConfigOpen} onOpenChange={setIsActionsConfigOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Configurar Botões de Ação</DialogTitle>
            <DialogDescription>
              Selecione quais botões devem ficar visíveis na tabela. Os outros
              ficarão dentro do menu "+".
            </DialogDescription>
          </DialogHeader>
          <TooltipProvider delayDuration={120}>
            <div className="grid gap-4 py-4">
              {ALL_ACTIONS.map((action) => (
                <div key={action.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`action-${action.id}`}
                    checked={pinnedActions.includes(action.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPinnedActions([...pinnedActions, action.id]);
                      } else {
                        setPinnedActions(
                          pinnedActions.filter((id) => id !== action.id),
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`action-${action.id}`}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                    <span>{action.label}</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Ajuda: ${action.label}`}
                        className="h-6 w-6 rounded-full border border-muted-foreground/40 text-muted-foreground text-xs font-bold hover:bg-muted"
                      >
                        ?
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80 text-sm leading-relaxed">
                      <p>
                        <strong>{action.label}:</strong> {action.help}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          </TooltipProvider>
          <DialogFooter>
            <Button onClick={() => setIsActionsConfigOpen(false)}>
              Pronto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
