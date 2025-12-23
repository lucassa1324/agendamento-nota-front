"use client";

import { Check, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSettingsFromStorage, type Service } from "@/lib/booking-data";
import { cn } from "@/lib/utils";

type ServiceSelectorProps = {
  onSelect: (services: Service[]) => void;
  selectedServices?: Service[];
};

export function ServiceSelector({ onSelect, selectedServices: initialSelected = [] }: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service[]>(initialSelected);

  useEffect(() => {
    const settings = getSettingsFromStorage();
    setServices(settings.services);
  }, []);

  const checkConflict = (service: Service, currentSelected: Service[]) => {
    for (const s of currentSelected) {
      // Mesma categoria/grupo de conflito
      if (
        service.conflictGroupId &&
        s.conflictGroupId &&
        service.conflictGroupId === s.conflictGroupId
      ) {
        return `O serviço "${service.name}" não pode ser realizado junto com "${s.name}" (mesmo grupo: ${service.conflictGroupId})`;
      }

      // Conflito individual (A bloqueia B)
      if (service.conflictingServiceIds?.includes(s.id)) {
        return `O serviço "${service.name}" bloqueia o serviço "${s.name}"`;
      }

      // Conflito individual (B bloqueia A)
      if (s.conflictingServiceIds?.includes(service.id)) {
        return `O serviço "${s.name}" bloqueia o serviço "${service.name}"`;
      }
    }
    return null;
  };

  const toggleService = (service: Service) => {
    setSelected((prev) => {
      const isSelected = prev.some((s) => s.id === service.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== service.id);
      }

      const conflict = checkConflict(service, prev);
      if (conflict) {
        return prev;
      }

      return [...prev, service];
    });
  };

  const totalPrice = selected.reduce((acc, s) => acc + s.price, 0);
  const totalDuration = selected.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold mb-2">
          Escolha os Serviços
        </h2>
        <p className="text-muted-foreground">Você pode selecionar mais de um serviço</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {services.map((service) => {
          const isSelected = selected.some((s) => s.id === service.id);
          const conflictMessage = !isSelected ? checkConflict(service, selected) : null;
          const isConflicting = !!conflictMessage;

          return (
            <Card
              key={service.id}
              className={cn(
                "border-border cursor-pointer transition-all hover:border-accent/50 relative overflow-hidden",
                isSelected && "border-accent bg-accent/5 ring-1 ring-accent",
                isConflicting && "opacity-60 grayscale-[0.5] border-destructive/20 cursor-not-allowed"
              )}
              onClick={() => toggleService(service)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-semibold">
                      {service.name}
                    </h3>
                    {isConflicting && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                        Incompatível
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="bg-accent text-accent-foreground rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                  <div className="text-accent font-semibold text-lg">
                    R$ {service.price}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selected.length > 0 && (
        <Card className="sticky bottom-6 border-accent bg-background/80 backdrop-blur-sm shadow-lg z-10">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm">
              <p className="font-medium">
                {selected.length} {selected.length === 1 ? 'serviço selecionado' : 'serviços selecionados'}
              </p>
              <p className="text-muted-foreground">
                Total: <span className="text-accent font-bold">R$ {totalPrice}</span> • {totalDuration} min
              </p>
            </div>
            <Button
              onClick={() => onSelect(selected)}
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground px-8"
            >
              Continuar para Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
