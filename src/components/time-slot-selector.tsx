"use client";

import {
  addDays,
  format,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  type BookingStepSettings,
  getAvailableTimeSlots,
  type Service,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";

type TimeSlotSelectorProps = {
  service: Service;
  date: string;
  onTimeSelect: (time: string) => void;
  onBack: () => void;
  onDateChange: (newDate: string) => void;
  settings?: BookingStepSettings;
};

export function TimeSlotSelector({
  service,
  date,
  onTimeSelect,
  onBack,
  onDateChange,
  settings,
}: TimeSlotSelectorProps) {
  const timeSlots = getAvailableTimeSlots(date, service.duration);
  const currentDate = parseISO(date);
  const formattedDate = format(currentDate, "eeee, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const today = startOfDay(new Date());
  const isPreviousDayDisabled =
    isSameDay(currentDate, today) || isBefore(currentDate, today);

  const handlePreviousDay = () => {
    if (isPreviousDayDisabled) return;
    const prevDay = subDays(currentDate, 1);
    onDateChange(format(prevDay, "yyyy-MM-dd"));
  };

  const handleNextDay = () => {
    const nextDay = addDays(currentDate, 1);
    onDateChange(format(nextDay, "yyyy-MM-dd"));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} size="sm" className="h-9">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar para o calendário
        </Button>
      </div>

      <Card
        className="border-primary/20 overflow-hidden relative"
        style={{
          backgroundColor: settings?.cardBgColor || "var(--muted)",
          borderColor: settings?.accentColor
            ? `${settings.accentColor}33`
            : undefined,
        }}
      >
        <div className="p-6 flex items-center justify-between min-h-35">
          {/* Botão Anterior */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousDay}
            disabled={isPreviousDayDisabled}
            className={cn(
              "h-12 w-12 rounded-xl transition-all duration-200",
              isPreviousDayDisabled
                ? "opacity-20 cursor-not-allowed"
                : "text-primary-foreground shadow-md hover:scale-105 active:scale-95",
            )}
            style={{
              backgroundColor: !isPreviousDayDisabled
                ? settings?.accentColor || "var(--primary)"
                : undefined,
            }}
            title="Dia anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Informações Centralizadas */}
          <div className="flex-1 flex flex-col items-center text-center px-4 space-y-1">
            <h3
              className="font-bold text-xl"
              style={{
                color: settings?.titleColor || "var(--foreground)",
                fontFamily: settings?.titleFont || "var(--font-title)",
              }}
            >
              {service.name}
            </h3>
            <div
              className="text-base font-medium capitalize"
              style={{
                color: settings?.subtitleColor
                  ? `${settings.subtitleColor}cc`
                  : "var(--foreground)",
                fontFamily: settings?.subtitleFont || "var(--font-subtitle)",
              }}
            >
              {format(currentDate, "eeee, d 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-1">
                Duração: {service.duration} minutos
              </span>
            </div>
          </div>

          {/* Botão Próximo */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            className="h-12 w-12 rounded-xl text-primary-foreground shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: settings?.accentColor || "var(--primary)",
            }}
            title="Próximo dia"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </Card>

      <div className="text-center space-y-2">
        <h2
          className="text-3xl font-bold"
          style={{
            color: settings?.titleColor || "var(--foreground)",
            fontFamily: settings?.titleFont || "var(--font-title)",
          }}
        >
          {settings?.title || "Escolha o Horário"}
        </h2>
        <p
          className="capitalize"
          style={{
            color: settings?.subtitleColor || "var(--foreground)",
            fontFamily: settings?.subtitleFont || "var(--font-subtitle)",
          }}
        >
          {formattedDate}
        </p>
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {timeSlots.map((slot) => (
              <Button
                key={slot.time}
                onClick={() => onTimeSelect(slot.time)}
                disabled={!slot.available}
                variant={slot.available ? "outline" : "ghost"}
                className={cn(
                  "h-12 text-base font-medium transition-all duration-200",
                  slot.available
                    ? "hover:text-primary-foreground hover:scale-105 shadow-sm"
                    : "opacity-40 cursor-not-allowed bg-muted/30",
                )}
                style={{
                  borderColor:
                    slot.available && settings?.accentColor
                      ? settings.accentColor
                      : undefined,
                  color:
                    slot.available && settings?.accentColor
                      ? settings.accentColor
                      : "var(--foreground)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  if (slot.available) {
                    e.currentTarget.style.backgroundColor =
                      settings?.accentColor || "var(--primary)";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (slot.available) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color =
                      settings?.accentColor || "var(--foreground)";
                  }
                }}
              >
                {slot.time}
              </Button>
            ))}
          </div>
          {timeSlots.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <div className="inline-flex bg-muted p-3 rounded-full">
                <CalendarIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">
                O estúdio está fechado nesta data.
              </p>
            </div>
          )}
          {timeSlots.length > 0 &&
            timeSlots.every((slot) => !slot.available) && (
              <div className="text-center py-12 space-y-3">
                <div className="inline-flex bg-muted p-3 rounded-full">
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">
                  Nenhum horário disponível para esta data.
                </p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
