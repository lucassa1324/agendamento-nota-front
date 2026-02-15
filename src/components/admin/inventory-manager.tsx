"use client";

import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  HelpCircle,
  History,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";
import type { InventoryItem, InventoryLog } from "@/lib/inventory-service";
import { inventoryService } from "@/lib/inventory-service";
import { cn } from "@/lib/utils";
import { InventoryAddForm } from "./inventory/inventory-add-form";

export function InventoryManager() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const { studio, isLoading: isStudioLoading } = useStudio();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<InventoryItem | null>(null);
  const [historyLogs, setHistoryLogs] = useState<InventoryLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  // Interface para tipagem segura da sessão
  interface SessionUser {
    businessId?: string;
    business?: { id: string };
  }

  // Origem do ID: Consome do StudioContext (preferencial) ou da sessão
  const user = session?.user as SessionUser | undefined;
  const companyId = studio?.id || user?.businessId || user?.business?.id;

  const fetchInventory = useCallback(async () => {
    if (!companyId) return;

    console.log(">>> [INVENTORY] Buscando itens para ID:", companyId);
    setIsLoadingItems(true);
    try {
      const data = await inventoryService.list(companyId);
      console.log(">>> [INVENTORY] Dados recebidos do Back-end:", data);
      setInventory(data);
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
      // Limpa a lista em caso de erro 500 ou outros erros de busca para evitar dados inconsistentes
      setInventory([]);
    } finally {
      setIsLoadingItems(false);
    }
  }, [companyId]); // Removido toast da dependência para evitar disparos indesejados no init

  useEffect(() => {
    if (companyId) {
      fetchInventory();
    }
  }, [companyId, fetchInventory]);

  useEffect(() => {
    if (showHistory) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const logs = await inventoryService.getLogs(showHistory.id);
          // Ordenar logs por data decrescente (caso não venha ordenado)
          const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setHistoryLogs(sortedLogs);
        } catch (error) {
          console.error("Erro ao buscar histórico:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar o histórico.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    } else {
      setHistoryLogs([]);
    }
  }, [showHistory, toast]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "status">("name");
  const [editingItem, setEditingItem] = useState<
    (Omit<InventoryItem, "quantity"> & { quantity: string | number }) | null
  >(null);
  const [transactionItem, setTransactionItem] = useState<{
    item: InventoryItem;
    type: "entrada" | "saida";
  } | null>(null);
  const [transactionQuantity, setTransactionQuantity] = useState<string>("1");
  const [transactionPrice, setTransactionPrice] = useState<string>("");
  const [transactionUnit, setTransactionUnit] = useState<
    "primary" | "secondary"
  >("primary");

  useEffect(() => {
    if (transactionItem) {
      setTransactionUnit("primary");
      const itemPrice = transactionItem.item.price ?? transactionItem.item.unitPrice ?? 0;
      setTransactionPrice(itemPrice.toString());
    }
  }, [transactionItem]);

  const [newItem, setNewItem] = useState<{
    name: string;
    quantity: string;
    minQuantity: string;
    unit: string;
    price: string;
    secondaryUnit?: string;
    conversionFactor?: string;
  }>({
    name: "",
    quantity: "",
    minQuantity: "",
    unit: "un",
    price: "",
    secondaryUnit: "",
    conversionFactor: "",
  });

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome, quantidade e preço.",
        variant: "destructive",
      });
      return;
    }

    if (!companyId) {
      toast({
        title: "Erro de identificação",
        description:
          "Não foi possível identificar sua empresa. Tente recarregar a página.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const rawPayload = {
        companyId,
        name: newItem.name,
        initialQuantity: Number(newItem.quantity),
        minQuantity: Number(newItem.minQuantity) || 0,
        unitPrice: parseFloat(
          newItem.price.toString().replace(",", "."),
        ).toFixed(2),
        unit: newItem.unit,
        secondaryUnit: newItem.secondaryUnit || undefined,
        conversionFactor: newItem.conversionFactor
          ? Number(newItem.conversionFactor)
          : undefined,
      };

      // Limpeza estrita: Remove campos undefined ou strings vazias
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(
          ([_, v]) => v !== undefined && v !== "",
        ),
      );

      console.log(
        ">>> [INVENTORY] Payload simplificado sendo enviado:",
        payload,
      );

      await inventoryService.create(payload);

      toast({
        title: "Produto adicionado",
        description: `${newItem.name} foi adicionado ao estoque.`,
      });

      setNewItem({
        name: "",
        quantity: "",
        minQuantity: "",
        unit: "un",
        price: "",
        secondaryUnit: "",
        conversionFactor: "",
      });
      setShowAddForm(false);
      fetchInventory(); // Atualiza a lista
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao tentar salvar o produto.";
      toast({
        title: "Erro ao adicionar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    if (
      !editingItem.name ||
      Number(editingItem.quantity) < 0 ||
      (Number(editingItem.price) < 0 && Number(editingItem.unitPrice || 0) < 0)
    ) {
      toast({
        title: "Campos inválidos",
        description:
          "Por favor, preencha o nome, quantidade e preço corretamente.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const rawPayload = {
        name: editingItem.name,
        currentQuantity: Number(editingItem.quantity),
        minQuantity: Number(editingItem.minQuantity) || 0,
        unitPrice: parseFloat(
          (editingItem.price || editingItem.unitPrice || 0)
            .toString()
            .replace(",", "."),
        ).toFixed(2),
        unit: editingItem.unit,
        secondaryUnit: editingItem.secondaryUnit || null,
        conversionFactor: editingItem.conversionFactor
          ? Number(editingItem.conversionFactor)
          : null,
      };

      // Limpeza estrita: Remove campos undefined ou strings vazias (exceto nulls intencionais)
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(
          ([_, v]) => v !== undefined && v !== "",
        ),
      );

      await inventoryService.update(editingItem.id, payload);

      await fetchInventory(); // Busca dados frescos do banco
      setEditingItem(null); // Fecha o modal APÓS o fetch

      toast({
        title: "Produto atualizado",
        description: `${editingItem.name} foi atualizado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao tentar atualizar o produto.";
      toast({
        title: "Erro ao atualizar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTransaction = async () => {
    if (!transactionItem) return;

    if (!companyId || companyId === 'N/A') {
        toast({
            title: "Erro de identificação",
            description: "ID da empresa não identificado. Tente recarregar a página.",
            variant: "destructive",
        });
        return;
    }

    let qty = Number(transactionQuantity);
    if (Number.isNaN(qty) || qty <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "Por favor, insira uma quantidade válida.",
        variant: "destructive",
      });
      return;
    }

    const itemToUpdate = transactionItem.item;

    if (transactionUnit === "secondary" && itemToUpdate.conversionFactor) {
      qty = qty / itemToUpdate.conversionFactor;
    }

    setIsSaving(true);
    try {
      const isEntrada = transactionItem.type === "entrada";
      const newPrice =
        isEntrada && transactionPrice
          ? Number(transactionPrice)
          : undefined;

      // Chama a nova rota de transação
      await inventoryService.createTransaction({
          productId: itemToUpdate.id,
          type: isEntrada ? "ENTRY" : "EXIT",
          quantity: qty,
          reason: `Movimentação manual (${
            transactionUnit === "primary"
              ? itemToUpdate.unit
              : itemToUpdate.secondaryUnit || itemToUpdate.unit
          })${isEntrada && newPrice ? ` - Preço atualizado` : ""}`,
          companyId: companyId
      });

      // Se o preço mudou, fazemos um update no item também (operação separada por enquanto)
      if (isEntrada && newPrice) {
        const priceValue = typeof newPrice === 'string'
          ? parseFloat((newPrice as string).replace(',', '.'))
          : newPrice;
          
        await inventoryService.update(itemToUpdate.id, {
          unitPrice: Number(Number(priceValue || 0).toFixed(2)),
        });
      }

      await fetchInventory();

      // Show success state briefly before closing
      setIsSuccess(true);
      toast({
        title:
          transactionItem.type === "entrada"
            ? "Entrada realizada"
            : "Saída realizada",
        description: `${(Number(transactionQuantity) || 0).toLocaleString("pt-BR")} ${
          transactionUnit === "primary"
            ? itemToUpdate.unit
            : itemToUpdate.secondaryUnit || itemToUpdate.unit
        } de ${itemToUpdate.name} ${
          transactionItem.type === "entrada" ? "adicionados" : "removidos"
        }.`,
      });

      // Wait a bit to show the success state
      setTimeout(() => {
        setTransactionItem(null);
        setTransactionQuantity("1");
        setTransactionPrice("");
        setIsSuccess(false);
        setIsSaving(false);
      }, 1000);
    } catch (error: unknown) {
      console.error("Erro na movimentação:", error);
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { error?: string } } })?.response?.data
              ?.error || "Não foi possível registrar a movimentação no servidor.";
      toast({
        title: "Erro na movimentação",
        description: message,
        variant: "destructive",
      });
      setIsSaving(false); // Reset loading state on error
    } finally {
      if (!isSuccess) { // Only reset if not success (success resets in timeout)
         setIsSaving(false);
      }
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await inventoryService.delete(itemToDelete.id);

      toast({
        title: "Produto removido",
        description: `${itemToDelete.name} foi removido com sucesso.`,
      });

      setItemToDelete(null);
      fetchInventory(); // Atualiza a lista automaticamente
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao tentar excluir o produto.";
      toast({
        title: "Erro ao excluir",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAndSortedInventory = useMemo(() => {
    return inventory
      .filter((item) =>
        item?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        if (sortBy === "name") {
          return (a?.name || "").localeCompare(b?.name || "");
        }
        if (sortBy === "price") {
          return (a?.price || 0) - (b?.price || 0);
        }
        if (sortBy === "status") {
          const aQty = Number(a?.quantity || a?.currentQuantity || 0);
          const aMin = Number(a?.minQuantity || 0);
          const bQty = Number(b?.quantity || b?.currentQuantity || 0);
          const bMin = Number(b?.minQuantity || 0);
          const aStatus = aQty <= aMin ? 0 : 1;
          const bStatus = bQty <= bMin ? 0 : 1;
          return aStatus - bStatus;
        }
        return 0;
      });
  }, [inventory, searchTerm, sortBy]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => {
      if (!item) return false;
      const quantity = Number(item.quantity || item?.currentQuantity || 0);
      const minQuantity = Number(item.minQuantity || 0);
      const factor = Number(item.conversionFactor || 1);

      // Se houver fator de conversão, comparamos a quantidade total em unidades de consumo
      const effectiveQuantity = quantity * factor;
      return effectiveQuantity <= minQuantity;
    });
  }, [inventory]);

  if (isStudioLoading || (isLoadingItems && inventory.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Carregando estoque...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6 w-full max-w-full px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 w-full px-2 sm:px-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-xs sm:text-lg font-semibold truncate">
            Produtos em Estoque
          </h3>
          <p className="text-[9px] sm:text-sm text-muted-foreground wrap-break-word line-clamp-1 sm:line-clamp-none">
            Controle de entrada e saída de produtos
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto shrink-0 h-7 sm:h-9 text-[10px] sm:text-sm px-2 sm:px-3 mt-0.5 sm:mt-0"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Adicionar Produto
        </Button>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50/50 w-full border-x-0 sm:border-x">
          <CardContent className="pt-4 pb-4 px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
              <div className="p-1.5 bg-red-100 rounded-full text-red-600 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 w-full">
                <h4 className="text-[11px] sm:text-sm font-bold text-red-800 mb-1">
                  Atenção: {lowStockItems.length}{" "}
                  {lowStockItems.length === 1
                    ? "item precisa"
                    : "itens precisam"}{" "}
                  de reposição
                </h4>
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-1.5">
                  {lowStockItems.map((item) => (
                    <Badge
                      key={item.id}
                      variant="outline"
                      className="bg-white text-red-700 border-red-200 text-[9px] py-0 px-1.5"
                    >
                      {item.name}:{" "}
                      {Number(
                        item.quantity || item?.currentQuantity || 0,
                      ).toLocaleString("pt-BR")}{" "}
                      {item.unit}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <InventoryAddForm
          newItem={newItem}
          setNewItem={setNewItem}
          handleAddItem={handleAddItem}
          setShowAddForm={setShowAddForm}
          isLoading={isSaving}
        />
      )}

      <Card className="w-full border-x-0 sm:border-x">
        <CardHeader className="pb-3 px-2 sm:px-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 sm:gap-4">
            <CardTitle className="flex items-center gap-2 text-[10px] sm:text-base md:text-lg">
              <Package className="w-3 h-3 sm:w-5 sm:h-5" />
              Inventário
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-7 w-full h-7 text-[10px] sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={sortBy}
                onValueChange={(value: "name" | "price" | "status") =>
                  setSortBy(value)
                }
              >
                <SelectTrigger className="w-full sm:w-48 h-7 text-[10px] sm:text-sm">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name" className="text-[10px] sm:text-sm">
                    Nome
                  </SelectItem>
                  <SelectItem value="price" className="text-[10px] sm:text-sm">
                    Preço
                  </SelectItem>
                  <SelectItem value="status" className="text-[10px] sm:text-sm">
                    Status
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto w-full max-w-full">
            <Table className="w-full min-w-full">
              <TableHeader>
                <TableRow className="text-[10px] sm:text-xs">
                  <TableHead className="px-2 sm:px-4">Produto</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Quantidade
                  </TableHead>
                  <TableHead className="hidden 2xl:table-cell">
                    Unidade
                  </TableHead>
                  <TableHead className="px-2 sm:px-4">Valor Unit.</TableHead>
                  <TableHead className="hidden 2xl:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="hidden 2xl:table-cell">
                    Última Atualização
                  </TableHead>
                  <TableHead className="text-right px-2 sm:px-4">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedInventory.map((item) => (
                  <TableRow key={item.id} className="text-[10px] sm:text-sm">
                    <TableCell className="font-medium py-2 sm:py-4 px-2 sm:px-4">
                      <div className="flex flex-col min-w-0">
                        <span className="truncate max-w-20 xs:max-w-[120px] sm:max-w-37.5 md:max-w-45 lg:max-w-55 xl:max-w-75 2xl:max-w-none">
                          {item?.name}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5 xl:hidden">
                          <span
                            className={cn(
                              "text-[9px] sm:text-xs",
                              Number(
                                item?.quantity || item?.currentQuantity || 0,
                              ) *
                                (item?.conversionFactor || 1) <=
                                Number(item?.minQuantity || 0)
                                ? "text-red-600 font-bold"
                                : "text-muted-foreground",
                            )}
                          >
                            {Number(
                              item?.quantity || item?.currentQuantity || 0,
                            ).toLocaleString("pt-BR")}{" "}
                            {item?.unit}
                            {Number(item?.conversionFactor || 1) > 1 &&
                              item?.secondaryUnit && (
                                <span className="text-muted-foreground ml-1">
                                  (
                                  {(
                                    Number(
                                      item?.quantity ||
                                        item?.currentQuantity ||
                                        0,
                                    ) * Number(item?.conversionFactor || 1)
                                  ).toLocaleString("pt-BR")}{" "}
                                  {item?.secondaryUnit})
                                </span>
                              )}
                          </span>
                          {Number(
                            item?.quantity || item?.currentQuantity || 0,
                          ) *
                            (item?.conversionFactor || 1) <=
                            Number(item?.minQuantity || 0) && (
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
                      <span
                        className={
                          Number(
                            item?.quantity || item?.currentQuantity || 0,
                          ) *
                            (item?.conversionFactor || 1) <=
                          Number(item?.minQuantity || 0)
                            ? "text-red-600 font-semibold"
                            : ""
                        }
                      >
                        {(() => {
                           const qty = Number(item?.quantity || item?.currentQuantity || 0);
                           const factor = Number(item?.conversionFactor || 1);
                           const formattedQty = qty.toLocaleString("pt-BR", {
                             minimumFractionDigits: 0,
                             maximumFractionDigits: 3,
                           });
                           
                           if (factor > 1 && item?.secondaryUnit) {
                             const totalSecondary = qty * factor;
                             const formattedSecondary = Number.isInteger(totalSecondary)
                               ? totalSecondary.toString()
                               : totalSecondary.toFixed(2).replace('.', ',');
                             return `${formattedQty} ${item.unit} (${formattedSecondary} ${item.secondaryUnit})`;
                           }
                           
                           return formattedQty;
                        })()}
                      </span>
                    </TableCell>
                    <TableCell className="hidden 2xl:table-cell">
                      {item?.unit}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 whitespace-nowrap">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(item?.price || item?.unitPrice || 0)}
                    </TableCell>
                    <TableCell className="hidden 2xl:table-cell">
                      {Number(item?.quantity || item?.currentQuantity || 0) *
                        (item?.conversionFactor || 1) >
                      Number(item?.minQuantity || 0) ? (
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
                      {item?.lastUpdate
                        ? new Date(item.lastUpdate).toLocaleDateString("pt-BR")
                        : "---"}
                    </TableCell>
                    <TableCell className="text-right px-2 sm:px-4">
                      <div className="flex justify-end gap-1 sm:gap-1.5">
                        {/* Botões simplificados para mobile/telas pequenas */}
                        <div className="flex xl:hidden">
                          <Select
                            onValueChange={(val) => {
                              if (val === "edit") {
                                setEditingItem({
                                  ...item,
                                  quantity: Number(
                                    item.quantity || item.currentQuantity || 0,
                                  ),
                                });
                              }
                              if (val === "entrada")
                                setTransactionItem({ item, type: "entrada" });
                              if (val === "saida")
                                setTransactionItem({ item, type: "saida" });
                              if (val === "history") setShowHistory(item);
                              if (val === "delete") setItemToDelete(item);
                            }}
                          >
                            <SelectTrigger className="h-7 w-7 p-0 border-none bg-transparent focus:ring-0">
                              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                            </SelectTrigger>
                            <SelectContent align="end">
                              <SelectItem value="edit" className="text-[10px]">
                                Editar
                              </SelectItem>
                              <SelectItem
                                value="entrada"
                                className="text-[10px]"
                              >
                                Entrada
                              </SelectItem>
                              <SelectItem value="saida" className="text-[10px]">
                                Saída
                              </SelectItem>
                              <SelectItem
                                value="history"
                                className="text-[10px]"
                              >
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

                        {/* Botões completos para desktop (ícones apenas na maioria das telas) */}
                        <div className="hidden xl:flex gap-1 sm:gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() =>
                              setEditingItem({
                                ...item,
                                quantity: Number(
                                  item.quantity || item.currentQuantity || 0,
                                ),
                              })
                            }
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                            <span className="hidden 2xl:inline ml-1">
                              Editar
                            </span>
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
                            <span className="hidden 2xl:inline ml-1">
                              Entrada
                            </span>
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
                            <span className="hidden 2xl:inline ml-1">
                              Saída
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={() => setShowHistory(item)}
                            title="Histórico"
                          >
                            <History className="w-4 h-4" />
                            <span className="hidden 2xl:inline ml-1">
                              Histórico
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-destructive"
                            onClick={() => setItemToDelete(item)}
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
        </CardContent>
      </Card>

      <Dialog
        open={!!transactionItem}
        onOpenChange={(open) => !open && setTransactionItem(null)}
      >
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>
              {transactionItem?.type === "entrada"
                ? "Entrada de Estoque"
                : "Saída de Estoque"}
            </DialogTitle>
            <DialogDescription>
              {transactionItem?.item.name} (
              {(() => {
                const item = transactionItem?.item;
                if (!item) return "0";
                const qty = Number(item.quantity || item.currentQuantity || 0);
                const factor = Number(item.conversionFactor || 1);
                
                if (factor > 1 && item.secondaryUnit) {
                  const secondaryQty = qty * factor;
                  const formattedSecondary = Number.isInteger(secondaryQty) 
                    ? secondaryQty.toString() 
                    : secondaryQty.toFixed(2).replace('.', ',');
                  return `${formattedSecondary} ${item.secondaryUnit} / ${qty.toLocaleString("pt-BR")} ${item.unit}`;
                }
                
                return `${qty.toLocaleString("pt-BR")} ${item.unit}`;
              })()} atuais)
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
                onFocus={(e) => e.target.select()}
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
                  onFocus={(e) => e.target.select()}
                />
              </div>
            )}
            {transactionItem?.item.secondaryUnit &&
              transactionItem?.item.conversionFactor && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">
                    Unidade
                  </Label>
                  <div className="col-span-3">
                    <RadioGroup
                      value={transactionUnit}
                      onValueChange={(value: "primary" | "secondary") =>
                        setTransactionUnit(value)
                      }
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="primary" id="unit-primary" />
                        <Label htmlFor="unit-primary" className="cursor-pointer flex-1">
                          {transactionItem.item.unit} (Principal)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="secondary" id="unit-secondary" />
                        <Label htmlFor="unit-secondary" className="cursor-pointer flex-1">
                          {transactionItem.item.secondaryUnit} (Secundária - 1{" "}
                          {transactionItem.item.unit} ={" "}
                          {transactionItem.item.conversionFactor}{" "}
                          {transactionItem.item.secondaryUnit})
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
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
                isSuccess
                  ? "bg-green-600 hover:bg-green-700"
                  : transactionItem?.type === "entrada"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
              disabled={isSaving || isSuccess}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </div>
              ) : isSuccess ? (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Sucesso!
                </div>
              ) : (
                <>
                  Confirmar{" "}
                  {transactionItem?.type === "entrada" ? "Entrada" : "Saída"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                        <p>
                          Insira o nome completo do item (ex: Henna, Pinça,
                          etc).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="edit-name"
                    value={editingItem.name || ""}
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
                    value={
                      editingItem.quantity == null ||
                      Number.isNaN(Number(editingItem.quantity))
                        ? "0"
                        : editingItem.quantity
                    }
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : e.target.value;
                      setEditingItem({
                        ...editingItem,
                        quantity: val,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="edit-min-quantity">
                      Quantidade Mínima{" "}
                      {editingItem.secondaryUnit
                        ? `(${editingItem.secondaryUnit})`
                        : editingItem.unit
                        ? `(${editingItem.unit})`
                        : ""}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          O sistema avisará quando o estoque for igual ou menor
                          que este valor.
                          {editingItem.secondaryUnit && (
                            <>
                              <br />
                              <strong>Dica:</strong> Use a unidade de consumo (
                              {editingItem.secondaryUnit}) para o alerta.
                            </>
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="edit-min-quantity"
                    type="number"
                    step="0.001"
                    value={
                      editingItem.minQuantity == null ||
                      Number.isNaN(Number(editingItem.minQuantity))
                        ? "0"
                        : editingItem.minQuantity
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === ""
                          ? 0
                          : Number.parseFloat(e.target.value);
                      setEditingItem({
                        ...editingItem,
                        minQuantity: val,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="edit-price">Valor Unitário (R$)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Preço de custo ou venda por unidade do produto.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={
                      (editingItem.price ?? editingItem.unitPrice) == null ||
                      Number.isNaN(Number(editingItem.price ?? editingItem.unitPrice))
                        ? "0"
                        : editingItem.price ?? editingItem.unitPrice
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === ""
                          ? 0
                          : Number.parseFloat(e.target.value);
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
                        <p>
                          Forma de medida do produto (unidade, quilo, litro,
                          etc).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    value={editingItem.unit || "un"}
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
                    <Label htmlFor="edit-secondary-unit">
                      Unidade Secundária (Consumo)
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Unidade menor usada para consumo (ex: se o produto é
                          pacote, a secundária é gramas).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    value={editingItem.secondaryUnit || ""}
                    onValueChange={(value) =>
                      setEditingItem({
                        ...editingItem,
                        secondaryUnit: value || undefined,
                      })
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
                    <Label htmlFor="edit-conversion-factor">
                      Fator de Conversão
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Quantas unidades secundárias tem em uma unidade
                          principal? (Ex: 1 pacote tem 500g, fator = 500).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="edit-conversion-factor"
                    type="number"
                    step="0.001"
                    placeholder="Ex: 500"
                    value={
                      editingItem.conversionFactor == null ||
                      Number.isNaN(Number(editingItem.conversionFactor))
                        ? ""
                        : editingItem.conversionFactor
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value);
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
            <Button
              variant="outline"
              onClick={() => setEditingItem(null)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateItem} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!showHistory}
        onOpenChange={(open) => !open && setShowHistory(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico de Movimentação</DialogTitle>
            <DialogDescription>
              {showHistory?.name} -{" "}
              {Number(
                showHistory?.quantity || showHistory?.currentQuantity || 0,
              ).toLocaleString("pt-BR")}{" "}
              {showHistory?.unit} em estoque
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground mt-2">Carregando histórico...</p>
              </div>
            ) : !historyLogs || historyLogs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma movimentação registrada.
              </p>
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
                    {historyLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-[10px] leading-tight">
                          {log.timestamp
                            ? new Date(log.timestamp).toLocaleString("pt-BR")
                            : "---"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1 py-0 h-5",
                              (log.type === "entrada" || log.type === "ENTRY")
                                ? "bg-green-50 text-green-700 border-green-200"
                                : (log.type === "saida" || log.type === "EXIT" ||
                                    log.type === "servico" ||
                                    log.type === "venda")
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200",
                            )}
                          >
                            {log.type === "ENTRY" ? "Entrada" : 
                             log.type === "EXIT" ? "Saída" :
                             log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "font-medium text-xs",
                            (log.quantityChange || 0) > 0
                              ? "text-green-600"
                              : "text-red-600",
                          )}
                        >
                          {(log.quantityChange || 0) > 0 ? "+" : ""}
                          {(log.quantityChange || 0).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {(log.newQuantity || 0).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell
                          className="text-[11px] max-w-50 truncate"
                          title={log.notes || log.reason}
                        >
                          {log.notes || log.reason || "-"}
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

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && !isDeleting && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto{" "}
              <span className="font-bold text-foreground">
                {itemToDelete?.name}
              </span>
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteItem();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir Produto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
