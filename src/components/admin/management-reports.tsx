/** biome-ignore-all lint/a11y/noLabelWithoutControl: False positive for a11y linting rules */
"use client";

import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import type { Booking, Expense } from "@/lib/booking-data";

export function ManagementReports() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Carregar dados iniciais
  useEffect(() => {
    // Carregar agendamentos do localStorage
    const savedBookings = localStorage.getItem("bookings");
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }

    // Carregar gastos fixos do localStorage
    const savedExpenses = localStorage.getItem("fixedExpenses");
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Salvar gastos fixos sempre que houver alteração
  useEffect(() => {
    localStorage.setItem("fixedExpenses", JSON.stringify(expenses));
  }, [expenses]);

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: "",
    value: undefined,
    category: "",
    isFixed: true,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [categories, setCategories] = useState([
    "Infraestrutura",
    "Utilidades",
    "Marketing",
    "Produtos/Insumos",
    "Pessoal",
    "Sistemas/Software",
    "Impostos",
    "Geral",
  ]);

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories([...categories, newCategoryName.trim()]);
      setNewExpense({ ...newExpense, category: newCategoryName.trim() });
      setNewCategoryName("");
      setIsAddingCategory(false);
    }
  };

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.value !== undefined) {
      if (editingExpense) {
        // Modo Edição
        const updatedExpenses = expenses.map((e) =>
          e.id === editingExpense.id
            ? {
                ...editingExpense,
                description: newExpense.description as string,
                value: Number(newExpense.value),
                category: newExpense.category || "Geral",
              }
            : e
        );
        setExpenses(updatedExpenses);
        setEditingExpense(null);
      } else {
        // Modo Criação
        const expense: Expense = {
          id: Math.random().toString(36).substr(2, 9),
          description: newExpense.description as string,
          value: Number(newExpense.value),
          category: newExpense.category || "Geral",
          date: new Date().toISOString().split("T")[0],
          isFixed: true,
        };
        setExpenses([...expenses, expense]);
      }
      setNewExpense({ description: "", value: undefined, category: "", isFixed: true });
      setIsDialogOpen(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense({
      description: expense.description,
      value: expense.value,
      category: expense.category,
      isFixed: expense.isFixed,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.value, 0);
  
  // Calcular receita real apenas de agendamentos concluídos
  const completedBookings = bookings.filter(b => b.status === "concluído");
  const totalRevenue = completedBookings.reduce((acc, curr) => acc + curr.servicePrice, 0);
  const totalServices = completedBookings.length;
  
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
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingExpense(null);
              setNewExpense({ description: "", value: undefined, category: "", isFixed: true });
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingExpense ? "Editar Gasto Fixo" : "Adicionar Gasto Fixo"}</DialogTitle>
                <DialogDescription>
                  {editingExpense ? "Altere os dados do gasto operacional." : "Preencha os dados do novo gasto operacional."}
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
                    value={newExpense.value ?? ""}
                    onChange={(e) =>
                      setNewExpense({ 
                        ...newExpense, 
                        value: e.target.value === "" ? undefined : Number(e.target.value) 
                      })
                    }
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Categoria
                  </Label>
                  <div className="col-span-3 space-y-2">
                    {isAddingCategory ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nome da categoria"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCategory();
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          size="sm" 
                          onClick={handleAddCategory}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Add
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setIsAddingCategory(false)}
                        >
                          X
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Select
                          value={newExpense.category}
                          onValueChange={(value) =>
                            setNewExpense({ ...newExpense, category: value })
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setIsAddingCategory(true)}
                          title="Criar nova categoria"
                          className="shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditExpense(expense)}
                          className="h-8 w-8 text-muted-foreground hover:text-accent"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Receita de atendimentos concluídos
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
                <p className="text-2xl font-bold">{totalServices}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total concluídos
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
