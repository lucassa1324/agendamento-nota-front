import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function BookingEmptyState() {
  return (
    <Card className="rounded-3xl border-0 bg-linear-to-br from-muted/40 to-white shadow-sm ring-1 ring-border/40">
      <CardContent className="p-12 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="font-semibold text-foreground">
          Nenhum agendamento encontrado com os filtros aplicados
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajuste o período ou os filtros de cliente para ampliar os resultados.
        </p>
      </CardContent>
    </Card>
  );
}
