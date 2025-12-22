/** biome-ignore-all lint/correctness/useExhaustiveDependencies: useEffect dependencies are managed manually */
"use client";

import {
  Calendar,
  Clock,
  Download,
  Mail,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  type Booking,
  type BookingStatus,
  getBookingsFromStorage,
  updateBookingStatus,
} from "@/lib/booking-data";
import {
  sendEmailNotification,
  sendWhatsAppNotification,
} from "@/lib/notifications";

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    const allBookings = getBookingsFromStorage();
    const today = new Date().toISOString().split("T")[0];

    // Mostrar apenas agendamentos futuros e do dia
    const filtered = allBookings.filter(
      (b) => b.date >= today && b.status !== "cancelado",
    );

    // Ordenar por data e hora
    filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    setBookings(filtered);
  };

  const handleStatusChange = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    updateBookingStatus(bookingId, newStatus);
    loadBookings();

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      // Enviar notificações
      const notificationData = {
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        serviceName: booking.serviceName,
        date: booking.date,
        time: booking.time,
        duration: booking.serviceDuration || 60,
        price: booking.servicePrice || 0,
      };

      if (newStatus === "confirmado") {
        await sendEmailNotification(notificationData, "confirmation");
        await sendWhatsAppNotification(notificationData, "confirmation");
        toast({
          title: "Agendamento confirmado",
          description: "Notificações enviadas para o cliente",
        });
      } else if (newStatus === "cancelado") {
        await sendEmailNotification(notificationData, "cancellation");
        await sendWhatsAppNotification(notificationData, "cancellation");
        toast({
          title: "Agendamento cancelado",
          description: "Cliente notificado sobre o cancelamento",
        });
      }
    }
  };

  const handleDelete = (bookingId: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      const allBookings = getBookingsFromStorage();
      const updated = allBookings.filter((b) => b.id !== bookingId);
      localStorage.setItem("bookings", JSON.stringify(updated));
      loadBookings();
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi removido com sucesso",
      });
    }
  };

  const exportToGoogle = (booking: Booking) => {
    const duration = booking.serviceDuration || 60;
    const price = booking.servicePrice || 0;

    // Criar link para Google Calendar
    const startDate = new Date(`${booking.date}T${booking.time}`);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.serviceName)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent(`Cliente: ${booking.clientName}\nTelefone: ${booking.clientPhone}\nEmail: ${booking.clientEmail}\nValor: R$ ${price.toFixed(2)}`)}`;

    window.open(googleCalendarUrl, "_blank");
  };

  const getStatusBadge = (status: BookingStatus) => {
    const variants = {
      pendente: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      confirmado: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      cancelado: "bg-red-100 text-red-800 hover:bg-red-100",
      concluido: "bg-green-100 text-green-800 hover:bg-green-100",
    };
    return variants[status] || variants.pendente;
  };

  const getStatusLabel = (status: BookingStatus) => {
    const labels = {
      pendente: "Pendente",
      confirmado: "Confirmado",
      cancelado: "Cancelado",
      concluido: "Concluído",
    };
    return labels[status] || status;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gerenciar Agendamentos</h2>

      {bookings.length === 0 ? (
        <Card className="bg-secondary/30">
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum agendamento encontrado
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const price = booking.servicePrice || 0;
            const duration = booking.serviceDuration || 60;

            const formattedDate = new Date(
              `${booking.date}T00:00:00`,
            ).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
            });

            return (
              <Card key={booking.id} className="bg-secondary/30">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    {/* Header com badge e título */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className={getStatusBadge(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                        <h3 className="text-xl font-semibold mt-2">
                          {booking.serviceName}
                        </h3>
                      </div>
                    </div>

                    {/* Informações do agendamento */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {booking.time} ({duration} min)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.clientPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.clientEmail}</span>
                      </div>
                    </div>

                    {/* Preço */}
                    <div className="text-2xl font-bold text-primary">
                      R$ {price.toFixed(2)}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          handleStatusChange(booking.id, value as BookingStatus)
                        }
                      >
                        <SelectTrigger className="w-45">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="confirmado">Confirmado</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToGoogle(booking)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar p/ Google
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(booking.id)}
                        className="text-destructive hover:text-destructive ml-auto"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
