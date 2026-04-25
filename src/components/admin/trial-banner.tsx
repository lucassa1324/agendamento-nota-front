"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useStudio } from "@/context/studio-context";
import { API_BASE_URL, authClient, useSession } from "@/lib/auth-client";

interface SessionPayload {
  user: {
    business?: {
      slug?: string;
      subscriptionStatus?: string;
      trialEndsAt?: string;
      billingGraceEndsAt?: string;
      daysLeft?: number;
    };
  };
}

export function TrialBanner() {
  const { studio, refreshData } = useStudio();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<SessionPayload | null>(null);

  const refreshSessionData = useCallback(async () => {
    try {
      const result = await authClient.getSession();
      if (result.data) {
        setSessionData(result.data as unknown as SessionPayload);
      }
    } catch (error) {
      console.error("Erro ao atualizar sessão:", error);
    }
  }, []);

  // Busca dados atualizados da sessão para garantir que temos o status mais recente
  useEffect(() => {
    refreshSessionData();
  }, [refreshSessionData]);

  // Verifica se o usuário é SUPER_ADMIN
  // O banner NÃO deve aparecer para Super Admin
  const user = session?.user as
    | {
        role?: string;
        business?: {
          slug?: string;
          subscriptionStatus?: string;
          trialEndsAt?: string;
          billingGraceEndsAt?: string;
          daysLeft?: number;
        };
      }
    | undefined;
  if (user?.role === "SUPER_ADMIN" || user?.role?.toLowerCase() === "user") return null;

  // Determina o status e data final usando a melhor fonte disponível (Sessão atualizada > Sessão cache > Contexto)
  const userBusiness = sessionData?.user?.business || user?.business;

  // Verifica status na sessão do usuário (prioridade) ou no contexto do estúdio
  // Se o usuário estiver vendo seu próprio estúdio, usa os dados da sessão
  const isOwner = userBusiness?.slug === studio?.slug;

  const status =
    isOwner && userBusiness?.subscriptionStatus
      ? userBusiness.subscriptionStatus
      : studio?.subscriptionStatus;
  const customerCpfCnpj = (
    (session?.user as { cpfCnpj?: string })?.cpfCnpj || ""
  ).replace(/\D/g, "");
  const hasValidCpfCnpj =
    customerCpfCnpj.length === 11 || customerCpfCnpj.length === 14;

  const tryAutoSyncSubscription = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const sessionToken =
        typeof window !== "undefined"
          ? localStorage.getItem("better-auth.session_token")
          : null;
      const response = await fetch(`${API_BASE_URL}/api/business/sync`, {
        method: "POST",
        credentials: "include",
        headers: sessionToken
          ? { Authorization: `Bearer ${sessionToken}` }
          : undefined,
      });
      const data = await response.json();
      if (data?.success) {
        refreshData();
        await refreshSessionData();
      }
    } catch (error) {
      console.warn("Falha no auto-sync de assinatura:", error);
    }
  }, [refreshData, refreshSessionData, session?.user?.email]);

  const trialEndsAt =
    isOwner && userBusiness?.trialEndsAt
      ? userBusiness.trialEndsAt
      : studio?.trialEndsAt;
  const billingGraceEndsAt = userBusiness?.billingGraceEndsAt;

  const getRemainingDays = (endDateInput: Date | string) => {
    const endDate = new Date(endDateInput);
    const diffMs = endDate.getTime() - Date.now();
    if (Number.isNaN(diffMs) || diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Lógica de dias restantes
  let displayDays = 0;

  if (status === "grace_period") {
    if (billingGraceEndsAt) {
      displayDays = getRemainingDays(billingGraceEndsAt);
    } else if (trialEndsAt) {
      // Fallback: em carência, se não vier billingGraceEndsAt na sessão,
      // usamos o vencimento + 7 dias.
      const derivedGraceEnd = new Date(trialEndsAt);
      derivedGraceEnd.setDate(derivedGraceEnd.getDate() + 7);
      displayDays = getRemainingDays(derivedGraceEnd);
    } else {
      displayDays = 0;
    }
  } else if (isOwner && typeof userBusiness?.daysLeft === "number") {
    displayDays = userBusiness.daysLeft;
  } else if (trialEndsAt) {
    // Trial: usa data final do trial
    displayDays = getRemainingDays(trialEndsAt);
  } else {
    displayDays = 0;
  }

  useEffect(() => {
    if (status !== "trial" && status !== "trialing" && status !== "grace_period") return;

    const hasPendingSync =
      typeof window !== "undefined" &&
      localStorage.getItem("pending_billing_sync") === "1";

    // Só sincroniza automaticamente se:
    // 1. Tiver um sinal de que o usuário acabou de pagar (veio do checkout)
    // 2. Ou se o trial já expirou (0 dias), para verificar se houve pagamento
    const shouldSync = hasPendingSync || displayDays === 0;

    if (shouldSync) {
      void tryAutoSyncSubscription().finally(() => {
        if (hasPendingSync && typeof window !== "undefined") {
          localStorage.removeItem("pending_billing_sync");
        }
      });
    }
  }, [status, tryAutoSyncSubscription, displayDays]);

  // Aceita trial/trialing e também grace_period (inadimplência com prazo de carência)
  if (status !== "trial" && status !== "trialing" && status !== "grace_period")
    return null;

  // Lógica de Urgência (<= 3 dias)
  const isCritical = displayDays <= 3;
  const isGracePeriod = status === "grace_period";
  const containerClasses = isGracePeriod
    ? isCritical
      ? "bg-red-50 border-red-500 text-red-700"
      : "bg-orange-50 border-orange-400 text-orange-700"
    : isCritical
      ? "bg-red-50 border-red-500 text-red-700"
      : "bg-yellow-50 border-yellow-400 text-yellow-700";

  const iconColor = isGracePeriod
    ? isCritical
      ? "text-red-500"
      : "text-orange-500"
    : isCritical
      ? "text-red-500"
      : "text-yellow-400";

  const buttonClasses = isGracePeriod
    ? isCritical
      ? "text-red-700 underline hover:text-red-800"
      : "text-orange-700 underline hover:text-orange-800"
    : isCritical
      ? "text-red-700 underline hover:text-red-800"
      : "text-yellow-700 underline hover:text-yellow-800";

  const handleSubscribe = async () => {
    if (!session?.user?.email) {
      toast.error("Erro ao identificar usuário.");
      return;
    }

    setIsLoading(true);
    try {
      if (!hasValidCpfCnpj) {
        toast.error(
          "Cadastre seu CPF/CNPJ em Minha Conta antes de gerar a cobrança.",
        );
        return;
      }
      const businessId =
        (session.user as { businessId?: string }).businessId || studio?.id;

      // 1. Obter IP
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
        }),
      });

      const data = await response.json();

      if (data.url) {
        if (typeof window !== "undefined") {
          localStorage.setItem("pending_billing_sync", "1");
        }
        // Redireciona na mesma aba para evitar bloqueio de popup e garantir que o usuário veja a cobrança
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Erro ao gerar link");
      }
    } catch (error) {
      console.error("Erro ao assinar:", error);
      toast.error(
        "Não foi possível gerar o link de pagamento. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const goToMinhaConta = () => {
    const businessSlug = userBusiness?.slug || studio?.slug;
    if (!businessSlug) {
      return;
    }
    window.location.href = `/admin/${businessSlug}/dashboard/minha-conta`;
  };

  return (
    <div
      className={`border-l-4 p-4 mb-6 mx-4 lg:mx-6 mt-4 rounded-r shadow-sm transition-colors ${containerClasses}`}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center">
          <div className="shrink-0">
            <AlertTriangle
              className={`h-5 w-5 ${iconColor}`}
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium flex items-center gap-2 flex-wrap">
              <span>
                {isGracePeriod
                  ? displayDays === 0
                    ? "Seu prazo de carência acabou! A plataforma pode ser bloqueada."
                    : `Pagamento pendente: faltam ${displayDays} dias para o bloqueio da plataforma.`
                  : displayDays === 0
                    ? "Seu período de teste acabou!"
                    : `Seu período de teste acaba em ${displayDays} dias.`}
              </span>
            </p>
            <p className="text-xs opacity-90 mt-1">
              Dias restantes: <strong>{displayDays}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!hasValidCpfCnpj && (
            <button
              type="button"
              onClick={goToMinhaConta}
              className={`font-bold text-sm transition-colors ${buttonClasses}`}
            >
              Cadastrar CPF/CNPJ
            </button>
          )}
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={isLoading || !hasValidCpfCnpj}
            className={`font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses}`}
          >
            {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            Assinar Agora
          </button>
        </div>
      </div>
      {!hasValidCpfCnpj && (
        <p className="text-xs mt-3">
          Para assinar, primeiro cadastre CPF/CNPJ na aba Minha Conta.
        </p>
      )}
    </div>
  );
}
