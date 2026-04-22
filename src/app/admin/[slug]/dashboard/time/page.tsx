import { UsersRound } from "lucide-react";
import { DashboardPageShell } from "@/components/admin/dashboard-page-shell";
import { TeamRbacManager } from "@/components/admin/team-rbac-manager";

export default function TimePage() {
  return (
    <DashboardPageShell
      title="Time e Permissões"
      subtitle="Cadastre colaboradores e configure perfis híbridos com segurança"
      icon={UsersRound}
      badge="RBAC"
    >
      <TeamRbacManager />
    </DashboardPageShell>
  );
}
