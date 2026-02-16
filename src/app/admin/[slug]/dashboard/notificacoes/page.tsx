import { PushNotificationSettings } from "@/components/admin/push-notification-settings";

export default function NotificacoesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Notificações
        </h2>
        <p className="text-muted-foreground">
          Gerencie suas preferências de notificação push e alertas.
        </p>
      </div>
      <PushNotificationSettings />
    </div>
  );
}
