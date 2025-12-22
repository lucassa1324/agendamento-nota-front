"use client";

import { AlertCircle, Package, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  lastUpdate: string;
}

export function InventoryManager() {
  const [inventory, _setInventory] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "Henna para Sobrancelhas - Castanho",
      quantity: 8,
      minQuantity: 5,
      unit: "unidades",
      lastUpdate: "2024-01-15",
    },
    {
      id: "2",
      name: "Pinça Profissional",
      quantity: 3,
      minQuantity: 3,
      unit: "unidades",
      lastUpdate: "2024-01-10",
    },
    {
      id: "3",
      name: "Algodão",
      quantity: 120,
      minQuantity: 50,
      unit: "unidades",
      lastUpdate: "2024-01-12",
    },
    {
      id: "4",
      name: "Lápis para Sobrancelhas - Preto",
      quantity: 15,
      minQuantity: 10,
      unit: "unidades",
      lastUpdate: "2024-01-14",
    },
    {
      id: "5",
      name: "Gel Fixador",
      quantity: 6,
      minQuantity: 8,
      unit: "unidades",
      lastUpdate: "2024-01-08",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Produtos em Estoque</h3>
          <p className="text-sm text-muted-foreground">
            Controle de entrada e saída de produtos
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Nome do Produto</Label>
                <Input
                  id="product-name"
                  placeholder="Ex: Henna para Sobrancelhas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input id="quantity" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-quantity">Quantidade Mínima</Label>
                <Input id="min-quantity" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Input id="unit" placeholder="Ex: unidades, kg, litros" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button>Adicionar</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
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
                      {item.quantity}
                    </span>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
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
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Entrada
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
