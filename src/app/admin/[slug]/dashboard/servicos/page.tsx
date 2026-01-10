import { ServicesManager } from "@/components/admin/services-manager";

export default function ServicosPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Serviços
        </h2>
        <p className="text-muted-foreground">
          Configure os serviços oferecidos
        </p>
      </div>
      <ServicesManager />
    </div>
  );
}
