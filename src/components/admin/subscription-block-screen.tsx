"use client";

import { AlertTriangle, CreditCard, Loader2, LogOut } from "lucide-react";
import { useState } from "react";
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
import { signOut, useSession } from "@/lib/auth-client";

interface SubscriptionBlockScreenProps {
  status: string;
}

export function SubscriptionBlockScreen({
  status,
}: SubscriptionBlockScreenProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-destructive/20">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
            <Icon className={`w-8 h-8 ${info.color}`} />
          </div>
          <CardTitle className="text-2xl font-bold">{info.title}</CardTitle>
          <CardDescription className="text-base">
            {info.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="bg-muted/50 p-4 rounded-lg text-sm text-center">
            <p className="font-medium mb-1">Valor da Assinatura</p>
            <p className="text-2xl font-bold text-primary">
              R$ 49,90
              <span className="text-sm font-normal text-muted-foreground">
                /mês
              </span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full h-12 text-base font-semibold shadow-md"
            size="lg"
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Gerando Pagamento...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Regularizar Assinatura Agora
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            Sair da conta
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
