/** biome-ignore-all lint/a11y/noLabelWithoutControl: False positive for a11y linting rules */
"use client";

import {
  BarChart3,
  Calendar,
  Check,
  DollarSign,
  Download,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
import { useStudio } from "@/context/studio-context";
import { type Expense, type ExpenseCategory, expensesService, type ProfitReport } from "@/lib/expenses-service";

export function ManagementReports() {
  const { studio } = useStudio();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [report, setReport] = useState<ProfitReport | null>(null);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!studio?.id) return;
    setIsLoadingExpenses(true);
    try {
      const data = await expensesService.list(studio.id);
      setExpenses(data);
    } catch (error) {
      console.error("Erro ao carregar gastos:", error);
      toast.error("Erro ao carregar lista de gastos.");
    } finally {
      setIsLoadingExpenses(false);
    }
  }, [studio?.id]);

  const fetchReport = useCallback(async () => {
    if (!studio?.id) return;
    setIsLoadingReport(true);
    try {
      const data = await expensesService.getProfitReport(studio.id);
      setReport(data);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setIsLoadingReport(false);
    }
  }, [studio?.id]);

  useEffect(() => {
    if (studio?.id) {
      fetchExpenses();
      fetchReport();
    }
  }, [studio?.id, fetchExpenses, fetchReport]);

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: "",
    value: "",
    category: "GERAL" as ExpenseCategory,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const categories: { value: ExpenseCategory; label: string }[] = [
    { value: "INFRAESTRUTURA", label: "Infraestrutura" },
    { value: "UTILIDADES", label: "Utilidades" },
    { value: "MARKETING", label: "Marketing" },
    { value: "PRODUTOS_INSUMOS", label: "Produtos/Insumos" },
    { value: "PESSOAL", label: "Pessoal" },
    { value: "SISTEMAS_SOFTWARE", label: "Sistemas/Software" },
    { value: "IMPOSTOS", label: "Impostos" },
    { value: "GERAL", label: "Geral" },
  ];

  const handleSaveExpense = async () => {
    if (!studio?.id) return;
    if (!newExpense.description || !newExpense.value || !newExpense.category) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await expensesService.update(editingExpense.id, {
          description: newExpense.description,
          value: String(newExpense.value),
          category: newExpense.category as ExpenseCategory,
        });
        toast.success("Gasto atualizado com sucesso!");
      } else {
        await expensesService.create({
          companyId: studio.id,
          description: newExpense.description,
          value: String(newExpense.value),
          category: newExpense.category as ExpenseCategory,
          dueDate: new Date().toISOString(),
        });
        toast.success("Gasto adicionado com sucesso!");
      }
      
      setIsDialogOpen(false);
      setEditingExpense(null);
      setNewExpense({ description: "", value: "", category: "GERAL" });
      
      // Revalidar dados
      fetchExpenses();
      fetchReport();
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || "Erro ao salvar gasto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense({
      description: expense.description,
      value: expense.value,
      category: expense.category,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este gasto?")) return;
    
    try {
      await expensesService.delete(id);
      toast.success("Gasto excluído com sucesso!");
      fetchExpenses();
      fetchReport();
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || "Erro ao excluir gasto.");
    }
  };

  const handleTogglePaid = async (expense: Expense) => {
    try {
      await expensesService.update(expense.id, { isPaid: !expense.isPaid });
      toast.success(expense.isPaid ? "Marcado como não pago" : "Marcado como pago!");
      fetchExpenses();
      fetchReport();
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || "Erro ao atualizar status.");
    }
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.value), 0);

  const operationalProfit = report?.netProfit ?? 0;
  const totalRevenue = report?.totalRevenue ?? 0;
  const margin = report?.margin ?? 0;

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
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingExpense(null);
                setNewExpense({
                  description: "",
                  value: "",
                  category: "GERAL",
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingExpense
                    ? "Editar Gasto Fixo"
                    : "Adicionar Gasto Fixo"}
                </DialogTitle>
                <DialogDescription>
                  {editingExpense
                    ? "Altere os dados do gasto operacional."
                    : "Preencha os dados do novo gasto operacional."}
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
                      setNewExpense({
                        ...newExpense,
                        description: e.target.value,
                      })
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
                    step="0.01"
                    className="col-span-3"
                    value={newExpense.value ?? ""}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        value: e.target.value,
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
                    <Select
                      value={newExpense.category}
                      onValueChange={(value) =>
                        setNewExpense({ ...newExpense, category: value as ExpenseCategory })
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveExpense} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-12.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingExpenses ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePaid(expense)}
                          className={`h-8 w-8 rounded-full border ${
                            expense.isPaid
                              ? "bg-green-100 text-green-600 border-green-200"
                              : "text-muted-foreground border-dashed"
                          }`}
                        >
                          {expense.isPaid ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className={`font-medium ${expense.isPaid ? "text-muted-foreground line-through" : ""}`}>
                        {expense.description}
                      </TableCell>
                      <TableCell>{categories.find(c => c.value === expense.category)?.label || expense.category}</TableCell>
                      <TableCell className="text-right">
                        R${" "}
                        {Number(expense.value).toLocaleString("pt-BR", {
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
                  ))
                )}
                {!isLoadingExpenses && expenses.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-muted-foreground"
                    >
                      Nenhum gasto fixo cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total em Gastos Fixos
              </p>
              <p className="text-2xl font-bold text-destructive">
                R${" "}
                {totalExpenses.toLocaleString("pt-BR", {
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
                {isLoadingReport ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <p className="text-2xl font-bold">
                      R${" "}
                      {totalRevenue.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Receita de atendimentos concluídos
                    </p>
                  </>
                )}
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
                {isLoadingExpenses ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-destructive">
                      R${" "}
                      {totalExpenses.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Custos fixos operacionais
                    </p>
                  </>
                )}
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
                {isLoadingReport ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <p
                      className={`text-2xl font-bold ${operationalProfit >= 0 ? "text-green-600" : "text-destructive"}`}
                    >
                      R${" "}
                      {operationalProfit.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Margem de {margin.toFixed(1)}%
                    </p>
                  </>
                )}
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {margin >= 20 ? "Saudável" : margin > 0 ? "Atenção" : "Crítico"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Baseado na margem de lucro
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
