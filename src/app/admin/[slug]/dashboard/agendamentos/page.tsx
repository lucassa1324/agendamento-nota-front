import { Calendar } from "lucide-react";
import { BookingsManager } from "@/components/admin/bookings-manager";
import { DashboardPageShell } from "@/components/admin/dashboard-page-shell";

export default function AgendamentosPage() {
  return (
    <DashboardPageShell
      title="Agendamentos"
      subtitle="Gerencie todos os agendamentos do negócio"
      icon={Calendar}
      badge="Agenda ativa"
    >
      <BookingsManager />
    </DashboardPageShell>
  );
}
