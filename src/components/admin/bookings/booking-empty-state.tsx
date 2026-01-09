import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function BookingEmptyState() {
  return (
    <Card className="bg-secondary/20 border-dashed">
      <CardContent className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">
          Nenhum agendamento encontrado com os filtros aplicados
        </p>
      </CardContent>
    </Card>
  );
}
