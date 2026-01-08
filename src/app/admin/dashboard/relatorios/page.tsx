import { Reports } from "@/components/admin/reports";

export default function RelatoriosPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Relatórios
        </h2>
        <p className="text-muted-foreground">
          Analise o desempenho do seu negócio
        </p>
      </div>
      <Reports />
    </div>
  );
}
