import { IntegrationsManager } from "@/components/admin/integrations-manager";

export default function IntegracoesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Integrações
        </h2>
        <p className="text-muted-foreground">
          Configure integrações com Google Calendar e outros serviços
        </p>
      </div>
      <IntegrationsManager />
    </div>
  );
}
