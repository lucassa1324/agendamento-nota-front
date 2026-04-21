import { ScheduleManager } from "@/components/admin/schedule-manager";
import { TutorialContextualLink } from "@/components/admin/tutorial-reminder";

export default function HorariosPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
            Horários
          </h2>
          <p className="text-muted-foreground">
            Defina os horários de funcionamento
          </p>
        </div>
        <TutorialContextualLink />
      </div>
      <ScheduleManager />
    </div>
  );
}
