import { NotificationsManager } from "@/components/admin/notifications-manager";

export default function NotificacoesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Notificações
        </h2>
        <p className="text-muted-foreground">
          Configure notificações por email e WhatsApp
        </p>
      </div>
      <NotificationsManager />
    </div>
  );
}
