"use client";

import { addDays, format, isBefore, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  User,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import { type Appointment, appointmentService } from "@/lib/api-appointments";
import { API_BASE_URL } from "@/lib/auth-client";
import {
  type Booking,
  type BookingStatus,
  type Service,
  saveBookingToStorage,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";

type AdminCalendarProps = {
  service?: Service | null;
  initialDate?: string;
  onTimeSelect?: (date: string, time: string) => void;
  onBack?: () => void;
};

export function AdminCalendar({
  service: _service,
  initialDate,
  onTimeSelect,
  onBack,
}: AdminCalendarProps) {
  const { studio } = useStudio();
  const [currentDate, setCurrentDate] = useState(
    initialDate ? new Date(`${initialDate}T12:00:00`) : new Date(),
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const { toast } = useToast();

  const [newBooking, setNewBooking] = useState({
    clientName: "",
    clientPhone: "",
    serviceIds: [] as string[],
  });

  const getAuthOptions = useCallback(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const sessionToken =
      typeof window !== "undefined"
        ? localStorage.getItem("better-auth.session_token") ||
          localStorage.getItem("better-auth.access_token") ||
          getCookie("better-auth.session_token")
        : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (sessionToken) {
      headers.Authorization = `Bearer ${sessionToken}`;
    }

    return {
      headers,
      credentials: "include" as const,
    };
  }, []);

  const dateStr = format(currentDate, "yyyy-MM-dd");

  const loadServicesFromAPI = useCallback(async () => {
    if (!studio?.id) return;

    try {
      const authOptions = getAuthOptions();

      const response = await fetch(
        `${API_BASE_URL}/api/services/company/${studio.id}`,
        {
          ...authOptions,
        },
      );

      if (response.ok) {
        const data = await response.json();
        const formattedServices = data.map((s: Service) => ({
          ...s,
          price: typeof s.price === "string" ? parseFloat(s.price) : s.price,
          duration:
            typeof s.duration === "string"
              ? parseInt(s.duration, 10)
              : s.duration,
        }));
        setServices(formattedServices);
      }
    } catch (error) {
      console.error("Erro ao carregar serviços no calendário:", error);
    }
  }, [studio?.id, getAuthOptions]);

  const loadAppointmentsFromAPI = useCallback(async () => {
    if (!studio?.id) return;

    try {
      const appointments = await appointmentService.listByCompany(studio.id);
      const mappedBookings: Booking[] = appointments.map(
        (app: Appointment) => ({
          id: app.id,
          serviceId: app.serviceId,
          serviceName: app.serviceNameSnapshot,
          serviceDuration: parseInt(app.serviceDurationSnapshot, 10),
          servicePrice: parseFloat(app.servicePriceSnapshot),
          date: format(new Date(app.scheduledAt), "yyyy-MM-dd"),
          time: format(new Date(app.scheduledAt), "HH:mm"),
          clientName: app.customerName,
          clientEmail: app.customerEmail,
          clientPhone: app.customerPhone,
          status: (app.status.toLowerCase() === "confirmed"
            ? "confirmado"
            : app.status.toLowerCase() === "completed"
              ? "concluído"
              : app.status.toLowerCase() === "cancelled"
                ? "cancelado"
                : "pending") as BookingStatus,
          createdAt: app.createdAt,
          notificationsSent: {
            email: false,
            whatsapp: false,
          },
        }),
      );
      setBookings(mappedBookings);
    } catch (error) {
      console.error("Erro ao carregar agendamentos no calendário:", error);
      // Tratamento gracioso: inicializa com lista vazia para não travar o componente
      setBookings([]);

      // Opcional: mostrar toast apenas se não for um erro de "não autorizado" comum (silencioso)
      if (
        error instanceof Object &&
        "status" in error &&
        error.status !== 401
      ) {
        toast({
          title: "Aviso",
          description: "Não foi possível carregar os agendamentos existentes.",
          variant: "destructive",
        });
      }
    }
  }, [studio?.id, toast]);

  const loadData = useCallback(() => {
    loadServicesFromAPI();
    loadAppointmentsFromAPI();
  }, [loadServicesFromAPI, loadAppointmentsFromAPI]);

  useEffect(() => {
    loadData();

    // Escutar mudanças no localStorage (ex: quando um agendamento é deletado/editado no BookingsManager)
    const handleStorageChange = () => loadData();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("studioSettingsUpdated", loadData);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("studioSettingsUpdated", loadData);
    };
  }, [loadData]);

  const handlePreviousDay = () => setCurrentDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate((prev) => addDays(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleSlotClick = (time: string, _booking?: Booking) => {
    // Definimos o horário selecionado para fixar a previsão visual
    setSelectedTime(time);

    // Removido o bloqueio para permitir que o admin agende mesmo em horários conflitantes
    if (onTimeSelect) {
      onTimeSelect(dateStr, time);
    } else {
      setSelectedTime(time);
      setIsAddDialogOpen(true);
    }
  };

  const handleAddBooking = async () => {
    if (!newBooking.clientName || newBooking.serviceIds.length === 0) {
      toast({
        title: "Erro",
        description:
          "Preencha o nome do cliente e selecione pelo menos um serviço.",
        variant: "destructive",
      });
      return;
    }

    if (!studio?.id) {
      toast({
        title: "Erro",
        description: "Studio não identificado.",
        variant: "destructive",
      });
      return;
    }

    const selectedServices = services.filter((s) =>
      newBooking.serviceIds.includes(s.id),
    );
    if (selectedServices.length === 0) return;

    try {
      // Para múltiplos serviços, o ideal seria criar múltiplos agendamentos ou um "pacote".
      // Aqui, vamos assumir que o admin seleciona um serviço principal ou que o backend suporta apenas um por vez.
      // O código original concatenava serviços. Vamos adaptar para criar um agendamento para cada serviço
      // OU criar apenas para o primeiro (dado que a API espera serviceId único).

      // Decisão: Vamos criar um agendamento para cada serviço selecionado, no mesmo horário (ou sequencial?
      // O código original usava time único).
      // Se houver múltiplos serviços, vamos criar o primeiro e avisar, ou iterar.
      // Simplificação para garantir integridade com a API atual: Iterar e criar.

      const scheduledAt = new Date(
        `${dateStr}T${selectedTime}:00`,
      ).toISOString();

      for (const service of selectedServices) {
        const appointmentData = {
          companyId: studio.id,
          serviceId: service.id,
          customerId: null,
          scheduledAt,
          customerName: newBooking.clientName,
          customerEmail: "", // O modal simples não pede email
          customerPhone: newBooking.clientPhone,
          serviceNameSnapshot: service.name,
          servicePriceSnapshot: service.price.toFixed(2),
          serviceDurationSnapshot: service.duration.toString(),
          notes: "Agendado via Admin Calendar (Criação Rápida)",
        };

        const result = await appointmentService.create(appointmentData);

        const booking: Booking = {
          id: result.id,
          serviceId: service.id,
          serviceName: service.name,
          serviceDuration: service.duration,
          servicePrice: service.price,
          date: dateStr,
          time: selectedTime,
          clientName: newBooking.clientName,
          clientEmail: "",
          clientPhone: newBooking.clientPhone,
          status: "confirmado", // Admin calendar cria como confirmado por padrão no código original
          createdAt: result.createdAt,
          notificationsSent: {
            email: false,
            whatsapp: false,
          },
        };

        // Atualizar status no backend para confirmado, já que criamos como pendente por padrão na API
        if (booking.status === "confirmado") {
          await appointmentService.updateStatus(result.id, "CONFIRMED");
        }

        saveBookingToStorage(booking);
        setBookings((prev) => [...prev, booking]);
      }

      setIsAddDialogOpen(false);
      setNewBooking({ clientName: "", clientPhone: "", serviceIds: [] });

      toast({
        title: "Sucesso",
        description: "Agendamento(s) realizado(s) com sucesso!",
      });

      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String((error as Record<string, unknown>).message)
            : "Falha ao salvar o agendamento no servidor.";
      console.error("Erro ao criar agendamento rápido:", error);
      toast({
        title: "Erro ao criar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Gerar horários do dia (de 10 em 10 minutos como na imagem)
  const SLOT_INTERVAL = 10;
  const timeSlots = useMemo(() => {
    const slots = [];
    const startHour = 0;
    const endHour = 23;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += SLOT_INTERVAL) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  }, []);

  const occupiedSlots = useMemo(() => {
    if (!_service?.duration) return 0;
    return Math.ceil(_service.duration / SLOT_INTERVAL);
  }, [_service]);

  const isTimeInPast = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const slotDate = new Date(currentDate);
    slotDate.setHours(hours, minutes, 0, 0);
    return isBefore(slotDate, now);
  };

  const getOccupyingBooking = (time: string) => {
    return bookings.find((b) => {
      if (b.date !== dateStr || b.status === "cancelado") return false;

      const [startH, startM] = b.time.split(":").map(Number);
      const [currH, currM] = time.split(":").map(Number);

      const startTimeInMinutes = startH * 60 + startM;
      const currTimeInMinutes = currH * 60 + currM;
      const duration = b.serviceDuration;

      return (
        currTimeInMinutes >= startTimeInMinutes &&
        currTimeInMinutes < startTimeInMinutes + duration
      );
    });
  };

  const isPreviewSlot = (time: string) => {
    // Agora mostramos a previsão apenas quando um horário for selecionado (clicado)
    const baseTime = selectedTime;
    if (!baseTime || !_service) return false;

    const [startH, startM] = baseTime.split(":").map(Number);
    const [currH, currM] = time.split(":").map(Number);

    const startTimeInMinutes = startH * 60 + startM;
    const currTimeInMinutes = currH * 60 + currM;
    const duration = _service.duration || 30;

    return (
      currTimeInMinutes >= startTimeInMinutes &&
      currTimeInMinutes < startTimeInMinutes + duration
    );
  };

  const isConflictSlot = (time: string) => {
    if (!_service) return false;

    const [currH, currM] = time.split(":").map(Number);
    const currStart = currH * 60 + currM;
    const duration = _service.duration || 30;
    const currEnd = currStart + duration;

    return bookings.some((b) => {
      if (b.date !== dateStr || b.status === "cancelado") return false;

      const [bH, bM] = b.time.split(":").map(Number);
      const bStart = bH * 60 + bM;
      const bEnd = bStart + b.serviceDuration;

      // Verifica sobreposição: o agendamento que começaria em 'time'
      // entraria no espaço de um agendamento já existente?
      return currStart < bEnd && bStart < currEnd;
    });
  };

  return (
    <Card className="h-auto border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {onBack ? (
              <Button
                variant="ghost"
                onClick={onBack}
                className="w-fit -ml-2 h-8 text-muted-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar para serviços
              </Button>
            ) : (
              <div />
            )}
            <Button
              variant="ghost"
              asChild
              className="h-8 text-muted-foreground"
            >
              <Link
                href={
                  studio?.slug
                    ? `/admin/${studio.slug}/dashboard/agendamentos`
                    : "/admin"
                }
              >
                Ir para Agendamentos
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-primary" />
                Calendário Admin
              </h2>
              {occupiedSlots > 0 && (
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground ml-8">
                  <Clock className="w-3 h-3" />
                  Este procedimento ocupará {occupiedSlots} espaços de{" "}
                  {SLOT_INTERVAL} min
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-8"
            >
              Hoje
            </Button>
          </div>

          <div className="flex items-center justify-between bg-card p-2 rounded-xl border shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousDay}
              className="h-9 w-9"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="text-center">
              <div className="text-sm font-bold capitalize">
                {format(currentDate, "eeee", { locale: ptBR })}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(currentDate, "d 'de' MMMM", { locale: ptBR })}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              className="h-9 w-9"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <div className="bg-white rounded-2xl border shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {timeSlots.map((time) => {
                const booking = getOccupyingBooking(time);
                const isPreview = isPreviewSlot(time);
                const isConflict = isConflictSlot(time);
                const past = isTimeInPast(time);

                return (
                  <div
                    key={time}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => handleSlotClick(time, booking)}
                            className={cn(
                              "h-10 w-full rounded-lg text-sm font-bold transition-all relative overflow-hidden",
                              booking || isPreview || isConflict
                                ? "bg-orange-100 border-orange-200 text-orange-700 hover:bg-orange-200"
                                : past
                                  ? "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                                  : "bg-white border-slate-100 text-slate-600 hover:border-primary/30",
                            )}
                          >
                            {time}
                          </Button>
                        </TooltipTrigger>
                        {booking && (
                          <TooltipContent className="p-3 w-64 bg-white border-orange-100 shadow-xl">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-bold text-orange-700">
                                  {booking.serviceName}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] uppercase"
                                >
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-xs text-slate-600">
                                <p className="flex items-center gap-2">
                                  <User className="w-3 h-3" />{" "}
                                  {booking.clientName}
                                </p>
                                <p className="flex items-center gap-2">
                                  <Clock className="w-3 h-3" /> {booking.time} (
                                  {booking.serviceDuration} min)
                                </p>
                                <p className="text-[10px] text-slate-400 mt-2">
                                  Clique para ver detalhes no gerenciador
                                </p>
                              </div>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>

                    {/* Nome do cliente ou indicador de conflito/previsão */}
                    <div className="w-full overflow-hidden h-4 flex justify-center">
                      {booking ? (
                        <div className="relative w-full overflow-hidden">
                          <span
                            className={cn(
                              "text-[10px] font-medium text-slate-500 whitespace-nowrap block text-center w-full",
                              booking.clientName.length > 10 &&
                                "animate-marquee",
                            )}
                          >
                            {booking.clientName}
                          </span>
                        </div>
                      ) : !isConflict && !isPreview ? (
                        <span className="text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          Livre
                        </span>
                      ) : (
                        <div className="h-4" /> // Espaço vazio para conflitos ou previsão
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="mt-8 flex items-center justify-center gap-6 border-t pt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-50 border border-slate-200" />
                <span className="text-[11px] text-slate-500 font-medium">
                  Passado
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-100 border border-orange-200" />
                <span className="text-[11px] text-slate-500 font-medium">
                  Ocupado/Bloqueado
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white border border-slate-200" />
                <span className="text-[11px] text-slate-500 font-medium">
                  Disponível
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Novo Agendamento (Admin)
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
              <p>
                <strong>Data:</strong> {format(currentDate, "dd/MM/yyyy")}
              </p>
              <p>
                <strong>Horário:</strong> {selectedTime}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">
                * Agendamentos feitos pelo admin não possuem restrições de
                horário.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Cliente</Label>
              <Input
                id="name"
                value={newBooking.clientName}
                onChange={(e) =>
                  setNewBooking((prev) => ({
                    ...prev,
                    clientName: e.target.value,
                  }))
                }
                placeholder="Ex: Maria Oliveira"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                value={newBooking.clientPhone}
                onChange={(e) =>
                  setNewBooking((prev) => ({
                    ...prev,
                    clientPhone: e.target.value,
                  }))
                }
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="grid gap-2">
              <Label>Serviços</Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                {services.map((service, index) => (
                  <div key={service.id ? `${service.id}-${index}` : `service-add-${index}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={newBooking.serviceIds.includes(service.id)}
                      onCheckedChange={(checked) => {
                        setNewBooking((prev) => ({
                          ...prev,
                          serviceIds: checked
                            ? [...prev.serviceIds, service.id]
                            : prev.serviceIds.filter((id) => id !== service.id),
                        }));
                      }}
                    />
                    <label
                      htmlFor={`service-${service.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {service.name} - R$ {service.price}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddBooking}>Agendar Agora</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          padding-left: 100%;
          animation: marquee 10s linear infinite;
        }
      `}</style>
    </Card>
  );
}
