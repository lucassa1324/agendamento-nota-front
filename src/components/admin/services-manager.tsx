/** biome-ignore-all lint/correctness/useExhaustiveDependencies: useEffect dependencies are managed manually */
"use client";

import { AlertTriangle, Clock, Pencil, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { getSettingsFromStorage, type Service } from "@/lib/booking-data";
import { cn } from "@/lib/utils";

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({});
  const [conflictSearch, setConflictSearch] = useState("");

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
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      id: Date.now().toString(),
      name: "",
      description: "",
      duration: 60,
      price: 0,
      conflictGroupId: "",
      conflictingServiceIds: [],
    });
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      ...service,
      conflictGroupId: service.conflictGroupId || "",
      conflictingServiceIds: service.conflictingServiceIds || [],
    });
  };

  const handleSave = () => {
    if (
      !formData.name ||
      !formData.description ||
      !formData.duration ||
      !formData.price
    ) {
      alert("Preencha todos os campos");
      return;
    }

    const serviceToSave = {
      ...formData,
      conflictGroupId: formData.conflictGroupId?.trim() || undefined,
      conflictingServiceIds: formData.conflictingServiceIds || [],
    } as Service;

    let updatedServices: Service[];
    if (isAdding) {
      updatedServices = [...services, serviceToSave];
    } else {
      updatedServices = services.map((s) =>
        s.id === editingId ? serviceToSave : s,
      );
    }

    saveSettings(updatedServices);
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
    setConflictSearch("");
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
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = (serviceId: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      const updatedServices = services.filter((s) => s.id !== serviceId);
      saveSettings(updatedServices);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold">Gerenciar Serviços</h2>
        {!isAdding && !editingId && (
          <Button
            onClick={handleAdd}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Serviço
          </Button>
        )}
      </div>

      {(isAdding || editingId) && (
        <Card className="mb-6 border-accent/20">
          <CardHeader>
            <CardTitle>
              {isAdding ? "Novo Serviço" : "Editar Serviço"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Serviço</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Design de Sobrancelhas"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva o serviço"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duração (minutos)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: Number.parseInt(e.target.value, 10),
                    })
                  }
                  placeholder="60"
                  min="15"
                  step="15"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tempo necessário para realizar o procedimento
                </p>
              </div>

              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number.parseFloat(e.target.value),
                    })
                  }
                  placeholder="100"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-accent/10">
              <div className="flex items-center gap-2 text-accent font-semibold">
                <AlertTriangle className="w-5 h-5" />
                <h3>Configuração de Conflitos</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Selecione os serviços que NÃO podem ser realizados junto com este.
              </p>

              <div className="space-y-2">
                <Label htmlFor="conflictGroup">Grupo de Conflito (Opcional)</Label>
                <Input
                  id="conflictGroup"
                  value={formData.conflictGroupId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, conflictGroupId: e.target.value })
                  }
                  placeholder="Ex: sobrancelhas"
                />
                <p className="text-xs text-muted-foreground">
                  Serviços do mesmo grupo são bloqueados automaticamente.
                </p>
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
                            <p className="text-[10px] text-muted-foreground">
                              ID: {service.id}
                            </p>
                          </button>
                        </div>
                      ))}
                    {services.filter((s) => s.id !== editingId).length ===
                      0 && (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        Nenhum outro serviço cadastrado.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-accent/10">
              <Button
                onClick={handleSave}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                    onClick={() => handleDelete(service.id)}
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
