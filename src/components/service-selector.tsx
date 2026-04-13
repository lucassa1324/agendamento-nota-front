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
  showTitle?: boolean;
};

export function ServiceSelector({
  onSelect,
  onConfirm,
  selectedServices: initialSelected = [],
  settings,
  bypassConflicts = false,
  showTitle = true,
}: ServiceSelectorProps) {
  const { studio } = useStudio();
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service[]>(initialSelected);

  useEffect(() => {
    // Sincroniza o estado interno se initialSelected mudar (importante para reset)
    setSelected(initialSelected);
  }, [initialSelected]);

  useEffect(() => {
    // Sincroniza os serviços se mudarem no studio
    if (studio?.services) {
      setServices(studio.services);
    }
  }, [studio?.services]);

  useEffect(() => {
    // Se settings for passado via props (modo preview), usamos ele diretamente.
    // O pai BookingFlow já gerencia a prioridade entre rascunho local e studio context.
    if (settings) {
      console.log(
        ">>> [SERVICE_SELECTOR] Usando settings via props (Prioridade Preview):",
        settings.title,
      );
      return;
    }

    // No flow do cliente, preferimos sempre os dados do studio vindos do context,
    // que são buscados da API com cache: 'no-store'.
    if (studio?.services && studio.services.length > 0) {
      console.log(
        ">>> [SERVICE_SELECTOR] Usando serviços dinâmicos do banco (API):",
        studio.services.length,
      );
      setServices(studio.services);
    } else {
      // Fallback apenas se o studio ainda não carregou
      const settings = getSettingsFromStorage();
      if (settings?.services) {
        console.log(
          ">>> [SERVICE_SELECTOR] Usando fallback do localStorage:",
          settings.services.length,
        );
        setServices(settings.services);
      }
    }
  }, [studio, settings]);

  const extractConflicts = (s: Service): string[] => {
    let list: (string | number)[] = [];

    // 1. Array direto em advancedRules ou advanced_rules (conforme log do usuário)
    if (Array.isArray(s.advancedRules)) {
      list = [...list, ...s.advancedRules];
    } else if (
      s.advancedRules &&
      typeof s.advancedRules === "object" &&
      "conflicts" in s.advancedRules &&
      Array.isArray(s.advancedRules.conflicts)
    ) {
      list = [...list, ...s.advancedRules.conflicts];
    }

    if (Array.isArray(s.advanced_rules)) {
      list = [...list, ...s.advanced_rules];
    } else if (
      s.advanced_rules &&
      typeof s.advanced_rules === "object" &&
      "conflicts" in s.advanced_rules &&
      Array.isArray(s.advanced_rules.conflicts)
    ) {
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
    const normalized = Array.from(
      new Set(list.filter(Boolean).map((id) => id.toString())),
    );

    if (normalized.length > 0) {
      console.log(
        `>>> [CONFLICT_PROCESS] Lista de IDs bloqueados extraída para ${s.name}:`,
        normalized,
      );
    }

    return normalized;
  };

  const checkConflict = (service: Service, currentSelected: Service[]) => {
    if (bypassConflicts) return null;

    const serviceId = service.id.toString();
    const serviceGroupId = (
      service.conflict_group_id || service.conflictGroupId
    )?.toString();

    const serviceConflicts = extractConflicts(service);

    console.log(`>>> [CHECK_CONFLICT] Verificando: ${service.name} (ID: ${serviceId}, Group: ${serviceGroupId})`);
    console.log(`>>> [CHECK_CONFLICT] Conflitos do serviço:`, serviceConflicts);
    console.log(`>>> [CHECK_CONFLICT] Serviços selecionados:`, currentSelected.map(s => s.name));

    for (const s of currentSelected) {
      const selectedId = s.id.toString();
      const selectedGroupId = (
        s.conflict_group_id || s.conflictGroupId
      )?.toString();
      const selectedConflicts = extractConflicts(s);

      // 1. Conflito por Grupo
      if (
        serviceGroupId &&
        selectedGroupId &&
        serviceGroupId === selectedGroupId
      ) {
        const msg = `O serviço "${service.name}" conflita com "${s.name}" (mesmo grupo: ${serviceGroupId})`;
        console.warn(`>>> [CHECK_CONFLICT] Conflito de GRUPO detectado:`, msg);
        return msg;
      }

      // 2. Conflito individual (Bidirecional)
      if (serviceConflicts.includes(selectedId)) {
        const msg = `O serviço "${service.name}" bloqueia o serviço "${s.name}"`;
        console.warn(`>>> [CHECK_CONFLICT] Conflito INDIVIDUAL (A bloqueia B) detectado:`, msg);
        return msg;
      }

      if (selectedConflicts.includes(serviceId)) {
        const msg = `O serviço "${s.name}" bloqueia o serviço "${service.name}"`;
        console.warn(`>>> [CHECK_CONFLICT] Conflito INDIVIDUAL (B bloqueia A) detectado:`, msg);
        return msg;
      }
    }
    return null;
  };

  const toggleService = (service: Service) => {
    const isSelected = selected.some((s) => s.id === service.id);

    console.log(
      `>>> [CONFLICT_DEBUG] Clique em: ${service.name} (ID: ${service.id})`,
    );
    console.log(
      `>>> [CONFLICT_DEBUG] Conflitos Extraídos:`,
      extractConflicts(service),
    );
    console.log(
      `>>> [CONFLICT_DEBUG] Já selecionados:`,
      selected.map((s: Service) => s.id),
    );

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
  const totalDuration = selected.reduce(
    (acc, s) => acc + Number(s.duration || 0),
    0,
  );

  const appearance = settings?.appearance || {};
  const settingsRecord = settings as Record<string, unknown> | undefined;

  // Prioridade: Custom Setting > Global Appearance > Default Fallback
  const accentColor =
    settings?.accentColor || appearance.accentColor || "var(--primary)";
  const cardBgColor =
    (settings?.cardBgColor as string) ||
    (settingsRecord?.cardBackgroundColor as string) ||
    (appearance.cardBgColor as string) ||
    ((appearance as Record<string, unknown>)?.cardBackgroundColor as string) ||
    "#ffffff";
  const titleColor = settings?.titleColor || appearance.titleColor || "var(--foreground)";
  const subtitleColor = settings?.subtitleColor || appearance.subtitleColor || "var(--muted-foreground)";
  const titleFont = settings?.titleFont || appearance.titleFont || "var(--font-title)";
  const subtitleFont = settings?.subtitleFont || appearance.subtitleFont || "var(--font-subtitle)";

  console.log(">>> [SERVICE_SELECTOR] Renderizando com settings:", {
    title: settings?.title,
    cardBgColor,
    accentColor,
    bgColor: settings?.bgColor,
    fullSettings: settings,
  });

  return (
    <div className="w-full bg-transparent">
      <div className="space-y-6 p-4 transition-colors duration-300">
      {showTitle && (
        <div className="text-center">
          <h2
            className="text-2xl font-bold mb-2 transition-all duration-300"
            style={{
              color: titleColor,
              fontFamily: titleFont,
            }}
          >
            {settings?.title || "Escolha os Serviços"}
          </h2>
          <p
            className="text-muted-foreground transition-all duration-300"
            style={{
              color: subtitleColor,
              fontFamily: subtitleFont,
            }}
          >
            {settings?.subtitle || "Você pode selecionar mais de um serviço"}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {services.map((service, index) => {
          const isSelected = selected.some((s) => s.id === service.id);

          // Reatividade em tempo real: Lógica de Comparação Bidirecional
          const isConflicting =
            !isSelected &&
            !bypassConflicts &&
            selected.some((s) => {
              const conflictsOfSelected = extractConflicts(s); // IDs que o já selecionado bloqueia
              const conflictsOfCurrent = extractConflicts(service); // IDs que o card atual bloqueia

              const serviceId = service.id.toString();
              const selectedId = s.id.toString();

              // Bloqueio por ID direto ou por Grupo
              const serviceGroupId = (
                service.conflict_group_id || service.conflictGroupId
              )?.toString();
              const selectedGroupId = (
                s.conflict_group_id || s.conflictGroupId
              )?.toString();

              return (
                conflictsOfSelected.includes(serviceId) ||
                conflictsOfCurrent.includes(selectedId) ||
                (serviceGroupId &&
                  selectedGroupId &&
                  serviceGroupId === selectedGroupId)
              );
            });

          console.log(
            `>>> [UI_CHECK] Card: ${service.name} | Conflito detectado: ${isConflicting}`,
          );

          return (
            <Card
              key={
                service.id
                  ? `${service.id}-${index}`
                  : `service-select-${index}`
              }
              className={cn(
                "border-border cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden shadow-none bg-transparent",
                isSelected && "ring-1",
                isConflicting &&
                  "opacity-40 grayscale cursor-not-allowed border-dashed pointer-events-none",
              )}
              style={
                {
                  borderColor: isSelected ? accentColor : undefined,
                  backgroundColor: cardBgColor,
                } as React.CSSProperties
              }
              onClick={() => !isConflicting && toggleService(service)}
            >
              <div
                style={{
                  backgroundColor: isSelected ? accentColor : "transparent",
                }}
                className={cn(
                  "absolute top-0 right-0 p-1 rounded-full",
                  isSelected ? "text-white" : "border",
                )}
              >
                <Check className="w-4 h-4" />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="font-bold text-lg"
                    style={{
                      color: titleColor,
                      fontFamily: titleFont,
                    }}
                  >
                    {service.name}
                  </h3>
                  <div
                    className="font-bold"
                    style={{
                      color: accentColor,
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
          className="border-primary/20 sticky bottom-4 z-20 shadow-xl mx-4 sm:mx-0"
          style={{
            backgroundColor: cardBgColor !== "transparent" ? cardBgColor : "var(--background)",
            borderColor: accentColor
              ? `${accentColor}40`
              : undefined,
          }}
        >
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto sm:justify-start gap-6">
              <div className="flex flex-col">
                <span
                  className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Total Selecionado
                </span>
                <div className="flex items-baseline gap-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-medium text-muted-foreground">R$</span>
                    <span
                      className="text-2xl font-bold tracking-tight"
                      style={{
                        color: "var(--foreground)",
                        fontFamily: "var(--font-title)",
                      }}
                    >
                      {totalPrice.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{totalDuration} min</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={onConfirm}
              style={{ backgroundColor: accentColor }}
              className={cn(
                "w-full sm:w-auto min-w-50 h-12 px-8 text-base font-bold shadow-lg hover:brightness-110 transition-all active:scale-[0.98] shrink-0",
                !accentColor && "bg-primary",
              )}
            >
              Confirmar Seleção
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
