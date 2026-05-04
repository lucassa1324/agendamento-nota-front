"use client";

import { Bug, ExternalLink, Lightbulb, Loader2, MoreHorizontal, Trash2, ArrowRightLeft, Eye, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";

interface FeedbackReport {
  id: string;
  type: "BUG" | "SUGGESTION";
  description: string;
  screenshotUrl: string | null;
  pageUrl: string;
  userAgent: string | null;
  ipAddress: string | null;
  acceptLanguage: string | null;
  metadata: Record<string, unknown> | null;
  status: string;
  createdAt: string;
  reporterName: string | null;
  reporterEmail: string | null;
  companyName: string | null;
  companySlug: string | null;
}

export default function BugReportsPage() {
  const [feedbackReports, setFeedbackReports] = useState<FeedbackReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<FeedbackReport | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/bug-reports`,
        {
          credentials: "include",
          headers: { Accept: "application/json" },
        },
      );

      if (response.status === 403) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão de Super Admin.",
          variant: "destructive",
        });
        window.location.href = "/admin";
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setFeedbackReports(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Falha ao buscar feedbacks");
      }
    } catch (error) {
      console.error(">>> [BUG_REPORTS_PAGE] Erro ao carregar dados:", error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível carregar os feedbacks.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const bugReports = feedbackReports.filter((item) => item.type === "BUG");
  const suggestions = feedbackReports.filter(
    (item) => item.type === "SUGGESTION",
  );

  const getPathLabel = (url: string) => {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  };

  const getMetaValue = (
    metadata: Record<string, unknown> | null,
    key: string,
  ) => {
    if (!metadata || typeof metadata !== "object") return null;
    const value = metadata[key];
    if (value === null || value === undefined) return null;
    return String(value);
  };

  const getFullMetadata = (metadata: Record<string, unknown> | null) => {
    if (!metadata || typeof metadata !== "object") return [];
    return Object.entries(metadata).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este feedback?")) return;

    setIsActionLoading(true);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/bug-reports/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        toast({
          title: "Feedback removido",
          description: "O feedback foi excluído com sucesso.",
        });
        setFeedbackReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        throw new Error("Falha ao remover feedback");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMove = async (id: string, currentType: "BUG" | "SUGGESTION") => {
    const newType = currentType === "BUG" ? "SUGGESTION" : "BUG";
    const label = newType === "BUG" ? "Bug" : "Sugestão";

    setIsActionLoading(true);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/bug-reports/${id}/move`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: newType }),
        },
      );

      if (response.ok) {
        toast({
          title: "Feedback movido",
          description: `O feedback foi movido para ${label} com sucesso.`,
        });
        setFeedbackReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, type: newType } : r)),
        );
      } else {
        throw new Error("Falha ao mover feedback");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao mover",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const renderTable = (reports: FeedbackReport[], emptyLabel: string) => (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-37.5">Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Estúdio</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Carregando feedbacks...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : reports.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-muted-foreground"
              >
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="text-xs whitespace-nowrap">
                  {new Date(report.createdAt).toLocaleString("pt-BR")}
                </TableCell>
                <TableCell className="max-w-100">
                  <p
                    className="line-clamp-2 text-sm"
                    title={report.description}
                  >
                    {report.description}
                  </p>
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex flex-col">
                    <span className="font-medium">{report.reporterName || "Anônimo"}</span>
                    <span className="text-[10px] text-muted-foreground">{report.reporterEmail || "-"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex flex-col">
                    <span className="font-medium">{report.companyName || "Não identificado"}</span>
                    <span className="text-[10px] text-muted-foreground">{report.companySlug || "-"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver Detalhes
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleMove(report.id, report.type)}
                          disabled={isActionLoading}
                        >
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          Mover para {report.type === "BUG" ? "Sugestões" : "Bugs"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(report.id)}
                          disabled={isActionLoading}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bug className="h-8 w-8 text-primary" />
          Feedbacks
        </h1>
        <p className="text-muted-foreground">
          Visualize relatos de bugs e sugestões enviadas pelos usuários.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Central de Feedbacks</CardTitle>
          <CardDescription>
            Filtre por tipo para analisar bugs e sugestões separadamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="gap-1">
              <Bug className="h-3 w-3" />
              Bugs: {bugReports.length}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Lightbulb className="h-3 w-3" />
              Sugestões: {suggestions.length}
            </Badge>
          </div>

          <Tabs defaultValue="bugs" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bugs">Bugs</TabsTrigger>
              <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
            </TabsList>
            <TabsContent value="bugs" className="mt-4">
              {renderTable(bugReports, "Nenhum bug encontrado.")}
            </TabsContent>
            <TabsContent value="suggestions" className="mt-4">
              {renderTable(suggestions, "Nenhuma sugestão encontrada.")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2">
                {selectedReport?.type === "BUG" ? (
                  <Bug className="h-5 w-5 text-red-500" />
                ) : (
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                )}
                Detalhes do Feedback
              </DialogTitle>
              <DialogDescription>
                Informações técnicas completas capturadas automaticamente.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 pr-6">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={isActionLoading}
                onClick={() => {
                  if (selectedReport) {
                    handleMove(selectedReport.id, selectedReport.type);
                  }
                }}
              >
                <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
                Mover
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8"
                disabled={isActionLoading}
                onClick={() => {
                  if (selectedReport) {
                    handleDelete(selectedReport.id);
                    setIsDetailsOpen(false);
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Excluir
              </Button>
            </div>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Descrição do Usuário
                    </p>
                    <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap border border-slate-200 min-h-25">
                      {selectedReport.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Usuário
                      </p>
                      <p className="text-sm font-medium">
                        {selectedReport.reporterName || "Anônimo"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedReport.reporterEmail || "-"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Estúdio / Empresa
                      </p>
                      <p className="text-sm font-medium">
                        {selectedReport.companyName || "Não identificado"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedReport.companySlug || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      URL da Página
                    </p>
                    <a
                      href={selectedReport.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline break-all block bg-blue-50 p-2 rounded border border-blue-100 items-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {selectedReport.pageUrl}
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Screenshot (Captura de Tela)
                  </p>
                  {selectedReport.screenshotUrl ? (
                    <div className="relative group">
                      <div className="aspect-video w-full rounded-md border border-slate-200 overflow-hidden bg-slate-100">
                        <img
                          src={selectedReport.screenshotUrl}
                          alt="Screenshot do erro"
                          className="w-full h-full object-contain cursor-zoom-in transition-transform hover:scale-[1.02]"
                          onClick={() => window.open(selectedReport.screenshotUrl!, "_blank")}
                        />
                      </div>
                      <a
                        href={selectedReport.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-medium"
                      >
                        <ExternalLink className="h-5 w-5" />
                        Ver em tamanho real
                      </a>
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-md border border-dashed border-slate-300 flex flex-col items-center justify-center text-muted-foreground bg-slate-50">
                      <X className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-xs">Nenhuma imagem anexada</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Dados Técnicos e Metadados
                  </h4>
                  <Badge variant="outline" className="text-[10px] h-5">
                    {getFullMetadata(selectedReport.metadata).length + 3} campos capturados
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">IP Address</p>
                    <p className="text-xs font-mono truncate">{selectedReport.ipAddress || "Não capturado"}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Idioma</p>
                    <p className="text-xs truncate">{selectedReport.acceptLanguage || "Não capturado"}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Data/Hora Local</p>
                    <p className="text-xs truncate">{new Date(selectedReport.createdAt).toLocaleString("pt-BR")}</p>
                  </div>
                  
                  {getFullMetadata(selectedReport.metadata).map(({ key, value }) => (
                    <div key={key} className="bg-slate-50 p-2 rounded border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase truncate" title={key}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-xs truncate" title={value}>{value || "-"}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-slate-900 rounded-md">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">User Agent Completo</p>
                  <p className="text-[11px] font-mono text-slate-300 break-all leading-relaxed">
                    {selectedReport.userAgent || "Não capturado"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
