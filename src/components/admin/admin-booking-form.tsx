"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudio } from "@/context/studio-context";
import { toast } from "@/hooks/use-toast";
import { appointmentService } from "@/lib/api-appointments";
import {
  type Booking,
  type BookingStepSettings,
  type Service,
  saveBookingToStorage,
  sendBookingNotifications,
} from "@/lib/booking-data";

type AdminBookingFormProps = {
  service: Service;
  date: string;
  time: string;
  onConfirm: (booking: Booking) => void;
  onBack: () => void;
  initialBooking?: Booking;
  settings?: BookingStepSettings;
};

export function AdminBookingForm({
  service,
  date,
  time,
  onConfirm,
  onBack,
  initialBooking,
  settings,
}: AdminBookingFormProps) {
  const { studio } = useStudio();
  const [isLoading, setIsLoading] = useState(false);
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
    if (!studio?.id) return;

    setIsLoading(true);

    try {
      // 1. Preparar o agendamento para o novo Back-end (Elysia)
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

      // Log para validar o Service ID e outros dados antes de enviar
      console.log("🔍 Validando dados para o Back-end:");
      console.log("Service ID:", service.id);
      console.log(
        "Is UUID:",
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          service.id,
        ),
      );

      const appointmentData = {
        companyId: studio.id,
        serviceId: service.id, // Vindo de service.id (prop do componente)
        customerId: null, // Enviar null para agendamentos manuais via Admin
        scheduledAt,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        serviceNameSnapshot: service.name,
        servicePriceSnapshot: formData.price.toFixed(2), // String decimal
        serviceDurationSnapshot: service.duration.toString(), // String minutos
        notes: "Agendado via Admin",
      };

      console.log(
        "📤 Enviando agendamento via AppointmentService:",
        appointmentData,
      );

      const createdAppointment =
        await appointmentService.create(appointmentData);

      // 2. Preparar objeto Legado para compatibilidade com o front antigo
      const booking: Booking = {
        id: createdAppointment.id, // Usar ID retornado pelo banco
        serviceId: service.id,
        serviceName: service.name,
        serviceDuration: service.duration,
        servicePrice: formData.price,
        date,
        time,
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        status: "confirmado",
        createdAt: new Date().toISOString(),
        notificationsSent: {
          email: false,
          whatsapp: false,
        },
      };

      saveBookingToStorage(booking);

      await sendBookingNotifications(booking);

      onConfirm(booking);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("🚨 Falha na submissão:", err.message);
      console.log("Pilha do erro:", err);

      toast({
        title: "Erro ao criar agendamento",
        description: err.message || "Ocorreu um erro inesperado no servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            backgroundColor: settings?.cardBgColor || "var(--muted)",
            borderColor: settings?.accentColor
              ? `${settings.accentColor}33`
              : undefined,
          }}
        >
          <div className="text-sm space-y-1">
            <div
              className="font-semibold"
              style={{
                color: settings?.titleColor || "var(--foreground)",
                fontFamily: settings?.titleFont || "var(--font-title)",
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
                color: settings?.accentColor || "var(--primary)",
              }}
            >
              {time}
            </div>
            <div className="text-xs text-muted-foreground">
              Duração: {service.duration} minutos
            </div>
            <div
              className="font-semibold"
              style={{ color: settings?.accentColor || "var(--primary)" }}
            >
              R$ {formData.price.toFixed(2)}
            </div>
          </div>
        </Card>
      </div>

      <h2
        className="text-2xl font-bold mb-6 text-center"
        style={{ fontFamily: "var(--font-title)", color: "var(--foreground)" }}
      >
        Dados do Agendamento (Admin)
      </h2>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Cliente *</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nome do cliente"
                className="focus-visible:ring-accent"
                style={
                  {
                    "--tw-ring-color":
                      settings?.accentColor || "var(--primary)",
                  } as React.CSSProperties
                }
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
                placeholder="email@exemplo.com"
                className="focus-visible:ring-accent"
                style={
                  {
                    "--tw-ring-color":
                      settings?.accentColor || "var(--primary)",
                  } as React.CSSProperties
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(00) 00000-0000"
                className="focus-visible:ring-accent"
                style={
                  {
                    "--tw-ring-color":
                      settings?.accentColor || "var(--primary)",
                  } as React.CSSProperties
                }
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
                  const val =
                    e.target.value === ""
                      ? Number.NaN
                      : Number.parseFloat(e.target.value);
                  setFormData({
                    ...formData,
                    price: val,
                  });
                }}
                placeholder="0.00"
                className="focus-visible:ring-accent"
                style={
                  {
                    "--tw-ring-color":
                      settings?.accentColor || "var(--primary)",
                  } as React.CSSProperties
                }
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: settings?.accentColor || "var(--primary)",
                color: "#fff",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : initialBooking ? (
                "Salvar Alterações"
              ) : (
                "Confirmar Agendamento"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
