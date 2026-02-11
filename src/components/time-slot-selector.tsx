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
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import { appointmentService } from "@/lib/api-appointments";
import {
  type Booking,
  type BookingStatus, 
  type BookingStepSettings,
  type DaySchedule, 
  getAvailableTimeSlots,
  parseDuration,
  type Service,
  type TimeSlot
} from "@/lib/booking-data";
import { businessService } from "@/lib/business-service";
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
  const { studio } = useStudio();
  const [backendInterval, setBackendInterval] = useState<number | undefined>(undefined);
  
  // Tenta pegar o intervalo das configurações do step3 (dashboard)
  const forcedInterval = settings?.interval || settings?.slotInterval || settings?.step3Times?.interval;

  // Prioridade: 1) Backend, 2) Settings do step, 3) Fallback 30
  const finalInterval = backendInterval || parseDuration(forcedInterval) || 30;
  
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Buscar agendamentos do backend e atualizar slots
  const fetchBookingsAndSlots = useCallback(async () => {
    if (!studio?.id) return;
    
    setIsLoadingBookings(true);
    try {
      console.log(">>> [TIME_SLOT_SELECTOR] Buscando dados do banco para:", date);
      
      // Buscar configurações, agendamentos e bloqueios em paralelo
      const [settings, appointments, blocks] = await Promise.all([
        businessService.getSettings(studio.id),
        appointmentService.listByCompany(studio.id),
        businessService.getBlocks(studio.id),
      ]);

      console.log(">>> [TIME_SLOT_SELECTOR] Dados recebidos:", {
        hasSettings: !!settings,
        appointmentsCount: appointments?.length,
        blocksCount: blocks?.length
      });

      // 1. Processar Horários de Funcionamento (Schedule)
      let currentDaySchedule: DaySchedule | undefined;
      if (settings?.weekly) {
        const dayOfWeek = parseISO(date).getDay();
        const apiDay = settings.weekly.find(w => parseInt(w.dayOfWeek, 10) === dayOfWeek);
        
        if (apiDay) {
          currentDaySchedule = {
            dayOfWeek,
            dayName: "", 
            isOpen: apiDay.status === "OPEN",
            openTime: apiDay.morningStart,
            lunchStart: apiDay.morningEnd,
            lunchEnd: apiDay.afternoonStart,
            closeTime: apiDay.afternoonEnd,
            interval: parseDuration(settings.interval || settings.slotInterval) || 30
          };

          console.log(">>> [TIME_SLOT_SELECTOR] Schedule processado para o dia:", {
            dayOfWeek,
            isOpen: currentDaySchedule.isOpen,
            morning: `${currentDaySchedule.openTime} - ${currentDaySchedule.lunchStart}`,
            afternoon: `${currentDaySchedule.lunchEnd} - ${currentDaySchedule.closeTime}`,
            interval: currentDaySchedule.interval
          });
          
          if (currentDaySchedule.interval) {
            setBackendInterval(currentDaySchedule.interval);
          }
        }
      }

      // 2. Processar Agendamentos
      const dayAppointments = appointments.filter(app => {
        // Garantir que estamos comparando a data no fuso local, já que o input 'date' (YYYY-MM-DD) é local
        // Se app.scheduledAt for "2024-01-01T03:00:00Z" e estivermos no GTM-3, vira "2024-01-01T00:00:00" local
        const dateObj = new Date(app.scheduledAt);
        const appDate = format(dateObj, "yyyy-MM-dd");
        
        console.log(`>>> [DEBUG_SLOTS] Verificando agendamento: ${app.customerName} - Original: ${app.scheduledAt} -> Local: ${appDate} (Filtro: ${date})`);
        
        return appDate === date && app.status !== 'CANCELLED';
      });

      const convertedBookings: Booking[] = dayAppointments.map(app => {
        let status: BookingStatus = "pending";
        const apiStatus = app.status.toLowerCase();
        if (apiStatus === 'confirmed') status = 'confirmado';
        else if (apiStatus === 'cancelled') status = 'cancelado';
        else if (apiStatus === 'completed') status = 'concluído';
        
        const dateObj = new Date(app.scheduledAt);
        const bookingTime = format(dateObj, "HH:mm");
        const duration = parseDuration(app.serviceDurationSnapshot) || 60;

        console.log(`>>> [DEBUG_SLOTS] Agendamento convertido: ${app.customerName} @ ${bookingTime} (Duração: ${duration}min)`);

        return {
          id: app.id,
          serviceId: app.serviceId,
          serviceName: app.serviceNameSnapshot,
          // Corrigido: Converter "HH:mm" para minutos totais, senão parseInt("01:00") vira 1 minuto
          serviceDuration: duration,
          servicePrice: parseFloat(app.servicePriceSnapshot),
          date: format(dateObj, "yyyy-MM-dd"),
          time: bookingTime,
          clientName: app.customerName,
          clientEmail: app.customerEmail,
          clientPhone: app.customerPhone,
          status,
          createdAt: app.createdAt,
          notificationsSent: { email: false, whatsapp: false }
        };
      });

      console.log(">>> [DEBUG_SLOTS] Agendamentos finais para o dia:", convertedBookings);

      // 3. Gerar Slots
      const intervalToUse = backendInterval || currentDaySchedule?.interval || finalInterval;
      const numericDuration = parseDuration(service.duration) || 60;
      
      console.log(">>> [TIME_SLOT_SELECTOR] Dados para geração de slots:", {
        date,
        duration: numericDuration,
        interval: intervalToUse,
        bookingsCount: convertedBookings.length,
        blocksCount: blocks.length,
        schedule: currentDaySchedule
      });

      const availableSlots = getAvailableTimeSlots(
        date, 
        numericDuration, 
        intervalToUse, 
        convertedBookings,
        currentDaySchedule,
        blocks
      );
      
      console.log(">>> [TIME_SLOT_SELECTOR] Slots gerados:", {
        count: availableSlots.length,
        available: availableSlots.filter(s => s.available).length
      });

      setTimeSlots(availableSlots);
    } catch (error) {
      console.error(">>> [TIME_SLOT_SELECTOR] Erro ao buscar dados:", error);
      setTimeSlots(getAvailableTimeSlots(date, service.duration, finalInterval));
    } finally {
      setIsLoadingBookings(false);
    }
  }, [studio?.id, date, service.duration, finalInterval, backendInterval]);

  // Atualizar horários quando o evento de sincronização ocorrer ou quando as dependências mudarem
  useEffect(() => {
    fetchBookingsAndSlots();

    const handleUpdate = () => {
      fetchBookingsAndSlots();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("bookingTimeUpdate", handleUpdate);
    window.addEventListener("bookingCreated", handleUpdate);
    window.addEventListener("studioSettingsUpdated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("bookingTimeUpdate", handleUpdate);
      window.removeEventListener("bookingCreated", handleUpdate);
      window.removeEventListener("studioSettingsUpdated", handleUpdate);
    };
  }, [fetchBookingsAndSlots]);

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
          backgroundColor: settings?.cardBgColor || "#FFFFFF",
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
          {isLoadingBookings ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground animate-pulse">Verificando horários disponíveis...</p>
            </div>
          ) : (
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
          )}
          {!isLoadingBookings && timeSlots.length === 0 && (
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
