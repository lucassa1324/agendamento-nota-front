"use client";

import { AlertTriangle, CreditCard, Loader2, LogOut, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  API_BASE_URL,
  authClient,
  signOut,
  useSession,
} from "@/lib/auth-client";

interface SubscriptionBlockScreenProps {
  status: string;
}

export function SubscriptionBlockScreen({
  status,
}: SubscriptionBlockScreenProps) {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [price, setPrice] = useState<number>(49.9);
  const customerCpfCnpj = (
    (session?.user as { cpfCnpj?: string })?.cpfCnpj || ""
  ).replace(/\D/g, "");
  const hasValidCpfCnpj =
    customerCpfCnpj.length === 11 || customerCpfCnpj.length === 14;

  const slug = params?.slug as string;

  const handleAccessReleased = useCallback(
    async (message: string) => {
      toast.success(message);
      try {
        await authClient.getSession();
      } catch (error) {
        console.error("Erro ao atualizar sessão:", error);
      }
      
      // Pequeno delay para garantir que o toast seja lido e a sessão atualizada
      setTimeout(() => {
        if (slug) {
          // Usa window.location.href para forçar um recarregamento completo da dashboard
          // Isso limpa qualquer cache do middleware ou do Next.js
          window.location.href = `/admin/${slug}/dashboard`;
          return;
        }
        window.location.reload();
      }, 1500);
    },
    [slug],
  );

  useEffect(() => {
    // Tenta sincronizar automaticamente ao abrir a tela de bloqueio
    const autoSync = async () => {
      console.log(
        ">>> [SUBSCRIPTION_BLOCK] Tentando sincronização automática...",
      );
      try {
        const response = await fetch(`${API_BASE_URL}/api/business/sync`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("better-auth.session_token")}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          await handleAccessReleased(
            "Pagamento identificado! Liberando acesso...",
          );
          return true;
        }
      } catch (err) {
        console.error("Erro no auto-sync:", err);
      }
      return false;
    };

    autoSync();

    // Configura polling para verificar o pagamento periodicamente (a cada 10 segundos)
    // Isso evita que o usuário precise apertar F5 manualmente
    const pollInterval = setInterval(async () => {
      console.log(">>> [SUBSCRIPTION_BLOCK] Polling de verificação...");
      const success = await autoSync();
      if (success) {
        clearInterval(pollInterval);
      }
    }, 10000); // 10 segundos

    const fetchPrice = async () => {
      try {
        console.log(">>> [SUBSCRIPTION_BLOCK] Buscando preço dinâmico...");
        const response = await fetch(
          `${API_BASE_URL}/api/business/settings/pricing?t=${Date.now()}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );
        if (response.ok) {
          const data = await response.json();
          console.log(">>> [SUBSCRIPTION_BLOCK] Preço recebido:", data.price);
          if (data.price) {
            setPrice(data.price);
          }
        } else {
          console.error(
            ">>> [SUBSCRIPTION_BLOCK] Erro ao buscar preço (status):",
            response.status,
          );
        }
      } catch (error) {
        console.error(">>> [SUBSCRIPTION_BLOCK] Erro ao buscar preço:", error);
      }
    };
    fetchPrice();

    return () => clearInterval(pollInterval);
  }, [handleAccessReleased]);

  const handleGoToMinhaConta = () => {
    if (slug) {
      router.push(`/admin/${slug}/dashboard/minha-conta`);
    } else {
      router.push("/admin");
    }
  };

  const handleSubscribe = async () => {
    if (!session?.user?.email) {
      toast.error("Erro ao identificar usuário.");
      return;
    }
    if (!hasValidCpfCnpj) {
      toast.error("Cadastre seu CPF/CNPJ em Minha Conta antes de pagar.");
      return;
    }

    setIsLoading(true);
    try {
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
          businessId: (session.user as { businessId?: string }).businessId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redireciona na mesma aba para evitar bloqueio de popup e garantir que o usuário veja a cobrança
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Erro ao gerar link de pagamento");
      }
    } catch (error) {
      console.error("Erro ao gerar pagamento:", error);
      toast.error(
        "Não foi possível gerar o link de pagamento. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/business/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("better-auth.session_token")}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        await handleAccessReleased(
          data.message || "Pagamento identificado! Liberando acesso...",
        );
      } else {
        toast.error(data.message || "Nenhum pagamento identificado.");
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      toast.error("Erro ao verificar pagamento. Tente novamente mais tarde.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/admin";
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "past_due":
        return {
          title: "Pagamento Pendente",
          description:
            "Identificamos uma pendência no pagamento da sua assinatura. Para continuar acessando o painel, regularize sua situação.",
          icon: AlertTriangle,
          color: "text-yellow-500",
        };
      case "canceled":
        return {
          title: "Assinatura Cancelada",
          description:
            "Sua assinatura foi cancelada. Para reativar o acesso ao sistema, realize uma nova assinatura.",
          icon: LogOut,
          color: "text-destructive",
        };
      case "unpaid":
        return {
          title: "Pagamento Não Realizado",
          description:
            "Não identificamos o pagamento da sua fatura. Regularize agora para liberar seu acesso imediatamente.",
          icon: CreditCard,
          color: "text-destructive",
        };
      default:
        return {
          title: "Acesso Bloqueado",
          description:
            "Sua conta está com status irregular. Entre em contato com o suporte ou regularize seu pagamento.",
          icon: AlertTriangle,
          color: "text-destructive",
        };
    }
  };

  const info = getStatusMessage(status);
  const Icon = info.icon;

  return (
    <div className="w-full flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm p-4 rounded-xl border border-dashed border-destructive/30 my-4 py-8">
      <Card className="w-full max-w-md shadow-lg border-destructive/20 bg-card/80">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-1">
            <Icon className={`w-7 h-7 ${info.color}`} />
          </div>
          <CardTitle className="text-xl font-bold">{info.title}</CardTitle>
          <CardDescription className="text-sm">
            {info.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="bg-muted/50 p-3 rounded-lg text-sm text-center">
            <p className="font-medium mb-0.5 text-xs text-muted-foreground uppercase tracking-wider">
              Valor da Assinatura
            </p>
            <p className="text-xl font-bold text-primary">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(price)}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                /mês
              </span>
            </p>
          </div>
          {!hasValidCpfCnpj && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 p-3 rounded-lg text-xs">
              Para gerar o pagamento, cadastre seu CPF/CNPJ em
              <button
                type="button"
                onClick={handleGoToMinhaConta}
                className="underline ml-1 font-semibold"
              >
                Minha Conta
              </button>
              .
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full h-11 text-sm font-semibold shadow-md"
            onClick={handleSubscribe}
            disabled={isLoading || isSyncing || !hasValidCpfCnpj}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando link...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pagar Agora
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full h-11 text-sm font-semibold"
            onClick={handleSync}
            disabled={isLoading || isSyncing}
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Já paguei, liberar meu acesso"
            )}
          </Button>

          <div className="grid grid-cols-2 gap-2 w-full mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToMinhaConta}
              className="flex-1 text-xs"
            >
              <User className="mr-1.5 h-3.5 w-3.5" />
              Minha Conta
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sair
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
