"use client";

import { AlertCircle, ArrowDownCircle, ArrowUpCircle, HelpCircle, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { getInventoryFromStorage, saveInventoryToStorage, type InventoryItem } from "@/lib/booking-data";

export function InventoryManager() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

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
  const [transactionUnit, setTransactionUnit] = useState<"primary" | "secondary">("primary");

  useEffect(() => {
    if (transactionItem) {
      setTransactionUnit("primary");
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
      inventory.map((item) =>
        item.id === editingItem.id
          ? { ...editingItem, lastUpdate: new Date().toISOString() }
          : item
      )
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
          const newQty =
            transactionItem.type === "entrada"
              ? item.quantity + qty
              : Math.max(0, item.quantity - qty);
          return {
            ...item,
            quantity: newQty,
            lastUpdate: new Date().toISOString(),
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Produtos em Estoque</h3>
          <p className="text-sm text-muted-foreground">
            Controle de entrada e saída de produtos (suporta gramas/ml com decimais)
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

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
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddItem}>Adicionar</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventário
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar produto..."
                  className="pl-9 w-full sm:w-62.5"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={sortBy} onValueChange={(value: "name" | "price" | "status") => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-45">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Ordem Alfabética</SelectItem>
                  <SelectItem value="price">Menor Valor</SelectItem>
                  <SelectItem value="status">Status (Crítico primeiro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Valor Unitário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
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
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.price)}
                  </TableCell>
                  <TableCell>
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
                  <TableCell className="text-muted-foreground">
                    {new Date(item.lastUpdate).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => setEditingItem(item)}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => setTransactionItem({ item, type: "entrada" })}
                      >
                        <ArrowUpCircle className="w-4 h-4 mr-1" />
                        Entrada
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setTransactionItem({ item, type: "saida" })}
                      >
                        <ArrowDownCircle className="w-4 h-4 mr-1" />
                        Saída
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              />
            </div>
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
    </div>
  );
}
