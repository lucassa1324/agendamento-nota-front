"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useToast } from "@/hooks/use-toast";

export function PushNotificationsButton() {
  const { toast } = useToast();
  const {
    isSupported,
    permission,
    isSubscribed,
    isRegistering,
    requestAndSubscribe,
  } = usePushNotifications();

  if (!isSupported) return null;
  if (permission === "granted" && isSubscribed) return null;

  const handleClick = async () => {
    const result = await requestAndSubscribe();
    if (result.ok) {
      toast({
        title: "Notificações ativadas",
        description: "Você receberá notificações do navegador.",
      });
    } else if (result.error === "missing_vapid_key") {
      toast({
        title: "Chave VAPID ausente",
        description:
          "Configure NEXT_PUBLIC_VAPID_PUBLIC_KEY nas variáveis de ambiente.",
        variant: "destructive",
      });
    } else if (result.error === "denied") {
      toast({
        title: "Permissão negada",
        description:
          "Ative manualmente as notificações nas configurações do navegador.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Falha ao ativar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isRegistering}
      className="w-full justify-start"
      variant="outline"
      size="sm"
    >
      <Bell className="w-4 h-4 mr-2" />
      {isRegistering ? "Ativando..." : "Ativar Notificações"}
    </Button>
  );
}
