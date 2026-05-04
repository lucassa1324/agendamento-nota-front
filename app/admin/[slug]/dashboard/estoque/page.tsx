import { InventoryManager } from "@/components/admin/inventory-manager";
import { TutorialContextualLink } from "@/components/admin/tutorial-reminder";

export default function EstoquePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
            Estoque
          </h2>
          <p className="text-muted-foreground">
            Gerencie entrada e saída de produtos
          </p>
        </div>
        <TutorialContextualLink />
      </div>
      <InventoryManager />
    </div>
  );
}
