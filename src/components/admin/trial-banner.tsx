"use client";

import { differenceInDays } from "date-fns";
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
        cpfCnpj?: string;
        business?: {
          slug?: string;
          subscriptionStatus?: string;
          trialEndsAt?: string;
          daysLeft?: number;
        };
      }
    | undefined;
  if (user?.role === "SUPER_ADMIN") return null;

  // Determina o status e data final usando a melhor fonte disponível (Sessão atualizada > Sessão cache > Contexto)
  const userBusiness = sessionData?.user?.business || user?.business;

  // Verifica status na sessão do usuário (prioridade) ou no contexto do estúdio
  // Se o usuário estiver vendo seu próprio estúdio, usa os dados da sessão
  const isOwner = userBusiness?.slug === studio?.slug;

  const status =
    isOwner && userBusiness?.subscriptionStatus
      ? userBusiness.subscriptionStatus
      : studio?.subscriptionStatus;

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

  // Lógica de dias restantes: prioriza o campo `daysLeft` vindo do backend
  let displayDays = 0;

  if (isOwner && typeof userBusiness?.daysLeft === "number") {
    displayDays = userBusiness.daysLeft;
  } else if (trialEndsAt) {
    // Cálculo baseado EXCLUSIVAMENTE em trialEndsAt
    const endDate = new Date(trialEndsAt);
    const today = new Date();
    const diff = differenceInDays(endDate, today);
    displayDays = diff < 0 ? 0 : diff;
  } else {
    // Se não tem trialEndsAt, não assumimos nada (pode ser um erro de dados ou estado inválido)
    displayDays = 0;
  }

  useEffect(() => {
    if (status !== "trial" && status !== "trialing") return;

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

  // Aceita tanto "trial" quanto "trialing" para compatibilidade
  if (status !== "trial" && status !== "trialing") return null;

  // Lógica de Urgência (<= 3 dias)
  const isCritical = displayDays <= 3;
  const containerClasses = isCritical
    ? "bg-red-50 border-red-500 text-red-700"
    : "bg-yellow-50 border-yellow-400 text-yellow-700";

  const iconColor = isCritical ? "text-red-500" : "text-yellow-400";
  const buttonClasses = isCritical
    ? "text-red-700 underline hover:text-red-800"
    : "text-yellow-700 underline hover:text-yellow-800";

  const customerCpfCnpj = (user?.cpfCnpj || "").replace(/\D/g, "");
  const isCpfMissing = !customerCpfCnpj;

  const handleSubscribe = async () => {
    const user = session?.user as
      | { email?: string; name?: string; cpfCnpj?: string; businessId?: string }
      | undefined;

    if (!user?.email) {
      toast.error("Erro ao identificar usuário.");
      return;
    }

    const customerCpfCnpj = (user.cpfCnpj || "").replace(/\D/g, "");
    if (!customerCpfCnpj) {
      toast.error(
        "CPF necessário. Acesse 'Minha Conta' e preencha seu CPF antes de assinar.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const businessId = user.businessId || studio?.id;

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
          customerEmail: user.email,
          customerName: user.name,
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

  return (
    <div
      className={`border-l-4 p-4 mb-6 mx-4 lg:mx-6 mt-4 rounded-r shadow-sm transition-colors flex flex-col gap-3 ${containerClasses}`}
    >
      {isCpfMissing && (
        <div className="flex items-center gap-2 text-xs font-bold border-b border-current pb-2 mb-1 animate-pulse">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>⚠️ CPF/CNPJ NECESSÁRIO: Preencha em "Minha Conta" para poder assinar.</span>
        </div>
      )}
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
                {displayDays === 0
                  ? "Seu período de teste acabou!"
                  : `Seu período de teste acaba em ${displayDays} dias.`}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubscribe}
          disabled={isLoading}
          className={`font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses}`}
        >
          {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
          Assinar Agora
        </button>
      </div>
    </div>
  );
}
