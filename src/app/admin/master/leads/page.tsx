"use client";

import {
  CheckCircle2,
  ExternalLink,
  FileUp,
  Filter,
  Instagram,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus
} from "lucide-react";
import Papa from "papaparse";
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";

export interface Prospect {
  id: string;
  name: string;
  phone: string;
  establishmentName: string;
  instagramLink?: string;
  category: string;
  status: 'NOT_CONTACTED' | 'CONTACTED' | 'IN_NEGOTIATION' | 'CONVERTED' | 'REJECTED';
  notes?: string;
  createdAt: string;
}

interface ImportLead extends Omit<Prospect, 'createdAt'> {
  address?: string;
}

const INITIAL_CATEGORIES = [
  "Studio de Sobrancelha",
  "Manicure e Pedicure",
  "Clínicas em geral (Estética)",
  "Clínicas em geral (Consulta)",
  "Salões de Beleza (Geral)",
  "Salões de Corte Masculino",
  "Maquiadora",
  "Studios de Tatuagem",
  "Psicologia",
  "Personal Trainer",
  "Clínicas de Fisioterapia",
  "Consultorias e Assessorias",
  "Advocacia",
  "Fotografia",
  "Professores Particulares",
  "Escolas de Dança",
];

const STATUS_LABELS: Record<Prospect["status"], string> = {
  NOT_CONTACTED: "Não Contatado",
  CONTACTED: "Contatado",
  IN_NEGOTIATION: "Em Negociação",
  CONVERTED: "Convertido",
  REJECTED: "Recusado",
};

export default function LeadsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importingLeads, setImportingLeads] = useState<ImportLead[]>([]);
  const [isSavingImport, setIsSavingImport] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const { toast } = useToast();

  // Form state
  const [newProspect, setNewProspect] = useState({
    name: "",
    phone: "",
    establishmentName: "",
    instagramLink: "",
    category: INITIAL_CATEGORIES[0],
    status: "NOT_CONTACTED" as Prospect["status"],
    notes: "",
  });

  const fetchProspects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await customFetch(`${API_BASE_URL}/api/admin/master/prospects`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setProspects(data);

        // Adicionar categorias existentes nos prospectos à lista se não existirem
        const existingCats = Array.from(new Set(data.map((p: Prospect) => p.category))).filter(Boolean) as string[];
        const savedCategories = localStorage.getItem("master_categories");
        const currentCats = savedCategories ? JSON.parse(savedCategories) : INITIAL_CATEGORIES;
        
        const newCats = existingCats.filter(cat => !currentCats.includes(cat));
        if (newCats.length > 0) {
          const updatedCats = [...currentCats, ...newCats];
          setCategories(updatedCats);
          localStorage.setItem("master_categories", JSON.stringify(updatedCats));
        }
      }
    } catch (error) {
      console.error("Erro ao buscar prospectos:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a lista de prospectos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const savedCategories = localStorage.getItem("master_categories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    fetchProspects();
  }, [fetchProspects]);

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Categoria já existe",
        variant: "destructive",
      });
      return;
    }
    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    localStorage.setItem("master_categories", JSON.stringify(updatedCategories));
    setNewProspect({ ...newProspect, category: newCategory.trim() });
    setNewCategory("");
    setIsAddingCategory(false);
    toast({
      title: "Categoria adicionada",
    });
  };

  const handleAddProspect = async () => {
    if (!newProspect.name || !newProspect.phone || !newProspect.establishmentName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome, telefone e estabelecimento.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await customFetch(`${API_BASE_URL}/api/admin/master/prospects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProspect),
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Novo possível cliente adicionado.",
        });
        setIsAddModalOpen(false);
        setNewProspect({
          name: "",
          phone: "",
          establishmentName: "",
          instagramLink: "",
          category: INITIAL_CATEGORIES[0],
          status: "NOT_CONTACTED",
          notes: "",
        });
        fetchProspects();
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao adicionar prospecto:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao tentar adicionar o prospecto.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: Prospect["status"]) => {
    try {
      const response = await customFetch(`${API_BASE_URL}/api/admin/master/prospects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (response.ok) {
        setProspects(prospects.map((p) => (p.id === id ? { ...p, status } : p)));
        toast({
          title: "Status atualizado",
          description: `Prospecto marcado como ${STATUS_LABELS[status]}.`,
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro na atualização",
        variant: "destructive",
      });
    }
  };

  const handleEditProspect = (prospect: Prospect) => {
    setEditingProspect(prospect);
    setIsEditModalOpen(true);
  };

  const handleUpdateProspect = async () => {
    if (!editingProspect || !editingProspect.name || !editingProspect.phone || !editingProspect.establishmentName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome, telefone e estabelecimento.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { id, createdAt: _createdAt, ...updateData } = editingProspect;
      const response = await customFetch(`${API_BASE_URL}/api/admin/master/prospects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Prospecto atualizado com sucesso.",
        });
        setIsEditModalOpen(false);
        setEditingProspect(null);
        fetchProspects();
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao atualizar prospecto:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao tentar atualizar o prospecto.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProspect = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este prospecto?")) return;

    try {
      const response = await customFetch(`${API_BASE_URL}/api/admin/master/prospects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setProspects(prospects.filter((p) => p.id !== id));
        toast({
          title: "Removido",
          description: "Prospecto removido com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast({
        title: "Erro ao remover",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const mappedData: ImportLead[] = (results.data as Record<string, string>[]).map((row, idx) => {
            // Tenta mapear pelos nomes de colunas do Google Maps ou nomes amigáveis
            const name = row.qBF1Pd || row['Nome do estabelecimento'] || row.Nome || row.Estabelecimento || row.name || "";
            const category = row.W4Efsd || row.categoria || row.Categoria || row.category || "";
            const address = row['W4Efsd 3'] || row.endereço || row.Endereço || row.address || "";
            const phone = row.telefone || row.Telefone || row.phone || "";
            const notes = row.ah5Ghc || row.Observações || row.notes || "";
            const instagram = row.Instagram || row.instagram || row.Website || row.website || row.site || row.Site || row.Link || row.link || "";

            return {
              id: `temp-${idx}`,
              name: name,
              phone: phone,
              establishmentName: name,
              category: category || INITIAL_CATEGORIES[0],
              address: address,
              instagramLink: instagram,
              notes: notes,
              status: "NOT_CONTACTED" as Prospect["status"],
            };
          });

          // Extrair novas categorias e adicionar à lista
          const newCategories = Array.from(new Set(mappedData.map(l => l.category))).filter(cat => cat && !categories.includes(cat));
          if (newCategories.length > 0) {
            const updatedCategories = [...categories, ...newCategories];
            setCategories(updatedCategories);
            localStorage.setItem("master_categories", JSON.stringify(updatedCategories));
          }

          setImportingLeads(mappedData);
          setIsImportModalOpen(true);
          e.target.value = "";
        },
        error: (error) => {
          console.error("Erro ao processar CSV:", error);
          toast({
            title: "Erro no arquivo",
            description: "Não foi possível processar o arquivo CSV.",
            variant: "destructive",
          });
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws) as Record<string, string | number | boolean | null>[];

          const mappedData: ImportLead[] = data.map((row, idx) => {
            // Tenta mapear pelos nomes de colunas do Google Maps ou nomes amigáveis
            const name = String(row.qBF1Pd || row['Nome do estabelecimento'] || row.Nome || row.Estabelecimento || row.name || "");
            const category = String(row.W4Efsd || row.categoria || row.Categoria || row.category || "");
            const address = String(row['W4Efsd 3'] || row.endereço || row.Endereço || row.address || "");
            const phone = String(row.telefone || row.Telefone || row.phone || "");
            const notes = String(row.ah5Ghc || row.Observações || row.notes || "");
            const instagram = String(row.Instagram || row.instagram || row.Website || row.website || row.site || row.Site || row.Link || row.link || "");

            return {
              id: `temp-${idx}`,
              name: name,
              phone: phone,
              establishmentName: name,
              category: category || INITIAL_CATEGORIES[0],
              address: address,
              instagramLink: instagram,
              notes: notes && notes !== "null" && notes !== "undefined" ? notes : "",
              status: "NOT_CONTACTED" as Prospect["status"],
            };
          });

          // Extrair novas categorias e adicionar à lista
          const newCategories = Array.from(new Set(mappedData.map(l => l.category))).filter(cat => cat && !categories.includes(cat));
          if (newCategories.length > 0) {
            const updatedCategories = [...categories, ...newCategories];
            setCategories(updatedCategories);
            localStorage.setItem("master_categories", JSON.stringify(updatedCategories));
          }

          setImportingLeads(mappedData);
          setIsImportModalOpen(true);
          e.target.value = "";
        } catch (error) {
          console.error("Erro ao processar Excel:", error);
          toast({
            title: "Erro no arquivo",
            description: "Não foi possível processar o arquivo Excel.",
            variant: "destructive",
          });
        }
      };
      reader.readAsBinaryString(file);
    } else {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo CSV ou XLSX.",
        variant: "destructive",
      });
    }
  };

  const handleSaveImport = async () => {
    setIsSavingImport(true);
    let successCount = 0;
    let failCount = 0;

    for (const lead of importingLeads) {
      try {
        const { id: _id, address: _address, ...leadData } = lead;
        const response = await customFetch(`${API_BASE_URL}/api/admin/master/prospects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData),
          credentials: "include",
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error("Erro ao importar lead:", error);
        failCount++;
      }
    }

    setIsSavingImport(false);
    setIsImportModalOpen(false);
    setImportingLeads([]);
    fetchProspects();

    toast({
      title: "Importação concluída",
      description: `${successCount} leads importados com sucesso. ${failCount} falhas.`,
      variant: successCount > 0 ? "default" : "destructive",
    });
  };

  const filteredProspects = prospects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.establishmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || p.status === filterStatus;
    const matchesCategory = filterCategory === "ALL" || p.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: Prospect["status"]) => {
    switch (status) {
      case "NOT_CONTACTED":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Não Contatado</Badge>;
      case "CONTACTED":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Contatado</Badge>;
      case "IN_NEGOTIATION":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Em Negociação</Badge>;
      case "CONVERTED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Convertido</Badge>;
      case "REJECTED":
        return <Badge variant="secondary">Recusado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Possíveis Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie leads e prospecções para a plataforma.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Importar CSV ou Excel"
            />
            <Button variant="outline">
              <FileUp className="w-4 h-4 mr-2" />
              Importar CSV/Excel
            </Button>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Lead
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-125">
            <DialogHeader>
              <DialogTitle>Adicionar Possível Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados para iniciar a prospecção deste cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Contato</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Maria Silva"
                    value={newProspect.name}
                    onChange={(e) => setNewProspect({ ...newProspect, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp</Label>
                  <Input
                    id="phone"
                    placeholder="Ex: 11999999999"
                    value={newProspect.phone}
                    onChange={(e) => setNewProspect({ ...newProspect, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business">Nome do Estabelecimento</Label>
                <Input
                  id="business"
                  placeholder="Ex: Studio Bela Face"
                  value={newProspect.establishmentName}
                  onChange={(e) => setNewProspect({ ...newProspect, establishmentName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Link do Instagram (Opcional)</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    className="pl-9"
                    placeholder="instagram.com/usuario"
                    value={newProspect.instagramLink}
                    onChange={(e) => setNewProspect({ ...newProspect, instagramLink: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  {isAddingCategory ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nova categoria"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        autoFocus
                      />
                      <Button size="icon" variant="outline" onClick={handleAddCategory}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setIsAddingCategory(false)}>
                        <Plus className="h-4 w-4 rotate-45" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select
                        value={newProspect.category}
                        onValueChange={(v) => setNewProspect({ ...newProspect, category: v })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione" />
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
                        size="icon"
                        variant="outline"
                        onClick={() => setIsAddingCategory(true)}
                        title="Adicionar nova categoria"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Status Inicial</Label>
                  <Select
                    value={newProspect.status}
                    onValueChange={(v) => setNewProspect({ ...newProspect, status: v as Prospect["status"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOT_CONTACTED">Não Contatado</SelectItem>
                      <SelectItem value="CONTACTED">Contatado</SelectItem>
                      <SelectItem value="IN_NEGOTIATION">Em Negociação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas sobre o primeiro contato..."
                  value={newProspect.notes}
                  onChange={(e) => setNewProspect({ ...newProspect, notes: e.target.value })}
                  className="h-20"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddProspect}>Salvar Lead</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Preview de Importação */}
        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogContent className="max-w-[98vw] w-[98vw] sm:max-w-[95vw] lg:max-w-7xl max-h-[90vh] flex flex-col p-0">
            <div className="p-6 pb-2">
              <DialogHeader>
                <DialogTitle>Preview de Importação</DialogTitle>
                <DialogDescription>
                  Confira e corrija os dados antes de salvar no banco de dados.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <ScrollArea className="h-full w-full border rounded-md">
                <div className="min-w-[1200px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-[200px]">Nome/Estabelecimento</TableHead>
                        <TableHead className="w-[180px]">Categoria</TableHead>
                        <TableHead className="w-[150px]">Telefone</TableHead>
                        <TableHead className="w-[250px]">Endereço</TableHead>
                        <TableHead className="w-[200px]">Instagram</TableHead>
                        <TableHead className="w-[300px]">Observações</TableHead>
                        <TableHead className="w-[70px] text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importingLeads.map((lead, idx) => (
                        <TableRow key={lead.id}>
                          <TableCell className="p-2">
                            <Input 
                              className="h-8"
                              value={lead.name} 
                              onChange={(e) => {
                                const newLeads = [...importingLeads];
                                newLeads[idx].name = e.target.value;
                                newLeads[idx].establishmentName = e.target.value;
                                setImportingLeads(newLeads);
                              }}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Select
                              value={lead.category}
                              onValueChange={(v) => {
                                const newLeads = [...importingLeads];
                                newLeads[idx].category = v;
                                setImportingLeads(newLeads);
                              }}
                            >
                              <SelectTrigger className="h-8 w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="p-2">
                            <Input 
                              className="h-8"
                              value={lead.phone} 
                              onChange={(e) => {
                                const newLeads = [...importingLeads];
                                newLeads[idx].phone = e.target.value;
                                setImportingLeads(newLeads);
                              }}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input 
                              className="h-8"
                              value={lead.address} 
                              onChange={(e) => {
                                const newLeads = [...importingLeads];
                                newLeads[idx].address = e.target.value;
                                const currentNotes = lead.notes || "";
                                if (currentNotes.startsWith("Endereço: ")) {
                                  const parts = currentNotes.split(". ");
                                  const otherNotes = parts.slice(1).join(". ");
                                  newLeads[idx].notes = `Endereço: ${e.target.value}${otherNotes ? `. ${otherNotes}` : ""}`;
                                }
                                setImportingLeads(newLeads);
                              }}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input 
                              className="h-8"
                              placeholder="instagram.com/..."
                              value={lead.instagramLink} 
                              onChange={(e) => {
                                const newLeads = [...importingLeads];
                                newLeads[idx].instagramLink = e.target.value;
                                setImportingLeads(newLeads);
                              }}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input 
                              className="h-8"
                              value={lead.notes} 
                              onChange={(e) => {
                                const newLeads = [...importingLeads];
                                newLeads[idx].notes = e.target.value;
                                setImportingLeads(newLeads);
                              }}
                            />
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setImportingLeads(importingLeads.filter((_, i) => i !== idx));
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>

            <div className="p-6 pt-2">
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveImport} disabled={isSavingImport}>
                  {isSavingImport ? "Salvando..." : `Importar ${importingLeads.length} Leads`}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-125">
            <DialogHeader>
              <DialogTitle>Editar Possível Cliente</DialogTitle>
              <DialogDescription>
                Atualize as informações do prospecto conforme necessário.
              </DialogDescription>
            </DialogHeader>
            {editingProspect && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome do Contato</Label>
                    <Input
                      id="edit-name"
                      value={editingProspect.name}
                      onChange={(e) => setEditingProspect({ ...editingProspect, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Telefone/WhatsApp</Label>
                    <Input
                      id="edit-phone"
                      value={editingProspect.phone}
                      onChange={(e) => setEditingProspect({ ...editingProspect, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-business">Nome do Estabelecimento</Label>
                  <Input
                    id="edit-business"
                    value={editingProspect.establishmentName}
                    onChange={(e) => setEditingProspect({ ...editingProspect, establishmentName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-instagram">Link do Instagram (Opcional)</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="edit-instagram"
                      className="pl-9"
                      value={editingProspect.instagramLink || ""}
                      onChange={(e) => setEditingProspect({ ...editingProspect, instagramLink: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={editingProspect.category}
                      onValueChange={(v) => setEditingProspect({ ...editingProspect, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editingProspect.status}
                      onValueChange={(v) => setEditingProspect({ ...editingProspect, status: v as Prospect["status"] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Observações</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingProspect.notes || ""}
                    onChange={(e) => setEditingProspect({ ...editingProspect, notes: e.target.value })}
                    className="h-20"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateProspect}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <Card>
        <CardHeader>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Base de Leads</CardTitle>
                <CardDescription>
                  Lista de estabelecimentos interessantes para a plataforma.
                </CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, estúdio..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center bg-muted/30 p-4 rounded-lg border border-muted-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="w-4 h-4" />
                Filtros:
              </div>
              
              <div className="w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os Status</SelectItem>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-64">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas as Categorias</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(filterStatus !== "ALL" || filterCategory !== "ALL" || searchTerm !== "") && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setFilterStatus("ALL");
                    setFilterCategory("ALL");
                    setSearchTerm("");
                  }}
                  className="text-xs h-8"
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Estabelecimento</TableHead>
                  <TableHead className="font-bold">Contato</TableHead>
                  <TableHead className="font-bold">Categoria</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      Carregando prospectos...
                    </TableCell>
                  </TableRow>
                ) : filteredProspects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <UserPlus className="h-8 w-8 opacity-20" />
                        <p>Nenhum lead encontrado.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProspects.map((prospect) => (
                    <TableRow key={prospect.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-semibold">{prospect.establishmentName}</div>
                        <div className="flex flex-col gap-1 mt-0.5">
                          {prospect.instagramLink && (
                            <a
                              href={prospect.instagramLink.startsWith("http") ? prospect.instagramLink : `https://${prospect.instagramLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Instagram className="w-3 h-3" />
                              Instagram
                            </a>
                          )}
                          {prospect.notes && (
                            <p className="text-[10px] text-muted-foreground italic truncate max-w-50" title={prospect.notes}>
                              "{prospect.notes}"
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{prospect.name}</div>
                        <div className="text-xs text-muted-foreground">{prospect.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {prospect.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={prospect.status}
                          onValueChange={(v) => handleUpdateStatus(prospect.id, v as Prospect["status"])}
                        >
                          <SelectTrigger className="h-auto w-fit border-none bg-transparent p-0 hover:bg-transparent focus:ring-0">
                            <div className="cursor-pointer hover:opacity-80 transition-opacity">
                              {getStatusBadge(prospect.status)}
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {prospect.status === "NOT_CONTACTED" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleUpdateStatus(prospect.id, "CONTACTED")}
                            >
                              Contatar
                            </Button>
                          )}
                          {prospect.status === "CONTACTED" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              onClick={() => handleUpdateStatus(prospect.id, "IN_NEGOTIATION")}
                            >
                              Negociar
                            </Button>
                          )}
                          {(prospect.status === "CONTACTED" || prospect.status === "IN_NEGOTIATION") && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleUpdateStatus(prospect.id, "CONVERTED")}
                            >
                              Virou Cliente
                            </Button>
                          )}
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleEditProspect(prospect)}
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" asChild title="Chamar no WhatsApp">
                            <a
                              href={`https://wa.me/55${prospect.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteProspect(prospect.id)}
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
