/** biome-ignore-all lint/suspicious/noArrayIndexKey: Uso de índices para chaves de elementos puramente visuais e estáticos no calendário */
"use client";

import {
  addMonths,
  format,
  getDay,
  getDaysInMonth,
  isBefore,
  isSameDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminBookingForm } from "@/components/admin/admin-booking-form";
import { AdminCalendar } from "@/components/admin/admin-calendar";
import { BookingConfirmation } from "@/components/booking-confirmation";
import { ServiceSelector } from "@/components/service-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudio } from "@/context/studio-context";
import {
  type Booking,
  getSettingsFromStorage,
  getWeekSchedule,
  type Service,
} from "@/lib/booking-data";
import { cn } from "@/lib/utils";

type BookingStep = "service" | "date" | "calendar" | "form" | "confirmation";

type AdminBookingFlowProps = {
  initialBooking?: Booking;
  onComplete?: () => void;
  mode?: "reschedule" | "edit";
};

export function AdminBookingFlow({
  initialBooking,
  onComplete,
  mode = "reschedule",
}: AdminBookingFlowProps) {
  const { slug, studio } = useStudio();

  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );
  const [slotInterval, setSlotInterval] = useState(10);

  useEffect(() => {
    if (studio?.id) {
      // O admin pode ter um intervalo diferente configurado na aba horários
      // Vamos tentar pegar do primeiro dia aberto ou usar o default do sistema
      const weekSchedule = getWeekSchedule();
      const firstOpenDay = weekSchedule.find(d => d.isOpen);
      if (firstOpenDay) {
        setSlotInterval(firstOpenDay.interval);
      }
    }
  }, [studio]);

  useEffect(() => {
    if (initialBooking) {
      const settings = getSettingsFromStorage();
      const allServices = settings.services as Service[];
      const bookingServiceIds = Array.isArray(initialBooking.serviceId)
        ? initialBooking.serviceId
        : [initialBooking.serviceId];

      const selected = allServices.filter((s) =>
        bookingServiceIds.includes(s.id),
      );
      setSelectedServices(selected);
      setSelectedDate(initialBooking.date);
      setSelectedTime(initialBooking.time);
      // Se for edição, começa nos serviços. Se for adiamento, começa na data.
      setCurrentStep(mode === "edit" ? "service" : "date");
    }
  }, [initialBooking, mode]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const defaultServiceDuration = 30;

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = getDaysInMonth(currentMonth);
  const startingDayOfWeek = getDay(startOfMonth(currentMonth));

  const previousMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const nextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const getDateStatus = (day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isBefore(date, today)) return "past";

    // Check if it's the selected date
    if (selectedDate && isSameDay(date, new Date(`${selectedDate}T12:00:00`))) {
      return "selected";
    }

    return "available";
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setCurrentStep("calendar");
  };

  const steps = [
    {
      id: "service",
      label: "Serviços",
      completed: selectedServices.length > 0,
    },
    { id: "date", label: "Data", completed: !!selectedDate },
    {
      id: "calendar",
      label: "Horário",
      completed: !!selectedDate && !!selectedTime,
    },
    { id: "form", label: "Dados do Cliente", completed: !!confirmedBooking },
  ];

  const handleServiceSelect = (services: Service[]) => {
    setSelectedServices(services);
    setCurrentStep("date");
  };

  const handleTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setCurrentStep("form");
  };

  const handleBookingConfirm = (booking: Booking) => {
    setConfirmedBooking(booking);
    setCurrentStep("confirmation");
    // Disparar evento para atualizar outros componentes admin
    window.dispatchEvent(new Event("storage"));
  };

  const handleReset = () => {
    setCurrentStep("service");
    setSelectedServices([]);
    setSelectedDate("");
    setSelectedTime("");
    setConfirmedBooking(null);
  };

  const totalService = useMemo(() => {
    if (selectedServices.length === 0) return null;
    return {
      id: selectedServices.map((s) => s.id).join(","),
      name: selectedServices.map((s) => s.name).join(" + "),
      price: selectedServices.reduce((acc, s) => acc + s.price, 0),
      duration: selectedServices.reduce((acc, s) => acc + s.duration, 0),
      description: selectedServices.map((s) => s.name).join(", "),
    } as Service;
  }, [selectedServices]);

  const formattedDate = useMemo(() => {
    const dateToFormat = selectedDate
      ? new Date(`${selectedDate}T12:00:00`)
      : new Date();
    const date = format(dateToFormat, "eeee, d 'De' MMMM 'De' yyyy", {
      locale: ptBR,
    });
    return date
      .split(" ")
      .map((word) =>
        word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
      )
      .join(" ");
  }, [selectedDate]);

  return (
    <div className="w-full mx-auto">
      {/* Progress Steps */}
      {currentStep !== "confirmation" && (
        <Card className="p-4 mb-6 bg-card/50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className={cn("flex items-center flex-1")}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm transition-colors ${
                      step.completed
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep === step.id
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider text-muted-foreground">
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${step.completed ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Step Content */}
      {currentStep === "service" && (
        <div className="space-y-4">
          <Button
            variant="ghost"
            asChild
            className="w-fit -ml-2 h-8 text-muted-foreground"
          >
            <Link
              href={slug ? `/admin/${slug}/dashboard/agendamentos` : "/admin"}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar para Agendamentos
            </Link>
          </Button>
          <ServiceSelector
            onSelect={handleServiceSelect}
            selectedServices={selectedServices}
          />
        </div>
      )}

      {currentStep === "date" && totalService && (
        <div className="space-y-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep("service")}
              className="mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <Card className="border-accent/20 bg-accent/5 p-4">
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <span className="font-semibold">{totalService.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    - R$ {totalService.price}
                  </span>
                  <div className="text-xs text-muted-foreground mt-1">
                    Este procedimento ocupará{" "}
                    {Math.ceil(
                      (totalService.duration || defaultServiceDuration) /
                        slotInterval,
                    )}{" "}
                    horário(s) de {slotInterval} minutos
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <h2 className="font-serif text-2xl font-bold mb-6 text-center">
            Escolha a Data
          </h2>

          <Card>
            <CardContent className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="font-semibold text-lg">
                  {monthNames[month]} {year}
                </h3>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground p-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${year}-${month}-${index}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const status = getDateStatus(day);

                  let buttonClass =
                    "hover:bg-accent hover:text-accent-foreground cursor-pointer";

                  if (status === "past") {
                    buttonClass += " bg-slate-100 text-slate-400";
                  } else if (status === "selected") {
                    buttonClass += " bg-[#FEF3C7] text-[#D97706]";
                  }

                  return (
                    <button
                      type="button"
                      key={`${year}-${month}-${day}`}
                      onClick={() => handleDateClick(day)}
                      className={`aspect-square p-2 rounded-lg text-sm font-medium transition-colors ${buttonClass}`}
                      title={
                        status === "past"
                          ? "Passado"
                          : status === "selected"
                            ? "Selecionado"
                            : "Disponível"
                      }
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-4 text-xs justify-center">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-slate-100 rounded-sm border border-slate-200" />
                  <span>Passado</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-100 rounded-sm border border-orange-200" />
                  <span>Ocupado/Fechado</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-background border rounded-sm" />
                  <span>Disponível</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === "calendar" && totalService && (
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden border-fuchsia-100 shadow-sm bg-fuchsia-50/30">
            <div className="flex items-center justify-between p-6">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-fuchsia-800 flex items-center justify-center text-white shadow-lg hover:bg-fuchsia-700 transition-all"
                onClick={() => setCurrentStep("date")}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <div className="flex-1 text-center px-4">
                <h3 className="text-xl font-bold text-fuchsia-950 mb-1 leading-tight">
                  {totalService.name}
                </h3>
                <div className="text-sm text-fuchsia-800/80 font-medium mb-1">
                  {formattedDate}
                </div>
                <div className="text-xs text-fuchsia-700 font-semibold uppercase tracking-wider">
                  Duração: {totalService.duration} minutos
                </div>
              </div>

              <div className="h-12 w-12 rounded-full bg-fuchsia-800 flex items-center justify-center text-white shadow-lg opacity-50 cursor-not-allowed">
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <AdminCalendar
            service={totalService}
            initialDate={selectedDate}
            onTimeSelect={handleTimeSelect}
            onBack={() => setCurrentStep("date")}
          />
        </div>
      )}

      {currentStep === "form" &&
        totalService &&
        selectedDate &&
        selectedTime && (
          <div className="max-w-2xl mx-auto">
            <AdminBookingForm
              service={totalService}
              date={selectedDate}
              time={selectedTime}
              onConfirm={handleBookingConfirm}
              onBack={() => setCurrentStep("calendar")}
              initialBooking={initialBooking}
            />
          </div>
        )}

      {currentStep === "confirmation" && confirmedBooking && totalService && (
        <BookingConfirmation
          booking={confirmedBooking}
          service={totalService}
          onReset={onComplete || handleReset}
          isUpdate={!!initialBooking}
          backToHomeHref={slug ? `/admin/${slug}/dashboard/agendamentos` : "/"}
          backToHomeLabel="Ir para Agendamentos"
        />
      )}
    </div>
  );
}
