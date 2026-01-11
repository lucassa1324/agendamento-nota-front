import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { InventoryItem } from "@/lib/booking-data";

interface InventoryLowStockAlertProps {
  lowStockItems: InventoryItem[];
}

export function InventoryLowStockAlert({
  lowStockItems,
}: InventoryLowStockAlertProps) {
  if (lowStockItems.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50/50 w-full border-x-0 sm:border-x">
      <CardContent className="pt-4 pb-4 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
          <div className="p-1.5 bg-red-100 rounded-full text-red-600 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 w-full">
            <h4 className="text-[11px] sm:text-sm font-bold text-red-800 mb-1">
              Atenção: {lowStockItems.length}{" "}
              {lowStockItems.length === 1 ? "item precisa" : "itens precisam"}{" "}
              de reposição
            </h4>
            <div className="flex flex-wrap gap-1 sm:gap-2 mt-1.5">
              {lowStockItems.map((item) => (
                <Badge
                  key={item.id}
                  variant="outline"
                  className="bg-white text-red-700 border-red-200 text-[9px] py-0 px-1.5"
                >
                  {item.name}: {item.quantity.toLocaleString("pt-BR")}{" "}
                  {item.unit}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
