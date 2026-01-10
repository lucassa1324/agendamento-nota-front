import { ScheduleManager } from "@/components/admin/schedule-manager";

export default function HorariosPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Horários
        </h2>
        <p className="text-muted-foreground">
          Defina os horários de funcionamento
        </p>
      </div>
      <ScheduleManager />
    </div>
  );
}
