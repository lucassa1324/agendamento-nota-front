/** biome-ignore-all lint/correctness/useExhaustiveDependencies: useEffect dependencies are managed manually */
"use client";

import { format, parseISO } from "date-fns";
import {
  CalendarCheck2,
  Loader2,
  Sparkles,
  TrendingUp,
  Users2,
} from "lucide-react";
import { Nunito, Plus_Jakarta_Sans } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  // calculateBookingResources,
  getBookingsFromStorage,
} from "@/lib/booking-data";
import { type InventoryItem, inventoryService } from "@/lib/inventory-service";
import { AdminBookingFlow } from "./admin-booking-flow";
import { BookingCard } from "./bookings/booking-card";
import { BookingEmptyState } from "./bookings/booking-empty-state";
import { BookingFilters } from "./bookings/booking-filters";
import { BookingPagination } from "./bookings/booking-pagination";
import { BookingStatusTabs } from "./bookings/booking-status-tabs";

// Helper para converter tipos de agendamento da API para o formato legado do Front
const mapApiToBooking = (api: Appointment): Booking => {
  // Converter serviceDurationSnapshot (HH:mm) para minutos (number)
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

  // Extrair IDs de serviços (Prioriza appointment_items se disponível)
  let serviceIds: string[] = [];
  if (api.items && api.items.length > 0) {
    serviceIds = api.items.map((item) => item.serviceId);
  } else {
    // Fallback: Tenta separar serviceId por vírgula ou usa o ID único
    serviceIds = api.serviceId
      ? api.serviceId.split(",").map((id) => id.trim())
      : [];
  }

  return {
    id: api.id,
    serviceId: serviceIds.length > 1 ? serviceIds : serviceIds[0] || api.serviceId,
    serviceName: api.serviceNameSnapshot || "Serviço não informado",
    serviceDuration: durationMinutes,
    servicePrice: api.servicePriceSnapshot
      ? parseFloat(api.servicePriceSnapshot)
      : 0,
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

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const nunitoRounded = Nunito({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

export function BookingsManager() {
  const { studio } = useStudio();
  const services = studio?.services || [];
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  });
  const [pendingReversion, setPendingReversion] = useState<{
    bookingId: string;
    newStatus: BookingStatus;
    itemsToReturn: { name: string; quantity: string }[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
      loadInventory();
    }
  }, [studio?.id, startDate, endDate]);

  const loadInventory = async () => {
    if (!studio?.id) return;
    try {
      const items = await inventoryService.list(studio.id, true);
      setInventory(items);
    } catch (error: any) {
      if (error?.status !== 402) {
        console.error("Erro ao carregar estoque:", error);
      }
    }
  };

  const loadBookings = async () => {
    if (!studio?.id) return;

    setIsLoading(true);
    // Também recarrega o estoque para garantir sincronia
    loadInventory();

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
    } catch (error: any) {
      // Silenciar se for erro de faturamento (402)
      if (error?.status === 402) {
        console.warn("BookingsManager: Acesso bloqueado por faturamento.");
      } else {
        console.error("Erro ao carregar agendamentos:", error);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível buscar os agendamentos no servidor.",
          variant: "destructive",
        });
      }

      // Fallback para storage se necessário durante transição ou bloqueio
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

  const overviewMetrics = useMemo(() => {
    const total = filteredBookings.length;
    const confirmed = filteredBookings.filter(
      (b) => b.status === "confirmado",
    ).length;
    const completed = filteredBookings.filter((b) => b.status === "concluído");
    const completedCount = completed.length;
    const expectedRevenue = filteredBookings
      .filter((b) => b.status !== "cancelado")
      .reduce((sum, booking) => sum + Number(booking.servicePrice || 0), 0);
    const completionRate =
      total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
      total,
      confirmed,
      expectedRevenue,
      completionRate,
    };
  }, [filteredBookings]);

  // Paginação
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const processStatusUpdate = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    try {
      const apiStatus = mapStatusToApi(newStatus);
      await appointmentService.updateStatus(bookingId, apiStatus);

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

  const handleStatusChange = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Lógica de reversão de estoque: Concluído -> Pendente
    if (booking.status === "concluído" && newStatus === "pendente") {
      // Backend: "Zero Cálculo". Apenas gatilhamos a ação.
      // A lista de itens retornados será calculada pelo backend baseado no histórico de logs.
      setPendingReversion({ bookingId, newStatus, itemsToReturn: [] });
      return;
    }

    setIsProcessing(true);
    await processStatusUpdate(bookingId, newStatus);
    setIsProcessing(false);
  };

  const handleConfirmReversion = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!pendingReversion) return;

    setIsProcessing(true);

    const { bookingId, newStatus } = pendingReversion;

    // O Backend lida com a lógica de estorno ao receber o status PENDING
    await processStatusUpdate(bookingId, newStatus);

    setPendingReversion(null);
    setIsProcessing(false);
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
    <div className={`${plusJakarta.className} space-y-6`}>
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/20 via-background to-background p-6 md:p-8">
        <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary/90">
              <Sparkles className="h-3.5 w-3.5" />
              Agenda premium
            </div>
            <h2
              className={`${nunitoRounded.className} text-3xl font-extrabold tracking-[-0.02em] text-foreground md:text-4xl`}
            >
              Visão inteligente dos seus agendamentos
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Controle sua agenda com foco em ritmo do dia, previsibilidade de
              receita e acompanhamento de status em tempo real.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-background/80 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
            <CalendarCheck2 className="h-4 w-4 text-primary" />
            Experiencia otimizada para operação diária
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-border/40">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Total no período
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-[-0.02em]">
            {overviewMetrics.total}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users2 className="h-3.5 w-3.5" />
            Agendamentos filtrados
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-border/40">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Confirmados
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-[-0.02em]">
            {overviewMetrics.confirmed}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            Prontos para atendimento
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-border/40">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Receita prevista
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-[-0.02em]">
            R$ {overviewMetrics.expectedRevenue.toFixed(2)}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            Exclui cancelados
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-border/40">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Taxa de conclusão
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-[-0.02em]">
            {overviewMetrics.completionRate}%
          </p>
          <div className="mt-2 h-2 rounded-full bg-muted/70">
            <div
              className="h-2 rounded-full bg-linear-to-r from-primary to-primary/60 transition-all"
              style={{ width: `${overviewMetrics.completionRate}%` }}
            />
          </div>
        </div>
      </section>

      {/* Filtros */}
      <div className="rounded-3xl bg-linear-to-br from-primary/10 via-white to-white p-1">
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
      </div>

      {/* Tabs de Status */}
      <div className="space-y-4 rounded-3xl bg-muted/25 p-4 md:p-5">
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
      </div>

      {/* Lista de Agendamentos */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 text-muted-foreground shadow-sm ring-1 ring-border/40">
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
              inventory={inventory}
              services={services}
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
        <DialogContent className="w-[98vw] max-w-[98vw] sm:max-w-[95vw] lg:max-w-325 max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adiar Agendamento</DialogTitle>
            <DialogDescription>
              Selecione uma nova data e horário para o agendamento de{" "}
              {bookingToReschedule?.clientName}.
            </DialogDescription>
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
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setBookingToEdit(null);
        }}
      >
        <DialogContent className="w-[98vw] max-w-[98vw] sm:max-w-[95vw] lg:max-w-325 max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
            <DialogDescription>
              Atualize cliente, contato, procedimento, valor, data e horário de{" "}
              {bookingToEdit?.clientName}.
            </DialogDescription>
          </DialogHeader>
          {bookingToEdit && (
            <AdminBookingFlow
              initialBooking={bookingToEdit}
              mode="edit"
              onComplete={() => {
                setIsEditOpen(false);
                setBookingToEdit(null);
                loadBookings();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingReversion}
        onOpenChange={(open) => !open && setPendingReversion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reverter Status para Pendente?</AlertDialogTitle>
            <AlertDialogDescription asChild className="space-y-4">
              <div>
                <p>
                  Deseja estornar os produtos deste agendamento para o estoque?
                </p>
                <p className="text-sm text-muted-foreground">
                  Ao confirmar, o backend realizará o estorno automático dos
                  insumos vinculados a todos os itens deste agendamento.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleConfirmReversion}
              disabled={isProcessing}
            >
              {isProcessing ? "Confirmar Estorno" : "Confirmar Estorno"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
