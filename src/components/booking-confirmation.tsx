"use client";

import { Calendar, CheckCircle2, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Booking, Service } from "@/lib/booking-data";

type BookingConfirmationProps = {
  booking: Booking;
  service: Service;
  onReset: () => void;
  isUpdate?: boolean;
};

export function BookingConfirmation({
  booking,
  service,
  onReset,
  isUpdate = false,
}: BookingConfirmationProps) {
  const formattedDate = new Date(`${booking.date}T00:00:00`).toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-accent" />
        </div>
        <h2 className="font-serif text-3xl font-bold mb-2">
          {isUpdate ? "Agendamento Atualizado!" : "Agendamento Confirmado!"}
        </h2>
        <p className="text-muted-foreground">
          Enviamos uma confirmação para o seu e-mail
        </p>
      </div>

      <Card className="border-accent/20">
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Detalhes do Agendamento</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {formattedDate}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-medium">Horário</div>
                  <div className="text-sm text-muted-foreground">
                    {booking.time}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-medium">Valor</div>
                  <div className="text-sm text-muted-foreground">
                    R$ {service.price}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold mb-2">Seus Dados</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{booking.clientName}</p>
              <p>{booking.clientEmail}</p>
              <p>{booking.clientPhone}</p>
            </div>
          </div>

          <div className="bg-accent/5 p-4 rounded-lg text-sm">
            <p className="text-muted-foreground">
              Enviamos uma confirmação para o seu e-mail. Em caso de dúvidas,
              entre em contato conosco pelo WhatsApp.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button asChild variant="outline" className="flex-1 bg-transparent">
          <Link href="/">Voltar ao Início</Link>
        </Button>
        <Button
          onClick={onReset}
          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isUpdate ? "Concluir" : "Fazer Novo Agendamento"}
        </Button>
      </div>
    </div>
  );
}
