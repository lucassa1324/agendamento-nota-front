"use client";

import { Calendar, CheckCircle2, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  Booking,
  BookingStepSettings,
  Service,
} from "@/lib/booking-data";

type BookingConfirmationProps = {
  booking: Booking;
  service: Service;
  onReset: () => void;
  isUpdate?: boolean;
  settings?: BookingStepSettings;
};

export function BookingConfirmation({
  booking,
  service,
  onReset,
  isUpdate = false,
  settings,
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
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ 
            backgroundColor: settings?.accentColor ? `${settings.accentColor}1a` : 'var(--muted)'
          }}
        >
          <CheckCircle2 
            className="w-10 h-10" 
            style={{ color: settings?.accentColor || 'var(--primary)' }}
          />
        </div>
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ 
            color: settings?.titleColor || 'var(--foreground)',
            fontFamily: settings?.titleFont || 'var(--font-title)'
          }}
        >
          {settings?.title || (isUpdate ? "Agendamento Atualizado!" : "Agendamento Confirmado!")}
        </h2>
        <p 
          className="text-muted-foreground"
          style={{ 
            color: settings?.subtitleColor || 'var(--foreground)',
            fontFamily: settings?.subtitleFont || 'var(--font-subtitle)'
          }}
        >
          {settings?.subtitle || "Enviamos uma confirmação para o seu e-mail"}
        </p>
      </div>

      <Card 
        className="border-primary/20"
        style={{ 
          backgroundColor: settings?.cardBgColor || 'transparent',
          borderColor: settings?.accentColor ? `${settings.accentColor}33` : undefined
        }}
      >
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 
              className="font-semibold mb-4"
              style={{ fontFamily: 'var(--font-title)', color: 'var(--foreground)' }}
            >
              Detalhes do Agendamento
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ 
                    backgroundColor: settings?.accentColor ? `${settings.accentColor}1a` : 'var(--muted)'
                  }}
                >
                  <Calendar 
                    className="w-5 h-5" 
                    style={{ color: settings?.accentColor || 'var(--primary)' }}
                  />
                </div>
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {formattedDate}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ 
                    backgroundColor: settings?.accentColor ? `${settings.accentColor}1a` : 'var(--muted)'
                  }}
                >
                  <Clock 
                    className="w-5 h-5" 
                    style={{ color: settings?.accentColor || 'var(--primary)' }}
                  />
                </div>
                <div>
                  <div className="font-medium">Horário</div>
                  <div className="text-sm text-muted-foreground">
                    {booking.time}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ 
                    backgroundColor: settings?.accentColor ? `${settings.accentColor}1a` : 'var(--muted)'
                  }}
                >
                  <DollarSign 
                    className="w-5 h-5" 
                    style={{ color: settings?.accentColor || 'var(--primary)' }}
                  />
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

          <div 
            className="p-4 rounded-lg text-sm"
            style={{ 
              backgroundColor: settings?.accentColor ? `${settings.accentColor}0d` : 'var(--muted)'
            }}
          >
            <p className="text-muted-foreground">
              Enviamos uma confirmação para o seu e-mail. Em caso de dúvidas, entre em contato conosco.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              asChild
              className="flex-1 font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ 
                backgroundColor: settings?.accentColor || 'var(--primary)',
                color: '#fff'
              }}
            >
              <Link href="/">Voltar para Início</Link>
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              className="flex-1 font-bold"
              style={{ 
                borderColor: settings?.accentColor || 'var(--primary)',
                color: settings?.accentColor || 'var(--primary)'
              }}
            >
              Novo Agendamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
