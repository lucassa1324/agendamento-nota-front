import { BarChart3 } from "lucide-react";
import { Reports } from "@/components/admin/reports";
import { DashboardPageShell } from "@/components/admin/dashboard-page-shell";

export default function RelatoriosPage() {
  return (
    <DashboardPageShell
      title="Relatórios"
      subtitle="Analise o desempenho do seu negócio com um painel mais moderno"
      icon={BarChart3}
      badge="Insights"
    >
      <Reports />
    </DashboardPageShell>
  );
}
