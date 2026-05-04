"use client";

import { DashboardStats } from "@/components/admin/dashboard-stats";
import { TutorialContextualLink } from "@/components/admin/tutorial-reminder";
import { useSession } from "@/lib/auth-client";

export default function OverviewPage() {
  const { data: session } = useSession();
  const isStaffUser = ((session?.user as { role?: string } | undefined)?.role || "")
    .toLowerCase() === "user";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div data-tour="overview-title" className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
            Visão Geral
          </h2>
          <p className="text-muted-foreground">
            {isStaffUser
              ? "Acompanhe seus atendimentos, comissão e produtividade diária."
              : "Acompanhe o desempenho do seu negócio"}
          </p>
        </div>
        {!isStaffUser && <TutorialContextualLink />}
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
