/** biome-ignore-all lint/correctness/useExhaustiveDependencies: useEffect dependencies are managed manually */
"use client";

import {
  AlertTriangle,
  Clock,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getSettingsFromStorage, type Service } from "@/lib/booking-data";
import { cn } from "@/lib/utils";

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [conflictSearch, setConflictSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    const settings = getSettingsFromStorage();
    setServices(settings.services);
  };

  const saveSettings = (updatedServices: Service[]) => {
    const settings = getSettingsFromStorage();
    settings.services = updatedServices;
    localStorage.setItem("studioSettings", JSON.stringify(settings));
    setServices(updatedServices);
    window.dispatchEvent(new Event("studioSettingsUpdated"));
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
      conflictGroupId: "",
      conflictingServiceIds: [],
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      ...service,
      conflictGroupId: service.conflictGroupId || "",
      conflictingServiceIds: service.conflictingServiceIds || [],
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = () => {
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

    const serviceToSave = {
      ...formData,
      conflictGroupId: formData.conflictGroupId?.trim() || undefined,
      conflictingServiceIds: formData.conflictingServiceIds || [],
    } as Service;

    let updatedServices: Service[];
    if (!editingId) {
      updatedServices = [...services, serviceToSave];
    } else {
      updatedServices = services.map((s) =>
        s.id === editingId ? serviceToSave : s,
      );
    }

    saveSettings(updatedServices);
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
    setConflictSearch("");

    toast({
      title: editingId ? "Serviço Atualizado" : "Serviço Adicionado",
      description: `O serviço "${serviceToSave.name}" foi salvo com sucesso.`,
    });
  };

  const toggleConflict = (serviceId: string) => {
    const currentIds = formData.conflictingServiceIds || [];
    const isChecked = currentIds.includes(serviceId);
    const newIds = isChecked
      ? currentIds.filter((id) => id !== serviceId)
      : [...currentIds, serviceId];
    setFormData({
      ...formData,
      conflictingServiceIds: newIds,
    });
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

  const confirmDelete = () => {
    if (!serviceToDelete) return;

    const updatedServices = services.filter((s) => s.id !== serviceToDelete.id);
    saveSettings(updatedServices);
    setIsDeleteConfirmOpen(false);
    setServiceToDelete(null);

    toast({
      title: "Serviço Excluído",
      description: `O serviço "${serviceToDelete.name}" foi removido com sucesso.`,
      variant: "destructive",
    });
  };

  return (
    <div>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
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
                  value={formData.duration || ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      duration: Number.parseInt(e.target.value, 10),
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
                  value={formData.price || ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      price: Number.parseFloat(e.target.value),
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
                checked={formData.showOnHome || false}
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
                  Este serviço aparecerá na seção "Nossos Serviços" da home page.
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

              <div className="space-y-2">
                <Label htmlFor="conflictGroup">
                  Grupo de Conflito (Opcional)
                </Label>
                <Input
                  id="conflictGroup"
                  value={formData.conflictGroupId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conflictGroupId: e.target.value,
                    })
                  }
                  placeholder="Ex: sobrancelhas"
                />
              </div>

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
                      .map((service) => (
                        <div
                          key={service.id}
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

      <div className="grid md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card key={service.id}>
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
                      R$ {service.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
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
        ))}
      </div>
    </div>
  );
}
