import { AdminBookingFlow } from "@/components/admin/admin-booking-flow";

export default function CalendarioPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Novo Agendamento
        </h2>
        <p className="text-muted-foreground">
          Crie um agendamento manualmente na agenda
        </p>
      </div>
      <AdminBookingFlow />
    </div>
  );
}
