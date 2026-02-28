import { AdminMonthlyCalendar } from "@/components/admin/admin-monthly-calendar";

export default function AgendaPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Agenda Mensal
        </h2>
        <p className="text-muted-foreground">
          Visualize todos os agendamentos do studio em um calendário mensal
        </p>
      </div>
      <AdminMonthlyCalendar />
    </div>
  );
}
