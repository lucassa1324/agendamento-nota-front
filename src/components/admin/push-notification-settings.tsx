"use client";

import { AlertCircle, Bell, BellOff, CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { customFetch } from "@/lib/api-client";

interface UserPreferences {
  notifyNewAppointments: boolean;
  notifyCancellations: boolean;
  notifyInventoryAlerts: boolean;
}

export function PushNotificationSettings() {
  const { isSubscribed, permission, requestAndSubscribe, unsubscribeFromPush, isRegistering } = usePushNotifications();
  const { toast } = useToast();
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifyNewAppointments: true,
    notifyCancellations: true,
    notifyInventoryAlerts: false,
  });

  // Carregar preferências do usuário
  useEffect(() => {
    async function loadPreferences() {
      try {
        const response = await customFetch("/api/user/preferences");
        if (response.ok) {
          const data = await response.json();
          if (data) {
             setPreferences({
                notifyNewAppointments: data.notifyNewAppointments ?? true,
                notifyCancellations: data.notifyCancellations ?? true,
                notifyInventoryAlerts: data.notifyInventoryAlerts ?? false,
             });
          }
        } else if (response.status === 401) {
            // Tratamento de 401: Redirecionar para login
             window.location.href = "/login";
        }
      } catch (error) {
        console.error("Erro ao carregar preferências:", error);
      } finally {
        setLoadingPreferences(false);
      }
    }
    loadPreferences();
  }, []);

  const handleToggle = async (key: keyof UserPreferences) => {
    if (updating[key]) return;
    
    setUpdating((prev) => ({ ...prev, [key]: true }));
    const newValue = !preferences[key];
    const newPreferences = { ...preferences, [key]: newValue };
    
    // Atualização otimista
    setPreferences(newPreferences);

    // Mapear para snake_case para o backend
    const payload = {
        notify_new_appointments: newPreferences.notifyNewAppointments,
        notify_cancellations: newPreferences.notifyCancellations,
        notify_inventory_alerts: newPreferences.notifyInventoryAlerts
    };

    try {
      const response = await customFetch("/api/user/preferences", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
             window.location.href = "/login";
             return;
        }
        throw new Error("Falha ao salvar preferências");
      }
      
      toast({
        title: "Preferências atualizadas",
        description: "Suas configurações de notificação foram salvas.",
      });
    } catch {
      // Reverter em caso de erro
      setPreferences({ ...preferences, [key]: !newValue });
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas alterações. Tente novamente.",
      });
    } finally {
      setUpdating((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleActivate = async () => {
    const result = await requestAndSubscribe();
    if (result?.ok) {
      toast({
        title: "Notificações Ativadas!",
        description: "Este dispositivo agora receberá alertas.",
      });
    } else {
      let message = "Não foi possível ativar as notificações.";
      if (result?.error === "denied") {
        message = "Você bloqueou as notificações. Desbloqueie no navegador.";
      } else if (result?.error === "missing_vapid_key") {
        message = "Erro de configuração: Chave VAPID ausente.";
      }
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
    }
  };

  const handleDeactivate = async () => {
    const result = await unsubscribeFromPush();
    if (result?.ok) {
      toast({
        title: "Notificações Desativadas",
        description: "Este dispositivo não receberá mais alertas.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível desativar as notificações.",
      });
    }
  };

  const handleTestNotification = async () => {
    try {
      console.log("Iniciando teste de notificação...");
      toast({
        title: "Enviando teste...",
        description: "Aguarde um momento.",
      });
      
      const response = await customFetch("/api/notifications/test", {
        method: "POST",
      });
      
      console.log("Resposta do teste:", response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log("Dados do teste:", data);
        toast({
          title: "Teste enviado",
          description: "Verifique se você recebeu a notificação.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Erro no teste:", errorData);
        throw new Error("Falha no envio");
      }
    } catch (error) {
      console.error("Erro capturado no teste:", error);
      toast({
        variant: "destructive",
        title: "Erro no teste",
        description: "Não foi possível enviar a notificação de teste. Verifique o console.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Card de Status do Dispositivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Status do Dispositivo
          </CardTitle>
          <CardDescription>
            Gerencie a permissão de notificações push para este navegador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-4">
              {permission === "granted" && isSubscribed ? (
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              ) : permission === "denied" ? (
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <BellOff className="h-6 w-6" />
                </div>
              ) : permission === "granted" ? (
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <Bell className="h-6 w-6" />
                </div>
              )}
              
              <div>
                <h4 className="font-medium">
                  {permission === "granted" && isSubscribed
                    ? "Dispositivo Autorizado"
                    : permission === "denied"
                    ? "Notificações Bloqueadas"
                    : permission === "granted"
                    ? "Permissão Concedida (Inativo)"
                    : "Notificações Pendentes"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {permission === "granted" && isSubscribed
                    ? "Este navegador está pronto para receber alertas."
                    : permission === "denied"
                    ? "Para reativar, clique no ícone de cadeado na barra de endereço e permita as notificações."
                    : permission === "granted"
                    ? "A permissão foi concedida, mas as notificações ainda não foram ativadas."
                    : "Ative para receber atualizações em tempo real."}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {permission === "granted" && isSubscribed ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleTestNotification}>
                    <Bell className="mr-2 h-4 w-4" />
                    Testar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeactivate} disabled={isRegistering}>
                    {isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellOff className="mr-2 h-4 w-4" />}
                    Desativar
                  </Button>
                </>
              ) : permission === "denied" ? (
                 <Button variant="secondary" size="sm" disabled>
                   Bloqueado pelo Navegador
                 </Button>
              ) : permission === "granted" ? (
                <Button onClick={handleActivate} disabled={isRegistering}>
                  {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Concluir Ativação
                </Button>
              ) : (
                <Button onClick={handleActivate} disabled={isRegistering}>
                  {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ativar Notificações
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Preferências */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Eventos</CardTitle>
          <CardDescription>
            Escolha quais tipos de eventos devem disparar notificações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingPreferences ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="new-appointments" className="font-medium">
                    Novos Agendamentos
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    Receber aviso quando um cliente agendar um serviço.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {updating.notifyNewAppointments && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  <Switch
                    id="new-appointments"
                    checked={preferences.notifyNewAppointments}
                    onCheckedChange={() => handleToggle("notifyNewAppointments")}
                    disabled={updating.notifyNewAppointments}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="cancellations" className="font-medium">
                    Cancelamentos
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    Ser notificado se um cliente cancelar um horário.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {updating.notifyCancellations && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  <Switch
                    id="cancellations"
                    checked={preferences.notifyCancellations}
                    onCheckedChange={() => handleToggle("notifyCancellations")}
                    disabled={updating.notifyCancellations}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="inventory-alerts" className="font-medium">
                    Alerta de Estoque
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    Avisar quando um produto atingir a quantidade mínima.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {updating.notifyInventoryAlerts && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  <Switch
                    id="inventory-alerts"
                    checked={preferences.notifyInventoryAlerts}
                    onCheckedChange={() => handleToggle("notifyInventoryAlerts")}
                    disabled={updating.notifyInventoryAlerts}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
