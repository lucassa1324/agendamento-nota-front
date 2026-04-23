"use client";

import { AdminMonthlyCalendar } from "@/components/admin/admin-monthly-calendar";
import { EmployeeAgendaView } from "@/components/admin/employee-agenda-view";
import { TutorialContextualLink } from "@/components/admin/tutorial-reminder";
import { useSession } from "@/lib/auth-client";

export default function AgendaPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role?.toLowerCase();
  const isStaffUser = role === "user";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
            {isStaffUser ? "Minha Agenda" : "Agenda Mensal"}
          </h2>
          <p className="text-muted-foreground">
            {isStaffUser
              ? "Acompanhe seu próximo cliente e assuma oportunidades compatíveis com suas skills."
              : "Visualize todos os agendamentos do negócio em um calendário mensal"}
          </p>
        </div>
        <TutorialContextualLink />
      </div>
      {isStaffUser ? <EmployeeAgendaView /> : <AdminMonthlyCalendar />}
    </div>
  );
}
