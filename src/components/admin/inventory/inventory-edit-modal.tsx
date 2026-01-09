import { HelpCircle } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { InventoryItem } from "@/lib/booking-data";

interface InventoryEditModalProps {
  editingItem: InventoryItem | null;
  setEditingItem: (item: InventoryItem | null) => void;
  handleUpdateItem: () => void;
}

export function InventoryEditModal({
  editingItem,
  setEditingItem,
  handleUpdateItem,
}: InventoryEditModalProps) {
  return (
    <Dialog
      open={!!editingItem}
      onOpenChange={(open) => !open && setEditingItem(null)}
    >
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>
            Atualize as informações do produto selecionado.
          </DialogDescription>
        </DialogHeader>
        {editingItem && (
          <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="edit-name">Nome do Produto</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Insira o nome completo do item (ex: Henna, Pinça, etc).</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="edit-quantity">Quantidade</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quantidade total que você tem disponível agora.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="edit-quantity"
                  type="number"
                  step="0.001"
                  value={Number.isNaN(editingItem.quantity) ? "" : editingItem.quantity}
                  onChange={(e) => {
                    const val = e.target.value === "" ? Number.NaN : Number.parseFloat(e.target.value);
                    setEditingItem({
                      ...editingItem,
                      quantity: val,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="edit-min-quantity">Quantidade Mínima</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>O sistema avisará quando o estoque for igual ou menor que este valor.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="edit-min-quantity"
                  type="number"
                  step="0.001"
                  value={Number.isNaN(editingItem.minQuantity) ? "" : editingItem.minQuantity}
                  onChange={(e) => {
                    const val = e.target.value === "" ? Number.NaN : Number.parseFloat(e.target.value);
                    setEditingItem({
                      ...editingItem,
                      minQuantity: val,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="edit-price">Preço Unitário (R$)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Valor pago por cada unidade do produto.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={Number.isNaN(editingItem.price) ? "" : editingItem.price}
                  onChange={(e) => {
                    const val = e.target.value === "" ? Number.NaN : Number.parseFloat(e.target.value);
                    setEditingItem({
                      ...editingItem,
                      price: val,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="edit-unit">Unidade</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Forma de medida do produto (unidade, quilo, litro, etc).</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={editingItem.unit}
                  onValueChange={(value) =>
                    setEditingItem({ ...editingItem, unit: value })
                  }
                >
                  <SelectTrigger id="edit-unit">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="g">Grama (g)</SelectItem>
                    <SelectItem value="lt">Litro (lt)</SelectItem>
                    <SelectItem value="ml">Mililitro (ml)</SelectItem>
                    <SelectItem value="pct">Pacote (pct)</SelectItem>
                    <SelectItem value="cx">Caixa (cx)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="edit-secondary-unit">Unidade Secundária (Consumo)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Unidade menor usada para consumo (ex: se o produto é pacote, a secundária é gramas).</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={editingItem.secondaryUnit || ""}
                  onValueChange={(value) =>
                    setEditingItem({ ...editingItem, secondaryUnit: value || undefined })
                  }
                >
                  <SelectTrigger id="edit-secondary-unit">
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="g">Grama (g)</SelectItem>
                    <SelectItem value="lt">Litro (lt)</SelectItem>
                    <SelectItem value="ml">Mililitro (ml)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="edit-conversion-factor">Fator de Conversão</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quantas unidades secundárias tem em uma unidade principal? (Ex: 1 pacote tem 500g, fator = 500).</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="edit-conversion-factor"
                  type="number"
                  step="0.001"
                  placeholder="Ex: 500"
                  value={editingItem.conversionFactor === undefined || Number.isNaN(editingItem.conversionFactor) ? "" : editingItem.conversionFactor}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    setEditingItem({
                      ...editingItem,
                      conversionFactor: val,
                    });
                  }}
                />
              </div>
            </div>
          </TooltipProvider>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingItem(null)}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateItem}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
