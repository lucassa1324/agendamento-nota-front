"use client";

import {
  Calendar,
  Clock,
  DollarSign,
  Mail,
  Phone,
  Scissors,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Booking, updateBooking } from "@/lib/booking-data";

type EditBookingModalProps = {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function EditBookingModal({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: EditBookingModalProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    serviceName: "",
    servicePrice: 0,
    date: "",
    time: "",
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        clientName: booking.clientName,
        clientEmail: booking.clientEmail || "",
        clientPhone: booking.clientPhone,
        serviceName: booking.serviceName,
        servicePrice: booking.servicePrice,
        date: booking.date,
        time: booking.time,
      });
    }
  }, [booking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    const updatedBooking: Booking = {
      ...booking,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      serviceName: formData.serviceName,
      servicePrice: formData.servicePrice,
      date: formData.date,
      time: formData.time,
    };

    updateBooking(updatedBooking);
    onSuccess();
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125 p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Editar Agendamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Nome da Cliente */}
            <div className="space-y-2">
              <Label
                htmlFor="clientName"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-purple-600" />
                Nome da cliente
              </Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                placeholder="Ex.: Maria Silva"
                className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
              />
            </div>

            {/* Procedimento */}
            <div className="space-y-2">
              <Label
                htmlFor="serviceName"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Scissors className="w-4 h-4 text-purple-600" />
                Procedimento
              </Label>
              <Input
                id="serviceName"
                value={formData.serviceName}
                onChange={(e) =>
                  setFormData({ ...formData, serviceName: e.target.value })
                }
                className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
              />
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label
                htmlFor="servicePrice"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4 text-purple-600" />
                Valor (R$)
              </Label>
              <Input
                id="servicePrice"
                type="number"
                step="0.01"
                value={
                  Number.isNaN(formData.servicePrice)
                    ? ""
                    : formData.servicePrice
                }
                onChange={(e) => {
                  const val =
                    e.target.value === ""
                      ? Number.NaN
                      : Number.parseFloat(e.target.value);
                  setFormData({
                    ...formData,
                    servicePrice: val,
                  });
                }}
                className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="clientEmail"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-purple-600" />
                E-mail
              </Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) =>
                  setFormData({ ...formData, clientEmail: e.target.value })
                }
                placeholder="Ex.: cliente@email.com"
                className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label
                htmlFor="clientPhone"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-purple-600" />
                Telefone / WhatsApp
              </Label>
              <Input
                id="clientPhone"
                value={formData.clientPhone}
                onChange={(e) =>
                  setFormData({ ...formData, clientPhone: e.target.value })
                }
                placeholder="Ex.: (11) 99999-9999"
                className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
              />
            </div>

            {/* Detalhes de Data e Hora (Apenas visualização no modal de edição rápida) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Agendamento
              </Label>
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">Data:</span> {formData.date}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">Horário:</span> {formData.time}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="px-6 h-11 text-gray-500 hover:bg-gray-100 font-medium transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-8 h-11 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-purple-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
