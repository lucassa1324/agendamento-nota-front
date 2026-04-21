import { DashboardStats } from "@/components/admin/dashboard-stats";
import { TutorialContextualLink } from "@/components/admin/tutorial-reminder";

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div data-tour="overview-title" className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
            Visão Geral
          </h2>
          <p className="text-muted-foreground">
            Acompanhe o desempenho do seu negócio
          </p>
        </div>
        <TutorialContextualLink />
      </div>
      <section aria-label="Indicadores principais">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Indicadores principais
        </h3>
        <DashboardStats />
      </section>
    </div>
  );
}
