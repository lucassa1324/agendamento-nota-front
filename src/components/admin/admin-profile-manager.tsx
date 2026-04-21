"use client";

import {
  AlertTriangle,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api-client";
import { signOut, updateUser, useSession } from "@/lib/auth-client";
import { SubscriptionCancellationModal } from "./subscription-cancellation-modal";

interface UserWithBusiness {
  business?: {
    subscriptionId?: string;
  };
}

export function AdminProfileManager() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, refetch } = useSession();
  const {
    studio,
    isLoading: isLoadingStudio,
    error: studioError,
  } = useStudio();
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSavingCpfCnpj, setIsSavingCpfCnpj] = useState(false);
  const [isSavingBillingDay, setIsSavingBillingDay] = useState(false);
  const [isBillingConfirmOpen, setIsBillingConfirmOpen] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [billingDayInput, setBillingDayInput] = useState("");
  const [isBillingDayPickerOpen, setIsBillingDayPickerOpen] = useState(false);

  const normalizeCpfCnpj = (value: string) => value.replace(/\D/g, "");

  const formatCpfCnpj = (value: string) => {
    const numbers = normalizeCpfCnpj(value).slice(0, 14);
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const handleSubscribe = async () => {
    if (!session?.user?.email) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar seu e-mail de usuário.",
        variant: "destructive",
      });
      return;
    }

    const planToUse = {
      id: "pro",
      name: "Pro",
      price: 49.9,
    };

    setIsSubscribing(true);
    try {
      const customerCpfCnpj = normalizeCpfCnpj(cpfCnpj);
      if (customerCpfCnpj.length !== 11 && customerCpfCnpj.length !== 14) {
        toast({
          title: "CPF/CNPJ obrigatório",
          description:
            "Cadastre seu CPF/CNPJ na aba Minha Conta para continuar com o pagamento.",
          variant: "destructive",
        });
        return;
      }
      const businessId =
        (session.user as { businessId?: string }).businessId || studio?.id;

      // 1. Obter IP (Opcional, mas Asaas costuma pedir se for cartão)
      let clientIp = "127.0.0.1";
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        clientIp = ipData.ip;
      } catch (e) {
        console.warn("Falha ao obter IP público:", e);
      }

      const response = await fetch("/api/asaas/create-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-ip": clientIp,
        },
        body: JSON.stringify({
          customerEmail: session.user.email,
          customerName: session.user.name,
          customerCpfCnpj,
          businessId,
          planPrice: planToUse.price,
          planName: planToUse.name,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redireciona na mesma aba para evitar bloqueio de popup e garantir que o usuário veja a cobrança
        window.location.href = data.url;
        toast({
          title: "Redirecionando",
          description: "Aguarde enquanto levamos você ao pagamento.",
        });
      } else {
        throw new Error(data.error || "Erro ao gerar link de pagamento");
      }
    } catch (error: unknown) {
      console.error("Erro ao gerar pagamento:", error);
      toast({
        title: "Erro",
        description:
          "Não foi possível gerar o link de pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    // phone: "", // Better-auth user object doesn't have phone by default unless customized
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const business = (session.user as any)?.business;
      setProfile({
        name: session.user.name || "",
        email: session.user.email || "",
      });
      setCpfCnpj(formatCpfCnpj((session.user as { cpfCnpj?: string }).cpfCnpj || ""));
      const anchorDay =
        business?.billingAnchorDay ||
        (business?.trialEndsAt ? new Date(business.trialEndsAt).getDate() : "");
      setBillingDayInput(anchorDay ? String(anchorDay) : "");
    }
  }, [session]);

  const handleSaveBillingDay = async () => {
    const parsedDay = Number(billingDayInput);
    if (!Number.isInteger(parsedDay) || parsedDay < 1 || parsedDay > 31) {
      toast({
        title: "Dia inválido",
        description: "Informe um dia entre 1 e 31.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingBillingDay(true);
    try {
      const response = await customFetch("/api/business/billing/day", {
        method: "PATCH",
        body: JSON.stringify({ day: parsedDay }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.error === "ALTERACAO_BLOQUEADA") {
          const nextDate = data?.nextAllowedChangeAt
            ? new Date(data.nextAllowedChangeAt).toLocaleDateString("pt-BR")
            : "após o período de 3 meses";
          throw new Error(
            `Você só poderá alterar novamente em ${nextDate}.`,
          );
        }
        throw new Error(
          data?.message ||
            data?.error ||
            "Não foi possível alterar o dia de cobrança.",
        );
      }

      await refetch();
      toast({
        title: "Dia de cobrança atualizado",
        description:
          "Novo dia salvo com sucesso. Uma nova alteração só poderá ser feita após 3 meses.",
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar o dia de cobrança.",
        variant: "destructive",
      });
    } finally {
      setIsSavingBillingDay(false);
    }
  };

  const handleOpenBillingConfirm = () => {
    const parsedDay = Number(billingDayInput);
    if (!Number.isInteger(parsedDay) || parsedDay < 1 || parsedDay > 31) {
      toast({
        title: "Dia inválido",
        description: "Selecione um dia entre 1 e 31.",
        variant: "destructive",
      });
      return;
    }
    setIsBillingConfirmOpen(true);
  };

  const handleSaveCpfCnpj = async () => {
    const normalizedCpfCnpj = normalizeCpfCnpj(cpfCnpj);
    if (normalizedCpfCnpj.length !== 11 && normalizedCpfCnpj.length !== 14) {
      toast({
        title: "CPF/CNPJ inválido",
        description: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).",
        variant: "destructive",
      });
      return;
    }

    setIsSavingCpfCnpj(true);
    try {
      const response = await customFetch("/users/me/cpf-cnpj", {
        method: "PATCH",
        body: JSON.stringify({ cpfCnpj: normalizedCpfCnpj }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível salvar o CPF/CNPJ.");
      }

      setCpfCnpj(formatCpfCnpj(data?.cpfCnpj || normalizedCpfCnpj));
      await refetch();
      toast({
        title: "CPF/CNPJ salvo",
        description: "Seu documento foi atualizado com sucesso.",
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar seu CPF/CNPJ.",
        variant: "destructive",
      });
    } finally {
      setIsSavingCpfCnpj(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await updateUser({
        name: profile.name,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Seu perfil foi atualizado com sucesso.",
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erro",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Substituindo changePassword do Better Auth por fetch manual para garantir o envio correto do body
      // TESTE: Bypass de proxy recomendado pelo Backend Dev
      // Usando variável de ambiente pública para apontar para o backend correto (local ou prod)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const targetUrl = `${baseUrl}/api/auth/change-password`;

      console.log(
        ">>> [CHANGE_PASSWORD] Iniciando troca de senha via FETCH MANUAL (BYPASS PROXY)",
      );
      console.log(">>> [CHANGE_PASSWORD] Target URL:", targetUrl);
      console.log(">>> [CHANGE_PASSWORD] Payload:", {
        newPassword: passwords.new,
        currentPassword: passwords.current,
        revokeOtherSessions: true,
      });

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // Enviar cookies de sessão mesmo em requisições cross-origin (bypass proxy)
        body: JSON.stringify({
          newPassword: passwords.new,
          currentPassword: passwords.current,
          revokeOtherSessions: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      // Se deu tudo certo
      setPasswords({ current: "", new: "", confirm: "" });
      toast({
        title: "Sucesso!",
        description:
          "Sua senha foi alterada com sucesso. Redirecionando para login...",
      });

      // Invalidar sessão e redirecionar para login
      console.log(
        ">>> [CHANGE_PASSWORD] Sucesso. Iniciando logout e redirect...",
      );
      await signOut();
      localStorage.clear();
      router.push("/admin");
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };

      // Tratamento de erro amigável conforme solicitado
      if (
        error.code === "INVALID_PASSWORD" ||
        error.message?.includes("incorrect") ||
        error.message?.includes("Senha atual e nova senha são obrigatórias")
      ) {
        toast({
          title: "Erro",
          description:
            error.message || "A senha atual informada está incorreta.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resolveBillingDates = () => {
    const businessStatus = (session?.user as any)?.business?.subscriptionStatus;
    const businessTrialEndsAt =
      (session?.user as any)?.business?.trialEndsAt || studio?.trialEndsAt;

    if (
      businessTrialEndsAt &&
      ["active", "grace_period", "past_due", "unpaid", "canceled"].includes(
        businessStatus,
      )
    ) {
      const planEnd = new Date(businessTrialEndsAt);
      const planStart = new Date(planEnd);
      planStart.setMonth(planStart.getMonth() - 1);
      return { planStart, nextInvoice: planEnd };
    }

    if (!studio?.createdAt) {
      return null;
    }

    const start = new Date(studio.createdAt);
    const nextInvoice = new Date(start);
    nextInvoice.setMonth(nextInvoice.getMonth() + 1);
    return { planStart: start, nextInvoice };
  };

  const billingDates = resolveBillingDates();
  const hasValidCpfCnpj = [11, 14].includes(normalizeCpfCnpj(cpfCnpj).length);
  const subscriptionStatus = (session?.user as any)?.business?.subscriptionStatus;
  const isGracePeriod = subscriptionStatus === "grace_period";
  const graceEndsAtRaw = (session?.user as any)?.business?.billingGraceEndsAt;
  const graceEndsAt = graceEndsAtRaw ? new Date(graceEndsAtRaw) : null;
  const billingAnchorDay = (session?.user as any)?.business?.billingAnchorDay;
  const nextAllowedBillingChangeRaw = (session?.user as any)?.business
    ?.billingDayLastChangedAt;
  const nextAllowedBillingChangeAt = nextAllowedBillingChangeRaw
    ? new Date(nextAllowedBillingChangeRaw)
    : null;
  const canChangeBillingDay =
    !nextAllowedBillingChangeAt || nextAllowedBillingChangeAt <= new Date();
  const billingDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Dados Pessoais
          </CardTitle>
          <CardDescription>
            Atualize suas informações de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-10"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  placeholder="Seu nome"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail de Login</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  className="pl-10 bg-muted"
                  value={profile.email}
                  disabled
                  placeholder="seu@email.com"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                O e-mail de login não pode ser alterado diretamente aqui.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf-cnpj">CPF/CNPJ para cobrança</Label>
              <Input
                id="cpf-cnpj"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                placeholder="Digite seu CPF ou CNPJ"
                autoComplete="off"
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Esse documento é obrigatório para liberar a assinatura e gerar o
                boleto.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSaveCpfCnpj}
                disabled={isSavingCpfCnpj}
              >
                {isSavingCpfCnpj ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando CPF/CNPJ...
                  </>
                ) : (
                  "Salvar CPF/CNPJ"
                )}
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Mantenha sua conta segura alterando a senha regularmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showCurrentPassword ? "Ocultar senha" : "Mostrar senha"}
                  </span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                  </span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  </span>
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Atualizar Senha
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Seção de Status da Assinatura e Pagamento */}
      {session?.user && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Assinatura e Faturamento
            </CardTitle>
            <CardDescription>
              Acompanhe o status do seu plano e realize pagamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 border rounded-xl bg-muted/30">
              <div className="space-y-4 w-full">
                <div className="flex flex-wrap gap-8">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status Atual
                    </p>
                    <div className="flex items-center gap-2">
                      {studioError?.includes("(402)") ||
                      (session.user as any).business?.subscriptionStatus ===
                        "past_due" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Pagamento Pendente
                        </span>
                      ) : (session.user as any).business?.subscriptionStatus ===
                        "grace_period" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          Em Carência (7 dias)
                        </span>
                      ) : (session.user as any).business?.subscriptionStatus ===
                        "active" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Ativa
                        </span>
                      ) : ["trial", "trialing"].includes(
                          (session.user as any).business?.subscriptionStatus,
                        ) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          Período de Teste
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {(session.user as any).business?.subscriptionStatus ||
                            "Desconhecido"}
                        </span>
                      )}
                    </div>
                  </div>

                  {billingDates && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Início do Plano
                        </p>
                        <p className="text-sm font-semibold">
                          {billingDates.planStart.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Próxima Fatura
                        </p>
                        <p className="text-sm font-semibold">
                          {billingDates.nextInvoice.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Dia de Cobrança
                        </p>
                        <p className="text-sm font-semibold">
                          Dia {billingAnchorDay || billingDates.nextInvoice.getDate()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    O vencimento mensal usa como referência o dia do seu primeiro pagamento confirmado.
                    Se passar do vencimento sem pagar, sua conta entra em carência por 7 dias antes do bloqueio.
                  </p>
                  {isGracePeriod && graceEndsAt && (
                    <p className="text-amber-700 font-medium">
                      Carência ativa até {graceEndsAt.toLocaleDateString("pt-BR")}.
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end pt-3 border-t border-border">
                  <div className="space-y-1 w-full sm:w-auto">
                    <Label htmlFor="billing-day" className="text-xs">
                      Alterar Dia de Cobrança (1 a 31)
                    </Label>
                    <Popover
                      open={isBillingDayPickerOpen}
                      onOpenChange={setIsBillingDayPickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          id="billing-day"
                          type="button"
                          variant="outline"
                          className="w-full sm:w-40 justify-start"
                          disabled={!canChangeBillingDay || isSavingBillingDay}
                        >
                          {billingDayInput
                            ? `Dia ${billingDayInput}`
                            : "Selecionar dia"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3">
                        <p className="text-xs text-muted-foreground mb-2">
                          Selecione o dia de vencimento
                        </p>
                        <div className="grid grid-cols-7 gap-1">
                          {billingDays.map((day) => (
                            <Button
                              key={day}
                              type="button"
                              size="sm"
                              variant={
                                Number(billingDayInput) === day
                                  ? "default"
                                  : "outline"
                              }
                              className="h-8 px-0"
                              onClick={() => {
                                setBillingDayInput(String(day));
                                setIsBillingDayPickerOpen(false);
                              }}
                            >
                              {day}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenBillingConfirm}
                    disabled={!canChangeBillingDay || isSavingBillingDay}
                  >
                    {isSavingBillingDay ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Dia"
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {canChangeBillingDay
                      ? "Você pode alterar hoje. Após salvar, a próxima alteração só será liberada em 3 meses."
                      : `Próxima alteração disponível em ${nextAllowedBillingChangeAt?.toLocaleDateString("pt-BR")}.`}
                  </p>
                </div>

                {(studioError?.includes("(402)") ||
                  (session.user as any).business?.subscriptionStatus ===
                    "past_due" ||
                  (session.user as any).business?.subscriptionStatus ===
                    "grace_period" ||
                  ["trial", "trialing"].includes(
                    (session.user as any).business?.subscriptionStatus,
                  )) && (
                  <div className="space-y-6 pt-4 border-t border-border mt-4 w-full">
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <div className="flex-1">
                        <p className="text-sm text-zinc-700 font-medium">
                          {studioError?.includes("(402)") ||
                          (session.user as any).business?.subscriptionStatus ===
                            "past_due"
                            ? "Sua assinatura está com pagamento pendente. Regularize agora para evitar interrupções no serviço."
                            : (session.user as any).business
                              ?.subscriptionStatus === "grace_period"
                              ? "Seu vencimento passou e você está no período de carência de 7 dias. Pague agora para evitar bloqueio automático ao final da carência."
                            : "Seu período de teste está ativo. Assine agora para garantir a continuidade do seu acesso e aproveitar todos os recursos."}
                        </p>
                        {!hasValidCpfCnpj && (
                          <p className="text-xs text-red-600 mt-2">
                            Cadastre seu CPF/CNPJ na seção de dados pessoais
                            para liberar o pagamento.
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleSubscribe()}
                        disabled={isSubscribing || !hasValidCpfCnpj}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 min-w-50 shadow-sm"
                      >
                        {isSubscribing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            {studioError?.includes("(402)") ||
                            (session.user as any).business
                              ?.subscriptionStatus === "past_due" ||
                            (session.user as any).business
                              ?.subscriptionStatus === "grace_period"
                              ? "Pagar Agora"
                              : "Assinar Plano Pro"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção de Cancelamento de Assinatura */}
      <Card className="md:col-span-2 border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription className="text-red-600/80">
            Ações sensíveis relacionadas à sua conta e assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-red-200 rounded-lg bg-white">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-red-900">
                Cancelar Assinatura
              </h4>
              <p className="text-xs text-red-700/80 max-w-md">
                Ao cancelar, você perderá acesso aos recursos premium ao final
                do ciclo de cobrança atual. Essa ação não pode ser desfeita.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsCancellationModalOpen(true)}
            >
              Cancelar Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>

      <SubscriptionCancellationModal
        isOpen={isCancellationModalOpen}
        onClose={() => setIsCancellationModalOpen(false)}
        subscriptionId={
          (session?.user as unknown as UserWithBusiness)?.business
            ?.subscriptionId
        }
      />

      <AlertDialog
        open={isBillingConfirmOpen}
        onOpenChange={setIsBillingConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Alteração</AlertDialogTitle>
            <AlertDialogDescription>
              Você está alterando seu dia de cobrança para o dia{" "}
              {billingDayInput}. Após confirmar, uma nova alteração só poderá
              ser feita em 3 meses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setIsBillingConfirmOpen(false);
                await handleSaveBillingDay();
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
