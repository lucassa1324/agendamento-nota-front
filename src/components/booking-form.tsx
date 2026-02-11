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
import { API_BASE_URL } from "@/lib/auth-client";
import {
  type Booking,
  type BookingStepSettings,
  type Service,
  parseDuration,
  saveBookingToStorage,
  sendBookingNotifications,
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!studio?.id) return;

    setIsLoading(true);

    try {
      // 1. Preparar a data em ISO UTC
      // Combinamos a data (YYYY-MM-DD) com o horário (HH:mm)
      // Usamos a data local para criar o objeto e convertemos para ISO
      const localDateTime = new Date(`${date}T${time}:00`);
      const scheduledAt = localDateTime.toISOString();

      // 2. Converter duração (minutos) para HH:mm
      const durationMinutes = parseDuration(service.duration);
      
      const hours = Math.floor(durationMinutes / 60);
      const mins = durationMinutes % 60;
      const durationHHmm = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

      // 3. Formatar preço como decimal string (ex: "150.00")
      const priceValue = typeof service.price === "string"
        ? parseFloat(service.price)
        : service.price;
      const priceSnapshot = priceValue.toFixed(2);

      // 4. Montar o payload seguindo o contrato exato do backend
      // O backend agora aceita múltiplos IDs separados por vírgula em serviceId
      // Ele usará o primeiro ID para a FK e o restante para processamento interno
      const appointmentData = {
        companyId: studio.id,
        serviceId: service.id, // String de IDs separados por vírgula (ex: "id1,id2")
        scheduledAt,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        serviceNameSnapshot: service.name, // Nomes reais dos serviços separados por vírgula
        servicePriceSnapshot: priceSnapshot, // Soma dos preços (decimal string: "460.00")
        serviceDurationSnapshot: durationHHmm, // Soma das durações (HH:mm: "03:20")
        customerId: null,
        notes: "",
        studioId: studio.id,
      };

      console.log(">>> [FINAL_PAYLOAD]", appointmentData);

      const result = await appointmentService.create(appointmentData);

      // 2. Manter compatibilidade com o objeto Booking legado
      const booking: Booking = {
        id: result.id,
        serviceId: service.id,
        serviceName: service.name,
        serviceDuration: durationMinutes,
        servicePrice: priceValue,
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

      // Opcional: Ainda salvar no storage para redundância/cache
      saveBookingToStorage(booking);

      await sendBookingNotifications(booking);

      onConfirm(booking);
    } catch (error) {
      const apiError = error as ApiError;
      console.warn(">>> [SITE_WARN] Erro ao criar agendamento:", apiError);

      let errorMessage = apiError.message || "Ocorreu um erro inesperado ao salvar seu agendamento.";

      // Tratamento específico para erro de horário comercial excedido
      if (apiError.status === 400 && apiError.message?.includes("Selected time and total duration exceed business hours")) {
        errorMessage = "O horário selecionado e a duração total dos serviços ultrapassam o horário de fechamento. Por favor, escolha um horário mais cedo ou selecione menos serviços.";
      } else if (apiError.status === 401) {
        errorMessage = "O sistema não permitiu o agendamento (Não Autorizado). Por favor, entre em contato com o estúdio.";
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
              Duração Total: {Math.floor(parseDuration(service.duration) / 60) > 0 
                ? `${Math.floor(parseDuration(service.duration) / 60)}h ` 
                : ""}{parseDuration(service.duration) % 60}min
            </div>
            <div
              className="font-semibold"
              style={{ color: settings?.accentColor || "var(--primary)" }}
            >
              R${" "}
              {(typeof service.price === "string"
                ? parseFloat(service.price)
                : service.price
              ).toFixed(2)}
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
