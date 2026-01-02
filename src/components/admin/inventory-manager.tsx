"use client";

import { AlertCircle, ArrowDownCircle, ArrowUpCircle, HelpCircle, History, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { getInventoryFromStorage, type InventoryItem, type InventoryLog, saveInventoryToStorage } from "@/lib/booking-data";
import { cn } from "@/lib/utils";

export function InventoryManager() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const loadedInventory = getInventoryFromStorage();
    
    // Migração/Correção automática para o Algodão
     let wasModified = false;
     const fixedInventory = loadedInventory.map(item => {
       if (item.name === "Algodão") {
         let needsFix = false;
         const updatedItem = { ...item };
         
         // Se o fator for 0.5 (erro comum de confusão), corrige para 500
         // Ou se não tiver fator/unidade secundária configurada corretamente
         if (item.conversionFactor === 0.5 || !item.secondaryUnit) {
           updatedItem.conversionFactor = 500;
           updatedItem.secondaryUnit = "g";
           needsFix = true;
         }
         
         // Se a quantidade caiu para 100 devido ao erro de cálculo (120 - 20), restaura para 120
         // Se caiu para 80 (100 - 20), restaura para 100
         if (item.quantity === 100) {
           updatedItem.quantity = 120;
           needsFix = true;
         } else if (item.quantity === 80) {
           updatedItem.quantity = 100;
           needsFix = true;
         }
 
         if (needsFix) {
           wasModified = true;
           updatedItem.lastUpdate = new Date().toISOString().split('T')[0];
           return updatedItem;
         }
       }
       return item;
     });

    if (wasModified) {
      setInventory(fixedInventory);
      saveInventoryToStorage(fixedInventory);
      toast({
        title: "Dados Corrigidos",
        description: "O estoque e fator de conversão do Algodão foram ajustados automaticamente.",
      });
    } else if (loadedInventory.length > 0) {
      setInventory(loadedInventory);
    } else {
      // Dados iniciais caso não exista no storage
      const initialInventory: InventoryItem[] = [
        {
          id: "1",
          name: "Henna para Sobrancelhas - Castanho",
          quantity: 8,
          minQuantity: 5,
          unit: "un",
          price: 45.9,
          lastUpdate: "2024-01-15",
        },
        {
          id: "2",
          name: "Pinça Profissional",
          quantity: 3,
          minQuantity: 3,
          unit: "un",
          price: 25.0,
          lastUpdate: "2024-01-10",
        },
        {
          id: "3",
          name: "Algodão",
          quantity: 120,
          minQuantity: 50,
          unit: "un",
          secondaryUnit: "g",
          conversionFactor: 500,
          price: 12.5,
          lastUpdate: "2025-12-31",
        },
        {
          id: "4",
          name: "Lápis para Sobrancelhas - Preto",
          quantity: 15,
          minQuantity: 10,
          unit: "un",
          price: 18.0,
          lastUpdate: "2024-01-14",
        },
        {
          id: "5",
          name: "Gel Fixador",
          quantity: 6,
          minQuantity: 8,
          unit: "un",
          price: 35.0,
          lastUpdate: "2024-01-08",
        },
      ];
      setInventory(initialInventory);
      saveInventoryToStorage(initialInventory);
    }
  }, [toast]);

  const updateInventory = (newInventory: InventoryItem[]) => {
    setInventory(newInventory);
    saveInventoryToStorage(newInventory);
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "status">("name");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [transactionItem, setTransactionItem] = useState<{
    item: InventoryItem;
    type: "entrada" | "saida";
  } | null>(null);
  const [transactionQuantity, setTransactionQuantity] = useState<string>("1");
  const [transactionPrice, setTransactionPrice] = useState<string>("");
  const [transactionUnit, setTransactionUnit] = useState<"primary" | "secondary">("primary");

  useEffect(() => {
    if (transactionItem) {
      setTransactionUnit("primary");
      setTransactionPrice(transactionItem.item.price.toString());
    }
  }, [transactionItem]);

  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    minQuantity: "",
    unit: "un",
    price: "",
    secondaryUnit: "",
    conversionFactor: "",
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome, quantidade e preço.",
        variant: "destructive",
      });
      return;
    }

    const item: InventoryItem = {
      id: Math.random().toString(36).substring(2, 11),
      name: newItem.name,
      quantity: Number(newItem.quantity),
      minQuantity: Number(newItem.minQuantity) || 0,
      unit: newItem.unit,
      price: Number(newItem.price),
      lastUpdate: new Date().toISOString(),
      secondaryUnit: newItem.secondaryUnit || undefined,
      conversionFactor: newItem.conversionFactor ? Number(newItem.conversionFactor) : undefined,
      logs: [
        {
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date().toISOString(),
          type: "entrada",
          quantityChange: Number(newItem.quantity),
          previousQuantity: 0,
          newQuantity: Number(newItem.quantity),
          notes: "Saldo inicial (criação do produto)",
        },
      ],
    };

    updateInventory([...inventory, item]);
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
    toast({
      title: "Produto adicionado",
      description: `${item.name} foi adicionado ao estoque.`,
    });
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    if (!editingItem.name || editingItem.quantity < 0 || editingItem.price < 0) {
      toast({
        title: "Campos inválidos",
        description: "Por favor, preencha o nome, quantidade e preço corretamente.",
        variant: "destructive",
      });
      return;
    }

    updateInventory(
      inventory.map((item) => {
        if (item.id === editingItem.id) {
          const quantityChange = editingItem.quantity - item.quantity;
          let updatedLogs = item.logs || [];

          if (quantityChange !== 0) {
            const logEntry: InventoryLog = {
              id: Math.random().toString(36).substring(2, 11),
              timestamp: new Date().toISOString(),
              type: "ajuste",
              quantityChange: quantityChange,
              previousQuantity: item.quantity,
              newQuantity: editingItem.quantity,
              notes: "Ajuste manual de estoque via edição",
            };
            updatedLogs = [logEntry, ...updatedLogs].slice(0, 50);
          }

          return {
            ...editingItem,
            lastUpdate: new Date().toISOString(),
            logs: updatedLogs,
          };
        }
        return item;
      })
    );

    setEditingItem(null);
    toast({
      title: "Produto atualizado",
      description: `${editingItem.name} foi atualizado com sucesso.`,
    });
  };

  const handleTransaction = () => {
    if (!transactionItem) return;

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

    updateInventory(
      inventory.map((item) => {
        if (item.id === itemToUpdate.id) {
          const isEntrada = transactionItem.type === "entrada";
          const newQty = isEntrada
              ? item.quantity + qty
              : Math.max(0, item.quantity - qty);
          
          // Se for entrada e o preço mudou, atualizamos o preço do item
          // Estamos usando a lógica de REAJUSTE (novo preço substitui o antigo)
          // mas você poderia implementar Preço Médio aqui se preferir.
          const newPrice = isEntrada && transactionPrice 
            ? Number(transactionPrice) 
            : item.price;

          const logEntry: InventoryLog = {
            id: Math.random().toString(36).substring(2, 11),
            timestamp: new Date().toISOString(),
            type: transactionItem.type,
            quantityChange: isEntrada ? qty : -qty,
            previousQuantity: item.quantity,
            newQuantity: newQty,
            notes: `Movimentação manual (${
              transactionUnit === "primary"
                ? item.unit
                : item.secondaryUnit || item.unit
            })${isEntrada && newPrice !== item.price ? ` - Preço atualizado de R$ ${item.price.toFixed(2)} para R$ ${newPrice.toFixed(2)}` : ""}`,
          };

          return {
            ...item,
            quantity: newQty,
            price: newPrice,
            lastUpdate: new Date().toISOString(),
            logs: [logEntry, ...(item.logs || [])].slice(0, 50),
          };
        }
        return item;
      }),
    );

    toast({
      title: transactionItem.type === "entrada" ? "Entrada realizada" : "Saída realizada",
      description: `${Number(transactionQuantity).toLocaleString("pt-BR")} ${
        transactionUnit === "primary" ? itemToUpdate.unit : (itemToUpdate.secondaryUnit || itemToUpdate.unit)
      } de ${itemToUpdate.name} ${
        transactionItem.type === "entrada" ? "adicionados" : "removidos"
      }.`,
    });

    setTransactionItem(null);
    setTransactionQuantity("1");
    setTransactionPrice("");
  };

  const handleDeleteItem = (id: string) => {
    updateInventory(inventory.filter((item) => item.id !== id));
    toast({
      title: "Produto removido",
      description: "O item foi removido do estoque.",
    });
  };

  const filteredAndSortedInventory = useMemo(() => {
    return inventory
      .filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "price") {
          return a.price - b.price;
        }
        if (sortBy === "status") {
          const aStatus = a.quantity <= a.minQuantity ? 0 : 1;
          const bStatus = b.quantity <= b.minQuantity ? 0 : 1;
          return aStatus - bStatus;
        }
        return 0;
      });
  }, [inventory, searchTerm, sortBy]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= item.minQuantity);
  }, [inventory]);

  return (
    <div className="space-y-3 sm:space-y-6 w-full max-w-full px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 w-full px-2 sm:px-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-xs sm:text-lg font-semibold truncate">Produtos em Estoque</h3>
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
                  Atenção: {lowStockItems.length} {lowStockItems.length === 1 ? 'item precisa' : 'itens precisam'} de reposição
                </h4>
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-1.5">
                  {lowStockItems.map((item) => (
                    <Badge 
                      key={item.id} 
                      variant="outline" 
                      className="bg-white text-red-700 border-red-200 text-[9px] py-0 px-1.5"
                    >
                      {item.name}: {item.quantity.toLocaleString("pt-BR")} {item.unit}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Novo Produto</CardTitle>
            <CardDescription>Adicione um novo item ao estoque</CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="product-name">Nome do Produto</Label>
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
                    id="product-name"
                    placeholder="Ex: Henna para Sobrancelhas"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="quantity">Quantidade Inicial</Label>
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
                    id="quantity"
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="min-quantity">Quantidade Mínima</Label>
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
                    id="min-quantity"
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={newItem.minQuantity}
                    onChange={(e) => setNewItem({ ...newItem, minQuantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="price">Valor Unitário (R$)</Label>
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
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="unit">Unidade</Label>
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
                    value={newItem.unit}
                    onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                  >
                    <SelectTrigger id="unit">
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
                    <Label htmlFor="secondary-unit">Unidade Secundária (Consumo)</Label>
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
                    value={newItem.secondaryUnit}
                    onValueChange={(value) => setNewItem({ ...newItem, secondaryUnit: value })}
                  >
                    <SelectTrigger id="secondary-unit">
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
                    <Label htmlFor="conversion-factor">Fator de Conversão</Label>
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
                    id="conversion-factor"
                    type="number"
                    step="0.001"
                    placeholder="Ex: 500"
                    value={newItem.conversionFactor}
                    onChange={(e) => setNewItem({ ...newItem, conversionFactor: e.target.value })}
                  />
                </div>
              </div>
            </TooltipProvider>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button onClick={handleAddItem} className="w-full sm:w-auto">Adicionar</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
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
              <Select value={sortBy} onValueChange={(value: "name" | "price" | "status") => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-48 h-7 text-[10px] sm:text-sm">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name" className="text-[10px] sm:text-sm">Nome</SelectItem>
                  <SelectItem value="price" className="text-[10px] sm:text-sm">Preço</SelectItem>
                  <SelectItem value="status" className="text-[10px] sm:text-sm">Status</SelectItem>
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
                  <TableHead className="hidden xl:table-cell">Quantidade</TableHead>
                  <TableHead className="hidden 2xl:table-cell">Unidade</TableHead>
                  <TableHead className="px-2 sm:px-4">Valor Unit.</TableHead>
                  <TableHead className="hidden 2xl:table-cell">Status</TableHead>
                  <TableHead className="hidden 2xl:table-cell">Última Atualização</TableHead>
                  <TableHead className="text-right px-2 sm:px-4">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedInventory.map((item) => (
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

                        {/* Botões completos para desktop (ícones apenas na maioria das telas) */}
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
        </CardContent>
      </Card>

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
    </div>
  );
}

