/** biome-ignore-all lint/correctness/useExhaustiveDependencies: useEffect dependencies are managed manually */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  type Booking,
  type BookingStatus,
  getBookingsFromStorage,
  subtractInventoryForService,
  updateBookingStatus,
} from "@/lib/booking-data";
import { AdminBookingFlow } from "./admin-booking-flow";
import { BookingCard } from "./bookings/booking-card";
import { BookingEmptyState } from "./bookings/booking-empty-state";
import { BookingFilters } from "./bookings/booking-filters";
import { BookingPagination } from "./bookings/booking-pagination";
import { BookingStatusTabs } from "./bookings/booking-status-tabs";
import { EditBookingModal } from "./edit-booking-modal";

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
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

  useEffect(() => {
    // Inicializar datas com o mês atual por padrão se não houver filtro
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    setStartDate(firstDay);
    setEndDate(lastDay);
    loadBookings();
  }, []);

  const loadBookings = () => {
    const allBookings = getBookingsFromStorage();
    setBookings(allBookings);
  };

  const filteredBookings = useMemo(() => {
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
  }, [
    bookings,
    startDate,
    endDate,
    filterName,
    filterTime,
    filterDay,
    statusFilter,
  ]);

  const statusCounts = useMemo(() => {
    const counts = {
      todos: filteredBookings.length,
      pendente: filteredBookings.filter((b) => b.status === "pendente").length,
      confirmado: filteredBookings.filter((b) => b.status === "confirmado")
        .length,
      concluído: filteredBookings.filter((b) => b.status === "concluído")
        .length,
      cancelado: filteredBookings.filter((b) => b.status === "cancelado")
        .length,
    };
    return counts;
  }, [filteredBookings]);

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
    updateBookingStatus(bookingId, newStatus);

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

    loadBookings();
    window.dispatchEvent(new Event("storage"));

    toast({
      title: `Status atualizado para ${newStatus}`,
      description: "O agendamento foi atualizado com sucesso.",
    });
  };

  const handleDelete = (bookingId: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      const allBookings = getBookingsFromStorage();
      const updated = allBookings.filter((b) => b.id !== bookingId);
      localStorage.setItem("bookings", JSON.stringify(updated));
      loadBookings();
      window.dispatchEvent(new Event("storage"));

      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi removido com sucesso",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const variants = {
      pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
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
        {paginatedBookings.length === 0 ? (
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
