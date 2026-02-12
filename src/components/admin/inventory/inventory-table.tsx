import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
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

interface InventoryTableProps {
  items: InventoryItem[];
  setEditingItem: (item: InventoryItem) => void;
  setTransactionItem: (data: {
    item: InventoryItem;
    type: "entrada" | "saida";
  }) => void;
  setShowHistory: (item: InventoryItem) => void;
  handleDeleteItem: (id: string) => void;
}

export function InventoryTable({
  items,
  setEditingItem,
  setTransactionItem,
  setShowHistory,
  handleDeleteItem,
}: InventoryTableProps) {
  const formatQuantity = (item: InventoryItem) => {
    const qty = item.quantity || item.currentQuantity || 0;
    const factor = item.conversionFactor || 1;
    
    // Se tiver fator de conversão e unidade secundária, mostra o cálculo
    // Mas se a unidade secundária for "caixa", mantemos a primária como principal
    const isSecondaryBox = item.secondaryUnit?.toLowerCase().includes("caixa") || 
                          item.secondaryUnit?.toLowerCase().includes("cx");

    if (factor > 1 && item.secondaryUnit && !isSecondaryBox) {
      const secondaryQty = qty * factor;
      
      // Se for um número inteiro, mostra sem decimais, senão mostra até 2
      const formattedSecondary = Number.isInteger(secondaryQty) 
        ? secondaryQty.toString() 
        : secondaryQty.toFixed(2).replace('.', ',');

      return (
        <div className="flex flex-col">
          <span className="font-bold text-sm">
            {formattedSecondary} {item.secondaryUnit}
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">
            ({qty.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} {item.unit})
          </span>
        </div>
      );
    }

    return `${qty.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} ${item.unit}`;
  };

  return (
    <div className="overflow-x-auto w-full max-w-full">
      <Table className="w-full min-w-full">
        <TableHeader>
          <TableRow className="text-[10px] sm:text-xs">
            <TableHead className="px-2 sm:px-4">Produto</TableHead>
            <TableHead className="hidden xl:table-cell">Estoque</TableHead>
            <TableHead className="px-2 sm:px-4">Valor Unit.</TableHead>
            <TableHead className="hidden 2xl:table-cell">Status</TableHead>
            <TableHead className="hidden 2xl:table-cell">
              Última Atualização
            </TableHead>
            <TableHead className="text-right px-2 sm:px-4">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="text-[10px] sm:text-sm">
              <TableCell className="font-medium py-2 sm:py-4 px-2 sm:px-4">
                <div className="flex flex-col min-w-0">
                  <span className="truncate max-w-20 xs:max-w-[120px] sm:max-w-37.5 md:max-w-45 lg:max-w-55 xl:max-w-75 2xl:max-w-none">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5 xl:hidden">
                    <div
                      className={cn(
                        "text-[9px] sm:text-xs",
                        (item.quantity || 0) <= (item.minQuantity || 0)
                          ? "text-red-600 font-bold"
                          : "text-muted-foreground",
                      )}
                    >
                      {formatQuantity(item)}
                    </div>
                    {(item.quantity || 0) <= (item.minQuantity || 0) && (
                      <Badge
                        variant="outline"
                        className="h-3 px-1 text-[6px] sm:text-[8px] bg-red-50 text-red-700 border-red-200"
                      >
                        Baixo
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <div
                  className={
                    (item.quantity || 0) <= (item.minQuantity || 0)
                      ? "text-red-600 font-semibold"
                      : ""
                  }
                >
                  {formatQuantity(item)}
                </div>
              </TableCell>
              <TableCell className="px-2 sm:px-4 whitespace-nowrap">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(item.price || item.unitPrice || 0))}
              </TableCell>
              <TableCell className="hidden 2xl:table-cell">
                {(item.quantity || 0) > (item.minQuantity || 0) ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Em estoque
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Baixo
                  </Badge>
                )}
              </TableCell>
              <TableCell className="hidden 2xl:table-cell text-muted-foreground whitespace-nowrap">
                {item.lastUpdate
                  ? new Date(item.lastUpdate).toLocaleDateString("pt-BR")
                  : "---"}
              </TableCell>
              <TableCell className="text-right px-2 sm:px-4">
                <div className="flex justify-end gap-1 sm:gap-1.5">
                  {/* Botões simplificados para mobile/telas pequenas */}
                  <div className="flex xl:hidden">
                    <Select
                      onValueChange={(val) => {
                        if (val === "edit") setEditingItem(item);
                        if (val === "entrada")
                          setTransactionItem({ item, type: "entrada" });
                        if (val === "saida")
                          setTransactionItem({ item, type: "saida" });
                        if (val === "history") setShowHistory(item);
                        if (val === "delete") handleDeleteItem(item.id);
                      }}
                    >
                      <SelectTrigger className="h-7 w-7 p-0 border-none bg-transparent focus:ring-0">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="edit" className="text-[10px]">
                          Editar
                        </SelectItem>
                        <SelectItem value="entrada" className="text-[10px]">
                          Entrada
                        </SelectItem>
                        <SelectItem value="saida" className="text-[10px]">
                          Saída
                        </SelectItem>
                        <SelectItem value="history" className="text-[10px]">
                          Histórico
                        </SelectItem>
                        <SelectItem
                          value="delete"
                          className="text-[10px] text-red-600"
                        >
                          Excluir
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botões completos para desktop */}
                  <div className="hidden xl:flex gap-1 sm:gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => setEditingItem(item)}
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="hidden 2xl:inline ml-1">Editar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() =>
                        setTransactionItem({ item, type: "entrada" })
                      }
                      title="Entrada"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span className="hidden 2xl:inline ml-1">Entrada</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() =>
                        setTransactionItem({ item, type: "saida" })
                      }
                      title="Saída"
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                      <span className="hidden 2xl:inline ml-1">Saída</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      onClick={() => setShowHistory(item)}
                      title="Histórico"
                    >
                      <History className="w-4 h-4" />
                      <span className="hidden 2xl:inline ml-1">Histórico</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
