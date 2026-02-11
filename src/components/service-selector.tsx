"use client";

import { Check, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import {
  type BookingStepSettings,
  getSettingsFromStorage,
  type Service,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";

type ServiceSelectorProps = {
  onSelect: (services: Service[]) => void;
  onConfirm?: () => void;
  selectedServices?: Service[];
  settings?: BookingStepSettings;
  bypassConflicts?: boolean;
};

export function ServiceSelector({
  onSelect,
  onConfirm,
  selectedServices: initialSelected = [],
  settings,
  bypassConflicts = false,
}: ServiceSelectorProps) {
  const { studio } = useStudio();
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service[]>(initialSelected);

  useEffect(() => {
    // Sincroniza o estado interno se initialSelected mudar (importante para reset)
    setSelected(initialSelected);
  }, [initialSelected]);

  useEffect(() => {
    // No flow do cliente, preferimos sempre os dados do studio vindos do context,
    // que são buscados da API com cache: 'no-store'.
    if (studio?.services && studio.services.length > 0) {
      console.log(">>> [SERVICE_SELECTOR] Usando serviços dinâmicos do banco (API):", studio.services.length);
      console.log(">>> [SERVICE_SELECTOR] Detalhes dos serviços carregados:", studio.services.map(s => {
        const advRules = s.advancedRules || s.advanced_rules;
        const conflicts = Array.isArray(advRules) ? advRules : advRules?.conflicts;
        return {
          id: s.id,
          name: s.name,
          conflitos_id: s.conflicting_service_ids || s.conflictingServiceIds,
          conflitos_rules: conflicts,
          grupo: s.conflict_group_id || s.conflictGroupId
        };
      }));
      setServices(studio.services);
    } else {
      // Fallback apenas se o studio ainda não carregou
      const settings = getSettingsFromStorage();
      if (settings?.services) {
        console.log(">>> [SERVICE_SELECTOR] Usando fallback do localStorage:", settings.services.length);
        setServices(settings.services);
      }
    }
  }, [studio]);

  const extractConflicts = (s: Service): string[] => {
     let list: (string | number)[] = [];
     
     // 1. Array direto em advancedRules ou advanced_rules (conforme log do usuário)
     if (Array.isArray(s.advancedRules)) {
       list = [...list, ...s.advancedRules];
     } else if (s.advancedRules && typeof s.advancedRules === 'object' && 'conflicts' in s.advancedRules && Array.isArray(s.advancedRules.conflicts)) {
       list = [...list, ...s.advancedRules.conflicts];
     }
     
     if (Array.isArray(s.advanced_rules)) {
       list = [...list, ...s.advanced_rules];
     } else if (s.advanced_rules && typeof s.advanced_rules === 'object' && 'conflicts' in s.advanced_rules && Array.isArray(s.advanced_rules.conflicts)) {
       list = [...list, ...s.advanced_rules.conflicts];
     }
 
     // 2. Campos diretos (conflicting_service_ids / conflictingServiceIds)
     if (Array.isArray(s.conflicting_service_ids)) {
       list = [...list, ...s.conflicting_service_ids];
     }
     if (Array.isArray(s.conflictingServiceIds)) {
       list = [...list, ...s.conflictingServiceIds];
     }
 
     // Normalização: remover duplicados, nulos e converter para string
     const normalized = Array.from(new Set(list.filter(Boolean).map(id => id.toString())));
     
     if (normalized.length > 0) {
       console.log(`>>> [CONFLICT_PROCESS] Lista de IDs bloqueados extraída para ${s.name}:`, normalized);
     }
     
     return normalized;
   };

  const checkConflict = (service: Service, currentSelected: Service[]) => {
    if (bypassConflicts) return null;
    
    const serviceId = service.id.toString();
    const serviceGroupId = (service.conflict_group_id || service.conflictGroupId)?.toString();
    
    const serviceConflicts = extractConflicts(service);
    
    for (const s of currentSelected) {
      const selectedId = s.id.toString();
      const selectedGroupId = (s.conflict_group_id || s.conflictGroupId)?.toString();
      const selectedConflicts = extractConflicts(s);

      // 1. Conflito por Grupo
      if (serviceGroupId && selectedGroupId && serviceGroupId === selectedGroupId) {
        return `O serviço "${service.name}" conflita com "${s.name}" (mesmo grupo: ${serviceGroupId})`;
      }

      // 2. Conflito individual (Bidirecional)
      if (serviceConflicts.includes(selectedId)) {
        return `O serviço "${service.name}" bloqueia o serviço "${s.name}"`;
      }

      if (selectedConflicts.includes(serviceId)) {
        return `O serviço "${s.name}" bloqueia o serviço "${service.name}"`;
      }
    }
    return null;
  };

  const toggleService = (service: Service) => {
    const isSelected = selected.some((s) => s.id === service.id);
    
    console.log(`>>> [CONFLICT_DEBUG] Clique em: ${service.name} (ID: ${service.id})`);
    console.log(`>>> [CONFLICT_DEBUG] Conflitos Extraídos:`, extractConflicts(service));
    console.log(`>>> [CONFLICT_DEBUG] Já selecionados:`, selected.map((s: Service) => s.id));

    if (isSelected) {
      setSelected(selected.filter((s) => s.id !== service.id));
      return;
    }

    if (!bypassConflicts) {
      const conflict = checkConflict(service, selected);
      if (conflict) {
        console.warn(`>>> [CONFLICT_DEBUG] Bloqueado via Clique: ${conflict}`);
        return;
      }
    }

    setSelected([...selected, service]);
  };

  useEffect(() => {
    onSelect(selected);
  }, [selected, onSelect]);

  const totalPrice = selected.reduce((acc, s) => acc + Number(s.price || 0), 0);
  const totalDuration = selected.reduce((acc, s) => acc + Number(s.duration || 0), 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2
          className="text-2xl font-bold mb-2 transition-all duration-300"
          style={{
            color: settings?.titleColor || "var(--foreground)",
            fontFamily: settings?.titleFont || "var(--font-title)",
          }}
        >
          {settings?.title || "Escolha os Serviços"}
        </h2>
        <p
          className="text-muted-foreground transition-all duration-300"
          style={{
            color: settings?.subtitleColor || "var(--foreground)",
            fontFamily: settings?.subtitleFont || "var(--font-subtitle)",
          }}
        >
          {settings?.subtitle || "Você pode selecionar mais de um serviço"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {services.map((service, index) => {
          const isSelected = selected.some((s) => s.id === service.id);
          
          // Reatividade em tempo real: Lógica de Comparação Bidirecional
          const isConflicting = !isSelected && !bypassConflicts && selected.some(s => {
            const conflictsOfSelected = extractConflicts(s); // IDs que o já selecionado bloqueia
            const conflictsOfCurrent = extractConflicts(service); // IDs que o card atual bloqueia
            
            const serviceId = service.id.toString();
            const selectedId = s.id.toString();
            
            // Bloqueio por ID direto ou por Grupo
            const serviceGroupId = (service.conflict_group_id || service.conflictGroupId)?.toString();
            const selectedGroupId = (s.conflict_group_id || s.conflictGroupId)?.toString();

            return conflictsOfSelected.includes(serviceId) || 
                   conflictsOfCurrent.includes(selectedId) ||
                   (serviceGroupId && selectedGroupId && serviceGroupId === selectedGroupId);
          });

          console.log(`>>> [UI_CHECK] Card: ${service.name} | Conflito detectado: ${isConflicting}`);

          return (
            <Card
              key={service.id ? `${service.id}-${index}` : `service-select-${index}`}
              className={cn(
                "border-border cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden bg-transparent shadow-none",
                isSelected && "ring-1",
                isConflicting && "opacity-40 grayscale cursor-not-allowed border-dashed pointer-events-none",
              )}
              style={{
                borderColor:
                  isSelected && settings?.accentColor
                    ? settings.accentColor
                    : isConflicting 
                      ? "var(--muted)" 
                      : undefined,
                backgroundColor: settings?.cardBgColor || undefined,
              }}
              onClick={() => !isConflicting && toggleService(service)}
            >
              {isSelected && (
                <div
                  className="absolute top-0 right-0 p-1"
                  style={{
                    backgroundColor: settings?.accentColor || "var(--primary)",
                    color: "#fff",
                  }}
                >
                  <Check className="w-3 h-3" />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="font-bold text-lg"
                    style={{
                      color: settings?.titleColor || "var(--foreground)",
                      fontFamily: settings?.titleFont || "var(--font-title)",
                    }}
                  >
                    {service.name}
                  </h3>
                  <div
                    className="font-bold"
                    style={{
                      color: settings?.accentColor || "var(--primary)",
                    }}
                  >
                    R$ {service.price}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration} min
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selected.length > 0 && (
        <Card
          className="border-primary/20 sticky bottom-4 z-10 shadow-lg"
          style={{
            backgroundColor: settings?.cardBgColor || "var(--background)",
            borderColor: settings?.accentColor
              ? `${settings.accentColor}33`
              : undefined,
          }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span
                className="text-xs text-muted-foreground uppercase font-bold tracking-wider"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Total Selecionado
              </span>
              <div className="flex items-center gap-3">
                <span
                  className="text-lg font-bold"
                  style={{
                    color: "var(--foreground)",
                    fontFamily: "var(--font-title)",
                  }}
                >
                  R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-muted-foreground text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {totalDuration} min
                </span>
              </div>
            </div>
            <Button
              onClick={() => onConfirm ? onConfirm() : onSelect(selected)}
              className="px-8 font-bold shadow-md transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: settings?.accentColor || "var(--primary)",
                color: "#fff",
              }}
            >
              Confirmar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
