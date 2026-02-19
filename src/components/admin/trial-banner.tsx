"use client";

import { differenceInDays } from "date-fns";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStudio } from "@/context/studio-context";
import { authClient, useSession } from "@/lib/auth-client";

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
  const { studio } = useStudio();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<SessionPayload | null>(null);

  // Busca dados atualizados da sessão para garantir que temos o status mais recente
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const result = await authClient.getSession();
        if (result.data) {
          // Converte explicitamente para unknown primeiro, depois para SessionPayload
          // Isso é necessário porque o tipo retornado pelo authClient pode ser incompatível
          setSessionData(result.data as unknown as SessionPayload);
        }
      } catch (error) {
        console.error("Erro ao buscar sessão:", error);
      }
    };
    fetchSession();
  }, []);

  // Verifica se o usuário é SUPER_ADMIN
  // O banner NÃO deve aparecer para Super Admin
  const user = session?.user as { role?: string; business?: { slug?: string; subscriptionStatus?: string; trialEndsAt?: string; daysLeft?: number } } | undefined;
  if (user?.role === "SUPER_ADMIN") return null;

  // Determina o status e data final usando a melhor fonte disponível (Sessão atualizada > Sessão cache > Contexto)
  const userBusiness = sessionData?.user?.business || user?.business;
  
  // Verifica status na sessão do usuário (prioridade) ou no contexto do estúdio
  // Se o usuário estiver vendo seu próprio estúdio, usa os dados da sessão
  const isOwner = userBusiness?.slug === studio?.slug;
  
  const status = isOwner && userBusiness?.subscriptionStatus 
    ? userBusiness.subscriptionStatus 
    : studio?.subscriptionStatus;

  // Aceita tanto "trial" quanto "trialing" para compatibilidade
  if (status !== "trial" && status !== "trialing") return null;

  const trialEndsAt = isOwner && userBusiness?.trialEndsAt
    ? userBusiness.trialEndsAt
    : studio?.trialEndsAt;

  // Lógica de dias restantes: prioriza o campo `daysLeft` vindo do backend
  let displayDays = 0;

  if (isOwner && typeof userBusiness?.daysLeft === 'number') {
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

  // Lógica de Urgência (<= 3 dias)
  const isCritical = displayDays <= 3;
  const containerClasses = isCritical 
    ? "bg-red-50 border-red-500 text-red-700" 
    : "bg-yellow-50 border-yellow-400 text-yellow-700";
  
  const iconColor = isCritical ? "text-red-500" : "text-yellow-400";
  const buttonClasses = isCritical
    ? "text-red-700 underline hover:text-red-800"
    : "text-yellow-700 underline hover:text-yellow-800";

  const handleSubscribe = async () => {
    if (!session?.user?.email) {
      toast.error("Erro ao identificar usuário.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/asaas/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: session.user.email,
          customerName: session.user.name,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error(data.error || "Erro ao gerar link");
      }
    } catch (error) {
      console.error("Erro ao assinar:", error);
      toast.error("Não foi possível gerar o link de pagamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`border-l-4 p-4 mb-6 mx-4 lg:mx-6 mt-4 rounded-r shadow-sm transition-colors ${containerClasses}`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center">
          <div className="shrink-0">
            <AlertTriangle className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
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
