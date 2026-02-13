/** biome-ignore-all lint/correctness/useExhaustiveDependencies: useEffect dependencies are managed manually */
"use client";

import {
  AlertTriangle,
  Award,
  Briefcase,
  Brush,
  Camera,
  Car,
  Clock,
  Code,
  Coffee,
  Crown,
  Dumbbell,
  Flower2,
  Gem,
  Heart,
  Laptop,
  Medal,
  Moon,
  Music,
  Package,
  Palette,
  Pencil,
  Plane,
  Plus,
  Save,
  Scissors,
  Search,
  ShoppingBag,
  Smartphone,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Trash2,
  Users,
  Utensils,
  Wind,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useStudio } from "@/context/studio-context";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";

const availableIcons = [
  // Beleza & Estética
  {
    id: "Sparkles",
    Icon: Sparkles,
    label: "Brilho / Especial",
    category: "Beleza",
  },
  {
    id: "Scissors",
    Icon: Scissors,
    label: "Corte / Design",
    category: "Beleza",
  },
  {
    id: "Palette",
    Icon: Palette,
    label: "Cor / Maquiagem",
    category: "Beleza",
  },
  { id: "Brush", Icon: Brush, label: "Pincel / Estética", category: "Beleza" },
  { id: "Wind", Icon: Wind, label: "Sopro / Secagem", category: "Beleza" },
  {
    id: "Flower2",
    Icon: Flower2,
    label: "Natural / Floral",
    category: "Beleza",
  },

  // Saúde & Bem-estar
  { id: "Heart", Icon: Heart, label: "Cuidado / Amor", category: "Saúde" },
  {
    id: "Stethoscope",
    Icon: Stethoscope,
    label: "Médico / Saúde",
    category: "Saúde",
  },
  {
    id: "Dumbbell",
    Icon: Dumbbell,
    label: "Fitness / Treino",
    category: "Saúde",
  },
  { id: "Smile", Icon: Smile, label: "Bem-estar / Sorriso", category: "Saúde" },

  // Negócios & Geral
  {
    id: "Briefcase",
    Icon: Briefcase,
    label: "Negócios / Consultoria",
    category: "Geral",
  },
  { id: "Users", Icon: Users, label: "Equipe / Grupo", category: "Geral" },
  { id: "Star", Icon: Star, label: "Estrela / Favorito", category: "Geral" },
  { id: "Award", Icon: Award, label: "Prêmio / Qualidade", category: "Geral" },
  { id: "Medal", Icon: Medal, label: "Medalha / Conquista", category: "Geral" },
  { id: "Crown", Icon: Crown, label: "Premium / VIP", category: "Geral" },
  { id: "Gem", Icon: Gem, label: "Luxo / Joia", category: "Geral" },

  // Alimentação & Lazer
  {
    id: "Coffee",
    Icon: Coffee,
    label: "Café / Pausa",
    category: "Alimentação",
  },
  {
    id: "Utensils",
    Icon: Utensils,
    label: "Restaurante / Comida",
    category: "Alimentação",
  },
  {
    id: "Camera",
    Icon: Camera,
    label: "Fotografia / Mídia",
    category: "Lazer",
  },
  { id: "Music", Icon: Music, label: "Música / Eventos", category: "Lazer" },

  // Tecnologia
  { id: "Laptop", Icon: Laptop, label: "TI / Online", category: "Tecnologia" },
  {
    id: "Smartphone",
    Icon: Smartphone,
    label: "Mobile / App",
    category: "Tecnologia",
  },
  { id: "Code", Icon: Code, label: "Desenvolvimento", category: "Tecnologia" },

  // Outros
  { id: "Plane", Icon: Plane, label: "Viagem / Turismo", category: "Outros" },
  { id: "Car", Icon: Car, label: "Transporte / Auto", category: "Outros" },
  {
    id: "ShoppingBag",
    Icon: ShoppingBag,
    label: "Vendas / Loja",
    category: "Outros",
  },
  { id: "Sun", Icon: Sun, label: "Dia / Externo", category: "Outros" },
  { id: "Moon", Icon: Moon, label: "Noite / Relax", category: "Outros" },
];

import { ArrowDownCircle, HelpCircle, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  type InventoryItem as BookingInventoryItem,
  getInventoryFromStorage,
  getSettingsFromStorage,
  parseDuration,
  type Service,
  saveInventoryToStorage,
  saveSettingsToStorage,
} from "@/lib/booking-data";
import { inventoryService } from "@/lib/inventory-service";
import { cn } from "@/lib/utils";

const API_URL = `${API_BASE_URL}/api/services`.replace(/\/+$/, "");

console.log(">>> [SERVICES_MANAGER] API_BASE_URL:", API_BASE_URL);
console.log(">>> [SERVICES_MANAGER] API_URL configurada para:", API_URL);

interface ServiceResourceItem {
  inventoryId?: string;
  inventory_id?: string;
  productId?: string;
  product_id?: string;
  quantity: number | string;
  unit?: string;
  useSecondaryUnit?: boolean;
  use_secondary_unit?: boolean;
}

interface BackendService {
  id: string;
  name: string;
  description: string;
  duration: string | number;
  price: string | number;
  icon?: string;
  showOnHome?: boolean | string | number;
  show_on_home?: boolean | string | number;
  conflictingServiceIds?: string[];
  conflicting_service_ids?: string[];
  advanced_rules?: {
    conflicts?: string[];
  };
  advancedRules?: {
    conflicts?: string[];
  };
  resources?: ServiceResourceItem[];
  serviceResources?: ServiceResourceItem[];
  service_resources?: ServiceResourceItem[];
  // Campo legado do backend (se ainda existir)
  products?: ServiceResourceItem[];
}

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<BookingInventoryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAddProductSearchOpen, setIsAddProductSearchOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [serviceForProducts, setServiceForProducts] = useState<Service | null>(
    null,
  );
  const [productSearch, setProductSearch] = useState("");
  const [innerProductSearch, setInnerProductSearch] = useState("");
  const [editingConversionId, setEditingConversionId] = useState<string | null>(
    null,
  );
  const [conversionData, setConversionData] = useState<{
    secondaryUnit: string;
    conversionFactor: number;
  }>({ secondaryUnit: "", conversionFactor: 1 });
  const [formData, setFormData] = useState<Partial<Service>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [conflictSearch, setConflictSearch] = useState("");
  const { toast } = useToast();
  const params = useParams();
  const { studio, isLoading: studioLoading } = useStudio();
  const rawSlug = (params as Record<string, string | string[] | undefined>)
    ?.slug;
  const slugParam = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  useEffect(() => {
    if (!studio?.id) return;
    loadServices();
    
    // Carregar produtos da API em vez do localStorage
    const loadInventory = async () => {
      try {
        const data = await inventoryService.list(studio.id);
        const bookingInventoryData = data as unknown as BookingInventoryItem[];
        setAllProducts(bookingInventoryData);
        // Opcional: manter localStorage sincronizado para compatibilidade legada
        saveInventoryToStorage(bookingInventoryData);
      } catch (error) {
        console.error(">>> [SERVICES_MANAGER] Erro ao carregar estoque:", error);
        // Fallback para localStorage se a API falhar
        setAllProducts(getInventoryFromStorage());
      }
    };
    
    loadInventory();
  }, [studio?.id]);

  const loadServices = async () => {
    if (!studio?.id) {
      return;
    }
    setIsLoading(true);
    try {
      const loadUrl = `${API_URL}/company/${studio.id}`.replace(
        /([^:]\/)\/+/g,
        "$1",
      );
      console.log(">>> [SERVICES_MANAGER] Buscando serviços em:", loadUrl);

      const response = await customFetch(loadUrl);

      console.log(">>> [SERVICES_MANAGER] Resposta da API:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(">>> [ADMIN_WARN] Erro na resposta:", errorData);
        throw new Error(`Erro ao carregar serviços (${response.status})`);
      }

      const data = await response.json();
      console.log(">>> [SERVICES_MANAGER] Dados crus da API:", data);

      // Mapear os dados do Back-end (que usa strings decimais) de volta para numbers se necessário
      // e garantir que os campos opcionais existam, tratando advanced_rules vs advancedRules
      const formattedServices = (data as BackendService[]).map((s) => {
        // Extrair conflitos de forma resiliente
        const conflicts =
          s.advanced_rules?.conflicts ||
          s.advancedRules?.conflicts ||
          s.conflictingServiceIds ||
          s.conflicting_service_ids ||
          [];

        // Mapear resources para products (UI legada) para manter compatibilidade
        // Suporta tanto camelCase quanto snake_case do banco
        const rawResources = s.resources || s.serviceResources || s.service_resources || [];
        const mappedProducts = rawResources.map((r: ServiceResourceItem) => ({
          productId: (r.inventoryId || r.inventory_id || r.productId || r.product_id || "") as string,
          quantity: typeof r.quantity === "string" ? parseFloat(r.quantity) : r.quantity,
          useSecondaryUnit: !!(r.useSecondaryUnit || r.use_secondary_unit)
        }));

        // Fallback para o campo 'products' legado se resources estiver vazio
        const finalProducts = mappedProducts.length > 0 
          ? mappedProducts 
          : (s.products || []).map((p: ServiceResourceItem) => ({
              productId: (p.productId || p.product_id || p.inventoryId || p.inventory_id || "") as string,
              quantity: typeof p.quantity === "string" ? parseFloat(p.quantity) : p.quantity,
              useSecondaryUnit: !!(p.useSecondaryUnit || p.use_secondary_unit)
            }));

        const finalResources = rawResources.map((r: ServiceResourceItem) => ({
          inventoryId: (r.inventoryId || r.inventory_id || r.productId || r.product_id || "") as string,
          quantity: typeof r.quantity === "string" ? parseFloat(r.quantity) : (r.quantity || 0),
          unit: r.unit || "un",
          useSecondaryUnit: !!(r.useSecondaryUnit || r.use_secondary_unit)
        }));

        return {
          ...s,
          price: typeof s.price === "string" ? parseFloat(s.price) : s.price,
          duration: parseDuration(s.duration),
          conflictingServiceIds: Array.isArray(conflicts) ? conflicts : [],
          products: finalProducts,
          resources: finalResources,
          showOnHome: Boolean(s.showOnHome || s.show_on_home),
        };
      });

      console.log(">>> [SERVICES_MANAGER] Serviços formatados com produtos:", formattedServices.map((s) => ({
        name: s.name,
        productCount: s.products?.length || 0,
        products: s.products
      })));

      setServices(formattedServices as Service[]);
      
      // Sincronizar cache local com os dados do banco
      const settings = getSettingsFromStorage();
      settings.services = formattedServices;
      saveSettingsToStorage(settings);
    } catch (error) {
      console.warn(">>> [ADMIN_WARN] Erro ao carregar serviços:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de serviços.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = (updatedServices: Service[]) => {
    const settings = getSettingsFromStorage();
    settings.services = updatedServices;
    saveSettingsToStorage(settings);
    setServices(updatedServices);
    // window.dispatchEvent(new Event("studioSettingsUpdated")); // Já disparado por saveSettingsToStorage
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      id: Date.now().toString(),
      name: "",
      description: "",
      duration: 60,
      price: 0,
      showOnHome: false,
      icon: "Sparkles",
      conflictingServiceIds: [],
      products: [],
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    console.log(">>> [SERVICES_MANAGER] Editando serviço:", service);

    // Extração resiliente de conflitos (suporta advanced_rules, advancedRules ou conflictingServiceIds)
    const getConflicts = (s: Service) => {
      const advRules = s.advancedRules || s.advanced_rules;
      if (Array.isArray(advRules)) return advRules;
      if (advRules?.conflicts) return advRules.conflicts;
      return s.conflictingServiceIds || s.conflicting_service_ids || [];
    };

    const conflicts = getConflicts(service);

    setEditingId(service.id);
    setFormData({
      ...service,
      showOnHome: Boolean(service.showOnHome),
      conflictingServiceIds: Array.isArray(conflicts) ? conflicts : [],
      products: service.products || [],
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const newErrors: Record<string, boolean> = {
      name: !formData.name?.trim(),
      description: !formData.description?.trim(),
      duration:
        !formData.duration ||
        Number.isNaN(formData.duration) ||
        formData.duration < 15,
      price:
        formData.price === undefined ||
        Number.isNaN(formData.price) ||
        formData.price < 0,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((v) => v)) {
      toast({
        title: "Campos Obrigatórios",
        description:
          "Por favor, preencha todos os campos destacados em vermelho corretamente.",
        variant: "destructive",
      });
      return;
    }

    // Criar objeto limpo apenas com o que o backend pediu explicitamente
    // Garante que não haja conflitos com o próprio serviço (self-conflict)
    const sanitizedConflicts = (formData.conflictingServiceIds || []).filter(
      (id) => id !== editingId,
    );

    // Mapear produtos para o formato 'resources' esperado pelo backend
    const resources = (formData.products || []).map(p => {
      const inventoryItem = allProducts.find(i => i.id === p.productId);
      return {
        inventoryId: p.productId,
        quantity: p.quantity,
        unit: p.useSecondaryUnit 
          ? (inventoryItem?.secondaryUnit || inventoryItem?.unit || "") 
          : (inventoryItem?.unit || ""),
        useSecondaryUnit: !!p.useSecondaryUnit
      };
    });

    const cleanData = {
      name: formData.name,
      description: formData.description,
      duration: Math.floor(Number(formData.duration)), // Enviar como número inteiro
      price: Number(formData.price), // Enviar como número decimal
      companyId: studio?.id,
      icon: formData.icon || "Sparkles", // Ícone selecionado
      showOnHome: Boolean(formData.showOnHome), // Força boolean
      advanced_rules: {
        conflicts: sanitizedConflicts,
      },
      resources: resources,
    };

    console.log(">>> [FRONT_SENDING] Payload completo:", {
      ...cleanData,
      advanced_rules_details: cleanData.advanced_rules, // Log explícito para conferência
    });

    try {
      let response: Response;
      if (!editingId) {
        // Criar novo serviço
        response = await customFetch(API_URL, {
          method: "POST",
          body: JSON.stringify(cleanData),
        });
      } else {
        // Atualizar serviço existente
        const putUrl = `${API_URL}/${editingId}`.replace(/([^:]\/)\/+/g, "$1");
        console.log(">>> [SERVICES_MANAGER] Disparando PUT para:", putUrl);

        response = await customFetch(putUrl, {
          method: "PUT",
          body: JSON.stringify(cleanData),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { raw: errorText };
        }

        if (response.status === 500) {
          console.warn(
            ">>> [ADMIN_WARN] [ERRO 500] Resposta Completa do Servidor:",
            errorData,
          );
        }

        const error = errorData as { message?: string; raw?: string };
        throw new Error(
          error.message || error.raw || "Erro ao salvar serviço no servidor",
        );
      }

      toast({
        title: editingId ? "Serviço Atualizado" : "Serviço Adicionado",
        description: `O serviço "${formData.name}" foi salvo com sucesso.`,
      });

      // Atualização otimista do estado local
      if (editingId) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingId
              ? ({
                  ...s,
                  name: cleanData.name || s.name,
                  description: cleanData.description || s.description,
                  duration: cleanData.duration,
                  price: cleanData.price,
                  icon: cleanData.icon,
                  showOnHome: cleanData.showOnHome,
                  conflictingServiceIds: formData.conflictingServiceIds || [],
                  products: formData.products || [],
                  resources: resources,
                } as Service)
              : s,
          ),
        );
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({});
      setConflictSearch("");

      // Recarregar lista do banco para garantir sincronia total em segundo plano
      loadServices();

      // Sincronizar localStorage para compatibilidade com outros componentes
      const getUrl = `${API_URL}/company/${studio?.id}`.replace(
        /([^:]\/)\/+/g,
        "$1",
      );
      const responseGet = await customFetch(getUrl);
      if (responseGet.ok) {
        const latestData = (await responseGet.json()) as BackendService[];
        const formattedForStorage = latestData.map((s) => ({
          ...s,
          price: typeof s.price === "string" ? parseFloat(s.price) : s.price,
          duration:
            typeof s.duration === "string"
              ? parseInt(s.duration, 10)
              : s.duration,
          conflictingServiceIds:
            s.advanced_rules?.conflicts || s.conflictingServiceIds || [],
          showOnHome: Boolean(s.showOnHome),
        })) as Service[];
        saveSettings(formattedForStorage);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.warn(">>> [ADMIN_WARN] Erro ao salvar serviço:", err);
      toast({
        title: "Erro ao Salvar",
        description:
          err.message ||
          "Não foi possível persistir as alterações no Back-end.",
        variant: "destructive",
      });
    }
  };

  const toggleConflict = (serviceId: string) => {
    // Impedir que o serviço seja conflito de si mesmo
    if (serviceId === editingId) {
      console.warn(">>> [SERVICES_MANAGER] Tentativa de auto-conflito ignorada.");
      return;
    }

    const currentIds = formData.conflictingServiceIds || [];
    const isChecked = currentIds.includes(serviceId);
    const newIds = isChecked
      ? currentIds.filter((id) => id !== serviceId)
      : [...currentIds, serviceId];

    console.log(">>> [SERVICES_MANAGER] Atualizando conflitos:", newIds);

    setFormData({
      ...formData,
      conflictingServiceIds: newIds,
    });
  };

  const addProductToService = (productId: string) => {
    if (serviceForProducts) {
      const currentProducts = serviceForProducts.products || [];
      if (currentProducts.find((p) => p.productId === productId)) return;

      setServiceForProducts({
        ...serviceForProducts,
        products: [...currentProducts, { productId, quantity: 1 }],
      });
    } else {
      const currentProducts = formData.products || [];
      if (currentProducts.find((p) => p.productId === productId)) return;

      setFormData({
        ...formData,
        products: [...currentProducts, { productId, quantity: 1 }],
      });
    }
  };

  const removeProductFromService = (productId: string) => {
    if (serviceForProducts) {
      const currentProducts = serviceForProducts.products || [];
      setServiceForProducts({
        ...serviceForProducts,
        products: currentProducts.filter((p) => p.productId !== productId),
      });
    } else {
      const currentProducts = formData.products || [];
      setFormData({
        ...formData,
        products: currentProducts.filter((p) => p.productId !== productId),
      });
    }
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (serviceForProducts) {
      const currentProducts = serviceForProducts.products || [];
      setServiceForProducts({
        ...serviceForProducts,
        products: currentProducts.map((p) =>
          p.productId === productId ? { ...p, quantity } : p,
        ),
      });
    } else {
      const currentProducts = formData.products || [];
      setFormData({
        ...formData,
        products: currentProducts.map((p) =>
          p.productId === productId ? { ...p, quantity } : p,
        ),
      });
    }
  };

  const toggleProductUnit = (productId: string) => {
    if (serviceForProducts) {
      const currentProducts = serviceForProducts.products || [];
      setServiceForProducts({
        ...serviceForProducts,
        products: currentProducts.map((p) =>
          p.productId === productId
            ? { ...p, useSecondaryUnit: !p.useSecondaryUnit }
            : p,
        ),
      });
    } else {
      const currentProducts = formData.products || [];
      setFormData({
        ...formData,
        products: currentProducts.map((p) =>
          p.productId === productId
            ? { ...p, useSecondaryUnit: !p.useSecondaryUnit }
            : p,
        ),
      });
    }
  };

  const handleSaveConversion = async (productId: string) => {
    if (!conversionData.secondaryUnit || conversionData.conversionFactor <= 0) {
      toast({
        title: "Dados Inválidos",
        description:
          "Por favor, preencha a unidade e o fator de conversão corretamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Atualizar no back-end via API
      await inventoryService.update(productId, {
        secondaryUnit: conversionData.secondaryUnit,
        conversionFactor: conversionData.conversionFactor,
      });

      // Recarregar estoque para atualizar estado local
      const updatedInventoryRaw = await inventoryService.list(studio?.id || "");
      const updatedInventory = updatedInventoryRaw as unknown as BookingInventoryItem[];
      setAllProducts(updatedInventory);
      
      // Sincronizar localStorage (opcional, mas bom para consistência legado)
      saveInventoryToStorage(updatedInventory);
      
      setEditingConversionId(null);

      toast({
        title: "Conversão Salva",
        description: "A unidade de consumo foi configurada com sucesso no servidor.",
      });
    } catch (error) {
      console.error(">>> [SERVICES_MANAGER] Erro ao salvar conversão:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar a conversão no servidor.",
        variant: "destructive",
      });
    }
  };

  const handleOpenProductModal = async (service: Service) => {
    setServiceForProducts(service);
    setInnerProductSearch("");
    setIsProductModalOpen(true);
    
    // Garantir que os produtos estejam atualizados ao abrir o modal
    if (studio?.id) {
      try {
        const data = await inventoryService.list(studio.id);
        setAllProducts(data as unknown as BookingInventoryItem[]);
      } catch (error) {
        console.error(">>> [SERVICES_MANAGER] Erro ao atualizar produtos ao abrir modal:", error);
      }
    }
  };

  const handleSaveServiceProducts = async () => {
    if (!serviceForProducts) return;

    try {
      // Garantir que temos os produtos do estoque carregados para pegar as unidades corretas
      let currentAllProducts = allProducts;
      if (currentAllProducts.length === 0 && studio?.id) {
        console.log(">>> [SERVICES_MANAGER] Recarregando estoque antes de salvar...");
        const data = await inventoryService.list(studio.id);
        currentAllProducts = data as unknown as BookingInventoryItem[];
        setAllProducts(currentAllProducts);
      }

      // Mapear produtos da UI para o formato 'resources' esperado pelo backend
      const resources = (serviceForProducts.products || []).map((p) => {
        const inventoryItem = currentAllProducts.find((i) => i.id === p.productId);
        return {
          inventoryId: p.productId,
          quantity: p.quantity,
          unit: p.useSecondaryUnit
            ? inventoryItem?.secondaryUnit || inventoryItem?.unit || ""
            : inventoryItem?.unit || "",
          useSecondaryUnit: !!p.useSecondaryUnit,
        };
      });

      console.log(">>> [SERVICES_MANAGER] Recursos para salvar:", resources);

      const serviceData = {
        ...serviceForProducts,
        companyId: studio?.id,
        price: serviceForProducts.price.toFixed(2),
        duration: serviceForProducts.duration.toString(),
        resources: resources,
      };

      // Remover o campo 'products' legado e outros campos extras antes de enviar
      const { 
        products: _, 
        serviceResources: __, 
        service_resources: ___, 
        ...serviceDataToSubmit 
      } = serviceData as Record<string, unknown>;

      const putProductsUrl = `${API_URL}/${serviceForProducts.id}`.replace(
        /([^:]\/)\/+/g,
        "$1",
      );
      console.log(
        ">>> [SERVICES_MANAGER] Salvando produtos via PUT em:",
        putProductsUrl,
      );

      const response = await customFetch(putProductsUrl, {
        method: "PUT",
        body: JSON.stringify(serviceDataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(">>> [SERVICES_MANAGER] Erro ao salvar:", errorData);
        throw new Error(`Erro ao salvar produtos do serviço: ${response.status}`);
      }

      const updatedService = await response.json();
      console.log(">>> [SERVICES_MANAGER] Resposta do save (PUT):", updatedService);

      toast({
        title: "Produtos Atualizados",
        description: `A configuração de produtos para "${serviceForProducts.name}" foi salva com sucesso.`,
      });

      setIsProductModalOpen(false);
      setServiceForProducts(null);
      setInnerProductSearch("");

      // Recarregar lista do banco
      await loadServices();

      // Sincronizar localStorage
      const syncUrl = `${API_URL}/company/${studio?.id}`.replace(
        /([^:]\/)\/+/g,
        "$1",
      );
      const responseGet = await customFetch(syncUrl);
      if (responseGet.ok) {
        const latestData = await responseGet.json();
        const formattedForStorage = latestData.map((s: BackendService) => ({
          ...s,
          price: typeof s.price === "string" ? parseFloat(s.price) : s.price,
          duration:
            typeof s.duration === "string"
              ? parseInt(s.duration, 10)
              : s.duration,
        }));
        saveSettings(formattedForStorage);
      }
    } catch (error) {
      console.warn(">>> [ADMIN_WARN] Erro ao salvar produtos:", error);
      toast({
        title: "Erro ao Salvar",
        description:
          "Não foi possível salvar a configuração de produtos no Back-end.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
    setErrors({});
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      const deleteUrl = `${API_URL}/${serviceToDelete.id}`.replace(
        /([^:]\/)\/+/g,
        "$1",
      );
      console.log(">>> [SERVICES_MANAGER] Deletando via DELETE em:", deleteUrl);

      const response = await customFetch(deleteUrl, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir serviço no servidor");
      }

      toast({
        title: "Serviço Excluído",
        description: `O serviço "${serviceToDelete.name}" foi removido com sucesso.`,
        variant: "destructive",
      });

      setIsDeleteConfirmOpen(false);
      setServiceToDelete(null);

      // Recarregar lista do banco
      await loadServices();

      // Sincronizar localStorage
      const syncDeleteUrl = `${API_URL}/company/${studio?.id}`.replace(
        /([^:]\/)\/+/g,
        "$1",
      );
      const responseGet = await customFetch(syncDeleteUrl);
      if (responseGet.ok) {
        const latestData = await responseGet.json();
        const formattedForStorage = latestData.map((s: BackendService) => ({
          ...s,
          price: typeof s.price === "string" ? parseFloat(s.price) : s.price,
          duration:
            typeof s.duration === "string"
              ? parseInt(s.duration, 10)
              : s.duration,
        }));
        saveSettings(formattedForStorage);
      }
    } catch (error) {
      console.warn(">>> [ADMIN_WARN] Erro ao excluir serviço:", error);
      toast({
        title: "Erro ao Excluir",
        description: "Não foi possível remover o serviço do Back-end.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {studioLoading || !studio?.id ? (
        <div className="p-6 text-center text-muted-foreground">
          Carregando{slugParam ? ` (${slugParam})` : "..."}
        </div>
      ) : (
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold">Gerenciar Serviços</h2>
          <Button
            onClick={handleAdd}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Serviço
          </Button>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
            <DialogDescription>
              {editingId 
                ? "Atualize as informações do serviço selecionado." 
                : "Preencha os dados abaixo para cadastrar um novo serviço no sistema."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label
                htmlFor="name"
                className={cn(errors.name && "text-destructive")}
              >
                Nome do Serviço
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: false });
                }}
                placeholder="Ex: Design de Sobrancelhas"
                className={cn(
                  errors.name &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
            </div>

            <div>
              <Label
                htmlFor="description"
                className={cn(errors.description && "text-destructive")}
              >
                Descrição
              </Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description)
                    setErrors({ ...errors, description: false });
                }}
                placeholder="Descreva o serviço"
                rows={3}
                className={cn(
                  errors.description &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
            </div>

            <div>
              <Label className="mb-2 block">Ícone do Serviço</Label>
              <Select
                value={formData.icon || "Sparkles"}
                onValueChange={(val) => setFormData({ ...formData, icon: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    new Set(availableIcons.map((i) => i.category)),
                  ).map((category) => (
                    <SelectGroup key={category}>
                      <div className="text-[10px] uppercase text-muted-foreground px-2 py-1.5 font-bold tracking-wider">
                        {category}
                      </div>
                      {availableIcons
                        .filter((icon) => icon.category === category)
                        .map(({ id, Icon, label }) => (
                          <SelectItem key={id} value={id}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-accent" />
                              <span className="text-sm">{label}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1.5 italic">
                O ícone selecionado será exibido nos cartões de serviços da
                página inicial.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="duration"
                  className={cn(
                    "flex items-center gap-2",
                    errors.duration && "text-destructive",
                  )}
                >
                  <Clock className="w-4 h-4" />
                  Duração (minutos)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={
                    Number.isNaN(formData.duration)
                      ? ""
                      : (formData.duration ?? "")
                  }
                  onChange={(e) => {
                    const val =
                      e.target.value === ""
                        ? Number.NaN
                        : Number.parseInt(e.target.value, 10);
                    setFormData({
                      ...formData,
                      duration: val,
                    });
                    if (errors.duration)
                      setErrors({ ...errors, duration: false });
                  }}
                  placeholder="60"
                  min="15"
                  step="15"
                  className={cn(
                    errors.duration &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
              </div>

              <div>
                <Label
                  htmlFor="price"
                  className={cn(errors.price && "text-destructive")}
                >
                  Preço (R$)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={
                    Number.isNaN(formData.price) ? "" : (formData.price ?? "")
                  }
                  onChange={(e) => {
                    const val =
                      e.target.value === ""
                        ? Number.NaN
                        : Number.parseFloat(e.target.value);
                    setFormData({
                      ...formData,
                      price: val,
                    });
                    if (errors.price) setErrors({ ...errors, price: false });
                  }}
                  placeholder="100"
                  min="0"
                  step="0.01"
                  className={cn(
                    errors.price &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="showOnHome"
                checked={!!formData.showOnHome}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, showOnHome: checked === true })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="showOnHome"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mostrar na página inicial
                </Label>
                <p className="text-xs text-muted-foreground">
                  Este serviço aparecerá na seção "Nossos Serviços" da home
                  page.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-accent/10">
              <div className="flex items-center gap-2 text-accent font-semibold">
                <AlertTriangle className="w-5 h-5" />
                <h3>Configuração de Conflitos</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Selecione os serviços que NÃO podem ser realizados junto com
                este.
              </p>

              <div className="space-y-3">
                <Label>Bloqueio Individual de Serviços</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Pesquisar serviço para conflito..."
                    value={conflictSearch}
                    onChange={(e) => setConflictSearch(e.target.value)}
                  />
                </div>

                <ScrollArea className="h-50 border rounded-md p-4">
                  <div className="space-y-3">
                    {services
                      .filter(
                        (s) =>
                          s.id !== editingId &&
                          (s.name
                            .toLowerCase()
                            .includes(conflictSearch.toLowerCase()) ||
                            s.id
                              .toLowerCase()
                              .includes(conflictSearch.toLowerCase())),
                      )
                      .map((service, index) => (
                        <div
                          key={service.id ? `${service.id}-${index}` : `conflict-${index}`}
                          className={cn(
                            "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                            formData.conflictingServiceIds?.includes(service.id)
                              ? "bg-accent/5 border-accent/20"
                              : "hover:bg-muted/50 border-transparent",
                          )}
                        >
                          <Checkbox
                            id={`conflict-${service.id}`}
                            checked={formData.conflictingServiceIds?.includes(
                              service.id,
                            )}
                            onCheckedChange={() => toggleConflict(service.id)}
                            className="mt-1"
                          />

                          <button
                            type="button"
                            className="grid gap-1.5 leading-none cursor-pointer text-left w-full"
                            onClick={() => toggleConflict(service.id)}
                          >
                            <Label
                              htmlFor={`conflict-${service.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {service.name}
                            </Label>
                          </button>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="py-2 text-base">
              Tem certeza que deseja excluir o serviço{" "}
              <span className="font-bold text-foreground">
                "{serviceToDelete?.name}"
              </span>
              ? Esta ação não pode ser desfeita e removerá permanentemente o
              serviço do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => setServiceToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, Excluir Serviço
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              Produtos: {serviceForProducts?.name}
            </DialogTitle>
            <DialogDescription>
              Configure os produtos consumidos. Use a unidade secundária para
              ajustes finos (ex: gramas).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9 h-9"
                    placeholder="Pesquisar nos produtos utilizados..."
                    value={innerProductSearch}
                    onChange={(e) => setInnerProductSearch(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 border-accent text-accent hover:bg-accent/10 whitespace-nowrap"
                  onClick={() => setIsAddProductSearchOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Adicionar Produto
                </Button>
              </div>

              <Dialog
                open={isAddProductSearchOpen}
                onOpenChange={setIsAddProductSearchOpen}
              >
                <DialogContent className="sm:max-w-100">
                  <DialogHeader>
                    <DialogTitle>Adicionar Produto ao Serviço</DialogTitle>
                    <DialogDescription>
                      Pesquise e selecione um produto do estoque para vincular a este serviço.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="Pesquisar produto..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <ScrollArea className="h-64 pr-4">
                      <div className="space-y-1">
                        {allProducts
                          .filter(
                            (p) =>
                              p.name
                                .toLowerCase()
                                .includes(productSearch.toLowerCase()) &&
                              !serviceForProducts?.products?.find(
                                (sp) => sp.productId === p.id,
                              ),
                          )
                          .map((product) => (
                            <Button
                              key={product.id}
                              variant="ghost"
                              className="w-full justify-between text-sm h-10 px-3 hover:bg-accent/5"
                              onClick={() => {
                                addProductToService(product.id);
                                setIsAddProductSearchOpen(false);
                                setProductSearch("");
                              }}
                            >
                              <div className="flex flex-col items-start">
                                <span>{product.name}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {product.unit}
                                </span>
                              </div>
                              <Plus className="w-4 h-4 text-accent" />
                            </Button>
                          ))}
                        {allProducts.filter(
                          (p) =>
                            p.name
                              .toLowerCase()
                              .includes(productSearch.toLowerCase()) &&
                            !serviceForProducts?.products?.find(
                              (sp) => sp.productId === p.id,
                            ),
                        ).length === 0 && (
                          <div className="p-8 text-center text-muted-foreground">
                            <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">
                              Nenhum produto disponível para adicionar.
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>

              <ScrollArea className="h-112.5 pr-4">
                <div className="space-y-3">
                  {serviceForProducts?.products
                    ?.filter((sp) => {
                      const product = allProducts.find(
                        (p) => p.id === sp.productId,
                      );
                      return product?.name
                        .toLowerCase()
                        .includes(innerProductSearch.toLowerCase());
                    })
                    .map((sp) => {
                      const product = allProducts.find(
                        (p) => p.id === sp.productId,
                      );
                      if (!product) return null;

                      const isEditingConversion =
                        editingConversionId === sp.productId;
                      const canUseSecondary =
                        product.secondaryUnit && product.conversionFactor;

                      return (
                        <div
                          key={sp.productId}
                          className="flex flex-col gap-3 p-3 border rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold flex items-center gap-2">
                              {product.name}
                              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                                Estoque: {product.quantity} {product.unit}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (isEditingConversion) {
                                    setEditingConversionId(null);
                                  } else {
                                    setEditingConversionId(sp.productId);
                                    setConversionData({
                                      secondaryUnit:
                                        product.secondaryUnit || "",
                                      conversionFactor:
                                        product.conversionFactor || 1,
                                    });
                                  }
                                }}
                                className={cn(
                                  "h-7 w-7 p-0",
                                  canUseSecondary
                                    ? "text-muted-foreground"
                                    : "text-accent",
                                )}
                                title={
                                  canUseSecondary
                                    ? "Editar Conversão"
                                    : "Configurar Conversão"
                                }
                              >
                                <Settings2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeProductFromService(sp.productId)
                                }
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {isEditingConversion ? (
                            <div className="space-y-3 p-3 rounded-md bg-accent/5 border border-accent/20">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                                  Configurar Conversão
                                </span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-64">
                                      <p className="text-xs">
                                        Configure como o produto é consumido.
                                        Ex: Se você compra em PACOTE mas usa em
                                        GRAMAS, e 1 pacote tem 500g, a unidade é
                                        "g" e o fator é 500.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-[10px]">
                                    Unidade de Consumo
                                  </Label>
                                  <Select
                                    value={conversionData.secondaryUnit}
                                    onValueChange={(val) =>
                                      setConversionData({
                                        ...conversionData,
                                        secondaryUnit: val,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="un">
                                        Unidade (un)
                                      </SelectItem>
                                      <SelectItem value="g">
                                        Grama (g)
                                      </SelectItem>
                                      <SelectItem value="kg">
                                        Quilograma (kg)
                                      </SelectItem>
                                      <SelectItem value="ml">
                                        Mililitro (ml)
                                      </SelectItem>
                                      <SelectItem value="lt">
                                        Litro (lt)
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px]">
                                    Fator (1 {product.unit} = ?)
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.001"
                                    value={
                                      Number.isNaN(
                                        conversionData.conversionFactor,
                                      )
                                        ? ""
                                        : conversionData.conversionFactor
                                    }
                                    onChange={(e) => {
                                      const val =
                                        e.target.value === ""
                                          ? Number.NaN
                                          : Number(e.target.value);
                                      setConversionData({
                                        ...conversionData,
                                        conversionFactor: val,
                                      });
                                    }}
                                    className="h-8 text-xs"
                                    placeholder="Ex: 500"
                                  />
                                  {!Number.isNaN(
                                    conversionData.conversionFactor,
                                  ) &&
                                    conversionData.secondaryUnit && (
                                      <p className="text-[9px] text-muted-foreground mt-1">
                                        Significa: 1 {product.unit} contém{" "}
                                        {conversionData.conversionFactor}{" "}
                                        {conversionData.secondaryUnit}
                                      </p>
                                    )}
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[10px]"
                                  onClick={() => setEditingConversionId(null)}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 text-[10px] bg-accent"
                                  onClick={() =>
                                    handleSaveConversion(sp.productId)
                                  }
                                >
                                  Salvar Unidade
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Label
                                    htmlFor={`qty-${sp.productId}`}
                                    className="text-xs"
                                  >
                                    Consumo:
                                  </Label>
                                  <Input
                                    id={`qty-${sp.productId}`}
                                    type="number"
                                    min="0.001"
                                    step="0.001"
                                    value={
                                      Number.isNaN(sp.quantity)
                                        ? ""
                                        : sp.quantity
                                    }
                                    onChange={(e) => {
                                      const val =
                                        e.target.value === ""
                                          ? Number.NaN
                                          : Number.parseFloat(e.target.value);
                                      updateProductQuantity(sp.productId, val);
                                    }}
                                    className="w-24 h-8 text-right text-xs"
                                  />
                                  <span className="text-xs font-medium min-w-8">
                                    {sp.useSecondaryUnit
                                      ? product.secondaryUnit
                                      : product.unit}
                                  </span>
                                </div>

                                {canUseSecondary && (
                                  <div className="flex items-center gap-2 bg-accent/5 px-2 py-1 rounded-md border border-accent/10">
                                    <Checkbox
                                      id={`unit-${sp.productId}`}
                                      checked={sp.useSecondaryUnit || false}
                                      onCheckedChange={() =>
                                        toggleProductUnit(sp.productId)
                                      }
                                    />
                                    <Label
                                      htmlFor={`unit-${sp.productId}`}
                                      className="text-[10px] cursor-pointer font-medium"
                                    >
                                      Usar {product.secondaryUnit}
                                    </Label>
                                  </div>
                                )}
                              </div>
                              {sp.useSecondaryUnit &&
                                product.conversionFactor && (
                                  <div className="mt-1 px-1 space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                                      <ArrowDownCircle className="w-3 h-3 text-accent/60" />
                                      Isso retira{" "}
                                      <span className="font-bold text-foreground">
                                        {(
                                          sp.quantity / product.conversionFactor
                                        ).toLocaleString("pt-BR", {
                                          maximumFractionDigits: 4,
                                        })}{" "}
                                        {product.unit}
                                      </span>{" "}
                                      do seu estoque total.
                                    </p>
                                    <p className="text-[9px] text-muted-foreground/70 ml-4">
                                      (Cálculo: {sp.quantity}{" "}
                                      {product.secondaryUnit} ÷{" "}
                                      {product.conversionFactor}{" "}
                                      {product.secondaryUnit} por {product.unit}
                                      )
                                    </p>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  {!serviceForProducts?.products ||
                  serviceForProducts.products.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-lg bg-muted/10">
                      <Package className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Nenhum produto configurado para este serviço.
                      </p>
                    </div>
                  ) : (
                    serviceForProducts.products.filter((sp) => {
                      const product = allProducts.find(
                        (p) => p.id === sp.productId,
                      );
                      return product?.name
                        .toLowerCase()
                        .includes(innerProductSearch.toLowerCase());
                    }).length === 0 && (
                      <div className="text-center py-8 border border-dashed rounded-lg bg-muted/10">
                        <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Nenhum produto encontrado para "{innerProductSearch}".
                        </p>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProductModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveServiceProducts}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Configuração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Carregando serviços...
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Nenhum serviço cadastrado.
          </div>
        ) : (
          services.map((service, index) => (
            <Card key={service.id ? `${service.id}-${index}` : `service-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold mb-1">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {service.duration} min
                      </span>
                      <span className="text-accent font-semibold">
                        R${" "}
                        {(typeof service.price === "string"
                          ? parseFloat(service.price)
                          : service.price
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-accent hover:bg-accent/10"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-62.5">
                          <p className="text-xs">
                            <strong>Configuração de Produtos:</strong> Defina
                            quais itens do estoque são consumidos
                            automaticamente ao concluir este serviço. Você pode
                            configurar quantidades fracionadas (ex: gramas ou
                            ml).
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenProductModal(service)}
                      className="text-accent hover:text-accent hover:bg-accent/10"
                      title="Configurar Produtos"
                    >
                      <Package className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(service)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(service)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
