import { Package } from "lucide-react";
import { InventoryManager } from "@/components/admin/inventory-manager";
import { DashboardPageShell } from "@/components/admin/dashboard-page-shell";

export default function EstoquePage() {
  return (
    <DashboardPageShell
      title="Estoque"
      subtitle="Gerencie entrada e saída de produtos com mais clareza visual"
      icon={Package}
      badge="Inventário"
    >
      <InventoryManager />
    </DashboardPageShell>
  );
}
