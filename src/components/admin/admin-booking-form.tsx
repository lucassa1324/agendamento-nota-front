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
  parseDuration,
  type Service,
  saveBookingToStorage,
  sendBookingNotifications,
} from "@/lib/booking-data";

type AdminBookingFormProps = {
  services: Service[]; // Alterado de service para services
  date: string;
  time: string;
  onConfirm: (booking: Booking) => void;
  onBack: () => void;
  initialBooking?: Booking;
  settings?: BookingStepSettings;
};

export function AdminBookingForm({
  services, // Alterado de service para services
  date,
  time,
  onConfirm,
  onBack,
  initialBooking,
  settings,
}: AdminBookingFormProps) {
  const { studio } = useStudio();
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = services.reduce(
    (acc, s) => acc + (typeof s.price === "string" ? parseFloat(s.price) : s.price),
    0,
  );

  const [formData, setFormData] = useState({
    name: initialBooking?.clientName || "",
    email: initialBooking?.clientEmail || "",
    phone: initialBooking?.clientPhone || "",
    // Garante que o preço seja tratado como número para evitar zeros à esquerda
    price: initialBooking?.servicePrice
      ? Number(initialBooking.servicePrice)
      : Number(totalPrice),
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

      const durationHHmm = formatDuration(totalDurationMinutes);
      const serviceNames = services.map((s) => s.name).join(", ");
      const serviceIds = services.map((s) => s.id).join(",");

      const appointmentData = {
        companyId: studio.id,
        serviceId: serviceIds, // String de IDs separados por vírgula
        customerId: null,
        scheduledAt,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        serviceNameSnapshot: serviceNames, // Nomes reais separados por vírgula
        servicePriceSnapshot: Number(formData.price || 0).toFixed(2), // Preço editado pelo admin
        serviceDurationSnapshot: durationHHmm, // Soma das durações
        notes: "Agendado via Admin",
        items, // Nova tabela appointment_items
      };

      const result = await appointmentService.create(appointmentData);

      const booking: Booking = {
        id: result.id,
        serviceId: serviceIds,
        serviceName: serviceNames,
        serviceDuration: totalDurationMinutes,
        servicePrice: Number(formData.price),
        date,
        time,
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        status: "pendente",
        createdAt: new Date().toISOString(),
        notificationsSent: { email: false, whatsapp: false },
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
              Duração: {services.reduce((acc, s) => acc + parseDuration(s.duration), 0)} minutos
            </div>
            <div
              className="font-semibold"
              style={{ color: settings?.accentColor || "var(--primary)" }}
            >
              R${" "}
              {(typeof formData.price === "string"
                ? parseFloat(formData.price)
                : formData.price || 0
              ).toFixed(2)}
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
                value={
                  formData.price === undefined ||
                  formData.price === null ||
                  Number.isNaN(formData.price)
                    ? ""
                    : formData.price.toString()
                }
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
