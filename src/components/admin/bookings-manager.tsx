/** biome-ignore-all lint/correctness/useExhaustiveDependencies: useEffect dependencies are managed manually */
"use client";

import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import {
  type Appointment,
  type AppointmentStatus,
  appointmentService,
} from "@/lib/api-appointments";
import {
  type Booking,
  type BookingStatus,
  getBookingsFromStorage,
  subtractInventoryForService,
} from "@/lib/booking-data";
import { AdminBookingFlow } from "./admin-booking-flow";
import { BookingCard } from "./bookings/booking-card";
import { BookingEmptyState } from "./bookings/booking-empty-state";
import { BookingFilters } from "./bookings/booking-filters";
import { BookingPagination } from "./bookings/booking-pagination";
import { BookingStatusTabs } from "./bookings/booking-status-tabs";
import { EditBookingModal } from "./edit-booking-modal";

// Helper para converter tipos de agendamento da API para o formato legado do Front
const mapApiToBooking = (api: Appointment): Booking => {
  // Converter serviceDurationSnapshot (HH:mm) para minutos (number)
  let durationMinutes = 0;
  if (api.serviceDurationSnapshot?.includes(":")) {
    const [hours, minutes] = api.serviceDurationSnapshot.split(":").map(n => parseInt(n, 10));
    durationMinutes = (hours * 60) + (minutes || 0);
  } else if (api.serviceDurationSnapshot) {
    durationMinutes = parseInt(api.serviceDurationSnapshot, 10);
  }

  const dateObj = parseISO(api.scheduledAt);

  // Mapear status da API para status legado do Front
  const mapStatusFromApi = (status: AppointmentStatus): BookingStatus => {
    const map: Record<AppointmentStatus, BookingStatus> = {
      PENDING: "pendente",
      CONFIRMED: "confirmado",
      COMPLETED: "concluído",
      CANCELLED: "cancelado",
      POSTPONED: "pendente", // Ou criar um novo status se necessário
    };
    return map[status] || "pendente";
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
};

// Helper para converter status legado para o novo formato da API
const mapStatusToApi = (status: BookingStatus): AppointmentStatus => {
  const map: Record<BookingStatus, AppointmentStatus> = {
    pendente: "PENDING",
    pending: "PENDING",
    confirmado: "CONFIRMED",
    concluído: "COMPLETED",
    cancelado: "CANCELLED",
  };
  return map[status] || "PENDING";
};

export function BookingsManager() {
  const { studio } = useStudio();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  });
  const [filterName, setFilterName] = useState<string>("");
  const [filterTime, setFilterTime] = useState<string>("");
  const [filterDay, setFilterDay] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "todos">(
    "todos",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] =
    useState<Booking | null>(null);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);

  const { toast } = useToast();

  // Recarregar agendamentos quando o studio ID ou filtros de data mudarem
  useEffect(() => {
    if (studio?.id) {
      loadBookings();
    }
  }, [studio?.id, startDate, endDate]);

  const loadBookings = async () => {
    if (!studio?.id) return;

    setIsLoading(true);
    try {
      // Converter YYYY-MM-DD para ISO UTC para o backend se necessário, 
      // ou enviar apenas a data se o backend aceitar. 
      // O requisito pede ISO: 2025-02-10T00:00:00Z
      const isoStart = startDate ? `${startDate}T00:00:00Z` : undefined;
      const isoEnd = endDate ? `${endDate}T23:59:59Z` : undefined;

      const apiAppointments = await appointmentService.listByCompanyAdmin(
        studio.id,
        isoStart,
        isoEnd,
      );
      const mappedBookings = apiAppointments.map(mapApiToBooking);
      setBookings(mappedBookings);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível buscar os agendamentos no servidor.",
        variant: "destructive",
      });

      // Fallback para storage se necessário durante transição
      const storageBookings = getBookingsFromStorage();
      if (storageBookings.length > 0) {
        setBookings(storageBookings);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const bookingsAfterFilters = useMemo(() => {
    let filtered = [...bookings];

    // Filtro por Data Inicial
    if (startDate) {
      filtered = filtered.filter((b) => b.date >= startDate);
    }

    // Filtro por Data Final
    if (endDate) {
      filtered = filtered.filter((b) => b.date <= endDate);
    }

    // Filtro por Dia Específico
    if (filterDay) {
      filtered = filtered.filter((b) => b.date === filterDay);
    }

    // Filtro por Nome
    if (filterName) {
      filtered = filtered.filter(
        (b) =>
          b.clientName.toLowerCase().includes(filterName.toLowerCase()) ||
          b.serviceName.toLowerCase().includes(filterName.toLowerCase()),
      );
    }

    // Filtro por Horário
    if (filterTime) {
      filtered = filtered.filter((b) => b.time.includes(filterTime));
    }

    return filtered;
  }, [bookings, startDate, endDate, filterName, filterTime, filterDay]);

  const filteredBookings = useMemo(() => {
    let filtered = [...bookingsAfterFilters];

    // Filtro por Status
    if (statusFilter !== "todos") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Ordenação (Crescente: do mais próximo ao mais distante)
    filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    return filtered;
  }, [bookingsAfterFilters, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {
      todos: bookingsAfterFilters.length,
      pendente: bookingsAfterFilters.filter(
        (b) => b.status === "pendente" || b.status === "pending",
      ).length,
      confirmado: bookingsAfterFilters.filter((b) => b.status === "confirmado")
        .length,
      concluído: bookingsAfterFilters.filter((b) => b.status === "concluído")
        .length,
      cancelado: bookingsAfterFilters.filter((b) => b.status === "cancelado")
        .length,
    };
    return counts;
  }, [bookingsAfterFilters]);

  // Paginação
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleStatusChange = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    try {
      const apiStatus = mapStatusToApi(newStatus);
      await appointmentService.updateStatus(bookingId, apiStatus);

      // Se o status for concluído, subtrair produtos do estoque
      if (newStatus === "concluído") {
        const booking = bookings.find((b) => b.id === bookingId);
        if (booking) {
          const result = subtractInventoryForService(booking.serviceId);
          if (result.success) {
            toast({
              title: "Estoque atualizado",
              description: result.message,
            });
          }
        }
      }

      await loadBookings();

      toast({
        title: `Status atualizado para ${newStatus}`,
        description: "O agendamento foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status no servidor.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        await appointmentService.delete(bookingId);
        await loadBookings();

        toast({
          title: "Agendamento excluído",
          description: "O agendamento foi removido com sucesso",
          variant: "destructive",
        });
      } catch (error) {
        console.error("Erro ao excluir agendamento:", error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível remover o agendamento do servidor.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const variants = {
      pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmado: "bg-blue-100 text-blue-800 border-blue-200",
      concluído: "bg-green-100 text-green-800 border-green-200",
      cancelado: "bg-red-100 text-red-800 border-red-200",
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Gerenciar Agendamentos
        </h2>
        <p className="text-muted-foreground">
          Integração direta com Google Agenda: filtro por datas, status e
          edição.
        </p>
      </div>

      {/* Filtros */}
      <BookingFilters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        filterDay={filterDay}
        setFilterDay={setFilterDay}
        filterName={filterName}
        setFilterName={setFilterName}
        filterTime={filterTime}
        setFilterTime={setFilterTime}
        onRefresh={loadBookings}
      />

      {/* Tabs de Status */}
      <BookingStatusTabs
        statusFilter={statusFilter}
        setStatusFilter={(status) => {
          setStatusFilter(status);
          setCurrentPage(1);
        }}
        statusCounts={statusCounts}
      />

      {/* Paginação Superior */}
      <BookingPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      {/* Lista de Agendamentos */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-lg font-medium">Carregando agendamentos...</p>
          </div>
        ) : paginatedBookings.length === 0 ? (
          <BookingEmptyState />
        ) : (
          paginatedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              getStatusBadge={getStatusBadge}
              handleStatusChange={handleStatusChange}
              handleDelete={handleDelete}
              onReschedule={(b) => {
                setBookingToReschedule(b);
                setIsRescheduleOpen(true);
              }}
              onEdit={(b) => {
                setBookingToEdit(b);
                setIsEditOpen(true);
              }}
            />
          ))
        )}
      </div>
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adiar Agendamento</DialogTitle>
          </DialogHeader>
          {bookingToReschedule && (
            <AdminBookingFlow
              initialBooking={bookingToReschedule}
              onComplete={() => {
                setIsRescheduleOpen(false);
                setBookingToReschedule(null);
                loadBookings();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <EditBookingModal
        booking={bookingToEdit}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setBookingToEdit(null);
        }}
        onSuccess={() => {
          setIsEditOpen(false);
          setBookingToEdit(null);
          loadBookings();
          toast({
            title: "Sucesso!",
            description: "Agendamento atualizado com sucesso.",
          });
        }}
      />
    </div>
  );
}
