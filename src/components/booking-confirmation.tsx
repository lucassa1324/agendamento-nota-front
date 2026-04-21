"use client";

import { Calendar, CheckCircle2, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Booking, BookingStepSettings, Service } from "@/lib/booking-data";

type BookingConfirmationProps = {
  booking: Booking;
  service?: Service;
  onReset: () => void;
  isUpdate?: boolean;
  settings?: BookingStepSettings;
  backToHomeHref?: string;
  backToHomeLabel?: string;
};

export function BookingConfirmation({
  booking,
  onReset,
  isUpdate = false,
  settings,
  backToHomeHref = "/",
  backToHomeLabel = "Voltar para Início",
}: BookingConfirmationProps) {
  const appearance = settings?.appearance || {};
  
  // Prioridade: Custom Setting > Global Appearance > Default Fallback
  const accentColor = settings?.accentColor || appearance.accentColor || "var(--primary)";
  const cardBgColor = settings?.cardBgColor || appearance.cardBgColor || "#FFFFFF";
  const titleColor = settings?.titleColor || appearance.titleColor || "var(--foreground)";
  const subtitleColor = settings?.subtitleColor || appearance.subtitleColor || "var(--muted-foreground)";
  const titleFont = settings?.titleFont || appearance.titleFont || "var(--font-title)";
  const subtitleFont = settings?.subtitleFont || appearance.subtitleFont || "var(--font-subtitle)";

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
            backgroundColor: accentColor ? `${accentColor}1a` : "var(--muted)",
          }}
        >
          <CheckCircle2
            className="w-10 h-10"
            style={{ color: accentColor }}
          />
        </div>
        <h2
          className="text-3xl font-bold mb-2"
          style={{
            color: titleColor,
            fontFamily: titleFont,
          }}
        >
          {settings?.title ||
            (isUpdate ? "Agendamento Atualizado!" : "Agendamento Confirmado!")}
        </h2>
        <p
          className="text-muted-foreground"
          style={{
            color: subtitleColor,
            fontFamily: subtitleFont,
          }}
        >
          {settings?.subtitle || "Enviamos uma confirmação para o seu e-mail"}
        </p>
      </div>

      <Card
        className="border-primary/20 shadow-lg"
        style={{
          backgroundColor: cardBgColor,
          borderColor: accentColor ? `${accentColor}33` : undefined,
        }}
      >
        <CardContent className="p-6 space-y-6">
          <div>
            <h3
              className="font-semibold mb-4"
              style={{
                fontFamily: titleFont,
                color: titleColor,
              }}
            >
              Detalhes do Agendamento
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: accentColor ? `${accentColor}1a` : "var(--muted)",
                  }}
                >
                  <Calendar
                    className="w-5 h-5"
                    style={{ color: accentColor }}
                  />
                </div>
                <div>
                  <div
                    className="text-sm text-muted-foreground"
                    style={{ color: subtitleColor }}
                  >
                    Data
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: titleColor, fontFamily: subtitleFont }}
                  >
                    {formattedDate}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: accentColor ? `${accentColor}1a` : "var(--muted)",
                  }}
                >
                  <Clock
                    className="w-5 h-5"
                    style={{ color: accentColor }}
                  />
                </div>
                <div>
                  <div
                    className="text-sm text-muted-foreground"
                    style={{ color: subtitleColor }}
                  >
                    Horário
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: titleColor, fontFamily: subtitleFont }}
                  >
                    {booking.time}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: accentColor ? `${accentColor}1a` : "var(--muted)",
                  }}
                >
                  <DollarSign
                    className="w-5 h-5"
                    style={{ color: accentColor }}
                  />
                </div>
                <div>
                  <div
                    className="text-sm text-muted-foreground"
                    style={{ color: subtitleColor }}
                  >
                    Valor Estimado
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: titleColor, fontFamily: subtitleFont }}
                  >
                    R$ {Number(booking.servicePrice || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <Button
              asChild
              className="w-full h-12 text-lg font-semibold transition-all duration-300"
              style={{
                backgroundColor: accentColor,
                fontFamily: titleFont,
              }}
            >
              <Link href={backToHomeHref}>{backToHomeLabel}</Link>
            </Button>
            <Button
              variant="ghost"
              onClick={onReset}
              className="w-full mt-2"
              style={{ color: subtitleColor, fontFamily: subtitleFont }}
            >
              Fazer outro agendamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
