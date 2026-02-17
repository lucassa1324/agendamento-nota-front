"use client";

import { Calendar, Clock, Edit2, Loader2, Package } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Booking, type BookingStatus, calculateBookingResources, type Service } from "@/lib/booking-data";
import type { InventoryItem } from "@/lib/inventory-service";

interface BookingCardProps {
  booking: Booking;
  inventory: InventoryItem[];
  services: Service[];
  getStatusBadge: (status: BookingStatus) => string;
  handleStatusChange: (
    bookingId: string,
    newStatus: BookingStatus
  ) => Promise<void>;
  handleDelete: (bookingId: string) => Promise<void>;
  onReschedule: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
}

export function BookingCard({
  booking,
  inventory,
  services,
  getStatusBadge,
  handleStatusChange,
  handleDelete,
  onReschedule,
  onEdit,
}: BookingCardProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const aggregatedResources = useMemo(() => {
    return calculateBookingResources(booking, services, inventory);
  }, [booking, services, inventory]);

  const onStatusChange = async (
    action: string,
    status: BookingStatus
  ) => {
    if (loadingAction) return;
    setLoadingAction(action);
    try {
      await handleStatusChange(booking.id, status);
    } finally {
      setLoadingAction(null);
    }
  };

  const onDelete = async () => {
    if (loadingAction) return;
    setLoadingAction("delete");
    try {
      await handleDelete(booking.id);
    } finally {
      setLoadingAction(null);
    }
  };

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
                  Valor: R${" "}
                  {(typeof booking.servicePrice === "string"
                    ? parseFloat(booking.servicePrice)
                    : booking.servicePrice || 0
                  ).toFixed(2)}
                </span>
              </div>
              <div className="md:col-span-2 mt-2 pt-2 border-t border-border/50">
                <p className="text-xs italic">[status: {booking.status}]</p>
                <p className="text-xs">
                  Agendamento criado automaticamente pelo sistema.
                </p>
              </div>

              {aggregatedResources.length > 0 && (
                <div className="md:col-span-2 mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Package className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs font-semibold text-muted-foreground">Previsão de Consumo:</p>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {aggregatedResources.map((res, i) => (
                      <li key={`${booking.id}-res-${i}`} className="text-xs flex items-center gap-1.5 text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        <span className="truncate max-w-30" title={res.item.name}>{res.item.name}:</span>
                        <span className="font-mono font-medium text-foreground">
                          {res.quantity} {res.item.unit}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`ml-auto text-[9px] px-1 py-0 h-4 ${
                            res.mode === "Compartilhado" 
                              ? "border-blue-200 text-blue-700 bg-blue-50/50" 
                              : "border-gray-200 text-gray-600 bg-gray-50/50"
                          }`}
                        >
                          {res.mode}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange("confirmar", "confirmado")}
                disabled={!!loadingAction}
                className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium disabled:opacity-50"
              >
                {loadingAction === "confirmar" ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                ) : null}
                Confirmar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onStatusChange("concluir", "concluído")
                }
                disabled={!!loadingAction}
                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 font-medium disabled:opacity-50"
              >
                {loadingAction === "concluir" ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                ) : null}
                Concluir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange("pendente", "pendente")}
                disabled={!!loadingAction}
                className="h-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 font-medium disabled:opacity-50"
              >
                {loadingAction === "pendente" ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                ) : null}
                Pendente
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange("cancelar", "cancelado")}
                disabled={!!loadingAction}
                className="h-8 text-red-400 hover:text-red-500 hover:bg-red-50 font-medium disabled:opacity-50"
              >
                {loadingAction === "cancelar" ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                ) : null}
                Cancelar
              </Button>
              {booking.status !== "cancelado" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReschedule(booking)}
                  disabled={!!loadingAction}
                  className="h-8 text-muted-foreground hover:bg-secondary font-medium disabled:opacity-50"
                >
                  Adiar
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(booking)}
                disabled={!!loadingAction}
                className="h-8 text-primary hover:bg-primary/5 font-medium disabled:opacity-50"
              >
                <Edit2 className="w-3 h-3 mr-1.5" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={!!loadingAction}
                className="h-8 font-medium disabled:opacity-50"
              >
                {loadingAction === "delete" ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                ) : null}
                Apagar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
