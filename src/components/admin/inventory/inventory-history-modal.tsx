import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InventoryItem } from "@/lib/booking-data";
import { cn } from "@/lib/utils";

interface InventoryHistoryModalProps {
  showHistory: InventoryItem | null;
  setShowHistory: (item: InventoryItem | null) => void;
}

export function InventoryHistoryModal({
  showHistory,
  setShowHistory,
}: InventoryHistoryModalProps) {
  return (
    <Dialog
      open={!!showHistory}
      onOpenChange={(open) => !open && setShowHistory(null)}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Histórico de Movimentação</DialogTitle>
          <DialogDescription>
            {showHistory?.name} - {showHistory?.quantity.toLocaleString("pt-BR")} {showHistory?.unit} em estoque
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {!showHistory?.logs || showHistory.logs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="max-h-100 overflow-y-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-37.5">Data/Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Alteração</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showHistory.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-[10px] leading-tight">
                        {new Date(log.timestamp).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-[10px] px-1 py-0 h-5",
                          log.type === "entrada" ? "bg-green-50 text-green-700 border-green-200" :
                          log.type === "saida" || log.type === "servico" || log.type === "venda" ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-blue-50 text-blue-700 border-blue-200"
                        )}>
                          {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn(
                        "font-medium text-xs",
                        log.quantityChange > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {log.quantityChange > 0 ? "+" : ""}{log.quantityChange.toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {log.newQuantity.toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-[11px] max-w-50 truncate" title={log.notes}>
                        {log.notes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => setShowHistory(null)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
