import { Settings2, UsersRound } from "lucide-react";
import { DashboardPageShell } from "@/components/admin/dashboard-page-shell";
import { ManagementReports } from "@/components/admin/management-reports";
import { TeamRbacManager } from "@/components/admin/team-rbac-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GerenciamentoPage() {
  return (
    <DashboardPageShell
      title="Gerenciamento"
      subtitle="Gerencie relatórios operacionais e permissões do seu time em um só lugar"
      icon={Settings2}
      badge="Administração"
    >
      <Tabs defaultValue="reports" className="space-y-5">
        <TabsList className="h-auto w-full justify-start gap-2 bg-muted/70 p-1.5">
          <TabsTrigger value="reports" className="gap-2 px-4 py-2">
            <Settings2 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2 px-4 py-2">
            <UsersRound className="h-4 w-4" />
            Times e Permissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <ManagementReports />
        </TabsContent>
        <TabsContent value="team">
          <TeamRbacManager />
        </TabsContent>
      </Tabs>
    </DashboardPageShell>
  );
}
