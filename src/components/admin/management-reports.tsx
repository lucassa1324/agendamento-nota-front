/** biome-ignore-all lint/a11y/noLabelWithoutControl: False positive for a11y linting rules */
"use client";

import {
  BarChart3,

  Check,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Download,
  Loader2,
  Pencil,
  Plus,
  Repeat,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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

    const handleUpdate = () => {
      if (studio?.id) {
        console.log(">>> [MANAGEMENT_REPORTS] Atualizando relatório devido a mudança no estoque");
        fetchExpenses();
        fetchReport();
      }
    };

    window.addEventListener("inventoryUpdated", handleUpdate);
    return () => {
      window.removeEventListener("inventoryUpdated", handleUpdate);
    };
  }, [studio?.id, fetchExpenses, fetchReport]);

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: "",
    value: "",
    category: "GERAL" as ExpenseCategory,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingGroupExpenses, setEditingGroupExpenses] = useState<Expense[]>([]);

  const [expenseType, setExpenseType] = useState<"single" | "fixed" | "installment">("single");
  const [installmentsCount, setInstallmentsCount] = useState(2);
  const [footerView, setFooterView] = useState<"month" | "year">("month");

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
      if (editingGroupExpenses.length > 0) {
        await Promise.all(editingGroupExpenses.map(expense => {
          const match = expense.description.match(/ \(\d+\/\d+\)$/);
          const suffix = match ? match[0] : "";
          
          return expensesService.update(expense.id, {
            description: (newExpense.description || "") + suffix,
            value: String(newExpense.value),
            category: newExpense.category as ExpenseCategory,
          });
        }));
        toast.success("Parcelamento atualizado com sucesso!");
      } else if (editingExpense) {
        await expensesService.update(editingExpense.id, {
          description: newExpense.description,
          value: String(newExpense.value),
          category: newExpense.category as ExpenseCategory,
        });
        toast.success("Gasto atualizado com sucesso!");
      } else {
        const baseValue = newExpense.value;
        const baseDesc = newExpense.description;
        const category = newExpense.category as ExpenseCategory;

        const payload = {
          companyId: studio.id,
          description: baseDesc,
          value: String(baseValue),
          category,
          dueDate: new Date().toISOString(),
          type: expenseType === "installment" ? "PARCELADO" : undefined,
          totalInstallments: expenseType === "installment" ? installmentsCount : undefined,
        };

        if (expenseType === "fixed") {
          payload.description = `${baseDesc} [FIXO]`;
        }

        await expensesService.create(payload);
        toast.success("Gasto adicionado com sucesso!");
      }
      
      setIsDialogOpen(false);
      setEditingExpense(null);
      setEditingGroupExpenses([]);
      setNewExpense({ description: "", value: "", category: "GERAL" });
      setExpenseType("single");
      setInstallmentsCount(2);
      
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
    
    let type: "single" | "fixed" | "installment" = "single";
    let desc = expense.description;

    if (expense.description.includes("[FIXO]")) {
        type = "fixed";
        desc = expense.description.replace(" [FIXO]", "");
    }

    setNewExpense({
      description: desc,
      value: expense.value,
      category: expense.category,
    });
    setExpenseType(type);
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

  const handleEditGroup = (groupExpenses: Expense[]) => {
    setEditingGroupExpenses(groupExpenses);
    
    const first = groupExpenses[0];
    const match = first.description.match(/(.*?) \(\d+\/\d+\)$/);
    const baseDesc = match ? match[1] : first.description;

    setNewExpense({
      description: baseDesc,
      value: first.value,
      category: first.category,
    });
    setExpenseType("installment");
    setIsDialogOpen(true);
  };

  const handleDeleteGroup = async (groupExpenses: Expense[]) => {
    const first = groupExpenses[0];
    const match = first.description.match(/(.*?) \(\d+\/\d+\)$/);
    const baseDesc = match ? match[1] : first.description;
    
    if (!confirm(`Tem certeza que deseja excluir todas as ${groupExpenses.length} parcelas de "${baseDesc}"?`)) return;

    try {
      await Promise.all(groupExpenses.map(e => expensesService.delete(e.id)));
      toast.success("Parcelamento excluído com sucesso!");
      fetchExpenses();
      fetchReport();
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || "Erro ao excluir parcelamento.");
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

  const toggleGroup = (key: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedGroups(newExpanded);
  };

  const filteredTotalExpenses = expenses.reduce((acc, curr) => {
    const isFixed = curr.description.includes("[FIXO]");
    const value = Number(curr.value);
    const date = new Date(curr.dueDate || curr.createdAt);
    const now = new Date();
    
    if (footerView === "month") {
      if (isFixed) return acc + value;
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        return acc + value;
      }
      return acc;
    } else {
      if (isFixed) return acc + (value * 12);
      if (date.getFullYear() === now.getFullYear()) {
        return acc + value;
      }
      return acc;
    }
  }, 0);

  const totalRevenue = report?.totalRevenue ?? 0;
  const operationalProfit = totalRevenue - filteredTotalExpenses;
  const margin = totalRevenue !== 0 ? (operationalProfit / totalRevenue) * 100 : 0;

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
                setEditingGroupExpenses([]);
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
                  {editingGroupExpenses.length > 0
                    ? "Editar Parcelamento"
                    : editingExpense
                    ? "Editar Gasto Fixo"
                    : "Adicionar Gasto Fixo"}
                </DialogTitle>
                <DialogDescription>
                  {editingGroupExpenses.length > 0
                    ? "Altere os dados de todas as parcelas deste grupo."
                    : editingExpense
                    ? "Altere os dados do gasto operacional."
                    : "Preencha os dados do novo gasto operacional."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {editingGroupExpenses.length === 0 && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Tipo
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={expenseType}
                        onValueChange={(val) => setExpenseType(val as "single" | "fixed" | "installment")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          usePortal={false}
                          className="z-10001"
                          position="popper"
                          sideOffset={5}
                        >
                          <SelectItem value="single">Gasto Único</SelectItem>
                          <SelectItem value="fixed">Gasto Fixo (Mensal)</SelectItem>
                          <SelectItem value="installment">Compra Parcelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {expenseType === "installment" && editingGroupExpenses.length === 0 && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="installments" className="text-right">
                      Parcelas
                    </Label>
                    <Input
                      id="installments"
                      type="number"
                      min={2}
                      className="col-span-3"
                      value={installmentsCount}
                      onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                    />
                  </div>
                )}

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
                    Valor {expenseType === "installment" ? "(Parcela)" : "(R$)"}
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
                      <SelectTrigger className="flex-1 w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent
                        usePortal={false}
                        className="z-10001 max-h-50"
                        position="popper"
                        sideOffset={5}
                      >
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
                  (() => {
                    const processedGroups = new Set<string>();

                    return expenses.map((expense) => {
                      const installmentMatch = expense.description.match(/(.*?) \((\d+)\/(\d+)\)$/);

                      if (installmentMatch) {
                        const baseDesc = installmentMatch[1];
                        const total = installmentMatch[3];
                        const groupKey = `${baseDesc}-${total}`;

                        if (processedGroups.has(groupKey)) return null;
                        processedGroups.add(groupKey);

                        const groupExpenses = expenses.filter(e => {
                          const m = e.description.match(/(.*?) \((\d+)\/(\d+)\)$/);
                          return m && m[1] === baseDesc && m[3] === total;
                        }).sort((a, b) => {
                          const mA = a.description.match(/\((\d+)\//);
                          const mB = b.description.match(/\((\d+)\//);
                          return (Number(mA?.[1] || 0) - Number(mB?.[1] || 0));
                        });

                        const isExpanded = expandedGroups.has(groupKey);

                        return (
                          <React.Fragment key={groupKey}>
                            <TableRow className="bg-muted/30 hover:bg-muted/50">
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleGroup(groupKey)}
                                  className="h-8 w-8 p-0"
                                >
                                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                              </TableCell>
                              <TableCell className="font-medium">
                                {baseDesc} (Parcelado {groupExpenses.length}x)
                              </TableCell>
                              <TableCell>{categories.find(c => c.value === expense.category)?.label || expense.category}</TableCell>
                              <TableCell className="text-right">
                                R${" "}
                                {Number(expense.value).toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                                <span className="text-xs text-muted-foreground ml-1">/parc</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditGroup(groupExpenses)}
                                    className="h-8 w-8 text-muted-foreground hover:text-accent"
                                    title="Editar todas as parcelas"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteGroup(groupExpenses)}
                                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                                    title="Excluir todas as parcelas"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {isExpanded && groupExpenses.map(child => (
                              <TableRow key={child.id} className="bg-muted/10">
                                <TableCell>
                                  <div className="flex justify-end pr-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleTogglePaid(child)}
                                      className={`h-6 w-6 rounded-full border ${
                                        child.isPaid
                                          ? "bg-green-100 text-green-600 border-green-200"
                                          : "text-muted-foreground border-dashed"
                                      }`}
                                    >
                                      {child.isPaid ? (
                                        <Check className="w-3 h-3" />
                                      ) : (
                                        <X className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className={`pl-10 text-sm ${child.isPaid ? "text-muted-foreground line-through" : ""}`}>
                                  {child.description}
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell className="text-right text-muted-foreground text-sm">
                                  R${" "}
                                  {Number(child.value).toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                  })}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditExpense(child)}
                                      className="h-8 w-8 text-muted-foreground hover:text-accent"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteExpense(child.id)}
                                      className="h-8 w-8 text-destructive hover:text-destructive/90"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </React.Fragment>
                        );
                      }

                      return (
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
                            {expense.description.includes("[FIXO]") ? (
                              <div className="flex items-center gap-2">
                                {expense.description.replace(" [FIXO]", "")}
                                <Repeat className="w-3 h-3 text-muted-foreground" />
                              </div>
                            ) : (
                              expense.description
                            )}
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
                      );
                    });
                  })()
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
          <div className="mt-4 flex justify-end items-center gap-4">
            <Select
              value={footerView}
              onValueChange={(val) => setFooterView(val as "month" | "year")}
            >
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="year">Previsão Anual</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total Calculado
              </p>
              <p className="text-2xl font-bold text-destructive">
                R${" "}
                {filteredTotalExpenses.toLocaleString("pt-BR", {
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
                      {filteredTotalExpenses.toLocaleString("pt-BR", {
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


      </div>
    </div>
  );
}
