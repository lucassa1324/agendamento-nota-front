/** biome-ignore-all lint/suspicious/noArrayIndexKey: Uso de índices para chaves de elementos puramente visuais e estáticos no calendário */
"use client";

import {
  addMonths,
  endOfMonth,
  format,
  getDay,
  getDaysInMonth,
  isSameDay,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import { type Appointment, appointmentService } from "@/lib/api-appointments";
import type { Booking, BookingStatus } from "@/lib/booking-data";
import { cn } from "@/lib/utils";
import { EditBookingModal } from "./edit-booking-modal";

export function AdminMonthlyCalendar() {
  const { studio } = useStudio();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const loadBookings = useCallback(async () => {
    if (!studio?.id) return;

    setIsLoading(true);
    try {
      const isoStart = startOfMonth(currentMonth).toISOString();
      const isoEnd = endOfMonth(currentMonth).toISOString();

      const apiAppointments = await appointmentService.listByCompanyAdmin(
        studio.id,
        isoStart,
        isoEnd,
      );

      const mappedBookings: Booking[] = apiAppointments.map((api: Appointment) => {
        let durationMinutes = 0;
        if (api.serviceDurationSnapshot?.includes(":")) {
          const [hours, minutes] = api.serviceDurationSnapshot
            .split(":")
            .map((n) => parseInt(n, 10));
          durationMinutes = hours * 60 + (minutes || 0);
        } else if (api.serviceDurationSnapshot) {
          durationMinutes = parseInt(api.serviceDurationSnapshot, 10);
        }

        const dateObj = parseISO(api.scheduledAt);

        const mapStatusFromApi = (status: string): BookingStatus => {
          const s = status.toUpperCase();
          if (s === "CONFIRMED") return "confirmado";
          if (s === "COMPLETED") return "concluído";
          if (s === "CANCELLED") return "cancelado";
          return "pendente";
        };

        return {
          id: api.id,
          serviceId: api.serviceId,
          serviceName: api.serviceNameSnapshot || "Serviço não informado",
          serviceDuration: durationMinutes,
          servicePrice: api.servicePriceSnapshot ? parseFloat(api.servicePriceSnapshot) : 0,
          date: format(dateObj, "yyyy-MM-dd"),
          time: format(dateObj, "HH:mm"),
          clientName: api.customerName || "Cliente não informado",
          clientEmail: api.customerEmail || "",
          clientPhone: api.customerPhone || "",
          status: mapStatusFromApi(api.status),
          createdAt: api.createdAt,
          notificationsSent: { email: false, whatsapp: false },
        };
      });

      setBookings(mappedBookings);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível buscar os agendamentos no servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [studio?.id, currentMonth, toast]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(currentMonth);
  const startingDayOfWeek = getDay(startOfMonth(currentMonth));

  const previousMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const nextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getBookingsForDay = (day: number) => {
    const date = new Date(year, month, day);
    return bookings.filter((b) => isSameDay(parseISO(`${b.date}T12:00:00`), date));
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "confirmado":
        return "bg-green-100 text-green-700 border-green-200";
      case "concluído":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelado":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <Card className="shadow-md border-muted/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Agenda Mensal
          </CardTitle>
          <div className="text-sm text-muted-foreground capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday} className="h-9">
            Hoje
          </Button>
          <div className="flex items-center border rounded-md">
            <Button variant="ghost" size="icon" onClick={previousMonth} className="h-9 w-9 rounded-r-none">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border" />
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9 rounded-l-none">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div className="grid grid-cols-7 border-b border-r">
          {dayNames.map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-l border-t bg-muted/30">
              {day}
            </div>
          ))}

          {/* Empty slots for starting day of week */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 sm:h-32 border-l border-t bg-muted/5" />
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayBookings = getBookingsForDay(day);
            const isToday = isSameDay(new Date(year, month, day), new Date());

            return (
              <div key={day} className={cn("h-24 sm:h-32 border-l border-t p-1 overflow-y-auto group hover:bg-muted/10 transition-colors", isToday && "bg-primary/5")}>
                <div className="flex justify-between items-start mb-1">
                  <span className={cn("text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full", isToday && "bg-primary text-primary-foreground font-bold")}>
                    {day}
                  </span>
                  {dayBookings.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-semibold px-1">
                      {dayBookings.length} {dayBookings.length === 1 ? 'agend.' : 'agends.'}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => handleBookingClick(booking)}
                      className={cn(
                        "w-full text-left text-[10px] px-1.5 py-0.5 rounded border cursor-pointer truncate transition-all hover:scale-[1.02] active:scale-95",
                        getStatusColor(booking.status)
                      )}
                    >
                      <span className="font-bold mr-1">{booking.time}</span>
                      {booking.clientName}
                    </button>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-[9px] text-center text-muted-foreground font-medium py-0.5">
                      + {dayBookings.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty slots for end of week */}
          {Array.from({ length: (7 - ((startingDayOfWeek + daysInMonth) % 7)) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} className="h-24 sm:h-32 border-l border-t bg-muted/5" />
          ))}
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </CardContent>

      {isEditModalOpen && selectedBooking && (
        <EditBookingModal
          booking={selectedBooking}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedBooking(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedBooking(null);
            loadBookings();
          }}
        />
      )}
    </Card>
  );
}
