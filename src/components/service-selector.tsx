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
  selectedServices?: Service[];
  settings?: BookingStepSettings;
};

export function ServiceSelector({
  onSelect,
  selectedServices: initialSelected = [],
  settings,
}: ServiceSelectorProps) {
  const { studio } = useStudio();
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service[]>(initialSelected);

  useEffect(() => {
    // Se tivermos dados do studio via context (multi-tenant), usamos os serviços dele
    if (studio?.services && studio.services.length > 0) {
      setServices(studio.services);
    } else {
      const settings = getSettingsFromStorage();
      setServices(settings.services);
    }
  }, [studio]);

  const checkConflict = (service: Service, currentSelected: Service[]) => {
    for (const s of currentSelected) {
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
        {services.map((service) => {
          const isSelected = selected.some((s) => s.id === service.id);
          const conflictMessage = !isSelected
            ? checkConflict(service, selected)
            : null;
          const isConflicting = !!conflictMessage;

          return (
            <Card
              key={service.id}
              className={cn(
                "border-border cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden",
                isSelected && "ring-1",
                isConflicting &&
                  "opacity-60 grayscale-[0.5] border-destructive/20 cursor-not-allowed",
              )}
              style={{
                borderColor:
                  isSelected && settings?.accentColor
                    ? settings.accentColor
                    : undefined,
                backgroundColor: isSelected
                  ? settings?.cardBgColor || "var(--muted)"
                  : undefined,
              }}
              onClick={() => toggleService(service)}
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
                  R$ {totalPrice}
                </span>
                <span className="text-muted-foreground text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {totalDuration} min
                </span>
              </div>
            </div>
            <Button
              onClick={() => onSelect(selected)}
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
