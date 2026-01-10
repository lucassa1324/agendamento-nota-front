import { InventoryManager } from "@/components/admin/inventory-manager";

export default function EstoquePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Estoque
        </h2>
        <p className="text-muted-foreground">
          Gerencie entrada e saída de produtos
        </p>
      </div>
      <InventoryManager />
    </div>
  );
}
