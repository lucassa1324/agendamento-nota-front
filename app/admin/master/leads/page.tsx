"use client";

import {
  CheckCircle2,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileUp,
  FileDown,
  Filter,
  Instagram,
  Download,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import Papa from "papaparse";
import { useCallback, useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { cn } from "@/lib/utils";

export interface Prospect {
  id: string;
  name: string;
  phone: string;
  establishmentName: string;
  city?: string;
  instagramLink?: string;
  category: string;
  status: 'NOT_CONTACTED' | 'CONTACTED' | 'IN_NEGOTIATION' | 'CONVERTED' | 'REJECTED';
  notes?: string;
  address?: string;
  mapsLink?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ImportLead extends Omit<Prospect, 'id' | 'createdAt'> {
  id: string; // ID temporário para a lista de preview
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
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterCity, setFilterCity] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const cities = useMemo(() => 
    Array.from(new Set(prospects.map(p => p.city).filter(Boolean))).sort() as string[]
  , [prospects]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importingLeads, setImportingLeads] = useState<ImportLead[]>([]);
  const [bulkEditingLeads, setBulkEditingLeads] = useState<Prospect[]>([]);
  const [isSavingImport, setIsSavingImport] = useState(false);
  const [isSavingBulkEdit, setIsSavingBulkEdit] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const { toast } = useToast();

  // Form state
  const [newProspect, setNewProspect] = useState({
    name: "",
    phone: "",
    establishmentName: "",
    city: "",
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
    
    const categoryExists = categories.some(
      (cat) => cat.toLowerCase() === newCategory.trim().toLowerCase()
    );

    if (categoryExists) {
      toast({
        title: "Categoria já existe",
        description: "Uma categoria com este nome já existe (independente de maiúsculas/minúsculas).",
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
          city: "",
          instagramLink: "",
          category: INITIAL_CATEGORIES[0],
          status: "NOT_CONTACTED",
          notes: "",
        });
        fetchProspects();
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          toast({
            title: "Já existe",
            description: errorData.error || "Este prospecto já está cadastrado.",
            variant: "destructive",
          });
        } else {
          throw new Error(errorData.error || "Falha ao salvar");
        }
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

  const extractCity = (row: any, address: string) => {
    let city = String(row.cidade || row.Cidade || row.city || row.City || "");
    if ((!city || city === "undefined" || city === "") && address && address !== "undefined") {
      const parts = address.split(/[,-]/).map(p => p.trim());
      if (parts.length >= 3) {
        city = parts[parts.length - 2];
      } else if (parts.length === 2) {
        city = parts[1];
      }
    }
    return city === "undefined" ? "" : city.trim();
  };

  const getCellValue = (row: any, ...keys: string[]) => {
    const rowKeys = Object.keys(row);
    for (const key of keys) {
      // Direct match
      if (row[key] !== undefined && row[key] !== null) {
        return String(row[key]).trim();
      }
      
      // Case-insensitive match
      const foundKey = rowKeys.find(rk => rk.toLowerCase() === key.toLowerCase());
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
        return String(row[foundKey]).trim();
      }
    }
    return "";
  };

  const mapRowToLead = (row: any, idx: number): ImportLead => {
    // Nomes de colunas baseados na imagem do usuário e padrões do Google Maps
    const name = getCellValue(row, 'Nome do estabelecimento', 'qBF1Pd', 'Nome', 'Estabelecimento', 'name', 'Title', 'Título', 'Estabelecimento', 'Empresa').trim();
    const category = getCellValue(row, 'categoria', 'W4Efsd', 'Categoria', 'category', 'Category', 'Tipo', 'Ramo', 'Segmento').trim();
    const address = getCellValue(row, 'endereço', 'endereco', 'W4Efsd 3', 'Endereço', 'Endereco', 'address', 'Address', 'Localização', 'Location', 'Logradouro').trim();
    const phone = getCellValue(row, 'telefone', 'Telefone', 'phone', 'Phone', 'Contato', 'Celular', 'WhatsApp', 'WhatsApp Link', 'Tel').trim();
    const instagram = getCellValue(row, 'site/instagran', 'site/instagram', 'instagran/site', 'instagram/site', 'Instagram', 'instagram', 'Website', 'website', 'site', 'Site', 'Link', 'link', 'Social Link').trim();
    const mapsLink = getCellValue(row, 'Link google', 'Link Google', 'Link do Google Maps', 'maps_link', 'Maps', 'Google Maps', 'Maps Link').trim();
    const cityFromRow = getCellValue(row, 'Cidade', 'city', 'City', 'Município', 'Town').trim();

    const city = cityFromRow || extractCity(row, address);

    return {
      id: `temp-${idx}-${Date.now()}`,
      name: name || "Sem Nome",
      phone: phone || "Sem Telefone",
      establishmentName: name || "Sem Nome",
      city,
      category: category || INITIAL_CATEGORIES[0],
      address,
      instagramLink: instagram,
      mapsLink,
      notes: "",
      status: "NOT_CONTACTED" as Prospect["status"],
    };
  };

  const processImportedLeads = (leads: ImportLead[]) => {
    const validLeads = leads.filter(lead => lead.name.length > 0 && lead.name !== "null" && lead.name !== "undefined");
    
    const newCategories = Array.from(new Set(validLeads.map(l => l.category)))
      .filter(cat => {
        if (!cat) return false;
        // Busca insensível a maiúsculas/minúsculas para evitar duplicados como "Advocacia" e "advocacia"
        return !categories.some(existingCat => existingCat.toLowerCase() === cat.toLowerCase());
      });
      
    if (newCategories.length > 0) {
      const updatedCategories = [...categories, ...newCategories];
      setCategories(updatedCategories);
      localStorage.setItem("master_categories", JSON.stringify(updatedCategories));
    }

    setImportingLeads(validLeads);
    setIsImportModalOpen(true);
  };

  const handleEditProspect = (prospect: Prospect) => {
    setEditingProspect(prospect);
    setIsEditModalOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProspects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProspects.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Tem certeza que deseja excluir ${selectedIds.length} prospectos?`)) return;

    try {
      const response = await customFetch(`${API_BASE_URL}/api/admin/master/prospects/bulk`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `${selectedIds.length} prospectos excluídos.`,
        });
        setSelectedIds([]);
        fetchProspects();
      } else {
        throw new Error("Falha ao excluir");
      }
    } catch (error) {
      console.error("Erro ao excluir em massa:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao tentar excluir os prospectos.",
        variant: "destructive",
      });
    }
  };

  const handleBulkUpdateStatus = async (status: Prospect["status"]) => {
    if (selectedIds.length === 0) return;

    try {
      const response = await customFetch(`${API_BASE_URL}/api/admin/master/prospects/bulk/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status }),
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `Status de ${selectedIds.length} prospectos atualizado para ${STATUS_LABELS[status]}.`,
        });
        setSelectedIds([]);
        fetchProspects();
      } else {
        throw new Error("Falha ao atualizar");
      }
    } catch (error) {
      console.error("Erro ao atualizar status em massa:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao tentar atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleBulkUpdateCategory = async (category: string) => {
    if (selectedIds.length === 0) return;

    try {
      const response = await customFetch(`${API_BASE_URL}/api/admin/master/prospects/bulk/category`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, category }),
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `Categoria de ${selectedIds.length} prospectos atualizada para ${category}.`,
        });
        setSelectedIds([]);
        fetchProspects();
      } else {
        throw new Error("Falha ao atualizar");
      }
    } catch (error) {
      console.error("Erro ao atualizar categoria em massa:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao tentar atualizar a categoria.",
        variant: "destructive",
      });
    }
  };

  const handleOpenBulkEdit = () => {
    if (selectedIds.length === 0) return;
    const selectedLeads = prospects.filter((p) => selectedIds.includes(p.id));
    setBulkEditingLeads(selectedLeads);
    setIsBulkEditModalOpen(true);
  };

  const handleBulkEditFieldChange = (id: string, field: keyof Prospect, value: string) => {
    setBulkEditingLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, [field]: value } : lead))
    );
  };

  const handleSaveBulkEdit = async () => {
    if (bulkEditingLeads.length === 0) return;
    setIsSavingBulkEdit(true);
    try {
      const results = await Promise.all(
        bulkEditingLeads.map(async (lead) => {
          // Destructuring para remover campos que não devem ser enviados no PATCH
          const { id, createdAt, updatedAt, city, ...rest } = lead;
          
          // O backend espera 'location' em vez de 'city' no banco, 
          // mas o schema do Elysia permite ambos para flexibilidade.
          const payload = {
            ...rest,
            location: city || "",
            city: city || "",
          };

          const response = await customFetch(`${API_BASE_URL}/api/admin/master/prospects/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Erro ao salvar prospecto ${id}:`, {
              status: response.status,
              error: errorData,
              payload
            });
            return { id, ok: false, status: response.status, error: errorData };
          }

          return { id, ok: true };
        })
      );

      const failed = results.filter(r => !r.ok);
      if (failed.length > 0) {
        throw new Error(`Falha ao salvar ${failed.length} prospectos.`);
      }

      toast({
        title: "Sucesso",
        description: `${bulkEditingLeads.length} prospectos atualizados com sucesso.`,
      });
      setIsBulkEditModalOpen(false);
      setBulkEditingLeads([]);
      setSelectedIds([]);
      fetchProspects();
    } catch (error: any) {
      console.error("Erro ao salvar edição em massa:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao tentar salvar a edição em massa.",
        variant: "destructive",
      });
    } finally {
      setIsSavingBulkEdit(false);
    }
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
      const { id, createdAt, updatedAt, city, ...updateData } = editingProspect;
      const payload = {
        ...updateData,
        location: city || "",
        city: city || "",
      };
      const response = await customFetch(`${API_BASE_URL}/api/admin/master/prospects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        const errorData = await response.json().catch(() => ({}));
        console.error("Erro ao atualizar prospecto:", errorData);
        throw new Error(errorData.error || "Falha ao salvar");
      }
    } catch (error: any) {
      console.error("Erro ao atualizar prospecto:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao tentar atualizar o prospecto.",
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

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nome do estabelecimento': 'Exemplo Loja ABC',
        'Nome': 'João Silva',
        'Telefone': '11999999999',
        'Cidade': 'São Paulo',
        'Categoria': 'Advocacia',
        'Endereço': 'Rua Exemplo, 123',
        'Instagram': 'instagram.com/exemplo',
        'Status': 'Não Contatado',
        'Notas': 'Lead interessado em agendamento.'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "modelo_importacao_leads.xlsx");
    
    toast({
      title: "Modelo baixado",
      description: "Use este arquivo como base para sua importação.",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (fileExtension === 'csv') {
        const scoreText = (value: string) => {
          const replacement = (value.match(/�/g) || []).length;
          const mojibake = (value.match(/[ÃÂ]/g) || []).length;
          const accents = (value.match(/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/g) || []).length;
          return accents * 2 - replacement - mojibake;
        };

        const decodeCsv = async () => {
          const buffer = await file.arrayBuffer();
          const utf8Text = new TextDecoder("utf-8").decode(buffer);
          const win1252Text = new TextDecoder("windows-1252").decode(buffer);
          return scoreText(win1252Text) > scoreText(utf8Text)
            ? win1252Text
            : utf8Text;
        };

        const csvText = await decodeCsv();
        Papa.parse<Record<string, string>>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const mappedData = (results.data as Record<string, string>[]).map((row, idx) => mapRowToLead(row, idx));
            processImportedLeads(mappedData);
            e.target.value = "";
          },
          error: (error: Error) => {
            console.error("Erro ao processar CSV:", error);
            toast({
              title: "Erro no arquivo",
              description: "Não foi possível processar o arquivo CSV.",
              variant: "destructive",
            });
          }
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Usar raw: false para garantir que datas e números sejam formatados como string se necessário
        const excelData = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<string, any>[];

        if (excelData.length === 0) {
          toast({
            title: "Arquivo vazio",
            description: "Não encontramos dados na primeira aba deste arquivo Excel.",
            variant: "destructive",
          });
          return;
        }

        const mappedData = excelData.map((row, idx) => mapRowToLead(row, idx));
        processImportedLeads(mappedData);
        e.target.value = "";
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo CSV ou XLSX.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao tentar ler o arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleSaveImport = async () => {
    setIsSavingImport(true);
    try {
      // Remove campos temporários e IDs fakes antes de enviar
      const leadsToSave = importingLeads.map(({ id: _id, ...leadData }) => leadData);

      const response = await customFetch(`${API_BASE_URL}/api/admin/master/prospects/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadsToSave),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Importação concluída",
          description: result.skipped > 0 
            ? `${result.count} leads importados. ${result.skipped} já existiam e foram ignorados.`
            : `${result.count} leads importados com sucesso.`,
        });
        setIsImportModalOpen(false);
        setImportingLeads([]);
        fetchProspects();
      } else {
        throw new Error("Falha na importação");
      }
    } catch (error) {
      console.error("Erro ao importar leads:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao tentar salvar os leads importados.",
        variant: "destructive",
      });
    } finally {
      setIsSavingImport(false);
    }
  };

  const handleExport = () => {
    if (filteredProspects.length === 0) {
      toast({
        title: "Nada para exportar",
        description: "Não há prospectos filtrados para exportação.",
        variant: "destructive",
      });
      return;
    }

    // Prepara os dados para exportação com nomes de colunas amigáveis e formatação
    const dataToExport = filteredProspects.map(p => ({
      'Estabelecimento': p.establishmentName,
      'Contato': p.name,
      'Telefone': p.phone,
      'Categoria': p.category,
      'Cidade': p.city || '-',
      'Status': STATUS_LABELS[p.status],
      'Instagram': p.instagramLink || '-',
      'Endereço': p.address || '-',
      'Link Maps': p.mapsLink || '-',
      'Notas': p.notes || '-',
      'Data de Cadastro': new Date(p.createdAt).toLocaleDateString('pt-BR'),
    }));

    // Cria a planilha Excel
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    // Ajusta largura das colunas
    const colWidths = [
      { wch: 30 }, // Estabelecimento
      { wch: 20 }, // Contato
      { wch: 15 }, // Telefone
      { wch: 20 }, // Categoria
      { wch: 15 }, // Cidade
      { wch: 15 }, // Status
      { wch: 25 }, // Instagram
      { wch: 40 }, // Endereço
      { wch: 40 }, // Link Maps
      { wch: 40 }, // Notas
      { wch: 15 }, // Data
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    
    // Nome do arquivo com data atual
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `leads_export_${date}.xlsx`);
    
    toast({
      title: "Exportação concluída",
      description: `${filteredProspects.length} leads exportados com sucesso.`,
    });
  };

  const handleExportCSV = () => {
    if (filteredProspects.length === 0) {
      toast({
        title: "Nada para exportar",
        description: "Não há prospectos filtrados para exportação.",
        variant: "destructive",
      });
      return;
    }

    // Prepara os dados para exportação CSV
    const dataToExport = filteredProspects.map(p => ({
      'Estabelecimento': p.establishmentName,
      'Contato': p.name,
      'Telefone': p.phone,
      'Categoria': p.category,
      'Cidade': p.city || '-',
      'Status': STATUS_LABELS[p.status],
      'Instagram': p.instagramLink || '-',
      'Endereço': p.address || '-',
      'Link Maps': p.mapsLink || '-',
      'Notas': p.notes || '-',
      'Data de Cadastro': new Date(p.createdAt).toLocaleDateString('pt-BR'),
    }));

    // Gera o CSV usando PapaParse
    const csv = Papa.unparse(dataToExport);
    
    // Cria um Blob e faz o download
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação CSV concluída",
      description: `${filteredProspects.length} leads exportados com sucesso (formato leve).`,
    });
  };

  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.establishmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus.length === 0 || filterStatus.includes(p.status);
      const matchesCategory = filterCategory.length === 0 || filterCategory.includes(p.category);
      const matchesCity = filterCity.length === 0 || (p.city && filterCity.includes(p.city));

      return matchesSearch && matchesStatus && matchesCategory && matchesCity;
    });
  }, [prospects, searchTerm, filterStatus, filterCategory, filterCity]);

  const paginatedProspects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProspects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProspects, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProspects.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory, filterCity]);

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

  const renderPagination = () => {
    // Show pagination even if there's only one page if we have leads,
    // so the user can still change itemsPerPage
    if (filteredProspects.length === 0) return null;

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Mostrando {Math.min(filteredProspects.length, (currentPage - 1) * itemsPerPage + 1)} a {Math.min(filteredProspects.length, currentPage * itemsPerPage)} de {filteredProspects.length} leads
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Itens por página</p>
            <Select
              value={`${itemsPerPage}`}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-17.5">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent align="end">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-25 items-center justify-center text-sm font-medium">
            Página {currentPage} de {Math.max(1, totalPages)}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Página anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <span className="sr-only">Próxima página</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Possíveis Clientes</h1>
        <p className="text-muted-foreground">
          Gerencie leads e prospecções para a plataforma.
        </p>
      </div>

      <Tabs defaultValue="base-leads" className="space-y-6">
        <TabsList className="grid w-full max-w-95 grid-cols-2">
          <TabsTrigger value="base-leads">Base de Leads</TabsTrigger>
          <TabsTrigger value="lab-enriquecimento">Lab Enriquecimento</TabsTrigger>
        </TabsList>

        <TabsContent value="base-leads" className="space-y-8 mt-0">
          <div className="flex justify-end items-end">
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
              <Button variant="ghost" onClick={handleDownloadTemplate} title="Baixar Modelo de Importação" className="text-xs text-muted-foreground hover:text-primary h-10">
                <Download className="w-3 h-3 mr-1" />
                Baixar Modelo
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Escolha o formato</h4>
                      <p className="text-sm text-muted-foreground">
                        Excel para uso geral ou CSV para grandes volumes.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Button
                        variant="ghost"
                        className="justify-start font-normal"
                        onClick={handleExport}
                      >
                        <FileDown className="mr-2 h-4 w-4 text-green-600" />
                        Excel (.xlsx)
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start font-normal"
                        onClick={handleExportCSV}
                      >
                        <FileUp className="mr-2 h-4 w-4 text-blue-600" />
                        CSV (Leve/Rápido)
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProspect({ ...newProspect, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp</Label>
                  <Input
                    id="phone"
                    placeholder="Ex: 11999999999"
                    value={newProspect.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProspect({ ...newProspect, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business">Nome do Estabelecimento</Label>
                <Input
                  id="business"
                  placeholder="Ex: Studio Bela Face"
                  value={newProspect.establishmentName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProspect({ ...newProspect, establishmentName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Ex: Sousa"
                  value={newProspect.city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProspect({ ...newProspect, city: e.target.value })}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProspect({ ...newProspect, instagramLink: e.target.value })}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
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
                        onValueChange={(v: string) => setNewProspect({ ...newProspect, category: v })}
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
                    onValueChange={(v: string) => setNewProspect({ ...newProspect, status: v as Prospect["status"] })}
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewProspect({ ...newProspect, notes: e.target.value })}
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
            </div>
          </div>

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
                <div className="min-w-300">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-50">Nome/Estabelecimento</TableHead>
                        <TableHead className="w-45">Categoria</TableHead>
                        <TableHead className="w-37.5">Telefone</TableHead>
                        <TableHead className="w-40">
                          <div className="flex items-center gap-2">
                            Cidade
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              title="Replicar a primeira cidade para todos"
                              onClick={() => {
                                if (importingLeads.length > 0) {
                                  const firstCity = importingLeads[0].city || "";
                                  const newLeads = importingLeads.map(lead => ({
                                    ...lead,
                                    city: firstCity
                                  }));
                                  setImportingLeads(newLeads);
                                  toast({
                                    title: "Cidades replicadas",
                                    description: `A cidade "${firstCity}" foi aplicada a todos os leads.`,
                                  });
                                }
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="w-62.5">Endereço</TableHead>
                        <TableHead className="w-50">Instagram</TableHead>
                        <TableHead className="w-75">Observações</TableHead>
                        <TableHead className="w-17.5 text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importingLeads.map((lead, idx) => (
                        <TableRow key={lead.id}>
                          <TableCell className="p-2">
                            <Input 
                              className="h-8"
                              value={lead.name} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                              onValueChange={(v: string) => {
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
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const newLeads = [...importingLeads];
                                newLeads[idx].phone = e.target.value;
                                setImportingLeads(newLeads);
                              }}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input 
                              className="h-8"
                              value={lead.city} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const newLeads = [...importingLeads];
                                newLeads[idx].city = e.target.value;
                                setImportingLeads(newLeads);
                              }}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input 
                              className="h-8"
                              value={lead.address} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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

        {/* Modal de Edição em Massa */}
        <Dialog open={isBulkEditModalOpen} onOpenChange={setIsBulkEditModalOpen}>
          <DialogContent className="max-w-[98vw] w-[98vw] sm:max-w-[95vw] lg:max-w-7xl max-h-[90vh] flex flex-col p-0">
            <div className="p-6 pb-2">
              <DialogHeader>
                <DialogTitle>Edição em Massa</DialogTitle>
                <DialogDescription>
                  Edite os campos dos leads selecionados e clique em salvar para aplicar em lote.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-6" style={{ maxHeight: "calc(90vh - 200px)" }}>
              <ScrollArea className="h-full w-full border rounded-md">
                <div className="min-w-300">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-50">Estabelecimento</TableHead>
                        <TableHead className="w-40">Contato</TableHead>
                        <TableHead className="w-32">Telefone</TableHead>
                        <TableHead className="w-32">
                          <div className="flex items-center gap-2">
                            Cidade
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              title="Replicar a primeira cidade para todos"
                              onClick={() => {
                                if (bulkEditingLeads.length > 0) {
                                  const firstCity = bulkEditingLeads[0].city || "";
                                  const newLeads = bulkEditingLeads.map(lead => ({
                                    ...lead,
                                    city: firstCity
                                  }));
                                  setBulkEditingLeads(newLeads);
                                  toast({
                                    title: "Cidades replicadas",
                                    description: `A cidade "${firstCity}" foi aplicada a todos os leads selecionados.`,
                                  });
                                }
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="w-40">Categoria</TableHead>
                        <TableHead className="w-32">Status</TableHead>
                        <TableHead className="w-48">Instagram/Site</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkEditingLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                            Nenhum lead selecionado para edição.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bulkEditingLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell>
                              <Input
                                value={lead.establishmentName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleBulkEditFieldChange(lead.id, "establishmentName", e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={lead.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleBulkEditFieldChange(lead.id, "name", e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={lead.phone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleBulkEditFieldChange(lead.id, "phone", e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={lead.city || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleBulkEditFieldChange(lead.id, "city", e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={lead.category}
                                onValueChange={(v: string) => handleBulkEditFieldChange(lead.id, "category", v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                      {cat}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={lead.status}
                                onValueChange={(v: string) =>
                                  handleBulkEditFieldChange(lead.id, "status", v as Prospect["status"])
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Status" />
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
                            <TableCell>
                              <Input
                                value={lead.instagramLink || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleBulkEditFieldChange(lead.id, "instagramLink", e.target.value)
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>

            <div className="p-6 pt-4 border-t">
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveBulkEdit} disabled={isSavingBulkEdit || bulkEditingLeads.length === 0}>
                  {isSavingBulkEdit ? "Salvando..." : `Salvar ${bulkEditingLeads.length} Edições`}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProspect({ ...editingProspect, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Telefone/WhatsApp</Label>
                    <Input
                      id="edit-phone"
                      value={editingProspect.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProspect({ ...editingProspect, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-business">Nome do Estabelecimento</Label>
                  <Input
                    id="edit-business"
                    value={editingProspect.establishmentName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProspect({ ...editingProspect, establishmentName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Cidade</Label>
                  <Input
                    id="edit-city"
                    value={editingProspect.city || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProspect({ ...editingProspect, city: e.target.value })}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProspect({ ...editingProspect, instagramLink: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={editingProspect.category}
                      onValueChange={(v: string) => setEditingProspect({ ...editingProspect, category: v })}
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
                      onValueChange={(v: string) => setEditingProspect({ ...editingProspect, status: v as Prospect["status"] })}
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
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingProspect({ ...editingProspect, notes: e.target.value })}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center bg-muted/30 p-4 rounded-lg border border-muted-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="w-4 h-4" />
                Filtros:
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {/* Filtro de Status */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 border-dashed">
                      <Plus className="mr-2 h-4 w-4" />
                      Status
                      {filterStatus.length > 0 && (
                        <>
                          <Separator orientation="vertical" className="mx-2 h-4" />
                          <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                            {filterStatus.length}
                          </Badge>
                          <div className="hidden space-x-1 lg:flex">
                            {filterStatus.length > 2 ? (
                              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                {filterStatus.length} selecionados
                              </Badge>
                            ) : (
                              Object.entries(STATUS_LABELS)
                                .filter(([value]) => filterStatus.includes(value))
                                .map(([value, label]) => (
                                  <Badge variant="secondary" key={value} className="rounded-sm px-1 font-normal">
                                    {label}
                                  </Badge>
                                ))
                            )}
                          </div>
                        </>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Filtrar status..." />
                      <CommandList>
                        <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
                        <CommandGroup>
                          {Object.entries(STATUS_LABELS).map(([value, label]) => {
                            const isSelected = filterStatus.includes(value);
                            return (
                              <CommandItem
                                key={value}
                                onSelect={() => {
                                  if (isSelected) {
                                    setFilterStatus(filterStatus.filter((s) => s !== value));
                                  } else {
                                    setFilterStatus([...filterStatus, value]);
                                  }
                                }}
                              >
                                <div className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                )}>
                                  <Check className={cn("h-4 w-4")} />
                                </div>
                                <span>{label}</span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                        {filterStatus.length > 0 && (
                          <>
                            <CommandSeparator />
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => setFilterStatus([])}
                                className="justify-center text-center"
                              >
                                Limpar filtros
                              </CommandItem>
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Filtro de Categoria */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 border-dashed">
                      <Plus className="mr-2 h-4 w-4" />
                      Categoria
                      {filterCategory.length > 0 && (
                        <>
                          <Separator orientation="vertical" className="mx-2 h-4" />
                          <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                            {filterCategory.length}
                          </Badge>
                          <div className="hidden space-x-1 lg:flex">
                            {filterCategory.length > 1 ? (
                              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                {filterCategory.length} selecionadas
                              </Badge>
                            ) : (
                              filterCategory.map((cat) => (
                                <Badge variant="secondary" key={cat} className="rounded-sm px-1 font-normal">
                                  {cat}
                                </Badge>
                              ))
                            )}
                          </div>
                        </>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Filtrar categoria..." />
                      <CommandList>
                        <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className="h-72">
                            {categories.map((cat) => {
                              const isSelected = filterCategory.includes(cat);
                              return (
                                <CommandItem
                                  key={cat}
                                  onSelect={() => {
                                    if (isSelected) {
                                      setFilterCategory(filterCategory.filter((c) => c !== cat));
                                    } else {
                                      setFilterCategory([...filterCategory, cat]);
                                    }
                                  }}
                                >
                                  <div className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                  )}>
                                    <Check className={cn("h-4 w-4")} />
                                  </div>
                                  <span>{cat}</span>
                                </CommandItem>
                              );
                            })}
                          </ScrollArea>
                        </CommandGroup>
                        {filterCategory.length > 0 && (
                          <>
                            <CommandSeparator />
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => setFilterCategory([])}
                                className="justify-center text-center"
                              >
                                Limpar filtros
                              </CommandItem>
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Filtro de Cidade */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 border-dashed">
                      <Plus className="mr-2 h-4 w-4" />
                      Cidade
                      {filterCity.length > 0 && (
                        <>
                          <Separator orientation="vertical" className="mx-2 h-4" />
                          <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                            {filterCity.length}
                          </Badge>
                          <div className="hidden space-x-1 lg:flex">
                            {filterCity.length > 1 ? (
                              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                {filterCity.length} selecionadas
                              </Badge>
                            ) : (
                              filterCity.map((city) => (
                                <Badge variant="secondary" key={city} className="rounded-sm px-1 font-normal">
                                  {city}
                                </Badge>
                              ))
                            )}
                          </div>
                        </>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Filtrar cidade..." />
                      <CommandList>
                        <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className={cn(cities.length > 10 ? "h-72" : "h-auto")}>
                            {cities.map((city) => {
                              const isSelected = filterCity.includes(city);
                              return (
                                <CommandItem
                                  key={city}
                                  onSelect={() => {
                                    if (isSelected) {
                                      setFilterCity(filterCity.filter((c) => c !== city));
                                    } else {
                                      setFilterCity([...filterCity, city]);
                                    }
                                  }}
                                >
                                  <div className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                  )}>
                                    <Check className={cn("h-4 w-4")} />
                                  </div>
                                  <span>{city}</span>
                                </CommandItem>
                              );
                            })}
                          </ScrollArea>
                        </CommandGroup>
                        {filterCity.length > 0 && (
                          <>
                            <CommandSeparator />
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => setFilterCity([])}
                                className="justify-center text-center"
                              >
                                Limpar filtros
                              </CommandItem>
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {(filterStatus.length > 0 || filterCategory.length > 0 || filterCity.length > 0 || searchTerm !== "") && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setFilterStatus([]);
                    setFilterCategory([]);
                    setFilterCity([]);
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
          {selectedIds.length > 0 && (
            <div className="mb-4 p-4 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedIds.length} selecionado(s)
                </span>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={handleOpenBulkEdit}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar Selecionados
                  </Button>

                  <Select onValueChange={(v) => handleBulkUpdateStatus(v as Prospect["status"])}>
                    <SelectTrigger className="h-8 w-40 text-xs">
                      <SelectValue placeholder="Mudar Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={(v) => handleBulkUpdateCategory(v)}>
                    <SelectTrigger className="h-8 w-40 text-xs">
                      <SelectValue placeholder="Mudar Categoria" />
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
                    size="sm"
                    variant="destructive"
                    className="h-8"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Selecionados
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="text-xs"
              >
                Cancelar Seleção
              </Button>
            </div>
          )}

          {renderPagination()}

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedIds.length === filteredProspects.length && filteredProspects.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-bold max-w-50 truncate">Estabelecimento</TableHead>
                  <TableHead className="font-bold max-w-37.5 truncate">Contato</TableHead>
                  <TableHead className="font-bold max-w-30 truncate">Categoria</TableHead>
                  <TableHead className="font-bold max-w-25 truncate">Cidade</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      Carregando prospectos...
                    </TableCell>
                  </TableRow>
                ) : filteredProspects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <UserPlus className="h-8 w-8 opacity-20" />
                        <p>Nenhum lead encontrado.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProspects.map((prospect) => (
                    <TableRow 
                      key={prospect.id}
                      className={`hover:bg-muted/30 transition-colors ${selectedIds.includes(prospect.id) ? 'bg-primary/5' : ''}`}
                    >
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.includes(prospect.id)}
                          onCheckedChange={() => toggleSelect(prospect.id)}
                        />
                      </TableCell>
                      <TableCell className="max-w-62.5">
                        <div className="font-semibold truncate" title={prospect.establishmentName}>
                          {prospect.establishmentName}
                        </div>
                        <div className="flex flex-col gap-1 mt-0.5">
                          {prospect.instagramLink && (
                            <a
                              href={prospect.instagramLink.startsWith("http") ? prospect.instagramLink : `https://${prospect.instagramLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 w-fit"
                            >
                              <Instagram className="w-3 h-3" />
                              Instagram
                            </a>
                          )}
                          {prospect.notes && (
                            <p className="text-[10px] text-muted-foreground italic truncate max-w-full" title={prospect.notes}>
                              "{prospect.notes}"
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-37.5">
                        <div className="text-sm truncate" title={prospect.name}>{prospect.name}</div>
                        <div className="text-xs text-muted-foreground truncate" title={prospect.phone}>{prospect.phone}</div>
                      </TableCell>
                      <TableCell className="max-w-30">
                        <Badge 
                          variant="secondary" 
                          className="font-normal truncate max-w-full block"
                          title={prospect.category}
                        >
                          {prospect.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-25">
                        <div className="text-sm truncate" title={prospect.city || ""}>
                          {prospect.city || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(prospect.status)}
                          <select
                            value={prospect.status}
                            onChange={(e) => handleUpdateStatus(prospect.id, e.target.value as Prospect["status"])}
                            className="h-7 rounded border bg-background px-2 text-xs"
                            aria-label={`Alterar status do lead ${prospect.establishmentName}`}
                          >
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
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
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Chamar no WhatsApp"
                            onClick={() => {
                              const phone = prospect.phone.replace(/\D/g, "");
                              if (!phone) return;
                              window.open(`https://wa.me/55${phone}`, "_blank", "noopener,noreferrer");
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
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
          {renderPagination()}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="lab-enriquecimento" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Laboratório de Enriquecimento (QSA via CNPJ)</CardTitle>
              <CardDescription>
                Ambiente de testes para enriquecimento de leads sem poluir a aba principal de possíveis clientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use o script Python em <code>back_end/scripts/enriquecimento_leads_qsa.py</code> para processar seu CSV:
                Nome da Empresa + Cidade -&gt; CNPJ -&gt; QSA (sócios), e-mail societário e capital social.
              </p>
              <div className="rounded-md border bg-muted/40 p-3 text-sm font-mono">
                python back_end/scripts/enriquecimento_leads_qsa.py --input leads.csv --sleep 1.2
              </div>
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                Saída padrão: <strong>leads_enriquecidos_decisores.csv</strong>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
