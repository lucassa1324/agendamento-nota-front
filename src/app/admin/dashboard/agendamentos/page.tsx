import { BookingsManager } from "@/components/admin/bookings-manager";

export default function AgendamentosPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Agendamentos
        </h2>
        <p className="text-muted-foreground">
          Gerencie todos os agendamentos do studio
        </p>
      </div>
      <BookingsManager />
    </div>
  );
}
