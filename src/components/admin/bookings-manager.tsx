/** biome-ignore-all lint/correctness/useExhaustiveDependencies: useEffect dependencies are managed manually */
"use client";

import {
  AlertCircle,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Clock3,
  Edit2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  type Booking,
  type BookingStatus,
  getBookingsFromStorage,
  subtractInventoryForService,
  updateBookingStatus,
} from "@/lib/booking-data";
import { AdminBookingFlow } from "./admin-booking-flow";
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
      concluido: filteredBookings.filter((b) => b.status === "concluido")
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
    if (newStatus === "concluido") {
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
      cancelado: "bg-red-100 text-red-800 border-red-200",
      concluido: "bg-green-100 text-green-800 border-green-200",
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
      <Card className="bg-card/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Data inicial
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Data final
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Filtrar por dia
              </Label>
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="pl-9 bg-background h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Filtrar por nome
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ex.: Maria"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="pl-9 bg-background h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Filtrar por horário
              </Label>
              <div className="relative">
                <Clock3 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="HH:MM"
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  className="pl-9 bg-background h-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadBookings}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Status */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "todos", label: "Todos", color: "bg-gray-100 text-gray-600" },
          {
            id: "pendente",
            label: "Pendente",
            color: "bg-yellow-100 text-yellow-600",
          },
          {
            id: "confirmado",
            label: "Confirmado",
            color: "bg-blue-100 text-blue-600",
          },
          {
            id: "concluido",
            label: "Concluído",
            color: "bg-green-100 text-green-600",
          },
          {
            id: "cancelado",
            label: "Cancelado",
            color: "bg-red-100 text-red-600",
          },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={statusFilter === tab.id ? "default" : "outline"}
            onClick={() => {
              setStatusFilter(tab.id as BookingStatus | "todos");
              setCurrentPage(1);
            }}
            className={`h-9 px-4 rounded-full border-none transition-all ${
              statusFilter === tab.id
                ? ""
                : "bg-secondary/50 hover:bg-secondary"
            }`}
          >
            <span className="mr-2">{tab.label}</span>
            <Badge
              variant="secondary"
              className={`${tab.color} border-none font-bold`}
            >
              {statusCounts[tab.id as keyof typeof statusCounts]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Paginação Superior */}
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            className="h-8 w-8"
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Lista de Agendamentos */}
      <div className="space-y-4">
        {paginatedBookings.length === 0 ? (
          <Card className="bg-secondary/20 border-dashed">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                Nenhum agendamento encontrado com os filtros aplicados
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedBookings.map((booking) => (
            <Card
              key={booking.id}
              className="overflow-hidden border-none shadow-sm bg-card/50 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge
                          className={`${getStatusBadge(booking.status)} uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-sm border`}
                        >
                          {booking.status}
                        </Badge>
                        <h3 className="text-xl font-bold text-foreground">
                          {booking.serviceName} - {booking.clientName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="capitalize">
                            {new Date(
                              `${booking.date}T00:00:00`,
                            ).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "long",
                            })}
                          </span>
                          <span className="mx-2">•</span>
                          <Clock className="w-4 h-4" />
                          <span>
                            {booking.time} ({booking.serviceDuration} min)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground bg-secondary/20 p-4 rounded-lg">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70">
                          Serviço: {booking.serviceName}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70">
                          Cliente: {booking.clientName}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70">
                          Telefone: {booking.clientPhone}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70">
                          Email: {booking.clientEmail || "Não informado"}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70">
                          Valor: R$ {booking.servicePrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="md:col-span-2 mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs italic">
                          [status: {booking.status}]
                        </p>
                        <p className="text-xs">
                          Agendamento criado automaticamente pelo sistema.
                        </p>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(booking.id, "confirmado")
                        }
                        className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(booking.id, "concluido")
                        }
                        className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 font-medium"
                      >
                        Concluir
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(booking.id, "pendente")
                        }
                        className="h-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 font-medium"
                      >
                        Pendente
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(booking.id, "cancelado")
                        }
                        className="h-8 text-red-400 hover:text-red-500 hover:bg-red-50 font-medium"
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBookingToReschedule(booking);
                          setIsRescheduleOpen(true);
                        }}
                        className="h-8 text-muted-foreground hover:bg-secondary font-medium"
                      >
                        Adiar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBookingToEdit(booking);
                          setIsEditOpen(true);
                        }}
                        className="h-8 text-primary hover:bg-primary/5 font-medium"
                      >
                        <Edit2 className="w-3 h-3 mr-1.5" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(booking.id)}
                        className="h-8 font-medium"
                      >
                        Apagar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
