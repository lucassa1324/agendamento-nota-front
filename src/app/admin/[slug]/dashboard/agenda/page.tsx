import { AdminMonthlyCalendar } from "@/components/admin/admin-monthly-calendar";
import { TutorialContextualLink } from "@/components/admin/tutorial-reminder";

export default function AgendaPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
            Agenda Mensal
          </h2>
          <p className="text-muted-foreground">
            Visualize todos os agendamentos do negócio em um calendário mensal
          </p>
        </div>
        <TutorialContextualLink />
      </div>
      <AdminMonthlyCalendar />
    </div>
  );
}
