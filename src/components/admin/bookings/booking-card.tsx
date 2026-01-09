"use client";

import {
  Calendar,
  Clock,
  Edit2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Booking, type BookingStatus } from "@/lib/booking-data";

interface BookingCardProps {
  booking: Booking;
  getStatusBadge: (status: BookingStatus) => string;
  handleStatusChange: (bookingId: string, newStatus: BookingStatus) => void;
  handleDelete: (bookingId: string) => void;
  onReschedule: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
}

export function BookingCard({
  booking,
  getStatusBadge,
  handleStatusChange,
  handleDelete,
  onReschedule,
  onEdit,
}: BookingCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-sm bg-card/50 hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Badge
                  className={`${getStatusBadge(
                    booking.status,
                  )} uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-sm border`}
                >
                  {booking.status}
                </Badge>
                <h3 className="text-xl font-bold text-foreground">
                  {booking.serviceName} - {booking.clientName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="capitalize">
                    {new Date(`${booking.date}T00:00:00`).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "numeric",
                        month: "long",
                      },
                    )}
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
                <p className="text-xs italic">[status: {booking.status}]</p>
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
                onClick={() => handleStatusChange(booking.id, "confirmado")}
                className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
              >
                Confirmar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange(booking.id, "concluído")}
                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 font-medium"
              >
                Concluir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange(booking.id, "pendente")}
                className="h-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 font-medium"
              >
                Pendente
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange(booking.id, "cancelado")}
                className="h-8 text-red-400 hover:text-red-500 hover:bg-red-50 font-medium"
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReschedule(booking)}
                className="h-8 text-muted-foreground hover:bg-secondary font-medium"
              >
                Adiar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(booking)}
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
  );
}
