import { ManagementReports } from "@/components/admin/management-reports";

export default function GerenciamentoPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Gerenciamento
        </h2>
        <p className="text-muted-foreground">
          Gere relatórios e análises detalhadas
        </p>
      </div>
      <ManagementReports />
    </div>
  );
}
