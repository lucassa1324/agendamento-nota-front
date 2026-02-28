"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import { type ApiError, appointmentService } from "@/lib/api-appointments";
import {
  type Booking,
  type BookingStepSettings,
  parseDuration,
  type Service,
  saveBookingToStorage,
  sendBookingNotifications,
} from "@/lib/booking-data";

type BookingFormProps = {
  services: Service[]; // Alterado de service: Service para services: Service[]
  date: string;
  time: string;
  onConfirm: (booking: Booking) => void;
  onBack: () => void;
  initialBooking?: Booking;
  settings?: BookingStepSettings;
};

export function BookingForm({
  services, // Alterado de service para services
  date,
  time,
  onConfirm,
  onBack,
  initialBooking,
  settings,
}: BookingFormProps) {
  const { studio } = useStudio();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialBooking?.clientName || "",
    email: initialBooking?.clientEmail || "",
    phone: initialBooking?.clientPhone || "",
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

  const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!studio?.id) return;

    setIsLoading(true);

    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

      // Cálculo de snapshots individuais e agregados
      const items = services.map((s) => ({
        serviceId: s.id,
        serviceNameSnapshot: s.name,
        servicePriceSnapshot: (typeof s.price === "string" ? parseFloat(s.price) : s.price).toFixed(2),
        serviceDurationSnapshot: formatDuration(parseDuration(s.duration)),
      }));

      const totalDurationMinutes = services.reduce(
        (acc, s) => acc + parseDuration(s.duration),
        0,
      );
      const totalPrice = services.reduce(
        (acc, s) => acc + (typeof s.price === "string" ? parseFloat(s.price) : s.price),
        0,
      );

      const durationHHmm = formatDuration(totalDurationMinutes);
      const priceSnapshot = totalPrice.toFixed(2);
      const serviceNames = services.map((s) => s.name).join(", ");
      const serviceIds = services.map((s) => s.id).join(",");

      const appointmentData = {
        companyId: studio.id,
        serviceId: serviceIds, // String de IDs separados por vírgula
        scheduledAt,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        serviceNameSnapshot: serviceNames, // Nomes concatenados
        servicePriceSnapshot: priceSnapshot, // Soma dos preços
        serviceDurationSnapshot: durationHHmm, // Soma das durações
        customerId: null,
        notes: "",
        studioId: studio.id,
        items, // Nova tabela appointment_items
      };

      console.log(">>> [SITE_DEBUG] Enviando agendamento:", appointmentData);

      const result = await appointmentService.create(appointmentData);

      const booking: Booking = {
        id: result.id,
        serviceId: serviceIds,
        serviceName: serviceNames,
        serviceDuration: totalDurationMinutes,
        servicePrice: totalPrice,
        date,
        time,
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        status: "pendente",
        createdAt: result.createdAt,
        notificationsSent: {
          email: false,
          whatsapp: false,
        },
      };

      saveBookingToStorage(booking);
      
      // Enviar notificações de forma assíncrona sem travar a UI
      sendBookingNotifications(booking).catch(err => 
        console.error(">>> [SITE_ERROR] Falha ao enviar notificações:", err)
      );

      onConfirm(booking);
    } catch (error) {
      const apiError = error as ApiError;
      console.warn(">>> [SITE_WARN] Erro ao criar agendamento:", apiError);

      let errorMessage =
        apiError.message ||
        "Ocorreu um erro inesperado ao salvar seu agendamento.";

      if (
        apiError.status === 400 &&
        apiError.message?.includes(
          "Selected time and total duration exceed business hours",
        )
      ) {
        errorMessage =
          "O horário selecionado e a duração total dos serviços ultrapassam o horário de fechamento. Por favor, escolha um horário mais cedo ou selecione menos serviços.";
      } else if (apiError.status === 401) {
        errorMessage =
          "O sistema não permitiu o agendamento (Não Autorizado). Por favor, entre em contato com o estúdio.";
      }

      toast({
        title: "Erro ao criar agendamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalDurationMinutes = services.reduce(
    (acc, s) => acc + parseDuration(s.duration),
    0,
  );
  const totalPrice = services.reduce(
    (acc, s) => acc + (typeof s.price === "string" ? parseFloat(s.price) : s.price),
    0,
  );
  const durationHHmm = formatDuration(totalDurationMinutes);

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
              {services.map((s) => s.name).join(", ")}
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
              Duração Total: {durationHHmm}
            </div>
            <div
              className="font-semibold"
              style={{ color: settings?.accentColor || "var(--primary)" }}
            >
              R$ {totalPrice.toFixed(2)}
            </div>
          </div>
        </Card>
      </div>

      <h2
        className="text-2xl font-bold mb-6 text-center"
        style={{ fontFamily: "var(--font-title)", color: "var(--foreground)" }}
      >
        Seus Dados
      </h2>

      <Card
        className="border-primary/20"
        style={{
          backgroundColor: settings?.cardBgColor || "#FFFFFF",
          borderColor: settings?.accentColor
            ? `${settings.accentColor}33`
            : undefined,
        }}
      >
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
                placeholder="seu@email.com"
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
