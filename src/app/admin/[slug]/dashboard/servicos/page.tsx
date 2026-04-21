import { Settings2 } from "lucide-react";
import { ServicesManager } from "@/components/admin/services-manager";
import { DashboardPageShell } from "@/components/admin/dashboard-page-shell";

export default function ServicosPage() {
  return (
    <DashboardPageShell
      title="Serviços"
      subtitle="Configure os serviços oferecidos com uma experiência mais elegante"
      icon={Settings2}
      badge="Catálogo"
    >
      <ServicesManager />
    </DashboardPageShell>
  );
}
