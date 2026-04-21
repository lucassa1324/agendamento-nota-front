import { Settings2 } from "lucide-react";
import { DashboardPageShell } from "@/components/admin/dashboard-page-shell";
import { ManagementReports } from "@/components/admin/management-reports";

export default function GerenciamentoPage() {
  return (
    <DashboardPageShell
      title="Gerenciamento"
      subtitle="Gere relatórios e análises detalhadas com foco em decisões rápidas"
      icon={Settings2}
      badge="Administração"
    >
      <ManagementReports />
    </DashboardPageShell>
  );
}
