import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InventoryItem } from "@/lib/booking-data";

interface InventoryTransactionModalProps {
  transactionItem: { item: InventoryItem; type: "entrada" | "saida" } | null;
  setTransactionItem: (item: { item: InventoryItem; type: "entrada" | "saida" } | null) => void;
  transactionQuantity: string;
  setTransactionQuantity: (value: string) => void;
  transactionPrice: string;
  setTransactionPrice: (value: string) => void;
  transactionUnit: "primary" | "secondary";
  setTransactionUnit: (value: "primary" | "secondary") => void;
  handleTransaction: () => void;
}

export function InventoryTransactionModal({
  transactionItem,
  setTransactionItem,
  transactionQuantity,
  setTransactionQuantity,
  transactionPrice,
  setTransactionPrice,
  transactionUnit,
  setTransactionUnit,
  handleTransaction,
}: InventoryTransactionModalProps) {
  return (
    <Dialog
      open={!!transactionItem}
      onOpenChange={(open) => !open && setTransactionItem(null)}
    >
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {transactionItem?.type === "entrada" ? "Entrada de Estoque" : "Saída de Estoque"}
          </DialogTitle>
          <DialogDescription>
            {transactionItem?.item.name} ({transactionItem?.item.quantity}{" "}
            {transactionItem?.item.unit} atuais)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="transaction-qty" className="text-right">
              Quantidade
            </Label>
            <Input
              id="transaction-qty"
              type="number"
              step="0.001"
              className="col-span-3"
              value={transactionQuantity}
              onChange={(e) => setTransactionQuantity(e.target.value)}
              autoFocus
              onFocus={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>
          {transactionItem?.type === "entrada" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transaction-price" className="text-right">
                Novo Preço (R$)
              </Label>
              <Input
                id="transaction-price"
                type="number"
                step="0.01"
                className="col-span-3"
                value={transactionPrice}
                onChange={(e) => setTransactionPrice(e.target.value)}
                onFocus={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
          )}
          {transactionItem?.item.secondaryUnit && transactionItem?.item.conversionFactor && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transaction-unit" className="text-right">
                Unidade
              </Label>
              <Select
                value={transactionUnit}
                onValueChange={(value: "primary" | "secondary") => setTransactionUnit(value)}
              >
                <SelectTrigger id="transaction-unit" className="col-span-3">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">
                    {transactionItem.item.unit} (Principal)
                  </SelectItem>
                  <SelectItem value="secondary">
                    {transactionItem.item.secondaryUnit} (Secundária - 1 {transactionItem.item.unit} = {transactionItem.item.conversionFactor}{transactionItem.item.secondaryUnit})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setTransactionItem(null)}>
            Cancelar
          </Button>
          <Button
            onClick={handleTransaction}
            className={
              transactionItem?.type === "entrada"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            Confirmar {transactionItem?.type === "entrada" ? "Entrada" : "Saída"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
