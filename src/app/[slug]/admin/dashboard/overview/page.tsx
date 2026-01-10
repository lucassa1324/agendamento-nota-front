import { DashboardStats } from "@/components/admin/dashboard-stats";

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Visão Geral
        </h2>
        <p className="text-muted-foreground">
          Acompanhe o desempenho do seu negócio
        </p>
      </div>
      <DashboardStats />
    </div>
  );
}
