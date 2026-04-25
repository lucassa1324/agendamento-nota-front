import { EmployeeAgendaView } from "@/components/admin/employee-agenda-view";

export default function MyAgendaPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="mb-2 font-sans text-3xl font-bold text-primary">Minha Agenda</h2>
        <p className="text-muted-foreground">
          Timeline diária de execução com check-in, conclusão e notas técnicas do atendimento.
        </p>
      </div>
      <EmployeeAgendaView />
    </div>
  );
}
