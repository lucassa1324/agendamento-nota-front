import { AlertCircle, ArrowDownCircle, ArrowUpCircle, History, Pencil, Trash2 } from "lucide-react";
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
  setTransactionItem: (data: { item: InventoryItem; type: "entrada" | "saida" }) => void;
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
  return (
    <div className="overflow-x-auto w-full max-w-full">
      <Table className="w-full min-w-full">
        <TableHeader>
          <TableRow className="text-[10px] sm:text-xs">
            <TableHead className="px-2 sm:px-4">Produto</TableHead>
            <TableHead className="hidden xl:table-cell">Quantidade</TableHead>
            <TableHead className="hidden 2xl:table-cell">Unidade</TableHead>
            <TableHead className="px-2 sm:px-4">Valor Unit.</TableHead>
            <TableHead className="hidden 2xl:table-cell">Status</TableHead>
            <TableHead className="hidden 2xl:table-cell">Última Atualização</TableHead>
            <TableHead className="text-right px-2 sm:px-4">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="text-[10px] sm:text-sm">
              <TableCell className="font-medium py-2 sm:py-4 px-2 sm:px-4">
                <div className="flex flex-col min-w-0">
                  <span className="truncate max-w-20 xs:max-w-[120px] sm:max-w-37.5 md:max-w-45 lg:max-w-55 xl:max-w-75 2xl:max-w-none">{item.name}</span>
                  <div className="flex items-center gap-1 mt-0.5 xl:hidden">
                    <span className={cn(
                      "text-[9px] sm:text-xs",
                      item.quantity <= item.minQuantity ? "text-red-600 font-bold" : "text-muted-foreground"
                    )}>
                      {item.quantity.toLocaleString("pt-BR")} {item.unit}
                    </span>
                    {item.quantity <= item.minQuantity && (
                      <Badge variant="outline" className="h-3 px-1 text-[6px] sm:text-[8px] bg-red-50 text-red-700 border-red-200">
                        Baixo
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <span
                  className={
                    item.quantity <= item.minQuantity
                      ? "text-red-600 font-semibold"
                      : ""
                  }
                >
                  {item.quantity.toLocaleString("pt-BR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 3,
                  })}
                </span>
              </TableCell>
              <TableCell className="hidden 2xl:table-cell">{item.unit}</TableCell>
              <TableCell className="px-2 sm:px-4 whitespace-nowrap">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.price)}
              </TableCell>
              <TableCell className="hidden 2xl:table-cell">
                {item.quantity > item.minQuantity ? (
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
                {new Date(item.lastUpdate).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell className="text-right px-2 sm:px-4">
                <div className="flex justify-end gap-1 sm:gap-1.5">
                  {/* Botões simplificados para mobile/telas pequenas */}
                  <div className="flex xl:hidden">
                    <Select onValueChange={(val) => {
                      if (val === 'edit') setEditingItem(item);
                      if (val === 'entrada') setTransactionItem({ item, type: "entrada" });
                      if (val === 'saida') setTransactionItem({ item, type: "saida" });
                      if (val === 'history') setShowHistory(item);
                      if (val === 'delete') handleDeleteItem(item.id);
                    }}>
                      <SelectTrigger className="h-7 w-7 p-0 border-none bg-transparent focus:ring-0">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="edit" className="text-[10px]">Editar</SelectItem>
                        <SelectItem value="entrada" className="text-[10px]">Entrada</SelectItem>
                        <SelectItem value="saida" className="text-[10px]">Saída</SelectItem>
                        <SelectItem value="history" className="text-[10px]">Histórico</SelectItem>
                        <SelectItem value="delete" className="text-[10px] text-red-600">Excluir</SelectItem>
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
                      onClick={() => setTransactionItem({ item, type: "entrada" })}
                      title="Entrada"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span className="hidden 2xl:inline ml-1">Entrada</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setTransactionItem({ item, type: "saida" })}
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
