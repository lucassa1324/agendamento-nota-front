import { AdminBookingFlow } from "@/components/admin/admin-booking-flow";

export default function CalendarioPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Calendário Admin
        </h2>
        <p className="text-muted-foreground">
          Visão detalhada e agendamentos manuais
        </p>
      </div>
      <AdminBookingFlow />
    </div>
  );
}
