"use client";

import { ChevronLeft } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type Booking,
  type BookingStepSettings,
  type Service,
  saveBookingToStorage,
  sendBookingNotifications,
  updateBooking,
} from "@/lib/booking-data";

type BookingFormProps = {
  service: Service;
  date: string;
  time: string;
  onConfirm: (booking: Booking) => void;
  onBack: () => void;
  initialBooking?: Booking;
  settings?: BookingStepSettings;
};

export function BookingForm({
  service,
  date,
  time,
  onConfirm,
  onBack,
  initialBooking,
  settings,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: initialBooking?.clientName || "",
    email: initialBooking?.clientEmail || "",
    phone: initialBooking?.clientPhone || "",
    price: initialBooking?.servicePrice ?? service.price,
  });

  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const booking: Booking = {
      id: initialBooking?.id || Date.now().toString(),
      serviceId: service.id.includes(",") ? service.id.split(",") : service.id,
      serviceName: service.name,
      serviceDuration: service.duration,
      servicePrice: formData.price,
      date,
      time,
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.phone,
      status: initialBooking?.status || "pendente",
      createdAt: initialBooking?.createdAt || new Date().toISOString(),
      notificationsSent: initialBooking?.notificationsSent || {
        email: false,
        whatsapp: false,
      },
    };

    if (initialBooking) {
      updateBooking(booking);
    } else {
      saveBookingToStorage(booking);
    }

    await sendBookingNotifications(booking);

    onConfirm(booking);
  };

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Card 
          className="border-primary/20 p-4"
          style={{ 
            backgroundColor: settings?.cardBgColor || 'var(--muted)',
            borderColor: settings?.accentColor ? `${settings.accentColor}33` : undefined
          }}
        >
          <div className="text-sm space-y-1">
            <div 
              className="font-semibold"
              style={{ 
                color: settings?.titleColor || 'var(--foreground)',
                fontFamily: settings?.titleFont || 'var(--font-title)'
              }}
            >
              {service.name}
            </div>
            <div className="text-muted-foreground capitalize">
              {formattedDate}
            </div>
            <div 
              className="font-bold"
              style={{ 
                color: settings?.accentColor || 'var(--primary)'
              }}
            >
              {time}
            </div>
            <div className="text-xs text-muted-foreground">
              Duração: {service.duration} minutos
            </div>
            <div 
              className="font-semibold"
              style={{ color: settings?.accentColor || 'var(--primary)' }}
            >
              R$ {formData.price.toFixed(2)}
            </div>
          </div>
        </Card>
      </div>

      <h2 
        className="text-2xl font-bold mb-6 text-center"
        style={{ fontFamily: 'var(--font-title)', color: 'var(--foreground)' }}
      >
        Seus Dados
      </h2>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Seu nome completo"
                className="focus-visible:ring-accent"
                style={{ 
                  '--tw-ring-color': settings?.accentColor || 'var(--primary)'
                } as React.CSSProperties}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="seu@email.com"
                className="focus-visible:ring-accent"
                style={{ 
                  '--tw-ring-color': settings?.accentColor || 'var(--primary)'
                } as React.CSSProperties}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(11) 99999-9999"
                className="focus-visible:ring-accent"
                style={{ 
                  '--tw-ring-color': settings?.accentColor || 'var(--primary)'
                } as React.CSSProperties}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Valor do Procedimento (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={Number.isNaN(formData.price) ? "" : formData.price}
                onChange={(e) => {
                  const val = e.target.value === "" ? Number.NaN : Number.parseFloat(e.target.value);
                  setFormData({
                    ...formData,
                    price: val,
                  });
                }}
                placeholder="0.00"
                className="focus-visible:ring-accent"
                style={{ 
                  '--tw-ring-color': settings?.accentColor || 'var(--primary)'
                } as React.CSSProperties}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ 
                backgroundColor: settings?.accentColor || 'var(--primary)',
                color: '#fff'
              }}
            >
              {initialBooking ? "Salvar Alterações" : "Confirmar Agendamento"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
