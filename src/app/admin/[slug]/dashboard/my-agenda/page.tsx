import { EmployeeAgendaView } from "@/components/admin/employee-agenda-view";

export default function MyAgendaPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="mb-2 font-sans text-3xl font-bold text-primary">Minha Agenda</h2>
        <p className="text-muted-foreground">
          Acompanhe seu fluxo de execução em Hoje/Semana e assuma oportunidades.
        </p>
      </div>
      <EmployeeAgendaView />
    </div>
  );
}
