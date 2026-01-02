/** biome-ignore-all lint/a11y/noLabelWithoutControl: False positive for a11y linting rules */
"use client";

import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
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
  DialogTrigger,
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
import type { Expense } from "@/lib/booking-data";

export function ManagementReports() {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      description: "Aluguel",
      value: 2500,
      category: "Infraestrutura",
      date: "2023-12-01",
      isFixed: true,
    },
    {
      id: "2",
      description: "Internet",
      value: 150,
      category: "Utilidades",
      date: "2023-12-05",
      isFixed: true,
    },
    {
      id: "3",
      description: "Energia",
      value: 450,
      category: "Utilidades",
      date: "2023-12-10",
      isFixed: true,
    },
  ]);

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: "",
    value: 0,
    category: "",
    isFixed: true,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.value) {
      const expense: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        description: newExpense.description,
        value: Number(newExpense.value),
        category: newExpense.category || "Geral",
        date: new Date().toISOString().split("T")[0],
        isFixed: true,
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ description: "", value: 0, category: "", isFixed: true });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.value, 0);
  const totalRevenue = 12450;
  const operationalProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Gerar Relatórios
          </CardTitle>
          <CardDescription>
            Selecione o período e tipo de relatório
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select defaultValue="month">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                  <SelectItem value="year">Último Ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select defaultValue="financial">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="services">Serviços</SelectItem>
                  <SelectItem value="clients">Clientes</SelectItem>
                  <SelectItem value="inventory">Estoque</SelectItem>
                  <SelectItem value="complete">Completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Gastos Fixos
            </CardTitle>
            <CardDescription>
              Gerencie seus custos operacionais mensais
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Gasto Fixo</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo gasto operacional.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descrição
                  </Label>
                  <Input
                    id="description"
                    className="col-span-3"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">
                    Valor (R$)
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    className="col-span-3"
                    value={newExpense.value}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, value: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Categoria
                  </Label>
                  <Input
                    id="category"
                    className="col-span-3"
                    value={newExpense.category}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, category: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddExpense}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-12.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.description}
                    </TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">
                      R$ {expense.value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {expenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      Nenhum gasto fixo cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total em Gastos Fixos</p>
              <p className="text-2xl font-bold text-destructive">
                R$ {totalExpenses.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  R$ {totalRevenue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% vs mês anterior
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas Fixas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-destructive">
                  R$ {totalExpenses.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Custos fixos operacionais
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground rotate-180" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Operacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${operationalProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  R$ {operationalProfit.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Receita - Despesas Fixas
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Atendimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8% vs mês anterior
                </p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
